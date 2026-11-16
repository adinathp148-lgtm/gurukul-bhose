import React, { useState } from 'react';
import { useCMS } from '../../contexts/CMSContext';
import { 
  FileEdit, 
  Phone, 
  MapPin, 
  Mail, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Image as ImageIcon, 
  Video, 
  Bell, 
  RotateCcw,
  Sparkles 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const CMSPage = () => {
  const { 
    institution, 
    updateInstitution, 
    notices, 
    addNotice, 
    deleteNotice, 
    gallery, 
    addGalleryItem, 
    deleteGalleryItem, 
    videos, 
    addVideo, 
    deleteVideo,
    resetToDefaults 
  } = useCMS();

  const [activeTab, setActiveTab] = useState('contact');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Institution contact form state
  const [instForm, setInstForm] = useState({
    name: institution.name || '',
    tagline: institution.tagline || '',
    address: institution.address || '',
    phone1: institution.phones?.[0] || '9850449800',
    phone2: institution.phones?.[1] || '9850449808',
    phone3: institution.phones?.[2] || '7020260968',
    email: institution.email || 'contact@gurukulbhose.com',
    workingHours: institution.workingHours || '',
    brochureUrl: institution.brochureUrl || '',
    youtubeUrl: institution.youtubeUrl || '',
    facebookUrl: institution.facebookUrl || '',
    instagramUrl: institution.instagramUrl || ''
  });

  // Modal forms
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    category: 'प्रवेश (Admission)',
    description: '',
    isImportant: true,
    downloadLink: ''
  });

  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState({
    title: '',
    category: 'activities',
    imageUrl: ''
  });

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [newVideoItem, setNewVideoItem] = useState({
    title: '',
    youtubeId: ''
  });

  const handleSaveContact = async (e) => {
    e.preventDefault();
    await updateInstitution({
      name: instForm.name,
      tagline: instForm.tagline,
      address: instForm.address,
      phones: [instForm.phone1, instForm.phone2, instForm.phone3].filter(Boolean),
      email: instForm.email,
      workingHours: instForm.workingHours,
      brochureUrl: instForm.brochureUrl,
      youtubeUrl: instForm.youtubeUrl,
      facebookUrl: instForm.facebookUrl,
      instagramUrl: instForm.instagramUrl
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCreateNotice = (e) => {
    e.preventDefault();
    addNotice(newNotice);
    setNoticeModalOpen(false);
    setNewNotice({
      title: '',
      category: 'प्रवेश (Admission)',
      description: '',
      isImportant: true,
      downloadLink: ''
    });
  };

  const handleCreateGallery = (e) => {
    e.preventDefault();
    addGalleryItem(newGalleryItem);
    setGalleryModalOpen(false);
    setNewGalleryItem({ title: '', category: 'activities', imageUrl: '' });
  };

  const handleCreateVideo = (e) => {
    e.preventDefault();
    addVideo(newVideoItem);
    setVideoModalOpen(false);
    setNewVideoItem({ title: '', youtubeId: '' });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            वेबसाईट CMS व्यवस्थापन (Website CMS Portal)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            संस्थेचा पत्ता, संपर्क क्रमांक, सूचना, फोटो गॅलरी आणि व्हिडिओ त्वरित अपडेट करा
          </p>
        </div>

        <button
          onClick={resetToDefaults}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>मूळ माहितीवर रीसेट करा</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'contact'
              ? 'bg-gurukul-saffron-500 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          १. संपर्क व संस्था माहिती
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'notices'
              ? 'bg-gurukul-saffron-500 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          २. सूचना पत्रक (Notices) ({notices.length})
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'gallery'
              ? 'bg-gurukul-saffron-500 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          ३. फोटो गॅलरी (Gallery) ({gallery.length})
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'videos'
              ? 'bg-gurukul-saffron-500 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          ४. व्हिडिओ व्यवस्थापन ({videos.length})
        </button>
      </div>

      {/* TAB 1: General Info & Contact */}
      {activeTab === 'contact' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm max-w-4xl space-y-6">
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>संस्थेची माहिती आणि संपर्क तपशील यशस्वीपणे सेव्ह झाले!</span>
            </div>
          )}

          <form onSubmit={handleSaveContact} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  संस्थेचे अधिकृत नाव *
                </label>
                <input
                  type="text"
                  required
                  value={instForm.name}
                  onChange={(e) => setInstForm({ ...instForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  टॅगलाईन (Tagline)
                </label>
                <input
                  type="text"
                  value={instForm.tagline}
                  onChange={(e) => setInstForm({ ...instForm, tagline: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                संपूर्ण पत्ता (Address) *
              </label>
              <textarea
                rows={2}
                required
                value={instForm.address}
                onChange={(e) => setInstForm({ ...instForm, address: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  मोबाईल नंबर १ *
                </label>
                <input
                  type="text"
                  required
                  value={instForm.phone1}
                  onChange={(e) => setInstForm({ ...instForm, phone1: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  मोबाईल नंबर २
                </label>
                <input
                  type="text"
                  value={instForm.phone2}
                  onChange={(e) => setInstForm({ ...instForm, phone2: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  मोबाईल नंबर ३
                </label>
                <input
                  type="text"
                  value={instForm.phone3}
                  onChange={(e) => setInstForm({ ...instForm, phone3: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ईमेल पत्ता (Email) *
                </label>
                <input
                  type="email"
                  required
                  value={instForm.email}
                  onChange={(e) => setInstForm({ ...instForm, email: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  कार्यालयीन वेळ (Working Hours)
                </label>
                <input
                  type="text"
                  value={instForm.workingHours}
                  onChange={(e) => setInstForm({ ...instForm, workingHours: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  माहिती पत्रक लिंक (Brochure URL)
                </label>
                <input
                  type="url"
                  value={instForm.brochureUrl}
                  onChange={(e) => setInstForm({ ...instForm, brochureUrl: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  YouTube चॅनल लिंक
                </label>
                <input
                  type="url"
                  value={instForm.youtubeUrl}
                  onChange={(e) => setInstForm({ ...instForm, youtubeUrl: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md">
              <Save className="w-4 h-4 mr-1.5" />
              <span>बदल जतन करा (Save Changes)</span>
            </Button>
          </form>
        </div>
      )}

      {/* TAB 2: Notices */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">सर्व प्रकाशित सूचना (Published Notices)</h3>
            <Button variant="primary" size="sm" onClick={() => setNoticeModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              <span>नवीन सूचना जोडा</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {notices.map(n => (
              <div key={n.id} className="p-4 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {n.isImportant && (
                      <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        Important
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-slate-500">[{n.category}]</span>
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600">{n.description}</p>
                  <p className="text-[10px] text-slate-400">तारीख: {n.date}</p>
                </div>
                <button
                  onClick={() => deleteNotice(n.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                  title="हटवा"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Gallery */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">फोटो गॅलरी व्यवस्थापन</h3>
            <Button variant="primary" size="sm" onClick={() => setGalleryModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              <span>नवीन फोटो जोडा</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map(item => (
              <div key={item.id} className="bg-white rounded-xl overflow-hidden border border-slate-200 group relative">
                <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover" />
                <div className="p-2.5">
                  <span className="text-[10px] uppercase font-bold text-gurukul-saffron-600 block">{item.category}</span>
                  <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                </div>
                <button
                  onClick={() => deleteGalleryItem(item.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  title="हटवा"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Videos */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">व्हिडिओ व्यवस्थापन</h3>
            <Button variant="primary" size="sm" onClick={() => setVideoModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              <span>नवीन व्हिडिओ जोडा</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {videos.map(v => (
              <div key={v.id} className="bg-white rounded-xl overflow-hidden border border-slate-200">
                <div className="aspect-video w-full">
                  <iframe src={v.embedUrl} title={v.title} className="w-full h-full border-0" allowFullScreen />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800 truncate">{v.title}</p>
                  <button
                    onClick={() => deleteVideo(v.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notice Modal */}
      <Modal
        isOpen={noticeModalOpen}
        onClose={() => setNoticeModalOpen(false)}
        title="नवीन सूचना प्रकाशित करा (Publish Notice)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateNotice} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">शीर्षक (Title) *</label>
            <input
              type="text"
              required
              value={newNotice.title}
              onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">वर्गवारी (Category)</label>
            <select
              value={newNotice.category}
              onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
            >
              <option value="प्रवेश (Admission)">प्रवेश (Admission)</option>
              <option value="अकॅडेमिक्स (Academics)">अकॅडेमिक्स (Academics)</option>
              <option value="पालक सूचना (Parent Notice)">पालक सूचना (Parent Notice)</option>
              <option value="सुट्टी (Holiday)">सुट्टी (Holiday)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">सविस्तर तपशील *</label>
            <textarea
              rows={3}
              required
              value={newNotice.description}
              onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isImp"
              checked={newNotice.isImportant}
              onChange={(e) => setNewNotice({ ...newNotice, isImportant: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isImp" className="text-xs font-semibold text-red-700">
              महत्त्वाची सूचना म्हणून चिन्हांकित करा (Mark as Important)
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setNoticeModalOpen(false)}>रद्द करा</Button>
            <Button type="submit" variant="primary" size="sm">प्रकाशित करा</Button>
          </div>
        </form>
      </Modal>

      {/* Gallery Modal */}
      <Modal
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        title="नवीन फोटो जोडा (Add Gallery Image)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateGallery} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">शीर्षक *</label>
            <input
              type="text"
              required
              value={newGalleryItem.title}
              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">वर्गवारी *</label>
            <select
              value={newGalleryItem.category}
              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, category: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
            >
              <option value="activities">उपक्रम (Activities)</option>
              <option value="sports">क्रीडा (Sports)</option>
              <option value="gathering">स्नेहसंमेलन (Gathering)</option>
              <option value="result">निकाल (Result)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">फोटो इमेज URL *</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={newGalleryItem.imageUrl}
              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, imageUrl: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setGalleryModalOpen(false)}>रद्द करा</Button>
            <Button type="submit" variant="primary" size="sm">फोटो जतन करा</Button>
          </div>
        </form>
      </Modal>

      {/* Video Modal */}
      <Modal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title="नवीन व्हिडिओ जोडा (Add YouTube Video)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateVideo} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">व्हिडिओ शीर्षक *</label>
            <input
              type="text"
              required
              value={newVideoItem.title}
              onChange={(e) => setNewVideoItem({ ...newVideoItem, title: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">YouTube Video ID *</label>
            <input
              type="text"
              required
              placeholder="उदा. b5XKb-pWFF4"
              value={newVideoItem.youtubeId}
              onChange={(e) => setNewVideoItem({ ...newVideoItem, youtubeId: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setVideoModalOpen(false)}>रद्द करा</Button>
            <Button type="submit" variant="primary" size="sm">व्हिडिओ जोडा</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
