const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true, maxlength: 1000 },
        status: { type: String, enum: ['active', 'hidden', 'removed'], default: 'active' },
    },
    { timestamps: true }
);

// One review per buyer per product
reviewSchema.index({ buyerId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
