// Geocoded coordinates for every location on the trip.
// [lat, lng]
const LOCATIONS = {
  "San Francisco Airport": [37.6213, -122.3790],
  "Oakland": [37.8044, -122.2712],
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
  "Fort Lauderdale Airport": [26.0742, -80.1506],

  // Via/day-trip locations
  "San Mateo Hayward Bridge": [37.6096, -122.1474],
  "Richmond": [37.9358, -122.3477],
  "San Rafael Bridge": [37.9365, -122.4458],
  "Golden Gate Bridge": [37.8199, -122.4783],
  "Yosemite NP": [37.7456, -119.5936],
  "Monterey": [36.6002, -121.8947],
  "Carmel": [36.5552, -121.9233],
  "Santa Monica": [34.0195, -118.4912],
  "Venice Beach": [33.9850, -118.4695],
  "Long Beach": [33.7701, -118.1937],
  "La Jolla": [32.8328, -117.2713],
  "Las Cruces": [32.3199, -106.7637],
  "Grand Canyon": [36.0544, -112.1401],
  "Cedar City": [37.6775, -113.0619],
  "Salt Lake City": [40.7608, -111.8910],
  "Yellowstone NP": [44.4605, -110.8281],
  "Idaho Falls": [43.4927, -112.0408],
  "Twin Falls": [42.5629, -114.4609],
  "Lake Louise": [51.4254, -116.1773],
  "Banff": [51.1784, -115.5708],
  "Rapid City": [44.0805, -103.2310],
  "Scottsbluff": [41.8666, -103.6672],
  "Welcome to Oklahoma Sign, Devol OK": [34.1954, -98.5906],
  "Jackson": [32.2988, -90.1848],
  "Memphis": [35.1495, -90.0490],
  "Nashville": [36.1627, -86.7816],
  "Cincinnati": [39.1031, -84.5120],
  "Cincinnatti": [39.1031, -84.5120],
  "St Louis": [38.6270, -90.1994],
  "Notre Dame": [41.6993, -86.2389],
  "Detroit": [42.3314, -83.0458],
  "Niagara Falls": [43.0962, -79.0377],
  "Ottawa": [45.4215, -75.6972],
  "Kittery, ME": [43.0881, -70.7362],
  "Providence": [41.8240, -71.4128],
  "New Haven": [41.3083, -72.9279],
  "Delaware": [39.7391, -75.5398],
  "Baltimore": [39.2904, -76.6122],
  "Harpers Ferry": [39.3254, -77.7389],

  // Event venues
  "Oakland Coliseum": [37.7516, -122.2005],
  "Oracle Arena": [37.7503, -122.2030],
  "Hollywood Bowl": [34.1122, -118.3391],
  "ESPN Los Angeles Production Center": [34.0450, -118.2673],
  "Petco Park": [32.7073, -117.1566],
  "Chase Field": [33.4455, -112.0667],
  "MGM Grand Garden Arena": [36.1026, -115.1685],
  "Lumen Field": [47.5952, -122.3316],
  "Pepsi Center": [39.7487, -105.0077],
  "AT&T Stadium": [32.7473, -97.0945],
  "Cardinal Stadium": [38.2059, -85.7588],
  "Paul Brown Stadium": [39.0955, -84.5161],
  "Soldier Field": [41.8623, -87.6167],
  "U.S. Cellular Field": [41.8300, -87.6338],
  "Fenway Park": [42.3467, -71.0972],
  "MetLife Stadium": [40.8135, -74.0745],
  "Barclays Center": [40.6826, -73.9754],
  "Yankee Stadium": [40.8296, -73.9262],
  "USTA Billie Jean King National Tennis Center": [40.7505, -73.8470],
  "Citi Field": [40.7571, -73.8458],
  "Lincoln Financial Field": [39.9008, -75.1675],
  "Bank of America Stadium": [35.2258, -80.8528],

  // Optional event-location overrides
  "Arlington": [32.7357, -97.1081],
  "East Rutherford": [40.8336, -74.0971]
};

