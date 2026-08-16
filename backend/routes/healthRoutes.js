// backend/routes/healthRoutes.js

const express = require('express');
const router = express.Router();

const healthController = require('../controllers/healthController');
const auth = require('../middleware/auth');

// Every health route requires JWT.
router.use(auth);

// Health plan
router.post(
  '/generate-plan/:userId',
  healthController.generateHealthPlan
);

router.get(
  '/plan/:userId',
  healthController.getHealthPlan
);

// Daily tracker
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

// Weekly statistics
router.get(
  '/stats/weekly/:userId',
  healthController.getWeeklyStats
);

module.exports = router;