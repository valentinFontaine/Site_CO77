#!/bin/bash

# Script pour générer le JSON de toutes les cartes PNG du dossier courant
# et créer les thumbnails correspondants

# Créer les dossiers nécessaires
THUMBNAIL_DIR="../public/images/cartes"
PROCESSED_DIR="Processed"
mkdir -p "$THUMBNAIL_DIR"
mkdir -p "$PROCESSED_DIR"

echo "["

first=true
for png_file in *.png; do
    # Vérifier que le fichier existe (au cas où il n'y aurait pas de fichiers PNG)
    if [ ! -f "$png_file" ]; then
        continue
    fi
    
    # Vérifier que le fichier .pgw correspondant existe
    pgw_file="${png_file%.png}.pgw"
    if [ ! -f "$pgw_file" ]; then
        echo "Attention: $pgw_file introuvable pour $png_file" >&2
        continue
    fi
    
    # Extraire le nom du fichier sans extension
    filename_without_ext=$(basename "$png_file" .png)
    
    # Créer le thumbnail avec le script spécialisé
    thumbnail_path="$THUMBNAIL_DIR/${filename_without_ext}-thumb.png"
    echo "Création du thumbnail: $thumbnail_path" >&2
    ./create_thumbnail.sh "$png_file" "$thumbnail_path" 300
    
    # Ajouter une virgule avant chaque élément sauf le premier
    if [ "$first" = false ]; then
        echo ","
    fi
    first=false
    
    # Générer les bounds avec calculate_coordinate.sh
    bounds=$(./calculate_coordinate.sh "$png_file")
    
    # Construire l'objet JSON complet
    cat << EOF
  {
    "title": "$filename_without_ext",
    "slug": "$filename_without_ext",
    "description": "Nouvelle carte ajoutée automatiquement",
    "thumbnail": "/images/cartes/$filename_without_ext-thumb.png",
    "bounds": $bounds
  }
EOF
    
    # Déplacer les fichiers traités vers le dossier Processed
    echo "Déplacement de $png_file et $pgw_file vers $PROCESSED_DIR/" >&2
    mv "$png_file" "$PROCESSED_DIR/"
    mv "$pgw_file" "$PROCESSED_DIR/"
done

echo ""
echo "]"
