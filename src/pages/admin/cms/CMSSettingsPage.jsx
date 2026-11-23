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
import { useLanguage } from '../../../contexts/LanguageContext';
import { uploadMediaFile, validateUploadFile } from '../../../services/storage/mediaUploadService';

export const CMSSettingsPage = () => {
  const { websiteSettings, updateSettings, resetToDefaults } = useCMS();
  const { isMarathi } = useLanguage();

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
      const isMaint = typeof websiteSettings.maintenanceMode === 'object'
        ? Boolean(websiteSettings.maintenanceMode?.enabled)
        : Boolean(websiteSettings.maintenanceMode);

      setFormData(prev => ({
        ...prev,
        ...websiteSettings,
        websiteName: websiteSettings.websiteName || websiteSettings.websiteTitle || prev.websiteName,
        maintenanceMode: isMaint,
        maintenanceMessage: websiteSettings.maintenanceMessage || websiteSettings.maintenanceMode?.message || prev.maintenanceMessage,
        announcementBar: {
          ...prev.announcementBar,
          ...(websiteSettings.announcementBar || {}),
          buttonText: websiteSettings.announcementBar?.buttonText || websiteSettings.announcementBar?.linkText || prev.announcementBar.buttonText,
          link: websiteSettings.announcementBar?.link || websiteSettings.announcementBar?.linkUrl || prev.announcementBar.link
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
      setMessage({
        type: 'success',
        text: isMarathi ? 'लोगो यशस्वीरीत्या अपलोड झाला.' : 'Logo uploaded successfully.'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || (isMarathi ? 'लोगो अपलोड करताना त्रुटी आली.' : 'Failed to upload logo.')
      });
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
      setMessage({
        type: 'success',
        text: isMarathi ? 'Favicon आयकॉन यशस्वीरीत्या अपलोड झाला.' : 'Favicon uploaded successfully.'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || (isMarathi ? 'Favicon अपलोड करताना त्रुटी आली.' : 'Failed to upload favicon.')
      });
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
      setMessage({
        type: 'success',
        text: isMarathi
          ? 'माहिती पत्रक (Brochure PDF) यशस्वीरीत्या अपलोड झाले.'
          : 'Brochure PDF uploaded successfully.'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || (isMarathi ? 'माहिती पत्रक अपलोड करताना त्रुटी आली.' : 'Failed to upload brochure.')
      });
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
      setMessage({
        type: 'success',
        text: isMarathi
          ? 'वेबसाईट सेटिंग्ज यशस्वीरीत्या अद्यतनित झाल्या!'
          : 'Website settings updated successfully!'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || (isMarathi ? 'जतन करताना त्रुटी आली.' : 'Error saving settings.')
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (!window.confirm(
      isMarathi
        ? 'तुम्हाला खात्री आहे की सर्व मूळ डिफॉल्ट्स पुनर्संचयित करायचे आहेत? (यामुळे सर्व CMS तात्पुरता मूळ स्थितीत येईल)'
        : 'Are you sure you want to restore all default settings? (This will reset local CMS overrides to defaults)'
    )) {
      return;
    }

    resetToDefaults();
    setMessage({
      type: 'success',
      text: isMarathi ? 'मूळ संस्थात्मक डेटा यशस्वीरीत्या लोड केला.' : 'Default institutional data restored successfully.'
    });
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
              <Settings className="w-7 h-7 text-gurukul-saffron-600" />
              <span>{isMarathi ? 'वेबसाईट सेटिंग्ज व ब्रँडिंग (Website Settings)' : 'Website Settings & Branding'}</span>
            </h1>
            <p className="text-sm text-slate-500">
              {isMarathi
                ? 'लोगो, Favicon, माहिती पत्रक, कॉपीराइट, मेन्टेनन्स मोड व प्रवेश स्थिती व्यवस्थापित करा.'
                : 'Configure logo, favicon, brochure PDF, copyright, maintenance mode, and admission status.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title={isMarathi ? 'मूळ संस्थात्मक माहितीवर रीसेट करा' : 'Reset to default institutional data'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'डिफॉल्ट्स रीसेट करा' : 'Reset Defaults'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? (isMarathi ? 'जतन करत आहे...' : 'Saving...') : (isMarathi ? 'सेटिंग्ज सेव्ह करा' : 'Save Settings')}</span>
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
            {isMarathi ? 'ब्रँडिंग व संस्था माहिती (Branding & Identity)' : 'Branding & Institutional Identity'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'संस्थेचे नाव (Website Name) *' : 'Website Name *'}
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
                {isMarathi ? 'अधिकृत टॅगलाईन (Tagline) *' : 'Official Tagline *'}
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
                {isMarathi ? 'वेबसाईट लोगो (Logo Image)' : 'Website Logo Image'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.logoUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder={isMarathi ? 'लोगो URL किंवा अपलोड' : 'Logo URL or upload'}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                  <span>{uploadingLogo ? '...' : (isMarathi ? 'अपलोड' : 'Upload')}</span>
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
                {isMarathi ? 'फेव्हिकॉन (Favicon Icon - 32x32)' : 'Favicon Icon (32x32)'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.faviconUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, faviconUrl: e.target.value }))}
                  placeholder={isMarathi ? 'Favicon URL किंवा अपलोड' : 'Favicon URL or upload'}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                  <span>{uploadingFavicon ? '...' : (isMarathi ? 'अपलोड' : 'Upload')}</span>
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
                {isMarathi ? 'माहिती पत्रक (Brochure PDF)' : 'Brochure PDF'}
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
              <span>{isMarathi ? 'वेबसाईट शीर्ष सूचना पट्टी (Top Announcement Bar)' : 'Top Announcement Bar'}</span>
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
              {isMarathi ? 'सूचना मजकूर (Announcement Headline)' : 'Announcement Headline'}
            </label>
            <input
              type="text"
              value={formData.announcementBar?.text || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                announcementBar: { ...prev.announcementBar, text: e.target.value }
              }))}
              placeholder={isMarathi ? 'उदा. शैक्षणिक वर्ष २०२५-२६ करिता प्रवेश सुरू...' : 'e.g. Admissions open for the current academic year...'}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'बटन मजकूर (Button Text)' : 'Button Text'}
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
                {isMarathi ? 'बटन लिंक (Target Link)' : 'Target Link'}
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
            {isMarathi ? 'कार्यप्रणाली व प्रवेश नियंत्रण (System Controls)' : 'Admissions & System Controls'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-gurukul-navy-900 block">
                  {isMarathi ? 'प्रवेश चौकशी फॉर्म स्थिती (Admission Enquiries)' : 'Admission Enquiries Status'}
                </span>
                <span className="text-xs text-slate-500">
                  {isMarathi ? 'नवीन वर्षाच्या प्रवेश चौकशी फॉर्मची स्वीकार्यता' : 'Control whether admission enquiry forms accept new submissions'}
                </span>
              </div>
              <select
                value={formData.admissionStatus || 'open'}
                onChange={(e) => setFormData(prev => ({ ...prev, admissionStatus: e.target.value }))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
              >
                <option value="open">{isMarathi ? '🟢 प्रवेश सुरू (Open)' : '🟢 Open'}</option>
                <option value="closed">{isMarathi ? '🔴 प्रवेश बंद (Closed)' : '🔴 Closed'}</option>
              </select>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-gurukul-navy-900 block flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>{isMarathi ? 'देखभाल मोड (Maintenance Mode)' : 'Maintenance Mode'}</span>
                </span>
                <span className="text-xs text-slate-500">
                  {isMarathi ? 'सुरू केल्यास सार्वजनिक वेबसाईट तात्पुरती बंद दिसेल' : 'Temporarily displays a maintenance notice on the public website'}
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
                {isMarathi ? 'देखभाल संदेश (Maintenance Notice to Visitors)' : 'Maintenance Notice to Visitors'}
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
            {isMarathi ? 'नोंदणी व फुटर कायदेशीर तपशील (Footer & Legal)' : 'Footer & Legal Details'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'कॉपीराइट मजकूर (Footer Copyright Text)' : 'Footer Copyright Text'}
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
                {isMarathi ? 'शासन मान्यता क्र. / नोंदणी क्रमांक (Registration No.)' : 'Govt. Recognition / Registration No.'}
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
