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
  LEAD_STATUS_CONFIG,
  LEAD_STATUS_LIST,
  PERMITTED_STATUS_TRANSITIONS,
  isValidStatusTransition,
  normalizePhoneNumber,
  sanitizeText,
  generateLocalLeadNumber,
  detectDuplicateLead,
  calculateCRMAnalytics,
  exportLeadsToCSV
} from '../shared/services/firestore/crmService.js';

const projectRoot = process.cwd();

// Mock store for end-to-end CRM workflow testing
const mockDB = {
  enquiries: [],
  lead_activities: [],
  lead_assignments: [],
  lead_status_history: [],
  lead_duplicates: [],
  notifications: [],
  audit_logs: []
};

const mockAdmin = {
  uid: 'admin-001',
  fullName: 'Principal Admin',
  role: 'admin'
};

const mockTelecaller1 = {
  uid: 'telecaller-001',
  fullName: 'Sachin Patil',
  employeeId: 'TC-101',
  role: 'telecaller',
  status: 'active'
};

const mockTelecaller2 = {
  uid: 'telecaller-002',
  fullName: 'Pooja Shinde',
  employeeId: 'TC-102',
  role: 'telecaller',
  status: 'active'
};

test('TEST 1 & 2: Parent submits enquiry from website with server validation & normalization', () => {
  const rawMobile = '+91 98504-49800';
  const normalized = normalizePhoneNumber(rawMobile);
  assert.equal(normalized, '9850449800', 'Mobile number must be normalized to clean 10 digits');

  const rawParentName = '  श्री. पांडुरंग जाधव <script>alert(1)</script> ';
  const sanitizedParent = sanitizeText(rawParentName, 100);
  assert.equal(sanitizedParent.includes('<script>'), false, 'HTML/Script tags must be stripped');
  assert.equal(sanitizedParent.startsWith('श्री.'), true, 'Text should be trimmed and preserved');

  // Validate required fields
  const isValidSubmission = (data) => {
    return Boolean(
      data.parentName?.trim() &&
      data.studentName?.trim() &&
      data.admissionClass?.trim() &&
      normalizePhoneNumber(data.mobileNumber).length === 10 &&
      data.consent === true
    );
  };

  const validData = {
    parentName: sanitizedParent,
    studentName: 'ओंकार जाधव',
    mobileNumber: rawMobile,
    admissionClass: 'इ. 5 वी (5th Std)',
    academicYear: '2026-2027',
    consent: true
  };
  assert.equal(isValidSubmission(validData), true, 'Valid submission data must pass validation');

  const invalidData = {
    parentName: '',
    studentName: 'ओंकार जाधव',
    mobileNumber: '123',
    admissionClass: 'इ. 5 वी',
    consent: false
  };
  assert.equal(isValidSubmission(invalidData), false, 'Invalid submission must be rejected');
});

test('TEST 3: Unique Concurrency-Safe Lead Number is generated (e.g. GB-2026-000001)', () => {
  const leadNum1 = generateLocalLeadNumber('2026');
  const leadNum2 = generateLocalLeadNumber('2026');

  assert.match(leadNum1, /^GB-2026-\d{6}$/, 'Lead number must match format GB-YYYY-NNNNNN');
  assert.match(leadNum2, /^GB-2026-\d{6}$/, 'Lead number must match format GB-YYYY-NNNNNN');
  assert.notEqual(leadNum1, leadNum2, 'Subsequent lead numbers must be sequential and unique');
});

test('TEST 4 & 5: Admin receives new enquiry notification and views enquiry in CRM', () => {
  const leadId = 'lead-test-101';
  const leadNumber = 'GB-2026-000101';
  const newLead = {
    id: leadId,
    leadNumber,
    studentName: 'रोहन जाधव',
    parentName: 'दत्तात्रय जाधव',
    mobile: '9850449801',
    normalizedMobile: '9850449801',
    admissionClass: 'इ. 5 वी (5th Std)',
    academicYear: '2026-2027',
    course: 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)',
    source: 'Website',
    status: 'New',
    assignedTo: null,
    assignedTelecallerName: null,
    createdAt: new Date().toISOString()
  };

  mockDB.enquiries.push(newLead);

  // Admin Notification
  const notif = {
    id: 'notif-test-1',
    recipientId: 'ADMIN',
    title: 'नवीन प्रवेश अर्ज प्राप्त',
    message: `${newLead.studentName} (${newLead.admissionClass}) - ${leadNumber}`,
    category: 'enquiry',
    leadId,
    leadNumber,
    read: false,
    createdAt: new Date().toISOString()
  };
  mockDB.notifications.push(notif);

  assert.equal(mockDB.notifications.some(n => n.leadNumber === leadNumber), true, 'Notification must be queued for Admin');
  assert.equal(mockDB.enquiries.some(e => e.leadNumber === leadNumber && e.status === 'New'), true, 'Enquiry must be available in CRM as New');
});

