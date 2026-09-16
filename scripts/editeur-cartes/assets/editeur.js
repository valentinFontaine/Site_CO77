/*
 * Logique de l'éditeur de calage. Aucune dépendance en dehors de Leaflet
 * (chargé par editeur.html depuis unpkg, même version que le site).
 *
 * Duplication volontaire et limitée : `src/lib/cartes-geometrie.ts` est la
 * source de vérité pour ce que le serveur écrit sur disque (importé tel quel
 * dans serveur.mjs, Node 24 lisant le TypeScript nativement). Un navigateur ne
 * peut pas exécuter ce fichier .ts sans étape de compilation, qu'on a voulu
 * éviter ici pour ne rien ajouter au projet. Les quelques fonctions de
 * projection ci-dessous ne servent qu'à l'interaction en direct (glisser,
 * redimensionner) ; le calage effectivement enregistré est recalculé et
 * validé côté serveur à partir des mêmes formules.
 */

function mercatorY(latitude) {
	const phi = (latitude * Math.PI) / 180;
	return Math.log(Math.tan(Math.PI / 4 + phi / 2));
}

function latitudeDepuisMercator(y) {
	return ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI;
}

/**
 * Abscisse de Mercator : la longitude, en radians.
 *
 * Sans cette conversion, on compare des degrés à une ordonnée de Mercator et le
 * rapport sort faux d'un facteur 180/π — l'image se pose en ruban vertical.
 * Doit rester identique à `mercatorX` de src/lib/cartes-geometrie.ts.
 */
function mercatorX(longitude) {
	return (longitude * Math.PI) / 180;
}

/** Calcule le sud de la feuille pour que nord/ouest/est donnés respectent le rapport largeur/hauteur de l'image. */
function calerSud(nord, ouest, est, rapport) {
	const haut = mercatorY(nord);
	const bas = haut - (mercatorX(est) - mercatorX(ouest)) / rapport;
	return latitudeDepuisMercator(bas);
}

// ---------------------------------------------------------------------------
// État
// ---------------------------------------------------------------------------

let sourcesDisponibles = [];
let sourceActuelle = null; // { nom, largeurOriginale, hauteurOriginale }
let rotation = 0;
let feuille = null; // { sud, ouest, nord, est }
let overlay = null;
let poigneeRedim = null;
let poigneeDeplacement = null;
let contour = []; // [ [lat, lng], ... ]
let marqueursContour = [];
let polygoneContour = null;
let modeTrace = false;

const carte = L.map('carte', { scrollWheelZoom: true }).setView([48.55, 2.85], 10);

// Le conteneur est dimensionné par un `flex: 1` que le navigateur ne résout
// qu'après la mise en page. Leaflet, initialisé avant, ne voyait qu'une case de
// 256 px et ne chargeait qu'une poignée de tuiles au milieu d'une zone grise.
// On lui fait reprendre la mesure une fois la mise en page faite, puis à chaque
// redimensionnement de la fenêtre.
requestAnimationFrame(() => carte.invalidateSize());
window.addEventListener('resize', () => carte.invalidateSize());

const ignPlan = L.tileLayer(
	'https://data.geopf.fr/wmts?layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&style=normal&tilematrixset=PM' +
		'&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng' +
		'&TileMatrix={z}&TileCol={x}&TileRow={y}',
	{ attribution: '&copy; IGN', maxZoom: 19 },
).addTo(carte);

const ignPhoto = L.tileLayer(
	'https://data.geopf.fr/wmts?layer=ORTHOIMAGERY.ORTHOPHOTOS&style=normal&tilematrixset=PM' +
		'&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg' +
		'&TileMatrix={z}&TileCol={x}&TileRow={y}',
	{ attribution: '&copy; IGN', maxZoom: 19 },
);

L.control.layers({ 'IGN Plan': ignPlan, 'Photos aériennes': ignPhoto }).addTo(carte);

// ---------------------------------------------------------------------------
// Éléments du panneau
// ---------------------------------------------------------------------------

const elSource = document.getElementById('source');
const elInfoSource = document.getElementById('infoSource');
const elOpacite = document.getElementById('opacite');
const elValeurOpacite = document.getElementById('valeurOpacite');
const elRotationActuelle = document.getElementById('rotationActuelle');
const elInfoContour = document.getElementById('infoContour');
const elId = document.getElementById('id');
const elTitre = document.getElementById('titre');
const elDescription = document.getElementById('description');
const elMessages = document.getElementById('messages');
const boutonEnregistrer = document.getElementById('enregistrer');
const boutonTracer = document.getElementById('tracer');

