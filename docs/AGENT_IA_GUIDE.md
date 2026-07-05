# 🤖 Guide pour l'Agent IA - Migration CDCO77

## 📋 Mission

**Objectif** : Récupérer le contenu depuis l'ancien site CDCO77 (2006-2026) et le préparer pour migration vers le nouveau système Astro.

**Responsabilité** : COPIER uniquement les fichiers, NE PAS les modifier ou les convertir.

---

## 🎯 Instructions Étape par Étape

### Étape 1 : Connexion au Serveur Ancien

```bash
# Méthode 1 : SSH (recommandé)
ssh utilisateur@ancien-serveur-cdco77.fr

# Méthode 2 : SCP
scp -r utilisateur@ancien-serveur-cdco77.fr:/chemin/vers/content/ ./content-legacy/

# Méthode 3 : FTP (si SSH non disponible)
lftp ftp://ancien-serveur-cdco77.fr
```

### Étape 2 : Localisation des Dossiers

**Rechercher les dossiers à copier :**

```bash
# Chercher les dossiers content/ ou attachements/
find /var/www/ -maxdepth 3 -type d \( -name "content" -o -name "attachements" \) 2>/dev/null

# Vérifier la présence des fichiers
ls -la /var/www/html/cdco77/content/ 2>/dev/null || \
ls -la /var/www/html/cdco77/attachements/ 2>/dev/null || \
ls -la /home/*/public_html/content/ 2>/dev/null
```

**Structure attendue :**
```
/ancien-site/
├── content/          # Contient les fichiers HTML (219 fichiers)
│   ├── 2021/
│   │   └── La77/
│   │       ├── la77news.htm
│   │       ├── la77accueil.htm
│   │       ├── resultats.htm
│   │       └── fichiers 2021/
│   │           ├── Resultats_La77_2021.htm
│   │           └── inscrits_2021.htm
│   ├── 2022/
│   │   └── ...
│   ├── 2023/
│   │   └── ...
│   └── 2024/
│       ├── La77/
│       │   ├── la77news.htm
│       │   ├── cadre_la77.htm
│       │   └── fichiers 2024/
│       │       └── ...
│       └── chts departementaux/
│           └── *.htm
│
└── assets/           # Contient les images et PDF (481 fichiers)
    ├── images/
    │   ├── 2021/
    │   │   └── La77/
    │   │       └── FLYER_2021.jpg
    │   └── logos/
    │       └── CDCO77_logo.png
    │
    └── documents/
        └── 2024/
            ├── annonces/
            │   └── annonce-la77-2024.pdf
            └── resultats/
                └── resultats-sprint-2024.pdf
```

> ⚠️ **Note** : L'ancien site utilise peut-être `attachements/` au lieu de `content/`. Vérifier les deux.

### Étape 3 : Préparation de la Copie

```bash
# Créer un point de montage temporaire (optionnel)
mkdir -p /tmp/cdco77-migration/{content,assets}

# Vérifier l'espace disque disponible
df -h /tmp
```

### Étape 4 : Exécution de la Copie

**Commande principale (à exécuter depuis le nouveau site) :**

```bash
# Se placer dans le projet Astro
cd /chemin/vers/Site_CO77

# Exécuter le script de migration
./scripts/migrate-from-legacy.sh /chemin/vers/ancien-site .
```

**Ou manuellement :**

```bash
# Copier le contenu (tous les fichiers HTML/HTM)
rsync -avz --progress --stats \
    --exclude="_vti_cnf/" \
    --exclude="*.tmp" \
    --exclude="Thumbs.db" \
    --exclude="desktop.ini" \
    /chemin/vers/ancien-site/content/ \
    ./src/content-legacy/

# Copier les assets (images, PDF, etc.)
rsync -avz --progress --stats \
    --exclude="_vti_cnf/" \
    --exclude="*.tmp" \
    --exclude="Thumbs.db" \
    /chemin/vers/ancien-site/assets/ \
    ./src/assets-legacy/
```

