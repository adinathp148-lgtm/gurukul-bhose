import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Image as ImageIcon, Video } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { VideoCard } from '../components/cards/VideoCard';
import { GridSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { CTASection } from '../components/sections/CTASection';
import { getVideos, getWebsiteContent } from '../services/firestore/contentService';

export const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [institution, setInstitution] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getVideos(),
      getWebsiteContent()
    ]).then(([videoRes, instRes]) => {
      if (!isMounted) return;
      setVideos(videoRes.data);
      setInstitution(instRes.data);
      setLoading(false);
    }).catch(err => {
      console.warn('Videos load error:', err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title="शालेय उपक्रम व्हिडिओ | गुरुकुल भोसे"
        description="गुरुकुल भोसे सैनिक पॅटर्न निवासी स्कूल व कॉलेज दैनंदिन दिनचर्या, शारीरिक कवायत, क्रीडा स्पर्धा व विद्यार्थ्यांच्या निकालांचे व्हिडिओ."
      />

      <PageHeader
        badge="व्हिडिओ दालन"
        title="शालेय उपक्रम व दिनचर्या व्हिडिओ (Videos)"
        subtitle="कॅम्पस शिस्त, विद्यार्थी विकास, मैदानी खेळ, प्रात्यक्षिके आणि विद्यार्थ्यांची यशोगाथा"
        breadcrumbs={[{ label: 'व्हिडिओ (Videos)' }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Gallery / Videos Mode Switcher */}
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-gurukul-saffron-500" />
            <span>फोटो गॅलरी (Photos)</span>
          </Link>
          <Link
            to="/videos"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-gurukul-navy-950 text-white shadow-md border-2 border-gurukul-navy-950"
          >
            <Video className="w-4 h-4 text-red-400" />
            <span>व्हिडिओ गॅलरी (Videos)</span>
          </Link>
        </div>

        {loading ? (
          <GridSkeleton count={6} />
        ) : videos.length === 0 ? (
          <EmptyState
            title="सध्या व्हिडिओ उपलब्ध नाहीत"
            description="लवकरच नवीन उपक्रम व्हिडिओ अपलोड करण्यात येतील."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((vid) => (
              <VideoCard key={vid.id} video={vid} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="आपल्या पाल्याला सैनिक शिस्त व दर्जेदार शिक्षण द्या!"
          subtitle="चालू शैक्षणिक वर्षातील प्रवेशासाठी आजच ऑनलाईन नोंदणी करा किंवा संपर्क साधा."
          phone={institution.phones?.[0]}
          brochureUrl={institution.brochureUrl}
        />
      </section>
    </div>
  );
};
