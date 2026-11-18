import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Save, 
  Trash2, 
  Edit2, 
  Eye, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Search,
  Filter,
  Globe,
  Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../../contexts/CMSContext';
import { uploadMediaFile, validateUploadFile } from '../../../services/storage/mediaUploadService';

export const CMSCoursesPage = () => {
  const { courses, saveCourse, deleteCourse, loading } = useCMS();
  const safeCourses = Array.isArray(courses) ? courses : [];

  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState(null);

  const defaultCourse = {
    courseId: '',
    slug: '',
    title: '',
    category: 'शाळा (School)',
    eligibility: '',
    duration: '१ वर्ष',
    image: '',
    imageUrl: '',
    storagePath: '',
    shortDescription: '',
    fullDescription: '',
    status: 'published',
    displayOrder: safeCourses.length + 1,
    seoTitle: '',
    seoDescription: '',
    features: ['सैनिक पॅटर्न निवासी दिनचर्या', 'तज्ज्ञ शिक्षकांचे मार्गदर्शन', 'नियमित सराव व परीक्षा']
  };

  const [formData, setFormData] = useState(defaultCourse);

  const handleCreateNew = () => {
    const newCourse = {
      ...defaultCourse,
      courseId: `course_${Date.now()}`,
      displayOrder: safeCourses.length + 1
    };
    setFormData(newCourse);
    setIsEditing(true);
    setMessage(null);
  };

  const handleEdit = (course) => {
    setFormData({
      ...defaultCourse,
      ...JSON.parse(JSON.stringify(course)),
      imageUrl: course.imageUrl || course.image || ''
    });
    setIsEditing(true);
    setMessage(null);
  };

  const handleDelete = async (courseId, title) => {
    if (!window.confirm(`तुम्हाला खात्री आहे की "${title}" हा अभ्यासक्रम हटवायचा आहे?`)) {
      return;
    }

    try {
      await deleteCourse(courseId);
      setMessage({ type: 'success', text: `अभ्यासक्रम "${title}" यशस्वीरीत्या काढून टाकला.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'हटवताना त्रुटी आली.' });
    }
  };

  const handleToggleStatus = async (course) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    try {
      await saveCourse({
        ...course,
        status: newStatus
      });
      setMessage({ 
        type: 'success', 
        text: `अभ्यासक्रम "${course.title}" स्थिती ${newStatus === 'published' ? 'प्रकाशित' : 'मसुदा'} म्हणून बदलली.` 
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'स्थिती बदलताना त्रुटी आली.' });
    }
  };

  const handleTitleChange = (val) => {
    setFormData(prev => {
      // Auto-generate slug if new or empty
      const autoSlug = prev.courseId.startsWith('course_') || !prev.slug
        ? val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `course-${Date.now().toString().slice(-4)}`
        : prev.slug;
      return {
        ...prev,
        title: val,
        slug: autoSlug
      };
    });
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
      const res = await uploadMediaFile(file, 'courses', `course_${formData.slug || Date.now()}`);
      const downloadURL = res.downloadURL || res.url;
      setFormData(prev => ({ 
        ...prev, 
        image: downloadURL,
        imageUrl: downloadURL,
        storagePath: res.storagePath || ''
      }));
      setMessage({ type: 'success', text: 'अभ्यासक्रम इमेज यशस्वीरीत्या अपलोड झाली.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'इमेज अपलोड करताना त्रुटी आली.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), 'नवीन वैशिष्ट्य']
    }));
  };

  const updateFeature = (index, value) => {
    setFormData(prev => {
      const feats = [...(prev.features || [])];
      feats[index] = value;
      return { ...prev, features: feats };
    });
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'कृपया अभ्यासक्रमाचे नाव प्रविष्ट करा.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await saveCourse({
        ...formData,
        imageUrl: formData.imageUrl || formData.image || '',
        displayOrder: parseInt(formData.displayOrder) || 1
      });
      setMessage({ type: 'success', text: `अभ्यासक्रम "${formData.title}" यशस्वीरीत्या सेव्ह झाला!` });
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'जतन करताना त्रुटी आली.' });
    } finally {
      setSaving(false);
    }
  };

  const sortedCourses = [...safeCourses].sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

  const filteredCourses = sortedCourses.filter(c => {
    const matchesSearch = c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesSearch && matchesCat;
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
              <BookOpen className="w-7 h-7 text-gurukul-saffron-600" />
              <span>अभ्यासक्रम व्यवस्थापन (Courses CMS)</span>
            </h1>
            <p className="text-sm text-slate-500">
              वेबसाईटवरील अभ्यासक्रम तयार करा, संपादन करा, पात्रता, कालावधी व तपशील व्यवस्थापित करा.
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
            <span>नवीन कोर्स जोडा (Add New Course)</span>
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

      {/* Mode 1: Editor */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-gurukul-navy-900">
                {formData.courseId ? 'अभ्यासक्रम संपादन (Edit Course)' : 'नवीन अभ्यासक्रम तयार करा (New Course)'}
              </h2>
              <p className="text-xs text-slate-500">
                सार्वजनिक वेबसाईटवर दिसणारा सर्व अभ्यासक्रम मजकूर येथे अद्यतनित करा
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                रद्द करा (Cancel)
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'जतन करत आहे...' : 'कोर्स सेव्ह करा (Save Course)'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                अभ्यासक्रमाचे नाव (Course Title) *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="उदा. ५ वी ते १० वी सैनिक पॅटर्न निवासी शाळा"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                URL स्लग (Course Slug) *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-500 font-mono">
                  /courses/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                  placeholder="vidyamandir-school"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-sm font-mono focus:bg-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                वर्गवारी (Category)
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              >
                <option value="शाळा (School)">शाळा (School)</option>
                <option value="ज्युनिअर कॉलेज (Junior College)">ज्युनिअर कॉलेज (Junior College)</option>
                <option value="स्पर्धा परीक्षा अकॅडमी (Competitive)">स्पर्धा परीक्षा अकॅडमी (Competitive)</option>
                <option value="सायन्स अकॅडमी (Science)">सायन्स अकॅडमी (Science)</option>
                <option value="स्पोर्ट्स व डिफेन्स (Sports & Defence)">स्पोर्ट्स व डिफेन्स (Sports & Defence)</option>
                <option value="कम्प्युटर इन्स्टिट्यूट (Computer)">कम्प्युटर इन्स्टिट्यूट (Computer)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  पात्रता (Eligibility)
                </label>
                <input
                  type="text"
                  value={formData.eligibility || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, eligibility: e.target.value }))}
                  placeholder="उदा. ४ थी उत्तीर्ण विद्यार्थी"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  कालावधी (Duration)
                </label>
                <input
                  type="text"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="उदा. १ वर्ष / निवासी"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                थोडक्यात माहिती (Short Summary) *
              </label>
              <textarea
                rows={2}
                required
                value={formData.shortDescription || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="कोर्स कार्डवर दिसणारा २-३ ओळींचा संक्षिप्त परिचय..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                सविस्तर माहिती (Full Description)
              </label>
              <textarea
                rows={4}
                value={formData.fullDescription || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                placeholder="अभ्यासक्रमाची उद्दिष्टे, अभ्यासपद्धती आणि निकालांची सविस्तर माहिती..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                इमेज (Course Image URL किंवा Upload)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.imageUrl || formData.image || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value, imageUrl: e.target.value }))}
                  placeholder="इमेज URL किंवा अपलोड करा"
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                  <span>{uploadingImage ? '...' : 'अपलोड'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              {(formData.imageUrl || formData.image) && (
                <div className="mt-2 w-24 h-16 rounded-lg overflow-hidden border">
                  <img src={formData.imageUrl || formData.image} alt="Course Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  प्रदर्शन क्रम (Display Order)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.displayOrder ?? 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  प्रकाशन स्थिती (Status)
                </label>
                <select
                  value={formData.status || 'published'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white outline-none"
                >
                  <option value="published">🟢 प्रकाशित (Published)</option>
                  <option value="draft">🟡 मसुदा (Draft)</option>
                </select>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="md:col-span-2 pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                <span>SEO माहिती (SEO Metadata for Course Page)</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={formData.seoTitle || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder="उदा. ५ वी ते १० वी सैनिक पॅटर्न निवासी शाळा | गुरुकुल भोसे"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">SEO Description</label>
                  <input
                    type="text"
                    value={formData.seoDescription || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder="सर्च इंजिनसाठी १६० अक्षरांचे संक्षिप्त वर्णन..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                अभ्यासक्रमाची वैशिष्ट्ये (Course Highlights)
              </label>
              <button
                type="button"
                onClick={addFeature}
                className="text-xs font-bold text-gurukul-saffron-600 hover:text-gurukul-saffron-700"
              >
                + वैशिष्ट्य जोडा
              </button>
            </div>

            <div className="space-y-2">
              {formData.features?.map((feat, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      ) : (
        /* Mode 2: Course List */
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="अभ्यासक्रम शोधा (Search courses)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none"
              >
                <option value="all">सर्व वर्गवारी (All Categories)</option>
                <option value="शाळा (School)">शाळा</option>
                <option value="ज्युनिअर कॉलेज (Junior College)">ज्युनिअर कॉलेज</option>
                <option value="स्पर्धा परीक्षा अकॅडमी (Competitive)">स्पर्धा परीक्षा अकॅडमी</option>
                <option value="सायन्स अकॅडमी (Science)">सायन्स अकॅडमी</option>
                <option value="स्पोर्ट्स व डिफेन्स (Sports & Defence)">स्पोर्ट्स व डिफेन्स</option>
                <option value="कम्प्युटर इन्स्टिट्यूट (Computer)">कम्प्युटर इन्स्टिट्यूट</option>
              </select>
            </div>
          </div>

          {/* Courses Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredCourses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  कोणतेही अभ्यासक्रम सापडले नाहीत.
                </div>
              ) : (
                filteredCourses.map((c) => (
                  <div key={c.courseId} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {c.imageUrl || c.image ? (
                        <img 
                          src={c.imageUrl || c.image} 
                          alt={c.title} 
                          className="w-16 h-14 rounded-xl object-cover shrink-0 border border-slate-100 shadow-xs" 
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-orange-100 text-gurukul-saffron-600 flex items-center justify-center shrink-0">
                          <BookOpen className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold flex items-center justify-center">
                            #{c.displayOrder || 1}
                          </span>
                          <h3 className="font-bold text-gurukul-navy-900 text-base">{c.title}</h3>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(c)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                              c.status === 'published' 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                            title="स्थिती बदलण्यासाठी क्लिक करा"
                          >
                            {c.status === 'published' ? '🟢 प्रकाशित' : '🟡 मसुदा'}
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          वर्गवारी: <span className="font-semibold text-slate-700">{c.category}</span> • 
                          कालावधी: <span className="font-semibold text-slate-700">{c.duration}</span> • 
                          स्लग: <span className="font-mono text-gurukul-saffron-600">/courses/{c.slug}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{c.shortDescription}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        to={`/courses/${c.slug}`}
                        target="_blank"
                        className="p-2 text-slate-500 hover:text-gurukul-saffron-600 hover:bg-white rounded-lg border border-slate-200 transition-colors"
                        title="वेबसाईटवर पहा (View Live)"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleEdit(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>संपादित करा</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.courseId, c.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="हटवा (Delete)"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CMSCoursesPage;
