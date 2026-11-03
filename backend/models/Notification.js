const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        message: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: [
                'order-confirmation',
                'order-status',
                'payment-update',
                'new-order',
                'order-cancelled',
                'seller-registration',
                'contact-message',
                'system',
                'general',
            ],
            default: 'general',
        },
        link: { type: String, default: '' },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
