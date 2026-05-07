<div align="center">

<img src="https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
<img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/Chart.js-4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/CSS3-Dark%20Theme-1572B6?style=for-the-badge&logo=css3&logoColor=white" />

<br /><br />

# FitTrack

**A full-stack workout logger — log sets, track PRs, visualise progress**

*Vanilla JS · Node/Express REST API · Chart.js · File-based persistence*

</div>

---

## Overview

FitTrack is a clean, dark-themed fitness tracking web app. Log every workout with exercise, category, sets, reps, and weight — the app automatically highlights personal records, calculates total volume, and charts your weight progression over time.

Works **standalone** (data in localStorage) or as a **full-stack app** with the Node.js backend for persistent, cross-device storage.

## Features

| | Feature |
|--|---------|
| **Log workouts** | Exercise name, category, sets × reps, weight, date, optional notes |
| **Personal records** | PR badge auto-applied when a weight is the highest ever for that exercise |
| **Stats dashboard** | Total workouts · this week · total volume lifted · unique exercises |
| **Progress chart** | Line chart (weight over time per exercise) or bar chart (weekly workout count) |
| **Smart search** | Filter history by exercise name or muscle category in real-time |
| **Offline mode** | Falls back to localStorage automatically if the backend isn't running |
| **REST API** | Express backend with JSON file persistence, no database required |
| **Responsive** | Works on desktop and mobile |

## Tech Stack

```
Frontend                  Backend
────────                  ───────
HTML5 / CSS3              Node.js
Vanilla JavaScript        Express 4
Chart.js 4                JSON file persistence (no DB needed)
localStorage fallback     REST API (GET / POST / DELETE)
```

## Getting Started

### Frontend only (no backend needed)

Just open `frontend/index.html` in a browser — or use VS Code Live Server. Data is saved to localStorage automatically.

### Full-stack setup

**1 — Clone**
```bash
git clone https://github.com/KirilShy/fitness-tracker.git
cd fitness-tracker
```

**2 — Backend**
```bash
cd backend
cp .env.example .env
npm install
npm run dev    # → http://localhost:3000
```

**3 — Frontend**

Open `frontend/index.html` with Live Server or any static server. The app detects the backend automatically and switches to API mode — you'll see the **API connected** indicator in the header.

> Without the backend running, the app shows **Offline mode** and saves to browser localStorage.

---

## Project Structure

```
fitness-tracker/
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── server.js                 # Express entry point
│   ├── data/
│   │   └── workouts.json         # Auto-created on first run
│   ├── controllers/
│   │   └── workoutController.js  # Request handlers
│   ├── models/
│   │   └── workoutModel.js       # File-based CRUD
│   └── routes/
│       └── workouts.js           # Route definitions
│
└── frontend/
    ├── index.html                # App shell
    ├── style.css                 # Dark theme, CSS custom properties
    └── script.js                 # All app logic (fetch + localStorage fallback)
```

## API Reference

Base URL: `http://localhost:3000`

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/api/workouts` | — | Get all workouts (sorted by date desc) |
| `POST` | `/api/workouts` | `{ exercise, category, sets, reps, weight, date, notes }` | Create workout |
| `DELETE` | `/api/workouts/:id` | — | Delete workout by ID |
| `GET` | `/api/health` | — | Health check |

**Workout object**
```json
{
  "id": "m1hx3kab",
  "exercise": "Bench Press",
  "category": "Chest",
  "sets": 4,
  "reps": 8,
  "weight": 100,
  "date": "2026-05-07",
  "notes": "Paused reps",
  "createdAt": "2026-05-07T10:30:00.000Z"
}
```

**Categories:** `Chest` · `Back` · `Legs` · `Shoulders` · `Arms` · `Core` · `Cardio` · `Other`

---

<div align="center">

Built by [Kiril Shynkarenko](https://github.com/KirilShy) · Portfolio project

</div>
