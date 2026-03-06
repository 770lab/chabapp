#!/usr/bin/env python3
"""Take screenshots of all Chab'app sections and save to screenshots/ folder."""
import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), 'screenshots')
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

# Mobile viewport
WIDTH = 375
HEIGHT = 812

options = Options()
options.add_argument('--headless')
options.add_argument(f'--window-size={WIDTH},{HEIGHT}')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.add_argument('--force-device-scale-factor=2')

driver = webdriver.Chrome(options=options)
driver.set_window_size(WIDTH, HEIGHT)

BASE_URL = 'http://127.0.0.1:8080'

def take_screenshot(name, tab_command, wait=3):
    """Navigate to a tab and take a screenshot."""
    driver.execute_script(tab_command)
    time.sleep(wait)
    filepath = os.path.join(SCREENSHOTS_DIR, f'{name}.png')
    driver.save_screenshot(filepath)
    print(f'Saved: {filepath}')

try:
    driver.get(BASE_URL)
    time.sleep(4)  # Wait for initial load

    # Dismiss splash screen by clicking via JS
    driver.execute_script("""
        var splash = document.getElementById('splash') || document.querySelector('[onclick]');
        if (splash) splash.click();
        // Also try to hide splash and show main content
        var splashEls = document.querySelectorAll('[id*=splash], [id*=Splash]');
        splashEls.forEach(function(el) { el.style.display = 'none'; });
        // Force show main app
        var app = document.getElementById('app') || document.getElementById('main-app');
        if (app) app.style.display = 'block';
    """)
    time.sleep(2)

    # Navigate to home via switchTab
    driver.execute_script("try { switchTab('menu'); } catch(e) {}")
    time.sleep(3)

    # 1. Home / Accueil
    take_screenshot('01-accueil', "switchTab('menu')")

    # 2. Tefila panel
    take_screenshot('02-tefila', "switchTab('sub-tefila')")

    # 3. Siddur - Shacharit
    take_screenshot('03-siddur-shacharit', "switchTab('sub-tefila-siddur')")

    # 4. Siddur - Mincha
    take_screenshot('04-siddur-mincha', "window.siddurSetTefilah('mincha')")

    # 5. Siddur - Arvit
    take_screenshot('05-siddur-arvit', "window.siddurSetTefilah('arvit')")

    # 6. Tehilim
    take_screenshot('06-tehilim', "switchTab('sub-tehilim')")

    # 7. Etudes
    take_screenshot('07-etudes', "switchTab('sub-etudes')")

    # 8. Objectifs
    take_screenshot('08-objectifs', "switchTab('sub-objectifs')")

    print('All screenshots captured successfully!')

finally:
    driver.quit()
