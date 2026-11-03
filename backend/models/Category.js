const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Category name is required'], unique: true, trim: true },
        slug: { type: String, unique: true, index: true },
        description: { type: String, trim: true, maxlength: 1000 },
        image: { type: String, default: '' },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        displayOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
