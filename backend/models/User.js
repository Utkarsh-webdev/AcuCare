// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  age: { 
    type: Number,
    default: null
  },
  height: { 
    type: Number,
    default: null
  },
  weight: { 
    type: Number,
    default: null
  },
  gender: { 
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male', // Set a default value
    required: false // Make it optional
  },
  medicalConditions: [{ 
    type: String,
    default: []
  }],
  dietType: { 
    type: String,
    enum: ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean', 'Diabetic-Friendly', 'Omnivore'],
    default: 'Omnivore', // Set a default value
    required: false // Make it optional
  },
  allergies: [{ 
    type: String,
    default: []
  }],
  bmi: { 
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
}, {
  autoCreate: true,
  autoIndex: true
});

// Pre-save middleware to calculate BMI
userSchema.pre('save', function(next) {
  if (this.isModified('height') || this.isModified('weight')) {
    if (this.height && this.weight) {
      const heightInMeters = this.height / 100;
      this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);