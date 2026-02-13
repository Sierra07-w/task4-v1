const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  caloriesBurned: { type: Number },
  intensity: { type: String, enum: ['Low','Medium','High'], default: 'Medium' },
  date: { type: Date, required: true },
  equipment: { type: String },
  notes: { type: String }
});

module.exports = mongoose.model('Workout', workoutSchema);
