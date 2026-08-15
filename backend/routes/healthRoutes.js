const express = require('express');
const router = express.Router();

const healthController = require('../controllers/healthController');
const auth = require('../middleware/auth');

// Protect all health routes
router.use(auth);

// HEALTH PLAN

router.post(
  '/generate-plan/:userId',
  healthController.generateHealthPlan
);

router.get(
  '/plan/:userId',
  healthController.getHealthPlan
);

// DAILY TRACKER

router.get(
  '/tracker/today/:userId',
  healthController.getTodayTracker
);

router.put(
  '/tracker/task/:userId/:taskId',
  healthController.updateTaskStatus
);

router.put(
  '/tracker/daily/:userId',
  healthController.updateMoodAndEnergy
);

// ANALYTICS

router.get(
  '/stats/weekly/:userId',
  healthController.getWeeklyStats
);

module.exports = router;