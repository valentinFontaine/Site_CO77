## Why

Currently, content markdown files exist in the content collections (actualites, cartes, clubs, entrainements, evenements) but the architecture will be simplified to a flat structure. The actualites collection will contain all posts directly at the root level (no sub-collections). Some index pages don't automatically list or link to these content items. When new content files are added, there's no automatic way for users to discover or access them through the website navigation. Additionally, the homepage lacks a "What's new?" section to highlight recent content.

This change simplifies the architecture to one level and ensures all content is discoverable and accessible through automatic listing pages that update whenever new content is added.

## What Changes

- Simplify architecture: flatten actualites to one level (remove sub-collections: resultats-et-news, photos, portraits)
- Ensure all content collection index pages display links to their content items using `getCollection`
- Links update automatically when new markdown files are added to content directories
- No manual updates required when content changes
- Add a "Dernieres publications" section on the homepage displaying the 3 most recent content items from any collection

## Capabilities

### New Capabilities
- `content-listing-pages`: Automatic generation of listing pages for all content collections using `getCollection`, ensuring all content is discoverable through the site navigation
- `homepage-recent-content`: Display the 3 most recent content items from any collection in a "Dernieres publications" section on the homepage

### Modified Capabilities
- `content-collections`: Update to use flat structure for actualites collection (one level only)

## Impact

- Affects: All index.astro pages in src/pages/ that correspond to content collections
- Affects: Content file structure (flattening actualites sub-collections)
- Affects: Homepage (index.astro) to include the "Dernieres publications" section
- Existing content will be moved to flat structure and remain accessible
- New content added to any collection will automatically appear in listing pages and potentially in the homepage "Dernieres publications" section
