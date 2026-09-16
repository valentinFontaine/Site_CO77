import { defineCollection, defineConfig } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// ============================================================================
// OUTIL : tolérance aux champs vides
// ============================================================================

/**
 * Le CMS enregistre `mon_champ: ""` quand un champ facultatif est laissé vide.
 * Une chaîne vide ferait échouer la validation (URL, date, liste de choix…) et
 * donc casserait le déploiement. On considère ces valeurs comme « non renseigné ».
 */
function stripEmpty(value: unknown) {
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>).filter(
				([, v]) => v !== '' && v !== null && !(Array.isArray(v) && v.length === 0),
			),
		);
	}
	return value;
}

/** Déclare le frontmatter d'une collection, en ignorant les champs laissés vides. */
const frontmatter = <T extends z.ZodRawShape>(shape: T) => z.preprocess(stripEmpty, z.object(shape));

// ============================================================================
// SCHÉMAS DE BASE
// ============================================================================

// Schéma commun à tous les types de contenu
const baseSchema = {
	// Champs obligatoires
	title: z.string().min(5).max(120).describe('Titre du contenu (5-120 caractères)'),
	pubDate: z.coerce.date().describe('Date de publication au format ISO 8601'),
	
	// Champs optionnels communs
	description: z.string().max(300).describe('Description courte pour les aperçus').optional(),
	author: z.string().default('CO77').describe('Auteur du contenu'),
	tags: z.array(z.string().max(30)).describe('Mots-clés pour le filtrage et la recherche').optional(),
	draft: z.boolean().default(false).describe('Brouillon (ne sera pas publié)'),
	featured: z.boolean().default(false).describe('Mettre en avant sur la page d\'accueil'),
	
	// Référence à l'ancien site (pour traçabilité)
	legacyFile: z.string().describe('Nom du fichier original sur l\'ancien site').optional(),
	legacyUrl: z.string().url().describe('URL originale sur l\'ancien site').optional(),
};

// ============================================================================
// COLLECTION : CLUBS (inchangée)
// ============================================================================

const clubs = defineCollection({
	loader: glob({ base: './src/content/clubs', pattern: '**/*.{md,mdx}' }),
	schema: frontmatter({
		pubDate: z.coerce.date().optional(),
		name: z.string(),
		description: z.string(),
		location: z.string(),
		contactEmail: z.string().email().optional(),
		contactPhone: z.string().optional(),
		website: z.string().url().optional(),
		president: z.string().optional(),
		membersCount: z.number().optional(),
		logoPath: z.string().optional(),
		foundingYear: z.number().optional(),
	}),
});

// ============================================================================
// COLLECTION : CARTE (inchangée)
// ============================================================================

const cartes = defineCollection({
	loader: glob({ base: './src/content/cartes', pattern: '**/*.{md,mdx}' }),
	schema:
		frontmatter({
			pubDate: z.coerce.date().optional(),
			title: z.string(),
			imagePath: z.string().optional(),
			description: z.string(),
			bounds: z.array(z.number()).length(4).describe('Map bounds as [swLat, swLng, neLat, neLng]'),
			thumbnail: z.string().optional().describe('Path to thumbnail image (PNG format)'),
			coordinates: z.record(z.string(), z.any()).optional(),
			difficultyLevel: z.enum(['Facile', 'Moyen', 'Difficile', 'Expert']).optional(),
			scale: z.string().optional(),
			mapType: z.enum(['Forêt', 'Urbain', 'Sprint', 'Mixed']).optional(),
			lastUpdated: z.coerce.date().optional(),
			author: z.string().optional(),
			region: z.string().optional(),
		}),
});

// ============================================================================
// COLLECTION : ACTUALITÉS (mis à jour)
// ============================================================================

const actualites = defineCollection({
	loader: glob({ base: './src/content/actualites', pattern: '**/*.{md,mdx}' }),
	schema:
		frontmatter({
			...baseSchema,
			category: z.enum([
				'annonces',
				'resultats', 
				'conseils',
				'vie-du-comite',
				'photos',
				'divers'
			]).describe('Catégorie de l\'actualité'),
			heroImage: z.string().describe('Image principale, ex. /images/uploads/photo.jpg').optional(),
			seoTitle: z.string().max(60).describe('Titre optimisé pour le SEO').optional(),
			seoDescription: z.string().max(160).describe('Description optimisée pour le SEO').optional(),
			updatedDate: z.coerce.date().describe('Date de dernière mise à jour').optional(),
		}),
});