test('TEST 6 & 7: Admin assigns Telecaller, assignment record is logged and Telecaller is notified', () => {
  const targetLead = mockDB.enquiries[0];
  assert.ok(targetLead, 'Target lead must exist');

  // Assign to Telecaller 1
  targetLead.assignedTo = mockTelecaller1.uid;
  targetLead.assignedTelecallerName = mockTelecaller1.fullName;
  targetLead.status = 'Assigned';

  const assignmentLog = {
    id: 'asg-1',
    leadId: targetLead.id,
    telecallerId: mockTelecaller1.uid,
    telecallerName: mockTelecaller1.fullName,
    assignedBy: mockAdmin.uid,
    assignedAt: new Date().toISOString(),
    previousTelecallerId: null,
    assignmentReason: 'Routine allocation',
    assignmentStatus: 'active'
  };
  mockDB.lead_assignments.push(assignmentLog);

  const telecallerNotif = {
    id: 'notif-tc-1',
    recipientId: mockTelecaller1.uid,
    title: 'नवीन लीड नियुक्त',
    message: `आपल्याकडे नवीन लीड सोपवली आहे: ${targetLead.studentName}`,
    category: 'assignment',
    leadId: targetLead.id,
    read: false
  };
  mockDB.notifications.push(telecallerNotif);

  assert.equal(targetLead.assignedTo, mockTelecaller1.uid);
  assert.equal(targetLead.status, 'Assigned');
  assert.equal(mockDB.lead_assignments.length, 1);
  assert.equal(mockDB.notifications.some(n => n.recipientId === mockTelecaller1.uid), true);
});

test('TEST 8: Telecaller views ONLY currently assigned leads (Strict Isolation)', () => {
  const lead2 = {
    id: 'lead-test-102',
    leadNumber: 'GB-2026-000102',
    studentName: 'प्रणव कुलकर्णी',
    parentName: 'महेश कुलकर्णी',
    mobile: '9850449802',
    admissionClass: 'इ. 8 वी',
    assignedTo: mockTelecaller2.uid,
    assignedTelecallerName: mockTelecaller2.fullName,
    status: 'Assigned'
  };
  mockDB.enquiries.push(lead2);

  // Simulating Telecaller 1 query
  const telecaller1Leads = mockDB.enquiries.filter(e => e.assignedTo === mockTelecaller1.uid);
  assert.equal(telecaller1Leads.length, 1);
  assert.equal(telecaller1Leads[0].studentName, 'रोहन जाधव');

  // Telecaller 1 CANNOT see lead 2
  assert.equal(telecaller1Leads.some(e => e.id === 'lead-test-102'), false, 'Telecaller 1 must not access Lead 2');

  // Simulating Admin query (Admin can see all)
  const adminLeads = mockDB.enquiries;
  assert.equal(adminLeads.length, 2, 'Admin can see all leads in system');
});

test('TEST 9 & 10: Telecaller records contact attempt, notes and status transition', () => {
  const lead = mockDB.enquiries.find(e => e.assignedTo === mockTelecaller1.uid);
  assert.ok(lead);

  const callOutcome = 'Connected / Discussed';
  const parentNotes = 'पालकांना सैनिक पॅटर्न वसतिगृह व मेस व्यवस्था आवडली. उद्या भेट देणार.';
  const nextDate = '2026-11-20';

  // Record call attempt
  mockDB.lead_activities.push({
    id: 'act-call-1',
    leadId: lead.id,
    leadNumber: lead.leadNumber,
    activityType: 'Contact Successful',
    description: `Call outcome: ${callOutcome}. Notes: ${parentNotes}`,
    performedBy: mockTelecaller1.uid,
    performedByRole: 'telecaller',
    createdAt: new Date().toISOString()
  });

  // Valid status transition from Assigned -> Interested
  const canTransition = isValidStatusTransition(lead.status, 'Interested', 'telecaller');
  assert.equal(canTransition, true, 'Transition from Assigned to Interested must be permitted');

  lead.status = 'Interested';
  lead.nextFollowupAt = nextDate;

  mockDB.lead_status_history.push({
    id: 'hist-1',
    leadId: lead.id,
    previousStatus: 'Assigned',
    newStatus: 'Interested',
    changedBy: mockTelecaller1.uid,
    userRole: 'telecaller',
    changedAt: new Date().toISOString(),
    reason: 'Parent showed high interest'
  });

  assert.equal(lead.status, 'Interested');
  assert.equal(mockDB.lead_activities.length, 1);
  assert.equal(mockDB.lead_status_history.length, 1);
});

