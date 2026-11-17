import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { TelecallerLayout } from '../layouts/TelecallerLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Website Pages
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { VidyamandirPage } from '../pages/VidyamandirPage';
import { JuniorCollegePage } from '../pages/JuniorCollegePage';
import { TalentSearchPage } from '../pages/TalentSearchPage';
import { ScienceAcademyPage } from '../pages/ScienceAcademyPage';
import { ComputerInstitutePage } from '../pages/ComputerInstitutePage';
import { SportsAcademyPage } from '../pages/SportsAcademyPage';
import { CoursesPage } from '../pages/CoursesPage';
import { CourseDetailsPage } from '../pages/CourseDetailsPage';
import { GalleryPage } from '../pages/GalleryPage';
import { VideosPage } from '../pages/VideosPage';
import { NoticesPage } from '../pages/NoticesPage';
import { ContactPage } from '../pages/ContactPage';
import { AdmissionEnquiryPage } from '../pages/AdmissionEnquiryPage';
import { CampusVisitPage } from '../pages/CampusVisitPage';
import { StaffPage } from '../pages/StaffPage';

// Dedicated Auth Login Pages
import { SuperAdminLoginPage } from '../pages/auth/SuperAdminLoginPage';
import { AdminLoginPage } from '../pages/auth/AdminLoginPage';
import { TelecallerLoginPage } from '../pages/auth/TelecallerLoginPage';

// Admin / Super Admin Pages
import { DashboardPage } from '../pages/admin/DashboardPage';
import { SuperAdminDashboardPage } from '../pages/admin/SuperAdminDashboardPage';
import { TelecallersListPage } from '../pages/admin/TelecallersListPage';
import { CreateTelecallerPage } from '../pages/admin/CreateTelecallerPage';
import { TelecallerDetailsPage } from '../pages/admin/TelecallerDetailsPage';
import { LeadsPage } from '../pages/admin/LeadsPage';
import { LeadDetailsPage } from '../pages/admin/LeadDetailsPage';
import { FollowUpsPage } from '../pages/admin/FollowUpsPage';
import { AdmissionsPage } from '../pages/admin/AdmissionsPage';
import { ParentCommunicationPage } from '../pages/admin/ParentCommunicationPage';
import { MetaIntegrationPage } from '../pages/admin/MetaIntegrationPage';
import { CallMonitoringPage } from '../pages/admin/CallMonitoringPage';
import { TelecallerPerformancePage } from '../pages/admin/TelecallerPerformancePage';
import { AdminVisitsPage } from '../pages/admin/AdminVisitsPage';
import { AdminVisitDeskPage } from '../pages/admin/AdminVisitDeskPage';
import { AdminVisitCalendarPage } from '../pages/admin/AdminVisitCalendarPage';
import { AdminVisitSettingsPage } from '../pages/admin/AdminVisitSettingsPage';

// Phase 9 Dedicated Admin Workspace Pages
import { AdminEnquiriesPage } from '../pages/admin/AdminEnquiriesPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminNotificationsPage } from '../pages/admin/AdminNotificationsPage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';
import { AdminSystemSettingsPage } from '../pages/admin/AdminSystemSettingsPage';
import { AdminProfilePage } from '../pages/admin/AdminProfilePage';
import { AdminManagementPage } from '../pages/admin/AdminManagementPage';

// Website CMS Modules (Phase 4)
import { CMSDashboardPage } from '../pages/admin/cms/CMSDashboardPage';
import { CMSHomepagePage } from '../pages/admin/cms/CMSHomepagePage';
import { CMSPagesPage } from '../pages/admin/cms/CMSPagesPage';
import { CMSAboutPage } from '../pages/admin/cms/CMSAboutPage';
import { CMSProgramsPage } from '../pages/admin/cms/CMSProgramsPage';
import { CMSCoursesPage } from '../pages/admin/cms/CMSCoursesPage';
import { CMSGalleryPage } from '../pages/admin/cms/CMSGalleryPage';
import { CMSVideosPage } from '../pages/admin/cms/CMSVideosPage';
import { CMSNoticesPage } from '../pages/admin/cms/CMSNoticesPage';
import { CMSFacilitiesPage } from '../pages/admin/cms/CMSFacilitiesPage';
import { CMSContactPage } from '../pages/admin/cms/CMSContactPage';
import { CMSSEOPage } from '../pages/admin/cms/CMSSEOPage';
import { CMSSettingsPage } from '../pages/admin/cms/CMSSettingsPage';
import { CMSActivityLogsPage } from '../pages/admin/cms/CMSActivityLogsPage';

