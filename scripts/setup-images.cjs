#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'attachements');
const DEST_DIR = path.join(__dirname, '..', 'public', 'images');
const CONTENT_DIR = path.join(__dirname, '..', 'src', 'content');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const EXCLUDE_DIRS = ['_vti_cnf'];

function normalizeFilename(filename) {
  const ext = path.extname(filename).toLowerCase();
  const name = path.basename(filename, ext);
  const normalized = name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
  return normalized + ext;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

function listImages(dir) {
  const images = [];
  if (!fs.existsSync(dir)) return images;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        images.push(...listImages(fullPath));
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        images.push(fullPath);
      }
    }
  }
  return images;
}

function getYearFromPath(filePath) {
  const relativePath = path.relative(SOURCE_DIR, filePath);
  const parts = relativePath.split(path.sep);
  for (const part of parts) {
    if (/^\d{4}$/.test(part)) {
      return part;
    }
  }
  const stats = fs.statSync(filePath);
  return stats.mtime.getFullYear().toString();
}

function getDestPath(srcPath) {
  const year = getYearFromPath(srcPath);
  const filename = normalizeFilename(path.basename(srcPath));
  let finalPath = path.join(DEST_DIR, year, filename);
  
  if (fs.existsSync(finalPath)) {
    const timestamp = Date.now();
    const nameWithoutExt = path.parse(filename).name;
    const ext = path.parse(filename).ext;
    finalPath = path.join(DEST_DIR, year, `${nameWithoutExt}_${timestamp}${ext}`);
  }
  return finalPath;
}

function copyAllImages() {
  console.log('\nStep 1: Copying images from attachements/ to public/images/\n');
  ensureDir(DEST_DIR);
  const allImages = listImages(SOURCE_DIR);
  console.log(`Found ${allImages.length} images to copy\n`);
  
  const copiedImages = [];
  let copiedCount = 0;
  
  for (const imgPath of allImages) {
    try {
      const destPath = getDestPath(imgPath);
      const wasCopied = copyFile(imgPath, destPath);
      if (wasCopied) {
        copiedImages.push({
          src: imgPath,
          dest: destPath,
          relative: path.relative(DEST_DIR, destPath)
        });
        copiedCount++;
      }
    } catch (error) {
      console.log(`  Error with ${imgPath}: ${error.message}`);
    }
  }
  console.log(`Copied ${copiedCount} images\n`);
  return copiedImages;
}

