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

const STATE_CODES = {
  "Alabama": "AL", "Arizona": "AZ", "Arkansas": "AR", "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
  "Alberta": "AB", "British Columbia": "BC", "Manitoba": "MB", "New Brunswick": "NB", "Newfoundland and Labrador": "NL", "Nova Scotia": "NS", "Ontario": "ON", "Prince Edward Island": "PE", "Quebec": "QC", "Saskatchewan": "SK"
};

const EVENT_ICONS = {
  "MLB": "⚾", "NFL": "🏈", "MLS": "⚽", "NCAAF": "🏈", "MotoGP": "🏁",
  "UFC": "🥊", "Boxing": "🥊", "WWE": "🤼", "Tennis": "🎾",
  "Concert": "🎤", "Comedy": "🎭", "Show": "📺"
};

// Global Tracking Variables
let map, routeLayer, activeLineLayer, flightLayer, allMarkers = [];
let tripData = null;

// --- DECOUPLED PHYSICS ENGINE VARIABLES ---
let carMarker = null; 
let lastUpToDay = -1;
let animationQueue = [];
let paintedPoints = [];
let carCurrentPos = null;
let lastEngineTime = null;

// SPEED CONTROLLER: Meters per second (Real world pacing)
// Adjust this if it is still too fast or too slow!
const CAR_SPEED = 250000; 

// --- DYNAMIC STYLING ---
const style = document.createElement('style');
style.innerHTML = `
  .marker-dot { background-color: #FFFFFF; border: 2px solid #00E5FF; border-radius: 50%; box-shadow: 0 0 8px rgba(0, 229, 255, 0.8); display: flex; align-items: center; justify-content: center; color: #111; font-size: 10px; transition: all 0.2s ease; }
  .marker-dot:hover { transform: scale(1.3); box-shadow: 0 0 12px rgba(0, 229, 255, 1); }
  .marker-event { background-color: #FF00FF; border-color: #FFF; font-size: 14px; box-shadow: 0 0 10px #FF00FF; }
  .marker-airport { background-color: #FFEB3B; border-color: #111; font-size: 12px; box-shadow: 0 0 10px #FFEB3B; }
  .leaflet-tooltip.state-label { background: transparent !important; border: none !important; box-shadow: none !important; color: rgba(255, 255, 255, 0.85); font-weight: 700; font-size: 14px; letter-spacing: 1px; text-shadow: 1px 1px 4px #000, -1px -1px 4px #000, 0px 0px 8px rgba(0,0,0,0.8); }
  
  /* The CX-5 Side Profile */
  .cx5-car { width: 56px; height: 32px; margin-left: -28px; margin-top: -16px; }
`;
document.head.appendChild(style);

function greatCircleArc(start, end, segments = 64) {
  const [lat1, lon1] = start.map(d => d * Math.PI / 180);
  const [lat2, lon2] = end.map(d => d * Math.PI / 180);
  const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat1 - lat2) / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)));
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    points.push([Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI, Math.atan2(y, x) * 180 / Math.PI]);
  }
  return points;
}

