import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '@shared/layouts/PublicLayout';

// Eagerly load HomePage for instant initial render (fast FCP/LCP)
import { HomePage } from '@shared/pages/HomePage';

// Lazy-load secondary pages to drastically reduce initial JS bundle & TBT
const AboutPage = lazy(() => import('@shared/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const VidyamandirPage = lazy(() => import('@shared/pages/VidyamandirPage').then(m => ({ default: m.VidyamandirPage })));
const JuniorCollegePage = lazy(() => import('@shared/pages/JuniorCollegePage').then(m => ({ default: m.JuniorCollegePage })));
const TalentSearchPage = lazy(() => import('@shared/pages/TalentSearchPage').then(m => ({ default: m.TalentSearchPage })));
const ScienceAcademyPage = lazy(() => import('@shared/pages/ScienceAcademyPage').then(m => ({ default: m.ScienceAcademyPage })));
const ComputerInstitutePage = lazy(() => import('@shared/pages/ComputerInstitutePage').then(m => ({ default: m.ComputerInstitutePage })));
const SportsAcademyPage = lazy(() => import('@shared/pages/SportsAcademyPage').then(m => ({ default: m.SportsAcademyPage })));
const CoursesPage = lazy(() => import('@shared/pages/CoursesPage').then(m => ({ default: m.CoursesPage })));
const CourseDetailsPage = lazy(() => import('@shared/pages/CourseDetailsPage').then(m => ({ default: m.CourseDetailsPage })));
const GalleryPage = lazy(() => import('@shared/pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const VideosPage = lazy(() => import('@shared/pages/VideosPage').then(m => ({ default: m.VideosPage })));
const NoticesPage = lazy(() => import('@shared/pages/NoticesPage').then(m => ({ default: m.NoticesPage })));
const ContactPage = lazy(() => import('@shared/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const StaffPage = lazy(() => import('@shared/pages/StaffPage').then(m => ({ default: m.StaffPage })));

// Lazy-load CRM-connected form pages together with AuthProvider + CRMProvider
// so the main homepage bundle stays completely free of CRM/Auth overhead.
const AdmissionEnquiryWithCRM = lazy(async () => {
  const [{ AuthProvider }, { CRMProvider }, { AdmissionEnquiryPage }] = await Promise.all([
    import('@shared/contexts/AuthContext'),
    import('@shared/contexts/CRMContext'),
    import('@shared/pages/AdmissionEnquiryPage')
  ]);
  return {
    default: () => (
      <AuthProvider>
        <CRMProvider>
          <AdmissionEnquiryPage />
        </CRMProvider>
      </AuthProvider>
    )
  };
});

const CampusVisitWithCRM = lazy(async () => {
  const [{ AuthProvider }, { CRMProvider }, { CampusVisitPage }] = await Promise.all([
    import('@shared/contexts/AuthContext'),
    import('@shared/contexts/CRMContext'),
    import('@shared/pages/CampusVisitPage')
  ]);
  return {
    default: () => (
      <AuthProvider>
        <CRMProvider>
          <CampusVisitPage />
        </CRMProvider>
      </AuthProvider>
    )
  };
});

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-gurukul-saffron-600 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          {/* Core Institutional Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Educational Programs & Academies */}
          <Route path="/vidyamandir" element={<VidyamandirPage />} />
          <Route path="/gurukul-vidyamandir" element={<VidyamandirPage />} />
          <Route path="/junior-college" element={<JuniorCollegePage />} />
          <Route path="/gurukul-junior-college" element={<JuniorCollegePage />} />
          <Route path="/talent-search-academy" element={<TalentSearchPage />} />
          <Route path="/science-academy" element={<ScienceAcademyPage />} />
          <Route path="/computer-institute" element={<ComputerInstitutePage />} />
          <Route path="/sports-academy" element={<SportsAcademyPage />} />

          {/* Academic Offerings & Media */}
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/notices" element={<NoticesPage />} />

          {/* Parent Communication & Enquiries */}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/admission-enquiry" element={<AdmissionEnquiryWithCRM />} />
          <Route path="/campus-visit" element={<CampusVisitWithCRM />} />
          <Route path="/schedule-visit" element={<CampusVisitWithCRM />} />
        </Route>

        {/* Catch-all redirect to homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
