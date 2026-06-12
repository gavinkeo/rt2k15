const playlistWrap = document.getElementById("playlist-frame-wrap");
const youtubeMusicLink = document.getElementById("youtube-music-link");
const youtubeLink = document.getElementById("youtube-link");
const trackCount = document.getElementById("track-count");
const visibleTrackCount = document.getElementById("visible-track-count");
const playlistTitle = document.getElementById("playlist-title");
const tracklist = document.getElementById("tracklist");

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

function getTrackUrl(track, playlistId) {
  if (track.youtube) return track.youtube;
  if (track.url) return track.url;
  if (playlistId && track.videoId) {
    return `https://www.youtube.com/watch?v=${encodeURIComponent(track.videoId)}&list=${encodeURIComponent(playlistId)}`;
  }
  if (track.videoId) {
    return `https://www.youtube.com/watch?v=${encodeURIComponent(track.videoId)}`;
  }
  if (track.title || track.artist) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.title || ""} ${track.artist || ""}`.trim())}`;
  }
  return "#";
}

function renderPlaylist(config, playlistId) {
  if (trackCount) {
    trackCount.textContent = config.trackCount || (Array.isArray(config.tracks) ? config.tracks.length : "42");
  }

  if (playlistTitle && config.title) {
    playlistTitle.textContent = config.title;
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

function renderTracklist(tracks = [], playlistId = "") {
  if (!tracklist) return;

  if (visibleTrackCount) {
    visibleTrackCount.textContent = `${tracks.length} song${tracks.length === 1 ? "" : "s"}`;
  }

  if (!tracks.length) {
    tracklist.innerHTML = `
      <div class="empty-tracklist">
        Add songs to <code>tracks</code> in <code>data/soundtrack.json</code>.
      </div>
    `;
    return;
  }

  tracklist.innerHTML = tracks.map((track, index) => {
    const number = track.number || index + 1;
    const paddedNumber = String(number).padStart(2, "0");
    const title = track.title || "Untitled song";
    const artist = track.artist || "";
    const url = getTrackUrl(track, playlistId);

    return `
      <a class="track" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
        <span class="track-number">${escapeHtml(paddedNumber)}</span>

        <span class="track-info">
          <span class="track-title">${escapeHtml(title)}</span>
          ${artist ? `<span class="track-artist">${escapeHtml(artist)}</span>` : ""}
        </span>
      </a>
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
    const playlistId = extractPlaylistId(config.playlistId || config.playlistUrl || config.youtubeMusicUrl || "");

    renderPlaylist(config, playlistId);
    renderTracklist(Array.isArray(config.tracks) ? config.tracks : [], playlistId);
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

    if (tracklist) {
      tracklist.innerHTML = `
        <div class="empty-tracklist">
          Could not load <code>data/soundtrack.json</code>.
        </div>
      `;
    }

    setHidden(youtubeMusicLink, true);
    setHidden(youtubeLink, true);
  }
}

init();
