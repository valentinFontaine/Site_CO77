## Why

The current Astro template has a basic structure with a blog collection, but lacks a comprehensive organizational framework tailored to CO77's specific needs. We need a clear, scalable structure to support multiple content types (trainings, events, blog posts, maps) and site sections (Home, Orientation Courses, Blog/News, Our Organization, Cartography, CD Missions). This will enable consistent content management and easy navigation for club members.

## What Changes

- Define a complete folder and file architecture for the Astro site with proper organization for all content types
- Establish a navigation and routing structure matching CO77's section requirements with primary and secondary navigation levels
- Create content collections for different content types: Clubs, Entrainements, Blog posts (with sub-categories: Resultats et News, Photos, Portraits des orienteurs), Event details, and Maps
- Set up appropriate schemas for each content type to ensure data consistency
- Organize existing blog content into the new structure with sub-categories

## Capabilities

### New Capabilities
- `site-structure`: Folder and file architecture definition for the entire site with all primary and secondary navigation sections
- `navigation-system`: Navigation and routing structure with all required sections (HomePage, La CO with sub-sections: Decouvrir, Les Clubs, Le Haut Niveau, Les courses dans la region; Actualites with sub-sections: Resultats et News, Photos, Portraits des orienteurs; Nos organisation, Cartographie, Les missions du CD with sub-sections: Entrainements, Materiel)
- `content-collections`: Content organization system with separate collections for Clubs, Entrainements, Blog posts, Event details, and Maps
- `clubs-collection`: Club content type with information for each club of the committee (name, description, location, contact info, website, president, members count, logo, founding year)
- `entrainements-collection`: Weekly training content type with rendez-vous location, parking information, and itinerary
- `events-collection`: Event detail content type for competition information, prices, and areas of expertise
- `maps-collection`: Map content type with blurry image and description

### Modified Capabilities


## Impact

- Existing blog collection will be restructured into the new content organization with sub-categories (resultats-et-news, photos, portraits)
- Current pages (index.astro, about.astro, blog pages) will need to be reorganized to fit the new navigation structure
- New schemas will be created for Clubs, Entrainements, Events, and Maps collections
- The Astro configuration will be updated to include all new content collections
- New section pages will be created for La CO, Actualites sub-sections, and all other primary and secondary navigation items
- Navigation component (Header.astro) will need significant updates to support the two-level navigation structure
