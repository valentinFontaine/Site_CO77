#!/usr/bin/env python3
"""
Script de conversion HTML → Markdown pour la migration CDCO77

Usage:
    python3 convert-html-to-md.py --legacy-dir <dossier_source> [--output <dossier_sortie>]
    
Exemple:
    python3 convert-html-to-md.py --legacy-dir src/content-legacy
    
NOUVELLE VERSION: Architecture simplifiée
- Un seul fichier .md par événement
- Les résultats OE12 restent en HTML dans assets/documents/
- Les .md lient vers ces assets via frontmatter
- Structure plate pour evenements/
- Seule migration 2020-2026
"""

import os
import re
import sys
import argparse
import html
from bs4 import BeautifulSoup
from datetime import datetime
import frontmatter
import yaml

# ============================================================================
# CONFIGURATION
# ============================================================================

# Plage d'années à migrer (2020-2026)
MIGRATION_YEARS = range(2020, 2027)

# Fichiers à ignorer (structuraux, OE12, etc.)
FILES_TO_SKIP = [
    # Pages structurelles
    'cadre_',
    'la77accueil',
    'la77haut',
    'la77droit',
    'la77bas',
    'index',
    'accueil',
    # Résultats OE12 (à garder en HTML dans assets/)
    'resultats_',
    'resultat_',
    'resultats',
    'resultat',
    'si_',
    'temps_intermediaires',
    'temps intermediaires',
    'inscrits',
    'inscrit',
    # Test files
    'essai',
    'test',
    # Autres
    'photos',
    'samedi',  # Page de navigation
]

# Extensions OE12 à ignorer (fichiers HTML de résultats)
OE12_PATTERNS = [
    r'Resultats_',
    r'resultats_',
    r'Resultat_',
    r'resultat_',
    r'si_',
    r'SI_',
    r'Temps_interm',
    r'temps_interm',
    r'inscrits',
    r'inscrit',
    r'inscription',
    r'inscriptions_',
]

# Mapping des catégories
CATEGORY_MAP = {
    'la77news': 'actualites',
    'news': 'actualites',
    'annonce': 'annonces',
    'chpt': 'competitions',
    'championnat': 'competitions',
    'course': 'competitions',
    'entrainement': 'entrainements',
    'entraînement': 'entrainements',
}

# Mapping des tags
TAG_MAP = {
    'la 77': ['la77', 'course'],
    'la77': ['la77', 'course'],
    'championnats': ['competition', 'championnat'],
    'championnat': ['competition', 'championnat'],
    'départementaux': ['championnat-departemental'],
    'sprint': ['sprint'],
    'moyenne distance': ['md', 'moyenne-distance'],
    'md': ['md', 'moyenne-distance'],
    'longue distance': ['ld', 'longue-distance'],
    'ld': ['ld', 'longue-distance'],
    'trail': ['trail-o'],
    'si': ['sportident', 'temps-intermediaires'],
    'sportident': ['sportident'],
    'inscription': ['inscriptions'],
    'résultat': ['resultats'],
    'resultat': ['resultats'],
    'photo': ['photos'],
    'forêt': ['foret', 'fontainebleau'],
    'fontainebleau': ['foret', 'fontainebleau'],
}

# Types d'événements
EVENT_TYPES = {
    'la77': 'course',
    'chpt': 'competition',
    'championnat': 'competition',
    'course': 'course',
    'entraînement': 'entrainement',
    'entrainement': 'entrainement',
    'réunion': 'reunion',
    'reunion': 'reunion',
    'stage': 'stage',
}

# Disciplines
DISCIPLINES = ['CO', 'Sprint', 'MD', 'LD', 'Trail-O', 'Trail O', 'Relais']

# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

def normalize_string(s):
    """Normalise une chaîne pour l'utiliser dans un slug"""
    if not s:
        return ''
    s = s.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)  # Garder seulement alphanum, espaces, tirets
    s = re.sub(r'[\s]+', '-', s)  # Remplacer espaces par tirets
    s = re.sub(r'-+', '-', s)  # Supprimer les tirets multiples
    return s.strip('-')


