## ADDED Requirements

### Requirement: Primary navigation items
The site SHALL have a primary navigation menu with the following items in order:
1. Accueil (HomePage)
2. La CO
3. Actualités
4. Notre organisation
5. Cartographie
6. Missions du CD

#### Scenario: Primary navigation renders correctly
- **WHEN** a user visits any page
- **THEN** the header displays all 6 primary navigation items in the specified order

### Requirement: Secondary navigation for La CO
The La CO section SHALL have secondary navigation with the following items:
- Découvrir
- Les Clubs
- Le Haut Niveau
- Les courses dans la région

#### Scenario: La CO secondary navigation displays
- **WHEN** a user visits `/la-co/`
- **THEN** the page displays secondary navigation links to all 4 La CO sub-sections

### Requirement: Secondary navigation for Actualités
The Actualités section SHALL have secondary navigation with the following items:
- Résultats et News
- Photos
- Portraits des orienteurs

#### Scenario: Actualités secondary navigation displays
- **WHEN** a user visits `/actualites/`
- **THEN** the page displays secondary navigation links to all 3 Actualités sub-sections

### Requirement: Secondary navigation for Missions du CD
The Missions du CD section SHALL have secondary navigation with the following items:
- Entraînements
- Matériel

#### Scenario: Missions du CD secondary navigation displays
- **WHEN** a user visits `/missions-cd/`
- **THEN** the page displays secondary navigation links to both Missions du CD sub-sections

### Requirement: Navigation implementation in Header.astro
The primary navigation SHALL be implemented in the `Header.astro` component.

#### Scenario: Header component contains primary navigation
- **WHEN** the Header.astro component is rendered
- **THEN** it includes links to all primary navigation items

### Requirement: Breadcrumb navigation
The site SHALL display breadcrumb navigation showing the current page's position in the hierarchy.

#### Scenario: Breadcrumb displays on nested pages
- **WHEN** a user visits `/la-co/les-clubs/`
- **THEN** the breadcrumb displays: Accueil > La CO > Les Clubs

### Requirement: Active link highlighting
The current page SHALL be visually distinguished in the navigation menu.

#### Scenario: Active link is highlighted
- **WHEN** a user visits `/actualites/resultats-et-news/`
- **THEN** both "Actualités" in primary nav and "Résultats et News" in secondary nav are visually highlighted