function afficherMessage(texte, type) {
	elMessages.textContent = texte;
	elMessages.className = type || '';
}

function majEtatBoutonEnregistrer() {
	// Le titre et la description sont exigés parce qu'ils sont obligatoires dans le
	// schéma des cartes (`src/content.config.ts`). Une description vide serait
	// enregistrée en chaîne vide, que le site traite comme « non renseigné » : le
	// champ obligatoire manquerait, le build échouerait et le déploiement serait
	// bloqué — sans que l'erreur pointe vers cet éditeur.
	boutonEnregistrer.disabled =
		contour.length < 3 ||
		elId.value.trim() === '' ||
		elTitre.value.trim() === '' ||
		elDescription.value.trim() === '' ||
		!sourceActuelle;
}

// ---------------------------------------------------------------------------
// 1. Chargement de la liste des sources
// ---------------------------------------------------------------------------

async function chargerSources() {
	const reponse = await fetch('/api/sources');
	const donnees = await reponse.json();
	sourcesDisponibles = donnees.sources || [];

	if (donnees.avertissement) afficherMessage(donnees.avertissement, 'erreur');

	for (const source of sourcesDisponibles) {
		const option = document.createElement('option');
		option.value = source.nom;
		option.textContent = `${source.nom} (${source.largeur}×${source.hauteur})`;
		elSource.appendChild(option);
	}
}

elSource.addEventListener('change', () => {
	if (!elSource.value) return;
	const source = sourcesDisponibles.find((s) => s.nom === elSource.value);
	if (!source) return;

	sourceActuelle = { nom: source.nom, largeurOriginale: source.largeur, hauteurOriginale: source.hauteur };
	rotation = 0;
	feuille = null; // repositionner au centre de la vue actuelle
	elRotationActuelle.textContent = '0°';

	// Identifiant prérempli depuis le nom de fichier, en minuscules, éditable.
	const nomSansExtension = source.nom.replace(/\.[^.]+$/, '');
	elId.value = nomSansExtension.toLowerCase();
	elTitre.value = nomSansExtension.replace(/_/g, ' ');

	chargerImageSource();
});

function largeurHauteurAffichees() {
	// Après un quart de tour, largeur et hauteur de l'image affichée sont échangées.
	const impair = rotation === 90 || rotation === 270;
	return impair
		? { largeur: sourceActuelle.hauteurOriginale, hauteur: sourceActuelle.largeurOriginale }
		: { largeur: sourceActuelle.largeurOriginale, hauteur: sourceActuelle.hauteurOriginale };
}

async function chargerImageSource() {
	if (!sourceActuelle) return;

	const url = `/api/source/${encodeURIComponent(sourceActuelle.nom)}?rotation=${rotation}`;
	const { largeur, hauteur } = largeurHauteurAffichees();
	const rapport = largeur / hauteur;

	if (!feuille) {
		// Première pose : un rectangle raisonnable centré sur la vue actuelle.
		const vue = carte.getBounds();
		const centre = carte.getCenter();
		// Repli à environ 4 km si la vue n'a pas encore de dimensions exploitables
		// (fenêtre pas encore dessinée, onglet en arrière-plan). Sans ce garde-fou,
		// l'emprise est nulle et l'image se pose en 0 × 0 : invisible, sans erreur.
		const largeurVue = vue.getEast() - vue.getWest();
		const largeurDeg = largeurVue > 1e-6 ? largeurVue * 0.5 : 0.05;
		const ouest = centre.lng - largeurDeg / 2;
		const est = centre.lng + largeurDeg / 2;

		// Hauteur calculée dans le plan de Mercator, pour que le rectangle soit
		// réellement centré sur la vue et au bon rapport dès la première pose.
		const demiHauteur = (mercatorX(est) - mercatorX(ouest)) / rapport / 2;
		const milieu = mercatorY(centre.lat);
		const nord = latitudeDepuisMercator(milieu + demiHauteur);
		const sud = latitudeDepuisMercator(milieu - demiHauteur);
		feuille = { sud, ouest, nord, est };
	} else {
		// Rotation d'une image déjà posée : on garde le coin nord-ouest et la
		// largeur, on recalcule le sud pour respecter le nouveau rapport.
		feuille.sud = calerSud(feuille.nord, feuille.ouest, feuille.est, rapport);
	}

	if (overlay) carte.removeLayer(overlay);
	overlay = L.imageOverlay(url, empriseDepuisFeuille(feuille), {
		opacity: Number(elOpacite.value) / 100,
	}).addTo(carte);

	installerPoigneeDeplacement();
	installerPoigneeRedim();
	elInfoSource.textContent = `${largeur}×${hauteur} px affichés (source ${sourceActuelle.largeurOriginale}×${sourceActuelle.hauteurOriginale}).`;
	majEtatBoutonEnregistrer();
}