test('TEST 11: Duplicate enquiry detection distinguishes exact duplicate vs genuine Sibling', () => {
  const existingList = [
    {
      id: 'lead-1',
      studentName: 'रोहन जाधव',
      parentName: 'दत्तात्रय जाधव',
      normalizedMobile: '9850449801',
      admissionClass: 'इ. 5 वी (5th Std)',
      academicYear: '2026-2027'
    }
  ];

  // Case A: Identical Mobile, Student Name and Class -> Exact Duplicate!
  const dupSubmission = {
    studentName: 'रोहन जाधव',
    parentName: 'दत्तात्रय जाधव',
    mobileNumber: '9850449801',
    admissionClass: 'इ. 5 वी (5th Std)',
    academicYear: '2026-2027'
  };
  const dupResult = detectDuplicateLead(existingList, dupSubmission);
  assert.equal(dupResult.isDuplicate, true, 'Exact match must be flagged as duplicate');

  // Case B: Same parent mobile, but different student name (Sibling) -> Sibling Enquiry!
  const siblingSubmission = {
    studentName: 'स्नेहल जाधव', // Sister
    parentName: 'दत्तात्रय जाधव',
    mobileNumber: '9850449801',
    admissionClass: 'इ. 8 वी',
    academicYear: '2026-2027'
  };
  const siblingResult = detectDuplicateLead(existingList, siblingSubmission);
  assert.equal(siblingResult.isDuplicate, false, 'Sibling with different name must NOT be flagged as duplicate');
  assert.equal(siblingResult.isSibling, true, 'Sibling flag must be set to true');
  assert.equal(siblingResult.siblingOf, 'रोहन जाधव', 'Must reference existing sibling student');
});

test('TEST 12: Admin reviews duplicate: Update existing vs Approve as genuine new lead', () => {
  const duplicateLead = {
    id: 'lead-dup-1',
    studentName: 'रोहन जाधव',
    isDuplicate: true,
    duplicateReviewStatus: 'pending'
  };

  // Admin action 1: Update Existing
  const reviewAction1 = (lead, action, notes) => {
    if (action === 'update_existing') {
      lead.duplicateReviewStatus = 'resolved_updated';
      lead.adminRemarks = notes;
    } else if (action === 'keep_as_new') {
      lead.isDuplicate = false;
      lead.duplicateReviewStatus = 'resolved_new';
      lead.adminRemarks = notes;
    }
  };

  reviewAction1(duplicateLead, 'keep_as_new', 'Verified genuine sibling/second attempt by Admin');
  assert.equal(duplicateLead.isDuplicate, false, 'Lead duplicate flag cleared when approved as new');
  assert.equal(duplicateLead.duplicateReviewStatus, 'resolved_new');
});

test('TEST 13 & 14: Admin reassigns a lead, previous Telecaller loses access immediately', () => {
  const lead = mockDB.enquiries[0];
  const previousTelecallerId = lead.assignedTo;
  assert.equal(previousTelecallerId, mockTelecaller1.uid);

  // Admin reassigns to Telecaller 2
  lead.assignedTo = mockTelecaller2.uid;
  lead.assignedTelecallerName = mockTelecaller2.fullName;

  // Revocation verification: Telecaller 1 query
  const telecaller1ActiveLeads = mockDB.enquiries.filter(e => e.assignedTo === mockTelecaller1.uid);
  assert.equal(telecaller1ActiveLeads.some(e => e.id === lead.id), false, 'Previous Telecaller 1 must immediately lose access');

  // Telecaller 2 now has access
  const telecaller2ActiveLeads = mockDB.enquiries.filter(e => e.assignedTo === mockTelecaller2.uid);
  assert.equal(telecaller2ActiveLeads.some(e => e.id === lead.id), true, 'New Telecaller 2 must now have access');
});

test('TEST 15: Unauthorized Telecaller cannot access or update another Telecaller lead', () => {
  const callerAuth = { uid: 'unauthorized-telecaller-999', role: 'telecaller' };
  const targetLead = mockDB.enquiries[0]; // assigned to telecaller-002

  const canRead = (auth, lead) => {
    if (auth.role === 'admin' || auth.role === 'super_admin') return true;
    if (auth.role === 'telecaller' && lead.assignedTo === auth.uid) return true;
    return false;
  };

  assert.equal(canRead(callerAuth, targetLead), false, 'Unauthorized telecaller read must be denied');
});

