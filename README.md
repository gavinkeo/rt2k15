# RT2K15

Interactive map of a 93-day road trip from San Francisco to Miami via the 48 mainland states and parts of Canada, summer 2015.

## Live site

[gavinkeo.github.io](https://gavinkeo.github.io/rt2k15/)

## Local preview

Because the site fetches `data/trip.json`, you can't just double-click `index.html` — browsers block local file fetches. Easiest local preview:

```bash
cd rt2k15
python3 -m http.server 8000
```

Then open [localhost](http://localhost:8000)

## Publishing on GitHub Pages

1. Push these files to the `main` branch of `github.com/gavinkeo/rt2k15`.
2. Go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**.
4. Pick **main** branch, **/ (root)** folder. Save.
5. Wait ~1 minute. Site is live at `[gavinkeo.github.io](https://gavinkeo.github.io/rt2k15/)`.

## File structure

```
rt2k15/
├── index.html
├── style.css
├── js/
│   ├── map.js          ← map, route rendering, popups, geocoded coords
│   └── timeline.js     ← bottom slider + play button
├── data/
│   └── trip.json       ← all 93 days
└── README.md
```

## Editing

- **Change trip data:** edit `data/trip.json`.
- **Change colours/fonts:** edit the `:root` variables at the top of `style.css`.
- **Add photos later:** add an `images/` folder, then add a `photos: ["images/day42-1.jpg"]` array to any day in `trip.json` and a small block in `showDayDetail()` in `map.js` to render them.