const LOCATION_REGION_LABELS = {
  "San Francisco Airport": "CA",
  "Oakland": "CA",
  "San Francisco": "CA",
  "Chowchilla": "CA",
  "San Luis Obispo": "CA",
  "Santa Barbara": "CA",
  "Los Angeles": "CA",
  "San Diego": "CA",
  "Palm Springs": "CA",
  "Phoenix": "AZ",
  "Alamogordo": "NM",
  "Albuquerque": "NM",
  "Page": "AZ",
  "Las Vegas": "NV",
  "Beaver": "UT",
  "Rexburg": "ID",
  "Boise": "ID",
  "Portland": "OR",
  "Seattle": "WA",
  "Vancouver": "BC",
  "Kamloops": "BC",
  "Calgary": "AB",
  "Great Falls": "MT",
  "Glendive": "MT",
  "Hot Springs": "SD",
  "Denver": "CO",
  "Amarillo": "TX",
  "Dallas": "TX",
  "Houston": "TX",
  "New Orleans": "LA",
  "West Memphis": "AR",
  "Louisville": "KY",
  "Indianapolis": "IN",
  "Kansas City": "MO",
  "Onalaska": "WI",
  "Chicago": "IL",
  "Windsor": "ON",
  "Toronto": "ON",
  "Montreal": "QC",
  "Boston": "MA",
  "New York": "NY",
  "Philadelphia": "PA",
  "Washington": "DC",
  "Charlotte": "NC",
  "Opelika": "AL",
  "Gainesville": "FL",
  "Orlando": "FL",
  "West Palm Beach": "FL",
  "Key West": "FL",
  "Miami": "FL",
  "Fort Lauderdale": "FL",
  "Fort Lauderdale Airport": "FL",

  "San Mateo Hayward Bridge": "CA",
  "Richmond": "CA",
  "San Rafael Bridge": "CA",
  "Golden Gate Bridge": "CA",
  "Yosemite NP": "CA",
  "Monterey": "CA",
  "Carmel": "CA",
  "Santa Monica": "CA",
  "Venice Beach": "CA",
  "Long Beach": "CA",
  "La Jolla": "CA",
  "Las Cruces": "NM",
  "Grand Canyon": "AZ",
  "Cedar City": "UT",
  "Salt Lake City": "UT",
  "Yellowstone NP": "WY",
  "Idaho Falls": "ID",
  "Twin Falls": "ID",
  "Lake Louise": "AB",
  "Banff": "AB",
  "Rapid City": "SD",
  "Scottsbluff": "NE",
  "Welcome to Oklahoma Sign, Devol OK": "OK",
  "Jackson": "MS",
  "Memphis": "TN",
  "Nashville": "TN",
  "Cincinnati": "OH",
  "Cincinnatti": "OH",
  "St Louis": "MO",
  "Notre Dame": "IN",
  "Detroit": "MI",
  "Niagara Falls": "ON",
  "Ottawa": "ON",
  "Kittery, ME": "ME",
  "Providence": "RI",
  "New Haven": "CT",
  "Delaware": "DE",
  "Baltimore": "MD",
  "Harpers Ferry": "WV",

  "Oakland Coliseum": "CA",
  "Oracle Arena": "CA",
  "Hollywood Bowl": "CA",
  "ESPN Los Angeles Production Center": "CA",
  "Petco Park": "CA",
  "Chase Field": "AZ",
  "MGM Grand Garden Arena": "NV",
  "Lumen Field": "WA",
  "Pepsi Center": "CO",
  "AT&T Stadium": "TX",
  "Cardinal Stadium": "KY",
  "Paul Brown Stadium": "OH",
  "Soldier Field": "IL",
  "U.S. Cellular Field": "IL",
  "Fenway Park": "MA",
  "MetLife Stadium": "NJ",
  "Barclays Center": "NY",
  "Yankee Stadium": "NY",
  "USTA Billie Jean King National Tennis Center": "NY",
  "Citi Field": "NY",
  "Lincoln Financial Field": "PA",
  "Bank of America Stadium": "NC",

  "Arlington": "TX",
  "East Rutherford": "NJ"
};

const EVENT_VENUE_OVERRIDES = {
  2: "Oakland Coliseum",
  3: "Oracle Arena",
  8: "Hollywood Bowl",
  9: "ESPN Los Angeles Production Center",
  13: "Petco Park",
  16: "Chase Field",
  24: "MGM Grand Garden Arena",
  31: "Lumen Field",
  40: "Pepsi Center",
  43: "AT&T Stadium",
  51: "Cardinal Stadium",
  52: "Paul Brown Stadium",
  57: "Soldier Field",
  59: "U.S. Cellular Field",
  65: "Fenway Park",
  66: "MetLife Stadium",
  67: "Barclays Center",
  70: "Yankee Stadium",
  71: "USTA Billie Jean King National Tennis Center",
  72: "Citi Field",
  74: "Lincoln Financial Field",
  78: "Bank of America Stadium"
};

const EVENT_ICONS = {
  "MLB": "⚾",
  "NFL": "🏈",
  "NCAAF": "🏈",
  "CFB": "🏈",
  "MLS": "⚽",
  "MotoGP": "🏁",
  "UFC": "🥊",
  "UFC189": "🥊",
  "Boxing": "🥊",
  "WWE": "🤼",
  "Tennis": "🎾",
  "Concert": "🎤",
  "Comedy": "🎭",
  "Show": "📺"
};

let map, routeLayer, activeLineLayer, flightLayer, allMarkers = [];
let tripData = null;

let carMarker = null;
let lastUpToDay = -1;
let animationQueue = [];
let paintedPoints = [];
let carCurrentPos = null;
let lastEngineTime = null;

let isRouteAnimating = false;
let routeAnimationResolvers = [];

let eventsModeActive = false;

const CAR_SPEED = 250000;

const LOCAL_DRIVING_MARKUP = 1.10;
const MILES_TO_KM = 1.609344;
const COUNTRIES_VISITED = 2;

