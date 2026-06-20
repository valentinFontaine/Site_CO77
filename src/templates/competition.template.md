---
# Template pour les Compétitions / Événements
# =======================================
#
# Ce template définit la structure standard pour les événements dans la collection 'evenements'.
# Utiliser un dossier par événement avec un fichier index.md.
#
# Structure recommandée:
# src/content/evenements/YYYY-MM-DD-nom-evenement/
#   ├── index.md          (ce template)
#   ├── annonce.md        (optionnel: détails de l'annonce)
#   └── resultats/        (optionnel: dossier pour les résultats)
#       ├── par-categories.md
#       ├── par-circuit-a.md
#       └── temps-intermediaires.md
#
# Exemple: src/content/evenements/2024-12-14-la77/index.md

# --- CHAMPS OBLIGATOIRES ---
title: "REQUIS: Nom de l'événement (5-120 caractères)"
eventDate: "YYYY-MM-DD"  # Date principale de l'événement
location: "REQUIS: Lieu de l'événement"  # Ex: "Forêt de Fontainebleau"

# --- CHAMPS RECOMMANDÉS ---
description: "Description courte pour les aperçus (max 300 caractères)"
pubDate: "YYYY-MM-DDTHH:MM:SSZ"  # Date de publication de l'annonce

# --- CHAMPS OPTIONNELS ---

# Dates et horaires
startTime: "HH:MM"  # Heure de début (ex: "09:00")
endTime: "HH:MM"  # Heure de fin (ex: "17:00")
registrationDeadline: "YYYY-MM-DD"  # Date limite d'inscription

# Localisation précise
gpsCoordinates: "lat,lng"  # Coordonnées GPS (ex: "48.443942,2.718337")
mapsLink: "https://goo.gl/maps/..."  # Lien Google Maps ou autre

# Type et discipline
eventType: "competition"  # Valeurs: competition, entrainement, reunion, stage, autre
discipline: "CO"  # Valeurs: CO, Sprint, MD, LD, Trail-O, Relais, Mixte

# Organisateur
organizer: "CO77"  # Nom du club ou comité organisateur

# Tarifs
price: ""  # Ex: "15€", "Gratuit", "10€ (licenciés) / 15€ (non-licenciés)"
priceDetails: ""  # Détails des tarifs par catégorie

# Inscriptions
registrationLink: ""  # URL du formulaire d'inscription
registrationInfo: ""  # Informations sur l'inscription (ex: "Sur place ou en ligne")
maxParticipants: 0  # Nombre maximum de participants

# Documents
announcementPdf: "../../assets/documents/YYYY/annonce-nom.pdf"  # Chemin vers l'annonce en PDF
reglementPdf: ""  # Chemin vers le règlement en PDF

# Résultats
hasResults: false  # true si les résultats sont disponibles
hasLiveResults: false  # true si résultats en direct
resultsLink: ""  # Lien vers une page externe de résultats
resultsFolder: "resultats"  # Dossier contenant les fichiers de résultats

# Statut
inscriptionsOpen: true  # true si les inscriptions sont ouvertes
eventCompleted: false  # true si l'événement est terminé
eventCancelled: false  # true si l'événement est annulé

# Auteur et métadonnées
author: "CO77"
tags: []  # Ex: ["la77", "championnat", "departemental", "2024"]
draft: false  # true pour les brouillons
featured: false  # true pour mettre en avant

# Référence à l'ancien site
legacyUrl: ""  # URL de l'événement sur l'ancien site
legacyFile: ""  # Nom du fichier original

# --- FIN DU FRONTMATTER ---
---

# {{title}}

## 📅 Informations pratiques

| Information | Détails |
|-------------|---------|
| **Date** | {{eventDate}} |
| **Heure** | {{startTime}} - {{endTime ou "N/C"}} |
| **Lieu** | {{location}} |
| **GPS** | {{gpsCoordinates ou "N/C"}} |
| **Discipline** | {{discipline}} |
| **Type** | {{eventType}} |
| **Organisateur** | {{organizer}} |
| **Tarif** | {{price ou "Gratuit"}} |

---

## 📍 Accès

[Décrivez ici comment accéder au lieu de l'événement.]

### Itinéraire
- Depuis [point de référence], prendre [direction]
- Suivre [repères] pendant [distance]
- [Autres indications]

### Parking
- [Informations sur le parking: gratuit/payant, nombre de places, etc.]
- Coordonnées GPS: {{gpsCoordinates}}

{% if mapsLink %}
- [Voir sur Google Maps]({{mapsLink}})
{% endif %}

---

## 📝 Présentation

[Décrivez ici l'événement: objectif, public visé, particularités, etc.]

### Catégories
{% if discipline == "CO" %}
- Tous niveaux
- Débutants bienvenus
{% endif %}

[Liste des catégories spécifiques si applicable]

### Parcours
[Description des parcours disponibles]
- **Circuit A**: [distance] km, [dénivelé] m
- **Circuit B**: [distance] km, [dénivelé] m
- [etc.]

---

## 🏁 Inscriptions

{% if inscriptionsOpen %}
**✅ Les inscriptions sont ouvertes !**

### Modalités
{{registrationInfo ou "Inscriptions en ligne ou sur place"}}

{% if registrationLink %}
### Lien d'inscription
[S'inscrire en ligne]({{registrationLink}})
{% endif %}

{% if registrationDeadline %}
### Date limite
**{{registrationDeadline}}**
{% endif %}

{% if maxParticipants %}
### Places disponibles
**{{maxParticipants}} places maximum**
{% endif %}

{% else %}
**❌ Les inscriptions sont fermées.**

{% if eventCompleted %}
L'événement est terminé.
{% else %}
Les inscriptions ouvriront prochainement.
{% endif %}
{% endif %}

{% if announcementPdf %}
### Documents
- [Télécharger l'annonce de course]({{announcementPdf}})
{% endif %}

---

## 🏆 Résultats

{% if eventCompleted %}
{% if hasResults %}
**Les résultats sont disponibles :**

[Voir les résultats](/evenements/{{resultsFolder}})

{% if resultsLink %}
- [Résultats externes]({{resultsLink}})
{% endif %}

{% else %}
Les résultats seront publiés après l'événement.
{% endif %}
{% else %}
Les résultats seront disponibles après l'événement.
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
- [ ] Prévoir des vêtements adaptés
- [ ] Respecter les consignes de sécurité

---

*Publication : {{pubDate}}*
*Dernière mise à jour : {{updatedDate ou pubDate}}*
