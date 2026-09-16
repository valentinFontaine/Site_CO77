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

/**
 * Convertit le champ `bounds` du frontmatter, une liste de quatre nombres
 * `[latSud, lngOuest, latNord, lngEst]`, vers le format à deux coins de Leaflet.
 *
 * Ce champ reste la seule emprise disponible pour les cartes qui n'ont pas
 * encore été calées dans l'éditeur.
 */
export function empriseDepuisBounds(bounds: number[] | undefined): [Point, Point] | null {
	if (!Array.isArray(bounds) || bounds.length !== 4 || bounds.some((n) => typeof n !== 'number')) {
		return null;
	}
	return [
		[bounds[0], bounds[1]],
		[bounds[2], bounds[3]],
	];
}

/**
 * Tout ce dont `public/scripts/map-init.js` a besoin pour dessiner une carte.
 *
 * Les emprises sont normalisées ici, côté serveur, plutôt que dans le script :
 * une carte calée et une carte qui ne l'est pas arrivent ainsi sous la même
 * forme, et le script n'a plus à connaître les deux conventions.
 */
export function donneesCarte(
	carte: { id: string; data: Record<string, any> },
	calage?: Geo,
): Record<string, unknown> | null {
	const bounds = calage ? empriseAffichee(calage) : empriseDepuisBounds(carte.data.bounds);
	if (!bounds) return null;

	return {
		title: carte.data.title,
		url: `/cartographie/${carte.id}/`,
		thumbnail: carte.data.thumbnail ?? null,
		mapType: carte.data.mapType ?? null,
		scale: carte.data.scale ?? null,
		difficultyLevel: carte.data.difficultyLevel ?? null,
		bounds,
		contour: calage?.contour ?? null,
		// La feuille complète n'est proposée au survol que si l'on dispose à la
		// fois de son image et de son emprise exacte.
		feuille: calage ? empriseFeuille(calage) : null,
		apercu: calage && carte.data.imagePath ? carte.data.imagePath : null,
	};
}
