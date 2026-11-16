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

export const CMSContactPage = () => {
  const { institution, updateInstitution } = useCMS();

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
      return 'कृपया संस्थेचे नाव भरा.';
    }

    // Validate primary phone
    const cleanPrimaryPhone = (formData.phones?.[0] || '').replace(/\D/g, '');
    if (!cleanPrimaryPhone || cleanPrimaryPhone.length < 10) {
      return 'कृपया वैध १० अंकी मुख्य फोन नंबर प्रविष्ट करा.';
    }

    // Validate WhatsApp
    const cleanWhatsApp = (formData.whatsapp || '').replace(/\D/g, '');
    if (!cleanWhatsApp || cleanWhatsApp.length < 10) {
      return 'कृपया वैध १० अंकी WhatsApp क्रमांक प्रविष्ट करा.';
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email.trim())) {
      return 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.';
    }

    if (formData.admissionEmail && !emailRegex.test(formData.admissionEmail.trim())) {
      return 'कृपया प्रवेश विभागासाठी वैध ईमेल प्रविष्ट करा.';
    }

    // Validate URL if provided
    if (formData.googleMapsUrl && !/^https?:\/\//i.test(formData.googleMapsUrl.trim())) {
      return 'Google Maps लिंक "http://" किंवा "https://" ने सुरू होणे आवश्यक आहे.';
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
      setMessage({ type: 'success', text: 'संपर्क माहिती व पत्ता यशस्वीरीत्या अद्यतनित झाला (Contact info updated successfully).' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'जतन करताना त्रुटी आली.' });
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
            title="CMS डॅशबोर्डवर परत जा"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gurukul-navy-900 flex items-center gap-2">
              <PhoneCall className="w-7 h-7 text-gurukul-saffron-600" />
              <span>संपर्क व पत्ता व्यवस्थापन (Contact CMS)</span>
            </h1>
            <p className="text-sm text-slate-500">
              शाळेचे अधिकृत फोन नंबर, WhatsApp क्रमांक, ईमेल, नकाशा व कार्यालयीन वेळ व्यवस्थापित करा.
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
          <span>{saving ? 'जतन करत आहे...' : 'बदल सेव्ह करा (Save Changes)'}</span>
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
            <span>संस्थेचे नाव व ब्रीदवाक्य (Institution Identity)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                संस्थेचे अधिकृत नाव (Institution Name) *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="गुरुकुल भोसे"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                ब्रीदवाक्य / टॅगलाइन (Tagline)
              </label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                placeholder="सैनिक पॅटर्न निवासी शाळा व जुनियर कॉलेज"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 1: Phone Numbers & WhatsApp */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Phone className="w-5 h-5 text-gurukul-saffron-600" />
            <span>दूरध्वनी व व्हॉट्सॲप (Phone & WhatsApp Details)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                मुख्य फोन नंबर (Primary Phone) *
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
                दुय्यम फोन नंबर २ (Secondary Phone)
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
                हेल्पलाईन / फोन ३ (Helpline)
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
                अधिकृत WhatsApp क्रमांक (WhatsApp Number) *
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
                अधिकृत ईमेल (General Email) *
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
                प्रवेश विभाग ईमेल (Admission Email)
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
            <span>पत्ता व कार्यालयीन वेळा (Campus Address & Office Hours)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                पत्ता ओळ (Address Line 1)
              </label>
              <input
                type="text"
                value={formData.address?.line1 || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                placeholder="गुरुकुल संकुल, भोसे"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                महत्त्वाचा खूण / लँडमार्क (Landmark)
              </label>
              <input
                type="text"
                value={formData.address?.landmark || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, landmark: e.target.value } }))}
                placeholder="मिरज-पंढरपूर हायवे लगत, नायरा पंपाच्या मागे"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                तालुका (Taluka)
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
                जिल्हा (District)
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
                राज्य (State)
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
                पिनकोड (Pincode)
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
              कार्यालयीन वेळ व पालक भेट (Office Hours & Parent Visiting Timings)
            </label>
            <textarea
              rows={2}
              value={formData.officeHours || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, officeHours: e.target.value, workingHours: e.target.value }))}
              placeholder="सोमवार ते शनिवार: सकाळी ९:०० ते संध्याकाळी ६:००..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                गुगल मॅप लिंक (Google Maps Link)
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
                गुगल मॅप एम्बेड URL (Google Maps Embed iframe src)
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
            <span>सोशल मीडिया लिंक्स (Official Social Links)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                फेसबुक (Facebook)
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
                इन्स्टाग्राम (Instagram)
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
                यूट्यूब (YouTube)
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
