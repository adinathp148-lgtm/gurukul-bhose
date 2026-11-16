import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight, 
  Download, 
  ShieldCheck, 
  GraduationCap, 
  UserCheck 
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { LoadingSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { getCourseBySlug, getCourses, getWebsiteContent } from '../services/firestore/contentService';

export const CourseDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [institution, setInstitution] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      getCourseBySlug(slug),
      getCourses('ALL'),
      getWebsiteContent()
    ]).then(([courseData, allCoursesRes, instRes]) => {
      if (!isMounted) return;
      if (!courseData) {
        setError('सदर कोर्स सापडला नाही किंवा काढून टाकण्यात आला आहे.');
        setLoading(false);
        return;
      }
      setCourse(courseData);
      setRelatedCourses(allCoursesRes.data.filter(c => c.slug !== slug).slice(0, 3));
      setInstitution(instRes.data);
      setLoading(false);
    }).catch(err => {
      if (!isMounted) return;
      setError('कोर्स तपशील लोड करताना अडचण आली.');
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorState
          title="कोर्स उपलब्ध नाही"
          message={error || 'सदर अभ्यासक्रम सापडला नाही.'}
          onRetry={() => navigate('/courses')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title={course.seoTitle || `${course.title} | गुरुकुल भोसे कोर्सेस`}
        description={course.seoDescription || course.shortDescription || course.description}
      />

      <PageHeader
        badge={course.category}
        title={course.title}
        subtitle={`${course.pattern || 'सैनिक पॅटर्न'} • ${course.duration} • ${course.programName || 'गुरुकुल भोसे'}`}
        breadcrumbs={[
          { label: 'कोर्सेस (Courses)', link: '/courses' },
          { label: course.title }
        ]}
      />

      {/* Main Details Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Main Course Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Image banner */}
            <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200 aspect-[16/9] bg-slate-100">
              <img
                src={course.imageUrl || course.image}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-gurukul-navy-900 border-l-4 border-gurukul-saffron-500 pl-3">
                अभ्यासक्रम विहंगावलोकन (Course Overview)
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {course.fullDescription || course.description || course.shortDescription}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">कालावधी (Duration)</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{course.duration}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">पात्रता (Eligibility)</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{course.eligibility}</span>
                </div>
              </div>
            </div>

            {/* Key Features */}
            {course.features && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gurukul-navy-900 border-l-4 border-gurukul-saffron-500 pl-3">
                  प्रमुख वैशिष्ट्ये व फायदे (Key Highlights)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {course.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-800 p-2 rounded-lg bg-orange-50/50">
                      <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Syllabus */}
            {course.syllabus && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gurukul-navy-900 border-l-4 border-gurukul-saffron-500 pl-3">
                  अभ्यासक्रमाचे घटक व विषय (Syllabus & Topics)
                </h3>
                <div className="space-y-2.5 pt-2">
                  {course.syllabus.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-gurukul-navy-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="font-medium leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career Scope */}
            {course.careerScope && (
              <div className="bg-emerald-50/60 border border-emerald-200 p-6 sm:p-8 rounded-3xl space-y-2">
                <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-700" />
                  <span>करिअर संधी व हमी (Career Opportunities)</span>
                </h3>
                <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                  {course.careerScope}
                </p>
              </div>
            )}

          </div>

          {/* Right: Quick Enrollment Card & Related Courses */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6 sticky top-28">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
                  प्रवेश सुरू • मर्यादित जागा
                </span>
                <h3 className="text-lg font-black text-gurukul-navy-900 mt-1">
                  प्रवेश नोंदणी व चौकशी
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  कोणतीही देणगी नाही. थेट व पारदर्शक प्रवेश.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">प्रकार:</span>
                  <span className="font-bold text-slate-900">{course.pattern}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">वर्ग:</span>
                  <span className="font-bold text-slate-900">{course.programName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">कालावधी:</span>
                  <span className="font-bold text-slate-900">{course.duration}</span>
                </div>
              </div>

              <Link to="/admission-enquiry" className="block w-full">
                <Button variant="primary" size="lg" className="w-full font-bold uppercase tracking-wider shadow-md">
                  <span>प्रवेश अर्ज सादर करा / Apply</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>

              <a
                href={institution.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-4 h-4 text-gurukul-saffron-600" />
                <span>माहिती पत्रक डाऊनलोड करा</span>
              </a>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500">थेट फोनवर माहितीसाठी संपर्क:</p>
                <p className="text-xs font-bold text-gurukul-navy-900 mt-0.5">
                  ९८५०४४९८०० / ९८५०४४९८०८
                </p>
              </div>
            </div>

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-slate-900">इतर संबंधित अभ्यासक्रम</h4>
                <div className="space-y-3">
                  {relatedCourses.map((rc) => (
                    <Link
                      key={rc.id}
                      to={`/courses/${rc.slug || rc.id}`}
                      className="block p-3 rounded-xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200 transition-colors"
                    >
                      <h5 className="font-bold text-xs text-slate-900 hover:text-gurukul-saffron-600">{rc.title}</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">{rc.programName} • {rc.duration}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

    </div>
  );
};
