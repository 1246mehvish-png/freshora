/**
 * Shared Express application factory.
 *
 * This module builds and returns the Express `app` WITHOUT eagerly connecting
 * to MongoDB and WITHOUT calling app.listen(). It is safe to `require()` in a
 * serverless environment (Vercel) because nothing here touches the database at
 * module load time.
 *
 * - Local dev:  backend/server.js requires this, connects the DB, then listens.
 * - Vercel:     api/index.js requires this and relies on the lazy DB guard below.
 *
 * The lazy DB guard is registered AFTER the /api/health route and BEFORE the
 * API routes, so:
 *   - /api/health always responds 200 without a database.
 *   - every other /api/* request ensures a (cached) DB connection first.
 */
const path = require('path');
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
// In single-link (same-origin) deployment the frontend is served by this
// server, so CORS is not needed. It is still enabled for local dev / split
// deployments via CLIENT_URL (comma-separated list of allowed origins).
const allowedOrigins = [
    ...(process.env.CLIENT_URL || '').split(','),
    // Vercel injects the deployment's own hostname; the frontend is served
    // from the same project domain, so allow it for cross-origin calls.
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    // Stable production domain (custom domain or <project>.vercel.app).
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
        : []),
    // Preview / branch deployment URL.
    ...(process.env.VERCEL_BRANCH_URL ? [`https://${process.env.VERCEL_BRANCH_URL}`] : []),
]
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (curl, same-origin, mobile apps)
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

// ---------------------------------------------------------------------------
// Lazy, cached MongoDB connection guard (serverless-safe).
//
// The connection promise is cached on the module scope so warm invocations
// reuse it. If the connection fails, the promise is reset so a later request can
// retry. This runs BEFORE the API routes, so a DB outage returns a clean 500
// instead of a Mongoose buffering timeout.
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

app.use('/api', (req, res, next) => {
    // /api/health is handled above and never reaches this middleware.
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

module.exports = app;