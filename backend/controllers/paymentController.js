const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

/**
 * @desc    Get buyer's payment history
 * @route   GET /api/payments/my-payments
 * @access  Private/Buyer
 */
const getMyPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find({ buyerId: req.user._id })
            .populate('order', 'orderNumber totalAmount orderStatus')
            .sort('-createdAt');
        res.json({ success: true, count: payments.length, payments });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all payments (admin)
 * @route   GET /api/payments
 * @access  Private/Admin
 */
const getAllPayments = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

        const [payments, total] = await Promise.all([
            Payment.find(query)
                .populate('order', 'orderNumber totalAmount')
                .populate('buyerId', 'name email phone')
                .sort('-createdAt')
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Payment.countDocuments(query),
        ]);

        res.json({ success: true, count: payments.length, total, page: pageNum, pages: Math.ceil(total / limitNum), payments });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify / update payment status (admin)
 * @route   PUT /api/payments/:id/verify
 * @access  Private/Admin
 */
const verifyPayment = async (req, res, next) => {
    try {
        const { status, reference, details } = req.body;
        if (!['Pending', 'Paid', 'Failed', 'Refunded'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid payment status' });
        }

        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

        payment.status = status;
        if (reference) payment.reference = reference;
        if (details) payment.details = details;
        payment.verifiedBy = req.user._id;
        payment.verifiedAt = new Date();
        await payment.save();

        // Sync order payment status
        const order = await Order.findById(payment.order);
        if (order) {
            order.paymentStatus = status;
            await order.save();

            await Notification.create({
                userId: order.buyerId,
                message: `Payment for order ${order.orderNumber} is now "${status}".`,
                type: 'payment-update',
                link: `/buyer/orders/${order._id}`,
            });
        }

        res.json({ success: true, message: 'Payment updated', payment });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Initiate online payment (demo - returns a mock gateway URL)
 * @route   POST /api/payments/initiate
 * @access  Private/Buyer
 */
const initiatePayment = async (req, res, next) => {
    try {
        const { orderId, method } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.buyerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // For COD, no gateway needed
        if (method === 'Cash on Delivery') {
            return res.json({ success: true, message: 'Cash on Delivery selected. Pay upon delivery.', requiresGateway: false });
        }

        // For online methods, return a gateway session (demo)
        // In production, integrate Stripe/JazzCash/Easypaisa here with real credentials.
        return res.json({
            success: true,
            message: 'Payment gateway session created (demo). In production, integrate a real gateway.',
            requiresGateway: true,
            gatewayUrl: `https://pay.freshora.com/checkout/${order.orderNumber}`,
            sessionId: `demo_session_${Date.now()}`,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMyPayments, getAllPayments, verifyPayment, initiatePayment };
