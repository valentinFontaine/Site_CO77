# Ajouter du contenu sur le site — guide pour les bénévoles

Aucune compétence technique n'est nécessaire. Tout se fait depuis une page web.

## Se connecter

1. Ouvrir **https://<adresse-du-site>/admin/**
2. Saisir son adresse e-mail et son mot de passe (reçus par invitation).

> Pas encore d'accès ? Demander une invitation à la personne qui gère le site.

## Publier une actualité

1. Dans la colonne de gauche, cliquer sur **Actualités**.
2. Cliquer sur **New une actualité** en haut à droite.
3. Remplir au minimum les champs marqués obligatoires :
   - **Titre** — entre 5 et 120 caractères
   - **Date de publication**
   - **Catégorie**
   - **Contenu** — le texte de l'article
4. Facultatif mais recommandé : le **Résumé** (affiché dans la liste des
   actualités) et une **Image principale**.
5. Cliquer sur **Publish** pour mettre l'article en ligne. Pour le garder de
   côté sans le publier, cocher **Brouillon** avant d'enregistrer.

Comptez **une à deux minutes** entre la publication et l'apparition sur le site :
le site se reconstruit automatiquement.

## Annoncer un événement

Même principe, dans **Événements**. Les champs obligatoires sont le **Titre**,
la **Date de l'événement**, la **Date de publication de l'annonce** et la
**Description complète**.

Les autres champs servent à enrichir la fiche : lieu, horaires, tarif, lien
d'inscription, coordonnées GPS, lien vers les résultats une fois la course
passée. On peut tous les laisser vides et revenir les compléter plus tard.

## Ajouter une carte

Dans **Cartes**. Trois champs sont obligatoires : le **Nom**, la **Description**
(une ou deux phrases, affichées en tête de fiche et dans les résultats de
recherche) et l'**Emprise géographique**.

L'emprise, ce sont **quatre nombres** qui délimitent le rectangle occupé par la
carte, à saisir **dans cet ordre** :

1. latitude du coin sud-ouest (par exemple `48.3744`)
2. longitude du coin sud-ouest (par exemple `2.5546`)
3. latitude du coin nord-est (par exemple `48.4190`)
4. longitude du coin nord-est (par exemple `2.6419`)

Pour les relever : ouvrir [geoportail.gouv.fr](https://www.geoportail.gouv.fr),
faire un clic droit sur le coin sud-ouest de la zone → **Adresse/Coordonnées du
lieu**, noter les deux nombres, puis recommencer sur le coin nord-est.

La carte apparaît alors comme un rectangle coloré sur la carte interactive, la
couleur dépendant du **Type de terrain**. La **Vignette** est facultative : c'est
une image de la carte qui vient se poser dans le rectangle. Sans elle, le
rectangle s'affiche quand même.

## Quelques repères

**La case « Brouillon »** — cochée, le contenu est enregistré mais **n'apparaît
pas sur le site**. Pratique pour préparer une annonce à l'avance.

**Les images** — utiliser le bouton d'un champ image, puis **Upload**. Pensez à
réduire le poids des photos avant de les envoyer (une photo de téléphone fait
souvent 5 Mo, ce qui ralentit le site ; 500 Ko suffisent largement).

**Un champ refusé en rouge** — le message indique le format attendu, par exemple
`HH:MM` pour une heure ou une adresse commençant par `https://` pour un lien.

**Se tromper n'est pas grave.** Chaque modification est enregistrée dans un
historique : on sait qui a fait quoi, et tout peut être rétabli.

## Ça ne marche pas ?

- **La page /admin/ ne s'ouvre pas** → vérifier l'adresse, elle doit bien se
  terminer par `/admin/` avec la barre oblique finale.
- **Le contenu publié n'apparaît pas après 5 minutes** → il est probable que la
  reconstruction du site ait échoué. Prévenir la personne qui gère le site.
- **Un doute avant de publier** → enregistrer en brouillon et demander une
  relecture, plutôt que de publier dans le doute.