const style = document.createElement("style");
style.innerHTML = `
  .marker-dot {
    background-color: #FFFFFF;
    border: 2px solid #00E5FF;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(0, 229, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #111;
    font-size: 10px;
    transition: all 0.2s ease;
  }

  .marker-dot:hover {
    transform: scale(1.3);
    box-shadow: 0 0 12px rgba(0, 229, 255, 1);
  }

  .marker-via {
    background-color: #FAFAF7;
    border-color: rgba(0, 229, 255, 0.95);
    box-shadow: 0 0 7px rgba(0, 229, 255, 0.65);
  }

  .marker-multi {
    background-color: #FFFFFF;
    border-color: #00E5FF;
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.95);
  }

  .marker-event {
    background-color: #FF00FF;
    border-color: #FFF;
    font-size: 14px;
    box-shadow: 0 0 12px #FF00FF;
  }

  .marker-airport {
    background-color: #FFEB3B;
    border-color: #111;
    font-size: 12px;
    box-shadow: 0 0 10px #FFEB3B;
  }

  .moving-car-icon {
    z-index: 99999 !important;
  }

  .cx5-car {
    width: 56px;
    height: 32px;
    margin-left: -28px;
    margin-top: -16px;
    position: relative;
    z-index: 99999;
    pointer-events: none;
  }

  .trip-menu {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 700;
    width: 300px;
    background: rgba(250, 250, 247, 0.96);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(20, 20, 20, 0.12);
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.14);
    overflow: hidden;
    color: #111;
  }

  .trip-menu-toggle {
    width: 100%;
    background: none;
    border: none;
    color: #111;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.02em;
    cursor: pointer;
  }

  .trip-menu-toggle:hover {
    background: rgba(0,0,0,0.035);
  }

  .trip-menu-chevron {
    font-size: 14px;
    transition: transform 0.2s ease;
  }

  .trip-menu.open .trip-menu-chevron {
    transform: rotate(180deg);
  }

  .trip-menu-content {
    display: none;
    padding: 0 16px 16px;
  }

  .trip-menu.open .trip-menu-content {
    display: block;
  }

  .trip-menu .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 16px;
  }

  .stats-compact {
    display: none;
    margin-bottom: 12px;
    padding: 10px 11px;
    border: 1px solid rgba(0,0,0,0.10);
    border-radius: 8px;
    background: rgba(255,255,255,0.72);
    font-size: 11px;
    line-height: 1.55;
    color: rgba(0,0,0,0.66);
    font-weight: 750;
    letter-spacing: 0.01em;
  }

  .trip-menu .stat {
    border: 1px solid rgba(0,0,0,0.10);
    border-radius: 8px;
    padding: 11px 12px;
    background: rgba(255,255,255,0.68);
    position: relative;
    overflow: hidden;
    min-height: 58px;
  }

  .stat-main-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .trip-menu .stat-value {
    display: block;
    font-size: 23px;
    font-weight: 850;
    line-height: 1;
    letter-spacing: -0.03em;
    color: #111;
    white-space: nowrap;
  }

  .stat-label-row {
    display: block;
    margin-top: 8px;
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 0.10em;
    color: rgba(0,0,0,0.54);
    white-space: nowrap;
  }

  .stat-icon-emoji {
    font-size: 21px;
    line-height: 1;
    margin-top: -1px;
    filter: drop-shadow(0 1px 1px rgba(0,0,0,0.12));
    flex: 0 0 auto;
  }

  .flag-icon {
    width: 30px;
    height: 20px;
    display: inline-block;
    border-radius: 3px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.12);
    flex: 0 0 auto;
  }

  .flag-usa {
    background: repeating-linear-gradient(
      to bottom,
      #b22234 0px,
      #b22234 2px,
      #ffffff 2px,
      #ffffff 4px
    );
  }

  .flag-usa::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 13px;
    height: 11px;
    background: #3c3b6e;
    border-radius: 2px 0 2px 0;
  }

  .flag-canada {
    background: linear-gradient(
      to right,
      #d52b1e 0%,
      #d52b1e 25%,
      #ffffff 25%,
      #ffffff 75%,
      #d52b1e 75%,
      #d52b1e 100%
    );
  }

  .flag-canada::before {
    content: "✦";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -53%);
    color: #d52b1e;
    font-size: 11px;
    line-height: 1;
  }

  .menu-section {
    border-top: 1px solid rgba(0,0,0,0.10);
    padding-top: 14px;
  }

  .menu-page-link {
    display: block;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    text-decoration: none;
    border: 1px solid #111;
    background: #111;
    color: #FAFAF7;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    margin-bottom: 0;
  }

  .menu-page-link:hover {
    background: #000;
    color: #FAFAF7;
    text-decoration: none;
  }

  .detail-subvalue {
    margin-top: 4px;
    font-size: 13px;
    opacity: 0.72;
  }

  .detail-day-row {
    padding: 9px 0;
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }

  .detail-day-row:last-child {
    border-bottom: none;
  }

  .detail-day-title {
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 4px;
  }

  .detail-route-line {
    font-size: 13px;
    line-height: 1.45;
    opacity: 0.86;
  }

  .detail-route-line strong {
    font-weight: 900;
  }

  .detail-role-badge {
    display: inline-block;
    margin-left: 6px;
    padding: 2px 6px;
    border-radius: 999px;
    background: rgba(0,0,0,0.08);
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(0,0,0,0.62);
    vertical-align: 1px;
  }

  @media (max-width: 640px) {
    .trip-menu {
      top: 12px;
      left: 12px;
      right: 12px;
      width: auto;
      max-width: none;
    }

    .trip-menu.open {
      max-height: calc(100dvh - 125px);
      overflow-y: auto;
    }

    .trip-menu-toggle {
      padding: 10px 12px;
      font-size: 16px;
    }

    .trip-menu .stat-value {
      font-size: 22px;
    }
  }
`;
document.head.appendChild(style);

function formatLocationWithRegion(place) {
  if (!place) return "";

  const region = LOCATION_REGION_LABELS[place];

  if (!region) return place;

  if (place.endsWith(`, ${region}`) || place.endsWith(` ${region}`)) {
    return place;
  }

  return `${place}, ${region}`;
}

function getEventVenuePlace(day) {
  if (!day || !day.event) return null;

  const dayNumber = Number(day.day);
  const overrideVenue = EVENT_VENUE_OVERRIDES[dayNumber];

  if (overrideVenue && LOCATIONS[overrideVenue]) {
    return overrideVenue;
  }

  if (day.event.venue && LOCATIONS[day.event.venue]) {
    return day.event.venue;
  }

  if (day.event.location && LOCATIONS[day.event.location]) {
    return day.event.location;
  }

  return null;
}

