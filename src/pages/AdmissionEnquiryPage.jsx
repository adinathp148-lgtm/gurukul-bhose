import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  FileText, 
  Download, 
  Clock, 
  HelpCircle 
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { getWebsiteContent } from '../services/firestore/contentService';
import { useLanguage } from '../contexts/LanguageContext';

export const AdmissionEnquiryPage = () => {
  const { isMarathi } = useLanguage();
  const [institution, setInstitution] = useState({});

  useEffect(() => {
    getWebsiteContent().then(res => setInstitution(res.data));
  }, []);

  const [formData, setFormData] = useState({
    parentName: '',
    studentName: '',
    mobileNumber: '',
    whatsappNumber: '',
    sameAsMobile: true,
    email: '',
    admissionClass: 'इ. 5 वी',
    course: 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)',
    currentSchool: '',
    address: '',
    message: '',
    consent: true
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleMobileChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      mobileNumber: val,
      whatsappNumber: prev.sameAsMobile ? val : prev.whatsappNumber
    }));
  };

  const handleSameAsMobileToggle = (e) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      sameAsMobile: checked,
      whatsappNumber: checked ? prev.mobileNumber : prev.whatsappNumber
    }));
  };

  const validate = () => {
    const errs = {};

    if (!formData.parentName.trim()) {
      errs.parentName = 'पालकांचे पूर्ण नाव आवश्यक आहे.';
    }

    if (!formData.studentName.trim()) {
      errs.studentName = 'विद्यार्थ्याचे पूर्ण नाव आवश्यक आहे.';
    }

    const cleanMobile = formData.mobileNumber.replace(/\D/g, '');
    if (!cleanMobile) {
      errs.mobileNumber = 'मोबाईल नंबर आवश्यक आहे.';
    } else if (cleanMobile.length !== 10) {
      errs.mobileNumber = 'वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.';
    }

    if (!formData.sameAsMobile) {
      const cleanWa = formData.whatsappNumber.replace(/\D/g, '');
      if (cleanWa && cleanWa.length !== 10) {
        errs.whatsappNumber = 'वैध १० अंकी WhatsApp नंबर प्रविष्ट करा.';
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'वैध ईमेल पत्ता प्रविष्ट करा.';
    }

    if (!formData.admissionClass) {
      errs.admissionClass = 'प्रवेश इयत्ता निवडणे आवश्यक आहे.';
    }

    if (!formData.address.trim()) {
      errs.address = 'पत्ता किंवा गावाचे नाव आवश्यक आहे.';
    }

    if (!formData.consent) {
      errs.consent = 'प्रवेश चौकशी व माहिती प्राप्त करण्यासाठी संमती देणे आवश्यक आहे.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    // As specified in Phase 2 guidelines:
    // Build complete frontend form and validation structure; actual Firestore Lead CRM sync is wired in Phase 5.
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      parentName: '',
      studentName: '',
      mobileNumber: '',
      whatsappNumber: '',
      sameAsMobile: true,
      email: '',
      admissionClass: 'इ. 5 वी',
      course: 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)',
      currentSchool: '',
      address: '',
      message: '',
      consent: true
    });
    setErrors({});
  };

  const primaryPhone = institution.phones?.[0] || '9850449800';

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title="ऑनलाईन प्रवेश अर्ज व चौकशी | गुरुकुल भोसे"
        description="गुरुकुल भोसे निवासी स्कूल व जुनिअर कॉलेज ऑनलाईन प्रवेश नोंदणी. इ. ५ वी ते १२ वी सैनिक पॅटर्न निवासी, स्कॉलरशिप, नवोदय, NEET, JEE, NDA तयारी."
      />

      <PageHeader
        badge={isMarathi ? 'चालू शैक्षणिक वर्ष प्रवेश' : 'Admissions Open'}
        title={isMarathi ? 'ऑनलाईन प्रवेश अर्ज व चौकशी (Admission Enquiry)' : 'Online Admission Enquiry & Application'}
        subtitle={isMarathi 
          ? 'इ. ५ वी ते १० वी (मराठी व सेमी) तसेच ११ वी व १२ वी सायन्स व आर्टस् (सैनिक पॅटर्न निवासी) प्रवेशासाठी अर्ज करा' 
          : 'Apply for 5th to 10th (Marathi & Semi) and 11th & 12th Arts & Science (Sainik Pattern Residential)'}
        breadcrumbs={[{ label: isMarathi ? 'प्रवेश चौकशी (Admission Enquiry)' : 'Admission Enquiry' }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Guidelines & Contact Helpline */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-gurukul-saffron-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">प्रवेश मार्गदर्शक तत्त्वे</h3>
                  <p className="text-xs text-slate-500">पारदर्शक व थेट प्रवेश प्रक्रिया</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                  <span><strong>कोणतीही देणगी (No Donation) नाही:</strong> गुणवत्तेनुसार व थेट प्रवेश.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                  <span><strong>५ वी ते १० वी:</strong> मराठी व सेमी-इंग्रजी दोन्ही माध्यमे उपलब्ध.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                  <span><strong>११ वी व १२ वी:</strong> सायन्स (PCMB) व आर्टस् (डिफेन्स तयारी).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                  <span><strong>वसतिगृह व मेस:</strong> मुले व मुलींसाठी स्वतंत्र, सुरक्षित व CCTV युक्त वसतिगृह.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                  <span><strong>वर्गात फक्त ३० विद्यार्थी:</strong> वैयक्तिक अभ्यास नियोजन.</span>
                </div>
              </div>
            </div>

            {/* Helpline Box */}
            <div className="bg-gurukul-navy-900 text-white p-6 rounded-3xl shadow-lg space-y-4">
              <h4 className="font-bold text-sm text-yellow-400">तातडीने प्रवेश माहिती हवी आहे?</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                आमच्या प्रवेश समुपदेशकांशी थेट फोन किंवा व्हॉट्सॲपवर संपर्क साधा.
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <a
                  href={`tel:${primaryPhone}`}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-white/10 hover:bg-white/20 font-bold transition-colors"
                >
                  <Phone className="w-4 h-4 text-gurukul-saffron-400" />
                  <span>कॉल: {primaryPhone}</span>
                </a>
                <a
                  href={`https://wa.me/91${primaryPhone}?text=${encodeURIComponent('नमस्कार, मला गुरुकुल भोसे निवासी स्कूल व कॉलेज प्रवेशाबाबत अधिक माहिती हवी आहे.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] font-bold text-white transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                  <span>WhatsApp वर संपर्क करा</span>
                </a>
              </div>
            </div>

            {/* Brochure Link */}
            <a
              href={institution.brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4 text-gurukul-saffron-600" />
              <span>अधिकृत माहिती पत्रक डाऊनलोड करा (PDF)</span>
            </a>

          </div>

          {/* Right Column: Admission Enquiry Form */}
          <div className="lg:col-span-8">
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
              
              {submitted ? (
                <div className="py-8 text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      प्रवेश अर्ज व पडताळणी यशस्वी!
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                      आपला प्रवेश तपशील अचूक तपासला गेला आहे. गुरुकुल भोसे प्रवेश प्रतिनिधी लवकरच दिलेल्या क्रमांकावर संपर्क साधतील.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl max-w-md mx-auto text-left text-xs space-y-1.5 border border-slate-200">
                    <p><strong>विद्यार्थी:</strong> {formData.studentName}</p>
                    <p><strong>पालक:</strong> {formData.parentName}</p>
                    <p><strong>मोबाईल:</strong> {formData.mobileNumber}</p>
                    <p><strong>प्रवेश इयत्ता:</strong> {formData.admissionClass}</p>
                    <p><strong>कोर्स:</strong> {formData.course}</p>
                    <p><strong>पत्ता:</strong> {formData.address}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                    <a
                      href={`https://wa.me/91${primaryPhone}?text=${encodeURIComponent(`नमस्कार, मी ${formData.studentName} यांच्या प्रवेशासाठी ऑनलाईन चौकशी अर्ज भरला आहे. कृपया पुढील प्रक्रिया सांगावी.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp वर त्वरित अपडेट मिळवा</span>
                    </a>

                    <Button variant="outline" size="md" onClick={resetForm}>
                      नवीन अर्ज भरा
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  
                  {/* Step 1: Basic Information */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gurukul-saffron-600 mb-4 pb-2 border-b border-slate-100">
                      १. विद्यार्थी व पालकांचा तपशील (Basic Details)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          पालकांचे पूर्ण नाव (Parent Name) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.parentName}
                          onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                          placeholder="उदा. श्री. पांडुरंग जाधव"
                          className={`w-full text-xs px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                            errors.parentName ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          }`}
                        />
                        {errors.parentName && <p className="text-[11px] text-red-600 mt-1">{errors.parentName}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          विद्यार्थ्याचे पूर्ण नाव (Student Name) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.studentName}
                          onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                          placeholder="उदा. ओंकार पांडुरंग जाधव"
                          className={`w-full text-xs px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                            errors.studentName ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          }`}
                        />
                        {errors.studentName && <p className="text-[11px] text-red-600 mt-1">{errors.studentName}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          मोबाईल नंबर (Mobile Number) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={formData.mobileNumber}
                          onChange={handleMobileChange}
                          placeholder="१० अंकी मोबाईल नंबर"
                          className={`w-full text-xs px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                            errors.mobileNumber ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          }`}
                        />
                        {errors.mobileNumber && <p className="text-[11px] text-red-600 mt-1">{errors.mobileNumber}</p>}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">
                            WhatsApp नंबर
                          </label>
                          <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.sameAsMobile}
                              onChange={handleSameAsMobileToggle}
                              className="rounded text-gurukul-saffron-500 focus:ring-gurukul-saffron-400"
                            />
                            <span>Same as Mobile</span>
                          </label>
                        </div>
                        <input
                          type="tel"
                          maxLength={10}
                          disabled={formData.sameAsMobile}
                          value={formData.whatsappNumber}
                          onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                          placeholder="१० अंकी WhatsApp नंबर"
                          className={`w-full text-xs px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 ${
                            errors.whatsappNumber ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          }`}
                        />
                        {errors.whatsappNumber && <p className="text-[11px] text-red-600 mt-1">{errors.whatsappNumber}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          ईमेल पत्ता (Email - पर्यायी)
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="parent@example.com"
                          className={`w-full text-xs px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                            errors.email ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          }`}
                        />
                        {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          सध्याची शाळा / कॉलेज (Current School)
                        </label>
                        <input
                          type="text"
                          value={formData.currentSchool}
                          onChange={(e) => setFormData({ ...formData, currentSchool: e.target.value })}
                          placeholder="उदा. आदर्श हायस्कूल, मिरज"
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Admission Preferences */}
                  <div className="pt-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gurukul-saffron-600 mb-4 pb-2 border-b border-slate-100">
                      २. प्रवेश शाखा व वर्ग निवड (Admission Preference)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          कोणत्या इयत्तेत प्रवेश हवा आहे? <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.admissionClass}
                          onChange={(e) => setFormData({ ...formData, admissionClass: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
                        >
                          <option value="इ. 5 वी">इ. 5 वी (5th Standard)</option>
                          <option value="इ. 6 वी">इ. 6 वी (6th Standard)</option>
                          <option value="इ. 7 वी">इ. 7 वी (7th Standard)</option>
                          <option value="इ. 8 वी">इ. 8 वी (8th Standard)</option>
                          <option value="इ. 9 वी">इ. 9 वी (9th Standard)</option>
                          <option value="इ. 10 वी">इ. 10 वी (10th Standard)</option>
                          <option value="इ. 11 वी सायन्स (PCMB)">इ. 11 वी सायन्स (PCMB)</option>
                          <option value="इ. 11 वी आर्टस् (Defence / Arts)">इ. 11 वी आर्टस् (Defence / Arts)</option>
                          <option value="इ. 12 वी सायन्स (PCMB)">इ. 12 वी सायन्स (PCMB)</option>
                          <option value="इ. 12 वी आर्टस् (Defence / Arts)">इ. 12 वी आर्टस् (Defence / Arts)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          शाखा / कोर्स <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.course}
                          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
                        >
                          <option value="गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)">गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)</option>
                          <option value="गुरुकुल जुनियर कॉलेज (सायन्स + NDA / NEET)">गुरुकुल जुनियर कॉलेज (सायन्स + NDA / NEET)</option>
                          <option value="गुरुकुल जुनियर कॉलेज (आर्टस् + पोलीस/आर्मी भरती)">गुरुकुल जुनियर कॉलेज (आर्टस् + पोलीस/आर्मी भरती)</option>
                          <option value="गुरुकुल टॅलेंट सर्च अकॅडमी (स्कॉलरशिप / नवोदय)">गुरुकुल टॅलेंट सर्च अकॅडमी (स्कॉलरशिप / नवोदय)</option>
                          <option value="गुरुकुल सायन्स निवासी अकॅडमी">गुरुकुल सायन्स निवासी अकॅडमी</option>
                          <option value="गुरुकुल कम्प्युटर इन्स्टिट्यूट (MS-CIT/Tally)">गुरुकुल कम्प्युटर इन्स्टिट्यूट (MS-CIT/Tally)</option>
                          <option value="गुरुकुल निवासी स्पोर्ट्स अकॅडमी">गुरुकुल निवासी स्पोर्ट्स अकॅडमी</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        पत्ता / शहर / गाव (Address) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="उदा. मु. पो. भोसे, ता. मिरज, जि. सांगली"
                        className={`w-full text-xs px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                          errors.address ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                        }`}
                      />
                      {errors.address && <p className="text-[11px] text-red-600 mt-1">{errors.address}</p>}
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        पालकांचा संदेश किंवा विशेष विचारणा (Message / Query)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="वसतिगृह, फी सवलत किंवा इतर कोणतीही विचारणा असल्यास येथे लिहा..."
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Step 3: Privacy and Consent Statement */}
                  <div className="pt-2">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.consent}
                          onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                          className="mt-0.5 rounded text-gurukul-saffron-500 focus:ring-gurukul-saffron-400"
                        />
                        <span className="text-xs text-slate-600 leading-relaxed">
                          मी याद्वारे पुष्टी करतो/करते की वरील माहिती अचूक आहे आणि मी गुरुकुल भोसे प्रशासकीय कार्यालयाकडून फोन, ईमेल किंवा WhatsApp द्वारे प्रवेश माहिती व सूचना प्राप्त करण्यास संमती देतो/देते. (Privacy & Consent)
                        </span>
                      </label>
                      {errors.consent && <p className="text-[11px] text-red-600 pl-6">{errors.consent}</p>}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="xl"
                    isLoading={submitting}
                    className="w-full font-bold uppercase tracking-wider shadow-lg"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    <span>प्रवेश अर्ज सादर करा / Submit Application</span>
                  </Button>
                </form>
              )}

            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
