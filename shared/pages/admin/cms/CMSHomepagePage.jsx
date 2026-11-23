import React, { useState, useEffect } from 'react';
import { useCMS } from '../../../contexts/CMSContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
  Home, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Image as ImageIcon, 
  Upload, 
  ArrowUp, 
  ArrowDown, 
  AlertCircle,
  Sparkles,
  BookOpen,
  Bell,
  Grid,
  Video,
  Check,
  Eye
} from 'lucide-react';
import { uploadMediaFile } from '../../../services/storage/mediaUploadService';
import { Button } from '../../../components/common/Button';
import { heroSlides as initialSlides } from '../../../data/initialData';

// Helper to normalize slide properties across different schema versions
const normalizeSlide = (slide, index) => ({
  id: slide?.id || `slide-${Date.now()}-${index}`,
  title: slide?.title || '',
  subtitle: slide?.subtitle || '',
  description: slide?.description || '',
  imageUrl: slide?.imageUrl || slide?.image || '',
  image: slide?.imageUrl || slide?.image || '',
  ctaText: slide?.ctaText || slide?.ctaPrimary?.text || '',
  ctaLink: slide?.ctaLink || slide?.ctaPrimary?.link || '',
  ctaPrimary: {
    text: slide?.ctaText || slide?.ctaPrimary?.text || 'प्रवेश चौकशी करा',
    link: slide?.ctaLink || slide?.ctaPrimary?.link || '/admission-enquiry'
  },
  active: slide?.active !== false,
  displayOrder: Number(slide?.displayOrder) || (index + 1)
});

