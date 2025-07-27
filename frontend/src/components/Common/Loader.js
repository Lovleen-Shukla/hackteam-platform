// src/components/Common/Loader.js
import React from 'react';
import { motion } from 'framer-motion';

const loaderVariants = {
  animation: {
    rotate: [0, 360],
    transition: {
      duration: 1.2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

const Loader = ({ size = 24, color = 'text-primary', className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`w-${size/4} h-${size/4} border-4 border-t-4 border-gray-200 rounded-full ${color}`}
        variants={loaderVariants}
        animate="animation"
        style={{ borderTopColor: 'currentColor' }} // Applies the color prop to the top border
      ></motion.div>
    </div>
  );
};

export default Loader;