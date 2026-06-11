// Geocoded coordinates for every location on the trip.
// [lat, lng]
const LOCATIONS = {
  "San Francisco Airport": [37.6213, -122.3790],
  "San Francisco": [37.7749, -122.4194],
  "Chowchilla": [37.1230, -120.2602],
  "San Luis Obispo": [35.2828, -120.6596],
  "Santa Barbara": [34.4208, -119.6982],
  "Los Angeles": [34.0522, -118.2437],
  "San Diego": [32.7157, -117.1611],
  "Palm Springs": [33.8303, -116.5453],
  "Phoenix": [33.4484, -112.0740],
  "Alamogordo": [32.8995, -105.9603],
  "Albuquerque": [35.0844, -106.6504],
  "Page": [36.9147, -111.4558],
  "Las Vegas": [36.1699, -115.1398],
  "Beaver": [38.2766, -112.6385],
  "Rexburg": [43.8260, -111.7897],
  "Boise": [43.6150, -116.2023],
  "Portland": [45.5152, -122.6784],
  "Seattle": [47.6062, -122.3321],
  "Vancouver": [49.2827, -123.1207],
  "Kamloops": [50.6745, -120.3273],
  "Calgary": [51.0447, -114.0719],
  "Great Falls": [47.4941, -111.2833],
  "Glendive": [47.1053, -104.7125],
  "Hot Springs": [43.4319, -103.4741],
  "Denver": [39.7392, -104.9903],
  "Amarillo": [35.2220, -101.8313],
  "Dallas": [32.7767, -96.7970],
  "Houston": [29.7604, -95.3698],
  "New Orleans": [29.9511, -90.0715],
  "West Memphis": [35.1465, -90.1845],
  "Louisville": [38.2527, -85.7585],
  "Indianapolis": [39.7684, -86.1581],
  "Kansas City": [39.0997, -94.5786],
  "Onalaska": [43.8841, -91.1993],
  "Chicago": [41.8781, -87.6298],
  "Windsor": [42.3149, -83.0364],
  "Toronto": [43.6532, -79.3832],
  "Montreal": [45.5017, -73.5673],
  "Boston": [42.3601, -71.0589],
  "New York": [40.7128, -74.0060],
  "Philadelphia": [39.9526, -75.1652],
  "Washington": [38.9072, -77.0369],
  "Charlotte": [35.2271, -80.8431],
  "Opelika": [32.6454, -85.3783],
  "Gainesville": [29.6516, -82.3248],
  "Orlando": [28.5383, -81.3792],
  "West Palm Beach": [26.7153, -80.0534],
  "Key West": [24.5551, -81.7800],
  "Miami": [25.7617, -80.1918],
  "Fort Lauderdale": [26.1224, -80.1373],
  "Fort Lauderdale Airport": [26.0742, -80.1506]
};

// Event type → icon character
const EVENT_ICONS = {
  "MLB": "⚾", "NFL": "🏈", "MLS": "⚽", "NCAAF": "🏈", "MotoGP": "🏁",
  "UFC": "🥊", "Boxing": "🥊", "WWE": "🤼", "Tennis": "🎾",
  "Concert": "🎤", "Comedy": "🎭", "Show": "📺"
};

let map, routeLayer, flightLayer, allMarkers = [];
let tripData = null;

// Build a great-circle arc between two points (for flights)
function greatCircleArc(start, end, segments = 64) {
  const [lat1, lon1] = start.map(d => d * Math.PI / 180);
  const [lat2, lon2] = end.map(d => d * Math.PI / 180);
  const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)));
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI;
    const lon = Math.atan2(y, x) * 180 / Math.PI;
    points.push([lat, lon]);
  }
  return points;
}

function createMarker(day, latlng) {
  let className = "marker-dot";
  let html = "";
  let size = 10;

  if (day.event) {
    className = "marker-dot marker-event";
    html = EVENT_ICONS[day.event.type] || "★";
    size = 24;
  } else if (day.type === "stay") {
    className = "marker-dot marker-stay";
    size = 12;
  } else if (day.type === "flight") {
    className = "marker-dot marker-airport";
    html = "✈";
    size = 20;
  }

  const icon = L.divIcon({
    className: className,
    html: html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });

  const marker = L.marker(latlng, { icon: icon });
  marker.on("click", () => showDayDetail(day));
  marker.bindTooltip(`Day ${day.day} · ${day.finish}`, { direction: "top", offset: [0, -size / 2] });
  return marker;
}

