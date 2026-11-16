import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse">
    <div className="h-48 bg-slate-200"></div>
    <div className="p-6 space-y-3">
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-slate-200 rounded w-full"></div>
        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
      </div>
      <div className="h-10 bg-slate-200 rounded-lg mt-4"></div>
    </div>
  </div>
);

export const GridSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const LoadingSkeleton = ({ lines = 4 }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-3 bg-slate-200 rounded" style={{ width: `${85 - i * 10}%` }}></div>
    ))}
  </div>
);

export const NoticeSkeleton = () => (
  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-3">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-slate-200 rounded w-24"></div>
      <div className="h-3 bg-slate-200 rounded w-20"></div>
    </div>
    <div className="h-5 bg-slate-200 rounded w-2/3"></div>
    <div className="h-3 bg-slate-200 rounded w-full"></div>
    <div className="h-3 bg-slate-200 rounded w-4/5"></div>
  </div>
);

