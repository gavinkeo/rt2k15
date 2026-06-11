function waitForTripData() {
  return new Promise(resolve => {
    const check = () => {
      if (window.RT2K15 && window.RT2K15.tripData) {
        resolve(window.RT2K15.tripData);
      } else {
        setTimeout(check, 50);
      }
    };

    check();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getMaxDay(tripData) {
  if (!tripData || !tripData.days || !tripData.days.length) return 93;

  return Math.max(...tripData.days.map(day => Number(day.day)));
}

function getInitialDay(slider, dayCounter, maxDay) {
  const sliderValue = slider ? Number(slider.value) : NaN;
  if (Number.isFinite(sliderValue) && sliderValue > 0) return sliderValue;

  const counterValue = dayCounter ? Number(dayCounter.textContent) : NaN;
  if (Number.isFinite(counterValue) && counterValue > 0) return counterValue;

  return maxDay;
}

(async function initTimeline() {
  const tripData = await waitForTripData();

  const slider = document.getElementById("timeline-slider");
  const dayCounter = document.getElementById("current-day");
  const playBtn = document.getElementById("play-btn");

  const maxDay = getMaxDay(tripData);

  let currentDay = getInitialDay(slider, dayCounter, maxDay);
  let playing = false;
  let playRunId = 0;

  const PAUSE_BETWEEN_DAYS_MS = 250;

  if (slider) {
    slider.min = 0;
    slider.max = maxDay;
    slider.value = currentDay;
  }

  if (dayCounter) {
    // Important: only put the number in here.
    // Your HTML already has "Day" and "/ 93" around it.
    dayCounter.textContent = currentDay;
  }

  function setPlayButton(isPlaying) {
    if (!playBtn) return;

    playBtn.textContent = isPlaying ? "❚❚" : "▶";
    playBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  }

  function setCurrentDay(day, shouldAnimate) {
    currentDay = Math.max(0, Math.min(maxDay, Number(day) || 0));

    if (slider) {
      slider.value = currentDay;
    }

    if (dayCounter) {
      dayCounter.textContent = currentDay;
    }

    if (window.RT2K15 && typeof window.RT2K15.renderRoute === "function") {
      window.RT2K15.renderRoute(currentDay, {
        instant: !shouldAnimate,
        forceAnimate: shouldAnimate
      });
    }
  }

  function stopPlayback() {
    playing = false;
    playRunId++;
    setPlayButton(false);
  }

  if (slider) {
    slider.addEventListener("input", event => {
      stopPlayback();
      setCurrentDay(Number(event.target.value), false);
    });
  }

  if (playBtn) {
    playBtn.addEventListener("click", async () => {
      if (playing) {
        stopPlayback();
        return;
      }

      playing = true;
      const runId = ++playRunId;
      setPlayButton(true);

      // If the car is already mid-animation because you paused and resumed,
      // wait for that day to finish before advancing.
      if (
        window.RT2K15 &&
        typeof window.RT2K15.isRouteAnimating === "function" &&
        window.RT2K15.isRouteAnimating() &&
        typeof window.RT2K15.waitForRouteAnimation === "function"
      ) {
        await window.RT2K15.waitForRouteAnimation();
      }

      if (!playing || runId !== playRunId) return;

      // If you're already at the end, restart from the beginning.
      if (currentDay >= maxDay) {
        setCurrentDay(0, false);
        await sleep(200);
      }

      while (playing && runId === playRunId && currentDay < maxDay) {
        const nextDay = currentDay + 1;

        setCurrentDay(nextDay, true);

        // This is the actual fix:
        // timeline.js no longer advances every 350ms.
        // It waits until map.js says the car/line finished the distance.
        if (
          window.RT2K15 &&
          typeof window.RT2K15.waitForRouteAnimation === "function"
        ) {
          await window.RT2K15.waitForRouteAnimation();
        }

        if (!playing || runId !== playRunId) break;

        await sleep(PAUSE_BETWEEN_DAYS_MS);
      }

      if (runId === playRunId) {
        stopPlayback();
      }
    });
  }
})();
