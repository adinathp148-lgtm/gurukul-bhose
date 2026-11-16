/**
 * Gurukul Bhose - Phase 9 System & Administration Service
 * Manages System Settings, Audit Logs, Announcements, and Dynamic CRM Reports
 */

import {
  db,
  functions,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  isConfigured,
  httpsCallable
} from '../../firebase/config.js';

// ===============================================================
// 1. DEFAULT SYSTEM SETTINGS CONFIGURATION
// ===============================================================

export const DEFAULT_SYSTEM_SETTINGS = {
  // School Information
  schoolNameMr: 'गुरुकुल विद्यामंदिर व ज्युनिअर कॉलेज, भोसे',
  schoolNameEn: 'Gurukul Vidyamandir & Junior College, Bhose',
  schoolPattern: 'सैनिक पॅटर्न निवासी (Sainik Pattern Residential)',
  affiliationNumber: 'MAH-EDU-MIR-2024-889',
  address: 'भोसे - मिरज रोड, ता. मिरज, जि. सांगली, महाराष्ट्र - 416410',
  contactPhone: '+91 9850449800',
  contactWhatsApp: '+91 7020260968',
  contactEmail: 'admissions@gurukulbhose.com',
  officialWebsite: 'https://gurukulbhose.com',

  // Academic Configuration
  activeAcademicYear: '2026-2027',
  upcomingAcademicYear: '2027-2028',
  admissionsStatus: 'OPEN', // OPEN, CLOSING_SOON, CLOSED
  admissionCapacityPerClass: 60,

  // Admission Enquiry Settings
  publicEnquiryFormActive: true,
  autoAssignTelecaller: true,
  autoAssignAlgorithm: 'ROUND_ROBIN', // ROUND_ROBIN, WORKLOAD_BALANCED, MANUAL
  duplicateDetectionStrict: true,
  siblingDetectionEnabled: true,
  notifyAdminOnNewEnquiry: true,
  adminAlertEmails: 'admissions@gurukulbhose.com, principal@gurukulbhose.com',

  // CRM Configuration
  maxDailyFollowUpsPerTelecaller: 25,
  defaultFollowUpTime: '10:00',
  defaultReminderIntervalHours: 24,
  overdueGracePeriodHours: 2,
  allowTelecallerManualLeadCreate: false,

  // Notification Preferences
  enableInAppNotifications: true,
  enableWhatsAppAlerts: true,
  enableEmailAlerts: false,
  dailySummaryTime: '18:00',

  // Website Settings
  maintenanceMode: false,
  showAnnouncementBanner: true,
  announcementBannerText: 'सत्र 2026-2027 प्रवेश नोंदणी सुरू! इ. 5 वी ते 12 वी सैनिक पॅटर्न निवासी गुरुकुल. मर्यादित जागा.',
  emergencyContact: '+91 9850449800'
};

// ===============================================================
// 2. AUDIT LOGGING UTILITY
// ===============================================================

export const SYSTEM_AUDIT_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LEAD_CREATED: 'LEAD_CREATED',
  LEAD_ASSIGNED: 'LEAD_ASSIGNED',
  LEAD_REASSIGNED: 'LEAD_REASSIGNED',
  LEAD_STATUS_CHANGED: 'LEAD_STATUS_CHANGED',
  DUPLICATE_REVIEWED: 'DUPLICATE_REVIEWED',
  CALL_RECORDED: 'CALL_RECORDED',
  FOLLOW_UP_SCHEDULED: 'FOLLOW_UP_SCHEDULED',
  FOLLOW_UP_COMPLETED: 'FOLLOW_UP_COMPLETED',
  VISIT_REQUESTED: 'VISIT_REQUESTED',
  VISIT_APPROVED: 'VISIT_APPROVED',
  VISIT_REJECTED: 'VISIT_REJECTED',
  VISIT_CHECKED_IN: 'VISIT_CHECKED_IN',
  ADMISSION_STAGE_UPDATED: 'ADMISSION_STAGE_UPDATED',
  TELECALLER_CREATED: 'TELECALLER_CREATED',
  TELECALLER_STATUS_CHANGED: 'TELECALLER_STATUS_CHANGED',
  ADMIN_CREATED: 'ADMIN_CREATED',
  ADMIN_STATUS_CHANGED: 'ADMIN_STATUS_CHANGED',
  CMS_CONTENT_CHANGED: 'CMS_CONTENT_CHANGED',
  SYSTEM_SETTINGS_UPDATED: 'SYSTEM_SETTINGS_UPDATED',
  REPORT_EXPORTED: 'REPORT_EXPORTED',
  ANNOUNCEMENT_BROADCAST: 'ANNOUNCEMENT_BROADCAST'
};

