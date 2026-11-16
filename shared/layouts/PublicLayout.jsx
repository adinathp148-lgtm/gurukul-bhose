import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Phone } from 'lucide-react';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { useCMS } from '../contexts/CMSContext';

import { useAuth } from '../contexts/AuthContext';

export const PublicLayout = () => {
  const { institution, websiteSettings } = useCMS();
  const auth = useAuth?.() || {};
  const isPrivileged = auth.isSuperAdmin || auth.isAdmin;
  const isMaintenance = websiteSettings?.maintenanceMode === true || websiteSettings?.maintenanceMode?.enabled === true;

  const primaryPhone = institution.phones?.[0] || '9850449800';
  const whatsappNumber = `91${primaryPhone}`;

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Main Top Navigation */}
      <Navbar />

      {/* Main Page Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Floating Action Buttons for immediate parent reachout */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
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

      {/* Footer */}
      <Footer />
    </div>
  );
};
