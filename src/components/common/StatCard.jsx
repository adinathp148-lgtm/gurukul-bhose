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
      border: 'border-orange-200/70'
    },
    saffron: {
      bg: 'bg-orange-50',
      text: 'text-gurukul-saffron-600',
      border: 'border-orange-200/70'
    },
    navy: {
      bg: 'bg-slate-100',
      text: 'text-gurukul-navy-950',
      border: 'border-slate-200/80'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200/70'
    },
    sky: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200/70'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200/70'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200/70'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200/70'
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200/70'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200/70'
    },
    gold: {
      bg: 'bg-amber-50',
      text: 'text-gurukul-gold-600',
      border: 'border-amber-200/70'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.orange;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 xl:p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-orange-200/90 group ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p 
            className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-normal leading-snug line-clamp-2 min-h-[2.2rem] flex items-center" 
            title={title}
          >
            {title}
          </p>
          <h4 className="text-xl sm:text-2xl xl:text-3xl font-black text-gurukul-navy-950 mt-0.5 tracking-tight truncate">
            {value}
          </h4>
          {subtitle && (
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-medium truncate" title={subtitle}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2 sm:p-2.5 xl:p-3 rounded-xl sm:rounded-2xl ${scheme.bg} ${scheme.text} border ${scheme.border} group-hover:scale-105 transition-transform shrink-0`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center text-xs">
          <span className={trend.isPositive ? 'text-emerald-600 font-semibold' : 'text-slate-500'}>
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
};