/**
 * Record an administrative activity to audit_logs
 */
export const recordAuditLog = async ({
  userId,
  userRole = 'admin',
  userName = 'Admin',
  action,
  recordId = null,
  details = '',
  metadata = {}
}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    userId: userId || 'SYSTEM',
    userRole: userRole || 'admin',
    userName: userName || 'Admin',
    action: action || 'ADMIN_ACTION',
    recordId: recordId || null,
    details: details || '',
    metadata: metadata || {},
    timestamp,
    createdAt: timestamp
  };

  // 1. Try Cloud Function or Direct Firestore
  if (isConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'audit_logs'), {
        ...logEntry,
        timestamp: serverTimestamp()
      });
      return { success: true, logId: docRef.id };
    } catch (err) {
      console.warn('[Audit] Could not save audit log to Firestore:', err.message);
    }
  }

  // 2. Local Storage Fallback
  try {
    const existing = JSON.parse(localStorage.getItem('gurukul_audit_logs') || '[]');
    const newEntry = { id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, ...logEntry };
    existing.unshift(newEntry);
    localStorage.setItem('gurukul_audit_logs', JSON.stringify(existing.slice(0, 500)));
    return { success: true, logId: newEntry.id, local: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

/**
 * Fetch Audit Logs with filtering
 */
export const fetchSystemAuditLogs = async (filters = {}) => {
  if (isConfigured && db) {
    try {
      const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(150));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          timestamp: d.data().timestamp?.toDate ? d.data().timestamp.toDate().toISOString() : (d.data().timestamp || d.data().createdAt)
        }));
      }
    } catch (err) {
      console.warn('[Audit] Firestore fetch notice, using fallback:', err.message);
    }
  }

  // Local fallback
  const localLogs = JSON.parse(localStorage.getItem('gurukul_audit_logs') || '[]');
  if (localLogs.length > 0) return localLogs;

  // Seed baseline logs if empty
  const defaultLogs = [
    {
      id: 'log-seed-1',
      userId: 'superadmin-001',
      userName: 'Principal Sir (Super Admin)',
      userRole: 'superadmin',
      action: SYSTEM_AUDIT_ACTIONS.LOGIN,
      recordId: null,
      details: 'Super Admin logged into Gurukul CRM Workspace',
      metadata: { ip: '127.0.0.1' },
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'log-seed-2',
      userId: 'admin-001',
      userName: 'Admission HOD (Admin)',
      userRole: 'admin',
      action: SYSTEM_AUDIT_ACTIONS.LEAD_ASSIGNED,
      recordId: 'GB-2026-000101',
      details: 'Assigned lead Rohan Shinde to Sachin Patil (TC-101)',
      metadata: { telecallerId: 'telecaller-001', leadNumber: 'GB-2026-000101' },
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'log-seed-3',
      userId: 'admin-001',
      userName: 'Admission HOD (Admin)',
      userRole: 'admin',
      action: SYSTEM_AUDIT_ACTIONS.SYSTEM_SETTINGS_UPDATED,
      recordId: 'system_settings',
      details: 'Updated active academic year to 2026-2027 and opened admissions',
      metadata: { activeAcademicYear: '2026-2027', admissionsStatus: 'OPEN' },
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ];
  localStorage.setItem('gurukul_audit_logs', JSON.stringify(defaultLogs));
  return defaultLogs;
};

// ===============================================================
// 3. SYSTEM SETTINGS MANAGEMENT
// ===============================================================

export const fetchSystemSettings = async () => {
  if (isConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'system_settings', 'global_config'));
      if (snap.exists()) {
        return { ...DEFAULT_SYSTEM_SETTINGS, ...snap.data() };
      }
      // Check legacy website_settings
      const legSnap = await getDoc(doc(db, 'website_settings', 'general'));
      if (legSnap.exists()) {
        return { ...DEFAULT_SYSTEM_SETTINGS, ...legSnap.data() };
      }
    } catch (err) {
      console.warn('[Settings] Firestore fetch notice, using fallback:', err.message);
    }
  }

  const local = localStorage.getItem('gurukul_system_settings');
  return local ? { ...DEFAULT_SYSTEM_SETTINGS, ...JSON.parse(local) } : DEFAULT_SYSTEM_SETTINGS;
};

