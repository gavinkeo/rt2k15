const ticketGrid = document.getElementById("ticket-grid");
const summary = document.getElementById("event-summary");
const filterButtons = document.querySelectorAll(".filter-btn");

const pageMode = document.body.dataset.eventPage || (
  window.location.pathname.toLowerCase().includes("sports") ? "sports" : "events"
);

const SPORTS_TYPES = new Set([
  "MLB",
  "NFL",
  "NCAAF",
  "MLS",
  "NHL",
  "Tennis",
  "UFC",
  "WWE",
  "Boxing"
  "TV Show"
]);

const NON_SPORT_MAIN_TYPES = new Set([
  "Concert",
  "Comedy",
  "Theme Park"
]);

let allEvents = [];
let activeFilter = "all";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function classSafe(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function normaliseType(type) {
  if (!type) return "Other";

  const value = String(type).trim();

  if (value === "UFC189" || value === "UFC 189") return "UFC";
  if (value === "CFB") return "NCAAF";

  return value;
}

function filterGroup(type) {
  const normalised = normaliseType(type);

  if ([
    "MLB",
    "NFL",
    "NCAAF",
    "MLS",
    "NHL",
    "Tennis",
    "MotoGP",
    "UFC",
    "WWE",
    "Boxing"
  ].includes(normalised)) {
    return normalised;
  }

  if (normalised === "Concert") return "Concert";
  if (normalised === "Comedy") return "Comedy";
  if (normalised === "Theme Park") return "Theme Park";

  return "Other";
}

function isSportsTvItem(item) {
  const text = [
    item.type,
    item.name,
    item.venue,
    item.location
  ].filter(Boolean).join(" ").toLowerCase();

  return item.type === "TV Show" && (
    text.includes("espn") ||
    text.includes("sports nation")
  );
}

function isSportsItem(item) {
  return SPORTS_TYPES.has(item.type) || isSportsTvItem(item);
}

function isCorrectPageItem(item) {
  return pageMode === "sports" ? isSportsItem(item) : !isSportsItem(item);
}

function getEventLocation(day) {
  return day.event?.location || day.finish || "";
}

function getVenue(day) {
  return day.event?.venue || day.event?.stadium || day.venue || day.stadium || "";
}

function getLogoPath(type) {
  const normalised = normaliseType(type);

  const logos = {
    MLB: "assets/logos/mlb.svg",
    NFL: "assets/logos/nfl.svg",
    NCAAF: "assets/logos/ncaa.svg",
    CFB: "assets/logos/ncaa.svg",
    MLS: "assets/logos/mls.svg",
    NHL: "assets/logos/nhl.png",
    Tennis: "assets/logos/us-open.svg",
    UFC: "assets/logos/ufc.svg",
    UFC189: "assets/logos/ufc.svg",
    Boxing: "assets/logos/boxing.png",
    WWE: "assets/logos/wwe.png",
    MotoGP: "assets/logos/motogp.svg",
    Concert: "assets/logos/concert.png",
    Comedy: "assets/logos/comedy.png",
    "TV Show": "assets/logos/tv-show.png",
    "Theme Park": "assets/logos/theme-park.png"
  };

  return logos[type] || logos[normalised] || "";
}

function getTicketCode(day, type, ticket = {}) {
  return (
    ticket.code ||
    ticket.eventCode ||
    `RT2K15-${String(day.day).padStart(2, "0")}-${normaliseType(type).toUpperCase()}`
  );
}

function tiltForIndex(index) {
  const tilts = ["-1.2deg", "0.8deg", "-0.5deg", "1.1deg", "-0.8deg", "0.4deg"];
  return tilts[index % tilts.length];
}

function buildEventList(tripData) {
  return tripData.days
    .filter(day => day.event)
    .map(day => ({
      day,
      event: day.event,
      type: normaliseType(day.event.type),
      group: filterGroup(day.event.type),
      name: day.event.name || "Untitled event",
      venue: getVenue(day),
      location: getEventLocation(day),
      date: day.event.date || day.date,
      logo: day.event.logo || getLogoPath(day.event.type),
      stubGraphic: day.event.stubGraphic || "",
      youtube: day.event.youtube || day.event.youtubeUrl || "",
      boxscore: day.event.boxscore || day.event.boxScore || day.event.boxscoreUrl || "",
      ticket: day.event.ticket || {}
    }))
    .filter(isCorrectPageItem);
}



function eventMatchesFilter(item) {
  if (activeFilter === "all") return true;

  if (activeFilter === "Other") {
    if (pageMode === "events") {
      return !NON_SPORT_MAIN_TYPES.has(item.type);
    }

    return item.group === "Other";
  }

  return item.type === activeFilter || item.group === activeFilter;
}



function renderEvents() {
  if (!ticketGrid || !summary) return;

  const visibleEvents = allEvents.filter(eventMatchesFilter);

  if (!visibleEvents.length) {
    ticketGrid.innerHTML = `
      <div class="empty-state">
        No ${pageMode === "sports" ? "sports" : "events"} found for this filter.
      </div>
    `;
    return;
  }

  ticketGrid.innerHTML = visibleEvents.map((item, index) => {
    const day = item.day;
    const type = item.type;
    const venue = item.venue;
    const location = item.location;
    const date = formatDate(item.date);
    const ticket = item.ticket || {};

    const ticketCode = getTicketCode(day, type, ticket);

    const section = ticket.section || ticket.sec || "";
    const row = ticket.row || "";
    const seat = ticket.seat || "";
    const doors = ticket.doors || ticket.gates || "";
    const eventTime = ticket.eventTime || ticket.time || "";
    const price = ticket.price || "";
    const entry = ticket.entry || "";

    const showYoutube = Boolean(item.youtube);
    const showBoxscore = type === "MLB" && Boolean(item.boxscore);

    const usingStubGraphic = Boolean(item.stubGraphic);
    const graphicPath = usingStubGraphic ? item.stubGraphic : item.logo;
    const brandClass = graphicPath ? "stub-brand has-logo" : "stub-brand no-logo";

    const logoMarkup = graphicPath
      ? `<img
          class="event-logo ${usingStubGraphic ? "event-logo-custom" : `event-logo-${escapeHtml(classSafe(type))}`}"
          src="${escapeHtml(graphicPath)}"
          alt="${escapeHtml(item.name)} graphic"
          loading="lazy"
          onerror="this.style.display='none'; this.parentElement.classList.add('logo-missing');"
        >`
      : "";

    const extraInfoMarkup = (section || row || seat || entry || doors || eventTime || price)
      ? `
        <div class="ticket-extra-grid">
          ${section ? `
            <div class="ticket-extra-cell">
              <span>Sec</span>
              <strong>${escapeHtml(section)}</strong>
            </div>
          ` : ""}

          ${row ? `
            <div class="ticket-extra-cell">
              <span>Row</span>
              <strong>${escapeHtml(row)}</strong>
            </div>
          ` : ""}

          ${seat ? `
            <div class="ticket-extra-cell">
              <span>Seat</span>
              <strong>${escapeHtml(seat)}</strong>
            </div>
          ` : ""}

          ${eventTime ? `
            <div class="ticket-extra-cell">
              <span>Event</span>
              <strong>${escapeHtml(eventTime)}</strong>
            </div>
          ` : ""}

          ${price ? `
            <div class="ticket-extra-cell">
              <span>Price</span>
              <strong>${escapeHtml(price)}</strong>
            </div>
          ` : ""}

          ${doors ? `
            <div class="ticket-extra-cell">
              <span>Doors</span>
              <strong>${escapeHtml(doors)}</strong>
            </div>
          ` : ""}

          ${entry ? `
            <div class="ticket-extra-cell">
              <span>Entry</span>
              <strong>${escapeHtml(entry)}</strong>
            </div>
          ` : ""}
        </div>
      `
      : "";

    const stubActionsMarkup = (showYoutube || showBoxscore)
      ? `
        <div class="stub-actions">
          ${showYoutube ? `
            <a
              class="stub-action youtube-link"
              href="${escapeHtml(item.youtube)}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Watch ${escapeHtml(item.name)} highlights on YouTube"
            >
              YouTube
            </a>
          ` : ""}

          ${showBoxscore ? `
            <a
              class="stub-action boxscore-link"
              href="${escapeHtml(item.boxscore)}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View box score for ${escapeHtml(item.name)}"
            >
              Box Score
            </a>
          ` : ""}
        </div>
      `
      : "";

    return `
      <article class="ticket" style="--tilt: ${tiltForIndex(index)}">
        <div class="ticket-main">
          <h2>${escapeHtml(item.name)}</h2>

          <div class="ticket-meta">
            ${venue ? `<div><strong>Venue:</strong> ${escapeHtml(venue)}</div>` : ""}
            ${location ? `<div><strong>Location:</strong> ${escapeHtml(location)}</div>` : ""}
            ${date ? `<div><strong>Date:</strong> ${escapeHtml(date)}</div>` : ""}
          </div>

          ${extraInfoMarkup}

<div class="ticket-fineprint">
  <span>${escapeHtml(ticketCode)}</span>
</div>
        </div>

        <aside class="ticket-stub">
          ${stubActionsMarkup}

          <span class="${brandClass}">
            ${logoMarkup}
            <span class="event-type">${escapeHtml(type)}</span>
          </span>
        </aside>
      </article>
    `;
  }).join("");
}

function renderSummary() {
  if (!summary) return;

  const total = allEvents.length;
  const types = [...new Set(allEvents.map(item => item.type))].sort();
  const label = pageMode === "sports" ? "sports" : "events";

  summary.textContent = `${total} ${label} · ${types.join(" / ")}`;
}

function setupFilters() {
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";

      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      renderEvents();
    });
  });
}

async function init() {
  try {
    const response = await fetch("data/trip.json");

    if (!response.ok) {
      throw new Error(`Could not load trip.json: ${response.status}`);
    }

    const tripData = await response.json();

    allEvents = buildEventList(tripData);

    renderSummary();
    setupFilters();
    renderEvents();
  } catch (error) {
    console.error(error);

    if (summary) {
      summary.textContent = pageMode === "sports" ? "Could not load sports." : "Could not load events.";
    }

    if (ticketGrid) {
      ticketGrid.innerHTML = `
        <div class="empty-state">
          Could not load ${pageMode === "sports" ? "sports" : "events"} from data/trip.json.
        </div>
      `;
    }
  }
}

init();
