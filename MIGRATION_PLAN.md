# Plan de Migration : Ancien Site → Nouveau Système Astro

## 📋 Résumé Exécutif

**Objectif** : Migrer le contenu depuis 2020 (5 ans) depuis un ancien site HTML vers un nouveau système Astro avec Content Collections.

**Architecture simplifiée** :
- Un seul fichier .md par événement
- Les résultats OE12 gardés en HTML dans assets/
- Les .md lient vers les assets HTML/PDF

**Volume estimé** (2020-2026) : ~150-200 fichiers HTML + ~300-400 images + documents PDF

---

## 🗂️ Architecture Cible Simplifiée

### Structure des Contenus

```
src/content/
├── actualites/                    # News / Annonces
│   ├── 2024-12-15-annonce-la77.md
│   ├── 2024-12-01-inscriptions-ouvertes.md
│   └── 2024-12-20-resultats-championnat.md
│
└── evenements/                   # Compétitions
    ├── 2024-12-14-la77.md           # TOUT sur une page
    ├── 2024-06-03-championnats-departementaux.md
    └── 2024-05-25-chpt-sprint.md

src/assets/
├── images/
│   └── 2024/
│       ├── la77/FLYER-2024.jpg
│       └── championnats/flyer-sprint-2024.jpg
│
└── documents/
    └── 2024/
        ├── la77/
        │   ├── resultats/              # HTML OE12
        │   │   ├── Resultats_par_categories.html
        │   │   └── Temps_intermediaires.html
        │   └── annonce-la77-2024.pdf
        │
        └── championnat-sprint/
            ├── annonce.pdf
            └── resultats/Resultats_Sprint_2024.html
```

### Principes Clés
1. **Un fichier .md = Une page web**
2. **Résultats OE12 en HTML** (trop complexes à convertir)
3. **Les .md lient vers les assets** via frontmatter
4. **Structure plate** pour faciliter la maintenance

---

## 🎯 Mapping des Types de Contenu

| Ancien Site | Nouveau Système | Collection | Champs Obligatoires |
|-------------|----------------|------------|----------------------|
| `la77news.htm` | `actualites/YYYY-MM-DD-slug.md` | actualites | title, pubDate |
| `annonce.htm` | `evenements/YYYY-MM-DD-slug.md` | evenements | title, pubDate, eventDate |
| `Resultats*.html` | `assets/documents/YYYY/nom/resultats/*.html` | - | - |
| `inscrits*.html` | `assets/documents/YYYY/nom/inscrits.html` | - | - |
| `*.jpg, *.png` | `assets/images/YYYY/nom/*.{jpg,png}` | - | - |
| `*.pdf` | `assets/documents/YYYY/nom/*.pdf` | - | - |

---

## 📅 Plan de Migration (7-10 jours)

### Phase 1 : Préparation (1 jour)
- [x] Analyser le dossier `attachements/`
- [ ] Mettre à jour `src/content.config.ts`
- [ ] Créer les templates Markdown adaptés

### Phase 2 : Développement des Scripts (2-3 jours)
- [x] Adapter `convert-html-to-md.py` (sortie plate) ✅
- [x] Ajouter `should_skip_file()` pour ignorer OE12 et pages structurelles ✅
- [x] Ajouter `find_related_html_assets()` pour lier les assets HTML ✅
- [x] Filtrer pour 2020-2026 seulement ✅
- [x] Créer `requirements.txt` pour les dépendances Python ✅
- [ ] Créer `organize-assets.sh` (optionnel - copy-assets.sh existe déjà)
- [ ] Tester sur échantillon 2024

### Phase 3 : Migration des Contenus (2020-2026) (3-4 jours)
- Traiter année par année (2024 → 2020)
- Convertir HTML → MD
- Organiser les assets
- Valider avec `npm run build`

### Phase 4 : Finalisation (1-2 jours)
- Nettoyer les dossiers temporaires
- Vérifier tous les liens
- Générer la documentation finale

---

## 📊 Schémas Zod Simplifiés

### Base Schema
```typescript
const baseSchema = {
  title: z.string().min(5).max(120),           // OBLIGATOIRE
  description: z.string().max(300).optional(),
  pubDate: z.coerce.date(),                   // OBLIGATOIRE
  author: z.string().default("CO77"),
  tags: z.array(z.string().max(30)).optional(),
  draft: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
}
```

