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

## Étape 2 — Activer l'interface d'administration (~10 minutes)

L'interface d'administration utilise **Decap CMS** pour l'édition et
**DecapBridge** pour l'authentification par e-mail.

Pourquoi DecapBridge : c'est ce qui permet aux bénévoles de se connecter avec
leur adresse e-mail **sans avoir de compte GitHub**, tout en signant chaque
modification à leur nom. L'ancienne solution (Netlify Identity + Git Gateway)
est officiellement dépréciée par Netlify et n'est plus recommandée pour un
nouveau site.

1. Créer un compte sur https://decapbridge.com
2. **Create site**, en renseignant :
   - fournisseur Git : **GitHub**
   - dépôt : `valentinFontaine/Site_CO77`
   - branche : `main`
   - URL de connexion au CMS : `https://<nom-du-site>.netlify.app/admin/`
   - un jeton d'accès GitHub, généré depuis
     https://github.com/settings/tokens avec le droit `repo` **sur ce seul dépôt**
3. DecapBridge affiche alors un **identifiant de site**. Le recopier dans
   [`public/admin/config.yml`](../public/admin/config.yml), à la place de
   `IDENTIFIANT_DECAPBRIDGE` :

   ```yaml
   identity_url: https://auth.decapbridge.com/sites/VOTRE_IDENTIFIANT_ICI
   ```

4. Commiter et pousser cette modification. Netlify redéploie tout seul.
5. Depuis le tableau de bord DecapBridge, **inviter les bénévoles par e-mail**.
   Chacun reçoit un lien, choisit son mot de passe, et accède ensuite au CMS
   sur `https://<nom-du-site>.netlify.app/admin/`.

### Vérifier que tout fonctionne

1. Se connecter sur `/admin/` avec un compte invité.
2. Créer une actualité de test, la publier.
3. Vérifier dans l'historique GitHub que le commit porte bien le nom et
   l'adresse e-mail de la personne.
4. Attendre une à deux minutes : l'actualité doit apparaître sur le site.
5. Supprimer l'actualité de test depuis le CMS.

---

## Points de sécurité

- Le jeton GitHub confié à DecapBridge doit être limité au **seul dépôt du site**.
  S'il fuitait, il ne donnerait accès à rien d'autre.
- La page `/admin/` est marquée `noindex` : elle n'apparaîtra pas dans Google.
  Elle reste accessible à qui connaît l'adresse, mais la connexion est requise
  pour faire quoi que ce soit.
- Ne jamais commiter de mot de passe ni de jeton dans le dépôt.
