# 📝 Templates Markdown pour CDCO77

Ce dossier contient les templates standardisés pour créer du contenu sur le site CDCO77.

## 🎯 Objectif

Ces templates permettent :
1. **Aux humains** de créer facilement du contenu bien structuré
2. **Aux LLM (IA)** de générer du contenu valide pour le site Astro
3. **À l'équipe** de maintenir une cohérence sur tout le site

## 📁 Structure

```
src/templates/
├── README.md              # Ce fichier
├── actualite.template.md  # Pour les actualités/news
├── competition.template.md # Pour les compétitions/événements
└── resultat.template.md   # Pour les fichiers de résultats
```

## 📖 Utilisation

### Pour les Humains

1. **Copier** le template approprié :
   ```bash
   cp src/templates/actualite.template.md src/content/actualites/YYYY-MM-DD-mon-article.md
   ```

2. **Remplir** les champs du frontmatter (métadonnées en haut du fichier)

3. **Écrire** le contenu en Markdown dans le corps du fichier

4. **Valider** avec Astro :
   ```bash
   npm run build
   ```

### Pour les LLM (IA)

**Prompt type pour générer du contenu :**

```
Tu es un assistant pour le site CDCO77 (Course d'Orientation).

**Consignes strictes :**
1. Utilise UNIQUEMENT le template fourni dans src/templates/
2. Respecte EXACTEMENT la structure du frontmatter
3. Utilise UNIQUEMENT les valeurs enum définies dans le template
4. Remplis TOUS les champs obligatoires (marqués REQUIS)
5. Génère du contenu en français
6. Utilise des dates au format ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)

**Exemple de tâches :**
- "Crée un article pour annoncer la La 77 2025"
- "Crée un fichier de résultats pour le championnat départemental 2024"

**Règles de nommage :**
- Actualités: YYYY-MM-DD-slug-descriptif.md
- Événements: YYYY-MM-DD-nom-evenement/index.md
- Résultats: dans evenements/YYYY-MM-DD-nom/resultats/type.md

**Valeurs acceptées :**
- category: annonces, resultats, conseils, vie-du-comite, photos, divers
- eventType: competition, entrainement, reunion, stage, autre
- discipline: CO, Sprint, MD, LD, Trail-O, Relais, Mixte
- resultType: par-categories, par-circuit, temps-intermediaires, liste-inscrits, classement-general
```

## 📋 Liste des Templates

### 1. `actualite.template.md`
**Utilisation** : Actualités, annonces, articles du blog

**Champs obligatoires** :
- `title` (5-120 caractères)

**Champs recommandés** :
- `description` (max 300 caractères)
- `pubDate` (format ISO 8601)

**Catégories disponibles** :
- `annonces` - Annonces générales
- `resultats` - Publication de résultats
- `conseils` - Conseils techniques
- `vie-du-comite` - Vie du comité
- `photos` - Galeries photos
- `divers` - Autres

**Exemple de fichier généré** :
```
src/content/actualites/2024-12-15-annonce-la77-2024.md
```

### 2. `competition.template.md`
**Utilisation** : Compétitions, événements, courses

