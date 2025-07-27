// src/pages/HomePage.js
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
// Navbar is now handled in App.js, so it's removed from here
import Button from '../components/Common/Button';
import { Users, Code, Lightbulb, Zap } from 'lucide-react'; // Icons for features

const HomePage = () => {
  return (
    <div className="min-h-screen bg-darkbg text-lighttext">
      {/* Navbar is rendered globally in App.js */}

      {/* Hero Section */}
      {/* Added pt-20 to ensure content is not hidden under the fixed Navbar */}
      <section className="relative flex items-center justify-center min-h-screen pt-20 pb-10 px-4 overflow-hidden bg-gradient-to-br from-gray-900 to-black">
        {/* Background Blobs for effect */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-80 -right-40 w-96 h-96 bg-secondary rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-accent rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>


        <div className="text-center relative z-10 max-w-4xl mx-auto">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight font-heading"
          >
            Find Your Dream Hackathon Team, <br className="hidden md:inline"/>Instantly.
          </motion.h1>
          <motion.p
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto"
          >
            Connect with skilled hackers, innovators, and problem-solvers to build amazing projects and win hackathons.
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            {/* Changed to use Link component for internal navigation */}
            <Link to="/teams" className="block w-full sm:w-auto">
              <Button className="w-full px-8 py-4 text-xl">
                <Code /> Explore Teams
              </Button>
            </Link>
            {/* Changed to use Link component for internal navigation */}
            <Link to="/register" className="block w-full sm:w-auto">
              <Button variant="secondary" className="w-full px-8 py-4 text-xl">
                <Users /> Join HackTeam
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-darkbg">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center text-white mb-16 font-heading">
            Why HackTeam?
          </h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gray-800/50 rounded-xl p-8 shadow-xl border border-gray-700/50 text-center flex flex-col items-center"
            >
              <Lightbulb className="h-16 w-16 text-primary mb-6" />
              <h3 className="text-3xl font-semibold text-white mb-4">Find Your Perfect Match</h3>
              <p className="text-lighttext text-lg">
                Easily search and filter teams or individual hackers by skills, interests, and experience level.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-800/50 rounded-xl p-8 shadow-xl border border-gray-700/50 text-center flex flex-col items-center"
            >
              <Users className="h-16 w-16 text-secondary mb-6" />
              <h3 className="text-3xl font-semibold text-white mb-4">Collaborate Seamlessly</h3>
              <p className="text-lighttext text-lg">
                Built-in real-time chat and team management tools keep your project on track.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-gray-800/50 rounded-xl p-8 shadow-xl border border-gray-700/50 text-center flex flex-col items-center"
            >
              <Zap className="h-16 w-16 text-accent mb-6" />
              <h3 className="text-3xl font-semibold text-white mb-4">Level Up Your Hacking</h3>
              <p className="text-lighttext text-lg">
                Gain experience, build your portfolio, and network with passionate developers.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-blue-600 text-white text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold mb-6 font-heading"
        >
          Ready to Build Something Amazing?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl mb-10 max-w-xl mx-auto"
        >
          Join HackTeam today and find the perfect collaborators for your next big idea.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          // Ensure this div is a flex container or text-align center if it only contains the link
          className="flex justify-center" // Added flex justify-center to center the button
        >
          {/* Apply block and mx-auto to the Link for centering */}
          <Link to="/register" className="block mx-auto">
            <Button variant="secondary" className="px-8 py-4 text-xl bg-white text-primary hover:bg-gray-100">
              Sign Up Now
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer (simple for now) */}
      <footer className="py-10 text-center text-gray-400 bg-gray-900">
        <p>&copy; {new Date().getFullYear()} HackTeam. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;