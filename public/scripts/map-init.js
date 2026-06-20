// Map functions
function mountMap(container, center, zoom) {
  if (typeof L === 'undefined') {
    console.error('Leaflet is not loaded');
    return null;
  }
  
  var map = L.map(container).setView(center, zoom);
  
  // Add base layers
  var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  var ignLayer = L.tileLayer('https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?layer=PLAN.IGNF&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={z}&TileCol={x}&TileRow={y}', {
    attribution: '<a href="https://www.ign.fr">IGN</a>',
    maxZoom: 19
  });

  // Add default layer
  osmLayer.addTo(map);

  // Create layer control
  var baseLayers = {
    'OpenStreetMap': osmLayer,
    'IGN Plan': ignLayer
  };

  L.control.layers(baseLayers).addTo(map);
  L.control.zoom().addTo(map);

  return map;
}

function createCustomIcon(thumbnailUrl) {
  if (!thumbnailUrl || typeof L === 'undefined') {
    return L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      shadowSize: [41, 41]
    });
  }

  return L.icon({
    iconUrl: thumbnailUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    className: 'map-marker-icon'
  });
}

function getBoundsCenter(bounds) {
  return [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2];
}

function addCarteOverlays(map, cartes) {
  if (typeof L === 'undefined' || !map) {
    console.error('Cannot add overlays: Leaflet not loaded or map not initialized');
    return;
  }

  cartes.forEach(function(carte) {
    var bounds = carte.data.bounds;
    var thumbnail = carte.data.thumbnail;
    var title = carte.data.title;
    var id = carte.id;

    if (!bounds || bounds.length !== 4) {
      console.warn('Map ' + title + ' (' + id + ') has invalid or missing bounds, skipping');
      return;
    }

    // Convert bounds to Leaflet LatLngBounds format
    var latLngBounds = [
      [bounds[0], bounds[1]], // SW
      [bounds[2], bounds[3]]  // NE
    ];

    // Create image overlay (initially visible with opacity)
    if (thumbnail) {
      var overlay = L.imageOverlay(thumbnail, latLngBounds, {
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
      overlay.on('click', function() {
        window.location.href = '/cartographie/' + id + '/';
      });

      // Add hover effect
      overlay.on('mouseover', function() {
        overlay.setStyle({ opacity: 1.0 });
      });

      overlay.on('mouseout', function() {
        overlay.setStyle({ opacity: 0.7 });
      });

      // Add overlay to map
      overlay.addTo(map);
    }

    // Add marker at the center of bounds
    var center = getBoundsCenter(bounds);
    var marker = L.marker(center, {
      icon: createCustomIcon(thumbnail),
      zIndexOffset: 1000
    });

    // Add tooltip to marker
    marker.bindTooltip(title, {
      permanent: false,
      direction: 'top',
      className: 'custom-tooltip'
    });

    // Add click handler to navigate to map page
    marker.on('click', function() {
      window.location.href = '/cartographie/' + id + '/';
    });

    // Add marker to map
    marker.addTo(map);
  });
}

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', function() {
  var mapElement = document.getElementById('map');
  if (mapElement) {
    var mapData = JSON.parse(mapElement.getAttribute('data-map-data'));
    var map = mountMap(mapElement, [48.4545, 2.6532], 11);
    addCarteOverlays(map, mapData);
  }
});