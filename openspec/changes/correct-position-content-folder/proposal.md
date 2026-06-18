## Why

The project currently has content collections configured in two conflicting locations: `astro.config.mjs` (Astro v4+ approach) and `src/content.config.ts` (older pattern). The `src/content.config.ts` file defines a `blog` collection pointing to `./src/content/blog/` which does not exist, causing build warnings and errors. Meanwhile, the actual content (actualites, cartes, clubs, entrainements, evenements) is correctly defined in `astro.config.mjs` but pages fail to access these collections because they're being shadowed or confused by the incorrect configuration.

This causes "The collection X does not exist or is empty" errors on multiple pages and a glob-loader warning during build. The content folder structure exists and is correct, but the configuration files are misaligned.

## What Changes

- Remove the incorrect `src/content.config.ts` file that references non-existent `blog` collection
- Ensure all content collections (actualites, cartes, clubs, entrainements, evenements) are properly configured in `astro.config.mjs`
- Update any imports or references to use the correct content configuration from `astro.config.mjs`
- Verify all collection listings and detail pages work correctly with the unified configuration

## Capabilities

### New Capabilities
- `content-configuration-unified`: Single source of truth for content collections configuration in `astro.config.mjs`

### Modified Capabilities
- `content-collections`: Update to remove conflicting configuration and ensure all collections are properly accessible

## Impact

- Affects: `src/content.config.ts` (to be removed)
- Affects: `astro.config.mjs` (to be verified/updated if needed)
- Affects: All pages that use `getCollection()` or `getEntries()` functions
- Affects: Build process (will eliminate glob-loader warnings and collection errors)
- All existing content files in `src/content/` will remain unchanged and become properly accessible
- Pages using content collections will no longer show "collection does not exist" errors
