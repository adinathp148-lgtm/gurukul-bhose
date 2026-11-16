import React from 'react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'orange',
  subtitle,
  onClick
}) => {
  const colorSchemes = {
    orange: {
      bg: 'bg-orange-50',
      text: 'text-gurukul-saffron-600',
      border: 'border-orange-100'
    },
    navy: {
      bg: 'bg-blue-50',
      text: 'text-gurukul-navy-900',
      border: 'border-blue-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100'
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.orange;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.text}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs">
          <span className={trend.isPositive ? 'text-emerald-600 font-semibold' : 'text-slate-500'}>
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
};
