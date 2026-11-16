import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden ${
        hover ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 ${className}`}>
      <div>
        {title && <h3 className="font-bold text-gurukul-navy-950 text-base sm:text-lg">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return <div className={`px-5 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 ${className}`}>{children}</div>;
};
