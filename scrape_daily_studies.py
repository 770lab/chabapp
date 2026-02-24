#!/usr/bin/env python3
"""
Scrape les 4 études quotidiennes depuis fr.chabad.org
et met à jour hyy-data.json pour Chab'app.

Usage:
  python scrape_daily_studies.py              # scrape aujourd'hui
  python scrape_daily_studies.py 2026-02-24   # scrape une date spécifique
"""

import sys
import json
import time
import re
import math
from datetime import datetime, date
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Installing dependencies...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "beautifulsoup4", "--quiet"])
    import requests
    from bs4 import BeautifulSoup

# ─── Config ───────────────────────────────────────────────────────────────────

BASE_URL = "https://fr.chabad.org/dailystudy"
PAGES = {
    "hayom_yom": "hayomyom.asp",
    "rambam":    "rambam.asp?rambamChapters=1",
    "tanya":     "tanya.asp",
    "houmash":   "torahreading.asp",
}
DATA_FILE = Path("hyy-data.json")
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.5",
}
DELAY = 2  # seconds between requests


# ─── Hebrew Date Converter (mirrors app.js gregToHebrew) ─────────────────────

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
    """Convert Gregorian date to Hebrew date. Returns dict matching app.js format."""
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


# ─── Scraping ────────────────────────────────────────────────────────────────

def extract_text(html: str) -> str | None:
    """Extract main text content from a fr.chabad.org page (mirrors _extractChabadText)."""
    soup = BeautifulSoup(html, 'html.parser')

    # Remove scripts, styles, navs
    for tag in soup.find_all(['script', 'style', 'nav', 'header', 'footer']):
        tag.decompose()

    # Try known selectors
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
            text = re.sub(r'\s+', ' ', text).strip()
            return text

    # Fallback: largest text block
    best, best_len = None, 0
    for div in soup.find_all(['div', 'td']):
        cls = ' '.join(div.get('class', [])).lower()
        if any(x in cls for x in ('nav', 'footer', 'header', 'menu')):
            continue
        txt = div.get_text(strip=True)
        if 100 < len(txt) < 10000 and len(txt) > best_len:
            best = div
            best_len = len(txt)

    if best:
        text = best.get_text(separator=' ', strip=True)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    return None


def extract_title(html: str) -> str:
    """Extract page title from HTML."""
    match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
    if match:
        title = match.group(1)
        title = re.sub(r'\s*-\s*fr\.chabad\.org.*', '', title, flags=re.IGNORECASE).strip()
        return title
    return ''


def fetch_page(url: str) -> str | None:
    """Fetch a page with retries."""
    for attempt in range(3):
        try:
            r = requests.get(url, headers=HEADERS, timeout=15)
            r.raise_for_status()
            r.encoding = r.apparent_encoding or 'utf-8'
            return r.text
        except Exception as e:
            print(f"  Attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                time.sleep(3)
    return None


def scrape_studies(target_date: date) -> dict:
    """Scrape all 4 daily studies for a given date."""
    m = target_date.month
    d = target_date.day
    y = target_date.year
    tdate = f"{m}/{d}/{y}"

    results = {}

    for study, page in PAGES.items():
        sep = '&' if '?' in page else '?'
        url = f"{BASE_URL}/{page}{sep}tdate={tdate}"
        print(f"Fetching {study}: {url}")

        html = fetch_page(url)
        if not html:
            print(f"  ✗ Failed to fetch {study}")
            continue

        text = extract_text(html)
        if text and len(text) > 30:
            title = extract_title(html)
            results[study] = {'text': text, 'title': title}
            print(f"  ✓ {study}: {len(text)} chars — {title[:60]}")
        else:
            print(f"  ✗ {study}: no content extracted")

        time.sleep(DELAY)

    return results


# ─── Data file management ────────────────────────────────────────────────────

def load_data() -> dict:
    """Load existing hyy-data.json or create empty structure."""
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (json.JSONDecodeError, IOError):
            data = {}
    else:
        data = {}

    # Ensure all sections exist
    for key in ['hayom_yom', 'rambam', 'tanya', 'houmash']:
        if key not in data:
            data[key] = {}

    return data


def save_data(data: dict):
    """Save hyy-data.json."""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\n✓ Saved to {DATA_FILE}")


def update_data(data: dict, target_date: date, results: dict):
    """Insert scraped results into data structure using app.js-compatible keys."""
    y = target_date.year
    m = target_date.month
    d = target_date.day

    # dateKey format: "2026-2-24" (no zero padding, matches app.js)
    date_key = f"{y}-{m}-{d}"

    # Hebrew date key for Hayom Yom: "Adar_7"
    heb = greg_to_hebrew(y, m, d)
    hyy_key = f"{heb['mName'].replace(' ', '_')}_{heb['hd']}"

    print(f"\nKeys: dateKey={date_key}, hyyKey={hyy_key} ({heb['mName']} {heb['hd']})")

    if 'hayom_yom' in results:
        data['hayom_yom'][hyy_key] = results['hayom_yom']['text']

    if 'rambam' in results:
        data['rambam'][date_key] = {
            'text': results['rambam']['text'],
            'title': results['rambam']['title']
        }

    if 'tanya' in results:
        data['tanya'][date_key] = {
            'text': results['tanya']['text'],
            'title': results['tanya']['title']
        }

    if 'houmash' in results:
        data['houmash'][date_key] = {
            'text': results['houmash']['text'],
            'title': results['houmash']['title']
        }


def cleanup_old_entries(data: dict, keep_days: int = 7):
    """Remove entries older than keep_days to keep the file small."""
    today = date.today()
    for section in ['rambam', 'tanya', 'houmash']:
        if section not in data:
            continue
        keys_to_remove = []
        for key in data[section]:
            try:
                parts = key.split('-')
                entry_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
                if (today - entry_date).days > keep_days:
                    keys_to_remove.append(key)
            except (ValueError, IndexError):
                continue
        for key in keys_to_remove:
            del data[section][key]
        if keys_to_remove:
            print(f"Cleaned {len(keys_to_remove)} old entries from {section}")


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    # Parse optional date argument
    if len(sys.argv) > 1:
        try:
            target_date = datetime.strptime(sys.argv[1], '%Y-%m-%d').date()
        except ValueError:
            print(f"Invalid date format: {sys.argv[1]} (expected YYYY-MM-DD)")
            sys.exit(1)
    else:
        target_date = date.today()

    print(f"═══ Scraping daily studies for {target_date} ═══\n")

    # Scrape
    results = scrape_studies(target_date)

    if not results:
        print("\n✗ No studies scraped. Exiting.")
        sys.exit(1)

    # Load, update, cleanup, save
    data = load_data()
    update_data(data, target_date, results)
    cleanup_old_entries(data)
    save_data(data)

    print(f"\n═══ Done: {len(results)}/4 studies scraped ═══")


if __name__ == '__main__':
    main()
