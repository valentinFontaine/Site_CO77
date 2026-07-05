#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'src', 'content');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

function listImagesByYear() {
  const images = {};
  if (!fs.existsSync(IMAGES_DIR)) return images;
  
  const years = fs.readdirSync(IMAGES_DIR);
  for (const year of years) {
    const yearPath = path.join(IMAGES_DIR, year);
    if (fs.statSync(yearPath).isDirectory()) {
      const files = fs.readdirSync(yearPath).filter(f => 
        f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || 
        f.endsWith('.gif') || f.endsWith('.webp') || f.endsWith('.svg')
      );
      images[year] = files.map(f => `/images/${year}/${f}`);
    }
  }
  return images;
}

function fixAllHeroImages() {
  const imagesByYear = listImagesByYear();
  console.log('Available images by year:', Object.keys(imagesByYear));
  console.log('');
  
  const contentDirs = ['actualites', 'clubs', 'cartes', 'entrainements', 'evenements'];
  let updatedCount = 0;
  
  for (const subdir of contentDirs) {
    const dirPath = path.join(CONTENT_DIR, subdir);
    if (!fs.existsSync(dirPath)) continue;
    
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    console.log(`Processing ${subdir}: ${files.length} files`);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if file has a heroImage line that needs fixing
      const heroImageMatch = content.match(/^heroImage:/m);
      if (!heroImageMatch) {
        console.log(`  Skipping ${file} (no heroImage)`);
        continue;
      }
      
      // Check if it needs fixing:
      // 1. Contains blog-placeholder
      // 2. Contains corrupted pattern like '-3.jpg' or '-4.jpg' etc.
      const needsFix = content.includes('blog-placeholder') || 
                      /'[^']*\.jpg'-/.test(content) ||
                      /'[^']*\.png'-/.test(content) ||
                      /'[^']*\.jpeg'-/.test(content);
      
      if (!needsFix) {
        console.log(`  Skipping ${file} (already has valid heroImage)`);
        continue;
      }
      
      // Extract year from filename
      let articleYear = null;
      const yearMatch = file.match(/^(\d{4})-/);
      if (yearMatch) {
        articleYear = yearMatch[1];
      }
      
      // Try to extract from pubDate
      if (!articleYear) {
        const pubDateMatch = content.match(/pubDate:\s*(\d{4})/);
        if (pubDateMatch) {
          articleYear = pubDateMatch[1];
        }
      }
      
      // Find best image
      let bestImage = null;
      if (articleYear && imagesByYear[articleYear]) {
        bestImage = imagesByYear[articleYear][0];
      }
      
      if (!bestImage) {
        const recentYears = ['2025', '2024', '2023', '2022', '2021'];
        for (const year of recentYears) {
          if (imagesByYear[year] && imagesByYear[year].length > 0) {
            bestImage = imagesByYear[year][0];
            break;
          }
        }
      }
      
      if (!bestImage) {
        for (const year in imagesByYear) {
          if (imagesByYear[year].length > 0) {
            bestImage = imagesByYear[year][0];
            break;
          }
        }
      }
      
      if (bestImage) {
        // Replace the entire heroImage line
        const newContent = content.replace(
          /(heroImage:\s*).+/,
          `$1'${bestImage}'`
        );
        
        if (newContent !== content) {
          fs.writeFileSync(filePath, newContent);
          console.log(`  Fixed ${file} -> heroImage: '${bestImage}'`);
          updatedCount++;
        } else {
          console.log(`  No change for ${file}`);
        }
      } else {
        console.log(`  No image found for ${file}`);
      }
    }
    console.log('');
  }
  
  console.log(`Fixed ${updatedCount} files total`);
  return updatedCount;
}

console.log('Fixing heroImage in all markdown files...\n');
fixAllHeroImages();
console.log('\nDone!\n');
