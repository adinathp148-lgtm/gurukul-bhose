import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Download, 
  ChevronRight, 
  ArrowUp, 
  Shield,
  LogIn,
  ExternalLink
} from 'lucide-react';
import { useCMS } from '../../contexts/CMSContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAdminPanelUrl } from '../../services/navigation/navigationUrls';

export const Footer = ({ showStaffLink = true }) => {
  const { institution, websiteSettings } = useCMS();
  const { isMarathi } = useLanguage();
  const adminBaseUrl = getAdminPanelUrl();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formattedAddress = typeof institution?.address === 'object'
    ? `${institution.address.line1 || ''}, ${institution.address.landmark ? institution.address.landmark + ', ' : ''}${institution.address.taluka ? 'ता. ' + institution.address.taluka + ', ' : ''}${institution.address.district ? 'जि. ' + institution.address.district : ''} ${institution.address.pincode ? '- ' + institution.address.pincode : ''}`
    : (institution?.address || 'दंडोबा डोंगर पायथ्याला, यल्लामा मंदिर जवळ, मिरज-पंढरपूर हायवे लगत, नायरा पेट्रोल पंपाच्या मागे, भोसे, ता. मिरज, जि. सांगली.');

  const formattedPhones = Array.isArray(institution?.phones) && institution.phones.length > 0
    ? institution.phones.join(' / ')
    : '९८५०४४९८०० / ९८५०४४९८०८ / ७०२०२६०९६८';

  const footerEmail = institution?.email || 'contact@gurukulbhose.com';
  const workingHours = institution?.workingHours || 'सोमवार - रविवार: ९ AM - ५ PM (७ दिवस सुरू)';
  const copyrightText = websiteSettings?.footerCopyright || (isMarathi 
    ? `© ${new Date().getFullYear()} गुरुकुल विद्यामंदिर व गुरुकुल जुनियर कॉलेज, भोसे. सर्व हक्क राखीव.`
    : `© ${new Date().getFullYear()} Gurukul Vidyamandir & Gurukul Junior College, Bhose. All rights reserved.`);

  return (
    <footer className="bg-gurukul-navy-950 text-slate-300 relative border-t-4 border-gurukul-saffron-500">
      {/* Wave decorative top divider */}
      <div className="absolute top-0 left-0 right-0 -translate-y-full overflow-hidden leading-none pointer-events-none text-gurukul-navy-950">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-8 fill-current">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,121.31,191.68,103.58Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/gurukul-logo.png" 
                alt="गुरुकुल भोसे Logo" 
                className="w-12 h-12 object-contain bg-white/10 backdrop-blur-sm rounded-xl p-1 shadow-lg shrink-0" 
              />
              <div>
                <h4 className="font-bold text-white text-base">{isMarathi ? 'गुरुकुल भोसे' : 'Gurukul Bhose'}</h4>
                <p className="text-xs text-gurukul-saffron-400 font-medium">
                  {institution?.tagline || (isMarathi ? 'विद्यामंदिर व ज्युनिअर कॉलेज' : 'Vidyamandir & Junior College')}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isMarathi
                ? 'गुरुकुल विद्यामंदिर व गुरुकुल जुनियर कॉलेज, भोसे (ता. मिरज, जि. सांगली). इ. ५ वी ते १२ वी सैनिक पॅटर्न निवासी स्कूल व कॉलेज. १५ वर्षे अविरत सेवेत, शेकडो विद्यार्थी सरकारी नोकरीत कार्यरत.'
                : 'Gurukul Vidyamandir & Gurukul Junior College, Bhose (Miraj, Sangli). 5th to 12th Std. Sainik Pattern Residential School & College. 15 years in dedicated service with hundreds of successful alumni in civil & defence jobs.'}
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-yellow-400">
                <Shield className="w-3.5 h-3.5 text-gurukul-saffron-400" />
                <span>{isMarathi ? 'सैनिक पॅटर्न निवासी शिक्षण' : 'Sainik Pattern Residential Education'}</span>
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 border-l-2 border-gurukul-saffron-500 pl-2.5">
              {isMarathi ? 'महत्त्वाचे दुवे (Quick Links)' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-gurukul-saffron-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-gurukul-saffron-500" /> {isMarathi ? 'मुख्यपृष्ठ (Home)' : 'Home'}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gurukul-saffron-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-gurukul-saffron-500" /> {isMarathi ? 'आमच्याबद्दल (About Us)' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link to="/staff" className="hover:text-gurukul-saffron-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-gurukul-saffron-500" /> {isMarathi ? 'शिक्षक व कर्मचारी (Staff)' : 'Faculty & Staff'}
                </Link>
              </li>
              <li>
                <Link to="/vidyamandir" className="hover:text-gurukul-saffron-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-gurukul-saffron-500" /> {isMarathi ? 'गुरुकुल प्री-प्रायमरी (Nursery, LKG, UKG)' : 'Gurukul Pre-Primary (Nursery, LKG, UKG)'}
                </Link>
              </li>
              <li>
                <Link to="/gurukul-vidyamandir" className="hover:text-gurukul-saffron-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-gurukul-saffron-500" /> {isMarathi ? 'गुरुकुल विद्यामंदिर (1 ली ते 10 वी)' : 'Gurukul Vidyamandir (1st–10th)'}
                </Link>
              </li>
              <li>
                <Link to="/gurukul-junior-college" className="hover:text-gurukul-saffron-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-gurukul-saffron-500" /> {isMarathi ? 'गुरुकुल जुनियर कॉलेज (11 वी 12 वी)' : 'Gurukul Junior College (11th & 12th)'}
                </Link>
              </li>
              <li>
                <Link to="/talent-search-academy" className="hover:text-gurukul-saffron-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-gurukul-saffron-500" /> {isMarathi ? 'टॅलेंट सर्च अकॅडमी (Talent Search)' : 'Talent Search Academy'}
                </Link>
              </li>
              <li>
                <Link to="/science-academy" className="hover:text-gurukul-saffron-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-gurukul-saffron-500" /> {isMarathi ? 'सायन्स अकॅडमी (NEET / JEE / NDA)' : 'Science Academy (NEET/JEE)'}
                </Link>
              </li>
              <li>
                <Link to="/computer-institute" className="hover:text-gurukul-saffron-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-gurukul-saffron-500" /> {isMarathi ? 'कम्प्युटर कोर्सेस (MSCIT, Tally, टायपिंग)' : 'Computer Courses (MSCIT, Tally, Typing)'}
                </Link>
              </li>
              <li>
                <Link to="/notices" className="hover:text-gurukul-saffron-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-gurukul-saffron-500" /> {isMarathi ? 'सूचना पत्रक (Notices)' : 'Notices & Bulletins'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 border-l-2 border-gurukul-saffron-500 pl-2.5">
              {isMarathi ? 'कॅम्पस संपर्क (Contact)' : 'Campus Contact'}
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gurukul-saffron-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {formattedAddress}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gurukul-saffron-400 shrink-0" />
                <span>{formattedPhones}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gurukul-saffron-400 shrink-0" />
                <a href={`mailto:${footerEmail}`} className="hover:underline">
                  {footerEmail}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-gurukul-saffron-400 shrink-0" />
                <span>{workingHours}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Admissions & Downloads */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm border-l-2 border-gurukul-saffron-500 pl-2.5">
              {isMarathi ? 'प्रवेश व माहिती पत्रक' : 'Admissions & Downloads'}
            </h4>
            <p className="text-xs text-slate-400">
              {isMarathi 
                ? 'चालू शैक्षणिक वर्षामध्ये ५ वी ते १२ वी मराठी व इंग्रजी सेमी तसेच सायन्स व आर्टस् प्रवेश सुरू आहेत.'
                : 'Admissions are open for 5th to 12th Std. (Marathi & Semi-English Medium) and 11th & 12th Science and Arts.'}
            </p>

            <a 
              href={institution.brochureUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-gurukul-saffron-400" />
              <span>{isMarathi ? 'माहिती पत्रक डाऊनलोड करा (Brochure)' : 'Download Information Brochure'}</span>
            </a>

            <Link 
              to="/admission-enquiry"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gurukul-saffron-500 hover:bg-gurukul-saffron-600 text-white text-xs font-bold shadow-md transition-colors"
            >
              <span>{isMarathi ? 'ऑनलाईन प्रवेश अर्ज / Enquiry' : 'Online Admission Enquiry'}</span>
            </Link>
          </div>

        </div>

        {/* Bottom copyright & back to top */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4 text-center md:text-left">
          <p>{copyrightText}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4">
            <a
              href={`${adminBaseUrl}/admin/profile`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-yellow-400 text-yellow-400 hover:text-yellow-300 text-[11px] font-semibold transition-all shadow-sm"
              title={isMarathi ? 'अ‍ॅडमिन पॅनेल प्रोफाइल' : 'Admin Panel Profile'}
            >
              <Shield className="w-3.5 h-3.5 text-gurukul-saffron-400" />
              <span>{isMarathi ? 'अ‍ॅडमिन पॅनेल प्रोफाइल' : 'Admin Panel Profile'}</span>
            </a>
            <span className="text-slate-700">•</span>
            <a 
              href={`${adminBaseUrl}/login`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-gurukul-saffron-400 transition-colors text-slate-400 hover:text-white"
            >
              {isMarathi ? 'स्टाफ लॉगिन (Staff Login)' : 'Staff Login'}
            </a>
            <span className="text-slate-700">•</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800"
              title="Back to Top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Top</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
