# Dhikr Counter

A simple, offline-capable tap-to-count dhikr counter. Pick a dhikr, tap the big circle to count, and track your daily totals.

## Features

- Tap to count, with undo and reset
- Preset dhikr (SubhanAllah, Alhamdulillah, Allahu Akbar, Astaghfirullah, Salawat) with Arabic text
- Adjustable target per dhikr, with a completion indicator
- Automatic daily reset, with the previous days archived into a recent history list
- Optional vibration feedback on supported phones
- Installable as a PWA and works offline

## Tech

Vanilla HTML, CSS and JavaScript. State is stored in `localStorage`. A service worker caches the app for offline use.

## Run locally

Service workers need a server (not `file://`). From this folder:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Install on your phone

Deploy to any static host (GitHub Pages, Netlify, Vercel), open the URL on your phone, and choose **Add to Home Screen**.

## Roadmap

- [ ] Custom dhikr entries
- [ ] Weekly stats and streaks
- [ ] Native home-screen widget (Android Glance / iOS WidgetKit)

## License

MIT
