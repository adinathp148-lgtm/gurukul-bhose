import React, { useState } from 'react';
import { useCRM } from '../../contexts/CRMContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Settings,
  Building2,
  Calendar,
  UserPlus,
  PhoneCall,
  Bell,
  Shield,
  Globe,
  Save,
  CheckCircle2,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AdminSystemSettingsPage = () => {
  const { isMarathi } = useLanguage();
  const { isSuperAdmin, isAdmin } = useAuth();
  const { systemSettings, defaultSystemSettings, updateSystemSettings } = useCRM();

  const [activeTab, setActiveTab] = useState('school');
  const [formData, setFormData] = useState(() => ({
    ...defaultSystemSettings,
    ...(systemSettings || {})
  }));
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateSystemSettings(formData);
    setSaving(false);

    if (res.success) {
      setFeedbackMsg(isMarathi ? 'सर्व सिस्टिम सेटिंग्ज यशस्वीपणे जतन करण्यात आल्या!' : 'System settings saved successfully!');
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isMarathi ? 'सिस्टम व संस्था सेटिंग्ज (System Settings)' : 'System Settings'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gurukul-saffron-50 text-gurukul-saffron-700 border border-gurukul-saffron-200">
              {isMarathi ? 'प्रशासकीय नियंत्रण' : 'Admin Control'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi
              ? 'शाळा माहिती, शैक्षणिक वर्ष, प्रवेश चौकशी नियम, CRM फॉलो-अप आणि वेबसाईटचे केंद्रीय नियंत्रण.'
              : 'Configure school details, academic year, admission enquiry rules, CRM parameters, and website banners.'}
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-1.5" />
          <span>{saving ? (isMarathi ? 'जतन करत आहे...' : 'Saving...') : (isMarathi ? 'बदल सेव्ह करा' : 'Save Changes')}</span>
        </Button>
      </div>

      {/* 2. Feedback Alert */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="p-1 text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('school')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'school' ? 'bg-gurukul-navy-950 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{isMarathi ? 'शाळा व संपर्क माहिती' : 'School Info'}</span>
        </button>

        <button
          onClick={() => setActiveTab('academic')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'academic' ? 'bg-gurukul-navy-950 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{isMarathi ? 'शैक्षणिक वर्ष' : 'Academic Year'}</span>
        </button>

        <button
          onClick={() => setActiveTab('enquiry')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'enquiry' ? 'bg-gurukul-navy-950 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{isMarathi ? 'प्रवेश चौकशी नियम' : 'Enquiry Rules'}</span>
        </button>

        <button
          onClick={() => setActiveTab('crm')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'crm' ? 'bg-gurukul-navy-950 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{isMarathi ? 'CRM व फॉलो-अप' : 'CRM Settings'}</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'notifications' ? 'bg-gurukul-navy-950 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{isMarathi ? 'सूचना प्राधान्ये' : 'Notifications'}</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'permissions' ? 'bg-gurukul-navy-950 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{isMarathi ? 'भूमिका व परवानग्या' : 'Roles & Permissions'}</span>
        </button>

        <button
          onClick={() => setActiveTab('website')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'website' ? 'bg-gurukul-navy-950 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{isMarathi ? 'वेबसाईट सेटिंग्ज' : 'Website Settings'}</span>
        </button>
      </div>

      {/* 4. Form Content Cards */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">

        {/* SECTION 1: School & Contact Details */}
        {activeTab === 'school' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              शाळा व संस्था अधिकृत तपशील (School & Official Info)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">शाळेचे नाव (मराठी) *</label>
                <input
                  type="text"
                  required
                  value={formData.schoolNameMr}
                  onChange={(e) => handleChange('schoolNameMr', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">School Name (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.schoolNameEn}
                  onChange={(e) => handleChange('schoolNameEn', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">पॅटर्न / स्वरूप</label>
                <input
                  type="text"
                  value={formData.schoolPattern}
                  onChange={(e) => handleChange('schoolPattern', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">संस्था नोंदणी / मान्यता क्रमांक</label>
                <input
                  type="text"
                  value={formData.affiliationNumber}
                  onChange={(e) => handleChange('affiliationNumber', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">पूर्ण पत्ता (Campus Address) *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">अधिकृत संपर्क क्रमांक (Calling)</label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">अधिकृत WhatsApp क्रमांक</label>
                <input
                  type="text"
                  value={formData.contactWhatsApp}
                  onChange={(e) => handleChange('contactWhatsApp', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">अधिकृत ईमेल पत्ता</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">अधिकृत वेबसाईट URL</label>
                <input
                  type="url"
                  value={formData.officialWebsite}
                  onChange={(e) => handleChange('officialWebsite', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Academic Year Configuration */}
        {activeTab === 'academic' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              सक्रिय शैक्षणिक वर्ष व प्रवेश स्थिती (Academic Year & Admissions Status)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">चालू शैक्षणिक वर्ष (Active Year) *</label>
                <input
                  type="text"
                  required
                  value={formData.activeAcademicYear}
                  onChange={(e) => handleChange('activeAcademicYear', e.target.value)}
                  placeholder="2026-2027"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">आगामी शैक्षणिक वर्ष (Upcoming Year)</label>
                <input
                  type="text"
                  value={formData.upcomingAcademicYear}
                  onChange={(e) => handleChange('upcomingAcademicYear', e.target.value)}
                  placeholder="2027-2028"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">प्रवेश स्थिती (Admissions Status)</label>
                <select
                  value={formData.admissionsStatus}
                  onChange={(e) => handleChange('admissionsStatus', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                >
                  <option value="OPEN">प्रवेश सुरू (Admissions Open)</option>
                  <option value="CLOSING_SOON">प्रवेश लवकरच बंद (Closing Soon)</option>
                  <option value="CLOSED">प्रवेश बंद (Admissions Closed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">प्रति तुकडी प्रवेश क्षमता (Class Capacity)</label>
                <input
                  type="number"
                  value={formData.admissionCapacityPerClass}
                  onChange={(e) => handleChange('admissionCapacityPerClass', Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Admission Enquiry Settings */}
        {activeTab === 'enquiry' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              प्रवेश चौकशी व स्वयंचलित नेमणूक नियम (Enquiry Rules)
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.publicEnquiryFormActive}
                  onChange={(e) => handleChange('publicEnquiryFormActive', e.target.checked)}
                  className="w-4 h-4 text-gurukul-saffron-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">वेबसाईटवरील प्रवेश अर्ज फॉर्म सक्रिय ठेवा (Public Form Active)</p>
                  <p className="text-[11px] text-slate-500">पालकांना शाळेच्या वेबसाईटवरून थेट प्रवेश चौकशी अर्ज भरण्याची परवानगी द्या.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoAssignTelecaller}
                  onChange={(e) => handleChange('autoAssignTelecaller', e.target.checked)}
                  className="w-4 h-4 text-gurukul-saffron-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">स्वयंचलित समुपदेशक वाटप (Auto-Assign Telecallers)</p>
                  <p className="text-[11px] text-slate-500">नवीन चौकशी आल्यास ती उपलब्ध समुपदेशकांकडे आपोआप सोपवा.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.siblingDetectionEnabled}
                  onChange={(e) => handleChange('siblingDetectionEnabled', e.target.checked)}
                  className="w-4 h-4 text-gurukul-saffron-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">भावंड / कौटुंबिक ओळख प्रणाली (Sibling Intelligence)</p>
                  <p className="text-[11px] text-slate-500">मोबाईल समान असल्यास परंतु विद्यार्थ्याचे नाव वेगळे असल्यास नक्कल ऐवजी भावंड म्हणून ओळखा.</p>
                </div>
              </label>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  नवीन अर्जाची सूचना पाठवण्यासाठी प्रशासकीय ईमेल (Admin Alert Emails)
                </label>
                <input
                  type="text"
                  value={formData.adminAlertEmails}
                  onChange={(e) => handleChange('adminAlertEmails', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: CRM Configuration */}
        {activeTab === 'crm' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              CRM व फॉलो-अप नियम (CRM & Calling Configuration)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  दैनिक कमाल फॉलो-अप मर्यादा (Max Follow-ups per Telecaller)
                </label>
                <input
                  type="number"
                  value={formData.maxDailyFollowUpsPerTelecaller}
                  onChange={(e) => handleChange('maxDailyFollowUpsPerTelecaller', Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  डीफॉल्ट फॉलो-अप वेळ (Default Follow-up Time)
                </label>
                <input
                  type="time"
                  value={formData.defaultFollowUpTime}
                  onChange={(e) => handleChange('defaultFollowUpTime', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  थकबाकी घोषित करण्याचा कालावधी (Overdue Grace Hours)
                </label>
                <input
                  type="number"
                  value={formData.overdueGracePeriodHours}
                  onChange={(e) => handleChange('overdueGracePeriodHours', Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              सूचना व अलर्ट्स प्राधान्ये (Notification Preferences)
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableInAppNotifications}
                  onChange={(e) => handleChange('enableInAppNotifications', e.target.checked)}
                  className="w-4 h-4 text-gurukul-saffron-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">अॅपमधील सूचना सक्षम ठेवा (In-App Notifications)</p>
                  <p className="text-[11px] text-slate-500">डॅशबोर्डवर तात्काळ पॉपअप व बेल आयकॉन सूचना दर्शवा.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableWhatsAppAlerts}
                  onChange={(e) => handleChange('enableWhatsAppAlerts', e.target.checked)}
                  className="w-4 h-4 text-gurukul-saffron-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">WhatsApp द्वारे अलर्ट्स लिंक सक्षम करा (WhatsApp Links)</p>
                  <p className="text-[11px] text-slate-500">पालक व समुपदेशकांसाठी wa.me थेट चॅट सुविधा उपलब्ध ठेवा.</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* SECTION 6: Role Permissions Matrix */}
        {activeTab === 'permissions' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              भूमिका व परवानग्या तक्ता (Role-Based Permissions Matrix)
            </h3>
            <p className="text-xs text-slate-500">
              प्रशासकीय सुरक्षेसाठी खालील परवानग्या सर्व्हर स्तरावर Firebase Security Rules द्वारे नियंत्रित केल्या जातात.
            </p>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">मॉड्यूल / कृती</th>
                    <th className="py-2.5 px-3 text-center">Super Admin</th>
                    <th className="py-2.5 px-3 text-center">Admin</th>
                    <th className="py-2.5 px-3 text-center">Telecaller</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">सर्व प्रवेश चौकशी पाहणे</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ पूर्ण प्रवेश</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ पूर्ण प्रवेश</td>
                    <td className="py-2.5 px-3 text-center text-amber-600 font-bold">केवळ स्वतःकडे नियुक्त</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">लीड नेमणूक व पुनर्वाटप</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ होय</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ होय</td>
                    <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✗ नाही</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">टेलिकॉलर खाती तयार करणे व व्यवस्थापन</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ होय</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ होय</td>
                    <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✗ नाही</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">प्रशासक (Admin) खाती व्यवस्थापन</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ केवळ Super Admin</td>
                    <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✗ नाही</td>
                    <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✗ नाही</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">वेबसाईट CMS संपादन</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ होय</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ होय</td>
                    <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✗ नाही</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">CSV डेटा निर्यात</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ होय</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ होय</td>
                    <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✗ नाही</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 7: Website Settings */}
        {activeTab === 'website' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              वेबसाईट बॅनर व सुरक्षा सेटिंग्ज (Website Settings)
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showAnnouncementBanner}
                  onChange={(e) => handleChange('showAnnouncementBanner', e.target.checked)}
                  className="w-4 h-4 text-gurukul-saffron-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">शीर्ष घोषणा पट्टी दर्शवा (Announcement Banner Visible)</p>
                  <p className="text-[11px] text-slate-500">वेबसाईटच्या सर्वात वर महत्त्वाची प्रवेश सूचना दर्शवा.</p>
                </div>
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  घोषणा पट्टी मजकूर (Banner Text)
                </label>
                <input
                  type="text"
                  value={formData.announcementBannerText}
                  onChange={(e) => handleChange('announcementBannerText', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  आपत्कालीन संपर्क क्रमांक (Emergency Contact)
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button variant="primary" size="md" type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>{saving ? (isMarathi ? 'जतन करत आहे...' : 'Saving...') : (isMarathi ? 'सर्व बदल सेव्ह करा' : 'Save All Settings')}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
