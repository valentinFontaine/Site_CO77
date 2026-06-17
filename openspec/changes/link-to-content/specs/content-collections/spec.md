# content-collections Specification (Delta)

## Purpose
Update the content-collections specification to use a flat structure for the actualites collection (one level only, no sub-collections).

## MODIFIED Requirements

### Requirement: Collection listing pages
Each content collection SHALL have a listing page that displays all entries in that collection.

#### Scenario: Club listing page exists
- **WHEN** a user visits `/la-co/les-clubs/`
- **THEN** all clubs from the clubs collection are displayed

#### Scenario: Actualites listing page exists with flat structure
- **WHEN** a user visits `/actualites/`
- **THEN** all posts from the flat `src/content/actualites/` directory are displayed

#### Scenario: All content collections have listing pages
- **WHEN** a user visits the index page for any content collection (clubs, actualites, entrainements, evenements, cartes)
- **THEN** all entries in that collection are displayed with links to their detail pages

#### Scenario: Flat structure for actualites
- **WHEN** content is added to `src/content/actualites/`
- **THEN** it appears in the `/actualites/` listing page without any sub-collection nesting