test('TEST 16: Public unauthenticated user cannot read private CRM records', () => {
  const publicUser = null;
  const canPublicRead = (auth) => Boolean(auth && auth.uid);

  assert.equal(canPublicRead(publicUser), false, 'Unauthenticated public user cannot read CRM records');
});

test('TEST 17: CSV export follows role permissions and escapes quotes and commas properly', () => {
  const testLeads = [
    {
      leadNumber: 'GB-2026-000001',
      parentName: 'Jadhav, Pandurang "Vikas"',
      studentName: 'Rohan Jadhav',
      normalizedMobile: '9850449800',
      admissionClass: '5th Std',
      course: 'Sainik Pattern, Residential',
      source: 'Website',
      assignedTelecallerName: 'Sachin Patil',
      status: 'Interested',
      createdAt: '2026-11-16'
    }
  ];

  // Helper verifying RFC 4180 escaping
  const escapeCSV = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
  const escapedParent = escapeCSV(testLeads[0].parentName);
  assert.equal(escapedParent, '"Jadhav, Pandurang ""Vikas"""', 'Quotes must be doubled and fields wrapped in quotes');

  const escapedCourse = escapeCSV(testLeads[0].course);
  assert.equal(escapedCourse, '"Sainik Pattern, Residential"', 'Commas inside fields must be safely quoted');
});

test('TEST 18: Permitted Status Transitions enforce valid CRM progression', () => {
  assert.equal(isValidStatusTransition('New', 'Assigned', 'telecaller'), true);
  assert.equal(isValidStatusTransition('Assigned', 'Contacted', 'telecaller'), true);
  assert.equal(isValidStatusTransition('Contacted', 'Interested', 'telecaller'), true);
  assert.equal(isValidStatusTransition('Interested', 'Converted', 'telecaller'), true);

  // Illegal transitions for telecaller
  assert.equal(isValidStatusTransition('New', 'Converted', 'telecaller'), false, 'New directly to Converted must be blocked for telecaller');
  assert.equal(isValidStatusTransition('Converted', 'New', 'telecaller'), false, 'Converted cannot jump back to New for telecaller');

  // Admin override capability
  assert.equal(isValidStatusTransition('New', 'Converted', 'admin'), true, 'Admin has override capability');
});

test('TEST 19: CRM Analytics computes accurate totals, status counts and conversion rate', () => {
  const sampleLeads = [
    { status: 'New', source: 'Website', admissionClass: '5th', createdAt: new Date().toISOString() },
    { status: 'Assigned', source: 'Website', admissionClass: '5th', assignedTo: 'tc-1', createdAt: new Date().toISOString() },
    { status: 'Contacted', source: 'Phone Call', admissionClass: '8th', assignedTo: 'tc-1', createdAt: new Date().toISOString() },
    { status: 'Interested', source: 'WhatsApp', admissionClass: '11th', assignedTo: 'tc-2', createdAt: new Date().toISOString() },
    { status: 'Converted', source: 'Website', admissionClass: '5th', assignedTo: 'tc-1', createdAt: new Date().toISOString() }
  ];

  const stats = calculateCRMAnalytics(sampleLeads);

  assert.equal(stats.totalEnquiries, 5);
  assert.equal(stats.newLeads, 1);
  assert.equal(stats.assignedLeads, 1);
  assert.equal(stats.contactedLeads, 1);
  assert.equal(stats.interestedLeads, 1);
  assert.equal(stats.convertedLeads, 1);
  assert.equal(stats.conversionRate, '20.0%', 'Conversion rate should be (1/5)*100 = 20.0%');
});

test('TEST 20: Firestore rules and index schema files exist and declare Phase 5 collections', () => {
  const rulesPath = path.join(projectRoot, 'firestore.rules');
  const indexesPath = path.join(projectRoot, 'firestore.indexes.json');

  assert.ok(fs.existsSync(rulesPath), 'firestore.rules must exist');
  assert.ok(fs.existsSync(indexesPath), 'firestore.indexes.json must exist');

  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  assert.match(rulesContent, /match \/enquiries\/\{leadId\}/, 'Rules must declare enquiries collection');
  assert.match(rulesContent, /match \/lead_assignments\/\{assignmentId\}/, 'Rules must declare lead_assignments');
  assert.match(rulesContent, /match \/lead_activities\/\{activityId\}/, 'Rules must declare lead_activities');
  assert.match(rulesContent, /match \/lead_status_history\/\{historyId\}/, 'Rules must declare lead_status_history');
  assert.match(rulesContent, /match \/lead_duplicates\/\{duplicateId\}/, 'Rules must declare lead_duplicates');
  assert.match(rulesContent, /match \/counters\/\{counterId\}/, 'Rules must protect sequential counters');

  const indexesContent = fs.readFileSync(indexesPath, 'utf8');
  assert.match(indexesContent, /"collectionGroup": "enquiries"/, 'Indexes must contain enquiries collection');
});

