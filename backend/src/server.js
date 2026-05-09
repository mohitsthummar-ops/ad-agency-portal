require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startNotificationScheduler } = require('./utils/notificationScheduler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adRoutes = require('./routes/ads');
const categoryRoutes = require('./routes/categories');
const platformRoutes = require('./routes/platforms');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const adRequestRoutes = require('./routes/adRequests');
const subscriptionRoutes = require('./routes/subscription');

// Connect to database and start scheduler
connectDB().then(() => {
    startNotificationScheduler();
}).catch(() => {
    // DB connect errors are handled inside connectDB
});

const app = express();

// Security middleware
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "img-src": ["'self'", "data:", "https://image.pollinations.ai", "https://*.pollinations.ai"],
            },
        },
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// Compress responses
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger (dev only)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Static files (uploaded images)
const fs = require('fs');
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ad-requests', adRequestRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Ad Agency API is running 🚀', timestamp: new Date() });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Ad Agency Management Portal API',
        version: '1.0.0',
        health: '/api/health'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});
