// models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  hackathon: {
    name: String,
    date: Date,
    location: String,
    website: String,
    prize: String
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  skillsNeeded: [String],
  rolesNeeded: [String],
  maxMembers: {
    type: Number,
    default: 4
  },
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
    default: 'mixed'
  },
  status: {
    type: String,
    enum: ['recruiting', 'full', 'inactive'],
    default: 'recruiting'
  },
  projectIdea: {
    title: String,
    description: String,
    techStack: [String],
    features: [String]
  },
  requirements: {
    commitment: String,
    timezone: String,
    communication: String,
    meetingFrequency: String
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  inviteCode: String,
  applications: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);