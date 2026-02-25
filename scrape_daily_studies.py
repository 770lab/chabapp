#!/usr/bin/env python3
"""
Scrape les 4 etudes quotidiennes depuis fr.chabad.org.
- Utilise Playwright (navigateur headless) si disponible (GitHub Action)
- Sinon utilise cloudscraper (Mac local)
"""

import sys
import json
import time
import re
import math
from datetime import datetime, date
from pathlib import Path

USE_PLAYWRIGHT = False
USE_CLOUDSCRAPER = False

try:
    from playwright.sync_api import sync_playwright
    USE_PLAYWRIGHT = True
    print("[engine] Playwright")
except ImportError:
    pass

if not USE_PLAYWRIGHT:
    try:
        import cloudscraper
        from bs4 import BeautifulSoup
        USE_CLOUDSCRAPER = True
        print("[engine] cloudscraper")
    except ImportError:
        pass

if not USE_PLAYWRIGHT and not USE_CLOUDSCRAPER:
    print("Erreur: installer playwright ou cloudscraper")
    sys.exit(1)


# --- Config ---

BASE_URL = "https://fr.chabad.org/dailystudy"
PAGES = {
    "hayom_yom": "hayomyom.asp",
    "rambam":    "rambam.asp?rambamChapters=1",
    "tanya":     "tanya.asp",
    "houmash":   "torahreading.asp",
}
DATA_FILE = Path("hyy-data.json")
DELAY = 4


# --- Hebrew Date Converter ---

def _floor(x): return math.floor(x)
def _mod(x, y): return x - y * _floor(x / y)

def _heb_elapsed_days(y):
    m = _floor((235 * y - 234) / 19)
    p = 12084 + 13753 * m
    d = 29 * m + _floor(p / 25920)
    if _mod(3 * (d + 1), 7) < 3: d += 1
    return d

def _heb_year_days(y): return _heb_elapsed_days(y + 1) - _heb_elapsed_days(y)
def _is_leap(y): return _mod(7 * y + 1, 19) < 7

def _heb_month_days(y, m):
    if m == 2: return 30 if _heb_year_days(y) % 10 == 5 else 29
    if m == 3: return 30 if _heb_year_days(y) % 10 != 3 else 29
    if m == 4: return 29
    if m == 6: return 30 if _is_leap(y) else 29
    if m == 7: return 29 if _is_leap(y) else 0
    if m in (9, 11, 13): return 29
    return 30

def _greg_to_abs(gy, gm, gd):
    a = _floor((gy-1)/4) - _floor((gy-1)/100) + _floor((gy-1)/400)
    b = 365*(gy-1) + a + gd
    ml = [0,31,28,31,30,31,30,31,31,30,31,30]
    for i in range(1, gm): b += ml[i]
    if gm > 2 and ((gy%4==0 and gy%100!=0) or gy%400==0): b += 1
    return b

def greg_to_hebrew(gy, gm, gd):
    abs_day = _greg_to_abs(gy, gm, gd)
    hy = gy + 3760; epoch = -1373427
    while _heb_elapsed_days(hy+1) + epoch <= abs_day: hy += 1
    while _heb_elapsed_days(hy) + epoch > abs_day: hy -= 1
    day_in_year = abs_day - (_heb_elapsed_days(hy) + epoch) + 1
    hm = 1
    month_order = list(range(1,14)) if _is_leap(hy) else [1,2,3,4,5,6,8,9,10,11,12,13]
    for mo in month_order:
        md = _heb_month_days(hy, mo)
        if day_in_year <= md: hm = mo; break
        day_in_year -= md
    hd = day_in_year
    names = {1:'Tishrei',2:'Cheshvan',3:'Kislev',4:'Tevet',5:'Shevat',
             6:'Adar I',7:'Adar II',8:'Nisan',9:'Iyyar',10:'Sivan',
             11:'Tammuz',12:'Av',13:'Elul'}
    m_name = names.get(hm, '')
    if hm == 6 and not _is_leap(hy): m_name = 'Adar'
    return {'hy':hy, 'hm':hm, 'hd':hd, 'mName':m_name}


# --- Playwright extraction (runs JS in browser context) ---