export const saveSystemSettings = async (newSettings, actor) => {
  const merged = { ...DEFAULT_SYSTEM_SETTINGS, ...newSettings, updatedAt: new Date().toISOString() };

  // 1. Try Cloud Function
  if (isConfigured && functions) {
    try {
      const fn = httpsCallable(functions, 'updateSystemSettings');
      const res = await fn({ settings: merged });
      if (res.data?.success) {
        localStorage.setItem('gurukul_system_settings', JSON.stringify(merged));
        return { success: true, settings: merged };
      }
    } catch (e) {
      console.warn('[Settings] Cloud Function notice, fallback to direct Firestore:', e.message);
    }
  }

  // 2. Direct Firestore
  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'system_settings', 'global_config'), merged, { merge: true });
      await setDoc(doc(db, 'website_settings', 'general'), merged, { merge: true }).catch(() => {});
    } catch (err) {
      console.warn('[Settings] Could not save to Firestore directly:', err.message);
    }
  }

  // 3. Local fallback & Audit log
  localStorage.setItem('gurukul_system_settings', JSON.stringify(merged));
  await recordAuditLog({
    userId: actor?.uid || actor?.id || 'ADMIN',
    userName: actor?.displayName || actor?.fullName || 'Admin',
    userRole: actor?.role || 'admin',
    action: SYSTEM_AUDIT_ACTIONS.SYSTEM_SETTINGS_UPDATED,
    recordId: 'global_config',
    details: 'System settings updated by administrator.'
  });

  return { success: true, settings: merged };
};

// ===============================================================
// 4. ANNOUNCEMENT & BROADCAST MANAGEMENT
// ===============================================================

export const broadcastAnnouncement = async ({
  title,
  message,
  targetAudience = 'ALL', // ALL, TELECALLERS, ADMINS
  priority = 'NORMAL', // NORMAL, HIGH, URGENT
  sender
}) => {
  const timestamp = new Date().toISOString();
  const announcementDoc = {
    title,
    message,
    targetAudience,
    priority,
    senderId: sender?.uid || 'ADMIN',
    senderName: sender?.displayName || sender?.fullName || 'Administrator',
    category: 'announcement',
    readBy: [],
    createdAt: timestamp
  };

  // 1. Try Cloud Function
  if (isConfigured && functions) {
    try {
      const fn = httpsCallable(functions, 'broadcastAnnouncement');
      const res = await fn({ title, message, targetAudience, priority });
      return res.data;
    } catch (e) {
      console.warn('[Announcement] Cloud Function notice, fallback to direct Firestore:', e.message);
    }
  }

  // 2. Direct Firestore
  if (isConfigured && db) {
    try {
      const notifRef = await addDoc(collection(db, 'notifications'), {
        ...announcementDoc,
        recipientId: targetAudience === 'TELECALLERS' ? 'ROLE_TELECALLER' : 'ALL',
        read: false,
        timestamp: serverTimestamp()
      });

      await recordAuditLog({
        userId: sender?.uid || 'ADMIN',
        userName: sender?.displayName || 'Admin',
        userRole: sender?.role || 'admin',
        action: SYSTEM_AUDIT_ACTIONS.ANNOUNCEMENT_BROADCAST,
        recordId: notifRef.id,
        details: `Broadcasted announcement "${title}" to ${targetAudience}.`
      });

      return { success: true, announcementId: notifRef.id };
    } catch (err) {
      console.warn('[Announcement] Direct Firestore error:', err.message);
    }
  }

  // 3. Local fallback
  const stored = JSON.parse(localStorage.getItem('gurukul_crm_notifications') || '[]');
  const localNotif = {
    id: `notif-${Date.now()}`,
    ...announcementDoc,
    recipientId: 'ALL',
    read: false
  };
  stored.unshift(localNotif);
  localStorage.setItem('gurukul_crm_notifications', JSON.stringify(stored));

  await recordAuditLog({
    userId: sender?.uid || 'ADMIN',
    userName: sender?.displayName || 'Admin',
    userRole: sender?.role || 'admin',
    action: SYSTEM_AUDIT_ACTIONS.ANNOUNCEMENT_BROADCAST,
    recordId: localNotif.id,
    details: `Local broadcast: "${title}"`
  });

  return { success: true, announcementId: localNotif.id, local: true };
};

