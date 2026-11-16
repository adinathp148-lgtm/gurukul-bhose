/**
 * Gurukul Bhose - Phase 5 CRM & Admission Enquiry Service
 * Comprehensive Firestore, Cloud Functions, and Client Service for Lead Management
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
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  isConfigured,
  httpsCallable
} from '../../firebase/config.js';

// ===============================================================
// 1. LEAD STATUSES & TRANSITION CONFIGURATION
// ===============================================================

export const LEAD_STATUS_CONFIG = {
  'New': {
    id: 'New',
    labelMr: 'नवीन नोंदणी (New)',
    labelEn: 'New Enquiry',
    badgeColor: 'blue',
    bgColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'नवीन आलेली चौकशी, अद्याप प्राथमिक संपर्क किंवा नेमणूक बाकी'
  },
  'Assigned': {
    id: 'Assigned',
    labelMr: 'नेमणूक झालेली (Assigned)',
    labelEn: 'Assigned to Telecaller',
    badgeColor: 'purple',
    bgColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'प्रवेश समुपदेशकाकडे सोपवलेली नोंद'
  },
  'Contacted': {
    id: 'Contacted',
    labelMr: 'संपर्क साधला (Contacted)',
    labelEn: 'Contacted',
    badgeColor: 'sky',
    bgColor: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'पालकांशी फोन/WhatsApp द्वारे प्राथमिक चर्चा पूर्ण'
  },
  'Interested': {
    id: 'Interested',
    labelMr: 'इच्छुक (Interested)',
    labelEn: 'Interested',
    badgeColor: 'amber',
    bgColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'पालकांनी प्रवेशाबाबत सकारात्मकता दर्शवली आहे'
  },
  'Follow-up': {
    id: 'Follow-up',
    labelMr: 'फॉलो-अप आवश्यक (Follow-up)',
    labelEn: 'Pending Follow-up',
    badgeColor: 'orange',
    bgColor: 'bg-orange-50 text-orange-700 border-orange-200',
    description: 'ठरलेल्या तारखेला पुनर्विचार किंवा संपर्क साधणे आवश्यक'
  },
  'Visited': {
    id: 'Visited',
    labelMr: 'शाळेस भेट दिली (Visited)',
    labelEn: 'Campus Visited',
    badgeColor: 'indigo',
    bgColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'पालक व विद्यार्थ्याने गुरुकुल भोसे कॅम्पसला प्रत्यक्ष भेट दिली'
  },
  'Converted': {
    id: 'Converted',
    labelMr: 'प्रवेश निश्चित (Converted)',
    labelEn: 'Admitted / Converted',
    badgeColor: 'emerald',
    bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'शाळेत प्रत्यक्ष प्रवेश निश्चित झाला व प्रक्रिया पूर्ण झाली'
  },
  'Not Interested': {
    id: 'Not Interested',
    labelMr: 'अनिच्छुक (Not Interested)',
    labelEn: 'Not Interested',
    badgeColor: 'slate',
    bgColor: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'पालकांनी या शैक्षणिक वर्षासाठी प्रवेशास नकार दिला'
  },
  'Lost': {
    id: 'Lost',
    labelMr: 'प्रवेश गमावला (Lost)',
    labelEn: 'Lost Enquiry',
    badgeColor: 'rose',
    bgColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'इतर संस्थेत प्रवेश घेतला किंवा वारंवार संपर्क होऊ शकला नाही'
  }
};

export const LEAD_STATUS_LIST = Object.keys(LEAD_STATUS_CONFIG);

export const PERMITTED_STATUS_TRANSITIONS = {
  'New': ['Assigned', 'Contacted', 'Not Interested'],
  'Assigned': ['Contacted', 'Follow-up', 'Interested', 'Not Interested', 'Lost'],
  'Contacted': ['Interested', 'Follow-up', 'Visited', 'Not Interested', 'Lost'],
  'Interested': ['Follow-up', 'Visited', 'Converted', 'Not Interested', 'Lost'],
  'Follow-up': ['Contacted', 'Interested', 'Visited', 'Converted', 'Not Interested', 'Lost'],
  'Visited': ['Interested', 'Follow-up', 'Converted', 'Not Interested', 'Lost'],
  'Not Interested': ['Contacted', 'Interested', 'Lost'],
  'Converted': ['Converted'],
  'Lost': ['Contacted', 'New']
};

export const isValidStatusTransition = (fromStatus, toStatus, userRole = 'telecaller') => {
  if (['super_admin', 'superadmin', 'admin'].includes(userRole?.toLowerCase())) {
    return true; // Admins can transition across any status
  }
  if (!fromStatus) return true;
  if (fromStatus === toStatus) return true;
  const allowed = PERMITTED_STATUS_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
};

// ===============================================================
// 2. NORMALIZATION & SANITIZATION HELPERS
// ===============================================================

export const normalizePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
};

export const sanitizeText = (str, maxLen = 500) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '').slice(0, maxLen);
};

// Concurrency-safe local sequential Lead Number fallback for offline/demo simulation
let localLeadCounter = 100;
export const generateLocalLeadNumber = (year = '2026') => {
  localLeadCounter += 1;
  return `GB-${year}-${String(localLeadCounter).padStart(6, '0')}`;
};

// ===============================================================
// 3. DUPLICATE DETECTION LOGIC
// ===============================================================

/**
 * Compares incoming enquiry against existing leads.
 * Handles multiple siblings correctly: If parent mobile is the same but student name or class differs,
 * it is flagged as a genuine Sibling enquiry, NOT a duplicate!
 */
