// src/services/api.js (COMPLETE AND CORRECTED)
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login only if not already on login page to prevent infinite loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data, config) => api.put('/auth/profile', data, config), // Ensure config is passed for file uploads
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); // Also remove userId on logout
    window.location.href = '/login';
  }
};

// Teams API
export const teamsAPI = {
  getTeams: (params) => api.get('/teams', { params }),
  createTeam: (teamData) => api.post('/teams', teamData),
  getTeam: (id) => api.get(`/teams/${id}`),
  updateTeam: (id, data) => api.put(`/teams/${id}`, data),
  deleteTeam: (id) => api.delete(`/teams/${id}`),
  applyToTeam: (id, message) => api.post(`/teams/${id}/apply`, { message }),
  removeMember: (teamId, memberId) => api.put(`/teams/${teamId}/members/${memberId}`),
  handleApplication: (teamId, appId, status, role) =>
    api.put(`/teams/${teamId}/applications/${appId}`, { status, role }),
  getMyTeams: () => api.get('/teams/my-teams'),
  // These are in your initial description but not implemented in backend yet, keeping here for future
  leaveTeam: (id) => api.delete(`/teams/${id}/leave`),
  inviteToTeam: (id, email) => api.post(`/teams/${id}/invite`, { email })
};

// Messages API
export const messagesAPI = {
  getMessages: (teamId, params) => api.get(`/messages/${teamId}`, { params }),
  // Note: sendMessage from frontend uses Socket.io, but API can also exist
  sendMessage: (teamId, message) => api.post(`/messages/${teamId}`, message),
  editMessage: (messageId, content) => api.put(`/messages/${messageId}`, { content }),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`)
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};


// <--- NEW REVIEWS API ---
export const reviewsAPI = {
  submitReview: (reviewData) => api.post('/reviews', reviewData),
  getReviewsForUser: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
  getMySubmittedReviews: (params) => api.get('/reviews/my', { params }),
};
// --- END NEW REVIEWS API ---

// Users API (Adjusted to match backend/routes/auth.js for user listing/getting)
export const usersAPI = {
  // Get a single user by ID - maps to GET /api/auth/:id (handled by auth.js)
  getUser: (id) => api.get(`/auth/${id}`),
  // Search/Get all users - maps to GET /api/auth (handled by auth.js with queries)
  searchUsers: (params) => api.get('/auth', { params }), // <--- CORRECTED THIS LINE for `searchUsers`
  // Rate User - needs a backend route if implemented
  rateUser: (id, rating, review) => api.post(`/users/${id}/rate`, { rating, review })
};