function empriseDepuisFeuille(f) {
	return [[f.sud, f.ouest], [f.nord, f.est]];
}

// ---------------------------------------------------------------------------
// 2. Déplacer l'image (poignée nord-ouest)
// ---------------------------------------------------------------------------

/**
 * Le déplacement passe par une poignée, et non par un glisser sur l'image.
 *
 * Un `L.imageOverlay` ne capte pas les événements de souris : le `mousedown`
 * atterrissait sur le fond de carte, qui se déplaçait avec l'image posée dessus
 * — mouvement apparent nul. Un marqueur Leaflet, lui, intercepte le glisser
 * avant la carte, sans conflit possible.
 */
function installerPoigneeDeplacement() {
	if (poigneeDeplacement) carte.removeLayer(poigneeDeplacement);

	poigneeDeplacement = L.marker([feuille.nord, feuille.ouest], {
		draggable: true,
		icon: L.divIcon({ className: 'poignee-deplacement', iconSize: [16, 16] }),
		zIndexOffset: 500, // au-dessus des sommets du contour, pour rester attrapable
	}).addTo(carte);

	let depart = null;
	poigneeDeplacement.on('dragstart', () => {
		depart = { ...feuille };
	});

	poigneeDeplacement.on('drag', (evenement) => {
		const point = evenement.target.getLatLng();

		// La hauteur est conservée dans le plan de Mercator, pas en degrés : une
		// translation en degrés étirerait l'image à mesure qu'elle s'éloigne de
		// l'équateur, et le rapport verrouillé au redimensionnement serait perdu.
		const hauteurMercator = mercatorY(depart.nord) - mercatorY(depart.sud);
		const nord = point.lat;
		const sud = latitudeDepuisMercator(mercatorY(nord) - hauteurMercator);
		const deltaLng = point.lng - depart.ouest;

		feuille = {
			nord,
			sud,
			ouest: depart.ouest + deltaLng,
			est: depart.est + deltaLng,
		};

		overlay.setBounds(empriseDepuisFeuille(feuille));
		if (poigneeRedim) poigneeRedim.setLatLng([feuille.sud, feuille.est]);
	});

	poigneeDeplacement.on('dragend', () => {
		poigneeDeplacement.setLatLng([feuille.nord, feuille.ouest]);
	});
}

// ---------------------------------------------------------------------------
// 3. Redimensionner (poignée sud-est, proportions verrouillées)
// ---------------------------------------------------------------------------

function installerPoigneeRedim() {
	if (poigneeRedim) carte.removeLayer(poigneeRedim);

	poigneeRedim = L.marker([feuille.sud, feuille.est], {
		draggable: true,
		icon: L.divIcon({ className: 'poignee-redim', iconSize: [14, 14] }),
	}).addTo(carte);

	poigneeRedim.on('drag', (evenement) => {
		const { largeur, hauteur } = largeurHauteurAffichees();
		const rapport = largeur / hauteur;
		const point = evenement.target.getLatLng();

		// La largeur suit la souris ; la hauteur est recalculée pour garder le
		// rapport de l'image — sans quoi elle se poserait déformée sur le fond.
		const est = point.lng;
		const sud = calerSud(feuille.nord, feuille.ouest, est, rapport);
		feuille = { ...feuille, est, sud };
		overlay.setBounds(empriseDepuisFeuille(feuille));
	});

	poigneeRedim.on('dragend', () => {
		// Replace la poignée exactement au coin recalculé (le verrouillage du
		// rapport peut légèrement s'écarter de la position brute de la souris).
		poigneeRedim.setLatLng([feuille.sud, feuille.est]);
	});
}

elOpacite.addEventListener('input', () => {
	elValeurOpacite.textContent = elOpacite.value;
	if (overlay) overlay.setOpacity(Number(elOpacite.value) / 100);
});

// ---------------------------------------------------------------------------
// 4. Rotation par quarts de tour
// ---------------------------------------------------------------------------

