const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
        buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true, min: 0 },
        method: {
            type: String,
            required: true,
            enum: ['Cash on Delivery', 'Credit Card / Debit Card', 'Online Payment Gateway', 'Digital Wallet'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
            default: 'Pending',
        },
        reference: { type: String, default: '' },
        details: { type: String, default: '' },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
