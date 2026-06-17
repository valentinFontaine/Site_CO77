## ADDED Requirements

### Requirement: Event content type exists
The site SHALL have an Evenements (event) content type for competitions and special events.

#### Scenario: Event collection is available
- **WHEN** the site is built
- **THEN** the evenements collection is registered and queryable

### Requirement: Event required fields
Each event SHALL have the following required fields:
- title (string)
- date (string, date or date-time format)
- location (string, event location/venue)

#### Scenario: Event with required fields is valid
- **WHEN** an event markdown file has title, date, and location
- **THEN** the event entry is valid

### Requirement: Event SHALL support optional fields
Each event MAY have the following optional fields:
- description (string, detailed event description)
- price (number or string, e.g., "10€", "Gratuit", 15)
- areasOfExpertise (array of strings, e.g., ["Course d'orientation", "Trail"])
- results (string, results summary or link to results)
- organizer (string, organizing entity)
- registrationLink (string, URL for registration)
- maxParticipants (number)
- startTime (string, time format)
- endTime (string, time format)

#### Scenario: Event with optional fields works
- **WHEN** an event markdown file includes price, areasOfExpertise, and registrationLink
- **THEN** the event entry is valid and displays the additional information

### Requirement: Event content in markdown format
Each event SHALL be defined as a markdown file in `src/content/evenements/` with frontmatter containing the event data.

#### Scenario: Event markdown file structure
- **WHEN** an event file is created at `src/content/evenements/competition-2026-07-01.md`
- **THEN** it SHALL have frontmatter with at least title, date, and location

### Requirement: Event listing page
The event listing page SHALL display upcoming and past events.

#### Scenario: Event listing shows all events
- **WHEN** a user visits `/evenements/`
- **THEN** all events are displayed sorted by date (upcoming first, then past)

#### Scenario: Upcoming events highlighted
- **WHEN** a user visits the event listing page
- **THEN** future events are visually distinguished and appear before past events

### Requirement: Event detail page
The event detail page SHALL display all fields for an event.

#### Scenario: Event detail shows complete information
- **WHEN** a user visits `/evenements/competition-2026-07-01/`
- **THEN** all event fields (title, date, location, price, areas of expertise, results, registration) are displayed

### Requirement: Event SHALL support categorization
Events MAY be filterable by areas of expertise.

#### Scenario: Filter events by expertise
- **WHEN** a user filters by "Course d'orientation"
- **THEN** only events with that area of expertise are displayed
