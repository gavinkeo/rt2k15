const DATA_URL = "data/trip.json";

let allDays = [];
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

function getRoutePlaces(day) {
  const viaStops = Array.isArray(day.viaStops) ? day.viaStops : [];

  return [day.start, ...viaStops, day.finish]
    .filter(Boolean)
    .filter((place, index, arr) => index === 0 || place !== arr[index - 1]);
}

function getDayTitle(day) {
  if (day.start && day.finish && day.start !== day.finish) {
    return `${day.start} → ${day.finish}`;
  }

  if (day.finish) return day.finish;
  if (day.start) return day.start;
  return `Day ${day.day}`;
}

function getSearchHaystack(day) {
  return [
    day.day,
    day.date,
    day.start,
    day.finish,
    day.type,
    day.via,
    ...(Array.isArray(day.viaStops) ? day.viaStops : []),
    day.hotel,
    day.event?.type,
    day.event?.name,
    day.event?.venue,
    day.event?.location,
    day.event?.ticket?.section,
    day.event?.ticket?.row,
    day.event?.ticket?.seat,
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
    .map(part => `<span>${escapeHtml(part)}</span>`)
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
          ${venue ? escapeHtml(venue) : ""}
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
      <span>${viaStops.map(escapeHtml).join(" · ")}</span>
    </div>
  `;
}

function renderCompactEventLine(day) {
  if (!day.event) return "";

  const event = day.event;
  const venue = event.venue || event.location || "";
  const type = event.type ? `${event.type} · ` : "";
  const venueText = venue ? ` · ${venue}` : "";

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

function renderDayCard(day) {
  const type = day.type || "visited";
  const typeLabel = type === "drive" ? "Drive" : type === "stay" ? "Stay" : type;
  const routeLine = renderRouteLine(day);

  return `
    <article class="day-card" id="day-${escapeHtml(day.day)}">
      <div class="day-badge">
        <span>Day</span>
        <strong>${escapeHtml(day.day)}</strong>
        <small>${escapeHtml(formatDateShort(day.date))}</small>
      </div>

      <div class="day-main">
        <div class="day-topline">
          <span class="day-date">${escapeHtml(formatDate(day.date))}</span>
          <span class="type-badge ${escapeHtml(type)}">${escapeHtml(typeLabel)}</span>
        </div>

        <h2 class="day-title">${escapeHtml(getDayTitle(day))}</h2>
        ${routeLine ? `<div class="route-line">${routeLine}</div>` : ""}
        ${renderStopsLine(day)}
        ${renderCompactEventLine(day)}
      </div>

      ${renderStateCell(day)}
      ${renderStatsCell(day)}
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
