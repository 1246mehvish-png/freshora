const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        storeName: { type: String, required: [true, 'Store name is required'], trim: true, maxlength: 120 },
        businessType: {
            type: String,
            required: true,
            enum: [
                'Fruit Seller',
                'Vegetable Seller',
                'Fruits and Vegetables Seller',
                'Organic Farm',
                'Grocery Store',
            ],
        },
        storeDescription: { type: String, trim: true, maxlength: 2000 },
        storeLogo: { type: String, default: '' },
        storeBanner: { type: String, default: '' },
        storeAddress: { type: String, required: [true, 'Store address is required'], trim: true },
        storeContactNumber: { type: String, required: [true, 'Store contact number is required'], trim: true },
        approvalStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        rejectionReason: { type: String, default: '' },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0 },
        totalSales: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

sellerSchema.index({ storeName: 'text', storeDescription: 'text' });

module.exports = mongoose.model('Seller', sellerSchema);
