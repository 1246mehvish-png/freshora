const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        image: { type: String, default: '' },
        price: { type: Number, required: true, min: 0 },
        finalPrice: { type: Number, required: true, min: 0 },
        unit: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        stockAtOrderTime: { type: Number, required: true, min: 0 },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
        sellerName: { type: String, required: true },
        sellerContact: { type: String, default: '' },
        subtotal: { type: Number, required: true, min: 0 },
        // Per-seller fulfillment status (so each seller manages their own items)
        sellerStatus: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: { type: String, unique: true, index: true },
        buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        buyerName: { type: String, required: true },
        buyerContact: { type: String, required: true },
        orderItems: {
            type: [orderItemSchema],
            validate: [(v) => v.length > 0, 'Order must contain at least one item'],
        },
        // Sellers involved in this order (for quick seller-side queries)
        sellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seller' }],
        deliveryAddress: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            addressLine: { type: String, required: true },
            city: { type: String, required: true },
            province: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
            notes: { type: String, default: '' },
        },
        subtotal: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        deliveryCharges: { type: Number, required: true, min: 0 },
        totalAmount: { type: Number, required: true, min: 0 },
        paymentMethod: {
            type: String,
            required: true,
            enum: ['Cash on Delivery', 'Credit Card / Debit Card', 'Online Payment Gateway', 'Digital Wallet'],
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
            default: 'Pending',
        },
        paymentReference: { type: String, default: '' },
        orderStatus: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        cancellationReason: { type: String, default: '' },
        statusHistory: [
            {
                status: { type: String },
                note: { type: String, default: '' },
                changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                changedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

// Generate a human-friendly order number
orderSchema.pre('validate', function (next) {
    if (!this.orderNumber) {
        const ts = Date.now().toString(36).toUpperCase();
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.orderNumber = `FR-${ts}-${rand}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
