const express = require('express');
const router = express.Router();
const {
    getMySellerProfile,
    updateMySellerProfile,
    getPublicSeller,
    getAllSellers,
    updateSellerApproval,
    toggleFeatured,
    deleteSeller,
} = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', getAllSellers);
router.get('/:id', getPublicSeller);

// Seller own profile
router.get('/me/profile', protect, authorize('seller'), getMySellerProfile);
router.put('/me', protect, authorize('seller'), updateMySellerProfile);

// Admin
router.put('/:id/approval', protect, authorize('admin'), updateSellerApproval);
router.put('/:id/featured', protect, authorize('admin'), toggleFeatured);
router.delete('/:id', protect, authorize('admin'), deleteSeller);

module.exports = router;
