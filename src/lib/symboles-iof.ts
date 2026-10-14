/*
  Symboles de définition de poste (norme IOF 2018, attachements/Définition des
  postes 2018), redessinés en SVG dans un carré de 40 × 40.
  Les tracés sont dessinés par SymboleIOF.astro avec la couleur du texte.
*/

export interface SymboleIOF {
	ref?: string;
	name: string;
	description: string;
	// Contenu SVG ; les éléments marqués class="plein" sont remplis
	svg: string;
}

export const SYMBOLES = {
	depart: {
		name: 'Départ',
		description: 'Le triangle marque le départ du circuit ; sa pointe indique le premier poste.',
		svg: '<polygon points="20,6 34,31 6,31" />',
	},
	'terrain-ouvert': {
		ref: '4.1',
		name: 'Terrain ouvert',
		description: 'Zone découverte sans arbre : prairie, champ, bruyère ou lande.',
		svg: '<polygon points="20,6 34,20 20,34 6,20" />',
	},
	mare: {
		ref: '3.2',
		name: 'Étang, mare',
		description: 'Petit plan d\'eau, parfois peu profond ou saisonnier.',
		svg: '<path d="M9 12 q2.75 -6 5.5 0 t5.5 0 t5.5 0 t5.5 0" /><path d="M12 18 v5 a8 8 0 0 0 16 0 v-5" />',
	},
	'groupe-rochers': {
		ref: '2.6',
		name: 'Groupe de rochers',
		description: 'Rochers si proches les uns des autres qu\'on ne peut les représenter séparément.',
		svg: '<polygon class="plein" points="5,31 15,14 25,31" /><polygon class="plein" points="15,31 25,10 35,31" />',
	},
	colline: {
		ref: '1.9',
		name: 'Colline',
		description: 'Point élevé représenté sur la carte par une courbe de niveau.',
		svg: '<ellipse cx="20" cy="20" rx="14" ry="9" />',
	},
	rocher: {
		ref: '2.4',
		name: 'Rocher',
		description: 'Un rocher remarquable ou une face rocheuse isolée.',
		svg: '<polygon class="plein" points="20,9 33,31 7,31" />',
	},
	falaise: {
		ref: '2.1',
		name: 'Falaise, face rocheuse',
		description: 'Falaise ou face rocheuse, franchissable ou non.',
		svg: '<path d="M6 15 H34 M7 15 V24 M13.5 15 V24 M20 15 V24 M26.5 15 V24 M33 15 V24" />',
	},
	arrivee: {
		name: 'Arrivée',
		description: 'Le double cercle marque l\'arrivée : on poinçonne une dernière fois.',
		svg: '<circle cx="20" cy="20" r="14" /><circle cx="20" cy="20" r="9" />',
	},
} satisfies Record<string, SymboleIOF>;

export type SymboleId = keyof typeof SYMBOLES;
