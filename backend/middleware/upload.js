const { upload } = require('../config/cloudinary');

// Single image upload
const uploadSingle = upload.single('image');

// Multiple images upload (max 5)
const uploadMultiple = upload.array('images', 5);

module.exports = { uploadSingle, uploadMultiple };
