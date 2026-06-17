## Context

Current state: Astro 6 site with basic template structure including a `blog` collection. The existing structure has pages for home (index.astro), about (about.astro), and blog listing/individual posts. There is no clear organization for CO77-specific sections and content types.

Stakeholders: CO77 club members who need to access training information, event details, maps, and news. Content editors who will add weekly training sessions, competition details, and other content.

Constraints:
- Must work with Astro 6 static site generator
- Must preserve existing blog content
- Should leverage Astro's content collections feature for type-safe content
- Should be intuitive for non-technical content editors

## Goals / Non-Goals

**Goals:**
- Create a scalable folder structure that accommodates all CO77 sections
- Implement a navigation system that clearly presents all site sections
- Define content collections with appropriate schemas for each content type (Entrainements, Events, Blog posts, Maps)
- Ensure existing blog content is migrated to the new structure
- Make it easy for editors to add new content of any type

**Non-Goals:**
- Implementing the actual content (markdown files will be added later)
- Designing the visual UI/UX (focus is on structure and organization)
- Setting up a CMS (content will be managed via markdown files)
- Creating user authentication or member-only areas

## Decisions

### Folder Structure
**Decision**: Use a section-based folder organization under `src/pages/` with dedicated content collections.

```
src/
├── pages/
│   ├── index.astro                    # HomePage
│   ├── la-co/                         # La CO section
│   │   ├── index.astro
│   │   ├── decouvrir/                 # Decouvrir
│   │   │   └── index.astro
│   │   ├── les-clubs/                 # Les Clubs
│   │   │   └── index.astro
│   │   ├── le-haut-niveau/            # Le Haut Niveau
│   │   │   └── index.astro
│   │   └── les-courses-dans-la-region/  # Les courses dans la region
│   │       └── index.astro
│   ├── actualites/                    # Blog - Actualites section
│   │   ├── index.astro
│   │   ├── resultats-et-news/         # Resultat et News
│   │   │   └── index.astro
│   │   ├── photos/                    # Photos
│   │   │   └── index.astro
│   │   └── portraits/                 # Portrait des orienteurs
│   │       └── index.astro
│   ├── organisation/                  # Nos organisation section
│   │   └── index.astro
│   ├── cartographie/                  # Cartographie section
│   │   └── index.astro
│   └── missions-cd/                   # Les missions du CD section
│       ├── index.astro
│       ├── entrainements/             # Les entrainements
│       │   └── index.astro
│       └── materiel/                  # Materiel
│           └── index.astro
```

**Rationale**: This mirrors the site navigation structure, making it intuitive. Astro's file-based routing automatically creates the correct URLs.

**Alternatives considered**: 
- Single-level pages folder with prefixed filenames (e.g., `missions-cd-entrainements.astro`) - rejected as less organized
- Using a `sections/` folder - rejected as it adds unnecessary nesting

### Content Collections Structure
**Decision**: Create separate content collections for each content type in `src/content/`:

```
src/content/
├── clubs/               # Clubs of the committee (one per club)
│   ├── club-name-1.md
│   ├── club-name-2.md
│   └── ...
├── entrainements/       # Weekly training sessions
│   ├── 2026-06-17.md
│   ├── 2026-06-24.md
│   └── ...
├── actualites/          # Blog posts / news
│   ├── resultats-et-news/
│   │   ├── competition-results-2026.md
│   │   └── ...
│   ├── photos/
│   │   ├── event-2026-06-01.md
│   │   └── ...
│   └── portraits/
│       ├── orienteur-john-doe.md
│       └── ...
├── evenements/          # Event details (competitions)
│   ├── competition-2026-07-01.md
│   └── ...
└── cartes/              # Maps
    ├── forest-sector.md
    └── ...
```

**Rationale**: Separating by content type allows:
- Type-specific schemas and validation
- Clear organization for content editors
- Ability to add type-specific logic in Astro
- Future flexibility to add more content types

**Alternatives considered**:
- Single `content/` folder with type prefixes in filenames - rejected as less maintainable
- Using frontmatter to distinguish types - rejected as it doesn't provide schema validation

### Navigation System
**Decision**: Two-level navigation with primary and secondary sections.

Primary navigation (main menu):
- Accueil (HomePage)
- La CO
- Actualités (Blog)
- Notre organisation
- Cartographie
- Missions du CD

Secondary navigation (under La CO):
- Découvrir
- Les Clubs
- Le Haut Niveau
- Les courses dans la région

Secondary navigation (under Actualités):
- Résultats et News
- Photos
- Portraits des orienteurs

Secondary navigation (under Missions du CD):
- Entraînements
- Matériel

**Rationale**: Matches CO77's organizational structure. Primary sections are top-level concerns, while sub-sections provide more granular navigation. The Actualités section now has three sub-categories for different types of content, and La CO has four sub-sections for different aspects of orienteering.

**Implementation**: Will use the existing `Header.astro` component, updating it to include the new navigation items. The `HeaderLink.astro` component will be reused for consistency. Secondary navigation can be implemented as dropdown menus or sub-navigation bars on the respective section pages.

### Content Type Schemas
**Decision**: Create JSON schema files for each collection to ensure data consistency.

