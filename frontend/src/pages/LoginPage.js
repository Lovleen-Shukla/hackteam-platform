// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, Github, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/Common/Input'; // Import our custom Input
import Button from '../components/Common/Button'; // Import our custom Button
import Loader from '../components/Common/Loader'; // Import our custom Loader

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false); // Use a local loading state
  
  const { login } = useAuth(); // AuthContext already has a loading state, but local is good for form submission
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    
    const result = await login(formData);
    
    if (result.success) {
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed. Please check your credentials.');
    }
    
    setLocalLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-blue-700 to-indigo-900 flex items-center justify-center p-4 animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md
                   border border-white/20 shadow-2xl overflow-hidden relative"
      >
        {/* Background blobs for visual interest */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>


        <div className="text-center mb-8 relative z-10">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl font-extrabold text-white mb-3 font-heading"
          >
            HackTeam
          </motion.h1>
          <p className="text-white/80 text-lg">Sign in to find your perfect team</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <Input
            label="Email"
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            icon={Mail}
            required
          />

          <div>
            <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={localLoading}
            className="w-full h-12 text-lg" // Make button taller and text larger
          >
            {localLoading ? <Loader size={20} color="text-white" /> : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <p className="text-white/80">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-200">
              Sign up
            </Link>
          </p>
        </div>

        {/* <div className="mt-10 pt-6 border-t border-white/20 relative z-10">
          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 flex items-center justify-center"
            >
              <Github className="h-6 w-6 text-white" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 flex items-center justify-center"
            >
              <Linkedin className="h-6 w-6 text-white" />
            </motion.button>
          </div> */}
        {/* </div> */}
      </motion.div>
    </div>
  );
};

export default LoginPage;