import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Award, 
  Target, 
  Compass, 
  UserCheck,
  Plus,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../../contexts/CMSContext';
import { uploadMediaFile, validateUploadFile } from '../../../services/storage/mediaUploadService';

export const CMSAboutPage = () => {
  const { aboutData, updateAbout } = useCMS();

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    title: 'आमच्याबद्दल (About Gurukul Bhose)',
    tagline: 'शिस्त, संस्कार व दर्जेदार शिक्षणाचे अग्रगण्य केंद्र',
    philosophy: '',
    vision: '',
    mission: '',
    founder: {
      name: '',
      title: 'संस्थापक अध्यक्ष',
      message: '',
      image: ''
    },
    achievements: [],
    facilitiesOverview: ''
  });

  useEffect(() => {
    if (aboutData) {
      setFormData(prev => ({
        ...prev,
        ...aboutData,
        founder: {
          ...prev.founder,
          ...(aboutData.founder || {})
        },
        achievements: aboutData.achievements || []
      }));
    }
  }, [aboutData]);

  const handleFounderPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error });
      return;
    }

    try {
      setUploadingImage(true);
      const res = await uploadMediaFile(file, 'about', `founder_${Date.now()}`);
      setFormData(prev => ({
        ...prev,
        founder: { ...prev.founder, image: res.url }
      }));
      setMessage({ type: 'success', text: 'संस्थापक फोटो यशस्वीरीत्या अपलोड झाला.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'फोटो अपलोड करताना त्रुटी आली.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [
        ...(prev.achievements || []),
        { id: `ach_${Date.now()}`, year: new Date().getFullYear().toString(), title: '', description: '' }
      ]
    }));
  };

  const updateAchievement = (index, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.achievements || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, achievements: updated };
    });
  };

  const removeAchievement = (index) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateAbout(formData);
      setMessage({ type: 'success', text: 'आमच्याबद्दल माहिती यशस्वीरीत्या अद्यतनित झाली (About us details saved successfully).' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'माहिती जतन करताना त्रुटी आली.' });
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
              <Building2 className="w-7 h-7 text-gurukul-saffron-600" />
              <span>आमच्याबद्दल व्यवस्थापन (About Us CMS)</span>
            </h1>
            <p className="text-sm text-slate-500">
              संस्थेचे ध्येय (Vision), उद्दिष्टे (Mission), संस्थापकांचे मनोगत व गौरवशाली परंपरा व्यवस्थापित करा.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all"
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
        {/* Section 1: Overview & Philosophy */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Compass className="w-5 h-5 text-gurukul-saffron-600" />
            <span>संस्था ओळख व तत्त्वज्ञान (Overview & Philosophy)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                पृष्ठ मथळा (Section Title)
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                टॅगलाईन (Tagline)
              </label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              संस्थेचे तत्त्वज्ञान व पार्श्वभूमी (Institutional Philosophy & Background)
            </label>
            <textarea
              rows={4}
              value={formData.philosophy || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, philosophy: e.target.value }))}
              placeholder="गुरुकुल भोसे निवासी संकुलाचा इतिहास, शिक्षण पद्धती आणि संस्कार..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed focus:bg-white outline-none"
            />
          </div>
        </div>

        {/* Section 2: Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Target className="w-5 h-5 text-gurukul-saffron-600" />
              <span>ध्येय (Vision)</span>
            </h2>
            <p className="text-xs text-slate-500">
              संस्थेचे दीर्घकालीन ध्येय आणि भविष्यातील विद्यार्थ्यांचे आदर्श व्यक्तिमत्त्व.
            </p>
            <textarea
              rows={5}
              value={formData.vision || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, vision: e.target.value }))}
              placeholder="ग्रामीण भागातील विद्यार्थ्यांना सैनिकी शिस्त, अत्याधुनिक विज्ञान शिक्षण आणि उच्च संस्कार देऊन देशाचे सक्षम नागरिक घडवणे."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed focus:bg-white outline-none"
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Compass className="w-5 h-5 text-gurukul-navy-900" />
              <span>उद्दिष्टे (Mission)</span>
            </h2>
            <p className="text-xs text-slate-500">
              दैनंदिन शैक्षणिक, क्रीडा व निवासी उपक्रमांमागील मुख्य उद्दिष्टे.
            </p>
            <textarea
              rows={5}
              value={formData.mission || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
              placeholder="प्रत्येक विद्यार्थ्याला स्पर्धा परीक्षा, NDA, NEET, JEE साठी सज्ज करणे व परिपूर्ण शारीरिक व मानसिक विकास साधणे."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed focus:bg-white outline-none"
            />
          </div>
        </div>

        {/* Section 3: Founder / Leadership */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserCheck className="w-5 h-5 text-gurukul-saffron-600" />
            <span>संस्थापक / नेतृत्व संदेश (Founder & Leadership Message)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                नाव (Leader Name)
              </label>
              <input
                type="text"
                value={formData.founder?.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, founder: { ...prev.founder, name: e.target.value } }))}
                placeholder="उदा. श्री. अजित पवार"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                पद / पदनाम (Designation)
              </label>
              <input
                type="text"
                value={formData.founder?.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, founder: { ...prev.founder, title: e.target.value } }))}
                placeholder="संस्थापक अध्यक्ष"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                फोटो (Leader Photo)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.founder?.image || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, founder: { ...prev.founder, image: e.target.value } }))}
                  placeholder="फोटो URL"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                  <span>{uploadingImage ? '...' : 'अपलोड'}</span>
                  <input type="file" accept="image/*" onChange={handleFounderPhotoUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              मार्गदर्शक संदेश (Founder Message)
            </label>
            <textarea
              rows={4}
              value={formData.founder?.message || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, founder: { ...prev.founder, message: e.target.value } }))}
              placeholder="पालक व विद्यार्थ्यांना उद्देशून संस्थेचे मार्गदर्शक विचार..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed focus:bg-white outline-none"
            />
          </div>
        </div>

        {/* Section 4: Key Achievements */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-gurukul-saffron-600" />
              <span>महत्त्वाचे टप्पे व यश (Key Achievements & Milestones)</span>
            </h2>
            <button
              type="button"
              onClick={addAchievement}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-gurukul-saffron-600" />
              <span>टप्पा जोडा (Add Milestone)</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.achievements?.map((ach, index) => (
              <div key={ach.id || index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="text"
                  value={ach.year || ''}
                  onChange={(e) => updateAchievement(index, 'year', e.target.value)}
                  placeholder="वर्ष (उदा. 2024)"
                  className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-gurukul-saffron-600 outline-none"
                />
                <input
                  type="text"
                  value={ach.title || ''}
                  onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                  placeholder="यशाचे शीर्षक (उदा. १००% निकाल / सैनिक स्कूल निवड)"
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none"
                />
                <input
                  type="text"
                  value={ach.description || ''}
                  onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                  placeholder="थोडक्यात माहिती"
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeAchievement(index)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  title="काढून टाका"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CMSAboutPage;
