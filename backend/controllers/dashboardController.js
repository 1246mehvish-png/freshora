const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const ContactMessage = require('../models/ContactMessage');

/**
 * @desc    Admin dashboard stats
 * @route   GET /api/dashboard/admin
 * @access  Private/Admin
 */
const getAdminStats = async (req, res, next) => {
    try {
        const [
            totalBuyers,
            totalSellers,
            totalProducts,
            totalOrders,
            pendingSellers,
            pendingOrders,
            completedOrders,
            totalSalesAgg,
            totalPayments,
            unreadMessages,
        ] = await Promise.all([
            User.countDocuments({ role: 'buyer' }),
            User.countDocuments({ role: 'seller' }),
            Product.countDocuments({}),
            Order.countDocuments({}),
            Seller.countDocuments({ approvalStatus: 'pending' }),
            Order.countDocuments({ orderStatus: 'Pending' }),
            Order.countDocuments({ orderStatus: 'Delivered' }),
            Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
            Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
            ContactMessage.countDocuments({ isRead: false }),
        ]);

        res.json({
            success: true,
            stats: {
                totalBuyers,
                totalSellers,
                totalProducts,
                totalOrders,
                pendingSellers,
                pendingOrders,
                completedOrders,
                totalSales: totalSalesAgg[0]?.total || 0,
                totalPayments: totalPayments[0]?.total || 0,
                unreadMessages,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Seller dashboard stats
 * @route   GET /api/dashboard/seller
 * @access  Private/Seller
 */
const getSellerStats = async (req, res, next) => {
    try {
        const seller = await Seller.findOne({ userId: req.user._id });
        if (!seller) return res.status(404).json({ success: false, message: 'Seller profile not found' });

        const [totalProducts, activeListings, orders, pendingOrders, completedOrders] = await Promise.all([
            Product.countDocuments({ sellerId: seller._id }),
            Product.countDocuments({ sellerId: seller._id, status: 'active' }),
            Order.find({ sellers: seller._id }),
            Order.countDocuments({ sellers: seller._id, 'orderItems.sellerStatus': 'Pending' }),
            Order.countDocuments({ sellers: seller._id, 'orderItems.sellerStatus': 'Delivered' }),
        ]);

        // Calculate seller-specific earnings
        let totalEarnings = 0;
        let totalSales = 0;
        for (const order of orders) {
            const sellerItems = order.orderItems.filter((i) => i.seller.toString() === seller._id.toString());
            const sellerSubtotal = sellerItems.reduce((s, i) => s + i.subtotal, 0);
            totalSales += sellerSubtotal;
            if (order.orderStatus === 'Delivered') totalEarnings += sellerSubtotal;
        }

        res.json({
            success: true,
            stats: {
                totalSales,
                totalProducts,
                activeListings,
                pendingOrders,
                completedOrders,
                totalEarnings,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Buyer dashboard stats
 * @route   GET /api/dashboard/buyer
 * @access  Private/Buyer
 */
const getBuyerStats = async (req, res, next) => {
    try {
        const [totalOrders, pendingOrders, completedOrders, cancelledOrders, totalSpentAgg] = await Promise.all([
            Order.countDocuments({ buyerId: req.user._id }),
            Order.countDocuments({ buyerId: req.user._id, orderStatus: 'Pending' }),
            Order.countDocuments({ buyerId: req.user._id, orderStatus: 'Delivered' }),
            Order.countDocuments({ buyerId: req.user._id, orderStatus: 'Cancelled' }),
            Order.aggregate([
                { $match: { buyerId: req.user._id, orderStatus: { $ne: 'Cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
        ]);

        res.json({
            success: true,
            stats: {
                totalOrders,
                pendingOrders,
                completedOrders,
                cancelledOrders,
                totalSpent: totalSpentAgg[0]?.total || 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAdminStats, getSellerStats, getBuyerStats };
