import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  ShieldAlert, 
  RotateCcw, 
  Megaphone,
  Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../../contexts/CMSContext';
import { uploadMediaFile, validateUploadFile } from '../../../services/storage/mediaUploadService';

export const CMSSettingsPage = () => {
  const { websiteSettings, updateSettings, resetToDefaults } = useCMS();

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [message, setMessage] = useState(null);

  const defaultSettings = {
    websiteName: 'गुरुकुल भोसे',
    tagline: 'सैनिक पॅटर्न निवासी शाळा व ज्युनिअर कॉलेज, भोसे (मिरज)',
    logoUrl: '',
    faviconUrl: '',
    brochureUrl: '',
    admissionStatus: 'open', // 'open' | 'closed'
    maintenanceMode: false,
    maintenanceMessage: 'वेबसाईटवर सध्या देखभाल काम सुरू आहे. कृपया काही वेळाने पुन्हा भेट द्या.',
    announcementBar: {
      enabled: true,
      text: 'शैक्षणिक वर्ष २०२५-२६ करिता इ. ५ वी ते १२ वी सैनिक पॅटर्न निवासी प्रवेश सुरू आहेत!',
      link: '/admission-enquiry',
      buttonText: 'प्रवेश अर्ज करा'
    },
    footerCopyright: `© ${new Date().getFullYear()} गुरुकुल भोसे. सर्व हक्क सुरक्षित.`,
    registrationNo: 'शासन मान्यता क्र. : शिक्षण/२०१४/प्र.क्र.२२५/प्राशि-१'
  };

  const [formData, setFormData] = useState(defaultSettings);

  useEffect(() => {
    if (websiteSettings) {
      setFormData(prev => ({
        ...prev,
        ...websiteSettings,
        announcementBar: {
          ...prev.announcementBar,
          ...(websiteSettings.announcementBar || {})
        }
      }));
    }
  }, [websiteSettings]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error });
      return;
    }

    try {
      setUploadingLogo(true);
      const res = await uploadMediaFile(file, 'logo', `logo_${Date.now()}`);
      const uploadedUrl = res.downloadURL || res.url;
      setFormData(prev => ({ ...prev, logoUrl: uploadedUrl }));
      setMessage({ type: 'success', text: 'लोगो यशस्वीरीत्या अपलोड झाला.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'लोगो अपलोड करताना त्रुटी आली.' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error });
      return;
    }

    try {
      setUploadingFavicon(true);
      const res = await uploadMediaFile(file, 'logo', `favicon_${Date.now()}`);
      const uploadedUrl = res.downloadURL || res.url;
      setFormData(prev => ({ ...prev, faviconUrl: uploadedUrl }));
      setMessage({ type: 'success', text: 'Favicon आयकॉन यशस्वीरीत्या अपलोड झाला.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Favicon अपलोड करताना त्रुटी आली.' });
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleBrochureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file, true); // PDF
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error });
      return;
    }

    try {
      setUploadingBrochure(true);
      const res = await uploadMediaFile(file, 'notices', `gurukul_brochure_${Date.now()}`);
      const uploadedUrl = res.downloadURL || res.url;
      setFormData(prev => ({ ...prev, brochureUrl: uploadedUrl }));
      setMessage({ type: 'success', text: 'माहिती पत्रक (Brochure PDF) यशस्वीरीत्या अपलोड झाले.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'माहिती पत्रक अपलोड करताना त्रुटी आली.' });
    } finally {
      setUploadingBrochure(false);
    }
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateSettings(formData);
      setMessage({ type: 'success', text: 'वेबसाईट सेटिंग्ज यशस्वीरीत्या अद्यतनित झाल्या!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'जतन करताना त्रुटी आली.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (!window.confirm('तुम्हाला खात्री आहे की सर्व मूळ डिफॉल्ट्स पुनर्संचयित करायचे आहेत? (यामुळे सर्व CMS तात्पुरता मूळ स्थितीत येईल)')) {
      return;
    }

    resetToDefaults();
    setMessage({ type: 'success', text: 'मूळ संस्थात्मक डेटा यशस्वीरीत्या लोड केला.' });
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
              <Settings className="w-7 h-7 text-gurukul-saffron-600" />
              <span>वेबसाईट सेटिंग्ज व ब्रँडिंग (Website Settings)</span>
            </h1>
            <p className="text-sm text-slate-500">
              लोगो, Favicon, माहिती पत्रक, कॉपीराइट, मेन्टेनन्स मोड व प्रवेश स्थिती व्यवस्थापित करा.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="मूळ संस्थात्मक माहितीवर रीसेट करा"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>डिफॉल्ट्स रीसेट करा</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'जतन करत आहे...' : 'सेटिंग्ज सेव्ह करा'}</span>
          </button>
        </div>
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
        {/* Section 1: Branding & Identity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gurukul-navy-900 pb-3 border-b border-slate-100">
            ब्रँडिंग व संस्था माहिती (Branding & Identity)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                संस्थेचे नाव (Website Name) *
              </label>
              <input
                type="text"
                required
                value={formData.websiteName}
                onChange={(e) => setFormData(prev => ({ ...prev, websiteName: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                अधिकृत टॅगलाईन (Tagline) *
              </label>
              <input
                type="text"
                required
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                वेबसाईट लोगो (Logo Image)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.logoUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="लोगो URL किंवा अपलोड"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                  <span>{uploadingLogo ? '...' : 'अपलोड'}</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
              {formData.logoUrl && (
                <div className="mt-2 h-12 w-24 p-1 rounded-lg border border-slate-200 bg-slate-900 flex items-center justify-center">
                  <img src={formData.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                फेव्हिकॉन (Favicon Icon - 32x32)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.faviconUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, faviconUrl: e.target.value }))}
                  placeholder="Favicon URL किंवा अपलोड"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                  <span>{uploadingFavicon ? '...' : 'अपलोड'}</span>
                  <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
                </label>
              </div>
              {formData.faviconUrl && (
                <div className="mt-2 h-8 w-8 p-1 rounded-md border border-slate-200 bg-white flex items-center justify-center">
                  <img src={formData.faviconUrl} alt="Favicon Preview" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                माहिती पत्रक (Brochure PDF)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.brochureUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, brochureUrl: e.target.value }))}
                  placeholder="Brochure PDF URL"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                  <span>{uploadingBrochure ? '...' : 'PDF'}</span>
                  <input type="file" accept="application/pdf" onChange={handleBrochureUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Announcement Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-gurukul-saffron-600" />
              <span>वेबसाईट शीर्ष सूचना पट्टी (Top Announcement Bar)</span>
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.announcementBar?.enabled !== false}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  announcementBar: { ...prev.announcementBar, enabled: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gurukul-saffron-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              सूचना मजकूर (Announcement Headline)
            </label>
            <input
              type="text"
              value={formData.announcementBar?.text || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                announcementBar: { ...prev.announcementBar, text: e.target.value }
              }))}
              placeholder="उदा. शैक्षणिक वर्ष २०२५-२६ करिता प्रवेश सुरू..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                बटन मजकूर (Button Text)
              </label>
              <input
                type="text"
                value={formData.announcementBar?.buttonText || 'प्रवेश अर्ज करा'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  announcementBar: { ...prev.announcementBar, buttonText: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                बटन लिंक (Target Link)
              </label>
              <input
                type="text"
                value={formData.announcementBar?.link || '/admission-enquiry'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  announcementBar: { ...prev.announcementBar, link: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Admissions & Maintenance Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gurukul-navy-900 pb-3 border-b border-slate-100">
            कार्यप्रणाली व प्रवेश नियंत्रण (System Controls)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-gurukul-navy-900 block">
                  प्रवेश चौकशी फॉर्म स्थिती (Admission Enquiries)
                </span>
                <span className="text-xs text-slate-500">
                  नवीन वर्षाच्या प्रवेश चौकशी फॉर्मची स्वीकार्यता
                </span>
              </div>
              <select
                value={formData.admissionStatus || 'open'}
                onChange={(e) => setFormData(prev => ({ ...prev, admissionStatus: e.target.value }))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
              >
                <option value="open">🟢 प्रवेश सुरू (Open)</option>
                <option value="closed">🔴 प्रवेश बंद (Closed)</option>
              </select>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-gurukul-navy-900 block flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>देखभाल मोड (Maintenance Mode)</span>
                </span>
                <span className="text-xs text-slate-500">
                  सुरू केल्यास सार्वजनिक वेबसाईट तात्पुरती बंद दिसेल
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          {formData.maintenanceMode && (
            <div className="animate-in fade-in">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                देखभाल संदेश (Maintenance Notice to Visitors)
              </label>
              <textarea
                rows={2}
                value={formData.maintenanceMessage || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                className="w-full px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs focus:bg-white outline-none"
              />
            </div>
          )}
        </div>

        {/* Section 4: Legal & Footer */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gurukul-navy-900 pb-3 border-b border-slate-100">
            नोंदणी व फुटर कायदेशीर तपशील (Footer & Legal)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                कॉपीराइट मजकूर (Footer Copyright Text)
              </label>
              <input
                type="text"
                value={formData.footerCopyright || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, footerCopyright: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                शासन मान्यता क्र. / नोंदणी क्रमांक (Registration No.)
              </label>
              <input
                type="text"
                value={formData.registrationNo || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationNo: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CMSSettingsPage;
