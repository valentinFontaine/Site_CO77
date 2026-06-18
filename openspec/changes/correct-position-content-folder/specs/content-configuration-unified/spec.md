# content-configuration-unified Specification

## Purpose
Establish a single, unified configuration for content collections in Astro v4+ using `astro.config.mjs` as the source of truth, eliminating configuration conflicts and build errors.

## ADDED Requirements

### Requirement: Single source of truth for content collections
The site SHALL use `astro.config.mjs` as the single configuration file for all content collections.

#### Scenario: Only astro.config.mjs defines collections
- **WHEN** the Astro site is built
- **THEN** all content collections are defined exclusively in `astro.config.mjs`

#### Scenario: No conflicting configuration files exist
- **WHEN** the project is examined
- **THEN** no `src/content.config.ts` file exists in the project

### Requirement: All collections are accessible via Astro v4+ API
All content collections SHALL be accessible through Astro's `getCollection()` and `getEntries()` functions from the `astro:content` module.

#### Scenario: Collections available via getCollection
- **WHEN** a page imports and calls `getCollection('clubs')`
- **THEN** the function returns all entries from the clubs collection

#### Scenario: Collections available via getEntries
- **WHEN** a page imports and calls `getEntries('actualites')`
- **THEN** the function returns all entries from the actualites collection

### Requirement: No build warnings about missing directories
The build process SHALL complete without warnings about non-existent content directories.

#### Scenario: Clean build without glob-loader warnings
- **WHEN** `npm run build` is executed
- **THEN** no warnings about missing directories are displayed

#### Scenario: No collection existence errors during build
- **WHEN** `npm run build` is executed
- **THEN** no "The collection X does not exist or is empty" errors are displayed