**Champs obligatoires** :
- `title` (5-120 caractères)
- `eventDate` (format YYYY-MM-DD)
- `location` (lieu de l'événement)

**Champs recommandés** :
- `description` (max 300 caractères)
- `pubDate` (date de publication)
- `startTime`, `endTime` (horaires)
- `gpsCoordinates` (lat,lng)

**Types d'événements** :
- `competition` - Compétition officielle
- `entrainement` - Séance d'entraînement
- `reunion` - Réunion/Assemblée
- `stage` - Stage de formation
- `autre` - Autres

**Disciplines** :
- `CO` - Course d'Orientation classique
- `Sprint` - Sprint
- `MD` - Moyenne Distance
- `LD` - Longue Distance
- `Trail-O` - Trail-Orientation
- `Relais` - Relais
- `Mixte` - Mixte

**Structure recommandée** :
```
src/content/evenements/YYYY-MM-DD-nom-evenement/
├── index.md              # Principal (ce template)
├── annonce.md            # Optionnel: détails de l'annonce
└── resultats/
    ├── par-categories.md
    ├── par-circuit-a.md
    └── temps-intermediaires.md
```

### 3. `resultat.template.md`
**Utilisation** : Fichiers de résultats de compétitions

**Champs obligatoires** :
- `title` (titre des résultats)
- `eventId` (référence à l'événement parent, format: YYYY-MM-DD-nom)
- `eventDate` (date de l'événement)
- `resultType` (type de résultat)

**Types de résultats** :
- `par-categories` - Résultats par catégories d'âge
- `par-circuit` - Résultats par circuit (A, B, C...)
- `temps-intermediaires` - Temps intermédiaires (SIAC/SportIdent)
- `liste-inscrits` - Liste des inscrits
- `classement-general` - Classement général

**Exemple de fichier généré** :
```
src/content/evenements/2024-12-14-la77/resultats/par-categories.md
```

## 🔧 Intégration avec les Schémas Zod

Les templates sont conçus pour être compatibles avec les schémas définis dans `src/content.config.ts`.

**Correspondance :**

| Template | Collection | Schéma |
|----------|------------|--------|
| actualite.template.md | actualites | actualitesSchema |
| competition.template.md | evenements | evenementsSchema |
| resultat.template.md | evenements (sous-dossier) | resultatsSchema |

## 📝 Bonnes Pratiques

### Nommage des fichiers

1. **Actualités** : `YYYY-MM-DD-slug-descriptif.md`
   - Exemple: `2024-12-15-annonce-la77-2024.md`
   - Exemple: `2024-12-20-resultats-championnat-departemental.md`

2. **Événements** : `YYYY-MM-DD-nom-evenement/` (dossier)
   - Exemple: `2024-12-14-la77/`
   - Exemple: `2024-06-03-championnats-departementaux/`

3. **Résultats** : dans `evenements/YYYY-MM-DD-nom/resultats/`
   - Exemple: `2024-12-14-la77/resultats/par-categories.md`

### Contenu Markdown

- Utiliser des **titres hiérarchiques** (`#`, `##`, `###`)
- Privilégier les **listes** pour les informations structurées
- Utiliser des **tableaux** pour les données tabulaires (résultats, classements)
- Ajouter des **liens** vers les documents PDF et images
- Inclure des **métadonnées** complètes dans le frontmatter

### Validation

Toujours valider le contenu généré avec :
```bash
npm run build
```

## 🛠 Outils Utiles

### Génération de dates

```javascript
// Pour obtenir la date actuelle au format ISO 8601
new Date().toISOString()  // "2024-06-20T12:34:56.789Z"

// Pour un format plus simple
new Date().toISOString().split('T')[0]  // "2024-06-20"
```

### Normalisation de chaînes (pour les slugs)

```javascript
function normalizeSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // Garder alphanum, espaces, tirets
    .replace(/[\s]+/g, '-')         // Remplacer espaces par tirets
    .replace(/-+/g, '-')            // Supprimer tirets multiples
    .trim();                        // Supprimer tirets en début/fin
}

// Exemple
normalizeSlug("La 77 2024 - Résultats")  // "la-77-2024-resultats"
```

## 📚 Ressources

- [Documentation Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Syntaxe Markdown](https://www.markdownguide.org/)
- [Syntaxe YAML (Frontmatter)](https://yaml.org/)

## 🎨 Exemples Complets

### Exemple 1: Actualité

**Fichier** : `src/content/actualites/2024-12-15-annonce-la77-2024.md`

```markdown
---
title: "Annonce de la La 77 2024"
description: "Les inscriptions pour la La 77 2024 sont maintenant ouvertes"
pubDate: "2024-12-01T10:00:00Z"
category: "annonces"
author: "CO77"
tags: ["la77", "inscriptions", "2024"]
heroImage: "../../assets/images/2024/la77/FLYER-2024.jpg"
---

# Annonce de la La 77 2024

Les inscriptions pour la 16ème édition de la La 77 sont maintenant ouvertes !

## Informations pratiques

- **Date** : 14 décembre 2024
- **Lieu** : Forêt de Fontainebleau
- **Inscriptions** : [S'inscrire en ligne](https://inscriptions.cdco77.fr)

## Documents

- [Télécharger l'annonce complète](../../assets/documents/2024/annonce-la77-2024.pdf)
```

### Exemple 2: Compétition

**Fichier** : `src/content/evenements/2024-12-14-la77/index.md`

```markdown
---
title: "La 77 2024"
description: "16ème édition de la course d'orientation La 77"
pubDate: "2024-11-01T09:00:00Z"
eventDate: "2024-12-14"
startTime: "09:00"
endTime: "17:00"
location: "Forêt de Fontainebleau"
gpsCoordinates: "48.443942,2.718337"
mapsLink: "https://goo.gl/maps/example"
eventType: "competition"
discipline: "CO"
organizer: "CO77"
price: "15€ (licenciés) / 20€ (non-licenciés)"
registrationLink: "https://inscriptions.cdco77.fr/la77-2024"
announcementPdf: "../../assets/documents/2024/la77/annonce-2024.pdf"
hasResults: false
inscriptionsOpen: true
tags: ["la77", "competition", "2024"]
---

# La 77 2024

La 16ème édition de la célèbre course d'orientation La 77 !

## Présentation

La La 77 est une course d'orientation ouverte à tous les niveaux...

## Accès

Parking disponible à l'entrée de la forêt...

## Inscriptions

**Les inscriptions sont ouvertes jusqu'au 10 décembre 2024 !**

[S'inscrire maintenant](https://inscriptions.cdco77.fr/la77-2024)
```

### Exemple 3: Résultats

**Fichier** : `src/content/evenements/2024-12-14-la77/resultats/par-categories.md`

```markdown
---
title: "Résultats La 77 2024 - Par catégories"
description: "Résultats complets de la La 77 2024 classés par catégories"
pubDate: "2024-12-15T18:00:00Z"
eventId: "2024-12-14-la77"
eventName: "La 77 2024"
eventDate: "2024-12-14"
resultType: "par-categories"
discipline: "CO"
sourceFile: "Resultats_La77_2024.html"
oe12Generated: true
totalParticipants: 247
needsManualReview: false
tags: ["resultats", "la77", "2024", "par-categories"]
---

# Résultats La 77 2024 - Par catégories

## La 77 2024

**Date** : 14 décembre 2024  
**Type** : Résultats par catégories  
**Discipline** : Course d'Orientation

---

## Podium

| Place | Nom | Club | Temps |
|-------|-----|------|-------|
| 1 | Jean DUPONT | CO77 | 45:32 |
| 2 | Marie MARTIN | BALISE 77 | 47:15 |
| 3 | Pierre DURAND | O'ZONE 88 | 48:02 |

---

## Résultats complets

| Place | Nom | Né | S | Club | Catégorie | Temps |
|-------|-----|-----|---|------|-----------|-------|
| 1 | Jean DUPONT | 1985 | H | CO77 | H35 | 45:32 |
| 2 | Marie MARTIN | 1990 | F | BALISE 77 | D21 | 47:15 |

---

## Statistiques

- **Nombre de participants** : 247
- **Nombre de finissants** : 242
- **Taux de finition** : 98%
```

## ✅ Checklist avant publication

- [ ] Tous les champs obligatoires sont remplis
- [ ] Le frontmatter est valide (pas de virgules manquantes, etc.)
- [ ] Les liens sont corrects (chemins relatifs ou absolus)
- [ ] Les images référencées existent dans `src/assets/`
- [ ] Le contenu est relu et corrigé
- [ ] `npm run build` s'exécute sans erreurs

## 📞 Support

En cas de question sur les templates :
- Consulter ce README
- Vérifier les exemples ci-dessus
- Contacter l'administrateur du site

*Dernière mise à jour : 20 juin 2026*
