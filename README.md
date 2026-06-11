# F1 Live Dashboard

A premium Formula 1 fan dashboard built with React, TypeScript, Vite, Tailwind CSS, Recharts, Jolpica, and OpenF1. It blends a live timing screen, championship tracker, and team strategy wall into a fast client-only web app.

## Features

- Large race countdown hero for the next Grand Prix
- Race weekend schedule with upcoming, live, and completed states
- Driver and constructor championship standings
- Favourite driver stored in localStorage
- Driver comparison cards with points gap, wins, team, and latest race result
- Latest race classification and qualifying summary where available
- Recharts visualizations for standings and race points
- OpenF1 live or historical timing panel with weather, positions, laps, intervals, and race control
- Subtle team colour accents for Ferrari, McLaren, Mercedes, Red Bull, Aston Martin, Alpine, Williams, Haas, Racing Bulls, and Sauber
- Friendly loading, empty, fallback, and API error states

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

- Home dashboard hero
- Live session panel
- Standings and driver comparison
- Mobile layout

## APIs Used

- [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/) for season calendar, next race, race results, driver standings, constructor standings, and qualifying results where available.
- [OpenF1 API](https://openf1.org/) for sessions, drivers, positions, lap times, intervals, weather, and race control messages.

Both APIs are called directly from the browser. There is no backend, authentication, or database.

## Live Updating

The Live Session panel polls OpenF1 every 30 seconds while mounted. Real-time F1 data is not always available, so the app falls back to the latest available historical session and clearly labels that state.

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
