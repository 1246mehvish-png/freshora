const express = require('express');
const router = express.Router();
const { getAdminStats, getSellerStats, getBuyerStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/admin', protect, authorize('admin'), getAdminStats);
router.get('/seller', protect, authorize('seller'), getSellerStats);
router.get('/buyer', protect, authorize('buyer'), getBuyerStats);

module.exports = router;
