// backend/routes/healthRoutes.js
const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Health plan routes
router.post('/generate-plan/:userId', healthController.generateHealthPlan);
router.get('/plan/:userId', healthController.getHealthPlan);

// Daily tracker routes
router.get('/tracker/today/:userId', healthController.getTodayTracker);
router.put('/tracker/task/:userId/:taskId', healthController.updateTaskStatus);
router.put('/tracker/daily/:userId', healthController.updateMoodAndEnergy);

// Analytics routes
router.get('/stats/weekly/:userId', healthController.getWeeklyStats);

module.exports = router;