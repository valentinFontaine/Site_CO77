// Leaflet Map Component
// Initializes and configures a Leaflet map with base layers

declare global {
  interface Window {
    L: any;
  }
}

// Map instance storage
let mapInstance: any = null;

/**
 * Mount a Leaflet map on the specified container element
 * @param container - The HTML element to mount the map on
 * @param center - Center coordinates as [lat, lng]
 * @param zoom - Initial zoom level
 * @returns The Leaflet map instance
 */
export function mountMap(container: HTMLElement, center: [number, number], zoom: number): any {
  // Ensure Leaflet is loaded
  if (typeof window === 'undefined' || !window.L) {
    console.error('Leaflet is not loaded. Make sure to include Leaflet CSS and JS in your page.');
    return null;
  }

  // Create the map
  mapInstance = window.L.map(container).setView(center, zoom);

  // Add base layers
  const osmLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  const ignLayer = window.L.tileLayer('https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?layer=PLAN.IGNF&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={z}&TileCol={x}&TileRow={y}', {
    attribution: '<a href="https://www.ign.fr">IGN</a>',
    maxZoom: 19
  });

  // Add default layer
  osmLayer.addTo(mapInstance);

  // Create layer control
  const baseLayers = {
    'OpenStreetMap': osmLayer,
    'IGN Plan': ignLayer
  };

  window.L.control.layers(baseLayers).addTo(mapInstance);

  // Add zoom control
  window.L.control.zoom().addTo(mapInstance);

  return mapInstance;
}

/**
 * Get the current map instance
 * @returns The current Leaflet map instance or null if not initialized
 */
export function getMap(): any {
  return mapInstance;
}

/**
 * Set the map instance (useful for external initialization)
 * @param map - The Leaflet map instance
 */
export function setMap(map: any): void {
  mapInstance = map;
}

/**
 * Remove the current map instance
 */
export function removeMap(): void {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
}