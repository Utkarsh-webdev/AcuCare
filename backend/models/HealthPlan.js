// backend/models/HealthPlan.js
const mongoose = require('mongoose');

const healthPlanSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  conditionsHandled: [{ 
    type: String 
  }],
  dietaryPlan: {
    breakfast: [String],
    lunch: [String],
    dinner: [String],
    snacks: [String],
    restrictions: [String],
    fluidIntake: {
      recommended: String,
      details: String
    }
  },
  medicationSchedule: [{
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    timing: { type: String, required: true },
    instructions: String,
    alternate: String
  }],
  lifestyleSuggestions: [{
    title: String,
    description: String,
    category: { 
      type: String,
      enum: ['Exercise', 'Sleep', 'Stress Management', 'Other']
    }
  }],
  dailyTasks: [{
    title: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Medication', 'Diet', 'Exercise', 'Habit'],
      required: true 
    },
    scheduledTime: String,
    priority: { 
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    }
  }],
  active: { 
    type: Boolean, 
    default: true 
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

module.exports = mongoose.model('HealthPlan', healthPlanSchema);