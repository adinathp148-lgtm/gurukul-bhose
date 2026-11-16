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
import { demoLeads, demoFollowUps, demoAdmissions, demoUsers } from '../data/initialData';
import { useAuth } from './AuthContext';
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
  reviewDuplicate
} from '../services/firestore/crmService';

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

  const [admissions, setAdmissions] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_admissions');
    return saved ? JSON.parse(saved) : demoAdmissions;
  });

  const [telecallers, setTelecallers] = useState(() => {
    const saved = localStorage.getItem('gurukul_crm_telecallers');
    return saved ? JSON.parse(saved) : demoUsers.filter(u => u.role === 'telecaller');
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

  // Local storage synchronization
  useEffect(() => { localStorage.setItem('gurukul_crm_leads', JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem('gurukul_crm_followups', JSON.stringify(followUps)); }, [followUps]);
  useEffect(() => { localStorage.setItem('gurukul_crm_admissions', JSON.stringify(admissions)); }, [admissions]);
  useEffect(() => { localStorage.setItem('gurukul_crm_telecallers', JSON.stringify(telecallers)); }, [telecallers]);
  useEffect(() => { localStorage.setItem('gurukul_crm_activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('gurukul_crm_assignments', JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { localStorage.setItem('gurukul_crm_status_history', JSON.stringify(statusHistory)); }, [statusHistory]);
  useEffect(() => { localStorage.setItem('gurukul_crm_duplicates', JSON.stringify(duplicates)); }, [duplicates]);
  useEffect(() => { localStorage.setItem('gurukul_crm_notifications', JSON.stringify(notifications)); }, [notifications]);

  // 2. Live Firestore Subscriptions
  useEffect(() => {
    if (!isConfigured || !db) return;

    // A. Enquiries subscription
    const unsubEnquiries = onSnapshot(collection(db, 'enquiries'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreEnquiries = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          // Ensure normalized field presence
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

    // B. Telecallers subscription (from users collection)
    const qTele = query(collection(db, 'users'), where('role', '==', 'telecaller'));
    const unsubTelecallers = onSnapshot(qTele, (snapshot) => {
      if (!snapshot.empty) {
        const teleList = snapshot.docs.map(d => ({
          uid: d.id,
          id: d.id,
          displayName: d.data().fullName,
          fullName: d.data().fullName,
          ...d.data()
        }));
        setTelecallers(teleList);
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

    return () => {
      unsubEnquiries();
      unsubTelecallers();
      unsubNotifs();
      unsubActivities();
      unsubAssignments();
      unsubDuplicates();
    };
  }, []);

  // 3. Telecaller Lead Isolation
  // Telecallers only see leads currently assigned to them!
  const visibleLeads = useMemo(() => {
    if (isTelecaller && (userProfile?.uid || currentUser?.uid)) {
      const callerId = userProfile?.uid || currentUser?.uid;
      return leads.filter(l => l.assignedTo === callerId || l.assignedTelecallerId === callerId);
    }
    return leads;
  }, [leads, isTelecaller, userProfile, currentUser]);

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

  const getMetrics = () => {
    return {
      ...analytics,
      todayFollowUps: analytics.pendingFollowUps,
      overdueFollowUps: 0,
      totalAdmissions: analytics.convertedLeads
    };
  };

  const value = {
    // Lead collections
    leads: visibleLeads,
    allLeads: leads,
    followUps,
    admissions,
    telecallers,
    activities,
    assignments,
    statusHistory,
    duplicates,
    notifications,
    unreadNotificationsCount: unreadCount,
    analytics,

    // Status configs & metadata
    statusConfig: LEAD_STATUS_CONFIG,
    statusList: LEAD_STATUS_LIST,
    permittedTransitions: PERMITTED_STATUS_TRANSITIONS,
    isValidStatusTransition,

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
