import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Save, 
  Trash2, 
  FileText, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Calendar, 
  Pin,
  ExternalLink,
  Download,
  Edit2,
  Clock,
  Search,
  Filter,
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../../contexts/CMSContext';
import { uploadMediaFile, validateUploadFile } from '../../../services/storage/mediaUploadService';
import { getPublicWebsiteUrl } from '../../../services/navigation/navigationUrls';

export const CMSNoticesPage = () => {
  const { notices, saveNotice, deleteNotice, loading } = useCMS();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const defaultNotice = {
    noticeId: '',
    title: '',
    description: '',
    category: 'प्रवेश (Admission)',
    date: new Date().toISOString().split('T')[0],
    isImportant: false,
    isUrgent: false,
    attachmentUrl: '',
    fileUrl: '',
    downloadLink: '',
    fileName: '',
    attachmentStoragePath: '',
    status: 'published',
    publishAt: '',
    publishedAt: new Date().toISOString()
  };

  const [formData, setFormData] = useState(defaultNotice);

  const handleOpenAdd = () => {
    setFormData({
      ...defaultNotice,
      noticeId: `notice_${Date.now()}`,
      publishedAt: new Date().toISOString()
    });
    setIsEditing(false);
    setShowModal(true);
    setMessage(null);
  };

  const handleOpenEdit = (n) => {
    setFormData({
      ...defaultNotice,
      ...n,
      isImportant: n.isImportant ?? n.isUrgent ?? false,
      isUrgent: n.isImportant ?? n.isUrgent ?? false,
      attachmentUrl: n.attachmentUrl || n.fileUrl || n.downloadLink || '',
      fileUrl: n.attachmentUrl || n.fileUrl || n.downloadLink || '',
      downloadLink: n.attachmentUrl || n.fileUrl || n.downloadLink || ''
    });
    setIsEditing(true);
    setShowModal(true);
    setMessage(null);
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file, true); // isDocument = true
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error });
      return;
    }

    try {
      setUploadingPdf(true);
      const res = await uploadMediaFile(file, 'notices', `notice_doc_${Date.now()}`);
      const downloadURL = res.downloadURL || res.url;
      setFormData(prev => ({
        ...prev,
        attachmentUrl: downloadURL,
        fileUrl: downloadURL,
        downloadLink: downloadURL,
        fileName: file.name,
        attachmentStoragePath: res.storagePath || ''
      }));
      setMessage({ type: 'success', text: 'PDF परिपत्रक यशस्वीरीत्या अपलोड झाले.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'दस्तऐवज अपलोड करताना त्रुटी आली.' });
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'कृपया सूचनेचे शीर्षक भरा.' });
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const isScheduled = formData.publishAt && new Date(formData.publishAt) > new Date();
      const status = formData.status === 'draft' ? 'draft' : (isScheduled ? 'scheduled' : 'published');

      await saveNotice({
        ...formData,
        isImportant: Boolean(formData.isImportant || formData.isUrgent),
        isUrgent: Boolean(formData.isImportant || formData.isUrgent),
        attachmentUrl: formData.attachmentUrl || formData.fileUrl || formData.downloadLink || '',
        fileUrl: formData.attachmentUrl || formData.fileUrl || formData.downloadLink || '',
        downloadLink: formData.attachmentUrl || formData.fileUrl || formData.downloadLink || '',
        status,
        publishedAt: formData.publishedAt || now,
        updatedAt: now
      });
      setMessage({ type: 'success', text: isEditing ? 'सूचना यशस्वीरीत्या अद्यतनित केली!' : `सूचना "${formData.title}" यशस्वीरीत्या प्रकाशित झाली!` });
      setShowModal(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'जतन करताना त्रुटी आली.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (n) => {
    const newStatus = n.status === 'published' ? 'draft' : 'published';
    try {
      await saveNotice({
        ...n,
        status: newStatus
      });
      setMessage({ 
        type: 'success', 
        text: `सूचना स्थिती ${newStatus === 'published' ? 'प्रकाशित' : 'मसुदा'} म्हणून बदलली.` 
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'स्थिती बदलताना त्रुटी आली.' });
    }
  };

  const handleDelete = async (noticeId, title) => {
    if (!window.confirm(`तुम्हाला खात्री आहे की "${title}" ही सूचना हटवायची आहे?`)) {
      return;
    }

    try {
      await deleteNotice(noticeId);
      setMessage({ type: 'success', text: 'सूचना यशस्वीरीत्या काढून टाकली.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'हटवताना त्रुटी आली.' });
    }
  };

  const filteredNotices = (notices || []).filter(n => {
    const matchesCat = categoryFilter === 'all' || n.category === categoryFilter;
    const matchesSearch = !searchTerm ||
      (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.description || '').toLowerCase().includes(searchTerm.toLowerCase());
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
              <Bell className="w-7 h-7 text-gurukul-saffron-600" />
              <span>सूचना व परिपत्रक व्यवस्थापन (Notices CMS)</span>
            </h1>
            <p className="text-sm text-slate-500">
              प्रवेश सूचना, वेळापत्रक, शेड्युलिंग, परिपत्रके व PDF दस्तऐवज अपलोड करा व व्यवस्थापित करा.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`${getPublicWebsiteUrl()}/notices`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs border border-slate-300 transition-all"
            title="लाईव्ह वेबसाईटवर सूचना पहा"
          >
            <Eye className="w-4 h-4 text-gurukul-saffron-600" />
            <span className="hidden sm:inline">लाईव्ह सूचना पत्रक पहा</span>
          </a>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>नवीन सूचना जोडा (Add Notice)</span>
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

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="सूचना शोधा..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none"
          >
            <option value="all">सर्व वर्गवारी (All)</option>
            <option value="प्रवेश (Admission)">प्रवेश</option>
            <option value="परीक्षा (Examination)">परीक्षा</option>
            <option value="सुट्टी (Holidays)">सुट्टी</option>
            <option value="सांस्कृतिक (Events)">सांस्कृतिक</option>
            <option value="सर्वसाधारण (General)">सर्वसाधारण</option>
          </select>
        </div>
      </div>

      {/* Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-gurukul-navy-900">
                {isEditing ? 'सूचना संपादन (Edit Notice)' : 'नवीन सूचना तयार करा (Create Notice)'}
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
                सूचनेचे शीर्षक (Notice Title) *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="उदा. चालू शैक्षणिक वर्षातील इयत्ता ५ वी सैनिक स्कूल प्रवेश परीक्षा"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                तपशील (Details / Description)
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="पालक व विद्यार्थ्यांसाठी सविस्तर सूचना किंवा मार्गदर्शक मुद्दे..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  वर्गवारी (Category)
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none"
                >
                  <option value="प्रवेश (Admission)">प्रवेश (Admission)</option>
                  <option value="परीक्षा (Examination)">परीक्षा (Examination)</option>
                  <option value="सुट्टी (Holidays)">सुट्टी (Holidays)</option>
                  <option value="सांस्कृतिक (Events)">सांस्कृतिक (Events)</option>
                  <option value="सर्वसाधारण (General)">सर्वसाधारण (General)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  तारीख (Notice Date)
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                  <span>प्रकाशन तारीख / वेळ (Publish Schedule)</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.publishAt || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishAt: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  स्थिती (Status)
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none"
                >
                  <option value="published">🟢 त्वरित प्रकाशित (Published)</option>
                  <option value="draft">🟡 मसुदा (Draft)</option>
                </select>
              </div>
            </div>

            {/* PDF Attachment Upload */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                परिपत्रक PDF फाईल (PDF Circular - Max 15MB)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.attachmentUrl || formData.fileUrl || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    attachmentUrl: e.target.value, 
                    fileUrl: e.target.value, 
                    downloadLink: e.target.value 
                  }))}
                  placeholder="PDF URL किंवा थेट अपलोड करा"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                  <span>{uploadingPdf ? '...' : 'PDF अपलोड'}</span>
                  <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                </label>
              </div>
              {formData.fileName && (
                <p className="text-[11px] text-emerald-600 font-medium mt-1">
                  जोडलेली फाईल: {formData.fileName}
                </p>
              )}
            </div>

            {/* Important / Urgent Checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isImportantNotice"
                checked={Boolean(formData.isImportant || formData.isUrgent)}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  isImportant: e.target.checked,
                  isUrgent: e.target.checked
                }))}
                className="w-4 h-4 rounded text-gurukul-saffron-600 focus:ring-gurukul-saffron-500"
              />
              <label htmlFor="isImportantNotice" className="text-xs font-bold text-gurukul-navy-900 cursor-pointer">
                महत्त्वाची / तातडीची सूचना (Important / Urgent Notice Highlight)
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'जतन करत आहे...' : 'सूचना सेव्ह करा'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gurukul-navy-900">
            एकूण सूचना ({filteredNotices.length})
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {loading && (!notices || notices.length === 0) ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-3 border-gurukul-saffron-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">सूचना लोड होत आहेत (Loading notices)...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              कोणतीही सूचना आढळली नाही.
            </div>
          ) : (
            filteredNotices.map((n) => {
              const fileLink = n.attachmentUrl || n.fileUrl || n.downloadLink;
              const isImp = Boolean(n.isImportant || n.isUrgent);
              return (
                <div key={n.noticeId || n.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isImp ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-gurukul-saffron-600'
                    }`}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gurukul-navy-900 text-sm">{n.title}</h3>
                        {isImp && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                            महत्त्वाची
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                          {n.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(n)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer shadow-xs ${
                            n.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                          title="स्थिती बदलण्यासाठी क्लिक करा"
                        >
                          {n.status === 'published' ? 'प्रकाशित' : 'मसुदा'}
                        </button>
                      </div>
                      {n.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{n.description}</p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{n.date || n.publishedAt?.split('T')[0]}</span>
                        {fileLink && (
                          <span className="ml-2 text-gurukul-saffron-600 font-medium inline-flex items-center gap-1">
                            <FileText className="w-3 h-3" /> PDF जोडलेले
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {fileLink && (
                      <a
                        href={fileLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-500 hover:text-gurukul-saffron-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="PDF पहा / डाउनलोड करा"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(n)}
                      className="p-2 text-slate-400 hover:text-gurukul-navy-900 rounded-lg hover:bg-slate-100 transition-colors"
                      title="संपादन करा"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(n.noticeId || n.id, n.title)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      title="काढून टाका"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CMSNoticesPage;
