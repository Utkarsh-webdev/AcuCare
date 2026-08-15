
// ENVIRONMENT

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.join(__dirname, '.env'),
});

// VALIDATE ENVIRONMENT

const requiredEnv = ['MONGODB_URI', 'GEMINI_API_KEY', 'JWT_SECRET'];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingEnv.join(', ')}`
  );
  process.exit(1);
}

// IMPORTS

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');

// APP

const app = express();

const PORT = process.env.PORT || 5000;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// SECURITY

app.disable('x-powered-by');

// CORS

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// BODY PARSER

app.use(
  express.json({
    limit: '1mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  })
);

// REQUEST LOGGER
// Temporary debugging — helps identify 404 route problems

app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

// MONGODB

let isConnecting = false;
let reconnectTimer = null;

const connectMongoDB = async () => {
  if (isConnecting) {
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  isConnecting = true;

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4,
      retryWrites: true,
      retryReads: true,
    });

    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.error(
      '❌ MongoDB connection failed:',
      error.name || 'ConnectionError'
    );
    scheduleMongoReconnect();
  } finally {
    isConnecting = false;
  }
};

const scheduleMongoReconnect = () => {
  if (reconnectTimer) {
    return;
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectMongoDB();
  }, 5000);
};

// Start MongoDB
connectMongoDB();

// MONGODB EVENTS

mongoose.connection.on('connected', () => {
  console.log('🔄 MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  console.warn('🔌 MongoDB connection disconnected');
  scheduleMongoReconnect();
});

mongoose.connection.on('error', () => {
  console.error('⚠️ MongoDB connection error');
});

// API ROUTES

app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);

console.log('✅ User routes mounted at /api/users');
console.log('✅ Health routes mounted at /api/health');

// HEALTH API TEST

app.get('/api/health/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Health API working',
  });
});

// SERVER HEALTH CHECK

app.get('/health', (req, res) => {
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const databaseStatus =
    statusMap[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    database: databaseStatus,
    timestamp: new Date().toISOString(),
  });
});

// 404 HANDLER

app.use((req, res) => {
  console.warn(`❌ 404 ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ERROR HANDLER

app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.name || 'ServerError');
  res.status(err.status || 500).json({
    success: false,
    message: 'Internal server error',
  });
});

// GRACEFUL SHUTDOWN

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down...`);

  try {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Shutdown error');
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// START SERVER

app.listen(PORT, () => {
  console.log('');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 API test: http://localhost:${PORT}/api/health/test`);
  console.log(`🌐 Frontend allowed: ${FRONTEND_URL}`);
  console.log('');
});