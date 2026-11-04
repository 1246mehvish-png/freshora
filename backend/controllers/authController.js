const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// Build user response object (without sensitive fields)
const buildUserResponse = (user) => {
    return {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        whatsapp: user.whatsapp,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        address: user.address,
        city: user.city,
        province: user.province,
        postalCode: user.postalCode,
        country: user.country,
        addresses: user.addresses || [],
        createdAt: user.createdAt,
    };
};

/**
 * @desc    Register a new buyer or seller
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        const { role, ...data } = req.body;

        if (!['buyer', 'seller'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role. Only buyer or seller can register.' });
        }

        // Check existing email / username
        const existing = await User.findOne({
            $or: [{ email: data.email }, { username: data.username }],
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: existing.email === data.email ? 'Email already registered' : 'Username already taken',
            });
        }

        // Create user
        const user = await User.create({
            name: data.name,
            username: data.username,
            email: data.email,
            password: data.password,
            phone: data.phone,
            whatsapp: data.whatsapp || data.phone,
            role,
            status: role === 'seller' ? 'pending' : 'active',
            address: data.address || data.storeAddress || '',
            city: data.city,
            province: data.province,
            postalCode: data.postalCode,
            country: data.country,
        });

        // If seller, create seller profile (pending approval)
        if (role === 'seller') {
            await Seller.create({
                userId: user._id,
                storeName: data.storeName,
                businessType: data.businessType,
                storeDescription: data.storeDescription || '',
                storeLogo: data.storeLogo || '',
                storeBanner: data.storeBanner || '',
                storeAddress: data.storeAddress,
                storeContactNumber: data.storeContactNumber || data.phone,
                approvalStatus: 'pending',
            });

            // Notify admin about new seller registration
            const admin = await User.findOne({ role: 'admin' });
            if (admin) {
                await Notification.create({
                    userId: admin._id,
                    message: `New seller registration request from ${data.storeName} (${data.name})`,
                    type: 'seller-registration',
                    link: '/admin/sellers',
                });
            }
        }

        // Create empty cart & wishlist for buyers
        if (role === 'buyer') {
            await Cart.create({ buyerId: user._id, items: [] });
            await Wishlist.create({ buyerId: user._id, products: [] });
        }

        const token = generateToken(user._id);
        const userResponse = buildUserResponse(user);

        // If seller, attach seller profile
        let sellerProfile = null;
        if (role === 'seller') {
            sellerProfile = await Seller.findOne({ userId: user._id });
        }

        res.status(201).json({
            success: true,
            message:
                role === 'seller'
                    ? 'Registration successful! Your seller account is pending admin approval.'
                    : 'Registration successful! Please login.',
            token,
            user: userResponse,
            seller: sellerProfile,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user (buyer, seller, or admin)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'No account found with this email. Please check the spelling or register a new account.',
            });
        }

        // Role check - if a role is specified, ensure it matches
        if (role && user.role !== role) {
            return res.status(401).json({
                success: false,
                message: `This account is registered as ${user.role}, not ${role}. Please select the correct option.`,
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password. Please try again or use "Forgot Password".',
            });
        }

        if (user.status === 'suspended' || user.status === 'deactivated') {
            return res.status(403).json({ success: false, message: 'Your account is suspended. Contact support.' });
        }

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();

        const token = generateToken(user._id);
        const userResponse = buildUserResponse(user);

        let sellerProfile = null;
        if (user.role === 'seller') {
            sellerProfile = await Seller.findOne({ userId: user._id });
            if (sellerProfile && sellerProfile.approvalStatus === 'pending') {
                return res.status(403).json({
                    success: false,
                    message: 'Your seller account is pending admin approval. Please wait for approval.',
                });
            }
            if (sellerProfile && sellerProfile.approvalStatus === 'rejected') {
                return res.status(403).json({
                    success: false,
                    message: `Your seller account was rejected. ${sellerProfile.rejectionReason || 'Contact support.'}`,
                });
            }
        }

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userResponse,
            seller: sellerProfile,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let sellerProfile = null;
        if (user.role === 'seller') {
            sellerProfile = await Seller.findOne({ userId: user._id });
        }

        res.json({
            success: true,
            user: buildUserResponse(user),
            seller: sellerProfile,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new password' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Forgot password (mock - in production send email)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email' });
        }
        // In production: send reset link via email. For demo, return a reset token.
        const resetToken = generateToken(user._id);
        res.json({
            success: true,
            message: 'Password reset link sent to your email (demo: use the token below)',
            resetToken,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe, changePassword, forgotPassword };
