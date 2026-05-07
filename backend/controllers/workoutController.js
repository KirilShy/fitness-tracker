const model = require('../models/workoutModel');

const VALID_CATEGORIES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Other'];

function getWorkouts(_req, res) {
  res.json(model.getAll());
}

function addWorkout(req, res) {
  const { exercise, category, sets, reps, weight, date, notes } = req.body;

  if (!exercise?.trim() || !sets || !reps || weight == null || !date) {
    return res.status(400).json({ error: 'exercise, sets, reps, weight and date are required' });
  }

  const workout = model.create({
    exercise: exercise.trim(),
    category: VALID_CATEGORIES.includes(category) ? category : 'Other',
    sets: Number(sets),
    reps: Number(reps),
    weight: Number(weight),
    date,
    notes: notes?.trim() || '',
  });

  res.status(201).json(workout);
}

function deleteWorkout(req, res) {
  const ok = model.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Workout not found' });
  res.json({ message: 'Deleted' });
}

module.exports = { getWorkouts, addWorkout, deleteWorkout };
