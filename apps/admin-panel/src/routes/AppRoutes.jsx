import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@shared/layouts/AdminLayout';
import { ProtectedRoute } from '@shared/routes/ProtectedRoute';

// Admin Login Portals
import { AdminLoginPage } from '@shared/pages/auth/AdminLoginPage';
import { SuperAdminLoginPage } from '@shared/pages/auth/SuperAdminLoginPage';

// Admin & CRM Workspace Pages
import { DashboardPage } from '@shared/pages/admin/DashboardPage';
import { SuperAdminDashboardPage } from '@shared/pages/admin/SuperAdminDashboardPage';
import { TelecallersListPage } from '@shared/pages/admin/TelecallersListPage';
import { CreateTelecallerPage } from '@shared/pages/admin/CreateTelecallerPage';
import { TelecallerDetailsPage } from '@shared/pages/admin/TelecallerDetailsPage';
import { LeadsPage } from '@shared/pages/admin/LeadsPage';
import { LeadDetailsPage } from '@shared/pages/admin/LeadDetailsPage';
import { FollowUpsPage } from '@shared/pages/admin/FollowUpsPage';
import { AdmissionsPage } from '@shared/pages/admin/AdmissionsPage';
import { ParentCommunicationPage } from '@shared/pages/admin/ParentCommunicationPage';
import { MetaIntegrationPage } from '@shared/pages/admin/MetaIntegrationPage';

// Complete CMS Modules
import { CMSDashboardPage } from '@shared/pages/admin/cms/CMSDashboardPage';
import { CMSHomepagePage } from '@shared/pages/admin/cms/CMSHomepagePage';
import { CMSPagesPage } from '@shared/pages/admin/cms/CMSPagesPage';
import { CMSAboutPage } from '@shared/pages/admin/cms/CMSAboutPage';
import { CMSProgramsPage } from '@shared/pages/admin/cms/CMSProgramsPage';
import { CMSCoursesPage } from '@shared/pages/admin/cms/CMSCoursesPage';
import { CMSGalleryPage } from '@shared/pages/admin/cms/CMSGalleryPage';
import { CMSVideosPage } from '@shared/pages/admin/cms/CMSVideosPage';
import { CMSNoticesPage } from '@shared/pages/admin/cms/CMSNoticesPage';
import { CMSFacilitiesPage } from '@shared/pages/admin/cms/CMSFacilitiesPage';
import { CMSContactPage } from '@shared/pages/admin/cms/CMSContactPage';
import { CMSSEOPage } from '@shared/pages/admin/cms/CMSSEOPage';
import { CMSSettingsPage } from '@shared/pages/admin/cms/CMSSettingsPage';
import { CMSActivityLogsPage } from '@shared/pages/admin/cms/CMSActivityLogsPage';

