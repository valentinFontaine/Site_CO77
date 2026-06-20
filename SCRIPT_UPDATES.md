# Mise à jour du script convert-html-to-md.py

## Résumé des modifications

Le script `scripts/convert-html-to-md.py` a été mis à jour pour implémenter l'architecture simplifiée définie dans le plan de migration.

## Changements majeurs

### 1. **Structure plate pour les événements**
- **Avant**: Structure imbriquée avec sous-dossiers (evenements/YYYY/nom-evenement/)
- **Maintenant**: Un seul fichier .md par événement dans `src/content/evenements/`
- Format: `YYYY-MM-DD-slug.md`

### 2. **Gestion des résultats OE12**
- Les fichiers HTML de résultats (Resultats_*, SI_*, Temps_intermediaires*, etc.) sont **ignorés** pendant la conversion
- Ils restent dans `src/assets-legacy/` pour être copiés vers `src/assets/documents/`
- Les fichiers .md lient vers ces assets via des champs frontmatter

### 3. **Nouveaux champs frontmatter**
Ajout de champs pour lier vers les assets HTML :
- `announcementHtml`: Chemin vers l'annonce HTML
- `resultsHtml`: Tableau de chemins vers les résultats HTML
- `inscriptionsHtml`: Chemin vers les inscriptions HTML

### 4. **Filtrage des années**
- Seuls les contenus de **2020 à 2026** sont traités
- Les fichiers hors de cette plage sont ignorés

### 5. **Fichiers ignorés**
Les fichiers suivants sont automatiquement ignorés :
- Pages structurelles: `cadre_*`, `la77accueil*`, `la77haut*`, `la77droit*`, `la77bas*`, `index*`, `accueil*`
- Résultats OE12: `resultats_*`, `resultat_*`, `si_*`, `temps_intermediaires*`
- Inscriptions: `inscrits*`, `inscrit*`, `inscription*`
- Autres: `photos*`, `samedi*`
- System: `_vti_cnf/*`, `Thumbs.db`, `desktop.ini`, `*.tmp`

### 6. **Détection automatique des assets**
La fonction `find_related_html_assets()` recherche automatiquement :
- Dans le dossier parent de l'événement
- Dans les sous-dossiers "fichiers*" 
- Les fichiers HTML correspondants (annonces, résultats, inscriptions)
- Génère des chemins relatifs vers `../../assets/`

### 7. **Nouvelles fonctions**
- `should_skip_file(filename, filepath)`: Détermine si un fichier doit être ignoré
- `extract_year_from_filepath(filepath)`: Extrait l'année depuis un chemin
- `find_related_html_assets(filepath, legacy_dir, assets_dir)`: Trouve les assets HTML associés

### 8. **Mise à jour de la détection de type**
- `detect_content_type()` amélioré pour mieux classifier :
  - `actualite`: news, la77news
  - `evenement`: la77, chpt, championnat, course (pages principales)
  - `entrainement`: entraînement, entrainement
  - `resultat`: résultats (mais ignorés)
  - `inscription`: inscriptions (mais ignorées)

### 9. **Mise à jour de determine_output_path()**
- **Actualités**: `src/content/actualites/YYYY-MM-DD-slug.md`
- **Événements**: `src/content/evenements/YYYY-MM-DD-slug.md` (structure plate)
- **Entraînements**: `src/content/entrainements/YYYY-MM-DD-slug.md`
- **Pages**: `src/content/pages/slug.md`

### 10. **Mise à jour de process_file()**
- Ajout de la vérification `should_skip_file`
- Filtrage par année (2020-2026)
- Appel à `find_related_html_assets()` pour les événements
- Ajout des champs frontmatter pour les assets HTML

### 11. **Mise à jour de main()**
- Détection automatique du dossier assets
- Passage des paramètres `legacy_dir` et `assets_dir` à `process_file()`

## Fichiers créés/modifiés

- `scripts/convert-html-to-md.py` - Script principal mis à jour
- `scripts/requirements.txt` - Dépendances Python créées

## Dépendances Python requises

```bash
pip install beautifulsoup4 pyyaml frontmatter
```

Voir `scripts/requirements.txt` pour les versions exactes.

## Workflow de migration mis à jour

1. **Agent IA** copie les fichiers:
   ```bash
   ./scripts/migrate-from-legacy.sh /ancien-site/chemin .
   ```

2. **Admin** installe les dépendances:
   ```bash
   cd scripts
   pip install -r requirements.txt
   cd ..
   ```

3. **Admin** convertit les HTML:
   ```bash
   python3 scripts/convert-html-to-md.py --legacy-dir src/content-legacy --dry-run
   ```

4. **Admin** copie les assets:
   ```bash
   ./scripts/copy-assets.sh
   ```

5. **Admin** valide:
   ```bash
   npm run build
   ```

## Exemple de sortie

Pour un événement La77 2024 :
- Entrée: `src/content-legacy/2024/La77/la77news.htm`
- Sortie: `src/content/evenements/2024-12-14-la77.md`
- Avec frontmatter:
  ```yaml
  title: "La 77 - 16ème édition"
  pubDate: "2024-11-01T10:00:00Z"
  eventDate: "2024-12-14"
  eventType: "course"
  discipline: "CO"
  location: "Forêt de Fontainebleau"
  announcementHtml: "../../assets/documents/2024/la77/annonce-la77.html"
  resultsHtml:
    - "../../assets/documents/2024/la77/resultats/Resultats_par_categories.html"
    - "../../assets/documents/2024/la77/resultats/Temps_intermediaires.html"
  inscriptionsHtml: "../../assets/documents/2024/la77/inscrits12dec2024.html"
  draft: true
  needsManualReview: true
  ```

## Prochaines étapes

1. Installer les dépendances Python: `pip install -r scripts/requirements.txt`
2. Tester sur un échantillon: `python3 scripts/convert-html-to-md.py --legacy-dir attachements --output src/content-test --limit 10 --dry-run`
3. Vérifier que les fichiers sont correctement classifiés et ignorés
4. Valider les chemins vers les assets HTML
5. Exécuter la conversion complète une fois validé

## Notes

- Le script est conçu pour être **non-destructif** : les fichiers originaux ne sont jamais modifiés
- Le mode `--dry-run` permet de tester sans écrire de fichiers
- Les fichiers ignorés sont signalés avec la raison
- Les années hors 2020-2026 sont filtrées
