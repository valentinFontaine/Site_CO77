// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'CO77';
export const SITE_DESCRIPTION = 'Comité Départemental de Course d\'Orientation 77';

// Mises en forme proposées à la validation (voir src/styles/themes.css).
// « depart » est le modèle d'origine : il n'ajoute aucun attribut data-theme.
export const THEMES = [
	{ id: 'flyer', label: 'Flyer « On filme »' },
	{ id: 'logo', label: 'Logo CDCO (menu latéral)' },
	{ id: 'depart', label: 'Modèle de départ' },
];

// Mise en forme d'un visiteur qui n'en a encore choisi aucune
export const DEFAULT_THEME = 'flyer';