def should_skip_file(filename, filepath):
    """Déterminer si un fichier doit être ignoré"""
    filename_lower = filename.lower()
    
    # Vérifier si c'est un fichier OE12 (résultats)
    for pattern in OE12_PATTERNS:
        if re.search(pattern, filename_lower, re.IGNORECASE):
            return True, "OE12 results file"
    
    # Vérifier si c'est dans FILES_TO_SKIP
    for skip_pattern in FILES_TO_SKIP:
        if skip_pattern.lower() in filename_lower:
            return True, "Structural/navigation file"
    
    # Vérifier si c'est dans un dossier _vti_cnf
    if '_vti_cnf' in filepath:
        return True, "System file (_vti_cnf)"
    
    # Vérifier si c'est un Thumbs.db ou desktop.ini
    if filename in ['Thumbs.db', 'desktop.ini', '*.tmp']:
        return True, "System file"
    
    return False, ""


def extract_year_from_filepath(filepath):
    """Extraire l'année depuis un chemin de fichier"""
    # Chercher un dossier avec 4 chiffres (année)
    match = re.search(r'/(19|20)\d{2}/', filepath)
    if match:
        return int(match.group(0).strip('/'))
    return None


def extract_date_from_filename(filename):
    """Extraire une date depuis un nom de fichier"""
    # Pattern: YYYY-MM-DD, YYYY/MM/DD, YYYYMMDD
    patterns = [
        r'(\d{4})-(\d{2})-(\d{2})',
        r'(\d{4})/(\d{2})/(\d{2})',
        r'(\d{4})_(\d{2})_(\d{2})',
        r'(\d{4})(\d{2})(\d{2})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, filename)
        if match:
            groups = match.groups()
            if len(groups) == 3:
                year, month, day = groups
                return f"{year}-{month}-{day}"
    
    return None


def extract_date_from_content(content):
    """Extraire une date depuis le contenu HTML"""
    # Chercher des patterns de dates
    patterns = [
        r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})',  # DD/MM/YYYY ou DD-MM-YYYY
        r'(\d{4})[/-](\d{1,2})[/-](\d{1,2})',  # YYYY/MM/DD ou YYYY-MM-DD
        r'(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|janv|fév|mars|avr|mai|juin|juil|août|sept|oct|nov|déc)\s+(\d{4})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            if len(match.groups()) == 3:
                day, month_str, year = match.groups()
                # Convertir le mois
                month_map = {
                    'janvier': '01', 'janv': '01',
                    'février': '02', 'fév': '02',
                    'mars': '03',
                    'avril': '04', 'avr': '04',
                    'mai': '05',
                    'juin': '06',
                    'juillet': '07', 'juil': '07',
                    'août': '08',
                    'septembre': '09', 'sept': '09',
                    'octobre': '10', 'oct': '10',
                    'novembre': '11', 'nov': '11',
                    'décembre': '12', 'déc': '12',
                }
                month = month_map.get(month_str.lower(), '01')
                return f"{year}-{month}-{day.zfill(2)}"
            elif len(match.groups()) == 2:
                year, month, day = match.groups() + ('01',)
                return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    
    return None


def extract_year_from_filepath(filepath):
    """Extraire l'année depuis un chemin de fichier"""
    # Chercher un dossier avec 4 chiffres (année)
    match = re.search(r'/(19|20)\d{2}/', filepath)
    if match:
        return int(match.group(0).strip('/'))
    return None


