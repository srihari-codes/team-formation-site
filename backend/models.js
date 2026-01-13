const mongoose = require('mongoose');

// Student Schema
const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  batch: { type: String, required: true, enum: ['A', 'B'] },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  editAttemptsLeft: { type: Number, default: 2, min: 0, max: 2 }
});

// Preference Schema
const preferenceSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true },
  batch: { type: String, required: true, enum: ['A', 'B'] },
  choices: { 
    type: [String], 
    validate: [arr => arr.length === 2, 'Must have exactly 2 choices']
  },
  updatedAt: { type: Date, default: Date.now }
});

// Team Schema
const teamSchema = new mongoose.Schema({
  batch: { type: String, required: true, enum: ['A', 'B'] },
  members: { 
    type: [String], 
    validate: [arr => arr.length >= 1 && arr.length <= 3, 'Team must have 1-3 members']
  },
  createdAt: { type: Date, default: Date.now }
});

// Settings Schema (singleton per batch)
const settingsSchema = new mongoose.Schema({
  batch: { type: String, required: true, unique: true, enum: ['A', 'B'] },
  selectionOpen: { type: Boolean, default: true }
});

const Student = mongoose.model('Student', studentSchema);
const Preference = mongoose.model('Preference', preferenceSchema);
const Team = mongoose.model('Team', teamSchema);
const Settings = mongoose.model('Settings', settingsSchema);

module.exports = { Student, Preference, Team, Settings };
