const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the MONGODB_URI environment variable.
 *
 * Note: `useNewUrlParser` and `useUnifiedTopology` are deprecated and no longer
 * needed in Mongoose 8 (they are always enabled). Including them can cause
 * warnings/errors, so they are omitted here.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
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
