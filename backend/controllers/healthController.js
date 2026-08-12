// backend/controllers/healthController.js
const HealthPlan = require('../models/HealthPlan');
const DailyTracker = require('../models/DailyTracker');
const User = require('../models/User');
const aiService = require('../services/aiService');
const mongoose = require('mongoose');

// req.userId comes from the auth middleware (decoded JWT).
// Without this check any logged-in user could pass another
// user's :userId in the URL and read/edit their health data.
const isOwner = (req, res) => {
  if (req.params.userId !== req.userId) {
    res.status(403).json({ success: false, message: 'Not authorized' });
    return false;
  }
  return true;
};

exports.generateHealthPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isOwner(req, res)) return;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const planData = await aiService.generateHealthPlan(user);

    // Retire any previously active plan so getHealthPlan doesn't
    // have to rely on sort order alone to find the current one.
    await HealthPlan.updateMany(
      { userId: user._id, active: true },
      { $set: { active: false } }
    );

    const healthPlan = new HealthPlan({
      userId: user._id,
      conditionsHandled: user.medicalConditions,
      ...planData
    });
    await healthPlan.save();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newTasks = planData.dailyTasks.map(task => ({
      taskId: new mongoose.Types.ObjectId(),
      ...task
    }));

    // date+userId is a unique index — regenerating a plan on a day
    // that already has a tracker would otherwise throw E11000.
    const dailyTracker = await DailyTracker.findOneAndUpdate(
      { userId: user._id, date: today },
      {
        $set: {
          tasks: newTasks,
          totalTasks: newTasks.length,
          completedTasks: 0
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Health plan generated successfully',
      healthPlan,
      dailyTracker
    });
  } catch (error) {
    console.error('Generate health plan error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getHealthPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isOwner(req, res)) return;

    const healthPlan = await HealthPlan.findOne({ 
      userId, 
      active: true 
    }).sort({ createdAt: -1 });

    if (!healthPlan) {
      return res.status(404).json({ 
        success: false,
        message: 'No active health plan found' 
      });
    }

    res.json({
      success: true,
      healthPlan
    });
  } catch (error) {
    console.error('Get health plan error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getTodayTracker = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isOwner(req, res)) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let tracker = await DailyTracker.findOne({ 
      userId, 
      date: today 
    });

    if (!tracker) {
      tracker = new DailyTracker({
        userId,
        date: today,
        tasks: [],
        totalTasks: 0
      });
      await tracker.save();
    }

    res.json({
      success: true,
      tracker
    });
  } catch (error) {
    console.error('Get today tracker error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { userId, taskId } = req.params;
    if (!isOwner(req, res)) return;
    const { isCompleted, notes } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tracker = await DailyTracker.findOne({ 
      userId, 
      date: today 
    });

    if (!tracker) {
      return res.status(404).json({ 
        success: false,
        message: 'Tracker not found for today' 
      });
    }

    const taskIndex = tracker.tasks.findIndex(t => 
      t.taskId.toString() === taskId
    );

    if (taskIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    tracker.tasks[taskIndex].isCompleted = isCompleted;
    if (isCompleted) {
      tracker.tasks[taskIndex].completedAt = new Date();
      tracker.completedTasks += 1;
    } else {
      tracker.tasks[taskIndex].completedAt = null;
      tracker.completedTasks = Math.max(0, tracker.completedTasks - 1);
    }

    if (notes) {
      tracker.tasks[taskIndex].notes = notes;
    }

    await tracker.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: tracker.tasks[taskIndex],
      progress: {
        completed: tracker.completedTasks,
        total: tracker.totalTasks,
        percentage: tracker.totalTasks > 0 ? (tracker.completedTasks / tracker.totalTasks) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.updateMoodAndEnergy = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isOwner(req, res)) return;
    const { mood, energyLevel, symptoms, waterIntake } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tracker = await DailyTracker.findOne({ 
      userId, 
      date: today 
    });

    if (!tracker) {
      return res.status(404).json({ 
        success: false,
        message: 'Tracker not found for today' 
      });
    }

    if (mood) tracker.mood = mood;
    if (energyLevel) tracker.energyLevel = energyLevel;
    if (symptoms) tracker.symptoms = symptoms;
    if (waterIntake !== undefined) tracker.waterIntake = waterIntake;

    await tracker.save();

    res.json({
      success: true,
      message: 'Daily log updated successfully',
      tracker
    });
  } catch (error) {
    console.error('Update mood and energy error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getWeeklyStats = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isOwner(req, res)) return;

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const trackers = await DailyTracker.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    const stats = {
      dates: [],
      completionRates: [],
      averageMood: 0,
      averageEnergy: 0,
      totalWaterIntake: 0,
      totalTasks: 0,
      completedTasks: 0
    };

    let moodSum = 0;
    let moodCount = 0;
    let energySum = 0;
    let energyCount = 0;

    trackers.forEach(tracker => {
      const dateStr = tracker.date.toISOString().split('T')[0];
      stats.dates.push(dateStr);
      
      const rate = tracker.totalTasks > 0 
        ? (tracker.completedTasks / tracker.totalTasks) * 100 
        : 0;
      stats.completionRates.push(Math.round(rate));
      
      stats.totalTasks += tracker.totalTasks;
      stats.completedTasks += tracker.completedTasks;
      stats.totalWaterIntake += tracker.waterIntake || 0;

      if (tracker.mood) {
        const moodMap = {
          'Great': 5,
          'Good': 4,
          'Ok': 3,
          'Bad': 2,
          'Terrible': 1
        };
        moodSum += moodMap[tracker.mood] || 0;
        moodCount++;
      }

      if (tracker.energyLevel) {
        energySum += tracker.energyLevel;
        energyCount++;
      }
    });

    stats.averageMood = moodCount > 0 ? Math.round(moodSum / moodCount) : 0;
    stats.averageEnergy = energyCount > 0 ? Math.round(energySum / energyCount) : 0;

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get weekly stats error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};