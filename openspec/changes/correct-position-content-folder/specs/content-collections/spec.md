# content-collections Specification (Delta)

## Purpose
Update content-collections specification to ensure collections are configured without conflicts and are properly accessible through the Astro v4+ API.

## MODIFIED Requirements

### Requirement: Separate content collections for each type
The site SHALL have separate Astro content collections for each content type to enable type-specific schemas and querying. All collections SHALL be configured in a single, unified configuration file to avoid conflicts.

#### Scenario: All content collections are registered without conflicts
- **WHEN** Astro builds the site
- **THEN** the following content collections are available:
  - clubs
  - entrainements
  - actualites
  - evenements
  - cartes

#### Scenario: No conflicting configuration files exist
- **WHEN** the project is examined
- **THEN** only `astro.config.mjs` contains content collection configuration

### Requirement: Content collections are type-safe
Content from each collection SHALL be type-safe and accessible via Astro's `getCollection()` and `getEntries()` functions. Collections SHALL be configured in `astro.config.mjs` to ensure proper TypeScript type generation.

#### Scenario: Type-safe content access via astro.config.mjs
- **WHEN** a page imports and uses `getCollection('clubs')`
- **THEN** TypeScript SHALL provide autocomplete for club properties

#### Scenario: All collections accessible after removing old config
- **WHEN** `src/content.config.ts` is removed
- **THEN** all collections defined in `astro.config.mjs` remain accessible via `astro:content`

## ADDED Requirements

### Requirement: Collections configured in astro.config.mjs
All content collections SHALL be defined in `astro.config.mjs` with correct directory paths and schema references.

#### Scenario: astro.config.mjs contains all collection definitions
- **WHEN** `astro.config.mjs` is examined
- **THEN** it contains collection definitions for: clubs, entrainements, actualites, evenements, cartes

#### Scenario: Collection schemas are properly referenced
- **WHEN** `astro.config.mjs` is examined
- **THEN** each collection references its corresponding schema file from `.astro/collections/`
