const Notification = require('../models/Notification');

/**
 * @desc    Get my notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id }).sort('-createdAt').limit(50);
        const unread = await Notification.countDocuments({ userId: req.user._id, isRead: false });
        res.json({ success: true, count: notifications.length, unread, notifications });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        notification.isRead = true;
        await notification.save();
        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        await notification.deleteOne();
        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, deleteNotification };