Schemas will be created in `.astro/collections/`:
- `clubs.schema.json` - Fields: name, description, location, contactEmail, contactPhone, website, president, membersCount, logoPath, foundingYear
- `entrainements.schema.json` - Fields: title, date, rendezVous, parkingInfo, itinerary, description
- `evenements.schema.json` - Fields: title, date, location, price, areasOfExpertise, description, results
- `actualites.schema.json` - Extend existing blog schema with optional category field (resultats-et-news, photos, portraits)
- `cartes.schema.json` - Fields: title, imagePath, description, coordinates (optional), difficultyLevel

**Rationale**: Schema validation ensures:
- Required fields are always present
- Data types are consistent
- Content editors get clear guidance on what to provide
- Type safety in Astro components

**Alternatives considered**:
- Using TypeScript interfaces only - rejected as it doesn't provide runtime validation
- Using a single generic schema - rejected as it doesn't enforce type-specific requirements

### Routing for Content Types
**Decision**: Use collection-based routing for content listing and detail pages.

Pattern:
- `/la-co/` - La CO main page
- `/la-co/decouvrir/` - Decouvrir sub-section
- `/la-co/les-clubs/` - Les Clubs sub-section with club listings
- `/la-co/les-clubs/[...slug]/` - Individual club page
- `/la-co/le-haut-niveau/` - Le Haut Niveau sub-section
- `/la-co/les-courses-dans-la-region/` - Les courses dans la region sub-section
- `/actualites/` - List all news/blog posts
- `/actualites/resultats-et-news/` - List results and news articles
- `/actualites/resultats-et-news/[...slug]/` - Individual results/news article
- `/actualites/photos/` - List all photo galleries
- `/actualites/photos/[...slug]/` - Individual photo gallery
- `/actualites/portraits/` - List all orienteur portraits
- `/actualites/portraits/[...slug]/` - Individual portrait
- `/clubs/` - Alternative route to list all clubs (redirects to /la-co/les-clubs/)
- `/entrainements/` - List all training sessions
- `/entrainements/[...slug]/` - Individual training session details
- `/evenements/` - List all events
- `/evenements/[...slug]/` - Individual event details
- `/cartographie/` - List all maps with thumbnails
- `/cartographie/[...slug]/` - Individual map with full image and description

**Rationale**: Consistent pattern across all content types makes the site predictable and easy to navigate. The Actualités section has sub-routes for its three categories, and clubs can be accessed both via the La CO section and directly.

**Alternatives considered**:
- Date-based routing (e.g., `/actualites/2026/06/post-slug/`) - rejected as overkill for club site
- Flat routing with all content at root level - rejected as it would get cluttered

### Existing Content Migration
**Decision**: Keep existing blog content in a new `actualites/` collection with sub-categories, and update references.

The current `src/content/blog/` will be moved to `src/content/actualites/resultats-et-news/` to fit the new sub-category structure. The existing blog pages (`src/pages/blog/`) will be updated to reference the new location. The existing posts will need to be categorized into the appropriate sub-folders (resultats-et-news, photos, portraits) based on their content.

**Rationale**: Preserves existing content while fitting it into the new structure. The rename from "blog" to "actualites" better reflects the French terminology used by CO77, and the sub-categories provide better organization.

## Risks / Trade-offs

[Risk: Breaking existing links] → Mitigation: Set up redirects from old `/blog/` URLs to new `/actualites/` URLs using Astro's redirect configuration or Netlify redirects.

[Risk: Complexity for content editors with multiple collections] → Mitigation: Create clear documentation and potentially a simple admin guide for each content type.

[Risk: Performance impact from many collections] → Mitigation: Astro's content collections are optimized for static sites, and the expected volume (dozens to low hundreds of items) is well within performance limits.

[Risk: Schema changes breaking existing content] → Mitigation: Make schemas as permissive as possible initially, then tighten validation as patterns emerge. Use optional fields where appropriate.

## Migration Plan

1. Create new collection schemas (clubs, entrainements, evenements, cartes, actualites)
2. Create new empty collections (clubs, entrainements, evenements, cartes)
3. Create actualites sub-category folders (resultats-et-news, photos, portraits)
4. Move existing `src/content/blog/` content to `src/content/actualites/resultats-et-news/`
5. Update Astro config to register all new collections
6. Create all new section pages under `src/pages/` (la-co, actualites, organisation, cartographie, missions-cd with sub-sections)
7. Update navigation in Header.astro with primary and secondary navigation
8. Create collection listing and detail page templates for all content types
9. Add sample content to validate all schemas
10. Categorize existing blog posts into appropriate actualites sub-folders
11. Test all routes and content display
12. Set up redirects from old `/blog/` URLs to new `/actualites/` URLs

Rollback strategy: All changes are additive except the blog→actualites move. If issues arise, the blog collection can be restored from git history.

## Open Questions

- Should the "La CO" section have its own content collection for general orienteering information, or is it purely static pages?
- Should "Les Clubs" under La CO use the `clubs/` content collection, or should it be a separate listing page?
- Should "Nos organisation" be a single page or have sub-pages for different organizational aspects (committee members, structure, etc.)?
- For the Cartographie section, should maps be filterable by region/type/difficulty?
- Should past training sessions be archived after a certain period, or kept visible indefinitely?
- Should events have a registration mechanism, or is that handled externally (e.g., via a form link)?
- Should the clubs collection be displayed only under La CO > Les Clubs, or also have a top-level /clubs/ route?
- For the Photos section under Actualités, should we support multiple images per gallery, or is one image per post sufficient?
