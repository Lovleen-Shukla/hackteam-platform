// src/components/Teams/TeamCard.js (UPDATED AND CORRECTED)
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// Corrected imports: Added Lightbulb, removed Code (as it's not used here)
import { Users, Calendar, MapPin, Award, UserCheck, Lightbulb } from 'lucide-react';

const TeamCard = ({ team }) => {
  const leaderName = team.leader?.profile?.firstName || team.leader?.username || 'Unknown';
  const memberCount = team.members ? team.members.length : 0;
  const skillsNeededCount = team.skillsNeeded ? team.skillsNeeded.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-800/60 rounded-xl p-6 shadow-lg border border-gray-700/50
                 hover:shadow-2xl hover:border-primary transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
    >
      <Link to={`/teams/${team._id}`} className="block h-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-3xl font-bold text-white font-heading leading-tight">
            {team.name}
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold
            ${team.status === 'recruiting' ? 'bg-green-600/20 text-green-400' :
              team.status === 'full' ? 'bg-blue-600/20 text-blue-400' :
              'bg-gray-600/20 text-gray-400'
            }`}
          >
            {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
          </span>
        </div>

        <p className="text-lighttext text-lg mb-4 line-clamp-3">
          {team.description}
        </p>

        {team.projectIdea?.title && (
          <div className="mb-4">
            <p className="text-gray-400 text-sm flex items-center gap-1">
              <Lightbulb className="h-4 w-4 text-accent" /> Project Idea: {/* Lightbulb is now defined */}
            </p>
            <p className="text-white font-medium">{team.projectIdea.title}</p>
          </div>
        )}

        <div className="space-y-2 text-sm text-gray-300 mb-6 flex-grow">
          <p className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-secondary" />
            Leader: <span className="text-white font-medium">{leaderName}</span>
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-5 w-5 text-secondary" />
            Members: <span className="text-white font-medium">{memberCount} / {team.maxMembers}</span>
          </p>
          {team.hackathon?.name && (
            <p className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary" />
              Hackathon: <span className="text-white font-medium">{team.hackathon.name}</span>
            </p>
          )}
          {team.hackathon?.location && (
            <p className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-secondary" />
              Location: <span className="text-white font-medium">{team.hackathon.location}</span>
            </p>
          )}
          {team.hackathon?.prize && (
            <p className="flex items-center gap-2">
              <Award className="h-5 w-5 text-secondary" />
              Prize: <span className="text-white font-medium">{team.hackathon.prize}</span>
            </p>
          )}
        </div>

        {skillsNeededCount > 0 && (
          <div className="mt-auto pt-4 border-t border-gray-700/50">
            <p className="text-gray-400 text-sm mb-2">Skills Needed:</p>
            <div className="flex flex-wrap gap-2">
              {team.skillsNeeded.slice(0, 5).map((skill, index) => ( // Show first 5 skills
                <span key={index} className="bg-primary/20 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {skill}
                </span>
              ))}
              {skillsNeededCount > 5 && (
                <span className="bg-gray-600/20 text-gray-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  +{skillsNeededCount - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default TeamCard;