function createMarker(day, latlng) {
  let className = "marker-dot", html = "", size = 12;
  if (day.event) { className = "marker-dot marker-event"; html = EVENT_ICONS[day.event.type] || "★"; size = 24; }
  else if (day.type === "stay") { className = "marker-dot marker-stay"; size = 14; }
  else if (day.type === "flight") { className = "marker-dot marker-airport"; html = "✈"; size = 22; }

  const icon = L.divIcon({ className: className, html: html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
  const marker = L.marker(latlng, { icon: icon }).on("click", () => showDayDetail(day));
  marker.bindTooltip(`Day ${day.day} · ${day.finish}`, { direction: "top", offset: [0, -size / 2] });
  return marker;
}

function showDayDetail(day) {
  const panel = document.getElementById("day-detail"), content = document.getElementById("detail-content");
  const dateStr = new Date(day.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  let html = `<h2>Day ${day.day}</h2><h3>${day.finish}</h3><p class="detail-date">${dateStr}</p>`;

  if (day.type === "drive" && day.miles) {
    html += `<div class="detail-section"><div class="detail-label">Drove</div><div class="detail-value detail-miles">${day.miles} mi · ${day.drivingTime}</div></div>`;
    if (day.start !== day.finish) html += `<div class="detail-section"><div class="detail-label">Route</div><div class="detail-value">${day.start}${day.via ? " → " + day.via : ""} → ${day.finish}</div></div>`;
  }
  if (day.event) html += `<div class="detail-section"><div class="detail-label">Event</div><div class="detail-value"><span class="event-badge">${day.event.type}</span>${day.event.name}</div></div>`;
  if (day.attractions && day.attractions.length) html += `<div class="detail-section"><div class="detail-label">Attractions</div><ul>${day.attractions.map(a => `<li>· ${a}</li>`).join("")}</ul></div>`;
  if (day.hotel) html += `<div class="detail-section"><div class="detail-label">Hotel</div><div class="detail-value">${day.hotel}</div></div>`;

  content.innerHTML = html;
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
}

function closeDayDetail() {
  const panel = document.getElementById("day-detail");
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
}

// --- THE BUG-FREE PHYSICS ENGINE ---
function engineLoop(timestamp) {
  if (!lastEngineTime) lastEngineTime = timestamp;
  const dt = timestamp - lastEngineTime;
  lastEngineTime = timestamp;

  if (carQueue.length > 0 && carCurrentPos) {
    // Meters per millisecond (Adjust 0.05 to make it faster/slower)
    const speed = 0.05; 
    let distanceToTravel = speed * dt;

    while (distanceToTravel > 0 && carQueue.length > 0) {
      const targetPos = carQueue[0];
      const distToTarget = map.distance(carCurrentPos, targetPos);

      if (distToTarget <= distanceToTravel) {
        carCurrentPos = targetPos;
        carQueue.shift();
        distanceToTravel -= distToTarget;
      } else {
        const ratio = distanceToTravel / distToTarget;
        carCurrentPos = [
          carCurrentPos[0] + (targetPos[0] - carCurrentPos[0]) * ratio,
          carCurrentPos[1] + (targetPos[1] - carCurrentPos[1]) * ratio
        ];
        distanceToTravel = 0;
      }
    }
    if (carMarker) carMarker.setLatLng(carCurrentPos);
  }
  requestAnimationFrame(engineLoop);
}

function renderRoute(upToDay) {
  // 1. Keep markers and static lines
  if (routeLayer) routeLayer.remove();
  allMarkers.forEach(m => m.remove());
  allMarkers = [];

  let staticPoints = [];
  for (const day of tripData.days) {
    if (day.day > upToDay) break;
    let pts = (day.roadPoints && day.roadPoints.length > 0) ? day.roadPoints : [LOCATIONS[day.finish]];
    staticPoints.push(...pts);
    allMarkers.push(createMarker(day, LOCATIONS[day.finish]));
  }

  // 2. Draw historical route
  routeLayer = L.polyline(staticPoints, { color: "#00E5FF", weight: 4 }).addTo(map);

  // 3. ONLY push to queue if the timeline moved forward
  if (upToDay > lastUpToDay) {
    const currentDay = tripData.days.find(d => d.day === upToDay);
    if (currentDay && currentDay.roadPoints) {
      carQueue.push(...currentDay.roadPoints);
    }
  }
  lastUpToDay = upToDay;
}

  if (routeLayer) routeLayer.remove();
  if (flightLayer) flightLayer.remove();
  allMarkers.forEach(m => m.remove());
  allMarkers = [];

  let staticPoints = [];
  let animatePoints = [];
  const flightSegments = [];

  for (const day of tripData.days) {
    if (day.day > upToDay) break;
    const coord = LOCATIONS[day.finish];
    if (!coord) continue;

    if (day.type === "flight") {
      if (LOCATIONS[day.start]) flightSegments.push([LOCATIONS[day.start], coord]);
    } else {
      let pts = (day.roadPoints && day.roadPoints.length > 0) ? [...day.roadPoints] : [coord];
      
      if (day.day === upToDay && isPlaying) {
        animatePoints = pts;
        if (staticPoints.length > 0) animatePoints.unshift(staticPoints[staticPoints.length - 1]);
      } else {
        staticPoints.push(...pts);
      }
    }
    const marker = createMarker(day, coord);
    marker.addTo(map);
    allMarkers.push(marker);
  }

  // Instantly draw everything up to the previous day
  if (staticPoints.length > 1) {
    routeLayer = L.polyline(staticPoints, { color: "#00E5FF", weight: 4, opacity: 0.9, lineJoin: "round" }).addTo(map);
  }

  // Provide an active layer for the car to "paint"
  if (!activeLineLayer) {
    activeLineLayer = L.polyline([], { color: "#00E5FF", weight: 4, opacity: 0.9, lineJoin: "round" }).addTo(map);
  }

  if (isPlaying && animatePoints.length > 0) {
    carCurrentPos = animatePoints[0];
    paintedPoints = [carCurrentPos];
    animationQueue = animatePoints.slice(1);
  } else {
    // Scrubbing or Jumping: Snap everything instantly
    animationQueue = [];
    paintedPoints = [];
    activeLineLayer.setLatLngs([]);
    carCurrentPos = staticPoints.length ? staticPoints[staticPoints.length - 1] : null;
  }

  // Draw or Update the Car Marker
  if (carCurrentPos) {
    if (!carMarker) {
      const carHtml = `
        <div class="cx5-car">
          <svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="90" cy="82" rx="75" ry="10" fill="rgba(0,0,0,0.4)" filter="blur(3px)"/>
            <circle cx="45" cy="75" r="16" fill="#111" stroke="#333" stroke-width="2"/>
            <circle cx="45" cy="75" r="7" fill="#555"/>
            <circle cx="135" cy="75" r="16" fill="#111" stroke="#333" stroke-width="2"/>
            <circle cx="135" cy="75" r="7" fill="#555"/>
            <path d="M 15 65 Q 12 55 20 45 L 45 42 L 75 25 Q 95 22 135 25 L 160 45 Q 168 55 165 65 Q 160 70 150 70 L 148 68 Q 135 58 122 68 L 58 68 Q 45 58 32 68 L 20 70 Z" fill="#181818" stroke="#444" stroke-width="1.5"/>
            <path d="M 52 40 L 74 27 L 102 27 L 108 40 Z" fill="#080808"/>
            <path d="M 112 40 L 105 27 L 132 27 L 145 40 Z" fill="#080808"/>
            <path d="M 160 46 L 165 48 L 162 54 Z" fill="#FFFFEE"/>
            <path d="M 20 46 L 15 48 L 17 54 Z" fill="#FF2222"/>
          </svg>
        </div>
      `;
      carMarker = L.marker(carCurrentPos, {
        icon: L.divIcon({ className: 'moving-car-icon', html: carHtml, iconSize: [0, 0] }),
        zIndexOffset: 1000 
      }).addTo(map);
    } else {
      carMarker.setLatLng(carCurrentPos);
    }
  } else if (carMarker) {
    carMarker.remove();
    carMarker = null;
  }

  if (flightSegments.length) {
    const flightLines = flightSegments.map(([a, b]) => greatCircleArc(a, b));
    flightLayer = L.layerGroup(flightLines.map(line => L.polyline(line, { color: "#6B8FA8", weight: 2, opacity: 0.7, dashArray: "6, 6" }))).addTo(map);
  }
}

async function loadRealisticRoads() {
  const promises = tripData.days.map(async (day) => {
    if (day.type === "drive" && day.start !== day.finish) {
      if (LOCATIONS[day.start] && LOCATIONS[day.finish]) {
        const url = `https://router.project-osrm.org/route/v1/driving/${LOCATIONS[day.start][1]},${LOCATIONS[day.start][0]};${LOCATIONS[day.finish][1]},${LOCATIONS[day.finish][0]}?overview=full&geometries=geojson`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            day.roadPoints = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            return;
          }
        } catch (e) { console.warn(`Routing failed for Day ${day.day}.`); }
      }
    }
    day.roadPoints = [];
  });
  await Promise.all(promises);
}

