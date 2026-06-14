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
    day.event?.ticket?.seat
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
  const start = Math.floor((Number(dayNumber) - 1) / 10) * 10 + 1;
  const end = Math.min(start + 9, 90);
  return `Days ${start}–${end}`;
}

function renderRouteLine(day) {
  const parts = getRoutePlaces(day);

  if (!parts.length) return "";

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

function renderDayCard(day) {
  const type = day.type || "visited";
  const typeLabel = type === "drive" ? "Drive" : type === "stay" ? "Stay" : type;
  const routeLine = renderRouteLine(day);

  return `
    <article class="day-card" id="day-${escapeHtml(day.day)}">
      <div class="day-badge">
        <span>Day</span>
        <strong>${escapeHtml(day.day)}</strong>
      </div>

      <div class="day-main">
        <div class="day-topline">
          <span class="day-date">${escapeHtml(formatDate(day.date))}</span>
          <span class="type-badge ${escapeHtml(type)}">${escapeHtml(typeLabel)}</span>
        </div>

        <h2 class="day-title">${escapeHtml(getDayTitle(day))}</h2>

        ${routeLine ? `<div class="route-line">${routeLine}</div>` : ""}
        ${renderMeta(day)}
        ${renderVia(day)}
        ${renderEvent(day)}

        <div class="card-actions">
          <a class="map-link" href="index.html?day=${encodeURIComponent(day.day)}">View this day on route →</a>
        </div>
      </div>
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