**Options rsync expliquées :**
- `-a` : Mode archive (préserve les permissions, dates, etc.)
- `-v` : Verbose
- `-z` : Compression pendant le transfert
- `--progress` : Affiche la progression
- `--stats` : Statistiques à la fin
- `--exclude` : Exclure les fichiers système

### Étape 5 : Vérification de la Copie

```bash
# Vérifier le nombre de fichiers copiés
echo "=== Vérification du contenu ==="
find ./src/content-legacy -name "*.html" -o -name "*.htm" | wc -l
echo "Fichiers HTML/HTM copiés"

echo ""
echo "=== Vérification des assets ==="
find ./src/assets-legacy \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" \) | wc -l
echo "Images copiées"

find ./src/assets-legacy -name "*.pdf" | wc -l
echo "PDF copiés"

# Vérifier la taille totale
echo ""
echo "=== Tailles ==="
du -sh ./src/content-legacy
du -sh ./src/assets-legacy
```

### Étape 6 : Génération du Rapport

Créer un fichier `MIGRATION_REPORT_<DATE>.md` avec le contenu suivant :

```markdown
# 📋 Rapport de Migration - {{DATE}}

## 📅 Informations Générales
- **Date de migration** : {{date et heure}}
- **Serveur source** : {{nom/ip du serveur}}
- **Chemin source** : {{/chemin/vers/ancien-site}}
- **Projet destination** : {{/chemin/vers/Site_CO77}}
- **Agent IA** : {{votre identifiant}}

## 📊 Statistiques

### Contenu (src/content-legacy/)
- **Fichiers totaux** : [nombre]
- **Fichiers HTML** : [nombre]
- **Fichiers HTM** : [nombre]
- **Taille totale** : [taille en Mo/Go]

### Assets (src/assets-legacy/)
- **Images (JPG/PNG/GIF)** : [nombre]
- **PDF** : [nombre]
- **Autres fichiers** : [nombre]
- **Taille totale** : [taille en Mo/Go]

## 🗂️ Structure Copiée

### Dossiers Contenu
```
src/content-legacy/
├── 2021/
│   └── La77/
│       ├── [fichiers...]
├── 2022/
│   └── [fichiers...]
├── 2023/
│   └── [fichiers...]
└── 2024/
    ├── La77/
    │   └── [fichiers...]
    └── chts departementaux/
        └── [fichiers...]
```

### Dossiers Assets
```
src/assets-legacy/
├── images/
│   ├── 2021/
│   │   └── La77/
│   │       └── [images...]
│   └── logos/
│       └── [logos...]
└── documents/
    └── [pdf...]
```

## ✅ Vérifications Effectuées

- [x] Tous les fichiers sont lisibles
- [x] La structure des dossiers est intacte
- [x] Aucun fichier système copié (_vti_cnf, Thumbs.db, etc.)
- [x] Les dates de modification sont préservées
- [x] La taille des fichiers correspond à l'original
- [ ] [Autres vérifications...]

## ⚠️ Problèmes Rencontrés

- [ ] Aucun
- [ ] [Décrire le problème 1]
- [ ] [Décrire le problème 2]

## 📝 Notes

[Ajouter toute information pertinente]

---
*Rapport généré automatiquement par l'Agent IA*
```

**Commande pour générer automatiquement :**

```bash
./scripts/migrate-from-legacy.sh /chemin/vers/ancien-site /chemin/vers/Site_CO77
```

Ce script génère automatiquement un rapport texte.

### Étape 7 : Notification à l'Administrateur

Envoyer un message avec les informations suivantes :

```
Sujet : [MIGRATION CDCO77] Contenu copié depuis l'ancien site

Bonjour,

J'ai effectué la migration des données depuis l'ancien site :

📊 STATISTIQUES :
- Fichiers HTML/HTM : X
- Images : Y
- PDF : Z
- Taille totale : W Mo/Go

📁 EMPLACEMENT :
- Contenu : ./src/content-legacy/
- Assets : ./src/assets-legacy/

📄 RAPPORT COMPLET :
MIGRATION_REPORT_<DATE>.txt

✅ VÉRIFICATIONS :
- Tous les fichiers sont lisibles
- Structure intacte
- Aucun fichier système

⚠️  PROCHAINES ÉTAPES :
L'administrateur doit exécuter :
  ./scripts/convert-html-to-md.py --legacy-dir src/content-legacy
  ./scripts/convert-oe12-results.py --legacy-dir src/content-legacy
  ./scripts/copy-assets.sh
  npm run build

Cordialement,
Agent IA
```

