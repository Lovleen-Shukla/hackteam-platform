// backend/routes/notifications.js (COMPLETE NEW FILE)
const express = require('express');
const Notification = require('../models/Notification'); // Assuming your Notification model path
const auth = require('../middleware/auth'); // Your authentication middleware

const router = express.Router();

// Get notifications for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, isRead } = req.query; // Add isRead filter

    const query = { recipient: req.user.id };

    if (isRead !== undefined) { // Filter by read status if provided
      query.isRead = isRead === 'true'; // Convert string 'true'/'false' to boolean
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'username profile.firstName profile.lastName profile.avatar') // Populate sender details
      .sort({ createdAt: -1 }) // Latest notifications first
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message || 'Server error fetching notifications' });
  }
});

// Mark a specific notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id }, // Ensure user owns the notification
      { isRead: true },
      { new: true } // Return the updated document
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found or unauthorized' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message || 'Server error marking notification as read' });
  }
});

// Mark all notifications as read for the authenticated user
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false }, // Only mark unread ones
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message || 'Server error marking all notifications as read' });
  }
});

// Optional: Delete a specific notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found or unauthorized' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: error.message || 'Server error deleting notification' });
  }
});


module.exports = router;