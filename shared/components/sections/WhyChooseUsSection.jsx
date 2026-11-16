import React from 'react';
import { CheckCircle2, Download, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { useLanguage, translations } from '../../contexts/LanguageContext';

export const WhyChooseUsSection = ({ features = [], brochureUrl = 'https://bit.ly/3mUeaH6' }) => {
  const { isMarathi } = useLanguage();
  const dualFeatures = translations.whyChooseUs?.features || [];

  return (
    <section className="bg-gradient-to-br from-gurukul-navy-900 to-gurukul-navy-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-400 block">
          {isMarathi ? 'आमची वैशिष्ट्ये (Why Choose Gurukul Bhose)' : 'Key Highlights (Why Choose Gurukul Bhose)'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black mt-2">
          {isMarathi ? 'सैनिक पॅटर्न निवासी शिक्षणाची प्रमुख वैशिष्ट्ये' : 'Key Pillars of Sainik Pattern Residential Education'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2">
          {isMarathi 
            ? 'नो डोनेशन • थेट प्रवेश • रोज सकाळ-संध्याकाळ ग्राऊंड • बारावी नंतर हमखास सरकारी नोकरी'
            : 'No Donation • Direct Admission • Daily Ground Drills • Assured Government Jobs After 12th'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-200">
        {dualFeatures.map((item, idx) => (
          <div 
            key={idx} 
            className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <CheckCircle2 className="w-5 h-5 text-gurukul-saffron-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              {isMarathi ? item.mr : item.en}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <ShieldCheck className="w-5 h-5 text-gurukul-saffron-400" />
          <span>{isMarathi ? '१५ वर्षांची गौरवशाली शैक्षणिक व क्रीडा परंपरा' : '15 Years of Glorious Academic & Sports Heritage'}</span>
        </div>

        <a href={brochureUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="primary" size="md" className="shadow-lg">
            <Download className="w-4 h-4 mr-2" />
            <span>{isMarathi ? 'अधिकृत माहिती पत्रक डाऊनलोड करा (PDF)' : 'Download Official Information Brochure (PDF)'}</span>
          </Button>
        </a>
      </div>
    </section>
  );
};

