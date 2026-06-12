const eventsList = document.getElementById("events-list");
const eventsTotal = document.getElementById("events-total");
const eventsVisibleCount = document.getElementById("events-visible-count");
const searchInput = document.getElementById("events-search");
const filterButtons = document.querySelectorAll(".filter-btn");

let allEvents = [];
let activeFilter = "all";
let activeSearch = "";

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
  if (type === "NCAAF") return "CFB";

  return type;
}

function getVenue(day) {
  return day.event?.venue || day.event?.stadium || day.venue || day.stadium || "";
}

function getEventLocation(day) {
  return day.event?.location || day.finish || "";
}

function getLogoPath(type) {
  const normalised = normaliseType(type);

  const logos = {
    MLB: "assets/logos/mlb.svg",
    NFL: "assets/logos/nfl.svg",
    CFB: "assets/logos/ncaa.svg",
    NCAAF: "assets/logos/ncaa.svg",
    MLS: "assets/logos/mls.svg",
    NHL: "assets/logos/nhl.svg",
    Tennis: "assets/logos/us-open.svg",
    UFC: "assets/logos/ufc.svg",
    UFC189: "assets/logos/ufc.svg",
    Boxing: "assets/logos/boxing.svg",
    WWE: "assets/logos/wwe.svg",
    MotoGP: "assets/logos/motogp.svg",
    Concert: "",
    Comedy: "",
    "TV Show": ""
  };

  return logos[type] || logos[normalised] || "";
}

function getFallbackEmoji(type) {
  const normalised = normaliseType(type);

  const emojis = {
    MLB: "⚾",
    NFL: "🏈",
    CFB: "🏈",
    NCAAF: "🏈",
    MLS: "⚽",
    NHL: "🏒",
    Tennis: "🎾",
    UFC: "🥊",
    Boxing: "🥊",
    WWE: "🤼",
    MotoGP: "🏁",
    Concert: "🎤",
    Comedy: "🎭",
    "TV Show": "📺",
    Other: "★"
  };

  return emojis[normalised] || emojis[type] || "★";
}

function buildEventList(tripData) {
  return tripData.days
    .filter(day => day.event)
    .map(day => {
      const type = normaliseType(day.event.type);

      return {
        day,
        event: day.event,
        type,
        name: day.event.name || "Untitled event",
        venue: getVenue(day),
        location: getEventLocation(day),
        date: day.event.date || day.date,
        logo: day.event.logo || getLogoPath(day.event.type),
        emoji: getFallbackEmoji(day.event.type),
        youtube: day.event.youtube || day.event.youtubeUrl || "",
        boxscore: day.event.boxscore || day.event.boxScore || day.event.boxscoreUrl || ""
      };
    });
}

function eventMatchesFilter(item) {
  if (activeFilter === "all") return true;

  return item.type === activeFilter;
}

function eventMatchesSearch(item) {
  if (!activeSearch) return true;

  const haystack = [
    item.type,
    item.name,
    item.venue,
    item.location,
    item.date,
    `Day ${item.day.day}`
  ].join(" ").toLowerCase();

  return haystack.includes(activeSearch);
}

function renderEvents() {
  if (!eventsList) return;

  const visibleEvents = allEvents.filter(item => {
    return eventMatchesFilter(item) && eventMatchesSearch(item);
  });

  if (eventsVisibleCount) {
    eventsVisibleCount.textContent = visibleEvents.length;
  }

  if (!visibleEvents.length) {
    eventsList.innerHTML = `
      <div class="events-loading">
        No events found.
      </div>
    `;
    return;
  }

  eventsList.innerHTML = visibleEvents.map(item => {
    const day = item.day;
    const date = formatDate(item.date);
    const showYoutube = Boolean(item.youtube);
    const showBoxscore = item.type === "MLB" && Boolean(item.boxscore);
    const showActions = showYoutube || showBoxscore;

    const logoMarkup = item.logo
      ? `
        <img
          class="event-logo event-logo-${escapeHtml(item.type.toLowerCase())}"
          src="${escapeHtml(item.logo)}"
          alt="${escapeHtml(item.type)} logo"
          loading="lazy"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';"
        >
        <span class="event-logo-fallback" style="display:none;">${escapeHtml(item.emoji)}</span>
      `
      : `<span class="event-logo-fallback">${escapeHtml(item.emoji)}</span>`;

    return `
      <article class="event-card">
        <div class="event-card-main">
          <div class="event-card-topline">
            <span class="event-day">Day ${escapeHtml(day.day)}</span>
            <span class="event-type-pill">${escapeHtml(item.type)}</span>
          </div>

          <div class="event-card-body">
            <div class="event-logo-wrap">
              ${logoMarkup}
            </div>

            <div class="event-info">
              <h2>${escapeHtml(item.name)}</h2>

              <div class="event-meta">
                ${item.venue ? `<div><strong>Venue:</strong> ${escapeHtml(item.venue)}</div>` : ""}
                ${item.location ? `<div><strong>Location:</strong> ${escapeHtml(item.location)}</div>` : ""}
                ${date ? `<div><strong>Date:</strong> ${escapeHtml(date)}</div>` : ""}
              </div>

              ${showActions ? `
                <div class="event-actions">
                  ${showYoutube ? `
                    <a
                      class="event-action"
                      href="${escapeHtml(item.youtube)}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ▶ YouTube
                    </a>
                  ` : ""}

                  ${showBoxscore ? `
                    <a
                      class="event-action"
                      href="${escapeHtml(item.boxscore)}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Box Score
                    </a>
                  ` : ""}
                </div>
              ` : ""}
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function updateSummary() {
  if (eventsTotal) {
    eventsTotal.textContent = allEvents.length;
  }

  if (eventsVisibleCount) {
    eventsVisibleCount.textContent = allEvents.length;
  }
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

function setupSearch() {
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    activeSearch = searchInput.value.trim().toLowerCase();
    renderEvents();
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

    updateSummary();
    setupFilters();
    setupSearch();
    renderEvents();
  } catch (error) {
    console.error(error);

    if (eventsTotal) {
      eventsTotal.textContent = "—";
    }

    if (eventsVisibleCount) {
      eventsVisibleCount.textContent = "0";
    }

    if (eventsList) {
      eventsList.innerHTML = `
        <div class="events-loading">
          Could not load events from data/trip.json.
        </div>
      `;
    }
  }
}

init();
