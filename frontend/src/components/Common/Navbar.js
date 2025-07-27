// src/components/Common/Navbar.js (COMPLETE AND CORRECTED)
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from './Button';
import { Users, LogOut, User as UserIcon, LayoutDashboard, PlusCircle, Search, Bell as BellIcon, UserSearch } from 'lucide-react'; // <--- ADDED UserSearch icon
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('userId'); // Ensure userId is also cleared
    navigate('/login');
    toast.success('Logged out successfully!');
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 p-4 bg-darkbg/80 backdrop-blur-md shadow-lg"
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Site Title */}
        <Link to="/" className="flex items-center space-x-2 text-white text-2xl font-bold font-heading">
          <Users className="h-7 w-7 text-primary" />
          <span>HackTeam</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          {user ? ( // If user is logged in
            <>
              <Link to="/dashboard" className="text-lighttext hover:text-primary transition-colors duration-200 text-lg flex items-center gap-1">
                <LayoutDashboard className="h-5 w-5" /> Dashboard
              </Link>
              <Link to="/teams" className="text-lighttext hover:text-primary transition-colors duration-200 text-lg flex items-center gap-1">
                <Search className="h-5 w-5" /> Find Teams
              </Link>
              <Link to="/users" className="text-lighttext hover:text-primary transition-colors duration-200 text-lg flex items-center gap-1"> {/* <--- NEW LINK FOR USERS */}
                <UserSearch className="h-5 w-5" /> Find Hackers
              </Link>
              <Link to="/teams/create" className="text-lighttext hover:text-primary transition-colors duration-200 text-lg flex items-center gap-1">
                <PlusCircle className="h-5 w-5" /> Create Team
              </Link>
              <Link to="/notifications" className="text-lighttext hover:text-primary transition-colors duration-200 text-lg flex items-center gap-1">
                <BellIcon className="h-5 w-5" /> Notifications
              </Link>
            </>
          ) : ( // If user is not logged in
            <>
              <Link to="/teams" className="text-lighttext hover:text-primary transition-colors duration-200 text-lg">
                Find Teams
              </Link>
              <Link to="/about" className="text-lighttext hover:text-primary transition-colors duration-200 text-lg">
                About
              </Link>
            </>
          )}
        </div>

        {/* Auth Buttons / User Actions */}
        <div className="flex items-center space-x-3">
          {user ? ( // If user is logged in
            <>
              {/* Profile Link with Avatar */}
              <Link to="/profile" className="flex items-center space-x-2 text-lighttext hover:text-primary transition-colors duration-200 text-lg px-3 py-2 rounded-lg border border-transparent hover:border-primary">
                {user.profile?.avatar ? (
                  <img src={user.profile.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <UserIcon className="h-6 w-6" /> // Default icon if no avatar
                )}
                <span className="hidden sm:inline">{user.profile?.firstName || user.username}</span>
              </Link>
              {/* Logout Button */}
              <Button onClick={handleLogout} variant="outline" className="px-4 py-2 text-base flex items-center gap-1">
                <LogOut className="h-5 w-5" /> Logout
              </Button>
            </>
          ) : ( // If user is not logged in
            <>
              <Button variant="outline" className="text-lighttext hover:text-white px-4 py-2 text-base" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button className="px-4 py-2 text-base" onClick={() => navigate('/register')}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;