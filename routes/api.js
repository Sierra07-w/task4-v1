const express = require('express');
const validator = require('validator');
const Workout = require('../models/Workout');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// List workouts
router.get('/workouts', async (req, res) => {
  try {
    const items = await Workout.find().sort({ date: -1 }).limit(100);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/workouts/:id', async (req, res) => {
  try {
    const item = await Workout.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Bad request' });
  }
});

router.post('/workouts', requireAuth, async (req, res) => {
  try {
    const { name, type, durationMinutes, caloriesBurned, intensity, date, equipment, notes } = req.body;
    if (!name || !type || !durationMinutes || !date) return res.status(400).json({ error: 'Invalid input' });
    if (!validator.isInt(String(durationMinutes), { min: 1 })) return res.status(400).json({ error: 'Invalid input' });
    const w = new Workout({ name, type, durationMinutes: Number(durationMinutes), caloriesBurned: Number(caloriesBurned) || 0, intensity, date: new Date(date), equipment, notes });
    await w.save();
    res.status(201).json(w);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/workouts/:id', requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    if (updates.durationMinutes && !validator.isInt(String(updates.durationMinutes), { min: 1 })) return res.status(400).json({ error: 'Invalid input' });
    if (updates.date) updates.date = new Date(updates.date);
    const item = await Workout.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Bad request' });
  }
});

router.delete('/workouts/:id', requireAuth, async (req, res) => {
  try {
    const item = await Workout.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Bad request' });
  }
});

module.exports = router;
