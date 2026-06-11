// Wait for map.js to finish loading data
function waitForData() {
  return new Promise(resolve => {
    const check = () => window.RT2K15?.tripData ? resolve() : setTimeout(check, 50);
    check();
  });
}

(async () => {
  await waitForData();

  const slider = document.getElementById("timeline-slider");
  const dayCounter = document.getElementById("current-day");
  const playBtn = document.getElementById("play-btn");

  let playInterval = null;

  slider.addEventListener("input", (e) => {
    const day = parseInt(e.target.value, 10);
    dayCounter.textContent = day;
    window.RT2K15.renderRoute(day);
  });

  playBtn.addEventListener("click", () => {
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
      playBtn.textContent = "▶";
      return;
    }
    let day = parseInt(slider.value, 10);
    if (day >= 93) day = 0;
    playBtn.textContent = "❚❚";
    playInterval = setInterval(() => {
      day++;
      if (day > 93) {
        clearInterval(playInterval);
        playInterval = null;
        playBtn.textContent = "▶";
        return;
      }
      slider.value = day;
      dayCounter.textContent = day;
      window.RT2K15.renderRoute(day);
    }, 350);
  });
})();
