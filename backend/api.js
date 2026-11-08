/**
 * Vercel serverless entry point.
 *
 * This file exports the Express app for Vercel's @vercel/node runtime. It is
 * the target of the `/api/*` route in vercel.json.
 *
 * Key differences from server.js (local dev):
 *  - The app is exported directly (no app.listen()).
 *  - MongoDB is connected lazily and cached across warm invocations, so a
 *    cold start does not crash the function if the DB is briefly unreachable.
 *  - The /api/health endpoint responds WITHOUT requiring a DB connection, so
 *    it always returns 200 even if MongoDB is down.
 */
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
const allowedOrigins = [
    ...(process.env.CLIENT_URL || '').split(','),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
]
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(null, false);
        },
        credentials: true,
    })
);

// Static uploads folder (fallback when Cloudinary is not configured)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    next();
});

// Health check - intentionally does NOT require a DB connection so it always
// returns 200 and can be used to verify the function is alive.
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Freshora API is running',
        timestamp: new Date().toISOString(),
    });
});

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/sellers', require('./routes/sellerRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Lazy, cached MongoDB connection for serverless.
//
// In a serverless environment the process is frozen between invocations, so we
// cache the connection promise on the module/global scope. This avoids
// reconnecting on every request and prevents a cold-start crash when the DB is
// briefly unreachable (the first request that actually needs the DB will
// surface the error instead of the whole function failing).
// ---------------------------------------------------------------------------
let dbPromise = null;

function getDb() {
    if (!dbPromise) {
        dbPromise = connectDB()
            .then(() => {
                // Seed admin user + default settings once, best-effort.
                return require('./config/seed')
                    .ensureSeed()
                    .catch((err) => console.error('Seed error:', err.message));
            })
            .catch((err) => {
                // Reset so a later request can retry the connection.
                dbPromise = null;
                throw err;
            });
    }
    return dbPromise;
}

// Ensure the DB is connected before handling any request that needs it.
// The /api/health route is registered before this middleware, so it bypasses
// the DB requirement entirely.
app.use('/api', (req, res, next) => {
    if (req.path === '/health') return next();
    getDb()
        .then(() => next())
        .catch((err) => {
            console.error('DB connection error:', err.message);
            res.status(500).json({
                success: false,
                message: 'Database connection failed. Please try again later.',
            });
        });
});

module.exports = app;