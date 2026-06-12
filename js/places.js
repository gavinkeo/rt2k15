const grid = document.getElementById("places-grid");
const totalEl = document.getElementById("place-total");

const modal = document.getElementById("gallery-modal");
const modalImage = document.getElementById("gallery-image");
const modalPlaceholder = document.getElementById("gallery-placeholder");
const modalTitle = document.getElementById("gallery-title");
const modalMeta = document.getElementById("gallery-meta");
const modalCaption = document.getElementById("gallery-caption");
const modalCount = document.getElementById("gallery-count");
const prevBtn = document.getElementById("gallery-prev");
const nextBtn = document.getElementById("gallery-next");
const closeButtons = document.querySelectorAll("[data-gallery-close]");

const pageType = document.body.dataset.placeType || "park";
const pageTitle = document.body.dataset.pageTitle || "Places";

let places = [];
let currentPlace = null;
let currentPhotos = [];
let currentPhotoIndex = 0;

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

function padPhotoNumber(number) {
  return String(number).padStart(2, "0");
}

function titleCaseType(type) {
  if (type === "park") return "Nature";
  if (type === "city") return "City";
  return "Place";
}

function tiltForIndex(index) {
  const tilts = ["-0.8deg", "0.6deg", "-0.3deg", "0.9deg", "-0.6deg", "0.4deg"];
  return tilts[index % tilts.length];
}

function getPlaceFolder(place) {
  return place.folder || `assets/places/${place.slug}`;
}

function buildPhotos(place) {
  if (Array.isArray(place.photos) && place.photos.length) {
    return place.photos.map(photo => {
      if (typeof photo === "string") {
        return {
          src: photo,
          caption: place.name
        };
      }

      return {
        src: photo.src,
        caption: photo.caption || place.name
      };
    }).filter(photo => photo.src);
  }

  if (Number(place.photoCount) > 0) {
    const folder = getPlaceFolder(place);

    return Array.from({ length: Number(place.photoCount) }, (_, index) => ({
      src: `${folder}/${padPhotoNumber(index + 1)}.jpg`,
      caption: place.name
    }));
  }

  if (place.cover) {
    return [{
      src: place.cover,
      caption: place.name
    }];
  }

  return [];
}

function getPhotoLabel(place) {
  if (Array.isArray(place.photos) && place.photos.length) {
    return place.photos.length === 1 ? "1 photo" : `${place.photos.length} photos`;
  }

  if (Number(place.photoCount) > 0) {
    return Number(place.photoCount) === 1 ? "1 photo" : `${Number(place.photoCount)} photos`;
  }

  return "Gallery";
}

function renderPlaces() {
  if (!grid) return;

  if (!places.length) {
    grid.innerHTML = `
      <div class="empty-state">
        No ${escapeHtml(pageTitle.toLowerCase())} found.
      </div>
    `;
    return;
  }

  grid.innerHTML = places.map((place, index) => {
    const cover = place.cover || `${getPlaceFolder(place)}/cover.jpg`;
    const typeLabel = titleCaseType(place.type);
    const note = place.note || "Click to open photo gallery";
    const location = place.location || "Road Trip 2K15";

    return `
      <button
        class="place-tile place-tile-${escapeHtml(classSafe(place.type))}"
        type="button"
        style="--tilt: ${tiltForIndex(index)}"
        data-place-index="${index}"
        aria-label="Open ${escapeHtml(place.name)} gallery"
      >
        <img
          class="place-tile-image"
          src="${escapeHtml(cover)}"
          alt=""
          loading="lazy"
        >

        <span class="place-tile-content">
          <span class="place-type-pill">${escapeHtml(typeLabel)}</span>
          <span class="place-photo-count">${escapeHtml(getPhotoLabel(place))}</span>
          <h2>${escapeHtml(place.name)}</h2>
          <span class="place-location">${escapeHtml(location)}</span>
          <span class="place-note">${escapeHtml(note)}</span>
        </span>
      </button>
    `;
  }).join("");

  grid.querySelectorAll(".place-tile-image").forEach(image => {
    image.addEventListener("error", () => {
      image.classList.add("is-hidden");
    });
  });

  grid.querySelectorAll(".place-tile").forEach(tile => {
    tile.addEventListener("click", () => {
      const index = Number(tile.dataset.placeIndex);
      openGallery(index);
    });
  });
}