function getEventWithVenue(day) {
  if (!day?.event) return null;

  const venuePlace = getEventVenuePlace(day);

  return {
    ...day.event,
    venue: venuePlace || day.event.venue || "",
    location: venuePlace || day.event.location || day.finish || ""
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatFullStat(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return Math.round(number).toLocaleString();
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function parseDrivingTimeToMinutes(value) {
  if (!value) return 0;

  const [hours, minutes] = String(value).split(":").map(Number);

  if (!Number.isFinite(hours)) return 0;

  return (hours * 60) + (Number.isFinite(minutes) ? minutes : 0);
}

function formatDrivenTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function setupCarPane() {
  if (!map.getPane("carPane")) {
    const pane = map.createPane("carPane");
    pane.style.zIndex = 900;
    pane.style.pointerEvents = "none";
  }
}

function setupLabelsPane() {
  if (!map.getPane("labelsPane")) {
    const pane = map.createPane("labelsPane");
    pane.style.zIndex = 350;
    pane.style.pointerEvents = "none";
  }
}

function setupBoundaryPane() {
  if (!map.getPane("boundaryPane")) {
    const pane = map.createPane("boundaryPane");
    pane.style.zIndex = 325;
    pane.style.pointerEvents = "none";
  }
}

function addBoundaryLayers() {
  fetch("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json")
    .then(res => res.json())
    .then(geojson => {
      geojson.features = geojson.features.filter(
        feature => !["Alaska", "Hawaii", "Puerto Rico"].includes(feature.properties.name)
      );

      L.geoJSON(geojson, {
        pane: "boundaryPane",
        interactive: false,
        style: {
          color: "#ffffff",
          weight: 1,
          opacity: 0.35,
          fillOpacity: 0
        }
      }).addTo(map);
    })
    .catch(error => console.warn("US state borders failed to load:", error));

  fetch("https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/canada.geojson")
    .then(res => res.json())
    .then(geojson => {
      L.geoJSON(geojson, {
        pane: "boundaryPane",
        interactive: false,
        style: {
          color: "#ffffff",
          weight: 1,
          opacity: 0.35,
          fillOpacity: 0
        }
      }).addTo(map);
    })
    .catch(error => console.warn("Canadian province borders failed to load:", error));
}

function greatCircleArc(start, end, segments = 64) {
  const [lat1, lon1] = start.map(d => d * Math.PI / 180);
  const [lat2, lon2] = end.map(d => d * Math.PI / 180);

  const d = 2 * Math.asin(
    Math.sqrt(
      Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.pow(Math.sin((lon1 - lon2) / 2), 2)
    )
  );

  const points = [];

  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);

    points.push([
      Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI,
      Math.atan2(y, x) * 180 / Math.PI
    ]);
  }

  return points;
}

function resolveRouteAnimationWaiters() {
  const waiters = routeAnimationResolvers.splice(0);
  waiters.forEach(resolve => resolve());
}

function waitForRouteAnimation() {
  if (!isRouteAnimating && animationQueue.length === 0) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    routeAnimationResolvers.push(resolve);
  });
}

function finishRouteAnimationIfComplete() {
  if (!isRouteAnimating) return;
  if (animationQueue.length > 0) return;

  isRouteAnimating = false;
  resolveRouteAnimationWaiters();
}

function getMaxDay() {
  if (!tripData || !tripData.days || !tripData.days.length) return 90;
  return Math.max(...tripData.days.map(day => Number(day.day)));
}

function getRoutePlaces(day, includeEventVenue = false) {
  const viaStops = Array.isArray(day.viaStops) ? day.viaStops : [];
  const routePlaces = [
    day.start,
    ...viaStops,
    day.finish
  ].filter(Boolean);

  if (includeEventVenue) {
    const eventVenue = getEventVenuePlace(day);

    if (eventVenue && !routePlaces.includes(eventVenue)) {
      const finishIndex = Math.max(routePlaces.length - 1, 0);
      routePlaces.splice(finishIndex, 0, eventVenue);
    }
  }

  return routePlaces;
}

function getUniqueRoutePlaces(day, includeEventVenue = false) {
  const routePlaces = getRoutePlaces(day, includeEventVenue);

  return routePlaces.filter((place, index) => {
    return index === 0 || place !== routePlaces[index - 1];
  });
}

function getDayMarkerCoord(day) {
  const eventVenue = getEventVenuePlace(day);

  if (eventVenue && LOCATIONS[eventVenue]) {
    return LOCATIONS[eventVenue];
  }

  return LOCATIONS[day.finish];
}

function getDaysDisplay(daysInput) {
  const days = [...new Set(daysInput.map(Number))]
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  if (!days.length) return "Day";

  const ranges = [];
  let start = days[0];
  let previous = days[0];

  for (let i = 1; i < days.length; i++) {
    const current = days[i];

    if (current === previous + 1) {
      previous = current;
      continue;
    }

    ranges.push(start === previous ? `${start}` : `${start}–${previous}`);
    start = current;
    previous = current;
  }

  ranges.push(start === previous ? `${start}` : `${start}–${previous}`);

  const label = days.length === 1 ? "Day" : "Days";
  return `${label} ${ranges.join(", ")}`;
}

function getDateRangeDisplay(daysInput) {
  const days = [...new Set(daysInput.map(Number))]
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  if (!days.length) return "";

  const matchingDays = days
    .map(dayNumber => tripData.days.find(day => Number(day.day) === dayNumber))
    .filter(Boolean);

  if (!matchingDays.length) return "";

  const firstDate = matchingDays[0].date;
  const lastDate = matchingDays[matchingDays.length - 1].date;

  if (!firstDate || !lastDate) return "";

  if (firstDate === lastDate) return formatDate(firstDate);

  return `${formatDate(firstDate)} – ${formatDate(lastDate)}`;
}

function getRoleLabel(roles) {
  const roleSet = new Set(roles);

  if (roleSet.has("event")) return "Event";
  if (roleSet.has("via")) return "Via";
  if (roleSet.has("start") && roleSet.has("finish")) return "Start / Finish";
  if (roleSet.has("finish")) return "Finish";
  if (roleSet.has("start")) return "Start";

  return "Visited";
}

function addVisitToPlaceMap(placeMap, day, place, role, event = null) {
  if (!place || !LOCATIONS[place]) return;

  if (!placeMap.has(place)) {
    placeMap.set(place, {
      place,
      coord: LOCATIONS[place],
      visits: [],
      days: new Set(),
      roles: new Set(),
      events: []
    });
  }

  const item = placeMap.get(place);
  const dayNumber = Number(day.day);

  item.days.add(dayNumber);
  item.roles.add(role);

  item.visits.push({
    day,
    dayNumber,
    role,
    event
  });

  if (event) {
    item.events.push({
      day,
      dayNumber,
      event
    });
  }
}

