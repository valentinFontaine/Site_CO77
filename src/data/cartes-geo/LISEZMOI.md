# Calage géographique des cartes

Un fichier JSON par carte, portant **le même nom que son fichier Markdown** dans
`src/content/cartes/` : `Sablons.md` ↔ `Sablons.json`.

Ces fichiers sont écrits par l'éditeur (`npm run carto`) et par lui seul. Ils
sont tenus à l'écart du frontmatter Markdown parce que Decap CMS réécrit
intégralement les fichiers qu'il enregistre et supprime les champs qu'il ne
connaît pas : un bénévole corrigeant une description effacerait le calage.

Les modifier à la main est possible mais réservé aux corrections ponctuelles ;
le format est validé au build par `src/content.config.ts`, un fichier incorrect
fait échouer le déploiement.

## Format

```json
{
  "feuille": { "sud": 48.3654, "ouest": 2.6428, "nord": 48.3905, "est": 2.6924 },
  "contour": [
    [48.3905, 2.6600],
    [48.3880, 2.6924],
    [48.3700, 2.6850],
    [48.3654, 2.6520]
  ],
  "rotation": 0,
  "source": "Rocher_des_Demoiselles.jpg",
  "caleLe": "2026-09-16"
}
```

| Champ | Rôle |
| :--- | :--- |
| `feuille` | Emprise de la feuille imprimée, marges comprises. Affichée au survol. |
| `contour` | Zone réellement cartographiée, en `[latitude, longitude]`. Affichée par défaut. Trois sommets minimum. |
| `rotation` | Quart de tour appliqué à l'image source : `0`, `90`, `180` ou `270`. |
| `source` | Fichier d'origine dans `cartes-sources/`, pour pouvoir régénérer les images. |
| `caleLe` | Date du calage. |

Les cartes sans fichier de calage restent affichées à l'ancienne, à partir du
champ `bounds` de leur frontmatter. Rien ne casse tant que la migration n'est
pas terminée.
