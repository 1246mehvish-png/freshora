const WebsiteSettings = require('../models/WebsiteSettings');

/**
 * @desc    Get website settings (public)
 * @route   GET /api/settings
 * @access  Public
 */
const getSettings = async (req, res, next) => {
    try {
        const settings = await WebsiteSettings.getOrCreate();
        res.json({ success: true, settings });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update website settings (admin)
 * @route   PUT /api/settings
 * @access  Private/Admin
 */
const updateSettings = async (req, res, next) => {
    try {
        const settings = await WebsiteSettings.getOrCreate();
        const body = req.body;

        // Top-level fields
        const topFields = ['siteName', 'tagline', 'logo', 'favicon', 'heroHeading', 'heroSubheading', 'promotionalContent'];
        topFields.forEach((f) => {
            if (body[f] !== undefined) settings[f] = body[f];
        });

        // Nested objects
        if (body.aboutUs) {
            if (body.aboutUs.title !== undefined) settings.aboutUs.title = body.aboutUs.title;
            if (body.aboutUs.content !== undefined) settings.aboutUs.content = body.aboutUs.content;
            if (body.aboutUs.image !== undefined) settings.aboutUs.image = body.aboutUs.image;
        }
        if (body.contactUs) {
            const c = body.contactUs;
            if (c.email !== undefined) settings.contactUs.email = c.email;
            if (c.phone !== undefined) settings.contactUs.phone = c.phone;
            if (c.whatsapp !== undefined) settings.contactUs.whatsapp = c.whatsapp;
            if (c.businessAddress !== undefined) settings.contactUs.businessAddress = c.businessAddress;
            if (c.description !== undefined) settings.contactUs.description = c.description;
        }
        if (body.footerContent) {
            const f = body.footerContent;
            if (f.aboutText !== undefined) settings.footerContent.aboutText = f.aboutText;
            if (f.copyright !== undefined) settings.footerContent.copyright = f.copyright;
            if (f.socialLinks) {
                if (f.socialLinks.facebook !== undefined) settings.footerContent.socialLinks.facebook = f.socialLinks.facebook;
                if (f.socialLinks.twitter !== undefined) settings.footerContent.socialLinks.twitter = f.socialLinks.twitter;
                if (f.socialLinks.instagram !== undefined) settings.footerContent.socialLinks.instagram = f.socialLinks.instagram;
                if (f.socialLinks.youtube !== undefined) settings.footerContent.socialLinks.youtube = f.socialLinks.youtube;
            }
        }
        if (body.deliveryCharges) {
            if (body.deliveryCharges.defaultCharge !== undefined) settings.deliveryCharges.defaultCharge = body.deliveryCharges.defaultCharge;
            if (body.deliveryCharges.freeAbove !== undefined) settings.deliveryCharges.freeAbove = body.deliveryCharges.freeAbove;
        }
        if (body.privacyPolicy !== undefined) settings.privacyPolicy = body.privacyPolicy;
        if (body.termsAndConditions !== undefined) settings.termsAndConditions = body.termsAndConditions;

        // Banners
        if (body.banners) {
            settings.banners = body.banners;
        }

        await settings.save();
        res.json({ success: true, message: 'Settings updated', settings });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add a homepage banner (admin)
 * @route   POST /api/settings/banners
 * @access  Private/Admin
 */
const addBanner = async (req, res, next) => {
    try {
        const settings = await WebsiteSettings.getOrCreate();
        const { title, subtitle, image, link, displayOrder } = req.body;
        if (!image) return res.status(400).json({ success: false, message: 'Banner image is required' });

        settings.banners.push({
            title: title || '',
            subtitle: subtitle || '',
            image,
            link: link || '',
            isActive: true,
            displayOrder: displayOrder || settings.banners.length,
        });
        await settings.save();
        res.status(201).json({ success: true, message: 'Banner added', settings });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a homepage banner (admin)
 * @route   DELETE /api/settings/banners/:bannerId
 * @access  Private/Admin
 */
const deleteBanner = async (req, res, next) => {
    try {
        const settings = await WebsiteSettings.getOrCreate();
        settings.banners = settings.banners.filter((b) => b._id.toString() !== req.params.bannerId);
        await settings.save();
        res.json({ success: true, message: 'Banner deleted', settings });
    } catch (error) {
        next(error);
    }
};

module.exports = { getSettings, updateSettings, addBanner, deleteBanner };
