// backend/routes/messages.js (COMPLETE AND CLEAN)
const express = require('express');
const Message = require('../models/Message'); // Correct path relative to routes/messages.js
const Team = require('../models/Team');   // Correct path relative to routes/messages.js
const auth = require('../middleware/auth'); // Correct path relative to routes/messages.js

const router = express.Router();

// Get team messages
router.get('/:teamId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // Check if user is team member
    // You'll need to fetch the team to check membership
    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const isMember = team.members.some(member =>
      member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied: Not a member of this team' });
    }

    const messages = await Message.find({ team: req.params.teamId })
      .populate('sender', 'username profile.firstName profile.lastName profile.avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(messages.reverse()); // Reverse to show latest messages at bottom
  } catch (error) {
    console.error('Error fetching messages:', error); // More specific error logging
    res.status(500).json({ error: error.message || 'Server error fetching messages' });
  }
});

// You'll likely need routes for sending messages, editing, deleting etc.
// For now, only GET is provided based on your previous code.
// You have socket.io for sending messages, but direct API might be useful too.

module.exports = router;