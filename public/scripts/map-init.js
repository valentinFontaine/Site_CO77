/*
 * Carte interactive des cartes de course d'orientation (Leaflet).
 *
 * Utilisé par /cartographie/ (toutes les cartes) et par la fiche de chaque carte
 * (une seule). Les deux pages exposent un élément `#map` portant l'attribut
 * `data-map-data`, un tableau JSON décrivant les cartes à afficher.
 *
 * Ce qui s'affiche, et pourquoi :
 *
 *   au repos   la zone réellement cartographiée, détourée selon son contour,
 *              cerclée d'un liseré fin
 *   au survol  la feuille imprimée entière, cadre FFCO compris, liseré masqué
 *
 * Le contour est dessiné sans remplissage : une surface colorée posée sur les
 * cartes masquerait ce que le visiteur est précisément venu regarder. Le liseré
 * sert seulement à signaler qu'il y a quelque chose à survoler, et sa couleur
 * indique le type de terrain.
 */

// Couleur du liseré selon le type de terrain.
var COULEURS_TYPE = {
	'Forêt': '#1b7f3b',
	Urbain: '#b3541e',
	Sprint: '#7b2ff7',
	Mixed: '#0f6d8f',
};
var COULEUR_DEFAUT = '#2337ff';

// Vue de repli quand aucune carte n'a d'emprise exploitable : la Seine-et-Marne.
var VUE_PAR_DEFAUT = { centre: [48.62, 2.95], zoom: 9 };

// Plan de superposition de la feuille survolée. Doit dépasser le calque SVG des
// contours, que Leaflet fixe à 200, sans atteindre les infobulles (650).
var ZINDEX_FEUILLE = 250;

// Sur un écran tactile il n'y a pas de survol : la première touche montre la
// feuille, la seconde ouvre la fiche.
var AU_SURVOL = window.matchMedia && window.matchMedia('(hover: hover)').matches;

function echapper(texte) {
	return String(texte == null ? '' : texte).replace(/[&<>"']/g, function (caractere) {
		return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caractere];
	});
}

/** Crée la carte et ses fonds de plan. */
function mountMap(container) {
	if (typeof L === 'undefined') {
		console.error("Leaflet n'est pas chargé");
		return null;
	}

	var map = L.map(container, { scrollWheelZoom: false });

	var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		maxZoom: 19,
	});

	// Géoplateforme de l'IGN. L'ancien service `wxs.ign.fr` a été fermé en 2024 ;
	// son nom de domaine ne résout même plus.
	var ignPlan = L.tileLayer(
		'https://data.geopf.fr/wmts?layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&style=normal&tilematrixset=PM' +
			'&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng' +
			'&TileMatrix={z}&TileCol={x}&TileRow={y}',
		{ attribution: '&copy; <a href="https://www.ign.fr">IGN</a>', maxZoom: 19 },
	);

	var ignPhoto = L.tileLayer(
		'https://data.geopf.fr/wmts?layer=ORTHOIMAGERY.ORTHOPHOTOS&style=normal&tilematrixset=PM' +
			'&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg' +
			'&TileMatrix={z}&TileCol={x}&TileRow={y}',
		{ attribution: '&copy; <a href="https://www.ign.fr">IGN</a>', maxZoom: 19 },
	);

	ignPlan.addTo(map);
	L.control.layers({ 'IGN Plan': ignPlan, 'Photos aériennes': ignPhoto, OpenStreetMap: osm }).addTo(map);

	// Le zoom à la molette est désactivé pour ne pas piéger le défilement de la
	// page ; il se réactive dès qu'on clique dans la carte.
	map.on('focus', function () {
		map.scrollWheelZoom.enable();
	});
	map.on('blur', function () {
		map.scrollWheelZoom.disable();
	});

	return map;
}

/** Vérifie qu'une emprise `[[sud, ouest], [nord, est]]` est exploitable. */
function empriseValide(emprise) {
	return (
		Array.isArray(emprise) &&
		emprise.length === 2 &&
		emprise.every(function (coin) {
			return (
				Array.isArray(coin) &&
				coin.length === 2 &&
				coin.every(function (n) {
					return typeof n === 'number' && !isNaN(n);
				})
			);
		})
	);
}

function contourValide(contour) {
	return Array.isArray(contour) && contour.length >= 3;
}

function contenuInfobulle(carte) {
	var details = [carte.mapType, carte.scale, carte.difficultyLevel].filter(Boolean);
	return (
		'<strong>' + echapper(carte.title) + '</strong>' +
		(details.length ? '<br><span class="infobulle-details">' + echapper(details.join(' · ')) + '</span>' : '')
	);
}

/**
 * Installe une carte sur le fond : sa vignette détourée, son liseré, et la
 * bascule vers la feuille complète.
 */