### Actualités Schema
```typescript
const actualites = defineCollection({
  loader: glob({ base: './src/content/actualites', pattern: '**/*.md' }),
  schema: ({ image }) => z.object({
    ...baseSchema,
    category: z.enum([
      'annonces', 'resultats', 'conseils', 
      'vie-du-comite', 'photos', 'divers'
    ]),
    heroImage: z.optional(image()),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
    legacyFile: z.string().optional(),
  }),
})
```

### Événements Schema
```typescript
const evenements = defineCollection({
  loader: glob({ base: './src/content/evenements', pattern: '**/*.md' }),
  schema: z.object({
    ...baseSchema,
    eventDate: z.coerce.date(),                // OBLIGATOIRE
    location: z.string().optional(),           // Optionnel comme demandé
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    gpsCoordinates: z.string().optional(),
    mapsLink: z.string().url().optional(),
    eventType: z.enum(['competition', 'entrainement', 'reunion', 'stage', 'autre']).optional(),
    discipline: z.enum(['CO', 'Sprint', 'MD', 'LD', 'Trail-O', 'Relais', 'Mixte']).optional(),
    organizer: z.string().optional().default("CO77"),
    price: z.string().max(100).optional(),
    registrationLink: z.string().url().optional(),
    registrationDeadline: z.coerce.date().optional(),
    inscriptionsOpen: z.boolean().optional(),
    eventCompleted: z.boolean().optional().default(false),
    // NOUVEAU: Liens vers les assets HTML/PDF
    announcementPdf: z.string().optional(),
    announcementHtml: z.string().optional(),
    resultsHtml: z.array(z.string()).optional(),
    inscriptionsHtml: z.string().optional(),
    legacyFile: z.string().optional(),
    legacyUrl: z.string().url().optional(),
  }),
})
```

---

## 📝 Templates Markdown

### Template Événement (simplifié)

```markdown
---
title: "Nom de l'événement"        # OBLIGATOIRE
eventDate: "YYYY-MM-DD"           # OBLIGATOIRE
pubDate: "YYYY-MM-DDTHH:MM:SSZ"   # OBLIGATOIRE

# Optionnels
description: ""
location: ""
eventType: "competition"
discipline: "CO"
organizer: "CO77"
price: "15€"
registrationLink: ""
announcementPdf: "../../assets/documents/2024/la77/annonce.pdf"
announcementHtml: "../../assets/documents/2024/la77/annonce.html"
resultsHtml: ["../../assets/documents/2024/la77/resultats/Resultats.html"]
tags: []
draft: false
---

# {{title}}

## Informations pratiques
| Date | Lieu | Discipline |
|------|------|------------|
| {{eventDate}} | {{location}} | {{discipline}} |

## Résultats
{% if resultsHtml and resultsHtml.length > 0 %}
**Résultats disponibles:**
{% for r in resultsHtml %}
- [{{r | basename}}]({{r}})
{% endfor %}
{% endif %}
```

---

## 🤖 Workflow Agent IA

```bash
# Étape 1: L'agent IA copie depuis l'ancien site
./scripts/migrate-from-legacy.sh /ancien-site .

# Étape 2: L'admin convertit
./scripts/convert-html-to-md.py --legacy-dir src/content-legacy
./scripts/organize-assets.sh --source src/assets-legacy

# Étape 3: Validation
npm run build
```

---

## ✅ Critères de Succès

- [ ] Tous les HTML (2020-2026) convertis en MD
- [ ] Tous les assets dans `src/assets/`
- [ ] Un fichier .md = une page
- [ ] Résultats OE12 en HTML, liés depuis .md
- [ ] `npm run build` sans erreurs
- [ ] Tous les liens fonctionnent

---

## 🎯 Prochaines Étapes

1. **Mettre à jour `src/content.config.ts`** avec les nouveaux schémas
2. **Adapter les templates** (un seul fichier par événement)
3. **Adapter les scripts** (pas de sous-dossiers)
4. **Tester sur 2024**

---

## ❓ Questions Restantes

- [ ] Les pages structurelles (`cadre_la77.htm`, `la77accueil.htm`) : ignorer ou convertir ?
- [ ] Les pages `resultats.htm` (liens) : ignorer ou convertir en actualités ?
- [ ] Confirmer la structure des assets : `documents/YYYY/nom-evenement/` ?

---

*Document mis à jour le 20 juin 2026 - Architecture simplifiée validée*