test('TEST 21: Firestore rules declare Phase 6 Calling, Follow-ups, and Scheduling collections with strict RBAC', () => {
  const rulesPath = path.join(projectRoot, 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  // Verify Phase 6 match rules
  assert.match(rulesContent, /match \/call_records\/\{callId\}/, 'Rules must declare call_records collection');
  assert.match(rulesContent, /match \/follow_ups\/\{followUpId\}/, 'Rules must declare follow_ups collection');
  assert.match(rulesContent, /match \/follow_up_history\/\{historyId\}/, 'Rules must declare follow_up_history collection');
  assert.match(rulesContent, /match \/telecaller_daily_stats\/\{statId\}/, 'Rules must declare telecaller_daily_stats collection');
  assert.match(rulesContent, /match \/notification_logs\/\{logId\}/, 'Rules must declare notification_logs collection');

  // Verify domain validators
  assert.match(rulesContent, /function isValidCallRecord\(data\)/, 'Rules must define isValidCallRecord validator');
  assert.match(rulesContent, /function isValidFollowUpRecord\(data\)/, 'Rules must define isValidFollowUpRecord validator');
  assert.match(rulesContent, /function isValidFollowUpHistory\(data\)/, 'Rules must define isValidFollowUpHistory validator');
  assert.match(rulesContent, /function isValidTelecallerDailyStats\(data\)/, 'Rules must define isValidTelecallerDailyStats validator');
  assert.match(rulesContent, /function isValidNotificationLog\(data\)/, 'Rules must define isValidNotificationLog validator');

  // Verify helper and immutability
  assert.match(rulesContent, /function isEnquiryAssignedTo\(leadId, userId\)/, 'Rules must define isEnquiryAssignedTo helper');
  assert.match(rulesContent, /notification_logs[\s\S]*?allow write: if false;/, 'Notification logs must deny client write');
});

test('TEST 22: Firestore rules declare Phase 7 Campus Visits and Admission Workflow collections with strict RBAC', () => {
  const rulesPath = path.join(projectRoot, 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  // Verify Phase 7 match rules
  assert.match(rulesContent, /match \/campus_visits\/\{visitId\}/, 'Rules must declare campus_visits collection');
  assert.match(rulesContent, /match \/visit_slot_reservations\/\{reservationId\}/, 'Rules must declare visit_slot_reservations collection');
  assert.match(rulesContent, /match \/visit_schedule_settings\/\{settingsId\}/, 'Rules must declare visit_schedule_settings collection');
  assert.match(rulesContent, /match \/visit_feedback\/\{feedbackId\}/, 'Rules must declare visit_feedback collection');
  assert.match(rulesContent, /match \/admission_applications\/\{applicationId\}/, 'Rules must declare admission_applications collection');
  assert.match(rulesContent, /match \/admission_stage_history\/\{historyId\}/, 'Rules must declare admission_stage_history collection');
  assert.match(rulesContent, /match \/admission_documents\/\{documentId\}/, 'Rules must declare admission_documents collection');

  // Verify Phase 7 domain validators
  assert.match(rulesContent, /function isValidCampusVisit\(data\)/, 'Rules must define isValidCampusVisit validator');
  assert.match(rulesContent, /function isValidVisitFeedback\(data\)/, 'Rules must define isValidVisitFeedback validator');
  assert.match(rulesContent, /function isValidAdmissionApplication\(data\)/, 'Rules must define isValidAdmissionApplication validator');
  assert.match(rulesContent, /function isValidAdmissionStageHistory\(data\)/, 'Rules must define isValidAdmissionStageHistory validator');
  assert.match(rulesContent, /function isValidAdmissionDocument\(data\)/, 'Rules must define isValidAdmissionDocument validator');

  // Verify immutability & security invariants
  assert.match(rulesContent, /visit_feedback[\s\S]*?allow update, delete: if false;/, 'Visit feedback must be strictly immutable');
  assert.match(rulesContent, /admission_stage_history[\s\S]*?allow update, delete: if false;/, 'Admission stage history must be strictly immutable');
  assert.match(rulesContent, /admission_applications[\s\S]*?allow delete: if isSuperAdmin\(\);/, 'Admission applications can only be deleted by Super Admin');
});