def find_related_html_assets(filepath, legacy_dir, assets_dir="src/assets-legacy"):
    """Trouver les fichiers HTML associés (résultats, inscriptions, annonces) pour un événement"""
    assets = {
        'announcementHtml': None,
        'resultsHtml': [],
        'inscriptionsHtml': None,
    }
    
    # Extraire le dossier parent de l'événement
    event_dir = os.path.dirname(filepath)
    
    # Chercher dans le dossier parent et les sous-dossiers "fichiers*"
    search_dirs = [event_dir]
    
    # Ajouter les dossiers "fichiers*" dans le parent
    parent_dir = os.path.dirname(event_dir)
    if os.path.isdir(parent_dir):
        for item in os.listdir(parent_dir):
            item_path = os.path.join(parent_dir, item)
            if os.path.isdir(item_path) and 'fichier' in item.lower():
                search_dirs.append(item_path)
    
    # Chercher les fichiers correspondants
    for search_dir in search_dirs:
        if not os.path.isdir(search_dir):
            continue
        
        try:
            for file in os.listdir(search_dir):
                # Ignorer les fichiers système
                if file.startswith('_') or file.startswith('~'):
                    continue
                
                filepath_lower = file.lower()
                full_path = os.path.join(search_dir, file)
                
                # Ignorer les dossiers _vti_cnf
                if '_vti_cnf' in full_path:
                    continue
                
                # Résultats OE12
                if any(p in filepath_lower for p in ['resultats_', 'resultat_', 'si_', 'temps_interm']):
                    # Vérifier que c'est un fichier HTML
                    if file.lower().endswith(('.html', '.htm')):
                        # Calculer le chemin relatif vers assets/
                        rel_to_assets = os.path.relpath(full_path, assets_dir)
                        rel_path = f"../../assets/{rel_to_assets}".replace(os.sep, '/')
                        if rel_path not in assets['resultsHtml']:
                            assets['resultsHtml'].append(rel_path)
                
                # Inscriptions
                elif any(p in filepath_lower for p in ['inscrits', 'inscrit', 'inscription']):
                    if file.lower().endswith(('.html', '.htm')):
                        rel_to_assets = os.path.relpath(full_path, assets_dir)
                        rel_path = f"../../assets/{rel_to_assets}".replace(os.sep, '/')
                        assets['inscriptionsHtml'] = rel_path
                
                # Annonces
                elif any(p in filepath_lower for p in ['annonce']):
                    if file.lower().endswith(('.html', '.htm')):
                        rel_to_assets = os.path.relpath(full_path, assets_dir)
                        rel_path = f"../../assets/{rel_to_assets}".replace(os.sep, '/')
                        assets['announcementHtml'] = rel_path
        except Exception as e:
            # Silently continue if there's an error reading the directory
            pass
    
    # Dédoublonner les résultats
    assets['resultsHtml'] = list(set(assets['resultsHtml']))
    
    return assets


def detect_content_type(filename, content):
    """Détecter le type de contenu"""
    filename_lower = filename.lower()
    content_lower = content.lower()
    
    # Actualités / News
    if any(kw in filename_lower for kw in ['news', 'la77news']):
        return 'actualite'
    
    # Résultat (OE12 - à ignorer, déjà filtrés par should_skip_file)
    if any(kw in filename_lower for kw in ['resultat', 'resultats', 'si_']):
        return 'resultat'
    
    # Inscriptions (à lier depuis les événements, pas des fichiers séparés)
    if any(kw in filename_lower for kw in ['inscription', 'inscrit', 'inscrits']):
        return 'inscription'
    
    # Entraînements
    if any(kw in filename_lower for kw in ['entrainement', 'entraînement']):
        return 'entrainement'
    
    # Photos
    if any(kw in filename_lower for kw in ['photo', 'photos']):
        return 'photo'
    
    # Pages structurelles
    if any(kw in filename_lower for kw in ['accueil', 'cadre', 'droit', 'haut', 'index']):
        return 'page'
    
    # Compétitions / Événements (mots-clés dans le nom de fichier)
    event_keywords = [
        'la77', 'chpt', 'championnat', 'course', 'competition',
        'regionale', 'departemental', 'sprint', 'md', 'ld',
        'st ', 'st-',  # Ex: stFargeau, st-fargeau
    ]
    if any(kw in filename_lower for kw in event_keywords):
        return 'evenement'
    
    # Par défaut: essayer de détecter depuis le contenu
    if 'annonce' in content_lower or 'annonces' in content_lower:
        return 'evenement'
    
    if 'résultat' in content_lower or 'resultats' in content_lower:
        return 'resultat'
    
    # Si on arrive ici, essayer de déterminer si c'est un événement
    # en cherchant des dates et des mots-clés d'événements
    date_pattern = r'\b(19|20)\d{2}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12][0-9]|3[01])\b'
    if re.search(date_pattern, content_lower) and any(kw in content_lower for kw in ['course', 'compétition', 'championnat', 'la 77', 'départemental', 'régional']):
        return 'evenement'
    
    # Par défaut
    return 'page'


