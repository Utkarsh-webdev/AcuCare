// Environment Variables
// MUST load before importing routes

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
    path: path.join(__dirname, '.env')
});

// Validate Required Environment Variables

const requiredEnv = [
    'MONGODB_URI',
    'GEMINI_API_KEY'
];

const missingEnv = requiredEnv.filter(
    (key) => !process.env[key]
);

if (missingEnv.length > 0) {
    console.error(
        `❌ Missing required environment variables: ${missingEnv.join(', ')}`
    );

    process.exit(1);
}

// Imports

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');

// App

const app = express();

// Configuration

const PORT = process.env.PORT || 5000;

const FRONTEND_URL =
    process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware

app.disable('x-powered-by');

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({
    limit: '1mb'
}));

app.use(express.urlencoded({
    extended: true,
    limit: '1mb'
}));

// MongoDB Connection

let isConnecting = false;

const connectWithRetry = async () => {
    if (isConnecting) {
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
            retryReads: true
        });

        console.log('✅ MongoDB connected successfully!');

    } catch (err) {
        console.error(
            '❌ MongoDB connection failed.'
        );

        // Do not print MongoDB URI, username,
        // password, cluster address, or full error.

        console.error(
            'Reason:',
            err.name || 'ConnectionError'
        );

        setTimeout(() => {
            isConnecting = false;
            connectWithRetry();
        }, 5000);

        return;
    }

    isConnecting = false;
};

// Start MongoDB connection
connectWithRetry();

// MongoDB Events

mongoose.connection.on('connected', () => {
    console.log('🔄 MongoDB connection established');
});

mongoose.connection.on('error', () => {
    console.error('⚠️ MongoDB connection error');
});

mongoose.connection.on('disconnected', () => {
    console.warn('🔌 MongoDB connection disconnected');
});

// Routes

app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);

// Health Check

app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;

    const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    const databaseStatus =
        statusMap[dbStatus] || 'unknown';

    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        database: databaseStatus,
        timestamp: new Date().toISOString()
    });
});

// 404 Handler

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error Handler

app.use((err, req, res, next) => {
    console.error('❌ Server error:', err.name);

    res.status(err.status || 500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Graceful Shutdown

const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down...`);

    try {
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

// Start Server

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(
        `📡 Health check: http://localhost:${PORT}/health`
    );
});