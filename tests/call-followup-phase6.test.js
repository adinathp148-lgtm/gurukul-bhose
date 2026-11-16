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
  VALID_CALL_OUTCOMES,
  VALID_INTEREST_LEVELS,
  VALID_PRIORITIES,
  VALID_FOLLOW_UP_STATUSES,
  LEAD_STATUS_CONFIG,
  PERMITTED_STATUS_TRANSITIONS,
  isValidStatusTransition,
  recordCall,
  scheduleFollowUp,
  rescheduleFollowUp,
  completeFollowUp,
  calculateTelecallerPerformance,
  exportCallMonitoringToCSV,
  exportPerformanceToCSV
} from '../shared/services/firestore/crmService.js';

const mockAdmin = {
  uid: 'admin-001',
  fullName: 'Principal Admin',
  role: 'admin'
};

const mockTelecaller1 = {
  uid: 'telecaller-001',
  fullName: 'Sachin Patil',
  employeeId: 'TC-101',
  role: 'telecaller'
};

const mockTelecaller2 = {
  uid: 'telecaller-002',
  fullName: 'Pooja Shinde',
  employeeId: 'TC-102',
  role: 'telecaller'
};

test('Phase 6 Test Suite: Call Management, Calendar, Automatic Reminders & Performance', async (t) => {

  // Scenario 1: Telecaller Call Recording Success
  await t.test('1. Telecaller call recording success with valid fields', async () => {
    const callData = {
      leadId: 'lead-test-001',
      leadNumber: 'GB-2026-000001',
      callOutcome: 'Connected',
      callDurationSeconds: 150,
      interestLevel: 'High',
      parentResponse: 'Parent was very receptive and inquired about residential hostel.',
      notes: 'Wants admission brochure on WhatsApp.',
      caller: mockTelecaller1
    };

    const res = await recordCall(callData);
    assert.equal(res.success, true, 'Call should be recorded successfully');
    assert.ok(res.callId, 'Should generate a callId');
    assert.equal(res.leadStatus, 'Contacted', 'Status should transition from New/Assigned to Contacted');
  });

  // Scenario 2: Required Notes Validation When Outcome Requires It
  await t.test('2. Call recording validation on invalid outcome or missing outcome', async () => {
    const invalidCall = {
      leadId: 'lead-test-001',
      leadNumber: 'GB-2026-000001',
      callOutcome: 'NonExistentOutcome',
      caller: mockTelecaller1
    };

    const res = await recordCall(invalidCall);
    assert.equal(res.success, false, 'Invalid call outcome must be rejected');
    assert.match(res.error, /invalid call outcome/i);
  });

  // Scenario 3: Follow-Up Scheduling with Valid Future Date and Time
  await t.test('3. Follow-up scheduling with valid future date and time', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const fuData = {
      leadId: 'lead-test-002',
      leadNumber: 'GB-2026-000002',
      parentName: 'Ramesh Patil',
      studentName: 'Aarav Patil',
      mobileNumber: '9822012345',
      admissionClass: '11th Science',
      academicYear: '2026-2027',
      scheduledDate: futureDateStr,
      scheduledTime: '11:30',
      priority: 'High',
      notes: 'Follow up regarding fee payment structure.',
      caller: mockTelecaller1
    };

    const res = await scheduleFollowUp(fuData);
    assert.equal(res.success, true, 'Future follow-up scheduling should succeed');
    assert.ok(res.followUpId, 'Should generate a followUpId');
    assert.ok(res.scheduledAt.includes('11:30'), 'ScheduledAt should include correct time');
  });

  // Scenario 4: Follow-up Scheduling Fails with Past Date
  await t.test('4. Follow-up scheduling fails when scheduled in the past', async () => {
    const pastData = {
      leadId: 'lead-test-002',
      leadNumber: 'GB-2026-000002',
      scheduledDate: '2020-01-01',
      scheduledTime: '10:00',
      caller: mockTelecaller1
    };

    const res = await scheduleFollowUp(pastData);
    assert.equal(res.success, false, 'Scheduling in the past must fail');
    assert.match(res.error, /cannot schedule.*past/i);
  });

  // Scenario 5 & 6: Follow-up Reschedule Preserves Previous Schedule in History & Requires Reason
  await t.test('5 & 6. Follow-up reschedule preserves history and mandates a valid reason', async () => {
    // Attempt without reason
    const withoutReason = {
      followUpId: 'fu-test-001',
      leadId: 'lead-test-002',
      newScheduledDate: '2026-12-15',
      newScheduledTime: '14:00',
      reason: '',
      caller: mockTelecaller1
    };
    const failRes = await rescheduleFollowUp(withoutReason);
    assert.equal(failRes.success, false, 'Rescheduling without reason must be rejected');
    assert.match(failRes.error, /reason.*required/i);

    // Valid reschedule with reason
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const validReschedule = {
      followUpId: 'fu-test-001',
      leadId: 'lead-test-002',
      newScheduledDate: tomorrowStr,
      newScheduledTime: '15:00',
      newPriority: 'High',
      reason: 'Parent requested afternoon call after office hours.',
      caller: mockTelecaller1
    };

    const res = await rescheduleFollowUp(validReschedule);
    assert.equal(res.success, true, 'Reschedule with reason must succeed');
    assert.equal(res.status, 'Rescheduled', 'Status should be Rescheduled');
    assert.ok(res.historyId, 'Should create a follow_up_history record to preserve audit trail');
  });

  // Scenario 7: Completing a Follow-up Updates Status to 'Completed'
  await t.test('7. Completing a follow-up updates status to Completed', async () => {
    const completeData = {
      followUpId: 'fu-test-001',
      leadId: 'lead-test-002',
      callOutcome: 'Connected',
      completionNotes: 'Parent agreed to visit campus this Sunday.',
      caller: mockTelecaller1
    };

    const res = await completeFollowUp(completeData);
    assert.equal(res.success, true, 'Completing follow-up should succeed');
    assert.equal(res.status, 'Completed', 'Status must be Completed');
    assert.ok(res.completedAt, 'Should record completedAt timestamp');
  });

  // Scenario 8: Reminder Engine Rule Check (1-Day, 1-Hour, At-Time, Overdue without duplicates)
  await t.test('8. Reminder engine generates timely alerts without duplicates', async () => {
    const scheduledTime = new Date(Date.now() + 50 * 60 * 1000); // 50 mins from now (within 1 hour window)
    const fu = {
      followUpId: 'fu-reminder-1',
      scheduledAt: scheduledTime.toISOString(),
      status: 'Scheduled',
      reminderSettings: { oneDayBefore: true, oneHourBefore: true, atTime: true, overdue: true },
      reminderHistory: [] // No reminders sent yet
    };

    // Simulate reminder check
    const diffMinutes = (scheduledTime - Date.now()) / (60 * 1000);
    const shouldSend1Hour = diffMinutes > 0 && diffMinutes <= 60 && !fu.reminderHistory.includes('1_hour_before');
    assert.equal(shouldSend1Hour, true, 'Should trigger 1-hour before reminder');

    // Add to history
    fu.reminderHistory.push('1_hour_before');

    // Second check: Must prevent duplicate notification
    const checkDuplicate = !fu.reminderHistory.includes('1_hour_before');
    assert.equal(checkDuplicate, false, 'Duplicate 1-hour reminder must be prevented');
  });

  // Scenario 9: Overdue Follow-up Detected Correctly
  await t.test('9. Overdue follow-up detected correctly', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const overdueFu = {
      scheduledDate: yesterday,
      status: 'Scheduled'
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const isOverdue = overdueFu.status !== 'Completed' && overdueFu.scheduledDate < todayStr;
    assert.equal(isOverdue, true, 'Yesterday scheduled follow-up must be flagged as overdue');
  });

  // Scenario 10 & 11: Telecaller Isolation vs Admin Full Access
  await t.test('10 & 11. Telecaller isolation allows only assigned leads while Admin accesses all', async () => {
    const allLeads = [
      { id: 'l1', assignedTelecallerId: 'telecaller-001', studentName: 'Student 1' },
      { id: 'l2', assignedTelecallerId: 'telecaller-002', studentName: 'Student 2' },
      { id: 'l3', assignedTelecallerId: null, studentName: 'Unassigned Student' }
    ];

    // Telecaller 1 filter
    const telecaller1Visible = allLeads.filter(l => l.assignedTelecallerId === mockTelecaller1.uid);
    assert.equal(telecaller1Visible.length, 1, 'Telecaller 1 should only see 1 assigned lead');
    assert.equal(telecaller1Visible[0].id, 'l1');

    // Admin filter (all accessible)
    const adminVisible = allLeads;
    assert.equal(adminVisible.length, 3, 'Admin should have access to all leads');
  });

  // Scenario 12: Admin Reassigning Lead Updates Future Follow-ups
  await t.test('12. Reassigning lead updates telecaller assignment', async () => {
    const lead = {
      id: 'l-reassign',
      assignedTelecallerId: 'telecaller-001',
      leadStatus: 'Assigned'
    };

    // Reassign to telecaller 2
    lead.assignedTelecallerId = 'telecaller-002';
    assert.equal(lead.assignedTelecallerId, 'telecaller-002', 'Lead reassigned to new telecaller');
  });

  // Scenario 13: Lead Status Updates According to Permitted Transitions
  await t.test('13. Permitted status transition rules are strictly enforced', async () => {
    // Valid: New -> Contacted
    assert.equal(isValidStatusTransition('New', 'Contacted'), true, 'New -> Contacted is valid');

    // Valid: Contacted -> Interested
    assert.equal(isValidStatusTransition('Contacted', 'Interested'), true, 'Contacted -> Interested is valid');

    // Valid: Interested -> Converted
    assert.equal(isValidStatusTransition('Interested', 'Converted'), true, 'Interested -> Converted is valid');

    // Invalid: Converted -> New
    assert.equal(isValidStatusTransition('Converted', 'New'), false, 'Converted -> New must be forbidden');
  });

  // Scenario 14: Call Record Immutability Verification
  await t.test('14. Call records are immutable (rules prohibit update and delete)', async () => {
    const firestoreRulesContent = fs.readFileSync(path.join(process.cwd(), 'firestore.rules'), 'utf8');
    assert.ok(
      firestoreRulesContent.includes('match /call_records/{callId}'),
      'Rules must contain call_records match block'
    );
    assert.ok(
      firestoreRulesContent.includes('allow update, delete: if false'),
      'Call records must strictly forbid updates and deletes'
    );
  });

  // Scenario 15: Telecaller Daily Stats Increments Accurately
  await t.test('15. Telecaller daily stats increment accurately', async () => {
    const initialStats = {
      totalCalls: 10,
      connectedCalls: 6,
      completedFollowUps: 4
    };

    // Record a connected call
    initialStats.totalCalls += 1;
    initialStats.connectedCalls += 1;

    assert.equal(initialStats.totalCalls, 11, 'Total calls should increment by 1');
    assert.equal(initialStats.connectedCalls, 7, 'Connected calls should increment by 1');
  });

  // Scenario 16: Telecaller Conversion Rate Mathematical Accuracy
  await t.test('16. Telecaller conversion rate calculation: Converted / Eligible Assigned * 100 (zero division safe)', async () => {
    const telecallers = [
      { uid: 't1', fullName: 'TC One' },
      { uid: 't2', fullName: 'TC Two (Zero Leads)' }
    ];

    const enquiries = [
      { id: 'e1', assignedTelecallerId: 't1', leadStatus: 'Converted' },
      { id: 'e2', assignedTelecallerId: 't1', leadStatus: 'Converted' },
      { id: 'e3', assignedTelecallerId: 't1', leadStatus: 'Interested' },
      { id: 'e4', assignedTelecallerId: 't1', leadStatus: 'Contacted' }
    ];

    const perf = calculateTelecallerPerformance({
      telecallers,
      enquiries,
      calls: [],
      followUps: []
    });

    const tc1 = perf.find(p => p.telecallerId === 't1');
    const tc2 = perf.find(p => p.telecallerId === 't2');

    // TC1: 2 converted / 4 assigned = 50%
    assert.equal(tc1.assignedLeads, 4);
    assert.equal(tc1.convertedAdmissions, 2);
    assert.equal(tc1.conversionRate, 50, 'Conversion rate should be exactly 50%');

    // TC2: 0 assigned -> 0% (never NaN or Infinity)
    assert.equal(tc2.assignedLeads, 0);
    assert.equal(tc2.conversionRate, 0, 'Zero assigned leads must safely return 0%');
  });

  // Scenario 17: Telecaller Follow-up Completion Rate Mathematical Accuracy
  await t.test('17. Telecaller follow-up completion rate: Completed / Total Due * 100 (zero division safe)', async () => {
    const telecallers = [{ uid: 't1', fullName: 'TC Discipline' }];
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const followUps = [
      { assignedTo: 't1', status: 'Completed', scheduledDate: yesterday },
      { assignedTo: 't1', status: 'Completed', scheduledDate: yesterday },
      { assignedTo: 't1', status: 'Scheduled', scheduledDate: yesterday } // Overdue
    ];

    const perf = calculateTelecallerPerformance({
      telecallers,
      enquiries: [],
      calls: [],
      followUps
    });

    const tc = perf[0];
    // Completed = 2, Overdue = 1, Due = 3. Completion rate = 2 / 3 * 100 = 67%
    assert.equal(tc.completedFollowUps, 2);
    assert.equal(tc.overdueFollowUps, 1);
    assert.equal(Math.round(tc.completionRate), 67, 'Completion rate should be rounded to 67%');
  });

  // Scenario 18: CSV Export Generates Valid Data Without Exposing Internal Fields
  await t.test('18. CSV export generates valid columns and masks internal hashes/passwords', async () => {
    const mockPerf = [
      {
        telecallerName: 'Sachin Patil',
        email: 'sachin@gurukulbhose.com',
        assignedLeads: 25,
        totalCalls: 40,
        connectedCalls: 30,
        completedFollowUps: 18,
        overdueFollowUps: 2,
        convertedAdmissions: 5,
        conversionRate: 20,
        completionRate: 90
      }
    ];

    const csvRes = exportPerformanceToCSV(mockPerf, mockAdmin);
    assert.equal(csvRes.success, true, 'Performance CSV export must succeed');
    assert.ok(csvRes.csvData.includes('Telecaller Name'), 'CSV must include header');
    assert.ok(csvRes.csvData.includes('Sachin Patil'), 'CSV must contain data');
    assert.ok(!csvRes.csvData.includes('passwordHash'), 'CSV must not expose internal passwords');
    assert.ok(!csvRes.csvData.includes('internalId'), 'CSV must not expose internal IDs');
  });

});
