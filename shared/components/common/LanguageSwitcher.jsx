import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * LanguageSwitcher Component
 * Features an Earth (Globe) icon button that opens a dropdown to select
 * between Marathi (मराठी) and English (EN), applied universally across
 * Desktop Navbar, Mobile Navbar, Admin Panel, and Telecaller Panel.
 */
export const LanguageSwitcher = ({ className = '', compact = false }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const handleSelectLanguage = (e, lang) => {
    e.preventDefault();
    e.stopPropagation();
    setLanguage(lang);
    setIsOpen(false);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentLabel = language === 'mr' ? 'मराठी' : (compact ? 'EN' : 'English');

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center notranslate select-none ${className}`}
      translate="no"
    >
      {/* Trigger Button with Earth (Globe) Icon */}
      <button
        type="button"
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${currentLabel} — भाषा बदला / Change Language`}
        title="भाषा बदला / Change Language"
        className={`h-8 sm:h-8.5 inline-flex items-center justify-center gap-1.5 px-2 sm:px-2.5 rounded-lg text-xs font-semibold transition-all border shadow-2xs whitespace-nowrap cursor-pointer ${
          isOpen
            ? 'bg-orange-50 text-gurukul-saffron-700 border-gurukul-saffron-300 ring-2 ring-gurukul-saffron-100'
            : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gurukul-saffron-600 shrink-0" />
        <span className="notranslate font-semibold" translate="no">
          {currentLabel}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-gurukul-saffron-600' : ''
          }`}
        />
      </button>

      {/* Language Options Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Language selection"
          className="absolute right-0 top-full mt-1.5 w-44 sm:w-48 bg-white rounded-xl shadow-xl border border-slate-200/90 p-1.5 z-[70] animate-in fade-in zoom-in-95 duration-150 text-left"
        >
          {/* Header */}
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 mb-1">
            <Globe className="w-3 h-3 text-gurukul-saffron-500 shrink-0" />
            <span>भाषा निवडा / Language</span>
          </div>

          {/* Option 1: Marathi */}
          <button
            type="button"
            role="option"
            aria-selected={language === 'mr'}
            onClick={(e) => handleSelectLanguage(e, 'mr')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-all text-left cursor-pointer ${
              language === 'mr'
                ? 'bg-orange-50 text-gurukul-saffron-700 font-bold border border-orange-200/70'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
            translate="no"
          >
            <div className="flex flex-col">
              <span className="notranslate font-bold text-xs" translate="no">मराठी</span>
              <span className="text-[10px] text-slate-400 font-normal">मराठी भाषा</span>
            </div>
            {language === 'mr' && (
              <Check className="w-4 h-4 text-gurukul-saffron-600 shrink-0 ml-2" />
            )}
          </button>

          {/* Option 2: English */}
          <button
            type="button"
            role="option"
            aria-selected={language === 'en'}
            onClick={(e) => handleSelectLanguage(e, 'en')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-all text-left cursor-pointer mt-0.5 ${
              language === 'en'
                ? 'bg-orange-50 text-gurukul-saffron-700 font-bold border border-orange-200/70'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
            translate="no"
          >
            <div className="flex flex-col">
              <span className="notranslate font-bold text-xs" translate="no">English</span>
              <span className="text-[10px] text-slate-400 font-normal">इंग्रजी भाषा</span>
            </div>
            {language === 'en' && (
              <Check className="w-4 h-4 text-gurukul-saffron-600 shrink-0 ml-2" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
