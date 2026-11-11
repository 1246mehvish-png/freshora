const mongoose = require('mongoose');

/**
 * Connect to MongoDB.
 *
 * Accepts MONGODB_URI (Vercel/Atlas convention) or MONGO_URI (local .env).
 *
 * Note: `useNewUrlParser` and `useUnifiedTopology` are deprecated and no longer
 * needed in Mongoose 8 (they are always enabled). Including them can cause
 * warnings/errors, so they are omitted here.
 */
const connectDB = async () => {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGODB_URI is not set. Add it in Vercel Project Settings > Environment Variables (or backend/.env locally).');
    }
    try {
        const conn = await mongoose.connect(uri, {
            // Fail fast instead of hanging a serverless invocation when Atlas
            // is unreachable (e.g. the deployment IP is not allow-listed).
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            // Keep the per-instance pool small; serverless scales horizontally.
            maxPoolSize: 10,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Re-throw so the caller (server.js / api.js) can decide how to handle
        // the failure (e.g. surface it on the first request in serverless).
        throw error;
    }
};

module.exports = connectDB;
