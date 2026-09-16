/*
 * Éditeur local de géoréférencement des cartes.
 *
 *     npm run carto
 *
 * Outil de bureau pour bénévoles, jamais déployé : il tourne en local, lit les
 * originaux haute résolution de `cartes-sources/` (exclu de Git) et écrit le
 * calage dans `src/data/cartes-geo/`, plus les images publiques dérivées.
 *
 * `node:http` nu, sans framework : une vingtaine de cartes seront calées au
 * total, jamais deux le même jour — pas besoin d'outillage plus lourd, et un
 * fichier sans dépendance est plus simple à auditer pour un outil qui écrit
 * dans le dépôt.
 *
 * N'écoute que sur 127.0.0.1 : jamais exposé au réseau, même par accident.
 */

import { createServer } from 'node:http';
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Node 24 exécute le TypeScript directement : pas de duplication des maths de
// projection, déjà écrites pour le site et pour cet éditeur dans ce même fichier.
const { contourEnPixels, emprise } = await import('../../src/lib/cartes-geometrie.ts');

const RACINE = path.resolve(import.meta.dirname, '../..');
const DOSSIER_EDITEUR = import.meta.dirname;
const DOSSIER_SOURCES = path.join(RACINE, 'cartes-sources');
const DOSSIER_PUBLIC_CARTES = path.join(RACINE, 'public/images/cartes');
const DOSSIER_CARTES_GEO = path.join(RACINE, 'src/data/cartes-geo');
const DOSSIER_CONTENU_CARTES = path.join(RACINE, 'src/content/cartes');

const PORT = 4330;
const HOTE = '127.0.0.1';

// Reprend les constantes de `scripts/generer-apercus.mjs`, qui produit les
// mêmes images à partir du même dossier source : même rendu, une seule vérité.
const LARGEUR_APERCU = 1000;
const FLOU_APERCU = 4;
const QUALITE_JPEG = 72;
const LARGEUR_VIGNETTE = 600;
const FLOU_VIGNETTE = 2;

// Largeur servie au navigateur pendant le calage : la pleine résolution (jusqu'à
// plusieurs milliers de pixels) ralentirait le chargement pour rien, l'oeil ne
// distinguant pas la différence à l'échelle de la carte affichée.
const LARGEUR_APERCU_EDITION = 2000;

const EXTENSIONS_IMAGE = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp']);
const ROTATIONS_VALIDES = new Set([0, 90, 180, 270]);

const TYPES_MIME = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
};

/** Un nom de fichier ne doit jamais pouvoir sortir de son dossier. */
function nomSurUnNiveau(nom) {
	return typeof nom === 'string' && nom.length > 0 && !nom.includes('..') && !nom.includes('/') && !nom.includes('\\');
}

function envoyerJson(reponse, statut, donnees) {
	const corps = JSON.stringify(donnees);
	reponse.writeHead(statut, {
		'Content-Type': 'application/json; charset=utf-8',
		'Content-Length': Buffer.byteLength(corps),
	});
	reponse.end(corps);
}

function envoyerErreur(reponse, statut, message) {
	envoyerJson(reponse, statut, { erreur: message });
}

async function lireCorpsJson(requete) {
	const morceaux = [];
	for await (const morceau of requete) morceaux.push(morceau);
	const brut = Buffer.concat(morceaux).toString('utf8');
	if (!brut) return {};
	return JSON.parse(brut);
}

/** Sert un fichier statique du dossier `assets/` de l'éditeur. */
async function servirAsset(reponse, nom) {
	if (!nomSurUnNiveau(nom)) return envoyerErreur(reponse, 400, 'Nom de fichier invalide');
	const chemin = path.join(DOSSIER_EDITEUR, 'assets', nom);
	try {
		const contenu = await readFile(chemin);
		const type = TYPES_MIME[path.extname(nom)] || 'application/octet-stream';
		reponse.writeHead(200, { 'Content-Type': type });
		reponse.end(contenu);
	} catch {
		envoyerErreur(reponse, 404, `Fichier introuvable : ${nom}`);
	}
}

