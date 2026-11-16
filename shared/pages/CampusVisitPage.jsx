import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Sparkles,
  Building2,
  Compass,
  GraduationCap,
  FileCheck,
  Send,
  Loader2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCRM } from '../contexts/CRMContext';
import { useCMS } from '../contexts/CMSContext';
import { SEO } from '../components/common/SEO';

export const CampusVisitPage = () => {
  const { isMarathi } = useLanguage();
  const { institution } = useCMS();
  const { 
    scheduleCampusVisit, 
    getVisitSlotAvailability, 
    visitPurposes, 
    visitSettings 
  } = useCRM();

  // Form State
  const [formData, setFormData] = useState({
    parentName: '',
    mobileNumber: '',
    whatsappNumber: '',
    email: '',
    studentName: '',
    currentClass: '',
    applyingClass: 'इ. 5 वी (5th Standard)',
    academicYear: '2026-2027',
    requestedDate: '',
    timeSlot: '',
    numberOfVisitors: 2,
    purpose: 'School Admission Enquiry',
    additionalMessage: '',
    preferredContactMethod: 'Phone Call',
    termsAccepted: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  // Available slots for selected date
  const availableSlots = useMemo(() => {
    if (!formData.requestedDate) return [];
    return getVisitSlotAvailability(formData.requestedDate);
  }, [formData.requestedDate, getVisitSlotAvailability]);

  // Tomorrow's date as min date
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError(null);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setFormData(prev => ({
      ...prev,
      requestedDate: newDate,
      timeSlot: '' // Reset slot when date changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.parentName.trim()) {
      setError(isMarathi ? 'कृपया पालकांचे पूर्ण नाव प्रविष्ट करा.' : 'Please enter parent full name.');
      return;
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.replace(/\D/g, '').length < 10) {
      setError(isMarathi ? 'कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.' : 'Please enter valid 10-digit mobile number.');
      return;
    }
    if (!formData.studentName.trim()) {
      setError(isMarathi ? 'कृपया विद्यार्थ्याचे नाव प्रविष्ट करा.' : 'Please enter student full name.');
      return;
    }
    if (!formData.requestedDate) {
      setError(isMarathi ? 'कृपया भेटीची तारीख निवडा.' : 'Please select preferred visit date.');
      return;
    }
    if (!formData.timeSlot) {
      setError(isMarathi ? 'कृपया उपलब्ध वेळेचा स्लॉट निवडा.' : 'Please select an available time slot.');
      return;
    }

    setLoading(true);
    try {
      const res = await scheduleCampusVisit({
        parentName: formData.parentName,
        mobileNumber: formData.mobileNumber,
        whatsappNumber: formData.whatsappNumber || formData.mobileNumber,
        email: formData.email,
        studentName: formData.studentName,
        currentClass: formData.currentClass,
        applyingClass: formData.applyingClass,
        academicYear: formData.academicYear,
        requestedDate: formData.requestedDate,
        timeSlot: formData.timeSlot,
        numberOfVisitors: formData.numberOfVisitors,
        purpose: formData.purpose,
        additionalMessage: formData.additionalMessage
      });

      if (res.success) {
        setSuccessData(res.visit);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError(err.message || (isMarathi ? 'भेट नोंदणी करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' : 'Failed to schedule campus visit.'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccessData(null);
    setFormData({
      parentName: '',
      mobileNumber: '',
      whatsappNumber: '',
      email: '',
      studentName: '',
      currentClass: '',
      applyingClass: 'इ. 5 वी (5th Standard)',
      academicYear: '2026-2027',
      requestedDate: '',
      timeSlot: '',
      numberOfVisitors: 2,
      purpose: 'School Admission Enquiry',
      additionalMessage: '',
      preferredContactMethod: 'Phone Call',
      termsAccepted: true
    });
  };

  const classOptions = [
    'इ. 5 वी (5th Standard)',
    'इ. 6 वी (6th Standard)',
    'इ. 7 वी (7th Standard)',
    'इ. 8 वी (8th Standard)',
    'इ. 9 वी (9th Standard)',
    'इ. 10 वी (10th Standard)',
    'इ. 11 वी सायन्स (11th Science)',
    'इ. 11 वी आर्टस् (11th Arts)',
    'इ. 12 वी सायन्स (12th Science)',
    'इ. 12 वी आर्टस् (12th Arts)',
    'टॅलेंट सर्च अकॅडमी (स्पर्धा परीक्षा)',
    'कम्प्युटर इन्स्टिट्यूट (MS-CIT/Tally)',
    'स्पोर्ट्स अकॅडमी (सैनिक/पोलीस भरती)'
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <SEO
        title={isMarathi ? "शाळा भेट नोंदणी • गुरुकुल भोसे" : "Schedule Campus Visit • Gurukul Bhose"}
        description={isMarathi ? "गुरुकुल भोसे 4 एकर सैनिक पॅटर्न निवासी कॅम्पस भेटीची वेळ आरक्षित करा." : "Book your guided campus visit to Gurukul Bhose Residential School & College."}
      />

      <div className="max-w-4xl mx-auto">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-gurukul-navy-900 via-gurukul-navy-800 to-gurukul-navy-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden mb-8 border border-slate-700/50">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gurukul-saffron-500/20 text-gurukul-saffron-300 border border-gurukul-saffron-400/30 rounded-full text-xs font-bold mb-4">
              <Compass className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'प्रत्यक्ष शाळा व कॅम्पस भेट' : 'Personal Campus Tour & Counseling'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isMarathi ? 'गुरुकुल भोसे कॅम्पस भेट नोंदणी' : 'Schedule a Campus Visit'}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              {isMarathi 
                ? '४ एकर निसर्गरम्य परिसर, सैनिक पॅटर्न हॉस्टेल, आधुनिक लॅब आणि क्रीडांगण प्रत्यक्ष पाहण्यासाठी आपली सोयीची तारीख व वेळ आरक्षित करा.'
                : 'Experience our 4-acre scenic residential campus, meet academic counselors, and explore facilities firsthand.'}
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
            <Building2 className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Success View */}
        {successData ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-100 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 uppercase tracking-wider">
              {isMarathi ? 'भेट नोंदणी यशस्वी' : 'Visit Request Submitted'}
            </span>

            <h2 className="text-2xl font-black text-slate-900 mt-4">
              {isMarathi ? 'आपली कॅम्पस भेट यशस्वीरित्या नोंदवली आहे!' : 'Campus Visit Successfully Scheduled!'}
            </h2>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto">
              <p className="text-xs text-slate-500 font-medium">{isMarathi ? 'भेट संदर्भ क्रमांक (Visit Request No)' : 'Visit Reference Number'}</p>
              <p className="text-2xl font-mono font-black text-gurukul-navy-900 tracking-wider mt-1">
                {successData.visitNumber}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left text-xs bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">{isMarathi ? 'विद्यार्थी नाव:' : 'Student Name:'}</span>
                <span className="font-bold text-slate-800 text-sm">{successData.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isMarathi ? 'प्रवेश इयत्ता:' : 'Applying Class:'}</span>
                <span className="font-bold text-slate-800 text-sm">{successData.applyingClass}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isMarathi ? 'भेटीची तारीख:' : 'Visit Date:'}</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                  {successData.requestedDate}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">{isMarathi ? 'वेळेचा स्लॉट:' : 'Time Slot:'}</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                  {successData.timeSlot}
                </span>
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-600 max-w-lg mx-auto bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-1">
              <p className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                {isMarathi ? 'पालकांसाठी महत्त्वाची सूचना:' : 'Important Information for Parents:'}
              </p>
              <p>{isMarathi 
                ? 'शाळेचे प्रवेश समुपदेशक आपल्याशी संपर्क साधून भेट निश्चितीचा संदेश पाठवतील. प्रत्यक्ष भेटीच्या दिवशी कृपया विद्यार्थ्याचे मागील गुणपत्रक सोबत आणावे.' 
                : 'Our admission counselor will contact you shortly to confirm your slot. Please carry previous academic report cards during your visit.'}</p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={resetForm}
                className="w-full sm:w-auto px-6 py-2.5 bg-gurukul-navy-900 text-white rounded-xl text-xs font-bold hover:bg-gurukul-navy-800 transition-colors shadow-sm"
              >
                {isMarathi ? 'दुसरी भेट नोंदवा' : 'Schedule Another Visit'}
              </button>
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors text-center"
              >
                {isMarathi ? 'मुख्यपृष्ठावर जा' : 'Return to Home'}
              </Link>
            </div>
          </div>
        ) : (
          /* Visit Request Form */
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 space-y-8">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{isMarathi ? 'नोंदणी त्रुटी' : 'Submission Error'}</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Section A: Parent Information */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <Users className="w-5 h-5 text-gurukul-saffron-600" />
                <h2 className="text-base font-bold text-slate-900">
                  {isMarathi ? 'अ) पालकांची माहिती (Parent Information)' : 'A) Parent Information'}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'पालकांचे पूर्ण नाव *' : 'Parent Full Name *'}
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder={isMarathi ? 'उदा. सुरेश विठ्ठल जाधव' : 'e.g. Suresh Vitthal Jadhav'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gurukul-saffron-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'मोबाईल नंबर *' : 'Mobile Number *'}
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="९८२२०१२३४५"
                    maxLength={10}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gurukul-saffron-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'व्हॉट्सॲप नंबर' : 'WhatsApp Number'}
                  </label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder={isMarathi ? 'मोबाईल नंबर सारखा असल्यास रिकामे ठेवा' : 'Leave blank if same as mobile'}
                    maxLength={10}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gurukul-saffron-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'ईमेल पत्ता (ऐच्छिक)' : 'Email Address (Optional)'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="suresh@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gurukul-saffron-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Student Information */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <GraduationCap className="w-5 h-5 text-gurukul-saffron-600" />
                <h2 className="text-base font-bold text-slate-900">
                  {isMarathi ? 'ब) विद्यार्थ्याची माहिती (Student Information)' : 'B) Student Information'}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'विद्यार्थ्याचे पूर्ण नाव *' : 'Student Full Name *'}
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder={isMarathi ? 'उदा. रोहन सुरेश जाधव' : 'e.g. Rohan Suresh Jadhav'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gurukul-saffron-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'सध्याची इयत्ता' : 'Current Class'}
                  </label>
                  <input
                    type="text"
                    name="currentClass"
                    value={formData.currentClass}
                    onChange={handleChange}
                    placeholder={isMarathi ? 'उदा. इयत्ता ७ वी' : 'e.g. 7th Standard'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gurukul-saffron-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'प्रवेशासाठी इच्छित इयत्ता *' : 'Applying For Class *'}
                  </label>
                  <select
                    name="applyingClass"
                    value={formData.applyingClass}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gurukul-saffron-500 focus:border-transparent outline-none bg-white"
                    required
                  >
                    {classOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section C: Visit Scheduling & Slot Picker */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <Calendar className="w-5 h-5 text-gurukul-saffron-600" />
                <h2 className="text-base font-bold text-slate-900">
                  {isMarathi ? 'क) भेटीची वेळ व स्लॉट निवड (Visit Schedule & Slot)' : 'C) Visit Schedule & Slot'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'भेटीची तारीख *' : 'Preferred Visit Date *'}
                  </label>
                  <input
                    type="date"
                    name="requestedDate"
                    min={minDate}
                    value={formData.requestedDate}
                    onChange={handleDateChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gurukul-saffron-500 focus:border-transparent outline-none bg-white"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {isMarathi ? 'सोमवार ते शनिवार उपलब्ध (सकाळी १० ते ४)' : 'Monday to Saturday (10 AM to 4 PM)'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'एकूण व्यक्ती संख्या *' : 'Number of Visitors *'}
                  </label>
                  <select
                    name="numberOfVisitors"
                    value={formData.numberOfVisitors}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gurukul-saffron-500 focus:border-transparent outline-none bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} {isMarathi ? 'व्यक्ती' : 'Person(s)'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'भेटीचा मुख्य उद्देश *' : 'Purpose of Visit *'}
                  </label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gurukul-saffron-500 focus:border-transparent outline-none bg-white"
                  >
                    {visitPurposes.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Slot Grid Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {isMarathi ? 'उपलब्ध वेळेचा स्लॉट निवडा *' : 'Select Available Time Slot *'}
                </label>

                {!formData.requestedDate ? (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    <Calendar className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                    <span>{isMarathi ? 'कृपया प्रथम भेटीची तारीख निवडा, जेणेकरून उपलब्ध स्लॉट्स दिसतील.' : 'Please select a date first to view real-time available slots.'}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {availableSlots.map(({ slot, available, bookedCount, remainingCapacity, reason }) => {
                      const isSelected = formData.timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={!available}
                          onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot }))}
                          className={`p-3 rounded-xl border text-left transition-all relative ${
                            !available
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-gurukul-saffron-50 border-gurukul-saffron-500 text-gurukul-navy-900 shadow-sm ring-1 ring-gurukul-saffron-500'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{slot}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-600" />}
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[10px]">
                            {available ? (
                              <span className="text-emerald-600 font-semibold">
                                {isMarathi ? `शिल्लक जागा: ${remainingCapacity}` : `${remainingCapacity} seats left`}
                              </span>
                            ) : (
                              <span className="text-rose-500 font-semibold">{reason || (isMarathi ? 'पूर्ण आरक्षित' : 'Full')}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Section D: Notes & Submit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'काही विशेष प्रश्न किंवा संदेश (ऐच्छिक)' : 'Additional Message or Specific Inquiries'}
              </label>
              <textarea
                name="additionalMessage"
                value={formData.additionalMessage}
                onChange={handleChange}
                rows={3}
                placeholder={isMarathi ? 'उदा. आम्हाला वसतिगृह व जेवणाची व्यवस्था प्रत्यक्ष पाहायची आहे.' : 'e.g. We wish to inspect hostel and dining facilities during our visit.'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gurukul-saffron-500 focus:border-transparent outline-none"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gurukul-saffron-500 shrink-0" />
                <span>{institution?.address?.taluka ? `भोसे (ता. ${institution.address.taluka}, सांगली)` : 'भोसे (ता. मिरज, जि. सांगली)'}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-gurukul-saffron-500 to-gurukul-saffron-600 hover:from-gurukul-saffron-600 hover:to-gurukul-saffron-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isMarathi ? 'नोंदणी करत आहे...' : 'Scheduling Visit...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isMarathi ? 'कॅम्पस भेट आरक्षित करा (Confirm Booking)' : 'Confirm Campus Visit'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CampusVisitPage;