// Telecaller Workspace Pages
import { TelecallerDashboardPage } from '../pages/telecaller/TelecallerDashboardPage';
import { TelecallerProfilePage } from '../pages/telecaller/TelecallerProfilePage';
import { TelecallerLeadsPage } from '../pages/telecaller/TelecallerLeadsPage';
import { TelecallerLeadDetailsPage } from '../pages/telecaller/TelecallerLeadDetailsPage';
import { TelecallerFollowUpsPage } from '../pages/telecaller/TelecallerFollowUpsPage';
import { TelecallerCallsPage } from '../pages/telecaller/TelecallerCallsPage';
import { TelecallerCalendarPage } from '../pages/telecaller/TelecallerCalendarPage';
import { TelecallerVisitsPage } from '../pages/telecaller/TelecallerVisitsPage';
import { TelecallerChangePasswordPage } from '../pages/telecaller/TelecallerChangePasswordPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public School Website Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/vidyamandir" element={<VidyamandirPage />} />
        <Route path="/gurukul-vidyamandir" element={<VidyamandirPage />} />
        <Route path="/junior-college" element={<JuniorCollegePage />} />
        <Route path="/gurukul-junior-college" element={<JuniorCollegePage />} />
        <Route path="/talent-search-academy" element={<TalentSearchPage />} />
        <Route path="/science-academy" element={<ScienceAcademyPage />} />
        <Route path="/computer-institute" element={<ComputerInstitutePage />} />
        <Route path="/sports-academy" element={<SportsAcademyPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/notices" element={<NoticesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/admission-enquiry" element={<AdmissionEnquiryPage />} />
        <Route path="/campus-visit" element={<CampusVisitPage />} />
        <Route path="/schedule-visit" element={<CampusVisitPage />} />
      </Route>

      {/* 2. Public Authentication Portals */}
      <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/telecaller/login" element={<TelecallerLoginPage />} />

      {/* 3. Protected Admin & Super Admin Workspace */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'superadmin', 'admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Telecaller Management */}
        <Route path="telecallers" element={<TelecallersListPage />} />
        <Route path="telecallers/create" element={<CreateTelecallerPage />} />
        <Route path="telecallers/:id" element={<TelecallerDetailsPage />} />
        <Route path="users" element={<Navigate to="/admin/telecallers" replace />} />

        {/* Phase 9 & CRM Modules */}
        <Route path="enquiries" element={<AdminEnquiriesPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="leads/:leadId" element={<LeadDetailsPage />} />
        <Route path="call-monitoring" element={<CallMonitoringPage />} />
        <Route path="telecaller-performance" element={<TelecallerPerformancePage />} />
        <Route path="follow-ups" element={<FollowUpsPage />} />
        <Route path="admissions" element={<AdmissionsPage />} />
        <Route path="parent-communication" element={<ParentCommunicationPage />} />
        
        {/* Phase 7 Campus Visits */}
        <Route path="campus-visits" element={<AdminVisitsPage />} />
        <Route path="visit-desk" element={<AdminVisitDeskPage />} />
        <Route path="visit-calendar" element={<AdminVisitCalendarPage />} />
        <Route path="visit-settings" element={<AdminVisitSettingsPage />} />

        {/* Phase 9 Administrative Control Modules */}
        <Route path="admins" element={<AdminManagementPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="settings" element={<AdminSystemSettingsPage />} />
        <Route path="profile" element={<AdminProfilePage />} />

        {/* Website CMS Management Modules (Phase 4) */}
        <Route path="cms" element={<CMSDashboardPage />} />
        <Route path="cms/homepage" element={<CMSHomepagePage />} />
        <Route path="cms/pages" element={<CMSPagesPage />} />
        <Route path="cms/about" element={<CMSAboutPage />} />
        <Route path="cms/programs" element={<CMSProgramsPage />} />
        <Route path="cms/courses" element={<CMSCoursesPage />} />
        <Route path="cms/gallery" element={<CMSGalleryPage />} />
        <Route path="cms/videos" element={<CMSVideosPage />} />
        <Route path="cms/notices" element={<CMSNoticesPage />} />
        <Route path="cms/facilities" element={<CMSFacilitiesPage />} />
        <Route path="cms/contact" element={<CMSContactPage />} />
        <Route path="cms/seo" element={<CMSSEOPage />} />
        <Route path="cms/settings" element={<CMSSettingsPage />} />
        <Route path="cms/activity-logs" element={<CMSActivityLogsPage />} />
        
        <Route path="meta-integration" element={<MetaIntegrationPage />} />
      </Route>

      {/* 4. Protected Super Admin Master Workspace */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'superadmin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboardPage />} />
      </Route>

      {/* 5. Protected Telecaller Dedicated Workspace */}
      <Route
        path="/telecaller"
        element={
          <ProtectedRoute allowedRoles={['telecaller', 'super_admin', 'superadmin', 'admin']}>
            <TelecallerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/telecaller/dashboard" replace />} />
        <Route path="dashboard" element={<TelecallerDashboardPage />} />
        <Route path="leads" element={<TelecallerLeadsPage />} />
        <Route path="leads/:leadId" element={<TelecallerLeadDetailsPage />} />
        <Route path="calls" element={<TelecallerCallsPage />} />
        <Route path="calendar" element={<TelecallerCalendarPage />} />
        <Route path="visits" element={<TelecallerVisitsPage />} />
        <Route path="follow-ups" element={<TelecallerFollowUpsPage />} />
        <Route path="history" element={<TelecallerFollowUpsPage />} />
        <Route path="profile" element={<TelecallerProfilePage />} />
        <Route path="change-password" element={<TelecallerChangePasswordPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