export const detectDuplicateLead = (existingLeads = [], newEnquiry = {}) => {
  const normMobile = normalizePhoneNumber(newEnquiry.mobileNumber || newEnquiry.mobile);
  const studentName = (newEnquiry.studentName || '').trim().toLowerCase();
  const admissionClass = (newEnquiry.admissionClass || '').trim().toLowerCase();
  const academicYear = (newEnquiry.academicYear || '2026-2027').trim();

  if (!normMobile) return { isDuplicate: false };

  // Match records by normalized mobile
  const matchingByMobile = existingLeads.filter(l => {
    const lMobile = normalizePhoneNumber(l.normalizedMobile || l.mobileNumber || l.mobile);
    return lMobile && lMobile === normMobile;
  });

  if (matchingByMobile.length === 0) {
    return { isDuplicate: false };
  }

  // Check if any matching mobile also matches student name
  for (const match of matchingByMobile) {
    const matchName = (match.studentName || '').trim().toLowerCase();
    const matchClass = (match.admissionClass || '').trim().toLowerCase();
    const matchYear = (match.academicYear || '').trim();

    if (matchName === studentName && (!matchClass || matchClass === admissionClass)) {
      return {
        isDuplicate: true,
        matchedLeadId: match.id || match.leadNumber,
        matchedLeadNumber: match.leadNumber || match.id,
        matchedLead: match,
        reason: 'पालकांचा मोबाईल, विद्यार्थ्याचे नाव व प्रवेश इयत्ता पूर्वनोंदणीशी तंतोतंत जुळत आहे.'
      };
    }
  }

  // Same mobile, different student name -> Genuine Sibling Enquiry!
  return {
    isDuplicate: false,
    isSibling: true,
    siblingOf: matchingByMobile[0].studentName,
    matchedLead: matchingByMobile[0],
    message: `कुटुंबातील पूर्वनोंदणी सापडली (${matchingByMobile[0].studentName}). हा एकाच कुटुंबातील दुसरा विद्यार्थी अर्ज आहे.`
  };
};

// ===============================================================
// 4. CLOUD FUNCTIONS WRAPPERS (With Graceful Fallback)
// ===============================================================

/**
 * Submit Public Admission Enquiry via Cloud Function
 */
export const submitPublicAdmissionEnquiry = async (formData) => {
  // If backend Cloud Functions are active
  if (isConfigured && functions) {
    try {
      const submitFn = httpsCallable(functions, 'submitAdmissionEnquiry');
      const result = await submitFn(formData);
      return result.data;
    } catch (err) {
      console.warn('[CRM] submitAdmissionEnquiry Cloud Function returned error, trying fallback:', err);
      // If permission-denied or unavailable, continue to local Firestore fallback below
    }
  }

  // Local/Direct Firestore Fallback
  const normMobile = normalizePhoneNumber(formData.mobileNumber);
  const year = (formData.academicYear || '2026-2027').split('-')[0] || '2026';
  const leadNumber = generateLocalLeadNumber(year);
  const now = new Date().toISOString();

  const newDoc = {
    ...formData,
    leadNumber,
    mobile: formData.mobileNumber,
    normalizedMobile: normMobile,
    whatsapp: formData.whatsappNumber || normMobile,
    source: 'Website',
    status: 'New',
    leadStatus: 'New',
    assignedTo: null,
    assignedTelecallerId: null,
    assignedTelecallerName: null,
    createdBy: 'WEBSITE',
    createdAt: now,
    updatedAt: now,
    lastContactedAt: null,
    nextFollowupAt: null,
    consent: true,
    whatsappOptIn: Boolean(formData.whatsappOptIn ?? true),
    isDuplicate: false
  };

  try {
    if (isConfigured && db) {
      const ref = await addDoc(collection(db, 'enquiries'), newDoc);
      await setDoc(doc(db, 'leads', ref.id), { ...newDoc, id: ref.id });
      await addDoc(collection(db, 'lead_activities'), {
        leadId: ref.id,
        leadNumber,
        activityType: 'Enquiry Created',
        description: `Admission enquiry submitted via website for ${formData.studentName} (${formData.admissionClass})`,
        previousValue: null,
        newValue: 'New',
        performedBy: 'SYSTEM',
        performedByRole: 'public',
        createdAt: now
      });
      await addDoc(collection(db, 'notifications'), {
        recipientId: 'ADMIN',
        title: 'नवीन प्रवेश अर्ज प्राप्त',
        message: `${formData.studentName} (${formData.admissionClass}) - ${leadNumber}`,
        category: 'enquiry',
        leadId: ref.id,
        leadNumber,
        read: false,
        createdAt: now
      });
    }
  } catch (directErr) {
    console.warn('[CRM] Direct firestore save fallback warning:', directErr);
  }

  return {
    success: true,
    leadNumber,
    message: "Thank you! Your admission enquiry has been submitted successfully. Our admission team will contact you soon."
  };
};

/**
 * Create Manual Enquiry (Admin / Staff)
 */
export const createManualEnquiry = async (formData, caller) => {
  if (isConfigured && functions) {
    try {
      const fn = httpsCallable(functions, 'createManualEnquiry');
      const res = await fn(formData);
      return res.data;
    } catch (err) {
      console.warn('[CRM] createManualEnquiry function error:', err);
    }
  }

  // Fallback
  const normMobile = normalizePhoneNumber(formData.mobileNumber);
  const year = (formData.academicYear || '2026-2027').split('-')[0] || '2026';
  const leadNumber = generateLocalLeadNumber(year);
  const now = new Date().toISOString();

  const payload = {
    ...formData,
    leadNumber,
    mobile: formData.mobileNumber,
    normalizedMobile: normMobile,
    whatsapp: formData.whatsappNumber || normMobile,
    source: formData.source || 'Manual Entry',
    status: formData.assignedTo ? 'Assigned' : 'New',
    leadStatus: formData.assignedTo ? 'Assigned' : 'New',
    createdBy: caller?.uid || 'ADMIN',
    createdAt: now,
    updatedAt: now
  };

  if (isConfigured && db) {
    const ref = await addDoc(collection(db, 'enquiries'), payload);
    await setDoc(doc(db, 'leads', ref.id), { ...payload, id: ref.id });
    await addDoc(collection(db, 'lead_activities'), {
      leadId: ref.id,
      leadNumber,
      activityType: 'Enquiry Created',
      description: `Manual enquiry added by ${caller?.fullName || 'Admin'} (${payload.source})`,
      previousValue: null,
      newValue: payload.status,
      performedBy: caller?.uid || 'ADMIN',
      performedByRole: caller?.role || 'admin',
      createdAt: now
    });
    return { success: true, leadId: ref.id, leadNumber, message: 'Enquiry created successfully.' };
  }

  return { success: true, leadNumber, message: 'Enquiry created successfully.' };
};

