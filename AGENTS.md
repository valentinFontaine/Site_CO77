# Instructions pour les agents IA

Contexte et conventions de ce dépôt. À lire avant toute modification.

## Le projet

Site du **Comité Départemental de Course d'Orientation de Seine-et-Marne (CDCO77)**,
association de bénévoles. Il présente les clubs, annonce les compétitions et
entraînements, publie les résultats, et servira à terme à gérer les inscriptions
aux courses et la vente de cartes.

| | |
| :--- | :--- |
| Préproduction | https://co77.netlify.app |
| Production (à venir) | https://co77.fr |
| Interface d'administration | https://co77.netlify.app/admin/ |
| Dépôt | `valentinFontaine/Site_CO77`, branche `main` |
| Hébergement | Netlify — chaque push sur `main` redéploie automatiquement |

**Public cible des contributeurs** : des bénévoles non techniciens. Toute
évolution doit préserver leur capacité à publier du contenu sans passer par Git.

## Pile technique

Astro 6 en génération statique, contenu en Markdown via les Content Collections,
validation des frontmatter par Zod. Aucun framework front (pas de React ni Vue).
Node 22.12 minimum.

```sh
npm install     # installer
npm run dev     # http://localhost:4321
npm run build   # génère dist/
```

## Règles à respecter

**Toujours lancer `npm run build` avant de conclure.** Le build valide les
schémas de contenu : s'il échoue, Netlify ne déploie pas et le site reste figé
sur la version précédente. Un build vert est le seul critère de succès.

**Économiser les minutes de build Netlify.** Le forfait est limité et chaque
push sur `main` déclenche une reconstruction. Deux conséquences :

- **Tout se teste en local** (`npm run build`, `npm run dev`). Le déploiement
  n'est pas un banc d'essai.
- **Grouper les commits en un seul push.** Dix commits poussés ensemble coûtent
  un build ; poussés un par un, ils en coûtent dix.

`scripts/netlify-ignore.sh`, branché par la clé `ignore` de `netlify.toml`,
annule automatiquement les builds dont le commit ne touche pas au site publié
(documentation, outils locaux). Y ajouter tout nouveau chemin sans effet sur le
site. En cas de doute, le script construit : rater un déploiement coûte plus
cher qu'un build inutile.

Pour forcer l'ignorance d'un commit, écrire `[skip ci]` dans son message.

**Ne jamais casser le contrat avec le CMS.** Le fichier
[`public/admin/config.yml`](public/admin/config.yml) doit rester synchronisé avec
[`src/content.config.ts`](src/content.config.ts). Si un champ obligatoire est
ajouté au schéma Zod sans être ajouté au CMS, les bénévoles ne pourront plus
publier. Si un champ est ajouté au CMS sans exister dans le schéma, il sera
silencieusement ignoré.

**Les images se référencent par chemin public** (`/images/uploads/photo.jpg`),
jamais par le helper `image()` d'Astro : ce dernier exige un chemin relatif vers
`src/assets/`, que le CMS ne sait pas produire.

**Les champs facultatifs laissés vides arrivent en chaîne vide.** Le helper
`stripEmpty` dans `src/content.config.ts` les neutralise avant validation.
Ne pas le retirer : sans lui, un champ URL ou date laissé vide dans le CMS casse
le déploiement.

**Respecter `draft`.** Récupérer le contenu avec `getPublished()` de
[`src/lib/collections.ts`](src/lib/collections.ts), jamais avec `getCollection()`
directement : les brouillons doivent rester invisibles en production.

**Écrire en français** : interface, contenu, commentaires de code, messages de
commit. Le code lui-même (noms de variables, de fonctions) reste en anglais.

## Organisation

```
src/content/      le contenu éditorial en Markdown, une collection par dossier
src/content.config.ts   schémas Zod — la source de vérité des champs autorisés
src/lib/          utilitaires partagés
src/pages/        une page = une adresse sur le site
public/admin/     interface d'administration (Decap CMS)
public/images/    images servies telles quelles, dont uploads/ alimenté par le CMS
attachements/     archives brutes de l'ancien site — non publiées, ne pas modifier
scripts/          scripts de migration ponctuels — historiques, ne plus exécuter
openspec/         spécifications fonctionnelles
docs/             documentation d'exploitation
```

Collections : `actualites`, `evenements`, `entrainements`, `clubs`, `cartes`.

## Cartes : ne jamais publier une carte nette

Le dépôt est **public** et le site publie tout le contenu de `public/`. Un
fichier commité devient donc téléchargeable par n'importe qui, et reste dans
l'historique Git même après suppression. Les cartes de course d'orientation sont
vendues par leurs propriétaires : les originaux haute résolution ne doivent
jamais entrer dans le dépôt.

Le circuit est le suivant :

```
cartes-sources/           originaux nets — exclu de Git par .gitignore
        ↓  node scripts/generer-apercus.mjs
public/images/cartes/     aperçus réduits et floutés — publiés
```

**Le flou est appliqué à la génération, donc inscrit dans les pixels.** Ne jamais
le remplacer par un `filter: blur()` en CSS : le navigateur téléchargerait la
carte nette avant de la masquer, et un « enregistrer l'image sous » suffirait à
la récupérer. Un flou CSS n'est pas une protection.

Deux images par carte, distinctes :

- `<id>-thumb.png` — vignette posée sur la carte interactive, fond transparent
  épousant les limites de la carte, environ 300 px de large ; souvent fabriquée à
  la main, le script ne l'écrase pas si elle existe.
- `<id>-apercu.jpg` — illustration de la fiche, 1000 px et floutée.

## Pièges connus

**La carte interactive de `/cartographie/`** est pilotée par
[`public/scripts/map-init.js`](public/scripts/map-init.js), du JavaScript simple
chargé avec Leaflet depuis un CDN. Chaque carte est dessinée comme un rectangle
à partir de son champ `bounds` ; la vignette n'est qu'un décor superposé. Une
carte reste donc visible même sans vignette. Ne pas réintroduire de
dépendance à `thumbnail` pour l'affichage.

**Les fonds de plan IGN passent par `data.geopf.fr`.** L'ancien service
`wxs.ign.fr` a été fermé en 2024 et son domaine ne résout plus.

**`npm run build` échoue avec « astro non reconnu » ou un module introuvable** —
installation npm corrompue sous Windows (bug npm sur les dépendances natives de
rollup). Supprimer `node_modules` et relancer `npm install`.

**Git est configuré avec `core.autocrlf=true`.** Le [`.gitattributes`](.gitattributes)
protège les fichiers binaires ; ne pas le supprimer.

**La migration depuis l'ancien site est inachevée.** Certains contenus de
`src/content/` sont des coquilles vides marquées `draft: true` et
`needsManualReview: true`. Elles ne sont pas publiées. Ne pas les supprimer sans
validation : elles tracent ce qui reste à reprendre depuis `attachements/`.

## Reste à faire

- Finaliser la migration des contenus marqués `needsManualReview`
- Brancher le domaine `co77.fr`
- Réduire le poids des images héritées (certaines dépassent 2 Mo en 6000 px)
- Concevoir l'inscription aux courses et la vente de cartes — non commencé

## Documentation

- [docs/MISE_EN_LIGNE.md](docs/MISE_EN_LIGNE.md) — déploiement et administration
- [docs/GUIDE_CONTRIBUTEUR.md](docs/GUIDE_CONTRIBUTEUR.md) — mode d'emploi pour les bénévoles
- [MIGRATION_PLAN.md](MIGRATION_PLAN.md) — plan de reprise de l'ancien site
