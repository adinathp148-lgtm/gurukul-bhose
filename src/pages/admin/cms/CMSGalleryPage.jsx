import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Plus, 
  Save, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Filter, 
  Eye, 
  Calendar, 
  Tag,
  Edit2,
  Search,
  Layers,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../../contexts/CMSContext';
import { uploadMediaFile, validateUploadFile, isStoragePathInUse } from '../../../services/storage/mediaUploadService';

export const CMSGalleryPage = () => {
  const { gallery, saveGalleryItem, deleteGalleryItem, pages = [], courses = [], programs = [] } = useCMS();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [message, setMessage] = useState(null);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);

  const defaultItem = {
    imageId: '',
    title: '',
    caption: '',
    altText: '',
    category: 'कॅम्पस (Campus)',
    imageUrl: '',
    url: '',
    storagePath: '',
    displayOrder: gallery.length + 1,
    status: 'published',
    createdAt: new Date().toISOString()
  };

  const [formData, setFormData] = useState(defaultItem);

  // Extract unique categories from gallery
  const existingCategories = Array.from(new Set([
    'कॅम्पस (Campus)',
    'कार्यक्रम (Events)',
    'क्रीडा (Sports)',
    'शैक्षणिक (Academics)',
    ...gallery.map(g => g.category).filter(Boolean)
  ]));

  const handleOpenUpload = () => {
    setFormData({
      ...defaultItem,
      imageId: `gal_${Date.now()}`,
      displayOrder: gallery.length + 1
    });
    setIsEditing(false);
    setShowUploadModal(true);
    setMessage(null);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      ...defaultItem,
      ...item,
      url: item.imageUrl || item.url || '',
      imageUrl: item.imageUrl || item.url || ''
    });
    setIsEditing(true);
    setShowUploadModal(true);
    setMessage(null);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error });
      return;
    }

    try {
      setUploading(true);
      const res = await uploadMediaFile(file, 'gallery', `gallery_${Date.now()}`);
      const downloadURL = res.downloadURL || res.url;
      setFormData(prev => ({
        ...prev,
        url: downloadURL,
        imageUrl: downloadURL,
        storagePath: res.storagePath || '',
        title: prev.title || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
        altText: prev.altText || prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
      setMessage({ type: 'success', text: 'फोटो अपलोड झाला.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'फोटो अपलोड करताना त्रुटी आली.' });
    } finally {
      setUploading(false);
    }
  };

  // Multiple Image Batch Upload
  const handleBatchUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setBatchProgress({ current: 0, total: files.length });
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const validation = validateUploadFile(file);
        if (!validation.valid) continue;

        const res = await uploadMediaFile(file, 'gallery', `batch_${Date.now()}_${i}`);
        const downloadURL = res.downloadURL || res.url;
        const autoTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');

        await saveGalleryItem({
          imageId: `gal_batch_${Date.now()}_${i}`,
          title: autoTitle,
          caption: autoTitle,
          altText: autoTitle,
          category: formData.category || 'कॅम्पस (Campus)',
          imageUrl: downloadURL,
          url: downloadURL,
          storagePath: res.storagePath || '',
          displayOrder: gallery.length + i + 1,
          status: 'published',
          createdAt: new Date().toISOString()
        });
        successCount++;
      } catch (err) {
        console.warn('Batch upload item error:', err);
      }
      setBatchProgress({ current: i + 1, total: files.length });
    }

    setUploading(false);
    setShowBatchModal(false);
    setMessage({ 
      type: 'success', 
      text: `${successCount} फोटो बॅच अपलोड यशस्वीरीत्या पूर्ण झाले!` 
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const finalUrl = formData.imageUrl || formData.url;
    if (!finalUrl) {
      setMessage({ type: 'error', text: 'कृपया फोटो निवडा किंवा URL भरा.' });
      return;
    }

    try {
      await saveGalleryItem({
        ...formData,
        imageUrl: finalUrl,
        url: finalUrl,
        displayOrder: parseInt(formData.displayOrder) || 1
      });
      setMessage({ type: 'success', text: isEditing ? 'फोटो माहिती अद्यतनित केली!' : 'फोटो गॅलरीमध्ये यशस्वीरीत्या जोडला गेला!' });
      setShowUploadModal(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'जतन करताना त्रुटी आली.' });
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await saveGalleryItem({
        ...item,
        status: newStatus
      });
      setMessage({ 
        type: 'success', 
        text: `फोटो स्थिती ${newStatus === 'published' ? 'प्रकाशित' : 'मसुदा'} म्हणून बदलली.` 
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'स्थिती बदलताना त्रुटी आली.' });
    }
  };

  const handleDelete = async (item) => {
    // Check if referenced elsewhere
    const inUse = isStoragePathInUse(item.storagePath || item.imageUrl || item.url, [
      ...pages,
      ...courses,
      ...programs
    ]);

    if (inUse) {
      const confirmForce = window.confirm(
        `हा फोटो इतर पानांवर किंवा कोर्सेसमध्ये संदर्भांकित असू शकतो.\nतरीही हा फोटो गॅलरीतून हटवायचा आहे का?`
      );
      if (!confirmForce) return;
    } else {
      if (!window.confirm(`तुम्हाला खात्री आहे की "${item.title || 'हा फोटो'}" गॅलरीतून हटवायचा आहे?`)) {
        return;
      }
    }

    try {
      await deleteGalleryItem(item.imageId || item.id);
      setMessage({ type: 'success', text: 'फोटो गॅलरीतून काढून टाकला.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'हटवताना त्रुटी आली.' });
    }
  };

  const handleAddCustomCategory = () => {
    if (!customCategoryInput.trim()) return;
    setFormData(prev => ({ ...prev, category: customCategoryInput.trim() }));
    setShowNewCatInput(false);
    setCustomCategoryInput('');
  };

  const sortedGallery = [...gallery].sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

  const filteredGallery = sortedGallery.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.caption || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
              <ImageIcon className="w-7 h-7 text-gurukul-saffron-600" />
              <span>फोटो गॅलरी व्यवस्थापन (Photo Gallery CMS)</span>
            </h1>
            <p className="text-sm text-slate-500">
              कॅम्पस, स्नेहसंमेलन, क्रीडा, बॅच अपलोड, कॅप्शन, alt text व क्रम व्यवस्थापित करा.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs border border-slate-300 transition-all"
            title="लाईव्ह वेबसाईटवर फोटो गॅलरी पहा"
          >
            <Eye className="w-4 h-4 text-gurukul-navy-900" />
            <span className="hidden sm:inline">लाईव्ह गॅलरी पहा</span>
          </a>
          <button
            type="button"
            onClick={() => setShowBatchModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gurukul-navy-900 hover:bg-gurukul-navy-950 text-white rounded-xl font-bold text-xs shadow transition-all"
          >
            <Layers className="w-4 h-4 text-gurukul-saffron-400" />
            <span>बॅच अपलोड (Multiple)</span>
          </button>
          <button
            type="button"
            onClick={handleOpenUpload}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 text-white rounded-xl font-bold text-xs shadow hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>नवीन फोटो (Single)</span>
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

      {/* Toolbar: Category Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase mr-1">वर्गवारी:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gurukul-saffron-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            सर्व ({gallery.length})
          </button>
          {existingCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedCategory === cat
                  ? 'bg-gurukul-saffron-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="फोटो शोधा..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Upload/Edit Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-gurukul-navy-900">
                {isEditing ? 'फोटो संपादन (Edit Photo)' : 'नवीन फोटो जोडा (Add Photo to Gallery)'}
              </h2>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Photo preview or uploader */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                फोटो निवडा (Select Photo - Max 5MB) *
              </label>
              {(formData.imageUrl || formData.url) ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 h-48 bg-slate-100">
                  <img src={formData.imageUrl || formData.url} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, url: '', imageUrl: '' }))}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg text-xs font-bold shadow"
                  >
                    बदला
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-300 hover:border-gurukul-saffron-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-orange-50/30 transition-colors">
                  <Upload className="w-8 h-8 text-gurukul-saffron-600 mb-2" />
                  <span className="text-xs font-bold text-slate-700">
                    {uploading ? 'अपलोड होत आहे...' : 'फोटो निवडण्यासाठी येथे क्लिक करा'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">JPG, PNG, WebP (५MB पर्यंत)</span>
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                शीर्षक (Photo Title) *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="उदा. वार्षिक स्नेहसंमेलन व बक्षीस वितरण"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                कॅप्शन (Caption)
              </label>
              <textarea
                rows={2}
                value={formData.caption || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="फोटोबद्दल अधिक माहिती किंवा वर्णन..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Alt Text (दृष्टिहीनांसाठी स्क्रीन-रीडर वर्णन)
              </label>
              <input
                type="text"
                value={formData.altText || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
                placeholder="उदा. गुरुकुल भोसे पटांगणावर परेड सराव करताना विद्यार्थी"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    वर्गवारी (Category)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput(!showNewCatInput)}
                    className="text-[10px] text-gurukul-saffron-600 font-bold hover:underline"
                  >
                    + नवीन
                  </button>
                </div>

                {showNewCatInput ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      placeholder="नवीन वर्गवारीचे नाव..."
                      className="flex-1 px-2.5 py-1.5 border rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="px-2 py-1.5 bg-gurukul-saffron-500 text-white rounded-lg text-xs font-bold"
                    >
                      जोडा
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none"
                  >
                    {existingCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    क्रम (Order)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder ?? 1}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    स्थिती
                  </label>
                  <select
                    value={formData.status || 'published'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none"
                  >
                    <option value="published">🟢 प्रकाशित</option>
                    <option value="draft">🟡 मसुदा</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                disabled={uploading || !(formData.imageUrl || formData.url)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'बदल सेव्ह करा' : 'गॅलरीत जोडा'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Upload Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-gurukul-saffron-500" />
                <span>एकाच वेळी अनेक फोटो अपलोड करा (Batch Upload)</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              आपण कॉम्प्युटरवरून एकाच वेळी अनेक फोटो निवडून थेट Firebase Storage मध्ये सुरक्षित अपलोड करू शकता.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                सर्व फोटोंची वर्गवारी (Category for batch)
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {existingCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-gurukul-saffron-400 bg-orange-50/20 hover:bg-orange-50/40 rounded-2xl cursor-pointer transition-colors p-4 text-center">
              <Upload className="w-9 h-9 text-gurukul-saffron-600 mb-2" />
              <span className="text-xs font-bold text-slate-800">
                {uploading 
                  ? `अपलोड सुरू आहे (${batchProgress.current}/${batchProgress.total})...` 
                  : 'एकाच वेळी अनेक फोटो निवडण्यासाठी येथे क्लिक करा'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                Ctrl किंवा Shift दाबून एकापेक्षा जास्त फोटो निवडा
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                disabled={uploading}
                onChange={handleBatchUpload}
                className="hidden"
              />
            </label>

            {uploading && (
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gurukul-saffron-500 h-full transition-all duration-300"
                  style={{ width: `${(batchProgress.current / (batchProgress.total || 1)) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {showPreviewModal && (
        <div 
          onClick={() => setShowPreviewModal(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl"
          >
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img 
                src={showPreviewModal.imageUrl || showPreviewModal.url} 
                alt={showPreviewModal.altText || showPreviewModal.title}
                className="max-h-full max-w-full object-contain"
              />
              <button
                onClick={() => setShowPreviewModal(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gurukul-saffron-600">
                  {showPreviewModal.category}
                </span>
                <span className="text-[10px] text-slate-400">
                  क्रम: #{showPreviewModal.displayOrder || 1}
                </span>
              </div>
              <h3 className="text-base font-bold text-gurukul-navy-900">{showPreviewModal.title}</h3>
              {showPreviewModal.caption && (
                <p className="text-xs text-slate-600">{showPreviewModal.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredGallery.map((item) => (
          <div key={item.imageId || item.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
            <div 
              onClick={() => setShowPreviewModal(item)}
              className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
            >
              <img 
                src={item.imageUrl || item.url} 
                alt={item.altText || item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                  {item.category?.split(' ')[0]}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/90 text-slate-900 text-[10px] font-bold">
                  #{item.displayOrder || 1}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStatus(item);
                }}
                className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer shadow-sm ${
                  item.status === 'published' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-amber-400 text-slate-900'
                }`}
                title="स्थिती बदलण्यासाठी क्लिक करा"
              >
                {item.status === 'published' ? 'प्रकाशित' : 'मसुदा'}
              </button>
            </div>

            <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-gurukul-navy-900 line-clamp-2">{item.title}</h3>
                {item.caption && (
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.caption}</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(item)}
                    className="p-1 text-slate-400 hover:text-gurukul-saffron-600 rounded"
                    title="प्रिव्ह्यू पहा"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1 text-slate-400 hover:text-gurukul-navy-900 rounded"
                    title="संपादन करा"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  title="काढून टाका"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CMSGalleryPage;