function showDayDetail(day) {
  const panel = document.getElementById("day-detail");
  const content = document.getElementById("detail-content");

  const dateObj = new Date(day.date);
  const dateStr = dateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  let html = `<h2>Day ${day.day}</h2><h3>${day.finish}</h3><p class="detail-date">${dateStr}</p>`;

  if (day.type === "drive" && day.miles) {
    html += `<div class="detail-section"><div class="detail-label">Drove</div><div class="detail-value detail-miles">${day.miles} mi · ${day.drivingTime}</div></div>`;
    if (day.start !== day.finish) {
      html += `<div class="detail-section"><div class="detail-label">Route</div><div class="detail-value">${day.start}${day.via ? " → " + day.via : ""} → ${day.finish}</div></div>`;
    }
  }

  if (day.event) {
    html += `<div class="detail-section"><div class="detail-label">Event</div><div class="detail-value"><span class="event-badge">${day.event.type}</span>${day.event.name}</div></div>`;
  }

  if (day.attractions && day.attractions.length) {
    html += `<div class="detail-section"><div class="detail-label">Attractions</div><ul>${day.attractions.map(a => `<li>· ${a}</li>`).join("")}</ul></div>`;
  }

  if (day.hotel) {
    html += `<div class="detail-section"><div class="detail-label">Hotel</div><div class="detail-value">${day.hotel}</div></div>`;
  }

  content.innerHTML = html;
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
}

function closeDayDetail() {
  const panel = document.getElementById("day-detail");
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
}

function renderRoute(upToDay) {
  if (routeLayer) routeLayer.remove();
  if (flightLayer) flightLayer.remove();
  allMarkers.forEach(m => m.remove());
  allMarkers = [];

  const drivePoints = [];
  const flightSegments = [];

  for (const day of tripData.days) {
    if (day.day > upToDay) break;
    const coord = LOCATIONS[day.finish];
    if (!coord) continue;

    if (day.type === "flight") {
      const startCoord = LOCATIONS[day.start];
      if (startCoord) flightSegments.push([startCoord, coord]);
    } else if (day.roadPoints && day.roadPoints.length > 0) {
      // Inject the realistic highway curves mapped out for this day
      drivePoints.push(...day.roadPoints);
    } else {
      // Straight line backup if routing API fails
      const last = drivePoints[drivePoints.length - 1];
      if (!last || last[0] !== coord[0] || last[1] !== coord[1]) {
        drivePoints.push(coord);
      }
    }

    // Marker for every day
    const marker = createMarker(day, coord);
    marker.addTo(map);
    allMarkers.push(marker);
  }

  if (drivePoints.length > 1) {
    routeLayer = L.polyline(drivePoints, {
      color: "#E85D2F", weight: 3, opacity: 0.85, lineJoin: "round"
    }).addTo(map);
  }

  if (flightSegments.length) {
    const flightLines = flightSegments.map(([a, b]) => greatCircleArc(a, b));
    flightLayer = L.layerGroup(flightLines.map(line =>
      L.polyline(line, { color: "#6B8FA8", weight: 2, opacity: 0.7, dashArray: "6, 6" })
    )).addTo(map);
  }
}

// Automatically convert straight drives into highway routing maps
async function loadRealisticRoads() {
  const promises = tripData.days.map(async (day) => {
    if (day.type === "drive" && day.start !== day.finish) {
      const startCoord = LOCATIONS[day.start];
      const finishCoord = LOCATIONS[day.finish];
      
      if (startCoord && finishCoord) {
        // OSRM expects [longitude, latitude] string formatting
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoord[1]},${startCoord[0]};${finishCoord[1]},${finishCoord[0]}?overview=full&geometries=geojson`;
        
        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            // Unpack highway nodes and invert back to [latitude, longitude] for Leaflet
            day.roadPoints = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            return;
          }
        } catch (e) {
          console.warn(`Routing server failed for Day ${day.day}. Reverting to straight connection line.`);
        }
      }
    }
    // Baseline backup assignment
    day.roadPoints = [];
  });

  await Promise.all(promises);
}

async function init() {
  map = L.map("map", { zoomControl: true, attributionControl: true }).setView([39.5, -98.5], 4);
  L.control.zoom({ position: "bottomright" }).remove();
  L.control.zoom({ position: "topright" }).addTo(map);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: "abcd", maxZoom: 19
  }).addTo(map);

  // Fetch and draw state boundary lines
  fetch("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json")
    .then(res => res.json())
    .then(geoData => {
      geoData.features = geoData.features.filter(feature => 
        !["Alaska", "Hawaii", "Puerto Rico"].includes(feature.properties.name)
      );

      L.geoJSON(geoData, {
        style: {
          color: "#718096",
          weight: 1.5,
          fillColor: "#EDF2F7",
          fillOpacity: 0.2
        }
      }).addTo(map);
    })
    .catch(err => console.error("Could not render state lines:", err));

  const res = await fetch("data/trip.json");
  tripData = await res.json();

  // Load actual driving layouts right before building timeline
  await loadRealisticRoads();

  // Populate stats
  document.getElementById("stat-days").textContent = tripData.stats.days;
  document.getElementById("stat-miles").textContent = tripData.stats.milesDriven.toLocaleString();
  document.getElementById("stat-states").textContent = tripData.stats.states;
  document.getElementById("stat-provinces").textContent = tripData.stats.provinces;

  renderRoute(93);

  // Fit map to the full route once loaded
  const allCoords = tripData.days.map(d => LOCATIONS[d.finish]).filter(Boolean);
  if (allCoords.length) {
    map.fitBounds(L.latLngBounds(allCoords), { padding: [60, 60] });
  }

  document.getElementById("close-detail").addEventListener("click", closeDayDetail);

  // Expose for timeline.js
  window.RT2K15 = { renderRoute, tripData };
}

init();
