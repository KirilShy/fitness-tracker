const router = require('express').Router();
const c = require('../controllers/workoutController');

router.get('/', c.getWorkouts);
router.post('/', c.addWorkout);
router.delete('/:id', c.deleteWorkout);

module.exports = router;