EXTRACT_JS = """
() => {
    // Remove noise elements
    document.querySelectorAll('script, style, nav, iframe, noscript').forEach(el => el.remove());

    // Try known content selectors (same as app.js)
    const selectors = [
        '#TextContent', '#textContent', '.article-text',
        '.page-text-content', '#contentArea', '#pageTextArea',
        '.entry-content', '#article-body', '.article-body',
        '.article_body', '#article', '.parsha-content',
        '#ContentPlaceHolder_TextContent', '.content-inner'
    ];

    for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
            const text = el.innerText.trim();
            if (text.length > 50) {
                return { text: text, method: 'selector:' + sel };
            }
        }
    }

    // Fallback: find the article/main content area
    // On chabad.org, the main text is usually in a large div
    // that does NOT contain navigation links
    const candidates = document.querySelectorAll('div, td, section, main, article');
    let best = null;
    let bestLen = 0;

    for (const el of candidates) {
        const cls = (el.className || '').toLowerCase();
        const id = (el.id || '').toLowerCase();

        // Skip navigation, header, footer, sidebar
        if (/nav|footer|header|menu|sidebar|cookie|banner|popup|modal|search/.test(cls + ' ' + id)) continue;

        // Skip elements with lots of links (navigation)
        const links = el.querySelectorAll('a');
        const text = el.innerText || '';
        if (links.length > 20 && text.length < 5000) continue;

        // Calculate text density (text vs links)
        const linkText = Array.from(links).reduce((s, a) => s + (a.innerText || '').length, 0);
        const textLen = text.trim().length;
        if (textLen > 0 && linkText / textLen > 0.5) continue; // Skip link-heavy blocks

        if (textLen > bestLen && textLen > 200 && textLen < 50000) {
            best = el;
            bestLen = textLen;
        }
    }

    if (best) {
        return { text: best.innerText.trim(), method: 'largest-block' };
    }

    return { text: '', method: 'none' };
}
"""


def scrape_playwright(target_date):
    m, d, y = target_date.month, target_date.day, target_date.year
    tdate = "%d/%d/%d" % (m, d, y)
    results = {}

    with sync_playwright() as p:
        print("Launching Chromium...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            locale="fr-FR",
        )
        page = context.new_page()

        for study, page_path in PAGES.items():
            sep = '&' if '?' in page_path else '?'
            url = "%s/%s%stdate=%s" % (BASE_URL, page_path, sep, tdate)
            print("Fetching %s: %s" % (study, url))
            try:
                page.goto(url, wait_until="networkidle", timeout=45000)

                # Wait for Cloudflare
                for _w in range(20):
                    title = page.title()
                    if 'moment' not in title.lower() and 'challenge' not in title.lower():
                        break
                    print("  Cloudflare... (%ds)" % ((_w+1)*2))
                    time.sleep(2)

                # Extra wait for dynamic content to load
                time.sleep(2)

                # Check title
                title = page.title()
                if 'moment' in title.lower():
                    print("  x %s: stuck on Cloudflare" % study)
                    time.sleep(DELAY)
                    continue

                # Extract content using browser JS
                result = page.evaluate(EXTRACT_JS)
                text = result.get('text', '')
                method = result.get('method', '')

                if text and len(text) > 50:
                    # Clean title
                    clean_title = re.sub(r'\s*-\s*fr\.chabad\.org.*', '', title, flags=re.IGNORECASE).strip()
                    results[study] = {'text': text, 'title': clean_title}
                    print("  OK %s: %d chars [%s] - %s" % (study, len(text), method, clean_title[:60]))
                else:
                    print("  x %s: no content (method=%s, len=%d)" % (study, method, len(text)))
                    # Debug: save screenshot
                    try:
                        page.screenshot(path="debug_%s.png" % study)
                        print("  (saved screenshot debug_%s.png)" % study)
                    except:
                        pass

            except Exception as e:
                print("  x %s: %s" % (study, str(e)))

            time.sleep(DELAY)

        browser.close()
    return results


# --- Cloudscraper extraction (for Mac local) ---

