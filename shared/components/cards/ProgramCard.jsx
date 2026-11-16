import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext';

export const ProgramCard = ({ program }) => {
  const { isMarathi } = useLanguage();

  const progMap = {
    vidyamandir: {
      title: 'Gurukul Vidyamandir (5th to 10th)',
      shortDesc: 'Sainik Pattern Residential Marathi & Semi-English Medium School',
      category: 'School Education'
    },
    'junior-college': {
      title: 'Gurukul Junior College (11th & 12th)',
      shortDesc: 'Sainik Pattern Residential Arts & Science Junior College',
      category: 'Junior College'
    },
    'talent-search': {
      title: 'Gurukul Residential Talent Search Academy',
      shortDesc: 'Specialized Competitive Exam & Scholarship Academy',
      category: 'Special Academy'
    },
    'science-academy': {
      title: 'Gurukul Residential Science Academy',
      shortDesc: 'NEET, JEE, PCMB, NDA & MHT-CET Foundation Academy',
      category: 'Science Academy'
    },
    'computer-institute': {
      title: 'Gurukul Computer Institute',
      shortDesc: 'MS-CIT, Tally Prime ERP & Typing Training',
      category: 'Computer Training'
    },
    'sports-academy': {
      title: 'Gurukul Sports & Defence Academy',
      shortDesc: 'Running Track, Obstacle Training, Karate & Rifle Shooting',
      category: 'Sports & Defence'
    }
  };

  const enInfo = progMap[program.id];
  const displayTitle = isMarathi ? program.title : (enInfo?.title || program.title);
  const displayShortDesc = isMarathi ? program.shortDesc : (enInfo?.shortDesc || program.shortDesc);
  const displayCategory = isMarathi ? program.category : (enInfo?.category || program.category);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      <div className="h-48 overflow-hidden relative bg-slate-100">
        <img
          src={program.image || program.imageUrl}
          alt={displayTitle}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
        {displayCategory && (
          <span className="absolute bottom-3 left-4 text-[11px] font-bold bg-gurukul-saffron-500 text-white px-2.5 py-1 rounded shadow-sm">
            {displayCategory}
          </span>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gurukul-navy-900 group-hover:text-gurukul-saffron-600 transition-colors">
            {displayTitle}
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {displayShortDesc}
          </p>

          <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3">
            {program.fullDesc}
          </p>

          {program.highlights && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
              {program.highlights.slice(0, 3).map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{h}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
          <Link
            to={program.slug}
            className="text-xs font-bold text-gurukul-navy-900 hover:text-gurukul-saffron-600 flex items-center gap-1"
          >
            <span>{isMarathi ? 'सविस्तर वाचा' : 'Read More'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link to="/admission-enquiry">
            <Button variant="primary" size="sm">
              {isMarathi ? 'प्रवेश चौकशी' : 'Apply'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
