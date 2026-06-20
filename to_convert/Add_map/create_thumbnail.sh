#!/bin/bash

# Script pour créer des thumbnails de grandes images en utilisant une approche par tuiles
# Usage: ./create_thumbnail.sh input.png output.png [width]

if [ $# -lt 2 ]; then
    echo "Usage: $0 <input.png> <output.png> [width]" >&2
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_FILE="$2"
TARGET_WIDTH="${3:-300}"  # Largeur par défaut: 300px

# Vérifier que le fichier d'entrée existe
if [ ! -f "$INPUT_FILE" ]; then
    echo "Erreur: $INPUT_FILE introuvable." >&2
    exit 1
fi

# Créer un dossier temporaire pour les tuiles
TEMP_DIR="/tmp/thumbnail_tiles_$$"
mkdir -p "$TEMP_DIR"

# Fonction de nettoyage
cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Fonction pour appliquer la transparence
apply_transparency() {
    local file="$1"
    echo "Application de la transparence sur $file..." >&2
    convert "$file" -transparent "#E6E6FA" "$file"
    if [ $? -eq 0 ]; then
        echo "Transparence appliquée avec succès" >&2
    else
        echo "Erreur lors de l'application de la transparence" >&2
    fi
}

echo "Traitement de $INPUT_FILE..." >&2

# Obtenir les dimensions de l'image originale
DIMENSIONS=$(identify -ping -format "%w %h" "$INPUT_FILE" 2>/dev/null)
ORIG_WIDTH=$(echo $DIMENSIONS | awk '{print $1}')
ORIG_HEIGHT=$(echo $DIMENSIONS | awk '{print $2}')

echo "Dimensions originales: ${ORIG_WIDTH}x${ORIG_HEIGHT}" >&2

# Calculer la hauteur proportionnelle du thumbnail final
TARGET_HEIGHT=$(echo "scale=0; $ORIG_HEIGHT * $TARGET_WIDTH / $ORIG_WIDTH" | bc)

echo "Dimensions du thumbnail: ${TARGET_WIDTH}x${TARGET_HEIGHT}" >&2

# Essayer d'abord avec GDAL (plus efficace pour les grandes images)
echo "Tentative avec gdal_translate pour créer un thumbnail direct..." >&2

# Calculer le facteur de réduction
SCALE_FACTOR=$(echo "scale=6; $TARGET_WIDTH / $ORIG_WIDTH" | bc)

# Essayer gdal_translate d'abord (plus efficace en mémoire)
if command -v gdal_translate >/dev/null 2>&1; then
    gdal_translate -of PNG -outsize $TARGET_WIDTH $TARGET_HEIGHT \
        -co COMPRESS=PNG -co ZLEVEL=1 \
        "$INPUT_FILE" "$OUTPUT_FILE" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "Thumbnail créé avec succès via GDAL: $OUTPUT_FILE" >&2
        
        # Appliquer la transparence sur le thumbnail créé par GDAL
        apply_transparency "$OUTPUT_FILE"
        
        exit 0
    else
        echo "GDAL a échoué, passage à l'approche par tuiles..." >&2
    fi
else
    echo "GDAL non disponible, utilisation de l'approche par tuiles..." >&2
fi

# Approche par tuiles plus agressive (8x8 = 64 tuiles)
TILES_X=8
TILES_Y=8

# Calculer la taille de chaque tuile
TILE_WIDTH=$(echo "scale=0; $ORIG_WIDTH / $TILES_X" | bc)
TILE_HEIGHT=$(echo "scale=0; $ORIG_HEIGHT / $TILES_Y" | bc)

echo "Création de ${TILES_X}x${TILES_Y} tuiles de ${TILE_WIDTH}x${TILE_HEIGHT} pixels..." >&2

# Créer les tuiles avec une approche plus conservative
for y in $(seq 0 $((TILES_Y-1))); do
    for x in $(seq 0 $((TILES_X-1))); do
        # Calculer les coordonnées de la tuile
        OFFSET_X=$(echo "$x * $TILE_WIDTH" | bc)
        OFFSET_Y=$(echo "$y * $TILE_HEIGHT" | bc)
        
        # Nom du fichier de tuile
        TILE_FILE="$TEMP_DIR/tile_${y}_${x}.png"
        
        echo "Extraction tuile ($x,$y) à partir de ($OFFSET_X,$OFFSET_Y)..." >&2
        
        # Essayer avec des limites de mémoire encore plus strictes
        convert "$INPUT_FILE" \
            -limit memory 32MB -limit map 64MB -limit disk 1GB \
            -define png:exclude-chunks=date,time \
            -crop "${TILE_WIDTH}x${TILE_HEIGHT}+${OFFSET_X}+${OFFSET_Y}" \
            +repage \
            -depth 8 \
            "$TILE_FILE" 2>/dev/null
        
        # Si convert échoue, essayer avec une approche différente
        if [ $? -ne 0 ]; then
            echo "Convert a échoué, tentative avec une approche alternative..." >&2
            
            # Essayer avec dd et convert en pipeline (plus efficace en mémoire)
            # Créer un fichier temporaire plus petit d'abord
            TEMP_CROP="$TEMP_DIR/temp_crop_${y}_${x}.png"
            
            # Utiliser une approche en deux étapes
            convert "$INPUT_FILE" \
                -limit memory 16MB -limit map 32MB \
                -define png:exclude-chunks=date,time \
                -crop "${TILE_WIDTH}x${TILE_HEIGHT}+${OFFSET_X}+${OFFSET_Y}" \
                -depth 8 -colors 256 \
                +repage \
                "$TEMP_CROP" 2>/dev/null
            
            if [ $? -eq 0 ]; then
                mv "$TEMP_CROP" "$TILE_FILE"
            else
                echo "Impossible d'extraire la tuile ($x,$y), création d'une tuile vide..." >&2
                # Créer une tuile vide comme fallback
                convert -size "${TILE_WIDTH}x${TILE_HEIGHT}" xc:white "$TILE_FILE"
            fi
        fi
    done
done

echo "Redimensionnement des tuiles..." >&2

# Calculer la taille des tuiles dans le thumbnail final
THUMB_TILE_WIDTH=$(echo "scale=0; $TARGET_WIDTH / $TILES_X" | bc)
THUMB_TILE_HEIGHT=$(echo "scale=0; $TARGET_HEIGHT / $TILES_Y" | bc)

# Redimensionner chaque tuile
for y in $(seq 0 $((TILES_Y-1))); do
    for x in $(seq 0 $((TILES_X-1))); do
        TILE_FILE="$TEMP_DIR/tile_${y}_${x}.png"
        THUMB_TILE_FILE="$TEMP_DIR/thumb_tile_${y}_${x}.png"
        
        convert "$TILE_FILE" \
            -limit memory 64MB -limit map 128MB \
            -resize "${THUMB_TILE_WIDTH}x${THUMB_TILE_HEIGHT}!" \
            -unsharp 0x0.75+0.75+0.008 \
            -quality 95 \
            "$THUMB_TILE_FILE"
        
        if [ $? -ne 0 ]; then
            echo "Erreur lors du redimensionnement de la tuile ($x,$y)" >&2
            exit 1
        fi
        
        # Supprimer la tuile originale pour économiser l'espace
        rm "$TILE_FILE"
    done
done

echo "Assemblage du thumbnail final..." >&2

# Créer la commande montage pour assembler les tuiles
MONTAGE_CMD="montage"

# Ajouter les tuiles dans l'ordre correct (ligne par ligne)
for y in $(seq 0 $((TILES_Y-1))); do
    for x in $(seq 0 $((TILES_X-1))); do
        THUMB_TILE_FILE="$TEMP_DIR/thumb_tile_${y}_${x}.png"
        MONTAGE_CMD="$MONTAGE_CMD $THUMB_TILE_FILE"
    done
done

# Assembler les tuiles en une seule image temporaire
TEMP_ASSEMBLED="$TEMP_DIR/assembled_temp.png"
$MONTAGE_CMD \
    -limit memory 128MB -limit map 256MB \
    -tile ${TILES_X}x${TILES_Y} \
    -geometry +0+0 \
    -background none \
    "$TEMP_ASSEMBLED"
echo "Entrer dans la transparence $?"
if [ $? -eq 0 ]; then
    echo "Assemblage réussi..." >&2
    # Copier le fichier assemblé comme thumbnail final
    cp "$TEMP_ASSEMBLED" "$OUTPUT_FILE"
    rm "$TEMP_ASSEMBLED"
    
    # Appliquer la transparence au thumbnail final
    apply_transparency "$OUTPUT_FILE"
    
    echo "Thumbnail créé avec succès: $OUTPUT_FILE" >&2
else
    echo "Erreur lors de l'assemblage du thumbnail" >&2
    exit 1
fi
