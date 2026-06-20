---
# Template pour les Actualités
# =========================
# 
# Ce template définit la structure standard pour les articles dans la collection 'actualites'.
# Tous les champs du frontmatter sont optionnels sauf ceux marqués comme REQUIS.
#
# Utilisation:
# 1. Copier ce fichier sous un nouveau nom: YYYY-MM-DD-slug-descriptif.md
# 2. Remplir les champs du frontmatter
# 3. Écrire le contenu en Markdown
#
# Exemple de nom de fichier: 2024-12-15-annonce-la77-2024.md

# --- CHAMPS OBLIGATOIRES ---
title: "REQUIS: Titre de l'actualité (5-120 caractères)"

# --- CHAMPS RECOMMANDÉS ---
description: "Description courte pour les aperçus (max 300 caractères). Utilisée dans les listes et pour le SEO."
pubDate: "YYYY-MM-DDTHH:MM:SSZ"  # Date de publication au format ISO 8601. Ex: 2024-12-15T10:30:00Z

# --- CHAMPS OPTIONNELS ---

# Catégorie (choisir une seule)
# Valeurs possibles: annonces, resultats, conseils, vie-du-comite, photos, divers
category: "annonces"

# Auteur (par défaut: CO77)
author: "CO77"

# Tags (mots-clés pour le filtrage et la recherche)
# Exemples: ["la77", "inscriptions", "2024", "fontainebleau"]
tags: []

# Date de mise à jour (si différente de pubDate)
updatedDate: "YYYY-MM-DDTHH:MM:SSZ"

# Image principale (chemin relatif depuis src/assets/)
# Exemple: "../../assets/images/2024/la77/FLYER-2024.jpg"
heroImage: ""

# SEO
seoTitle: ""  # Titre optimisé pour le SEO (max 60 caractères)
seoDescription: ""  # Description optimisée pour le SEO (max 160 caractères)

# Mise en avant
featured: false  # true pour mettre en avant sur la page d'accueil

# Statut
draft: false  # true pour les brouillons (ne sera pas publié)

# Référence à l'ancien site (pour la traçabilité)
legacyUrl: ""  # URL complète de l'article original
legacyFile: ""  # Nom du fichier original (ex: la77news.htm)
legacyId: ""  # Identifiant unique dans l'ancien système

# --- FIN DU FRONTMATTER ---
---

# {{title}}

## Introduction

[Écrire ici un résumé de l'article en 1-2 paragraphes. Ce texte apparaîtra dans les aperçus.]

---

## Contenu principal

[Écrire ici le contenu principal de l'article.]

### Sous-sections

Utiliser des titres hiérarchiques pour structurer le contenu :
- `#` pour le titre principal (déjà présent)
- `##` pour les sections principales
- `###` pour les sous-sections
- `####` pour les sous-sous-sections

### Exemples de contenu

- **Texte en gras** : `**texte**` ou `__texte__`
- *Texte en italique* : `*texte*` ou `_texte_`
- ~~Texte barré~~ : `~~texte~~`
- [Lien](https://exemple.com) : `[texte](url)`
- ![][image.jpg](image.jpg) : `![alt text](chemin/vers/image.jpg)`

### Listes

#### Liste à puces:
```markdown
- Élément 1
- Élément 2
- Élément 3
```

#### Liste numérotée:
```markdown
1. Premier élément
2. Deuxième élément
3. Troisième élément
```

### Tableaux

```markdown
| En-tête 1 | En-tête 2 | En-tête 3 |
|-----------|-----------|-----------|
| Ligne 1   | Donnée 1  | Donnée 2  |
| Ligne 2   | Donnée 3  | Donnée 4  |
```

### Citations

> Texte cité.
> Peut s'étendre sur plusieurs lignes.

### Code

\`\`\`javascript
const exemple = "code";
\`\`\`

---

## Liens utiles

- [Texte du lien 1](url-1)
- [Texte du lien 2](url-2)
- [Télécharger le document](chemin/vers/document.pdf)

---

## Informations complémentaires

- **Date de publication** : {{pubDate}}
- **Auteur** : {{author}}
- **Catégorie** : {{category}}

{% if legacyUrl %}
- **Source originale** : [Voir sur l'ancien site]({{legacyUrl}})
{% endif %}

---

*Dernière mise à jour : {{updatedDate ou pubDate}}*
