import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ZoomIn, X, ChevronLeft, ChevronRight, Image as ImageIcon, Video } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { GalleryCard } from '../components/cards/GalleryCard';
import { GridSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { CTASection } from '../components/sections/CTASection';
import { getGalleryImages, getWebsiteContent } from '../services/firestore/contentService';

export const GalleryPage = () => {
  const [gallery, setGallery] = useState([]);
  const [institution, setInstitution] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getGalleryImages(activeCategory),
      getWebsiteContent()
    ]).then(([galleryRes, instRes]) => {
      if (!isMounted) return;
      setGallery(galleryRes.data);
      setInstitution(instRes.data);
      setLoading(false);
    }).catch(err => {
      console.warn('Gallery load error:', err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [activeCategory]);

  // Real-time listener for CMS updates across tabs/origins
  useEffect(() => {
    const handleUpdate = () => {
      getGalleryImages(activeCategory).then(res => {
        if (res?.data) setGallery(res.data);
      }).catch(console.warn);
    };

    window.addEventListener('gurukul_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('gurukul_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [activeCategory]);

  const baseCategories = [
    { id: 'all', label: 'सर्व छायाचित्रे (All)' },
    { id: 'campus', label: 'कॅम्पस (Campus)' },
    { id: 'activities', label: 'उपक्रम (Activities)' },
    { id: 'yoga', label: 'योगा उपक्रम (Yoga Activities)' },
    { id: 'sports', label: 'क्रीडा व ग्राउंड (Sports)' },
    { id: 'gathering', label: 'स्नेहसंमेलन (Gathering)' },
    { id: 'result', label: 'गुणवंत विद्यार्थी निकाल (Result)' }
  ];

  const extraCategories = Array.from(new Set(
    gallery.map(g => g.category).filter(Boolean)
  )).filter(cat => {
    const lower = cat.toLowerCase();
    return !baseCategories.some(b => 
      b.id === lower || 
      b.label.toLowerCase().includes(lower) || 
      lower.includes(b.id)
    );
  }).map(cat => ({ id: cat, label: cat }));

  const categories = [...baseCategories, ...extraCategories];

  // Lightbox index calculation & navigation
  const currentIndex = selectedImage 
    ? gallery.findIndex(g => (g.id || g.imageId) === (selectedImage.id || selectedImage.imageId))
    : -1;

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    if (gallery.length === 0) return;
    const nextIdx = (currentIndex - 1 + gallery.length) % gallery.length;
    setSelectedImage(gallery[nextIdx]);
  }, [currentIndex, gallery]);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    if (gallery.length === 0) return;
    const nextIdx = (currentIndex + 1) % gallery.length;
    setSelectedImage(gallery[nextIdx]);
  }, [currentIndex, gallery]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!selectedImage) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, handlePrev, handleNext]);

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title="फोटो गॅलरी | गुरुकुल भोसे"
        description="गुरुकुल भोसे ४ एकर निसर्गरम्य कॅम्पस, सैनिक शिस्त कवायत, खेळाचे मैदान, सायन्स लॅब, स्नेहसंमेलन व निकाल फोटो गॅलरी."
      />

      <PageHeader
        badge="कॅम्पस छायाचित्रे"
        title="गुरुकुल भोसे फोटो गॅलरी (Campus Gallery)"
        subtitle="४ एकर सुरक्षित व प्रशस्त संकुल, सैनिक शिस्त, क्रीडांगण आणि शालेय उपक्रमांची क्षणचित्रे"
        breadcrumbs={[{ label: 'गॅलरी (Gallery)' }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Gallery / Videos Mode Switcher */}
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-gurukul-navy-950 text-white shadow-md border-2 border-gurukul-navy-950"
          >
            <ImageIcon className="w-4 h-4 text-gurukul-saffron-400" />
            <span>फोटो गॅलरी (Photos)</span>
          </Link>
          <Link
            to="/videos"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors"
          >
            <Video className="w-4 h-4 text-red-500" />
            <span>व्हिडिओ गॅलरी (Videos)</span>
          </Link>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pb-4 border-b border-slate-200">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-gurukul-saffron-500 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid - Properly Aligned 3-Column Responsive Grid */}
        {loading ? (
          <GridSkeleton count={6} />
        ) : gallery.length === 0 ? (
          <EmptyState
            title="या वर्गवारीत फोटो उपलब्ध नाहीत"
            description="कृपया इतर वर्गवारी निवडून फोटो पहा."
            actionText="सर्व फोटो पहा"
            onAction={() => setActiveCategory('all')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {gallery.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                onSelect={(img) => setSelectedImage(img)}
              />
            ))}
          </div>
        )}

      </section>

      {/* Full-Screen Modal Lightbox with Controls */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-20 shadow-lg"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Arrow Button */}
          {gallery.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-gurukul-saffron-500 transition-colors z-20 shadow-xl border border-white/10"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Arrow Button */}
          {gallery.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-gurukul-saffron-500 transition-colors z-20 shadow-xl border border-white/10"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
          
          {/* Modal Container */}
          <div 
            className="relative max-w-5xl w-full max-h-[92vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Viewer */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[75vh]">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                onError={(e) => { e.currentTarget.src = '/images/gallery/campus-slide-1.jpg'; }}
                className="max-h-[75vh] w-auto max-w-full object-contain mx-auto"
              />
            </div>

            {/* Image Details Bar */}
            <div className="p-4 sm:p-5 text-white bg-slate-950/90 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gurukul-saffron-400 block mb-1">
                  {selectedImage.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold">{selectedImage.title}</h3>
                {selectedImage.caption && (
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">{selectedImage.caption}</p>
                )}
              </div>

              {currentIndex >= 0 && (
                <div className="text-xs text-slate-400 font-semibold bg-white/10 px-3 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
                  {currentIndex + 1} / {gallery.length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="प्रत्यक्ष कॅम्पस भेट द्या व वातावरण अनुभवा!"
          subtitle="पालकांनी प्रत्यक्ष शाळेत येऊन वसतिगृह, वर्ग, मेस आणि क्रीडांगणाची पाहणी करावी."
          phone={institution.phones?.[0]}
          brochureUrl={institution.brochureUrl}
        />
      </section>

    </div>
  );
};
