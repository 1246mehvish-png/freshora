const express = require('express');
const router = express.Router();
const {
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    getBuyers,
    getSellers,
    updateUserStatus,
    deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Own profile
router.put('/profile', protect, updateProfile);

// Addresses
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

// Admin management
router.get('/buyers', protect, authorize('admin'), getBuyers);
router.get('/sellers', protect, authorize('admin'), getSellers);
router.put('/:id/status', protect, authorize('admin'), updateUserStatus);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
