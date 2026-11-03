const express = require('express');
const router = express.Router();
const { uploadImage, uploadMultiple, deleteImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { uploadSingle, uploadMultiple: uploadMultipleMiddleware } = require('../middleware/upload');

router.post('/', protect, uploadSingle, uploadImage);
router.post('/multiple', protect, uploadMultipleMiddleware, uploadMultiple);
router.delete('/:publicId', protect, deleteImage);

module.exports = router;
