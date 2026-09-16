import { getCollection, type CollectionEntry } from 'astro:content';
import { emprise, type Feuille, type Point } from './cartes-geometrie';

export type Geo = CollectionEntry<'cartesGeo'>['data'];
export type { Feuille, Point };

/**
 * Calages indexés par identifiant de carte.
 *
 * Le rapprochement se fait sur l'identifiant que Astro dérive du nom de fichier :
 * `Sablons.md` et `Sablons.json` donnent tous deux `sablons`.
 */
export async function getCalages(): Promise<Map<string, Geo>> {
	const entrees = await getCollection('cartesGeo');
	return new Map(entrees.map((entree) => [entree.id, entree.data]));
}

/**
 * Emprise à afficher par défaut, au format Leaflet `[[sud, ouest], [nord, est]]`.
 *
 * On privilégie le contour sur la feuille : c'est la zone cartographiée qui
 * intéresse le visiteur, pas les marges d'impression.
 */
export function empriseAffichee(geo: Geo): [Point, Point] {
	return emprise(geo.contour);
}

/** Emprise de la feuille entière, au même format. */
export function empriseFeuille({ feuille }: Geo): [Point, Point] {
	return [
		[feuille.sud, feuille.ouest],
		[feuille.nord, feuille.est],
	];
}