export const CMSHomepagePage = () => {
  const { 
    homepageData, 
    updateHomepage, 
    programs = [], 
    notices = [], 
    gallery = [], 
    videos = [],
    loading = false
  } = useCMS();
  const { isMarathi } = useLanguage();

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingSlideIdx, setUploadingSlideIdx] = useState(null);
  const [uploadingWelcomeImg, setUploadingWelcomeImg] = useState(false);
  const [uploadingAboutImg, setUploadingAboutImg] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Local form states
  const [slides, setSlides] = useState(() => (homepageData?.heroSlides || initialSlides || []).map(normalizeSlide));
  const [welcome, setWelcome] = useState(() => homepageData?.welcomeSection || {
    heading: '',
    introText: '',
    imageUrl: '',
    ctaText: 'अधिक माहिती वाचा',
    ctaLink: '/about'
  });
  const [about, setAbout] = useState(() => homepageData?.aboutSection || {
    title: '',
    description: '',
    imageUrl: '',
    vision: '',
    mission: ''
  });
  const [cta, setCta] = useState(() => homepageData?.admissionCTA || {
    heading: '',
    description: '',
    buttonText: 'ऑनलाईन प्रवेश नोंदणी करा',
    buttonLink: '/admission-enquiry'
  });

  // Section D: Featured Programs
  const [featuredPrograms, setFeaturedPrograms] = useState(() => 
    homepageData?.featuredPrograms || ['vidyamandir', 'junior-college', 'talent-search', 'science-academy']
  );

  // Section E: Homepage Notices
  const [featuredNotices, setFeaturedNotices] = useState(() => 
    homepageData?.featuredNotices || []
  );

  // Section F: Gallery Preview IDs
  const [galleryPreview, setGalleryPreview] = useState(() => 
    homepageData?.galleryPreview || []
  );

  // Section G: Video Preview IDs
  const [videoPreview, setVideoPreview] = useState(() => 
    homepageData?.videoPreview || []
  );

  // Enabled sections
  const [enabledSections, setEnabledSections] = useState(() => 
    homepageData?.enabledSections || {
      hero: true,
      welcome: true,
      about: true,
      featuredPrograms: true,
      notices: true,
      gallery: true,
      videos: true,
      cta: true
    }
  );

  // Synchronize state when homepageData loads asynchronously
  useEffect(() => {
    if (homepageData && !hasInitialized) {
      if (Array.isArray(homepageData.heroSlides) && homepageData.heroSlides.length > 0) {
        setSlides(homepageData.heroSlides.map(normalizeSlide));
      }
      if (homepageData.welcomeSection) {
        setWelcome(homepageData.welcomeSection);
      }
      if (homepageData.aboutSection) {
        setAbout(homepageData.aboutSection);
      }
      if (homepageData.admissionCTA) {
        setCta(homepageData.admissionCTA);
      }
      if (homepageData.featuredPrograms) {
        setFeaturedPrograms(homepageData.featuredPrograms);
      }
      if (homepageData.featuredNotices) {
        setFeaturedNotices(homepageData.featuredNotices);
      }
      if (homepageData.galleryPreview) {
        setGalleryPreview(homepageData.galleryPreview);
      }
      if (homepageData.videoPreview) {
        setVideoPreview(homepageData.videoPreview);
      }
      if (homepageData.enabledSections) {
        setEnabledSections(homepageData.enabledSections);
      }
      setHasInitialized(true);
    }
  }, [homepageData, hasInitialized]);

  // Slide management
  const handleAddSlide = () => {
    const newId = `slide-${Date.now()}`;
    const nextOrder = slides.length + 1;
    const newSlide = {
      id: newId,
      title: isMarathi ? 'नवीन बॅनर शीर्षक' : 'New Banner Title',
      subtitle: isMarathi ? 'सैनिक पॅटर्न निवासी शिक्षण' : 'Sainik Pattern Residential Education',
      description: isMarathi
        ? 'इयत्ता ५ वी ते १२ वी मराठी व सेमी इंग्रजी माध्यम निवासी प्रवेश सुरू.'
        : 'Admissions open for Std. 5th to 12th Marathi & Semi-English residential classes.',
      imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
      image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
      ctaText: isMarathi ? 'प्रवेश चौकशी करा' : 'Admission Enquiry',
      ctaLink: '/admission-enquiry',
      ctaPrimary: {
        text: isMarathi ? 'प्रवेश चौकशी करा' : 'Admission Enquiry',
        link: '/admission-enquiry'
      },
      active: true,
      displayOrder: nextOrder
    };
    setSlides(prev => [...prev, newSlide]);
    setSuccessMsg(
      isMarathi
        ? `नवीन बॅनर #${nextOrder} जोडला गेला आहे! खाली स्क्रोल करून संपादन करा व "बदल प्रकाशित करा" बटणावर क्लिक करा.`
        : `New banner #${nextOrder} added! Scroll down to edit and click "Publish Changes" to save.`
    );
    
    // Smooth scroll to the newly added slide card
    setTimeout(() => {
      const el = document.getElementById(`banner-card-${newId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const handleUpdateSlide = (index, field, value) => {
    setSlides(prev => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };
      if (field === 'imageUrl') {
        target.image = value;
      }
      if (field === 'ctaText') {
        target.ctaPrimary = { ...(target.ctaPrimary || {}), text: value };
      }
      if (field === 'ctaLink') {
        target.ctaPrimary = { ...(target.ctaPrimary || {}), link: value };
      }
      updated[index] = target;
      return updated;
    });
  };

  const handleDeleteSlide = (index) => {
    if (slides.length <= 1) {
      alert(isMarathi ? 'किमान १ बॅनर आवश्यक आहे.' : 'At least 1 banner slide is required.');
      return;
    }
    if (window.confirm(isMarathi ? `बॅनर #${index + 1} नक्की हटवायचा आहे का?` : `Are you sure you want to delete Banner #${index + 1}?`)) {
      setSlides(prev => {
        const filtered = prev.filter((_, i) => i !== index);
        return filtered.map((s, idx) => ({ ...s, displayOrder: idx + 1 }));
      });
      setSuccessMsg(
        isMarathi
          ? 'बॅनर हटवला गेला. बदल सेव्ह करण्यासाठी "बदल प्रकाशित करा" वर क्लिक करा.'
          : 'Banner removed. Click "Publish Changes" to save your updates.'
      );
    }
  };

  const handleMoveSlide = (index, direction) => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= slides.length) return;
    setSlides(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[target];
      updated[target] = temp;
      return updated.map((s, idx) => ({ ...s, displayOrder: idx + 1 }));
    });
  };

  const handleSlideImageUpload = async (index, file) => {
    if (!file) return;
    setUploadingSlideIdx(index);
    setErrorMsg('');
    try {
      const res = await uploadMediaFile(file, 'banners');
      handleUpdateSlide(index, 'imageUrl', res.downloadURL);
    } catch (err) {
      setErrorMsg(err.message || (isMarathi ? 'इमेज अपलोड अयशस्वी झाली.' : 'Image upload failed.'));
    } finally {
      setUploadingSlideIdx(null);
    }
  };

  const handleWelcomeImageUpload = async (file) => {
    if (!file) return;
    setUploadingWelcomeImg(true);
    setErrorMsg('');
    try {
      const res = await uploadMediaFile(file, 'pages');
      setWelcome(prev => ({ ...prev, imageUrl: res.downloadURL }));
    } catch (err) {
      setErrorMsg(err.message || (isMarathi ? 'स्वागत इमेज अपलोड अयशस्वी झाली.' : 'Welcome image upload failed.'));
    } finally {
      setUploadingWelcomeImg(false);
    }
  };

  const handleAboutImageUpload = async (file) => {
    if (!file) return;
    setUploadingAboutImg(true);
    setErrorMsg('');
    try {
      const res = await uploadMediaFile(file, 'pages');
      setAbout(prev => ({ ...prev, imageUrl: res.downloadURL }));
    } catch (err) {
      setErrorMsg(err.message || (isMarathi ? 'About इमेज अपलोड अयशस्वी झाली.' : 'About image upload failed.'));
    } finally {
      setUploadingAboutImg(false);
    }
  };

  const toggleSection = (sectionKey) => {
    setEnabledSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const toggleProgramFeatured = (slug) => {
    setFeaturedPrograms(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const toggleNoticeFeatured = (noticeId) => {
    setFeaturedNotices(prev => 
      prev.includes(noticeId) ? prev.filter(id => id !== noticeId) : [...prev, noticeId]
    );
  };

  const toggleGalleryPreview = (imageId) => {
    setGalleryPreview(prev => 
      prev.includes(imageId) ? prev.filter(id => id !== imageId) : [...prev, imageId]
    );
  };

  const toggleVideoPreview = (videoId) => {
    setVideoPreview(prev => 
      prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]
    );
  };

  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Normalize slides to ensure all schema fields are synchronized
      const cleanedSlides = slides.map((s, idx) => ({
        ...s,
        displayOrder: Number(s.displayOrder) || (idx + 1),
        image: s.imageUrl || s.image || '',
        imageUrl: s.imageUrl || s.image || '',
        ctaText: s.ctaText || s.ctaPrimary?.text || '',
        ctaLink: s.ctaLink || s.ctaPrimary?.link || '',
        ctaPrimary: {
          text: s.ctaText || s.ctaPrimary?.text || 'प्रवेश चौकशी करा',
          link: s.ctaLink || s.ctaPrimary?.link || '/admission-enquiry'
        }
      }));

      await updateHomepage({
        heroSlides: cleanedSlides,
        welcomeSection: welcome,
        aboutSection: about,
        featuredPrograms,
        featuredNotices,
        galleryPreview,
        videoPreview,
        enabledSections,
        admissionCTA: cta
      });
      setSuccessMsg(
        isMarathi
          ? 'मुख्यपृष्ठ माहिती यशस्वीरीत्या प्रकाशित झाली!'
          : 'Homepage content published successfully!'
      );
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(
        isMarathi
          ? 'बदल सेव्ह करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
          : 'Error saving changes. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading && !homepageData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] space-y-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <div className="w-9 h-9 border-4 border-gurukul-saffron-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-600">
          {isMarathi ? 'मुख्यपृष्ठ माहिती लोड होत आहे... कृपया प्रतीक्षा करा.' : 'Loading homepage content... Please wait.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gurukul-navy-900 flex items-center gap-2">
            <Home className="w-6 h-6 text-gurukul-saffron-500" />
            <span>{isMarathi ? 'मुख्यपृष्ठ व्यवस्थापक (Homepage Management)' : 'Homepage Management'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi
              ? 'हिरो बॅनर्स, स्वागत संदेश, वैशिष्ट्ये, सूचना, गॅलरी व प्रवेश कॉल-टू-ॲक्शन संपादन'
              : 'Edit hero banners, welcome section, featured programs, notices, gallery, and admission CTA'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={handleSaveAll}
            isLoading={saving}
            className="text-xs font-bold"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>{isMarathi ? 'बदल प्रकाशित करा' : 'Publish Changes'}</span>
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Section A: Hero Banners */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {isMarathi ? '१. हिरो बॅनर्स (Hero Carousel Banners)' : '1. Hero Carousel Banners'}
            </h2>
            <p className="text-xs text-slate-400">
              {isMarathi
                ? 'मुख्यपृष्ठावर फिरणारे मोठे इमेज बॅनर्स, क्रम व ॲक्टिव्ह स्थिती'
                : 'Manage large hero slider banners, display order, and active visibility'}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSlide}
            className="text-xs font-bold"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>{isMarathi ? 'नवीन बॅनर जोडा' : 'Add New Banner'}</span>
          </Button>
        </div>

        <div className="space-y-6">
          {slides.map((slide, idx) => (
            <div 
              key={slide.id || idx} 
              id={`banner-card-${slide.id || idx}`}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 transition-all duration-300 scroll-mt-20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gurukul-navy-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    {isMarathi ? `बॅनर #${idx + 1}` : `Banner #${idx + 1}`}
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={slide.active !== false}
                      onChange={(e) => handleUpdateSlide(idx, 'active', e.target.checked)}
                      className="rounded text-gurukul-saffron-500 focus:ring-gurukul-saffron-400"
                    />
                    <span>
                      {slide.active !== false
                        ? (isMarathi ? 'सक्रिय (Active)' : 'Active')
                        : (isMarathi ? 'निष्क्रिय (Inactive)' : 'Inactive')}
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <span>{isMarathi ? 'क्रम:' : 'Order:'}</span>
                    <input
                      type="number"
                      min="1"
                      value={slide.displayOrder ?? (idx + 1)}
                      onChange={(e) => handleUpdateSlide(idx, 'displayOrder', parseInt(e.target.value) || 1)}
                      className="w-14 px-1.5 py-0.5 text-xs border rounded bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMoveSlide(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                    title={isMarathi ? 'वर हलवा' : 'Move Up'}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSlide(idx, 'down')}
                    disabled={idx === slides.length - 1}
                    className="p-1 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                    title={isMarathi ? 'खाली हलवा' : 'Move Down'}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(idx)}
                    className="p-1 rounded text-red-600 hover:bg-red-50 ml-2"
                    title={isMarathi ? 'बॅनर हटवा' : 'Delete Banner'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'मुख्य मथळा (Heading) *' : 'Main Heading *'}
                  </label>
                  <input
                    type="text"
                    value={slide.title || ''}
                    onChange={(e) => handleUpdateSlide(idx, 'title', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-gurukul-saffron-500"
                    placeholder={isMarathi ? 'उदा. गुरुकुल भोसे सैनिक पॅटर्न निवासी संकुल' : 'e.g. Gurukul Bhose Sainik Pattern Residential Campus'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'उप-मथळा (Subtitle)' : 'Subtitle'}
                  </label>
                  <input
                    type="text"
                    value={slide.subtitle || ''}
                    onChange={(e) => handleUpdateSlide(idx, 'subtitle', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-gurukul-saffron-500"
                    placeholder={isMarathi ? 'उदा. इ. ५ वी ते १२ वी सैनिक पॅटर्न निवासी प्रवेश सुरू' : 'e.g. Admissions Open for Std. 5th to 12th'}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'तपशील (Description)' : 'Description'}
                  </label>
                  <textarea
                    rows={2}
                    value={slide.description || ''}
                    onChange={(e) => handleUpdateSlide(idx, 'description', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-gurukul-saffron-500"
                    placeholder={isMarathi ? 'बॅनरवरील संक्षिप्त माहिती...' : 'Brief description shown on the banner...'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'CTA बटण मजकूर (Button Text)' : 'CTA Button Text'}
                  </label>
                  <input
                    type="text"
                    value={slide.ctaText || ''}
                    onChange={(e) => handleUpdateSlide(idx, 'ctaText', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                    placeholder={isMarathi ? 'उदा. प्रवेश चौकशी करा' : 'e.g. Apply for Admission'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'CTA बटण लिंक (Button URL)' : 'CTA Button URL'}
                  </label>
                  <input
                    type="text"
                    value={slide.ctaLink || ''}
                    onChange={(e) => handleUpdateSlide(idx, 'ctaLink', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                    placeholder="/admission-enquiry"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'बॅनर प्रतिमा (Image URL किंवा Upload) *' : 'Banner Image (URL or Upload) *'}
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                      type="text"
                      value={slide.imageUrl || ''}
                      onChange={(e) => handleUpdateSlide(idx, 'imageUrl', e.target.value)}
                      className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300"
                      placeholder={isMarathi ? 'https://... किंवा उजवीकडून फाईल निवडा' : 'https://... or upload file on the right'}
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-gurukul-navy-900 text-white rounded-lg hover:bg-gurukul-navy-950 transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {uploadingSlideIdx === idx
                          ? (isMarathi ? 'अपलोड होत आहे...' : 'Uploading...')
                          : (isMarathi ? 'इमेज अपलोड' : 'Upload Image')}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => handleSlideImageUpload(idx, e.target.files[0])}
                      />
                    </label>
                  </div>
                  {slide.imageUrl && (
                    <div className="mt-2 w-36 h-20 rounded-lg overflow-hidden border border-slate-200">
                      <img src={slide.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Add Banner Action */}
        <div className="pt-2 border-t border-slate-100 flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSlide}
            className="text-xs font-bold border-dashed border-2 py-2.5 px-6 hover:bg-orange-50 text-gurukul-saffron-600 border-gurukul-saffron-300 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>{isMarathi ? '+ आणखी एक नवीन बॅनर जोडा' : '+ Add Another Banner'}</span>
          </Button>
        </div>
      </div>

      {/* Section B: Welcome Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-base font-bold text-slate-800">
            {isMarathi ? '२. स्वागत विभाग (Welcome Section)' : '2. Welcome Section'}
          </h2>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={enabledSections.welcome !== false}
              onChange={() => toggleSection('welcome')}
              className="rounded text-gurukul-saffron-500"
            />
            <span>{isMarathi ? 'विभाग दाखवा (Enable)' : 'Enable Section'}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'स्वागत मथळा (Heading)' : 'Welcome Heading'}
            </label>
            <input
              type="text"
              value={welcome.heading || ''}
              onChange={(e) => setWelcome({ ...welcome, heading: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'प्रस्तावना मजकूर (Intro Text)' : 'Intro Text'}
            </label>
            <textarea
              rows={3}
              value={welcome.introText || ''}
              onChange={(e) => setWelcome({ ...welcome, introText: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'स्वागत इमेज (Image URL किंवा Upload)' : 'Welcome Image (URL or Upload)'}
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="text"
                value={welcome.imageUrl || ''}
                onChange={(e) => setWelcome({ ...welcome, imageUrl: e.target.value })}
                className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300"
                placeholder="https://..."
              />
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-gurukul-navy-900 text-white rounded-lg hover:bg-gurukul-navy-950 transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {uploadingWelcomeImg
                    ? (isMarathi ? 'अपलोड होत आहे...' : 'Uploading...')
                    : (isMarathi ? 'इमेज अपलोड' : 'Upload Image')}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => handleWelcomeImageUpload(e.target.files[0])}
                />
              </label>
            </div>
            {welcome.imageUrl && (
              <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-slate-200">
                <img src={welcome.imageUrl} alt="Welcome Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'बटण मजकूर (Read More Button)' : 'Read More Button Text'}
            </label>
            <input
              type="text"
              value={welcome.ctaText || ''}
              onChange={(e) => setWelcome({ ...welcome, ctaText: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'बटण लिंक' : 'Button Link'}
            </label>
            <input
              type="text"
              value={welcome.ctaLink || ''}
              onChange={(e) => setWelcome({ ...welcome, ctaLink: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>
        </div>
      </div>

      {/* Section C: About Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-base font-bold text-slate-800">
            {isMarathi ? '३. संस्थेबद्दल विभाग (About Section on Homepage)' : '3. About Section on Homepage'}
          </h2>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={enabledSections.about !== false}
              onChange={() => toggleSection('about')}
              className="rounded text-gurukul-saffron-500"
            />
            <span>{isMarathi ? 'विभाग दाखवा (Enable)' : 'Enable Section'}</span>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'शीर्षक (Title)' : 'Title'}
            </label>
            <input
              type="text"
              value={about.title || ''}
              onChange={(e) => setAbout({ ...about, title: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'संक्षिप्त माहिती (Description)' : 'Description'}
            </label>
            <textarea
              rows={3}
              value={about.description || ''}
              onChange={(e) => setAbout({ ...about, description: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'कॅम्पस इमेज (Image URL किंवा Upload)' : 'Campus Image (URL or Upload)'}
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="text"
                value={about.imageUrl || ''}
                onChange={(e) => setAbout({ ...about, imageUrl: e.target.value })}
                className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300"
                placeholder="https://..."
              />
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-gurukul-navy-900 text-white rounded-lg hover:bg-gurukul-navy-950 transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {uploadingAboutImg
                    ? (isMarathi ? 'अपलोड होत आहे...' : 'Uploading...')
                    : (isMarathi ? 'इमेज अपलोड' : 'Upload Image')}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => handleAboutImageUpload(e.target.files[0])}
                />
              </label>
            </div>
            {about.imageUrl && (
              <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-slate-200">
                <img src={about.imageUrl} alt="About Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'दृष्टिकोन (Vision)' : 'Vision'}
              </label>
              <textarea
                rows={2}
                value={about.vision || ''}
                onChange={(e) => setAbout({ ...about, vision: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'ध्येय (Mission)' : 'Mission'}
              </label>
              <textarea
                rows={2}
                value={about.mission || ''}
                onChange={(e) => setAbout({ ...about, mission: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section D: Featured Programs Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gurukul-saffron-500" />
              <span>{isMarathi ? '४. मुख्यपृष्ठावरील वैशिष्ट्यपूर्ण शाखा (Featured Programs)' : '4. Featured Programs on Homepage'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {isMarathi ? 'मुख्यपृष्ठावर दर्शवायचे शैक्षणिक विभाग निवडा' : 'Select the academic programs to highlight on the homepage'}
            </p>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={enabledSections.featuredPrograms !== false}
              onChange={() => toggleSection('featuredPrograms')}
              className="rounded text-gurukul-saffron-500"
            />
            <span>{isMarathi ? 'विभाग दाखवा (Enable)' : 'Enable Section'}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {programs.map((p) => {
            const isFeatured = featuredPrograms.includes(p.slug || p.id);
            return (
              <div
                key={p.id || p.slug}
                onClick={() => toggleProgramFeatured(p.slug || p.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isFeatured 
                    ? 'border-gurukul-saffron-500 bg-orange-50/40 text-gurukul-navy-950 font-bold' 
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="truncate mr-2">
                  <p className="text-xs truncate">{p.name || p.title}</p>
                  <p className="text-[10px] text-slate-400 font-normal">/{p.slug}</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                  isFeatured ? 'bg-gurukul-saffron-500 text-white' : 'border border-slate-300'
                }`}>
                  {isFeatured && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section E: Homepage Notices Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-gurukul-saffron-500" />
              <span>{isMarathi ? '५. मुख्यपृष्ठावरील सूचना (Homepage Notices)' : '5. Homepage Notices'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {isMarathi
                ? 'विशिष्ट सूचना निवडा किंवा रिक्त ठेवल्यास आपोआप ताज्या ३ सूचना दिसतील'
                : 'Select specific notices, or leave empty to automatically display the latest 3 notices'}
            </p>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={enabledSections.notices !== false}
              onChange={() => toggleSection('notices')}
              className="rounded text-gurukul-saffron-500"
            />
            <span>{isMarathi ? 'विभाग दाखवा (Enable)' : 'Enable Section'}</span>
          </label>
        </div>

        <div className="space-y-2">
          {notices.slice(0, 8).map((n) => {
            const isFeatured = featuredNotices.includes(n.noticeId || n.id);
            return (
              <div
                key={n.noticeId || n.id}
                onClick={() => toggleNoticeFeatured(n.noticeId || n.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isFeatured 
                    ? 'border-gurukul-saffron-500 bg-orange-50/40 text-gurukul-navy-950 font-bold' 
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="truncate mr-3">
                  <span className="text-[10px] font-bold text-gurukul-saffron-600 mr-2 uppercase">
                    [{n.category || (isMarathi ? 'सामान्य' : 'General')}]
                  </span>
                  <span className="text-xs">{n.title}</span>
                  {n.isImportant && (
                    <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                      {isMarathi ? 'महत्त्वाची' : 'Important'}
                    </span>
                  )}
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                  isFeatured ? 'bg-gurukul-saffron-500 text-white' : 'border border-slate-300'
                }`}>
                  {isFeatured && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section F: Gallery Preview Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Grid className="w-4 h-4 text-gurukul-saffron-500" />
              <span>{isMarathi ? '६. फोटो गॅलरी प्रिव्ह्यू (Gallery Preview on Homepage)' : '6. Gallery Preview on Homepage'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {isMarathi
                ? 'मुख्यपृष्ठावर दर्शवायचे फोटो निवडा (रिक्त ठेवल्यास ६ नवीन फोटो आपोआप दिसतील)'
                : 'Select photos to show on the homepage (leave empty to automatically show the 6 latest photos)'}
            </p>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={enabledSections.gallery !== false}
              onChange={() => toggleSection('gallery')}
              className="rounded text-gurukul-saffron-500"
            />
            <span>{isMarathi ? 'विभाग दाखवा (Enable)' : 'Enable Section'}</span>
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {gallery.slice(0, 12).map((img) => {
            const isSelected = galleryPreview.includes(img.imageId || img.id);
            return (
              <div
                key={img.imageId || img.id}
                onClick={() => toggleGalleryPreview(img.imageId || img.id)}
                className={`relative rounded-xl overflow-hidden aspect-video border-2 cursor-pointer transition-all ${
                  isSelected ? 'border-gurukul-saffron-500 ring-2 ring-gurukul-saffron-300' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.imageUrl} alt={img.title || ''} className="w-full h-full object-cover" />
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-gurukul-saffron-500 text-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section G: Video Preview Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Video className="w-4 h-4 text-gurukul-saffron-500" />
              <span>{isMarathi ? '७. व्हिडिओ प्रिव्ह्यू (Video Preview on Homepage)' : '7. Video Preview on Homepage'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {isMarathi
                ? 'मुख्यपृष्ठावर दर्शवायचे व्हिडिओ निवडा (रिक्त ठेवल्यास ३ नवीन व्हिडिओ आपोआप दिसतील)'
                : 'Select videos to show on the homepage (leave empty to automatically show the 3 latest videos)'}
            </p>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={enabledSections.videos !== false}
              onChange={() => toggleSection('videos')}
              className="rounded text-gurukul-saffron-500"
            />
            <span>{isMarathi ? 'विभाग दाखवा (Enable)' : 'Enable Section'}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {videos.slice(0, 6).map((v) => {
            const isSelected = videoPreview.includes(v.videoId || v.id);
            return (
              <div
                key={v.videoId || v.id}
                onClick={() => toggleVideoPreview(v.videoId || v.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-gurukul-saffron-500 bg-orange-50/40 text-gurukul-navy-950 font-bold' 
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <p className="text-xs truncate">{v.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{v.category || (isMarathi ? 'कॅम्पस उपक्रम' : 'Campus Activities')}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section H: Admission CTA */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-base font-bold text-slate-800">
            {isMarathi ? '८. प्रवेश नोंदणी बॅनर (Admission CTA Section)' : '8. Admission CTA Section'}
          </h2>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={enabledSections.cta !== false}
              onChange={() => toggleSection('cta')}
              className="rounded text-gurukul-saffron-500"
            />
            <span>{isMarathi ? 'विभाग दाखवा (Enable)' : 'Enable Section'}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'CTA मथळा (Heading)' : 'CTA Heading'}
            </label>
            <input
              type="text"
              value={cta.heading || ''}
              onChange={(e) => setCta({ ...cta, heading: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'CTA वर्णन (Description)' : 'CTA Description'}
            </label>
            <textarea
              rows={2}
              value={cta.description || ''}
              onChange={(e) => setCta({ ...cta, description: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'बटण मजकूर (Button Text)' : 'Button Text'}
            </label>
            <input
              type="text"
              value={cta.buttonText || ''}
              onChange={(e) => setCta({ ...cta, buttonText: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'बटण लिंक (Admission URL)' : 'Button Link (Admission URL)'}
            </label>
            <input
              type="text"
              value={cta.buttonLink || ''}
              onChange={(e) => setCta({ ...cta, buttonLink: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>
        </div>
      </div>

      {/* Footer Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="button"
          variant="primary"
          onClick={handleSaveAll}
          isLoading={saving}
          className="text-xs font-bold px-6 py-3"
        >
          <Save className="w-4 h-4 mr-2" />
          <span>{isMarathi ? 'मुख्यपृष्ठ बदल प्रकाशित करा' : 'Save & Publish Homepage'}</span>
        </Button>
      </div>
    </div>
  );
};

export default CMSHomepagePage;
