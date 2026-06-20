#!/bin/bash
# Script pour l'Agent IA - Migration du contenu depuis l'ancien site
# Usage: ./migrate-from-legacy.sh <chemin_vers_ancien_site> <chemin_vers_projet_astro>

set -e

# Vérification des arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <legacy_source_path> <project_dir>"
    echo ""
    echo "Exemple:"
    echo "  $0 /var/www/html/cdco77 /chemin/vers/Site_CO77"
    exit 1
fi

LEGACY_SOURCE="$1"
PROJECT_DIR="$2"

# Vérifier que la source existe
if [ ! -d "$LEGACY_SOURCE" ]; then
    echo "❌ Erreur: Le dossier source n'existe pas: $LEGACY_SOURCE"
    exit 1
fi

# Se placer dans le projet
cd "$PROJECT_DIR" || exit 1

echo "🚀 Début de la migration depuis: $LEGACY_SOURCE"
echo "📁 Destination: $PROJECT_DIR"
echo ""

# Créer les dossiers temporaires
echo "📦 Création des dossiers temporaires..."
mkdir -p src/content-legacy src/assets-legacy

# Vérifier que les dossiers content/ et assets/ existent dans la source
if [ ! -d "$LEGACY_SOURCE/content" ] && [ ! -d "$LEGACY_SOURCE/attachements" ]; then
    echo "❌ Erreur: Impossible de trouver content/ ou attachements/ dans $LEGACY_SOURCE"
    echo "Structure attendue:"
    echo "  $LEGACY_SOURCE/content/"
    echo "  ou"
    echo "  $LEGACY_SOURCE/attachements/"
    exit 1
fi

# Déterminer le chemin réel
if [ -d "$LEGACY_SOURCE/content" ]; then
    CONTENT_SOURCE="$LEGACY_SOURCE/content"
    ASSETS_SOURCE="$LEGACY_SOURCE/assets"
elif [ -d "$LEGACY_SOURCE/attachements" ]; then
    CONTENT_SOURCE="$LEGACY_SOURCE/attachements"
    ASSETS_SOURCE="$LEGACY_SOURCE/attachements"
else
    echo "❌ Erreur: Aucun dossier content/ ou attachements/ trouvé"
    exit 1
fi

# Fonction pour compter les fichiers
count_files() {
    local dir="$1"
    local ext="$2"
    find "$dir" -type f -name "$ext" 2>/dev/null | wc -l
}

echo "📊 Comptage des fichiers dans la source..."
HTML_COUNT=$(count_files "$CONTENT_SOURCE" "*.html")
HTM_COUNT=$(count_files "$CONTENT_SOURCE" "*.htm")
TOTAL_HTML=$((HTML_COUNT + HTM_COUNT))
IMG_COUNT=$(count_files "$ASSETS_SOURCE" "*.jpg")
IMG_COUNT=$((IMG_COUNT + $(count_files "$ASSETS_SOURCE" "*.jpeg") + $(count_files "$ASSETS_SOURCE" "*.png") + $(count_files "$ASSETS_SOURCE" "*.gif")))
PDF_COUNT=$(count_files "$ASSETS_SOURCE" "*.pdf")

echo "   📄 Fichiers HTML/HTM: $TOTAL_HTML"
echo "   🖼️  Images: $IMG_COUNT"
echo "   📄 PDF: $PDF_COUNT"
echo ""

# Copier le contenu
echo "📥 Copie du contenu..."
if [ -d "$CONTENT_SOURCE" ]; then
    rsync -avz --progress --stats \
        --exclude="_vti_cnf/" \
        --exclude="*.tmp" \
        --exclude="Thumbs.db" \
        --exclude="desktop.ini" \
        "$CONTENT_SOURCE/" \
        src/content-legacy/ || exit 1
    echo "✅ Contenu copié vers src/content-legacy/"
else
    echo "⚠️  Avertissement: Aucun dossier content/ trouvé, essayer avec attachements/"
    rsync -avz --progress --stats \
        --exclude="_vti_cnf/" \
        --exclude="*.tmp" \
        "$LEGACY_SOURCE/attachements/" \
        src/content-legacy/ || exit 1
