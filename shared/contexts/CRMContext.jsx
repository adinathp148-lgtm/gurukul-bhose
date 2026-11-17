import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  isConfigured,
  query,
  where,
  orderBy,
  limit
} from '../firebase/config';
import { 
  demoLeads, 
  demoFollowUps, 
  demoAdmissions, 
  demoUsers,
  demoCampusVisits,
  demoAdmissionApplications 
} from '../data/initialData';
import { isDemoTelecaller } from '../services/auth/authService';
import { useAuth } from './AuthContext';
import {
  VISIT_PURPOSES,
  VISIT_STATUSES,
  VISIT_INTEREST_LEVELS,
  VISIT_NEXT_ACTIONS,
  DEFAULT_SLOTS,
  DEFAULT_VISIT_SCHEDULE_SETTINGS,
  generateVisitNumber,
  isHolidayOrClosed,
  isPastDate,
  getSlotAvailability,
  createCampusVisit as serviceCreateCampusVisit,
  approveCampusVisit as serviceApproveCampusVisit,
  rejectCampusVisit as serviceRejectCampusVisit,
  rescheduleCampusVisit as serviceRescheduleCampusVisit,
  cancelCampusVisit as serviceCancelCampusVisit,
  checkInCampusVisit as serviceCheckInCampusVisit,
  checkOutCampusVisit as serviceCheckOutCampusVisit,
  submitCampusVisitFeedback as serviceSubmitCampusVisitFeedback,
  calculateVisitMetrics,
  exportVisitsToCSV
} from '../services/firestore/visitService';
import {
  ADMISSION_STAGES,
  STAGE_CONFIG,
  DOCUMENT_STATUSES,
  DEFAULT_REQUIRED_DOCUMENTS,
  getClassRequiredDocuments,
  generateApplicationNumber,
  createAdmissionApplication as serviceCreateAdmissionApplication,
  updateAdmissionStage as serviceUpdateAdmissionStage,
  reviewAdmissionDocument as serviceReviewAdmissionDocument
} from '../services/firestore/admissionService';
import {
  LEAD_STATUS_CONFIG,
  LEAD_STATUS_LIST,
  PERMITTED_STATUS_TRANSITIONS,
  isValidStatusTransition,
  normalizePhoneNumber,
  detectDuplicateLead,
  calculateCRMAnalytics,
  exportLeadsToCSV,
  submitPublicAdmissionEnquiry,
  createManualEnquiry,
  assignLeadToTelecaller,
  bulkAssignLeads,
  updateLeadStatus,
  recordCallAttempt,
  reviewDuplicate,
  VALID_CALL_OUTCOMES,
  VALID_INTEREST_LEVELS,
  VALID_PRIORITIES,
  VALID_FOLLOW_UP_STATUSES,
  recordCall as serviceRecordCall,
  scheduleFollowUp as serviceScheduleFollowUp,
  rescheduleFollowUp as serviceRescheduleFollowUp,
  completeFollowUp as serviceCompleteFollowUp,
  triggerFollowUpReminders,
  calculateTelecallerPerformance,
  exportPerformanceToCSV,
  exportCallMonitoringToCSV
} from '../services/firestore/crmService';
import {
  DEFAULT_SYSTEM_SETTINGS,
  SYSTEM_AUDIT_ACTIONS,
  recordAuditLog,
  fetchSystemAuditLogs,
  fetchSystemSettings,
  saveSystemSettings as serviceSaveSystemSettings,
  broadcastAnnouncement as serviceBroadcastAnnouncement,
  generateCRMReports,
  exportReportToCSV
} from '../services/firestore/systemService';

const CRMContext = createContext(null);

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

