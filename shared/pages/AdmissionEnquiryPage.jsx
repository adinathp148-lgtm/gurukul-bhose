import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Calendar,
  Sparkles,
  User,
  GraduationCap,
  MapPin,
  Lock,
  Copy,
  Check,
  Building2,
  ChevronRight
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { getWebsiteContent } from '../services/firestore/contentService';
import { useCRM } from '../contexts/CRMContext';

export const AdmissionEnquiryPage = () => {
  const { submitAdmissionEnquiry } = useCRM();
  const [institution, setInstitution] = useState({});
  const [copiedLead, setCopiedLead] = useState(false);

  useEffect(() => {
    getWebsiteContent().then(res => setInstitution(res?.data || {}));
  }, []);

  const [formData, setFormData] = useState({
    // A. Parent Information
    parentName: '',
    mobileNumber: '',
    whatsappNumber: '',
    sameAsMobile: true,
    email: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pinCode: '',

    // B. Student Information
    studentName: '',
    dob: '',
    gender: 'Male',
    currentSchool: '',
    currentClass: 'इ. 4 वी (4th Std)',
    admissionClass: 'इ. 5 वी (5th Std)',

    // C. Admission Information
    academicYear: '2026-2027',
    program: 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)',
    course: 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)',
    preferredContactTime: 'सकाळ 9 ते 12 (Morning 9 AM - 12 PM)',
    message: '',

    // D. Consent
    consent: true,
    whatsappOptIn: true
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
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

    // A. Parent Information
    if (!formData.parentName.trim()) {
      errs.parentName = 'पालकांचे पूर्ण नाव आवश्यक आहे (Parent Name is required).';
    }

    const cleanMobile = formData.mobileNumber.replace(/\D/g, '');
    if (!cleanMobile) {
      errs.mobileNumber = 'मोबाईल नंबर आवश्यक आहे (Mobile Number is required).';
    } else if (cleanMobile.length !== 10) {
      errs.mobileNumber = 'वैध १० अंकी मोबाईल नंबर प्रविष्ट करा (Enter 10-digit number).';
    }

    if (!formData.sameAsMobile) {
      const cleanWa = formData.whatsappNumber.replace(/\D/g, '');
      if (cleanWa && cleanWa.length !== 10) {
        errs.whatsappNumber = 'वैध १० अंकी WhatsApp नंबर प्रविष्ट करा.';
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'वैध ईमेल पत्ता प्रविष्ट करा (Enter valid email).';
    }

    if (!formData.address.trim()) {
      errs.address = 'पत्ता किंवा गावाचे नाव आवश्यक आहे.';
    }

    if (!formData.city.trim()) {
      errs.city = 'तालुका / शहर प्रविष्ट करा.';
    }

    if (formData.pinCode && formData.pinCode.replace(/\D/g, '').length !== 6) {
      errs.pinCode = 'वैध ६ अंकी पिन कोड प्रविष्ट करा.';
    }

    // B. Student Information
    if (!formData.studentName.trim()) {
      errs.studentName = 'विद्यार्थ्याचे पूर्ण नाव आवश्यक आहे (Student Name is required).';
    }

    if (!formData.admissionClass) {
      errs.admissionClass = 'प्रवेश इयत्ता निवडणे आवश्यक आहे.';
    }

    // D. Consent
    if (!formData.consent) {
      errs.consent = 'प्रवेश माहिती व संपर्कासाठी गोपनीयता संमती देणे आवश्यक आहे.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      // Smooth scroll to top of form
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      // Generate client-side idempotency key for network resilience
      const idempotencyKey = `web_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const payload = {
        parentName: formData.parentName.trim(),
        studentName: formData.studentName.trim(),
        mobileNumber: formData.mobileNumber.replace(/\D/g, ''),
        whatsappNumber: formData.whatsappNumber.replace(/\D/g, '') || formData.mobileNumber.replace(/\D/g, ''),
        email: formData.email.trim().toLowerCase(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pinCode: formData.pinCode.trim(),
        dob: formData.dob,
        gender: formData.gender,
        currentSchool: formData.currentSchool.trim(),
        currentClass: formData.currentClass,
        admissionClass: formData.admissionClass,
        academicYear: formData.academicYear,
        program: formData.program,
        course: formData.course,
        preferredContactTime: formData.preferredContactTime,
        message: formData.message.trim(),
        consent: true,
        whatsappOptIn: formData.whatsappOptIn,
        idempotencyKey
      };

      const res = await submitAdmissionEnquiry(payload);

      if (res.success) {
        setSubmittedData({
          ...payload,
          leadNumber: res.leadNumber || 'GB-2026-000101',
          serverMessage: res.message
        });
      } else {
        setServerError(res.message || 'नोंदणी सादर करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setServerError('सर्व्हरशी संपर्क होऊ शकला नाही. कृपया थोड्या वेळाने प्रयत्न करा किंवा हेल्पलाइनवर कॉल करा.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyLeadNumber = (num) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(num);
      setCopiedLead(true);
      setTimeout(() => setCopiedLead(false), 2500);
    }
  };

  const resetForm = () => {
    setSubmittedData(null);
    setServerError(null);
    setFormData({
      parentName: '',
      mobileNumber: '',
      whatsappNumber: '',
      sameAsMobile: true,
      email: '',
      address: '',
      city: '',
      state: 'Maharashtra',
      pinCode: '',
      studentName: '',
      dob: '',
      gender: 'Male',
      currentSchool: '',
      currentClass: 'इ. 4 वी (4th Std)',
      admissionClass: 'इ. 5 वी (5th Std)',
      academicYear: '2026-2027',
      program: 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)',
      course: 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)',
      preferredContactTime: 'सकाळ 9 ते 12 (Morning 9 AM - 12 PM)',
      message: '',
      consent: true,
      whatsappOptIn: true
    });
    setErrors({});
  };

  const primaryPhone = institution.phones?.[0] || '9850449800';

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title="ऑनलाईन प्रवेश अर्ज व चौकशी (2026-2027) | गुरुकुल भोसे"
        description="गुरुकुल भोसे निवासी स्कूल व जुनिअर कॉलेज ऑनलाईन प्रवेश नोंदणी. इ. ५ वी ते १२ वी सैनिक पॅटर्न निवासी, स्कॉलरशिप, नवोदय, NEET, JEE, NDA तयारी."
      />

      <PageHeader
        badge="चालू शैक्षणिक वर्ष 2026-2027 प्रवेश"
        title="ऑनलाईन प्रवेश नोंदणी व चौकशी अर्ज"
        subtitle="इ. ५ वी ते १० वी (सैनिक पॅटर्न निवासी) व ११ वी - १२ वी सायन्स / आर्टस् (डिफेन्स तयारी) प्रवेशासाठी थेट अर्ज करा"
        breadcrumbs={[{ label: 'प्रवेश नोंदणी अर्ज (Admission Enquiry)' }]}
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
                  <p className="text-xs text-slate-500">पारदर्शक व गुणवत्तेनुसार थेट प्रवेश</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                  <span><strong>कोणतीही देणगी नाही (No Donation):</strong> १००% पारदर्शक व गुणवत्तेवर आधारित प्रवेश प्रक्रिया.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                  <span><strong>५ वी ते १० वी:</strong> मराठी व सेमी-इंग्रजी दोन्ही माध्यमे, सर्वसमावेशक सैनिक पॅटर्न शिस्त.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                  <span><strong>११ वी व १२ वी सायन्स:</strong> PCMB, NEET / JEE / NDA विशेष मार्गदर्शन बॅच.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                  <span><strong>स्वतंत्र वसतिगृह:</strong> मुले व मुलींसाठी स्वतंत्र, सुरक्षित व २४ तास CCTV निगराणीयुक्त वसतिगृह.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                  <span><strong>मर्यादित जागा:</strong> प्रत्येक वर्गात केवळ ३० ते ३५ विद्यार्थी, प्रत्येक विद्यार्थ्यावर वैयक्तिक लक्ष.</span>
                </div>
              </div>
            </div>

            {/* Campus Visit Banner */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-6 rounded-3xl shadow-xl space-y-3 border border-emerald-700/50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-emerald-300">प्रत्यक्ष शाळा व कॅम्पस भेट</h4>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                ४ एकर सैनिक पॅटर्न निवासी संकुल, वसतिगृह व क्रीडांगण स्वतः पाहण्यासाठी आपली सोयीची तारीख व वेळ लगेच आरक्षित करा.
              </p>
              <Link
                to="/campus-visit"
                className="w-full inline-flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs transition-all shadow-md"
              >
                <span>शाळा भेट स्लॉट बुक करा (Schedule Visit)</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Helpline Box */}
            <div className="bg-gradient-to-br from-gurukul-navy-950 to-gurukul-navy-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <h4 className="font-bold text-sm text-yellow-400">थेट प्रवेश समुपदेशन कक्ष</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                प्रवेश प्रक्रियेबाबत अधिक माहिती, फी संरचना किंवा कॅम्पस भेटीचे नियोजन करण्यासाठी आमच्या प्रवेश प्रतिनिधींशी संपर्क साधा.
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <a
                  href={`tel:${primaryPhone}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition-all"
                >
                  <Phone className="w-4 h-4 text-gurukul-saffron-400" />
                  <span>थेट फोन: {primaryPhone}</span>
                </a>
                <a
                  href={`https://wa.me/91${primaryPhone}?text=${encodeURIComponent('नमस्कार, मला गुरुकुल भोसे निवासी स्कूल व कॉलेज प्रवेशाबाबत अधिक माहिती हवी आहे.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] font-bold text-white transition-all shadow-md"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                  <span>WhatsApp वर थेट संवाद साधा</span>
                </a>
              </div>
            </div>

            {/* Brochure Link */}
            {institution.brochureUrl && (
              <a
                href={institution.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition-colors"
              >
                <Download className="w-4 h-4 text-gurukul-saffron-600" />
                <span>अधिकृत माहिती पत्रक डाऊनलोड करा (PDF)</span>
              </a>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>डेटा सुरक्षा:</strong> आपला संपर्क तपशील व विद्यार्थ्यांची माहिती पूर्णपणे सुरक्षित ठेवली जाते.
              </span>
            </div>

          </div>

          {/* Right Column: Admission Enquiry Form */}
          <div className="lg:col-span-8">
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
              
              {/* SUCCESS CONFIRMATION STATE */}
              {submittedData ? (
                <div className="py-6 text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      नोंदणी यशस्वीरीत्या प्राप्त झाली
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                      प्रवेश चौकशी अर्ज यशस्वीपणे सबमिट झाला!
                    </h3>
                    <p className="text-sm text-slate-600 max-w-lg mx-auto font-medium">
                      "Thank you! Your admission enquiry has been submitted successfully. Our admission team will contact you soon."
                    </p>
                  </div>

                  {/* Unique Lead Number Banner */}
                  <div className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 max-w-md mx-auto">
                    <p className="text-xs uppercase tracking-wider text-gurukul-saffron-700 font-bold">
                      आपला युनिक लीड नंबर (Unique Lead Number)
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-1.5">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-wider">
                        {submittedData.leadNumber}
                      </span>
                      <button
                        onClick={() => copyLeadNumber(submittedData.leadNumber)}
                        title="Copy Lead Number"
                        className="p-2 rounded-lg bg-white border border-orange-200 text-slate-700 hover:bg-orange-100 transition-colors"
                      >
                        {copiedLead ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      कृपया हा नोंदणी क्रमांक भविष्यातील संदर्भासाठी जपून ठेवा.
                    </p>
                  </div>

                  {/* Submitted Details Summary */}
                  <div className="p-5 bg-slate-50 rounded-2xl max-w-lg mx-auto text-left text-xs space-y-2 border border-slate-200">
                    <h5 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2">
                      सादर केलेल्या अर्जाचा गोषवारा:
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <p><strong>विद्यार्थ्याचे नाव:</strong> {submittedData.studentName}</p>
                      <p><strong>पालकांचे नाव:</strong> {submittedData.parentName}</p>
                      <p><strong>मोबाईल नंबर:</strong> {submittedData.mobileNumber}</p>
                      <p><strong>प्रवेश इयत्ता:</strong> {submittedData.admissionClass}</p>
                      <p><strong>शैक्षणिक वर्ष:</strong> {submittedData.academicYear}</p>
                      <p><strong>निवडलेला कोर्स:</strong> {submittedData.course}</p>
                      <p className="col-span-2"><strong>पत्ता:</strong> {submittedData.address}, {submittedData.city}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                    <a
                      href={`https://wa.me/91${primaryPhone}?text=${encodeURIComponent(`नमस्कार, मी ${submittedData.studentName} यांच्या प्रवेशासाठी ऑनलाईन चौकशी अर्ज भरला आहे. माझा लीड नंबर ${submittedData.leadNumber} आहे.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp वर त्वरित पुष्टी मिळवा</span>
                    </a>

                    <Button variant="outline" size="md" onClick={resetForm} className="rounded-xl">
                      नवीन अर्ज भरा (New Enquiry)
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                  
                  {serverError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-700">
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-bold">त्रुटी आढळली:</p>
                        <p className="mt-0.5">{serverError}</p>
                      </div>
                    </div>
                  )}

                  {/* SECTION A: PARENT INFORMATION */}
                  <div>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                      <User className="w-5 h-5 text-gurukul-saffron-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                        A. पालकांची माहिती (Parent Information)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          पालकांचे पूर्ण नाव (Parent Full Name) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.parentName}
                          onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                          placeholder="उदा. श्री. पांडुरंग महादेव जाधव"
                          className={`w-full text-xs px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                            errors.parentName ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          }`}
                        />
                        {errors.parentName && <p className="text-[11px] text-red-600 mt-1">{errors.parentName}</p>}
                      </div>

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
                          className={`w-full text-xs px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                            errors.mobileNumber ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          }`}
                        />
                        {errors.mobileNumber && <p className="text-[11px] text-red-600 mt-1">{errors.mobileNumber}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
                            <span>मोबाईल नंबरप्रमाणेच (Same as Mobile)</span>
                          </label>
                        </div>
                        <input
                          type="tel"
                          maxLength={10}
                          disabled={formData.sameAsMobile}
                          value={formData.whatsappNumber}
                          onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          placeholder="१० अंकी WhatsApp नंबर"
                          className={`w-full text-xs px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 ${
                            errors.whatsappNumber ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          }`}
                        />
                        {errors.whatsappNumber && <p className="text-[11px] text-red-600 mt-1">{errors.whatsappNumber}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          ईमेल पत्ता (Email Address - Optional)
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="parent@example.com"
                          className={`w-full text-xs px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                            errors.email ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          }`}
                        />
                        {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        पूर्ण पत्ता / मु. पो. (Full Address) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="उदा. मु. पो. भोसे, सांगली-तासगाव रोड"
                        className={`w-full text-xs px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                          errors.address ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                        }`}
                      />
                      {errors.address && <p className="text-[11px] text-red-600 mt-1">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          तालुका / शहर (City / Taluka) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="उदा. मिरज / सांगली"
                          className={`w-full text-xs px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                            errors.city ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          }`}
                        />
                        {errors.city && <p className="text-[11px] text-red-600 mt-1">{errors.city}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          राज्य (State)
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-slate-50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          पिन कोड (PIN Code)
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={formData.pinCode}
                          onChange={(e) => setFormData({ ...formData, pinCode: e.target.value.replace(/\D/g, '') })}
                          placeholder="४१६४१६"
                          className={`w-full text-xs px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                            errors.pinCode ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          }`}
                        />
                        {errors.pinCode && <p className="text-[11px] text-red-600 mt-1">{errors.pinCode}</p>}
                      </div>
                    </div>
                  </div>

                  {/* SECTION B: STUDENT INFORMATION */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                      <GraduationCap className="w-5 h-5 text-gurukul-saffron-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                        B. विद्यार्थ्याची माहिती (Student Information)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          विद्यार्थ्याचे पूर्ण नाव (Student Full Name) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.studentName}
                          onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                          placeholder="उदा. ओंकार पांडुरंग जाधव"
                          className={`w-full text-xs px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                            errors.studentName ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          }`}
                        />
                        {errors.studentName && <p className="text-[11px] text-red-600 mt-1">{errors.studentName}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          लिंग (Gender)
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
                        >
                          <option value="Male">मुलगा (Male)</option>
                          <option value="Female">मुलगी (Female)</option>
                          <option value="Other">इतर (Other)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          जन्मतारीख (Date of Birth)
                        </label>
                        <input
                          type="date"
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          सध्या शिकत असलेली इयत्ता (Current Class)
                        </label>
                        <select
                          value={formData.currentClass}
                          onChange={(e) => setFormData({ ...formData, currentClass: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
                        >
                          <option value="इ. 4 वी (4th Std)">इ. 4 वी (4th Std)</option>
                          <option value="इ. 5 वी (5th Std)">इ. 5 वी (5th Std)</option>
                          <option value="इ. 6 वी (6th Std)">इ. 6 वी (6th Std)</option>
                          <option value="इ. 7 वी (7th Std)">इ. 7 वी (7th Std)</option>
                          <option value="इ. 8 वी (8th Std)">इ. 8 वी (8th Std)</option>
                          <option value="इ. 9 वी (9th Std)">इ. 9 वी (9th Std)</option>
                          <option value="इ. 10 वी (10th Std)">इ. 10 वी (10th Std)</option>
                          <option value="इ. 11 वी (11th Std)">इ. 11 वी (11th Std)</option>
                          <option value="इतर (Other)">इतर (Other)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          कोणत्या इयत्तेसाठी प्रवेश हवा? (Applying For) <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.admissionClass}
                          onChange={(e) => setFormData({ ...formData, admissionClass: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-bold text-gurukul-saffron-700"
                        >
                          <option value="इ. 5 वी (5th Std)">इ. 5 वी (5th Std) - सैनिक पॅटर्न निवासी</option>
                          <option value="इ. 6 वी (6th Std)">इ. 6 वी (6th Std) - सैनिक पॅटर्न निवासी</option>
                          <option value="इ. 7 वी (7th Std)">इ. 7 वी (7th Std) - सैनिक पॅटर्न निवासी</option>
                          <option value="इ. 8 वी (8th Std)">इ. 8 वी (8th Std) - सैनिक पॅटर्न निवासी</option>
                          <option value="इ. 9 वी (9th Std)">इ. 9 वी (9th Std) - सैनिक पॅटर्न निवासी</option>
                          <option value="इ. 10 वी (10th Std)">इ. 10 वी (10th Std) - बोर्ड विशेष बॅच</option>
                          <option value="इ. 11 वी सायन्स (PCMB)">इ. 11 वी सायन्स (PCMB + NEET/JEE/NDA)</option>
                          <option value="इ. 11 वी आर्टस् (Defence / Arts)">इ. 11 वी आर्टस् (Defence / पोलीस भरती)</option>
                          <option value="इ. 12 वी सायन्स (PCMB)">इ. 12 वी सायन्स (PCMB + MHT-CET)</option>
                          <option value="इ. 12 वी आर्टस् (Defence / Arts)">इ. 12 वी आर्टस् (डिफेन्स तयारी)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        सध्याच्या शाळेचे नाव व ठिकाण (Current School)
                      </label>
                      <input
                        type="text"
                        value={formData.currentSchool}
                        onChange={(e) => setFormData({ ...formData, currentSchool: e.target.value })}
                        placeholder="उदा. न्यू इंग्लिश स्कूल, तासगाव"
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* SECTION C: ADMISSION INFORMATION */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                      <Calendar className="w-5 h-5 text-gurukul-saffron-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                        C. प्रवेश व कोर्स माहिती (Admission Information)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          शैक्षणिक वर्ष (Academic Year)
                        </label>
                        <select
                          value={formData.academicYear}
                          onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
                        >
                          <option value="2026-2027">2026-2027 (चालू शैक्षणिक वर्ष)</option>
                          <option value="2027-2028">2027-2028 (पुढील शैक्षणिक वर्ष)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          इच्छुक शाखा / कोर्स (Interested Course) <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.course}
                          onChange={(e) => setFormData({ ...formData, course: e.target.value, program: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
                        >
                          <option value="गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)">गुरुकुल विद्यामंदिर (इ. 5 वी ते 10 वी सैनिक पॅटर्न निवासी)</option>
                          <option value="गुरुकुल जुनियर कॉलेज (सायन्स + NDA / NEET / JEE)">गुरुकुल जुनियर कॉलेज (11 वी - 12 वी सायन्स + NDA / NEET)</option>
                          <option value="गुरुकुल जुनियर कॉलेज (आर्टस् + डिफेन्स अकॅडमी)">गुरुकुल जुनियर कॉलेज (11 वी - 12 वी आर्टस् + पोलीस/आर्मी भरती)</option>
                          <option value="गुरुकुल टॅलेंट सर्च अकॅडमी (स्कॉलरशिप / नवोदय)">गुरुकुल टॅलेंट सर्च अकॅडमी (स्कॉलरशिप व नवोदय तयारी)</option>
                          <option value="गुरुकुल सायन्स निवासी अकॅडमी">गुरुकुल सायन्स निवासी अकॅडमी (NEET / JEE फाउंडेशन)</option>
                          <option value="गुरुकुल निवासी स्पोर्ट्स अकॅडमी">गुरुकुल निवासी स्पोर्ट्स अकॅडमी (क्रीडा व शारीरिक तयारी)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>कॉल करण्यासाठी सोयीची वेळ (Preferred Contact Time)</span>
                        </label>
                        <select
                          value={formData.preferredContactTime}
                          onChange={(e) => setFormData({ ...formData, preferredContactTime: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
                        >
                          <option value="सकाळ 9 ते 12 (Morning 9 AM - 12 PM)">सकाळ 9 ते 12 (Morning 9 AM - 12 PM)</option>
                          <option value="दुपार 12 ते 4 (Afternoon 12 PM - 4 PM)">दुपार 12 ते 4 (Afternoon 12 PM - 4 PM)</option>
                          <option value="संध्याकाळ 4 ते 8 (Evening 4 PM - 8 PM)">संध्याकाळ 4 ते 8 (Evening 4 PM - 8 PM)</option>
                          <option value="कधीही (Anytime)">कधीही (Anytime)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          काही विशेष विचारणा किंवा संदेश? (Additional Message)
                        </label>
                        <input
                          type="text"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="वसतिगृह, मेस किंवा फी संबंधित काही प्रश्न असल्यास..."
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION D: CONSENT & PERMISSION */}
                  <div className="pt-2">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.consent}
                          onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                          className="mt-0.5 rounded text-gurukul-saffron-600 focus:ring-gurukul-saffron-500 w-4 h-4"
                        />
                        <span className="text-xs text-slate-700 leading-relaxed font-medium">
                          <strong>गोपनीयता व प्रवेश संमती (Privacy & Admission Consent):</strong> मी पुष्टी करतो/करते की वर दिलेली सर्व माहिती सत्य व अचूक आहे. मी गुरुकुल भोसे प्रशासनाकडून फोन, SMS किंवा ईमेलद्वारे प्रवेश माहिती व सूचना प्राप्त करण्यास संमती देतो/देते. <span className="text-red-500">*</span>
                        </span>
                      </label>
                      {errors.consent && <p className="text-[11px] text-red-600 pl-7">{errors.consent}</p>}

                      <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-200/80">
                        <input
                          type="checkbox"
                          checked={formData.whatsappOptIn}
                          onChange={(e) => setFormData({ ...formData, whatsappOptIn: e.target.checked })}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span className="text-xs text-slate-700 leading-relaxed">
                          <strong>WhatsApp अपडेट्स संमती (WhatsApp Updates):</strong> मला वरील WhatsApp क्रमांकावर प्रवेश प्रक्रिया, वेळापत्रक, निकाल व कॅम्पस माहितीपत्रक मिळण्यास संमती आहे.
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="xl"
                    isLoading={submitting}
                    className="w-full font-bold uppercase tracking-wider shadow-xl py-3.5 rounded-2xl bg-gradient-to-r from-gurukul-saffron-600 to-gurukul-saffron-700 hover:from-gurukul-saffron-700 hover:to-gurukul-saffron-800"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    <span>प्रवेश अर्ज व चौकशी सादर करा (Submit Enquiry)</span>
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
