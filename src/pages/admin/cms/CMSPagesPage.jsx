import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Save, 
  Trash2, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Layers, 
  Upload,
  Globe,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
  Video,
  List,
  Megaphone,
  X,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../../contexts/CMSContext';
import { uploadMediaFile, validateUploadFile } from '../../../services/storage/mediaUploadService';
import { Button } from '../../../components/common/Button';

export const CMSPagesPage = () => {
  const { pages, savePage, loading } = useCMS();

  const [selectedPage, setSelectedPage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState(null);

  // Default empty page template
  const defaultPageTemplate = {
    pageId: '',
    slug: 'new-page',
    title: '',
    subtitle: '',
    bannerImage: '',
    status: 'draft', // 'published' | 'draft'
    displayOrder: 1,
    seo: {
      metaTitle: '',
      metaDescription: ''
    },
    blocks: [
      { id: 'b_1', type: 'paragraph', content: '' }
    ]
  };

  const [formData, setFormData] = useState(defaultPageTemplate);

  const handleCreateNew = () => {
    const newPage = {
      ...defaultPageTemplate,
      pageId: `page_${Date.now()}`
    };
    setSelectedPage(newPage);
    setFormData(newPage);
    setIsEditing(true);
    setShowPreview(false);
    setMessage(null);
  };

  const handleEditPage = (page) => {
    setSelectedPage(page);
    setFormData(JSON.parse(JSON.stringify(page)));
    setIsEditing(true);
    setShowPreview(false);
    setMessage(null);
  };

  const handleTogglePublish = async (page) => {
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    try {
      await savePage({ ...page, status: newStatus });
      setMessage({ 
        type: 'success', 
        text: `पृष्ठ "${page.title}" आता ${newStatus === 'published' ? 'प्रकाशित (Published)' : 'मसुदा (Draft)'} स्थितीत आहे.` 
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'स्थिती बदलताना त्रुटी आली.' });
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error });
      return;
    }

    try {
      setUploadingImage(true);
      const res = await uploadMediaFile(file, 'pages', `banner_${formData.slug || 'page'}_${Date.now()}`);
      setFormData(prev => ({ ...prev, bannerImage: res.url || res.downloadURL }));
      setMessage({ type: 'success', text: 'बॅनर इमेज अपलोड झाली (Banner uploaded).' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'इमेज अपलोड करताना त्रुटी आली.' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Block management
  const addBlock = (type) => {
    let newBlock = {
      id: `b_${Date.now()}`,
      type
    };

    if (type === 'heading') {
      newBlock.content = 'नवीन मथळा';
      newBlock.level = 'h2';
    } else if (type === 'paragraph') {
      newBlock.content = '';
    } else if (type === 'image') {
      newBlock.url = '';
      newBlock.altText = '';
      newBlock.caption = '';
    } else if (type === 'image_text') {
      newBlock.url = '';
      newBlock.content = '';
      newBlock.imagePosition = 'left';
    } else if (type === 'features') {
      newBlock.items = ['वैशिष्ट्य १', 'वैशिष्ट्य २', 'वैशिष्ट्य ३'];
    } else if (type === 'cta') {
      newBlock.heading = 'प्रवेश नोंदणी करा';
      newBlock.description = 'मर्यादित जागांवर प्रवेश सुरू आहेत.';
      newBlock.buttonText = 'प्रवेश अर्ज करा';
      newBlock.buttonUrl = '/admission-enquiry';
    } else if (type === 'video') {
      newBlock.youtubeUrl = '';
      newBlock.embedId = '';
    }

    setFormData(prev => ({
      ...prev,
      blocks: [...(prev.blocks || []), newBlock]
    }));
  };

  const updateBlock = (index, updates) => {
    setFormData(prev => {
      const blocks = [...(prev.blocks || [])];
      blocks[index] = { ...blocks[index], ...updates };
      return { ...prev, blocks };
    });
  };

  const removeBlock = (index) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index)
    }));
  };

  const moveBlock = (index, direction) => {
    setFormData(prev => {
      const blocks = [...prev.blocks];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= blocks.length) return prev;
      const temp = blocks[index];
      blocks[index] = blocks[targetIndex];
      blocks[targetIndex] = temp;
      return { ...prev, blocks };
    });
  };

  const handleBlockImageUpload = async (index, file) => {
    if (!file) return;
    const validation = validateUploadFile(file);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error });
      return;
    }

    try {
      const res = await uploadMediaFile(file, 'pages', `block_img_${Date.now()}`);
      updateBlock(index, { url: res.url || res.downloadURL });
      setMessage({ type: 'success', text: 'इमेज अपलोड झाली.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'अपलोड अयशस्वी.' });
    }
  };

  const handleSave = async (statusOverride = null) => {
    if (!formData.title?.trim()) {
      setMessage({ type: 'error', text: 'कृपया पृष्ठाचे शीर्षक (Page Title) भरा.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const pageToSave = {
        ...formData,
        status: statusOverride || formData.status || 'published'
      };
      await savePage(pageToSave);
      setMessage({ type: 'success', text: `पृष्ठ "${pageToSave.title}" यशस्वीरीत्या सेव्ह झाले!` });
      setIsEditing(false);
      setShowPreview(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'पृष्ठ जतन करताना त्रुटी आली.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
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
              <FileText className="w-7 h-7 text-gurukul-saffron-600" />
              <span>वेबसाईट पेजेस व्यवस्थापन (Page Management)</span>
            </h1>
            <p className="text-sm text-slate-500">
              सर्व मुख्य पेजेसचे संरक्षित संरचित ब्लॉक्स, मथळे, प्रतिमा व CTA संपादन करा.
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>नवीन पृष्ठ जोडा (Add New Page)</span>
          </button>
        )}
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

      {/* Mode 1: Page Editor */}
      {isEditing ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gurukul-navy-900">
                  {formData.pageId ? `पृष्ठ संपादन: ${formData.title || 'शीर्षक नसलेले पृष्ठ'}` : 'नवीन पृष्ठ तयार करा'}
                </h2>
                <p className="text-xs text-slate-500">
                  संरचित ब्लॉक्स जोडून सुरक्षित पद्धतीने पृष्ठ तयार करा (सुरक्षित व XSS-मुक्त).
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-3.5 py-2 text-xs font-bold text-gurukul-navy-900 bg-slate-100 hover:bg-slate-200 rounded-xl inline-flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-4 h-4 text-gurukul-saffron-600" />
                  <span>{showPreview ? 'संपादकाकडे परत जा' : 'प्रिव्ह्यू पहा (Live Preview)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  मसुदा ठेवा (Save Draft)
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'जतन करत आहे...' : 'प्रकाशित करा (Publish)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setShowPreview(false); }}
                  className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800"
                >
                  रद्द करा
                </button>
              </div>
            </div>

            {/* Live Preview Screen */}
            {showPreview ? (
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-gurukul-saffron-500/30 space-y-8">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>लाईव्ह प्रिव्ह्यू मोड (Live Public Preview)</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    URL: <strong>{(formData.slug || '').startsWith('/') ? formData.slug : `/${formData.slug || ''}`}</strong>
                  </span>
                </div>

                {/* Banner preview */}
                {formData.bannerImage && (
                  <div className="h-64 rounded-2xl overflow-hidden shadow-md relative">
                    <img src={formData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gurukul-navy-950/80 via-transparent to-transparent flex items-end p-8">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white">{formData.title}</h1>
                        {formData.subtitle && <p className="text-sm text-gurukul-saffron-300 mt-1">{formData.subtitle}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Blocks rendering without unsafe innerHTML */}
                <div className="max-w-4xl mx-auto space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  {!formData.bannerImage && (
                    <div className="border-b pb-4">
                      <h1 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900">{formData.title}</h1>
                      {formData.subtitle && <p className="text-sm text-gurukul-saffron-600 mt-1">{formData.subtitle}</p>}
                    </div>
                  )}

                  {(formData.blocks || []).map((block, idx) => {
                    if (block.type === 'heading') {
                      return <h2 key={block.id || idx} className="text-xl sm:text-2xl font-black text-gurukul-navy-900">{block.content}</h2>;
                    }
                    if (block.type === 'paragraph') {
                      return <p key={block.id || idx} className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">{block.content}</p>;
                    }
                    if (block.type === 'image') {
                      return (
                        <div key={block.id || idx} className="rounded-2xl overflow-hidden shadow border border-slate-200 my-4">
                          {block.url ? <img src={block.url} alt={block.altText || ''} className="w-full h-80 object-cover" /> : null}
                          {block.caption && <p className="p-2 text-xs text-center text-slate-500 bg-slate-50">{block.caption}</p>}
                        </div>
                      );
                    }
                    if (block.type === 'image_text') {
                      return (
                        <div key={block.id || idx} className={`flex flex-col md:flex-row gap-6 items-center my-6 ${block.imagePosition === 'right' ? 'md:flex-row-reverse' : ''}`}>
                          {block.url && (
                            <div className="w-full md:w-1/2 h-64 rounded-2xl overflow-hidden shadow border border-slate-200 shrink-0">
                              <img src={block.url} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{block.content}</p>
                          </div>
                        </div>
                      );
                    }
                    if (block.type === 'features') {
                      return (
                        <div key={block.id || idx} className="p-5 bg-orange-50/60 rounded-2xl border border-orange-200/80 my-4 space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-700">वैशिष्ट्ये व ठळक बाबी:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {(block.items || []).map((item, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-800 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-gurukul-saffron-500 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    if (block.type === 'cta') {
                      return (
                        <div key={block.id || idx} className="p-6 bg-gurukul-navy-900 text-white rounded-2xl text-center space-y-3 my-6">
                          <h3 className="text-xl font-bold">{block.heading}</h3>
                          <p className="text-xs text-slate-300 max-w-md mx-auto">{block.description}</p>
                          <div className="pt-2">
                            <span className="inline-block px-5 py-2.5 bg-gurukul-saffron-500 text-white text-xs font-bold rounded-xl shadow">
                              {block.buttonText || 'प्रवेश अर्ज करा'}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    if (block.type === 'video') {
                      return (
                        <div key={block.id || idx} className="rounded-2xl overflow-hidden aspect-video shadow border border-slate-200 my-4">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${block.embedId || 'dQw4w9WgXcQ'}`}
                            title="Video Embed"
                            className="w-full h-full border-0"
                            allowFullScreen
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ) : (
              /* Regular Editor Form */
              <div className="space-y-6">
                {/* Basic Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      पृष्ठाचे शीर्षक (Page Title) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="उदा. गुरुकुल विद्यामंदिर"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      URL स्लग (Slug) *
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-500 font-mono">
                        /
                      </span>
                      <input
                        type="text"
                        required
                        value={(formData.slug || '').replace(/^\//, '')}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                        placeholder="vidyamandir"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-sm font-mono focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      उपशीर्षक / टॅगलाईन (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="उदा. इ. ५ वी ते १० वी (मराठी व सेमी इंग्रजी माध्यम)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      प्रकाशन स्थिती (Status)
                    </label>
                    <select
                      value={formData.status || 'draft'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white outline-none"
                    >
                      <option value="published">🟢 प्रकाशित (Published - Publicly Visible)</option>
                      <option value="draft">🟡 मसुदा (Draft - Hidden)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      हेडर बॅनर इमेज (Header Banner Image)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={formData.bannerImage || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, bannerImage: e.target.value }))}
                        placeholder="इमेज URL किंवा अपलोड करा"
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
                      />
                      <label className="cursor-pointer px-4 py-2.5 bg-gurukul-navy-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0">
                        <Upload className="w-4 h-4 text-gurukul-saffron-400" />
                        <span>{uploadingImage ? '...' : 'अपलोड'}</span>
                        <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Structured Blocks Toolbar */}
                <div className="pt-6 border-t border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-gurukul-navy-900 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-gurukul-saffron-600" />
                        <span>संरचित मजकूर ब्लॉक्स (Structured Content Blocks)</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        मथळा, परिच्छेद, फोटो, फोटो+मजकूर, वैशिष्ट्ये, कॉल-टू-ॲक्शन व व्हिडिओ ब्लॉक्स
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => addBlock('heading')}
                        className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold"
                      >
                        + मथळा
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('paragraph')}
                        className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold"
                      >
                        + परिच्छेद
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('image')}
                        className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold inline-flex items-center gap-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                        <span>+ फोटो</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('image_text')}
                        className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold"
                      >
                        + फोटो+मजकूर
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('features')}
                        className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold inline-flex items-center gap-1"
                      >
                        <List className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                        <span>+ वैशिष्ट्ये</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('cta')}
                        className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold inline-flex items-center gap-1"
                      >
                        <Megaphone className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                        <span>+ CTA</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('video')}
                        className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold inline-flex items-center gap-1"
                      >
                        <Video className="w-3.5 h-3.5 text-red-600" />
                        <span>+ व्हिडिओ</span>
                      </button>
                    </div>
                  </div>

                  {/* Render Editor Blocks */}
                  <div className="space-y-4">
                    {(formData.blocks || []).map((block, index) => (
                      <div key={block.id || index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span className="font-bold text-gurukul-navy-900 uppercase">
                            ब्लॉक #{index + 1}: {block.type}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveBlock(index, -1)}
                              disabled={index === 0}
                              className="p-1 hover:text-slate-900 disabled:opacity-30"
                              title="वर हलवा"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBlock(index, 1)}
                              disabled={index === formData.blocks.length - 1}
                              className="p-1 hover:text-slate-900 disabled:opacity-30"
                              title="खाली हलवा"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeBlock(index)}
                              className="p-1 hover:text-red-600 transition-colors"
                              title="काढून टाका"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        </div>

                        {/* Block Type: Heading */}
                        {block.type === 'heading' && (
                          <input
                            type="text"
                            value={block.content || ''}
                            onChange={(e) => updateBlock(index, { content: e.target.value })}
                            placeholder="मथळा प्रविष्ट करा..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-base font-bold text-gurukul-navy-900 outline-none"
                          />
                        )}

                        {/* Block Type: Paragraph */}
                        {block.type === 'paragraph' && (
                          <textarea
                            rows={3}
                            value={block.content || ''}
                            onChange={(e) => updateBlock(index, { content: e.target.value })}
                            placeholder="परिच्छेद मजकूर लिहा..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed outline-none"
                          />
                        )}

                        {/* Block Type: Image */}
                        {block.type === 'image' && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={block.url || ''}
                                onChange={(e) => updateBlock(index, { url: e.target.value })}
                                placeholder="इमेज URL किंवा उजवीकडून फाईल निवडा"
                                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                              />
                              <label className="cursor-pointer px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1">
                                <Upload className="w-3 h-3" />
                                <span>अपलोड</span>
                                <input type="file" accept="image/*" onChange={(e) => handleBlockImageUpload(index, e.target.files[0])} className="hidden" />
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={block.altText || ''}
                                onChange={(e) => updateBlock(index, { altText: e.target.value })}
                                placeholder="Alt मजकूर (Accessibility)"
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                              />
                              <input
                                type="text"
                                value={block.caption || ''}
                                onChange={(e) => updateBlock(index, { caption: e.target.value })}
                                placeholder="फोटो कॅप्शन (Caption)"
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                              />
                            </div>
                            {block.url && (
                              <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-200 mt-2">
                                <img src={block.url} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Block Type: Image and Text */}
                        {block.type === 'image_text' && (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={block.url || ''}
                                  onChange={(e) => updateBlock(index, { url: e.target.value })}
                                  placeholder="इमेज URL"
                                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                                />
                                <label className="cursor-pointer px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold">
                                  <span>अपलोड</span>
                                  <input type="file" accept="image/*" onChange={(e) => handleBlockImageUpload(index, e.target.files[0])} className="hidden" />
                                </label>
                              </div>
                              <select
                                value={block.imagePosition || 'left'}
                                onChange={(e) => updateBlock(index, { imagePosition: e.target.value })}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                              >
                                <option value="left">इमेज डावीकडे (Image Left)</option>
                                <option value="right">इमेज उजवीकडे (Image Right)</option>
                              </select>
                            </div>
                            <textarea
                              rows={3}
                              value={block.content || ''}
                              onChange={(e) => updateBlock(index, { content: e.target.value })}
                              placeholder="मजकूर लिहा..."
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed"
                            />
                          </div>
                        )}

                        {/* Block Type: Features */}
                        {block.type === 'features' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-600">वैशिष्ट्ये यादी:</span>
                              <button
                                type="button"
                                onClick={() => updateBlock(index, { items: [...(block.items || []), 'नवीन मुद्दा'] })}
                                className="text-xs font-bold text-gurukul-saffron-600"
                              >
                                + मुद्दा जोडा
                              </button>
                            </div>
                            {(block.items || []).map((it, itemIdx) => (
                              <div key={itemIdx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={it}
                                  onChange={(e) => {
                                    const nextItems = [...block.items];
                                    nextItems[itemIdx] = e.target.value;
                                    updateBlock(index, { items: nextItems });
                                  }}
                                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextItems = block.items.filter((_, i) => i !== itemIdx);
                                    updateBlock(index, { items: nextItems });
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-500"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Block Type: CTA */}
                        {block.type === 'cta' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={block.heading || ''}
                              onChange={(e) => updateBlock(index, { heading: e.target.value })}
                              placeholder="CTA मथळा"
                              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={block.buttonText || ''}
                              onChange={(e) => updateBlock(index, { buttonText: e.target.value })}
                              placeholder="बटण मजकूर"
                              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                            <input
                              type="text"
                              value={block.description || ''}
                              onChange={(e) => updateBlock(index, { description: e.target.value })}
                              placeholder="वर्णन"
                              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                            <input
                              type="text"
                              value={block.buttonUrl || ''}
                              onChange={(e) => updateBlock(index, { buttonUrl: e.target.value })}
                              placeholder="बटण URL"
                              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        )}

                        {/* Block Type: Video */}
                        {block.type === 'video' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={block.youtubeUrl || ''}
                              onChange={(e) => {
                                const url = e.target.value;
                                let vidId = url;
                                if (url.includes('v=')) vidId = url.split('v=')[1]?.split('&')[0];
                                else if (url.includes('youtu.be/')) vidId = url.split('youtu.be/')[1]?.split('?')[0];
                                updateBlock(index, { youtubeUrl: url, embedId: vidId });
                              }}
                              placeholder="YouTube व्हिडिओ लिंक (उदा. https://www.youtube.com/watch?v=...)"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                            {block.embedId && (
                              <p className="text-[11px] text-emerald-600 font-semibold">
                                ✓ YouTube व्हिडिओ आयडी सापडला: {block.embedId}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Mode 2: Pages List Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gurukul-saffron-600" />
              <span>वेबसाईटवरील उपलब्ध पेजेसची यादी ({pages?.length || 0})</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">पृष्ठाचे नाव (Title)</th>
                  <th className="px-5 py-3.5">URL स्लग (Route)</th>
                  <th className="px-5 py-3.5">ब्लॉक्स संख्या</th>
                  <th className="px-5 py-3.5">स्थिती (Status)</th>
                  <th className="px-5 py-3.5 text-right">कृती (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(pages || []).map((page) => (
                  <tr key={page.pageId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-gurukul-navy-900">
                      <div>
                        <span className="block text-sm">{page.title}</span>
                        {page.subtitle && (
                          <span className="text-[11px] text-slate-400 font-normal">{page.subtitle}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-500">
                      {(page.slug || '').startsWith('/') ? page.slug : `/${page.slug || ''}`}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {page.blocks?.length || 0} ब्लॉक्स
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(page)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                          page.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${page.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span>{page.status === 'published' ? 'प्रकाशित (Live)' : 'मसुदा (Draft)'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={(page.slug || '').startsWith('/') ? page.slug : `/${page.slug || ''}`}
                          target="_blank"
                          className="p-1.5 text-slate-500 hover:text-gurukul-navy-900 rounded-lg hover:bg-slate-100"
                          title="वेबसाईटवर पहा"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEditPage(page)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>संपादित करा</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CMSPagesPage;
