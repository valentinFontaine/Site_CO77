# homepage-recent-content Specification

## Purpose
Display the 3 most recent content items from any collection in a "Dernieres publications" section on the homepage using `getCollection`, allowing users to quickly see the latest updates across all content types.

## ADDED Requirements

### Requirement: Homepage displays recent content
The homepage SHALL include a "Dernieres publications" section that displays the 3 most recently published content items from across all content collections using `getCollection`.

#### Scenario: Recent content appears on homepage
- **WHEN** a user visits the homepage
- **THEN** they see a "Dernieres publications" section showing the 3 most recent content items from any collection

#### Scenario: Section shows content from any collection
- **WHEN** the homepage is displayed
- **THEN** the "Dernieres publications" section includes content from any content collection (actualites, clubs, cartes, entrainements, evenements)

### Requirement: Content is sorted by date
Content items in the "What's new?" section SHALL be sorted by their publication or creation date (`pubDate`) in descending order (newest first).

#### Scenario: Most recent content appears first
- **WHEN** the homepage displays the "What's new?" section
- **THEN** the newest content item appears first, followed by the second newest, then the third newest

### Requirement: Section uses getCollection
The "Dernieres publications" section SHALL use `getCollection()` from 'astro:content' to fetch content from all collections.

#### Scenario: Collection access for all collections
- **WHEN** the homepage is built
- **THEN** it uses `getCollection('<collection-name>')` for each collection

#### Scenario: Merge and sort content
- **WHEN** content is fetched from multiple collections
- **THEN** all content is merged, sorted by `data.pubDate`, and top 3 are selected

### Requirement: Section shows content metadata
Each content item in the "Dernieres publications" section SHALL display at minimum its title and publication date, with a link to the full content page using `{post.data.title}` pattern.

#### Scenario: Content items have proper metadata
- **WHEN** a content item is displayed in the "Dernieres publications" section
- **THEN** it shows the title (from `data.title`), publication date, and a link to view the full content

#### Scenario: Links point to correct detail pages
- **WHEN** a user clicks on a content item in the "What's new?" section
- **THEN** they are taken to the correct detail page for that content item

### Requirement: Section updates automatically
The "Dernieres publications" section SHALL update automatically when new content is added to any collection. No manual code changes SHALL be required.

#### Scenario: New content appears in section
- **WHEN** a new content item with a recent date is added to any collection
- **THEN** it automatically appears in the "Dernieres publications" section on the next build if it's among the 3 most recent

#### Scenario: Old content falls off section
- **WHEN** more than 3 content items exist
- **THEN** only the 3 most recent items are shown in the "Dernieres publications" section
