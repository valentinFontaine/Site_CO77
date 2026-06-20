## ADDED Requirements

### Requirement: Map markers for each map
Each map in the cartes collection SHALL have a marker displayed on the interactive map at its geographic bounds center.

#### Scenario: Marker is placed at map center
- **WHEN** a map has valid bounds
- **THEN** a marker is placed at the center of those bounds

#### Scenario: Marker uses map thumbnail as icon
- **WHEN** a map has a thumbnail field
- **THEN** the marker SHALL use that thumbnail image as its icon

#### Scenario: Default marker for maps without thumbnail
- **WHEN** a map does not have a thumbnail field
- **THEN** a default marker icon is used

### Requirement: Hover shows map title tooltip
When a user hovers over a map marker or overlay, a tooltip SHALL appear showing just the map title.

#### Scenario: Hovering marker shows tooltip
- **WHEN** user hovers over a map marker
- **THEN** a tooltip appears displaying the map's title

#### Scenario: Hovering overlay shows tooltip
- **WHEN** user hovers over a map image overlay
- **THEN** a tooltip appears displaying the map's title

#### Scenario: Tooltip disappears on mouse out
- **WHEN** user moves mouse away from marker or overlay
- **THEN** the tooltip disappears

### Requirement: Click navigates to map page
When a user clicks on a map marker or overlay, they SHALL be navigated to the dedicated map page.

#### Scenario: Clicking marker navigates to map page
- **WHEN** user clicks on a map marker
- **THEN** the browser navigates to `/cartographie/{map-id}/`

#### Scenario: Clicking overlay navigates to map page
- **WHEN** user clicks on a map image overlay
- **THEN** the browser navigates to `/cartographie/{map-id}/`

#### Scenario: Navigation uses correct map ID
- **WHEN** user clicks on any map element
- **THEN** the URL uses the map's ID from its markdown file (filename without extension)

### Requirement: Tooltip and click behavior
Tooltips and click handlers SHALL work consistently across all map elements.

#### Scenario: Tooltip is styled consistently
- **WHEN** a tooltip is displayed
- **THEN** it has white background, border, and readable text

#### Scenario: Click handler is responsive
- **WHEN** user clicks on a map element
- **THEN** navigation happens immediately without delay

#### Scenario: Both marker and overlay have same behavior
- **WHEN** user interacts with either marker or overlay for the same map
- **THEN** they both show the same tooltip and navigate to the same page
