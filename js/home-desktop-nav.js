// RT2K15 home page desktop nav
// Adds a top navbar on desktop without touching your map/menu code.

(function () {
  const links = [
    ["ROUTE", "index.html", true],
    ["ITINERARY", "itinerary.html", false],
    ["CITIES", "cities.html", false],
    ["NATURE", "parks.html", false],
    ["SPORTS", "sports.html", false],
    ["EVENTS", "events.html", false],
    ["SOUNDTRACK", "soundtrack.html", false]
  ];

  function addHomeDesktopNav() {
    let nav = document.getElementById("home-desktop-nav");

    if (!nav) {
      nav = document.createElement("nav");
      document.body.appendChild(nav);
    }

    nav.id = "home-desktop-nav";
    nav.className = "home-desktop-nav";
    nav.setAttribute("aria-label", "Road Trip sections");

    nav.innerHTML = links.map(([label, href, isActive]) => {
      return `<a class="home-desktop-nav-link${isActive ? " active" : ""}" href="${href}">${label}</a>`;
    }).join("");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addHomeDesktopNav);
  } else {
    addHomeDesktopNav();
  }
})();
