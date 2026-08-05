const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  age: { 
    type: Number, 
    required: true 
  },
  height: { 
    type: Number, 
    required: true 
  },
  weight: { 
    type: Number, 
    required: true 
  },
  gender: { 
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  medicalConditions: [{ 
    type: String 
  }],
  dietType: { 
    type: String,
    enum: ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean', 'Diabetic-Friendly', 'Omnivore']
  },
  allergies: [{ 
    type: String 
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
});

// Pre-save middleware to calculate BMI
userSchema.pre('save', function(next) {
  if (this.isModified('height') || this.isModified('weight')) {
    const heightInMeters = this.height / 100;
    this.bmi = this.weight / (heightInMeters * heightInMeters);
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);