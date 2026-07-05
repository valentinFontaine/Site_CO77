#!/usr/bin/env python3
"""
Script pour créer des thumbnails optimisées pour la galerie d'art.
Génère des versions redimensionnées des images pour améliorer les performances.
"""

import os
from PIL import Image
import sys

def create_thumbnail(input_path, output_path, max_width=800, quality=85):
    """
    Crée un thumbnail d'une image avec une largeur maximale donnée.
    
    Args:
        input_path: Chemin vers l'image originale
        output_path: Chemin de sortie pour le thumbnail
        max_width: Largeur maximale du thumbnail (défaut: 800px)
        quality: Qualité JPEG (défaut: 85)
    """
    try:
        with Image.open(input_path) as img:
            # Convertir en RGB si nécessaire (pour éviter les erreurs avec certains formats)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Calculer les nouvelles dimensions en gardant le ratio
            width, height = img.size
            if width > max_width:
                ratio = max_width / width
                new_width = max_width
                new_height = int(height * ratio)
                
                # Redimensionner avec un algorithme de haute qualité
                img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            else:
                # Si l'image est déjà plus petite, on la garde telle quelle
                img_resized = img
            
            # Sauvegarder le thumbnail
            img_resized.save(output_path, 'JPEG', quality=quality, optimize=True)
            print(f"✓ Thumbnail créé: {os.path.basename(output_path)} ({img_resized.size[0]}x{img_resized.size[1]})")
            
    except Exception as e:
        print(f"✗ Erreur avec {input_path}: {e}")

def main():
    """Fonction principale pour créer tous les thumbnails."""
    
    # Dossiers
    images_dir = "images"
    thumbnails_dir = os.path.join(images_dir, "thumbnails")
    
    # Créer le dossier thumbnails s'il n'existe pas
    os.makedirs(thumbnails_dir, exist_ok=True)
    
    # Liste des images à traiter
    image_files = ["FLYER V5.jpg"]
    
    print("🖼️  Création des thumbnails pour la galerie d'art...")
    print(f"📁 Dossier de sortie: {thumbnails_dir}")
    print("-" * 50)
    
    created_count = 0
    total_count = len(image_files)
    
    for image_file in image_files:
        input_path = os.path.join(images_dir, image_file)
        output_path = os.path.join(thumbnails_dir, f"thumb_{image_file}")
        
        if os.path.exists(input_path):
            create_thumbnail(input_path, output_path, max_width=800, quality=85)
            created_count += 1
        else:
            print(f"⚠️  Image non trouvée: {image_file}")
    
    print("-" * 50)
    print(f"✅ Terminé! {created_count}/{total_count} thumbnails créés.")
    
    if created_count > 0:
        print("\n📝 Prochaines étapes:")
        print("   1. Les thumbnails sont dans le dossier images/thumbnails/")
        print("   2. Le fichier galerie.html va être mis à jour automatiquement")
        print("   3. Les modales continueront d'afficher les images haute résolution")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n❌ Opération annulée par l'utilisateur.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erreur inattendue: {e}")
        sys.exit(1)
