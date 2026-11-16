import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Download, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  BookOpen,
  GraduationCap,
  Award,
  FlaskConical,
  Activity,
  Monitor,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import { useCMS } from '../../contexts/CMSContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

export const Navbar = ({ showAdminLink = false }) => {
  const { institution, websiteSettings } = useCMS();
  const { currentUser, role } = useAuth();
  const { language, isMarathi } = useLanguage();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isAcademicsActive = [
    '/vidyamandir',
    '/junior-college',
    '/gurukul-vidyamandir',
    '/gurukul-junior-college',
    '/talent-search-academy',
    '/science-academy',
    '/sports-academy',
    '/computer-institute'
  ].includes(location.pathname);
  const isGalleryActive = location.pathname === '/gallery' || location.pathname === '/videos';

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setAcademicsOpen(false);
    setGalleryOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm transition-all">
      {/* 0. Dynamic Website Announcement Bar */}
      {websiteSettings?.announcementBar?.enabled && websiteSettings?.announcementBar?.text && (
        <div className="bg-gradient-to-r from-gurukul-saffron-600 to-gurukul-saffron-500 text-white text-xs sm:text-sm py-2 px-4 font-semibold shadow-xs flex items-center justify-center text-center gap-2 flex-wrap">
          <span className="leading-tight text-center">{websiteSettings.announcementBar.text}</span>
          {websiteSettings.announcementBar.linkUrl && (
            <Link 
              to={websiteSettings.announcementBar.linkUrl} 
              className="underline text-yellow-200 hover:text-white font-bold inline-flex items-center gap-1 shrink-0 text-center leading-tight"
            >
              <span>{websiteSettings.announcementBar.linkText || 'अधिक वाचा →'}</span>
            </Link>
          )}
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-10">
        <div className="flex items-center justify-between h-20 gap-3 2xl:gap-6">
          
          {/* Logo & Identity */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 py-1 text-left">
            <img 
              src={websiteSettings?.logoUrl && websiteSettings.logoUrl !== '/favicon.svg' ? websiteSettings.logoUrl : '/gurukul-logo.png'} 
              alt="गुरुकुल भोसे Logo" 
              className="w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 object-contain group-hover:scale-105 transition-transform shrink-0 drop-shadow-sm" 
            />
            <div className="shrink-0 flex flex-col justify-center text-left">
              <span className="block font-black text-base sm:text-lg md:text-xl 2xl:text-2xl text-gurukul-navy-900 leading-tight tracking-tight whitespace-nowrap text-left">
                {isMarathi ? 'गुरुकुल भोसे' : 'Gurukul Bhose'}
              </span>
              <span className="hidden sm:block text-[11px] sm:text-xs md:text-[13px] 2xl:text-sm font-bold text-gurukul-saffron-600 whitespace-nowrap leading-tight mt-0.5 text-left">
                {isMarathi ? 'विद्यामंदिर व ज्युनिअर कॉलेज (सैनिक पॅटर्न निवासी)' : 'Vidyamandir & Junior College (Sainik Pattern Residential)'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 2xl:gap-2 font-semibold text-[13px] 2xl:text-sm text-slate-800">
            <Link 
              to="/" 
              className={`h-10 inline-flex items-center justify-center px-3 2xl:px-3.5 rounded-lg whitespace-nowrap transition-colors ${
                isActive('/') ? 'text-gurukul-saffron-600 font-bold bg-orange-50' : 'hover:text-gurukul-saffron-600 hover:bg-slate-50'
              }`}
            >
              <span>{isMarathi ? 'मुख्यपृष्ठ' : 'Home'}</span>
            </Link>

            <Link 
              to="/about" 
              className={`h-10 inline-flex items-center justify-center px-3 2xl:px-3.5 rounded-lg whitespace-nowrap transition-colors ${
                isActive('/about') ? 'text-gurukul-saffron-600 font-bold bg-orange-50' : 'hover:text-gurukul-saffron-600 hover:bg-slate-50'
              }`}
            >
              <span>{isMarathi ? 'आमच्याबद्दल' : 'About Us'}</span>
            </Link>

            {/* Academics Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAcademicsOpen(!academicsOpen);
                  setGalleryOpen(false);
                }}
                onMouseEnter={() => {
                  setAcademicsOpen(true);
                  setGalleryOpen(false);
                }}
                className={`h-10 inline-flex items-center justify-center gap-1.5 px-3 2xl:px-3.5 rounded-lg whitespace-nowrap transition-colors ${
                  isAcademicsActive ? 'text-gurukul-saffron-600 font-bold bg-orange-50' : 'hover:text-gurukul-saffron-600 hover:bg-slate-50'
                }`}
              >
                <span>{isMarathi ? 'शैक्षणिक' : 'Academics'}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${academicsOpen ? 'rotate-180' : ''}`} />
              </button>

              {academicsOpen && (
                <div 
                  onMouseLeave={() => setAcademicsOpen(false)}
                  className="absolute left-0 mt-1 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 text-left"
                >
                  <Link
                    to="/vidyamandir"
                    onClick={closeMenu}
                    className="flex items-start gap-3.5 px-4 py-2.5 hover:bg-orange-50/70 transition-colors text-left group"
                  >
                    <BookOpen className="w-5 h-5 text-gurukul-saffron-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="text-left flex-1 min-w-0">
                      <span className="block font-bold text-sm text-slate-900 group-hover:text-gurukul-saffron-600 transition-colors whitespace-nowrap">
                        {isMarathi ? 'गुरुकुल विद्यामंदिर' : 'Gurukul Vidyamandir'}
                      </span>
                      <span className="block text-xs text-slate-500 font-medium mt-0.5 whitespace-nowrap">
                        {isMarathi ? 'इ. ५ वी ते १० वी (मराठी व सेमी)' : '5th to 10th (Marathi & Semi)'}
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/junior-college"
                    onClick={closeMenu}
                    className="flex items-start gap-3.5 px-4 py-2.5 hover:bg-orange-50/70 border-t border-slate-100/60 transition-colors text-left group"
                  >
                    <GraduationCap className="w-5 h-5 text-gurukul-navy-900 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="text-left flex-1 min-w-0">
                      <span className="block font-bold text-sm text-slate-900 group-hover:text-gurukul-saffron-600 transition-colors whitespace-nowrap">
                        {isMarathi ? 'गुरुकुल जुनियर कॉलेज' : 'Gurukul Junior College'}
                      </span>
                      <span className="block text-xs text-slate-500 font-medium mt-0.5 whitespace-nowrap">
                        {isMarathi ? 'इ. ११ वी १२ वी (आर्टस् व सायन्स)' : '11th & 12th (Arts & Science)'}
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/talent-search-academy"
                    onClick={closeMenu}
                    className="flex items-start gap-3.5 px-4 py-2.5 hover:bg-orange-50/70 border-t border-slate-100/60 transition-colors text-left group"
                  >
                    <Award className="w-5 h-5 text-gurukul-saffron-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="text-left flex-1 min-w-0">
                      <span className="block font-bold text-sm text-slate-900 group-hover:text-gurukul-saffron-600 transition-colors whitespace-nowrap">
                        {isMarathi ? 'टॅलेंट सर्च अकॅडमी' : 'Talent Search Academy'}
                      </span>
                      <span className="block text-xs text-slate-500 font-medium mt-0.5 whitespace-nowrap">
                        {isMarathi ? 'स्कॉलरशिप, नवोदय, सैनिक स्कूल' : 'Scholarship, Navodaya, Sainik School'}
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/science-academy"
                    onClick={closeMenu}
                    className="flex items-start gap-3.5 px-4 py-2.5 hover:bg-orange-50/70 border-t border-slate-100/60 transition-colors text-left group"
                  >
                    <FlaskConical className="w-5 h-5 text-purple-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="text-left flex-1 min-w-0">
                      <span className="block font-bold text-sm text-slate-900 group-hover:text-gurukul-saffron-600 transition-colors whitespace-nowrap">
                        {isMarathi ? 'सायन्स अकॅडमी' : 'Science Academy'}
                      </span>
                      <span className="block text-xs text-slate-500 font-medium mt-0.5 whitespace-nowrap">
                        NEET, JEE, PCMB, NDA & CET
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/sports-academy"
                    onClick={closeMenu}
                    className="flex items-start gap-3.5 px-4 py-2.5 hover:bg-orange-50/70 border-t border-slate-100/60 transition-colors text-left group"
                  >
                    <Activity className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="text-left flex-1 min-w-0">
                      <span className="block font-bold text-sm text-slate-900 group-hover:text-gurukul-saffron-600 transition-colors whitespace-nowrap">
                        {isMarathi ? 'स्पोर्ट्स व डिफेन्स अकॅडमी' : 'Sports & Defence Academy'}
                      </span>
                      <span className="block text-xs text-slate-500 font-medium mt-0.5 whitespace-nowrap">
                        {isMarathi ? 'रनिंग ट्रॅक, रायफल शूटिंग, कराटे, योगा' : 'Running Track, Rifle Shooting, Karate, Yoga'}
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/computer-institute"
                    onClick={closeMenu}
                    className="flex items-start gap-3.5 px-4 py-2.5 hover:bg-orange-50/70 border-t border-slate-100/60 transition-colors text-left group"
                  >
                    <Monitor className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="text-left flex-1 min-w-0">
                      <span className="block font-bold text-sm text-slate-900 group-hover:text-gurukul-saffron-600 transition-colors whitespace-nowrap">
                        {isMarathi ? 'गुरुकुल कम्प्युटर इन्स्टिट्यूट' : 'Gurukul Computer Institute'}
                      </span>
                      <span className="block text-xs text-slate-500 font-medium mt-0.5 whitespace-nowrap">
                        {isMarathi ? 'MSCIT, Tally, मराठी, इंग्रजी टायपिंग कोर्सची सोय.' : 'MSCIT, Tally, Marathi & English Typing Courses'}
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link 
              to="/courses" 
              className={`h-10 inline-flex items-center justify-center px-3 2xl:px-3.5 rounded-lg whitespace-nowrap transition-colors ${
                isActive('/courses') ? 'text-gurukul-saffron-600 font-bold bg-orange-50' : 'hover:text-gurukul-saffron-600 hover:bg-slate-50'
              }`}
            >
              <span>{isMarathi ? 'अभ्यासक्रम' : 'Courses'}</span>
            </Link>

            {/* Gallery Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setGalleryOpen(!galleryOpen);
                  setAcademicsOpen(false);
                }}
                onMouseEnter={() => {
                  setGalleryOpen(true);
                  setAcademicsOpen(false);
                }}
                className={`h-10 inline-flex items-center justify-center gap-1.5 px-3 2xl:px-3.5 rounded-lg whitespace-nowrap transition-colors ${
                  isGalleryActive ? 'text-gurukul-saffron-600 font-bold bg-orange-50' : 'hover:text-gurukul-saffron-600 hover:bg-slate-50'
                }`}
              >
                <span>{isMarathi ? 'गॅलरी' : 'Gallery'}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${galleryOpen ? 'rotate-180' : ''}`} />
              </button>

              {galleryOpen && (
                <div 
                  onMouseLeave={() => setGalleryOpen(false)}
                  className="absolute left-0 mt-1 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 text-left"
                >
                  <Link
                    to="/gallery"
                    onClick={closeMenu}
                    className="flex items-start gap-3.5 px-4 py-2.5 hover:bg-orange-50/70 transition-colors text-left group"
                  >
                    <ImageIcon className="w-5 h-5 text-gurukul-saffron-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="text-left flex-1 min-w-0">
                      <span className="block font-bold text-sm text-slate-900 group-hover:text-gurukul-saffron-600 transition-colors whitespace-nowrap">
                        {isMarathi ? 'फोटो गॅलरी (Photos)' : 'Photo Gallery (Photos)'}
                      </span>
                      <span className="block text-xs text-slate-500 font-medium mt-0.5 whitespace-nowrap">
                        {isMarathi ? 'कॅम्पस, स्नेहसंमेलन व उपक्रम क्षणचित्रे' : 'Campus, Gatherings & Activities Photos'}
                      </span>
                    </div>
                  </Link>
                  <Link
                    to="/videos"
                    onClick={closeMenu}
                    className="flex items-start gap-3.5 px-4 py-2.5 hover:bg-orange-50/70 border-t border-slate-100/60 transition-colors text-left group"
                  >
                    <Video className="w-5 h-5 text-red-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="text-left flex-1 min-w-0">
                      <span className="block font-bold text-sm text-slate-900 group-hover:text-gurukul-saffron-600 transition-colors whitespace-nowrap">
                        {isMarathi ? 'व्हिडिओ गॅलरी (Videos)' : 'Video Gallery (Videos)'}
                      </span>
                      <span className="block text-xs text-slate-500 font-medium mt-0.5 whitespace-nowrap">
                        {isMarathi ? 'कॅम्पस टूअर, वृत्त व सांस्कृतिक व्हिडिओ' : 'Campus Tour, News & Cultural Videos'}
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link 
              to="/notices" 
              className={`h-10 inline-flex items-center justify-center px-3 2xl:px-3.5 rounded-lg whitespace-nowrap transition-colors ${
                isActive('/notices') ? 'text-gurukul-saffron-600 font-bold bg-orange-50' : 'hover:text-gurukul-saffron-600 hover:bg-slate-50'
              }`}
            >
              <span>{isMarathi ? 'सूचना पत्रक' : 'Notices'}</span>
            </Link>

            <Link 
              to="/contact" 
              className={`h-10 inline-flex items-center justify-center px-3 2xl:px-3.5 rounded-lg whitespace-nowrap transition-colors ${
                isActive('/contact') ? 'text-gurukul-saffron-600 font-bold bg-orange-50' : 'hover:text-gurukul-saffron-600 hover:bg-slate-50'
              }`}
            >
              <span>{isMarathi ? 'संपर्क' : 'Contact'}</span>
            </Link>
          </nav>

          {/* Action CTAs (Right-aligned, cleanly centered buttons) */}
          <div className="hidden xl:flex items-center gap-2 2xl:gap-3 shrink-0">
            {showAdminLink && (
              <a 
                href="//admin.gurukulbhose.com" 
                className="h-10 inline-flex items-center justify-center gap-1.5 px-3 text-xs 2xl:text-sm font-bold text-slate-700 hover:text-gurukul-navy-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                title="CRM पोर्टल (Staff Login)"
              >
                <ShieldCheck className="w-4 h-4 text-gurukul-saffron-600 shrink-0" />
                <span>CRM</span>
              </a>
            )}

            <a 
              href={institution.brochureUrl || '/gurukul-brochure.pdf'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-10 inline-flex items-center justify-center gap-1.5 px-3.5 text-xs 2xl:text-sm font-bold text-gurukul-navy-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4 text-gurukul-saffron-600 shrink-0" />
              <span>{isMarathi ? 'माहिती पत्रक' : 'Brochure'}</span>
            </a>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Apply Action Button */}
            <Link 
              to="/admission-enquiry" 
              className="h-10 inline-flex items-center justify-center gap-1.5 px-4 text-xs 2xl:text-sm font-bold text-white bg-gurukul-saffron-500 hover:bg-gurukul-saffron-600 rounded-lg shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
            >
              <span>
                {isMarathi ? 'प्रवेश अर्ज' : 'Apply Now'}
              </span>
            </Link>
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex xl:hidden items-center gap-2 shrink-0">
            <LanguageSwitcher compact />
            <Link 
              to="/admission-enquiry" 
              className="h-10 inline-flex items-center justify-center px-3.5 text-xs sm:text-sm font-bold text-white bg-gurukul-saffron-500 hover:bg-gurukul-saffron-600 rounded-lg whitespace-nowrap shrink-0 shadow-sm"
            >
              <span>{isMarathi ? 'प्रवेश अर्ज' : 'Apply'}</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 sm:h-10 sm:w-10 inline-flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none shrink-0"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 max-h-[85vh] overflow-y-auto shadow-xl text-left">
          {/* Mobile Language Switcher Bar */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-700 text-left">भाषा निवडा / Select Language:</span>
            <LanguageSwitcher />
          </div>

          <Link 
            to="/" 
            onClick={closeMenu}
            className={`flex items-center px-3 py-2.5 rounded-lg text-base font-semibold text-left transition-colors ${
              isActive('/') ? 'bg-orange-50 text-gurukul-saffron-600 font-bold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span className="text-left">{isMarathi ? 'मुख्यपृष्ठ' : 'Home'}</span>
          </Link>
          <Link 
            to="/about" 
            onClick={closeMenu}
            className={`flex items-center px-3 py-2.5 rounded-lg text-base font-semibold text-left transition-colors ${
              isActive('/about') ? 'bg-orange-50 text-gurukul-saffron-600 font-bold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span className="text-left">{isMarathi ? 'आमच्याबद्दल' : 'About Us'}</span>
          </Link>

          {/* Mobile Academics Group */}
          <div className="pt-2 pb-1 px-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
            {isMarathi ? 'Academics (शाळा व अकॅडमीज)' : 'Academics (School & Academies)'}
          </div>
          <Link 
            to="/vidyamandir" 
            onClick={closeMenu}
            className="flex items-center gap-2.5 pl-6 pr-3 py-2 text-sm font-semibold text-slate-700 hover:text-gurukul-saffron-600 hover:bg-orange-50/50 rounded-lg transition-colors text-left"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gurukul-saffron-500 shrink-0" />
            <span className="text-left">{isMarathi ? 'गुरुकुल विद्यामंदिर (५ वी ते १० वी)' : 'Gurukul Vidyamandir (5th to 10th)'}</span>
          </Link>
          <Link 
            to="/junior-college" 
            onClick={closeMenu}
            className="flex items-center gap-2.5 pl-6 pr-3 py-2 text-sm font-semibold text-slate-700 hover:text-gurukul-saffron-600 hover:bg-orange-50/50 rounded-lg transition-colors text-left"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gurukul-saffron-500 shrink-0" />
            <span className="text-left">{isMarathi ? 'गुरुकुल जुनियर कॉलेज (११ वी १२ वी)' : 'Gurukul Junior College (11th & 12th)'}</span>
          </Link>
          <Link 
            to="/talent-search-academy" 
            onClick={closeMenu}
            className="flex items-center gap-2.5 pl-6 pr-3 py-2 text-sm font-semibold text-slate-700 hover:text-gurukul-saffron-600 hover:bg-orange-50/50 rounded-lg transition-colors text-left"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gurukul-saffron-500 shrink-0" />
            <span className="text-left">{isMarathi ? 'टॅलेंट सर्च अकॅडमी (स्कॉलरशिप / नवोदय)' : 'Talent Search Academy (Scholarship / Navodaya)'}</span>
          </Link>
          <Link 
            to="/science-academy" 
            onClick={closeMenu}
            className="flex items-center gap-2.5 pl-6 pr-3 py-2 text-sm font-semibold text-slate-700 hover:text-gurukul-saffron-600 hover:bg-orange-50/50 rounded-lg transition-colors text-left"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gurukul-saffron-500 shrink-0" />
            <span className="text-left">{isMarathi ? 'सायन्स अकॅडमी (NEET / JEE / NDA)' : 'Science Academy (NEET / JEE / NDA)'}</span>
          </Link>
          <Link 
            to="/sports-academy" 
            onClick={closeMenu}
            className="flex items-center gap-2.5 pl-6 pr-3 py-2 text-sm font-semibold text-slate-700 hover:text-gurukul-saffron-600 hover:bg-orange-50/50 rounded-lg transition-colors text-left"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gurukul-saffron-500 shrink-0" />
            <span className="text-left">{isMarathi ? 'स्पोर्ट्स व डिफेन्स अकॅडमी' : 'Sports & Defence Academy'}</span>
          </Link>
          <Link 
            to="/computer-institute" 
            onClick={closeMenu}
            className="flex items-center gap-2.5 pl-6 pr-3 py-2 text-sm font-semibold text-slate-700 hover:text-gurukul-saffron-600 hover:bg-orange-50/50 rounded-lg transition-colors text-left"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gurukul-saffron-500 shrink-0" />
            <span className="text-left">{isMarathi ? 'गुरुकुल कम्प्युटर इन्स्टिट्यूट' : 'Gurukul Computer Institute'}</span>
          </Link>

          <Link 
            to="/courses" 
            onClick={closeMenu}
            className={`flex items-center px-3 py-2.5 rounded-lg text-base font-semibold text-left transition-colors ${
              isActive('/courses') ? 'bg-orange-50 text-gurukul-saffron-600 font-bold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span className="text-left">{isMarathi ? 'अभ्यासक्रम' : 'Courses'}</span>
          </Link>

          {/* Mobile Gallery Group */}
          <div className="pt-2 pb-1 px-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
            {isMarathi ? 'गॅलरी (Gallery & Videos)' : 'Media (Gallery & Videos)'}
          </div>
          <Link 
            to="/gallery" 
            onClick={closeMenu}
            className="flex items-center gap-2.5 pl-6 pr-3 py-2 text-sm font-semibold text-slate-700 hover:text-gurukul-saffron-600 hover:bg-orange-50/50 rounded-lg transition-colors text-left"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gurukul-saffron-500 shrink-0" />
            <span className="text-left">{isMarathi ? 'फोटो गॅलरी (Photos)' : 'Photo Gallery (Photos)'}</span>
          </Link>
          <Link 
            to="/videos" 
            onClick={closeMenu}
            className="flex items-center gap-2.5 pl-6 pr-3 py-2 text-sm font-semibold text-slate-700 hover:text-gurukul-saffron-600 hover:bg-orange-50/50 rounded-lg transition-colors text-left"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gurukul-saffron-500 shrink-0" />
            <span className="text-left">{isMarathi ? 'व्हिडिओ गॅलरी (Videos)' : 'Video Gallery (Videos)'}</span>
          </Link>
          <Link 
            to="/notices" 
            onClick={closeMenu}
            className={`flex items-center px-3 py-2.5 rounded-lg text-base font-semibold text-left transition-colors ${
              isActive('/notices') ? 'bg-orange-50 text-gurukul-saffron-600 font-bold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span className="text-left">{isMarathi ? 'सूचना पत्रक' : 'Notices'}</span>
          </Link>
          <Link 
            to="/contact" 
            onClick={closeMenu}
            className={`flex items-center px-3 py-2.5 rounded-lg text-base font-semibold text-left transition-colors ${
              isActive('/contact') ? 'bg-orange-50 text-gurukul-saffron-600 font-bold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span className="text-left">{isMarathi ? 'संपर्क' : 'Contact'}</span>
          </Link>
          <Link 
            to="/admission-enquiry" 
            onClick={closeMenu}
            className="flex items-center justify-center px-3 py-3 rounded-lg text-base font-bold bg-gurukul-saffron-500 hover:bg-gurukul-saffron-600 text-white text-center shadow-md transition-colors"
          >
            <span className="text-center">{isMarathi ? 'ऑनलाईन प्रवेश अर्ज करा (Apply Now)' : 'Apply Online for Admission'}</span>
          </Link>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link to="/admin/dashboard" onClick={closeMenu} className="font-bold text-gurukul-navy-900 flex items-center gap-1.5 text-left">
              <ShieldCheck className="w-4 h-4 text-gurukul-saffron-500 shrink-0" />
              <span>Staff / CRM Portal</span>
            </Link>
            <a href={institution.brochureUrl || '/gurukul-brochure.pdf'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gurukul-saffron-600 font-semibold">
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Brochure</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
