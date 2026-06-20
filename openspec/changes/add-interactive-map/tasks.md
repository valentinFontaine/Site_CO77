## 1. Setup and Dependencies

- [x] 1.1 Add Leaflet CSS and JS dependencies to the project (via CDN or package)
- [x] 1.2 Create directory structure for Map components (src/components/Map/)
- [x] 1.3 Copy map images from to_convert/ to public/images/cartes/ (PNG format only)
- [x] 1.4 Verify all PNG image files are accessible at their expected paths

## 2. Content Schema and Data Migration

- [x] 2.1 Update src/content.config.ts to add map-specific fields to cartes collection schema
- [x] 2.2 Create markdown files for the 3 example maps in src/content/cartes/
  - [x] 2.2.1 Rocher_des_Demoiselles.md (with metadata and page content)
  - [x] 2.2.2 sablons_franchard.md (with metadata and page content)
  - [x] 2.2.3 Melun_Beffroi_Montaigu.md (with metadata and page content)
- [x] 2.3 Extract bounds data from to_convert/cartes.json and add to each markdown frontmatter as [swLat, swLng, neLat, neLng]
- [x] 2.4 Add thumbnail image paths (PNG) to each markdown file
- [x] 2.5 Add descriptive content to markdown bodies (for the dedicated map pages)
- [x] 2.6 Remove or update the existing foret-fontainebleau.md to match new schema

## 3. Map Component Implementation

- [x] 3.1 Create src/components/Map/LeafletMap.ts
  - [x] 3.1.1 Import Leaflet types and initialize the map
  - [x] 3.1.2 Create mountMap function that takes container element, center coordinates, and zoom level
  - [x] 3.1.3 Add OpenStreetMap base layer as default
  - [x] 3.1.4 Add IGN Plan base layer option
  - [x] 3.1.5 Add layer control to switch between base layers
  - [x] 3.1.6 Export the map instance for overlay additions
- [x] 3.2 Create src/components/Map/Overlays.ts
  - [x] 3.2.1 Import map data from cartes collection
  - [x] 3.2.2 Create addCarteOverlays function that takes map instance and maps array
  - [x] 3.2.3 For each map, add an image overlay using bounds
  - [x] 3.2.4 For each map, add a marker at the center of bounds
  - [x] 3.2.5 Create custom icon for markers using thumbnail images
  - [x] 3.2.6 Add tooltip to each marker/overlay showing just the map title on hover
  - [x] 3.2.7 Add click handler to navigate to /cartographie/{map-id}/

## 4. Page Integration

- [x] 4.1 Update src/pages/cartographie/index.astro
  - [x] 4.1.1 Replace static list with map container div
  - [x] 4.1.2 Add Leaflet CSS link in head
  - [x] 4.1.3 Import map components and cartes collection
  - [x] 4.1.4 Initialize map on DOMContentLoaded
  - [x] 4.1.5 Add map instructions section (from to_convert/index-cartographie.astro)
  - [x] 4.1.6 Add "Acheter des cartes" section (from to_convert/index-cartographie.astro)
  - [x] 4.1.7 Add "Ressources pour les clubs" section (from to_convert/index-cartographie.astro)
  - [x] 4.1.8 Preserve BaseLayout usage for consistency

## 5. Styling and UI

- [x] 5.1 Add CSS for map container (height, rounded corners, shadow)
- [x] 5.2 Add CSS for custom popups (white background, border, border-radius, box-shadow)
- [x] 5.3 Style the marker icons (size, border, shadow)
- [x] 5.4 Style the image overlays (opacity, border, hover effects)
- [x] 5.5 Ensure responsive design works on mobile devices

## 6. Testing and Verification

- [x] 6.1 Verify all 3 map overlays are displayed on the map
- [x] 6.2 Verify markers are placed at correct positions
- [x] 6.3 Verify hovering a marker shows tooltip with map title
- [x] 6.4 Verify hovering an overlay shows tooltip with map title
- [x] 6.5 Verify clicking a marker navigates to correct map page
- [x] 6.6 Verify clicking an overlay navigates to correct map page
- [x] 6.7 Verify base layer switching works (OpenStreetMap ↔ IGN Plan)
- [x] 6.8 Verify zoom and pan controls work correctly
- [x] 6.9 Verify map instructions section is displayed correctly
- [x] 6.10 Verify all other page sections (Acheter, Ressources) are displayed
- [x] 6.11 Test on mobile viewport
- [x] 6.12 Test on desktop viewport

## 7. Cleanup

- [x] 7.1 Remove temporary files from to_convert/ if no longer needed
- [x] 7.2 Verify build completes without errors
- [ ] 7.3 Verify all links work correctly
- [ ] 7.4 Final review of all changes
