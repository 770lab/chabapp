# Chab'app — refactor HTML -> fichiers séparés

## Structure
- `index.html`
- `css/styles.css`
- `js/app.js`
- `assets/favicon.png`
- `assets/apple-touch-icon.png`

## Déploiement GitHub Pages
1. Crée un repo GitHub (ex: `chabapp`)
2. Ajoute ces fichiers à la racine du repo (ou dans `/docs` si tu préfères)
3. Dans GitHub: **Settings → Pages**
   - Source: `Deploy from a branch`
   - Branch: `main` + `/ (root)` (ou `/docs` si tu as choisi)
4. Attends l’URL de Pages et ouvre ton site.

## Notes
- Le code JS est identique (copié tel quel) depuis le HTML d’origine, simplement déplacé dans `js/app.js`.
- Le CSS est identique, déplacé dans `css/styles.css`.
- Les icônes base64 ont été extraites en PNG dans `assets/` pour alléger le HTML.
