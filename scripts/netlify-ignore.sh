#!/usr/bin/env bash
#
# Décide si Netlify doit reconstruire le site, ou passer son tour.
#
# Appelé par la clé `ignore` de netlify.toml, avec une convention inversée :
#
#     code 0        -> build ANNULÉ
#     code non nul  -> build LANCÉ
#
# Chaque build consomme des minutes du forfait Netlify. Or beaucoup de commits ne
# changent rien au site publié : documentation, instructions pour les agents,
# outils locaux comme l'éditeur de cartes. Les reconstruire est une dépense pure.
#
# On ne construit donc que si le commit touche ce qui produit réellement le site.
# En cas de doute — variable absente, erreur git, premier déploiement — on
# construit : rater un déploiement coûte plus cher qu'un build inutile.

set -u

# Chemins dont dépend le site publié. Tout le reste peut changer librement.
CHEMINS=(
	src                   # pages, contenu, composants, schémas
	public                # images, scripts client, interface d'administration
	astro.config.mjs
	package.json
	package-lock.json
	netlify.toml
)

# Netlify fournit le commit du dernier build réussi. Absent au premier
# déploiement, ou après un vidage du cache : on construit.
if [ -z "${CACHED_COMMIT_REF:-}" ] || [ -z "${COMMIT_REF:-}" ]; then
	echo "Référence de commit absente : on construit par précaution."
	exit 1
fi

# `git diff --quiet` sort en 0 s'il n'y a AUCUNE différence, en 1 s'il y en a,
# et en 128 si une référence est inconnue (historique tronqué, force-push…).
git diff --quiet "$CACHED_COMMIT_REF" "$COMMIT_REF" -- "${CHEMINS[@]}"
CODE=$?

case "$CODE" in
	0)
		echo "Aucun changement dans ${CHEMINS[*]} : build inutile, on passe."
		exit 0
		;;
	1)
		echo "Le site a changé : on construit."
		exit 1
		;;
	*)
		echo "git diff a échoué (code $CODE) : on construit par précaution."
		exit 1
		;;
esac