function ajouterCarte(map, carte, etat) {
	var couleur = COULEURS_TYPE[carte.mapType] || COULEUR_DEFAUT;

	var vignette = null;
	if (carte.thumbnail && empriseValide(carte.bounds)) {
		// `interactive: false` : c'est le contour qui capte les événements. Une
		// seule zone sensible, donc une seule infobulle et un seul lien.
		vignette = L.imageOverlay(carte.thumbnail, carte.bounds, {
			interactive: false,
			className: 'carte-vignette',
		}).addTo(map);

		vignette.on('error', function () {
			console.warn('Vignette introuvable pour « ' + carte.title + ' » : ' + carte.thumbnail);
			map.removeLayer(vignette);
			vignette = null;
		});
	}

	// Sans contour tracé, on retombe sur le rectangle de l'emprise : la carte
	// reste repérable et cliquable en attendant d'être calée dans l'éditeur.
	var sommets = contourValide(carte.contour)
		? carte.contour
		: [
				[carte.bounds[0][0], carte.bounds[0][1]],
				[carte.bounds[1][0], carte.bounds[0][1]],
				[carte.bounds[1][0], carte.bounds[1][1]],
				[carte.bounds[0][0], carte.bounds[1][1]],
			];

	// `fillOpacity: 0` garde une surface sensible à la souris sans rien masquer :
	// on peut survoler la carte partout, pas seulement sur son liseré.
	var contour = L.polygon(sommets, {
		color: couleur,
		weight: 2,
		opacity: 0.85,
		fill: true,
		fillOpacity: 0,
		className: 'carte-contour',
	}).addTo(map);

	contour.bindTooltip(contenuInfobulle(carte), { sticky: true, className: 'custom-tooltip' });

	// La feuille entière n'est chargée qu'au premier survol : sur une page qui
	// affichera une vingtaine de cartes, télécharger d'emblée toutes les feuilles
	// serait long pour rien, la plupart ne seront jamais survolées.
	var feuille = null;
	function feuilleChargee() {
		if (!feuille && carte.apercu && empriseValide(carte.feuille)) {
			feuille = L.imageOverlay(carte.apercu, carte.feuille, {
				interactive: false,
				className: 'carte-feuille',
				// Leaflet place tous les contours dans un unique calque SVG, auquel sa
				// feuille de style donne `z-index: 200`, contre 1 pour les images. Le
				// SVG passe donc devant toutes les images quel que soit l'ordre du
				// DOM, et `bringToFront()` n'y change rien : la feuille survolée se
				// retrouvait sous le liseré des cartes voisines. Il faut la monter
				// au-dessus de ce calque. On reste sous les infobulles (650).
				zIndex: ZINDEX_FEUILLE,
			});
		}
		return feuille;
	}

	function montrerFeuille() {
		var image = feuilleChargee();
		if (!image) return;
		if (!map.hasLayer(image)) image.addTo(map);
		image.bringToFront(); // passer devant les cartes voisines
		if (vignette) map.removeLayer(vignette);
		contour.setStyle({ opacity: 0, fillOpacity: 0 });
		etat.ouverte = carte;
	}

	function cacherFeuille() {
		if (feuille && map.hasLayer(feuille)) map.removeLayer(feuille);
		if (vignette && !map.hasLayer(vignette)) vignette.addTo(map);
		contour.setStyle({ opacity: 0.85, weight: 2 });
		if (etat.ouverte === carte) etat.ouverte = null;
	}

	carte.cacher = cacherFeuille;

	if (AU_SURVOL) {
		contour.on('mouseover', function () {
			if (carte.apercu) montrerFeuille();
			else contour.setStyle({ weight: 4 });
		});
		contour.on('mouseout', function () {
			cacherFeuille();
			contour.setStyle({ weight: 2 });
		});
		contour.on('click', function () {
			if (carte.url) window.location.href = carte.url;
		});
	} else {
		// Écran tactile : première touche pour regarder, seconde pour ouvrir.
		contour.on('click', function () {
			if (etat.ouverte === carte) {
				if (carte.url) window.location.href = carte.url;
				return;
			}
			if (etat.ouverte && etat.ouverte.cacher) etat.ouverte.cacher();
			if (carte.apercu) montrerFeuille();
			else if (carte.url) window.location.href = carte.url;
		});
	}

	return L.latLngBounds(carte.bounds[0], carte.bounds[1]);
}

/** Dessine toutes les cartes et renvoie l'emprise cumulée. */
function addCarteOverlays(map, cartes) {
	var empriseTotale = null;
	var etat = { ouverte: null };

	(cartes || []).forEach(function (carte) {
		if (!empriseValide(carte.bounds)) {
			console.warn('Emprise absente ou invalide pour « ' + carte.title + ' », carte ignorée');
			return;
		}
		var emprise = ajouterCarte(map, carte, etat);
		empriseTotale = empriseTotale ? empriseTotale.extend(emprise) : emprise;
	});

	// Sur écran tactile, toucher le fond referme la feuille ouverte.
	if (!AU_SURVOL) {
		map.on('click', function () {
			if (etat.ouverte && etat.ouverte.cacher) etat.ouverte.cacher();
		});
	}

	return empriseTotale;
}

document.addEventListener('DOMContentLoaded', function () {
	var element = document.getElementById('map');
	if (!element) return;

	var cartes = [];
	try {
		cartes = JSON.parse(element.getAttribute('data-map-data') || '[]');
	} catch (erreur) {
		console.error('Données de cartes illisibles', erreur);
	}

	var map = mountMap(element);
	if (!map) return;

	var emprise = addCarteOverlays(map, cartes);

	if (emprise && emprise.isValid()) {
		// Cadrer sur les cartes affichées plutôt que sur un centre figé : une carte
		// ajoutée hors du cadrage d'origine reste ainsi visible.
		map.fitBounds(emprise, { padding: [40, 40], maxZoom: 15 });
	} else {
		map.setView(VUE_PAR_DEFAUT.centre, VUE_PAR_DEFAUT.zoom);
	}
});
