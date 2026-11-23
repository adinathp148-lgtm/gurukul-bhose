import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Save, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Share2,
  Building,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../../contexts/CMSContext';
import { useLanguage } from '../../../contexts/LanguageContext';

export const CMSContactPage = () => {
  const { institution, updateInstitution } = useCMS();
  const { isMarathi } = useLanguage();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const defaultContactData = {
    name: 'गुरुकुल भोसे',
    tagline: 'सैनिक पॅटर्न निवासी शाळा व जुनियर कॉलेज',
    address: {
      line1: 'गुरुकुल संकुल, दंडोबा डोंगर पायथ्याला, यल्लामा मंदिर जवळ',
      taluka: 'मिरज',
      district: 'सांगली',
      state: 'महाराष्ट्र',
      pincode: '416410',
      landmark: 'मिरज-पंढरपूर हायवे लगत, नायरा पेट्रोल पंपाच्या मागे'
    },
    phones: ['9850449800', '9850449808', '7020260968'],
    whatsapp: '9850449800',
    email: 'contact@gurukulbhose.com',
    admissionEmail: 'admission@gurukulbhose.com',
    officeHours: 'सोमवार ते शनिवार: सकाळी ९:०० ते संध्याकाळी ६:०० (रविवार भेट वेळ: सकाळी १० ते दुपारी २)',
    googleMapsUrl: 'https://maps.google.com/?q=Gurukul+Bhose+Miraj+Sangli',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15277.937222415177!2d74.75549!3d16.80287!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1230000000001%3A0x1!2sBhose%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    socials: {
      facebook: 'https://facebook.com/gurukulbhose',
      instagram: 'https://instagram.com/gurukulbhose',
      youtube: 'https://youtube.com/@gurukulbhose'
    }
  };

  const [formData, setFormData] = useState(defaultContactData);

  useEffect(() => {
    if (institution) {
      setFormData(prev => ({
        ...prev,
        ...institution,
        address: {
          ...prev.address,
          ...(typeof institution.address === 'object' ? institution.address : {})
        },
        socials: {
          ...prev.socials,
          ...(institution.socials || {})
        }
      }));
    }
  }, [institution]);

  const handlePhoneChange = (index, value) => {
    setFormData(prev => {
      const updated = [...(prev.phones || [])];
      updated[index] = value;
      return { ...prev, phones: updated };
    });
  };

  const validateInputs = () => {
    if (!formData.name?.trim()) {
      return isMarathi ? 'कृपया संस्थेचे नाव भरा.' : 'Please enter the institution name.';
    }

    // Validate primary phone
    const cleanPrimaryPhone = (formData.phones?.[0] || '').replace(/\D/g, '');
    if (!cleanPrimaryPhone || cleanPrimaryPhone.length < 10) {
      return isMarathi
        ? 'कृपया वैध १० अंकी मुख्य फोन नंबर प्रविष्ट करा.'
        : 'Please enter a valid 10-digit primary phone number.';
    }

    // Validate WhatsApp
    const cleanWhatsApp = (formData.whatsapp || '').replace(/\D/g, '');
    if (!cleanWhatsApp || cleanWhatsApp.length < 10) {
      return isMarathi
        ? 'कृपया वैध १० अंकी WhatsApp क्रमांक प्रविष्ट करा.'
        : 'Please enter a valid 10-digit WhatsApp number.';
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email.trim())) {
      return isMarathi ? 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.' : 'Please enter a valid email address.';
    }

    if (formData.admissionEmail && !emailRegex.test(formData.admissionEmail.trim())) {
      return isMarathi
        ? 'कृपया प्रवेश विभागासाठी वैध ईमेल प्रविष्ट करा.'
        : 'Please enter a valid email address for the admission department.';
    }

    // Validate URL if provided
    if (formData.googleMapsUrl && !/^https?:\/\//i.test(formData.googleMapsUrl.trim())) {
      return isMarathi
        ? 'Google Maps लिंक "http://" किंवा "https://" ने सुरू होणे आवश्यक आहे.'
        : 'Google Maps URL must start with "http://" or "https://".';
    }

    return null;
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setMessage(null);

    const validationErr = validateInputs();
    if (validationErr) {
      setMessage({ type: 'error', text: validationErr });
      return;
    }

    setSaving(true);
    try {
      await updateInstitution(formData);
      setMessage({
        type: 'success',
        text: isMarathi
          ? 'संपर्क माहिती व पत्ता यशस्वीरीत्या अद्यतनित झाला.'
          : 'Contact info and address updated successfully.'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || (isMarathi ? 'जतन करताना त्रुटी आली.' : 'Error saving contact information.')
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/cms" 
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title={isMarathi ? 'CMS डॅशबोर्डवर परत जा' : 'Back to CMS Dashboard'}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gurukul-navy-900 flex items-center gap-2">
              <PhoneCall className="w-7 h-7 text-gurukul-saffron-600" />
              <span>{isMarathi ? 'संपर्क व पत्ता व्यवस्थापन (Contact CMS)' : 'Contact & Address Management (CMS)'}</span>
            </h1>
            <p className="text-sm text-slate-500">
              {isMarathi
                ? 'शाळेचे अधिकृत फोन नंबर, WhatsApp क्रमांक, ईमेल, नकाशा व कार्यालयीन वेळ व्यवस्थापित करा.'
                : 'Manage official school phone numbers, WhatsApp number, emails, map, and office hours.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? (isMarathi ? 'जतन करत आहे...' : 'Saving...') : (isMarathi ? 'बदल सेव्ह करा' : 'Save Changes')}</span>
        </button>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold animate-in fade-in ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 0: Institution Identity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-gurukul-saffron-600" />
            <span>{isMarathi ? 'संस्थेचे नाव व ब्रीदवाक्य (Institution Identity)' : 'Institution Identity'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'संस्थेचे अधिकृत नाव (Institution Name) *' : 'Official Institution Name *'}
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={isMarathi ? 'गुरुकुल भोसे' : 'Gurukul Bhose'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'ब्रीदवाक्य / टॅगलाइन (Tagline)' : 'Tagline'}
              </label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                placeholder={isMarathi ? 'सैनिक पॅटर्न निवासी शाळा व जुनियर कॉलेज' : 'Sainik Pattern Residential School & Junior College'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 1: Phone Numbers & WhatsApp */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Phone className="w-5 h-5 text-gurukul-saffron-600" />
            <span>{isMarathi ? 'दूरध्वनी व व्हॉट्सॲप (Phone & WhatsApp Details)' : 'Phone & WhatsApp Details'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'मुख्य फोन नंबर (Primary Phone) *' : 'Primary Phone *'}
              </label>
              <input
                type="text"
                required
                value={formData.phones?.[0] || ''}
                onChange={(e) => handlePhoneChange(0, e.target.value)}
                placeholder="9850449800"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'दुय्यम फोन नंबर २ (Secondary Phone)' : 'Secondary Phone'}
              </label>
              <input
                type="text"
                value={formData.phones?.[1] || ''}
                onChange={(e) => handlePhoneChange(1, e.target.value)}
                placeholder="9850449808"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'हेल्पलाईन / फोन ३ (Helpline)' : 'Helpline / Phone 3'}
              </label>
              <input
                type="text"
                value={formData.phones?.[2] || ''}
                onChange={(e) => handlePhoneChange(2, e.target.value)}
                placeholder="7020260968"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'अधिकृत WhatsApp क्रमांक (WhatsApp Number) *' : 'Official WhatsApp Number *'}
              </label>
              <input
                type="text"
                required
                value={formData.whatsapp || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="9850449800"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'अधिकृत ईमेल (General Email) *' : 'General Email *'}
              </label>
              <input
                type="email"
                required
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@gurukulbhose.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'प्रवेश विभाग ईमेल (Admission Email)' : 'Admission Email'}
              </label>
              <input
                type="email"
                value={formData.admissionEmail || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, admissionEmail: e.target.value }))}
                placeholder="admission@gurukulbhose.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address & Timings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-gurukul-saffron-600" />
            <span>{isMarathi ? 'पत्ता व कार्यालयीन वेळा (Campus Address & Office Hours)' : 'Campus Address & Office Hours'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'पत्ता ओळ (Address Line 1)' : 'Address Line 1'}
              </label>
              <input
                type="text"
                value={formData.address?.line1 || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                placeholder={isMarathi ? 'गुरुकुल संकुल, भोसे' : 'Gurukul Campus, Bhose'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'महत्त्वाचा खूण / लँडमार्क (Landmark)' : 'Landmark'}
              </label>
              <input
                type="text"
                value={formData.address?.landmark || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, landmark: e.target.value } }))}
                placeholder={isMarathi ? 'मिरज-पंढरपूर हायवे लगत, नायरा पंपाच्या मागे' : 'Miraj-Pandharpur Highway, Behind Nayara Petrol Pump'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'तालुका (Taluka)' : 'Taluka'}
              </label>
              <input
                type="text"
                value={formData.address?.taluka || 'मिरज'}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, taluka: e.target.value } }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'जिल्हा (District)' : 'District'}
              </label>
              <input
                type="text"
                value={formData.address?.district || 'सांगली'}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, district: e.target.value } }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'राज्य (State)' : 'State'}
              </label>
              <input
                type="text"
                value={formData.address?.state || 'महाराष्ट्र'}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'पिनकोड (Pincode)' : 'Pincode'}
              </label>
              <input
                type="text"
                value={formData.address?.pincode || '416410'}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, pincode: e.target.value } }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {isMarathi ? 'कार्यालयीन वेळ व पालक भेट (Office Hours & Parent Visiting Timings)' : 'Office Hours & Parent Visiting Timings'}
            </label>
            <textarea
              rows={2}
              value={formData.officeHours || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, officeHours: e.target.value, workingHours: e.target.value }))}
              placeholder={isMarathi ? 'सोमवार ते शनिवार: सकाळी ९:०० ते संध्याकाळी ६:००...' : 'Monday to Saturday: 9:00 AM to 6:00 PM...'}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'गुगल मॅप लिंक (Google Maps Link)' : 'Google Maps Link'}
              </label>
              <input
                type="text"
                value={formData.googleMapsUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
                placeholder="https://maps.google.com/?q=Gurukul+Bhose..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'गुगल मॅप एम्बेड URL (Google Maps Embed iframe src)' : 'Google Maps Embed iframe URL'}
              </label>
              <input
                type="text"
                value={formData.mapEmbedUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mapEmbedUrl: e.target.value }))}
                placeholder="https://www.google.com/maps/embed?..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white outline-none"
              />
            </div>
          </div>

          {formData.mapEmbedUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 h-48 bg-slate-100">
              <iframe
                src={formData.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                title="Preview Campus Location"
              />
            </div>
          )}
        </div>

        {/* Section 3: Social Media Links */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Share2 className="w-5 h-5 text-gurukul-saffron-600" />
            <span>{isMarathi ? 'सोशल मीडिया लिंक्स (Official Social Links)' : 'Official Social Media Links'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'फेसबुक (Facebook)' : 'Facebook'}
              </label>
              <input
                type="text"
                value={formData.socials?.facebook || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, socials: { ...prev.socials, facebook: e.target.value } }))}
                placeholder="https://facebook.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'इन्स्टाग्राम (Instagram)' : 'Instagram'}
              </label>
              <input
                type="text"
                value={formData.socials?.instagram || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, socials: { ...prev.socials, instagram: e.target.value } }))}
                placeholder="https://instagram.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'यूट्यूब (YouTube)' : 'YouTube'}
              </label>
              <input
                type="text"
                value={formData.socials?.youtube || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, socials: { ...prev.socials, youtube: e.target.value } }))}
                placeholder="https://youtube.com/@..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CMSContactPage;
