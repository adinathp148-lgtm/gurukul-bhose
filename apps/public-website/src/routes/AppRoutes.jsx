import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '@shared/layouts/PublicLayout';

// Public School Website Pages
import { HomePage } from '@shared/pages/HomePage';
import { AboutPage } from '@shared/pages/AboutPage';
import { VidyamandirPage } from '@shared/pages/VidyamandirPage';
import { JuniorCollegePage } from '@shared/pages/JuniorCollegePage';
import { TalentSearchPage } from '@shared/pages/TalentSearchPage';
import { ScienceAcademyPage } from '@shared/pages/ScienceAcademyPage';
import { ComputerInstitutePage } from '@shared/pages/ComputerInstitutePage';
import { SportsAcademyPage } from '@shared/pages/SportsAcademyPage';
import { CoursesPage } from '@shared/pages/CoursesPage';
import { CourseDetailsPage } from '@shared/pages/CourseDetailsPage';
import { GalleryPage } from '@shared/pages/GalleryPage';
import { VideosPage } from '@shared/pages/VideosPage';
import { NoticesPage } from '@shared/pages/NoticesPage';
import { ContactPage } from '@shared/pages/ContactPage';
import { AdmissionEnquiryPage } from '@shared/pages/AdmissionEnquiryPage';
import { CampusVisitPage } from '@shared/pages/CampusVisitPage';
import { StaffPage } from '@shared/pages/StaffPage';

export const AppRoutes = () => {
  return (
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
        <Route path="/admission-enquiry" element={<AdmissionEnquiryPage />} />
        <Route path="/campus-visit" element={<CampusVisitPage />} />
        <Route path="/schedule-visit" element={<CampusVisitPage />} />
      </Route>

      {/* Catch-all redirect to homepage */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
