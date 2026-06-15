const DATA_URL = "data/trip.json";

const SPORT_TYPES = new Set([
  "MLB",
  "NFL",
  "NCAAF",
  "CFB",
  "MLS",
  "NHL",
  "UFC",
  "UFC189",
  "Boxing",
  "WWE",
  "Tennis",
  "MotoGP"
]);

const TYPE_ORDER = [
  "MLB",
  "NFL",
  "CFB",
  "NCAAF",
  "MLS",
  "NHL",
  "UFC",
  "Boxing",
  "WWE",
  "Tennis",
  "MotoGP",
  "Concert",
  "Comedy",
  "TV Show",
  "Show",
  "Theme Park"
];

const TYPE_ICONS = {
  MLB: "⚾",
  NFL: "🏈",
  NCAAF: "🏈",
  CFB: "🏈",
  MLS: "⚽",
  NHL: "🏒",
  UFC: "🥊",
  UFC189: "🥊",
  Boxing: "🥊",
  WWE: "🤼",
  Tennis: "🎾",
  MotoGP: "🏁",
  Concert: "🎤",
  Comedy: "🎭",
  "TV Show": "📺",
  Show: "🎟️",
  "Theme Park": "🎢"
};

const mode = document.body.dataset.ticketPage || "events";

let allTicketDays = [];
let activeType = "all";
let activeQuery = "";

const listEl = document.getElementById("ticket-list");
const statusEl = document.getElementById("list-status");
const emptyEl = document.getElementById("empty-state");
const searchEl = document.getElementById("ticket-search");
const filtersEl = document.getElementById("type-filters");
const summaryEl = document.getElementById("summary-strip");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function normaliseTicketType(type) {
  if (!type) return "";
  const value = String(type).trim();
  if (value === "UFC189" || value === "UFC 189") return "UFC";
  if (value === "CFB") return "NCAAF";
  return value;
}

function isSportsTvEvent(day) {
  const event = day.event || {};
  const text = [
    event.type,
    event.name,
    event.venue,
    event.location
  ].filter(Boolean).join(" ").toLowerCase();

  return event.type === "TV Show" && (
    text.includes("espn") ||
    text.includes("sports nation")
  );
}

function isSportEvent(day) {
  return SPORT_TYPES.has(normaliseTicketType(day.event?.type)) || isSportsTvEvent(day);
}

function isCorrectMode(day) {
  if (!day.event) return false;
  return mode === "sports" ? isSportEvent(day) : !isSportEvent(day);
}

function getVenue(day) {
  return day.event?.venue || day.event?.location || day.finish || "";
}

function getCity(day) {
  return day.event?.location || day.finish || "";
}

function getSearchHaystack(day) {
  const event = day.event || {};
  const ticket = event.ticket || {};

  return [
    day.day,
    day.date,
    day.start,
    day.finish,
    day.via,
    ...(Array.isArray(day.viaStops) ? day.viaStops : []),
    event.type,
    event.name,
    event.venue,
    event.location,
    ticket.section,
    ticket.row,
    ticket.seat,
    ticket.eventTime,
    ticket.price
  ].filter(Boolean).join(" ").toLowerCase();
}

function getVisibleDays() {
  return allTicketDays.filter(day => {
    if (activeType !== "all" && normaliseTicketType(day.event?.type) !== activeType && day.event?.type !== activeType) return false;
    if (activeQuery && !getSearchHaystack(day).includes(activeQuery)) return false;
    return true;
  });
}

function sortTypes(types) {
  return [...types].sort((a, b) => {
    const ia = TYPE_ORDER.indexOf(a);
    const ib = TYPE_ORDER.indexOf(b);

    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function renderFilters() {
  const types = sortTypes(new Set(allTicketDays.map(day => day.event?.type).filter(Boolean)));
  const allText = mode === "sports" ? "All Sports" : "All Events";

  filtersEl.innerHTML = [
    `<button class="filter-btn active" type="button" data-type="all">${allText}</button>`,
    ...types.map(type => `<button class="filter-btn" type="button" data-type="${escapeHtml(type)}">${escapeHtml(type)}</button>`)
  ].join("");

  filtersEl.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
      activeType = button.dataset.type;

      filtersEl.querySelectorAll(".filter-btn").forEach(item => {
        item.classList.toggle("active", item === button);
      });

      renderList();
    });
  });
}

