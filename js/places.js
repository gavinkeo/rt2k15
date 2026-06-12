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

const DEFAULT_MAX_AUTO_PHOTOS = 40;
const DEFAULT_AUTO_EXTENSIONS = ["jpg"];

let places = [];
let currentPlace = null;
let currentPhotos = [];
let currentPhotoIndex = 0;
let galleryRequestId = 0;

const imageExistsCache = new Map();
const galleryCache = new Map();

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
  return place.folder || `assets/places/${place.slug || classSafe(place.name)}`;
}

function normaliseExplicitPhotos(place) {
  if (!Array.isArray(place.photos) || !place.photos.length) {
    return [];
  }

  return place.photos
    .map(photo => {
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
    })
    .filter(photo => photo.src);
}

function buildNumberedPhotos(place, count) {
  const folder = getPlaceFolder(place);

  return Array.from({ length: Number(count) }, (_, index) => ({
    src: `${folder}/${padPhotoNumber(index + 1)}.jpg`,
    caption: place.name
  }));
}

function imageExists(src) {
  if (!src) return Promise.resolve(false);

  if (imageExistsCache.has(src)) {
    return imageExistsCache.get(src);
  }

  const check = new Promise(resolve => {
    const image = new Image();

    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });

  imageExistsCache.set(src, check);

  return check;
}

async function findFirstExistingPhoto(number, place) {
  const folder = getPlaceFolder(place);
  const extensions = Array.isArray(place.photoExtensions) && place.photoExtensions.length
    ? place.photoExtensions
    : DEFAULT_AUTO_EXTENSIONS;

  for (const extension of extensions) {
    const cleanExtension = String(extension).replace(/^\./, "").toLowerCase();
    const src = `${folder}/${padPhotoNumber(number)}.${cleanExtension}`;

    if (await imageExists(src)) {
      return {
        src,
        caption: place.name
      };
    }
  }

  return null;
}

async function discoverAutoPhotos(place) {
  const cacheKey = place.slug || classSafe(place.name);

  if (galleryCache.has(cacheKey)) {
    return galleryCache.get(cacheKey);
  }

  const explicitPhotos = normaliseExplicitPhotos(place);

  if (explicitPhotos.length) {
    galleryCache.set(cacheKey, explicitPhotos);
    return explicitPhotos;
  }

  if (Number(place.photoCount) > 0) {
    const countedPhotos = buildNumberedPhotos(place, place.photoCount);
    galleryCache.set(cacheKey, countedPhotos);
    return countedPhotos;
  }

  const maxPhotos = Number(place.maxPhotos) > 0
    ? Number(place.maxPhotos)
    : DEFAULT_MAX_AUTO_PHOTOS;

  const discovered = await Promise.all(
    Array.from({ length: maxPhotos }, (_, index) => findFirstExistingPhoto(index + 1, place))
  );

  const photos = discovered.filter(Boolean);

  if (!photos.length && place.cover && await imageExists(place.cover)) {
    photos.push({
      src: place.cover,
      caption: place.name
    });
  }

  galleryCache.set(cacheKey, photos);

  return photos;
}

function getPhotoLabel(place) {
  const explicitPhotos = normaliseExplicitPhotos(place);

  if (explicitPhotos.length) {
    return explicitPhotos.length === 1 ? "1 photo" : `${explicitPhotos.length} photos`;
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

function setGalleryLoading(place) {
  if (!modal || !place) return;

  modalTitle.textContent = place.name;
  modalMeta.textContent = [place.location, place.routeNote].filter(Boolean).join(" · ") || "Road Trip 2K15";
  modalCaption.textContent = "Searching this place folder for photos…";
  modalCount.textContent = "Loading";

  if (prevBtn) prevBtn.disabled = true;
  if (nextBtn) nextBtn.disabled = true;

  modalImage.classList.add("is-hidden");
  modalImage.removeAttribute("src");
  modalImage.alt = "";

  modalPlaceholder.classList.add("show");
  modalPlaceholder.innerHTML = `<span>Loading photos…</span>`;
}

function updateGalleryImage() {
  if (!modal || !currentPlace) return;

  const photo = currentPhotos[currentPhotoIndex];
  const hasPhoto = Boolean(photo?.src);

  modalTitle.textContent = currentPlace.name;
  modalMeta.textContent = [currentPlace.location, currentPlace.routeNote].filter(Boolean).join(" · ") || "Road Trip 2K15";
  modalCaption.textContent = hasPhoto
    ? photo.caption || currentPlace.name
    : "Add 01.jpg, 02.jpg, 03.jpg and so on to this place folder to build the gallery.";

  modalCount.textContent = currentPhotos.length
    ? `${currentPhotoIndex + 1} / ${currentPhotos.length}`
    : "0 / 0";

  if (prevBtn) prevBtn.disabled = currentPhotos.length <= 1;
  if (nextBtn) nextBtn.disabled = currentPhotos.length <= 1;

  modalImage.classList.add("is-hidden");
  modalPlaceholder.classList.toggle("show", !hasPhoto);
  modalPlaceholder.innerHTML = `<span>No photo found yet</span>`;

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

async function openGallery(placeIndex) {
  const selectedPlace = places[placeIndex];

  if (!selectedPlace || !modal) return;

  const requestId = ++galleryRequestId;

  currentPlace = selectedPlace;
  currentPhotos = [];
  currentPhotoIndex = 0;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("gallery-open");

  setGalleryLoading(selectedPlace);

  const photos = await discoverAutoPhotos(selectedPlace);

  if (requestId !== galleryRequestId || currentPlace !== selectedPlace) {
    return;
  }

  currentPhotos = photos;
  currentPhotoIndex = 0;

  updateGalleryImage();
}

function closeGallery() {
  if (!modal) return;

  galleryRequestId++;

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

  if (prevBtn) {
    prevBtn.addEventListener("click", () => moveGallery(-1));
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => moveGallery(1));
  }

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
      .map(place => {
        const slug = place.slug || classSafe(place.name);

        return {
          ...place,
          slug,
          folder: place.folder || `assets/places/${slug}`,
          cover: place.cover || `assets/places/${slug}/cover.jpg`
        };
      });

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
