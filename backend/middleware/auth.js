const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - verify JWT token from Authorization header.
 */
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }

        if (user.status === 'suspended' || user.status === 'deactivated') {
            return res.status(403).json({ success: false, message: 'Your account is suspended. Contact support.' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Session expired, please login again' });
        }
        return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
};

/**
 * Role-based authorization. Usage: authorize('admin') or authorize('seller', 'admin')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Role '${req.user.role}' is not allowed.`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