// ============================================================================
// COLLECTION : ÉVÉNEMENTS (NOUVEAU - simplifié)
// ============================================================================

const evenements = defineCollection({
	loader: glob({ base: './src/content/evenements', pattern: '**/*.{md,mdx}' }),
	schema: frontmatter({
		...baseSchema,
		eventDate: z.coerce.date().describe('Date principale de l\'événement (YYYY-MM-DD)'),
		location: z.string().describe('Lieu de l\'événement').optional(),
		gpsCoordinates: z.string()
			.regex(/^-?\d+\.\d+,-?\d+\.\d+$/)
			.describe('Coordonnées GPS au format "lat,lng"').optional(),
		mapsLink: z.string().url().describe('Lien vers Google Maps').optional(),
		eventType: z.enum(['competition', 'entrainement', 'reunion', 'stage', 'autre'])
			.default('competition')
			.describe('Type d\'événement'),
		discipline: z.enum(['CO', 'Sprint', 'MD', 'LD', 'Trail-O', 'Relais', 'Mixte'])
			.default('CO')
			.describe('Discipline'),
		organizer: z.string().default('CO77').describe('Organisateur'),
		price: z.string().max(100).describe('Tarif').optional(),
		registrationLink: z.string().url().describe('URL du formulaire').optional(),
		registrationDeadline: z.coerce.date().describe('Date limite').optional(),
		inscriptionsOpen: z.boolean().default(false).describe('Inscriptions ouvertes ?'),
		maxParticipants: z.number().describe('Nombre max de participants').optional(),
		eventCompleted: z.boolean().default(false).describe('Événement terminé ?'),
		eventCancelled: z.boolean().default(false).describe('Événement annulé ?'),
		startTime: z.string().regex(/^\d{2}:\d{2}$/).describe('Heure de début').optional(),
		endTime: z.string().regex(/^\d{2}:\d{2}$/).describe('Heure de fin').optional(),
		announcementPdf: z.string().describe('Chemin vers annonce PDF').optional(),
		announcementHtml: z.string().describe('Chemin vers annonce HTML').optional(),
		resultsHtml: z.array(z.string()).describe('Liste des résultats HTML').optional(),
		inscriptionsHtml: z.string().describe('Chemin vers inscrits HTML').optional(),
		inscriptionsPdf: z.string().describe('Chemin vers inscrits PDF').optional(),
		hasResults: z.boolean().default(false).describe('Résultats disponibles ?'),
		hasLiveResults: z.boolean().default(false).describe('Résultats en direct ?'),
		resultsLink: z.string().url().describe('Lien externe résultats').optional(),
	}),
});

// ============================================================================
// COLLECTION : ENTRAÎNEMENTS (mis à jour)
// ============================================================================

const entrainements = defineCollection({
	loader: glob({ base: './src/content/entrainements', pattern: '**/*.{md,mdx}' }),
	schema: frontmatter({
		...baseSchema,
		date: z.coerce.date().describe('Date de l\'entraînement'),
		rendezVous: z.string().describe('Point de rendez-vous'),
		location: z.string().describe('Lieu détaillé').optional(),
		parkingInfo: z.string().describe('Informations parking').optional(),
		itinerary: z.string().describe('Itinéraire').optional(),
		duration: z.string().describe('Durée').optional(),
		difficulty: z.enum(['Facile', 'Moyen', 'Difficile']).default('Moyen').describe('Difficulté'),
		organizer: z.string().default('CO77').describe('Organisateur'),
		maxParticipants: z.number().describe('Nombre max de participants').optional(),
		startTime: z.string().regex(/^\d{2}:\d{2}$/).describe('Heure de début').optional(),
		endTime: z.string().regex(/^\d{2}:\d{2}$/).describe('Heure de fin').optional(),
		price: z.string().describe('Tarif').optional(),
		equipment: z.array(z.string()).describe('Matériel à prévoir').optional(),
		prerequisites: z.string().describe('Prérequis').optional(),
	}),
});

export const collections = {
	clubs,
	entrainements,
	evenements,
	actualites,
	cartes,
};