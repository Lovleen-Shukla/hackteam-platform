// src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { teamsAPI, notificationsAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Common/Button';
import Loader from '../components/Common/Loader';
// Used all imported icons now to remove the warning
import { Users, PlusCircle, Search, Bell, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [myTeams, setMyTeams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !user) {
        setDataLoading(false);
        return;
      }

      try {
        const [teamsRes, notificationsRes] = await Promise.all([
          teamsAPI.getMyTeams(),
          // Ensure your notificationsAPI returns { notifications: [], pagination: {} }
          // If it returns just an array, change to notificationsRes.data
          notificationsAPI.getNotifications({ limit: 5 })
        ]);
        setMyTeams(teamsRes.data);
        // Corrected based on the notifications API returning an object with a 'notifications' key
        setNotifications(notificationsRes.data.notifications);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        toast.error('Failed to load dashboard data.');
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkbg">
        <Loader size={64} color="text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-darkbg text-red-400">
        <h2 className="text-3xl font-bold mb-4">Error Loading Dashboard</h2>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-6">Retry</Button>
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen pt-20 flex items-center justify-center text-lighttext">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-darkbg pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-white mb-8 font-heading text-center md:text-left flex items-center gap-3 justify-center md:justify-start" // Added flex classes
        >
          <LayoutDashboard className="h-10 w-10 text-primary" /> {/* <--- USED IT HERE */}
          Welcome, {user.profile?.firstName || user.username}!
        </motion.h1>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Link to="/teams/create" className="block">
            <Button className="w-full h-24 text-xl flex-col justify-center items-center rounded-xl bg-gradient-to-br from-primary to-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <PlusCircle className="h-8 w-8 mb-2" />
              Create New Team
            </Button>
          </Link>
          <Link to="/teams" className="block">
            <Button variant="secondary" className="w-full h-24 text-xl flex-col justify-center items-center rounded-xl bg-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <Search className="h-8 w-8 mb-2" />
              Find a Team
            </Button>
          </Link>
          <Link to="/profile" className="block">
            <Button variant="outline" className="w-full h-24 text-xl flex-col justify-center items-center rounded-xl border border-primary text-primary hover:bg-primary hover:text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <UserIcon className="h-8 w-8 mb-2" />
              My Profile
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Teams Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2 bg-gray-800/60 rounded-xl p-6 shadow-xl border border-gray-700/50"
          >
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="h-7 w-7 text-primary" /> My Teams
            </h2>
            {myTeams.length === 0 ? (
              <p className="text-lighttext text-lg">You are not part of any teams yet. <Link to="/teams/create" className="text-primary hover:underline">Create one</Link> or <Link to="/teams" className="text-secondary hover:underline">find a team</Link> to join!</p>
            ) : (
              <div className="space-y-4">
                {myTeams.map(team => (
                  <Link to={`/teams/${team._id}`} key={team._id} className="block group">
                    <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between transition-transform duration-200 transform group-hover:scale-[1.01] group-hover:bg-gray-700/50">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{team.name}</h3>
                        <p className="text-gray-400 text-sm">
                          Leader: {team.leader?.profile?.firstName || team.leader?.username || 'N/A'}
                        </p>
                      </div>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        team.status === 'recruiting' ? 'bg-green-600/20 text-green-400' :
                        team.status === 'full' ? 'bg-blue-600/20 text-blue-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {team.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gray-800/60 rounded-xl p-6 shadow-xl border border-gray-700/50"
          >
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <Bell className="h-7 w-7 text-accent" /> Recent Notifications
            </h2>
            {notifications.length === 0 ? (
              <p className="text-lighttext text-lg">No new notifications.</p>
            ) : (
              <div className="space-y-4">
                {notifications.map(notif => (
                  <Link to={notif.actionUrl || '#'} key={notif._id} className="block group">
                    <div className="bg-gray-900 rounded-lg p-4 transition-transform duration-200 transform group-hover:scale-[1.01] group-hover:bg-gray-700/50">
                      <h3 className="text-lg font-semibold text-white flex justify-between items-center">
                        {notif.title}
                        {!notif.isRead && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full animate-pulse">New</span>
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">{notif.message}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-6 text-center">
              <Button variant="outline" className="text-primary hover:text-white border-primary" onClick={() => navigate('/notifications')}>
                View All Notifications
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;