// ===============================================================
// 5. DYNAMIC REPORTS ENGINE (STRICTLY NON-FINANCIAL)
// ===============================================================

export const generateCRMReports = ({
  leads = [],
  calls = [],
  followUps = [],
  telecallers = [],
  admissionApplications = []
}) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Daily Enquiries Report (Last 7 Days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('mr-IN', { weekday: 'short' });
    const count = leads.filter(l => {
      const createdStr = l.createdAt ? (l.createdAt.split('T')[0]) : '';
      return createdStr === dateStr;
    }).length;
    last7Days.push({ date: dateStr, day: dayName, enquiries: count });
  }

  // 2. Weekly Enquiries Report (Last 4 Weeks)
  const last4Weeks = [];
  for (let w = 3; w >= 0; w--) {
    const start = new Date();
    start.setDate(start.getDate() - (w * 7 + 6));
    const end = new Date();
    end.setDate(end.getDate() - (w * 7));
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    const count = leads.filter(l => {
      const c = l.createdAt ? l.createdAt.split('T')[0] : '';
      return c >= startStr && c <= endStr;
    }).length;
    last4Weeks.push({
      weekLabel: `आठवडा ${4 - w} (${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1})`,
      enquiries: count
    });
  }

  // 3. Monthly Enquiries Report (Last 6 Months)
  const last6Months = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleDateString('mr-IN', { month: 'long', year: 'numeric' });
    const count = leads.filter(l => {
      const c = l.createdAt ? l.createdAt.slice(0, 7) : '';
      return c === yearMonth;
    }).length;
    const converted = leads.filter(l => {
      const c = l.createdAt ? l.createdAt.slice(0, 7) : '';
      return c === yearMonth && (l.status === 'Converted' || l.leadStatus === 'Converted');
    }).length;
    last6Months.push({
      monthKey: yearMonth,
      monthName,
      totalEnquiries: count,
      convertedAdmissions: converted,
      conversionRate: count > 0 ? `${((converted / count) * 100).toFixed(1)}%` : '0%'
    });
  }

  // 4. Class-wise Enquiries Report
  const classBreakdown = {};
  const standardClasses = [
    'इ. 5 वी',
    'इ. 6 वी',
    'इ. 7 वी',
    'इ. 8 वी',
    'इ. 9 वी',
    'इ. 10 वी',
    'इ. 11 वी (सायन्स)',
    'इ. 12 वी (सायन्स)',
    'इ. 11 वी (आर्ट्स)',
    'इ. 12 वी (आर्ट्स)'
  ];

  standardClasses.forEach(c => {
    classBreakdown[c] = { total: 0, converted: 0, interested: 0 };
  });

  leads.forEach(l => {
    const cls = l.admissionClass || l.applyingClass || 'इ. 5 वी';
    if (!classBreakdown[cls]) {
      classBreakdown[cls] = { total: 0, converted: 0, interested: 0 };
    }
    classBreakdown[cls].total += 1;
    if (l.status === 'Converted' || l.leadStatus === 'Converted') classBreakdown[cls].converted += 1;
    if (l.status === 'Interested' || l.leadStatus === 'Interested') classBreakdown[cls].interested += 1;
  });

  const classWiseReport = Object.keys(classBreakdown).map(cls => ({
    className: cls,
    totalEnquiries: classBreakdown[cls].total,
    interested: classBreakdown[cls].interested,
    converted: classBreakdown[cls].converted,
    conversionRate: classBreakdown[cls].total > 0
      ? `${((classBreakdown[cls].converted / classBreakdown[cls].total) * 100).toFixed(1)}%`
      : '0.0%'
  }));

  // 5. Telecaller-wise Performance Report
  const telecallerReport = telecallers.map(t => {
    const uid = t.uid || t.id;
    const myLeads = leads.filter(l => l.assignedTo === uid || l.assignedTelecallerId === uid);
    const myCalls = calls.filter(c => c.telecallerId === uid);
    const myFollowUps = followUps.filter(f => f.assignedTo === uid);

    const converted = myLeads.filter(l => l.status === 'Converted' || l.leadStatus === 'Converted').length;
    const interested = myLeads.filter(l => l.status === 'Interested' || l.leadStatus === 'Interested').length;
    const completedFU = myFollowUps.filter(f => f.status === 'Completed').length;
    const overdueFU = myFollowUps.filter(f => f.status === 'Overdue' || (f.status !== 'Completed' && f.scheduledDate && f.scheduledDate < todayStr)).length;

    const convRate = myLeads.length > 0 ? ((converted / myLeads.length) * 100).toFixed(1) : '0.0';
    const totalFU = completedFU + overdueFU;
    const fuCompletionRate = totalFU > 0 ? ((completedFU / totalFU) * 100).toFixed(1) : (completedFU > 0 ? '100.0' : '0.0');

    return {
      telecallerId: uid,
      telecallerName: t.fullName || t.displayName || 'Counselor',
      employeeId: t.employeeId || 'N/A',
      email: t.email || '',
      phone: t.phone || '',
      assignedLeads: myLeads.length,
      callsMade: myCalls.length,
      interestedLeads: interested,
      convertedAdmissions: converted,
      conversionRate: `${convRate}%`,
      completedFollowUps: completedFU,
      overdueFollowUps: overdueFU,
      followUpCompletionRate: `${fuCompletionRate}%`
    };
  });

  // 6. Lead Conversion Pipeline Funnel
  const pipelineFunnel = [
    { stage: 'एकूण नोंदणी (Total Enquiries)', count: leads.length, percent: 100 },
    { stage: 'संपर्क साधला (Contacted)', count: leads.filter(l => ['Contacted', 'Interested', 'Follow-up', 'Visited', 'School Visit Planned', 'Converted'].includes(l.status || l.leadStatus)).length },
    { stage: 'इच्छुक पालक (Interested)', count: leads.filter(l => ['Interested', 'Visited', 'School Visit Planned', 'Converted'].includes(l.status || l.leadStatus)).length },
    { stage: 'शाळा भेट (Campus Visit)', count: leads.filter(l => ['Visited', 'School Visit Planned', 'Converted'].includes(l.status || l.leadStatus)).length },
    { stage: 'प्रवेश निश्चित (Converted)', count: leads.filter(l => ['Converted', 'Admitted'].includes(l.status || l.leadStatus)).length }
  ].map((item, idx, arr) => {
    const base = arr[0].count || 1;
    return {
      ...item,
      percent: Math.round((item.count / base) * 100)
    };
  });

  // 7. Admission Applications Stage Breakdown
  const admissionStageCounts = {};
  admissionApplications.forEach(a => {
    const stg = a.currentStage || 'Application Started';
    admissionStageCounts[stg] = (admissionStageCounts[stg] || 0) + 1;
  });

  // 8. Follow-up Status Completion Summary
  const completedCount = followUps.filter(f => f.status === 'Completed').length;
  const overdueCount = followUps.filter(f => f.status === 'Overdue' || (f.status !== 'Completed' && f.scheduledDate && f.scheduledDate < todayStr)).length;
  const scheduledCount = followUps.filter(f => f.status === 'Scheduled' || f.status === 'Due').length;
  const totalFollowUps = followUps.length;

  return {
    last7Days,
    last4Weeks,
    last6Months,
    classWiseReport,
    telecallerReport,
    pipelineFunnel,
    admissionStageCounts,
    followUpSummary: {
      total: totalFollowUps,
      completed: completedCount,
      overdue: overdueCount,
      scheduled: scheduledCount,
      completionRate: (completedCount + overdueCount) > 0
        ? `${Math.round((completedCount / (completedCount + overdueCount)) * 100)}%`
        : '100%'
    }
  };
};

/**
 * Universal CSV Export Helper for any generated report
 */
export const exportReportToCSV = (reportTitle, headers, rows, filename) => {
  const escape = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const csvRows = [
    headers.map(h => escape(h)).join(','),
    ...rows.map(row => row.map(cell => escape(cell)).join(','))
  ];

  const csvContent = '\uFEFF' + csvRows.join('\r\n');

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename || 'Gurukul_Bhose_Report'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return { success: true, rowCount: rows.length };
};