---

## ⚠️ Règles de Sécurité et Bonnes Pratiques

### ✅ À FAIRE

1. **Toujours vérifier** avant de copier :
   ```bash
   ls -la /chemin/source/
   df -h /destination/
   ```

2. **Utiliser rsync** avec les bonnes options :
   ```bash
   rsync -avz --progress --stats --exclude="_vti_cnf/"
   ```

3. **Générer un rapport** pour chaque migration

4. **Conserver les fichiers originaux** - Ne jamais modifier les sources

5. **Vérifier l'intégrité** après la copie :
   ```bash
   # Comparer le nombre de fichiers
   find /source/content -type f | wc -l
   find ./src/content-legacy -type f | wc -l
   ```

### ❌ À NE PAS FAIRE

1. **NE PAS** modifier les fichiers originaux
2. **NE PAS** supprimer de fichiers sur le serveur ancien
3. **NE PAS** exécuter les scripts de conversion (`convert-html-to-md.py`, etc.)
4. **NE PAS** déplacer ou renommer des fichiers
5. **NE PAS** créer de nouveaux dossiers dans la source
6. **NE PAS** exécuter `npm run build` ou d'autres commandes de build

### 🚨 En Cas de Problème

1. **Arrêter immédiatement** la copie
2. **Documenter** l'erreur exacte
3. **Ne pas tenter de corriger** seul
4. **Notifier l'administrateur** avec tous les détails

---

## 🛠️ Commandes Utiles

### Vérification de l'espace disque
```bash
df -h
du -sh /chemin/vers/dossier
```

### Comptage des fichiers
```bash
# Compter tous les fichiers
find /chemin/ -type f | wc -l

# Compter par extension
find /chemin/ -name "*.html" | wc -l
find /chemin/ -name "*.jpg" | wc -l
```

### Vérification des plus gros fichiers
```bash
find /chemin/ -type f -exec du -h {} + | sort -rh | head -10
```

### Test de connexion
```bash
# Tester SSH
ssh utilisateur@serveur "echo OK"

# Tester l'existence d'un fichier
ssh utilisateur@serveur "ls -la /chemin/vers/fichier.htm"
```

### Copie avec compression (pour les grosses quantités)
```bash
rsync -avz --compress /source/ /destination/
```

### Copie avec limitation de bande passante
```bash
rsync -avz --bwlimit=1000 /source/ /destination/
# Limite à 1000 Ko/s
```

---

## 📚 Référence Rapide

| Commande | Description |
|----------|-------------|
| `rsync -avz source/ dest/` | Copie récursive avec compression |
| `find . -name "*.html"` | Trouver tous les fichiers HTML |
| `df -h` | Vérifier l'espace disque |
| `du -sh dossier/` | Taille d'un dossier |
| `wc -l` | Compter les lignes (avec `find ... \| wc -l`) |

---

## 🎯 Objectifs de Qualité

Pour qu'une migration soit considérée comme réussie :

- ✅ **Complétude** : Tous les fichiers sont copiés
- ✅ **Intégrité** : Aucun fichier n'est corrompu
- ✅ **Structure** : L'arborescence est préservée
- ✅ **Métadonnées** : Les dates de modification sont conservées
- ✅ **Propreté** : Aucun fichier système (Thumbs.db, _vti_cnf, etc.)
- ✅ **Documentation** : Un rapport complet est généré

---

## 📞 Support

En cas de doute ou de problème :
1. Consulter ce guide
2. Vérifier les logs de copie (si erreur)
3. Contacter l'administrateur du site

**Ne pas hésiter à demander de l'aide !**

---

*Document version 1.0 - 20 juin 2026*
