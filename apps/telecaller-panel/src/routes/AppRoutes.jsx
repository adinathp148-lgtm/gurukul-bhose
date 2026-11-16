import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TelecallerLayout } from '@shared/layouts/TelecallerLayout';
import { ProtectedRoute } from '@shared/routes/ProtectedRoute';

// Telecaller Dedicated Pages
import { TelecallerLoginPage } from '@shared/pages/auth/TelecallerLoginPage';
import { TelecallerDashboardPage } from '@shared/pages/telecaller/TelecallerDashboardPage';
import { TelecallerLeadsPage } from '@shared/pages/telecaller/TelecallerLeadsPage';
import { TelecallerFollowUpsPage } from '@shared/pages/telecaller/TelecallerFollowUpsPage';
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

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Telecaller Dedicated Login */}
      <Route path="/login" element={<TelecallerLoginPage />} />

      {/* 2. Protected Telecaller Workspace */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['telecaller', 'super_admin', 'superadmin', 'admin']}>
            <TelecallerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<TelecallerDashboardPage />} />
        <Route path="/leads" element={<TelecallerLeadsPage />} />
        <Route path="/follow-ups" element={<TelecallerFollowUpsPage />} />
        <Route path="/history" element={<TelecallerFollowUpsPage />} />
        <Route path="/notifications" element={<TelecallerNotificationsPage />} />
        <Route path="/profile" element={<TelecallerProfilePage />} />
        <Route path="/change-password" element={<TelecallerChangePasswordPage />} />
      </Route>

      {/* Security Fallback: Block any direct CMS/Admin URL attempts and redirect */}
      <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/cms/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
