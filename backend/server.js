const path = require('path');
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
app.use(
    cors({
        origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*',
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

// Health check
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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        // Seed admin user + default settings if empty
        await require('./config/seed').ensureSeed();
        app.listen(PORT, () => {
            console.log(`Freshora backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Server start error: ${error.message}`);
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = app;
