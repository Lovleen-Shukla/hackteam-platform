// backend/routes/reviews.js (NEW FILE)
const express = require('express');
const mongoose = require('mongoose'); // Needed for ObjectId
const Review = require('../models/Review'); // Import the new Review model
const User = require('../models/User');     // Import User model to update ratings
const Team = require('../models/Team');     // Import Team model for context/validation
const auth = require('../middleware/auth'); // Auth middleware

const router = express.Router();

// Helper function to update a user's average rating
async function updateAverageRating(userId) {
  const pipeline = [
    { $match: { userBeingReviewed: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ];

  const result = await Review.aggregate(pipeline);
  const user = await User.findById(userId);

  if (user) {
    user.rating.average = result.length > 0 ? parseFloat(result[0].averageRating.toFixed(1)) : 0;
    user.rating.count = result.length > 0 ? result[0].reviewCount : 0;
    await user.save({ validateBeforeSave: false }); // Bypass validation for password hash if not modified
  }
}

// POST /api/reviews - Submit a new review
router.post('/', auth, async (req, res) => {
  try {
    const { userBeingReviewed, team: teamId, rating, comment, strengths, areasForImprovement, isPublic } = req.body;
    const reviewerId = req.user.id; // The authenticated user is the reviewer

    // Basic validation
    if (!userBeingReviewed || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'User being reviewed and a rating (1-5) are required.' });
    }
    if (userBeingReviewed === reviewerId.toString()) {
      return res.status(400).json({ error: 'You cannot review yourself.' });
    }

    // Optional: Add logic to ensure reviewer and reviewed user were actually on the same team
    // and that the review is given after the hackathon/team period.
    let teamContext = null;
    if (teamId) {
        teamContext = await Team.findById(teamId);
        if (!teamContext) {
            return res.status(404).json({ error: 'Team not found for review context.' });
        }
        // Verify reviewer and reviewed user were indeed members of this team
        const isReviewerMember = teamContext.members.some(m => m.user.toString() === reviewerId.toString());
        const isReviewedMember = teamContext.members.some(m => m.user.toString() === userBeingReviewed.toString());

        if (!isReviewerMember || !isReviewedMember) {
            return res.status(403).json({ error: 'Reviewer and reviewed user must have been members of the specified team.' });
        }
    }


    const newReview = new Review({
      userBeingReviewed,
      reviewer: reviewerId,
      team: teamId, // Store team ID if provided
      rating,
      comment,
      strengths,
      areasForImprovement,
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    await newReview.save();

    // Update the average rating for the user being reviewed
    await updateAverageRating(userBeingReviewed);

    res.status(201).json({ message: 'Review submitted successfully!', review: newReview });

  } catch (error) {
    // Handle duplicate review (unique index violation)
    if (error.code === 11000) {
      return res.status(409).json({ error: 'You have already submitted a review for this user within this team context.' });
    }
    console.error('Error submitting review:', error);
    res.status(500).json({ error: error.message || 'Server error submitting review.' });
  }
});

// GET /api/reviews/user/:userId - Get reviews for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 5, isPublicOnly = true } = req.query;

    const query = { userBeingReviewed: userId };
    if (isPublicOnly === 'true') { // Filter by public reviews for general viewing
        query.isPublic = true;
    }

    const reviews = await Review.find(query)
      .populate('reviewer', 'username profile.firstName profile.lastName profile.avatar') // Show who reviewed them
      .populate('team', 'name') // Show team context
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews for user:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }
    res.status(500).json({ error: error.message || 'Server error fetching reviews.' });
  }
});

// GET /api/reviews/my - Get reviews submitted by the authenticated user
router.get('/my', auth, async (req, res) => {
    try {
        const { page = 1, limit = 5 } = req.query;

        const reviews = await Review.find({ reviewer: req.user.id })
            .populate('userBeingReviewed', 'username profile.firstName profile.lastName profile.avatar')
            .populate('team', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Review.countDocuments({ reviewer: req.user.id });

        res.json({
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching my submitted reviews:', error);
        res.status(500).json({ error: error.message || 'Server error fetching submitted reviews.' });
    }
});


module.exports = router;