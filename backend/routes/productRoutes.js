const express = require('express');
const router = express.Router();
const {
    createProduct,
    getProducts,
    getProduct,
    getMyProducts,
    updateProduct,
    deleteProduct,
    updateAvailability,
    getHomeData,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

// Public
router.get('/', getProducts);
router.get('/home', getHomeData);
router.get('/:id', getProduct);

// Seller
router.get('/my-products/list', protect, authorize('seller'), getMyProducts);
router.post('/', protect, authorize('seller'), uploadMultiple, createProduct);
router.put('/:id', protect, authorize('seller', 'admin'), uploadMultiple, updateProduct);
router.patch('/:id/availability', protect, authorize('seller', 'admin'), updateAvailability);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

module.exports = router;