def extract_text_bs(html):
    soup = BeautifulSoup(html, 'html.parser')
    for tag in soup.find_all(['script','style','nav','header','footer']):
        tag.decompose()
    selectors = [
        '#TextContent','#textContent','.article-text','.page-text-content',
        '#contentArea','#pageTextArea','.entry-content','#article-body',
        '.article-body','.article_body','#article','.parsha-content',
        '#ContentPlaceHolder_TextContent','.content-inner'
    ]
    for sel in selectors:
        el = soup.select_one(sel)
        if el and len(el.get_text(strip=True)) > 50:
            return re.sub(r'\s+', ' ', el.get_text(separator=' ', strip=True)).strip()

    # Fallback with link density check
    best, best_len = None, 0
    for div in soup.find_all(['div','td','section','main']):
        cls = ' '.join(div.get('class', [])).lower()
        if any(x in cls for x in ('nav','footer','header','menu','sidebar')): continue
        links = div.find_all('a')
        link_text = sum(len(a.get_text(strip=True)) for a in links)
        txt = div.get_text(strip=True)
        txt_len = len(txt)
        if txt_len > 0 and link_text / txt_len > 0.5: continue  # Skip nav-heavy blocks
        if 200 < txt_len < 15000 and txt_len > best_len:
            best = div
            best_len = txt_len
    if best:
        return re.sub(r'\s+', ' ', best.get_text(separator=' ', strip=True)).strip()
    return None

def scrape_cloudscraper(target_date):
    m, d, y = target_date.month, target_date.day, target_date.year
    tdate = "%d/%d/%d" % (m, d, y)
    results = {}
    scraper = cloudscraper.create_scraper(
        browser={'browser':'chrome','platform':'darwin','desktop':True}, delay=10)
    for study, page_path in PAGES.items():
        sep = '&' if '?' in page_path else '?'
        url = "%s/%s%stdate=%s" % (BASE_URL, page_path, sep, tdate)
        print("Fetching %s: %s" % (study, url))
        for attempt in range(3):
            try:
                r = scraper.get(url, timeout=30)
                if 'Just a moment' in r.text[:500] or r.status_code == 403:
                    print("  Attempt %d: Cloudflare (status %d)" % (attempt+1, r.status_code))
                    time.sleep(5); continue
                r.raise_for_status()
                text = extract_text_bs(r.text)
                if text and len(text) > 50:
                    title_match = re.search(r'<title[^>]*>([^<]+)</title>', r.text, re.IGNORECASE)
                    title = title_match.group(1) if title_match else ''
                    title = re.sub(r'\s*-\s*fr\.chabad\.org.*', '', title, flags=re.IGNORECASE).strip()
                    results[study] = {'text': text, 'title': title}
                    print("  OK %s: %d chars - %s" % (study, len(text), title[:60]))
                else:
                    print("  x %s: no content" % study)
                break
            except Exception as e:
                print("  Attempt %d: %s" % (attempt+1, str(e)))
                time.sleep(3)
        time.sleep(DELAY)
    return results


# --- Data file management ---

def load_data():
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except: pass
    return {'hayom_yom':{}, 'rambam':{}, 'tanya':{}, 'houmash':{}}

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
    for section in ['rambam','tanya','houmash']:
        if section not in data: continue
        to_remove = []
        for key in data[section]:
            try:
                parts = key.split('-')
                d = date(int(parts[0]), int(parts[1]), int(parts[2]))
                if (today - d).days > keep_days: to_remove.append(key)
            except: continue
        for key in to_remove: del data[section][key]
        if to_remove: print("Cleaned %d old from %s" % (len(to_remove), section))


# --- Main ---

def main():
    if len(sys.argv) > 1:
        try:
            target_date = datetime.strptime(sys.argv[1], '%Y-%m-%d').date()
        except ValueError:
            print("Invalid date: %s (use YYYY-MM-DD)" % sys.argv[1]); sys.exit(1)
    else:
        target_date = date.today()

    print("=== Scraping daily studies for %s ===\n" % target_date)
    results = scrape_playwright(target_date) if USE_PLAYWRIGHT else scrape_cloudscraper(target_date)

    if not results:
        print("\nx No studies scraped."); sys.exit(1)

    data = load_data()
    update_data(data, target_date, results)
    cleanup_old_entries(data)
    save_data(data)
    print("\n=== Done: %d/4 studies scraped ===" % len(results))

if __name__ == '__main__':
    main()
