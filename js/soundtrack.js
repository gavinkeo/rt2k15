const playlistWrap = document.getElementById("playlist-frame-wrap");
const playlistLink = document.getElementById("playlist-link");
const trackCount = document.getElementById("track-count");
const memoryGrid = document.getElementById("memory-grid");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function extractPlaylistId(value) {
  if (!value) return "";

  const trimmed = String(value).trim();

  if (!trimmed.includes("http")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    return url.searchParams.get("list") || "";
  } catch {
    return "";
  }
}

function buildPlaylistUrl(playlistId) {
  return `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`;
}

function buildEmbedUrl(playlistId) {
  return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}`;
}

function tiltForIndex(index) {
  const tilts = ["-1deg", "0.8deg", "-0.5deg", "1.1deg", "-0.8deg", "0.4deg"];
  return tilts[index % tilts.length];
}

function renderPlaylist(config) {
  const playlistId = extractPlaylistId(config.playlistId || config.playlistUrl || "");

  if (trackCount) {
    trackCount.textContent = config.trackCount || "42";
  }

  if (!playlistId) {
    if (playlistLink) {
      playlistLink.style.display = "none";
    }

    return;
  }

  if (playlistWrap) {
    playlistWrap.innerHTML = `
      <iframe
        src="${escapeHtml(buildEmbedUrl(playlistId))}"
        title="${escapeHtml(config.title || "Road Trip 2K15 Soundtrack")}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen>
      </iframe>
    `;
  }

  if (playlistLink) {
    playlistLink.href = config.playlistUrl || buildPlaylistUrl(playlistId);
    playlistLink.style.display = "inline-flex";
  }
}

function renderMemories(memories = []) {
  if (!memoryGrid) return;

  if (!memories.length) {
    memoryGrid.innerHTML = `
      <div class="empty-state">
        Add featured memories in data/soundtrack.json.
      </div>
    `;
    return;
  }

  memoryGrid.innerHTML = memories.map((memory, index) => {
    const title = memory.title || "Untitled song";
    const artist = memory.artist || "";
    const note = memory.memory || memory.note || "";
    const location = memory.location || "Road Trip";
    const track = memory.track ? `Track ${String(memory.track).padStart(2, "0")}` : `Memory ${String(index + 1).padStart(2, "0")}`;

    return `
      <article class="memory-card" style="--tilt: ${tiltForIndex(index)}">
        <div class="memory-topline">
          <span>${escapeHtml(track)}</span>
          <span>${escapeHtml(location)}</span>
        </div>

        <h3>${escapeHtml(title)}</h3>

        ${artist ? `<p class="memory-artist">${escapeHtml(artist)}</p>` : ""}
        ${note ? `<p class="memory-note">${escapeHtml(note)}</p>` : ""}
      </article>
    `;
  }).join("");
}

async function init() {
  try {
    const response = await fetch("data/soundtrack.json");

    if (!response.ok) {
      throw new Error(`Could not load soundtrack.json: ${response.status}`);
    }

    const config = await response.json();

    renderPlaylist(config);
    renderMemories(config.featuredMemories || []);
  } catch (error) {
    console.error(error);

    if (memoryGrid) {
      memoryGrid.innerHTML = `
        <div class="empty-state">
          Could not load data/soundtrack.json.
        </div>
      `;
    }
  }
}

init();
