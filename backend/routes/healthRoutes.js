// backend/routes/healthRoutes.js

const express = require('express');
const router = express.Router();

const healthController =
  require('../controllers/healthController');

const auth =
  require('../middleware/auth');

router.use(auth);

router.post(
  '/generate-plan',
  healthController.generateHealthPlan
);

router.get(
  '/plan',
  healthController.getHealthPlan
);

router.get(
  '/tracker/today',
  healthController.getTodayTracker
);

router.put(
  '/tracker/task/:taskId',
  healthController.updateTaskStatus
);

router.put(
  '/tracker/daily',
  healthController.updateMoodAndEnergy
);

router.get(
  '/stats/weekly',
  healthController.getWeeklyStats
);

module.exports = router;