/** GET /api/sources : liste des originaux disponibles, avec leurs dimensions. */
async function listerSources(reponse) {
	let fichiers;
	try {
		fichiers = await readdir(DOSSIER_SOURCES);
	} catch {
		return envoyerJson(reponse, 200, { sources: [], avertissement: `Dossier « cartes-sources » introuvable à ${DOSSIER_SOURCES}.` });
	}

	const images = fichiers.filter((f) => EXTENSIONS_IMAGE.has(path.extname(f).toLowerCase()));
	const sources = [];
	for (const nom of images) {
		try {
			const { width, height } = await sharp(path.join(DOSSIER_SOURCES, nom)).metadata();
			sources.push({ nom, largeur: width, hauteur: height });
		} catch (erreur) {
			console.warn(`Image illisible ignorée : ${nom} (${erreur.message})`);
		}
	}
	envoyerJson(reponse, 200, { sources });
}

/** GET /api/source/<nom>?rotation=N : l'image, pivotée et réduite pour le navigateur. */
async function servirSource(reponse, nom, rotationBrute) {
	if (!nomSurUnNiveau(nom)) return envoyerErreur(reponse, 400, 'Nom de fichier invalide');

	const rotation = Number(rotationBrute || 0);
	if (!ROTATIONS_VALIDES.has(rotation)) return envoyerErreur(reponse, 400, 'Rotation invalide : 0, 90, 180 ou 270 seulement');

	const chemin = path.join(DOSSIER_SOURCES, nom);
	try {
		await stat(chemin);
	} catch {
		return envoyerErreur(reponse, 404, `Source introuvable : ${nom}`);
	}

	try {
		const tampon = await sharp(chemin)
			.rotate(rotation) // rotation explicite : ne pas laisser sharp deviner depuis l'EXIF
			.resize({ width: LARGEUR_APERCU_EDITION, withoutEnlargement: true })
			.jpeg({ quality: 85 })
			.toBuffer();
		reponse.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store' });
		reponse.end(tampon);
	} catch (erreur) {
		envoyerErreur(reponse, 500, `Impossible de préparer l'image : ${erreur.message}`);
	}
}

/**
 * Construit un masque SVG (polygone blanc sur fond transparent) aux dimensions
 * d'une boîte de découpe, avec le contour translaté dans son repère.
 */
function svgMasque(largeur, hauteur, contourRelatif) {
	const points = contourRelatif.map(([x, y]) => `${x},${y}`).join(' ');
	return Buffer.from(
		`<svg width="${largeur}" height="${hauteur}" xmlns="http://www.w3.org/2000/svg">` +
			`<polygon points="${points}" fill="white" /></svg>`,
	);
}

/**
 * Boîte englobante en pixels, arrondie et bornée à l'image : le contour saisi à
 * la souris peut légèrement dépasser les bords par imprécision de clic.
 */
function boiteEnglobantePixels(contourPx, largeurImage, hauteurImage) {
	const xs = contourPx.map(([x]) => x);
	const ys = contourPx.map(([, y]) => y);
	const gauche = Math.max(0, Math.floor(Math.min(...xs)));
	const haut = Math.max(0, Math.floor(Math.min(...ys)));
	const droite = Math.min(largeurImage, Math.ceil(Math.max(...xs)));
	const bas = Math.min(hauteurImage, Math.ceil(Math.max(...ys)));
	return { gauche, haut, largeur: Math.max(1, droite - gauche), hauteur: Math.max(1, bas - haut) };
}

/** Valide le corps reçu par `/api/enregistrer` ; lève une erreur explicite sinon. */
function validerCalage(donnees) {
	const { id, feuille, contour, rotation, source } = donnees || {};

	if (!id || typeof id !== 'string' || !nomSurUnNiveau(id)) {
		throw new Error('Identifiant manquant ou invalide (pas de « .. » ni de séparateur de chemin)');
	}
	if (!feuille || ['sud', 'ouest', 'nord', 'est'].some((c) => typeof feuille[c] !== 'number')) {
		throw new Error('Emprise de la feuille incomplète');
	}
	if (feuille.nord <= feuille.sud || feuille.est <= feuille.ouest) {
		throw new Error('Emprise incohérente : le nord doit être au-dessus du sud, et l\'est à droite de l\'ouest');
	}
	if (!Array.isArray(contour) || contour.length < 3) {
		throw new Error('Le contour doit avoir au moins 3 sommets');
	}
	for (const point of contour) {
		if (!Array.isArray(point) || point.length !== 2 || point.some((n) => typeof n !== 'number' || Number.isNaN(n))) {
			throw new Error('Le contour contient un sommet invalide');
		}
	}
	if (!ROTATIONS_VALIDES.has(Number(rotation))) {
		throw new Error('Rotation invalide : 0, 90, 180 ou 270 seulement');
	}
	if (!source || !nomSurUnNiveau(source)) {
		throw new Error('Source manquante ou invalide');
	}
}