// Telecaller Dedicated Workspace Pages
import { TelecallerLayout } from '@shared/layouts/TelecallerLayout';
import { TelecallerDashboardPage } from '@shared/pages/telecaller/TelecallerDashboardPage';
import { TelecallerLeadsPage } from '@shared/pages/telecaller/TelecallerLeadsPage';
import { TelecallerLeadDetailsPage } from '@shared/pages/telecaller/TelecallerLeadDetailsPage';
import { TelecallerFollowUpsPage } from '@shared/pages/telecaller/TelecallerFollowUpsPage';
import { TelecallerProfilePage } from '@shared/pages/telecaller/TelecallerProfilePage';
import { TelecallerChangePasswordPage } from '@shared/pages/telecaller/TelecallerChangePasswordPage';
import { TelecallerLoginPage } from '@shared/pages/auth/TelecallerLoginPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Authentication Portals */}
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
      <Route path="/telecaller/login" element={<TelecallerLoginPage />} />

      {/* 2. Protected Telecaller Dedicated Workspace (Accessible to Telecallers, Admin & Super Admin) */}
      <Route
        path="/telecaller"
        element={
          <ProtectedRoute allowedRoles={['telecaller', 'admin', 'super_admin', 'superadmin']}>
            <TelecallerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/telecaller/dashboard" replace />} />
        <Route path="dashboard" element={<TelecallerDashboardPage />} />
        <Route path="leads" element={<TelecallerLeadsPage />} />
        <Route path="leads/:leadId" element={<TelecallerLeadDetailsPage />} />
        <Route path="follow-ups" element={<TelecallerFollowUpsPage />} />
        <Route path="history" element={<TelecallerFollowUpsPage />} />
        <Route path="profile" element={<TelecallerProfilePage />} />
        <Route path="change-password" element={<TelecallerChangePasswordPage />} />
      </Route>

      {/* 2. Protected Admin & Super Admin Workspace */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'superadmin', 'admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Main Dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />

        {/* Telecaller Staff Management */}
        <Route path="/admin/telecallers" element={<TelecallersListPage />} />
        <Route path="/admin/telecallers/create" element={<CreateTelecallerPage />} />
        <Route path="/admin/telecallers/:id" element={<TelecallerDetailsPage />} />
        <Route path="/telecallers" element={<Navigate to="/admin/telecallers" replace />} />
        <Route path="/telecallers/create" element={<Navigate to="/admin/telecallers/create" replace />} />
        <Route path="/telecallers/:id" element={<TelecallerDetailsPage />} />

        {/* CRM Pipeline & Admission Register */}
        <Route path="/admin/leads" element={<LeadsPage />} />
        <Route path="/admin/leads/:leadId" element={<LeadDetailsPage />} />
        <Route path="/admin/follow-ups" element={<FollowUpsPage />} />
        <Route path="/admin/admissions" element={<AdmissionsPage />} />
        <Route path="/admin/parent-communication" element={<ParentCommunicationPage />} />
        <Route path="/admin/meta-integration" element={<MetaIntegrationPage />} />
        <Route path="/leads" element={<Navigate to="/admin/leads" replace />} />
        <Route path="/leads/:leadId" element={<LeadDetailsPage />} />
        <Route path="/follow-ups" element={<Navigate to="/admin/follow-ups" replace />} />
        <Route path="/admissions" element={<Navigate to="/admin/admissions" replace />} />
        <Route path="/parent-communication" element={<Navigate to="/admin/parent-communication" replace />} />
        <Route path="/meta-integration" element={<Navigate to="/admin/meta-integration" replace />} />

        {/* Website CMS Modules */}
        <Route path="/admin/cms" element={<CMSDashboardPage />} />
        <Route path="/admin/cms/homepage" element={<CMSHomepagePage />} />
        <Route path="/admin/cms/pages" element={<CMSPagesPage />} />
        <Route path="/admin/cms/about" element={<CMSAboutPage />} />
        <Route path="/admin/cms/programs" element={<CMSProgramsPage />} />
        <Route path="/admin/cms/courses" element={<CMSCoursesPage />} />
        <Route path="/admin/cms/gallery" element={<CMSGalleryPage />} />
        <Route path="/admin/cms/videos" element={<CMSVideosPage />} />
        <Route path="/admin/cms/notices" element={<CMSNoticesPage />} />
        <Route path="/admin/cms/facilities" element={<CMSFacilitiesPage />} />
        <Route path="/admin/cms/contact" element={<CMSContactPage />} />
        <Route path="/admin/cms/seo" element={<CMSSEOPage />} />
        <Route path="/admin/cms/settings" element={<CMSSettingsPage />} />
        <Route path="/admin/cms/activity-logs" element={<CMSActivityLogsPage />} />
        
        {/* Short aliases for CMS */}
        <Route path="/cms" element={<Navigate to="/admin/cms" replace />} />
        <Route path="/cms/*" element={<Navigate to="/admin/cms" replace />} />

        {/* Super Admin Master Dashboard */}
        <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboardPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
