import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Phone, Home, Building2, FileText, Compass } from 'lucide-react';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { useCMS } from '../contexts/CMSContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export const PublicLayout = () => {
  const { institution, websiteSettings } = useCMS();
  const { isMarathi } = useLanguage();
  const location = useLocation();
  const auth = useAuth?.() || {};
  const isPrivileged = auth.isSuperAdmin || auth.isAdmin;
  const isMaintenance = websiteSettings?.maintenanceMode === true || websiteSettings?.maintenanceMode?.enabled === true;

  const primaryPhone = institution.phones?.[0] || '9850449800';
  const whatsappNumber = `91${primaryPhone}`;

  // Automatically scroll to top on every route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isMaintenance && !isPrivileged) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gurukul-navy-950 text-white p-6">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gurukul-saffron-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg">
            GB
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">वेबसाईट देखभाल सुरू आहे</h1>
            <p className="text-xs text-gurukul-saffron-400 font-semibold mt-1">Maintenance Mode Active</p>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {websiteSettings?.maintenanceMessage || websiteSettings?.maintenanceMode?.message || 'गुरुकुल भोसे अधिकृत वेबसाईटचे काम सुरू आहे. कृपया काही वेळाने पुन्हा भेट द्या.'}
          </p>
          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
            <p>थेट प्रवेश चौकशीसाठी संपर्क साधा:</p>
            <a href={`tel:${primaryPhone}`} className="text-base font-bold text-gurukul-saffron-400 hover:underline block">
              📞 {primaryPhone}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      {/* Main Top Navigation */}
      <Navbar />

      {/* Main Page Body (with bottom padding on mobile for sticky bar) */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Floating Action Buttons for desktop/tablet reachout */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col gap-3">
        {/* Call Now */}
        <a
          href={`tel:${primaryPhone}`}
          className="w-12 h-12 rounded-full bg-gurukul-navy-900 text-white flex items-center justify-center shadow-lg hover:scale-110 hover:bg-gurukul-navy-950 transition-all border-2 border-white focus:outline-none focus:ring-2 focus:ring-gurukul-navy-900 focus:ring-offset-2"
          title="कॉल करा (Call Gurukul Bhose)"
          aria-label="कॉल करा (Call Gurukul Bhose)"
        >
          <Phone className="w-5 h-5 fill-white stroke-white" />
        </a>

        {/* WhatsApp Chat */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('नमस्कार, मला गुरुकुल भोसे निवासी स्कूल व कॉलेज प्रवेशाबाबत अधिक माहिती हवी आहे.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 hover:bg-[#1EBE5D] transition-all border-2 border-white focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
          title="WhatsApp वर मेसेज करा"
          aria-label="WhatsApp वर मेसेज करा"
        >
          <WhatsAppIcon className="w-6 h-6 text-white" />
        </a>
      </div>

      {/* Mobile Bottom Sticky Quick Action Bar (Mobile View Navigation) */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-2 py-1.5 safe-bottom"
        aria-label="Mobile Quick Navigation"
      >
        <div className="grid grid-cols-5 items-center gap-1 max-w-md mx-auto text-center">
          
          {/* 1. Home */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              location.pathname === '/' 
                ? 'text-gurukul-saffron-600 font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 leading-tight">{isMarathi ? 'होम' : 'Home'}</span>
          </Link>

          {/* 2. Call Now */}
          <a
            href={`tel:${primaryPhone}`}
            className="flex flex-col items-center justify-center py-1 text-slate-700 hover:text-gurukul-navy-950 transition-all rounded-xl"
            title="थेट कॉल करा"
          >
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
              <Phone className="w-3.5 h-3.5 text-gurukul-navy-900" />
            </div>
            <span className="text-[10px] mt-0.5 font-semibold leading-tight">{isMarathi ? 'कॉल' : 'Call'}</span>
          </a>

          {/* 3. Apply Now (Prominent Center Button) */}
          <Link
            to="/admission-enquiry"
            className="flex flex-col items-center justify-center -mt-3 group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gurukul-saffron-600 to-gurukul-saffron-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 border-2 border-white group-active:scale-95 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gurukul-saffron-600 mt-0.5 leading-tight">
              {isMarathi ? 'प्रवेश' : 'Apply'}
            </span>
          </Link>

          {/* 4. WhatsApp Chat */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('नमस्कार, मला गुरुकुल भोसे निवासी स्कूल व कॉलेज प्रवेशाबाबत अधिक माहिती हवी आहे.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-1 text-emerald-700 hover:text-emerald-800 transition-all rounded-xl"
            title="WhatsApp चॅट"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            </div>
            <span className="text-[10px] mt-0.5 font-semibold text-emerald-700 leading-tight">WhatsApp</span>
          </a>

          {/* 5. Campus Visit */}
          <Link
            to="/campus-visit"
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              location.pathname === '/campus-visit' 
                ? 'text-gurukul-saffron-600 font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 leading-tight">{isMarathi ? 'भेट' : 'Visit'}</span>
          </Link>

        </div>
      </nav>

      {/* Footer */}
      <Footer />
    </div>
  );
};
