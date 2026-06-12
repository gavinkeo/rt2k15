const ticketGrid = document.getElementById("ticket-grid");
const summary = document.getElementById("event-summary");
const filterButtons = document.querySelectorAll(".filter-btn");

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

  if (type === "UFC189") return "UFC";
  if (type === "CFB") return "NCAAF";

  return type;
}

function filterGroup(type) {
  const normalised = normaliseType(type);

  if (["Boxing", "UFC", "WWE"].includes(normalised)) return "Combat";
  if (["MLB", "NFL", "NCAAF", "MLS", "NHL", "Tennis", "MotoGP"].includes(normalised)) return normalised;
  if (normalised === "Concert") return "Concert";

  return "Other";
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
    NHL: "assets/logos/nhl.svg",
    Tennis: "assets/logos/us-open.svg",
    UFC: "assets/logos/ufc.svg",
    UFC189: "assets/logos/ufc.svg",
    WWE: "assets/logos/wwe.svg",
    MotoGP: "assets/logos/motogp.svg"
  };

  return logos[type] || logos[normalised] || "";
}

function getTicketCode(day, type, ticket = {}) {
  return ticket.code || ticket.eventCode || `RT2K15-${String(day.day).padStart(2, "0")}-${normaliseType(type).toUpperCase()}`;
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
      name: day.event.name,
      venue: getVenue(day),
      location: getEventLocation(day),
      date: day.event.date || day.date,
      logo: day.event.logo || getLogoPath(day.event.type),
      youtube: day.event.youtube || day.event.youtubeUrl || "",
      boxscore: day.event.boxscore || day.event.boxScore || day.event.boxscoreUrl || "",
      ticket: day.event.ticket || {}
    }));
}

function eventMatchesFilter(item) {
  if (activeFilter === "all") return true;

  if (activeFilter === "Combat") {
    return item.group === "Combat";
  }

  if (activeFilter === "Other") {
    return item.group === "Other";
  }

  return item.type === activeFilter || item.group === activeFilter;
}

function renderEvents() {
  const visibleEvents = allEvents.filter(eventMatchesFilter);

  if (!visibleEvents.length) {
    ticketGrid.innerHTML = `
      <div class="empty-state">
        No events found for this filter.
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
    const logo = item.logo;
    const ticket = item.ticket || {};

    const ticketCode = getTicketCode(day, type, ticket);
    const admission = ticket.admission || ticket.type || "Admit One";
    const section = ticket.section || ticket.sec || "";
    const row = ticket.row || "";
    const seat = ticket.seat || "";
    const doors = ticket.doors || ticket.gates || "";
    const eventTime = ticket.eventTime || ticket.time || "";
    const price = ticket.price || "";
    const entry = ticket.entry || "";

    const hasSeatInfo = Boolean(section || row || seat);
    const hasExtraInfo = Boolean(doors || eventTime || price || entry);

    const showYoutube = Boolean(item.youtube);
    const showBoxscore = type === "MLB" && Boolean(item.boxscore);
    const showActions = showYoutube || showBoxscore;

    const brandClass = logo ? "ticket-brand has-logo" : "ticket-brand no-logo";

    const logoMarkup = logo
      ? `<img
          class="event-logo event-logo-${escapeHtml(classSafe(type))}"
          src="${escapeHtml(logo)}"
          alt="${escapeHtml(type)} logo"
          loading="lazy"
          onerror="this.style.display='none'; this.parentElement.classList.add('logo-missing');"
        >`
      : "";

    const seatInfoMarkup = hasSeatInfo
      ? `
        <div class="stub-seat-info">
          ${section ? `
            <div>
              <span class="stub-seat-label">SEC</span>
              <span class="stub-seat-value">${escapeHtml(section)}</span>
            </div>
          ` : ""}

          ${row ? `
            <div>
              <span class="stub-seat-label">ROW</span>
              <span class="stub-seat-value">${escapeHtml(row)}</span>
            </div>
          ` : ""}

          ${seat ? `
            <div>
              <span class="stub-seat-label">SEAT</span>
              <span class="stub-seat-value">${escapeHtml(seat)}</span>
            </div>
          ` : ""}
        </div>
      `
      : "";

    const extraInfoMarkup = hasExtraInfo
      ? `
        <div class="ticket-extra-grid">
          ${entry ? `
            <div class="ticket-extra-cell">
              <span>Entry</span>
              <strong>${escapeHtml(entry)}</strong>
            </div>
          ` : ""}

          ${doors ? `
            <div class="ticket-extra-cell">
              <span>Doors</span>
              <strong>${escapeHtml(doors)}</strong>
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
        </div>
      `
      : "";

    return `
      <article class="ticket" style="--tilt: ${tiltForIndex(index)}">
<div class="ticket-main">
  <span class="ticket-corner-brand ${brandClass}">
    ${logoMarkup}
    <span class="event-type">${escapeHtml(type)}</span>
  </span>

  <h2>${escapeHtml(item.name)}</h2>

          <div class="ticket-meta">
            ${venue ? `<div><strong>Venue:</strong> ${escapeHtml(venue)}</div>` : ""}
            ${location ? `<div><strong>Location:</strong> ${escapeHtml(location)}</div>` : ""}
            ${date ? `<div><strong>Date:</strong> ${escapeHtml(date)}</div>` : ""}
          </div>

          ${extraInfoMarkup}

          ${showActions ? `
            <div class="ticket-actions">
              ${showYoutube ? `
                <a
                  class="ticket-action youtube-link"
                  href="${escapeHtml(item.youtube)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Watch ${escapeHtml(item.name)} highlights on YouTube"
                >
                  ▶ YouTube
                </a>
              ` : ""}

              ${showBoxscore ? `
                <a
                  class="ticket-action boxscore-link"
                  href="${escapeHtml(item.boxscore)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View box score for ${escapeHtml(item.name)}"
                >
                  Box Score
                </a>
              ` : ""}
            </div>
          ` : ""}

<div class="ticket-fineprint">
  <span>${escapeHtml(admission)}</span>
  <span>Event Code ${escapeHtml(ticketCode)}</span>
  <span>No refunds · No exchanges</span>
</div>
        </div>

        <aside class="ticket-stub">
          <div class="day-number">Day ${escapeHtml(day.day)}</div>

          ${seatInfoMarkup}

          <div class="barcode" aria-hidden="true"></div>
        </aside>
      </article>
    `;
  }).join("");
}

function renderSummary() {
  const total = allEvents.length;
  const types = [...new Set(allEvents.map(item => item.type))].sort();

  summary.textContent = `${total} events · ${types.join(" / ")}`;
}

function setupFilters() {
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;

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

    summary.textContent = "Could not load events.";

    ticketGrid.innerHTML = `
      <div class="empty-state">
        Could not load events from data/trip.json.
      </div>
    `;
  }
}

init();
