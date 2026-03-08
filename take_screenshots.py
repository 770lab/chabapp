#!/usr/bin/env python3
"""Take screenshots of all Chab'app sections and save to screenshots/ folder."""
import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

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

driver = webdriver.Chrome(options=options)
driver.set_window_size(WIDTH, HEIGHT)

BASE_URL = 'http://127.0.0.1:8080'


def full_page_screenshot(name, wait=1):
    """Take a full-page screenshot by resizing the window to the page height."""
    time.sleep(wait)
    # Get full page height
    page_height = driver.execute_script(
        "return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);"
    )
    # Resize window to capture full page
    driver.set_window_size(WIDTH, max(page_height, HEIGHT))
    time.sleep(0.5)
    filepath = os.path.join(SCREENSHOTS_DIR, f'{name}.png')
    driver.save_screenshot(filepath)
    print(f'Saved: {filepath}')
    # Reset window size
    driver.set_window_size(WIDTH, HEIGHT)


def navigate_and_screenshot(name, tab_command, wait=3):
    """Navigate to a tab and take a full-page screenshot."""
    driver.execute_script(tab_command)
    full_page_screenshot(name, wait)


try:
    driver.get(BASE_URL)
    time.sleep(4)

    # Dismiss splash screen
    driver.execute_script("""
        var splash = document.getElementById('splash');
        if (splash) splash.style.display = 'none';
        var home = document.getElementById('home');
        if (home) home.style.display = 'block';
    """)
    time.sleep(2)

    # Navigate to home
    driver.execute_script("try { switchTab('menu'); } catch(e) {}")
    time.sleep(3)

    # 1. Accueil (home)
    navigate_and_screenshot('screenshot-accueil', "switchTab('menu')")

    # 2. Tefila
    navigate_and_screenshot('screenshot-tefila', "switchTab('sub-tefila')")

    # 3. Brakhot
    navigate_and_screenshot('screenshot-brakhot', "switchTab('sub-tefila-brachot')")

    # 4. Tehilim
    navigate_and_screenshot('screenshot-tehilim', "switchTab('sub-tehilim')")

    # 5. Etudes
    navigate_and_screenshot('screenshot-etudes', "switchTab('sub-etudes')")

    # 6. Beth Chabad
    navigate_and_screenshot('screenshot-bethchabad', "switchTab('sub-beth')")

    # 7. JewTube (videos)
    navigate_and_screenshot('screenshot-jewtube', "switchTab('sub-videos')")

    # 8. Zmanim - open the zmanim section within tefila panel
    driver.execute_script("switchTab('sub-tefila')")
    time.sleep(2)
    driver.execute_script("""
        try { toggleZmanim(); } catch(e) {}
        var zmBody = document.getElementById('zmanim-body');
        if (zmBody) zmBody.style.display = 'block';
        var zmCard = document.getElementById('zmanim-card');
        if (zmCard) zmCard.scrollIntoView({behavior: 'instant', block: 'start'});
    """)
    full_page_screenshot('screenshot-zmanim', wait=2)

    # 9. Hayom Yom - show on home page, scroll to HYY card
    driver.execute_script("switchTab('menu')")
    time.sleep(2)
    driver.execute_script("""
        var hyy = document.getElementById('hyy-card');
        if (hyy) hyy.scrollIntoView({behavior: 'instant', block: 'start'});
    """)
    full_page_screenshot('screenshot-hayomyom', wait=2)

    print('All 9 screenshots captured successfully!')

finally:
    driver.quit()
