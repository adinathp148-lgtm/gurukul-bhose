import React from 'react';
import { ZoomIn } from 'lucide-react';

export const GalleryCard = ({ item, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative rounded-2xl overflow-hidden shadow-sm aspect-square bg-slate-100 cursor-pointer border border-slate-200"
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gurukul-saffron-400">
          {item.category}
        </span>
        <h4 className="text-xs font-bold text-white mt-1 line-clamp-2">
          {item.title}
        </h4>
        {item.caption && (
          <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
            {item.caption}
          </p>
        )}
        <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-yellow-300">
          <ZoomIn className="w-3.5 h-3.5" />
          <span>मोठे करून पहा (Expand)</span>
        </div>
      </div>
    </div>
  );
};
