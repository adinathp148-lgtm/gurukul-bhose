import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Award, 
  Users, 
  CheckCircle2, 
  Phone, 
  Download, 
  ArrowRight, 
  BookOpen, 
  Activity, 
  MapPin, 
  GraduationCap, 
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Bell
} from 'lucide-react';

import { useCMS } from '../contexts/CMSContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SEO } from '../components/common/SEO';
import { Button } from '../components/common/Button';
import { HeroSection } from '../components/sections/HeroSection';
import { WhyChooseUsSection } from '../components/sections/WhyChooseUsSection';
import { FacilitiesSection } from '../components/sections/FacilitiesSection';
import { CTASection } from '../components/sections/CTASection';
import { ContactInfoSection } from '../components/sections/ContactInfoSection';
import { ProgramCard } from '../components/cards/ProgramCard';
import { NoticeCard } from '../components/cards/NoticeCard';
import { VideoCard } from '../components/cards/VideoCard';
import { Modal } from '../components/common/Modal';

import { 
  featuresList,
  programsList,
  facilitiesList,
  noticesList,
  galleryList,
  videosList
} from '../data/initialData';

export const HomePage = () => {
  const { institution, slides, gallery: cmsGallery, videos: cmsVideos, notices: cmsNotices, facilities: cmsFacilities, homepageData } = useCMS();
  const { isMarathi } = useLanguage();

  // Initialize immediately with authentic local/CMS data to avoid empty-state layout shifts & double renders
  const [programs, setPrograms] = useState(() => programsList || []);
  const [facilities, setFacilities] = useState(() => (cmsFacilities?.length ? cmsFacilities : facilitiesList) || []);
  const [notices, setNotices] = useState(() => ((cmsNotices?.length ? cmsNotices : noticesList) || []).slice(0, 3));
  const [gallery, setGallery] = useState(() => ((cmsGallery?.length ? cmsGallery : galleryList) || []).slice(0, 6));
  const [videos, setVideos] = useState(() => ((cmsVideos?.length ? cmsVideos : videosList) || []).slice(0, 3));
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Quick admission form state
  const [quickForm, setQuickForm] = useState({
    studentName: '',
    parentName: '',
    mobileNumber: '',
    admissionClass: 'इ. 5 वी',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: null });

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const {
          getPrograms,
          getFacilities,
          getNotices,
          getGalleryImages,
          getVideos
        } = await import('../services/firestore/contentService');

        const [progRes, facRes, notRes, galRes, vidRes] = await Promise.all([
          getPrograms(),
          getFacilities(),
          getNotices(6),
          getGalleryImages('all'),
          getVideos()
        ]);
        if (isMounted) {
          const rawProgs = progRes.data || [];
          const rawFacs = facRes.data || [];
          const rawNots = notRes.data || [];
          const rawGals = galRes.data || cmsGallery || [];
          const rawVids = vidRes.data || cmsVideos || [];

          // Apply homepage CMS curation if configured
          let filteredProgs = rawProgs;
          if (homepageData?.featuredPrograms?.length > 0) {
            const matches = rawProgs.filter(p => homepageData.featuredPrograms.includes(p.slug || p.id));
            if (matches.length > 0) filteredProgs = matches;
          }

          let filteredNots = rawNots;
          if (homepageData?.featuredNotices?.length > 0) {
            const matches = rawNots.filter(n => homepageData.featuredNotices.includes(n.noticeId || n.id));
            const others = rawNots.filter(n => !homepageData.featuredNotices.includes(n.noticeId || n.id));
            filteredNots = [...matches, ...others];
          }

          let filteredGals = rawGals;
          if (homepageData?.galleryPreview?.length > 0) {
            const matches = rawGals.filter(g => homepageData.galleryPreview.includes(g.imageId || g.id));
            const others = rawGals.filter(g => !homepageData.galleryPreview.includes(g.imageId || g.id));
            filteredGals = [...matches, ...others];
          }

          let filteredVids = rawVids;
          if (homepageData?.videoPreview?.length > 0) {
            const matches = rawVids.filter(v => homepageData.videoPreview.includes(v.videoId || v.id));
            const others = rawVids.filter(v => !homepageData.videoPreview.includes(v.videoId || v.id));
            filteredVids = [...matches, ...others];
          }

          if (filteredProgs.length) setPrograms(filteredProgs);
          if (rawFacs.length) setFacilities(rawFacs);
          if (filteredNots.length) setNotices(filteredNots.slice(0, 3));
          if (filteredGals.length) setGallery(filteredGals.slice(0, 6));
          if (filteredVids.length) setVideos(filteredVids.slice(0, 3));
        }
      } catch (err) {
        console.warn('Error fetching homepage dynamic content:', err);
      }
    };

    // Defer live Firestore sync until after initial paint & interaction window
    let synced = false;
    const triggerSync = () => {
      if (synced) return;
      synced = true;
      fetchHomeData();
    };
    const timerId = setTimeout(triggerSync, 4500);
    window.addEventListener('pointerdown', triggerSync, { once: true, passive: true });
    window.addEventListener('keydown', triggerSync, { once: true, passive: true });

    return () => {
      isMounted = false;
      clearTimeout(timerId);
      window.removeEventListener('pointerdown', triggerSync);
      window.removeEventListener('keydown', triggerSync);
    };
  }, [cmsGallery, cmsVideos, homepageData]);

  // Real-time listener for CMS updates on homepage
  useEffect(() => {
    const handleUpdate = async () => {
      try {
        const {
          getNotices,
          getGalleryImages,
          getVideos
        } = await import('../services/firestore/contentService');
        const [notRes, galRes, vidRes] = await Promise.all([
          getNotices(6),
          getGalleryImages('all'),
          getVideos()
        ]);
        if (notRes?.data) setNotices(notRes.data.slice(0, 3));
        if (galRes?.data) setGallery(galRes.data.slice(0, 6));
        if (vidRes?.data) setVideos(vidRes.data.slice(0, 3));
      } catch (err) {
        console.warn(err);
      }
    };

    window.addEventListener('gurukul_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('gurukul_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, success: false, error: null });

    try {
      const { submitPublicAdmissionEnquiry } = await import('../services/firestore/crmService');
      const res = await submitPublicAdmissionEnquiry({
        ...quickForm,
        leadSource: 'Website (Home Page Quick Form)',
        course: quickForm.admissionClass.includes('11') || quickForm.admissionClass.includes('12') 
          ? 'गुरुकुल जुनियर कॉलेज' 
          : 'गुरुकुल विद्यामंदिर'
      });

      if (res?.success) {
        setFormStatus({ loading: false, success: true, error: null });
        setQuickForm({
          studentName: '',
          parentName: '',
          mobileNumber: '',
          admissionClass: 'इ. 5 वी',
          message: ''
        });
      } else {
        setFormStatus({ loading: false, success: false, error: res?.message || 'त्रुटी आढळली.' });
      }
    } catch (err) {
      setFormStatus({ loading: false, success: false, error: err?.message || 'त्रुटी आढळली.' });
    }
  };

  const primaryPhone = institution.phones?.[0] || '9850449800';

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      <SEO
        title={isMarathi ? "गुरुकुल विद्यामंदिर व ज्युनिअर कॉलेज, भोसे | सैनिक पॅटर्न निवासी शाळा व कॉलेज" : "Gurukul Vidyamandir & Junior College, Bhose | Sainik Pattern Residential School & College"}
        description={isMarathi ? "इ. ५ वी ते १२ वी सैनिक पॅटर्न निवासी स्कूल व कॉलेज. चार एकर निसर्गरम्य परिसर, सुरक्षित वसतिगृह, नो डोनेशन थेट प्रवेश, बारावी नंतर हमखास सरकारी नोकरी." : "5th to 12th Std. Sainik Pattern Residential School & College. 4-acre scenic safe campus, secure hostel, direct admission, and assured career prep."}
        canonicalUrl="/"
      />

      {/* 3. Hero Banner with School Introduction & Slides */}
      <HeroSection slides={slides} institution={institution} />

      {/* 4. Welcome to Gurukul Bhose Banner & Key Highlights */}
      {homepageData?.enabledSections?.welcome !== false && (
        <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-orange-50 via-amber-50/50 to-orange-50/30 border border-orange-200/90 border-l-4 border-l-gurukul-saffron-500 rounded-2xl p-4.5 sm:p-7 lg:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
              <div className="space-y-2 max-w-3xl min-w-0 flex-1">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
                  {isMarathi ? 'स्वागतम् • गुरुकुल शिक्षण संकुल, भोसे (ता. मिरज, जि. सांगली)' : 'Welcome • Gurukul Educational Campus, Bhose (Miraj, Sangli)'}
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gurukul-navy-900 leading-tight">
                  {isMarathi 
                    ? (homepageData?.welcomeSection?.heading || 'सैनिक शिस्त, दर्जेदार शिक्षण आणि हमखास करिअर यश!') 
                    : 'Military Discipline, Quality Education & Assured Career Success!'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {isMarathi 
                    ? (homepageData?.welcomeSection?.introText || 'दंडोबा डोंगर पायथ्याशी वसलेले चार एकरचे भव्य निसर्गरम्य संकुल. इयत्ता ५ वी ते १० वी (मराठी व सेमी इंग्रजी) आणि ११ वी १२ वी (आर्टस् व सायन्स PCMB). शाळा, कॉलेज, वसतिगृह, मेस, क्लास, स्पर्धा परीक्षा तयारी आणि क्रीडांगण एकाच सुरक्षित संकुलात उपलब्ध.') 
                    : 'Lush 4-acre scenic campus nestled at the foothills of Dandoba hills. Classes 5th to 10th (Marathi & Semi-English) and 11th & 12th (Arts & Science PCMB). School, college, hostel, mess, coaching, competitive exam training, and sports grounds all in one secure campus.'}
                </p>
              </div>
              <div className="shrink-0 flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto pt-1 sm:pt-0">
                <Button 
                  to={homepageData?.welcomeSection?.ctaLink || "/about"} 
                  variant="secondary" 
                  size="md" 
                  className="w-full sm:w-auto text-center justify-center"
                >
                  <span>{isMarathi ? (homepageData?.welcomeSection?.ctaText || 'संस्थेचा परिचय') : 'About Institution'}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 shrink-0" />
                </Button>
                <Button 
                  to="/admission-enquiry" 
                  variant="primary" 
                  size="md" 
                  className="w-full sm:w-auto text-center justify-center shadow-md shadow-orange-500/20"
                >
                  <span>{isMarathi ? 'प्रवेश अर्ज करा' : 'Apply Now'}</span>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. About the Institution & Quick Form */}
      <section className="bg-white py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Visual presentation & verified info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={homepageData?.aboutSection?.imageUrl || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=75"}
                  alt={isMarathi ? "गुरुकुल भोसे कॅम्पस" : "Gurukul Bhose Campus"}
                  loading="lazy"
                  decoding="async"
                  width="800"
                  height="400"
                  className="w-full h-[360px] sm:h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gurukul-navy-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-gurukul-saffron-400" />
                    <div>
                      <p className="font-bold text-sm">{isMarathi ? '४ एकर सुरक्षित व CCTV युक्त कॅम्पस' : '4-Acre Safe & CCTV-Monitored Campus'}</p>
                      <p className="text-[11px] text-slate-300">{isMarathi ? 'दंडोबा डोंगर पायथ्याशी प्रदूषण विरहित वातावरण' : 'Pollution-free environment at Dandoba foothills'}</p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-3 py-1 rounded bg-gurukul-saffron-500 text-xs font-bold">
                    {isMarathi ? '१५ वर्षे अखंड सेवा' : '15 Years of Excellence'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <h3 className="text-xl sm:text-2xl font-black text-gurukul-navy-900">
                  {isMarathi 
                    ? (homepageData?.aboutSection?.title || 'प्रत्येक विद्यार्थ्याच्या शिक्षणाचा व जीवनाचा पाया भक्कम करणारी संस्था') 
                    : (homepageData?.aboutSection?.titleEn || 'Building a Strong Educational and Moral Foundation for Every Student')}
                </h3>
                <p className="leading-relaxed">
                  {isMarathi 
                    ? (homepageData?.aboutSection?.description || 'गुरुकुल भोसे निवासी शिक्षण संकुल हे केवळ पुस्तकी शिक्षणापुरते मर्यादित नसून विद्यार्थ्यांचा शारीरिक, मानसिक, बौद्धिक आणि आध्यात्मिक सर्वांगीण विकास घडवून आणणारे केंद्र आहे.') 
                    : (homepageData?.aboutSection?.descriptionEn || 'Gurukul Bhose Residential Campus extends beyond textbook education to build comprehensive physical, mental, intellectual, and moral development in every child.')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                    <span>{isMarathi ? 'नो डोनेशन, टक्केवारीची अट नाही - थेट प्रवेश' : 'No Donation, No Percentage Barrier – Direct Admission'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                    <span>{isMarathi ? '१२ वी नंतर हमखास सरकारी नोकरी पूर्वतयारी' : 'Assured Government Job Pre-Training After 12th'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                    <span>{isMarathi ? 'वर्गात फक्त ३० विद्यार्थी, वैयक्तिक लक्ष' : 'Max 30 Students per Class, Individual Attention'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                    <span>{isMarathi ? 'सकाळी ५:३० ते रात्री १०:०० शिस्तबद्ध दिनचर्या' : 'Disciplined 5:30 AM to 10:00 PM Daily Routine'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Quick Admission Form */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
                <div className="mb-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
                    {isMarathi ? 'त्वरित प्रवेश चौकशी' : 'Quick Admission Enquiry'}
                  </span>
                  <h3 className="text-xl font-bold text-gurukul-navy-900 mt-1">
                    {isMarathi ? 'मोफत प्रवेश माहिती व समुपदेशन' : 'Free Admission Info & Counseling'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isMarathi 
                      ? 'आपला तपशील भरा, आमचे प्रतिनिधी त्वरित फोनवर मार्गदर्शन करतील.' 
                      : 'Fill your details and our admission counselor will guide you promptly.'}
                  </p>
                </div>

                {formStatus.success ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-base">
                      {isMarathi ? 'प्रवेश चौकशी यशस्वीपणे नोंदवली!' : 'Admission Enquiry Submitted Successfully!'}
                    </h4>
                    <p className="text-xs text-emerald-700">
                      {isMarathi 
                        ? 'आमचे समुपदेशक लवकरच आपल्याशी फोनवर संपर्क साधतील.' 
                        : 'Our admission counselor will contact you shortly on your mobile.'}
                    </p>
                    <button
                      onClick={() => setFormStatus({ loading: false, success: false, error: null })}
                      className="text-xs font-bold text-emerald-800 underline mt-3 inline-block"
                    >
                      {isMarathi ? 'दुसरा अर्ज भरा' : 'Submit Another Form'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleQuickSubmit} className="space-y-3.5">
                    {formStatus.error && (
                      <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">
                        {formStatus.error}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isMarathi ? 'पालकांचे नाव (Parent Name) *' : 'Parent Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={quickForm.parentName}
                        onChange={(e) => setQuickForm({ ...quickForm, parentName: e.target.value })}
                        placeholder={isMarathi ? "उदा. श्री. रमेश पाटील" : "e.g. Mr. Ramesh Patil"}
                        className="w-full text-sm sm:text-xs px-3.5 py-3 sm:py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isMarathi ? 'विद्यार्थ्याचे नाव (Student Name) *' : 'Student Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={quickForm.studentName}
                        onChange={(e) => setQuickForm({ ...quickForm, studentName: e.target.value })}
                        placeholder={isMarathi ? "उदा. रोहन पाटील" : "e.g. Rohan Patil"}
                        className="w-full text-sm sm:text-xs px-3.5 py-3 sm:py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isMarathi ? 'मोबाईल नंबर *' : 'Mobile Number *'}
                        </label>
                        <input
                          type="tel"
                          required
                          value={quickForm.mobileNumber}
                          onChange={(e) => setQuickForm({ ...quickForm, mobileNumber: e.target.value })}
                          placeholder={isMarathi ? "१० अंकी मोबाईल" : "10-digit mobile"}
                          className="w-full text-sm sm:text-xs px-3.5 py-3 sm:py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="quick-admission-class" className="block text-xs font-semibold text-slate-700 mb-1">
                          {isMarathi ? 'प्रवेश इयत्ता (Class) *' : 'Admission Class *'}
                        </label>
                        <select
                          id="quick-admission-class"
                          aria-label={isMarathi ? 'प्रवेश इयत्ता (Class)' : 'Admission Class'}
                          value={quickForm.admissionClass}
                          onChange={(e) => setQuickForm({ ...quickForm, admissionClass: e.target.value })}
                          className="w-full text-sm sm:text-xs px-3.5 py-3 sm:py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                        >
                          <option value="इ. 5 वी">{isMarathi ? 'इ. 5 वी (5th Std)' : 'Class 5th'}</option>
                          <option value="इ. 6 वी">{isMarathi ? 'इ. 6 वी (6th Std)' : 'Class 6th'}</option>
                          <option value="इ. 7 वी">{isMarathi ? 'इ. 7 वी (7th Std)' : 'Class 7th'}</option>
                          <option value="इ. 8 वी">{isMarathi ? 'इ. 8 वी (8th Std)' : 'Class 8th'}</option>
                          <option value="इ. 9 वी">{isMarathi ? 'इ. 9 वी (9th Std)' : 'Class 9th'}</option>
                          <option value="इ. 10 वी">{isMarathi ? 'इ. 10 वी (10th Std)' : 'Class 10th'}</option>
                          <option value="इ. 11 वी सायन्स">{isMarathi ? 'इ. 11 वी सायन्स' : 'Class 11th Science'}</option>
                          <option value="इ. 11 वी आर्टस्">{isMarathi ? 'इ. 11 वी आर्टस्' : 'Class 11th Arts'}</option>
                          <option value="इ. 12 वी सायन्स">{isMarathi ? 'इ. 12 वी सायन्स' : 'Class 12th Science'}</option>
                          <option value="इ. 12 वी आर्टस्">{isMarathi ? 'इ. 12 वी आर्टस्' : 'Class 12th Arts'}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isMarathi ? 'गावाचे / तालुक्याचे नाव' : 'City / Village / Taluka'}
                      </label>
                      <input
                        type="text"
                        value={quickForm.message}
                        onChange={(e) => setQuickForm({ ...quickForm, message: e.target.value })}
                        placeholder={isMarathi ? "उदा. मिरज, सांगली" : "e.g. Miraj, Sangli"}
                        className="w-full text-sm sm:text-xs px-3.5 py-3 sm:py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={formStatus.loading}
                      className="w-full text-xs py-3 font-bold uppercase tracking-wider mt-2"
                    >
                      {isMarathi ? 'प्रवेश माहिती पाठवा / Submit' : 'Submit Admission Enquiry'}
                    </Button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Educational Programs (All 6 Programs Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
            {isMarathi ? 'शैक्षणिक शाखा व विभाग (Educational Programs)' : 'Educational Wings & Academies'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
            {isMarathi ? 'गुरुकुल भोसे शिक्षण संकुलाचे शैक्षणिक उपक्रम' : 'Academic Programs at Gurukul Bhose'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            {isMarathi 
              ? 'इ. ५ वी ते १२ वी शालेय व उच्च माध्यमिक शिक्षण, स्पर्धा परीक्षा आणि व्यावसायिक प्रशिक्षण' 
              : 'Classes 5th to 12th Schooling, Higher Secondary, Competitive Exams & Skill Development'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((prog) => (
            <ProgramCard key={prog.id} program={prog} />
          ))}
        </div>
      </section>

      {/* 7. Our Specialized Academies Highlight */}
      <section className="bg-gradient-to-br from-slate-900 to-gurukul-navy-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-400 block">
              {isMarathi ? 'विशेष निवासी अकॅडमी (Our Academies)' : 'Specialized Residential Academies'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              {isMarathi 
                ? 'शालेय शिक्षणासोबत हमखास करिअर घडवणाऱ्या विशेष संस्था' 
                : 'Specialized Academies Building Assured Careers Alongside Schooling'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              {isMarathi 
                ? 'टॅलेंट सर्च • सायन्स अकॅडमी • कॉम्प्युटर इन्स्टिट्यूट • स्पोर्ट्स व डिफेन्स अकॅडमी' 
                : 'Talent Search • Science Academy • Computer Institute • Sports & Defence Academy'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
              <Award className="w-8 h-8 text-gurukul-saffron-400 mb-3" />
              <h3 className="font-bold text-base">{isMarathi ? 'टॅलेंट सर्च अकॅडमी' : 'Talent Search Academy'}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isMarathi 
                  ? 'स्कॉलरशिप, नवोदय विद्यालय, सैनिक स्कूल (AISSEE), NMMS व NTS परीक्षांची परिपूर्ण निवासी तयारी.' 
                  : 'Comprehensive residential preparation for Scholarship, Navodaya, Sainik School (AISSEE), NMMS & NTS exams.'}
              </p>
              <Link to="/talent-search-academy" className="inline-flex items-center gap-1 text-xs font-bold text-gurukul-saffron-400 hover:underline mt-4">
                <span>{isMarathi ? 'माहिती पहा' : 'Learn More'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
              <Sparkles className="w-8 h-8 text-yellow-400 mb-3" />
              <h3 className="font-bold text-base">{isMarathi ? 'सायन्स अकॅडमी' : 'Science Academy'}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isMarathi 
                  ? 'PCMB, NEET, JEE Mains, MHT-CET आणि NDA प्रवेश परीक्षांचे निवासी मार्गदर्शन व प्रॅक्टिकल लॅब.' 
                  : 'Residential mentorship and practical laboratories for PCMB, NEET, JEE Mains, MHT-CET and NDA exams.'}
              </p>
              <Link to="/science-academy" className="inline-flex items-center gap-1 text-xs font-bold text-yellow-400 hover:underline mt-4">
                <span>{isMarathi ? 'माहिती पहा' : 'Learn More'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
              <BookOpen className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="font-bold text-base">{isMarathi ? 'कम्प्युटर इन्स्टिट्यूट' : 'Computer Institute'}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isMarathi 
                  ? 'शासकीय मान्यताप्राप्त MS-CIT, Tally ERP, इंग्रजी व मराठी टायपिंगचे प्रत्यक्ष संगणकावर प्रशिक्षण.' 
                  : 'Government-recognized MS-CIT, Tally Prime ERP, English & Marathi typing with practical training.'}
              </p>
              <Link to="/computer-institute" className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:underline mt-4">
                <span>{isMarathi ? 'माहिती पहा' : 'Learn More'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
              <Activity className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-bold text-base">{isMarathi ? 'स्पोर्ट्स & डिफेन्स' : 'Sports & Defence Academy'}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isMarathi 
                  ? '४०० मी. रनिंग ट्रॅक, लांबउडी, गोळाफेक, रोप क्लायम्बिंग, रायफल शूटिंग आणि कराटेचे दररोज प्रशिक्षण.' 
                  : 'Daily training on 400m track, long jump, shot put, obstacle rope climbing, rifle shooting and karate.'}
              </p>
              <Link to="/sports-academy" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline mt-4">
                <span>{isMarathi ? 'माहिती पहा' : 'Learn More'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Why Choose Gurukul Bhose Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WhyChooseUsSection features={featuresList} brochureUrl={institution.brochureUrl} />
      </section>

      {/* 9. Facilities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FacilitiesSection facilities={facilities} />
      </section>

      {/* Verified Statistics Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <GraduationCap className="w-8 h-8 text-gurukul-saffron-500 mx-auto mb-2" />
            <h4 className="text-3xl font-black text-gurukul-navy-900">{institution.counters?.professionals || 30}+</h4>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {isMarathi ? 'तज्ज्ञ प्राध्यापक व प्रशिक्षक' : 'Expert Teachers & Coaches'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <Users className="w-8 h-8 text-gurukul-navy-700 mx-auto mb-2" />
            <h4 className="text-3xl font-black text-gurukul-navy-900">{institution.counters?.happyParents || 4000}+</h4>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {isMarathi ? 'समाधानी पालक (Happy Parents)' : 'Happy Parents'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <Activity className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-3xl font-black text-gurukul-navy-900">{institution.counters?.activities || 30}+</h4>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {isMarathi ? 'क्रीडा व सर्वांगीण उपक्रम' : 'Sports & Co-Curricular Activities'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="text-3xl font-black text-gurukul-navy-900">{institution.counters?.happyStudents || 5000}+</h4>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {isMarathi ? 'यशस्वी विद्यार्थी व माजी सैनिक' : 'Successful Students & Alumni'}
            </p>
          </div>
        </div>
      </section>

      {/* 10. Latest Notices Preview */}
      {homepageData?.enabledSections?.notices !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
                {isMarathi ? 'ताज्या सूचना व परिपत्रके (Latest Notices)' : 'Latest Notices & Circulars'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
                {isMarathi ? 'पालक व विद्यार्थ्यांसाठी महत्त्वाच्या सूचना' : 'Important Notices for Parents & Students'}
              </h2>
            </div>
            <Link to="/notices" className="text-xs font-bold text-gurukul-saffron-600 hover:underline flex items-center gap-1">
              <span>{isMarathi ? 'सर्व सूचना पहा' : 'View All Notices'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notices.map((n) => (
              <NoticeCard
                key={n.id}
                notice={n}
                onOpenModal={(item) => setSelectedNotice(item)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Notice detail modal */}
      <Modal
        isOpen={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        title={selectedNotice?.title || (isMarathi ? 'सूचना तपशील' : 'Notice Details')}
      >
        {selectedNotice && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b">
              <span>{isMarathi ? 'वर्ग:' : 'Category:'} <strong>{selectedNotice.category}</strong></span>
              <span>{isMarathi ? 'तारीख:' : 'Date:'} <strong>{selectedNotice.date || selectedNotice.publishedAt}</strong></span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {selectedNotice.description}
            </p>
            {selectedNotice.downloadLink && (
              <div className="pt-4 border-t flex justify-end">
                <a
                  href={selectedNotice.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gurukul-navy-900 text-white rounded-lg text-xs font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span>{isMarathi ? 'PDF परिपत्रक डाऊनलोड करा' : 'Download Notice PDF'}</span>
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 11. Photo Gallery Preview */}
      {homepageData?.enabledSections?.gallery !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
                {isMarathi ? 'कॅम्पस फोटो गॅलरी (Photo Gallery)' : 'Campus Photo Gallery'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
                {isMarathi ? 'आमच्या सुविधा, क्रीडांगण व दैनंदिन उपक्रम' : 'Our Facilities, Sports Grounds & Daily Activities'}
              </h2>
            </div>
            <Link to="/gallery" className="text-xs font-bold text-gurukul-saffron-600 hover:underline flex items-center gap-1">
              <span>{isMarathi ? 'सर्व फोटो पहा' : 'View All Photos'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <div key={item.id} className="group relative rounded-2xl overflow-hidden shadow-sm aspect-video bg-slate-200">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gurukul-saffron-400 block">
                    {item.category}
                  </span>
                  <p className="text-xs font-bold text-white mt-0.5 truncate">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 12. Video Gallery Preview */}
      {homepageData?.enabledSections?.videos !== false && (
        <section className="bg-slate-100 py-16 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
                  {isMarathi ? 'शालेय उपक्रम व्हिडिओ (Videos)' : 'School Activities Videos'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
                  {isMarathi ? 'कॅम्पस दिनचर्या, मैदानी सराव व प्रात्यक्षिके' : 'Campus Routine, Ground Drills & Demonstrations'}
                </h2>
              </div>
              <Link to="/videos" className="text-xs font-bold text-gurukul-saffron-600 hover:underline flex items-center gap-1">
                <span>{isMarathi ? 'सर्व व्हिडिओ पहा' : 'View All Videos'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((vid) => (
                <VideoCard key={vid.id} video={vid} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 13. Admission Enquiry CTA */}
      {homepageData?.enabledSections?.cta !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CTASection
            title={homepageData?.admissionCTA?.heading || (isMarathi ? "चालू शैक्षणिक वर्षासाठी प्रवेश सुरू!" : "Admissions Open for Current Academic Session!")}
            subtitle={homepageData?.admissionCTA?.description || (isMarathi ? "इ. ५ वी ते १० वी मराठी व सेमी आणि ११ वी १२ वी आर्टस् व सायन्स सैनिक पॅटर्न निवासी शाळा व कॉलेज • नो डोनेशन, थेट प्रवेश" : "5th to 12th Std. Sainik Pattern Residential School & College • Direct Admission, No Donation")}
            brochureUrl={institution.brochureUrl}
            phone={primaryPhone}
          />
        </section>
      )}

      {/* 14. Contact Information & Google Maps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ContactInfoSection institution={institution} />
      </section>

    </div>
  );
};