export const CRMProvider = ({ children }) => {
  const { userProfile, isTelecaller, isAdmin, isSuperAdmin, currentUser } = useAuth();
  
  // 1. Core State
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_leads');
    return saved ? JSON.parse(saved) : demoLeads;
  });

  const [followUps, setFollowUps] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_followups');
    return saved ? JSON.parse(saved) : demoFollowUps;
  });

  const [calls, setCalls] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_calls');
    return saved ? JSON.parse(saved) : [];
  });

  const [followUpHistory, setFollowUpHistory] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_followup_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [telecallerStats, setTelecallerStats] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_daily_stats');
    return saved ? JSON.parse(saved) : [];
  });

  const [admissions, setAdmissions] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_admissions');
    return saved ? JSON.parse(saved) : demoAdmissions;
  });

  const [telecallers, setTelecallers] = useState(() => {
    try {
      const saved = localStorage.getItem('gurukul_crm_telecallers');
      if (saved) {
        const parsed = JSON.parse(saved).filter(t => t.status === 'active' && !isDemoTelecaller(t));
        if (parsed.length > 0) return parsed;
      }
      const stored = localStorage.getItem('gurukul_stored_telecallers');
      if (stored) {
        const parsed = JSON.parse(stored).filter(t => t.status === 'active' && !isDemoTelecaller(t));
        if (parsed.length > 0) return parsed;
      }
      const registered = localStorage.getItem('gurukul_registered_telecallers');
      if (registered) {
        const parsed = JSON.parse(registered).filter(t => t.status === 'active' && !isDemoTelecaller(t));
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_activities');
    return saved ? JSON.parse(saved) : [];
  });

  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_assignments');
    return saved ? JSON.parse(saved) : [];
  });

  const [statusHistory, setStatusHistory] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_status_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [duplicates, setDuplicates] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_duplicates');
    return saved ? JSON.parse(saved) : [];
  });

  const [visits, setVisits] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_campus_visits');
    return saved ? JSON.parse(saved) : demoCampusVisits;
  });

  const [visitSettings, setVisitSettings] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_visit_settings');
    return saved ? JSON.parse(saved) : DEFAULT_VISIT_SCHEDULE_SETTINGS;
  });

  const [visitFeedback, setVisitFeedback] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_visit_feedback');
    return saved ? JSON.parse(saved) : [];
  });

  const [admissionApplications, setAdmissionApplications] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_admission_applications');
    return saved ? JSON.parse(saved) : demoAdmissionApplications;
  });

  const [admissionStageHistory, setAdmissionStageHistory] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_stage_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'notif-1',
        title: 'सत्र 2026-2027 प्रवेश नोंदणी सुरू',
        message: 'गुरुकुल भोसे 5 वी ते 12 वी सैनिक पॅटर्न निवासी प्रवेश प्रक्रिया सक्रिय आहे.',
        category: 'enquiry',
        read: false,
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Phase 9: System Settings and Audit Trail
  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem('gurukul_system_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('gurukul_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Local storage synchronization
  useEffect(() => { localStorage.setItem('gurukul_crm_leads', JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem('gurukul_crm_followups', JSON.stringify(followUps)); }, [followUps]);
  useEffect(() => { localStorage.setItem('gurukul_crm_calls', JSON.stringify(calls)); }, [calls]);
  useEffect(() => { localStorage.setItem('gurukul_crm_followup_history', JSON.stringify(followUpHistory)); }, [followUpHistory]);
  useEffect(() => { localStorage.setItem('gurukul_crm_daily_stats', JSON.stringify(telecallerStats)); }, [telecallerStats]);
  useEffect(() => { localStorage.setItem('gurukul_crm_admissions', JSON.stringify(admissions)); }, [admissions]);
  useEffect(() => { localStorage.setItem('gurukul_crm_telecallers', JSON.stringify(telecallers)); }, [telecallers]);
  useEffect(() => { localStorage.setItem('gurukul_crm_activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('gurukul_crm_assignments', JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { localStorage.setItem('gurukul_crm_status_history', JSON.stringify(statusHistory)); }, [statusHistory]);
  useEffect(() => { localStorage.setItem('gurukul_crm_duplicates', JSON.stringify(duplicates)); }, [duplicates]);
  useEffect(() => { localStorage.setItem('gurukul_crm_campus_visits', JSON.stringify(visits)); }, [visits]);
  useEffect(() => { localStorage.setItem('gurukul_crm_visit_settings', JSON.stringify(visitSettings)); }, [visitSettings]);
  useEffect(() => { localStorage.setItem('gurukul_crm_visit_feedback', JSON.stringify(visitFeedback)); }, [visitFeedback]);
  useEffect(() => { localStorage.setItem('gurukul_crm_admission_applications', JSON.stringify(admissionApplications)); }, [admissionApplications]);
  useEffect(() => { localStorage.setItem('gurukul_crm_stage_history', JSON.stringify(admissionStageHistory)); }, [admissionStageHistory]);
  useEffect(() => { localStorage.setItem('gurukul_crm_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('gurukul_system_settings', JSON.stringify(systemSettings)); }, [systemSettings]);
  useEffect(() => { localStorage.setItem('gurukul_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);

  // 2. Live Firestore Subscriptions
  useEffect(() => {
    if (!isConfigured || !db) return;

    // A. Enquiries subscription
    const unsubEnquiries = onSnapshot(collection(db, 'enquiries'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreEnquiries = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          leadStatus: d.data().status || d.data().leadStatus || 'New',
          status: d.data().status || d.data().leadStatus || 'New',
          mobileNumber: d.data().normalizedMobile || d.data().mobile || d.data().mobileNumber,
          assignedTelecallerId: d.data().assignedTo || d.data().assignedTelecallerId
        }));
        setLeads(firestoreEnquiries);
      }
    }, (err) => {
      console.warn("Firestore live enquiries sync notice:", err.message);
    });

    // B. Telecallers subscription (from users collection - ONLY approved active telecallers)
    const qTele = query(collection(db, 'users'), where('role', '==', 'telecaller'));
    const unsubTelecallers = onSnapshot(qTele, (snapshot) => {
      if (!snapshot.empty) {
        const teleList = snapshot.docs
          .map(d => ({
            uid: d.id,
            id: d.id,
            displayName: d.data().fullName,
            fullName: d.data().fullName,
            ...d.data()
          }))
          .filter(t => t.status === 'active' && !isDemoTelecaller(t));
        if (teleList.length > 0) {
          setTelecallers(prev => {
            const map = new Map();
            prev.filter(t => t.status === 'active' && !isDemoTelecaller(t)).forEach(p => map.set(p.uid || p.id, p));
            teleList.forEach(p => map.set(p.uid || p.id, p));
            return Array.from(map.values());
          });
        }
      }
    }, () => {});

    // Live subscription for telecaller_profiles collection (ONLY approved active telecallers)
    const unsubTeleProfiles = onSnapshot(collection(db, 'telecaller_profiles'), (snapshot) => {
      if (!snapshot.empty) {
        const profileList = snapshot.docs
          .map(d => ({
            uid: d.id,
            id: d.id,
            displayName: d.data().fullName,
            fullName: d.data().fullName,
            ...d.data()
          }))
          .filter(t => t.status === 'active' && !isDemoTelecaller(t));

        if (profileList.length > 0) {
          setTelecallers(prev => {
            const map = new Map();
            prev.filter(t => t.status === 'active' && !isDemoTelecaller(t)).forEach(p => map.set(p.uid || p.id, p));
            profileList.forEach(p => map.set(p.uid || p.id, p));
            return Array.from(map.values());
          });
        }
      }
    }, () => {});

    // C. Notifications subscription
    const unsubNotifs = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      if (!snapshot.empty) {
        const notifList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setNotifications(notifList);
      }
    }, () => {});

    // D. Activities subscription
    const unsubActivities = onSnapshot(collection(db, 'lead_activities'), (snapshot) => {
      if (!snapshot.empty) {
        const actList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setActivities(actList);
      }
    }, () => {});

    // E. Assignments subscription
    const unsubAssignments = onSnapshot(collection(db, 'lead_assignments'), (snapshot) => {
      if (!snapshot.empty) {
        const asgList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setAssignments(asgList);
      }
    }, () => {});

    // F. Duplicates subscription
    const unsubDuplicates = onSnapshot(collection(db, 'lead_duplicates'), (snapshot) => {
      if (!snapshot.empty) {
        const dupList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setDuplicates(dupList);
      }
    }, () => {});

    // G. Phase 6: Call Records subscription
    const unsubCalls = onSnapshot(collection(db, 'call_records'), (snapshot) => {
      if (!snapshot.empty) {
        const callList = snapshot.docs.map(d => ({ id: d.id, callId: d.id, ...d.data() }));
        setCalls(callList);
      }
    }, () => {});

    // H. Phase 6: Follow-ups subscription
    const unsubFollowUps = onSnapshot(collection(db, 'follow_ups'), (snapshot) => {
      if (!snapshot.empty) {
        const fuList = snapshot.docs.map(d => ({ id: d.id, followUpId: d.id, ...d.data() }));
        setFollowUps(fuList);
      }
    }, () => {});

    // I. Phase 6: Follow-up History subscription
    const unsubFuHistory = onSnapshot(collection(db, 'follow_up_history'), (snapshot) => {
      if (!snapshot.empty) {
        const histList = snapshot.docs.map(d => ({ id: d.id, historyId: d.id, ...d.data() }));
        setFollowUpHistory(histList);
      }
    }, () => {});

    // J. Phase 6: Telecaller Daily Stats subscription
    const unsubDailyStats = onSnapshot(collection(db, 'telecaller_daily_stats'), (snapshot) => {
      if (!snapshot.empty) {
        const statsList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setTelecallerStats(statsList);
      }
    }, () => {});

    // K. Phase 9: System Settings subscription
    const unsubSettings = onSnapshot(doc(db, 'system_settings', 'global_config'), (snapshot) => {
      if (snapshot.exists()) {
        setSystemSettings(prev => ({ ...prev, ...snapshot.data() }));
      }
    }, () => {});

    // L. Phase 9: Audit Logs subscription
    const qAudit = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(150));
    const unsubAudit = onSnapshot(qAudit, (snapshot) => {
      if (!snapshot.empty) {
        const logList = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          timestamp: d.data().timestamp?.toDate ? d.data().timestamp.toDate().toISOString() : (d.data().timestamp || d.data().createdAt)
        }));
        setAuditLogs(logList);
      }
    }, () => {});

    return () => {
      unsubEnquiries();
      unsubTelecallers();
      unsubTeleProfiles();
      unsubNotifs();
      unsubActivities();
      unsubAssignments();
      unsubDuplicates();
      unsubCalls();
      unsubFollowUps();
      unsubFuHistory();
      unsubDailyStats();
      unsubSettings();
      unsubAudit();
    };
  }, []);

  // 3. Telecaller Lead & Activity Isolation
  // Telecallers only see leads, calls, and follow-ups assigned to them!
  const visibleLeads = useMemo(() => {
    if (isTelecaller && (userProfile?.uid || currentUser?.uid)) {
      const callerId = userProfile?.uid || currentUser?.uid;
      return leads.filter(l => l.assignedTo === callerId || l.assignedTelecallerId === callerId);
    }
    return leads;
  }, [leads, isTelecaller, userProfile, currentUser]);

  const visibleCalls = useMemo(() => {
    if (isTelecaller && (userProfile?.uid || currentUser?.uid)) {
      const callerId = userProfile?.uid || currentUser?.uid;
      return calls.filter(c => c.telecallerId === callerId);
    }
    return calls;
  }, [calls, isTelecaller, userProfile, currentUser]);

  const visibleFollowUps = useMemo(() => {
    if (isTelecaller && (userProfile?.uid || currentUser?.uid)) {
      const callerId = userProfile?.uid || currentUser?.uid;
      return followUps.filter(f => f.assignedTo === callerId || f.telecallerId === callerId);
    }
    return followUps;
  }, [followUps, isTelecaller, userProfile, currentUser]);

  const visibleVisits = useMemo(() => {
    if (isTelecaller && !isAdmin && !isSuperAdmin) {
      const callerId = userProfile?.uid || currentUser?.uid;
      const myAssignedLeadIds = new Set(
        leads.filter(l => l.assignedTelecallerId === callerId || l.assignedTo === callerId).map(l => l.id || l.leadId)
      );
      return visits.filter(v => 
        (v.leadId && myAssignedLeadIds.has(v.leadId)) ||
        v.createdBy === callerId ||
        v.assignedStaffId === callerId
      );
    }
    return visits;
  }, [visits, isTelecaller, isAdmin, isSuperAdmin, leads, userProfile, currentUser]);

  const visibleApplications = useMemo(() => {
    if (isTelecaller && !isAdmin && !isSuperAdmin) {
      const callerId = userProfile?.uid || currentUser?.uid;
      const myAssignedLeadIds = new Set(
        leads.filter(l => l.assignedTelecallerId === callerId || l.assignedTo === callerId).map(l => l.id || l.leadId)
      );
      return admissionApplications.filter(a => 
        (a.leadId && myAssignedLeadIds.has(a.leadId)) ||
        a.assignedStaffId === callerId
      );
    }
    return admissionApplications;
  }, [admissionApplications, isTelecaller, isAdmin, isSuperAdmin, leads, userProfile, currentUser]);

  // 4. Duplicate Check Helper
  const checkDuplicateLead = (mobile, email, studentName, admissionClass) => {
    return detectDuplicateLead(leads, {
      mobileNumber: mobile,
      email,
      studentName,
      admissionClass
    });
  };

  // 5. Analytics computation
  const analytics = useMemo(() => {
    return calculateCRMAnalytics(leads);
  }, [leads]);

  // 6. Action Methods

  // A. Public Website Form Submission
  const submitAdmissionEnquiry = async (formData) => {
    const res = await submitPublicAdmissionEnquiry(formData);
    if (res.success && (!isConfigured || !db)) {
      // Offline local simulation
      const newLocalLead = {
        id: `enq-${Date.now()}`,
        leadNumber: res.leadNumber,
        parentName: formData.parentName,
        studentName: formData.studentName,
        mobileNumber: formData.mobileNumber,
        normalizedMobile: normalizePhoneNumber(formData.mobileNumber),
        whatsappNumber: formData.whatsappNumber || formData.mobileNumber,
        email: formData.email,
        admissionClass: formData.admissionClass,
        academicYear: formData.academicYear || '2026-2027',
        course: formData.course || 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)',
        leadSource: 'Website',
        source: 'Website',
        status: 'New',
        leadStatus: 'New',
        assignedTo: null,
        assignedTelecallerId: null,
        assignedTelecallerName: null,
        notes: formData.message || 'वेबसाईटवरून प्राप्त झालेला नवीन अर्ज.',
        createdAt: new Date().toISOString()
      };
      setLeads(prev => [newLocalLead, ...prev]);

      const initialAct = {
        id: `act-${Date.now()}`,
        leadId: newLocalLead.id,
        leadNumber: res.leadNumber,
        activityType: 'Enquiry Created',
        description: `Admission enquiry submitted via website for ${formData.studentName}`,
        previousValue: null,
        newValue: 'New',
        performedBy: 'SYSTEM',
        performedByRole: 'public',
        createdAt: new Date().toISOString()
      };
      setActivities(prev => [initialAct, ...prev]);

      // Admin notification
      const newNotif = {
        id: `notif-${Date.now()}`,
        recipientId: 'ADMIN',
        title: 'नवीन प्रवेश अर्ज प्राप्त',
        message: `${formData.studentName} (${formData.admissionClass}) - ${res.leadNumber}`,
        category: 'enquiry',
        leadId: newLocalLead.id,
        leadNumber: res.leadNumber,
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
    return res;
  };

  // B. Manual Lead Creation (Admin / Staff)
  const addLead = async (leadData) => {
    const dupCheck = checkDuplicateLead(
      leadData.mobileNumber,
      leadData.email,
      leadData.studentName,
      leadData.admissionClass
    );

    if (dupCheck.isDuplicate && !leadData.forceCreate) {
      return {
        success: false,
        isDuplicate: true,
        matchedLead: dupCheck.matchedLead,
        message: `संभाव्य नक्कल नोंदणी: ${dupCheck.reason}`
      };
    }

    const caller = {
      uid: userProfile?.uid || currentUser?.uid || 'ADMIN',
      fullName: userProfile?.fullName || userProfile?.displayName || 'Admin',
      role: userProfile?.role || 'admin'
    };

    const res = await createManualEnquiry(leadData, caller);
    if (res.success && (!isConfigured || !db)) {
      const newLocalLead = {
        id: res.leadId || `lead-${Date.now()}`,
        leadNumber: res.leadNumber,
        ...leadData,
        normalizedMobile: normalizePhoneNumber(leadData.mobileNumber),
        status: leadData.assignedTo ? 'Assigned' : 'New',
        leadStatus: leadData.assignedTo ? 'Assigned' : 'New',
        createdAt: new Date().toISOString()
      };
      setLeads(prev => [newLocalLead, ...prev]);
    }
    return res;
  };

  // C. Lead Assignment & Reassignment
  const assignLead = async (leadId, telecallerId, reason = '') => {
    const targetTelecaller = telecallers.find(t => t.uid === telecallerId || t.id === telecallerId);
    const caller = {
      uid: userProfile?.uid || currentUser?.uid || 'ADMIN',
      fullName: userProfile?.fullName || 'Admin',
      role: userProfile?.role || 'admin'
    };

    const res = await assignLeadToTelecaller({
      leadId,
      telecallerId,
      telecaller: targetTelecaller,
      caller,
      reason
    });

    if (res.success && (!isConfigured || !db)) {
      setLeads(prev => prev.map(l => {
        if (l.id === leadId) {
          return {
            ...l,
            assignedTo: telecallerId,
            assignedTelecallerId: telecallerId,
            assignedTelecallerName: targetTelecaller?.fullName || targetTelecaller?.displayName || 'Counselor',
            status: 'Assigned',
            leadStatus: 'Assigned',
            updatedAt: new Date().toISOString()
          };
        }
        return l;
      }));

      // Add local assignment
      setAssignments(prev => [
        {
          id: `asg-${Date.now()}`,
          leadId,
          telecallerId,
          telecallerName: targetTelecaller?.fullName || 'Counselor',
          assignedBy: caller.uid,
          assignedAt: new Date().toISOString(),
          assignmentReason: reason || 'Routine Assignment',
          assignmentStatus: 'active'
        },
        ...prev
      ]);

      // Add local activity
      setActivities(prev => [
        {
          id: `act-${Date.now()}`,
          leadId,
          activityType: 'Lead Assigned',
          description: `Lead assigned to ${targetTelecaller?.fullName || 'Counselor'}`,
          previousValue: 'Unassigned',
          newValue: targetTelecaller?.fullName || 'Counselor',
          performedBy: caller.uid,
          performedByRole: caller.role,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    }

    return res;
  };

  // D. Bulk Assign
  const bulkAssign = async (leadIds, telecallerId, reason = '') => {
    const targetTelecaller = telecallers.find(t => t.uid === telecallerId || t.id === telecallerId);
    const caller = {
      uid: userProfile?.uid || currentUser?.uid || 'ADMIN',
      fullName: userProfile?.fullName || 'Admin',
      role: userProfile?.role || 'admin'
    };

    const res = await bulkAssignLeads({
      leadIds,
      telecallerId,
      telecaller: targetTelecaller,
      caller,
      reason
    });

    if (res.success && (!isConfigured || !db)) {
      setLeads(prev => prev.map(l => {
        if (leadIds.includes(l.id)) {
          return {
            ...l,
            assignedTo: telecallerId,
            assignedTelecallerId: telecallerId,
            assignedTelecallerName: targetTelecaller?.fullName || targetTelecaller?.displayName || 'Counselor',
            status: 'Assigned',
            leadStatus: 'Assigned',
            updatedAt: new Date().toISOString()
          };
        }
        return l;
      }));
    }

    return res;
  };

  // E. Update Lead Status
  const changeLeadStatus = async (leadId, newStatus, reason = '', nextFollowupAt = null, notes = '') => {
    const lead = leads.find(l => l.id === leadId);
    const prevStatus = lead?.status || lead?.leadStatus || 'New';
    const caller = {
      uid: userProfile?.uid || currentUser?.uid || 'STAFF',
      role: userProfile?.role || 'staff'
    };

    // Transition validation
    if (!isValidStatusTransition(prevStatus, newStatus, caller.role)) {
      return {
        success: false,
        message: `'${prevStatus}' वरून '${newStatus}' स्थिती बदलण्यास नियमांनुसार परवानगी नाही.`
      };
    }

    const res = await updateLeadStatus({
      leadId,
      leadNumber: lead?.leadNumber || leadId,
      previousStatus: prevStatus,
      newStatus,
      reason,
      nextFollowupAt,
      notes,
      caller
    });

    if (res.success && (!isConfigured || !db)) {
      setLeads(prev => prev.map(l => {
        if (l.id === leadId) {
          return {
            ...l,
            status: newStatus,
            leadStatus: newStatus,
            nextFollowUp: nextFollowupAt || l.nextFollowUp,
            notes: notes || l.notes,
            updatedAt: new Date().toISOString(),
            lastContactedAt: new Date().toISOString()
          };
        }
        return l;
      }));

      setStatusHistory(prev => [
        {
          id: `hist-${Date.now()}`,
          leadId,
          previousStatus: prevStatus,
          newStatus,
          changedBy: caller.uid,
          userRole: caller.role,
          changedAt: new Date().toISOString(),
          reason
        },
        ...prev
      ]);

      setActivities(prev => [
        {
          id: `act-${Date.now()}`,
          leadId,
          activityType: newStatus === 'Converted' ? 'Lead Converted' : 'Status Changed',
          description: `Status changed from ${prevStatus} to ${newStatus}.${reason ? ` Reason: ${reason}` : ''}`,
          previousValue: prevStatus,
          newValue: newStatus,
          performedBy: caller.uid,
          performedByRole: caller.role,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    }

    return res;
  };

  // F. Record Call Attempt / Follow-Up Note
  const logCallAttempt = async (leadId, { callOutcome, parentResponse, nextFollowupAt, statusChange }) => {
    const lead = leads.find(l => l.id === leadId);
    const caller = {
      uid: userProfile?.uid || currentUser?.uid || 'TELECALLER',
      role: userProfile?.role || 'telecaller'
    };

    const res = await recordCallAttempt({
      leadId,
      leadNumber: lead?.leadNumber || leadId,
      callOutcome,
      parentResponse,
      nextFollowupAt,
      statusChange,
      caller
    });

    if (res.success && (!isConfigured || !db)) {
      const todayStr = new Date().toISOString().split('T')[0];
      setLeads(prev => prev.map(l => {
        if (l.id === leadId) {
          return {
            ...l,
            lastFollowUp: todayStr,
            lastContactedAt: new Date().toISOString(),
            nextFollowUp: nextFollowupAt || l.nextFollowUp,
            status: statusChange || l.status,
            leadStatus: statusChange || l.leadStatus,
            notes: parentResponse || l.notes,
            updatedAt: new Date().toISOString()
          };
        }
        return l;
      }));

      setFollowUps(prev => [
        {
          id: `fol-${Date.now()}`,
          leadId,
          telecallerId: caller.uid,
          telecallerName: userProfile?.fullName || userProfile?.displayName || 'Counselor',
          contactedAt: new Date().toISOString(),
          callType: 'Outgoing Call',
          parentResponse,
          scheduledNextDate: nextFollowupAt,
          statusOutcome: statusChange || lead?.status || 'Interested'
        },
        ...prev
      ]);

      setActivities(prev => [
        {
          id: `act-${Date.now()}`,
          leadId,
          activityType: callOutcome.toLowerCase().includes('connected') ? 'Contact Successful' : 'Call Attempt',
          description: `Call outcome: ${callOutcome}.${parentResponse ? ` Notes: ${parentResponse}` : ''}`,
          previousValue: null,
          newValue: callOutcome,
          performedBy: caller.uid,
          performedByRole: caller.role,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    }

    return res;
  };

  // G. Review Duplicate
  const resolveDuplicate = async (leadId, duplicateId, action, notes) => {
    const caller = {
      uid: userProfile?.uid || currentUser?.uid || 'ADMIN',
      role: userProfile?.role || 'admin'
    };

    const res = await reviewDuplicate({
      leadId,
      duplicateId,
      action,
      notes,
      caller
    });

    if (res.success && (!isConfigured || !db)) {
      setLeads(prev => prev.map(l => {
        if (l.id === leadId) {
          return {
            ...l,
            isDuplicate: action === 'update_existing' ? l.isDuplicate : false,
            duplicateReviewStatus: action === 'update_existing' ? 'resolved_updated' : 'resolved_new',
            adminRemarks: notes || 'Duplicate reviewed by Admin'
          };
        }
        return l;
      }));

      setDuplicates(prev => prev.map(d => {
        if (d.id === duplicateId || d.leadId === leadId) {
          return {
            ...d,
            status: action === 'update_existing' ? 'resolved_updated' : 'resolved_new',
            resolvedBy: caller.uid,
            resolvedAt: new Date().toISOString()
          };
        }
        return d;
      }));
    }

    return res;
  };

  // H. CSV Export
  const exportCRMLeads = (filteredList) => {
    const caller = {
      uid: userProfile?.uid || currentUser?.uid || 'ADMIN',
      role: userProfile?.role || 'admin'
    };
    return exportLeadsToCSV(filteredList || visibleLeads, caller);
  };

  // I. Notifications Management
  const markNotificationAsRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    if (isConfigured && db) {
      updateDoc(doc(db, 'notifications', notifId), { read: true }).catch(() => {});
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Backward compatibility methods
  const updateLead = async (leadId, updates) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
    if (isConfigured && db) {
      try {
        await updateDoc(doc(db, 'enquiries', leadId), updates);
      } catch {}
      try {
        await updateDoc(doc(db, 'leads', leadId), updates);
      } catch {}
    }
  };

  const logFollowUp = async (data) => {
    return await logCallAttempt(data.leadId, {
      callOutcome: 'Connected',
      parentResponse: data.parentResponse,
      nextFollowupAt: data.scheduledNextDate,
      statusChange: data.statusOutcome
    });
  };

  const convertLeadToAdmission = async (leadId, details) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return { success: false, error: 'Lead not found' };

    const admNumber = `GB-${new Date().getFullYear()}-${String(admissions.length + 1).padStart(3, '0')}`;
    const newAdmission = {
      id: `adm-${Date.now()}`,
      admissionNumber: admNumber,
      leadId: lead.id,
      studentName: details.studentName || lead.studentName,
      parentName: details.parentName || lead.parentName,
      mobileNumber: details.mobileNumber || lead.mobileNumber,
      admissionClass: details.admissionClass || lead.admissionClass,
      course: details.course || lead.course,
      feesTotal: Number(details.feesTotal || 60000),
      feesPaid: Number(details.feesPaid || 25000),
      feesPending: Number((details.feesTotal || 60000) - (details.feesPaid || 25000)),
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    setAdmissions(prev => [newAdmission, ...prev]);
    await changeLeadStatus(leadId, 'Converted', 'Admission confirmed and registered in master register.');

    return { success: true, admission: newAdmission };
  };

  const addTelecaller = (telecallerData) => {
    const newTelecaller = {
      uid: `telecaller-${Date.now()}`,
      email: telecallerData.email,
      displayName: telecallerData.displayName || telecallerData.fullName,
      fullName: telecallerData.fullName || telecallerData.displayName,
      role: 'telecaller',
      phone: telecallerData.phone || '',
      status: 'active',
      isActive: true
    };
    setTelecallers(prev => [...prev, newTelecaller]);
    return newTelecaller;
  };

  // Phase 6 Actions
  const recordCallAction = async (callData) => {
    const caller = {
      uid: userProfile?.uid || currentUser?.uid,
      displayName: userProfile?.displayName || userProfile?.fullName,
      fullName: userProfile?.fullName || userProfile?.displayName,
      role: userProfile?.role || 'telecaller'
    };

    const res = await serviceRecordCall({
      ...callData,
      caller
    });

    if (res.success) {
      const newCall = {
        id: res.callId || `call-${Date.now()}`,
        callId: res.callId || `call-${Date.now()}`,
        leadId: callData.leadId,
        leadNumber: callData.leadNumber,
        telecallerId: caller.uid,
        telecallerName: caller.fullName,
        callOutcome: callData.callOutcome,
        callDurationSeconds: Number(callData.callDurationSeconds) || 0,
        interestLevel: callData.interestLevel || 'Medium',
        notes: callData.notes || '',
        parentResponse: callData.parentResponse || '',
        callTimestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      setCalls(prev => [newCall, ...prev]);

      if (callData.nextFollowUpRequired && callData.nextFollowUpDate) {
        const newFu = {
          id: res.followUpId || `fu-${Date.now()}`,
          followUpId: res.followUpId || `fu-${Date.now()}`,
          leadId: callData.leadId,
          leadNumber: callData.leadNumber,
          assignedTo: caller.uid,
          assignedTelecallerName: caller.fullName,
          scheduledAt: `${callData.nextFollowUpDate}T${callData.nextFollowUpTime || '10:00'}:00+05:30`,
          scheduledDate: callData.nextFollowUpDate,
          scheduledTime: callData.nextFollowUpTime || '10:00',
          timezone: 'Asia/Kolkata',
          priority: callData.followUpPriority || 'Medium',
          status: 'Scheduled',
          notes: callData.notes || '',
          reminderSettings: { oneDayBefore: true, oneHourBefore: true, atTime: true, overdue: true },
          reminderHistory: [],
          createdAt: new Date().toISOString()
        };
        setFollowUps(prev => [newFu, ...prev]);
      }

      setLeads(prev => prev.map(l => l.id === callData.leadId ? {
        ...l,
        lastContactedAt: new Date().toISOString(),
        lastCallOutcome: callData.callOutcome,
        status: res.leadStatus || l.status,
        leadStatus: res.leadStatus || l.leadStatus,
        nextFollowUp: callData.nextFollowUpRequired ? callData.nextFollowUpDate : l.nextFollowUp,
        nextFollowupAt: callData.nextFollowUpRequired ? `${callData.nextFollowUpDate}T${callData.nextFollowUpTime || '10:00'}:00+05:30` : l.nextFollowupAt
      } : l));
    }
    return res;
  };

  const scheduleFollowUpAction = async (data) => {
    const caller = {
      uid: userProfile?.uid || currentUser?.uid,
      displayName: userProfile?.displayName || userProfile?.fullName,
      role: userProfile?.role || 'telecaller'
    };
    const res = await serviceScheduleFollowUp({ ...data, caller });
    if (res.success) {
      const newFu = {
        id: res.followUpId || `fu-${Date.now()}`,
        followUpId: res.followUpId || `fu-${Date.now()}`,
        leadId: data.leadId,
        leadNumber: data.leadNumber,
        parentName: data.parentName,
        studentName: data.studentName,
        mobileNumber: data.mobileNumber,
        admissionClass: data.admissionClass,
        academicYear: data.academicYear,
        assignedTo: data.assignedTo || caller.uid,
        assignedTelecallerName: data.assignedTelecallerName || caller.displayName,
        scheduledAt: res.scheduledAt || `${data.scheduledDate}T${data.scheduledTime || '10:00'}:00+05:30`,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime || '10:00',
        timezone: 'Asia/Kolkata',
        priority: data.priority || 'Medium',
        status: 'Scheduled',
        notes: data.notes || '',
        reminderSettings: data.reminderSettings || { oneDayBefore: true, oneHourBefore: true, atTime: true, overdue: true },
        reminderHistory: [],
        createdAt: new Date().toISOString()
      };
      setFollowUps(prev => [newFu, ...prev]);
      setLeads(prev => prev.map(l => l.id === data.leadId ? {
        ...l,
        nextFollowupAt: newFu.scheduledAt,
        nextFollowUp: data.scheduledDate,
        status: l.status === 'New' || l.status === 'Assigned' ? 'Follow-up' : l.status,
        leadStatus: l.leadStatus === 'New' || l.leadStatus === 'Assigned' ? 'Follow-up' : l.leadStatus
      } : l));
    }
    return res;
  };

  const rescheduleFollowUpAction = async (data) => {
    const caller = {
      uid: userProfile?.uid || currentUser?.uid,
      displayName: userProfile?.displayName || userProfile?.fullName,
      role: userProfile?.role || 'telecaller'
    };
    const res = await serviceRescheduleFollowUp({ ...data, caller });
    if (res.success) {
      setFollowUps(prev => prev.map(f => (f.id === data.followUpId || f.followUpId === data.followUpId) ? {
        ...f,
        scheduledAt: res.newScheduledAt,
        scheduledDate: data.newScheduledDate,
        scheduledTime: data.newScheduledTime || '10:00',
        priority: data.newPriority || f.priority,
        status: 'Rescheduled'
      } : f));
      if (data.leadId) {
        setLeads(prev => prev.map(l => l.id === data.leadId ? {
          ...l,
          nextFollowupAt: res.newScheduledAt,
          nextFollowUp: data.newScheduledDate
        } : l));
      }
    }
    return res;
  };

  const completeFollowUpAction = async (data) => {
    const caller = {
      uid: userProfile?.uid || currentUser?.uid,
      displayName: userProfile?.displayName || userProfile?.fullName,
      role: userProfile?.role || 'telecaller'
    };
    const res = await serviceCompleteFollowUp({ ...data, caller });
    if (res.success) {
      setFollowUps(prev => prev.map(f => (f.id === data.followUpId || f.followUpId === data.followUpId) ? {
        ...f,
        status: 'Completed',
        completedAt: new Date().toISOString(),
        completedBy: caller.uid,
        completionNotes: data.completionNotes
      } : f));
    }
    return res;
  };

  const triggerRemindersCheck = async () => {
    return await triggerFollowUpReminders();
  };

  const getPerformanceAnalytics = () => {
    return calculateTelecallerPerformance({
      telecallers,
      enquiries: leads,
      calls,
      followUps
    });
  };

  const exportPerformanceCSV = () => {
    const perf = getPerformanceAnalytics();
    return exportPerformanceToCSV(perf, userProfile || currentUser);
  };

  const exportCallMonitoringCSV = (filteredCalls, filteredFollowUps) => {
    return exportCallMonitoringToCSV(filteredCalls || calls, filteredFollowUps || followUps, userProfile || currentUser);
  };

  // Phase 7 Actions
  const scheduleCampusVisit = async (visitData) => {
    const actor = userProfile || currentUser || { uid: 'PUBLIC', fullName: 'Public Visitor', role: 'public' };
    const newVisit = await serviceCreateCampusVisit({
      ...visitData,
      createdBy: actor.uid,
      creatorRole: actor.role,
      existingVisits: visits,
      settings: visitSettings
    });

    setVisits(prev => [newVisit, ...prev]);

    // Update lead status to "School Visit Planned" if linked to a lead
    if (newVisit.leadId) {
      setLeads(prev => prev.map(l => {
        if (l.id === newVisit.leadId || l.leadId === newVisit.leadId) {
          return {
            ...l,
            leadStatus: 'School Visit Planned',
            status: 'School Visit Planned',
            lastContactDate: new Date().toISOString().split('T')[0],
            notes: `${l.notes || ''}\n[Campus Visit]: Scheduled on ${newVisit.requestedDate} (${newVisit.timeSlot})`.trim()
          };
        }
        return l;
      }));
    }

    // Admin notification
    const notif = {
      id: `notif-${Date.now()}`,
      recipientId: 'ADMIN',
      title: 'नवीन शाळा भेट नोंदणी (Campus Visit)',
      message: `${newVisit.studentName} (${newVisit.applyingClass}) - ${newVisit.requestedDate} (${newVisit.timeSlot})`,
      category: 'visit',
      visitId: newVisit.visitId,
      visitNumber: newVisit.visitNumber,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, visit: newVisit };
  };

  const approveVisit = async (visitId, { assignedStaffId, assignedStaffName, notes } = {}) => {
    const adminUser = userProfile || currentUser;
    const updated = await serviceApproveCampusVisit(visitId, {
      adminUser,
      assignedStaffId,
      assignedStaffName,
      notes
    }, visits);

    setVisits(prev => prev.map(v => v.visitId === visitId ? updated : v));
    return { success: true, visit: updated };
  };

  const rejectVisit = async (visitId, { reason }) => {
    const adminUser = userProfile || currentUser;
    const updated = await serviceRejectCampusVisit(visitId, { adminUser, reason }, visits);
    setVisits(prev => prev.map(v => v.visitId === visitId ? updated : v));
    return { success: true, visit: updated };
  };

  const rescheduleVisit = async (visitId, { newDate, newSlot, reason }) => {
    const adminUser = userProfile || currentUser;
    const updated = await serviceRescheduleCampusVisit(visitId, {
      newDate,
      newSlot,
      reason,
      adminUser
    }, visits, visitSettings);
    setVisits(prev => prev.map(v => v.visitId === visitId ? updated : v));
    return { success: true, visit: updated };
  };

  const cancelVisit = async (visitId, { reason }) => {
    const cancelledBy = userProfile || currentUser;
    const updated = await serviceCancelCampusVisit(visitId, { reason, cancelledBy }, visits);
    setVisits(prev => prev.map(v => v.visitId === visitId ? updated : v));
    return { success: true, visit: updated };
  };

  const checkInVisit = async (visitId, { arrivalTime, notes } = {}) => {
    const staffUser = userProfile || currentUser;
    const updated = await serviceCheckInCampusVisit(visitId, { staffUser, arrivalTime, notes }, visits);
    setVisits(prev => prev.map(v => v.visitId === visitId ? updated : v));
    return { success: true, visit: updated };
  };

  const checkOutVisit = async (visitId, { departureTime, completionNotes } = {}) => {
    const staffUser = userProfile || currentUser;
    const updated = await serviceCheckOutCampusVisit(visitId, { staffUser, departureTime, completionNotes }, visits);
    setVisits(prev => prev.map(v => v.visitId === visitId ? updated : v));

    // Update lead status to "Interested" or append visit completed
    if (updated.leadId) {
      setLeads(prev => prev.map(l => (l.id === updated.leadId || l.leadId === updated.leadId) ? {
        ...l,
        leadStatus: l.leadStatus === 'Admitted' ? l.leadStatus : 'Interested',
        notes: `${l.notes || ''}\n[Campus Visit Completed]: ${departureTime || ''} - ${completionNotes || ''}`.trim()
      } : l));
    }

    return { success: true, visit: updated };
  };

  const submitVisitFeedback = async (feedbackData) => {
    const staffUser = userProfile || currentUser;
    const feedback = await serviceSubmitCampusVisitFeedback({ ...feedbackData, staffUser });
    setVisitFeedback(prev => [feedback, ...prev]);
    return { success: true, feedback };
  };

  const updateVisitSettings = (newSettings) => {
    setVisitSettings(prev => ({ ...prev, ...newSettings }));
    return { success: true };
  };

  const createAdmissionApplication = async (appData) => {
    const adminUser = userProfile || currentUser;
    const { application, historyEntry } = await serviceCreateAdmissionApplication({
      ...appData,
      adminUser,
      existingApplications: admissionApplications
    });
    setAdmissionApplications(prev => [application, ...prev]);
    setAdmissionStageHistory(prev => [historyEntry, ...prev]);
    return { success: true, application, historyEntry };
  };

  const changeAdmissionStage = async ({ applicationId, newStage, reason }) => {
    const adminUser = userProfile || currentUser;
    const { application, historyEntry } = await serviceUpdateAdmissionStage({
      applicationId,
      newStage,
      reason,
      adminUser,
      existingApplications: admissionApplications
    });

    setAdmissionApplications(prev => prev.map(a => a.applicationId === applicationId ? application : a));
    setAdmissionStageHistory(prev => [historyEntry, ...prev]);

    // If stage changed to Admission Confirmed, update corresponding lead to "Admitted"
    if (newStage === 'Admission Confirmed' && application.leadId) {
      setLeads(prev => prev.map(l => (l.id === application.leadId || l.leadId === application.leadId) ? {
        ...l,
        leadStatus: 'Admitted',
        status: 'Admitted'
      } : l));
    }

    return { success: true, application, historyEntry };
  };

  const reviewAdmissionDocument = async ({ applicationId, documentType, status, reviewNotes }) => {
    const adminUser = userProfile || currentUser;
    const updatedApp = await serviceReviewAdmissionDocument({
      applicationId,
      documentType,
      status,
      reviewNotes,
      adminUser,
      existingApplications: admissionApplications
    });
    setAdmissionApplications(prev => prev.map(a => a.applicationId === applicationId ? updatedApp : a));
    return { success: true, application: updatedApp };
  };

  const getVisitSlotAvailability = (dateStr) => {
    return getSlotAvailability(dateStr, visits, visitSettings);
  };

  const getVisitMetrics = () => {
    return calculateVisitMetrics(visits);
  };

  const exportVisitsCSV = (visitsToExport) => {
    return exportVisitsToCSV(visitsToExport || visits);
  };

  const getMetrics = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // 1. Total Admission Enquiries
    const totalEnquiries = leads.length;
    
    // 2. New Enquiries
    const newEnquiries = leads.filter(l => (l.status === 'New' || l.leadStatus === 'New')).length;
    
    // 3. Assigned Leads
    const assignedLeads = leads.filter(l => Boolean(l.assignedTo || l.assignedTelecallerId) || l.status === 'Assigned' || l.leadStatus === 'Assigned').length;
    
    // 4. Contacted Leads
    const contactedLeads = leads.filter(l => l.status === 'Contacted' || l.leadStatus === 'Contacted').length;
    
    // 5. Interested Parents
    const interestedParents = leads.filter(l => l.status === 'Interested' || l.leadStatus === 'Interested').length;
    
    // 6. Follow-ups Today
    const todayFollowUps = followUps.filter(f => f.scheduledDate === todayStr && f.status !== 'Completed').length;
    
    // 7. Overdue Follow-ups
    const overdueFollowUps = followUps.filter(f => f.status === 'Overdue' || (f.status !== 'Completed' && f.scheduledDate && f.scheduledDate < todayStr)).length;
    
    // 8. Completed Follow-ups
    const completedFollowUps = followUps.filter(f => f.status === 'Completed').length;
    
    // 9. Admission Applications
    const admissionApplicationsCount = admissionApplications.length;
    
    // 10. Confirmed Admissions
    const confirmedAdmissions = leads.filter(l => l.status === 'Converted' || l.leadStatus === 'Converted' || l.leadStatus === 'Admitted').length ||
      admissionApplications.filter(a => a.currentStage === 'Admission Confirmed' || a.approvalStatus === 'Approved').length;

    const conversionRate = totalEnquiries > 0 ? ((confirmedAdmissions / totalEnquiries) * 100).toFixed(1) : '0.0';

    return {
      ...analytics,
      totalEnquiries,
      newEnquiries,
      newLeads: newEnquiries,
      assignedLeads,
      contactedLeads,
      interestedParents,
      interestedLeads: interestedParents,
      todayFollowUps,
      overdueFollowUps,
      completedFollowUps,
      pendingFollowUps: todayFollowUps + overdueFollowUps,
      admissionApplications: admissionApplicationsCount,
      confirmedAdmissions,
      totalAdmissions: confirmedAdmissions,
      conversionRate
    };
  };

  // Phase 9 Actions
  const updateSystemSettingsAction = async (newSettings) => {
    const actor = userProfile || currentUser || { uid: 'ADMIN', role: 'admin' };
    const res = await serviceSaveSystemSettings(newSettings, actor);
    if (res.success) {
      setSystemSettings(res.settings);
    }
    return res;
  };

  const sendAnnouncementAction = async (announcementData) => {
    const sender = userProfile || currentUser || { uid: 'ADMIN', role: 'admin', displayName: 'Admin' };
    const res = await serviceBroadcastAnnouncement({ ...announcementData, sender });
    return res;
  };

  const getSystemReports = () => {
    return generateCRMReports({
      leads,
      calls,
      followUps,
      telecallers,
      admissionApplications
    });
  };

  const exportReportCSV = (reportTitle, headers, rows, filename) => {
    return exportReportToCSV(reportTitle, headers, rows, filename);
  };

  const exportAuditLogsCSV = (logsToExport) => {
    const list = logsToExport || auditLogs;
    const headers = ['तारीख व वेळ (Timestamp)', 'कृती (Action)', 'वापरकर्ता नाव (User Name)', 'भूमिका (Role)', 'रेकॉर्ड आयडी (Record ID)', 'तपशील (Details)'];
    const rows = list.map(l => [
      l.timestamp ? new Date(l.timestamp).toLocaleString('en-IN') : '',
      l.action || '',
      l.userName || l.userId || '',
      l.userRole || '',
      l.recordId || '',
      l.details || ''
    ]);
    return exportReportToCSV('System_Audit_Logs', headers, rows, 'Gurukul_Audit_Logs');
  };

  const recordAuditEvent = async (eventData) => {
    const actor = userProfile || currentUser || {};
    return await recordAuditLog({
      userId: actor.uid || actor.id,
      userName: actor.displayName || actor.fullName,
      userRole: actor.role || 'admin',
      ...eventData
    });
  };

  const value = {
    // Lead collections
    leads: visibleLeads,
    allLeads: leads,
    calls: visibleCalls,
    allCalls: calls,
    followUps: visibleFollowUps,
    allFollowUps: followUps,
    followUpHistory,
    telecallerStats,
    admissions,
    telecallers,
    activities,
    assignments,
    statusHistory,
    duplicates,
    notifications,
    unreadNotificationsCount: unreadCount,
    analytics,

    // Phase 7 Collections & State
    visits: visibleVisits,
    allVisits: visits,
    visitSettings,
    visitFeedback,
    admissionApplications: visibleApplications,
    allAdmissionApplications: admissionApplications,
    admissionStageHistory,

    // Status configs & metadata
    statusConfig: LEAD_STATUS_CONFIG,
    statusList: LEAD_STATUS_LIST,
    permittedTransitions: PERMITTED_STATUS_TRANSITIONS,
    isValidStatusTransition,
    validCallOutcomes: VALID_CALL_OUTCOMES,
    validInterestLevels: VALID_INTEREST_LEVELS,
    validPriorities: VALID_PRIORITIES,
    validFollowUpStatuses: VALID_FOLLOW_UP_STATUSES,

    // Phase 7 Configs
    visitPurposes: VISIT_PURPOSES,
    visitStatuses: VISIT_STATUSES,
    visitInterestLevels: VISIT_INTEREST_LEVELS,
    visitNextActions: VISIT_NEXT_ACTIONS,
    defaultVisitSlots: DEFAULT_SLOTS,
    admissionStages: ADMISSION_STAGES,
    stageConfig: STAGE_CONFIG,
    documentStatuses: DOCUMENT_STATUSES,
    defaultRequiredDocuments: DEFAULT_REQUIRED_DOCUMENTS,

    // Core actions
    submitAdmissionEnquiry,
    addLead,
    assignLead,
    bulkAssign,
    changeLeadStatus,
    logCallAttempt,
    resolveDuplicate,
    exportCRMLeads,
    markNotificationAsRead,
    markAllNotificationsAsRead,

    // Phase 6 Actions
    recordCall: recordCallAction,
    scheduleFollowUp: scheduleFollowUpAction,
    rescheduleFollowUp: rescheduleFollowUpAction,
    completeFollowUp: completeFollowUpAction,
    triggerRemindersCheck,
    getPerformanceAnalytics,
    exportPerformanceCSV,
    exportCallMonitoringCSV,

    // Phase 7 Actions
    scheduleCampusVisit,
    approveCampusVisit: approveVisit,
    rejectCampusVisit: rejectVisit,
    rescheduleCampusVisit: rescheduleVisit,
    cancelCampusVisit: cancelVisit,
    checkInCampusVisit: checkInVisit,
    checkOutCampusVisit: checkOutVisit,
    submitCampusVisitFeedback: submitVisitFeedback,
    updateVisitScheduleSettings: updateVisitSettings,
    createAdmissionApplication,
    updateAdmissionStage: changeAdmissionStage,
    reviewAdmissionDocument,
    getVisitSlotAvailability,
    getVisitMetrics,
    exportVisitsCSV,

    // Phase 9: System Settings, Audit, Announcements & Reports
    systemSettings,
    auditLogs,
    systemAuditActions: SYSTEM_AUDIT_ACTIONS,
    defaultSystemSettings: DEFAULT_SYSTEM_SETTINGS,
    updateSystemSettings: updateSystemSettingsAction,
    sendAnnouncement: sendAnnouncementAction,
    getSystemReports,
    exportReportCSV,
    exportAuditLogsCSV,
    recordAuditEvent,

    // Backward compatibility
    updateLead,
    logFollowUp,
    convertLeadToAdmission,
    addTelecaller,
    getMetrics,
    checkDuplicateLead
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
};
