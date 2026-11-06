const Seller = require('../models/Seller');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

/**
 * @desc    Get seller profile by userId (for logged-in seller)
 * @route   GET /api/sellers/me
 * @access  Private/Seller
 */
const getMySellerProfile = async (req, res, next) => {
    try {
        const seller = await Seller.findOne({ userId: req.user._id });
        if (!seller) return res.status(404).json({ success: false, message: 'Seller profile not found' });
        res.json({ success: true, seller });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update seller store profile
 * @route   PUT /api/sellers/me
 * @access  Private/Seller
 */
const updateMySellerProfile = async (req, res, next) => {
    try {
        const seller = await Seller.findOne({ userId: req.user._id });
        if (!seller) return res.status(404).json({ success: false, message: 'Seller profile not found' });

        const {
            storeName,
            businessType,
            storeDescription,
            storeLogo,
            storeBanner,
            storeAddress,
            storeContactNumber,
        } = req.body;

        if (storeName) seller.storeName = storeName;
        if (businessType) seller.businessType = businessType;
        if (storeDescription !== undefined) seller.storeDescription = storeDescription;
        if (storeLogo !== undefined) seller.storeLogo = storeLogo;
        if (storeBanner !== undefined) seller.storeBanner = storeBanner;
        if (storeAddress) seller.storeAddress = storeAddress;
        if (storeContactNumber) seller.storeContactNumber = storeContactNumber;

        await seller.save();
        res.json({ success: true, message: 'Store profile updated', seller });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get public seller store profile by seller id
 * @route   GET /api/sellers/:id
 * @access  Public
 */
const getPublicSeller = async (req, res, next) => {
    try {
        const seller = await Seller.findById(req.params.id).populate('userId', 'name email phone whatsapp city province country');
        if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

        const products = await Product.find({ sellerId: seller._id, status: 'active' })
            .populate('category', 'name slug')
            .sort('-createdAt');

        const reviews = await Review.find({ sellerId: seller._id, status: 'active' })
            .populate('buyerId', 'name avatar')
            .sort('-createdAt')
            .limit(20);

        res.json({ success: true, seller, products, reviews });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all approved sellers (public)
 * @route   GET /api/sellers
 * @access  Public
 */
const getAllSellers = async (req, res, next) => {
    try {
        const { search, featured } = req.query;
        const query = { approvalStatus: 'approved', isActive: true };

        if (featured === 'true') query.isFeatured = true;
        if (search) {
            query.$or = [
                { storeName: { $regex: search, $options: 'i' } },
                { businessType: { $regex: search, $options: 'i' } },
            ];
        }

        const sellers = await Seller.find(query)
            .populate('userId', 'name email phone whatsapp city province country')
            .sort('-createdAt');

        res.json({ success: true, count: sellers.length, sellers });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all sellers including pending/rejected (admin)
 * @route   GET /api/sellers/admin/all
 * @access  Private/Admin
 */
const getAllSellersAdmin = async (req, res, next) => {
    try {
        const { search, approvalStatus } = req.query;
        const query = {};

        if (approvalStatus && ['pending', 'approved', 'rejected'].includes(approvalStatus)) {
            query.approvalStatus = approvalStatus;
        }
        if (search) {
            query.$or = [
                { storeName: { $regex: search, $options: 'i' } },
                { businessType: { $regex: search, $options: 'i' } },
            ];
        }

        const sellers = await Seller.find(query)
            .populate('userId', 'name email phone whatsapp city province country status')
            .sort('-createdAt');

        res.json({ success: true, count: sellers.length, sellers });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Approve / reject seller (admin)
 * @route   PUT /api/sellers/:id/approval
 * @access  Private/Admin
 */
const updateSellerApproval = async (req, res, next) => {
    try {
        const { approvalStatus, rejectionReason } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(approvalStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid approval status' });
        }

        const seller = await Seller.findById(req.params.id);
        if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

        seller.approvalStatus = approvalStatus;
        if (approvalStatus === 'rejected') seller.rejectionReason = rejectionReason || 'Your application was not approved.';
        if (approvalStatus === 'approved') seller.rejectionReason = '';

        await seller.save();

        // Sync user status
        const user = await User.findById(seller.userId);
        if (user) {
            user.status = approvalStatus === 'approved' ? 'active' : approvalStatus === 'rejected' ? 'deactivated' : 'pending';
            await user.save();

            // Notify seller
            await Notification.create({
                userId: user._id,
                message:
                    approvalStatus === 'approved'
                        ? `Congratulations! Your store "${seller.storeName}" has been approved.`
                        : `Your store "${seller.storeName}" was rejected. ${seller.rejectionReason}`,
                type: 'seller-registration',
                link: '/seller/dashboard',
            });
        }

        res.json({ success: true, message: `Seller ${approvalStatus}`, seller });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle featured seller (admin)
 * @route   PUT /api/sellers/:id/featured
 * @access  Private/Admin
 */
const toggleFeatured = async (req, res, next) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
        seller.isFeatured = !seller.isFeatured;
        await seller.save();
        res.json({ success: true, message: `Seller ${seller.isFeatured ? 'featured' : 'unfeatured'}`, seller });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete seller (admin)
 * @route   DELETE /api/sellers/:id
 * @access  Private/Admin
 */
const deleteSeller = async (req, res, next) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

        await Product.deleteMany({ sellerId: seller._id });
        await User.deleteOne({ _id: seller.userId });
        await seller.deleteOne();

        res.json({ success: true, message: 'Seller and related data deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMySellerProfile,
    updateMySellerProfile,
    getPublicSeller,
    getAllSellers,
    getAllSellersAdmin,
    updateSellerApproval,
    toggleFeatured,
    deleteSeller,
};
