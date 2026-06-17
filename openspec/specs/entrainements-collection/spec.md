# entrainements-collection Specification

## Purpose
TBD - created by archiving change create-overall-structure. Update Purpose after archive.
## Requirements
### Requirement: Training content type exists
The site SHALL have an Entrainements (training) content type for weekly training sessions.

#### Scenario: Training collection is available
- **WHEN** the site is built
- **THEN** the entrainements collection is registered and queryable

### Requirement: Training required fields
Each training session SHALL have the following required fields:
- title (string)
- date (string, date format)
- rendezVous (string, meeting point location)
- parkingInfo (string, parking availability and details)
- itinerary (string, description of route from parking to rendez-vous)

#### Scenario: Training with all required fields is valid
- **WHEN** a training markdown file has title, date, rendezVous, parkingInfo, and itinerary
- **THEN** the training entry is valid

### Requirement: Training SHALL support optional fields
Each training session MAY have the following optional fields:
- description (string, additional details)
- duration (string, estimated duration)
- difficulty (string, e.g., "Facile", "Moyen", "Difficile")
- organizer (string, who is organizing)
- maxParticipants (number)

#### Scenario: Training with optional fields works
- **WHEN** a training markdown file includes difficulty and organizer
- **THEN** the training entry is valid and displays the additional information

### Requirement: Training content in markdown format
Each training session SHALL be defined as a markdown file in `src/content/entrainements/` with frontmatter containing the training data.

#### Scenario: Training markdown file structure
- **WHEN** a training file is created at `src/content/entrainements/2026-06-17.md`
- **THEN** it SHALL have frontmatter with at least title, date, rendezVous, parkingInfo, and itinerary

### Requirement: Training listing page
The training listing page SHALL display upcoming and past training sessions.

#### Scenario: Training listing shows all sessions
- **WHEN** a user visits `/entrainements/`
- **THEN** all training sessions are displayed sorted by date (newest first)

#### Scenario: Upcoming trainings highlighted
- **WHEN** a user visits the training listing page
- **THEN** future training sessions are visually distinguished from past sessions

### Requirement: Training detail page
The training detail page SHALL display all fields for a training session.

#### Scenario: Training detail shows complete information
- **WHEN** a user visits `/entrainements/2026-06-17/`
- **THEN** all training fields (title, date, rendez-vous, parking, itinerary, description) are displayed