/** POST /api/enregistrer : écrit le calage et les images dérivées. */
async function enregistrerCalage(reponse, requete) {
	let donnees;
	try {
		donnees = await lireCorpsJson(requete);
	} catch {
		return envoyerErreur(reponse, 400, 'Corps JSON illisible');
	}

	try {
		validerCalage(donnees);
	} catch (erreur) {
		return envoyerErreur(reponse, 400, erreur.message);
	}

	const { id, titre, description, feuille, contour, rotation, source } = donnees;
	const cheminSource = path.join(DOSSIER_SOURCES, source);
	const cheminMd = path.join(DOSSIER_CONTENU_CARTES, `${id}.md`);

	// La fiche est-elle déjà là ? On le détermine avant tout travail, parce que la
	// réponse conditionne une validation : `title` et `description` sont
	// obligatoires dans le schéma des cartes, et une description vide est traitée
	// par le site comme « non renseigné ». La fiche générée ferait alors échouer le
	// build, donc bloquerait le déploiement — refuser tout de suite vaut mieux que
	// laisser derrière soi des images et un calage à moitié écrits.
	let mdExistait = true;
	try {
		await stat(cheminMd);
	} catch {
		mdExistait = false;
	}

	if (!mdExistait && (!titre?.trim() || !description?.trim())) {
		return envoyerErreur(
			reponse,
			400,
			'Titre et description sont obligatoires pour créer la fiche de la carte',
		);
	}

	let tamponOriginal;
	try {
		tamponOriginal = await readFile(cheminSource);
	} catch {
		return envoyerErreur(reponse, 404, `Source introuvable : ${source}`);
	}

	// Pivoté une fois, matérialisé en mémoire : toutes les opérations suivantes
	// (aperçu, découpe) partent de ce même repère pixel, celui que le contour a
	// été saisi sur (l'éditeur affiche l'image déjà pivotée).
	let tamponPivote, largeurImage, hauteurImage;
	try {
		tamponPivote = await sharp(tamponOriginal).rotate(Number(rotation)).toBuffer();
		({ width: largeurImage, height: hauteurImage } = await sharp(tamponPivote).metadata());
	} catch (erreur) {
		return envoyerErreur(reponse, 500, `Rotation de la source impossible : ${erreur.message}`);
	}

	await mkdir(DOSSIER_PUBLIC_CARTES, { recursive: true });
	await mkdir(DOSSIER_CARTES_GEO, { recursive: true });
	await mkdir(DOSSIER_CONTENU_CARTES, { recursive: true });

	const fichiersEcrits = [];
	const avertissements = [];

	// 1. Aperçu : la feuille entière, floutée et réduite — voir generer-apercus.mjs.
	const cheminApercu = path.join(DOSSIER_PUBLIC_CARTES, `${id}-apercu.jpg`);
	try {
		await sharp(tamponPivote)
			.resize({ width: LARGEUR_APERCU, withoutEnlargement: true })
			.blur(FLOU_APERCU)
			.jpeg({ quality: QUALITE_JPEG, mozjpeg: true })
			.toFile(cheminApercu);
		fichiersEcrits.push(path.relative(RACINE, cheminApercu));
	} catch (erreur) {
		return envoyerErreur(reponse, 500, `Génération de l'aperçu impossible : ${erreur.message}`);
	}

	// 2. Vignette : la zone technique détourée, fond transparent.
	const cheminVignette = path.join(DOSSIER_PUBLIC_CARTES, `${id}-thumb.png`);
	try {
		const contourPx = contourEnPixels(contour, feuille, largeurImage, hauteurImage);
		const boite = boiteEnglobantePixels(contourPx, largeurImage, hauteurImage);
		const contourRelatif = contourPx.map(([x, y]) => [x - boite.gauche, y - boite.haut]);
		const masque = svgMasque(boite.largeur, boite.hauteur, contourRelatif);

		// Découpe et masque d'abord, matérialisés en mémoire, puis réduction et flou
		// dans un second appel à sharp. En un seul pipeline, sharp réordonne les
		// opérations internement et exécute toujours `resize` avant `composite`,
		// quel que soit l'ordre d'écriture ici : le masque, taillé pour l'image
		// découpée en pleine résolution, se retrouvait alors plus grand que la
		// base déjà réduite, et sharp refusait de composer.
		// `.png()` est nécessaire ici : sans format explicite, sharp encoderait ce
		// tampon intermédiaire dans le format de la source (JPEG), qui ne sait pas
		// porter de canal alpha — la transparence composée juste avant serait
		// perdue silencieusement.
		const decoupeMasquee = await sharp(tamponPivote)
			.extract({ left: boite.gauche, top: boite.haut, width: boite.largeur, height: boite.hauteur })
			.ensureAlpha()
			.composite([{ input: masque, blend: 'dest-in' }])
			.png()
			.toBuffer();

		await sharp(decoupeMasquee)
			.resize({ width: LARGEUR_VIGNETTE, withoutEnlargement: true })
			.blur(FLOU_VIGNETTE)
			.png()
			.toFile(cheminVignette);
		fichiersEcrits.push(path.relative(RACINE, cheminVignette));
	} catch (erreur) {
		return envoyerErreur(reponse, 500, `Génération de la vignette impossible : ${erreur.message}`);
	}

	// 3. Calage géographique : toujours écrasé, c'est le seul auteur de ce fichier.
	const cheminJson = path.join(DOSSIER_CARTES_GEO, `${id}.json`);
	const aujourdhui = new Date().toISOString().slice(0, 10);
	const calage = {
		feuille,
		contour,
		rotation: Number(rotation),
		source,
		caleLe: aujourdhui,
	};
	try {
		await writeFile(cheminJson, JSON.stringify(calage, null, 2) + '\n', 'utf8');
		fichiersEcrits.push(path.relative(RACINE, cheminJson));
	} catch (erreur) {
		return envoyerErreur(reponse, 500, `Écriture du calage impossible : ${erreur.message}`);
	}

	// 4. Fiche Markdown : seulement si elle n'existe pas déjà — elle peut porter du
	// texte saisi par un bénévole via le CMS, que cet éditeur n'a pas à écraser.
	if (!mdExistait) {
		const [[latSud, lngOuest], [latNord, lngEst]] = emprise(contour);
		const frontmatter = [
			'---',
			`title: "${(titre || id).replace(/"/g, '\\"')}"`,
			`description: "${(description || '').replace(/"/g, '\\"')}"`,
			`thumbnail: "/images/cartes/${id}-thumb.png"`,
			`imagePath: "/images/cartes/${id}-apercu.jpg"`,
			`bounds: [${latSud}, ${lngOuest}, ${latNord}, ${lngEst}]`,
			`pubDate: "${aujourdhui}"`,
			'---',
			'',
			description || '',
			'',
		].join('\n');
		try {
			await writeFile(cheminMd, frontmatter, 'utf8');
			fichiersEcrits.push(path.relative(RACINE, cheminMd));
		} catch (erreur) {
			return envoyerErreur(reponse, 500, `Écriture de la fiche impossible : ${erreur.message}`);
		}
	} else {
		avertissements.push(`Fiche « ${path.relative(RACINE, cheminMd)} » déjà existante, non modifiée (texte du CMS préservé).`);
	}

	envoyerJson(reponse, 200, { fichiersEcrits, avertissements });
}

