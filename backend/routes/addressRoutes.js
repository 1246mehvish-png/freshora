const express = require('express');
const router = express.Router();
const { addAddress, updateAddress, deleteAddress } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/', protect, addAddress);
router.put('/:addressId', protect, updateAddress);
router.delete('/:addressId', protect, deleteAddress);

module.exports = router;
