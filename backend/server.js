require('dotenv').config();
const express = require('express');
const cors = require('cors');
const workoutRoutes = require('./routes/workouts');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.use('/api/workouts', workoutRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FitTrack API → http://localhost:${PORT}`));
