const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const WebsiteSettings = require('../models/WebsiteSettings');

const VALID_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

/**
 * @desc    Place an order (checkout/dm)
 * @route   POST /api/orders
 * @access  Private/Buyer
 */
const createOrder = async (req, res, next) => {
    try {
        const { deliveryAddress, paymentMethod, notes } = req.body;

        if (!deliveryAddress || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'Delivery address and payment method are required' });
        }

        const required = ['fullName', 'phone', 'addressLine', 'city', 'province', 'postalCode', 'country'];
        for (const f of required) {
            if (!deliveryAddress[f]) {
                return res.status(400).json({ success: false, message: `Delivery address field '${f}' is required` });
            }
        }

        const validMethods = ['Cash on Delivery', 'Credit Card / Debit Card', 'Online Payment Gateway', 'Digital Wallet'];
        if (!validMethods.includes(paymentMethod)) {
            return res.status(400).json({ success: false, message: 'Invalid payment method' });
        }

        const cart = await Cart.findOne({ buyerId: req.user._id }).populate({
            path: 'items.product',
            populate: { path: 'sellerId', select: 'storeName storeContactNumber userId' },
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Your cart is empty' });
        }

        // Validate stock and build order items
        const orderItems = [];
        const sellerIds = new Set();
        let subtotal = 0;

        for (const item of cart.items) {
            const product = item.product;
            if (!product) continue;

            if (product.status !== 'active') {
                return res.status(400).json({ success: false, message: `Product "${product.productName}" is no longer available` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product.productName}". Available: ${product.stock}`,
                });
            }

            const finalPrice = product.discount
                ? Number((product.price - (product.price * product.discount) / 100).toFixed(2))
                : product.price;
            const lineSubtotal = Number((finalPrice * item.quantity).toFixed(2));
            subtotal += lineSubtotal;

            orderItems.push({
                product: product._id,
                productName: product.productName,
                image: product.images?.[0] || '',
                price: product.price,
                finalPrice,
                unit: product.unit,
                quantity: item.quantity,
                stockAtOrderTime: product.stock,
                seller: product.sellerId._id,
                sellerName: product.sellerId.storeName,
                sellerContact: product.sellerId.storeContactNumber || '',
                subtotal: lineSubtotal,
                sellerStatus: 'Pending',
            });
            sellerIds.add(product.sellerId._id.toString());
        }

        if (orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid items in cart' });
        }

        subtotal = Number(subtotal.toFixed(2));

        const settings = await WebsiteSettings.getOrCreate();
        const deliveryCharge = settings.deliveryCharges?.defaultCharge ?? 150;
        const freeAbove = settings.deliveryCharges?.freeAbove ?? 3000;
        const deliveryCharges = subtotal >= freeAbove ? 0 : deliveryCharge;
        const totalAmount = Number((subtotal + deliveryCharges).toFixed(2));

        const order = await Order.create({
            buyerId: req.user._id,
            buyerName: req.user.name,
            buyerContact: req.user.phone,
            orderItems,
            sellers: Array.from(sellerIds),
            deliveryAddress: { ...deliveryAddress, notes: notes || '' },
            subtotal,
            deliveryCharges,
            totalAmount,
            paymentMethod,
            paymentStatus: 'Pending',
            orderStatus: 'Pending',
            statusHistory: [{ status: 'Pending', note: 'Order placed', changedBy: req.user._id }],
        });

        // Create payment record
        await Payment.create({
            order: order._id,
            buyerId: req.user._id,
            amount: totalAmount,
            method: paymentMethod,
            status: 'Pending',
        });

        // Decrement stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, totalSold: item.quantity } });
            const p = await Product.findById(item.product);
            if (p && p.stock === 0) {
                p.availability = 'out-of-stock';
                await p.save();
            }
        }

        // Clear cart
        cart.items = [];
        await cart.save();

        // Notifications
        await Notification.create({
            userId: req.user._id,
            message: `Your order ${order.orderNumber} has been placed successfully.`,
            type: 'order-confirmation',
            link: `/buyer/orders/${order._id}`,
        });

        for (const sellerId of sellerIds) {
            const seller = await Seller.findById(sellerId);
            if (seller) {
                await Notification.create({
                    userId: seller.userId,
                    message: `New order received: ${order.orderNumber}`,
                    type: 'new-order',
                    link: `/seller/orders`,
                });
            }
        }

        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            await Notification.create({
                userId: admin._id,
                message: `New order ${order.orderNumber} placed for ${totalAmount}`,
                type: 'new-order',
                link: `/admin/orders`,
            });
        }

        res.status(201).json({ success: true, message: 'Order placed successfully', order });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get buyer's own orders
 * @route   GET /api/orders/my-orders
 * @access  Private/Buyer
 */
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ buyerId: req.user._id }).sort('-createdAt');
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single order (buyer owner, seller involved, or admin)
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('buyerId', 'name email phone')
            .populate('orderItems.product', 'productName images price');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (req.user.role === 'buyer' && order.buyerId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
        }

        if (req.user.role === 'seller') {
            const seller = await Seller.findOne({ userId: req.user._id });
            const involved = order.sellers.some((s) => s.toString() === seller._id.toString());
            if (!involved) return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
        }

        res.json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get seller's orders (only items belonging to them)
 * @route   GET /api/orders/seller
 * @access  Private/Seller
 */
