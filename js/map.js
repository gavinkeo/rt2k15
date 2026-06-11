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

const US_STATES_GEOJSON_URL = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";
const CANADA_PROVINCES_GEOJSON_URL = "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/canada.geojson";

// Event type → icon character
const EVENT_ICONS = {
  "MLB": "⚾", "NFL": "🏈", "MLS": "⚽", "NCAAF": "🏈", "MotoGP": "🏁",
  "UFC": "🥊", "Boxing": "🥊", "WWE": "🤼", "Tennis": "🎾",
  "Concert": "🎤", "Comedy": "🎭", "Show": "📺"
};

let map, routeLayer, flightLayer, boundaryLayer, regionLabelLayer, allMarkers = [];
let carMarker = null;
let tripData = null;
let lastRenderedDay = null;
let carAnimationFrame = null;
let carAnimationToken = 0;

const CAR_ANIMATION = {
  minMs: 1200,
  maxMs: 6500,
  msPerMile: 10
};

// Inject CSS for the car, state/province labels, and smooth marker rendering.
// Important: do NOT put a CSS transform transition on the Leaflet marker itself.
// Leaflet uses transform for positioning, and transitioning that is what creates the pinball effect.
const style = document.createElement("style");
style.innerHTML = `
  .moving-car-icon {
    pointer-events: none;
  }

  .cx5-car {
    width: 76px;
    height: 36px;
    margin-left: -38px;
    margin-top: -18px;
    transform-origin: 50% 50%;
    will-change: transform;
    filter: drop-shadow(0 3px 5px rgba(0,0,0,0.6));
  }

  .region-label {
    background: transparent;
    border: 0;
    pointer-events: none;
  }

  .region-label span {
    display: inline-block;
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    text-shadow:
      0 0 3px #000,
      0 0 5px #000,
      0 1px 2px #000;
    white-space: nowrap;
    transform: translate(-50%, -50%);
    opacity: 0.85;
  }

  .region-label.region-label-canada span {
    font-size: 11px;
    opacity: 0.9;
  }

  .region-label.label-hidden {
    display: none;
  }
`;
document.head.appendChild(style);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

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

