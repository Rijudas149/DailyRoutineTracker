# LifeTracker

A beautiful, personal web-based activity tracker. Log your daily study time, sleep, exercise, and habits — then view progress reports with interactive charts at the end of each day, week, month, or year.

## Features

- **Dashboard** — Today's overview with goal progress rings and weekly summary
- **Track** — Log activities (study, exercise, reading, meditation, work, etc.) and sleep with quality ratings
- **Daily Checklist** — Habit tracker with customizable tasks grouped by category
- **Reports** — Interactive charts (line, bar, area, pie, radar) with day/week/month/year filters
- **Settings** — Personalize goals, export/import data, all stored locally in your browser

## Getting Started

```bash
npm install
npm run dev
```

Open [Website](https://daily-routine-tracker-theta.vercel.app/) in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Recharts
- LocalStorage (no server needed — your data stays private on your device)

## Data Privacy

All tracking data is stored locally in your browser. Use **Settings → Export Data** to back up your progress as a JSON file.
