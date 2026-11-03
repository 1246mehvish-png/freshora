const express = require('express');
const router = express.Router();
const {
    createReview,
    getProductReviews,
    getSellerReviews,
    getAllReviews,
    moderateReview,
    deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('buyer'), createReview);
router.get('/product/:productId', getProductReviews);
router.get('/seller/:sellerId', getSellerReviews);
router.get('/', protect, authorize('admin'), getAllReviews);
router.put('/:id/moderate', protect, authorize('admin'), moderateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
