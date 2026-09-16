# Mise en ligne du site

Ce document décrit les étapes à réaliser **une seule fois** pour publier le site,
puis ouvrir l'interface d'administration aux bénévoles.

Tout ce qui pouvait être préparé dans le dépôt l'a déjà été :
[`netlify.toml`](../netlify.toml), [`public/admin/`](../public/admin/) et la
configuration Astro sont en place. Il ne reste que les actions qui exigent la
création de comptes.

---

## Étape 1 — Créer le site sur Netlify (~5 minutes)

1. Aller sur https://app.netlify.com et se connecter (« Log in with GitHub » est le
   plus simple, cela évite de gérer un mot de passe de plus).
2. **Add new site** → **Import an existing project** → **GitHub**.
3. Autoriser Netlify à accéder au dépôt **`valentinFontaine/Site_CO77`**
   (choisir « Only select repositories » et ne cocher que celui-ci).
4. L'écran de configuration du build se pré-remplit tout seul à partir de
   `netlify.toml`. **Ne rien modifier.** Vérifier simplement :
   - Branch to deploy : `main`
   - Build command : `npm run build`
   - Publish directory : `dist`
5. **Deploy site**. Le premier build prend environ deux minutes.
6. **Site configuration** → **Change site name** : choisir un nom lisible, par
   exemple `co77-preprod`. L'adresse de préproduction devient alors
   `https://co77-preprod.netlify.app` — c'est celle à envoyer aux collègues de
   l'association pour validation.

> À partir de là, **chaque `git push` sur `main` republie le site automatiquement.**

### Plus tard : brancher le domaine co77.fr

Quand la validation par l'association est faite : **Domain management** →
**Add a domain** → `co77.fr`, puis suivre les instructions de Netlify pour les
enregistrements DNS chez le registrar. Le certificat HTTPS est généré
automatiquement et gratuitement. Rien à changer dans le code : l'adresse du site
est lue depuis la variable d'environnement `URL` fournie par Netlify
(voir [`astro.config.mjs`](../astro.config.mjs)).

---

## Étape 2 — Activer l'interface d'administration ✅ configurée

L'interface utilise **Decap CMS** pour l'édition et **DecapBridge** pour
l'authentification.

Pourquoi DecapBridge : c'est ce qui permet aux bénévoles de se connecter avec
leur adresse e-mail — ou leur compte Google ou Microsoft — **sans compte
GitHub**, tout en signant chaque modification à leur nom. L'ancienne solution
(Netlify Identity + Git Gateway) est dépréciée par Netlify et déconseillée pour
un nouveau site.

Le site DecapBridge est créé et [`public/admin/config.yml`](../public/admin/config.yml)
est renseigné : mode d'authentification **PKCE**, dépôt et branche corrects.
Rien à modifier.

### Inviter les bénévoles

Depuis le tableau de bord DecapBridge, onglet des utilisateurs, inviter chaque
personne par son adresse e-mail. Elle reçoit un lien, choisit son mot de passe
(ou se connecte avec Google ou Microsoft), puis accède au CMS sur
https://co77.netlify.app/admin/

Leur transmettre [le guide du contributeur](GUIDE_CONTRIBUTEUR.md).

### Vérifier que tout fonctionne

1. Se connecter sur https://co77.netlify.app/admin/
2. Créer une actualité de test, la faire passer en **Ready** puis **Publish**.
3. Vérifier dans l'historique GitHub que le commit porte bien le nom de la
   personne qui a publié.
4. Attendre une à deux minutes : l'actualité doit apparaître sur le site.
5. Supprimer l'actualité de test depuis le CMS.

Si une publication échoue, la cause la plus probable est un contenu qui ne
respecte pas les schémas de [`src/content.config.ts`](../src/content.config.ts) :
le build Netlify échoue alors et le site reste sur sa version précédente. Le
journal de build sur Netlify indique le fichier et le champ en cause.

---

## Points de sécurité

- Le jeton GitHub confié à DecapBridge doit être limité au **seul dépôt du site**.
  S'il fuitait, il ne donnerait accès à rien d'autre.
- La page `/admin/` est marquée `noindex` : elle n'apparaîtra pas dans Google.
  Elle reste accessible à qui connaît l'adresse, mais la connexion est requise
  pour faire quoi que ce soit.
- Ne jamais commiter de mot de passe ni de jeton dans le dépôt.
