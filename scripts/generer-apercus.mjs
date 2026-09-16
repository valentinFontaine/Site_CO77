/*
 * Génère les aperçus publics des cartes à partir des originaux haute résolution.
 *
 *     node scripts/generer-apercus.mjs
 *
 * Les originaux sont lus dans `cartes-sources/`, qui est volontairement exclu de
 * Git : le dépôt est public, et un fichier commité y reste téléchargeable pour
 * toujours, même supprimé ensuite.
 *
 * Ce script produit deux images par carte dans `public/images/cartes/` :
 *
 *   <nom>-apercu.jpg   affiché sur la fiche de la carte
 *   <nom>-thumb.png    posé sur la carte interactive, si absent du dossier
 *
 * Le flou et la réduction sont appliqués ici, donc **inscrits dans les pixels**
 * du fichier publié. C'est la différence essentielle avec un flou CSS, qui se
 * contente de masquer à l'écran une image téléchargée intacte : un clic droit
 * suffit alors à récupérer l'original. Ici, l'image nette n'existe nulle part
 * sur le serveur.
 *
 * Le nom du fichier source doit correspondre à l'identifiant de la carte, c'est
 * à dire au nom de son fichier Markdown dans src/content/cartes/ :
 * `Rocher_des_Demoiselles.md` → `cartes-sources/Rocher_des_Demoiselles.jpg`.
 */

import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DOSSIER_SOURCE = 'cartes-sources';
const DOSSIER_PUBLIC = 'public/images/cartes';

// 1000 px de large pour une carte couvrant plusieurs kilomètres : un pixel
// représente déjà plusieurs mètres sur le terrain. Le flou achève de rendre les
// postes et les symboles illisibles, tout en laissant reconnaître la structure
// du terrain — forêt, clairières, bâti, chemins.
const LARGEUR_APERCU = 1000;
const FLOU = 4;
const QUALITE_JPEG = 72;

const LARGEUR_VIGNETTE = 300;

const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp']);

async function main() {
	await mkdir(DOSSIER_PUBLIC, { recursive: true });

	let fichiers;
	try {
		fichiers = await readdir(DOSSIER_SOURCE);
	} catch {
		console.error(`Dossier « ${DOSSIER_SOURCE} » introuvable. Y déposer les cartes originales.`);
		process.exitCode = 1;
		return;
	}

	const sources = fichiers.filter((f) => EXTENSIONS.has(path.extname(f).toLowerCase()));
	if (sources.length === 0) {
		console.log(`Aucune image dans « ${DOSSIER_SOURCE} ». Rien à faire.`);
		return;
	}

	const dejaPresents = new Set(await readdir(DOSSIER_PUBLIC));

	for (const fichier of sources) {
		const nom = path.basename(fichier, path.extname(fichier));
		const source = path.join(DOSSIER_SOURCE, fichier);
		const { width, height } = await sharp(source).metadata();

		const apercu = path.join(DOSSIER_PUBLIC, `${nom}-apercu.jpg`);
		await sharp(source)
			.resize({ width: LARGEUR_APERCU, withoutEnlargement: true })
			.blur(FLOU)
			.jpeg({ quality: QUALITE_JPEG, mozjpeg: true })
			.toFile(apercu);
		console.log(`${apercu}  (source ${width}×${height})`);

		// La vignette de la carte interactive est souvent fabriquée à la main, avec
		// un fond transparent épousant les limites de la carte. On ne l'écrase pas.
		const vignette = `${nom}-thumb.png`;
		if (dejaPresents.has(vignette)) {
			console.log(`${path.join(DOSSIER_PUBLIC, vignette)}  (conservée, faite à la main)`);
			continue;
		}
		await sharp(source)
			.resize({ width: LARGEUR_VIGNETTE, withoutEnlargement: true })
			.png({ compressionLevel: 9 })
			.toFile(path.join(DOSSIER_PUBLIC, vignette));
		console.log(`${path.join(DOSSIER_PUBLIC, vignette)}  (générée)`);
	}

	// Trace à destination des relecteurs : rappeler d'où viennent ces images.
	await writeFile(
		path.join(DOSSIER_PUBLIC, 'LISEZMOI.md'),
		[
			'# Aperçus des cartes',
			'',
			'Images générées par `node scripts/generer-apercus.mjs` à partir des',
			'originaux placés dans `cartes-sources/`, dossier exclu de Git.',
			'',
			'Les fichiers `-apercu.jpg` sont **volontairement floutés et réduits**.',
			'Ne jamais les remplacer par la carte nette : le dépôt est public.',
			'',
		].join('\n'),
		'utf8',
	);
}

await main();