def detect_event_metadata(filename, content):
    """Détecter les métadonnées d'un événement"""
    metadata = {
        'eventType': None,
        'discipline': None,
        'date': None,
        'location': None,
    }
    
    content_lower = content.lower()
    
    # Type d'événement
    for kw, etype in EVENT_TYPES.items():
        if kw in filename.lower() or kw in content_lower:
            metadata['eventType'] = etype
            break
    
    # Discipline
    for disc in DISCIPLINES:
        if disc.lower() in content_lower:
            metadata['discipline'] = disc
            break
    
    # Date
    date_from_file = extract_date_from_filename(filename)
    date_from_content = extract_date_from_content(content)
    metadata['date'] = date_from_file or date_from_content
    
    # Location
    location_patterns = [
        r'lieu[\s:]*([A-Za-z\s,]+)',
        r'forêt[\s:]*([A-Za-z\s,]+)',
        r'fontainebleau',
        r'samois',
        r'larchant',
    ]
    
    for pattern in location_patterns:
        match = re.search(pattern, content_lower, re.IGNORECASE)
        if match:
            metadata['location'] = match.group(1) if match.groups() else match.group(0)
            break
    
    return metadata


# ============================================================================
# EXTRACTION DES MÉTADONNÉES
# ============================================================================

def extract_metadata_from_html(soup, filename, file_content):
    """Extraire les métadonnées depuis un fichier HTML"""
    metadata = {
        'title': '',
        'description': '',
        'pubDate': None,
        'updatedDate': None,
        'author': 'CO77',
        'tags': [],
        'category': None,
        'draft': False,
        'featured': False,
        'legacyFile': os.path.basename(filename),
        'legacyPath': os.path.relpath(filename, os.getcwd()),
    }
    
    # Titre
    if soup.title and soup.title.string:
        metadata['title'] = soup.title.string.strip()
        if not metadata['title'] or len(metadata['title']) < 5:
            # Essayer de trouver un h1
            h1 = soup.find('h1')
            if h1:
                metadata['title'] = h1.get_text(strip=True)
    
    if not metadata['title'] or len(metadata['title']) < 5:
        # Utiliser le nom de fichier
        base = os.path.basename(filename)
        metadata['title'] = os.path.splitext(base)[0].replace('_', ' ').replace('-', ' ').title()
    
    # Meta description
    desc_meta = soup.find('meta', attrs={'name': re.compile('description|Description', re.I)})
    if desc_meta and desc_meta.get('content'):
        metadata['description'] = desc_meta['content'].strip()[:300]
    
    # Meta keywords (pour les tags)
    keywords_meta = soup.find('meta', attrs={'name': re.compile('keywords|KeyWords', re.I)})
    if keywords_meta and keywords_meta.get('content'):
        keywords = [kw.strip().lower() for kw in keywords_meta['content'].split(',')]
        for kw in keywords:
            if kw:
                # Mapper aux tags standardisés
                for key, tags in TAG_MAP.items():
                    if key in kw:
                        metadata['tags'].extend(tags)
                if kw not in metadata['tags']:
                    metadata['tags'].append(kw)
    
    # Auteur
    author_meta = soup.find('meta', attrs={'name': re.compile('author|Author|creator', re.I)})
    if author_meta and author_meta.get('content'):
        metadata['author'] = author_meta['content'].strip()
    
    # Date de publication
    # 1. Depuis le nom de fichier
    date_from_file = extract_date_from_filename(filename)
    # 2. Depuis la balise meta
    date_meta = soup.find('meta', attrs={'name': re.compile('date|Date|pubdate|pubDate|published', re.I)})
    if date_meta and date_meta.get('content'):
        try:
            date_str = date_meta['content'].strip()
            # Essayer de parser la date
            if re.match(r'\d{4}-\d{2}-\d{2}', date_str):
                metadata['pubDate'] = date_str
            elif re.match(r'\d{2}/\d{2}/\d{4}', date_str):
                day, month, year = date_str.split('/')
                metadata['pubDate'] = f"{year}-{month}-{day}"
        except:
            pass
    # 3. Depuis le contenu
    if not metadata['pubDate']:
        date_from_content = extract_date_from_content(file_content)
        if date_from_content:
            metadata['pubDate'] = date_from_content
    # 4. Depuis la date de modification du fichier
    if not metadata['pubDate']:
        mtime = os.path.getmtime(filename)
        metadata['pubDate'] = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
    
    # Date de mise à jour (même que pubDate par défaut)
    metadata['updatedDate'] = metadata['pubDate']
    
    # Catégorie
    for pattern, category in CATEGORY_MAP.items():
        if pattern in filename.lower() or pattern in file_content.lower():
            metadata['category'] = category
            break
    
    if not metadata['category']:
        # Détecter depuis le type de contenu
        content_type = detect_content_type(filename, file_content)
        if content_type == 'actualite':
            metadata['category'] = 'annonces'
        elif content_type == 'resultat':
            metadata['category'] = 'resultats'
        elif content_type == 'competition':
            metadata['category'] = 'competitions'
    
    # Supprimer les doublons dans les tags
    metadata['tags'] = list(set(metadata['tags']))
    
    return metadata


