---
# Template pour les Événements / Compétitions
# ============================================
#
# Un seul fichier .md par événement - TOUT sur une page
# Les résultats OE12 restent en HTML dans assets/documents/
# Ce fichier .md contient des liens vers ces assets
#
# Exemple: src/content/evenements/2024-12-14-la77.md

# --- CHAMPS OBLIGATOIRES ---
title: "REQUIS: Nom de l'événement (5-120 caractères)"
eventDate: "YYYY-MM-DD"  # Date principale de l'événement
eventDate: "2024-12-14"
pubDate: "YYYY-MM-DDTHH:MM:SSZ"  # Date de publication de l'annonce
pubDate: "2024-11-01T10:00:00Z"

# --- CHAMPS OPTIONNELS - Informations de base ---
description: "Description courte pour les aperçus (max 300 caractères)"
description: "16ème édition de la célèbre course d'orientation La 77"

# --- CHAMPS OPTIONNELS - Localisation ---
location: "Forêt de Fontainebleau"  # Optionnel comme demandé
gpsCoordinates: "48.443942,2.718337"  # Coordonnées GPS
mapsLink: "https://goo.gl/maps/example"  # Lien Google Maps

# --- CHAMPS OPTIONNELS - Type et discipline ---
eventType: "competition"  # competition|entrainement|reunion|stage|autre
discipline: "CO"  # CO|Sprint|MD|LD|Trail-O|Relais|Mixte

# --- CHAMPS OPTIONNELS - Organisation ---
organizer: "CO77"  # Nom du club ou comité organisateur

# --- CHAMPS OPTIONNELS - Tarifs et inscriptions ---
price: "15€"  # Ex: "15€", "Gratuit", "10€ (licenciés) / 15€ (non-licenciés)"
registrationLink: "https://inscriptions.cdco77.fr/la77-2024"  # URL du formulaire
registrationDeadline: "2024-12-10"  # Date limite d'inscription
inscriptionsOpen: true  # true si les inscriptions sont ouvertes
eventCompleted: false  # true si l'événement est terminé

# --- CHAMPS OPTIONNELS - Liens vers les assets HTML/PDF ---
# Ces champs permettent de lier vers les fichiers HTML OE12 et PDF dans assets/
# NOUVEAU: C'est la solution pour garder les résultats en HTML
announcementPdf: "../../assets/documents/2024/la77/annonce-la77-2024.pdf"
announcementHtml: "../../assets/documents/2024/la77/annonce-la77.html"
resultsHtml: [
  "../../assets/documents/2024/la77/resultats/Resultats_par_categories.html",
  "../../assets/documents/2024/la77/resultats/Temps_intermediaires.html"
]
inscriptionsHtml: "../../assets/documents/2024/la77/inscrits12dec2024.html"

# --- CHAMPS OPTIONNELS - Métadonnées ---
author: "CO77"
tags: ["la77", "competition", "2024", "fontainebleau"]
featured: false  # true pour mettre en avant sur la page d'accueil
draft: false  # true pour les brouillons (ne sera pas publié)

# --- CHAMPS OPTIONNELS - Référence à l'ancien site ---
legacyFile: "annonce-la77.htm"  # Nom du fichier original
legacyUrl: ""  # URL complète de l'article original

# --- FIN DU FRONTMATTER ---
---

# {{title}}

## 📅 Informations pratiques

| Information | Détails |
|-------------|---------|
| **Date** | {{eventDate}} |
| **Heure** | {{startTime ou "N/C"}} - {{endTime ou "N/C"}} |
| **Lieu** | {{location ou "À définir"}} |
| **Discipline** | {{discipline ou "CO"}} |
| **Type** | {{eventType ou "competition"}} |
| **Organisateur** | {{organizer}} |
| **Tarif** | {{price ou "Gratuit"}} |

---

## 📍 Accès

[Décrivez ici comment accéder au lieu de l'événement.]

### Itinéraire
- Depuis [point de référence], prendre [direction]
- Suivre [repères] pendant [distance]
- [Autres indications]

{% if gpsCoordinates %}
- **Coordonnées GPS** : {{gpsCoordinates}}
{% endif %}

{% if mapsLink %}
- [Voir sur Google Maps]({{mapsLink}})
{% endif %}

---

## 📝 Présentation

[Décrivez ici l'événement: objectif, public visé, particularités, historique, etc.]

### Catégories
[Liste des catégories si applicable]
- Tous niveaux
- Débutants bienvenus
- [etc.]

### Parcours
[Description des parcours disponibles]
- **Circuit A** : [distance] km, [dénivelé] m, [difficulté]
- **Circuit B** : [distance] km, [dénivelé] m, [difficulté]

---

## 🏁 Inscriptions

{% if inscriptionsOpen %}
**✅ Les inscriptions sont ouvertes !**

### Modalités
Inscriptions en ligne ou sur place selon disponibilités.

{% if registrationLink %}
### Lien d'inscription
[S'inscrire en ligne]({{registrationLink}})
{% endif %}

{% if registrationDeadline %}
### Date limite
**{{registrationDeadline}}**
{% endif %}

{% else %}
**❌ Les inscriptions sont fermées.**
{% endif %}

---

## 📄 Documents à télécharger

[Section pour lier vers les assets PDF/HTML]

{% if announcementPdf %}
- [📄 Télécharger l'annonce PDF]({{announcementPdf}})
{% endif %}

{% if announcementHtml %}
- [🌐 Voir l'annonce complète en ligne]({{announcementHtml}})
{% endif %}

---

## 🏆 Résultats

{% if eventCompleted %}
{% if resultsHtml and resultsHtml.length > 0 %}
**✅ Les résultats sont disponibles :**

{% for result in resultsHtml %}
- [📊 {{result | basename | replace: '_', ' ' | replace: '.html', ''}}]({{result}})
{% endfor %}

{% else %}
Les résultats seront publiés après l'événement.
{% endif %}
{% else %}
Les résultats seront disponibles après l'événement.
{% endif %}

---

## 📋 Liste des inscrits

{% if inscriptionsHtml %}
[Voir la liste des inscrits]({{inscriptionsHtml}})
{% endif %}

---

## 📞 Contacts

Pour plus d'informations :
- **Email** : [contact@cdco77.fr](mailto:contact@cdco77.fr)
- **Téléphone** : [numéro si disponible]
- **Site web** : [https://cdco77.fr](https://cdco77.fr)

---

## 📌 Notes importantes

[Ajouter ici les informations importantes spécifiques à cet événement]

- [ ] Apporter sa boussole
- [ ] Prévoir des vêtements adaptés à la météo
- [ ] Respecter les consignes de sécurité
- [ ] [Autre note]

---

{% if legacyUrl %}
**Source originale** : [Voir sur l'ancien site]({{legacyUrl}})
{% endif %}

*Publication : {{pubDate}}*
{% if updatedDate %}*Dernière mise à jour : {{updatedDate}}*{% endif %}