function buildPlaceMarkerData(upToDay) {
  const placeMap = new Map();

  tripData.days.forEach(day => {
    if (Number(day.day) > Number(upToDay)) return;

    addVisitToPlaceMap(placeMap, day, day.start, "start");

    if (Array.isArray(day.viaStops)) {
      day.viaStops.forEach(place => {
        addVisitToPlaceMap(placeMap, day, place, "via");
      });
    }

    addVisitToPlaceMap(placeMap, day, day.finish, "finish");

    const eventVenue = getEventVenuePlace(day);
    const eventWithVenue = getEventWithVenue(day);

    if (eventVenue && eventWithVenue) {
      addVisitToPlaceMap(placeMap, day, eventVenue, "event", eventWithVenue);
    }
  });

  return [...placeMap.values()];
}

function getPlaceVisitsByDay(placeData) {
  const grouped = new Map();

  placeData.visits.forEach(visit => {
    if (!grouped.has(visit.dayNumber)) {
      grouped.set(visit.dayNumber, {
        day: visit.day,
        dayNumber: visit.dayNumber,
        roles: new Set(),
        events: []
      });
    }

    const item = grouped.get(visit.dayNumber);
    item.roles.add(visit.role);

    if (visit.event) {
      item.events.push(visit.event);
    }
  });

  return [...grouped.values()].sort((a, b) => a.dayNumber - b.dayNumber);
}

function formatRouteHtml(day, highlightPlace) {
  const routePlaces = getUniqueRoutePlaces(day, true);

  return routePlaces.map(place => {
    const label = formatLocationWithRegion(place);

    if (place === highlightPlace) {
      return `<strong>${escapeHtml(label)}</strong>`;
    }

    return escapeHtml(label);
  }).join(" → ");
}

