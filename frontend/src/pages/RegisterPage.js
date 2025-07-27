// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Github, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import Loader from '../components/Common/Loader';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  
  const { register } = useAuth();
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
    
    // Basic client-side validation (can be enhanced with react-hook-form later)
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      setLocalLoading(false);
      return;
    }

    const result = await register(formData);
    
    if (result.success) {
      toast.success('Account created successfully! Welcome to HackTeam 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Registration failed. Please try again.');
    }
    
    setLocalLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-700 to-purple-800 flex items-center justify-center p-4 animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md
                   border border-white/20 shadow-2xl overflow-hidden relative"
      >
        {/* Background blobs for visual interest */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="text-center mb-8 relative z-10">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl font-extrabold text-white mb-3 font-heading"
          >
            Join HackTeam
          </motion.h1>
          <p className="text-white/80 text-lg">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <Input
            label="Username"
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            icon={User}
            required
          />

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
                placeholder="Must be at least 6 characters"
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
            className="w-full h-12 text-lg"
          >
            {localLoading ? <Loader size={20} color="text-white" /> : 'Register'}
          </Button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <p className="text-white/80">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-white/20 relative z-10">
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
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;