/**
 * Assign Lead to Telecaller
 */
export const assignLeadToTelecaller = async ({ leadId, telecallerId, telecaller, caller, reason }) => {
  if (isConfigured && functions) {
    try {
      const fn = httpsCallable(functions, 'assignLeadToTelecaller');
      const res = await fn({ leadId, telecallerId, reason });
      return res.data;
    } catch (err) {
      console.warn('[CRM] assignLeadToTelecaller Cloud Function error, using direct Firestore:', err);
    }
  }

  // Direct Firestore mutation
  if (isConfigured && db) {
    const now = new Date().toISOString();
    const updatePayload = {
      assignedTo: telecallerId,
      assignedTelecallerId: telecallerId,
      assignedTelecallerName: telecaller?.fullName || telecaller?.displayName || 'Counselor',
      assignedTelecallerEmployeeId: telecaller?.employeeId || '',
      assignedAt: now,
      status: 'Assigned',
      leadStatus: 'Assigned',
      updatedAt: now
    };

    try {
      await updateDoc(doc(db, 'enquiries', leadId), updatePayload);
    } catch {}
    try {
      await setDoc(doc(db, 'leads', leadId), updatePayload, { merge: true });
    } catch {}

    await addDoc(collection(db, 'lead_assignments'), {
      leadId,
      telecallerId,
      telecallerName: telecaller?.fullName || 'Counselor',
      telecallerEmployeeId: telecaller?.employeeId || '',
      assignedBy: caller?.uid || 'ADMIN',
      assignedAt: now,
      assignmentReason: reason || 'Lead Allocation',
      assignmentStatus: 'active'
    });

    await addDoc(collection(db, 'lead_activities'), {
      leadId,
      activityType: 'Lead Assigned',
      description: `Lead assigned to ${telecaller?.fullName || 'Counselor'}`,
      previousValue: 'Unassigned',
      newValue: telecaller?.fullName || 'Counselor',
      performedBy: caller?.uid || 'ADMIN',
      performedByRole: caller?.role || 'admin',
      createdAt: now
    });

    await addDoc(collection(db, 'notifications'), {
      recipientId: telecallerId,
      title: 'नवीन लीड सोपवली (New Lead Assigned)',
      message: `आपल्याकडे नवीन प्रवेश नोंद सोपवण्यात आली आहे.`,
      category: 'assignment',
      leadId,
      read: false,
      createdAt: now
    });
  }

  return { success: true, message: `Lead assigned successfully to ${telecaller?.fullName || 'Telecaller'}.` };
};

/**
 * Bulk Assign Multiple Leads
 */
export const bulkAssignLeads = async ({ leadIds, telecallerId, telecaller, caller, reason }) => {
  if (isConfigured && functions) {
    try {
      const fn = httpsCallable(functions, 'bulkAssignLeads');
      const res = await fn({ leadIds, telecallerId, reason });
      return res.data;
    } catch (err) {
      console.warn('[CRM] bulkAssignLeads Cloud Function error, using direct loop:', err);
    }
  }

  let count = 0;
  for (const id of leadIds) {
    await assignLeadToTelecaller({ leadId: id, telecallerId, telecaller, caller, reason });
    count++;
  }

  return { success: true, assignedCount: count, message: `${count} leads assigned successfully.` };
};

/**
 * Update Lead Status & History
 */
export const updateLeadStatus = async ({ leadId, leadNumber, previousStatus, newStatus, reason, nextFollowupAt, notes, caller }) => {
  if (isConfigured && functions) {
    try {
      const fn = httpsCallable(functions, 'updateLeadStatus');
      const res = await fn({ leadId, newStatus, reason, nextFollowupAt, notes });
      return res.data;
    } catch (err) {
      console.warn('[CRM] updateLeadStatus Cloud Function error, using direct Firestore:', err);
    }
  }

  const now = new Date().toISOString();
  const updateData = {
    status: newStatus,
    leadStatus: newStatus,
    updatedAt: now,
    lastContactedAt: now
  };
  if (nextFollowupAt) updateData.nextFollowupAt = nextFollowupAt;
  if (notes) updateData.latestNote = sanitizeText(notes, 1000);

  if (isConfigured && db) {
    try { await updateDoc(doc(db, 'enquiries', leadId), updateData); } catch {}
    try { await setDoc(doc(db, 'leads', leadId), updateData, { merge: true }); } catch {}

    await addDoc(collection(db, 'lead_status_history'), {
      leadId,
      leadNumber: leadNumber || leadId,
      previousStatus: previousStatus || 'New',
      newStatus,
      changedBy: caller?.uid || 'SYSTEM',
      userRole: caller?.role || 'staff',
      changedAt: now,
      reason: reason || ''
    });

    await addDoc(collection(db, 'lead_activities'), {
      leadId,
      leadNumber: leadNumber || leadId,
      activityType: newStatus === 'Converted' ? 'Lead Converted' : 'Status Changed',
      description: `Status changed from ${previousStatus || 'New'} to ${newStatus}.${reason ? ` Reason: ${reason}` : ''}`,
      previousValue: previousStatus || 'New',
      newValue: newStatus,
      performedBy: caller?.uid || 'SYSTEM',
      performedByRole: caller?.role || 'staff',
      createdAt: now
    });
  }

  return { success: true, message: `Status updated to ${newStatus}.` };
};

/**
 * Add Call Attempt / Telecaller Notes
 */
