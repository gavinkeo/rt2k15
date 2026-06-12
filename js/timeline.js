const playBtn = document.getElementById("play-btn");
const slider = document.getElementById("timeline-slider");
const currentDayEl = document.getElementById("current-day");
const totalDaysEl = document.getElementById("total-days");

let isPlaying = false;
let maxDay = 90;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getMaxDayFromTrip() {
  const tripData = window.RT2K15?.tripData;

  if (!tripData?.days?.length) {
    return 90;
  }

  return Math.max(...tripData.days.map(day => Number(day.day)));
}

async function waitForMapReady() {
  while (!window.RT2K15?.tripData || !window.RT2K15?.renderRoute) {
    await delay(50);
  }

  maxDay = getMaxDayFromTrip();

  if (slider) {
    slider.min = 1;
    slider.max = maxDay;
    slider.value = maxDay;
  }

  if (currentDayEl) {
    currentDayEl.textContent = maxDay;
  }

  if (totalDaysEl) {
    totalDaysEl.textContent = maxDay;
  }
}

function updateCounter(day) {
  if (currentDayEl) {
    currentDayEl.textContent = day;
  }

  if (totalDaysEl) {
    totalDaysEl.textContent = maxDay;
  }

  if (slider) {
    slider.value = day;
  }
}

function stopPlayback() {
  isPlaying = false;

  if (playBtn) {
    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", "Play");
  }
}

async function playTimeline() {
  if (isPlaying) {
    stopPlayback();
    return;
  }

  isPlaying = true;

  if (playBtn) {
    playBtn.textContent = "❚❚";
    playBtn.setAttribute("aria-label", "Pause");
  }

  let startDay = Number(slider?.value || 1);

  if (startDay >= maxDay) {
    startDay = 1;
  } else {
    startDay += 1;
  }

  for (let day = startDay; day <= maxDay; day++) {
    if (!isPlaying) break;

    updateCounter(day);

    window.RT2K15.renderRoute(day, {
      forceAnimate: true
    });

    if (window.RT2K15.waitForRouteAnimation) {
      await window.RT2K15.waitForRouteAnimation();
    } else {
      await delay(350);
    }

    await delay(120);
  }

  stopPlayback();
}

async function initTimeline() {
  await waitForMapReady();

  if (slider) {
    slider.addEventListener("input", () => {
      stopPlayback();

      const day = Number(slider.value);

      updateCounter(day);

      window.RT2K15.renderRoute(day, {
        instant: true
      });
    });
  }

  if (playBtn) {
    playBtn.addEventListener("click", playTimeline);
  }
}

initTimeline();
