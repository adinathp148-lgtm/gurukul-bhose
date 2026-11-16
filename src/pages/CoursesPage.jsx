import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { CourseCard } from '../components/cards/CourseCard';
import { GridSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { CTASection } from '../components/sections/CTASection';
import { getCourses, getWebsiteContent } from '../services/firestore/contentService';
import { useLanguage } from '../contexts/LanguageContext';

export const CoursesPage = () => {
  const { isMarathi } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [institution, setInstitution] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getCourses('ALL'),
      getWebsiteContent()
    ]).then(([coursesRes, instRes]) => {
      if (!isMounted) return;
      setCourses(coursesRes.data);
      setInstitution(instRes.data);
      setLoading(false);
    }).catch(err => {
      console.warn('Courses load error:', err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  const categories = [
    { id: 'ALL', label: isMarathi ? 'सर्व अभ्यासक्रम (All Courses)' : 'All Courses' },
    { id: 'शालेय शिक्षण', label: isMarathi ? 'शालेय शिक्षण (5th to 10th)' : 'Schooling (5th to 10th)' },
    { id: 'उच्च माध्यमिक', label: isMarathi ? 'उच्च माध्यमिक (11th & 12th)' : 'Junior College (11th & 12th)' },
    { id: 'स्पर्धा परीक्षा', label: isMarathi ? 'स्पर्धा परीक्षा (Talent Search)' : 'Competitive Exams' },
    { id: 'व्यावसायिक कौशल्ये', label: isMarathi ? 'कम्प्युटर व टायपिंग' : 'Computers & Vocational' },
    { id: 'क्रीडा व डिफेन्स', label: isMarathi ? 'क्रीडा व डिफेन्स (Sports)' : 'Sports & Defence Training' }
  ];

  const filteredCourses = courses.filter(c => {
    const matchesCategory = activeCategory === 'ALL' || c.category === activeCategory;
    const matchesSearch = 
      (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.programName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title="कोर्सेस व अभ्यासक्रम | गुरुकुल भोसे"
        description="गुरुकुल भोसे निवासी अभ्यासक्रम: ५ वी ते १० वी सैनिक पॅटर्न, ११ वी १२ वी सायन्स व आर्टस्, स्पर्धा परीक्षा, MS-CIT, Tally, टायपिंग व डिफेन्स ट्रेनिंग."
      />

      <PageHeader
        badge={isMarathi ? 'सैनिक पॅटर्न निवासी अभ्यासक्रम' : 'Sainik Pattern Residential Courses'}
        title={isMarathi ? 'गुरुकुल भोसे शैक्षणिक कोर्सेस (Courses)' : 'Academic Courses & Programs (अभ्यासक्रम)'}
        subtitle={isMarathi 
          ? 'दर्जेदार अध्यापन, सैनिक शिस्त, हमखास निकाल आणि बारावी नंतर हमखास सरकारी नोकरी पूर्वतयारी' 
          : 'High quality teaching, military discipline, guaranteed academic success, and government job pre-training'}
        breadcrumbs={[{ label: isMarathi ? 'कोर्सेस (Courses)' : 'Courses' }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Search & Category Filter Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isMarathi ? "कोर्सचे नाव किंवा विषयाने शोधा..." : "Search courses by title or subject..."}
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              {isMarathi ? 'एकूण अभ्यासक्रम' : 'Total Courses'}: <strong>{filteredCourses.length}</strong>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gurukul-saffron-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <GridSkeleton count={6} />
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            title="कोणताही अभ्यासक्रम आढळला नाही"
            description="आपण शोधत असलेला अभ्यासक्रम सापडला नाही. कृपया इतर निकष वापरून शोधा."
            actionText="सर्व अभ्यासक्रम दाखवा"
            onAction={() => {
              setActiveCategory('ALL');
              setSearchTerm('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="आपल्या पाल्यासाठी सर्वोत्तम अभ्यासक्रम निवडा!"
          subtitle="शाळा, वसतिगृह, भोजन, क्लास व ग्राऊंड एकाच ठिकाणी. नो डोनेशन, थेट प्रवेश."
          phone={institution.phones?.[0]}
          brochureUrl={institution.brochureUrl}
        />
      </section>

    </div>
  );
};
