#!/usr/bin/env python3
"""
Scrape les 4 etudes quotidiennes depuis fr.chabad.org
avec cloudscraper pour passer Cloudflare.

Installation:
  pip3 install --user cloudscraper beautifulsoup4

Usage:
  python3 scrape_daily_studies.py              # aujourd'hui
  python3 scrape_daily_studies.py 2026-02-25   # date specifique
"""

import sys
import json
import time
import re
import math
from datetime import datetime, date
from pathlib import Path

try:
    import cloudscraper
except ImportError:
    print("Installing cloudscraper...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "cloudscraper", "beautifulsoup4", "--quiet"])
    import cloudscraper

from bs4 import BeautifulSoup


# --- Config ---

BASE_URL = "https://fr.chabad.org/dailystudy"
PAGES = {
    "hayom_yom": "hayomyom.asp",
    "rambam":    "rambam.asp?rambamChapters=1",
    "tanya":     "tanya.asp",
    "houmash":   "torahreading.asp",
}
DATA_FILE = Path("hyy-data.json")
DELAY = 3


# --- Hebrew Date Converter (mirrors app.js gregToHebrew) ---

def _floor(x):
    return math.floor(x)

def _mod(x, y):
    return x - y * _floor(x / y)

def _heb_elapsed_days(y):
    m = _floor((235 * y - 234) / 19)
    p = 12084 + 13753 * m
    d = 29 * m + _floor(p / 25920)
    if _mod(3 * (d + 1), 7) < 3:
        d += 1
    return d

def _heb_year_days(y):
    return _heb_elapsed_days(y + 1) - _heb_elapsed_days(y)

def _is_leap(y):
    return _mod(7 * y + 1, 19) < 7

def _heb_month_days(y, m):
    if m == 2:
        return 30 if _heb_year_days(y) % 10 == 5 else 29
    if m == 3:
        return 30 if _heb_year_days(y) % 10 != 3 else 29
    if m == 4:
        return 29
    if m == 6:
        return 30 if _is_leap(y) else 29
    if m == 7:
        return 29 if _is_leap(y) else 0
    if m in (9, 11, 13):
        return 29
    return 30

def _greg_to_abs(gy, gm, gd):
    a = _floor((gy - 1) / 4) - _floor((gy - 1) / 100) + _floor((gy - 1) / 400)
    b = 365 * (gy - 1) + a + gd
    ml = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30]
    for i in range(1, gm):
        b += ml[i]
    if gm > 2 and ((gy % 4 == 0 and gy % 100 != 0) or gy % 400 == 0):
        b += 1
    return b

def greg_to_hebrew(gy, gm, gd):
    abs_day = _greg_to_abs(gy, gm, gd)
    hy = gy + 3760
    epoch = -1373427
    while _heb_elapsed_days(hy + 1) + epoch <= abs_day:
        hy += 1
    while _heb_elapsed_days(hy) + epoch > abs_day:
        hy -= 1
    day_in_year = abs_day - (_heb_elapsed_days(hy) + epoch) + 1
    hm = 1
    month_order = list(range(1, 14)) if _is_leap(hy) else [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13]
    for mo in month_order:
        md = _heb_month_days(hy, mo)
        if day_in_year <= md:
            hm = mo
            break
        day_in_year -= md
    hd = day_in_year
    names = {
        1: 'Tishrei', 2: 'Cheshvan', 3: 'Kislev', 4: 'Tevet',
        5: 'Shevat', 6: 'Adar I', 7: 'Adar II', 8: 'Nisan',
        9: 'Iyyar', 10: 'Sivan', 11: 'Tammuz', 12: 'Av', 13: 'Elul'
    }
    m_name = names.get(hm, '')
    if hm == 6 and not _is_leap(hy):
        m_name = 'Adar'
    return {'hy': hy, 'hm': hm, 'hd': hd, 'mName': m_name}


# --- Content Extraction ---

def extract_text(html):
    soup = BeautifulSoup(html, 'html.parser')
    for tag in soup.find_all(['script', 'style', 'nav', 'header', 'footer']):
        tag.decompose()

    selectors = [
        '#TextContent', '#textContent', '.article-text',
        '.page-text-content', '#contentArea', '#pageTextArea',
        '.entry-content', 'article', '#article-body',
        '.article-body', '.article_body', '#article',
        '.parsha-content', '#ContentPlaceHolder_TextContent',
        '.content-inner'
    ]
    for sel in selectors:
        el = soup.select_one(sel)
        if el and len(el.get_text(strip=True)) > 50:
            text = el.get_text(separator=' ', strip=True)
            return re.sub(r'\s+', ' ', text).strip()

    best, best_len = None, 0
    for div in soup.find_all(['div', 'td', 'section', 'main']):
        cls = ' '.join(div.get('class', [])).lower()
        if any(x in cls for x in ('nav', 'footer', 'header', 'menu', 'sidebar')):
            continue
        txt = div.get_text(strip=True)
        if 100 < len(txt) < 15000 and len(txt) > best_len:
            best = div
            best_len = len(txt)
    if best:
        return re.sub(r'\s+', ' ', best.get_text(separator=' ', strip=True)).strip()
    return None


