const DATA_URL = "data/trip.json";
const PHOTOS_URL = "data/photos.json";

let allDays = [];
let allPhotos = [];
let activeFilter = "all";
let activeQuery = "";

const listEl = document.getElementById("itinerary-list");
const statusEl = document.getElementById("list-status");
const emptyEl = document.getElementById("empty-state");
const searchEl = document.getElementById("itinerary-search");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return Math.round(number).toLocaleString();
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatDateShort(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short"
  });
}

function formatDriveTime(value) {
  if (!value) return "";
  const [hours, minutes] = String(value).split(":");
  if (!hours) return String(value);
  return `${Number(hours)}h ${String(minutes || "00").padStart(2, "0")}m`;
}


function normaliseCompare(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

async function loadPhotos() {
  try {
    const response = await fetch(PHOTOS_URL);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("RT2K15 photos not loaded:", error);
    return [];
  }
}

function getPhotosForDay(day) {
  const dayNumber = Number(day.day);

  return allPhotos.filter(photo => Number(photo.day) === dayNumber);
}

let activeGalleryPhotos = [];
let activeGalleryIndex = 0;
let galleryModal = null;

function ensureGalleryModal() {
  if (galleryModal) return galleryModal;

  galleryModal = document.createElement("div");
  galleryModal.className = "photo-gallery-modal";
  galleryModal.setAttribute("aria-hidden", "true");
  galleryModal.innerHTML = `
    <div class="photo-gallery-backdrop" data-gallery-close></div>
    <section class="photo-gallery-panel" role="dialog" aria-modal="true" aria-label="Day photo gallery">
      <button class="photo-gallery-close" type="button" data-gallery-close aria-label="Close photo gallery">×</button>
      <div class="photo-gallery-stage">
        <button class="photo-gallery-nav photo-gallery-prev" type="button" data-gallery-prev aria-label="Previous photo">‹</button>
        <img class="photo-gallery-image" src="" alt="" loading="eager">
        <button class="photo-gallery-nav photo-gallery-next" type="button" data-gallery-next aria-label="Next photo">›</button>
      </div>
      <div class="photo-gallery-copy">
        <div>
          <h2 class="photo-gallery-title"></h2>
          <p class="photo-gallery-caption"></p>
        </div>
        <span class="photo-gallery-count"></span>
      </div>
    </section>
  `;

  document.body.appendChild(galleryModal);

  galleryModal.addEventListener("click", event => {
    if (event.target.closest("[data-gallery-close]")) {
      closePhotoGallery();
    }

    if (event.target.closest("[data-gallery-prev]")) {
      movePhotoGallery(-1);
    }

    if (event.target.closest("[data-gallery-next]")) {
      movePhotoGallery(1);
    }
  });

  document.addEventListener("keydown", event => {
    if (!galleryModal.classList.contains("open")) return;

    if (event.key === "Escape") closePhotoGallery();
    if (event.key === "ArrowLeft") movePhotoGallery(-1);
    if (event.key === "ArrowRight") movePhotoGallery(1);
  });

  return galleryModal;
}

function renderPhotoGallery() {
  const modal = ensureGalleryModal();
  const photo = activeGalleryPhotos[activeGalleryIndex];

  if (!photo) return;

  const image = modal.querySelector(".photo-gallery-image");
  const title = modal.querySelector(".photo-gallery-title");
  const caption = modal.querySelector(".photo-gallery-caption");
  const count = modal.querySelector(".photo-gallery-count");
  const prev = modal.querySelector(".photo-gallery-prev");
  const next = modal.querySelector(".photo-gallery-next");

  image.src = photo.src;
  image.alt = photo.alt || photo.title || "RT2K15 trip photo";
  title.textContent = photo.title || photo.place || "Trip photo";
  caption.textContent = photo.caption || "";
  count.textContent = `${activeGalleryIndex + 1} / ${activeGalleryPhotos.length}`;

  const hasMultiple = activeGalleryPhotos.length > 1;
  prev.hidden = !hasMultiple;
  next.hidden = !hasMultiple;
}

function openPhotoGallery(photos, startIndex = 0) {
  if (!photos.length) return;

  activeGalleryPhotos = photos;
  activeGalleryIndex = Math.max(0, Math.min(startIndex, photos.length - 1));

  const modal = ensureGalleryModal();
  renderPhotoGallery();
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("gallery-open");
}

function closePhotoGallery() {
  if (!galleryModal) return;

  galleryModal.classList.remove("open");
  galleryModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("gallery-open");
}

function movePhotoGallery(direction) {
  if (!activeGalleryPhotos.length) return;

  activeGalleryIndex = (activeGalleryIndex + direction + activeGalleryPhotos.length) % activeGalleryPhotos.length;
  renderPhotoGallery();
}

function setupDayGalleryTriggers() {
  if (!listEl) return;

  listEl.querySelectorAll(".day-photo-thumb").forEach(button => {
    button.addEventListener("click", () => {
      const dayNumber = Number(button.dataset.galleryDay);
      const day = allDays.find(item => Number(item.day) === dayNumber);
      const photos = day ? getPhotosForDay(day) : [];

      openPhotoGallery(photos);
    });
  });
}




const STATE_NAMES = {
  AL: "Alabama", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky",
  LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
  MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska",
  NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
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
  "Atlanta": "GA",
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
  "17-Mile Drive": "CA",
  "Pebble Beach Golf Club": "CA",
  "Piedras Blancas Elephant Seal Rookery": "CA",
  "Monterey": "CA",
  "Carmel": "CA",
  "Santa Monica": "CA",
  "Venice Beach": "CA",
  "Long Beach": "CA",
  "La Jolla": "CA",
  "Las Cruces": "NM",
  "Four Corners Monument": "AZ/NM/CO/UT",
  "Grand Canyon": "AZ",
  "Cedar City": "UT",
  "Salt Lake City": "UT",
  "LaVell Edwards Stadium": "UT",
  "Provo": "UT",
  "Yellowstone NP": "WY",
  "Idaho Falls": "ID",
  "Twin Falls": "ID",
  "Lake Louise": "AB",
  "Banff": "AB",
  "Rapid City": "SD",
  "Mount Rushmore": "SD",
  "Scottsbluff": "NE",
  "Welcome to Oklahoma Sign, Devol OK": "OK",
  "Jackson": "MS",
  "Memphis": "TN",
  "Nashville": "TN",
  "Cincinnati": "OH",
  "Cincinnatti": "OH",
  "St Louis": "MO",
  "National WWI Museum and Memorial": "MO",
  "Kansas City, Kansas": "KS",
  "Notre Dame": "IN",
  "University of Notre Dame": "IN",
  "Michigan Stadium": "MI",
  "Detroit": "MI",
  "Niagara Falls": "ON",
  "Hockey Hall of Fame": "ON",
  "Toronto Island Park": "ON",
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
  "Anderson University": "IN",
  "Lucas Oil Stadium": "IN",
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
  "Ben Hill Griffin Stadium": "FL",

  "Arlington": "TX",
  "East Rutherford": "NJ"
};


const CANADIAN_REGION_CODES = new Set(["BC", "AB", "ON", "QC"]);
const US_REGION_CODES = new Set(Object.keys(STATE_NAMES));

function getNightCountry(day) {
  const finish = String(day.finish || "").trim();
  const region = LOCATION_REGION_LABELS[finish];

  if (CANADIAN_REGION_CODES.has(region)) return "canada";
  if (US_REGION_CODES.has(region)) return "usa";

  return "unknown";
}

function getNightCountryLabel(country) {
  if (country === "canada") return "Night spent in Canada";
  if (country === "usa") return "Night spent in the USA";
  return "Night location";
}

function renderNightFlagSvg(country) {
  if (country === "canada") {
    return `
      <svg class="night-flag-svg" viewBox="0 0 36 24" aria-hidden="true" focusable="false">
        <rect width="36" height="24" fill="#ffffff"></rect>
        <rect width="9" height="24" fill="#d52b1e"></rect>
        <rect x="27" width="9" height="24" fill="#d52b1e"></rect>
        <path fill="#d52b1e" d="M18 4.2l1.25 3.1 2.8-1.6-.85 3.15 3.25.35-2.65 1.9 1.05 2.9-3.15-.8-.2 3.55h-3l-.2-3.55-3.15.8 1.05-2.9-2.65-1.9 3.25-.35-.85-3.15 2.8 1.6L18 4.2z"></path>
      </svg>
    `;
  }

  if (country === "usa") {
    return `
      <svg class="night-flag-svg" viewBox="0 0 38 24" aria-hidden="true" focusable="false">
        <rect width="38" height="24" fill="#ffffff"></rect>
        <g fill="#b22234">
          <rect y="0" width="38" height="2"></rect>
          <rect y="4" width="38" height="2"></rect>
          <rect y="8" width="38" height="2"></rect>
          <rect y="12" width="38" height="2"></rect>
          <rect y="16" width="38" height="2"></rect>
          <rect y="20" width="38" height="2"></rect>
        </g>
        <rect width="16" height="12" fill="#3c3b6e"></rect>
        <g fill="#ffffff" opacity="0.95">
          <circle cx="3" cy="3" r="0.75"></circle>
          <circle cx="7" cy="3" r="0.75"></circle>
          <circle cx="11" cy="3" r="0.75"></circle>
          <circle cx="5" cy="6" r="0.75"></circle>
          <circle cx="9" cy="6" r="0.75"></circle>
          <circle cx="13" cy="6" r="0.75"></circle>
          <circle cx="3" cy="9" r="0.75"></circle>
          <circle cx="7" cy="9" r="0.75"></circle>
          <circle cx="11" cy="9" r="0.75"></circle>
        </g>
      </svg>
    `;
  }

  return "";
}

function renderNightFlag(day) {
  const country = getNightCountry(day);
  const svg = renderNightFlagSvg(country);

  if (!svg) return "";

  return `
    <span class="night-flag night-flag-${escapeHtml(country)}" title="${escapeHtml(getNightCountryLabel(country))}" aria-label="${escapeHtml(getNightCountryLabel(country))}">
      ${svg}
    </span>
  `;
}

const FALLBACK_STATE_MILESTONES = {
  1: [{ code: "CA", number: 1 }],
  15: [{ code: "AZ", number: 2 }],
  17: [{ code: "NM", number: 3 }],
  20: [{ code: "NV", number: 4 }],
  25: [{ code: "UT", number: 5 }],
  26: [{ code: "ID", number: 6 }],
  27: [{ code: "WY", number: 7 }],
  29: [{ code: "OR", number: 8 }],
  31: [{ code: "WA", number: 9 }],
  37: [{ code: "MT", number: 10 }],
  39: [{ code: "ND", number: 11 }, { code: "SD", number: 12 }],
  40: [{ code: "NE", number: 13 }, { code: "CO", number: 14 }],
  42: [{ code: "TX", number: 15 }],
  43: [{ code: "OK", number: 16 }],
  47: [{ code: "LA", number: 17 }],
  49: [{ code: "MS", number: 18 }, { code: "AR", number: 19 }],
  50: [{ code: "TN", number: 20 }, { code: "KY", number: 21 }],
  52: [{ code: "OH", number: 22 }, { code: "IN", number: 23 }],
  55: [{ code: "MO", number: 24 }],
  56: [{ code: "KS", number: 25 }, { code: "IA", number: 26 }, { code: "MN", number: 27 }, { code: "WI", number: 28 }],
  57: [{ code: "IL", number: 29 }],
  60: [{ code: "MI", number: 30 }],
  64: [{ code: "VT", number: 31 }, { code: "NH", number: 32 }, { code: "ME", number: 33 }, { code: "MA", number: 34 }],
  66: [{ code: "RI", number: 35 }, { code: "CT", number: 36 }, { code: "NY", number: 37 }, { code: "NJ", number: 38 }],
  73: [{ code: "PA", number: 39 }],
  75: [{ code: "DE", number: 40 }, { code: "MD", number: 41 }, { code: "WV", number: 42 }],
  77: [{ code: "VA", number: 43 }, { code: "NC", number: 44 }],
  79: [{ code: "SC", number: 45 }, { code: "GA", number: 46 }, { code: "AL", number: 47 }],
  80: [{ code: "FL", number: 48 }]
};

let explicitStateMilestonesByDay = new Map();

function buildExplicitStateMilestones(days) {
  const seen = new Set();
  const byDay = new Map();

  days.forEach(day => {
    if (!Array.isArray(day.newStates)) return;

    const milestones = [];

    day.newStates.forEach(rawCode => {
      const code = String(rawCode || "").trim().toUpperCase();

      if (!STATE_NAMES[code] || seen.has(code)) return;

      seen.add(code);
      milestones.push({ code, number: seen.size });
    });

    if (milestones.length) {
      byDay.set(Number(day.day), milestones);
    }
  });

  explicitStateMilestonesByDay = byDay;
}

function getStateMilestones(day) {
  const dayNumber = Number(day.day);

  if (explicitStateMilestonesByDay.size) {
    return explicitStateMilestonesByDay.get(dayNumber) || [];
  }

  return FALLBACK_STATE_MILESTONES[dayNumber] || [];
}



function hasRegionSuffix(place) {
  return /,\s*[A-Z]{2}(?:\/[A-Z]{2})*$/.test(String(place || "").trim());
}

function formatPlaceName(place) {
  if (!place) return "";

  const cleanPlace = String(place).trim();
  const region = LOCATION_REGION_LABELS[cleanPlace];

  if (!region || hasRegionSuffix(cleanPlace)) {
    return cleanPlace;
  }

  return `${cleanPlace}, ${region}`;
}

function getRoutePlaces(day) {
  const viaStops = Array.isArray(day.viaStops) ? day.viaStops : [];

  return [day.start, ...viaStops, day.finish]
    .filter(Boolean)
    .filter((place, index, arr) => index === 0 || place !== arr[index - 1]);
}

function getDayTitle(day) {
  if (day.start && day.finish && day.start !== day.finish) {
    return `${formatPlaceName(day.start)} → ${formatPlaceName(day.finish)}`;
  }

  if (day.finish) return formatPlaceName(day.finish);
  if (day.start) return formatPlaceName(day.start);
  return `Day ${day.day}`;
}

function getSearchHaystack(day) {
  return [
    day.day,
    day.date,
    day.start,
    day.finish,
    formatPlaceName(day.start),
    formatPlaceName(day.finish),
    day.type,
    day.via,
    ...(Array.isArray(day.viaStops) ? day.viaStops : []),
    ...(Array.isArray(day.viaStops) ? day.viaStops.map(formatPlaceName) : []),
    day.hotel,
    day.event?.type,
    day.event?.name,
    day.event?.venue,
    day.event?.location,
    day.event?.ticket?.section,
    day.event?.ticket?.row,
    day.event?.ticket?.seat,
    ...getPhotosForDay(day).flatMap(photo => [photo.title, photo.place, photo.city, photo.caption, ...(Array.isArray(photo.tags) ? photo.tags : [])]),
    ...getStateMilestones(day).map(item => `${STATE_NAMES[item.code] || item.code} ${item.code} ${item.number}`)
  ].filter(Boolean).join(" ").toLowerCase();
}

function dayMatchesFilter(day) {
  if (activeFilter === "all") return true;
  if (activeFilter === "event") return Boolean(day.event);
  return day.type === activeFilter;
}

function dayMatchesSearch(day) {
  if (!activeQuery) return true;
  return getSearchHaystack(day).includes(activeQuery);
}

function getVisibleDays() {
  return allDays.filter(day => dayMatchesFilter(day) && dayMatchesSearch(day));
}

function getGroupLabel(dayNumber) {
  const week = Math.floor((Number(dayNumber) - 1) / 7) + 1;
  const start = (week - 1) * 7 + 1;
  const end = Math.min(start + 6, 90);
  return `Week ${week} · Days ${start}–${end}`;
}

function renderRouteLine(day) {
  const viaStops = Array.isArray(day.viaStops) ? day.viaStops.filter(Boolean) : [];

  if (!viaStops.length) return "";

  const parts = getRoutePlaces(day);

  return parts
    .map(part => `<span>${escapeHtml(formatPlaceName(part))}</span>`)
    .join(`<span class="arrow">→</span>`);
}

function renderMeta(day) {
  const bits = [];

  if (day.miles) {
    bits.push(`<span class="meta-pill">${escapeHtml(formatNumber(day.miles))} miles</span>`);
  }

  if (day.drivingTime) {
    bits.push(`<span class="meta-pill">${escapeHtml(formatDriveTime(day.drivingTime))} drive</span>`);
  }

  if (day.type === "stay") {
    bits.push(`<span class="meta-pill">Stayed here</span>`);
  }

  if (day.type === "flight") {
    bits.push(`<span class="meta-pill">Flight day</span>`);
  }

  return bits.length ? `<div class="meta-row">${bits.join("")}</div>` : "";
}

function renderVia(day) {
  const viaStops = Array.isArray(day.viaStops) ? day.viaStops.filter(Boolean) : [];

  if (!viaStops.length) return "";

  return `
    <div class="via-row" aria-label="Via stops">
      ${viaStops.map(stop => `<span class="via-pill">${escapeHtml(stop)}</span>`).join("")}
    </div>
  `;
}

function renderTicketLine(ticket) {
  if (!ticket) return "";

  const bits = [];

  if (ticket.section) bits.push(`Section ${ticket.section}`);
  if (ticket.row) bits.push(`Row ${ticket.row}`);
  if (ticket.seat) bits.push(`Seat ${ticket.seat}`);
  if (ticket.eventTime) bits.push(ticket.eventTime);
  if (ticket.price) bits.push(ticket.price);

  return bits.length ? bits.join(" · ") : "";
}

function renderEvent(day) {
  if (!day.event) return "";

  const event = day.event;
  const venue = event.venue || event.location || "";
  const ticketLine = renderTicketLine(event.ticket);

  return `
    <div class="event-panel">
      <div class="event-line">
        <span class="event-type">${escapeHtml(event.type || "Event")}</span>
        <span>${escapeHtml(event.name || "Event")}</span>
      </div>
      ${venue || ticketLine ? `
        <div class="event-subline">
          ${venue ? escapeHtml(formatPlaceName(venue)) : ""}
          ${venue && ticketLine ? " · " : ""}
          ${ticketLine ? escapeHtml(ticketLine) : ""}
        </div>
      ` : ""}
    </div>
  `;
}



function renderStopsLine(day) {
  const viaStops = Array.isArray(day.viaStops) ? day.viaStops.filter(Boolean) : [];

  if (!viaStops.length) return "";

  return `
    <div class="compact-detail">
      <strong>Stops</strong>
      <span>${viaStops.map(stop => escapeHtml(formatPlaceName(stop))).join(" · ")}</span>
    </div>
  `;
}

function renderCompactEventLine(day) {
  if (!day.event) return "";

  const event = day.event;
  const venue = event.venue || event.location || "";
  const type = event.type ? `${event.type} · ` : "";
  const venueText = venue ? ` · ${formatPlaceName(venue)}` : "";

  return `
    <div class="compact-detail">
      <strong>Event</strong>
      <span>${escapeHtml(`${type}${event.name || "Event"}${venueText}`)}</span>
    </div>
  `;
}

function renderStateCell(day) {
  const milestones = getStateMilestones(day);

  return `
    <aside class="state-cell" aria-label="State counter">
      <span class="state-cell-label">New State</span>
      ${milestones.length ? `
        <div class="state-list">
          ${milestones.map(item => `
            <span class="state-pill" title="${escapeHtml(STATE_NAMES[item.code] || item.code)}">
              ${escapeHtml(STATE_NAMES[item.code] || item.code)} <em>#${escapeHtml(item.number)}</em>
            </span>
          `).join("")}
        </div>
      ` : `<span class="state-empty">—</span>`}
    </aside>
  `;
}

function renderStatsCell(day) {
  const miles = day.miles ? `${formatNumber(day.miles)} mi` : "—";
  const drive = day.drivingTime ? formatDriveTime(day.drivingTime) : "—";

  return `
    <aside class="day-stats-cell" aria-label="Day stats">
      <span class="stat-cell-label">Drive</span>
      <div class="stat-line"><span>Miles</span><strong>${escapeHtml(miles)}</strong></div>
      <div class="stat-line"><span>Time</span><strong>${escapeHtml(drive)}</strong></div>
      <a class="map-link compact-map-link" href="index.html?day=${encodeURIComponent(day.day)}">Map →</a>
    </aside>
  `;
}


function renderDayPhotoThumb(day) {
  const photos = getPhotosForDay(day);

  if (!photos.length) return "";

  const first = photos[0];
  const label = `${photos.length} ${photos.length === 1 ? "photo" : "photos"}`;

  return `
    <button class="day-photo-thumb" type="button" data-gallery-day="${escapeHtml(day.day)}" aria-label="Open Day ${escapeHtml(day.day)} photo gallery">
      <img src="${escapeHtml(first.src)}" alt="${escapeHtml(first.alt || first.title || `Day ${day.day} photo`)}" loading="lazy">
      <span>${escapeHtml(label)}</span>
    </button>
  `;
}

function renderDayCard(day) {
  const type = day.type || "visited";
  const typeLabel = type === "drive" ? "Drive" : type === "stay" ? "Stay" : type;
  const nightCountry = getNightCountry(day);
  const nightCountryClass = nightCountry !== "unknown" ? ` night-${nightCountry}` : "";

  return `
    <article class="day-card${nightCountryClass}" id="day-${escapeHtml(day.day)}">
      <div class="day-badge${nightCountryClass}">
        <span class="day-badge-label">Day</span>
        <strong>${escapeHtml(day.day)}</strong>
        <small>${escapeHtml(formatDateShort(day.date))}</small>
        ${renderNightFlag(day)}
      </div>

      <div class="day-main">
        <div class="day-topline">
          <span class="day-date">${escapeHtml(formatDate(day.date))}</span>
          <span class="type-badge ${escapeHtml(type)}">${escapeHtml(typeLabel)}</span>
        </div>

        <h2 class="day-title">${escapeHtml(getDayTitle(day))}</h2>
        ${renderStopsLine(day)}
        ${renderCompactEventLine(day)}
        ${renderDayPhotoThumb(day)}
      </div>

      ${renderStatsCell(day)}
      ${renderStateCell(day)}
    </article>
  `;
}

function renderList() {
  const visibleDays = getVisibleDays();

  if (!visibleDays.length) {
    listEl.innerHTML = "";
    statusEl.textContent = "0 matching days";
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;
  statusEl.textContent = `${visibleDays.length} matching ${visibleDays.length === 1 ? "day" : "days"}`;

  let currentGroup = "";
  let html = "";

  visibleDays.forEach(day => {
    const groupLabel = getGroupLabel(day.day);

    if (groupLabel !== currentGroup) {
      currentGroup = groupLabel;
      html += `<h2 class="group-heading">${escapeHtml(groupLabel)}</h2>`;
    }

    html += renderDayCard(day);
  });

  listEl.innerHTML = html;
  setupDayGalleryTriggers();
}

function setActiveFilter(filter) {
  activeFilter = filter;

  document.querySelectorAll(".filter-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });

  renderList();
}

function updateSummary(data) {
  const days = data.days || [];
  const stats = data.stats || {};
  const first = days[0];
  const last = days[days.length - 1];
  const driveDays = days.filter(day => day.type === "drive").length;
  const stayDays = days.filter(day => day.type === "stay").length;
  const eventDays = days.filter(day => day.event).length;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("summary-days", stats.days || days.length);
  setText("summary-states", stats.states || "48");
  setText("summary-provinces", stats.provinces || "4");
  setText("summary-events", stats.events || eventDays);

  setText("hero-date-range", `${formatDateShort(first?.date)} → ${formatDateShort(last?.date)}`);
  setText("overview-route", `${first?.start || "Start"} → ${last?.finish || "Finish"}`);
  setText("overview-miles", formatNumber(stats.milesDriven));
  setText("overview-time", formatDriveTime(stats.drivingHours));
  setText("overview-counts", `${driveDays} drives · ${stayDays} stays`);
}

async function initItinerary() {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`Could not load ${DATA_URL}: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.days)) {
      throw new Error("trip.json loaded, but no days array was found.");
    }

    allPhotos = await loadPhotos();
    allDays = data.days;
    buildExplicitStateMilestones(allDays);
    updateSummary(data);
    renderList();
  } catch (error) {
    console.error("RT2K15 itinerary error:", error);

    listEl.innerHTML = "";
    emptyEl.hidden = true;
    statusEl.innerHTML = `
      <strong>Itinerary failed to load.</strong>
      <span>Check that <code>data/trip.json</code> is valid JSON and in the right folder.</span>
    `;
  }
}

document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => setActiveFilter(button.dataset.filter));
});

if (searchEl) {
  searchEl.addEventListener("input", event => {
    activeQuery = event.target.value.trim().toLowerCase();
    renderList();
  });
}

initItinerary();
