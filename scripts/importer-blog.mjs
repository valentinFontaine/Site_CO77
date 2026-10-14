#!/usr/bin/env node
/**
 * Reprise des articles du blog https://cdco77.blogspot.com dans la collection
 * `actualites`, avec leurs photos.
 *
 * Script de migration ponctuel. Il lit le flux JSON du blog déjà téléchargé
 * (Blogger ne renvoie que 150 articles par requête, d'où plusieurs fichiers) :
 *
 *   https://cdco77.blogspot.com/feeds/posts/default?alt=json&max-results=150&start-index=1
 *   … start-index=151, 301, 451, 601, 751
 *
 * Usage :
 *   node --use-system-ca scripts/importer-blog.mjs <flux.json…> --annee 2025 --photos [--ecrire]
 *
 *   --annee <aaaa>  reprendre tous les articles de cette année
 *   --photos        reprendre tous les articles qui contiennent des photos
 *   --ecrire        écrire les fichiers (sinon : simple liste de ce qui serait fait)
 *
 * Un article déjà présent (même `legacyUrl`, ou même titre le même jour) n'est
 * jamais réécrit. Les photos sont copiées dans public/images/<année>/ et
 * réduites à 1000 px : le site ne dépend plus des sites qui les hébergeaient.
 *
 * `--use-system-ca` : sans lui, Node refuse le certificat du proxy de l'entreprise.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const ARTICLES = path.join(ROOT, 'src/content/actualites');
const IMAGES = path.join(ROOT, 'public/images');
const MAX_PX = 1000;

const args = process.argv.slice(2);
const feeds = args.filter((a) => a.endsWith('.json'));
const year = args.includes('--annee') ? args[args.indexOf('--annee') + 1] : null;
const withPhotos = args.includes('--photos');
const write = args.includes('--ecrire');

// ---------------------------------------------------------------------------
// HTML → Markdown
// ---------------------------------------------------------------------------

const ENTITIES = { nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', laquo: '«', raquo: '»',
	eacute: 'é', egrave: 'è', ecirc: 'ê', agrave: 'à', acirc: 'â', ccedil: 'ç', ocirc: 'ô', ucirc: 'û',
	ugrave: 'ù', icirc: 'î', iuml: 'ï', euml: 'ë', Eacute: 'É', rsquo: '’', lsquo: '‘', ldquo: '“',
	rdquo: '”', hellip: '…', ndash: '–', mdash: '—', deg: '°', euro: '€', oelig: 'œ' };

function decode(s) {
	return s
		.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
		.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
		.replace(/&(\w+);/g, (m, n) => ENTITIES[n] ?? m);
}

const stripTags = (s) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];
const isImageUrl = (u) => /\.(jpe?g|png|webp)(\?|$)/i.test(u) || /googleusercontent|bp\.blogspot/.test(u);

/** Les icônes de fichier (pdf.gif…) et décors du thème ne sont pas des photos. */
const isPhoto = (u) => u && !/\.gif(\?|$)/i.test(u) && !/file_icons|blogblog\.com|gstatic\.com/.test(u);

