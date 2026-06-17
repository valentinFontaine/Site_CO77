# content-listing-pages Specification

## Purpose
Ensure all content collections have automatic listing pages that display links to all content items using `getCollection`, enabling users to discover and access all content through the site navigation with a simplified flat architecture.

## ADDED Requirements

### Requirement: All content collections have listing pages
All content collections SHALL have corresponding index pages that automatically list all content items in that collection with links to their detail pages.

#### Scenario: Actualites listing page works
- **WHEN** a user visits `/actualites/`
- **THEN** all content items from `src/content/actualites/` are displayed with links to their individual pages

#### Scenario: Clubs listing page works
- **WHEN** a user visits `/la-co/les-clubs/`
- **THEN** all content items from the clubs collection are displayed with links to their individual pages

#### Scenario: All collections have listing pages
- **WHEN** a user visits the index page for any content collection (clubs, actualites, entrainements, evenements, cartes)
- **THEN** all entries in that collection are displayed with links to their detail pages

### Requirement: Listing pages use getCollection
All listing pages SHALL use `getCollection()` from 'astro:content' to retrieve content from their corresponding collection.

#### Scenario: Collection access pattern
- **WHEN** a listing page is built
- **THEN** it uses `getCollection('<collection-name>')` to fetch entries

#### Scenario: Access post data
- **WHEN** displaying a content item
- **THEN** the page accesses `post.data.title` and other metadata from the collection

### Requirement: Automatic updates when content changes
Listing pages SHALL automatically update to show new content items when markdown files are added to or removed from their corresponding content directories. No manual code changes SHALL be required.

#### Scenario: New content appears automatically
- **WHEN** a new markdown file is added to `src/content/actualites/`
- **THEN** the `/actualites/` page automatically includes a link to it on the next build

#### Scenario: Removed content disappears automatically
- **WHEN** a markdown file is removed from a content directory
- **THEN** the corresponding listing page no longer shows that content item on the next build

### Requirement: Consistent link format
All content links on listing pages SHALL follow a consistent format and point to the correct detail page URL.

#### Scenario: Links point to correct detail pages
- **WHEN** a user clicks on a content item link on `/actualites/`
- **THEN** they are taken to `/actualites/<slug>/` where they can view the full content

#### Scenario: Links include proper metadata
- **WHEN** content is displayed on a listing page
- **THEN** each link includes at minimum the content title, and optionally date, description, or category
