## MODIFIED Requirements

### Requirement: Cartographie page displays interactive map
The cartographie page SHALL display an interactive map with map overlays instead of a static list.

#### Scenario: Page loads with interactive map
- **WHEN** user navigates to /cartographie/
- **THEN** an interactive Leaflet map is displayed as the primary content

#### Scenario: Map replaces static list
- **WHEN** user navigates to /cartographie/
- **THEN** no static list of maps is displayed
- **AND** all maps are shown on the interactive map

#### Scenario: Page title and description are preserved
- **WHEN** user navigates to /cartographie/
- **THEN** the page title is "Cartographie En Seine et Marne"
- **AND** the description explains how to use the map

### Requirement: Map instructions are displayed
The page SHALL include instructions on how to use the interactive map.

#### Scenario: Instructions section is visible
- **WHEN** user views the cartographie page
- **THEN** a section with map usage instructions is displayed below the map

#### Scenario: Instructions explain map controls
- **WHEN** user reads the instructions
- **THEN** they learn how to switch base layers, hover over thumbnails, click on markers, and zoom/pan

### Requirement: Additional content sections are preserved
The page SHALL retain the existing content sections below the map.

#### Scenario: Acheter des cartes section is visible
- **WHEN** user scrolls down the page
- **THEN** the "Acheter des cartes de course d'orientation" section is displayed

#### Scenario: Ressources section is visible
- **WHEN** user scrolls down the page
- **THEN** the "Ressources pour les clubs du CDCO77" section is displayed
