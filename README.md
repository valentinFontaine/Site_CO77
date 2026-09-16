# Site du CDCO77

Site web du **Comité Départemental de Course d'Orientation de Seine-et-Marne**.

- **Technologie** : [Astro](https://astro.build) (générateur de site statique)
- **Hébergement** : Netlify
- **Adresse finale** : https://co77.fr (aujourd'hui : adresse de préproduction en `.netlify.app`)

## Démarrer en local

Prérequis : [Node.js](https://nodejs.org) **22.12 ou plus récent**.

```sh
npm install
npm run dev
```

Le site est alors visible sur http://localhost:4321

| Commande          | Effet                                            |
| :---------------- | :----------------------------------------------- |
| `npm install`     | Installe les dépendances                          |
| `npm run dev`     | Lance le site en local (rechargement automatique) |
| `npm run build`   | Génère le site dans `dist/`                       |
| `npm run preview` | Prévisualise le site généré                       |

> **En cas d'erreur bizarre au démarrage** (module introuvable, `astro` non reconnu) :
> supprimez le dossier `node_modules` puis relancez `npm install`. C'est un bug
> connu de npm sous Windows sur les dépendances natives.

## Où se trouve le contenu

Tout le contenu éditorial est en Markdown dans `src/content/`, réparti en collections :

| Dossier                    | Contenu                        | Adresse sur le site        |
| :------------------------- | :----------------------------- | :------------------------- |
| `src/content/actualites/`  | Actualités et annonces         | `/actualites`              |
| `src/content/evenements/`  | Compétitions et événements     | `/evenements`              |
| `src/content/entrainements/` | Entraînements                | `/missions-cd/entrainements` |
| `src/content/clubs/`       | Fiches des clubs               | `/la-co/les-clubs`         |
| `src/content/cartes/`      | Cartes de course d'orientation | `/cartographie`            |

Les champs autorisés en tête de chaque fichier (le « frontmatter ») sont définis et
validés dans [`src/content.config.ts`](src/content.config.ts). Si un champ obligatoire
manque ou qu'une valeur est invalide, **le build échoue** et Netlify ne met pas le
site à jour : c'est volontaire, cela évite de publier une page cassée.

### Brouillons

Un contenu avec `draft: true` dans son frontmatter est visible en local (`npm run dev`)
mais **n'est jamais publié** sur le site en ligne. Voir [`src/lib/collections.ts`](src/lib/collections.ts).

## Structure du projet

```text
├── public/              # fichiers servis tels quels (images, PDF, documents)
├── src/
│   ├── assets/          # images optimisées par Astro
│   ├── components/      # briques réutilisables (en-tête, pied de page…)
│   ├── content/         # LE CONTENU ÉDITORIAL (Markdown)
│   ├── layouts/         # gabarits de page
│   ├── lib/             # utilitaires partagés
│   ├── pages/           # une page = une adresse sur le site
│   └── styles/          # feuilles de style
├── attachements/        # archives de l'ancien site (non publiées)
├── astro.config.mjs     # configuration Astro
└── netlify.toml         # configuration du déploiement
```

## Déploiement

Chaque `git push` sur la branche `main` déclenche automatiquement un build et une
mise en ligne sur Netlify. Les paramètres de build sont dans [`netlify.toml`](netlify.toml)
— il n'y a rien à configurer dans l'interface Netlify.

## Licence

Voir [LICENSE](LICENSE).
