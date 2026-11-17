import React from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  type = 'button',
  onClick,
  to,
  href,
  as,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-gurukul-saffron-600 to-gurukul-saffron-500 hover:from-gurukul-saffron-500 hover:to-gurukul-saffron-600 text-white focus:ring-gurukul-saffron-400 shadow-xs hover:shadow-md active:scale-[0.99]',
    secondary: 'bg-gurukul-navy-950 hover:bg-gurukul-navy-900 text-white focus:ring-gurukul-navy-700 shadow-xs hover:shadow-md active:scale-[0.99]',
    outline: 'border border-slate-300 hover:border-gurukul-saffron-500 text-slate-700 hover:text-gurukul-saffron-600 bg-white focus:ring-gurukul-saffron-400 shadow-xs hover:bg-orange-50/40',
    'outline-light': 'border border-white/20 hover:border-white/40 text-white bg-white/10 hover:bg-white/20 focus:ring-gurukul-saffron-400 shadow-xs backdrop-blur-xs',
    ghost: 'text-slate-600 hover:text-gurukul-saffron-600 hover:bg-orange-50/70 focus:ring-gurukul-saffron-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-xs hover:shadow',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-xs hover:shadow'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5',
    xl: 'text-base sm:text-lg px-6 py-3 gap-3'
  };

  const computedClass = twMerge(baseStyles, variants[variant] || variants.primary, sizes[size] || sizes.md, className);

  const spinner = isLoading && (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={computedClass}
        {...props}
      >
        {spinner}
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={computedClass}
        {...props}
      >
        {spinner}
        {children}
      </a>
    );
  }

  if (as === 'span') {
    return (
      <span
        onClick={onClick}
        className={computedClass}
        {...props}
      >
        {spinner}
        {children}
      </span>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={computedClass}
      {...props}
    >
      {spinner}
      {children}
    </button>
  );
};
