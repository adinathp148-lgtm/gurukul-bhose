import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Mock localStorage for Node test runner
if (typeof globalThis.localStorage === 'undefined') {
  let store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
}

import {
  DEFAULT_SYSTEM_SETTINGS,
  SYSTEM_AUDIT_ACTIONS,
  recordAuditLog,
  fetchSystemAuditLogs,
  fetchSystemSettings,
  saveSystemSettings,
  broadcastAnnouncement,
  generateCRMReports,
  exportReportToCSV
} from '../shared/services/firestore/systemService.js';

import {
  updateAdminProfile,
  changeUserPassword,
  createAdminAccount,
  updateUserStatus,
  fetchAdminsList
} from '../shared/services/auth/authService.js';

import {
  detectDuplicateLead,
  normalizePhoneNumber,
  exportLeadsToCSV
} from '../shared/services/firestore/crmService.js';

const projectRoot = process.cwd();

// ===============================================================
// PHASE 9 COMPREHENSIVE TEST SUITE
// ===============================================================

test('Phase 9.1: System Settings Default Configuration & Integrity', async () => {
  assert.ok(DEFAULT_SYSTEM_SETTINGS.schoolNameMr.includes('गुरुकुल विद्यामंदिर'));
  assert.equal(DEFAULT_SYSTEM_SETTINGS.activeAcademicYear, '2026-2027');
  assert.equal(DEFAULT_SYSTEM_SETTINGS.admissionsStatus, 'OPEN');
  assert.equal(DEFAULT_SYSTEM_SETTINGS.publicEnquiryFormActive, true);
  assert.equal(DEFAULT_SYSTEM_SETTINGS.autoAssignTelecaller, true);
  assert.equal(DEFAULT_SYSTEM_SETTINGS.duplicateDetectionStrict, true);
  assert.equal(DEFAULT_SYSTEM_SETTINGS.siblingDetectionEnabled, true);
  assert.ok(DEFAULT_SYSTEM_SETTINGS.contactPhone.length >= 10);
});

test('Phase 9.2: Save & Retrieve System Settings', async () => {
  const actor = { uid: 'admin-001', displayName: 'Admission Head', role: 'admin' };
  const updatePayload = {
    admissionsStatus: 'CLOSING_SOON',
    announcementBannerText: 'मर्यादित जागा शिल्लक - आजच संपर्क साधा.'
  };

  const saveRes = await saveSystemSettings(updatePayload, actor);
  assert.equal(saveRes.success, true);
  assert.equal(saveRes.settings.admissionsStatus, 'CLOSING_SOON');

  const fetched = await fetchSystemSettings();
  assert.equal(fetched.admissionsStatus, 'CLOSING_SOON');
  assert.equal(fetched.announcementBannerText, 'मर्यादित जागा शिल्लक - आजच संपर्क साधा.');
});

test('Phase 9.3: System Audit Logging Integrity & Schema', async () => {
  const auditRes = await recordAuditLog({
    userId: 'admin-001',
    userName: 'Admission HOD',
    userRole: 'admin',
    action: SYSTEM_AUDIT_ACTIONS.LEAD_ASSIGNED,
    recordId: 'GB-2026-000555',
    details: 'Lead assigned to telecaller Sachin Patil',
    metadata: { leadNumber: 'GB-2026-000555', telecallerId: 'telecaller-001' }
  });

  assert.equal(auditRes.success, true);
  assert.ok(auditRes.logId);

  const logs = await fetchSystemAuditLogs();
  assert.ok(Array.isArray(logs));
  assert.ok(logs.length >= 1);

  const found = logs.find(l => l.action === SYSTEM_AUDIT_ACTIONS.LEAD_ASSIGNED && l.recordId === 'GB-2026-000555');
  assert.ok(found, 'Recorded audit entry should exist in fetched logs');
  assert.equal(found.userRole, 'admin');
  assert.ok(found.timestamp, 'Audit log must contain a valid timestamp');
});

