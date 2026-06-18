// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { z } from 'astro/zod';

// Import schema files synchronously
import clubsSchema from './.astro/collections/clubs.schema.json' assert { type: 'json' };
import entrainementsSchema from './.astro/collections/entrainements.schema.json' assert { type: 'json' };
import evenementsSchema from './.astro/collections/evenements.schema.json' assert { type: 'json' };
import actualitesSchema from './.astro/collections/actualites.schema.json' assert { type: 'json' };
import cartesSchema from './.astro/collections/cartes.schema.json' assert { type: 'json' };

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],
	content: {
		collections: {
			clubs: {
				dir: './src/content/clubs',
				schema: clubsSchema,
			},
			entrainements: {
				dir: './src/content/entrainements',
				schema: entrainementsSchema,
			},
			evenements: {
				dir: './src/content/evenements',
				schema: evenementsSchema,
			},
			actualites: {
				dir: './src/content/actualites',
				schema: actualitesSchema,
			},
			cartes: {
				dir: './src/content/cartes',
				schema: cartesSchema,
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
