import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';

export const PageHeader = ({
  badge,
  title,
  subtitle,
  breadcrumbs = [],
  className = ''
}) => {
  return (
    <section className={`relative bg-gradient-to-r from-gurukul-navy-950 via-slate-900 to-gurukul-navy-900 text-white py-14 px-4 overflow-hidden ${className}`}>
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-4">
        {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

        <div className="space-y-2">
          {badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gurukul-saffron-500/20 text-gurukul-saffron-400 border border-gurukul-saffron-500/30">
              {badge}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
