---
# Template pour les Résultats
# ========================
#
# Ce template définit la structure standard pour les fichiers de résultats.
# Les résultats sont généralement placés dans un sous-dossier 'resultats/' d'un événement.
#
# Exemple:
# src/content/evenements/2024-12-14-la77/resultats/par-categories.md
#
# Types de résultats:
# - par-categories: Résultats classés par catégorie d'âge
# - par-circuit: Résultats classés par circuit
# - temps-intermediaires: Temps intermédiaires (SIAC/SportIdent)
# - liste-inscrits: Liste des inscrits
# - classement-general: Classement général tous noms confondus

# --- CHAMPS OBLIGATOIRES ---
title: "REQUIS: Titre des résultats"
eventId: "REQUIS: YYYY-MM-DD-nom-evenement"  # Référence à l'événement parent
eventDate: "YYYY-MM-DD"  # Date de l'événement
resultType: "par-categories"  # Type de résultat (voir ci-dessus)

# --- CHAMPS RECOMMANDÉS ---
description: "Description des résultats (ex: Résultats par catégories pour La 77 2024)"
pubDate: "YYYY-MM-DDTHH:MM:SSZ"  # Date de publication des résultats

# --- CHAMPS OPTIONNELS ---

# Identifiant de l'événement
eventName: ""  # Nom de l'événement (si différent de eventId)

# Filtres
circuit: ""  # Circuit (A, B, C, etc.) - pour resultType: par-circuit
category: ""  # Catégorie (H21, D35, etc.) - pour resultType: par-categories

# Discipline
discipline: "CO"  # Valeurs: CO, Sprint, MD, LD, Trail-O

# Données
sourceFile: ""  # Nom du fichier source original (ex: Resultats_La77_2024.html)
oe12Generated: false  # true si généré par OE12 SportSoftware
needsManualReview: true  # true si vérification manuelle nécessaire

# Statistiques
totalParticipants: 0  # Nombre total de participants
podium: []  # Top 3 (voir format ci-dessous)
# Format podium:
#   - place: 1
#     name: "Jean DUPONT"
#     club: "CO77"
#     time: "45:32"

# Métadonnées de conversion
conversionDate: "YYYY-MM-DD"  # Date de conversion depuis le HTML
convertedBy: "script-name"  # Nom du script de conversion

# Auteur et statut
author: "CO77"
tags: []  # Ex: ["resultats", "la77", "2024", "par-categories"]
draft: false  # true pour les brouillons

# Référence à l'ancien site
legacyUrl: ""  # URL originale sur l'ancien site

# --- FIN DU FRONTMATTER ---
---

# Résultats - {{eventName ou eventId}} - {{eventDate}}

## 📋 {{eventName ou "Événement du " + eventDate}}

**Date** : {{eventDate}}  
**Type** : {{resultType}}  
**Discipline** : {{discipline}}  

{% if circuit %}
**Circuit** : {{circuit}}  
{% endif %}

{% if category %}
**Catégorie** : {{category}}  
{% endif %}

---

## 🏆 Podium

{% if podium and podium|length > 0 %}
| Place | Nom | Club | Temps |
|-------|-----|------|-------|
{% for p in podium %}
| {{p.place}} | {{p.name}} | {{p.club}} | {{p.time}} |
{% endfor %}
{% else %}
*Podium non disponible*
{% endif %}

---

## 📊 Résultats complets

{% if resultType == "par-categories" %}
### Classés par catégories
{% elif resultType == "par-circuit" %}
### Classés par circuit {{circuit}}
{% elif resultType == "temps-intermediaires" %}
### Temps intermédiaires
{% elif resultType == "liste-inscrits" %}
### Liste des inscrits
{% else %}
### Classement
{% endif %}

| Place | Nom | Né | S | No puce | Club | Catégorie | Temps | Écart |
|-------|-----|-----|---|----------|------|-----------|-------|-------|
| 1 | Jean DUPONT | 1985 | H | 1234567 | CO77 | H35 | 45:32 | - |
| 2 | Marie MARTIN | 1990 | F | 7654321 | BALISE 77 | D21 | 47:15 | +1:43 |
| 3 | Pierre DURAND | 1982 | H | 1122334 | O'ZONE 88 | H40 | 48:02 | +2:30 |

*[Remplacer avec les données réelles ou générer automatiquement depuis le fichier source]*

---

## 📈 Statistiques

- **Nombre de participants** : {{totalParticipants}}
- **Nombre de finissants** : [X]
- **Taux de finition** : [X]%

---

## 🔍 Informations techniques

- **Source** : {{sourceFile}}
- **Généré depuis** : {% if oe12Generated %}OE12 SportSoftware{% else %}Conversion manuelle{% endif %}
- **Date de conversion** : {{conversionDate}}
- **Revue manuelle nécessaire** : {% if needsManualReview %}✅ Oui{% else %}❌ Non{% endif %}

---

## 📌 Notes

[Ajouter ici les notes spécifiques à ces résultats]

- [ ] Résultats provisoires
- [ ] Résultats officiels
- [ ] À vérifier

---

{% if legacyUrl %}
**Source originale** : [Voir sur l'ancien site]({{legacyUrl}})
{% endif %}

*Publication : {{pubDate}}*
*Dernière mise à jour : {{updatedDate ou pubDate}}*