/** Retourne { markdown, images: [url…] } ; les images sont marquées ⟦IMG n⟧. */
function toMarkdown(html) {
	const images = [];
	let s = html
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/<(style|script)[\s\S]*?<\/\1>/gi, '')
		// Les vrais sauts de ligne sont des <br> ; ceux du code source ne sont que de la mise en page.
		.replace(/\s*\n\s*/g, ' ');

	// Une image cliquable pointe en général vers sa version grand format.
	const takeImage = (imgTag, href) => {
		let src = attr(imgTag, 'src');
		if (href && isImageUrl(href)) src = href;
		if (!isPhoto(src)) return '';
		images.push(src.replace(/&amp;/g, '&'));
		return `\n\n⟦IMG ${images.length - 1}⟧\n\n`;
	};
	s = s.replace(/<a\b([^>]*)>\s*(<img\b[^>]*>)\s*<\/a>/gi, (_, a, img) => takeImage(img, attr(a, 'href')));
	s = s.replace(/<img\b[^>]*>/gi, (img) => takeImage(img));

	s = s.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (m, a, inner) => {
		const href = attr(a, 'href');
		const text = stripTags(inner);
		if (!text) return '';
		if (!href || href.startsWith('#') || href.startsWith('javascript')) return text;
		return `[${text.replace(/[[\]]/g, '')}](${href.replace(/ /g, '%20')})`;
	});
	s = s.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, inner) => {
		const text = stripTags(inner);
		return text ? `\n\n### ${text}\n\n` : '\n\n';
	});
	s = s
		.replace(/<li\b[^>]*>/gi, '\n- ')
		.replace(/<\/?(p|div|br|tr|table|tbody|ul|ol|blockquote|section|article|center|hr)\b[^>]*>/gi, '\n\n')
		.replace(/<\/t[dh]>\s*<t[dh]\b[^>]*>/gi, ' · ');

	// Le gras n'est gardé que s'il tient sur une ligne : sinon le Markdown casse.
	s = s.replace(/<(b|strong)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, t, inner) => {
		const text = inner.replace(/<[^>]+>/g, '');
		if (/\n/.test(text) || !text.trim()) return inner;
		const lead = text.match(/^\s*/)[0] ? ' ' : '';
		const trail = text.match(/\s*$/)[0] ? ' ' : '';
		return `${lead}**${decode(text).replace(/\s+/g, ' ').trim()}**${trail}`;
	});

	s = decode(s.replace(/<[^>]+>/g, ''));
	const lines = s.split('\n').map((l) => l.replace(/[\s ]+/g, ' ').trim());
	const out = [];
	for (const l of lines) {
		if (!l || /^\*\*\s*\*\*$/.test(l)) { if (out.length && out.at(-1) !== '') out.push(''); continue; }
		out.push(l);
	}
	// Une ligne par paragraphe : une simple fin de ligne serait fusionnée par Markdown.
	const md = out.join('\n').replace(/\n(?!\n)(?!- )/g, '\n\n').replace(/\n{3,}/g, '\n\n').trim();
	return { markdown: md, images };
}

// ---------------------------------------------------------------------------
// Métadonnées
// ---------------------------------------------------------------------------

