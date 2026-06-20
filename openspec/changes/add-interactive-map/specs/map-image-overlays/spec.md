## ADDED Requirements

### Requirement: Map image overlays
Each map SHALL have its thumbnail image displayed as an overlay on the map at its geographic bounds.

#### Scenario: Image overlay is added for each map
- **WHEN** the map page loads
- **THEN** each map's thumbnail image is added as an overlay layer

#### Scenario: Overlay is positioned using bounds
- **WHEN** a map image overlay is created
- **THEN** it is positioned using the map's bounds.sw and bounds.ne coordinates

#### Scenario: Overlay is initially hidden
- **WHEN** the page loads
- **THEN** map image overlays are not visible by default

#### Scenario: Overlay becomes visible when zoomed in
- **WHEN** user zooms into a map's bounds area
- **THEN** the overlay for that map becomes visible

### Requirement: Overlay interaction
Map image overlays SHALL be interactive with tooltip and click navigation.

#### Scenario: Clicking overlay navigates to map page
- **WHEN** user clicks on a map image overlay
- **THEN** the browser navigates to `/cartographie/{map-id}/`

#### Scenario: Overlay has hover effect
- **WHEN** user hovers over a map image overlay
- **THEN** the overlay's opacity increases to indicate it's interactive
- **AND** a tooltip showing the map title appears

### Requirement: Overlay styling
Map image overlays SHALL have appropriate styling for visibility and aesthetics.

#### Scenario: Overlay has transparency
- **WHEN** a map image overlay is displayed
- **THEN** it has a subtle opacity (e.g., 0.7) to show the base map underneath

#### Scenario: Overlay opacity on hover
- **WHEN** user hovers over a map image overlay
- **THEN** its opacity increases to 1.0

#### Scenario: Overlay has border
- **WHEN** a map image overlay is displayed
- **THEN** it has a colored border to distinguish it from the base map
