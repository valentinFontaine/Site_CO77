# maps-collection Specification

## Purpose
TBD - created by archiving change create-overall-structure. Update Purpose after archive.
## Requirements
### Requirement: Map content type exists
The site SHALL have a Cartes (map) content type for orienteering maps.

#### Scenario: Map collection is available
- **WHEN** the site is built
- **THEN** the cartes collection is registered and queryable

### Requirement: Map required fields
Each map SHALL have the following required fields:
- title (string, map name or area)
- imagePath (string, path to the map image)
- description (string, description of the map area)

#### Scenario: Map with required fields is valid
- **WHEN** a map markdown file has title, imagePath, and description
- **THEN** the map entry is valid

### Requirement: Map SHALL support optional fields
Each map MAY have the following optional fields:
- coordinates (object with lat/long or array of coordinates)
- difficultyLevel (string, e.g., "Facile", "Moyen", "Difficile", "Expert")
- scale (string, e.g., "1:10000")
- mapType (string, e.g., "Forêt", "Urbain", "Sprint")
- lastUpdated (string, date format)
- author (string, cartographer name)
- region (string, geographical region)

#### Scenario: Map with optional fields works
- **WHEN** a map markdown file includes difficultyLevel, scale, and region
- **THEN** the map entry is valid and displays the additional information

### Requirement: Map image is blurry/obscured
Map images SHALL be displayed in a blurry or obscured format to prevent unauthorized use.

#### Scenario: Blurry map image display
- **WHEN** a map page is viewed
- **THEN** the map image is displayed with a blur filter or watermark overlay

### Requirement: Map content in markdown format
Each map SHALL be defined as a markdown file in `src/content/cartes/` with frontmatter containing the map data.

#### Scenario: Map markdown file structure
- **WHEN** a map file is created at `src/content/cartes/forest-sector.md`
- **THEN** it SHALL have frontmatter with at least title, imagePath, and description

### Requirement: Map listing page
The map listing page SHALL display all maps with thumbnail previews.

#### Scenario: Map listing shows all maps
- **WHEN** a user visits `/cartographie/`
- **THEN** all maps are displayed with their title, thumbnail image, and brief description

#### Scenario: Map thumbnails are blurry
- **WHEN** a user views the map listing
- **THEN** all thumbnail images are displayed with blur filter applied

### Requirement: Map detail page
The map detail page SHALL display the full map image and all metadata.

#### Scenario: Map detail shows complete information
- **WHEN** a user visits `/cartographie/forest-sector/`
- **THEN** the full map image (blurry), description, and all metadata (scale, difficulty, region, etc.) are displayed

### Requirement: Map SHALL support filtering
Maps MAY be filterable by region, difficulty, or type.

#### Scenario: Filter maps by difficulty
- **WHEN** a user filters by difficulty "Moyen"
- **THEN** only maps with that difficulty level are displayed

