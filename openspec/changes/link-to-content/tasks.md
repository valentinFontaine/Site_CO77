## 1. Flatten Actualites Content Structure

- [ ] 1.1 Move markdown files from `src/content/actualites/resultats-et-news/` to `src/content/actualites/`
- [ ] 1.2 Move markdown files from `src/content/actualites/photos/` to `src/content/actualites/`
- [ ] 1.3 Move markdown files from `src/content/actualites/portraits/` to `src/content/actualites/`
- [ ] 1.4 Remove empty sub-collection directories from `src/content/actualites/`
- [ ] 1.5 Delete `src/pages/actualites/resultats-et-news/index.astro`
- [ ] 1.6 Delete `src/pages/actualites/photos/index.astro`
- [ ] 1.7 Delete `src/pages/actualites/portraits/index.astro`

## 2. Update Actualites Listing Page

- [ ] 2.1 Update `src/pages/actualites/index.astro` to use `getCollection('actualites')`
- [ ] 2.2 Ensure posts are sorted by `pubDate` (newest first)
- [ ] 2.3 Verify all posts display with title, date, and link to detail page
- [ ] 2.4 Test that the page builds without errors

## 3. Add "Dernieres publications" Section to Homepage

- [ ] 3.1 Import `getCollection` in `src/pages/index.astro`
- [ ] 3.2 Fetch all collections: actualites, clubs, cartes, entrainements, evenements
- [ ] 3.3 Merge all content into a single array
- [ ] 3.4 Sort merged content by `pubDate` in descending order
- [ ] 3.5 Select top 3 most recent items
- [ ] 3.6 Add "Dernieres publications" section heading to homepage
- [ ] 3.7 Display each of the 3 items with title, publication date, and link
- [ ] 3.8 Style the section to match site design
- [ ] 3.9 Test that the section renders correctly

## 4. Verify Other Collections

- [ ] 4.1 Check `src/pages/la-co/les-clubs/index.astro` uses `getCollection`
- [ ] 4.2 Check `src/pages/cartographie/index.astro` uses `getCollection`
- [ ] 4.3 Check `src/pages/missions-cd/entrainements/index.astro` uses `getCollection`
- [ ] 4.4 Check `src/pages/evenements/index.astro` uses `getCollection`
- [ ] 4.5 Verify detail pages work for all collections (clubs, cartes, entrainements, evenements)

## 5. Testing

- [ ] 5.1 Verify all content is accessible through navigation
- [ ] 5.2 Add a new test markdown file to `src/content/actualites/` and verify it appears automatically
- [ ] 5.3 Verify "Dernieres publications" section shows the 3 most recent items
- [ ] 5.4 Check that all links point to correct detail pages
- [ ] 5.5 Run full site build and verify no errors
- [ ] 5.6 Test on local server to ensure all pages render correctly