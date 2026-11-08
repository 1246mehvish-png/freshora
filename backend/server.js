/**
 * Local development entry point.
 *
 * This file is ONLY used when running the backend directly (e.g. `npm start`
 * or `node server.js`). It connects to MongoDB, seeds default data, and starts
 * the HTTP listener.
 *
 * On Vercel, the serverless function in `api/index.js` (repo root) is used
 * instead, which imports the shared Express app from `backend/app.js` and
 * connects to MongoDB lazily per request. Keeping the DB connection out of the
 * shared app module is what prevents the "FUNCTION_INVOCATION_FAILED" /
 * "uri parameter ... got undefined" cold-start crash.
 */
const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

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

startServer();

module.exports = app;
