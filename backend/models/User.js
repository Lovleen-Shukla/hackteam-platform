// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    avatar: String,
    location: String,
    university: String,
    yearOfStudy: String,
    major: String,
    skills: [String],
    interests: [String],
    experience: String,
    github: String,
    leetcode: String,
    linkedin: String,
    portfolio: String,
    codeforces: String,
    hackerrank: String,
    kaggle: String,
    devpost: String,
    achievements: [{
      title: String,
      description: String,
      date: Date,
      link: String
    }],
    projects: [{
      name: String,
      description: String,
      techStack: [String],
      github: String,
      demo: String,
      image: String
    }],
    hackathonsAttended: [{
      name: String,
      position: String,
      project: String,
      date: Date
    }]
  },
  preferences: {
    teamSize: Number,
    experienceLevel: String,
    communicationStyle: String,
    availability: String,
    timezone: String
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);