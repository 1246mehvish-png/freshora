const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
    {
        label: { type: String, default: 'Home' },
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        addressLine: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        province: { type: String, required: true, trim: true },
        postalCode: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
        phone: { type: String, required: [true, 'Phone number is required'], trim: true },
        whatsapp: { type: String, trim: true },
        role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
        status: { type: String, enum: ['active', 'pending', 'suspended', 'deactivated'], default: 'active' },
        avatar: { type: String, default: '' },
        address: {
            type: String,
            trim: true,
        },
        city: { type: String, trim: true },
        province: { type: String, trim: true },
        postalCode: { type: String, trim: true },
        country: { type: String, trim: true },
        addresses: [addressSchema],
        notificationPreferences: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            inApp: { type: Boolean, default: true },
        },
        lastLoginAt: { type: Date },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
