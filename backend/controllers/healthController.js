// backend/controllers/healthController.js

const mongoose = require('mongoose');

const HealthPlan = require('../models/HealthPlan');
const DailyTracker = require('../models/DailyTracker');
const User = require('../models/User');
const aiService = require('../services/aiService');

// ======================================================
// Helpers
// ======================================================

const getToday = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
};

const getUserId = (req) => {
  return req.userId;
};

const validateUserId = (userId) => {
  return mongoose.Types.ObjectId.isValid(userId);
};

// ======================================================
// Generate Health Plan
// POST /api/health/generate-plan
// ======================================================

exports.generateHealthPlan = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId || !validateUserId(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication'
      });
    }

    const user = await User.findById(userId).select(
      '-password'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate plan using authenticated user's data
    const planData = await aiService.generateHealthPlan(user);

    if (!planData) {
      return res.status(500).json({
        success: false,
        message: 'AI failed to generate health plan'
      });
    }

    // Deactivate previous plans
    await HealthPlan.updateMany(
      {
        userId: user._id,
        active: true
      },
      {
        $set: {
          active: false
        }
      }
    );

    // Create new active health plan
    const healthPlan = new HealthPlan({
      userId: user._id,

      conditionsHandled:
        user.medicalConditions || [],

      dietaryPlan:
        planData.dietaryPlan || {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [],
          restrictions: [],
          fluidIntake: {
            recommended: '',
            details: ''
          }
        },

      medicationSchedule:
        planData.medicationSchedule || [],

      lifestyleSuggestions:
        planData.lifestyleSuggestions || [],

      dailyTasks:
        planData.dailyTasks || [],

      active: true
    });

    await healthPlan.save();

    // ==================================================
    // Create today's tracker
    // ==================================================

    const today = getToday();

    const newTasks = (
      planData.dailyTasks || []
    ).map((task) => ({
      taskId: new mongoose.Types.ObjectId(),

      title: task.title || 'Health task',

      category: task.category || 'Habit',

      scheduledTime:
        task.scheduledTime || '',

      priority:
        task.priority || 'Medium',

      isCompleted: false,

      completedAt: null,

      notes: ''
    }));

    const dailyTracker =
      await DailyTracker.findOneAndUpdate(
        {
          userId: user._id,
          date: today
        },
        {
          $set: {
            tasks: newTasks,
            totalTasks: newTasks.length,
            completedTasks: 0
          }
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

    return res.status(201).json({
      success: true,
      message: 'Health plan generated successfully',

      healthPlan,

      dailyTracker
    });

  } catch (error) {
    console.error(
      'Generate health plan error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to generate health plan'
    });
  }
};

// ======================================================
// Get Active Health Plan
// GET /api/health/plan
// ======================================================

exports.getHealthPlan = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId || !validateUserId(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication'
      });
    }

    const healthPlan =
      await HealthPlan.findOne({
        userId,
        active: true
      })
        .sort({
          createdAt: -1
        })
        .lean();

    if (!healthPlan) {
      return res.status(404).json({
        success: false,
        message: 'No active health plan found'
      });
    }

    // Return plan directly.
    // Frontend expects response.data.dietaryPlan
    return res.json(healthPlan);

  } catch (error) {
    console.error(
      'Get health plan error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to load health plan'
    });
  }
};

// ======================================================
// Get Today's Tracker
// GET /api/health/tracker/today
// ======================================================

exports.getTodayTracker = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId || !validateUserId(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication'
      });
    }

    const today = getToday();

    let tracker =
      await DailyTracker.findOne({
        userId,
        date: today
      });

    // Create empty tracker if none exists
    if (!tracker) {
      tracker = new DailyTracker({
        userId,
        date: today,
        tasks: [],
        totalTasks: 0,
        completedTasks: 0,
        mood: '',
        energyLevel: 5,
        waterIntake: 0,
        symptoms: []
      });

      await tracker.save();
    }

    // Return tracker directly.
    // Frontend expects response.data.tasks
    return res.json(tracker);

  } catch (error) {
    console.error(
      'Get today tracker error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to load daily tracker'
    });
  }
};

// ======================================================
// Update Task Status
// PUT /api/health/tracker/task/:taskId
// ======================================================

