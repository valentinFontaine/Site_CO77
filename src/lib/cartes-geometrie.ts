/*
 * Géométrie des cartes : conversions entre coordonnées géographiques et pixels.
 *
 * Ce fichier ne dépend ni d'Astro ni de Leaflet, afin d'être utilisable aussi
 * bien par les pages du site que par l'éditeur et les scripts Node.
 */

/** Un point géographique, dans l'ordre [latitude, longitude] utilisé par Leaflet. */
export type Point = [number, number];

/** Emprise de la feuille imprimée. Les cartes étant exportées nord en haut,
 *  c'est un rectangle en latitude/longitude. */
export interface Feuille {
	sud: number;
	ouest: number;
	nord: number;
	est: number;
}

/**
 * Projection de Mercator sphérique, réduite à ce qui sert ici.
 *
 * La longitude est proportionnelle à x, mais **la latitude ne l'est pas** à y.
 * Interpoler linéairement sur la latitude décalerait le masque de découpe par
 * rapport à l'image, d'autant plus que la carte est haute. L'écart reste faible
 * sur quelques kilomètres, mais il est gratuit à éviter.
 */
export function mercatorY(latitude: number): number {
	const phi = (latitude * Math.PI) / 180;
	return Math.log(Math.tan(Math.PI / 4 + phi / 2));
}

/** Opération inverse de `mercatorY`. */
export function latitudeDepuisMercator(y: number): number {
	return ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI;
}

/**
 * Convertit un point géographique en pixels dans l'image de la feuille, dont
 * l'origine est le coin supérieur gauche.
 *
 * Sert à fabriquer le masque de découpe : le contour est saisi sur la carte, en
 * latitude/longitude, alors que la découpe s'opère sur l'image, en pixels.
 */
export function versPixels(
	[latitude, longitude]: Point,
	feuille: Feuille,
	largeur: number,
	hauteur: number,
): [number, number] {
	const x = ((longitude - feuille.ouest) / (feuille.est - feuille.ouest)) * largeur;

	const haut = mercatorY(feuille.nord);
	const bas = mercatorY(feuille.sud);
	const y = ((haut - mercatorY(latitude)) / (haut - bas)) * hauteur;

	return [x, y];
}

/** Opération inverse de `versPixels`. */
export function versGeo(
	[x, y]: [number, number],
	feuille: Feuille,
	largeur: number,
	hauteur: number,
): Point {
	const longitude = feuille.ouest + (x / largeur) * (feuille.est - feuille.ouest);

	const haut = mercatorY(feuille.nord);
	const bas = mercatorY(feuille.sud);

	return [latitudeDepuisMercator(haut - (y / hauteur) * (haut - bas)), longitude];
}

/** Le contour entier, converti en pixels de l'image. */
export function contourEnPixels(
	contour: Point[],
	feuille: Feuille,
	largeur: number,
	hauteur: number,
): [number, number][] {
	return contour.map((point) => versPixels(point, feuille, largeur, hauteur));
}

/** Rectangle englobant un contour, au format Leaflet `[[sud, ouest], [nord, est]]`. */
export function emprise(contour: Point[]): [Point, Point] {
	const lats = contour.map(([lat]) => lat);
	const lngs = contour.map(([, lng]) => lng);
	return [
		[Math.min(...lats), Math.min(...lngs)],
		[Math.max(...lats), Math.max(...lngs)],
	];
}

/**
 * Rapport largeur/hauteur que doit avoir l'image pour se poser sans déformation
 * sur une emprise donnée. L'éditeur s'en sert pour verrouiller les proportions
 * pendant le redimensionnement.
 */
export function rapportAttendu(feuille: Feuille): number {
	return (feuille.est - feuille.ouest) / (mercatorY(feuille.nord) - mercatorY(feuille.sud));
}
