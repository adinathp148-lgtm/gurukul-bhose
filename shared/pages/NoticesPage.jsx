import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Download, AlertCircle, FileText, X } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { NoticeCard } from '../components/cards/NoticeCard';
import { NoticeSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { CTASection } from '../components/sections/CTASection';
import { getNotices, getWebsiteContent } from '../services/firestore/contentService';

export const NoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [institution, setInstitution] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getNotices(20),
      getWebsiteContent()
    ]).then(([noticeRes, instRes]) => {
      if (!isMounted) return;
      setNotices(noticeRes.data);
      setInstitution(instRes.data);
      setLoading(false);
    }).catch(err => {
      console.warn('Notices load error:', err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Real-time listener for CMS updates across tabs/origins
  useEffect(() => {
    const handleUpdate = () => {
      getNotices(20).then(res => {
        if (res?.data) setNotices(res.data);
      }).catch(console.warn);
    };

    window.addEventListener('gurukul_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('gurukul_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title="सूचना पत्रक व अधिकृत परिपत्रके | गुरुकुल भोसे"
        description="गुरुकुल भोसे अधिकृत सूचना पत्रक: चालू शैक्षणिक वर्ष प्रवेश, परीक्षा वेळापत्रक, पालक-शिक्षक सभा व महत्त्वाच्या घोषणा."
      />

      <PageHeader
        badge="अधिकृत परिपत्रके व घोषणा"
        title="सूचना पत्रक (School Notices & Bulletins)"
        subtitle="चालू शैक्षणिक वर्षातील प्रवेश परिपत्रके, परीक्षा वेळापत्रक व महत्त्वाच्या शालेय घोषणा"
        breadcrumbs={[{ label: 'सूचना पत्रक (Notices)' }]}
      />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {loading ? (
          <div className="space-y-4">
            <NoticeSkeleton />
            <NoticeSkeleton />
            <NoticeSkeleton />
          </div>
        ) : notices.length === 0 ? (
          <EmptyState
            title="सध्या कोणत्याही नवीन सूचना नाहीत"
            description="नवीन घोषणा व परिपत्रके येथे प्रकाशित केली जातील."
          />
        ) : (
          notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onOpenModal={(n) => setSelectedNotice(n)}
            />
          ))
        )}
      </section>

      {/* Notice Detail Dialog */}
      <Modal
        isOpen={Boolean(selectedNotice)}
        onClose={() => setSelectedNotice(null)}
        title={selectedNotice?.title || 'शालेय सूचना'}
        subtitle={`वर्गवारी: ${selectedNotice?.category || ''} | तारीख: ${selectedNotice?.date || selectedNotice?.publishedAt || ''}`}
        maxWidth="max-w-xl"
      >
        {selectedNotice && (
          <div className="space-y-4">
            {selectedNotice.isImportant && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>महत्त्वाची सूचना (High Priority Announcement)</span>
              </div>
            )}

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line p-3 bg-slate-50 rounded-xl border border-slate-200">
              {selectedNotice.description}
            </div>

            {selectedNotice.downloadLink && (
              <div className="pt-2">
                <a
                  href={selectedNotice.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gurukul-saffron-500 text-white font-bold rounded-lg text-xs hover:bg-gurukul-saffron-600 transition-colors shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>संलग्न दस्तऐवज डाऊनलोड करा (Download PDF Attachment)</span>
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="प्रवेशाबाबत अधिक माहितीसाठी संपर्क करा"
          subtitle="संस्थेच्या अधिकृत क्रमांकावर कॉल करून थेट माहिती मिळवा."
          phone={institution.phones?.[0]}
          brochureUrl={institution.brochureUrl}
        />
      </section>
    </div>
  );
};
