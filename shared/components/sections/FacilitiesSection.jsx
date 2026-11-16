import React from 'react';
import { Shield, Home, Utensils, Activity, FlaskConical, BookOpen } from 'lucide-react';
import { useLanguage, translations } from '../../contexts/LanguageContext';

const iconMap = {
  Shield: Shield,
  Home: Home,
  Utensils: Utensils,
  Activity: Activity,
  FlaskConical: FlaskConical,
  BookOpen: BookOpen
};

export const FacilitiesSection = ({ facilities = [] }) => {
  const { isMarathi } = useLanguage();
  const facilityLookup = {};
  (translations.facilities?.items || []).forEach(f => {
    facilityLookup[f.id] = f;
  });

  return (
    <section className="space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
          {isMarathi ? 'कॅम्पस सुविधा (Our Facilities)' : 'Campus Infrastructure & Facilities'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
          {isMarathi 
            ? 'विद्यार्थ्यांच्या सर्वांगीण विकासासाठी अत्याधुनिक पायाभूत सुविधा' 
            : 'Cutting-Edge Infrastructure for Comprehensive Student Development'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          {isMarathi 
            ? '४ एकर निसर्गरम्य परिसर, सुरक्षित वसतिगृह, क्रीडांगण व सकस आहार' 
            : '4-acre scenic safe campus, secure hostels, sports ground and hygienic nutritious meals'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((fac) => {
          const Icon = iconMap[fac.icon] || Shield;
          const facKey = fac.id || fac.facilityId || fac.title;
          const tr = facilityLookup[facKey] || facilityLookup[fac.id];
          const displayTitle = isMarathi ? fac.title : (tr?.title?.en || fac.title);
          const displayDesc = isMarathi ? fac.description : (tr?.desc?.en || fac.description);
          const imageSrc = fac.imageUrl || fac.image;

          return (
            <div
              key={facKey}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              {imageSrc && (
                <div className="h-44 overflow-hidden relative bg-slate-100">
                  <img
                    src={imageSrc}
                    alt={displayTitle}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 w-9 h-9 rounded-xl bg-gurukul-saffron-500 text-white flex items-center justify-center shadow">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-gurukul-navy-900 group-hover:text-gurukul-saffron-600 transition-colors">
                    {displayTitle}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {displayDesc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