exports.updateTaskStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { taskId } = req.params;

    const { isCompleted, notes } =
      req.body;

    if (!userId || !validateUserId(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication'
      });
    }

    if (
      !taskId ||
      !mongoose.Types.ObjectId.isValid(taskId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }

    if (
      typeof isCompleted !== 'boolean'
    ) {
      return res.status(400).json({
        success: false,
        message: 'isCompleted must be boolean'
      });
    }

    const today = getToday();

    const tracker =
      await DailyTracker.findOne({
        userId,
        date: today
      });

    if (!tracker) {
      return res.status(404).json({
        success: false,
        message: 'Tracker not found for today'
      });
    }

    const taskIndex =
      tracker.tasks.findIndex(
        (task) =>
          task.taskId.toString() ===
          taskId
      );

    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task =
      tracker.tasks[taskIndex];

    const previousStatus =
      task.isCompleted;

    // Update only if state actually changed
    if (
      previousStatus !== isCompleted
    ) {
      task.isCompleted =
        isCompleted;

      if (isCompleted) {
        task.completedAt =
          new Date();

        tracker.completedTasks =
          Math.min(
            tracker.totalTasks,
            tracker.completedTasks + 1
          );
      } else {
        task.completedAt = null;

        tracker.completedTasks =
          Math.max(
            0,
            tracker.completedTasks - 1
          );
      }
    }

    if (typeof notes === 'string') {
      task.notes = notes;
    }

    await tracker.save();

    const percentage =
      tracker.totalTasks > 0
        ? (
            tracker.completedTasks /
            tracker.totalTasks
          ) * 100
        : 0;

    return res.json({
      success: true,

      message:
        'Task updated successfully',

      task,

      progress: {
        completed:
          tracker.completedTasks,

        total:
          tracker.totalTasks,

        percentage: Math.round(
          percentage
        )
      }
    });

  } catch (error) {
    console.error(
      'Update task status error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
};

// ======================================================
// Update Daily Log
// PUT /api/health/tracker/daily
// ======================================================

exports.updateMoodAndEnergy = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    const {
      mood,
      energyLevel,
      symptoms,
      waterIntake
    } = req.body;

    if (!userId || !validateUserId(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication'
      });
    }

    const today = getToday();

    const tracker =
      await DailyTracker.findOne({
        userId,
        date: today
      });

    if (!tracker) {
      return res.status(404).json({
        success: false,
        message: 'Tracker not found for today'
      });
    }

    if (mood !== undefined) {
      tracker.mood = mood;
    }

    if (energyLevel !== undefined) {
      const energy =
        Number(energyLevel);

      if (
        Number.isInteger(energy) &&
        energy >= 1 &&
        energy <= 10
      ) {
        tracker.energyLevel =
          energy;
      }
    }

    if (symptoms !== undefined) {
      tracker.symptoms =
        Array.isArray(symptoms)
          ? symptoms
          : [];
    }

    if (waterIntake !== undefined) {
      const water =
        Number(waterIntake);

      if (
        Number.isFinite(water) &&
        water >= 0 &&
        water <= 20
      ) {
        tracker.waterIntake =
          water;
      }
    }

    await tracker.save();

    return res.json(tracker);

  } catch (error) {
    console.error(
      'Update mood and energy error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to update daily log'
    });
  }
};

// ======================================================
// Weekly Statistics
// GET /api/health/stats/weekly
// ======================================================

exports.getWeeklyStats = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId || !validateUserId(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication'
      });
    }

    const endDate = new Date();

    endDate.setHours(
      23,
      59,
      59,
      999
    );

    const startDate = new Date();

    startDate.setDate(
      startDate.getDate() - 6
    );

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    const trackers =
      await DailyTracker.find({
        userId,

        date: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({
        date: 1
      });

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

    const moodMap = {
      Great: 5,
      Good: 4,
      Ok: 3,
      Bad: 2,
      Terrible: 1
    };

    trackers.forEach(
      (tracker) => {
        const dateStr =
          tracker.date
            .toISOString()
            .split('T')[0];

        stats.dates.push(
          dateStr
        );

        const completionRate =
          tracker.totalTasks > 0
            ? (
                tracker.completedTasks /
                tracker.totalTasks
              ) * 100
            : 0;

        stats.completionRates.push(
          Math.round(
            completionRate
          )
        );

        stats.totalTasks +=
          tracker.totalTasks || 0;

        stats.completedTasks +=
          tracker.completedTasks || 0;

        stats.totalWaterIntake +=
          tracker.waterIntake || 0;

        if (
          tracker.mood &&
          moodMap[tracker.mood]
        ) {
          moodSum +=
            moodMap[
              tracker.mood
            ];

          moodCount++;
        }

        if (
          typeof tracker.energyLevel ===
          'number'
        ) {
          energySum +=
            tracker.energyLevel;

          energyCount++;
        }
      }
    );

    stats.averageMood =
      moodCount > 0
        ? Math.round(
            moodSum / moodCount
          )
        : 0;

    stats.averageEnergy =
      energyCount > 0
        ? Math.round(
            energySum /
              energyCount
          )
        : 0;

    // Return stats directly.
    // Frontend expects response.data.dates
    return res.json(stats);

  } catch (error) {
    console.error(
      'Get weekly stats error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to load weekly statistics'
    });
  }
};