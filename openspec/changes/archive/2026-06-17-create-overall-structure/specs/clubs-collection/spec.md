## ADDED Requirements

### Requirement: Club content type exists
The site SHALL have a Club content type for representing each club in the CO77 committee.

#### Scenario: Club collection is available
- **WHEN** the site is built
- **THEN** the clubs collection is registered and queryable

### Requirement: Club required fields
Each club SHALL have the following required fields:
- name (string)
- description (string)
- location (string)

#### Scenario: Club with missing required field fails validation
- **WHEN** a club markdown file is missing the name field
- **THEN** the build process SHALL fail with a validation error

### Requirement: Club SHALL support optional fields
Each club MAY have the following optional fields:
- contactEmail (string, email format)
- contactPhone (string)
- website (string, URL format)
- president (string)
- membersCount (number)
- logoPath (string, path to logo image)
- foundingYear (number)

#### Scenario: Club with optional fields is valid
- **WHEN** a club markdown file includes a website and logoPath
- **THEN** the club entry is valid and can be built

### Requirement: Club content in markdown format
Each club SHALL be defined as a markdown file in `src/content/clubs/` with frontmatter containing the club data.

#### Scenario: Club markdown file structure
- **WHEN** a club file is created at `src/content/clubs/my-club.md`
- **THEN** it SHALL have frontmatter with at least name, description, and location
- **AND** the markdown body SHALL contain the club's detailed description

### Requirement: Club listing displays all clubs
The club listing page SHALL display all clubs in the collection.

#### Scenario: All clubs displayed
- **WHEN** a user visits the club listing page
- **THEN** all clubs from the clubs collection are displayed with their name, location, and logo (if available)

### Requirement: Club detail page displays all fields
The club detail page SHALL display all available fields for a club.

#### Scenario: Club detail page shows complete information
- **WHEN** a user visits an individual club page
- **THEN** all club fields (name, description, location, contact info, website, president, etc.) are displayed

### Requirement: Clubs accessible via La CO section
Clubs SHALL be accessible via the La CO > Les Clubs navigation path.

#### Scenario: Clubs accessible from La CO
- **WHEN** a user navigates to La CO > Les Clubs
- **THEN** the club listing page is displayed
