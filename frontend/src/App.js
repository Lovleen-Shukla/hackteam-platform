// src/App.js (COMPLETE AND CORRECTED for Public User Profiles)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Common/PrivateRoute';
import Navbar from './components/Common/Navbar';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage'; // This page now handles both /profile and /profile/:id
import TeamListPage from './pages/TeamListPage';
import TeamDetailPage from './pages/TeamDetailPage';
import CreateTeamPage from './pages/CreateTeamPage';
import NotificationsPage from './pages/NotificationsPage';
import EditTeamPage from './pages/EditTeamPage';
import UserListPage from './pages/UserListPage';

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes - only accessible if authenticated */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* The /profile route (for own profile) is already handled by ProfilePage.js logic */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/teams" element={<TeamListPage />} />
            <Route path="/teams/create" element={<CreateTeamPage />} />
            <Route path="/teams/:id" element={<TeamDetailPage />} />
            <Route path="/teams/:id/edit" element={<EditTeamPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/users" element={<UserListPage />} />
            {/* NEW ROUTE: For viewing other users' profiles by ID */}
            <Route path="/profile/:id" element={<ProfilePage />} /> {/* <--- ADD THIS LINE */}
          </Route>

          {/* Catch-all route for any undefined paths (404 Not Found) */}
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-white text-3xl">404 - Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;