def extract_title(html):
    match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
    if match:
        title = match.group(1)
        title = re.sub(r'\s*-\s*fr\.chabad\.org.*', '', title, flags=re.IGNORECASE).strip()
        if 'moment' in title.lower() or 'challenge' in title.lower():
            return ''
        return title
    return ''


# --- Scraping with cloudscraper ---

def scrape_studies(target_date):
    m = target_date.month
    d = target_date.day
    y = target_date.year
    tdate = "%d/%d/%d" % (m, d, y)
    results = {}

    print("Creating cloudscraper session...")
    scraper = cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'darwin',
            'desktop': True,
        },
        delay=10,
    )

    for study, page_path in PAGES.items():
        sep = '&' if '?' in page_path else '?'
        url = "%s/%s%stdate=%s" % (BASE_URL, page_path, sep, tdate)
        print("Fetching %s: %s" % (study, url))

        for attempt in range(3):
            try:
                r = scraper.get(url, timeout=30)

                # Check if still Cloudflare
                if 'Just a moment' in r.text[:500] or r.status_code == 403:
                    print("  Attempt %d: Cloudflare challenge (status %d)" % (attempt + 1, r.status_code))
                    time.sleep(5)
                    continue

                r.raise_for_status()
                html = r.text

                text = extract_text(html)
                if text and len(text) > 30:
                    ttl = extract_title(html)
                    results[study] = {'text': text, 'title': ttl}
                    print("  OK %s: %d chars - %s" % (study, len(text), ttl[:60]))
                else:
                    print("  x %s: no content extracted" % study)
                    # Save for debug
                    debug_file = "debug_%s.html" % study
                    with open(debug_file, "w", encoding="utf-8") as f:
                        f.write(html)
                    print("  (saved debug to %s)" % debug_file)
                break

            except Exception as e:
                print("  Attempt %d failed: %s" % (attempt + 1, str(e)))
                time.sleep(3)

        time.sleep(DELAY)

    return results


# --- Data file management ---

def load_data():
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    data = {}
    for key in ['hayom_yom', 'rambam', 'tanya', 'houmash']:
        data[key] = {}
    return data

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("\nSaved to %s" % DATA_FILE)

def update_data(data, target_date, results):
    y, m, d = target_date.year, target_date.month, target_date.day
    date_key = "%d-%d-%d" % (y, m, d)
    heb = greg_to_hebrew(y, m, d)
    hyy_key = "%s_%d" % (heb['mName'].replace(' ', '_'), heb['hd'])
    print("\nKeys: dateKey=%s, hyyKey=%s (%s %d)" % (date_key, hyy_key, heb['mName'], heb['hd']))

    if 'hayom_yom' in results:
        data['hayom_yom'][hyy_key] = results['hayom_yom']['text']
    if 'rambam' in results:
        data['rambam'][date_key] = {'text': results['rambam']['text'], 'title': results['rambam']['title']}
    if 'tanya' in results:
        data['tanya'][date_key] = {'text': results['tanya']['text'], 'title': results['tanya']['title']}
    if 'houmash' in results:
        data['houmash'][date_key] = {'text': results['houmash']['text'], 'title': results['houmash']['title']}

def cleanup_old_entries(data, keep_days=7):
    today = date.today()
    for section in ['rambam', 'tanya', 'houmash']:
        if section not in data:
            continue
        to_remove = []
        for key in data[section]:
            try:
                parts = key.split('-')
                d = date(int(parts[0]), int(parts[1]), int(parts[2]))
                if (today - d).days > keep_days:
                    to_remove.append(key)
            except (ValueError, IndexError):
                continue
        for key in to_remove:
            del data[section][key]
        if to_remove:
            print("Cleaned %d old entries from %s" % (len(to_remove), section))


# --- Main ---

def main():
    if len(sys.argv) > 1:
        try:
            target_date = datetime.strptime(sys.argv[1], '%Y-%m-%d').date()
        except ValueError:
            print("Invalid date: %s (use YYYY-MM-DD)" % sys.argv[1])
            sys.exit(1)
    else:
        target_date = date.today()

    print("=== Scraping daily studies for %s ===\n" % target_date)
    results = scrape_studies(target_date)

    if not results:
        print("\nx No studies scraped.")
        sys.exit(1)

    data = load_data()
    update_data(data, target_date, results)
    cleanup_old_entries(data)
    save_data(data)
    print("\n=== Done: %d/4 studies scraped ===" % len(results))

if __name__ == '__main__':
    main()