function updateMarkdownFiles(images) {
  console.log('Step 2: Updating heroImage in markdown files\n');
  
  const contentDirs = [
    path.join(CONTENT_DIR, 'actualites'),
    path.join(CONTENT_DIR, 'clubs'),
    path.join(CONTENT_DIR, 'cartes'),
    path.join(CONTENT_DIR, 'entrainements'),
    path.join(CONTENT_DIR, 'evenements')
  ];
  
  let updatedCount = 0;
  
  for (const contentDir of contentDirs) {
    if (!fs.existsSync(contentDir)) continue;
    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(contentDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      const hasPlaceholder = content.includes('blog-placeholder');
      if (!hasPlaceholder) continue;
      
      let articleYear = null;
      const yearMatch = file.match(/^(\d{4})-/);
      if (yearMatch) {
        articleYear = yearMatch[1];
      }
      
      if (!articleYear) {
        const pubDateMatch = content.match(/pubDate:\s*(\d{4})/);
        if (pubDateMatch) {
          articleYear = pubDateMatch[1];
        }
      }
      
      let bestImage = null;
      
      if (articleYear) {
        const yearImages = images.filter(img => img.relative.startsWith(articleYear));
        if (yearImages.length > 0) {
          bestImage = `/images/${yearImages[0].relative}`;
        }
      }
      
      if (!bestImage && images.length > 0) {
        const recentImages = images.filter(img => 
          img.relative.startsWith('2024') || img.relative.startsWith('2025') || img.relative.startsWith('2023')
        );
        if (recentImages.length > 0) {
          bestImage = `/images/${recentImages[0].relative}`;
        } else {
          bestImage = `/images/${images[0].relative}`;
        }
      }
      
      if (bestImage) {
        const newContent = content.replace(
          /(heroImage:\s*)['"].*?['"]/,
          `$1'${bestImage}'`
        );
        
        if (newContent !== content) {
          fs.writeFileSync(filePath, newContent);
          console.log(`  Updated: ${file} -> heroImage: '${bestImage}'`);
          updatedCount++;
        }
      }
    }
  }
  console.log(`\nUpdated ${updatedCount} articles\n`);
  return updatedCount;
}

function detectExternalImageLinks() {
  console.log('Step 3: Detecting external image links\n');
  
  const contentDirs = [
    path.join(CONTENT_DIR, 'actualites'),
    path.join(CONTENT_DIR, 'clubs'),
    path.join(CONTENT_DIR, 'cartes'),
    path.join(CONTENT_DIR, 'entrainements'),
    path.join(CONTENT_DIR, 'evenements')
  ];
  
  const externalLinks = [];
  
  for (const contentDir of contentDirs) {
    if (!fs.existsSync(contentDir)) continue;
    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(contentDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const urlPattern = /https?:\/\/[^\s\n\r\t()\[\]]+\.(jpg|jpeg|png|gif|webp|svg)/gi;
      const urls = content.match(urlPattern) || [];
      
      for (const url of urls) {
        externalLinks.push({ file, url, type: 'image' });
      }
      
      const photoLinks = /\[.*?\]\s*\((https?:\/\/[^\s\n\r\t()\[\]]+)\)/g;
      let match;
      while ((match = photoLinks.exec(content)) !== null) {
        const url = match[1];
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('photos') || lowerUrl.includes('photo') || 
            lowerUrl.includes('image') || lowerUrl.includes('img') ||
            lowerUrl.includes('gallery') || lowerUrl.includes('album')) {
          externalLinks.push({ file, url, type: 'photo_link' });
        }
      }
    }
  }
  
  console.log(`Found ${externalLinks.length} external image links:\n`);
  
  const uniqueLinks = [];
  const seen = new Set();
  for (const link of externalLinks) {
    const key = `${link.file}:${link.url}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueLinks.push(link);
    }
  }
  
  for (const link of uniqueLinks.slice(0, 20)) {
    console.log(`  ${link.type === 'image' ? '🖼️' : '🔗'} ${link.file}: ${link.url}`);
  }
  if (uniqueLinks.length > 20) {
    console.log(`  ... and ${uniqueLinks.length - 20} more`);
  }
  
  return externalLinks;
}

function generateReport(images, updatedCount, externalLinks) {
  console.log('\n' + '='.repeat(60));
  console.log('REPORT');
  console.log('='.repeat(60));
  console.log(`Images copied: ${images.length}`);
  console.log(`Articles updated: ${updatedCount}`);
  console.log(`External image links found: ${externalLinks.length}`);
  console.log('\nSample images in public/images/:');
  for (const img of images.slice(0, 10)) {
    console.log(`  /images/${img.relative}`);
  }
  if (images.length > 10) {
    console.log(`  ... and ${images.length - 10} more`);
  }
  console.log('\nNext steps:');
  console.log('  1. Check public/images/ directory');
  console.log('  2. Build with `npm run build`');
  console.log('  3. Verify images display correctly');
  console.log('='.repeat(60));
}

function main() {
  console.log('\n' + '='.repeat(60));
  console.log('CO77 IMAGE SETUP SCRIPT');
  console.log('='.repeat(60) + '\n');
  const images = copyAllImages();
  const updatedCount = updateMarkdownFiles(images);
  const externalLinks = detectExternalImageLinks();
  generateReport(images, updatedCount, externalLinks);
  console.log('\nDone!\n');
}

main();
