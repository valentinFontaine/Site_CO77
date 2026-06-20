// Map Overlays Component
// Adds map markers and image overlays to a Leaflet map

declare global {
  interface Window {
    L: any;
  }
}

// Interface for map data from the cartes collection
export interface Carte {
  id: string;
  data: {
    title: string;
    bounds?: [number, number, number, number];
    thumbnail?: string;
    description?: string;
  };
}

/**
 * Create a custom icon for map markers using the thumbnail image
 * @param thumbnailUrl - URL to the thumbnail image
 * @returns Leaflet icon instance
 */
function createCustomIcon(thumbnailUrl: string | undefined): any {
  if (!thumbnailUrl || typeof window === 'undefined' || !window.L) {
    // Return default icon if no thumbnail or Leaflet not loaded
    return typeof window !== 'undefined' && window.L ? window.L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      shadowSize: [41, 41]
    }) : null;
  }

  return window.L.icon({
    iconUrl: thumbnailUrl,
    iconSize: [32, 32], // Square thumbnail
    iconAnchor: [16, 16], // Center of the icon
    popupAnchor: [0, -16],
    className: 'map-marker-icon'
  });
}

/**
 * Calculate the center of bounds for placing a marker
 * @param bounds - Array of [swLat, swLng, neLat, neLng]
 * @returns Center coordinates as [lat, lng]
 */
function getBoundsCenter(bounds: [number, number, number, number]): [number, number] {
  const swLat = bounds[0], swLng = bounds[1];
  const neLat = bounds[2], neLng = bounds[3];
  
  const centerLat = (swLat + neLat) / 2;
  const centerLng = (swLng + neLng) / 2;
  
  return [centerLat, centerLng];
}

/**
 * Add overlays for all maps in the cartes collection
 * @param map - The Leaflet map instance
 * @param cartes - Array of carte objects from the content collection
 */
export function addCarteOverlays(map: any, cartes: Carte[]): void {
  if (typeof window === 'undefined' || !window.L || !map) {
    console.error('Cannot add overlays: Leaflet not loaded or map not initialized');
    return;
  }

  cartes.forEach((carte: Carte) => {
    const bounds = carte.data.bounds;
    const thumbnail = carte.data.thumbnail;
    const title = carte.data.title;
    const id = carte.id;

    if (!bounds || bounds.length !== 4) {
      console.warn(`Map ${title} (${id}) has invalid or missing bounds, skipping`);
      return;
    }

    // Convert bounds to Leaflet LatLngBounds format
    const latLngBounds = [
      [bounds[0], bounds[1]], // SW
      [bounds[2], bounds[3]]  // NE
    ] as [[number, number], [number, number]];

    // Create image overlay (initially hidden)
    if (thumbnail) {
      const overlay = window.L.imageOverlay(thumbnail, latLngBounds, {
        opacity: 0.7,
        className: 'map-image-overlay',
        interactive: true
      });

      // Add tooltip to overlay
      overlay.bindTooltip(title, {
        permanent: false,
        direction: 'center',
        className: 'custom-tooltip'
      });

      // Add click handler to navigate to map page
      overlay.on('click', () => {
        window.location.href = `/cartographie/${id}/`;
      });

      // Add hover effect
      overlay.on('mouseover', () => {
        overlay.setStyle({ opacity: 1.0 });
      });

      overlay.on('mouseout', () => {
        overlay.setStyle({ opacity: 0.7 });
      });

      // Add overlay to map but hide it initially
      overlay.addTo(map);
      
      // Store reference to the overlay on the map
      if (!map._carteOverlays) {
        map._carteOverlays = [];
      }
      map._carteOverlays.push(overlay);
    }

    // Add marker at the center of bounds
    const center = getBoundsCenter(bounds);
    const marker = window.L.marker(center, {
      icon: createCustomIcon(thumbnail),
      zIndexOffset: 1000 // Ensure markers are above overlays
    });

    // Add tooltip to marker
    marker.bindTooltip(title, {
      permanent: false,
      direction: 'top',
      className: 'custom-tooltip'
    });

    // Add click handler to navigate to map page
    marker.on('click', () => {
      window.location.href = `/cartographie/${id}/`;
    });

    // Add marker to map
    marker.addTo(map);

    // Store reference to the marker on the map
    if (!map._carteMarkers) {
      map._carteMarkers = [];
    }
    map._carteMarkers.push(marker);
  });

  // Fit map to show all overlays
  const allBounds = cartes
    .filter(c => c.data.bounds && c.data.bounds.length === 4)
    .map(c => [
      [c.data.bounds![0], c.data.bounds![1]],
      [c.data.bounds![2], c.data.bounds![3]]
    ]);

  if (allBounds.length > 0) {
    const groupBounds = window.L.latLngBounds(allBounds);
    // Don't auto-fit if we have a good default view
    // The page will handle the initial view
  }
}

/**
 * Remove all carte overlays and markers from the map
 * @param map - The Leaflet map instance
 */
export function removeCarteOverlays(map: any): void {
  if (!map) return;

  // Remove overlays
  if (map._carteOverlays) {
    map._carteOverlays.forEach((overlay: any) => {
      map.removeLayer(overlay);
    });
    map._carteOverlays = [];
  }

  // Remove markers
  if (map._carteMarkers) {
    map._carteMarkers.forEach((marker: any) => {
      map.removeLayer(marker);
    });
    map._carteMarkers = [];
  }
}