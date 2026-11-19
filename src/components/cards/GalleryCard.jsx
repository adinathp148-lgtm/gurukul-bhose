import React, { useState } from 'react';
import { ZoomIn, Eye } from 'lucide-react';

const FALLBACK_IMAGE = '/images/gallery/campus-slide-1.jpg';

const getCategoryBadge = (category) => {
  const c = (category || '').toLowerCase();
  if (c.includes('campus') || c.includes('कॅम्पस')) {
    return { label: 'कॅम्पस (Campus)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  }
  if (c.includes('activities') || c.includes('उपक्रम')) {
    return { label: 'उपक्रम (Activities)', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
  }
  if (c.includes('sports') || c.includes('क्रीडा')) {
    return { label: 'क्रीडा (Sports)', bg: 'bg-red-50 text-red-800 border-red-200' };
  }
  if (c.includes('gathering') || c.includes('स्नेहसंमेलन')) {
    return { label: 'स्नेहसंमेलन (Gathering)', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
  }
  if (c.includes('result') || c.includes('निकाल')) {
    return { label: 'निकाल (Result)', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
  }
  if (c.includes('yoga') || c.includes('योगा')) {
    return { label: 'योगा (Yoga)', bg: 'bg-orange-50 text-orange-800 border-orange-200' };
  }
  return { label: category || 'कॅम्पस', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
};

export const GalleryCard = ({ item, onSelect }) => {
  const [imgError, setImgError] = useState(false);
  const badge = getCategoryBadge(item.category);

  return (
    <div
      onClick={() => onSelect(item)}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer h-full"
    >
      {/* Photo Frame with fixed 4:3 Aspect Ratio for clean, uniform alignment */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
        <img
          src={imgError ? FALLBACK_IMAGE : (item.imageUrl || item.url || FALLBACK_IMAGE)}
          alt={item.title || 'गुरुकुल भोसे छायाचित्र'}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Subtle Dark Gradient Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-60 group-hover:opacity-30 transition-opacity" />

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-sm backdrop-blur-md ${badge.bg}`}>
            {badge.label}
          </span>
        </div>

        {/* Zoom Icon Button */}
        <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-85 group-hover:opacity-100 group-hover:bg-gurukul-saffron-500 transition-all shadow-md">
          <ZoomIn className="w-4 h-4" />
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-gurukul-saffron-600 transition-colors line-clamp-2 leading-snug">
            {item.title}
          </h4>
          {item.caption && (
            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              {item.caption}
            </p>
          )}
        </div>

        {/* Card Footer Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>छायाचित्र</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gurukul-saffron-600 group-hover:text-gurukul-saffron-700">
            <span>मोठे करा (Expand)</span>
            <ZoomIn className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