const getSellerOrders = async (req, res, next) => {
    try {
        const seller = await Seller.findOne({ userId: req.user._id });
        if (!seller) return res.status(404).json({ success: false, message: 'Seller profile not found' });

        const orders = await Order.find({ sellers: seller._id })
            .populate('buyerId', 'name email phone')
            .sort('-createdAt');

        // Filter order items to only this seller's items
        const filtered = orders.map((o) => {
            const obj = o.toObject();
            obj.orderItems = obj.orderItems.filter((i) => i.seller.toString() === seller._id.toString());
            obj.sellerSubtotal = obj.orderItems.reduce((sum, i) => sum + i.subtotal, 0);
            return obj;
        });

        res.json({ success: true, count: filtered.length, orders: filtered });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update order status (seller updates their items, admin updates whole order)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Seller|Admin
 */
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, note } = req.body;
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid order status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (req.user.role === 'seller') {
            const seller = await Seller.findOne({ userId: req.user._id });
            const involved = order.sellers.some((s) => s.toString() === seller._id.toString());
            if (!involved) return res.status(403).json({ success: false, message: 'Not authorized' });

            // Update only this seller's items
            order.orderItems.forEach((item) => {
                if (item.seller.toString() === seller._id.toString()) item.sellerStatus = status;
            });

            // Derive overall order status from all seller statuses
            const statuses = order.orderItems.map((i) => i.sellerStatus);
            if (statuses.every((s) => s === 'Delivered')) order.orderStatus = 'Delivered';
            else if (statuses.every((s) => s === 'Cancelled')) order.orderStatus = 'Cancelled';
            else if (statuses.some((s) => s === 'Out for Delivery')) order.orderStatus = 'Out for Delivery';
            else if (statuses.some((s) => s === 'Preparing')) order.orderStatus = 'Preparing';
            else if (statuses.some((s) => s === 'Confirmed')) order.orderStatus = 'Confirmed';
        } else {
            // Admin updates whole order
            order.orderStatus = status;
            order.orderItems.forEach((item) => (item.sellerStatus = status));
        }

        order.statusHistory.push({ status, note: note || '', changedBy: req.user._id });
        await order.save();

        // Notify buyer
        await Notification.create({
            userId: order.buyerId,
            message: `Your order ${order.orderNumber} status updated to "${status}".`,
            type: 'order-status',
            link: `/buyer/orders/${order._id}`,
        });

        res.json({ success: true, message: 'Order status updated', order });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel order (buyer, only if Pending/Confirmed)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private/Buyer
 */
const cancelOrder = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (order.buyerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
            return res.status(400).json({ success: false, message: 'Order can no longer be cancelled' });
        }

        order.orderStatus = 'Cancelled';
        order.cancellationReason = reason || 'Cancelled by buyer';
        order.orderItems.forEach((i) => (i.sellerStatus = 'Cancelled'));
        order.statusHistory.push({ status: 'Cancelled', note: order.cancellationReason, changedBy: req.user._id });

        // Restore stock
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } });
        }

        await order.save();

        // Notify sellers
        for (const sellerId of order.sellers) {
            const seller = await Seller.findById(sellerId);
            if (seller) {
                await Notification.create({
                    userId: seller.userId,
                    message: `Order ${order.orderNumber} was cancelled by the buyer.`,
                    type: 'order-cancelled',
                    link: '/seller/orders',
                });
            }
        }

        res.json({ success: true, message: 'Order cancelled', order });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all orders (admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
    try {
        const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.orderStatus = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (search) query.orderNumber = { $regex: search, $options: 'i' };

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('buyerId', 'name email phone')
                .sort('-createdAt')
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Order.countDocuments(query),
        ]);

        res.json({ success: true, count: orders.length, total, page: pageNum, pages: Math.ceil(total / limitNum), orders });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrder,
    getSellerOrders,
    updateOrderStatus,
    cancelOrder,
    getAllOrders,
};