const serveur = createServer(async (requete, reponse) => {
	try {
		const url = new URL(requete.url, `http://${HOTE}:${PORT}`);

		if (requete.method === 'GET' && url.pathname === '/') {
			const contenu = await readFile(path.join(DOSSIER_EDITEUR, 'editeur.html'));
			reponse.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
			return reponse.end(contenu);
		}

		if (requete.method === 'GET' && url.pathname.startsWith('/assets/')) {
			return await servirAsset(reponse, url.pathname.slice('/assets/'.length));
		}

		if (requete.method === 'GET' && url.pathname === '/api/sources') {
			return await listerSources(reponse);
		}

		if (requete.method === 'GET' && url.pathname.startsWith('/api/source/')) {
			const nom = decodeURIComponent(url.pathname.slice('/api/source/'.length));
			return await servirSource(reponse, nom, url.searchParams.get('rotation'));
		}

		if (requete.method === 'POST' && url.pathname === '/api/enregistrer') {
			return await enregistrerCalage(reponse, requete);
		}

		envoyerErreur(reponse, 404, 'Route inconnue');
	} catch (erreur) {
		console.error(erreur);
		envoyerErreur(reponse, 500, `Erreur interne : ${erreur.message}`);
	}
});

serveur.listen(PORT, HOTE, () => {
	console.log(`Éditeur de cartes : http://${HOTE}:${PORT}/`);
});
