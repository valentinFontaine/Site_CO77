# content-collections Specification

## Purpose
Establish separate content collections for each content type with a unified configuration to enable type-specific schemas and querying, eliminating configuration conflicts.
## Requirements
### Requirement: Separate content collections for each type
The site SHALL have separate Astro content collections for each content type to enable type-specific schemas and querying. All collections SHALL be configured in a single, unified configuration file (`src/content.config.ts`) to avoid conflicts.

#### Scenario: All content collections are registered
- **WHEN** Astro builds the site
- **THEN** the following content collections are available:
  - clubs
  - entrainements
  - actualites (with sub-collections)
  - evenements
  - cartes

### Requirement: Collections configured in src/content.config.ts
All content collections SHALL be defined in `src/content.config.ts` with correct directory paths and schema references.

#### Scenario: src/content.config.ts contains all collection definitions
- **WHEN** `src/content.config.ts` is examined
- **THEN** it contains collection definitions for: clubs, entrainements, actualites, evenements, cartes

### Requirement: Collection schemas exist
Each content collection SHALL have a corresponding JSON schema file in `.astro/collections/`.

#### Scenario: Schema files exist for all collections
- **WHEN** the project is set up
- **THEN** the following schema files exist:
  - `.astro/collections/clubs.schema.json`
  - `.astro/collections/entrainements.schema.json`
  - `.astro/collections/actualites.schema.json`
  - `.astro/collections/evenements.schema.json`
  - `.astro/collections/cartes.schema.json`

### Requirement: Content collections are type-safe
Content from each collection SHALL be type-safe and accessible via Astro's `getCollection()` and `getEntries()` functions. Collections SHALL be configured in `src/content.config.ts` to ensure proper TypeScript type generation.

#### Scenario: Type-safe content access
- **WHEN** a page imports and uses `getCollection('clubs')`
- **THEN** TypeScript SHALL provide autocomplete for club properties

#### Scenario: All collections accessible after removing old config
- **WHEN** any old conflicting configuration files are removed
- **THEN** all collections defined in `src/content.config.ts` remain accessible via `astro:content`

### Requirement: Actualites sub-collections
The actualites collection SHALL support sub-categories for different content types.

#### Scenario: Sub-collection folders work
- **WHEN** content is added to `src/content/actualites/resultats-et-news/`
- **THEN** it is accessible as part of the actualites collection with appropriate categorization

### Requirement: Collection listing pages
Each content collection SHALL have a listing page that displays all entries in that collection.

#### Scenario: Club listing page exists
- **WHEN** a user visits `/la-co/les-clubs/`
- **THEN** all clubs from the clubs collection are displayed

#### Scenario: Actualites listing page exists
- **WHEN** a user visits `/actualites/`
- **THEN** content from all actualites sub-collections is displayed

### Requirement: Detail pages for each content type
Each content collection SHALL have detail page templates that display individual entries.

#### Scenario: Club detail page works
- **WHEN** a user visits `/la-co/les-clubs/club-name/`
- **THEN** the individual club's information is displayed

#### Scenario: Training detail page works
- **WHEN** a user visits `/entrainements/2026-06-17/`
- **THEN** the individual training session details are displayed

