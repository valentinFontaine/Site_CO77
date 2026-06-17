// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],
	redirects: {
		// Redirect old blog URLs to actualites
		'/blog/': '/actualites/',
		'/blog/index.html': '/actualites/',
	},
	content: {
		collections: {
			clubs: {
				schema: await import('./.astro/collections/clubs.schema.json'),
			},
			entrainements: {
				schema: await import('./.astro/collections/entrainements.schema.json'),
			},
			evenements: {
				schema: await import('./.astro/collections/evenements.schema.json'),
			},
			actualites: {
				schema: await import('./.astro/collections/actualites.schema.json'),
			},
			cartes: {
				schema: await import('./.astro/collections/cartes.schema.json'),
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
