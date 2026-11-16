import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Award } from 'lucide-react';
import { Button } from '../common/Button';

export const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="h-44 overflow-hidden relative bg-slate-100">
          <img
            src={course.imageUrl}
            alt={course.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
          <span className="absolute bottom-3 left-4 text-[10px] font-bold uppercase tracking-wider bg-gurukul-saffron-500 text-white px-2 py-0.5 rounded shadow">
            {course.category}
          </span>
          <span className="absolute bottom-3 right-4 text-[10px] font-bold bg-black/60 text-yellow-300 px-2 py-0.5 rounded backdrop-blur-sm">
            {course.pattern}
          </span>
        </div>

        <div className="p-6">
          <h3 className="text-base font-bold text-gurukul-navy-900 group-hover:text-gurukul-saffron-600 transition-colors line-clamp-2">
            {course.title}
          </h3>

          <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
            {course.description}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gurukul-saffron-500" />
              <span className="truncate">{course.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate">{course.programName}</span>
            </div>
          </div>

          {course.features && (
            <div className="mt-3 space-y-1.5">
              {course.features.slice(0, 2).map((feat, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 pt-0 flex items-center justify-between gap-3">
        <Link
          to={`/courses/${course.slug || course.id}`}
          className="text-xs font-bold text-gurukul-navy-900 hover:text-gurukul-saffron-600 flex items-center gap-1"
        >
          <span>अभ्यासक्रम तपशील</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link to="/admission-enquiry">
          <Button variant="primary" size="sm">
            Apply Now
          </Button>
        </Link>
      </div>
    </div>
  );
};
