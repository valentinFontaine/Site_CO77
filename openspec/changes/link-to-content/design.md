## Context

The site uses Astro with content collections (actualites, cartes, clubs, entrainements, evenements). 

**Architecture simplification**: We are flattening the content structure. The actualites collection will contain all posts directly at the root level (no sub-collections like resultats-et-news, photos, or portraits). This simplifies the architecture to one level only.

Current state:
- Some collection index pages already list content (actualites, les-clubs, entrainements, cartographie, evenements)
- The homepage has no "What's new?" section
- Detail pages exist via [...slug].astro patterns for most collections

All content uses consistent frontmatter with `pubDate` for publication date.

## Goals / Non-Goals

**Goals:**
- Implement automatic content listing on all collection index pages
- Ensure all content is discoverable through navigation
- Add "What's new?" section to homepage showing 3 most recent items from any collection
- Links update automatically when content files are added/removed
- Maintain existing URL structures and routing patterns
- Simplify architecture: flat structure for actualites (no sub-collections)

**Non-Goals:**
- Change existing content collection schemas
- Modify existing working listing pages that already function correctly
- Implement pagination for listing pages
- Add search or filtering capabilities

## Decisions

### Decision: Use getCollection as the standard
**Chosen**: Use Astro's `getCollection()` API as the standard approach for all content collection access.

**Rationale**:
- Native Astro API, better integrated with the framework
- Type-safe with existing collection schemas
- Built-in support for content collections
- More maintainable and future-proof
- Already used successfully in existing pages (actualites, les-clubs, etc.)

**Implementation pattern**:
```javascript
import { getCollection } from 'astro:content';
const allPosts = await getCollection('actualites');
// Access post data
{post.data.title}
```

### Decision: Centralized recent content logic in homepage
**Chosen**: Use `getCollection()` to fetch all content collections, merge, sort by `pubDate`, take top 3.

**Rationale**:
- Consistent with the standard approach decided above
- Leverages existing collection infrastructure
- No new dependencies required
- Performance impact is minimal (build-time only, not runtime)
- Maintains static site benefits

**Implementation**:
```javascript
import { getCollection } from 'astro:content';
const allActualites = await getCollection('actualites');
const allClubs = await getCollection('clubs');
// ... for other collections
const allContent = [...allActualites, ...allClubs, ...];
const recentContent = allContent
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 3);
```

**Note on last edit date**: With Netlify + GitCMS, accessing git commit dates for last edit would require additional setup. For simplicity, we'll use the `pubDate` from frontmatter only. If last edit tracking is needed in the future, it can be added as a separate enhancement.

**Alternatives considered**:
- Create a dedicated "recent" collection: Would require duplicating content
- Use client-side fetching: Would lose static generation benefits

### Decision: Flat URL structure for actualites
**Chosen**: All actualites content will use flat URLs: `/actualites/<slug>/`

**Rationale**:
- Simplifies architecture (one level only)
- Easier to manage and navigate
- Consistent with other collections
- Better integration with `getCollection()` which works with flat collections

**Implementation**:
- Move all markdown files from `src/content/actualites/resultats-et-news/`, `src/content/actualites/photos/`, `src/content/actualites/portraits/` to `src/content/actualites/`
- Update [...slug].astro to handle flat structure (already works this way)
- Remove sub-collection index pages (resultats-et-news, photos, portraits) as they're no longer needed

### Decision: Reuse existing styling patterns
**Chosen**: Style new listing pages to match existing patterns (actualites/index.astro, les-clubs/index.astro).

**Rationale**:
- Maintains visual consistency across the site
- Reduces CSS duplication
- Easier maintenance

## Risks / Trade-offs

[Risk] Moving files might break existing links → Mitigation: Update redirects or ensure old URLs are handled by the flat structure

[Risk] Date comparison across collections might have inconsistencies → Mitigation: All collections already use `pubDate` in frontmatter with consistent format

[Risk] Homepage build time might increase with multiple glob imports → Mitigation: This happens at build time only; impact is negligible for current content volume

[Risk] Need to migrate existing content from sub-directories → Mitigation: Simple file move operation, can be done in one commit

## Migration Plan

### Phase 1: Flatten actualites content structure
- Move all markdown files from `src/content/actualites/resultats-et-news/` to `src/content/actualites/`
- Move all markdown files from `src/content/actualites/photos/` to `src/content/actualites/`
- Move all markdown files from `src/content/actualites/portraits/` to `src/content/actualites/`
- Remove empty sub-collection directories
- Remove sub-collection index pages: `src/pages/actualites/resultats-et-news/index.astro`, `src/pages/actualites/photos/index.astro`, `src/pages/actualites/portraits/index.astro`

### Phase 2: Update actualites listing page
- Update `src/pages/actualites/index.astro` to use `getCollection('actualites')`
- Ensure all posts are displayed with proper sorting by `pubDate`
- Use existing pattern already working in the page

### Phase 3: Add "Dernieres publications" section to homepage
- Add logic to `src/pages/index.astro` using `getCollection()` for all collections
- Fetch posts from actualites, clubs, cartes, entrainements, evenements
- Merge all content, sort by `pubDate`, take top 3
- Display with title and date using `{post.data.title}` pattern
- Section title: "Dernieres publications" (French)
- No "View all" link (as decided)
- Add proper styling to match site design

### Phase 4: Verify other collections
- Audit clubs, cartes, entrainements, evenements listing pages
- Ensure they all use `getCollection()` consistently
- Verify detail pages work for all collections

### Phase 5: Testing
- Verify all content is accessible through navigation
- Test that new content appears automatically
- Verify "Dernieres publications" section shows correct 3 most recent items
- Check that all links point to correct detail pages

**Rollback strategy**: All changes are trackable via git. Rollback = revert to previous commit. The content file moves are simple and reversible.

## Open Questions

- Do we need to handle edge cases where pubDate is missing from frontmatter? (Note: last edit date from git is not feasible with Netlify + GitCMS in current setup, so we'll use pubDate only)
