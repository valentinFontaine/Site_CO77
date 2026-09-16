/*
 * Carte interactive des cartes de course d'orientation (Leaflet).
 *
 * Utilisé par /cartographie/ (toutes les cartes) et par la fiche de chaque carte
 * (une seule emprise). Les deux pages exposent un élément `#map` portant
 * l'attribut `data-map-data`, un tableau JSON décrivant les cartes à afficher.
 *
 * Chaque carte est dessinée comme un rectangle correspondant à son emprise
 * géographique. Si une vignette est renseignée, elle est superposée par-dessus.
 * Le rectangle reste dessiné même sans vignette — ou si l'image est absente du
 * serveur — pour que la carte soit toujours repérable.
 */

// Couleur du rectangle selon le type de terrain.
var COULEURS_TYPE = {
	'Forêt': '#1b7f3b',
	Urbain: '#b3541e',
	Sprint: '#7b2ff7',
	Mixed: '#0f6d8f',
};
var COULEUR_DEFAUT = '#2337ff';

// Vue de repli quand aucune carte n'a d'emprise exploitable : la Seine-et-Marne.
var VUE_PAR_DEFAUT = { centre: [48.62, 2.95], zoom: 9 };

function echapper(texte) {
	return String(texte == null ? '' : texte).replace(/[&<>"']/g, function (caractere) {
		return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caractere];
	});
}

/** Crée la carte et ses fonds de plan. */
function mountMap(container) {
	if (typeof L === 'undefined') {
		console.error('Leaflet n\'est pas chargé');
		return null;
	}

	// `L.map` installe déjà les boutons de zoom : ne pas en ajouter un second.
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

	// Les photos aériennes aident à juger du terrain : forêt, clairières, bâti.
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

/** Convertit `[latSud, lngOuest, latNord, lngEst]` en emprise Leaflet. */
function versEmprise(bounds) {
	if (!Array.isArray(bounds) || bounds.length !== 4 || bounds.some(function (n) {
		return typeof n !== 'number' || isNaN(n);
	})) {
		return null;
	}
	// `L.latLngBounds` remet d'aplomb les coins donnés dans le désordre.
	return L.latLngBounds([bounds[0], bounds[1]], [bounds[2], bounds[3]]);
}

function contenuInfobulle(carte) {
	var details = [carte.mapType, carte.scale, carte.difficultyLevel].filter(Boolean);
	return (
		'<strong>' + echapper(carte.title) + '</strong>' +
		(details.length ? '<br><span class="infobulle-details">' + echapper(details.join(' · ')) + '</span>' : '')
	);
}

/** Dessine les cartes et renvoie l'emprise cumulée de celles qui ont pu l'être. */
function addCarteOverlays(map, cartes) {
	var empriseTotale = null;

	(cartes || []).forEach(function (carte) {
		var emprise = versEmprise(carte.bounds);
		if (!emprise) {
			console.warn('Emprise absente ou invalide pour « ' + carte.title + ' », carte ignorée');
			return;
		}

		var couleur = COULEURS_TYPE[carte.mapType] || COULEUR_DEFAUT;

		var rectangle = L.rectangle(emprise, {
			color: couleur,
			weight: 2,
			opacity: 0.9,
			fillColor: couleur,
			fillOpacity: 0.18,
			className: 'carte-emprise',
		}).addTo(map);

		rectangle.bindTooltip(contenuInfobulle(carte), { sticky: true, className: 'custom-tooltip' });

		if (carte.url) {
			rectangle.on('click', function () {
				window.location.href = carte.url;
			});
		}

		rectangle.on('mouseover', function () {
			rectangle.setStyle({ fillOpacity: 0.35, weight: 3 });
		});
		rectangle.on('mouseout', function () {
			rectangle.setStyle({ fillOpacity: 0.18, weight: 2 });
		});

		if (carte.thumbnail) {
			// `interactive: false` laisse passer les clics vers le rectangle, qui
			// reste la seule zone sensible : une seule infobulle, un seul lien.
			var vignette = L.imageOverlay(carte.thumbnail, emprise, {
				opacity: 0.85,
				interactive: false,
				className: 'map-image-overlay',
			}).addTo(map);

			// Vignette introuvable : on la retire, le rectangle suffit à situer la carte.
			vignette.on('error', function () {
				console.warn('Vignette introuvable pour « ' + carte.title + ' » : ' + carte.thumbnail);
				map.removeLayer(vignette);
			});
		}

		empriseTotale = empriseTotale ? empriseTotale.extend(emprise) : L.latLngBounds(emprise.getSouthWest(), emprise.getNorthEast());
	});

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
