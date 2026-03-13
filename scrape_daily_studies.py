#!/usr/bin/env python3
"""
Scrape les 4 etudes quotidiennes depuis fr.chabad.org.
- Playwright (GitHub Action) ou cloudscraper (Mac local)
- Warm-up Cloudflare puis scrape les 4 pages
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


# --- Playwright extraction JS ---

EXTRACT_JS = """
() => {
    document.querySelectorAll('script, style, nav, iframe, noscript').forEach(el => el.remove());

    function hebrewRatio(text) {
        if (!text || text.length === 0) return 0;
        return (text.match(/[\\u0590-\\u05FF\\uFB1D-\\uFB4F]/g) || []).length / text.length;
    }
    function latinRatio(text) {
        if (!text || text.length === 0) return 0;
        return (text.match(/[a-zA-Z\\u00C0-\\u024F]/g) || []).length / text.length;
    }
    function isNavContent(text) {
        return /S'abonner|Connexion|sélectionner un pays|Trouver un centre|Magazine|Afrique du Sud|Allemagne|Andorre/i.test(text);
    }
    function isBoilerplate(text) {
        // Only flag as boilerplate if the MAJORITY of the text is boilerplate (short text with boilerplate markers)
        const markers = ['forthcoming English Chumash','Chabad House Publications','Lessons In Tanya',"Plus d'options d'abonnement",'email_placeholder','Nous ne communiquerons pas'];
        const hits = markers.filter(m => text.includes(m)).length;
        return hits >= 2 && text.length < 300;
    }
    function stripBoilerplate(text) {
        return text
            .replace(/Lessons In Tanya[\\s\\S]{0,200}$/i, '')
            .replace(/forthcoming English Chumash[\\s\\S]{0,200}$/i, '')
            .replace(/Chabad House Publications[\\s\\S]{0,200}$/i, '')
            .replace(/Plus d'options d'abonnement[\\s\\S]{0,200}$/i, '')
            .replace(/Nous ne communiquerons pas[\\s\\S]{0,200}$/i, '')
            .replace(/email_placeholder[\\s\\S]{0,200}$/i, '')
            .replace(/S'abonner[\\s\\S]{0,100}$/i, '')
            .replace(/Restez connect[\\s\\S]{0,200}$/i, '')
            .trim();
    }

    const selectors = [
        '#TextContent', '#textContent', '.article-text',
        '.page-text-content', '#contentArea', '#pageTextArea',
        '.entry-content', '#article-body', '.article-body',
        '.article_body', '#article', '.parsha-content',
        '#ContentPlaceHolder_TextContent', '.content-inner'
    ];
    for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const text = el.innerText.trim();
        if (text.length > 50 && latinRatio(text) > 0.3 && !isNavContent(text) && !isBoilerplate(text)) {
            return { text: stripBoilerplate(text), method: 'selector-fr:' + sel };
        }
    }

    const allBlocks = [];
    const candidates = document.querySelectorAll('div, td, section, main, article, p');
    for (const el of candidates) {
        const cls = (el.className || '').toLowerCase();
        const id = (el.id || '').toLowerCase();
        if (/nav|footer|header|menu|sidebar|cookie|banner|popup|modal|search|breadcrumb/.test(cls + ' ' + id)) continue;
        const text = el.innerText || '';
        const trimmed = text.trim();
        if (trimmed.length < 50) continue;
        const links = el.querySelectorAll('a');
        const linkText = Array.from(links).reduce((s, a) => s + (a.innerText || '').length, 0);
        if (trimmed.length > 0 && linkText / trimmed.length > 0.3) continue;
        allBlocks.push({
            text: trimmed, len: trimmed.length,
            latin: latinRatio(trimmed), hebrew: hebrewRatio(trimmed),
            isNav: isNavContent(trimmed), isBoiler: isBoilerplate(trimmed), tag: el.tagName
        });
    }

    // PRIORITY 1: largest French block (not boilerplate)
    let bestFr = null, bestFrLen = 0;
    for (const b of allBlocks) {
        if (b.latin > 0.3 && !b.isNav && !b.isBoiler && b.len > bestFrLen && b.len < 50000) {
            bestFr = b; bestFrLen = b.len;
        }
    }
    if (bestFr && bestFrLen > 100) {
        return { text: stripBoilerplate(bestFr.text), method: 'largest-french', latin: bestFr.latin, hebrew: bestFr.hebrew, len: bestFrLen };
    }

    // PRIORITY 2: any non-nav, non-boilerplate block
    let bestAny = null, bestAnyLen = 0;
    for (const b of allBlocks) {
        if (!b.isNav && !b.isBoiler && b.len > bestAnyLen && b.len < 50000) {
            bestAny = b; bestAnyLen = b.len;
        }
    }
    if (bestAny && bestAnyLen > 100) {
        return { text: stripBoilerplate(bestAny.text), method: 'largest-any', latin: bestAny.latin, hebrew: bestAny.hebrew, len: bestAnyLen };
    }

    return { text: '', method: 'none', debug: allBlocks.slice(0,5).map(b => ({len:b.len, lat:b.latin.toFixed(2), heb:b.hebrew.toFixed(2), nav:b.isNav, boiler:b.isBoiler, preview:b.text.substring(0,80)})) };
}
"""


def wait_for_cloudflare(page, max_wait=60):
    """Wait for Cloudflare challenge to resolve."""
    for _w in range(max_wait // 2):
        title = page.title()
        if 'moment' not in title.lower() and 'challenge' not in title.lower() and 'attention' not in title.lower():
            return True
        if _w % 5 == 0:
            print("  Cloudflare... (%ds)" % ((_w+1)*2))
        time.sleep(2)
    return False


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

        # === WARM-UP: visit fr.chabad.org to solve Cloudflare challenge first ===
        print("Warm-up: solving Cloudflare on fr.chabad.org...")
        try:
            page.goto("https://fr.chabad.org/dailystudy/", wait_until="networkidle", timeout=90000)
            if wait_for_cloudflare(page, max_wait=60):
                print("  Cloudflare resolved! Cookies set.")
            else:
                print("  Warning: Cloudflare may not be fully resolved")
            time.sleep(3)
        except Exception as e:
            print("  Warm-up error: %s (continuing anyway)" % str(e))
            time.sleep(3)

        # === Now scrape each study page (cookies already set) ===
        for study, page_path in PAGES.items():
            sep = '&' if '?' in page_path else '?'
            url = "%s/%s%stdate=%s" % (BASE_URL, page_path, sep, tdate)
            print("Fetching %s: %s" % (study, url))
            try:
                page.goto(url, wait_until="networkidle", timeout=90000)

                # Short wait for any remaining challenge
                if not wait_for_cloudflare(page, max_wait=20):
                    print("  x %s: stuck on Cloudflare" % study)
                    time.sleep(DELAY); continue

                time.sleep(2)

                result = page.evaluate(EXTRACT_JS)
                text = result.get('text', '')
                method = result.get('method', '')

                if method == 'none':
                    debug = result.get('debug', [])
                    print("  x %s: no content. Debug:" % study)
                    for d_item in debug:
                        print("    %s" % d_item)
                elif text and len(text) > 50:
                    title = page.title()
                    clean_title = re.sub(r'\s*-\s*fr\.chabad\.org.*', '', title, flags=re.IGNORECASE).strip()
                    latin = result.get('latin', 0)
                    hebrew = result.get('hebrew', 0)
                    results[study] = {'text': text, 'title': clean_title}
                    print("  OK %s: %d chars [%s] lat=%.0f%% heb=%.0f%% - %s" % (
                        study, len(text), method, latin*100, hebrew*100, clean_title[:60]))
                else:
                    print("  x %s: empty (method=%s)" % (study, method))

            except Exception as e:
                print("  x %s: %s" % (study, str(e)))
            time.sleep(DELAY)

        browser.close()
    return results


# --- Cloudscraper engine (Mac local) ---

def is_french_text(text):
    if not text: return False
    latin = len(re.findall(r'[a-zA-Z\u00C0-\u024F]', text))
    return latin / max(len(text), 1) > 0.3

def is_nav_text(text):
    return bool(re.search(r"S'abonner|Connexion|sélectionner un pays|Trouver un centre|Afrique du Sud|Allemagne|Andorre", text, re.IGNORECASE))

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
        if el:
            text = re.sub(r'\s+', ' ', el.get_text(separator=' ', strip=True)).strip()
            if len(text) > 50 and is_french_text(text) and not is_nav_text(text):
                return text
    best, best_len = None, 0
    for div in soup.find_all(['div','td','section','main']):
        cls = ' '.join(div.get('class', [])).lower()
        if any(x in cls for x in ('nav','footer','header','menu','sidebar')): continue
        links = div.find_all('a')
        link_text = sum(len(a.get_text(strip=True)) for a in links)
        txt = div.get_text(strip=True)
        if len(txt) > 0 and link_text / len(txt) > 0.3: continue
        if not is_french_text(txt): continue
        if is_nav_text(txt): continue
        if 100 < len(txt) < 50000 and len(txt) > best_len:
            best = div; best_len = len(txt)
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
                    print("  x %s: no French content" % study)
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

def _clean_scraped_text(text):
    """Strip known fr.chabad.org boilerplate from scraped text."""
    if not text:
        return text
    # Strip header boilerplate (Rambam/Tanya/Houmash page headers)
    text = re.sub(r'^Calendrier juif[\s\S]*?Aujourd.hui\s*\n', '', text)
    # Strip footer: date repetition + navigation
    text = re.sub(r'\n[A-Za-zÀ-ÿ]+ \d+ [A-Za-zÀ-ÿ]+ \d{4} / \d+ [a-zà-ÿ]+ \d{4}\nAujourd.hui[\s\S]*$', '', text)
    text = re.sub(r'\nTéléchargez le calendrier[\s\S]*$', '', text)
    text = re.sub(r'\nAbout the book[\s\S]*$', '', text)
    text = re.sub(r'\nCette page comporte des textes sacrés[\s\S]*$', '', text)
    text = re.sub(r'\nEtudes quotidiennes[\s\S]*$', '', text)
    text = re.sub(r'\nAu sujet de l.éditeur[\s\S]*$', '', text)
    text = re.sub(r'Lessons In Tanya[\s\S]{0,200}$', '', text)
    text = re.sub(r'forthcoming English Chumash[\s\S]{0,200}$', '', text)
    text = re.sub(r'Chabad House Publications[\s\S]{0,200}$', '', text)
    text = re.sub(r"Plus d'options d'abonnement[\s\S]{0,200}$", '', text)
    text = re.sub(r"S'abonner[\s\S]{0,100}$", '', text)
    text = re.sub(r"Restez connecté[\s\S]{0,200}$", '', text)
    text = re.sub(r"Chaque semaine, dans votre boîte mail[\s\S]{0,200}$", '', text)
    text = re.sub(r'Kehot Publication Society[\s\S]{0,200}$', '', text)
    return text.strip()

def _is_garbage_text(text):
    """Detect garbage text (subscription forms, publisher info, etc)."""
    if not text or len(text) < 50:
        return True
    # Only reject very short texts that are mostly boilerplate
    garbage_only = [
        "email_placeholder", "Nous ne communiquerons pas votre adresse"
    ]
    for g in garbage_only:
        if g in text and len(text) < 300:
            return True
    # Short texts with subscription/publisher markers are garbage
    if len(text) < 300:
        short_garbage = [
            "S'abonner", "Restez connecté", "Chaque semaine, dans votre boîte mail",
            "Plus d'options d'abonnement",
        ]
        for g in short_garbage:
            if g in text:
                return True
    footer_markers = ["Au sujet de l'éditeur", "Acheter le livre", "Voir le site", "Kehot Publication Society"]
    footer_hits = sum(1 for m in footer_markers if m in text)
    if footer_hits >= 2 and len(text) < 300:
        return True
    return False

def update_data(data, target_date, results):
    y, m, d = target_date.year, target_date.month, target_date.day
    date_key = "%d-%d-%d" % (y, m, d)
    heb = greg_to_hebrew(y, m, d)
    hyy_key = "%s_%d" % (heb['mName'].replace(' ', '_'), heb['hd'])
    print("\nKeys: dateKey=%s, hyyKey=%s (%s %d)" % (date_key, hyy_key, heb['mName'], heb['hd']))
    if 'hayom_yom' in results:
        data['hayom_yom'][hyy_key] = results['hayom_yom']['text']
    for study in ['rambam', 'tanya', 'houmash']:
        if study in results:
            raw = results[study]['text']
            cleaned = _clean_scraped_text(raw)
            if _is_garbage_text(cleaned):
                print("  SKIP %s: garbage after cleaning (%d chars)" % (study, len(cleaned)))
                continue
            data.setdefault(study, {})[date_key] = {'text': cleaned, 'title': results[study]['title']}

def cleanup_old_entries(data, keep_days=30):
    today = date.today()
    for section in ['rambam','tanya','houmash']:
        if section not in data: continue
        to_remove = []
        for key in data[section]:
            try:
                parts = key.split('-')
                entry_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
                if (today - entry_date).days > keep_days: to_remove.append(key)
            except: continue
        for key in to_remove: del data[section][key]
        if to_remove: print("Cleaned %d old from %s" % (len(to_remove), section))


# --- Bulk Hayom Yom Scraper ---

def bulk_scrape_hayom_yom():
    """Scrape ALL Hayom Yom entries for the entire Hebrew year.
    Iterates through 400 Gregorian days to cover all Hebrew dates.
    Stores entries by Hebrew date key (e.g., 'Adar_8') in hyy-data.json.
    """
    from datetime import timedelta

    if not USE_PLAYWRIGHT:
        print("Bulk scrape requires Playwright. Install: pip install playwright && playwright install chromium")
        sys.exit(1)

    data = load_data()
    existing = set(data.get('hayom_yom', {}).keys())
    print("=== Bulk Hayom Yom Scrape ===")
    print("Existing entries: %d" % len(existing))

    # Generate all dates for the next 400 days to cover a full Hebrew year
    start = date.today()
    all_dates = []
    seen_keys = set(existing)

    for i in range(400):
        d = start + timedelta(days=i)
        heb = greg_to_hebrew(d.year, d.month, d.day)
        hyy_key = "%s_%d" % (heb['mName'].replace(' ', '_'), heb['hd'])
        if hyy_key not in seen_keys:
            all_dates.append((d, hyy_key, heb))
            seen_keys.add(hyy_key)

    print("New entries to scrape: %d" % len(all_dates))
    if not all_dates:
        print("All entries already present!")
        return

    scraped = 0
    failed = 0

    with sync_playwright() as p:
        print("Launching Chromium...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            locale="fr-FR",
        )
        page = context.new_page()

        # Warm-up Cloudflare
        print("Warm-up: solving Cloudflare...")
        try:
            page.goto("https://fr.chabad.org/dailystudy/", wait_until="networkidle", timeout=90000)
            if wait_for_cloudflare(page, max_wait=60):
                print("  Cloudflare resolved!")
            time.sleep(3)
        except Exception as e:
            print("  Warm-up error: %s" % str(e))
            time.sleep(3)

        for idx, (target_date, hyy_key, heb) in enumerate(all_dates):
            m, d, y = target_date.month, target_date.day, target_date.year
            tdate = "%d/%d/%d" % (m, d, y)
            url = "%s/hayomyom.asp?tdate=%s" % (BASE_URL, tdate)

            print("[%d/%d] %s -> %s (%s %d)" % (idx+1, len(all_dates), target_date, hyy_key, heb['mName'], heb['hd']))

            try:
                page.goto(url, wait_until="networkidle", timeout=90000)
                if not wait_for_cloudflare(page, max_wait=20):
                    print("  x Cloudflare stuck")
                    failed += 1
                    time.sleep(DELAY)
                    continue

                time.sleep(2)
                result = page.evaluate(EXTRACT_JS)
                text = result.get('text', '')

                if text and len(text) > 50:
                    data.setdefault('hayom_yom', {})[hyy_key] = text
                    scraped += 1
                    print("  OK: %d chars" % len(text))

                    # Save every 10 entries
                    if scraped % 10 == 0:
                        save_data(data)
                        print("  [checkpoint saved: %d entries]" % len(data['hayom_yom']))
                else:
                    print("  x No content")
                    failed += 1

            except Exception as e:
                print("  x Error: %s" % str(e))
                failed += 1

            time.sleep(DELAY)

        browser.close()

    save_data(data)
    print("\n=== Bulk done: %d scraped, %d failed, %d total entries ===" % (scraped, failed, len(data.get('hayom_yom', {}))))


# --- Bulk All Studies (multi-day) ---

def bulk_scrape_all(days_ahead):
    """Scrape all 4 studies for the next N days in a single Playwright session."""
    from datetime import timedelta

    if not USE_PLAYWRIGHT:
        print("Bulk scrape requires Playwright.")
        sys.exit(1)

    data = load_data()
    start = date.today()
    dates_to_scrape = [start + timedelta(days=i) for i in range(days_ahead)]

    print("=== Bulk All Studies: %d days (%s -> %s) ===" % (
        days_ahead, dates_to_scrape[0], dates_to_scrape[-1]))

    total_scraped = 0
    total_failed = 0

    with sync_playwright() as p:
        print("Launching Chromium...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            locale="fr-FR",
        )
        page = context.new_page()

        # Warm-up Cloudflare (once)
        print("Warm-up: solving Cloudflare...")
        try:
            page.goto("https://fr.chabad.org/dailystudy/", wait_until="networkidle", timeout=90000)
            if wait_for_cloudflare(page, max_wait=60):
                print("  Cloudflare resolved!")
            time.sleep(3)
        except Exception as e:
            print("  Warm-up error: %s" % str(e))
            time.sleep(3)

        for day_idx, target_date in enumerate(dates_to_scrape):
            y, m, d = target_date.year, target_date.month, target_date.day
            tdate = "%d/%d/%d" % (m, d, y)
            date_key = "%d-%d-%d" % (y, m, d)
            heb = greg_to_hebrew(y, m, d)
            hyy_key = "%s_%d" % (heb['mName'].replace(' ', '_'), heb['hd'])

            print("\n--- Day %d/%d: %s (heb: %s %d) ---" % (
                day_idx+1, days_ahead, target_date, heb['mName'], heb['hd']))

            for study, page_path in PAGES.items():
                # Skip hayom_yom if already present (keyed by Hebrew date, repeats yearly)
                if study == 'hayom_yom' and hyy_key in data.get('hayom_yom', {}):
                    print("  [skip] %s: already have %s" % (study, hyy_key))
                    continue
                # Skip other studies if already present for this date
                if study != 'hayom_yom' and date_key in data.get(study, {}):
                    print("  [skip] %s: already have %s" % (study, date_key))
                    continue

                sep = '&' if '?' in page_path else '?'
                url = "%s/%s%stdate=%s" % (BASE_URL, page_path, sep, tdate)
                print("  Fetching %s: %s" % (study, url))

                try:
                    page.goto(url, wait_until="networkidle", timeout=90000)
                    if not wait_for_cloudflare(page, max_wait=20):
                        print("    x Cloudflare stuck")
                        total_failed += 1
                        time.sleep(DELAY)
                        continue

                    time.sleep(2)
                    result = page.evaluate(EXTRACT_JS)
                    text = result.get('text', '')

                    if text and len(text) > 50:
                        title = page.title()
                        clean_title = re.sub(r'\s*-\s*fr\.chabad\.org.*', '', title, flags=re.IGNORECASE).strip()

                        if study == 'hayom_yom':
                            data.setdefault('hayom_yom', {})[hyy_key] = text
                        else:
                            cleaned = _clean_scraped_text(text)
                            if _is_garbage_text(cleaned):
                                print("    x %s: garbage after cleaning" % study)
                                total_failed += 1
                                time.sleep(DELAY)
                                continue
                            data.setdefault(study, {})[date_key] = {'text': cleaned, 'title': clean_title}

                        total_scraped += 1
                        print("    OK: %d chars - %s" % (len(text), clean_title[:50]))
                    else:
                        print("    x No content")
                        total_failed += 1

                except Exception as e:
                    print("    x Error: %s" % str(e))
                    total_failed += 1

                time.sleep(DELAY)

            # Checkpoint every 3 days
            if (day_idx + 1) % 3 == 0:
                save_data(data)
                print("  [checkpoint saved]")

        browser.close()

    save_data(data)
    hyy_count = len(data.get('hayom_yom', {}))
    ram_count = len(data.get('rambam', {}))
    tan_count = len(data.get('tanya', {}))
    hou_count = len(data.get('houmash', {}))
    print("\n=== Bulk done: %d scraped, %d failed ===" % (total_scraped, total_failed))
    print("  hayom_yom: %d | rambam: %d | tanya: %d | houmash: %d" % (hyy_count, ram_count, tan_count, hou_count))


# --- Bulk Tanya (slow, fresh context per request) ---

TANYA_DELAY = 30  # seconds between requests
TANYA_USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
]

def bulk_scrape_tanya(days_ahead):
    """Scrape Tanya with a fresh browser context per request to avoid rate-limiting."""
    from datetime import timedelta
    import random

    if not USE_PLAYWRIGHT:
        print("Requires Playwright.")
        sys.exit(1)

    data = load_data()
    start = date.today()
    dates_to_scrape = []
    for i in range(days_ahead):
        d = start + timedelta(days=i)
        date_key = "%d-%d-%d" % (d.year, d.month, d.day)
        if date_key not in data.get('tanya', {}):
            dates_to_scrape.append(d)

    print("=== Bulk Tanya (slow mode): %d to scrape ===" % len(dates_to_scrape))
    if not dates_to_scrape:
        print("All Tanya entries already present!")
        return

    scraped = 0
    failed = 0

    with sync_playwright() as p:
        for idx, target_date in enumerate(dates_to_scrape):
            m, d, y = target_date.month, target_date.day, target_date.year
            tdate = "%d/%d/%d" % (m, d, y)
            date_key = "%d-%d-%d" % (y, m, d)
            ua = TANYA_USER_AGENTS[idx % len(TANYA_USER_AGENTS)]

            print("\n[%d/%d] Tanya %s" % (idx+1, len(dates_to_scrape), target_date))

            browser = p.chromium.launch(headless=True)
            context = browser.new_context(user_agent=ua, locale="fr-FR")
            page = context.new_page()

            try:
                # Fresh warmup each time
                print("  Warmup...")
                page.goto("https://fr.chabad.org/dailystudy/", wait_until="networkidle", timeout=90000)
                if not wait_for_cloudflare(page, max_wait=40):
                    print("  x Cloudflare stuck on warmup")
                    browser.close()
                    failed += 1
                    time.sleep(TANYA_DELAY)
                    continue
                time.sleep(3)

                url = "%s/tanya.asp?tdate=%s" % (BASE_URL, tdate)
                print("  Fetching: %s" % url)
                page.goto(url, wait_until="networkidle", timeout=90000)
                if not wait_for_cloudflare(page, max_wait=30):
                    print("  x Cloudflare stuck")
                    browser.close()
                    failed += 1
                    time.sleep(TANYA_DELAY)
                    continue

                time.sleep(3)
                result = page.evaluate(EXTRACT_JS)
                text = result.get('text', '')
                method = result.get('method', '')

                if text and len(text) > 50:
                    title = page.title()
                    clean_title = re.sub(r'\s*-\s*fr\.chabad\.org.*', '', title, flags=re.IGNORECASE).strip()
                    cleaned = _clean_scraped_text(text)

                    if _is_garbage_text(cleaned):
                        print("  x Garbage (%d chars, method=%s)" % (len(cleaned), method))
                        print("    Preview: %s" % cleaned[:120])
                        failed += 1
                    else:
                        data.setdefault('tanya', {})[date_key] = {'text': cleaned, 'title': clean_title}
                        scraped += 1
                        print("  OK: %d chars - %s" % (len(cleaned), clean_title[:50]))

                        if scraped % 5 == 0:
                            save_data(data)
                            print("  [checkpoint]")
                else:
                    print("  x No content (method=%s)" % method)
                    failed += 1

            except Exception as e:
                print("  x Error: %s" % str(e))
                failed += 1

            browser.close()
            if idx < len(dates_to_scrape) - 1:
                wait = TANYA_DELAY + random.randint(0, 10)
                print("  Waiting %ds..." % wait)
                time.sleep(wait)

    save_data(data)
    print("\n=== Tanya done: %d scraped, %d failed, %d total ===" % (
        scraped, failed, len(data.get('tanya', {}))))


# --- Main ---

def _parse_arg(flag):
    """Return the value after --flag or None."""
    for i, a in enumerate(sys.argv):
        if a == flag and i + 1 < len(sys.argv):
            return sys.argv[i + 1]
    return None

def main():
    if '--bulk-hyy' in sys.argv:
        bulk_scrape_hayom_yom()
        return

    tanya_arg = _parse_arg('--tanya')
    if tanya_arg:
        try:
            days = int(tanya_arg)
        except ValueError:
            print("Invalid --tanya value: %s" % tanya_arg); sys.exit(1)
        bulk_scrape_tanya(days)
        return

    days_arg = _parse_arg('--days')
    if days_arg:
        try:
            days = int(days_arg)
        except ValueError:
            print("Invalid --days value: %s" % days_arg); sys.exit(1)
        bulk_scrape_all(days)
        return

    print("Usage: python scrape_daily_studies.py --bulk-hyy | --days N | --tanya N")
    sys.exit(1)

if __name__ == '__main__':
    main()
