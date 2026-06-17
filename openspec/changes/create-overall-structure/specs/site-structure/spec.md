## ADDED Requirements

### Requirement: Section-based folder organization
The site SHALL use a section-based folder organization under `src/pages/` that mirrors the navigation structure.

#### Scenario: Primary sections exist as folders
- **WHEN** the site is built
- **THEN** the following primary section folders exist under `src/pages/`:
  - `la-co/`
  - `actualites/`
  - `organisation/`
  - `cartographie/`
  - `missions-cd/`

#### Scenario: Secondary sections exist as sub-folders
- **WHEN** the site is built
- **THEN** the following secondary section sub-folders exist:
  - `la-co/decouvrir/`
  - `la-co/les-clubs/`
  - `la-co/le-haut-niveau/`
  - `la-co/les-courses-dans-la-region/`
  - `actualites/resultats-et-news/`
  - `actualites/photos/`
  - `actualites/portraits/`
  - `missions-cd/entrainements/`
  - `missions-cd/materiel/`

### Requirement: Each section has an index page
Every section and sub-section SHALL have an `index.astro` file for its landing page.

#### Scenario: All index pages exist
- **WHEN** the site is built
- **THEN** every folder under `src/pages/` contains an `index.astro` file

### Requirement: Content collections folder structure
The site SHALL organize content types in separate folders under `src/content/`.

#### Scenario: Content collection folders exist
- **WHEN** the site is built
- **THEN** the following content collection folders exist under `src/content/`:
  - `clubs/`
  - `entrainements/`
  - `actualites/` (with sub-folders: `resultats-et-news/`, `photos/`, `portraits/`)
  - `evenements/`
  - `cartes/`

### Requirement: Assets organization
Static assets SHALL be organized under `src/assets/` with sub-folders for images, fonts, and documents.

#### Scenario: Assets folders exist
- **WHEN** the site is built
- **THEN** the following folders exist under `src/assets/`:
  - `images/`
  - `fonts/`
  - `documents/`