function renderSummary() {
  const venueCount = new Set(allTicketDays.map(getVenue).filter(Boolean)).size;
  const cityCount = new Set(allTicketDays.map(getCity).filter(Boolean)).size;
  const types = new Set(allTicketDays.map(day => day.event?.type).filter(Boolean)).size;
  const freeCount = allTicketDays.filter(day => String(day.event?.ticket?.price || "").toUpperCase() === "FREE").length;

  const label = mode === "sports" ? "Sports stops" : "Events";
  const fourthLabel = freeCount ? "Free stops" : "Ticket types";
  const fourthValue = freeCount || types;

  summaryEl.innerHTML = `
    <article><strong>${escapeHtml(allTicketDays.length)}</strong><span>${escapeHtml(label)}</span></article>
    <article><strong>${escapeHtml(types)}</strong><span>Types</span></article>
    <article><strong>${escapeHtml(venueCount)}</strong><span>Venues</span></article>
    <article><strong>${escapeHtml(fourthValue)}</strong><span>${escapeHtml(fourthLabel)}</span></article>
  `;

  const heroCount = document.getElementById("hero-count");
  if (heroCount) heroCount.textContent = allTicketDays.length;
}

function ticketMeta(day) {
  const ticket = day.event?.ticket || {};
  const meta = [];

  if (ticket.section) meta.push(`Section ${ticket.section}`);
  if (ticket.row) meta.push(`Row ${ticket.row}`);
  if (ticket.seat) meta.push(`Seat ${ticket.seat}`);
  if (ticket.eventTime) meta.push(ticket.eventTime);
  if (ticket.price) meta.push(ticket.price);

  return meta;
}

function renderGraphic(day) {
  const event = day.event || {};
  const graphic = event.stubGraphic;

  if (graphic) {
    return `
      <div class="graphic-slot">
        <img src="${escapeHtml(graphic)}" alt="" loading="lazy" onerror="this.closest('.graphic-slot').innerHTML='<div class=&quot;graphic-fallback&quot;>${escapeHtml(TYPE_ICONS[event.type] || '🎟️')}</div>'" />
      </div>
    `;
  }

  return `
    <div class="graphic-slot">
      <div class="graphic-fallback">${escapeHtml(TYPE_ICONS[event.type] || "🎟️")}</div>
    </div>
  `;
}

function renderTicket(day) {
  const event = day.event || {};
  const meta = ticketMeta(day);
  const venue = getVenue(day);
  const city = getCity(day);
  const type = event.type || "Event";

  return `
    <article class="ticket-card" id="day-${escapeHtml(day.day)}">
      <aside class="ticket-stub">
        <span class="stub-label">Day</span>
        <strong class="stub-day">${escapeHtml(day.day)}</strong>
        <span class="stub-date">${escapeHtml(formatDateShort(day.date))}</span>
      </aside>

      <div class="ticket-body">
        <div class="ticket-content">
          <div class="ticket-topline">
            <span class="type-badge">${escapeHtml(type)}</span>
            <span class="ticket-date">${escapeHtml(formatDate(day.date))}</span>
          </div>

          <h2 class="ticket-title">${escapeHtml(event.name || "Untitled Event")}</h2>

          <p class="ticket-place">
            ${venue ? escapeHtml(venue) : ""}
            ${venue && city && city !== venue ? ` · ${escapeHtml(city)}` : ""}
          </p>

          ${meta.length ? `
            <div class="ticket-meta">
              ${meta.map(item => `<span class="meta-chip">${escapeHtml(item)}</span>`).join("")}
            </div>
          ` : ""}

          <div class="ticket-actions">
            <a class="ticket-link" href="index.html?day=${encodeURIComponent(day.day)}">View day on route →</a>
          </div>
        </div>

        ${renderGraphic(day)}
      </div>
    </article>
  `;
}

function renderList() {
  const visible = getVisibleDays();

  if (!visible.length) {
    listEl.innerHTML = "";
    statusEl.textContent = "0 matching results";
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;
  statusEl.textContent = `${visible.length} matching ${visible.length === 1 ? "result" : "results"}`;
  listEl.innerHTML = visible.map(renderTicket).join("");
}

async function initTicketsPage() {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`Could not load ${DATA_URL}: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.days)) {
      throw new Error("trip.json loaded, but no days array was found.");
    }

    allTicketDays = data.days
      .filter(isCorrectMode)
      .sort((a, b) => Number(a.day) - Number(b.day));

    renderSummary();
    renderFilters();
    renderList();
  } catch (error) {
    console.error("RT2K15 ticket page error:", error);

    listEl.innerHTML = "";
    emptyEl.hidden = true;
    statusEl.innerHTML = `
      <strong>Ticket page failed to load.</strong>
      <span>Check that <code>data/trip.json</code> is valid JSON and in the right folder.</span>
    `;
  }
}

if (searchEl) {
  searchEl.addEventListener("input", event => {
    activeQuery = event.target.value.trim().toLowerCase();
    renderList();
  });
}

initTicketsPage();