export const recordCallAttempt = async ({ leadId, leadNumber, callOutcome, parentResponse, nextFollowupAt, statusChange, caller }) => {
  if (isConfigured && functions) {
    try {
      const fn = httpsCallable(functions, 'addLeadCallAttempt');
      const res = await fn({ leadId, callOutcome, parentResponse, nextFollowupAt, statusChange });
      return res.data;
    } catch (err) {
      console.warn('[CRM] addLeadCallAttempt Cloud Function error:', err);
    }
  }

  const now = new Date().toISOString();
  const updatePayload = {
    lastContactedAt: now,
    updatedAt: now
  };
  if (nextFollowupAt) updatePayload.nextFollowupAt = nextFollowupAt;
  if (statusChange) {
    updatePayload.status = statusChange;
    updatePayload.leadStatus = statusChange;
  }

  if (isConfigured && db) {
    try { await updateDoc(doc(db, 'enquiries', leadId), updatePayload); } catch {}
    try { await setDoc(doc(db, 'leads', leadId), updatePayload, { merge: true }); } catch {}

    await addDoc(collection(db, 'lead_activities'), {
      leadId,
      leadNumber: leadNumber || leadId,
      activityType: callOutcome.toLowerCase().includes('connected') ? 'Contact Successful' : 'Call Attempt',
      description: `Call outcome: ${callOutcome}.${parentResponse ? ` Notes: ${parentResponse}` : ''}${nextFollowupAt ? ` Next: ${nextFollowupAt}` : ''}`,
      previousValue: null,
      newValue: callOutcome,
      performedBy: caller?.uid || 'TELECALLER',
      performedByRole: caller?.role || 'telecaller',
      createdAt: now
    });
  }

  return { success: true, message: "Call attempt recorded successfully." };
};

/**
 * Review Duplicate Enquiry
 */
export const reviewDuplicate = async ({ leadId, duplicateId, action, notes, caller }) => {
  if (isConfigured && functions) {
    try {
      const fn = httpsCallable(functions, 'reviewDuplicateLead');
      const res = await fn({ leadId, duplicateId, action, notes });
      return res.data;
    } catch (err) {
      console.warn('[CRM] reviewDuplicateLead Cloud Function error:', err);
    }
  }

  const now = new Date().toISOString();
  if (isConfigured && db) {
    if (action === 'update_existing') {
      await updateDoc(doc(db, 'enquiries', leadId), {
        duplicateReviewStatus: 'resolved_updated',
        adminRemarks: notes || 'Merged notes to original record.',
        updatedAt: now
      });
    } else {
      await updateDoc(doc(db, 'enquiries', leadId), {
        isDuplicate: false,
        duplicateReviewStatus: 'resolved_new',
        adminRemarks: notes || 'Verified unique sibling enquiry by Admin.',
        updatedAt: now
      });
    }

    await addDoc(collection(db, 'lead_activities'), {
      leadId,
      activityType: 'Duplicate Reviewed',
      description: `Duplicate reviewed by Admin: ${action}. Notes: ${notes || 'N/A'}`,
      previousValue: 'Pending Review',
      newValue: action,
      performedBy: caller?.uid || 'ADMIN',
      performedByRole: caller?.role || 'admin',
      createdAt: now
    });
  }

  return { success: true, message: `Duplicate reviewed: ${action}.` };
};

// ===============================================================
// 5. CRM ANALYTICS & AGGREGATIONS
// ===============================================================

export const calculateCRMAnalytics = (enquiries = []) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Start of week (Monday)
  const dayOfWeek = now.getDay();
  const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  // Start of month
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let totalEnquiries = enquiries.length;
  let newLeads = 0;
  let assignedLeads = 0;
  let unassignedLeads = 0;
  let contactedLeads = 0;
  let interestedLeads = 0;
  let pendingFollowUps = 0;
  let visitedLeads = 0;
  let convertedLeads = 0;
  let lostLeads = 0;

  let enquiriesToday = 0;
  let enquiriesThisWeek = 0;
  let enquiriesThisMonth = 0;

  const sourceCounts = {
    'Website': 0,
    'Manual Entry': 0,
    'Phone Call': 0,
    'WhatsApp': 0,
    'Facebook Ads': 0,
    'Other': 0
  };

  const classCounts = {};
  const telecallerCounts = {};

  enquiries.forEach(lead => {
    const st = lead.status || lead.leadStatus || 'New';
    if (st === 'New') newLeads++;
    else if (st === 'Assigned') assignedLeads++;
    else if (st === 'Contacted') contactedLeads++;
    else if (st === 'Interested') interestedLeads++;
    else if (st === 'Follow-up') pendingFollowUps++;
    else if (st === 'Visited') visitedLeads++;
    else if (st === 'Converted') convertedLeads++;
    else if (st === 'Lost' || st === 'Not Interested') lostLeads++;

    const isAssigned = Boolean(lead.assignedTo || lead.assignedTelecallerId);
    if (!isAssigned && st !== 'Converted' && st !== 'Lost') {
      unassignedLeads++;
    }

    // Time-based
    if (lead.createdAt) {
      const createdDate = new Date(lead.createdAt?.toDate ? lead.createdAt.toDate() : lead.createdAt);
      if (!isNaN(createdDate)) {
        const dateStr = createdDate.toISOString().split('T')[0];
        if (dateStr === todayStr) enquiriesToday++;
        if (createdDate >= monday) enquiriesThisWeek++;
        if (createdDate >= firstOfMonth) enquiriesThisMonth++;
      }
    }

    // Source
    const src = lead.source || lead.leadSource || 'Website';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;

    // Class
    const cls = lead.admissionClass || 'इ. 5 वी';
    classCounts[cls] = (classCounts[cls] || 0) + 1;

    // Telecaller
    const tcName = lead.assignedTelecallerName || (lead.assignedTo ? 'Assigned' : 'Unassigned');
    telecallerCounts[tcName] = (telecallerCounts[tcName] || 0) + 1;
  });

  const conversionRate = totalEnquiries > 0 
    ? ((convertedLeads / totalEnquiries) * 100).toFixed(1)
    : '0.0';

  return {
    totalEnquiries,
    newLeads,
    assignedLeads,
    unassignedLeads,
    contactedLeads,
    interestedLeads,
    pendingFollowUps,
    visitedLeads,
    convertedLeads,
    lostLeads,
    enquiriesToday,
    enquiriesThisWeek,
    enquiriesThisMonth,
    conversionRate: `${conversionRate}%`,
    sourceCounts,
    classCounts,
    telecallerCounts
  };
};