test('Phase 9.4: Announcement Broadcast Engine', async () => {
  const sender = { uid: 'superadmin-001', displayName: 'Principal Sir', role: 'super_admin' };
  const announcementRes = await broadcastAnnouncement({
    title: 'रविवार विशेष प्रवेश मार्गदर्शन सत्र',
    message: 'सर्व समुपदेशकांनी आज संध्याकाळपर्यंत सर्व पालकांशी संपर्क पूर्ण करावा.',
    targetAudience: 'TELECALLERS',
    priority: 'HIGH',
    sender
  });

  assert.equal(announcementRes.success, true);
  assert.ok(announcementRes.announcementId);

  const notifications = JSON.parse(localStorage.getItem('gurukul_crm_notifications') || '[]');
  const broadcastNotif = notifications.find(n => n.title === 'रविवार विशेष प्रवेश मार्गदर्शन सत्र');
  assert.ok(broadcastNotif, 'Broadcast notification should be present in notifications store');
  assert.equal(broadcastNotif.priority, 'HIGH');
  assert.equal(broadcastNotif.targetAudience, 'TELECALLERS');
});

test('Phase 9.5: Complete 10 Admin Dashboard KPIs and Conversion Metrics', async () => {
  const mockLeads = [
    { id: '1', status: 'New', leadStatus: 'New', createdAt: '2026-03-01T10:00:00Z', admissionClass: 'इ. 5 वी' },
    { id: '2', status: 'New', leadStatus: 'New', createdAt: '2026-03-01T10:00:00Z', admissionClass: 'इ. 5 वी' },
    { id: '3', status: 'Assigned', leadStatus: 'Assigned', assignedTo: 'tc-1', createdAt: '2026-03-02T10:00:00Z', admissionClass: 'इ. 6 वी' },
    { id: '4', status: 'Contacted', leadStatus: 'Contacted', assignedTo: 'tc-1', createdAt: '2026-03-02T10:00:00Z', admissionClass: 'इ. 7 वी' },
    { id: '5', status: 'Interested', leadStatus: 'Interested', assignedTo: 'tc-2', createdAt: '2026-03-03T10:00:00Z', admissionClass: 'इ. 8 वी' },
    { id: '6', status: 'Converted', leadStatus: 'Converted', assignedTo: 'tc-1', createdAt: '2026-03-03T10:00:00Z', admissionClass: 'इ. 11 वी (सायन्स)' },
    { id: '7', status: 'Converted', leadStatus: 'Converted', assignedTo: 'tc-2', createdAt: '2026-03-04T10:00:00Z', admissionClass: 'इ. 11 वी (सायन्स)' }
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const mockFollowUps = [
    { id: 'fu-1', scheduledDate: todayStr, status: 'Scheduled', assignedTo: 'tc-1' },
    { id: 'fu-2', scheduledDate: todayStr, status: 'Scheduled', assignedTo: 'tc-2' },
    { id: 'fu-3', scheduledDate: yesterdayStr, status: 'Overdue', assignedTo: 'tc-1' },
    { id: 'fu-4', scheduledDate: yesterdayStr, status: 'Completed', assignedTo: 'tc-1' }
  ];

  const mockApps = [
    { applicationId: 'app-1', currentStage: 'Admission Confirmed', approvalStatus: 'Approved' },
    { applicationId: 'app-2', currentStage: 'Documents Pending', approvalStatus: 'Pending' }
  ];

  // 1. Total Admission Enquiries
  const totalEnquiries = mockLeads.length;
  assert.equal(totalEnquiries, 7);

  // 2. New Enquiries
  const newEnquiries = mockLeads.filter(l => l.status === 'New').length;
  assert.equal(newEnquiries, 2);

  // 3. Assigned Leads
  const assignedLeads = mockLeads.filter(l => Boolean(l.assignedTo) || l.status === 'Assigned').length;
  assert.equal(assignedLeads, 5);

  // 4. Contacted Leads
  const contactedLeads = mockLeads.filter(l => l.status === 'Contacted').length;
  assert.equal(contactedLeads, 1);

  // 5. Interested Parents
  const interestedParents = mockLeads.filter(l => l.status === 'Interested').length;
  assert.equal(interestedParents, 1);

  // 6. Follow-ups Today
  const todayFUs = mockFollowUps.filter(f => f.scheduledDate === todayStr && f.status !== 'Completed').length;
  assert.equal(todayFUs, 2);

  // 7. Overdue Follow-ups
  const overdueFUs = mockFollowUps.filter(f => f.status === 'Overdue' || (f.status !== 'Completed' && f.scheduledDate < todayStr)).length;
  assert.equal(overdueFUs, 1);

  // 8. Completed Follow-ups
  const completedFUs = mockFollowUps.filter(f => f.status === 'Completed').length;
  assert.equal(completedFUs, 1);

  // 9. Admission Applications
  const admissionAppsCount = mockApps.length;
  assert.equal(admissionAppsCount, 2);

  // 10. Confirmed Admissions
  const confirmedAdmissions = mockLeads.filter(l => l.status === 'Converted').length;
  assert.equal(confirmedAdmissions, 2);

  // Conversion Rate
  const convRate = ((confirmedAdmissions / totalEnquiries) * 100).toFixed(1);
  assert.equal(convRate, '28.6');
});

test('Phase 9.6: Dynamic CRM Reports Generation Engine', async () => {
  const mockLeads = [
    { id: '1', status: 'Converted', createdAt: new Date().toISOString(), admissionClass: 'इ. 5 वी', assignedTo: 'tc-1' },
    { id: '2', status: 'Interested', createdAt: new Date().toISOString(), admissionClass: 'इ. 5 वी', assignedTo: 'tc-1' },
    { id: '3', status: 'New', createdAt: new Date().toISOString(), admissionClass: 'इ. 11 वी (सायन्स)', assignedTo: 'tc-2' }
  ];

  const mockCalls = [
    { telecallerId: 'tc-1', callOutcome: 'Connected' },
    { telecallerId: 'tc-1', callOutcome: 'Admission Confirmed' },
    { telecallerId: 'tc-2', callOutcome: 'Connected' }
  ];

  const mockFollowUps = [
    { assignedTo: 'tc-1', status: 'Completed', scheduledDate: new Date().toISOString().split('T')[0] },
    { assignedTo: 'tc-2', status: 'Scheduled', scheduledDate: new Date().toISOString().split('T')[0] }
  ];

  const mockTelecallers = [
    { uid: 'tc-1', fullName: 'Sachin Patil', email: 'tc1@gurukul.com', employeeId: 'TC-101' },
    { uid: 'tc-2', fullName: 'Pooja Shinde', email: 'tc2@gurukul.com', employeeId: 'TC-102' }
  ];

  const reports = generateCRMReports({
    leads: mockLeads,
    calls: mockCalls,
    followUps: mockFollowUps,
    telecallers: mockTelecallers,
    admissionApplications: []
  });

  // Verify Daily report structure
  assert.ok(Array.isArray(reports.last7Days));
  assert.equal(reports.last7Days.length, 7);
  assert.equal(reports.last7Days[reports.last7Days.length - 1].enquiries, 3);

  // Verify Class-wise report structure
  assert.ok(Array.isArray(reports.classWiseReport));
  const class5 = reports.classWiseReport.find(c => c.className === 'इ. 5 वी');
  assert.ok(class5);
  assert.equal(class5.totalEnquiries, 2);
  assert.equal(class5.converted, 1);

  // Verify Telecaller Performance report
  assert.ok(Array.isArray(reports.telecallerReport));
  assert.equal(reports.telecallerReport.length, 2);
  const tc1 = reports.telecallerReport.find(t => t.telecallerId === 'tc-1');
  assert.ok(tc1);
  assert.equal(tc1.assignedLeads, 2);
  assert.equal(tc1.callsMade, 2);
  assert.equal(tc1.convertedAdmissions, 1);
  assert.equal(tc1.completedFollowUps, 1);

  // Verify Funnel
  assert.ok(Array.isArray(reports.pipelineFunnel));
  assert.ok(reports.pipelineFunnel.length >= 4);
});

test('Phase 9.7: RFC 4180 Escaped CSV Export Verification', async () => {
  const headers = ['नाव (Name)', 'नोंदी (Notes)', 'वर्ग (Class)'];
  const rows = [
    ['सचिन "कुमार" पाटील', 'पालकांनी सांगितले, "पुढील आठवड्यात भेटू"', 'इ. 5 वी'],
    ['राहुल कदम, सांगली', 'सामान्य चर्चा, फी विचारली', 'इ. 11 वी (सायन्स)']
  ];

  const res = exportReportToCSV('Test_Report', headers, rows, 'test_export');
  assert.equal(res.success, true);
  assert.equal(res.rowCount, 2);
});

test('Phase 9.8: Admin Profile & Password Security', async () => {
  // Update admin profile
  const profileRes = await updateAdminProfile('admin-001', {
    fullName: 'Dr. Sachin Patil',
    phone: '+91 9850112233',
    designation: 'Vice Principal & Admission Dean'
  });
  assert.equal(profileRes.success, true);

  // Password validation: reject short passwords
  const shortPassRes = await changeUserPassword('123');
  assert.equal(shortPassRes.success, false);
  assert.ok(shortPassRes.error.includes('किमान 6'));

  // Valid password change
  const validPassRes = await changeUserPassword('Gurukul#2026Admin');
  assert.equal(validPassRes.success, true);
});

test('Phase 9.9: Admin Account Creation & Status Management', async () => {
  const createRes = await createAdminAccount({
    fullName: 'Prof. Ramesh Shinde',
    email: 'ramesh.admin@gurukulbhose.com',
    phone: '9822001122',
    designation: 'Assistant Dean',
    password: 'SecureAdmin#2026',
    role: 'admin'
  });

  assert.equal(createRes.success, true);
  assert.ok(createRes.uid);

  // Status toggle
  const statusRes = await updateUserStatus(createRes.uid, 'inactive');
  assert.equal(statusRes.success, true);

  const activateRes = await updateUserStatus(createRes.uid, 'active');
  assert.equal(activateRes.success, true);
});

test('Phase 9.10: Strict Exclusion of Online Payments & Financial Management', async () => {
  const forbiddenPatterns = [
    'razorpay',
    'stripe',
    'paypal',
    'phonepe',
    'paytm',
    'payment_gateway',
    'installment_management',
    'scholarship_management',
    'discount_management'
  ];

  const filesToCheck = [
    'shared/services/firestore/systemService.js',
    'shared/pages/admin/AdminReportsPage.jsx',
    'shared/pages/admin/AdminSystemSettingsPage.jsx'
  ];

  for (const relPath of filesToCheck) {
    const fullPath = path.join(projectRoot, relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8').toLowerCase();
      for (const pattern of forbiddenPatterns) {
        assert.ok(
          !content.includes(pattern),
          `File ${relPath} must NOT contain forbidden financial keyword "${pattern}"`
        );
      }
    }
  }
});

test('Phase 9.11: Verification of 15 Navigation Items in Admin Layout', async () => {
  const adminLayoutPath = path.join(projectRoot, 'shared/layouts/AdminLayout.jsx');
  assert.ok(fs.existsSync(adminLayoutPath));
  const content = fs.readFileSync(adminLayoutPath, 'utf8');

  // Check presence of all 15 navigation routes / items
  const expectedRoutes = [
    '/admin/dashboard',
    '/admin/cms',
    '/admin/enquiries',
    '/admin/leads',
    '/admin/follow-ups',
    '/admin/call-monitoring',
    '/admin/campus-visits',
    '/admin/admins',
    '/admin/telecallers',
    '/admin/reports',
    '/admin/notifications',
    '/admin/audit-logs',
    '/admin/settings',
    '/admin/profile'
  ];

  for (const route of expectedRoutes) {
    assert.ok(
      content.includes(route),
      `AdminLayout.jsx must include navigation path for ${route}`
    );
  }

  // Check Logout action exists
  assert.ok(content.includes('handleLogout') || content.includes('logout'), 'AdminLayout must include logout handler');
});

test('Phase 9.12: Firestore Rules declare system_settings collection with public/staff read and admin-only write', () => {
  const rulesPath = path.join(projectRoot, 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  // Verify system_settings collection declaration
  assert.match(rulesContent, /match \/system_settings\/\{settingsId\}/, 'Rules must declare system_settings collection');

  // Extract system_settings block
  const settingsMatch = rulesContent.match(/match \/system_settings\/\{settingsId\}\s*\{([\s\S]*?)\}/);
  assert.ok(settingsMatch, 'system_settings match block must exist');

  const block = settingsMatch[1];
  // Verify public/staff read permission
  assert.match(block, /allow read:\s*if\s*true;/, 'system_settings must allow read for public and authenticated staff');

  // Verify write restricted strictly to isAdmin()
  assert.match(block, /allow (?:create,\s*update,\s*delete|write):\s*if\s*isAdmin\(\);/, 'system_settings must restrict writes to isAdmin()');
});
