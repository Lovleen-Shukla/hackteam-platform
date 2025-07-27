// src/pages/TeamDetailPage.js (UPDATED AND CORRECTED - FINAL FIX FOR SYNTAX)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { teamsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Common/Loader';
import Button from '../components/Common/Button';
import {
  Users, Code, Lightbulb, Calendar, MapPin, Award,
  User, // Used this icon for members' default avatar
  MessageSquare, ClipboardCheck, Edit, Trash2 // ADDED Trash2 icon import
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

import ChatBox from '../components/Chat/ChatBox';

const TeamDetailPage = () => {
  const { id } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth(); // Renamed 'user' to 'currentUser' for clarity within this component
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const fetchTeamDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await teamsAPI.getTeam(id);
      const fetchedTeam = response.data; // Store fetched team to use immediately
      setTeam(fetchedTeam);

      if (currentUser) { // Use currentUser from useAuth hook
        const memberStatus = fetchedTeam.members.some(
          (m) => m.user._id === currentUser.id
        );
        setIsMember(memberStatus);

        const leaderStatus = fetchedTeam.leader._id === currentUser.id;
        setIsLeader(leaderStatus);

        const appliedStatus = fetchedTeam.applications.some(
          (app) => app.user._id === currentUser.id && app.status === 'pending'
        );
        setHasApplied(appliedStatus);
      }

    } catch (err) {
      console.error('Failed to fetch team details:', err);
      setError('Failed to load team details. Please try again.');
      toast.error('Failed to load team details.');
    } finally {
      setLoading(false);
    }
  }, [id, currentUser]); // Depend on id and currentUser

  useEffect(() => {
    if (!authLoading) {
      fetchTeamDetails();
    }
  }, [fetchTeamDetails, authLoading]);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await teamsAPI.applyToTeam(id, applicationMessage);
      toast.success('Application sent successfully! The team leader will review it.');
      setShowApplyModal(false);
      setHasApplied(true);
      fetchTeamDetails();
    } catch (err) {
      console.error('Failed to send application:', err);
      toast.error(err.response?.data?.error || 'Failed to send application.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplicationResponse = async (appId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this application?`)) {
      return;
    }
    try {
      await teamsAPI.handleApplication(id, appId, status);
      toast.success(`Application ${status} successfully!`);
      fetchTeamDetails();
    } catch (err) {
      console.error('Failed to handle application:', err);
      toast.error(err.response?.data?.error || 'Failed to handle application.');
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) {
      return;
    }
    try {
      const response = await teamsAPI.removeMember(id, memberUserId);
      toast.success(response.data.message);
      fetchTeamDetails();
    } catch (err) {
      console.error('Failed to remove member:', err);
      toast.error(err.response?.data?.error || 'Failed to remove member.');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkbg">
        <Loader size={64} color="text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-darkbg text-red-400">
        <h2 className="text-3xl font-bold mb-4">Error Loading Team</h2>
        <p>{error}</p>
        <Button onClick={fetchTeamDetails} className="mt-6">Retry</Button>
      </div>
    );
  }

  if (!team) {
    return <div className="min-h-screen pt-20 flex items-center justify-center text-lighttext text-xl">Team not found.</div>;
  }

  const TeamInfoCard = ({ icon: Icon, title, content, link, linkText }) => (
    <div className="bg-gray-900 rounded-lg p-4 flex items-center gap-4 border border-gray-700">
      {Icon && <Icon className="h-8 w-8 text-primary flex-shrink-0" />}
      <div>
        <h4 className="text-gray-400 text-sm font-medium">{title}</h4>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors font-semibold">
            {linkText || content}
          </a>
        ) : (
          <p className="text-white text-lg font-semibold">{content}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-darkbg pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/60 rounded-xl p-8 shadow-lg border border-gray-700/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-5xl font-bold text-white font-heading mb-3 md:mb-0">
              {team.name}
            </h1>
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-1 rounded-full text-lg font-semibold
                ${team.status === 'recruiting' ? 'bg-green-600/20 text-green-400' :
                  team.status === 'full' ? 'bg-blue-600/20 text-blue-400' :
                  'bg-gray-600/20 text-gray-400'
                }`}
              >
                {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
              </span>
              {currentUser && !isMember && !hasApplied && team.status === 'recruiting' && (
                <Button onClick={() => setShowApplyModal(true)} icon={ClipboardCheck}>
                  Apply to Join
                </Button>
              )}
              {currentUser && hasApplied && !isMember && (
                <span className="text-yellow-400 flex items-center gap-1">
                  <ClipboardCheck className="h-5 w-5" /> Application Pending
                </span>
              )}
              {isLeader && (
                <Link to={`/teams/${team._id}/edit`}>
                  <Button variant="outline" icon={Edit}>
                    Edit Team
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <p className="text-lighttext text-xl mb-6">{team.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <TeamInfoCard
              icon={User}
              title="Leader"
              content={team.leader?.profile?.firstName || team.leader?.username || 'N/A'}
              link={`/profile/${team.leader._id}`}
              linkText={team.leader?.profile?.firstName || team.leader?.username || 'View Profile'}
            />
            <TeamInfoCard
              icon={Users}
              title="Members"
              content={`${team.members.length} / ${team.maxMembers}`}
            />
            {team.hackathon?.name && (
              <TeamInfoCard
                icon={Calendar}
                title="Hackathon"
                content={team.hackathon.name}
                link={team.hackathon.website}
                linkText="Visit Hackathon"
              />
            )}
            {team.hackathon?.location && (
              <TeamInfoCard
                icon={MapPin}
                title="Location"
                content={team.hackathon.location}
              />
            )}
            {team.hackathon?.prize && (
              <TeamInfoCard
                icon={Award}
                title="Potential Prize"
                content={team.hackathon.prize}
              />
            )}
             {team.projectIdea?.techStack && team.projectIdea.techStack.length > 0 && (
              <TeamInfoCard
                icon={Code}
                title="Project Tech Stack"
                content={team.projectIdea.techStack.join(', ')}
              />
            )}
          </div>

          {team.projectIdea?.title && (
            <div className="mb-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
              <h2 className="text-3xl font-bold text-white flex items-center gap-2 mb-4">
                <Lightbulb className="h-7 w-7 text-accent" /> Project Idea: {team.projectIdea.title}
              </h2>
              <p className="text-lighttext text-lg mb-4">{team.projectIdea.description}</p>
              {team.projectIdea.features && team.projectIdea.features.length > 0 && (
                <div>
                  <h4 className="text-gray-400 text-lg mb-2">Key Features:</h4>
                  <ul className="list-disc list-inside text-lighttext ml-4 space-y-1">
                    {team.projectIdea.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Members List */}
          <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="h-7 w-7 text-secondary" /> Team Members
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {team.members.map(member => (
                // Use a div here and make the Link clickable over the main content, but not the button
                <div key={member.user._id} className="relative bg-gray-900 rounded-lg p-4 flex items-center gap-4 transition-transform duration-200 transform hover:scale-[1.02] hover:bg-gray-700/50 border border-gray-800 hover:border-primary">
                  <Link to={`/profile/${member.user._id}`} className="flex items-center gap-4 flex-grow">
                    {member.user.profile?.avatar ? (
                      <img src={member.user.profile.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
                    ) : (
                      <User className="h-12 w-12 text-gray-500 bg-gray-700 rounded-full p-2" />
                    )}
                    <div>
                      <p className="text-white text-lg font-semibold">{member.user.profile?.firstName} {member.user.profile?.lastName || member.user.username}</p>
                      <p className="text-gray-400 text-sm">{member.role} (Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')})</p>
                    </div>
                  </Link>
                  {/* Remove Member Button (only for leader, not for self) */}
                  {isLeader && member.user._id !== currentUser.id && ( // Use currentUser.id for the check
                    <Button
                      variant="secondary"
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMember(member.user._id);
                      }}
                      title="Remove Member"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills and Roles Needed */}
          {(team.skillsNeeded?.length > 0 || team.rolesNeeded?.length > 0) && (
            <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <Code className="h-7 w-7 text-primary" /> Looking For
              </h2>
              {team.skillsNeeded?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Skills:</h3>
                  <div className="flex flex-wrap gap-2">
                    {team.skillsNeeded.map((skill, index) => (
                      <span key={index} className="bg-primary/20 text-primary text-sm font-semibold px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {team.rolesNeeded?.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Roles:</h3>
                  <div className="flex flex-wrap gap-2">
                    {team.rolesNeeded.map((role, index) => (
                      <span key={index} className="bg-secondary/20 text-secondary text-sm font-semibold px-3 py-1 rounded-full">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Team Leader: Manage Applications Section */}
          {isLeader && team.applications.length > 0 && (
            <div className="mb-8 p-6 bg-purple-900/40 rounded-xl border border-purple-700/50">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <ClipboardCheck className="h-7 w-7 text-white" /> Manage Applications
              </h2>
              <div className="space-y-4">
                {team.applications.map(app => (
                  <div key={app._id} className="bg-gray-900 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-700">
                    <div className="flex-grow mb-3 sm:mb-0">
                      <Link to={`/profile/${app.user._id}`} className="text-white text-lg font-semibold hover:text-primary transition-colors">
                        {app.user.profile?.firstName || app.user.username}
                      </Link>
                      <p className="text-gray-400 text-sm mt-1">Applied: {format(new Date(app.appliedAt), 'MMM d, yyyy')}</p>
                      {app.message && (
                        <p className="text-gray-300 text-sm italic mt-2">"{app.message}"</p>
                      )}
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      {app.status === 'pending' ? (
                        <>
                          <Button variant="primary" className="bg-green-500 hover:bg-green-600" onClick={() => handleApplicationResponse(app._id, 'accepted')}>
                            Accept
                          </Button>
                          <Button variant="secondary" className="bg-red-500 hover:bg-red-600" onClick={() => handleApplicationResponse(app._id, 'rejected')}>
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                          app.status === 'accepted' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                        }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Section (Only for Members) */}
          {isMember && (
            <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="h-7 w-7 text-primary" /> Team Chat
              </h2>
              <ChatBox teamId={team._id} />
            </div>
          )}

        </motion.div>
      </div>

      {/* Apply to Team Modal */}
      {showApplyModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="bg-gray-800 rounded-xl p-8 w-full max-w-md border border-gray-700 shadow-2xl"
          >
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Apply to {team.name}</h2>
            <textarea
              className="w-full h-32 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 p-4 focus:outline-none focus:ring-2 focus:ring-primary mb-6"
              placeholder="Tell the leader why you'd be a great fit for the team (optional)"
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={isApplying}>
                {isApplying ? <Loader size={20} color="text-white" /> : 'Send Application'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TeamDetailPage;