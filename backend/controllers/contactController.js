const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * @desc    Submit a contact message
 * @route   POST /api/contact
 * @access  Public
 */
const submitContact = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const contact = await ContactMessage.create({ name, email, subject, message });

        // Notify admin
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            await Notification.create({
                userId: admin._id,
                message: `New contact message from ${name}: ${subject}`,
                type: 'contact-message',
                link: '/admin/contact-messages',
            });
        }

        res.status(201).json({ success: true, message: 'Message sent successfully. We will get back to you soon.', contact });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all contact messages (admin)
 * @route   GET /api/contact
 * @access  Private/Admin
 */
const getMessages = async (req, res, next) => {
    try {
        const messages = await ContactMessage.find().sort('-createdAt');
        res.json({ success: true, count: messages.length, messages });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark message as read (admin)
 * @route   PUT /api/contact/:id/read
 * @access  Private/Admin
 */
const markRead = async (req, res, next) => {
    try {
        const message = await ContactMessage.findById(req.params.id);
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
        message.isRead = true;
        await message.save();
        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reply to a contact message (admin)
 * @route   PUT /api/contact/:id/reply
 * @access  Private/Admin
 */
const replyMessage = async (req, res, next) => {
    try {
        const { reply } = req.body;
        const message = await ContactMessage.findById(req.params.id);
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
        message.reply = reply;
        message.isRead = true;
        await message.save();
        res.json({ success: true, message: 'Reply saved' });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a contact message (admin)
 * @route   DELETE /api/contact/:id
 * @access  Private/Admin
 */
const deleteMessage = async (req, res, next) => {
    try {
        const message = await ContactMessage.findById(req.params.id);
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
        await message.deleteOne();
        res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { submitContact, getMessages, markRead, replyMessage, deleteMessage };
