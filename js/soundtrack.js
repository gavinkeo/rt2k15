const songGrid = document.getElementById("song-grid");
const songCount = document.getElementById("song-count");
const summary = document.getElementById("soundtrack-summary");
const filterButtons = document.querySelectorAll(".filter-btn");

let songs = [];
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

function buildYoutubeSearchLink(song) {
  const query = `${song.title || ""} ${song.artist || ""}`.trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function getSongUrl(song) {
  return song.youtube || song.url || buildYoutubeSearchLink(song);
}

function getSongTag(song) {
  if (song.location) return song.location;
  if (song.category) return song.category;
  return "Road Trip 2K15";
}

function getArtwork(song) {
  return song.artwork || song.cover || "";
}

function getCategories(song) {
  const categories = song.categories || song.tags || [];
  return Array.isArray(categories) ? categories.map(classSafe) : [];
}

function songMatchesFilter(song) {
  if (activeFilter === "all") return true;
  return getCategories(song).includes(classSafe(activeFilter));
}

function tiltForIndex(index) {
  const tilts = ["-1.2deg", "0.9deg", "-0.6deg", "1.1deg", "-0.9deg", "0.5deg"];
  return tilts[index % tilts.length];
}

function renderSongs() {
  if (!songGrid) return;

  const visibleSongs = songs.filter(songMatchesFilter);

  if (!visibleSongs.length) {
    songGrid.innerHTML = `
      <div class="empty-state">
        No songs found for this filter.
      </div>
    `;
    return;
  }

  songGrid.innerHTML = visibleSongs.map((song, index) => {
    const title = song.title || "Untitled song";
    const artist = song.artist || "Unknown artist";
    const memory = song.memory || song.note || "";
    const url = getSongUrl(song);
    const artwork = getArtwork(song);
    const tag = getSongTag(song);
    const number = String(index + 1).padStart(2, "0");

    return `
      <article class="song-card" style="--tilt: ${tiltForIndex(index)}">
        ${artwork ? `
          <img
            class="song-art"
            src="${escapeHtml(artwork)}"
            alt=""
            loading="lazy"
            onerror="this.remove();"
          >
        ` : ""}

        <div class="song-inner">
          <span class="song-number">Track ${number}</span>

          <div class="song-spacer"></div>

          <h2 class="song-title">${escapeHtml(title)}</h2>
          <p class="song-artist">${escapeHtml(artist)}</p>

          ${memory ? `<p class="song-memory">${escapeHtml(memory)}</p>` : ""}

          <div class="song-footer">
            <span class="song-tag">${escapeHtml(tag)}</span>

            <a
              class="youtube-btn"
              href="${escapeHtml(url)}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open ${escapeHtml(title)} by ${escapeHtml(artist)} on YouTube"
            >
              YouTube
            </a>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderSummary() {
  if (songCount) {
    songCount.textContent = songs.length;
  }

  if (summary) {
    summary.textContent = `${songs.length} songs · Road Trip 2K15 soundtrack`;
  }
}

function setupFilters() {
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";

      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      renderSongs();
    });
  });
}

async function init() {
  try {
    const response = await fetch("data/soundtrack.json");

    if (!response.ok) {
      throw new Error(`Could not load soundtrack.json: ${response.status}`);
    }

    const data = await response.json();

    songs = Array.isArray(data) ? data : data.songs || [];

    renderSummary();
    setupFilters();
    renderSongs();
  } catch (error) {
    console.error(error);

    if (songCount) {
      songCount.textContent = "0";
    }

    if (summary) {
      summary.textContent = "Could not load soundtrack.";
    }

    if (songGrid) {
      songGrid.innerHTML = `
        <div class="empty-state">
          Could not load songs from data/soundtrack.json.
        </div>
      `;
    }
  }
}

init();
