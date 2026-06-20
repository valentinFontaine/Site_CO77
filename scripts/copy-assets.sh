#!/bin/bash
# Script pour copier et organiser les assets depuis l'ancien site
# Usage: ./copy-assets.sh [--source <dossier_source>] [--dest <dossier_dest>]

set -e

# Valeurs par défaut
SOURCE_DIR="src/assets-legacy"
DEST_DIR="src/assets"

# Parser les arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --source)
            SOURCE_DIR="$2"
            shift 2
            ;;
        --dest)
            DEST_DIR="$2"
            shift 2
            ;;
        *)
            echo "Option inconnue: $1"
            exit 1
            ;;
    esac
done

# Vérifier que la source existe
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Erreur: Le dossier source n'existe pas: $SOURCE_DIR"
    exit 1
fi

# Créer le dossier de destination
mkdir -p "$DEST_DIR"

echo "📦 Copie des assets depuis: $SOURCE_DIR"
echo "📁 Vers: $DEST_DIR"
echo ""

# Fonction pour normaliser un nom de fichier
normalize_filename() {
    local filename="$1"
    # Remplacer les espaces par des underscores
    filename=$(echo "$filename" | tr ' ' '_')
    # Convertir en minuscules
    filename=$(echo "$filename" | tr '[:upper:]' '[:lower:]')
    # Supprimer les caractères spéciaux (sauf tirets et underscores)
    filename=$(echo "$filename" | tr -d '[]!*?$(){}<>|^~`\\\'")
    echo "$filename"
}

# Fonction pour déterminer le type d'asset
detect_asset_type() {
    local filename="$1"
    local ext="${filename##*.}"
    ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
    
    case "$ext" in
        jpg|jpeg|png|gif|bmp|svg|webp)
            echo "image"
            ;;
        pdf)
            echo "document"
            ;;
        css|js)
            echo "script"
            ;;
        *)
            echo "other"
            ;;
    esac
}

# Fonction pour extraire l'année depuis un chemin
extract_year() {
    local path="$1"
    # Chercher un dossier avec 4 chiffres (année)
    echo "$path" | grep -oP '/(19|20)\d{2}/' | head -1 | tr -d '/'
}

# Fonction pour extraire le contexte (événement) depuis un chemin
extract_context() {
    local path="$1"
    # Chercher des mots-clés d'événements
    local keywords=("la77" "chpt" "championnat" "course" "entrainement" "competition")
    
    for kw in "${keywords[@]}"; do
        if echo "$path" | grep -qi "$kw"; then
            echo "$kw"
            return
        fi
    done
    
    # Par défaut, utiliser le dossier parent
    local parent=$(basename "$(dirname "$path")")
    echo "$parent" | tr '[:upper:]' '[:lower:]'
}

# Traiter chaque type d'asset
process_assets() {
    local asset_type="$1"
    local source_subdir="$2"
    local dest_subdir="$3"
    
    local source_path="$SOURCE_DIR/$source_subdir"
    local dest_path="$DEST_DIR/$dest_subdir"
    
    if [ ! -d "$source_path" ]; then
        echo "⚠️  Dossier non trouvé: $source_path"
        return
    fi
    
    mkdir -p "$dest_path"
    
    # Compter les fichiers
    local count=$(find "$source_path" -type f | wc -l)
    echo "📊 Traitement de $count fichiers ($asset_type) depuis $source_subdir..."
    
    # Copier chaque fichier
    find "$source_path" -type f | while read file; do
        local rel_path="${file#$source_path/}"
        local dirname=$(dirname "$rel_path")
        local basename=$(basename "$file")
        
        # Extraire l'année depuis le chemin
        local year=$(extract_year "$file")
        
        # Si pas d'année trouvée, utiliser une année par défaut
        if [ -z "$year" ]; then
            # Essayer de deviner depuis le nom de fichier
            year=$(echo "$basename" | grep -oP '\d{4}' | head -1)
            if [ -z "$year" ]; then
                year="unknown"
            fi
        fi
        
        # Normaliser le nom de fichier
        local normalized_name=$(normalize_filename "$basename")
        
        # Créer la structure de destination
        local target_dir="$dest_path/$year"
        if [ "$dirname" != "." ]; then
            # Conserver la structure des sous-dossiers
            target_dir="$dest_path/$year/$dirname"
        fi
        
        mkdir -p "$target_dir"
        
        local target_file="$target_dir/$normalized_name"
        
        # Copier le fichier
        cp "$file" "$target_file"
        
        echo "  ✅ $rel_path → $(basename "$target_file")"
    done
    
    echo ""
}

# Traiter les images
process_assets "image" "images" "images"

# Traiter les documents PDF
process_assets "document" "documents" "documents"

# Traiter les autres fichiers (scripts, etc.)
process_assets "script" "." "other"

# Traiter les logos (recherche spécifique)
echo "🎨 Traitement des logos..."
find "$SOURCE_DIR" -type f -iname "*logo*" | while read file; do
    local target_dir="$DEST_DIR/images/logos"
    local basename=$(basename "$file")
    local normalized_name=$(normalize_filename "$basename")
    
    mkdir -p "$target_dir"
    cp "$file" "$target_dir/$normalized_name"
    echo "  ✅ $file → images/logos/$normalized_name"
done

echo ""
echo "✅ Copie des assets terminée!"
echo ""
echo "📊 Résumé:"
echo "   Images: $(find "$DEST_DIR/images" -type f | wc -l) fichiers"
echo "   Documents: $(find "$DEST_DIR/documents" -type f | wc -l) fichiers"
echo "   Logos: $(find "$DEST_DIR/images/logos" -type f 2>/dev/null | wc -l) fichiers"
echo ""
echo "📁 Structure générée:"
find "$DEST_DIR" -maxdepth 3 -type d | sort | sed 's|^|   |' | tail -10
echo "   ..."