// ===============================================================
// 6. CSV EXPORT UTILITY (RFC 4180 Escaping)
// ===============================================================

export const exportLeadsToCSV = (leads = [], actor) => {
  const headers = [
    'Lead Number',
    'Parent Name',
    'Student Name',
    'Mobile Number',
    'Admission Class',
    'Interested Course',
    'Academic Year',
    'Lead Source',
    'Assigned Telecaller',
    'Lead Status',
    'Created Date'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = leads.map(l => [
    escapeCSV(l.leadNumber || l.id || ''),
    escapeCSV(l.parentName || ''),
    escapeCSV(l.studentName || ''),
    escapeCSV(l.normalizedMobile || l.mobileNumber || l.mobile || ''),
    escapeCSV(l.admissionClass || ''),
    escapeCSV(l.course || ''),
    escapeCSV(l.academicYear || '2026-2027'),
    escapeCSV(l.source || l.leadSource || 'Website'),
    escapeCSV(l.assignedTelecallerName || 'Unassigned'),
    escapeCSV(l.status || l.leadStatus || 'New'),
    escapeCSV(l.createdAt ? new Date(l.createdAt?.toDate ? l.createdAt.toDate() : l.createdAt).toLocaleDateString('en-IN') : '')
  ]);

  const csvContent = '\uFEFF' + [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  // Trigger browser download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Gurukul_Bhose_Leads_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Audit log if db available
  if (isConfigured && db && actor) {
    addDoc(collection(db, 'audit_logs'), {
      actorId: actor.uid || 'ADMIN',
      actorRole: actor.role || 'admin',
      action: 'LEADS_CSV_EXPORTED',
      timestamp: serverTimestamp(),
      metadata: {
        recordCount: leads.length,
        exportedAt: new Date().toISOString()
      }
    }).catch(() => {});
  }

  return { success: true, count: leads.length };
};

// ===============================================================
// PHASE 6: CALL MANAGEMENT, FOLLOW-UP CALENDAR & PERFORMANCE
// ===============================================================

export const VALID_CALL_OUTCOMES = [
  'Connected',
  'No Answer',
  'Busy',
  'Switched Off',
  'Invalid Number',
  'Call Back Requested',
  'Interested',
  'Not Interested',
  'Admission Confirmed',
  'Visit Scheduled'
];

export const VALID_INTEREST_LEVELS = ['High', 'Medium', 'Low', 'Not Interested'];
export const VALID_PRIORITIES = ['High', 'Medium', 'Low'];
export const VALID_FOLLOW_UP_STATUSES = ['Scheduled', 'Due', 'Completed', 'Overdue', 'Cancelled', 'Rescheduled'];

/**
 * Record a call attempt and outcome for an enquiry
 */
export const recordCall = async ({
  leadId,
  leadNumber,
  callOutcome,
  callDurationSeconds = 0,
  interestLevel = 'Medium',
  notes = '',
  parentResponse = '',
  nextFollowUpRequired = false,
  nextFollowUpDate,
  nextFollowUpTime = '10:00',
  followUpPriority = 'Medium',
  caller
}) => {
  if (!leadId) return { success: false, error: "leadId is required." };
  if (!VALID_CALL_OUTCOMES.includes(callOutcome)) {
    return { success: false, error: `Invalid call outcome. Choose one of: ${VALID_CALL_OUTCOMES.join(', ')}` };
  }

  // 1. Try Cloud Function
  if (isConfigured && functions) {
    try {
      const fn = httpsCallable(functions, 'recordCall');
      const res = await fn({
        leadId,
        callOutcome,
        callDurationSeconds,
        interestLevel,
        notes,
        parentResponse,
        nextFollowUpRequired,
        nextFollowUpDate,
        nextFollowUpTime,
        followUpPriority
      });
      return res.data;
    } catch (err) {
      console.warn("recordCall function notice, fallback to direct Firestore:", err.message);
    }
  }

  // 2. Direct Firestore fallback
  const now = new Date();
  const callerUid = caller?.uid || 'LOCAL_USER';
  const callerName = caller?.displayName || caller?.fullName || 'Counselor';

  let newStatus = 'Contacted';
  if (callOutcome === 'Admission Confirmed') newStatus = 'Converted';
  else if (callOutcome === 'Visit Scheduled') newStatus = 'Visited';
  else if (callOutcome === 'Interested') newStatus = 'Interested';
  else if (callOutcome === 'Not Interested') newStatus = 'Not Interested';
  else if (callOutcome === 'Call Back Requested' || nextFollowUpRequired) newStatus = 'Follow-up';

  let callId = 'call-' + Date.now();
  if (isConfigured && db) {
    const callRef = await addDoc(collection(db, 'call_records'), {
      leadId,
      leadNumber: leadNumber || leadId,
      telecallerId: callerUid,
      telecallerName: callerName,
      callOutcome,
      callDurationSeconds: Number(callDurationSeconds) || 0,
      interestLevel,
      notes,
      parentResponse,
      nextFollowUpRequired: !!nextFollowUpRequired,
      callTimestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    callId = callRef.id;

    // Schedule follow-up if requested
    if (nextFollowUpRequired && nextFollowUpDate) {
      const scheduledIso = `${nextFollowUpDate}T${nextFollowUpTime}:00+05:30`;
      await addDoc(collection(db, 'follow_ups'), {
        leadId,
        leadNumber: leadNumber || leadId,
        assignedTo: callerUid,
        assignedTelecallerName: callerName,
        createdBy: callerUid,
        scheduledAt: scheduledIso,
        scheduledDate: nextFollowUpDate,
        scheduledTime: nextFollowUpTime,
        timezone: 'Asia/Kolkata',
        priority: followUpPriority,
        status: 'Scheduled',
        notes: notes || `Follow-up following call outcome: ${callOutcome}`,
        reminderSettings: { oneDayBefore: true, oneHourBefore: true, atTime: true, overdue: true },
        reminderHistory: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // Update enquiry doc
    const updateLead = {
      lastContactedAt: serverTimestamp(),
      lastCallOutcome: callOutcome,
      status: newStatus,
      leadStatus: newStatus,
      updatedAt: serverTimestamp()
    };
    if (nextFollowUpRequired && nextFollowUpDate) {
      updateLead.nextFollowupAt = `${nextFollowUpDate}T${nextFollowUpTime}:00+05:30`;
      updateLead.nextFollowUp = nextFollowUpDate;
    }
    await updateDoc(doc(db, 'enquiries', leadId), updateLead).catch(() => {});

    // Activity timeline
    await addDoc(collection(db, 'lead_activities'), {
      leadId,
      leadNumber: leadNumber || leadId,
      activityType: 'Call Attempt',
      description: `Call recorded by ${callerName}: Outcome "${callOutcome}", Interest "${interestLevel}". ${notes ? `Notes: ${notes}` : ''}`,
      previousValue: 'Existing',
      newValue: newStatus,
      performedBy: callerUid,
      performedByRole: caller?.role || 'telecaller',
      createdAt: serverTimestamp()
    }).catch(() => {});
  }

  return {
    success: true,
    callId,
    leadStatus: newStatus
  };
};

/**
 * Schedule a new follow-up
 */
export const scheduleFollowUp = async ({
  leadId,
  leadNumber,
  parentName,
  studentName,
  mobileNumber,
  admissionClass,
  academicYear,
  assignedTo,
  assignedTelecallerName,
  scheduledDate,
  scheduledTime = '10:00',
  priority = 'Medium',
  notes = '',
  reminderSettings = {},
  caller
}) => {
  if (!leadId || !scheduledDate) return { success: false, error: "leadId and scheduledDate are required." };

  const scheduledAtIso = `${scheduledDate}T${scheduledTime}:00+05:30`;
  const scheduledMillis = Date.parse(scheduledAtIso);
  if (isNaN(scheduledMillis) || scheduledMillis <= Date.now()) {
    return { success: false, error: "Cannot schedule follow-up in the past. Date and time must be in the future." };
  }

  if (isConfigured && functions) {
    try {
      const fn = httpsCallable(functions, 'scheduleFollowUp');
      const res = await fn({
        leadId,
        scheduledDate,
        scheduledTime,
        priority,
        notes,
        reminderSettings
      });
      return res.data;
    } catch (err) {
      console.warn("scheduleFollowUp function notice, fallback to direct Firestore:", err.message);
    }
  }

  let followUpId = 'fu-' + Date.now();
  if (isConfigured && db) {
    const fuRef = await addDoc(collection(db, 'follow_ups'), {
      leadId,
      leadNumber: leadNumber || leadId,
      parentName: parentName || '',
      studentName: studentName || '',
      mobileNumber: mobileNumber || '',
      admissionClass: admissionClass || '',
      academicYear: academicYear || '',
      assignedTo: assignedTo || caller?.uid || '',
      assignedTelecallerName: assignedTelecallerName || caller?.displayName || '',
      createdBy: caller?.uid || 'SYSTEM',
      scheduledAt: scheduledAtIso,
      scheduledDate,
      scheduledTime,
      timezone: 'Asia/Kolkata',
      priority,
      status: 'Scheduled',
      notes,
      reminderSettings: {
        oneDayBefore: reminderSettings.oneDayBefore !== false,
        oneHourBefore: reminderSettings.oneHourBefore !== false,
        atTime: reminderSettings.atTime !== false,
        overdue: reminderSettings.overdue !== false
      },
      reminderHistory: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    followUpId = fuRef.id;

    await updateDoc(doc(db, 'enquiries', leadId), {
      nextFollowupAt: scheduledAtIso,
      nextFollowUp: scheduledDate,
      status: 'Follow-up',
      leadStatus: 'Follow-up',
      updatedAt: serverTimestamp()
    }).catch(() => {});

    await addDoc(collection(db, 'lead_activities'), {
      leadId,
      leadNumber: leadNumber || leadId,
      activityType: 'Follow-up Scheduled',
      description: `Follow-up scheduled for ${scheduledDate} at ${scheduledTime} (${priority} priority). Notes: ${notes || 'N/A'}`,
      previousValue: 'None',
      newValue: scheduledAtIso,
      performedBy: caller?.uid || 'SYSTEM',
      performedByRole: caller?.role || 'telecaller',
      createdAt: serverTimestamp()
    }).catch(() => {});
  }

  return {
    success: true,
    followUpId,
    scheduledAt: scheduledAtIso
  };
};

/**
 * Reschedule an existing follow-up (preserves historical record)
 */
export const rescheduleFollowUp = async ({
  followUpId,
  leadId,
  leadNumber,
  previousScheduledAt,
  newScheduledDate,
  newScheduledTime = '10:00',
  newPriority = 'Medium',
  reason = '',
  caller
}) => {
  if (!followUpId || !newScheduledDate) return { success: false, error: "followUpId and newScheduledDate are required." };
  if (!reason || !reason.trim()) {
    return { success: false, error: "A valid reason is required to reschedule a follow-up." };
  }

  const newScheduledAtIso = `${newScheduledDate}T${newScheduledTime}:00+05:30`;
  const newMillis = Date.parse(newScheduledAtIso);
  if (isNaN(newMillis) || newMillis <= Date.now()) {
    return { success: false, error: "New follow-up schedule must be in the future." };
  }

  if (isConfigured && functions) {
    try {
      const fn = httpsCallable(functions, 'rescheduleFollowUp');
      const res = await fn({
        followUpId,
        newScheduledDate,
        newScheduledTime,
        newPriority,
        reason
      });
      return res.data;
    } catch (err) {
      console.warn("rescheduleFollowUp function notice, fallback to direct Firestore:", err.message);
    }
  }

  const callerName = caller?.displayName || caller?.fullName || 'Counselor';
  let historyId = 'hist-' + Date.now();

  if (isConfigured && db) {
    // 1. History record
    const histRef = await addDoc(collection(db, 'follow_up_history'), {
      followUpId,
      leadId: leadId || '',
      previousScheduledAt: previousScheduledAt || '',
      newScheduledAt: newScheduledAtIso,
      previousStatus: 'Scheduled',
      newStatus: 'Rescheduled',
      changedBy: caller?.uid || 'SYSTEM',
      changedByName: callerName,
      changeReason: reason || 'Rescheduled by user request',
      createdAt: serverTimestamp()
    });
    historyId = histRef.id;

    // 2. Update follow_up
    await updateDoc(doc(db, 'follow_ups', followUpId), {
      scheduledAt: newScheduledAtIso,
      scheduledDate: newScheduledDate,
      scheduledTime: newScheduledTime,
      priority: newPriority,
      status: 'Rescheduled',
      reminderHistory: [],
      updatedAt: serverTimestamp()
    });

    if (leadId) {
      await updateDoc(doc(db, 'enquiries', leadId), {
        nextFollowupAt: newScheduledAtIso,
        nextFollowUp: newScheduledDate,
        updatedAt: serverTimestamp()
      }).catch(() => {});

      await addDoc(collection(db, 'lead_activities'), {
        leadId,
        leadNumber: leadNumber || leadId,
        activityType: 'Follow-up Rescheduled',
        description: `Follow-up rescheduled by ${callerName} to ${newScheduledDate} at ${newScheduledTime}. Reason: ${reason || 'N/A'}`,
        previousValue: previousScheduledAt || '',
        newValue: newScheduledAtIso,
        performedBy: caller?.uid || 'SYSTEM',
        performedByRole: caller?.role || 'telecaller',
        createdAt: serverTimestamp()
      }).catch(() => {});
    }
  }

  return {
    success: true,
    followUpId,
    status: 'Rescheduled',
    newScheduledAt: newScheduledAtIso,
    historyId
  };
};

/**
 * Mark a follow-up as completed
 */
export const completeFollowUp = async ({
  followUpId,
  leadId,
  leadNumber,
  completionNotes = '',
  leadOutcome,
  caller
}) => {
  if (!followUpId) return { success: false, error: "followUpId is required." };

  if (isConfigured && functions) {
    try {
      const fn = httpsCallable(functions, 'completeFollowUp');
      const res = await fn({
        followUpId,
        completionNotes,
        leadOutcome
      });
      return res.data;
    } catch (err) {
      console.warn("completeFollowUp function notice, fallback to direct Firestore:", err.message);
    }
  }

  const callerName = caller?.displayName || caller?.fullName || 'Counselor';

  if (isConfigured && db) {
    await updateDoc(doc(db, 'follow_ups', followUpId), {
      status: 'Completed',
      completedAt: serverTimestamp(),
      completedBy: caller?.uid || 'SYSTEM',
      completedByName: callerName,
      completionNotes,
      updatedAt: serverTimestamp()
    });

    if (leadId) {
      const updateLead = { updatedAt: serverTimestamp() };
      if (leadOutcome === 'Admission Confirmed') updateLead.status = 'Converted';
      else if (leadOutcome === 'Visit Scheduled') updateLead.status = 'Visited';
      else if (leadOutcome === 'Interested') updateLead.status = 'Interested';
      else if (leadOutcome === 'Not Interested') updateLead.status = 'Not Interested';

      await updateDoc(doc(db, 'enquiries', leadId), updateLead).catch(() => {});

      await addDoc(collection(db, 'lead_activities'), {
        leadId,
        leadNumber: leadNumber || leadId,
        activityType: 'Follow-up Completed',
        description: `Follow-up marked completed by ${callerName}. Notes: ${completionNotes || 'N/A'}`,
        previousValue: 'Scheduled',
        newValue: 'Completed',
        performedBy: caller?.uid || 'SYSTEM',
        performedByRole: caller?.role || 'telecaller',
        createdAt: serverTimestamp()
      }).catch(() => {});
    }
  }

  return {
    success: true,
    followUpId,
    status: 'Completed',
    completedAt: new Date().toISOString()
  };
};

/**
 * Trigger check for automated follow-up reminders
 */
export const triggerFollowUpReminders = async () => {
  if (isConfigured && functions) {
    try {
      const fn = httpsCallable(functions, 'checkFollowUpReminders');
      const res = await fn({});
      return res.data;
    } catch (err) {
      console.warn("triggerFollowUpReminders error:", err.message);
    }
  }
  return { success: true, remindersSent: 0, evaluated: 0 };
};

/**
 * Calculate Telecaller Performance Analytics
 */
export const calculateTelecallerPerformance = ({
  telecallers = [],
  enquiries = [],
  calls = [],
  followUps = []
}) => {
  const nowMs = Date.now();

  const results = telecallers.map(t => {
    const uid = t.uid || t.id;

    // Assigned leads
    const assignedLeads = enquiries.filter(e => e.assignedTo === uid || e.assignedTelecallerId === uid);
    const convertedLeads = assignedLeads.filter(e => e.status === 'Converted' || e.leadStatus === 'Converted').length;
    const interestedLeads = assignedLeads.filter(e => e.status === 'Interested' || e.leadStatus === 'Interested').length;

    // Calls made
    const myCalls = calls.filter(c => c.telecallerId === uid);
    const callsMade = myCalls.length;
    const connectedCalls = myCalls.filter(c => ['Connected', 'Interested', 'Admission Confirmed', 'Visit Scheduled'].includes(c.callOutcome)).length;

    // Follow-ups
    const myFollowUps = followUps.filter(f => f.assignedTo === uid);
    const completedFollowUps = myFollowUps.filter(f => f.status === 'Completed').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueFollowUps = myFollowUps.filter(f => f.status === 'Overdue' || (f.status !== 'Completed' && (
      (f.scheduledDate && f.scheduledDate < todayStr) || 
      (f.scheduledAt && Date.parse(f.scheduledAt) < nowMs)
    ))).length;
    const pendingFollowUps = myFollowUps.filter(f => f.status === 'Scheduled' || f.status === 'Due' || f.status === 'Rescheduled').length;

    // Conversion rate: Converted / Eligible Assigned Leads * 100
    const conversionRate = assignedLeads.length > 0
      ? Math.round((convertedLeads / assignedLeads.length) * 1000) / 10
      : 0;

    // Follow-up completion rate: Completed / (Completed + Overdue) * 100
    const dueTotal = completedFollowUps + overdueFollowUps;
    const followUpCompletionRate = dueTotal > 0
      ? Math.round((completedFollowUps / dueTotal) * 1000) / 10
      : (completedFollowUps > 0 ? 100 : 0);

    return {
      telecallerId: uid,
      telecallerName: t.fullName || t.displayName || 'Counselor',
      email: t.email || '',
      phone: t.phone || '',
      status: t.status || 'active',
      assignedLeads: assignedLeads.length,
      assignedLeadsCount: assignedLeads.length,
      callsMade,
      totalCalls: callsMade,
      connectedCalls,
      interestedLeads,
      convertedLeads,
      convertedAdmissions: convertedLeads,
      completedFollowUps,
      pendingFollowUps,
      overdueFollowUps,
      conversionRate,
      followUpCompletionRate,
      completionRate: followUpCompletionRate
    };
  });

  // Sort by conversions DESC, then conversion rate DESC
  results.sort((a, b) => b.convertedLeads - a.convertedLeads || b.conversionRate - a.conversionRate);

  return results;
};

/**
 * Export Telecaller Performance report to CSV
 */
export const exportPerformanceToCSV = (performanceList = [], actor) => {
  if (!performanceList || performanceList.length === 0) return { success: false, message: 'No records to export.' };

  const headers = [
    'समुपदेशक नाव (Telecaller Name)',
    'ईमेल (Email)',
    'फोन (Phone)',
    'खाते स्थिती (Account Status)',
    'असाइन लीड्स (Assigned Leads)',
    'एकूण कॉल्स (Calls Made)',
    'कनेक्ट झालेले कॉल्स (Connected Calls)',
    'इच्छुक लीड्स (Interested Leads)',
    'प्रवेश निश्चित (Converted Admissions)',
    'कन्वर्शन दर (Conversion Rate %)',
    'पूर्ण केलेले फॉलो-अप्स (Completed Follow-ups)',
    'प्रलंबित फॉलो-अप्स (Pending Follow-ups)',
    'थकबाकी फॉलो-अप्स (Overdue Follow-ups)',
    'फॉलो-अप पूर्णता दर (Completion Rate %)'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = performanceList.map(p => [
    escapeCSV(p.telecallerName || ''),
    escapeCSV(p.email || ''),
    escapeCSV(p.phone || ''),
    escapeCSV(p.status || 'active'),
    escapeCSV(p.assignedLeadsCount || p.assignedLeads || 0),
    escapeCSV(p.callsMade || p.totalCalls || 0),
    escapeCSV(p.connectedCalls || 0),
    escapeCSV(p.interestedLeads || 0),
    escapeCSV(p.convertedLeads || p.convertedAdmissions || 0),
    escapeCSV(`${p.conversionRate || 0}%`),
    escapeCSV(p.completedFollowUps || 0),
    escapeCSV(p.pendingFollowUps || 0),
    escapeCSV(p.overdueFollowUps || 0),
    escapeCSV(`${p.followUpCompletionRate || p.completionRate || 0}%`)
  ]);

  const csvContent = '\uFEFF' + [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Gurukul_Bhose_Telecaller_Performance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return { success: true, count: performanceList.length, csvData: csvContent };
};

/**
 * Export Call Monitoring & Follow-ups report to CSV
 */
export const exportCallMonitoringToCSV = (calls = [], followUps = [], actor) => {
  const headers = [
    'रेकॉर्ड प्रकार (Record Type)',
    'लीड क्रमांक (Lead Number)',
    'पालक नाव (Parent Name)',
    'विद्यार्थी नाव (Student Name)',
    'समुपदेशक (Telecaller)',
    'कॉल निकाल / स्थिती (Call Outcome / Status)',
    'कालावधी (Duration)',
    'इन्टरेस्ट लेव्हल / प्रायॉरिटी (Interest / Priority)',
    'तारीख व वेळ (Date & Time)',
    'नोंदी (Notes)'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const callRows = calls.map(c => [
    escapeCSV('कॉल रेकॉर्ड (Call)'),
    escapeCSV(c.leadNumber || c.leadId || ''),
    escapeCSV(c.parentName || ''),
    escapeCSV(c.studentName || ''),
    escapeCSV(c.telecallerName || ''),
    escapeCSV(c.callOutcome || ''),
    escapeCSV(c.callDurationSeconds ? `${c.callDurationSeconds}s` : '0s'),
    escapeCSV(c.interestLevel || 'Medium'),
    escapeCSV(c.callTimestamp ? new Date(c.callTimestamp?.toDate ? c.callTimestamp.toDate() : c.callTimestamp).toLocaleString('en-IN') : ''),
    escapeCSV(c.notes || '')
  ]);

  const followUpRows = followUps.map(f => [
    escapeCSV('फॉलो-अप (Follow-up)'),
    escapeCSV(f.leadNumber || f.leadId || ''),
    escapeCSV(f.parentName || ''),
    escapeCSV(f.studentName || ''),
    escapeCSV(f.assignedTelecallerName || ''),
    escapeCSV(f.status || 'Scheduled'),
    escapeCSV('N/A'),
    escapeCSV(f.priority || 'Medium'),
    escapeCSV(`${f.scheduledDate || ''} ${f.scheduledTime || ''}`),
    escapeCSV(f.notes || '')
  ]);

  const allRows = [...callRows, ...followUpRows];

  const csvContent = '\uFEFF' + [
    headers.map(h => `"${h}"`).join(','),
    ...allRows.map(r => r.join(','))
  ].join('\r\n');

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Gurukul_Bhose_Call_Monitoring_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return { success: true, count: allRows.length, csvData: csvContent };
};

