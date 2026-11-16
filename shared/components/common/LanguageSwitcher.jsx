import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * LanguageSwitcher Component
 * Allows users to toggle between Marathi (मराठी) and English (EN) instantly.
 * Designed to sit beside the Enquiry button in Header and Mobile Navigation.
 */
export const LanguageSwitcher = ({ className = '', compact = false }) => {
  const { language, setLanguage } = useLanguage();

  const handleSelect = (e, lang) => {
    e.preventDefault();
    e.stopPropagation();
    setLanguage(lang);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={(e) => handleSelect(e, language === 'mr' ? 'en' : 'mr')}
        className={`notranslate h-8 sm:h-8.5 inline-flex items-center justify-center gap-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] sm:text-xs font-semibold transition-all border border-slate-200 whitespace-nowrap shrink-0 cursor-pointer select-none ${className}`}
        title={language === 'mr' ? 'Switch to English' : 'मराठी भाषेत पहा'}
        aria-label="भाषा बदला / Change Language"
        translate="no"
      >
        <Globe className="w-3.5 h-3.5 text-gurukul-saffron-600 shrink-0" />
        <span className="notranslate font-semibold" translate="no">{language === 'mr' ? 'EN' : 'मराठी'}</span>
      </button>
    );
  }

  return (
    <div 
      className={`notranslate h-8 sm:h-8.5 inline-flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200/90 shadow-xs shrink-0 select-none ${className}`}
      role="group"
      aria-label="Language Selector"
      translate="no"
    >
      <button
        type="button"
        onClick={(e) => handleSelect(e, 'mr')}
        className={`notranslate h-full inline-flex items-center justify-center px-2 py-0.5 rounded-md transition-all whitespace-nowrap cursor-pointer text-[11px] sm:text-xs font-semibold ${
          language === 'mr'
            ? 'bg-gurukul-navy-950 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
        title="मराठी भाषा"
        aria-pressed={language === 'mr'}
        translate="no"
        lang="mr"
      >
        <span className="notranslate" translate="no">मराठी</span>
      </button>
      
      <button
        type="button"
        onClick={(e) => handleSelect(e, 'en')}
        className={`notranslate h-full inline-flex items-center justify-center px-2 py-0.5 rounded-md transition-all whitespace-nowrap cursor-pointer text-[11px] sm:text-xs font-semibold ${
          language === 'en'
            ? 'bg-gurukul-navy-950 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
        title="English Language"
        aria-pressed={language === 'en'}
        translate="no"
        lang="en"
      >
        <span className="notranslate" translate="no">EN</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
