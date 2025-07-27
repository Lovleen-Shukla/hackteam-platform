// src/components/Common/Button.js
import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  variant = 'primary', // 'primary', 'secondary', 'outline'
  icon: Icon, // Optional icon component
  ...props
}) => {
  const baseStyles = `
    flex items-center justify-center gap-2
    px-6 py-3 rounded-lg font-semibold
    transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-darkbg
  `;

  const variants = {
    primary: `bg-gradient-to-r from-blue-500 to-purple-500 text-white
              hover:from-blue-600 hover:to-purple-600 focus:ring-blue-400`,
    secondary: `bg-gray-700 text-lighttext hover:bg-gray-600 focus:ring-gray-500`,
    outline: `border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary`,
  };

  const disabledStyles = `opacity-50 cursor-not-allowed`;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${disabled ? disabledStyles : ''} ${className}`}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02, transition: { duration: 0.1 } }}
      whileTap={disabled ? {} : { scale: 0.98, transition: { duration: 0.1 } }}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {children}
    </motion.button>
  );
};

export default Button;