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
  if (["MLB", "NFL", "NCAAF", "MLS", "Tennis", "MotoGP"].includes(normalised)) return normalised;
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
    Tennis: "assets/logos/us-open.svg",
    UFC: "assets/logos/ufc.svg",
    UFC189: "assets/logos/ufc.svg",
    WWE: "assets/logos/wwe.svg",
    MotoGP: "assets/logos/motogp.svg"
  };

  return logos[type] || logos[normalised] || "";
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
      logo: day.event.logo || getLogoPath(day.event.type)
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

    const brandClass = logo ? "ticket-brand has-logo" : "ticket-brand no-logo";

    const logoMarkup = logo
      ? `<img
          class="event-logo event-logo-${escapeHtml(type.toLowerCase())}"
          src="${escapeHtml(logo)}"
          alt="${escapeHtml(type)} logo"
          loading="lazy"
          onerror="this.style.display='none'; this.parentElement.classList.add('logo-missing');"
        >`
      : "";

    return `
      <article class="ticket" style="--tilt: ${tiltForIndex(index)}">
        <div class="ticket-main">
          <div class="ticket-topline">
            <span class="admit">Admit One</span>

            <span class="${brandClass}">
              ${logoMarkup}
              <span class="event-type">${escapeHtml(type)}</span>
            </span>
          </div>

          <h2>${escapeHtml(item.name)}</h2>

          <div class="ticket-meta">
            ${venue ? `<div><strong>Venue:</strong> ${escapeHtml(venue)}</div>` : ""}
            ${location ? `<div><strong>Location:</strong> ${escapeHtml(location)}</div>` : ""}
            ${date ? `<div><strong>Date:</strong> ${escapeHtml(date)}</div>` : ""}
          </div>
        </div>

        <aside class="ticket-stub">
          <div class="day-number">Day ${escapeHtml(day.day)}</div>
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