function slugify(s) {
	return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
		.replace(/['’]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80).replace(/-$/, '');
}
const norm = (s) => slugify(s).replace(/-/g, '');

/** Les articles récents du blog n'ont pas de titre Blogger : il est dans le corps. */
function deriveTitle(entry, md) {
	let title = stripTags(entry.title.$t);
	let body = md;
	if (!title) {
		const first = md.split('\n').find((l) => l && !l.startsWith('⟦'));
		title = (first || '').replace(/⟦IMG \d+⟧/g, '').replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').trim();
		// Une première ligne trop longue pour un titre reste aussi dans le texte.
		if (first && title.length <= 120) body = md.replace(first, (first.match(/⟦IMG \d+⟧/g) || []).join('\n\n')).trim();
	}
	title = title.replace(/\s*[:,;]\s*$/, '');
	if (title.length > 120) title = title.slice(0, 117).replace(/\s+\S*$/, '') + '…';
	if (title.length < 5) title = `Article du ${entry.published.$t.slice(0, 10)}`;
	return { title, body };
}

function describe(body) {
	const text = body.replace(/⟦IMG \d+⟧/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[#*]/g, '').replace(/\s+/g, ' ').trim();
	return text.length <= 200 ? text : text.slice(0, 197).replace(/\s+\S*$/, '') + '…';
}

function category(title, body) {
	const t = `${title} ${body}`;
	if (/r[ée]sultat|podium|classement|champion|\b\d+(e|er|ème)\b/i.test(t)) return 'resultats';
	if (/inscri|organis|rendez-vous|invit/i.test(t)) return 'annonces';
	return 'divers';
}

const yamlStr = (s) => JSON.stringify(s);

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

/** Les images Blogger existent en plusieurs tailles ; on demande la grande. */
function largest(url) {
	return url
		.replace(/\/s\d+(-[a-z]+)?\//, '/s1600/')
		.replace(/\/w\d+-h\d+(-[a-z]+)?\//, '/s1600/')
		.replace(/=(s|w)\d+[^/]*$/, '=s1600');
}

async function download(url, dest) {
	// Beaucoup d'anciens hébergeurs ont disparu : Internet Archive en garde souvent une copie.
	const archived = `https://web.archive.org/web/2016id_/${url}`;
	for (const u of [...new Set([largest(url), url, archived])]) {
		try {
			const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) });
			if (!res.ok || !/^image\//.test(res.headers.get('content-type') || '')) continue;
			const buf = Buffer.from(await res.arrayBuffer());
			await sharp(buf).rotate().resize({ width: MAX_PX, height: MAX_PX, fit: 'inside', withoutEnlargement: true })
				.jpeg({ quality: 82, mozjpeg: true }).toFile(dest);
			return true;
		} catch { /* essai suivant */ }
	}
	return false;
}

// ---------------------------------------------------------------------------
// Programme
// ---------------------------------------------------------------------------

const entries = feeds.flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')).feed.entry ?? []);

const existing = fs.readdirSync(ARTICLES).map((f) => {
	const src = fs.readFileSync(path.join(ARTICLES, f), 'utf8');
	return {
		file: f,
		legacyUrl: src.match(/^legacyUrl:\s*"?([^"\n]+)"?/m)?.[1],
		key: `${f.slice(0, 10)}|${norm(src.match(/^title:\s*"?(.+?)"?\s*$/m)?.[1] ?? '')}`,
		title: norm(src.match(/^title:\s*"?(.+?)"?\s*$/m)?.[1] ?? ''),
	};
});

const report = { crees: [], deja: [], photosPerdues: [] };

for (const entry of entries) {
	const url = entry.link.find((l) => l.rel === 'alternate').href.replace(/^http:/, 'https:');
	const date = entry.published.$t.slice(0, 10);
	const { markdown, images } = toMarkdown(entry.content.$t);
	const keep = (year && date.startsWith(year)) || (withPhotos && images.length);
	if (!keep) continue;

	const { title, body } = deriveTitle(entry, markdown);
	const slug = slugify(title) || 'article';
	const file = `${date}-${slug}.md`;

	// Déjà repris : même adresse d'origine, ou même titre (les dates de l'export
	// précédent ne sont pas fiables : beaucoup d'articles y sont au 30 juin 2025).
	const dup = existing.find((e) => e.legacyUrl === url || e.key === `${date}|${norm(title)}`
		|| (norm(title).length > 15 && e.title === norm(title)));
	if (dup) { report.deja.push(`${date} ${title} → ${dup.file}`); continue; }
	if (fs.existsSync(path.join(ARTICLES, file))) { report.deja.push(`${date} ${title} → ${file}`); continue; }

	// Photos
	let text = body;
	let hero;
	const dir = date.slice(0, 4);
	for (const [i, src] of images.entries()) {
		const name = `blog-${date}-${slug.slice(0, 40)}-${i + 1}.jpg`;
		const publicPath = `/images/${dir}/${name}`;
		let ok = true;
		if (write) {
			fs.mkdirSync(path.join(IMAGES, dir), { recursive: true });
			ok = fs.existsSync(path.join(IMAGES, dir, name)) || await download(src, path.join(IMAGES, dir, name));
		}
		if (!ok) { report.photosPerdues.push(`${date} ${title} : ${src}`); text = text.replace(`⟦IMG ${i}⟧`, ''); continue; }
		hero ??= publicPath;
		text = text.replace(`⟦IMG ${i}⟧`, `![${title.replace(/[[\]]/g, '')} — photo ${i + 1}](${publicPath})`);
	}
	text = text.replace(/\n{3,}/g, '\n\n').trim();

	const tags = [...new Set((entry.category ?? []).map((c) => slugify(c.term).slice(0, 30)).filter(Boolean))];
	const fm = [
		'---',
		`title: ${yamlStr(title)}`,
		`description: ${yamlStr(describe(text))}`,
		`category: ${category(title, text)}`,
		`pubDate: ${entry.published.$t}`,
		'author: CO77',
		...(tags.length ? ['tags:', ...tags.map((t) => `- ${t}`)] : []),
		...(hero ? [`heroImage: ${hero}`] : []),
		`legacyUrl: ${url}`,
		'draft: false',
		'---',
		'',
		text,
		'',
		`*Article repris du [blog du comité](${url}).*`,
		'',
	].join('\n');

	if (write) fs.writeFileSync(path.join(ARTICLES, file), fm, 'utf8');
	report.crees.push(`${date} ${title} (${images.length} photo(s)) → ${file}`);
}

console.log(`${write ? 'Créés' : 'À créer'} : ${report.crees.length}`);
for (const l of report.crees) console.log('  +', l);
console.log(`Déjà présents : ${report.deja.length}`);
for (const l of report.deja) console.log('  =', l);
if (report.photosPerdues.length) {
	console.log(`Photos introuvables : ${report.photosPerdues.length}`);
	for (const l of report.photosPerdues) console.log('  !', l);
}
