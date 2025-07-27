// src/components/Common/Input.js
import React from 'react';

const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  error,
  icon: Icon, // Destructure icon as an Icon component
  ...props
}) => {
  const inputBaseStyles = `
    w-full pl-10 pr-4 py-3 bg-white/10 border
    rounded-lg text-lighttext placeholder-white/50
    focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent
    transition-all duration-200
  `;
  const errorStyles = error ? 'border-red-400' : 'border-white/20';

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-lighttext text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${inputBaseStyles} ${errorStyles} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;