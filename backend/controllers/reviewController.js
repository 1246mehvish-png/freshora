const Review = require('../models/Review');
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const Order = require('../models/Order');

/**
 * @desc    Add a review for a product/seller
 * @route   POST /api/reviews
 * @access  Private/Buyer
 */
const createReview = async (req, res, next) => {
    try {
        const { productId, sellerId, rating, comment, orderId } = req.body;

        if (!productId || !sellerId || !rating) {
            return res.status(400).json({ success: false, message: 'Product, seller, and rating are required' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        // Verify buyer actually purchased this product (if orderId provided)
        if (orderId) {
            const order = await Order.findById(orderId);
            if (!order || order.buyerId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: 'You can only review products you purchased' });
            }
        }

        // Check for existing review
        const existing = await Review.findOne({ buyerId: req.user._id, productId });
        if (existing) {
            existing.rating = rating;
            existing.comment = comment || '';
            await existing.save();
        } else {
            await Review.create({
                buyerId: req.user._id,
                sellerId,
                productId,
                orderId: orderId || null,
                rating,
                comment: comment || '',
            });
        }

        // Recalculate product rating
        const productReviews = await Review.find({ productId, status: 'active' });
        const productAvg = productReviews.length
            ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
            : rating;
        await Product.findByIdAndUpdate(productId, { rating: Number(productAvg.toFixed(1)), totalReviews: productReviews.length });

        // Recalculate seller rating
        const sellerReviews = await Review.find({ sellerId, status: 'active' });
        const sellerAvg = sellerReviews.length
            ? sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length
            : rating;
        await Seller.findByIdAndUpdate(sellerId, { rating: Number(sellerAvg.toFixed(1)), totalReviews: sellerReviews.length });

        res.status(201).json({ success: true, message: 'Review submitted' });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get reviews for a product
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
const getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId, status: 'active' })
            .populate('buyerId', 'name avatar')
            .sort('-createdAt');
        res.json({ success: true, count: reviews.length, reviews });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get reviews for a seller
 * @route   GET /api/reviews/seller/:sellerId
 * @access  Public
 */
const getSellerReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ sellerId: req.params.sellerId, status: 'active' })
            .populate('buyerId', 'name avatar')
            .populate('productId', 'productName images')
            .sort('-createdAt');
        res.json({ success: true, count: reviews.length, reviews });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all reviews (admin)
 * @route   GET /api/reviews
 * @access  Private/Admin
 */
const getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find()
            .populate('buyerId', 'name email')
            .populate('sellerId', 'storeName')
            .populate('productId', 'productName')
            .sort('-createdAt');
        res.json({ success: true, count: reviews.length, reviews });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Moderate review (admin) - hide/remove
 * @route   PUT /api/reviews/:id/moderate
 * @access  Private/Admin
 */
const moderateReview = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['active', 'hidden', 'removed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        review.status = status;
        await review.save();
        res.json({ success: true, message: 'Review updated', review });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete review (admin or owner)
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        if (req.user.role !== 'admin' && review.buyerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        await review.deleteOne();
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createReview, getProductReviews, getSellerReviews, getAllReviews, moderateReview, deleteReview };
