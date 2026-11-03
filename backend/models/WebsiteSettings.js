const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
    {
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        image: { type: String, required: true },
        link: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
        displayOrder: { type: Number, default: 0 },
    },
    { _id: true }
);

const websiteSettingsSchema = new mongoose.Schema(
    {
        siteName: { type: String, default: 'Freshora' },
        tagline: { type: String, default: 'Your Daily Freshness Delivered.' },
        logo: { type: String, default: '' },
        favicon: { type: String, default: '' },
        banners: [bannerSchema],
        heroHeading: { type: String, default: 'Your Daily Freshness Delivered.' },
        heroSubheading: { type: String, default: 'Fresh fruits and vegetables from trusted local sellers, delivered to your doorstep.' },
        aboutUs: {
            title: { type: String, default: 'About Freshora' },
            content: { type: String, default: '' },
            image: { type: String, default: '' },
        },
        contactUs: {
            email: { type: String, default: 'support@freshora.com' },
            phone: { type: String, default: '+92 300 0000000' },
            whatsapp: { type: String, default: '+92 300 0000000' },
            businessAddress: { type: String, default: 'Freshora HQ, Main Boulevard, Lahore, Pakistan' },
            description: { type: String, default: 'Have a question? Reach out and our team will get back to you within 24 hours.' },
        },
        footerContent: {
            aboutText: {
                type: String,
                default:
                    'Freshora is a multi-vendor marketplace connecting local fruit and vegetable sellers with online customers across the country.',
            },
            socialLinks: {
                facebook: { type: String, default: '' },
                twitter: { type: String, default: '' },
                instagram: { type: String, default: '' },
                youtube: { type: String, default: '' },
            },
            copyright: { type: String, default: `© ${new Date().getFullYear()} Freshora. All rights reserved.` },
        },
        privacyPolicy: { type: String, default: '' },
        termsAndConditions: { type: String, default: '' },
        deliveryCharges: {
            defaultCharge: { type: Number, default: 150, min: 0 },
            freeAbove: { type: Number, default: 3000, min: 0 },
        },
        promotionalContent: { type: String, default: '' },
    },
    { timestamps: true }
);

// Ensure a single settings document exists
websiteSettingsSchema.statics.getOrCreate = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('WebsiteSettings', websiteSettingsSchema);
