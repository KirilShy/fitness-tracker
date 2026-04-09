# Fitness Tracker

A fitness tracking web application that allows users to log workouts, view their history, and track progress over time.

## Features

- Add new workouts with exercise name, weight, and reps
- View workout history in a table format
- Delete workouts from history
- Visualize progress with a line chart showing weight progression
- Responsive design with a dark theme

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js for data visualization

### Backend
- Node.js
- Express.js
- CORS for cross-origin requests

## Project Structure

```
fitness-tracker/
├── README.md
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── controllers/
│   │   └── workoutController.js
│   ├── models/
│   │   └── workoutModel.js
│   └── routes/
│       └── workouts.js
└── frontend/
    ├── index.html
    ├── script.js
    └── style.css
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/KirilShy/fitness-tracker.git
   cd fitness-tracker
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

## Running the Application

### Frontend
Open `frontend/index.html` in your web browser. The application uses localStorage for data persistence.

### Backend
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Start the server:
   ```
   node server.js
   ```

3. The API will be available at `http://localhost:3000`

## API Endpoints

- `GET /workouts` - Retrieve all workouts
- `POST /workouts` - Add a new workout
- `DELETE /workouts/:id` - Delete a workout by index

## Future Enhancements

- Integrate frontend with backend API
- Add user authentication
- Implement database storage (MongoDB/PostgreSQL)
- Add more detailed workout tracking (sets, duration, etc.)
- User dashboard with statistics