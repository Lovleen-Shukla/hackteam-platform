// backend/routes/auth.js (COMPLETE AND CORRECTED for JSON.parse error)
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});


// Register User
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, profile } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email or username'
      });
    }

    const user = new User({
      username,
      email,
      password,
      profile: profile || {}
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Current Authenticated User's Profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Profile (with Multer for avatar upload)
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // req.body from multipart/form-data will be strings for non-file fields.
    // However, sometimes Multer can auto-parse nested JSON strings into objects
    // if the Content-Type of that part of the FormData is application/json.
    // So, we need to handle both cases: a stringified JSON or a direct object.
    const { username, email, removeAvatar } = req.body;
    let profileUpdates = req.body.profile;
    let preferencesUpdates = req.body.preferences;

    // Robust parsing for profileUpdates and preferencesUpdates
    if (typeof profileUpdates === 'string') {
      try {
        profileUpdates = JSON.parse(profileUpdates);
      } catch (e) {
        console.error('Failed to parse profile JSON:', e);
        return res.status(400).json({ error: 'Invalid profile data format.' });
      }
    } else if (typeof profileUpdates !== 'object' || profileUpdates === null) {
      profileUpdates = {}; // Ensure it's an object if not a string
    }

    if (typeof preferencesUpdates === 'string') {
      try {
        preferencesUpdates = JSON.parse(preferencesUpdates);
      } catch (e) {
        console.error('Failed to parse preferences JSON:', e);
        return res.status(400).json({ error: 'Invalid preferences data format.' });
      }
    } else if (typeof preferencesUpdates !== 'object' || preferencesUpdates === null) {
      preferencesUpdates = {}; // Ensure it's an object if not a string
    }


    // Update top-level fields
    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;

    // Update profile fields
    Object.keys(profileUpdates).forEach(key => {
      user.profile[key] = profileUpdates[key];
    });

    // Handle avatar file logic
    if (req.file) {
      // A new file was uploaded
      if (user.profile.avatar) { // Delete old avatar if it exists
        const oldAvatarPath = path.join(__dirname, '..', user.profile.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      user.profile.avatar = `/uploads/${req.file.filename}`; // Set new avatar path
    } else if (removeAvatar === 'true' || profileUpdates.avatar === '') { // Explicit remove flag OR empty avatar field from frontend
      if (user.profile.avatar) {
        const oldAvatarPath = path.join(__dirname, '..', user.profile.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath); // Delete the old file
        }
      }
      user.profile.avatar = ''; // Clear avatar path in DB
    }

    // Update preferences fields
    Object.keys(preferencesUpdates).forEach(key => {
      user.preferences[key] = preferencesUpdates[key];
    });

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.toObject()
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Only image files are allowed!') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Server error updating profile' });
  }
});

// Get a single user by ID (PUBLIC PROFILE VIEW and internal usage like team leaders)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email')
      .populate('profile.projects') // If these are references, they will be populated
      .populate('profile.achievements')
      .populate('profile.hackathonsAttended');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: error.message || 'Server error fetching user' });
  }
});

// Get all users with filters and search (FOR USER LIST PAGE)
router.get('/', async (req, res) => {
  try {
    const { q, skills, interests, location, university, experienceLevel, page = 1, limit = 10 } = req.query;

    let query = {};

    if (q) {
      query.$or = [
        { 'profile.firstName': new RegExp(q, 'i') },
        { 'profile.lastName': new RegExp(q, 'i') },
        { 'username': new RegExp(q, 'i') },
        { 'profile.bio': new RegExp(q, 'i') },
        { 'profile.major': new RegExp(q, 'i') },
        { 'profile.university': new RegExp(q, 'i') }
      ];
    }

    if (skills) {
      query['profile.skills'] = { $in: skills.split(',').map(s => s.trim()) };
    }
    if (interests) {
      query['profile.interests'] = { $in: interests.split(',').map(s => s.trim()) };
    }
    if (location) {
      query['profile.location'] = new RegExp(location, 'i');
    }
    if (university) {
      query['profile.university'] = new RegExp(university, 'i');
    }
    if (experienceLevel) {
      query['preferences.experienceLevel'] = experienceLevel;
    }

    const users = await User.find(query)
      .select('-password -email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all users with filters:', error);
    res.status(500).json({ error: error.message || 'Server error fetching users' });
  }
});

module.exports = router;