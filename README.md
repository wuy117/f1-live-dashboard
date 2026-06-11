# F1 Live Dashboard

A premium Formula 1 fan dashboard built with React, TypeScript, Vite, Tailwind CSS, Recharts, Jolpica, and OpenF1. It blends a live timing screen, championship tracker, and team strategy wall into a fast client-only web app.

## Portfolio Project

F1 Live Dashboard is designed as a public portfolio-grade frontend project: it demonstrates API integration, defensive data handling, responsive product UI, persistent user preferences, animated interactions, and dashboard information architecture without relying on a backend.

Product goals:

- Feel credible as a modern F1 fan companion
- Keep live-data uncertainty transparent with confidence labels
- Make standings and race results explorable through driver profiles
- Present complex racing information in a mobile-friendly interface

## Features

- Large race countdown hero for the next Grand Prix
- Race Centre for countdown, weekend schedule, weather, live status, and source confidence
- Race weekend schedule with upcoming, live, and completed states
- Driver and constructor championship standings
- Favourite driver stored in localStorage
- Driver comparison cards with points gap, wins, team, and latest race result
- Clickable driver profile modals from standings and race results
- Championship battle tracker for P1/P2 and favourite-driver rival gaps
- Data confidence labels: Live, Cached, Historical, and Unavailable
- Latest race classification and qualifying summary where available
- Recharts visualizations for standings and race points
- OpenF1 live or historical timing panel with weather, positions, laps, intervals, and race control
- Subtle team colour accents for Ferrari, McLaren, Mercedes, Red Bull, Aston Martin, Alpine, Williams, Haas, Racing Bulls, and Sauber
- Friendly loading, empty, fallback, and API error states
- Subtle Framer Motion animations for dashboard polish

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Screenshots

Add screenshots here after capturing the app locally:

- Home dashboard hero and Race Centre
- Live session panel
- Standings, battle tracker, and driver comparison
- Driver profile modal
- Mobile layout

Suggested layout:

| Dashboard | Live Timing |
| --- | --- |
| `screenshots/dashboard.png` | `screenshots/live.png` |

| Standings | Mobile |
| --- | --- |
| `screenshots/standings.png` | `screenshots/mobile.png` |

## APIs Used

- [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/) for season calendar, next race, race results, driver standings, constructor standings, and qualifying results where available.
- [OpenF1 API](https://openf1.org/) for sessions, drivers, positions, lap times, intervals, weather, and race control messages.

Both APIs are called directly from the browser. There is no backend, authentication, or database.

## Live Updating

The Live Session panel polls OpenF1 every 30 seconds while mounted. Real-time F1 data is not always available, so the app falls back to the latest available historical session and clearly labels that state.

Data confidence labels mean:

- **Live**: latest OpenF1 session data appears current
- **Cached**: a previous successful response is being used
- **Historical**: real-time data is unavailable, so the latest historical session is shown
- **Unavailable**: the provider did not return usable data for that feature

## Local Storage

The app stores:

- Favourite driver
- Theme preference
- Last successful API payloads used for graceful fallback

## Limitations

OpenF1 real-time coverage depends on currently available sessions and public API data freshness. Some sessions may have no positions, intervals, laps, weather, or race control messages yet. Jolpica mirrors Ergast-style data and can lag behind a just-finished race. Public browser API calls may also be affected by network availability, CORS policy changes, or temporary provider downtime.

When fresh data is unavailable, the app keeps friendly messaging on screen and uses cached or latest available historical data where possible.

## Roadmap

- Race-by-race driver progress charts
- Tyre stint strategy visualizations
- Configurable season picker
- Push-style live updates when an event stream is available
- More detailed qualifying and sprint weekend comparison views
- Screenshots generated from the polished UI
- Constructor detail pages and race weekend session deep dives
- Automated screenshot generation for README assets
# f1-live-dashboard
