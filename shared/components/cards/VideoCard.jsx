import React from 'react';
import { Play, Calendar } from 'lucide-react';

export const VideoCard = ({ video }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      <div className="aspect-video w-full bg-slate-900 relative">
        <iframe
          src={video.embedUrl}
          title={video.title}
          loading="lazy"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {video.category && (
            <span className="text-[10px] uppercase font-bold text-gurukul-saffron-600 block mb-1">
              {video.category}
            </span>
          )}
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-gurukul-saffron-600 transition-colors line-clamp-2">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {video.description}
            </p>
          )}
        </div>

        {video.publishedDate && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <Calendar className="w-3 h-3" />
            <span>{video.publishedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};
