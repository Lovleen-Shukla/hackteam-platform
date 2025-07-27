// backend/routes/teams.js (COMPLETE CODE - WITH IMPROVED ERROR HANDLING FOR MY-TEAMS)
const express = require('express');
const Team = require('../models/Team');
const User = require('../models/User'); // Ensure User model is imported for team creation etc.
const Notification = require('../models/Notification'); // Ensure Notification model is imported
const auth = require('../middleware/auth');

const router = express.Router();

// Get all teams with filters
router.get('/', async (req, res) => {
  try {
    const {
      skills,
      experienceLevel,
      hackathon,
      search,
      status = 'recruiting',
      page = 1,
      limit = 10
    } = req.query;

    let query = { status, isPublic: true };

    // Add filters
    if (skills) {
      query.skillsNeeded = { $in: skills.split(',') };
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (hackathon) {
      query['hackathon.name'] = new RegExp(hackathon, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'projectIdea.title': new RegExp(search, 'i') }
      ];
    }

    const teams = await Team.find(query)
      .populate('leader', 'username profile.firstName profile.lastName profile.avatar')
      .populate('members.user', 'username profile.firstName profile.lastName profile.avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Team.countDocuments(query);

    res.json({
      teams,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all teams:', error); // Added console.error
    res.status(500).json({ error: error.message });
  }
});

// Create team
router.post('/', auth, async (req, res) => {
  try {
    const teamData = {
      ...req.body,
      leader: req.user.id,
      members: [{ user: req.user.id, role: 'Leader' }]
    };

    const team = new Team(teamData);
    await team.save();

    await team.populate('leader', 'username profile.firstName profile.lastName profile.avatar');
    await team.populate('members.user', 'username profile.firstName profile.lastName profile.avatar');

    res.status(201).json({
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    console.error('Error creating team:', error); // Added console.error
    res.status(500).json({ error: error.message });
  }
});

// Apply to join team
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is already a member
    const isMember = team.members.some(member =>
      member.user.toString() === req.user.id
    );

    if (isMember) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Check if user has already applied
    const hasApplied = team.applications.some(app =>
      app.user.toString() === req.user.id
    );

    if (hasApplied) {
      return res.status(400).json({ error: 'You have already applied to this team' });
    }

    // Add application
    team.applications.push({
      user: req.user.id,
      message: req.body.message || ''
    });

    await team.save();

    // Create notification for team leader
    const notification = new Notification({
      recipient: team.leader,
      sender: req.user.id,
      type: 'join_request',
      title: 'New Team Application',
      message: `${req.user.username} wants to join your team "${team.name}"`,
      data: { teamId: team._id, applicationId: team.applications[team.applications.length - 1]._id }
    });

    await notification.save();

    res.json({ message: 'Application sent successfully' });
  } catch (error) {
    console.error('Error applying to team:', error); // Added console.error
    res.status(500).json({ error: error.message });
  }
});

// Handle team application
router.put('/:id/applications/:appId', auth, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is team leader
    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only team leader can handle applications' });
    }

    const application = team.applications.id(req.params.appId);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.status = status;

    if (status === 'accepted') {
      // Check if team is already full before adding member
      if (team.members.length >= team.maxMembers) {
        return res.status(400).json({ error: 'Team is already full.' });
      }

      // Add user to team members
      team.members.push({
        user: application.user,
        role: req.body.role || 'Member'
      });

      // Update team status if full after adding
      if (team.members.length >= team.maxMembers) {
        team.status = 'full';
      }
    }

    await team.save();

    // Create notification
    const applicantUser = await User.findById(application.user); // Fetch applicant user for username
    const notification = new Notification({
      recipient: application.user,
      sender: req.user.id,
      type: 'team_update',
      title: status === 'accepted' ? 'Application Accepted!' : 'Application Rejected',
      message: `Your application to join "${team.name}" has been ${status}`,
      data: { teamId: team._id }
    });

    await notification.save();

    res.json({ message: `Application ${status} successfully` });
  } catch (error) {
    console.error('Error handling application:', error); // Added console.error
    res.status(500).json({ error: error.message });
  }
});

// Get user's teams
router.get('/my-teams', auth, async (req, res) => {
  try {
    // Crucial check: Ensure req.user and req.user.id are available
    if (!req.user || !req.user.id) {
      console.error('Auth middleware failed to attach user to request for /my-teams');
      return res.status(401).json({ error: 'Authentication required for this operation.' });
    }

    const teams = await Team.find({
      $or: [
        { leader: req.user.id },
        { 'members.user': req.user.id }
      ]
    })
    .populate('leader', 'username profile.firstName profile.lastName profile.avatar')
    .populate('members.user', 'username profile.firstName profile.lastName profile.avatar')
    .sort({ createdAt: -1 });

    res.json(teams);
  } catch (error) {
    console.error('Error fetching user\'s teams:', error); // Added console.error
    res.status(500).json({ error: error.message });
  }
});

