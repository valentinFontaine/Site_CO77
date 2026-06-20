#!/bin/bash

# Vérifier qu'un paramètre est fourni
if [ $# -eq 0 ]; then
  echo "Usage: $0 <filename.png>" >&2
  exit 1
fi

OUTPUT_PNG="$1"
OUTPUT_WLD="${OUTPUT_PNG%.png}.pgw"
CRS_SOURCE="EPSG:2154"  # Lambert-93
CRS_TARGET="EPSG:4326"  # WGS84 (pour Leaflet)

# Vérification des fichiers
if [ ! -f "$OUTPUT_PNG" ]; then
  echo "Erreur: $OUTPUT_PNG introuvable." >&2
  exit 1
fi

if [ ! -f "$OUTPUT_WLD" ]; then
  echo "Erreur: $OUTPUT_WLD introuvable." >&2
  exit 1
fi

READING=$(identify -ping -format "%w %h" "$OUTPUT_PNG" 2>/dev/null)
WIDTH=$(echo $READING | awk '{print $1}')
HEIGHT=$(echo $READING | awk '{print $2}')

X_MIN=$(head -n 5 "$OUTPUT_WLD" | tail -n 1)  # 6e ligne = X coin supérieur gauche
Y_MAX=$(tail -n 1 "$OUTPUT_WLD")              # 6e ligne = Y coin supérieur gauche
PIXEL_SIZE_X=$(head -n 1 "$OUTPUT_WLD")       # 1ère ligne = taille pixel X
PIXEL_SIZE_Y=$(head -n 4 "$OUTPUT_WLD" | tail -n 1)  # 4e ligne = taille pixel Y (négative)

# Calculer les coins opposés
X_MAX=$(echo "$X_MIN + $WIDTH * $PIXEL_SIZE_X" | bc -l)
Y_MIN=$(echo "$Y_MAX + $HEIGHT * $PIXEL_SIZE_Y" | bc -l)
echo "$X_MIN $Y_MAX" > /tmp/ul.txt
echo "$X_MAX $Y_MIN" > /tmp/lr.txt


UL_LONLAT=$(gdaltransform -s_srs "$CRS_SOURCE" -t_srs "$CRS_TARGET" < /tmp/ul.txt)
LR_LONLAT=$(gdaltransform -s_srs "$CRS_SOURCE" -t_srs "$CRS_TARGET" < /tmp/lr.txt)

rm /tmp/ul.txt /tmp/lr.txt

# Extraire les valeurs (format: "lon lat")
UL_LON=$(echo "$UL_LONLAT" | awk '{print $1}')
UL_LAT=$(echo "$UL_LONLAT" | awk '{print $2}')
LR_LON=$(echo "$LR_LONLAT" | awk '{print $1}')
LR_LAT=$(echo "$LR_LONLAT" | awk '{print $2}')

# Afficher uniquement les bounds au format JSON
cat << EOF
{
  "sw": [$LR_LAT, $UL_LON],
  "ne": [$UL_LAT, $LR_LON]
}
EOF