function showPlaceDetail(placeData) {
  const panel = document.getElementById("day-detail");
  const content = document.getElementById("detail-content");

  if (!panel || !content) return;

  const days = [...placeData.days].sort((a, b) => a - b);
  const daysDisplay = getDaysDisplay(days);
  const dateRange = getDateRangeDisplay(days);
  const visitsByDay = getPlaceVisitsByDay(placeData);

  let html = `
    <h2>${escapeHtml(formatLocationWithRegion(placeData.place))}</h2>
    <h3>${escapeHtml(daysDisplay)}</h3>
    ${dateRange ? `<p class="detail-date">${escapeHtml(dateRange)}</p>` : ""}
  `;

  html += `
    <div class="detail-section">
      <div class="detail-label">Drive / Stay</div>
      <div class="detail-value">
  `;

  visitsByDay.forEach(item => {
    const day = item.day;
    const roleLabel = getRoleLabel(item.roles);
    const driveLine = day.type === "drive" && day.miles
      ? `${escapeHtml(day.miles)} mi · ${escapeHtml(day.drivingTime || "")}`
      : day.type === "stay"
        ? "Stayed here"
        : day.type === "flight"
          ? "Flight day"
          : "Visited";

    html += `
      <div class="detail-day-row">
        <div class="detail-day-title">
          Day ${escapeHtml(item.dayNumber)}
          <span class="detail-role-badge">${escapeHtml(roleLabel)}</span>
        </div>
        <div class="detail-route-line">${driveLine}</div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  html += `
    <div class="detail-section">
      <div class="detail-label">Route</div>
      <div class="detail-value">
  `;

  visitsByDay.forEach(item => {
    const routeHtml = formatRouteHtml(item.day, placeData.place);

    html += `
      <div class="detail-day-row">
        <div class="detail-day-title">Day ${escapeHtml(item.dayNumber)}</div>
        <div class="detail-route-line">${routeHtml}</div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  const eventVisits = visitsByDay.flatMap(item => {
    return item.events.map(event => ({
      dayNumber: item.dayNumber,
      event
    }));
  });

  if (eventVisits.length) {
    html += `
      <div class="detail-section">
        <div class="detail-label">Event</div>
        <div class="detail-value">
    `;

    eventVisits.forEach(({ dayNumber, event }) => {
      const venue = event.venue
        ? `<div class="detail-subvalue">${escapeHtml(formatLocationWithRegion(event.venue))}</div>`
        : "";

      html += `
        <div class="detail-day-row">
          <div class="detail-day-title">Day ${escapeHtml(dayNumber)} · ${escapeHtml(event.type || "Event")}</div>
          <div class="detail-route-line">${escapeHtml(event.name || "")}</div>
          ${venue}
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  }

  content.innerHTML = html;
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
}

function createPlaceMarker(placeData) {
  const days = [...placeData.days].sort((a, b) => a - b);
  const roles = placeData.roles;

  const hasEvent = roles.has("event");
  const viaOnly = roles.size === 1 && roles.has("via");
  const multiDay = days.length > 1;

  let className = "marker-dot";
  let html = "";
  let size = 12;

if (hasEvent) {
  className = "marker-dot marker-via";
  html = "";
  size = 10;
} else if (viaOnly) {
  className = "marker-dot marker-via";
  html = "";
  size = 10;
} else if (multiDay) {
  className = "marker-dot marker-multi";
  html = "";
  size = 16;
}

  const icon = L.divIcon({
    className,
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });

  const marker = L.marker(placeData.coord, { icon }).on("click", () => showPlaceDetail(placeData));

  if (hasEvent && placeData.events.length) {
    const event = placeData.events[0].event;

    marker.bindTooltip(`${getDaysDisplay(days)} · ${event.name} · ${formatLocationWithRegion(placeData.place)}`, {
      direction: "top",
      offset: [0, -size / 2]
    });
  } else {
    marker.bindTooltip(`${getDaysDisplay(days)} · ${formatLocationWithRegion(placeData.place)}`, {
      direction: "top",
      offset: [0, -size / 2]
    });
  }

  return marker;
}

function showDayDetail(day) {
  const panel = document.getElementById("day-detail");
  const content = document.getElementById("detail-content");

  if (!panel || !content) return;

  const dateStr = new Date(`${day.date}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  let html = `<h2>Day ${escapeHtml(day.day)}</h2><h3>${escapeHtml(formatLocationWithRegion(day.finish))}</h3><p class="detail-date">${escapeHtml(dateStr)}</p>`;

  if (day.type === "drive" && day.miles) {
    html += `<div class="detail-section"><div class="detail-label">Drove</div><div class="detail-value detail-miles">${escapeHtml(day.miles)} mi · ${escapeHtml(day.drivingTime || "")}</div></div>`;
  }

  const uniqueRouteBits = getUniqueRoutePlaces(day, true);

  if (uniqueRouteBits.length > 1) {
    html += `<div class="detail-section"><div class="detail-label">Route</div><div class="detail-value">${uniqueRouteBits.map(place => escapeHtml(formatLocationWithRegion(place))).join(" → ")}</div></div>`;
  }

  if (day.event) {
    const eventWithVenue = getEventWithVenue(day);

    const venue = eventWithVenue?.venue
      ? `<div class="detail-subvalue">${escapeHtml(formatLocationWithRegion(eventWithVenue.venue))}</div>`
      : "";

    html += `
      <div class="detail-section">
        <div class="detail-label">Event</div>
        <div class="detail-value">
          <span class="event-badge">${escapeHtml(day.event.type)}</span>${escapeHtml(day.event.name)}
          ${venue}
        </div>
      </div>
    `;
  }

  if (day.hotel) {
    html += `<div class="detail-section"><div class="detail-label">Hotel</div><div class="detail-value">${escapeHtml(day.hotel)}</div></div>`;
  }

  content.innerHTML = html;
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
}

function closeDayDetail() {
  const panel = document.getElementById("day-detail");
  if (!panel) return;

  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
}

function getCumulativeTripStats(upToDay) {
  let miles = 0;
  let minutes = 0;
  const states = new Set();

  if (!tripData || !tripData.days) {
    return {
      miles: 0,
      minutes: 0,
      states: 0
    };
  }

  tripData.days.forEach(day => {
    if (Number(day.day) > Number(upToDay)) return;

    if (day.miles) {
      miles += Number(day.miles) || 0;
    }

    if (day.drivingTime) {
      minutes += parseDrivingTimeToMinutes(day.drivingTime);
    }

    if (Array.isArray(day.newStates)) {
      day.newStates.forEach(state => states.add(String(state).trim().toUpperCase()));
    }
  });

  return {
    miles,
    minutes,
    states: states.size
  };
}

function updateRollingCounters(upToDay) {
  const drivenDistanceEl = document.getElementById("driven-distance");
  const drivenTimeEl = document.getElementById("driven-time");
  const statesVisitedEl = document.getElementById("states-visited");

  const stats = getCumulativeTripStats(upToDay);
  const maxDay = getMaxDay();
  const totalStates = Number(tripData?.stats?.states) || 48;

  if (drivenDistanceEl) {
    drivenDistanceEl.textContent = formatFullStat(stats.miles * LOCAL_DRIVING_MARKUP);
  }

  if (drivenTimeEl) {
    drivenTimeEl.textContent = formatDrivenTime(stats.minutes);
  }

  if (statesVisitedEl) {
    statesVisitedEl.textContent = stats.states || (Number(upToDay) >= maxDay ? totalStates : 0);
  }
}

function getEventDays() {
  if (!tripData || !tripData.days) return [];
  return tripData.days.filter(day => day.event);
}

function updateEventsModeUi() {
  const menu = document.getElementById("trip-menu");
  const button = document.getElementById("events-toggle");

  if (menu) {
    menu.classList.toggle("events-open", eventsModeActive);
  }

  if (button) {
    button.classList.toggle("active", eventsModeActive);
    button.setAttribute("aria-pressed", eventsModeActive ? "true" : "false");
    button.textContent = eventsModeActive ? "Hide events on map" : "Highlight events on map";
  }
}

function setEventsMode(active) {
  eventsModeActive = Boolean(active);
  updateEventsModeUi();

  const targetDay = eventsModeActive ? getMaxDay() : lastUpToDay;
  renderRoute(targetDay, { instant: true });

  if (eventsModeActive) {
    const eventCoords = getEventDays()
      .map(day => getDayMarkerCoord(day))
      .filter(Boolean);

    if (eventCoords.length) {
      map.fitBounds(L.latLngBounds(eventCoords), {
        padding: [80, 80]
      });
    }
  }
}

function focusDay(day, zoom = 7) {
  const coord = getDayMarkerCoord(day);
  if (!coord) return;

  map.setView(coord, zoom, {
    animate: true
  });
}

function setupTripMenu() {
  let menu = document.getElementById("trip-menu") || document.querySelector(".panel-info");

  if (!menu) {
    menu = document.createElement("div");
    document.body.appendChild(menu);
  }

  menu.id = "trip-menu";
  menu.className = "trip-menu";

  menu.innerHTML = `
    <button class="trip-menu-toggle" id="trip-menu-toggle" aria-expanded="false" aria-controls="trip-menu-content">
      <span>${escapeHtml(tripData?.title || "Road Trip 2K15")}</span>
      <span class="trip-menu-chevron">▾</span>
    </button>

    <div class="trip-menu-content" id="trip-menu-content">
      <div class="stats">
        <div class="stat">
          <div class="stat-main-row">
            <span class="stat-value" id="stat-days">—</span>
            <span class="stat-icon-emoji" aria-hidden="true">🕒</span>
          </div>
          <span class="stat-label-row">Days</span>
        </div>

        <div class="stat">
          <div class="stat-main-row">
            <span class="stat-value" id="stat-countries">—</span>
            <span class="stat-icon-emoji" aria-hidden="true">🌎</span>
          </div>
          <span class="stat-label-row">Countries</span>
        </div>

        <div class="stat">
          <div class="stat-main-row">
            <span class="stat-value" id="stat-states">—</span>
            <span class="flag-icon flag-usa" aria-hidden="true"></span>
          </div>
          <span class="stat-label-row">States</span>
        </div>

        <div class="stat">
          <div class="stat-main-row">
            <span class="stat-value" id="stat-provinces">—</span>
            <span class="flag-icon flag-canada" aria-hidden="true"></span>
          </div>
          <span class="stat-label-row">Provinces</span>
        </div>

        <div class="stat">
          <div class="stat-main-row">
            <span class="stat-value" id="stat-km">—</span>
          </div>
          <span class="stat-label-row">Kilometres</span>
        </div>

        <div class="stat">
          <div class="stat-main-row">
            <span class="stat-value" id="stat-miles">—</span>
          </div>
          <span class="stat-label-row">Miles</span>
        </div>
      </div>

      <div class="stats-compact" id="stats-compact">
        <span id="compact-days">—</span>d ·
        <span id="compact-countries">—</span> countries ·
        <span id="compact-states">—</span> states ·
        <span id="compact-provinces">—</span> provinces ·
        <span id="compact-km">—</span> km ·
        <span id="compact-miles">—</span> mi
      </div>

      <div class="menu-section">
        <a class="menu-page-link" href="events.html">Sports & Events</a>
      </div>
    </div>
  `;

  const toggle = document.getElementById("trip-menu-toggle");

  if (toggle) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }
}

function engineLoop(timestamp) {
  if (!lastEngineTime) lastEngineTime = timestamp;

  const dt = Math.min(timestamp - lastEngineTime, 50);
  lastEngineTime = timestamp;

  if (animationQueue.length > 0 && carCurrentPos) {
    let distanceToTravel = CAR_SPEED * (dt / 1000);

    while (distanceToTravel > 0 && animationQueue.length > 0) {
      const targetPos = animationQueue[0];
      const distToTarget = map.distance(carCurrentPos, targetPos);

      if (distToTarget === 0) {
        carCurrentPos = targetPos;
        paintedPoints.push(targetPos);
        animationQueue.shift();
        continue;
      }

      if (distToTarget <= distanceToTravel) {
        carCurrentPos = targetPos;
        paintedPoints.push(targetPos);
        animationQueue.shift();
        distanceToTravel -= distToTarget;
      } else {
        const ratio = distanceToTravel / distToTarget;
        const lat = carCurrentPos[0] + (targetPos[0] - carCurrentPos[0]) * ratio;
        const lng = carCurrentPos[1] + (targetPos[1] - carCurrentPos[1]) * ratio;

        carCurrentPos = [lat, lng];
        distanceToTravel = 0;
      }
    }

    if (carMarker) {
      carMarker.setLatLng(carCurrentPos);
    }

    if (activeLineLayer) {
      activeLineLayer.setLatLngs([...paintedPoints, carCurrentPos]);
    }

    finishRouteAnimationIfComplete();
  }

  requestAnimationFrame(engineLoop);
}

function renderRoute(upToDay, options = {}) {
  upToDay = Number(upToDay) || 0;

  const isPlaying =
    options.forceAnimate === true ||
    (!options.instant && upToDay === lastUpToDay + 1);

  if (isRouteAnimating) {
    isRouteAnimating = false;
    resolveRouteAnimationWaiters();
  }

  lastUpToDay = upToDay;

  const maxDay = getMaxDay();

  const currentDayEl = document.getElementById("current-day");
  if (currentDayEl) currentDayEl.textContent = upToDay;

  updateRollingCounters(upToDay);

  const totalDayEl = document.getElementById("total-days");
  if (totalDayEl) totalDayEl.textContent = maxDay;

  const sliderEl = document.getElementById("timeline-slider");
  if (sliderEl) {
    sliderEl.max = maxDay;
    sliderEl.value = upToDay;
  }

  if (routeLayer) routeLayer.remove();
  if (flightLayer) flightLayer.remove();

  allMarkers.forEach(m => m.remove());
  allMarkers = [];

  let staticPoints = [];
  let animatePoints = [];
  const flightSegments = [];

  for (const day of tripData.days) {
    if (Number(day.day) > upToDay) break;

    const coord = LOCATIONS[day.finish];
    if (!coord && day.type !== "flight") continue;

    if (day.type === "flight") {
      if (LOCATIONS[day.start] && LOCATIONS[day.finish]) {
        flightSegments.push([LOCATIONS[day.start], LOCATIONS[day.finish]]);
      }
    } else {
      let pts = day.roadPoints && day.roadPoints.length > 0
        ? [...day.roadPoints]
        : [coord];

      if (Number(day.day) === upToDay && isPlaying) {
        animatePoints = pts;

        if (staticPoints.length > 0) {
          animatePoints.unshift(staticPoints[staticPoints.length - 1]);
        }
      } else {
        staticPoints.push(...pts);
      }
    }
  }

  if (staticPoints.length > 1) {
    routeLayer = L.polyline(staticPoints, {
      color: "#00E5FF",
      weight: 4,
      opacity: 0.9,
      lineJoin: "round"
    }).addTo(map);
  }

  if (!activeLineLayer) {
    activeLineLayer = L.polyline([], {
      color: "#00E5FF",
      weight: 4,
      opacity: 0.9,
      lineJoin: "round"
    }).addTo(map);
  }

  if (isPlaying && animatePoints.length > 0) {
    carCurrentPos = animatePoints[0];
    paintedPoints = [carCurrentPos];
    animationQueue = animatePoints.slice(1);
    activeLineLayer.setLatLngs([carCurrentPos]);

    isRouteAnimating = animationQueue.length > 0;

    if (!isRouteAnimating) {
      resolveRouteAnimationWaiters();
    }
  } else {
    animationQueue = [];
    paintedPoints = [];
    activeLineLayer.setLatLngs([]);
    carCurrentPos = staticPoints.length ? staticPoints[staticPoints.length - 1] : null;
    isRouteAnimating = false;
    resolveRouteAnimationWaiters();
  }

  const placeMarkerData = buildPlaceMarkerData(upToDay);

  placeMarkerData.forEach(placeData => {
    const marker = createPlaceMarker(placeData);
    marker.addTo(map);
    allMarkers.push(marker);
  });

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
        pane: "carPane",
        interactive: false,
        icon: L.divIcon({
          className: "moving-car-icon",
          html: carHtml,
          iconSize: [0, 0]
        }),
        zIndexOffset: 5000
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

    flightLayer = L.layerGroup(
      flightLines.map(line => L.polyline(line, {
        color: "#6B8FA8",
        weight: 2,
        opacity: 0.7,
        dashArray: "6, 6"
      }))
    ).addTo(map);
  }
}

async function loadRealisticRoads() {
  const promises = tripData.days.map(async day => {
    if (day.type === "flight") {
      day.roadPoints = [];
      return;
    }

    const routePlaces = getRoutePlaces(day);
    const hasViaStops = Array.isArray(day.viaStops) && day.viaStops.length > 0;
    const shouldRoute = day.type === "drive" || hasViaStops;

    if (shouldRoute && routePlaces.length >= 2) {
      const coords = routePlaces
        .map(place => {
          const coord = LOCATIONS[place];

          if (!coord) {
            console.warn(`Missing coordinates for: ${place}`);
          }

          return coord;
        })
        .filter(Boolean);

      if (coords.length >= 2) {
        const coordString = coords
          .map(([lat, lng]) => `${lng},${lat}`)
          .join(";");

        const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

        try {
          const res = await fetch(url);
          const data = await res.json();

          if (data.routes && data.routes.length > 0) {
            day.roadPoints = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            return;
          }
        } catch (e) {
          console.warn(`Routing failed for Day ${day.day}.`);
        }
      }
    }

    day.roadPoints = [];
  });

  await Promise.all(promises);
}

function getAllRouteCoords() {
  if (!tripData || !tripData.days) return [];

  const coords = [];

  tripData.days.forEach(day => {
    getRoutePlaces(day, true).forEach(place => {
      if (LOCATIONS[place]) coords.push(LOCATIONS[place]);
    });

    const eventVenue = getEventVenuePlace(day);

    if (eventVenue && LOCATIONS[eventVenue]) {
      coords.push(LOCATIONS[eventVenue]);
    }
  });

  return coords;
}

function applyStatsToMenu() {
  const rawMiles = Number(tripData?.stats?.milesDriven) || 0;
  const estimatedMiles = rawMiles * LOCAL_DRIVING_MARKUP;
  const estimatedKm = estimatedMiles * MILES_TO_KM;

  const stats = {
    days: tripData?.stats?.days || getMaxDay(),
    countries: COUNTRIES_VISITED,
    states: tripData?.stats?.states || 48,
    provinces: tripData?.stats?.provinces || 4,
    km: formatFullStat(estimatedKm),
    miles: formatFullStat(estimatedMiles)
  };

  const values = {
    "stat-days": stats.days,
    "stat-countries": stats.countries,
    "stat-states": stats.states,
    "stat-provinces": stats.provinces,
    "stat-km": stats.km,
    "stat-miles": stats.miles,
    "compact-days": stats.days,
    "compact-countries": stats.countries,
    "compact-states": stats.states,
    "compact-provinces": stats.provinces,
    "compact-km": stats.km,
    "compact-miles": stats.miles
  };

  Object.entries(values).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

function applyTimelineMax() {
  const maxDay = getMaxDay();

  const slider = document.getElementById("timeline-slider");
  if (slider) {
    slider.min = 1;
    slider.max = maxDay;
  }

  const totalDayEl = document.getElementById("total-days");
  if (totalDayEl) totalDayEl.textContent = maxDay;

  updateRollingCounters(maxDay);
}

function handleInitialUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const dayNumber = Number(params.get("day"));
  const shouldShowEvents = params.get("events") === "1";

  if (shouldShowEvents) {
    eventsModeActive = true;
    updateEventsModeUi();
  }

  if (!Number.isFinite(dayNumber) || dayNumber <= 0) return;

  const day = tripData.days.find(d => Number(d.day) === dayNumber);
  if (!day) return;

  renderRoute(dayNumber, { instant: true });
  focusDay(day);
  showDayDetail(day);
}

async function init() {
  map = L.map("map", {
    zoomControl: false,
    attributionControl: true,
    zoomSnap: 1,
    zoomDelta: 1
  }).setView([39.5, -98.5], 4);

  setupCarPane();
  setupLabelsPane();
  setupBoundaryPane();

  L.control.zoom({ position: "bottomleft" }).addTo(map);

  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri",
    maxZoom: 19,
    className: "map-base-tile"
  }).addTo(map);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: "abcd",
    maxZoom: 20,
    opacity: 0.85,
    pane: "labelsPane",
    className: "map-label-tile"
  }).addTo(map);

  addBoundaryLayers();

  const res = await fetch("data/trip.json");
  tripData = await res.json();

  await loadRealisticRoads();

  setupTripMenu();
  applyStatsToMenu();
  applyTimelineMax();

  const maxDay = getMaxDay();
  renderRoute(maxDay, { instant: true });

  const allCoords = getAllRouteCoords();

  if (allCoords.length) {
    const isMobile = window.matchMedia("(max-width: 640px)").matches;

    if (isMobile) {
      map.setView([39.5, -96.5], 3);
    } else {
      map.fitBounds(L.latLngBounds(allCoords), {
        padding: [70, 70]
      });
    }
  }

  const closeDetail = document.getElementById("close-detail");
  if (closeDetail) {
    closeDetail.addEventListener("click", closeDayDetail);
  }

  requestAnimationFrame(engineLoop);

  window.RT2K15 = {
    renderRoute,
    waitForRouteAnimation,
    isRouteAnimating: () => isRouteAnimating,
    setEventsMode,
    tripData,
    carSpeed: CAR_SPEED,
    localDrivingMarkup: LOCAL_DRIVING_MARKUP
  };

  handleInitialUrlParams();
}

init();
