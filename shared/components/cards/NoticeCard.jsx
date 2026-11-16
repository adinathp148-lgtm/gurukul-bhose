import React from 'react';
import { Calendar, Download, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../common/Button';

export const NoticeCard = ({ notice, onOpenModal }) => {
  return (
    <div
      className={`p-6 rounded-2xl border transition-all ${
        notice.isImportant
          ? 'bg-amber-50/60 border-amber-300 shadow-md ring-1 ring-amber-300/40'
          : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2">
          {notice.isImportant && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white tracking-wider animate-pulse">
              <AlertCircle className="w-3 h-3" /> महत्त्वाचे (Important)
            </span>
          )}
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {notice.category}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>तारीख: {notice.date || notice.publishedAt}</span>
        </div>
      </div>

      <h3 className="text-base font-bold text-gurukul-navy-900 leading-snug">
        {notice.title}
      </h3>

      <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
        {notice.description}
      </p>

      <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3 flex-wrap">
        {onOpenModal ? (
          <button
            onClick={() => onOpenModal(notice)}
            className="text-xs font-bold text-gurukul-navy-900 hover:text-gurukul-saffron-600 flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5 text-gurukul-saffron-500" />
            <span>संपूर्ण सूचना वाचा (Read More)</span>
          </button>
        ) : (
          <div></div>
        )}

        {notice.downloadLink && (
          <a
            href={notice.downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gurukul-saffron-600 hover:text-gurukul-saffron-700 hover:underline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{notice.pdfName || 'परिपत्रक डाऊनलोड करा (PDF)'}</span>
          </a>
        )}
      </div>
    </div>
  );
};
