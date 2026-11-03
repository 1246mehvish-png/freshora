const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true, index: true },
        productName: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 160 },
        slug: { type: String, index: true },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 3000 },
        price: { type: Number, required: [true, 'Price is required'], min: 0 },
        unit: {
            type: String,
            required: true,
            enum: ['500 grams', '1 kilogram', '2 kilograms', '5 kilograms', 'Dozen', 'Piece'],
        },
        stock: { type: Number, required: true, min: 0, default: 0 },
        images: [{ type: String }],
        freshnessInformation: { type: String, trim: true, maxlength: 500 },
        organic: { type: Boolean, default: false },
        discount: { type: Number, default: 0, min: 0, max: 100 },
        availability: { type: String, enum: ['in-stock', 'out-of-stock', 'limited'], default: 'in-stock' },
        isFeatured: { type: Boolean, default: false },
        isTrending: { type: Boolean, default: false },
        isBestSelling: { type: Boolean, default: false },
        isSeasonal: { type: Boolean, default: false },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0 },
        totalSold: { type: Number, default: 0 },
        status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
    },
    { timestamps: true }
);

productSchema.index({ productName: 'text', description: 'text' });

// Virtual for discounted price
productSchema.virtual('finalPrice').get(function () {
    const discount = this.discount || 0;
    return Number((this.price - (this.price * discount) / 100).toFixed(2));
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
