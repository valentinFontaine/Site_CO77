## ADDED Requirements

### Requirement: Interactive map display
The cartography page SHALL display an interactive Leaflet map centered on the Seine-et-Marne region.

#### Scenario: Map loads with default view
- **WHEN** user navigates to /cartographie/
- **THEN** an interactive map is displayed centered at coordinates [48.4545, 2.6532] with zoom level 11

#### Scenario: Map controls are available
- **WHEN** user views the cartography page
- **THEN** zoom controls (+/-) are visible in the top-left corner
- **AND** layer switcher control is visible in the top-right corner

#### Scenario: User can navigate the map
- **WHEN** user clicks and drags on the map
- **THEN** the map pans in the direction of the drag

#### Scenario: User can zoom the map
- **WHEN** user uses the zoom controls or scroll wheel
- **THEN** the map zoom level changes accordingly

### Requirement: Multiple base layers support
The map SHALL support multiple base layer options for users to choose from.

#### Scenario: Default base layer is displayed
- **WHEN** page loads
- **THEN** OpenStreetMap is displayed as the default base layer

#### Scenario: User can switch base layers
- **WHEN** user selects a different base layer from the layer switcher
- **THEN** the map switches to display the selected base layer

#### Scenario: IGN Plan layer is available
- **WHEN** user opens the layer switcher
- **THEN** IGN Plan option is available to select
