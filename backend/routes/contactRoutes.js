const express = require('express');
const router = express.Router();
const { submitContact, getMessages, markRead, replyMessage, deleteMessage } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', submitContact);
router.get('/', protect, authorize('admin'), getMessages);
router.put('/:id/read', protect, authorize('admin'), markRead);
router.put('/:id/reply', protect, authorize('admin'), replyMessage);
router.delete('/:id', protect, authorize('admin'), deleteMessage);

module.exports = router;
