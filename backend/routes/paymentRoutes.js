const express = require('express');
const router = express.Router();
const { getMyPayments, getAllPayments, verifyPayment, initiatePayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/initiate', protect, authorize('buyer'), initiatePayment);
router.get('/my-payments', protect, authorize('buyer'), getMyPayments);
router.get('/', protect, authorize('admin'), getAllPayments);
router.put('/:id/verify', protect, authorize('admin'), verifyPayment);

module.exports = router;