async function init() {
  map = L.map("map", { zoomControl: false, attributionControl: true }).setView([39.5, -98.5], 4);
  L.control.zoom({ position: "bottomleft" }).addTo(map);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri', maxZoom: 19
  }).addTo(map);

  fetch("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json")
    .then(r => r.json()).then(g => {
      g.features = g.features.filter(f => !["Alaska", "Hawaii", "Puerto Rico"].includes(f.properties.name));
      L.geoJSON(g, { style: { color: "rgba(255,255,255,0.4)", weight: 1.2, fillOpacity: 0 }, onEachFeature: (f, l) => { if (STATE_CODES[f.properties.name]) l.bindTooltip(STATE_CODES[f.properties.name], { permanent: true, direction: "center", className: "state-label" }); } }).addTo(map);
    });

  fetch("https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/canada.geojson")
    .then(r => r.json()).then(g => {
      L.geoJSON(g, { style: { color: "rgba(255,255,255,0.4)", weight: 1.2, fillOpacity: 0 }, onEachFeature: (f, l) => { if (STATE_CODES[f.properties.name]) l.bindTooltip(STATE_CODES[f.properties.name], { permanent: true, direction: "center", className: "state-label" }); } }).addTo(map);
    });

  const res = await fetch("data/trip.json");
  tripData = await res.json();
  await loadRealisticRoads();

  document.getElementById("stat-days").textContent = tripData.stats.days;
  document.getElementById("stat-miles").textContent = tripData.stats.milesDriven.toLocaleString();
  document.getElementById("stat-states").textContent = tripData.stats.states;
  document.getElementById("stat-provinces").textContent = tripData.stats.provinces;

  renderRoute(93);

  const allCoords = tripData.days.map(d => LOCATIONS[d.finish]).filter(Boolean);
  if (allCoords.length) map.fitBounds(L.latLngBounds(allCoords), { padding: [60, 60] });
  document.getElementById("close-detail").addEventListener("click", closeDayDetail);
  
  // Kick off the physics engine
  requestAnimationFrame(engineLoop);
  window.RT2K15 = { renderRoute, tripData };
}

init();
