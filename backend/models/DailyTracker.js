// backend/models/DailyTracker.js
const mongoose = require('mongoose');

const dailyTrackerSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    default: () => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      return date;
    }
  },
  tasks: [{
    taskId: { type: mongoose.Schema.Types.ObjectId },
    title: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Medication', 'Diet', 'Exercise', 'Habit'],
      required: true 
    },
    isCompleted: { 
      type: Boolean, 
      default: false 
    },
    scheduledTime: String,
    completedAt: Date,
    notes: String
  }],
  mood: {
    type: String,
    enum: ['Great', 'Good', 'Ok', 'Bad', 'Terrible']
  },
  symptoms: [String],
  energyLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  waterIntake: {
    type: Number,
    default: 0
  },
  completedTasks: { 
    type: Number, 
    default: 0 
  },
  totalTasks: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

dailyTrackerSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyTracker', dailyTrackerSchema);