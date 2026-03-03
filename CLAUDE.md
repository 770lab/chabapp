# Chab'app — Instructions pour Claude

## Git
- Toujours committer et pusher les changements avant de terminer
- Créer une PR vers main automatiquement à la fin de chaque session si possible
- Messages de commit en anglais, concis

## Stack
- Vanilla JS (pas de framework), HTML/CSS inline
- Firebase (Auth, Firestore, Storage)
- Python scrapers pour les études quotidiennes (bulk scraper uniquement)

## Architecture
- `index.html` — App monofichier (tous les panels)
- `js/app.js` — Logique principale, navigation switchTab()
- `js/feed.js` — Fil d'actualité + stories
- `js/smart-siddour.js` — Siddour intelligent
- `js/auth.js` — Authentification Firebase
- `scrape_daily_studies.py` — Bulk scraper (pas de daily scraper)
- `hyy-data.json` — Données pré-scrapées (Hayom Yom, Rambam, Tanya, Houmash)

## Conventions
- Pas d'emoji dans le code sauf si demandé
- Français pour les commentaires et textes UI
- Hébreu en UTF-8 avec nikkud quand nécessaire