// Update team
router.put('/:id', auth, async (req, res) => {
  try {
    const teamId = req.params.id;
    const updates = req.body; // Contains the updated team data from the frontend

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    // Authorization check: Only the team leader can update the team
    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to update this team.' });
    }

    // Update fields (deep merge for nested objects like projectIdea, hackathon, requirements)
    // Basic fields:
    if (updates.name !== undefined) team.name = updates.name;
    if (updates.description !== undefined) team.description = updates.description;
    if (updates.maxMembers !== undefined) team.maxMembers = updates.maxMembers;
    if (updates.experienceLevel !== undefined) team.experienceLevel = updates.experienceLevel;
    if (updates.isPublic !== undefined) team.isPublic = updates.isPublic;

    // Arrays: Directly replace or merge as needed. Frontend sends filtered arrays.
    if (updates.skillsNeeded !== undefined) team.skillsNeeded = updates.skillsNeeded;
    if (updates.rolesNeeded !== undefined) team.rolesNeeded = updates.rolesNeeded;
    if (updates.tags !== undefined) team.tags = updates.tags;

    // Nested Objects: Merge properties
    if (updates.hackathon !== undefined) {
      // If hackathon is entirely removed from frontend, updates.hackathon might be empty or undefined.
      // If updating, merge fields. If cleared from frontend, ensure it becomes an empty object or null.
      if (updates.hackathon === null || (typeof updates.hackathon === 'object' && Object.keys(updates.hackathon).length === 0 && !updates.hackathon.name)) {
        team.hackathon = {}; // Clear hackathon data if empty object is sent
      } else {
        Object.assign(team.hackathon, updates.hackathon);
      }
    }

    if (updates.projectIdea !== undefined) {
      if (updates.projectIdea === null || (typeof updates.projectIdea === 'object' && Object.keys(updates.projectIdea).length === 0 && !updates.projectIdea.title)) {
        team.projectIdea = {}; // Clear projectIdea if empty
      } else {
        Object.assign(team.projectIdea, updates.projectIdea);
      }
    }

    if (updates.requirements !== undefined) {
        if (updates.requirements === null || (typeof updates.requirements === 'object' && Object.keys(updates.requirements).length === 0 && !Object.values(updates.requirements).some(Boolean))) {
            team.requirements = {}; // Clear requirements if empty
        } else {
            Object.assign(team.requirements, updates.requirements);
        }
    }

    await team.save();

    // Respond with the updated team, populated for display on the frontend
    const updatedTeam = await Team.findById(teamId)
      .populate('leader', 'username email profile.firstName profile.lastName profile.avatar')
      .populate('members.user', 'username email profile.firstName profile.lastName profile.avatar')
      .populate('applications.user', 'username email profile.firstName profile.lastName profile.avatar');

    res.json({ message: 'Team updated successfully', team: updatedTeam });
  } catch (error) {
    console.error('Error updating team:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid team ID format.' });
    }
    res.status(500).json({ error: error.message || 'Server error updating team.' });
  }
});

// Remove a member from a team
router.put('/:teamId/members/:memberId', auth, async (req, res) => {
  try {
    const { teamId, memberId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    // Authorization check: Only the team leader can remove members
    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to remove members from this team.' });
    }

    // Ensure the member being removed is not the leader themselves
    if (memberId === req.user.id) {
      return res.status(400).json({ error: 'Leaders cannot remove themselves from their own team this way. Please transfer leadership or delete the team.' });
    }

    // Check if the member exists in the team
    const initialMemberCount = team.members.length;
    team.members = team.members.filter(member => member.user.toString() !== memberId);

    if (team.members.length === initialMemberCount) {
      // If the array length didn't change, the member wasn't found
      return res.status(404).json({ error: 'Member not found in this team.' });
    }

    // If the team status was 'full' and a member is removed, change status back to 'recruiting'
    if (team.status === 'full' && team.members.length < team.maxMembers) {
      team.status = 'recruiting';
    }

    await team.save();

    // Optionally, send a notification to the removed user
    // No need to populate in response if we just need to confirm deletion
    const removedUser = await User.findById(memberId).select('username profile.firstName profile.lastName');
    const notification = new Notification({
      recipient: memberId,
      sender: req.user.id,
      type: 'team_update',
      title: 'Removed from Team',
      message: `You have been removed from the team "${team.name}" by ${req.user.username}.`,
      data: { teamId: team._id }
    });
    await notification.save();


    // Respond with the updated team, populated for display on the frontend
    const updatedTeam = await Team.findById(teamId)
      .populate('leader', 'username email profile.firstName profile.lastName profile.avatar')
      .populate('members.user', 'username email profile.firstName profile.lastName profile.avatar')
      .populate('applications.user', 'username email profile.firstName profile.lastName profile.avatar');


    res.json({ message: 'Member removed successfully.', team: updatedTeam });
  } catch (error) {
    console.error('Error removing team member:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    res.status(500).json({ error: error.message || 'Server error removing member.' });
  }
});

// Get a single team by ID
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'username email profile.firstName profile.lastName profile.avatar')
      .populate('members.user', 'username email profile.firstName profile.lastName profile.avatar')
      .populate('applications.user', 'username email profile.firstName profile.lastName profile.avatar');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching single team:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid team ID format' });
    }
    res.status(500).json({ error: error.message || 'Server error fetching team' });
  }
});

module.exports = router;