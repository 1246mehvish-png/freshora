const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrder,
    getSellerOrders,
    updateOrderStatus,
    cancelOrder,
    getAllOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Buyer
router.post('/', protect, authorize('buyer'), createOrder);
router.get('/my-orders', protect, authorize('buyer'), getMyOrders);
router.put('/:id/cancel', protect, authorize('buyer'), cancelOrder);

// Seller
router.get('/seller', protect, authorize('seller'), getSellerOrders);

// Admin
router.get('/', protect, authorize('admin'), getAllOrders);

// Shared (buyer owner, seller involved, admin)
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('seller', 'admin'), updateOrderStatus);

module.exports = router;