// Calculate the heading angle for the car.
function getBearing(start, end) {
  const lat1 = start[0] * Math.PI / 180;
  const lon1 = start[1] * Math.PI / 180;
  const lat2 = end[0] * Math.PI / 180;
  const lon2 = end[1] * Math.PI / 180;
  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

function milesBetween(a, b) {
  const R = 3958.8;
  const lat1 = a[0] * Math.PI / 180;
  const lat2 = b[0] * Math.PI / 180;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLon = (b[1] - a[1]) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function routeDistanceMiles(points) {
  let miles = 0;
  for (let i = 1; i < points.length; i++) {
    miles += milesBetween(points[i - 1], points[i]);
  }
  return miles;
}

function pushPoint(points, point) {
  if (!point) return;
  const last = points[points.length - 1];
  if (!last || last[0] !== point[0] || last[1] !== point[1]) points.push(point);
}

function cleanPath(points) {
  const cleaned = [];
  points.forEach(point => pushPoint(cleaned, point));
  return cleaned;
}

function carHtml(rotationDeg = 0) {
  return `
    <div class="cx5-car" style="transform: rotate(${rotationDeg}deg);">
      <svg viewBox="0 0 240 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="cx5Body" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#4b4f55"/>
            <stop offset="0.45" stop-color="#15181d"/>
            <stop offset="1" stop-color="#050608"/>
          </linearGradient>
          <linearGradient id="cx5Glass" x1="0" x2="1">
            <stop offset="0" stop-color="#cfefff" stop-opacity="0.95"/>
            <stop offset="1" stop-color="#3c6f83" stop-opacity="0.95"/>
          </linearGradient>
        </defs>

        <!-- side-on SUV silhouette, nose points right -->
        <path d="M22 66 C25 47 42 37 64 36 L83 20 C92 13 103 10 116 10 L151 10 C163 10 174 15 185 25 L209 46 C220 48 229 56 232 68 L228 83 L16 83 Z"
              fill="url(#cx5Body)" stroke="#d6d9dc" stroke-width="2"/>
        <path d="M71 38 L91 20 L119 18 L119 40 Z" fill="url(#cx5Glass)" stroke="#101317" stroke-width="2"/>
        <path d="M123 18 L150 18 C160 18 169 23 178 36 L184 43 L123 40 Z" fill="url(#cx5Glass)" stroke="#101317" stroke-width="2"/>
        <path d="M42 65 C67 58 123 56 204 61" fill="none" stroke="#70757d" stroke-width="3" opacity="0.85"/>
        <path d="M35 78 L219 78" stroke="#c9ced4" stroke-width="1.5" opacity="0.55"/>
        <path d="M211 55 L229 60 L232 67 L212 65 Z" fill="#fff7b5" opacity="0.95"/>
        <path d="M19 66 L35 62 L35 71 L18 73 Z" fill="#ff3838" opacity="0.9"/>
        <circle cx="71" cy="82" r="20" fill="#070707" stroke="#d6d9dc" stroke-width="3"/>
        <circle cx="71" cy="82" r="9" fill="#7f8790"/>
        <circle cx="184" cy="82" r="20" fill="#070707" stroke="#d6d9dc" stroke-width="3"/>
        <circle cx="184" cy="82" r="9" fill="#7f8790"/>
        <path d="M103 48 L111 48 M150 48 L158 48" stroke="#d6d9dc" stroke-width="3" stroke-linecap="round"/>
        <text x="119" y="74" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="800" fill="#f2f2f2" opacity="0.9">CX-5</text>
      </svg>
    </div>
  `;
}

function bearingToCarRotation(bearing) {
  // The SVG's nose points right/east by default, whereas map bearing 0 points north.
  return bearing - 90;
}

function setCarHeading(start, end) {
  if (!carMarker || !start || !end) return;
  const iconDiv = carMarker.getElement()?.querySelector(".cx5-car");
  if (!iconDiv) return;
  iconDiv.style.transform = `rotate(${bearingToCarRotation(getBearing(start, end))}deg)`;
}

function ensureCarMarker(point, headingStart = null) {
  const headingEnd = headingStart || point;
  const rotation = headingStart ? bearingToCarRotation(getBearing(headingStart, point)) : 0;

  if (!carMarker) {
    carMarker = L.marker(point, {
      icon: L.divIcon({
        className: "moving-car-icon",
        html: carHtml(rotation),
        iconSize: [0, 0]
      }),
      zIndexOffset: 1000
    }).addTo(map);
  } else {
    carMarker.setLatLng(point);
    setCarHeading(headingStart || headingEnd, point);
  }
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

function buildRoute(upToDay) {
  const drivePoints = [];
  const flightSegments = [];

  for (const day of tripData.days) {
    if (Number(day.day) > Number(upToDay)) break;
    const coord = LOCATIONS[day.finish];
    if (!coord) continue;

    if (day.type === "flight") {
      const startCoord = LOCATIONS[day.start];
      if (startCoord) flightSegments.push([startCoord, coord]);
    } else if (day.roadPoints && day.roadPoints.length > 0) {
      day.roadPoints.forEach(point => pushPoint(drivePoints, point));
    } else {
      pushPoint(drivePoints, coord);
    }
  }

  return { drivePoints, flightSegments };
}

function getDayDrivePath(day) {
  if (!day || day.type !== "drive" || day.start === day.finish) return [];
  if (day.roadPoints && day.roadPoints.length > 1) return day.roadPoints;

  const startCoord = LOCATIONS[day.start];
  const finishCoord = LOCATIONS[day.finish];
  return startCoord && finishCoord ? [startCoord, finishCoord] : [];
}

function getAnimationPath(fromDay, toDay) {
  if (fromDay === null || fromDay === toDay) return [];

  const forward = Number(toDay) > Number(fromDay);
  const low = Math.min(Number(fromDay), Number(toDay));
  const high = Math.max(Number(fromDay), Number(toDay));
  const path = [];

  const range = tripData.days.filter(day => {
    const n = Number(day.day);
    return n > low && n <= high;
  });

  for (const day of range) {
    const dayPath = getDayDrivePath(day);
    dayPath.forEach(point => pushPoint(path, point));
  }

  const cleaned = cleanPath(path);
  return forward ? cleaned : cleaned.reverse();
}

function getMileageForDayRange(fromDay, toDay, fallbackPath) {
  if (fromDay === null || fromDay === toDay) return routeDistanceMiles(fallbackPath);

  const low = Math.min(Number(fromDay), Number(toDay));
  const high = Math.max(Number(fromDay), Number(toDay));
  const miles = tripData.days.reduce((total, day) => {
    const n = Number(day.day);
    const dayMiles = Number(String(day.miles || "").replace(/,/g, ""));
    return n > low && n <= high && day.type === "drive" && Number.isFinite(dayMiles) ? total + dayMiles : total;
  }, 0);

  return miles || routeDistanceMiles(fallbackPath);
}

function getAnimationDurationMs(fromDay, toDay, path) {
  const miles = getMileageForDayRange(fromDay, toDay, path);
  return clamp(miles * CAR_ANIMATION.msPerMile, CAR_ANIMATION.minMs, CAR_ANIMATION.maxMs);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function interpolatePoint(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t
  ];
}

function getPointAtDistance(path, cumulative, targetDistance) {
  for (let i = 1; i < path.length; i++) {
    if (targetDistance <= cumulative[i]) {
      const segmentDistance = cumulative[i] - cumulative[i - 1];
      const localT = segmentDistance === 0 ? 1 : (targetDistance - cumulative[i - 1]) / segmentDistance;
      return {
        point: interpolatePoint(path[i - 1], path[i], localT),
        previous: path[i - 1],
        next: path[i]
      };
    }
  }

  return {
    point: path[path.length - 1],
    previous: path[path.length - 2],
    next: path[path.length - 1]
  };
}

function animateCarAlongPath(path, durationMs) {
  const cleanedPath = cleanPath(path);
  if (cleanedPath.length < 2) return;

  const current = carMarker?.getLatLng();
  if (current) cleanedPath.unshift([current.lat, current.lng]);

  const animationPath = cleanPath(cleanedPath);
  if (animationPath.length < 2) return;

  if (carAnimationFrame) cancelAnimationFrame(carAnimationFrame);
  const token = ++carAnimationToken;

  const cumulative = [0];
  for (let i = 1; i < animationPath.length; i++) {
    cumulative[i] = cumulative[i - 1] + milesBetween(animationPath[i - 1], animationPath[i]);
  }

  const totalDistance = cumulative[cumulative.length - 1];
  const startedAt = performance.now();

  function step(now) {
    if (token !== carAnimationToken) return;

    const rawT = clamp((now - startedAt) / durationMs, 0, 1);
    const easedT = easeInOutCubic(rawT);
    const currentDistance = totalDistance * easedT;
    const { point, previous, next } = getPointAtDistance(animationPath, cumulative, currentDistance);

    ensureCarMarker(point, previous);
    setCarHeading(previous, next);

    if (rawT < 1) {
      carAnimationFrame = requestAnimationFrame(step);
    } else {
      const finalPoint = animationPath[animationPath.length - 1];
      const penultimate = animationPath[animationPath.length - 2];
      ensureCarMarker(finalPoint, penultimate);
      carAnimationFrame = null;
    }
  }

  carAnimationFrame = requestAnimationFrame(step);
}

function renderRoute(upToDay) {
  if (!tripData) return;

  const targetDayNumber = Number(upToDay);
  const previousDayNumber = lastRenderedDay === null ? null : Number(lastRenderedDay);

  if (routeLayer) routeLayer.remove();
  if (flightLayer) flightLayer.remove();
  allMarkers.forEach(m => m.remove());
  allMarkers = [];

  const { drivePoints, flightSegments } = buildRoute(targetDayNumber);

  for (const day of tripData.days) {
    if (Number(day.day) > targetDayNumber) break;
    const coord = LOCATIONS[day.finish];
    if (!coord) continue;

    const marker = createMarker(day, coord);
    marker.addTo(map);
    allMarkers.push(marker);
  }

  if (drivePoints.length > 1) {
    routeLayer = L.polyline(drivePoints, {
      color: "#00E5FF",
      weight: 4,
      opacity: 0.9,
      lineJoin: "round"
    }).addTo(map);

    const lastPoint = drivePoints[drivePoints.length - 1];
    const prevPoint = drivePoints[drivePoints.length - 2];

    if (previousDayNumber === null) {
      ensureCarMarker(lastPoint, prevPoint);
    } else {
      const animationPath = getAnimationPath(previousDayNumber, targetDayNumber);
      if (animationPath.length > 1) {
        animateCarAlongPath(animationPath, getAnimationDurationMs(previousDayNumber, targetDayNumber, animationPath));
      } else {
        ensureCarMarker(lastPoint, prevPoint);
      }
    }
  } else if (carMarker) {
    if (carAnimationFrame) cancelAnimationFrame(carAnimationFrame);
    carAnimationFrame = null;
    carMarker.remove();
    carMarker = null;
  }

  if (flightSegments.length) {
    const flightLines = flightSegments.map(([a, b]) => greatCircleArc(a, b));
    flightLayer = L.layerGroup(flightLines.map(line =>
      L.polyline(line, { color: "#6B8FA8", weight: 2, opacity: 0.7, dashArray: "6, 6" })
    )).addTo(map);
  }

  lastRenderedDay = targetDayNumber;
}

// Automatically convert straight drives into highway routing maps.
async function loadRealisticRoads() {
  const promises = tripData.days.map(async (day) => {
    if (day.type === "drive" && day.start !== day.finish) {
      const startCoord = LOCATIONS[day.start];
      const finishCoord = LOCATIONS[day.finish];

      if (startCoord && finishCoord) {
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoord[1]},${startCoord[0]};${finishCoord[1]},${finishCoord[0]}?overview=full&geometries=geojson`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            day.roadPoints = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            return;
          }
        } catch (e) {
          console.warn(`Routing server failed for Day ${day.day}. Reverting to straight connection line.`);
        }
      }
    }
    day.roadPoints = [];
  });

  await Promise.all(promises);
}

function getRegionName(feature) {
  const p = feature.properties || {};
  return p.name || p.NAME || p.NAME_1 || p.NAME_0 || p.prov_name_en || p.PRENAME || p.Province || p.province || p.NAME_EN || p.name_en || "";
}

function addRegionLabels(geoJsonLayer, countryClass) {
  geoJsonLayer.eachLayer(layer => {
    const name = getRegionName(layer.feature);
    if (!name || !layer.getBounds) return;

    const center = layer.getBounds().getCenter();
    const label = L.marker(center, {
      pane: "labelsPane",
      interactive: false,
      icon: L.divIcon({
        className: `region-label ${countryClass}`,
        html: `<span>${name}</span>`,
        iconSize: [0, 0]
      })
    });

    regionLabelLayer.addLayer(label);
  });
}

function updateRegionLabelVisibility() {
  if (!regionLabelLayer) return;
  const show = map.getZoom() >= 4;
  regionLabelLayer.eachLayer(label => {
    const el = label.getElement();
    if (el) el.classList.toggle("label-hidden", !show);
  });
}

async function loadBoundaryOverlays() {
  boundaryLayer = L.layerGroup().addTo(map);
  regionLabelLayer = L.layerGroup().addTo(map);

  try {
    const [usRes, canadaRes] = await Promise.all([
      fetch(US_STATES_GEOJSON_URL),
      fetch(CANADA_PROVINCES_GEOJSON_URL)
    ]);

    const [usStates, canadaProvinces] = await Promise.all([
      usRes.json(),
      canadaRes.json()
    ]);

    usStates.features = usStates.features.filter(feature =>
      !["Alaska", "Hawaii", "Puerto Rico"].includes(getRegionName(feature))
    );

    const usLayer = L.geoJSON(usStates, {
      pane: "boundariesPane",
      interactive: false,
      style: {
        color: "#FFFFFF",
        weight: 1,
        opacity: 0.85,
        fillOpacity: 0
      }
    });

    const canadaLayer = L.geoJSON(canadaProvinces, {
      pane: "boundariesPane",
      interactive: false,
      style: {
        color: "#FFFFFF",
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0
      }
    });

    boundaryLayer.addLayer(usLayer);
    boundaryLayer.addLayer(canadaLayer);

    addRegionLabels(usLayer, "region-label-us");
    addRegionLabels(canadaLayer, "region-label-canada");
    updateRegionLabelVisibility();
  } catch (err) {
    console.error("Could not render US/Canada boundary overlays:", err);
  }
}

async function init() {
  map = L.map("map", { zoomControl: true, attributionControl: true }).setView([39.5, -98.5], 4);
  L.control.zoom({ position: "bottomright" }).remove();
  L.control.zoom({ position: "topright" }).addTo(map);

  map.createPane("boundariesPane");
  map.getPane("boundariesPane").style.zIndex = 350;
  map.createPane("labelsPane");
  map.getPane("labelsPane").style.zIndex = 650;

  // --- SATELLITE MAP LAYER ---
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 19
  }).addTo(map);

  // --- US + CANADIAN BORDERS AND LABELS ---
  loadBoundaryOverlays();
  map.on("zoomend", updateRegionLabelVisibility);

  const res = await fetch("data/trip.json");
  tripData = await res.json();

  // Load actual driving layouts right before building timeline.
  await loadRealisticRoads();

  // Populate stats.
  document.getElementById("stat-days").textContent = tripData.stats.days;
  document.getElementById("stat-miles").textContent = tripData.stats.milesDriven.toLocaleString();
  document.getElementById("stat-states").textContent = tripData.stats.states;
  document.getElementById("stat-provinces").textContent = tripData.stats.provinces;

  renderRoute(93);

  // Fit map to the full route once loaded.
  const allCoords = tripData.days.map(d => LOCATIONS[d.finish]).filter(Boolean);
  if (allCoords.length) {
    map.fitBounds(L.latLngBounds(allCoords), { padding: [60, 60] });
  }

  document.getElementById("close-detail").addEventListener("click", closeDayDetail);

  // Expose for timeline.js.
  window.RT2K15 = { renderRoute, tripData };
}

init();
