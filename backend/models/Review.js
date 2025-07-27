// backend/models/Review.js (NEW FILE)
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // The user who is being reviewed (the recipient of the review)
  userBeingReviewed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The user who is submitting the review (the reviewer)
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The team context in which the review is given (optional but good for context)
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  // The numerical rating (e.g., 1-5 stars)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  // The written review/feedback
  comment: {
    type: String,
    trim: true,
    maxlength: 500, // Optional: Limit comment length
  },
  // Categorized feedback (optional but useful for detailed reviews)
  strengths: [String],
  areasForImprovement: [String],
  // Whether the review is public or only visible to the user being reviewed
  isPublic: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Add a compound unique index to ensure a user can only review another user once per team
reviewSchema.index({ userBeingReviewed: 1, reviewer: 1, team: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);