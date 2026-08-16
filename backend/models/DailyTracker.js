// backend/models/DailyTracker.js

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      default: ''
    },

    category: {
      type: String,
      default: 'General'
    },

    scheduledTime: {
      type: String,
      default: ''
    },

    isCompleted: {
      type: Boolean,
      default: false
    },

    completedAt: {
      type: Date,
      default: null
    },

    notes: {
      type: String,
      default: ''
    }
  },
  {
    _id: false
  }
);

const dailyTrackerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    tasks: {
      type: [taskSchema],
      default: []
    },

    totalTasks: {
      type: Number,
      default: 0
    },

    completedTasks: {
      type: Number,
      default: 0
    },

    mood: {
  type: String,
  enum: [
    'Great',
    'Good',
    'Ok',
    'Bad',
    'Terrible',
    null
  ],
  default: null,
  set: (v) => (v === '' ? null : v) // convert empty string to null
    },

    energyLevel: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },

    waterIntake: {
      type: Number,
      min: 0,
      default: 0
    },

    symptoms: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// One tracker per user per day.
dailyTrackerSchema.index(
  {
    userId: 1,
    date: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model(
  'DailyTracker',
  dailyTrackerSchema
);