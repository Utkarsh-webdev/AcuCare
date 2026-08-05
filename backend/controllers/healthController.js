const HealthPlan = require('../models/HealthPlan');
const DailyTracker = require('../models/DailyTracker');
const User = require('../models/User');
const aiService = require('../services/aiService');

exports.generateHealthPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate plan using AI
    const planData = await aiService.generateHealthPlan(user);

    // Create health plan
    const healthPlan = new HealthPlan({
      userId: user._id,
      conditionsHandled: user.medicalConditions,
      ...planData
    });
    await healthPlan.save();

    // Create daily tracker for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyTracker = new DailyTracker({
      userId: user._id,
      date: today,
      tasks: planData.dailyTasks.map(task => ({
        taskId: new mongoose.Types.ObjectId(),
        ...task
      })),
      totalTasks: planData.dailyTasks.length
    });
    await dailyTracker.save();

    res.status(201).json({
      message: 'Health plan generated successfully',
      healthPlan,
      dailyTracker
    });
  } catch (error) {
    console.error('Generate health plan error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getHealthPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const healthPlan = await HealthPlan.findOne({ 
      userId, 
      active: true 
    }).sort({ createdAt: -1 });

    if (!healthPlan) {
      return res.status(404).json({ message: 'No active health plan found' });
    }

    res.json(healthPlan);
  } catch (error) {
    console.error('Get health plan error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getTodayTracker = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let tracker = await DailyTracker.findOne({ 
      userId, 
      date: today 
    });

    if (!tracker) {
      // Create empty tracker for today if it doesn't exist
      tracker = new DailyTracker({
        userId,
        date: today,
        tasks: [],
        totalTasks: 0
      });
      await tracker.save();
    }

    res.json(tracker);
  } catch (error) {
    console.error('Get today tracker error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { userId, taskId } = req.params;
    const { isCompleted, notes } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tracker = await DailyTracker.findOne({ 
      userId, 
      date: today 
    });

    if (!tracker) {
      return res.status(404).json({ message: 'Tracker not found for today' });
    }

    const taskIndex = tracker.tasks.findIndex(t => 
      t.taskId.toString() === taskId
    );

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
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
      message: 'Task updated successfully',
      task: tracker.tasks[taskIndex],
      progress: {
        completed: tracker.completedTasks,
        total: tracker.totalTasks,
        percentage: (tracker.completedTasks / tracker.totalTasks) * 100
      }
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateMoodAndEnergy = async (req, res) => {
  try {
    const { userId } = req.params;
    const { mood, energyLevel, symptoms, waterIntake } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tracker = await DailyTracker.findOne({ 
      userId, 
      date: today 
    });

    if (!tracker) {
      return res.status(404).json({ message: 'Tracker not found for today' });
    }

    if (mood) tracker.mood = mood;
    if (energyLevel) tracker.energyLevel = energyLevel;
    if (symptoms) tracker.symptoms = symptoms;
    if (waterIntake !== undefined) tracker.waterIntake = waterIntake;

    await tracker.save();

    res.json({
      message: 'Daily log updated successfully',
      tracker
    });
  } catch (error) {
    console.error('Update mood and energy error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getWeeklyStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
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

    res.json(stats);
  } catch (error) {
    console.error('Get weekly stats error:', error);
    res.status(500).json({ message: error.message });
  }
};