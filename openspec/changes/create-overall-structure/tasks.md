## 1. Setup and Schema Creation

- [x] 1.1 Create clubs.schema.json in .astro/collections/ with required fields (name, description, location) and optional fields (contactEmail, contactPhone, website, president, membersCount, logoPath, foundingYear)
- [x] 1.2 Create entrainements.schema.json in .astro/collections/ with required fields (title, date, rendezVous, parkingInfo, itinerary) and optional fields (description, duration, difficulty, organizer, maxParticipants)
- [x] 1.3 Create evenements.schema.json in .astro/collections/ with required fields (title, date, location) and optional fields (description, price, areasOfExpertise, results, organizer, registrationLink, maxParticipants, startTime, endTime)
- [x] 1.4 Update existing blog.schema.json to actualites.schema.json with optional category field (resultats-et-news, photos, portraits)
- [x] 1.5 Create cartes.schema.json in .astro/collections/ with required fields (title, imagePath, description) and optional fields (coordinates, difficultyLevel, scale, mapType, lastUpdated, author, region)
- [x] 1.6 Update astro.config.mjs to register all new content collections (clubs, entrainements, evenements, cartes, actualites)

## 2. Folder Structure Creation

- [x] 2.1 Create src/pages/la-co/ folder with index.astro
- [x] 2.2 Create src/pages/la-co/decouvrir/ folder with index.astro
- [x] 2.3 Create src/pages/la-co/les-clubs/ folder with index.astro
- [x] 2.4 Create src/pages/la-co/le-haut-niveau/ folder with index.astro
- [x] 2.5 Create src/pages/la-co/les-courses-dans-la-region/ folder with index.astro
- [x] 2.6 Create src/pages/actualites/ folder with index.astro
- [x] 2.7 Create src/pages/actualites/resultats-et-news/ folder with index.astro
- [x] 2.8 Create src/pages/actualites/photos/ folder with index.astro
- [x] 2.9 Create src/pages/actualites/portraits/ folder with index.astro
- [x] 2.10 Create src/pages/organisation/ folder with index.astro
- [x] 2.11 Create src/pages/cartographie/ folder with index.astro
- [x] 2.12 Create src/pages/missions-cd/ folder with index.astro
- [x] 2.13 Create src/pages/missions-cd/entrainements/ folder with index.astro
- [x] 2.14 Create src/pages/missions-cd/materiel/ folder with index.astro

## 3. Content Collections Setup

- [x] 3.1 Create src/content/clubs/ folder for club markdown files
- [x] 3.2 Create src/content/entrainements/ folder for training markdown files
- [x] 3.3 Create src/content/evenements/ folder for event markdown files
- [x] 3.4 Create src/content/cartes/ folder for map markdown files
- [x] 3.5 Create src/content/actualites/ folder structure with sub-folders (resultats-et-news/, photos/, portraits/)

## 4. Existing Content Migration

- [x] 4.1 Move existing src/content/blog/*.md files to src/content/actualites/resultats-et-news/
- [x] 4.2 Update frontmatter in migrated blog posts to include category field
- [x] 4.3 Update src/pages/blog/index.astro to reference actualites collection or redirect
- [x] 4.4 Update src/pages/blog/[...slug].astro to work with new actualites structure
- [x] 4.5 Update about.astro to fit new structure if needed

## 5. Navigation Implementation

- [x] 5.1 Update Header.astro to include all primary navigation items (Accueil, La CO, Actualités, Notre organisation, Cartographie, Missions du CD)
- [x] 5.2 Implement secondary navigation display logic for La CO section pages
- [x] 5.3 Implement secondary navigation display logic for Actualités section pages
- [x] 5.4 Implement secondary navigation display logic for Missions du CD section pages
- [x] 5.5 Add active link highlighting CSS styles (in SubNav component)
- [x] 5.6 Implement breadcrumb navigation component
- [x] 5.7 Add breadcrumb to actualites detail pages (can be added to others as needed)

## 6. Collection Listing Pages

- [x] 6.1 Create club listing page (src/pages/la-co/les-clubs/index.astro) displaying all clubs from clubs collection
- [x] 6.2 Create training listing page (src/pages/missions-cd/entrainements/index.astro) displaying all trainings from entrainements collection
- [x] 6.3 Create event listing page (src/pages/evenements/index.astro) displaying all events from evenements collection
- [x] 6.4 Create map listing page (src/pages/cartographie/index.astro) displaying all maps from cartes collection
- [x] 6.5 Create actualites listing page (src/pages/actualites/index.astro) displaying content from all actualites sub-collections

## 7. Detail Page Templates

- [x] 7.1 Create club detail page template (src/pages/la-co/les-clubs/[...slug].astro)
- [x] 7.2 Create training detail page template (src/pages/missions-cd/entrainements/[...slug].astro)
- [x] 7.3 Create event detail page template (src/pages/evenements/[...slug].astro)
- [x] 7.4 Create map detail page template (src/pages/cartographie/[...slug].astro)
- [x] 7.5 Create actualites detail page templates for each sub-category
- [x] 7.6 Add image blur filter CSS for map images in cartes collection

## 8. Static Section Pages

- [x] 8.1 Create La CO main page (src/pages/la-co/index.astro) with overview and links to sub-sections
- [x] 8.2 Create Découvrir page (src/pages/la-co/decouvrir/index.astro) with orienteering introduction
- [x] 8.3 Create Le Haut Niveau page (src/pages/la-co/le-haut-niveau/index.astro)
- [x] 8.4 Create Les courses dans la région page (src/pages/la-co/les-courses-dans-la-region/index.astro)
- [x] 8.5 Create Actualités main page (src/pages/actualites/index.astro) with category links
- [x] 8.6 Create Résultats et News page (src/pages/actualites/resultats-et-news/index.astro)
- [x] 8.7 Create Photos page (src/pages/actualites/photos/index.astro)
- [x] 8.8 Create Portraits page (src/pages/actualites/portraits/index.astro)
- [x] 8.9 Create Organisation page (src/pages/organisation/index.astro)
- [x] 8.10 Create Cartographie main page (src/pages/cartographie/index.astro)
- [x] 8.11 Create Missions du CD main page (src/pages/missions-cd/index.astro)
- [x] 8.12 Create Matériel page (src/pages/missions-cd/materiel/index.astro)

## 9. Sample Content

- [x] 9.1 Create sample club markdown file in src/content/clubs/
- [x] 9.2 Create sample training markdown file in src/content/entrainements/
- [x] 9.3 Create sample event markdown file in src/content/evenements/
- [x] 9.4 Create sample map markdown file in src/content/cartes/
- [x] 9.5 Create sample actualites markdown files in each sub-category folder (existing blog posts migrated)

## 10. Testing and Redirects

- [x] 10.1 Test all primary navigation links
- [x] 10.2 Test all secondary navigation links
- [x] 10.3 Test all collection listing pages
- [ ] 10.4 Test all detail pages with sample content
- [x] 10.5 Set up redirects from old /blog/ URLs to /actualites/ (in astro.config.mjs)
- [x] 10.6 Test breadcrumb navigation on all pages
- [x] 10.7 Test active link highlighting
- [x] 10.8 Verify build succeeds with no errors
- [ ] 10.9 Test responsive design on mobile devices

## 11. Cleanup

- [x] 11.1 Remove old src/pages/blog/ folder if no longer needed
- [x] 11.2 Remove old .astro/collections/blog.schema.json if replaced
- [x] 11.3 Remove old src/content/blog/ directory
- [ ] 11.4 Commit all changes to git