## Context

The current cartography page (`src/pages/cartographie/index.astro`) displays a static list of maps from the `cartes` content collection. The old implementation (preserved in `to_convert/`) had a working interactive Leaflet map but required a complex setup with:
- `cartes.json` - Array of map metadata (title, slug, description, thumbnail, bounds)
- XML georeference files (`.aux.xml`) for each map image
- World file (`.pgw`) for geospatial positioning
- Custom TypeScript components: `LeafletMap.ts` and `Overlays.ts`
- Generated cartes.json imported from a separate build process

The goal is to simplify this by storing all map metadata directly in markdown files and eliminating the need for separate JSON, XML, and world files.

## Goals / Non-Goals

**Goals:**
- Simplify map data management by using only markdown files in `src/content/cartes/`
- Replicate the interactive map functionality from the old build
- Display map thumbnails as markers/overlays on an interactive Leaflet map
- Show map title in a tooltip on hover
- Navigate to dedicated map page on click
- Make it easy to add new maps by simply creating a new markdown file
- Support multiple map overlays (IGN Plan, OpenStreetMap) as base layers

**Non-Goals:**
- Support for real-time map updates or live data
- Advanced GIS functionality (measurements, drawing tools, etc.)
- User authentication or authorization for map access
- Map editing capabilities through the web interface

## Decisions

### Use Leaflet for Mapping
**Decision**: Use Leaflet library for the interactive map.
**Rationale**: 
- Leaflet is lightweight, mobile-friendly, and has excellent documentation
- The old implementation already used Leaflet, so we maintain consistency
- Works well with static site generators like Astro
- Large ecosystem of plugins available if needed
**Alternatives Considered**:
- Mapbox GL JS: More features but heavier and requires API key
- OpenLayers: More powerful but steeper learning curve
- Google Maps: Requires API key and has usage limits

### Store Map Metadata in Markdown Frontmatter
**Decision**: Store all map metadata (title, bounds, thumbnail path, etc.) in the markdown file's frontmatter.
**Rationale**:
- Simplifies the workflow - one file per map instead of multiple files
- Leverages Astro's built-in content collections
- Metadata is co-located with content
- Easier to maintain and update
**Alternatives Considered**:
- Separate JSON file: Would require syncing with markdown files
- Database: Overkill for static site, adds complexity

### Use LatLng Bounds Format
**Decision**: Store map bounds as a single array `[swLat, swLng, neLat, neLng]` in frontmatter.
**Rationale**:
- Allows for more complex shapes in the future (polygons, polylines)
- Still compatible with Leaflet's LatLngBounds (can construct from two corners)
- More compact representation
- Flexible for future enhancements
**Alternatives Considered**:
- Separate sw/ne objects: More readable but less flexible for future complex shapes

### Client-side Map Initialization
**Decision**: Initialize and mount the Leaflet map on the client side using TypeScript.
**Rationale**:
- Leaflet requires a browser environment
- Allows for dynamic interaction
- Works well with Astro's island architecture
**Alternatives Considered**:
- Server-side rendering: Not possible with Leaflet
- Hybrid approach: More complex, no clear benefit

### Image Storage Location
**Decision**: Store map thumbnail images in `public/images/cartes/` directory.
**Rationale**:
- Public directory is the standard location for static assets in Astro
- Images are accessible via simple paths (e.g., `/images/cartes/map-name-thumb.png`)
- Separates content (markdown) from assets (images)
**Alternatives Considered**:
- `src/assets/cartes/`: Would require import statements
- External CDN: Adds complexity, not needed for current scale

## Risks / Trade-offs

**[Risk]**: Leaflet library size (~40KB gzipped) adds to page weight
→ **Mitigation**: Use CDN-hosted Leaflet CSS and JS to enable browser caching across sites

**[Risk]**: Map thumbnails are large images that could slow down the page
→ **Mitigation**: Use optimized/thumbnail-sized images (already have -thumb.png versions)

**[Risk]**: Too many map markers could clutter the map
→ **Mitigation**: Implement marker clustering if more than ~20 maps are added

**[Risk]**: Coordinate bounds might be inaccurate if manually entered
→ **Mitigation**: Provide a script/tool to calculate bounds from images (already exists in `to_convert/Add_map/`)

## Migration Plan

1. **Setup Phase**:
   - Add Leaflet dependency and CSS
   - Create Map component directory structure
   - Update cartes collection schema in content.config.ts

2. **Content Migration**:
   - Create markdown files for each map in `src/content/cartes/`
   - Copy map images to `public/images/cartes/`
   - Extract metadata from old cartes.json and add to markdown frontmatter
   - Use body content for popup text

3. **Implementation**:
   - Create LeafletMap.ts component
   - Create Overlays.ts component
   - Update cartographie/index.astro page

4. **Testing**:
   - Verify all maps display correctly on the interactive map
   - Verify clicking markers shows correct popup content
   - Verify map controls (zoom, layer switching) work

5. **Deployment**:
   - Standard Astro build and deploy process
   - No special migration needed - static site

**Rollback Strategy**: Since this is a static site, rollback is simply redeploying the previous build. No database migrations or data loss concerns.

## Open Questions

1. Should we support multiple image formats for map thumbnails (JPG, PNG, WebP)?
   - **Decision**: PNG only - required for transparency support

2. Should we add a list view alongside the map view?
   - **Decision**: No - the interactive map is sufficient, no list view needed
