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
        className={`notranslate h-10 inline-flex items-center justify-center gap-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 whitespace-nowrap shrink-0 cursor-pointer select-none ${className}`}
        title={language === 'mr' ? 'Switch to English' : 'मराठी भाषेत पहा'}
        aria-label="भाषा बदला / Change Language"
        translate="no"
      >
        <Globe className="w-4 h-4 text-gurukul-saffron-600 shrink-0" />
        <span className="notranslate font-bold" translate="no">{language === 'mr' ? 'EN' : 'मराठी'}</span>
      </button>
    );
  }

  return (
    <div 
      className={`notranslate h-10 inline-flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200/90 shadow-xs shrink-0 select-none ${className}`}
      role="group"
      aria-label="Language Selector"
      translate="no"
    >
      <button
        type="button"
        onClick={(e) => handleSelect(e, 'mr')}
        className={`notranslate h-full inline-flex items-center justify-center px-3 rounded-md transition-all whitespace-nowrap cursor-pointer text-xs 2xl:text-sm font-bold ${
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
        className={`notranslate h-full inline-flex items-center justify-center px-2.5 rounded-md transition-all whitespace-nowrap cursor-pointer text-xs 2xl:text-sm font-bold ${
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
