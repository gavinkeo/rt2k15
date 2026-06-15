const playlistTitleEl = document.getElementById("playlist-title");
const playlistFrameWrap = document.getElementById("playlist-frame-wrap");
const youtubeMusicLink = document.getElementById("youtube-music-link");
const youtubeLink = document.getElementById("youtube-link");
const tracklistEl = document.getElementById("tracklist");
const visibleTrackCount = document.getElementById("visible-track-count");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildPlaylistUrls(data) {
  const playlistId = data.playlistId || "";
  return {
    music: data.youtubeMusicUrl || (playlistId ? `https://music.youtube.com/playlist?list=${encodeURIComponent(playlistId)}` : "#"),
    youtube: data.playlistUrl || data.youtubeUrl || (playlistId ? `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}` : "#"),
    embed: playlistId ? `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}` : ""
  };
}

function renderSoundtrack(data) {
  const title = data.title || "RT2K15 YouTube Music Playlist";
  const tracks = Array.isArray(data.tracks) ? data.tracks : [];
  const urls = buildPlaylistUrls(data);

  if (playlistTitleEl) playlistTitleEl.textContent = title;

  if (youtubeMusicLink) youtubeMusicLink.href = urls.music;
  if (youtubeLink) youtubeLink.href = urls.youtube;

  if (playlistFrameWrap && urls.embed) {
    playlistFrameWrap.innerHTML = `<iframe src="${escapeHtml(urls.embed)}" title="${escapeHtml(title)}" loading="lazy" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  }

  if (visibleTrackCount) {
    const count = data.trackCount || tracks.length;
    visibleTrackCount.textContent = `${count} ${count === 1 ? "song" : "songs"}`;
  }

  if (tracklistEl) {
    if (!tracks.length) {
      tracklistEl.innerHTML = `<div class="empty-tracklist">Add songs to <code>tracks</code> in <code>data/soundtrack.json</code>.</div>`;
      return;
    }

    tracklistEl.innerHTML = tracks.map((track, index) => `
      <article class="track-row">
        <span class="track-number">${escapeHtml(track.number || index + 1)}</span>
        <div class="track-main">
          <strong>${escapeHtml(track.title || "Untitled")}</strong>
          <span>${escapeHtml(track.artist || "")}</span>
        </div>
        ${track.duration ? `<span class="track-duration">${escapeHtml(track.duration)}</span>` : ""}
      </article>
    `).join("");
  }
}

async function initSoundtrack() {
  try {
    const response = await fetch("data/soundtrack.json");
    if (!response.ok) return;
    const data = await response.json();
    renderSoundtrack(data);
  } catch (error) {
    console.warn("Could not load data/soundtrack.json", error);
  }
}

initSoundtrack();