fi

# Copier les assets
echo ""
echo "📥 Copie des assets..."
if [ -d "$ASSETS_SOURCE" ]; then
    rsync -avz --progress --stats \
        --exclude="_vti_cnf/" \
        --exclude="*.tmp" \
        --exclude="Thumbs.db" \
        "$ASSETS_SOURCE/" \
        src/assets-legacy/ || exit 1
    echo "✅ Assets copiés vers src/assets-legacy/"
else
    echo "⚠️  Avertissement: Aucun dossier assets/ trouvé"
fi

echo ""
echo "📊 Statistiques de la copie:"
echo "   Contenu:"
find src/content-legacy -type f | wc -l | xargs echo "     - Fichiers totaux:"
find src/content-legacy -name "*.html" -o -name "*.htm" | wc -l | xargs echo "     - Fichiers HTML:"

echo "   Assets:"
find src/assets-legacy -type f | wc -l | xargs echo "     - Fichiers totaux:"
find src/assets-legacy \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" \) | wc -l | xargs echo "     - Images:"
find src/assets-legacy -name "*.pdf" | wc -l | xargs echo "     - PDF:"

echo ""
echo "🎯 Structure copiée:"
echo "   src/content-legacy/"
find src/content-legacy -maxdepth 2 -type d | sort | sed 's|^|   ├── |' | sed 's|/[^/]*$||' | sort -u | tail -5
echo "   ..."
echo ""
echo "   src/assets-legacy/"
find src/assets-legacy -maxdepth 2 -type d | sort | sed 's|^|   ├── |' | sed 's|/[^/]*$||' | sort -u | tail -5
echo "   ..."

echo ""
echo "✅ Migration terminée avec succès!"
echo ""
echo "⚠️  PROCHAINES ÉTAPES (à exécuter par l'administrateur):"
echo ""
echo "   1. Exécuter les scripts de conversion:"
echo "      cd $PROJECT_DIR"
echo "      ./scripts/convert-html-to-md.py --legacy-dir src/content-legacy"
echo "      ./scripts/convert-oe12-results.py --legacy-dir src/content-legacy"
echo ""
echo "   2. Copier les assets vers leur destination finale:"
echo "      ./scripts/copy-assets.sh"
echo ""
echo "   3. Valider avec Astro:"
echo "      npm run build"
echo ""
echo "📝 Un rapport détaillé a été généré: MIGRATION_REPORT_$(date +%Y%m%d_%H%M%S).txt"

# Générer un rapport détaillé
REPORT_FILE="MIGRATION_REPORT_$(date +%Y%m%d_%H%M%S).txt"
{
    echo "# Rapport de Migration"
    echo ""
    echo "**Date** : $(date)"
    echo "**Source** : $LEGACY_SOURCE"
    echo "**Destination** : $PROJECT_DIR"
    echo ""
    echo "## Statistiques"
    echo ""
    echo "- Fichiers HTML/HTM copiés : $TOTAL_HTML"
    echo "- Images copiées : $IMG_COUNT"
    echo "- PDF copiés : $PDF_COUNT"
    echo ""
    echo "## Structure"
    echo ""
    echo "### Contenu (src/content-legacy/)"
    find src/content-legacy -maxdepth 3 -type d | sort | sed 's|^|   |' | sed 's|src/content-legacy|content-legacy|'
    echo ""
    echo "### Assets (src/assets-legacy/)"
    find src/assets-legacy -maxdepth 3 -type d | sort | sed 's|^|   |' | sed 's|src/assets-legacy|assets-legacy|'
    echo ""
    echo "## Vérifications"
    echo ""
    echo "- [ ] Tous les fichiers sont lisibles"
    echo "- [ ] La structure est intacte"
    echo "- [ ] Aucun fichier système copié (_vti_cnf, etc.)"
    echo "- [ ] Les dates de modification sont préservées"
} > "$REPORT_FILE"

echo "✅ Rapport sauvegardé: $REPORT_FILE"