function pivoter(delta) {
	if (!sourceActuelle) return;
	rotation = (rotation + delta + 360) % 360;
	elRotationActuelle.textContent = `${rotation}°`;
	chargerImageSource();
}

document.getElementById('pivoterMoins').addEventListener('click', () => pivoter(-90));
document.getElementById('pivoterPlus').addEventListener('click', () => pivoter(90));

// ---------------------------------------------------------------------------
// 5. Tracé du contour
// ---------------------------------------------------------------------------

function redessinerContour() {
	if (polygoneContour) carte.removeLayer(polygoneContour);
	if (contour.length >= 2) {
		polygoneContour = L.polygon(contour, { color: '#ff8800', weight: 2, fillOpacity: 0.15 }).addTo(carte);
	} else {
		polygoneContour = null;
	}
	elInfoContour.textContent = `${contour.length} sommet${contour.length > 1 ? 's' : ''}.`;
	majEtatBoutonEnregistrer();
}

function ajouterSommet(latlng) {
	const index = contour.length;
	contour.push([latlng.lat, latlng.lng]);

	const marqueur = L.marker(latlng, {
		draggable: true,
		icon: L.divIcon({ className: 'poignee-sommet', iconSize: [12, 12] }),
	}).addTo(carte);

	marqueur.on('drag', () => {
		const position = marqueur.getLatLng();
		contour[index] = [position.lat, position.lng];
		redessinerContour();
	});

	marqueursContour.push(marqueur);
	redessinerContour();
}

function retirerDernierSommet() {
	if (contour.length === 0) return;
	contour.pop();
	const marqueur = marqueursContour.pop();
	if (marqueur) carte.removeLayer(marqueur);
	redessinerContour();
}

function viderContour() {
	contour = [];
	for (const marqueur of marqueursContour) carte.removeLayer(marqueur);
	marqueursContour = [];
	redessinerContour();
}

carte.on('click', (evenement) => {
	if (!modeTrace) return;
	ajouterSommet(evenement.latlng);
});

// Retour arrière retire le dernier sommet, sauf si l'utilisateur tape dans un
// champ de texte du panneau (identifiant, titre, description).
document.addEventListener('keydown', (evenement) => {
	if (evenement.key !== 'Backspace') return;
	const cible = evenement.target;
	const dansUnChamp = cible && (cible.tagName === 'INPUT' || cible.tagName === 'TEXTAREA');
	if (dansUnChamp) return;
	evenement.preventDefault();
	retirerDernierSommet();
});

boutonTracer.addEventListener('click', () => {
	modeTrace = !modeTrace;
	boutonTracer.classList.toggle('actif', modeTrace);
	boutonTracer.textContent = modeTrace ? 'Tracé en cours (cliquer sur la carte)' : 'Tracer le contour';
});

document.getElementById('annulerSommet').addEventListener('click', retirerDernierSommet);
document.getElementById('viderTrace').addEventListener('click', viderContour);
document.getElementById('terminerTrace').addEventListener('click', () => {
	modeTrace = false;
	boutonTracer.classList.remove('actif');
	boutonTracer.textContent = 'Tracer le contour';
});

// ---------------------------------------------------------------------------
// 6. Enregistrement
// ---------------------------------------------------------------------------

elId.addEventListener('input', majEtatBoutonEnregistrer);

boutonEnregistrer.addEventListener('click', async () => {
	if (!sourceActuelle || !feuille || contour.length < 3) return;

	const corps = {
		id: elId.value.trim(),
		titre: elTitre.value.trim(),
		description: elDescription.value.trim(),
		feuille,
		contour,
		rotation,
		source: sourceActuelle.nom,
	};

	boutonEnregistrer.disabled = true;
	afficherMessage('Enregistrement en cours…', '');

	try {
		const reponse = await fetch('/api/enregistrer', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(corps),
		});
		const donnees = await reponse.json();

		if (!reponse.ok) {
			afficherMessage(`Erreur : ${donnees.erreur || reponse.statusText}`, 'erreur');
		} else {
			let texte = 'Fichiers écrits :\n' + donnees.fichiersEcrits.map((f) => `- ${f}`).join('\n');
			if (donnees.avertissements && donnees.avertissements.length) {
				texte += '\n\n' + donnees.avertissements.join('\n');
			}
			afficherMessage(texte, 'ok');
		}
	} catch (erreur) {
		afficherMessage(`Erreur réseau : ${erreur.message}`, 'erreur');
	} finally {
		majEtatBoutonEnregistrer();
	}
});

// ---------------------------------------------------------------------------

chargerSources();
