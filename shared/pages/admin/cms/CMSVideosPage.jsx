import React, { useState } from 'react';
import { 
  Video, 
  Plus, 
  Save, 
  Trash2, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Youtube, 
  ExternalLink,
  Play,
  Edit2,
  Upload,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../../contexts/CMSContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { uploadMediaFile, validateUploadFile } from '../../../services/storage/mediaUploadService';
import { getPublicWebsiteUrl } from '../../../services/navigation/navigationUrls';

const VIDEO_CATEGORIES = [
  { value: 'कॅम्पस टूअर', mr: 'कॅम्पस टूअर', en: 'Campus Tour' },
  { value: 'सांस्कृतिक व स्नेहसंमेलन', mr: 'सांस्कृतिक व स्नेहसंमेलन', en: 'Cultural & Annual Gathering' },
  { value: 'सैनिक पॅटर्न व कवायत', mr: 'सैनिक पॅटर्न व कवायत', en: 'Sainik Pattern & Drills' },
  { value: 'वृत्त व बातम्या', mr: 'वृत्त व बातम्या', en: 'News & Media Coverage' }
];

export const CMSVideosPage = () => {
  const { videos, saveVideo, deleteVideo } = useCMS();
  const { isMarathi } = useLanguage();
  const safeVideos = Array.isArray(videos) ? videos : [];

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const getVideoCategoryLabel = (val) => {
    const match = VIDEO_CATEGORIES.find(c => c.value === val);
    if (match) return isMarathi ? match.mr : match.en;
    return val || (isMarathi ? 'कॅम्पस टूअर' : 'Campus Tour');
  };

  const defaultVideo = {
    videoId: '',
    title: '',
    description: '',
    youtubeUrl: '',
    youtubeVideoId: '',
    embedId: '',
    thumbnailUrl: '',
    thumbnail: '',
    category: 'कॅम्पस टूअर',
    displayOrder: safeVideos.length + 1,
    status: 'published',
    publishedAt: new Date().toISOString()
  };

  const [formData, setFormData] = useState(defaultVideo);

  // Helper to extract YouTube video ID safely
  const extractYouTubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const handleUrlChange = (url) => {
    const id = extractYouTubeId(url);
    const defaultThumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
    setFormData(prev => ({
      ...prev,
      youtubeUrl: url,
      youtubeVideoId: id,
      embedId: id,
      thumbnailUrl: prev.thumbnailUrl || defaultThumb,
      thumbnail: prev.thumbnail || defaultThumb
    }));
  };

  const handleThumbUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error });
      return;
    }

    try {
      setUploadingThumb(true);
      const res = await uploadMediaFile(file, 'videos', `vidthumb_${Date.now()}`);
      const downloadURL = res.downloadURL || res.url;
      setFormData(prev => ({
        ...prev,
        thumbnailUrl: downloadURL,
        thumbnail: downloadURL
      }));
      setMessage({
        type: 'success',
        text: isMarathi ? 'कस्टम थंबनेल यशस्वीरीत्या अपलोड झाला.' : 'Custom thumbnail uploaded successfully.'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || (isMarathi ? 'थंबनेल अपलोड करताना त्रुटी आली.' : 'Error uploading thumbnail.')
      });
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      ...defaultVideo,
      videoId: `vid_${Date.now()}`,
      displayOrder: videos.length + 1
    });
    setIsEditing(false);
    setShowModal(true);
    setMessage(null);
  };

  const handleOpenEdit = (vid) => {
    const yId = vid.youtubeVideoId || vid.embedId || extractYouTubeId(vid.youtubeUrl);
    setFormData({
      ...defaultVideo,
      ...vid,
      youtubeVideoId: yId,
      embedId: yId,
      thumbnailUrl: vid.thumbnailUrl || vid.thumbnail || `https://img.youtube.com/vi/${yId}/hqdefault.jpg`,
      thumbnail: vid.thumbnailUrl || vid.thumbnail || `https://img.youtube.com/vi/${yId}/hqdefault.jpg`
    });
    setIsEditing(true);
    setShowModal(true);
    setMessage(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const videoId = formData.youtubeVideoId || formData.embedId || extractYouTubeId(formData.youtubeUrl);
    if (!videoId) {
      setMessage({
        type: 'error',
        text: isMarathi ? 'कृपया वैध YouTube लिंक (Valid YouTube URL) प्रविष्ट करा.' : 'Please enter a valid YouTube URL.'
      });
      return;
    }

    setSaving(true);
    try {
      const thumb = formData.thumbnailUrl || formData.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      await saveVideo({
        ...formData,
        youtubeVideoId: videoId,
        embedId: videoId,
        thumbnailUrl: thumb,
        thumbnail: thumb,
        displayOrder: parseInt(formData.displayOrder) || 1
      });
      setMessage({
        type: 'success',
        text: isEditing
          ? (isMarathi ? 'व्हिडिओ माहिती अद्यतनित केली!' : 'Video details updated successfully!')
          : (isMarathi ? `व्हिडिओ "${formData.title}" यशस्वीरीत्या जतन केला!` : `Video "${formData.title}" saved successfully!`)
      });
      setShowModal(false);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || (isMarathi ? 'जतन करताना त्रुटी आली.' : 'Error saving video.')
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (vid) => {
    const newStatus = vid.status === 'published' ? 'draft' : 'published';
    try {
      await saveVideo({
        ...vid,
        status: newStatus
      });
      setMessage({ 
        type: 'success', 
        text: isMarathi
          ? `व्हिडिओ स्थिती ${newStatus === 'published' ? 'प्रकाशित' : 'मसुदा'} केली.`
          : `Video status changed to ${newStatus === 'published' ? 'Published' : 'Draft'}.`
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: isMarathi ? 'स्थिती बदलताना त्रुटी आली.' : 'Failed to update status.'
      });
    }
  };

  const handleDelete = async (videoId, title) => {
    if (!window.confirm(
      isMarathi
        ? `तुम्हाला खात्री आहे की "${title}" हा व्हिडिओ हटवायचा आहे?`
        : `Are you sure you want to delete the video "${title}"?`
    )) {
      return;
    }

    try {
      await deleteVideo(videoId);
      setMessage({
        type: 'success',
        text: isMarathi ? 'व्हिडिओ यशस्वीरीत्या काढून टाकला.' : 'Video deleted successfully.'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || (isMarathi ? 'हटवताना त्रुटी आली.' : 'Error deleting video.')
      });
    }
  };

  const sortedVideos = [...(videos || [])].sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

  const filteredVideos = sortedVideos.filter(vid => {
    const matchesCat = categoryFilter === 'all' || vid.category === categoryFilter;
    const matchesSearch = !searchTerm ||
      (vid.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vid.description || '').toLowerCase().includes(searchTerm.toLowerCase());
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
            title={isMarathi ? 'CMS डॅशबोर्डवर परत जा' : 'Back to CMS Dashboard'}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gurukul-navy-900 flex items-center gap-2">
              <Video className="w-7 h-7 text-red-600" />
              <span>{isMarathi ? 'व्हिडिओ गॅलरी व्यवस्थापन (Video Gallery CMS)' : 'Video Gallery Management (CMS)'}</span>
            </h1>
            <p className="text-sm text-slate-500">
              {isMarathi
                ? 'YouTube व्हिडिओ लिंक जोडा, थंबनेल, कॅटेगरी व सुरक्षित प्रिव्ह्यू व्यवस्थापित करा.'
                : 'Add YouTube video links and manage thumbnails, categories, and safe embed previews.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`${getPublicWebsiteUrl()}/videos`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs border border-slate-300 transition-all"
            title={isMarathi ? 'लाईव्ह वेबसाईटवर व्हिडिओ पहा' : 'View Videos on Live Website'}
          >
            <Eye className="w-4 h-4 text-red-600" />
            <span className="hidden sm:inline">{isMarathi ? 'लाईव्ह व्हिडिओ पहा' : 'View Live Videos'}</span>
          </a>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isMarathi ? 'नवीन व्हिडिओ जोडा' : 'Add New Video'}</span>
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

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isMarathi ? 'व्हिडिओ शोधा...' : 'Search videos...'}
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
            <option value="all">{isMarathi ? 'सर्व वर्गवारी (All)' : 'All Categories'}</option>
            {VIDEO_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {isMarathi ? cat.mr : cat.en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600" />
                <span>
                  {isEditing
                    ? (isMarathi ? 'व्हिडिओ संपादन' : 'Edit Video')
                    : (isMarathi ? 'नवीन YouTube व्हिडिओ जोडा' : 'Add New YouTube Video')}
                </span>
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
                YouTube URL *
              </label>
              <input
                type="url"
                required
                value={formData.youtubeUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white outline-none"
              />
              {(formData.youtubeVideoId || formData.embedId) && (
                <p className="text-[11px] text-emerald-600 font-bold mt-1">
                  {isMarathi
                    ? `✓ वैध व्हिडिओ: ID ${formData.youtubeVideoId || formData.embedId}`
                    : `✓ Valid Video ID: ${formData.youtubeVideoId || formData.embedId}`}
                </p>
              )}
            </div>

            {/* Live Embed Preview */}
            {(formData.youtubeVideoId || formData.embedId) && (
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-xs">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${formData.youtubeVideoId || formData.embedId}`}
                  title="YouTube video preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'व्हिडिओ शीर्षक (Title) *' : 'Video Title *'}
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={isMarathi ? 'उदा. गुरुकुल भोसे निवासी कॅम्पस व क्रीडा संकुल टूअर' : 'e.g. Gurukul Bhose Residential Campus & Sports Ground Tour'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'वर्णन (Description)' : 'Description'}
              </label>
              <textarea
                rows={2}
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={isMarathi ? 'व्हिडिओची माहिती किंवा विषय...' : 'Video description or topic...'}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'कस्टम थंबनेल (Custom Thumbnail URL किंवा Upload)' : 'Custom Thumbnail (URL or Upload)'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.thumbnailUrl || formData.thumbnail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value, thumbnail: e.target.value }))}
                  placeholder={isMarathi ? 'https://... किंवा उजवीकडून फाईल निवडा' : 'https://... or upload file on the right'}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5 text-red-600" />
                  <span>{uploadingThumb ? '...' : (isMarathi ? 'अपलोड' : 'Upload')}</span>
                  <input type="file" accept="image/*" onChange={handleThumbUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isMarathi ? 'वर्गवारी' : 'Category'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none"
                >
                  {VIDEO_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {isMarathi ? cat.mr : cat.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isMarathi ? 'क्रम (Order)' : 'Order'}
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
                  {isMarathi ? 'स्थिती' : 'Status'}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none"
                >
                  <option value="published">{isMarathi ? '🟢 प्रकाशित' : '🟢 Published'}</option>
                  <option value="draft">{isMarathi ? '🟡 मसुदा' : '🟡 Draft'}</option>
                </select>
              </div>
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
                disabled={saving || !(formData.youtubeVideoId || formData.embedId)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? (isMarathi ? 'जतन करत आहे...' : 'Saving...') : (isMarathi ? 'व्हिडिओ सेव्ह करा' : 'Save Video')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Videos List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((vid) => {
          const vId = vid.youtubeVideoId || vid.embedId;
          const thumb = vid.thumbnailUrl || vid.thumbnail || `https://img.youtube.com/vi/${vId}/hqdefault.jpg`;
          return (
            <div key={vid.videoId || vid.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
              <div className="relative aspect-video bg-black overflow-hidden group">
                <img 
                  src={thumb} 
                  alt={vid.title} 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold">
                    {getVideoCategoryLabel(vid.category)}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/90 text-slate-900 text-[10px] font-bold">
                    #{vid.displayOrder || 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(vid)}
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer shadow-sm ${
                    vid.status === 'published' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-amber-400 text-slate-900'
                  }`}
                  title={isMarathi ? 'स्थिती बदलण्यासाठी क्लिक करा' : 'Click to toggle status'}
                >
                  {vid.status === 'published'
                    ? (isMarathi ? 'प्रकाशित' : 'Published')
                    : (isMarathi ? 'मसुदा' : 'Draft')}
                </button>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gurukul-navy-900 line-clamp-2">{vid.title}</h3>
                  {vid.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{vid.description}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1 font-mono truncate">{vid.youtubeUrl}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={vid.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-gurukul-saffron-600 hover:text-gurukul-saffron-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isMarathi ? 'YouTube वर उघडा' : 'Open on YouTube'}</span>
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(vid)}
                      className="p-1.5 text-slate-400 hover:text-gurukul-navy-900 rounded"
                      title={isMarathi ? 'संपादन करा' : 'Edit'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(vid.videoId || vid.id, vid.title)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
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

export default CMSVideosPage;
