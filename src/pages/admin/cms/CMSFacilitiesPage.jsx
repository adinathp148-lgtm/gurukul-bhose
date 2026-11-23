import React, { useState } from 'react';
import { 
  Building, 
  Plus, 
  Save, 
  Trash2, 
  Edit2, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../../contexts/CMSContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { uploadMediaFile, validateUploadFile } from '../../../services/storage/mediaUploadService';

const FACILITY_CATEGORIES = [
  { value: 'निवास व हॉस्टेल (Hostel & Boarding)', mr: 'निवास व हॉस्टेल (Hostel & Boarding)', en: 'Hostel & Boarding' },
  { value: 'अभ्यासिका व लायब्ररी (Library & Study Hall)', mr: 'अभ्यासिका व लायब्ररी (Library & Study Hall)', en: 'Library & Study Hall' },
  { value: 'सैनिक स्कूल फिजिकल ट्रॅक व शूटिंग (Military Training & Sports)', mr: 'सैनिक स्कूल फिजिकल ट्रॅक व शूटिंग (Military Training & Sports)', en: 'Military Training & Sports' },
  { value: 'विज्ञान व संगणक लॅब (Science & Computer Labs)', mr: 'विज्ञान व संगणक लॅब (Science & Computer Labs)', en: 'Science & Computer Labs' },
  { value: 'मेस व सकस आहार (Mess & Nutrition)', mr: 'मेस व सकस आहार (Mess & Nutrition)', en: 'Mess & Nutrition' },
  { value: 'वैद्यकीय व सुरक्षा (Health, Medical & Security)', mr: 'वैद्यकीय व सुरक्षा (Health, Medical & Security)', en: 'Health, Medical & Security' },
  { value: 'इतर कॅम्पस सुविधा (Other Campus Infrastructure)', mr: 'इतर कॅम्पस सुविधा (Other Campus Infrastructure)', en: 'Other Campus Infrastructure' }
];

export const CMSFacilitiesPage = () => {
  const { facilities, saveFacility, deleteFacility } = useCMS();
  const { isMarathi } = useLanguage();

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState(null);

  const getFacilityCategoryLabel = (val) => {
    const match = FACILITY_CATEGORIES.find(c => c.value === val);
    if (match) return isMarathi ? match.mr : match.en;
    if (!isMarathi && typeof val === 'string') {
      const parenMatch = val.match(/\(([^)]+)\)/);
      if (parenMatch) return parenMatch[1];
    }
    return val || '';
  };

  const defaultFacility = {
    facilityId: '',
    title: '',
    subtitle: '',
    category: FACILITY_CATEGORIES[0].value,
    description: '',
    image: '',
    imageUrl: '',
    storagePath: '',
    displayOrder: 1,
    status: 'published'
  };

  const [formData, setFormData] = useState(defaultFacility);

  const handleOpenAdd = () => {
    const nextOrder = (facilities?.length || 0) + 1;
    setFormData({
      ...defaultFacility,
      facilityId: `fac_${Date.now()}`,
      displayOrder: nextOrder
    });
    setShowModal(true);
    setMessage(null);
  };

  const handleEdit = (fac) => {
    setFormData({
      ...defaultFacility,
      ...JSON.parse(JSON.stringify(fac)),
      displayOrder: Number(fac.displayOrder) || 1,
      status: fac.status || 'published',
      image: fac.image || fac.imageUrl || '',
      imageUrl: fac.imageUrl || fac.image || ''
    });
    setShowModal(true);
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
      const res = await uploadMediaFile(file, 'facilities', `facility_${Date.now()}`);
      const uploadedUrl = res.downloadURL || res.url;
      setFormData(prev => ({ 
        ...prev, 
        image: uploadedUrl,
        imageUrl: uploadedUrl,
        storagePath: res.storagePath || ''
      }));
      setMessage({
        type: 'success',
        text: isMarathi ? 'सुविधा फोटो यशस्वीरीत्या अपलोड झाला.' : 'Facility image uploaded successfully.'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || (isMarathi ? 'इमेज अपलोड करताना त्रुटी आली.' : 'Failed to upload image.')
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage({
        type: 'error',
        text: isMarathi ? 'कृपया सुविधेचे नाव भरा.' : 'Please enter the facility title.'
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        imageUrl: formData.image || formData.imageUrl,
        image: formData.image || formData.imageUrl,
        displayOrder: Number(formData.displayOrder) || 1
      };
      await saveFacility(payload);
      setMessage({
        type: 'success',
        text: isMarathi
          ? `सुविधा "${formData.title}" यशस्वीरीत्या सेव्ह झाली!`
          : `Facility "${formData.title}" saved successfully!`
      });
      setShowModal(false);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || (isMarathi ? 'जतन करताना त्रुटी आली.' : 'Error saving facility.')
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (fac) => {
    const newStatus = fac.status === 'published' ? 'draft' : 'published';
    try {
      await saveFacility({ ...fac, status: newStatus });
      setMessage({
        type: 'success',
        text: isMarathi
          ? `सुविधा स्थिती "${newStatus === 'published' ? 'प्रकाशित (Published)' : 'मसुदा (Draft)'}" केली.`
          : `Facility status changed to "${newStatus === 'published' ? 'Published' : 'Draft'}".`
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || (isMarathi ? 'स्थिती बदलताना त्रुटी आली.' : 'Failed to update status.')
      });
    }
  };

  const handleDelete = async (facilityId, title) => {
    if (!window.confirm(
      isMarathi
        ? `तुम्हाला खात्री आहे की "${title}" ही सुविधा हटवायची आहे?`
        : `Are you sure you want to delete the facility "${title}"?`
    )) {
      return;
    }

    try {
      await deleteFacility(facilityId);
      setMessage({
        type: 'success',
        text: isMarathi ? 'सुविधा यशस्वीरीत्या काढून टाकली.' : 'Facility deleted successfully.'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || (isMarathi ? 'हटवताना त्रुटी आली.' : 'Error deleting facility.')
      });
    }
  };

  const sortedFacilities = [...(facilities || [])].sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

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
              <Building className="w-7 h-7 text-gurukul-saffron-600" />
              <span>{isMarathi ? 'कॅम्पस सुविधा व्यवस्थापन (Facilities CMS)' : 'Campus Facilities Management (CMS)'}</span>
            </h1>
            <p className="text-sm text-slate-500">
              {isMarathi
                ? 'हॉस्टेल, अभ्यासिका, मेस, सैनिक रनिंग ट्रॅक, शूटिंग रेंज व प्रयोगशाळा व्यवस्थापित करा.'
                : 'Manage hostel, study hall, mess, Sainik running track, shooting range, and laboratories.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isMarathi ? 'नवीन सुविधा जोडा' : 'Add Facility'}</span>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-gurukul-navy-900">
                {formData.title
                  ? (isMarathi ? 'सुविधा संपादन (Edit Facility)' : 'Edit Facility')
                  : (isMarathi ? 'नवीन सुविधा जोडा (New Facility)' : 'Add New Facility')}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'सुविधेचे नाव (Facility Title) *' : 'Facility Title *'}
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={isMarathi ? 'उदा. अत्याधुनिक निवास व्यवस्था (Hostel)' : 'e.g. Modern Residential Hostel'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isMarathi ? 'वर्गवारी (Category)' : 'Category'}
                </label>
                <select
                  value={formData.category || FACILITY_CATEGORIES[0].value}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                >
                  {FACILITY_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {isMarathi ? cat.mr : cat.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isMarathi ? 'प्रदर्शन क्रम (Display Order)' : 'Display Order'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.displayOrder || 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value, 10) || 1 }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'उपशीर्षक / ठळक वैशिष्ट्य (Subtitle)' : 'Subtitle / Key Highlight'}
              </label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder={isMarathi ? 'उदा. सुरक्षित व स्वच्छ निवासी संकुल' : 'e.g. Safe & hygienic residential complex'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'सविस्तर माहिती (Description)' : 'Description'}
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={isMarathi ? 'सुविधेविषयी थोडक्यात माहिती...' : 'Brief details about the facility...'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'फोटो (Facility Image)' : 'Facility Image'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value, imageUrl: e.target.value }))}
                  placeholder={isMarathi ? 'इमेज URL किंवा अपलोड करा' : 'Image URL or upload'}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                  <span>{uploadingImage ? '...' : (isMarathi ? 'अपलोड' : 'Upload')}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              {formData.image && (
                <div className="mt-2 h-20 w-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'प्रकाशन स्थिती (Status)' : 'Publish Status'}
              </label>
              <select
                value={formData.status || 'published'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white outline-none"
              >
                <option value="published">
                  {isMarathi ? 'प्रकाशित (Published - सर्वांना दिसेल)' : 'Published (Visible to public)'}
                </option>
                <option value="draft">
                  {isMarathi ? 'मसुदा (Draft - फक्त ॲडमिनला दिसेल)' : 'Draft (Visible to admins only)'}
                </option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {isMarathi ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? (isMarathi ? 'जतन करत आहे...' : 'Saving...') : (isMarathi ? 'सुविधा सेव्ह करा' : 'Save Facility')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedFacilities.map((fac) => {
          const isPublished = fac.status !== 'draft';
          const imageSrc = fac.image || fac.imageUrl;

          return (
            <div key={fac.facilityId || fac.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
              <div className="relative">
                {imageSrc ? (
                  <div className="h-44 bg-slate-100 overflow-hidden">
                    <img src={imageSrc} alt={fac.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-32 bg-orange-50 flex items-center justify-center text-gurukul-saffron-600">
                    <Building className="w-10 h-10" />
                  </div>
                )}
                
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-gurukul-navy-950/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                    #{fac.displayOrder || 1}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md backdrop-blur-xs ${
                    isPublished ? 'bg-emerald-600/90 text-white' : 'bg-amber-600/90 text-white'
                  }`}>
                    {isPublished
                      ? (isMarathi ? 'प्रकाशित' : 'Published')
                      : (isMarathi ? 'मसुदा' : 'Draft')}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-gurukul-navy-900">{fac.title}</h3>
                  {fac.subtitle && (
                    <p className="text-xs font-semibold text-gurukul-saffron-600 mt-0.5">{fac.subtitle}</p>
                  )}
                  {fac.category && (
                    <span className="inline-block mt-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {getFacilityCategoryLabel(fac.category)}
                    </span>
                  )}
                  {fac.description && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">{fac.description}</p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(fac)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      isPublished 
                        ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' 
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                    title={isPublished
                      ? (isMarathi ? 'मसुदा करा (Unpublish)' : 'Unpublish (Move to Draft)')
                      : (isMarathi ? 'प्रकाशित करा (Publish)' : 'Publish')}
                  >
                    {isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>
                      {isPublished
                        ? (isMarathi ? 'अप्रकाशित करा' : 'Unpublish')
                        : (isMarathi ? 'प्रकाशित करा' : 'Publish')}
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(fac)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isMarathi ? 'संपादित करा' : 'Edit'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(fac.facilityId || fac.id, fac.title)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      title={isMarathi ? 'काढून टाका' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CMSFacilitiesPage;
