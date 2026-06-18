// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { z } from 'astro/zod';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],
	content: {
		collections: {
			clubs: {
				dir: 'src/content/clubs',
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
			},
			entrainements: {
				dir: 'src/content/entrainements',
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
			},
			evenements: {
				dir: 'src/content/evenements',
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
			},
			actualites: {
				dir: 'src/content/actualites',
				schema: z.object({
					title: z.string(),
					description: z.string(),
					pubDate: z.coerce.date(),
					updatedDate: z.coerce.date().optional(),
					heroImage: z.string().optional(),
					category: z.string().optional(),
				}),
			},
			cartes: {
				dir: 'src/content/cartes',
				schema: z.object({
					pubDate: z.coerce.date().optional(),
					title: z.string(),
					imagePath: z.string(),
					description: z.string(),
					coordinates: z.record(z.string(), z.any()).optional(),
					difficultyLevel: z.enum(['Facile', 'Moyen', 'Difficile', 'Expert']).optional(),
					scale: z.string().optional(),
					mapType: z.enum(['Forêt', 'Urbain', 'Sprint', 'Mixed']).optional(),
					lastUpdated: z.coerce.date().optional(),
					author: z.string().optional(),
					region: z.string().optional(),
				}),
			},
		},
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
