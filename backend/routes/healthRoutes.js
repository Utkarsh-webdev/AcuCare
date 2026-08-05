const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Health plan generation and retrieval
router.post('/generate-plan/:userId', healthController.generateHealthPlan);
router.get('/plan/:userId', healthController.getHealthPlan);

// Daily tracker
router.get('/tracker/today/:userId', healthController.getTodayTracker);
router.put('/tracker/task/:userId/:taskId', healthController.updateTaskStatus);
router.put('/tracker/daily/:userId', healthController.updateMoodAndEnergy);

// Analytics
router.get('/stats/weekly/:userId', healthController.getWeeklyStats);

module.exports = router;