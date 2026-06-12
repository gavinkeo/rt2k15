const playlistWrap = document.getElementById("playlist-frame-wrap");
const youtubeMusicLink = document.getElementById("youtube-music-link");
const youtubeLink = document.getElementById("youtube-link");
const trackCount = document.getElementById("track-count");
const playlistTitle = document.getElementById("playlist-title");
const playlistDescription = document.getElementById("playlist-description");

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

function buildYoutubeUrl(playlistId) {
  return `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`;
}

function buildYoutubeMusicUrl(playlistId) {
  return `https://music.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`;
}

function buildEmbedUrl(playlistId) {
  return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}`;
}

function setHidden(el, hidden) {
  if (!el) return;
  el.style.display = hidden ? "none" : "";
}

function renderPlaylist(config) {
  const playlistId = extractPlaylistId(config.playlistId || config.playlistUrl || config.youtubeMusicUrl || "");

  if (trackCount) {
    trackCount.textContent = config.trackCount || "42";
  }

  if (playlistTitle && config.title) {
    playlistTitle.textContent = config.title;
  }

  if (playlistDescription && config.description) {
    playlistDescription.textContent = config.description;
  }

  if (!playlistId) {
    setHidden(youtubeMusicLink, true);
    setHidden(youtubeLink, true);
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

  if (youtubeMusicLink) {
    youtubeMusicLink.href = config.youtubeMusicUrl || buildYoutubeMusicUrl(playlistId);
    setHidden(youtubeMusicLink, false);
  }

  if (youtubeLink) {
    youtubeLink.href = config.playlistUrl || buildYoutubeUrl(playlistId);
    setHidden(youtubeLink, false);
  }
}

async function init() {
  try {
    const response = await fetch("data/soundtrack.json");

    if (!response.ok) {
      throw new Error(`Could not load soundtrack.json: ${response.status}`);
    }

    const config = await response.json();
    renderPlaylist(config);
  } catch (error) {
    console.error(error);

    if (playlistWrap) {
      playlistWrap.innerHTML = `
        <div class="playlist-placeholder">
          <strong>Could not load soundtrack</strong>
          <span>Check <code>data/soundtrack.json</code>.</span>
        </div>
      `;
    }

    setHidden(youtubeMusicLink, true);
    setHidden(youtubeLink, true);
  }
}

init();
