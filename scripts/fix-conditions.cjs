#!/usr/bin/env node

const fs = require('fs');

// Fix index.astro
let content = fs.readFileSync('src/pages/actualites/index.astro', 'utf8');
const oldPattern = 'typeof post.data.heroImage === "string" && post.data.heroImage.startsWith("/images/") || post.data.heroImage.startsWith("http")';
const newPattern = 'typeof post.data.heroImage === "string" && (post.data.heroImage.startsWith("/images/") || post.data.heroImage.startsWith("http"))';
content = content.replace(oldPattern, newPattern);
fs.writeFileSync('src/pages/actualites/index.astro', content);
console.log('Fixed index.astro');

// Fix [...slug].astro
content = fs.readFileSync('src/pages/actualites/[...slug].astro', 'utf8');
content = content.replace(oldPattern, newPattern);
fs.writeFileSync('src/pages/actualites/[...slug].astro', content);
console.log('Fixed [...slug].astro');

// Fix BlogPost.astro
content = fs.readFileSync('src/layouts/BlogPost.astro', 'utf8');
content = content.replace(
  'typeof heroImage === \'string\' && heroImage.startsWith(\'/images/\') || heroImage.startsWith(\'http\')',
  'typeof heroImage === \'string\' && (heroImage.startsWith(\'/images/\') || heroImage.startsWith(\'http\'))'
);
fs.writeFileSync('src/layouts/BlogPost.astro', content);
console.log('Fixed BlogPost.astro');

console.log('\nDone!');
