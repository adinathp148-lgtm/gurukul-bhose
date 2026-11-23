import React, { useState } from 'react';
import { Play, Calendar } from 'lucide-react';

export const VideoCard = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const ytId = video.youtubeVideoId || video.embedId || video.youtubeId || '';
  const embedUrl = video.embedUrl || (ytId ? `https://www.youtube.com/embed/${ytId}` : (video.youtubeUrl ? video.youtubeUrl.replace('watch?v=', 'embed/') : ''));
  const thumbnailUrl = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '';

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      <div className="aspect-video w-full bg-slate-900 relative overflow-hidden">
        {embedUrl && isPlaying ? (
          <iframe
            src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : embedUrl ? (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={`Play video: ${video.title}`}
            className="w-full h-full relative flex items-center justify-center group/play cursor-pointer bg-slate-900"
          >
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt={video.title}
                loading="lazy"
                decoding="async"
                width="480"
                height="360"
                className="w-full h-full object-cover opacity-85 group-hover/play:opacity-100 group-hover/play:scale-105 transition-all duration-300"
              />
            )}
            <span className="absolute inset-0 bg-black/25 group-hover/play:bg-black/15 transition-colors" />
            <span className="relative z-10 w-14 h-14 rounded-full bg-gurukul-saffron-600/95 group-hover/play:bg-gurukul-saffron-700 text-white flex items-center justify-center shadow-xl transition-transform group-hover/play:scale-110">
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </span>
          </button>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-semibold">
            व्हिडिओ पूर्वावलोकन (Video Preview)
          </div>
        )}
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
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
              {video.description}
            </p>
          )}
        </div>

        {video.publishedDate && (
          <div className="flex items-center gap-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
            <Calendar className="w-3 h-3" />
            <span>{video.publishedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};