# ============================================================================
# NETTOYAGE DU CONTENU HTML
# ============================================================================

def clean_html(soup):
    """Nettoyer le HTML avant conversion"""
    # Supprimer les éléments indésirables
    elements_to_remove = [
        'script', 'style', 'link', 'meta', 'head',
        'frame', 'frameset', 'noframes', 'iframe',
        'object', 'embed', 'applet',
    ]
    
    for element in soup.find_all(elements_to_remove):
        element.decompose()
    
    # Supprimer les classes Microsoft
    for element in soup.find_all(class_=True):
        classes = element.get('class', [])
        new_classes = [c for c in classes if not c.startswith(('Mso', 'ms', 'FP', 'fp'))]
        if new_classes:
            element['class'] = new_classes
        else:
            del element['class']
    
    # Supprimer les styles inline trop lourds
    for element in soup.find_all(style=True):
        style = element['style']
        # Garder seulement les styles simples
        if len(style) > 100:
            del element['style']
    
    # Supprimer les commentaires HTML
    for comment in soup.find_all(string=lambda text: isinstance(text, type(soup.new_string('')))):
        comment.extract()
    
    # Supprimer les balises vides
    for element in soup.find_all():
        if not element.contents and not element.attrs:
            element.extract()
    
    return soup


# ============================================================================
# CONVERSION HTML → MARKDOWN
# ============================================================================

