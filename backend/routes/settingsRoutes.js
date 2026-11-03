const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, addBanner, deleteBanner } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getSettings);
router.put('/', protect, authorize('admin'), updateSettings);
router.post('/banners', protect, authorize('admin'), addBanner);
router.delete('/banners/:bannerId', protect, authorize('admin'), deleteBanner);

module.exports = router;
