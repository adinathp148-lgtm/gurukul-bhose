import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ZoomIn, X, Image as ImageIcon, Video } from 'lucide-react';
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

  const categories = [
    { id: 'all', label: 'सर्व छायाचित्रे (All)' },
    { id: 'activities', label: 'उपक्रम (Activities)' },
    { id: 'sports', label: 'क्रीडा व ग्राऊंड (Sports)' },
    { id: 'gathering', label: 'स्नेहसंमेलन (Gathering)' },
    { id: 'result', label: 'गुणवंत विद्यार्थी निकाल (Result)' }
  ];

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

        {/* Gallery Grid */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

      {/* Full-Screen Modal Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.title}
              className="max-h-[75vh] w-auto max-w-full object-contain mx-auto"
            />
            <div className="p-4 text-white bg-slate-950/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gurukul-saffron-400 block">
                {selectedImage.category}
              </span>
              <h3 className="text-sm sm:text-base font-bold mt-0.5">{selectedImage.title}</h3>
              {selectedImage.caption && (
                <p className="text-xs text-slate-300 mt-1">{selectedImage.caption}</p>
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