def convert_html_to_markdown(soup):
    """Convertir HTML en Markdown"""
    content = str(soup.body) if soup.body else str(soup)
    
    # Supprimer les balises <body> et autres containers
    content = re.sub(r'<body[^>]*>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'</body>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<html[^>]*>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'</html>', '', content, flags=re.IGNORECASE)
    
    # Paragraphes
    content = re.sub(r'<p[^>]*>([\s\S]*?)</p>', r'\1\n\n', content)
    
    # Sauts de ligne
    content = re.sub(r'<br\s*/?>', '\n', content, flags=re.IGNORECASE)
    
    # Titres
    for i in range(1, 7):
        content = re.sub(
            rf'<h{i}[^>]*>([^<]+)</h{i}>',
            lambda m: f"{'#' * i} {m.group(1)}\n",
            content,
            flags=re.IGNORECASE
        )
    
    # Gras et italique
    content = re.sub(r'<b[^>]*>([^<]+)</b>', r'**\1**', content, flags=re.IGNORECASE)
    content = re.sub(r'<strong[^>]*>([^<]+)</strong>', r'**\1**', content, flags=re.IGNORECASE)
    content = re.sub(r'<i[^>]*>([^<]+)</i>', r'*\1*', content, flags=re.IGNORECASE)
    content = re.sub(r'<em[^>]*>([^<]+)</em>', r'*\1*', content, flags=re.IGNORECASE)
    
    # Listes à puces
    content = re.sub(r'<ul[^>]*>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'</ul>', '\n', content, flags=re.IGNORECASE)
    content = re.sub(r'<li[^>]*>([^<]+)</li>', r'  - \1\n', content, flags=re.IGNORECASE)
    
    # Listes numérotées
    content = re.sub(r'<ol[^>]*>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'</ol>', '\n', content, flags=re.IGNORECASE)
    
    # Liens
    content = re.sub(
        r'<a[^>]+href="([^"]+)"[^>]*>([^<]+)</a>',
        r'[\2](\1)',
        content,
        flags=re.IGNORECASE
    )
    
    # Images
    content = re.sub(
        r'<img[^>]+src="([^"]+)"[^>]*>',
        r'![\1](\1)',
        content,
        flags=re.IGNORECASE
    )
    
    # Tableaux (simplifié - on garde le HTML pour l'instant)
    content = re.sub(r'<table[^>]*>', '\n\n', content, flags=re.IGNORECASE)
    content = re.sub(r'</table>', '\n\n', content, flags=re.IGNORECASE)
    
    # Supprimer les balises restantes
    content = re.sub(r'<[^>]+>', '', content)
    
    # Nettoyer les espaces
    content = re.sub(r'\n{3,}', '\n\n', content)
    content = re.sub(r'^[\s\n]+', '', content)
    content = re.sub(r'[\s\n]+$', '', content)
    
    # Décoder les entités HTML
    content = html.unescape(content)
    
    return content.strip()


# ============================================================================
# DÉTERMINATION DU CHEMIN DE SORTIE
# ============================================================================

def determine_output_path(filename, metadata, content_type, base_output_dir):
    """Déterminer le chemin de sortie pour un fichier - STRUCTURE PLATE"""
    # Extraire l'année
    year = extract_year_from_filepath(filename)
    if not year:
        # Essayer d'extraire depuis la date
        if metadata.get('pubDate'):
            pub_date = metadata['pubDate']
            # Extraire l'année depuis différents formats
            if len(pub_date) >= 4:
                # Essayer YYYY-MM-DD ou YYYY/MM/DD
                if pub_date[4] in ['-', '/', '_']:
                    year = int(pub_date[:4])
                # Essayer DD-MM-YYYY
                elif pub_date[2] in ['-', '/'] and len(pub_date) >= 10:
                    year = int(pub_date[6:10])
                else:
                    year = 2020
            else:
                year = 2020
        else:
            year = 2020  # Default to first migration year
    
    # Nettoyer le nom de fichier
    base_name = os.path.basename(filename)
    name_no_ext = os.path.splitext(base_name)[0]
    
    # Détecter l'événement depuis le chemin
    path_parts = filename.split(os.sep)
    event_name = None
    for part in path_parts:
        part_lower = part.lower()
        if any(kw in part_lower for kw in ['la77', 'chpt', 'championnat', 'course', 'entrainement']):
            event_name = part.replace('fichiers ', '').replace('La77', 'La 77')
            break
    
    # ========================================================================
    # NOUVELLE LOGIQUE: STRUCTURE PLATE
    # ========================================================================
    
    if content_type == 'actualite':
        # Actualités: YYYY-MM-DD-slug.md dans actualites/
        date_str = metadata.get('pubDate', f"{year}-01-01")
        slug = normalize_string(metadata.get('title', name_no_ext))
        if not slug:
            slug = normalize_string(name_no_ext)
        if not slug:
            slug = 'untitled'
        
        output_filename = f"{date_str}-{slug}.md" if date_str.startswith(str(year)) else f"{year}-{slug}.md"
        output_path = os.path.join(base_output_dir, 'actualites', output_filename)
        
    elif content_type in ['evenement', 'competition', 'resultat', 'inscription']:
        # ÉVÉNEMENTS: TOUT dans un seul fichier YYYY-MM-DD-slug.md dans evenements/
        # Même les inscriptions et résultats sont intégrés dans l'événement principal
        
        # Déterminer la date de l'événement
        event_date = metadata.get('pubDate', f"{year}-01-01")
        
        # Si on a une date d'événement, l'utiliser
        if metadata.get('date'):
            event_date = metadata['date']
        
        # Normaliser la date
        if isinstance(event_date, str):
            event_date = event_date[:10]  # Garder seulement YYYY-MM-DD
        
        # Déterminer le slug de l'événement
        if event_name:
            event_slug = normalize_string(event_name)
            # Si on a un nom plus précis dans le titre, l'utiliser
            title = metadata.get('title', '')
            if title and len(title) > 5:
                event_slug = normalize_string(title)
        else:
            event_slug = normalize_string(metadata.get('title', name_no_ext))
        
        if not event_slug:
            event_slug = normalize_string(name_no_ext)
        if not event_slug:
            event_slug = 'evenement'
        
        # Créer le nom de fichier: YYYY-MM-DD-slug.md
        output_filename = f"{event_date}-{event_slug}.md"
        output_path = os.path.join(base_output_dir, 'evenements', output_filename)
        
        # Mettre à jour les métadonnées pour l'événement
        metadata['eventDate'] = event_date
        
        # Ajouter le type d'événement si détecté
        event_metadata = detect_event_metadata(filename, "")
        if event_metadata.get('eventType'):
            metadata['eventType'] = event_metadata['eventType']
        if event_metadata.get('discipline'):
            metadata['discipline'] = event_metadata['discipline']
        if event_metadata.get('date'):
            metadata['eventDate'] = event_metadata['date']
        
    elif content_type == 'entrainement':
        # Entraînements: date-slug.md dans entrainements/
        date_str = metadata.get('pubDate', f"{year}-01-01")
        slug = normalize_string(metadata.get('title', name_no_ext))
        if not slug:
            slug = normalize_string(name_no_ext)
        if not slug:
            slug = 'entrainement'
        
        output_filename = f"{date_str}-{slug}.md" if date_str.startswith(str(year)) else f"{year}-{slug}.md"
        output_path = os.path.join(base_output_dir, 'entrainements', output_filename)
        
    elif content_type == 'photo':
        # Photos: à ignorer ou traiter séparément
        slug = normalize_string(metadata.get('title', name_no_ext))
        if not slug:
            slug = normalize_string(name_no_ext)
        output_filename = f"{year}-{slug}.md" if slug else f"{year}-photos.md"
        output_path = os.path.join(base_output_dir, 'pages', output_filename)
    
    else:
        # Pages statiques
        slug = normalize_string(metadata.get('title', name_no_ext))
        if not slug:
            slug = normalize_string(filename)
        
        output_filename = f"{slug}.md"
        output_path = os.path.join(base_output_dir, 'pages', output_filename)
    
    return output_path, metadata


# ============================================================================
# FONCTION PRINCIPALE
# ============================================================================

def process_file(input_path, base_output_dir, dry_run=False, legacy_dir=None, assets_dir="src/assets-legacy"):
    """Traiter un fichier HTML et le convertir en Markdown"""
    try:
        # Vérifier si le fichier doit être ignoré
        filename = os.path.basename(input_path)
        should_skip, reason = should_skip_file(filename, input_path)
        if should_skip:
            print(f"⏭️  Ignoré: {input_path} ({reason})")
            return None
        
        # Vérifier l'année (2020-2026 seulement)
        year = extract_year_from_filepath(input_path)
        if year and year not in MIGRATION_YEARS:
            print(f"⏭️  Ignoré: {input_path} (hors plage 2020-2026: {year})")
            return None
        
        # Lire le fichier
        with open(input_path, 'r', encoding='utf-8', errors='replace') as f:
            html_content = f.read()
        
        # Parser le HTML
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Extraire les métadonnées
        metadata = extract_metadata_from_html(soup, input_path, html_content)
        
        # Détecter le type de contenu
        content_type = detect_content_type(input_path, html_content)
        
        # Ignorer les types resultat (OE12) et inscription qui n'ont pas été filtrés par should_skip_file
        if content_type in ['resultat', 'inscription']:
            print(f"⏭️  Ignoré: {input_path} (type: {content_type})")
            return None
        
        # Nettoyer le HTML
        clean_soup = clean_html(soup)
        
        # Convertir en Markdown
        markdown_content = convert_html_to_markdown(clean_soup)
        
        # Déterminer le chemin de sortie
        output_path, updated_metadata = determine_output_path(
            input_path, metadata, content_type, base_output_dir
        )
        
        # ====================================================================
        # NOUVEAU: Ajouter les liens vers les assets HTML (OE12, annonces, etc.)
        # ====================================================================
        html_assets = {
            'announcementHtml': None,
            'resultsHtml': [],
            'inscriptionsHtml': None,
        }
        
        if content_type in ['evenement', 'competition', 'resultat', 'inscription'] and legacy_dir:
            # Trouver les fichiers HTML associés
            html_assets = find_related_html_assets(input_path, legacy_dir, assets_dir)
            
            # Ajouter au frontmatter
            if html_assets['announcementHtml']:
                updated_metadata['announcementHtml'] = html_assets['announcementHtml']
            if html_assets['resultsHtml']:
                updated_metadata['resultsHtml'] = html_assets['resultsHtml']
            if html_assets['inscriptionsHtml']:
                updated_metadata['inscriptionsHtml'] = html_assets['inscriptionsHtml']
        
        # Créer les dossiers parents
        if not dry_run:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Ajouter des métadonnées spécifiques
        updated_metadata.update({
            'draft': True,  # Par défaut, brouillon pour révision
            'needsManualReview': True,
        })
        
        if dry_run:
            print(f"[DRY-RUN] {input_path} → {output_path}")
            print(f"  Type: {content_type}")
            print(f"  Titre: {updated_metadata.get('title', 'N/A')}")
            print(f"  Date: {updated_metadata.get('pubDate', 'N/A')}")
            if html_assets and html_assets.get('resultsHtml'):
                print(f"  Résultats HTML: {len(html_assets['resultsHtml'])} fichiers")
            return None
        
        # Créer le fichier Markdown avec frontmatter
        # Compatible avec frontmatter 3.x (pas de classe Post)
        post = {
            'metadata': updated_metadata,
            'content': markdown_content
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            # Écrire le frontmatter manuellement
            f.write('---\n')
            yaml.dump(updated_metadata, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
            f.write('---\n\n')
            f.write(markdown_content)
        
        print(f"✅ Converti: {input_path} → {output_path}")
        return output_path
        
    except Exception as e:
        print(f"❌ Erreur avec {input_path}: {e}")
        import traceback
        traceback.print_exc()
        return None


def main():
    parser = argparse.ArgumentParser(
        description='Convertir les fichiers HTML de l\'ancien site CDCO77 vers Markdown'
    )
    parser.add_argument(
        '--legacy-dir',
        default='src/content-legacy',
        help='Dossier source contenant les fichiers HTML legacy'
    )
    parser.add_argument(
        '--output',
        default='src/content',
        help='Dossier de sortie pour les fichiers Markdown'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Mode test sans écriture de fichiers'
    )
    parser.add_argument(
        '--limit',
        type=int,
        default=None,
        help='Limiter le nombre de fichiers à traiter (pour les tests)'
    )
    parser.add_argument(
        '--year',
        type=int,
        default=None,
        help='Traiter seulement une année spécifique'
    )
    
    args = parser.parse_args()
    
    # Vérifier que le dossier source existe
    if not os.path.isdir(args.legacy_dir):
        print(f"❌ Erreur: Le dossier source n'existe pas: {args.legacy_dir}")
        sys.exit(1)
    
    # Créer le dossier de sortie
    os.makedirs(args.output, exist_ok=True)
    
    # Trouver tous les fichiers HTML
    html_files = []
    for root, dirs, files in os.walk(args.legacy_dir):
        # Ignorer les dossiers système
        dirs[:] = [d for d in dirs if not d.startswith('_vti')]
        
        for file in files:
            if file.lower().endswith(('.html', '.htm')):
                full_path = os.path.join(root, file)
                
                # Filtrer par année si spécifié
                if args.year:
                    if str(args.year) in full_path:
                        html_files.append(full_path)
                else:
                    html_files.append(full_path)
    
    # Limiter le nombre de fichiers pour les tests
    if args.limit:
        html_files = html_files[:args.limit]
    
    print(f"🔍 Trouvé {len(html_files)} fichiers HTML à convertir")
    if args.year:
        print(f"   Filtre: année {args.year}")
    if args.limit:
        print(f"   Limite: {args.limit} fichiers")
    print("")
    
    # Traiter les fichiers
    success_count = 0
    error_count = 0
    
    # Déterminer le dossier assets (par défaut src/assets-legacy)
    assets_dir = os.path.join(os.path.dirname(args.legacy_dir), 'assets-legacy')
    if not os.path.isdir(assets_dir):
        assets_dir = 'src/assets-legacy'  # Fallback
    
    for i, html_file in enumerate(html_files, 1):
        print(f"[{i}/{len(html_files)}] Traitement: {os.path.relpath(html_file, args.legacy_dir)}")
        result = process_file(html_file, args.output, args.dry_run, args.legacy_dir, assets_dir)
        
        if result:
            success_count += 1
        else:
            error_count += 1
        
        print("")
    
    # Résumé
    print("=" * 60)
    print(f"✅ Conversion terminée")
    print(f"   Réussis: {success_count}")
    print(f"   Échecs: {error_count}")
    
    if args.dry_run:
        print("\n⚠️  Mode DRY-RUN: Aucun fichier n'a été écrit")
    else:
        print(f"\n📊 Fichiers générés dans: {args.output}")
    
    print("=" * 60)


if __name__ == '__main__':
    main()
