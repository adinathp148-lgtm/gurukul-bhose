import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
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
  Video,
  Headset,
  LogIn
} from 'lucide-react';
import { useCMS } from '../../contexts/CMSContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { getAdminPanelUrl, getTelecallerPanelUrl } from '../../services/navigation/navigationUrls';

export const Navbar = ({ showAdminLink = true }) => {
  const { institution, websiteSettings } = useCMS();
  const { currentUser, role } = useAuth();
  const { language, isMarathi } = useLanguage();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [crmOpen, setCrmOpen] = useState(false);

  const adminBaseUrl = getAdminPanelUrl();
  const telecallerBaseUrl = getTelecallerPanelUrl();

  const crmUrls = {
    admin: `${adminBaseUrl}/admin/leads`,
    telecaller: `${telecallerBaseUrl}/leads`,
    login: `${adminBaseUrl}/admin/login`
  };

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
    setCrmOpen(false);
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
      <div className="w-full px-3 sm:px-5 lg:px-6 2xl:px-8">
        <div className="flex items-center justify-between h-16 sm:h-17 lg:h-18 gap-2 xl:gap-3 2xl:gap-6">
          
          {/* Logo & Identity */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0 py-1 text-left">
            <img 
              src={websiteSettings?.logoUrl && websiteSettings.logoUrl !== '/favicon.svg' ? websiteSettings.logoUrl : '/gurukul-logo.png'} 
              alt="गुरुकुल भोसे Logo" 
              className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 object-contain group-hover:scale-105 transition-transform shrink-0 drop-shadow-xs" 
            />
            <div className="shrink-0 flex flex-col justify-center text-left">
              <span className="block font-black text-base sm:text-[17px] lg:text-lg text-gurukul-navy-950 leading-tight tracking-tight whitespace-nowrap text-left">
                {isMarathi ? 'गुरुकुल भोसे' : 'Gurukul Bhose'}
              </span>
              <span className="hidden sm:block text-[10px] xl:text-[11px] font-semibold text-gurukul-saffron-600 whitespace-nowrap leading-tight mt-0.5 text-left">
                {isMarathi ? 'विद्यामंदिर व ज्युनिअर कॉलेज (सैनिक पॅटर्न निवासी)' : 'Sainik Pattern Residential School & College'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 2xl:gap-1.5 text-[13px] 2xl:text-sm font-semibold text-slate-700">
            <Link 
              to="/" 
              className={`h-8 sm:h-8.5 inline-flex items-center justify-center px-2.5 rounded-lg whitespace-nowrap transition-all ${
                isActive('/') 
                  ? 'text-gurukul-saffron-600 font-bold bg-orange-50/90 border border-orange-200/60 shadow-2xs' 
                  : 'text-slate-700 hover:text-gurukul-saffron-600 hover:bg-slate-100/70'
              }`}
            >
              <span>{isMarathi ? 'मुख्यपृष्ठ' : 'Home'}</span>
            </Link>

            <Link 
              to="/about" 
              className={`h-8 sm:h-8.5 inline-flex items-center justify-center px-2.5 rounded-lg whitespace-nowrap transition-all ${
                isActive('/about') 
                  ? 'text-gurukul-saffron-600 font-bold bg-orange-50/90 border border-orange-200/60 shadow-2xs' 
                  : 'text-slate-700 hover:text-gurukul-saffron-600 hover:bg-slate-100/70'
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
                  setCrmOpen(false);
                }}
                onMouseEnter={() => {
                  setAcademicsOpen(true);
                  setGalleryOpen(false);
                  setCrmOpen(false);
                }}
                className={`h-8 sm:h-8.5 inline-flex items-center justify-center gap-1 px-2.5 rounded-lg whitespace-nowrap transition-all ${
                  isAcademicsActive 
                    ? 'text-gurukul-saffron-600 font-bold bg-orange-50/90 border border-orange-200/60 shadow-2xs' 
                    : 'text-slate-700 hover:text-gurukul-saffron-600 hover:bg-slate-100/70'
                }`}
              >
                <span>{isMarathi ? 'शैक्षणिक' : 'Academics'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${academicsOpen ? 'rotate-180 text-gurukul-saffron-600' : ''}`} />
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
              className={`h-8 sm:h-8.5 inline-flex items-center justify-center px-2.5 rounded-lg whitespace-nowrap transition-all ${
                isActive('/courses') 
                  ? 'text-gurukul-saffron-600 font-bold bg-orange-50/90 border border-orange-200/60 shadow-2xs' 
                  : 'text-slate-700 hover:text-gurukul-saffron-600 hover:bg-slate-100/70'
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
                  setCrmOpen(false);
                }}
                onMouseEnter={() => {
                  setGalleryOpen(true);
                  setAcademicsOpen(false);
                  setCrmOpen(false);
                }}
                className={`h-8 sm:h-8.5 inline-flex items-center justify-center gap-1 px-2.5 rounded-lg whitespace-nowrap transition-all ${
                  isGalleryActive 
                    ? 'text-gurukul-saffron-600 font-bold bg-orange-50/90 border border-orange-200/60 shadow-2xs' 
                    : 'text-slate-700 hover:text-gurukul-saffron-600 hover:bg-slate-100/70'
                }`}
              >
                <span>{isMarathi ? 'गॅलरी' : 'Gallery'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${galleryOpen ? 'rotate-180 text-gurukul-saffron-600' : ''}`} />
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
              className={`h-8 sm:h-8.5 inline-flex items-center justify-center px-2.5 rounded-lg whitespace-nowrap transition-all ${
                isActive('/notices') 
                  ? 'text-gurukul-saffron-600 font-bold bg-orange-50/90 border border-orange-200/60 shadow-2xs' 
                  : 'text-slate-700 hover:text-gurukul-saffron-600 hover:bg-slate-100/70'
              }`}
            >
              <span>{isMarathi ? 'सूचना पत्रक' : 'Notices'}</span>
            </Link>

            <Link 
              to="/contact" 
              className={`h-8 sm:h-8.5 inline-flex items-center justify-center px-2.5 rounded-lg whitespace-nowrap transition-all ${
                isActive('/contact') 
                  ? 'text-gurukul-saffron-600 font-bold bg-orange-50/90 border border-orange-200/60 shadow-2xs' 
                  : 'text-slate-700 hover:text-gurukul-saffron-600 hover:bg-slate-100/70'
              }`}
            >
              <span>{isMarathi ? 'संपर्क' : 'Contact'}</span>
            </Link>
          </nav>

          {/* Action CTAs (Right-aligned, cleanly centered buttons) */}
          <div className="hidden xl:flex items-center gap-2 2xl:gap-2.5 shrink-0">
            {/* CRM Portal Access Button with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setCrmOpen(!crmOpen);
                  setAcademicsOpen(false);
                  setGalleryOpen(false);
                }}
                onMouseEnter={() => {
                  setCrmOpen(true);
                  setAcademicsOpen(false);
                  setGalleryOpen(false);
                }}
                className={`h-8 sm:h-8.5 inline-flex items-center justify-center gap-1.5 px-2.5 2xl:px-3 text-xs font-semibold rounded-lg transition-all border shadow-2xs whitespace-nowrap shrink-0 group ${
                  crmOpen 
                    ? 'text-gurukul-saffron-600 bg-orange-50 border-orange-200' 
                    : 'text-slate-700 hover:text-gurukul-saffron-600 bg-white hover:bg-orange-50/60 border-slate-200/90'
                }`}
                title={isMarathi ? 'CRM व स्टाफ पोर्टल' : 'CRM & Staff Portal'}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-gurukul-saffron-600 group-hover:scale-105 transition-transform shrink-0" />
                <span>{isMarathi ? 'CRM लॉगिन' : 'CRM Login'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-gurukul-saffron-600 transition-transform duration-200 ${crmOpen ? 'rotate-180' : ''}`} />
              </button>

              {crmOpen && (
                <div 
                  onMouseLeave={() => setCrmOpen(false)}
                  className="absolute right-0 mt-1 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 text-left"
                >
                  <div className="px-4 py-2 border-b border-slate-100/80">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {isMarathi ? 'प्रवेश CRM व स्टाफ पोर्टल' : 'Admission CRM & Staff Workspace'}
                    </span>
                  </div>

                  {/* Admin & Lead CRM */}
                  <a
                    href={crmUrls.admin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setCrmOpen(false)}
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-orange-50/70 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-gurukul-saffron-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-gurukul-saffron-500 group-hover:text-white transition-colors">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <span className="block font-bold text-sm text-slate-900 group-hover:text-gurukul-saffron-600 transition-colors whitespace-nowrap">
                        {isMarathi ? 'अ‍ॅडमिन CRM (Admin Panel)' : 'Admin CRM (Admin Panel)'}
                      </span>
                      <span className="block text-xs text-slate-500 font-medium mt-0.5">
                        {isMarathi ? 'सर्व लीड्स, प्रवेश अर्ज, CMS व अहवाल' : 'All Leads, Enquiries, CMS & Reports'}
                      </span>
                    </div>
                  </a>

                  {/* Telecaller CRM */}
                  <a
                    href={crmUrls.telecaller}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setCrmOpen(false)}
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-orange-50/70 border-t border-slate-100/60 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Headset className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <span className="block font-bold text-sm text-slate-900 group-hover:text-gurukul-saffron-600 transition-colors whitespace-nowrap">
                        {isMarathi ? 'टेलिकॉलर पोर्टल (Telecaller CRM)' : 'Telecaller Portal (CRM)'}
                      </span>
                      <span className="block text-xs text-slate-500 font-medium mt-0.5">
                        {isMarathi ? 'असाइन केलेल्या लीड्स व फॉलो-अप' : 'Assigned Leads & Follow-ups'}
                      </span>
                    </div>
                  </a>

                  {/* Direct Login & Register Links */}
                  <div className="mt-1 pt-2 border-t border-slate-100 px-4 py-2 flex items-center justify-between text-xs bg-slate-50/60 rounded-b-xl">
                    <a
                      href={crmUrls.login}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setCrmOpen(false)}
                      className="font-bold text-gurukul-navy-900 hover:text-gurukul-saffron-600 flex items-center gap-1.5 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5 text-gurukul-saffron-500 shrink-0" />
                      <span>{isMarathi ? 'थेट स्टाफ लॉगिन' : 'Direct Staff Login'}</span>
                    </a>
                    <a
                      href={`${telecallerBaseUrl}/register`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setCrmOpen(false)}
                      className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors text-[11px]"
                    >
                      <span>{isMarathi ? '+ समुपदेशक नोंदणी' : '+ Register'}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Apply Action Button */}
            <Link 
              to="/admission-enquiry" 
              className="h-8 sm:h-8.5 inline-flex items-center justify-center px-3.5 2xl:px-4 text-xs font-bold text-white bg-gradient-to-r from-gurukul-saffron-600 to-gurukul-saffron-500 hover:from-gurukul-saffron-700 hover:to-gurukul-saffron-600 rounded-lg shadow-xs hover:shadow transition-all whitespace-nowrap shrink-0"
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
          {/* Mobile CRM Portal Section */}
          <div className="pt-2 pb-1 px-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
            {isMarathi ? 'प्रवेश CRM व स्टाफ पोर्टल (CRM Portals)' : 'CRM & Staff Portals'}
          </div>
          <div className="grid grid-cols-2 gap-2 px-1">
            <a
              href={crmUrls.admin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 transition-colors text-left"
            >
              <ShieldCheck className="w-4 h-4 text-gurukul-saffron-600 shrink-0" />
              <div className="min-w-0">
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  {isMarathi ? 'अ‍ॅडमिन CRM' : 'Admin CRM'}
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  {isMarathi ? 'लीड व्यवस्थापन' : 'Lead Mgmt'}
                </span>
              </div>
            </a>
            <a
              href={crmUrls.telecaller}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 transition-colors text-left"
            >
              <Headset className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  {isMarathi ? 'टेलिकॉलर CRM' : 'Telecaller'}
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  {isMarathi ? 'कॉलिंग पोर्टल' : 'Calling Panel'}
                </span>
              </div>
            </a>
          </div>

          <Link 
            to="/admission-enquiry" 
            onClick={closeMenu}
            className="flex items-center justify-center px-3 py-3 rounded-lg text-base font-bold bg-gurukul-saffron-500 hover:bg-gurukul-saffron-600 text-white text-center shadow-md transition-colors"
          >
            <span className="text-center">{isMarathi ? 'ऑनलाईन प्रवेश अर्ज करा (Apply Now)' : 'Apply Online for Admission'}</span>
          </Link>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500">
            <a 
              href={crmUrls.admin} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={closeMenu} 
              className="font-bold text-gurukul-navy-900 flex items-center gap-1.5 text-left hover:text-gurukul-saffron-600 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-gurukul-saffron-500 shrink-0" />
              <span>Staff / CRM Portal</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
