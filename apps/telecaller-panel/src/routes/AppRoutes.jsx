import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TelecallerLayout } from '@shared/layouts/TelecallerLayout';
import { ProtectedRoute } from '@shared/routes/ProtectedRoute';

// Telecaller Dedicated Pages
import { TelecallerLoginPage } from '@shared/pages/auth/TelecallerLoginPage';
import { TelecallerRegisterPage } from '@shared/pages/auth/TelecallerRegisterPage';
import { TelecallerDashboardPage } from '@shared/pages/telecaller/TelecallerDashboardPage';
import { TelecallerLeadsPage } from '@shared/pages/telecaller/TelecallerLeadsPage';
import { TelecallerLeadDetailsPage } from '@shared/pages/telecaller/TelecallerLeadDetailsPage';
import { TelecallerFollowUpsPage } from '@shared/pages/telecaller/TelecallerFollowUpsPage';
import { TelecallerCallsPage } from '@shared/pages/telecaller/TelecallerCallsPage';
import { TelecallerCalendarPage } from '@shared/pages/telecaller/TelecallerCalendarPage';
import { TelecallerVisitsPage } from '@shared/pages/telecaller/TelecallerVisitsPage';
import { TelecallerProfilePage } from '@shared/pages/telecaller/TelecallerProfilePage';
import { TelecallerChangePasswordPage } from '@shared/pages/telecaller/TelecallerChangePasswordPage';

// Simple Notifications View
const TelecallerNotificationsPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">सूचना व अलर्ट्स (Notifications)</h2>
        <p className="text-xs text-slate-500 mt-1">नवीन नियुक्त झालेल्या लीड्स व दैनिक फॉलो-अप स्मरणपत्रे.</p>
        <div className="mt-6 space-y-3">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
            <div>
              <p className="text-xs font-bold text-emerald-900">कॉलिंग सिस्टम अद्ययावत</p>
              <p className="text-xs text-emerald-700 mt-0.5">आपले कॉलिंग कार्यक्षेत्र सक्रिय आहे. आजचे सर्व फॉलो-अप वेळेत पूर्ण करा.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
            <div>
              <p className="text-xs font-bold text-blue-900">सुरक्षित प्रवेश सूचना</p>
              <p className="text-xs text-blue-700 mt-0.5">समुपदेशकांना केवळ स्वतःकडे नेमून दिलेल्या विद्यार्थ्यांच्या लीड्स पाहण्याची परवानगी आहे.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Safe Cross-App Exit: Escapes telecaller-panel to the actual Admin Panel
const CrossAppAdminRedirect = () => {
  React.useEffect(() => {
    window.location.replace('/admin/dashboard');
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gurukul-saffron-500"></div>
    </div>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Telecaller Dedicated Login & Registration */}
      <Route path="/login" element={<TelecallerLoginPage />} />
      <Route path="/register" element={<TelecallerRegisterPage />} />
      <Route path="/telecaller/login" element={<TelecallerLoginPage />} />
      <Route path="/telecaller/register" element={<TelecallerRegisterPage />} />

      {/* 2. Protected Telecaller Workspace (Accessible to Telecallers, Admin & Super Admin) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['telecaller', 'admin', 'super_admin', 'superadmin']}>
            <TelecallerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<TelecallerDashboardPage />} />
        <Route path="/leads" element={<TelecallerLeadsPage />} />
        <Route path="/leads/:leadId" element={<TelecallerLeadDetailsPage />} />
        <Route path="/calls" element={<TelecallerCallsPage />} />
        <Route path="/calendar" element={<TelecallerCalendarPage />} />
        <Route path="/visits" element={<TelecallerVisitsPage />} />
        <Route path="/campus-visits" element={<Navigate to="/visits" replace />} />
        <Route path="/follow-ups" element={<TelecallerFollowUpsPage />} />
        <Route path="/history" element={<TelecallerFollowUpsPage />} />
        <Route path="/notifications" element={<TelecallerNotificationsPage />} />
        <Route path="/profile" element={<TelecallerProfilePage />} />
        <Route path="/change-password" element={<TelecallerChangePasswordPage />} />

        {/* Alias routes supporting /telecaller/* URLs to prevent any 404 or redirect bounce */}
        <Route path="/telecaller" element={<Navigate to="/dashboard" replace />} />
        <Route path="/telecaller/dashboard" element={<TelecallerDashboardPage />} />
        <Route path="/telecaller/leads" element={<TelecallerLeadsPage />} />
        <Route path="/telecaller/leads/:leadId" element={<TelecallerLeadDetailsPage />} />
        <Route path="/telecaller/calls" element={<TelecallerCallsPage />} />
        <Route path="/telecaller/calendar" element={<TelecallerCalendarPage />} />
        <Route path="/telecaller/visits" element={<TelecallerVisitsPage />} />
        <Route path="/telecaller/campus-visits" element={<Navigate to="/visits" replace />} />
        <Route path="/telecaller/follow-ups" element={<TelecallerFollowUpsPage />} />
        <Route path="/telecaller/history" element={<TelecallerFollowUpsPage />} />
        <Route path="/telecaller/notifications" element={<TelecallerNotificationsPage />} />
        <Route path="/telecaller/profile" element={<TelecallerProfilePage />} />
        <Route path="/telecaller/change-password" element={<TelecallerChangePasswordPage />} />
      </Route>

      {/* Security Fallback: Cleanly redirect any Admin/CMS attempts out to the Admin Panel */}
      <Route path="/admin/*" element={<CrossAppAdminRedirect />} />
      <Route path="/cms/*" element={<CrossAppAdminRedirect />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
