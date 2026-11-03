const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * @desc    Get buyer wishlist
 * @route   GET /api/wishlist
 * @access  Private/Buyer
 */
const getWishlist = async (req, res, next) => {
    try {
        let wishlist = await Wishlist.findOne({ buyerId: req.user._id }).populate({
            path: 'products',
            populate: [
                { path: 'sellerId', select: 'storeName storeLogo' },
                { path: 'category', select: 'name slug' },
            ],
        });
        if (!wishlist) wishlist = await Wishlist.create({ buyerId: req.user._id, products: [] });
        res.json({ success: true, products: wishlist.products });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle product in wishlist
 * @route   POST /api/wishlist/:productId
 * @access  Private/Buyer
 */
const toggleWishlist = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        let wishlist = await Wishlist.findOne({ buyerId: req.user._id });
        if (!wishlist) wishlist = await Wishlist.create({ buyerId: req.user._id, products: [] });

        const exists = wishlist.products.some((p) => p.toString() === req.params.productId);
        if (exists) {
            wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId);
            await wishlist.save();
            return res.json({ success: true, message: 'Removed from wishlist', inWishlist: false });
        } else {
            wishlist.products.push(req.params.productId);
            await wishlist.save();
            return res.json({ success: true, message: 'Added to wishlist', inWishlist: true });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private/Buyer
 */
const removeFromWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({ buyerId: req.user._id });
        if (wishlist) {
            wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId);
            await wishlist.save();
        }
        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getWishlist, toggleWishlist, removeFromWishlist };
