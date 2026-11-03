const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with secure environment variables (never exposed to frontend)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for product images, logos, banners
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'freshora',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    },
});

// Multer upload middleware (max 10MB per file, max 5 files)
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
});

// Delete an image from Cloudinary by public id
const deleteImage = async (publicId) => {
    try {
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (error) {
        console.error('Cloudinary delete error:', error.message);
    }
};

module.exports = { cloudinary, upload, deleteImage };
