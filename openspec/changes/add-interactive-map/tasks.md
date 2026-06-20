## 1. Setup and Dependencies

- [ ] 1.1 Add Leaflet CSS and JS dependencies to the project (via CDN or package)
- [ ] 1.2 Create directory structure for Map components (src/components/Map/)
- [ ] 1.3 Copy map images from to_convert/ to public/images/cartes/ (PNG format only)
- [ ] 1.4 Verify all PNG image files are accessible at their expected paths

## 2. Content Schema and Data Migration

- [ ] 2.1 Update src/content.config.ts to add map-specific fields to cartes collection schema
- [ ] 2.2 Create markdown files for the 3 example maps in src/content/cartes/
  - [ ] 2.2.1 Rocher_des_Demoiselles.md (with metadata and page content)
  - [ ] 2.2.2 sablons_franchard.md (with metadata and page content)
  - [ ] 2.2.3 Melun_Beffroi_Montaigu.md (with metadata and page content)
- [ ] 2.3 Extract bounds data from to_convert/cartes.json and add to each markdown frontmatter as [swLat, swLng, neLat, neLng]
- [ ] 2.4 Add thumbnail image paths (PNG) to each markdown file
- [ ] 2.5 Add descriptive content to markdown bodies (for the dedicated map pages)
- [ ] 2.6 Remove or update the existing foret-fontainebleau.md to match new schema

## 3. Map Component Implementation

- [ ] 3.1 Create src/components/Map/LeafletMap.ts
  - [ ] 3.1.1 Import Leaflet types and initialize the map
  - [ ] 3.1.2 Create mountMap function that takes container element, center coordinates, and zoom level
  - [ ] 3.1.3 Add OpenStreetMap base layer as default
  - [ ] 3.1.4 Add IGN Plan base layer option
  - [ ] 3.1.5 Add layer control to switch between base layers
  - [ ] 3.1.6 Export the map instance for overlay additions
- [ ] 3.2 Create src/components/Map/Overlays.ts
  - [ ] 3.2.1 Import map data from cartes collection
  - [ ] 3.2.2 Create addCarteOverlays function that takes map instance and maps array
  - [ ] 3.2.3 For each map, add an image overlay using bounds
  - [ ] 3.2.4 For each map, add a marker at the center of bounds
  - [ ] 3.2.5 Create custom icon for markers using thumbnail images
  - [ ] 3.2.6 Add tooltip to each marker/overlay showing just the map title on hover
  - [ ] 3.2.7 Add click handler to navigate to /cartographie/{map-id}/

## 4. Page Integration

- [ ] 4.1 Update src/pages/cartographie/index.astro
  - [ ] 4.1.1 Replace static list with map container div
  - [ ] 4.1.2 Add Leaflet CSS link in head
  - [ ] 4.1.3 Import map components and cartes collection
  - [ ] 4.1.4 Initialize map on DOMContentLoaded
  - [ ] 4.1.5 Add map instructions section (from to_convert/index-cartographie.astro)
  - [ ] 4.1.6 Add "Acheter des cartes" section (from to_convert/index-cartographie.astro)
  - [ ] 4.1.7 Add "Ressources pour les clubs" section (from to_convert/index-cartographie.astro)
  - [ ] 4.1.8 Preserve BaseLayout usage for consistency

## 5. Styling and UI

- [ ] 5.1 Add CSS for map container (height, rounded corners, shadow)
- [ ] 5.2 Add CSS for custom popups (white background, border, border-radius, box-shadow)
- [ ] 5.3 Style the marker icons (size, border, shadow)
- [ ] 5.4 Style the image overlays (opacity, border, hover effects)
- [ ] 5.5 Ensure responsive design works on mobile devices

## 6. Testing and Verification

- [ ] 6.1 Verify all 3 map overlays are displayed on the map
- [ ] 6.2 Verify markers are placed at correct positions
- [ ] 6.3 Verify hovering a marker shows tooltip with map title
- [ ] 6.4 Verify hovering an overlay shows tooltip with map title
- [ ] 6.5 Verify clicking a marker navigates to correct map page
- [ ] 6.6 Verify clicking an overlay navigates to correct map page
- [ ] 6.7 Verify base layer switching works (OpenStreetMap ↔ IGN Plan)
- [ ] 6.8 Verify zoom and pan controls work correctly
- [ ] 6.9 Verify map instructions section is displayed correctly
- [ ] 6.10 Verify all other page sections (Acheter, Ressources) are displayed
- [ ] 6.11 Test on mobile viewport
- [ ] 6.12 Test on desktop viewport

## 7. Cleanup

- [ ] 7.1 Remove temporary files from to_convert/ if no longer needed
- [ ] 7.2 Verify build completes without errors
- [ ] 7.3 Verify all links work correctly
- [ ] 7.4 Final review of all changes
