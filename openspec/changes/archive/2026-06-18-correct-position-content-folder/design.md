## Context

The Site_CO77 project uses Astro v4+ which introduced a new approach for content collections configuration. Currently, there are two conflicting configuration files:

1. **`astro.config.mjs`** (new Astro v4+ approach): Correctly defines content collections (clubs, entrainements, evenements, actualites, cartes) with proper directory paths and schema references
2. **`src/content.config.ts`** (older approach): Incorrectly defines a `blog` collection pointing to non-existent `./src/content/blog/` directory, causing build warnings and collection access errors

The actual content files exist in `src/content/{clubs,entrainements,evenements,actualites,cartes}/` and are properly structured. The issue is purely a configuration conflict.

Astro v4+ recommends using `astro.config.mjs` for content collections configuration. The `src/content.config.ts` pattern was used in older versions and conflicts with the new approach when both exist.

## Goals / Non-Goals

**Goals:**
- Establish a single source of truth for content collections configuration
- Eliminate build warnings about non-existent directories
- Remove "collection does not exist or is empty" errors from page generation
- Ensure all pages can access content collections via `getCollection()` and `getEntries()`
- Maintain all existing content files and their accessibility

**Non-Goals:**
- Restructure or move existing content files (they are already in correct locations)
- Change the schema definitions for collections (they are correct in `.astro/collections/`)
- Modify page templates or routes
- Add new content collections

## Decisions

### Decision: Use Astro v4+ configuration approach in `astro.config.mjs`

**Chosen**: Keep and use `astro.config.mjs` as the single source of truth for content collections.

**Rationale**: 
- Astro v4+ officially recommends this approach
- It's already correctly configured with all five collections (clubs, entrainements, evenements, actualites, cartes)
- Schema files are properly referenced from `.astro/collections/`
- This is the modern, supported pattern

**Alternatives considered**:
1. **Migrate everything to `src/content.config.ts`**: Would require rewriting all collection definitions and potentially breaking existing imports. Rejected because it's the older pattern and more work.
2. **Keep both files**: Would continue to cause conflicts and errors. Rejected as it doesn't solve the problem.

### Decision: Remove `src/content.config.ts`

**Chosen**: Delete `src/content.config.ts` completely.

**Rationale**:
- It references a non-existent directory (`./src/content/blog/`)
- It uses the older configuration pattern that conflicts with Astro v4+
- It provides no value and only causes errors
- All collections it might have intended to define are already in `astro.config.mjs`

**Alternatives considered**:
1. **Fix and keep `src/content.config.ts`**: Would still conflict with `astro.config.mjs`. Rejected.
2. **Merge configurations**: Unnecessary complexity. Rejected.

### Decision: Verify no code imports from `src/content.config.ts`

**Chosen**: Search the codebase for any imports of collections from `src/content.config.ts` and update them if found.

**Rationale**: If any pages import collections from the old config, they need to be updated to use the Astro v4+ approach or the collections from `astro.config.mjs`.

**Implementation**: In Astro v4+, content collections are automatically available via `astro:content` after being defined in `astro.config.mjs`. No explicit imports are needed.

## Risks / Trade-offs

**[Risk] Some pages might import collections from the old config file** → Mitigation: Search for `from 'astro:content'` or `import.*content.config` patterns and verify they work with the unified config. If any imports reference the `blog` collection, update them to use existing collections.

**[Risk] Breaking existing functionality** → Mitigation: Test all collection listing pages after changes. The collections defined in `astro.config.mjs` already match the existing content structure, so this risk is low.

**[Risk] Missing collection in astro.config.mjs** → Mitigation: Verify all five collections (clubs, entrainements, evenements, actualites, cartes) are defined in `astro.config.mjs` with correct directory paths.

## Migration Plan

1. **Verify current state**: Confirm `astro.config.mjs` has all required collections correctly configured
2. **Check for imports**: Search codebase for any references to `src/content.config.ts` or the `blog` collection
3. **Remove old config**: Delete `src/content.config.ts`
4. **Test build**: Run `npm run build` to verify no warnings or errors
5. **Test pages**: Verify all collection listing pages work correctly
6. **Rollback**: If issues arise, the change is easily reversible by restoring `src/content.config.ts` from git

**Rollback strategy**: Since this is a file deletion, rollback is simple: `git checkout HEAD -- src/content.config.ts`

## Open Questions

- Are there any pages that explicitly import from `src/content.config.ts`? (To be verified during implementation)
- Should we also check if any TypeScript types or other files reference the old `blog` collection?
