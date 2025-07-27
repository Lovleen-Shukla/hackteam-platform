// src/components/Users/UserCard.js (UPDATED AND CORRECTED)
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// Removed 'Code' as it was defined but never used in this component
import { User as UserIcon, MapPin, University, Linkedin, Github } from 'lucide-react';

const UserCard = ({ user }) => {
  const displayName = user.profile?.firstName || user.username;
  const displayLocation = user.profile?.location;
  const displayUniversity = user.profile?.university;
  const skillsCount = user.profile?.skills ? user.profile.skills.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-800/60 rounded-xl p-6 shadow-lg border border-gray-700/50
                 hover:shadow-2xl hover:border-secondary transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
    >
      <Link to={`/profile/${user._id}`} className="block h-full">
        <div className="flex items-center gap-4 mb-4">
          {user.profile?.avatar ? (
            <img src={user.profile.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
          ) : (
            <UserIcon className="h-16 w-16 text-gray-500 bg-gray-700 rounded-full p-2 flex-shrink-0" />
          )}
          <div>
            <h3 className="text-3xl font-bold text-white font-heading leading-tight">
              {displayName}
            </h3>
            {user.profile?.major && (
              <p className="text-gray-400 text-sm">Major: {user.profile.major}</p>
            )}
          </div>
        </div>

        {user.profile?.bio && (
          <p className="text-lighttext text-lg mb-4 line-clamp-3">
            {user.profile.bio}
          </p>
        )}

        <div className="space-y-2 text-sm text-gray-300 mb-6 flex-grow">
          {displayLocation && (
            <p className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              Location: <span className="text-white font-medium">{displayLocation}</span>
            </p>
          )}
          {displayUniversity && (
            <p className="flex items-center gap-2">
              <University className="h-5 w-5 text-accent" />
              University: <span className="text-white font-medium">{displayUniversity}</span>
            </p>
          )}
          {user.profile?.linkedin && (
            <a href={user.profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400">
              <Linkedin className="h-5 w-5 text-accent" />
              LinkedIn
            </a>
          )}
          {user.profile?.github && (
            <a href={user.profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400">
              <Github className="h-5 w-5 text-accent" />
              GitHub
            </a>
          )}
        </div>

        {skillsCount > 0 && (
          <div className="mt-auto pt-4 border-t border-gray-700/50">
            <p className="text-gray-400 text-sm mb-2">Skills:</p>
            <div className="flex flex-wrap gap-2">
              {user.profile.skills.slice(0, 5).map((skill, index) => ( // Show first 5 skills
                <span key={index} className="bg-primary/20 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {skill}
                </span>
              ))}
              {skillsCount > 5 && (
                <span className="bg-gray-600/20 text-gray-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  +{skillsCount - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default UserCard;