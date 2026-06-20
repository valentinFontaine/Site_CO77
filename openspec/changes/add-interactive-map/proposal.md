## Why

The current cartography page only displays a static list of maps. We need to add an interactive Leaflet map that allows users to explore maps geographically, click on map thumbnails to view details, and see the map content in a popup. This provides a much better user experience for discovering and browsing orientation maps by location.

The previous implementation (in the `to_convert/` folder) worked but was overly complex, requiring separate cartes.json, XML georeference files, and .astro files. The new approach simplifies this by storing all map metadata directly in markdown files within the `src/content/cartes/` collection.

## What Changes

- Add an interactive Leaflet map component to the cartography page
- Display map thumbnails as overlay markers on the interactive map
- On hover: Show a tooltip with just the map title
- On click: Navigate to the dedicated map page (`/cartographie/{map-id}/`)
- Store all map metadata in markdown files in `src/content/cartes/`
- Add map images to `public/images/cartes/` directory (PNG format only for transparency)
- Each markdown file's frontmatter will contain: title, bounds (as single array [swLat, swLng, neLat, neLng]), thumbnail path, difficulty, scale, etc.
- Each markdown file's body content will be displayed on the dedicated map page (not in a popup)
- Update the cartography page to render the interactive map instead of a static list
- Add Leaflet CSS and JS dependencies

## Capabilities

### New Capabilities
- `interactive-map`: Display an interactive Leaflet map with map overlay markers
- `map-collection-content`: Store map metadata and content in markdown files in src/content/cartes/
- `map-marker-popups`: Show map details from markdown content in popups when clicking markers
- `map-image-overlays`: Display map images as overlay layers on the interactive map

### Modified Capabilities

- `cartographie-page`: The cartography page will be modified to display the interactive map instead of a static list

## Impact

- **New Dependencies**: Leaflet library (CSS and JS)
- **New Files**:
  - `src/components/Map/LeafletMap.ts` - Map initialization and configuration
  - `src/components/Map/Overlays.ts` - Map overlay and marker logic
  - `public/images/cartes/` - Directory for map thumbnail images
  - Multiple markdown files in `src/content/cartes/` for each map
- **Modified Files**:
  - `src/pages/cartographie/index.astro` - Replace static list with interactive map
  - `src/content.config.ts` - Update cartes collection schema to include bounds and other map-specific fields
- **Removed**: The old static list display on the cartography page
