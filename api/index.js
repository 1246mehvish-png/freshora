/**
 * Vercel serverless entry point (root-level `api/` convention).
 *
 * Vercel automatically treats every file under the project-root `api/`
 * directory as a Node.js serverless function and injects the project's
 * Environment Variables (e.g. MONGODB_URI) into `process.env` at runtime.
 *
 * The Express app (and its lazy, cached MongoDB connection guard) lives in
 * `backend/app.js`. Nothing connects to the database at module load, so a cold
 * start never crashes, and `/api/health` always responds 200 without a DB.
 */
const path = require('path');

// Load backend/.env for local `vercel dev` runs. On Vercel, env vars are
// injected by the platform and this is a harmless no-op.
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

module.exports = require('../backend/app');