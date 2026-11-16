import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    primary: 'bg-orange-50 text-gurukul-saffron-700 border-orange-200',
    navy: 'bg-blue-50 text-gurukul-navy-900 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    // Status mappings
    New: 'bg-blue-50 text-blue-700 border-blue-200',
    Assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Follow-up Scheduled': 'bg-amber-50 text-amber-700 border-amber-200',
    'School Visit Planned': 'bg-purple-50 text-purple-700 border-purple-200',
    'Interested': 'bg-teal-50 text-teal-700 border-teal-200',
    'High Interest': 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    'Admitted': 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold',
    'Lost / Not Interested': 'bg-red-50 text-red-700 border-red-200',
    'Super Admin': 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    'Admin': 'bg-blue-100 text-blue-800 border-blue-300 font-bold',
    'Telecaller': 'bg-emerald-100 text-emerald-800 border-emerald-300'
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1'
  };

  const selectedVariant = variants[children] || variants[variant] || variants.default;

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${selectedVariant} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
