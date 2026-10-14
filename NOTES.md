# Notes de travail

## Reprise du blog cdco77.blogspot.com — état au 14/10/2026

### Fait

- Le blog compte **755 articles** (2012 → 2025). Blogger n'en renvoie que 150 par
  requête : il faut paginer avec `start-index`.
- Commit `b9fabfc` : photos ajoutées à 3 articles 2025 déjà présents (Etrechy,
  Antoine Derlot, Samois).
- Commit `c34226a` : **72 articles repris** par `scripts/importer-blog.mjs`
  - les 13 articles 2025 qui manquaient ;
  - les 59 articles plus anciens (2012 → 2021) qui contiennent des photos.
  - 102 photos copiées dans `public/images/<année>/blog-*.jpg` (1000 px max).
  - Chaque article a `legacyUrl` = adresse du blog : relancer le script ne crée
    pas de doublon.
- **Rien n'est poussé** (2 commits en attente).

### Photos perdues (8, introuvables même sur Internet Archive)

- 2013-04-15 « Paru sur 77SPORTSINFOS » : jos rora.jpg, philippe bardes.jpg
- 2013-04-27 Championnat régional des clubs : 3eme equipe balise 77, depart en masse, podiums
- 2015-04-22 Article paru dans la République : 042015 REPUBLIQUE-1.jpg (blogspot)
- 2015-12-08 Podiums O'VTT CD77 LD : 05dec2015 O VTT Chpts CD77 et LIFCO.JPG
- 2017-11-17 Résultats : 20171115_154025.jpg
- 2025 Antoine Derlot : Middle-Distance-1907 (404 sur lifco.fr)

### Décisions

- Les photos sont copiées sur le site, jamais liées depuis l'hébergeur d'origine
  (lifco.fr, cd77if.free.fr et 77sports-infos.com ont déjà perdu des fichiers).
- Secours : `https://web.archive.org/web/2016id_/<url>` (intégré au script).
- Node a besoin de `--use-system-ca` pour passer le proxy de l'entreprise.

### Reste à faire

1. **Classer les ~680 articles non repris.** Mesure faite (script, sans modèle) :

   | Type | Articles |
   |---|---|
   | Très courts, surtout des liens (souvent vers des résultats) | 346 |
   | Texte moyen (300–1500 caractères) | 263 |
   | Texte long | 67 |

   Le texte de tout le blog représente ~140 000 tokens. Idée retenue : ne faire
   lire par un petit modèle que les articles « moyens » et « longs » (~100 000
   tokens) pour décider lesquels reprendre.
2. **Pour les articles « liens »** : mesurer d'abord combien de liens marchent
   encore (cd77if.free.fr, lifco.fr…) avant de décider de les reprendre.
3. **Relire les articles importés** : titres déduits de la première ligne (7 « Article
   de Michel envoyé à la République… »), catégories devinées par mots-clés.
4. L'article « O'VTT 3 jours de Samois » (export précédent) a ses résultats collés
   bout à bout (« H12: … 3eH14: … ») ; le refaire avec le script corrigerait ça.
5. Éventuellement : un lien vers le blog depuis le site pour les années non reprises.

### Prochaine commande

Le flux du blog était dans un dossier temporaire de session : le retélécharger.

```powershell
foreach ($i in 1,151,301,451,601,751) {
  Invoke-WebRequest -UseBasicParsing "https://cdco77.blogspot.com/feeds/posts/default?alt=json&max-results=150&start-index=$i" -OutFile "$env:TEMP\blog\feed_$i.json"
}
```

```sh
# simulation (n'écrit rien) ; ajouter --ecrire pour créer les fichiers
node --use-system-ca scripts/importer-blog.mjs $TEMP/blog/feed_*.json --annee 2024
```

## Mises en forme inspirées de la CO — état au 14/10/2026

### Fait

- Mise en forme « Parcours de CO (carte) » (`?theme=parcours`) : l'accueil se
  court comme un circuit, un poste par section, avec une ligne de définition IOF
  et une photo de terrain au survol du symbole.
  Fichiers : `src/components/Parcours.astro`, `src/lib/symboles-iof.ts`, bloc
  « Parcours » de `src/styles/themes.css`, photos `public/images/parcours/`.
- La carte de fond est `public/local/bois-rond.jpg`, **exclue de Git**. Sans
  elle, le circuit se dessine sur un papier quadrillé de lignes de nord.

### Reste

- Choisir une carte de fond publiable (aperçu dégradé, ou carte imaginaire en SVG).
- Remplacer les photos provisoires (`attachements/CFO_*`) par des photos
  choisies pour chaque symbole.

### Idée retenue pour une prochaine session : « la carte vivante »

Plus de page qui défile : un plein écran de carte, les sections posées comme des
éléments du terrain ; passer d'une section à l'autre zoome ou dézoome la carte
(1/10 000 → 1/4 000). Points durs connus : téléphone, accessibilité, contenu
des bénévoles qui s'y range mal.
