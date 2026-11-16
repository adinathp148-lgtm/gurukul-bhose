import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext';

export const CTASection = ({
  title,
  subtitle,
  brochureUrl = "https://bit.ly/3mUeaH6",
  phone = "9850449800"
}) => {
  const { isMarathi } = useLanguage();

  const defaultTitle = isMarathi 
    ? "चालू शैक्षणिक वर्षासाठी प्रवेश सुरू!" 
    : "Admissions Open for Current Academic Session!";
  const defaultSubtitle = isMarathi 
    ? "इ. ५ वी ते १२ वी सैनिक पॅटर्न निवासी स्कूल व कॉलेज • थेट प्रवेश, नो डोनेशन" 
    : "5th to 12th Std. Sainik Pattern Residential School & College • Direct Admission, No Donation";

  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;

  return (
    <section className="bg-gradient-to-r from-gurukul-saffron-600 via-orange-600 to-gurukul-saffron-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-yellow-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>{isMarathi ? 'मर्यादित जागा शिल्लक (Limited Seats Available)' : 'Limited Seats Available - Apply Today'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
          {displayTitle}
        </h2>

        <p className="text-sm sm:text-base text-orange-100 font-medium max-w-2xl mx-auto">
          {displaySubtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link to="/admission-enquiry">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto bg-gurukul-navy-950 hover:bg-black text-white shadow-xl"
            >
              <span>{isMarathi ? 'ऑनलाईन प्रवेश नोंदणी / Apply Online' : 'Apply Online for Admission'}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>

          <a href={brochureUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-white text-slate-900 border-white hover:bg-slate-100"
            >
              <Download className="w-4 h-4 mr-1.5 text-gurukul-saffron-600" />
              <span>{isMarathi ? 'माहिती पत्रक (Brochure)' : 'Download Brochure'}</span>
            </Button>
          </a>

          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-white hover:underline px-3 py-2"
          >
            <Phone className="w-4 h-4" />
            <span>{phone}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