function updateGalleryImage() {
  if (!modal || !currentPlace) return;

  const photo = currentPhotos[currentPhotoIndex];
  const hasPhoto = Boolean(photo?.src);

  modalTitle.textContent = currentPlace.name;
  modalMeta.textContent = [currentPlace.location, currentPlace.routeNote].filter(Boolean).join(" · ") || "Road Trip 2K15";
  modalCaption.textContent = hasPhoto
    ? photo.caption || currentPlace.name
    : "Add photos to this place folder to build the gallery.";

  modalCount.textContent = currentPhotos.length
    ? `${currentPhotoIndex + 1} / ${currentPhotos.length}`
    : "0 / 0";

  prevBtn.disabled = currentPhotos.length <= 1;
  nextBtn.disabled = currentPhotos.length <= 1;

  modalImage.classList.add("is-hidden");
  modalPlaceholder.classList.toggle("show", !hasPhoto);

  if (!hasPhoto) {
    modalImage.removeAttribute("src");
    modalImage.alt = "";
    return;
  }

  modalImage.onload = () => {
    modalImage.classList.remove("is-hidden");
    modalPlaceholder.classList.remove("show");
  };

  modalImage.onerror = () => {
    modalImage.classList.add("is-hidden");
    modalPlaceholder.classList.add("show");
  };

  modalImage.alt = `${currentPlace.name} photo ${currentPhotoIndex + 1}`;
  modalImage.src = photo.src;
}

function openGallery(placeIndex) {
  currentPlace = places[placeIndex];

  if (!currentPlace) return;

  currentPhotos = buildPhotos(currentPlace);
  currentPhotoIndex = 0;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("gallery-open");

  updateGalleryImage();
}

function closeGallery() {
  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("gallery-open");

  currentPlace = null;
  currentPhotos = [];
  currentPhotoIndex = 0;

  modalImage.removeAttribute("src");
}

function moveGallery(direction) {
  if (!currentPhotos.length) return;

  currentPhotoIndex = (currentPhotoIndex + direction + currentPhotos.length) % currentPhotos.length;
  updateGalleryImage();
}

function setupGalleryControls() {
  closeButtons.forEach(button => {
    button.addEventListener("click", closeGallery);
  });

  prevBtn.addEventListener("click", () => moveGallery(-1));
  nextBtn.addEventListener("click", () => moveGallery(1));

  document.addEventListener("keydown", event => {
    if (!modal.classList.contains("open")) return;

    if (event.key === "Escape") {
      closeGallery();
    }

    if (event.key === "ArrowLeft") {
      moveGallery(-1);
    }

    if (event.key === "ArrowRight") {
      moveGallery(1);
    }
  });
}

async function init() {
  try {
    const response = await fetch("data/places.json");

    if (!response.ok) {
      throw new Error(`Could not load places.json: ${response.status}`);
    }

    const data = await response.json();
    const allPlaces = Array.isArray(data) ? data : data.places;

    places = allPlaces
      .filter(place => place.type === pageType)
      .map(place => ({
        ...place,
        slug: place.slug || classSafe(place.name),
        cover: place.cover || `assets/places/${place.slug || classSafe(place.name)}/cover.jpg`
      }));

    if (totalEl) {
      totalEl.textContent = places.length;
    }

    renderPlaces();
    setupGalleryControls();
  } catch (error) {
    console.error(error);

    if (grid) {
      grid.innerHTML = `
        <div class="empty-state">
          Could not load places from data/places.json.
        </div>
      `;
    }
  }
}

init();
