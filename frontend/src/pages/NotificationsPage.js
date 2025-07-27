// src/pages/NotificationsPage.js (NEW FILE)
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, MailOpen, ChevronLeft, ChevronRight } from 'lucide-react'; // Icons
import Button from '../components/Common/Button';
import Loader from '../components/Common/Loader';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { Link } from 'react-router-dom'; // For linking to relevant content

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filter === 'unread') {
        params.isRead = false;
      } else if (filter === 'read') {
        params.isRead = true;
      }

      const response = await notificationsAPI.getNotifications(params);
      setNotifications(response.data.notifications);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications. Please try again.');
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [filter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      toast.success('Notification marked as read!');
      fetchNotifications(); // Refresh notifications
    } catch (err) {
      console.error('Failed to mark as read:', err);
      toast.error(err.response?.data?.error || 'Failed to mark notification as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (window.confirm('Are you sure you want to mark all notifications as read?')) {
      try {
        await notificationsAPI.markAllAsRead();
        toast.success('All notifications marked as read!');
        fetchNotifications(); // Refresh notifications
      } catch (err) {
        console.error('Failed to mark all as read:', err);
        toast.error(err.response?.data?.error || 'Failed to mark all notifications as read.');
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="min-h-screen bg-darkbg pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-white mb-8 font-heading text-center md:text-left flex items-center gap-3"
        >
          <Bell className="h-10 w-10 text-accent" />
          Notifications
        </motion.h1>

        {/* Filter and Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gray-800/60 rounded-xl p-6 mb-8 shadow-lg border border-gray-700/50 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="flex space-x-3">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              onClick={() => setFilter('all')}
              className="px-4 py-2"
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'primary' : 'secondary'}
              onClick={() => setFilter('unread')}
              className="px-4 py-2"
            >
              Unread
            </Button>
            <Button
              variant={filter === 'read' ? 'primary' : 'secondary'}
              onClick={() => setFilter('read')}
              className="px-4 py-2"
            >
              Read
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            icon={MailOpen}
            className="px-4 py-2"
          >
            Mark All as Read
          </Button>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader size={48} color="text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-400 text-xl py-10">
            {error}
            <Button onClick={fetchNotifications} className="mt-4">Reload Notifications</Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-lighttext text-xl py-10 bg-gray-800/60 rounded-xl p-8 shadow-lg border border-gray-700/50">
            <Bell className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p>No notifications found.</p>
            {filter !== 'all' && (
              <Button variant="outline" onClick={() => setFilter('all')} className="mt-4">
                View All Notifications
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {notifications.map(notif => (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-gray-800 rounded-xl p-5 shadow-md border ${
                    notif.isRead ? 'border-gray-700/50' : 'border-primary/50 bg-primary/10'
                  } flex items-center justify-between transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <Link to={notif.actionUrl || '#'} className="flex-grow flex items-center gap-4">
                    {notif.isRead ? (
                      <MailOpen className="h-7 w-7 text-gray-500 flex-shrink-0" />
                    ) : (
                      <Mail className="h-7 w-7 text-primary flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{notif.title}</h3>
                      <p className="text-lighttext text-base">{notif.message}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })} on {format(new Date(notif.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </Link>
                  {!notif.isRead && (
                    <Button
                      variant="outline"
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="ml-4 flex-shrink-0"
                      icon={MailOpen}
                    >
                      Mark as Read
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-12">
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  variant="secondary"
                  icon={ChevronLeft}
                >
                  Previous
                </Button>
                <span className="text-lighttext text-lg">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  variant="secondary"
                  icon={ChevronRight}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;