const { cloudinary } = require('../config/cloudinary');

/**
 * @desc    Upload a single image to Cloudinary
 * @route   POST /api/upload
 * @access  Private
 */
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }
        res.status(201).json({
            success: true,
            message: 'Image uploaded',
            url: req.file.path || req.file.location,
            publicId: req.file.filename,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Upload multiple images to Cloudinary
 * @route   POST /api/upload/multiple
 * @access  Private
 */
const uploadMultiple = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No image files provided' });
        }
        const urls = req.files.map((f) => ({ url: f.path || f.location, publicId: f.filename }));
        res.status(201).json({ success: true, message: 'Images uploaded', images: urls });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete an image from Cloudinary
 * @route   DELETE /api/upload/:publicId
 * @access  Private
 */
const deleteImage = async (req, res, next) => {
    try {
        const result = await cloudinary.uploader.destroy(req.params.publicId);
        res.json({ success: true, message: 'Image deleted', result });
    } catch (error) {
        next(error);
    }
};

module.exports = { uploadImage, uploadMultiple, deleteImage };
