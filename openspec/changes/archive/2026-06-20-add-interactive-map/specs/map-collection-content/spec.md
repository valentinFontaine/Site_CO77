## ADDED Requirements

### Requirement: Map metadata in markdown frontmatter
Each map in the cartes collection SHALL have metadata stored in its markdown file frontmatter.

#### Scenario: Map markdown file contains required frontmatter
- **WHEN** a markdown file is added to src/content/cartes/
- **THEN** it MUST contain frontmatter with at least: title, bounds (as array [swLat, swLng, neLat, neLng])

#### Scenario: Bounds format is validated
- **WHEN** a markdown file is processed
- **THEN** the bounds field MUST be an array of 4 numbers [swLat, swLng, neLat, neLng]

#### Scenario: Optional metadata fields are supported
- **WHEN** a markdown file contains optional fields
- **THEN** the system SHALL support: description, thumbnail, difficultyLevel, scale, mapType, region, author, lastUpdated

### Requirement: Markdown body is map page content
The body content of each markdown file SHALL be used as the main content on the dedicated map page.

#### Scenario: Markdown body renders on map page
- **WHEN** user navigates to `/cartographie/{map-id}/`
- **THEN** the rendered markdown body content is displayed as the page content

#### Scenario: HTML from markdown is sanitized
- **WHEN** markdown body is rendered on the map page
- **THEN** any HTML is properly escaped to prevent XSS

#### Scenario: Images in markdown are handled
- **WHEN** markdown body contains image references
- **THEN** images are displayed on the map page with appropriate styling

### Requirement: Collection schema enforces map-specific fields
The cartes collection schema SHALL be updated to include map-specific validation.

#### Scenario: Bounds are required
- **WHEN** a map markdown file is validated
- **THEN** the presence of bounds array with 4 coordinates is required

#### Scenario: Coordinates are valid numbers
- **WHEN** bounds are validated
- **THEN** each coordinate MUST be a valid number between -180 and 180 for longitude, -90 and 90 for latitude
