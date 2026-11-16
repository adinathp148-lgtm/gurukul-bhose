import React, { useState } from 'react';
import { 
  GraduationCap, 
  Save, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Plus, 
  Trash2, 
  BookOpen, 
  Award, 
  FlaskConical, 
  Activity,
  Monitor,
  Edit2,
  ExternalLink,
  Eye,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../../contexts/CMSContext';
import { uploadMediaFile, validateUploadFile } from '../../../services/storage/mediaUploadService';
import { Button } from '../../../components/common/Button';

export const CMSProgramsPage = () => {
  const { programs, saveProgram, loading } = useCMS();

  const [editingProgram, setEditingProgram] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState(null);

  const handleEdit = (prog) => {
    setEditingProgram(JSON.parse(JSON.stringify(prog)));
    setMessage(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error });
      return;
    }

    try {
      setUploadingImage(true);
      const res = await uploadMediaFile(file, 'programs', `program_${editingProgram.id || Date.now()}`);
      setEditingProgram(prev => ({ ...prev, imageUrl: res.url || res.downloadURL, image: res.url || res.downloadURL }));
      setMessage({ type: 'success', text: 'विभाग छायाचित्र यशस्वीरीत्या अपलोड झाले.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'इमेज अपलोड करताना त्रुटी आली.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddFeature = () => {
    if (!editingProgram) return;
    setEditingProgram(prev => ({
      ...prev,
      features: [...(prev.features || prev.highlights || []), 'नवीन वैशिष्ट्य']
    }));
  };

  const handleUpdateFeature = (index, value) => {
    setEditingProgram(prev => {
      const feats = [...(prev.features || prev.highlights || [])];
      feats[index] = value;
      return { ...prev, features: feats, highlights: feats };
    });
  };

  const handleRemoveFeature = (index) => {
    setEditingProgram(prev => {
      const feats = (prev.features || prev.highlights || []).filter((_, i) => i !== index);
      return { ...prev, features: feats, highlights: feats };
    });
  };

  const handleSaveProgram = async (e) => {
    e.preventDefault();
    if (!editingProgram.title?.trim()) {
      setMessage({ type: 'error', text: 'कृपया शैक्षणिक विभागाचे नाव भरा.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...editingProgram,
        shortDesc: editingProgram.subtitle || editingProgram.shortDesc,
        fullDesc: editingProgram.description || editingProgram.fullDesc,
        highlights: editingProgram.features || editingProgram.highlights
      };
      await saveProgram(payload);
      setMessage({ type: 'success', text: `"${editingProgram.title}" यशस्वीरीत्या अद्यतनित केले (Program saved successfully).` });
      setEditingProgram(null);
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
              <GraduationCap className="w-7 h-7 text-gurukul-saffron-600" />
              <span>शैक्षणिक विभाग व्यवस्थापन (Programs CMS)</span>
            </h1>
            <p className="text-sm text-slate-500">
              विद्यामंदिर, ज्युनिअर कॉलेज, टॅलेंट सर्च, सायन्स, कॉम्प्युटर व स्पोर्ट्स अकॅडमी व्यवस्थापित करा.
            </p>
          </div>
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

      {/* Program Editor Modal/Drawer */}
      {editingProgram ? (
        <form onSubmit={handleSaveProgram} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-gurukul-navy-900">
              शैक्षणिक विभाग संपादन: {editingProgram.title}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingProgram(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                रद्द करा (Cancel)
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow"
              >
                {saving ? 'जतन करत आहे...' : 'सेव्ह करा (Save)'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                विभागाचे नाव (Program Title) *
              </label>
              <input
                type="text"
                required
                value={editingProgram.title || ''}
                onChange={(e) => setEditingProgram(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                उपशीर्षक / वर्ग (Subtitle / Classes)
              </label>
              <input
                type="text"
                value={editingProgram.subtitle || editingProgram.shortDesc || ''}
                onChange={(e) => setEditingProgram(prev => ({ ...prev, subtitle: e.target.value, shortDesc: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                वर्गवारी (Category)
              </label>
              <input
                type="text"
                value={editingProgram.category || ''}
                onChange={(e) => setEditingProgram(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                प्रकाशन स्थिती (Status)
              </label>
              <select
                value={editingProgram.status || 'published'}
                onChange={(e) => setEditingProgram(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white outline-none"
              >
                <option value="published">🟢 प्रकाशित (Published)</option>
                <option value="draft">🟡 मसुदा (Draft)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              वर्णन (Full Description)
            </label>
            <textarea
              rows={3}
              value={editingProgram.description || editingProgram.fullDesc || ''}
              onChange={(e) => setEditingProgram(prev => ({ ...prev, description: e.target.value, fullDesc: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              विभागाचे छायाचित्र (Program Image)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={editingProgram.imageUrl || editingProgram.image || ''}
                onChange={(e) => setEditingProgram(prev => ({ ...prev, imageUrl: e.target.value, image: e.target.value }))}
                placeholder="इमेज URL किंवा उजवीकडे फाईल निवडून अपलोड करा"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
              <label className="cursor-pointer px-4 py-2.5 bg-gurukul-navy-900 hover:bg-gurukul-navy-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0">
                <Upload className="w-4 h-4 text-gurukul-saffron-400" />
                <span>{uploadingImage ? 'अपलोड होत आहे...' : 'इमेज अपलोड'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            {(editingProgram.imageUrl || editingProgram.image) && (
              <div className="mt-2 w-48 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img 
                  src={editingProgram.imageUrl || editingProgram.image} 
                  alt="Program Preview" 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}
          </div>

          {/* Key Features List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                महत्त्वाची वैशिष्ट्ये (Key Features & Highlights)
              </label>
              <button
                type="button"
                onClick={handleAddFeature}
                className="text-xs font-bold text-gurukul-saffron-600 hover:text-gurukul-saffron-700"
              >
                + वैशिष्ट्य जोडा
              </button>
            </div>
            <div className="space-y-2">
              {(editingProgram.features || editingProgram.highlights || []).map((feat, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleUpdateFeature(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="p-2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      ) : null}

      {/* Programs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(programs || []).map((prog) => (
          <div key={prog.programId || prog.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
            {(prog.imageUrl || prog.image) && (
              <div className="h-44 w-full bg-slate-100 overflow-hidden">
                <img 
                  src={prog.imageUrl || prog.image} 
                  alt={prog.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-orange-100 text-gurukul-saffron-700 text-[11px] font-bold rounded-lg uppercase tracking-wider">
                    {prog.category || 'शैक्षणिक विभाग'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    prog.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {prog.status === 'draft' ? '🟡 मसुदा (Draft)' : '🟢 प्रकाशित (Active)'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gurukul-navy-900">{prog.title}</h3>
                  <p className="text-xs font-medium text-gurukul-saffron-600 mt-0.5">{prog.subtitle || prog.shortDesc}</p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{prog.description || prog.fullDesc}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ठळक बाबी:</span>
                  {(prog.features || prog.highlights || []).slice(0, 3).map((f, i) => (
                    <div key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gurukul-saffron-500 shrink-0" />
                      <span className="line-clamp-1">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={prog.slug || prog.link || '#'}
                  className="text-xs font-bold text-gurukul-navy-900 hover:text-gurukul-saffron-600 transition-colors flex items-center gap-1"
                >
                  <span>वेबसाईटवर पहा</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleEdit(prog)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>संपादित करा</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CMSProgramsPage;
