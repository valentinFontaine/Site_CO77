import { defineCollection, defineConfig } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Clubs Collection
const clubs = defineCollection({
	loader: glob({ base: './src/content/clubs', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
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

// Entrainements Collection
const entrainements = defineCollection({
	loader: glob({ base: './src/content/entrainements', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		pubDate: z.coerce.date().optional(),
		title: z.string(),
		date: z.coerce.date().optional(),
		rendezVous: z.string(),
		parkingInfo: z.string(),
		itinerary: z.string(),
		description: z.string().optional(),
		duration: z.string().optional(),
		difficulty: z.enum(['Facile', 'Moyen', 'Difficile']).optional(),
		organizer: z.string().optional(),
		maxParticipants: z.number().optional(),
	}),
});

// Evenements Collection
const evenements = defineCollection({
	loader: glob({ base: './src/content/evenements', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		pubDate: z.coerce.date().optional(),
		title: z.string(),
		date: z.coerce.date().optional(),
		location: z.string(),
		description: z.string().optional(),
		price: z.union([z.string(), z.number()]).optional(),
		areasOfExpertise: z.array(z.string()).optional(),
		results: z.string().optional(),
		organizer: z.string().optional(),
		registrationLink: z.string().url().optional(),
		maxParticipants: z.number().optional(),
		startTime: z.string().optional(),
		endTime: z.string().optional(),
	}),
});

// Actualites Collection
const actualites = defineCollection({
	loader: glob({ base: './src/content/actualites', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			category: z.string().optional(),
		}),
});

// Cartes Collection
const cartes = defineCollection({
	loader: glob({ base: './src/content/cartes', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			pubDate: z.coerce.date().optional(),
			title: z.string(),
			imagePath: z.optional(image()),
			description: z.string(),
			// Map-specific fields for interactive map
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

export const collections = {
	clubs,
	entrainements,
	evenements,
	actualites,
	cartes,
};