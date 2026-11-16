import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  isConfigured 
} from '../firebase/config';
import { demoLeads, demoFollowUps, demoAdmissions, demoUsers } from '../data/initialData';
import { useAuth } from './AuthContext';

const CRMContext = createContext(null);

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

export const CRMProvider = ({ children }) => {
  const { userProfile, isTelecaller } = useAuth();
  
  // Local state initialized with fallback / stored items
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

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('gurukul_crm_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('gurukul_crm_followups', JSON.stringify(followUps));
  }, [followUps]);

  useEffect(() => {
    localStorage.setItem('gurukul_crm_admissions', JSON.stringify(admissions));
  }, [admissions]);

  useEffect(() => {
    localStorage.setItem('gurukul_crm_telecallers', JSON.stringify(telecallers));
  }, [telecallers]);

  // Firestore Live Listener when configured
  useEffect(() => {
    if (!isConfigured || !db) return;

    // Subscribe to Firestore 'leads' collection
    const unsubLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreLeads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeads(firestoreLeads);
      }
    }, (error) => {
      console.warn("Firestore leads sync note:", error.message);
    });

    return () => unsubLeads();
  }, []);

  // Filter leads for telecallers: Telecallers can access only leads assigned to them
  const visibleLeads = isTelecaller && userProfile
    ? leads.filter(lead => lead.assignedTelecallerId === userProfile.uid)
    : leads;

  // Duplicate lead detection check
  const checkDuplicateLead = (mobile, email) => {
    const cleanMobile = (mobile || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = (email || '').trim().toLowerCase();

    return leads.find(l => {
      const existingMobile = (l.mobileNumber || '').replace(/\D/g, '').slice(-10);
      const existingEmail = (l.email || '').trim().toLowerCase();

      const mobileMatch = cleanMobile && existingMobile && cleanMobile === existingMobile;
      const emailMatch = cleanEmail && existingEmail && cleanEmail === existingEmail;

      return mobileMatch || emailMatch;
    });
  };

  // Helper: Smart follow-up date suggestion based on previous parent response / interaction status
  const suggestNextFollowUpDate = (outcomeStatus) => {
    const today = new Date();
    let daysToAdd = 2; // Default 2 days

    switch (outcomeStatus) {
      case 'High Interest':
      case 'Call Scheduled':
        daysToAdd = 1; // High priority: follow up tomorrow
        break;
      case 'Interested':
      case 'School Visit Planned':
        daysToAdd = 3;
        break;
      case 'Call Not Picked / Busy':
        daysToAdd = 1;
        break;
      case 'Thinking / Considering':
        daysToAdd = 4;
        break;
      case 'Financial Discussion Pending':
        daysToAdd = 5;
        break;
      default:
        daysToAdd = 2;
    }

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);
    return nextDate.toISOString().split('T')[0];
  };

  // Add new lead (from Website, Meta Ads, WhatsApp, or Manual Entry)
  const addLead = async (leadData) => {
    const duplicate = checkDuplicateLead(leadData.mobileNumber, leadData.email);
    if (duplicate) {
      return { 
        success: false, 
        isDuplicate: true, 
        existingLead: duplicate,
        message: `Duplicate lead detected! Lead already exists for ${duplicate.studentName || duplicate.parentName} (${duplicate.mobileNumber}).`
      };
    }

    // Auto-assign to telecaller with least leads if not specified
    let assignedId = leadData.assignedTelecallerId || '';
    let assignedName = leadData.assignedTelecallerName || '';

    if (!assignedId && telecallers.length > 0) {
      const counts = telecallers.map(t => ({
        ...t,
        count: leads.filter(l => l.assignedTelecallerId === t.uid).length
      }));
      counts.sort((a, b) => a.count - b.count);
      assignedId = counts[0].uid;
      assignedName = counts[0].displayName;
    }

    const newLead = {
      id: `lead-${Date.now()}`,
      parentName: leadData.parentName || '',
      studentName: leadData.studentName || '',
      mobileNumber: leadData.mobileNumber || '',
      whatsappNumber: leadData.whatsappNumber || leadData.mobileNumber || '',
      email: leadData.email || '',
      admissionClass: leadData.admissionClass || 'इ. 5 वी',
      course: leadData.course || 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)',
      leadSource: leadData.leadSource || 'Website',
      assignedTelecallerId: assignedId,
      assignedTelecallerName: assignedName,
      leadStatus: 'New',
      lastFollowUp: '',
      nextFollowUp: leadData.nextFollowUp || suggestNextFollowUpDate('New'),
      notes: leadData.notes || leadData.message || 'नवीन प्रवेश चौकशी नोंदवली.',
      createdAt: new Date().toISOString(),
      city: leadData.city || '',
      district: leadData.district || 'सांगली'
    };

    setLeads(prev => [newLead, ...prev]);

    // Firestore sync if configured
    if (isConfigured && db) {
      try {
        await addDoc(collection(db, 'leads'), newLead);
      } catch (e) {
        console.warn("Firestore addDoc error", e);
      }
    }

    return { success: true, lead: newLead };
  };

  // Update lead
  const updateLead = async (leadId, updates) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));

    if (isConfigured && db) {
      try {
        await updateDoc(doc(db, 'leads', leadId), updates);
      } catch (e) {
        console.warn("Firestore update error", e);
      }
    }
  };

  // Assign lead to telecaller
  const assignLead = async (leadId, telecallerId) => {
    const telecaller = telecallers.find(t => t.uid === telecallerId);
    const assignedName = telecaller ? telecaller.displayName : 'Unassigned';
    await updateLead(leadId, {
      assignedTelecallerId: telecallerId,
      assignedTelecallerName: assignedName,
      leadStatus: 'Assigned'
    });
  };

  // Log a follow-up call & update timeline
  const logFollowUp = async (data) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newFollowUp = {
      id: `fol-${Date.now()}`,
      leadId: data.leadId,
      telecallerId: userProfile?.uid || 'telecaller-001',
      telecallerName: userProfile?.displayName || 'Counselor',
      contactedAt: new Date().toISOString(),
      callType: data.callType || 'Outgoing Call',
      parentResponse: data.parentResponse,
      scheduledNextDate: data.scheduledNextDate,
      statusOutcome: data.statusOutcome || 'Interested',
      suggestedAction: data.suggestedAction || ''
    };

    setFollowUps(prev => [newFollowUp, ...prev]);

    // Update parent lead
    await updateLead(data.leadId, {
      lastFollowUp: todayStr,
      nextFollowUp: data.scheduledNextDate,
      leadStatus: data.statusOutcome,
      notes: data.parentResponse
    });

    if (isConfigured && db) {
      try {
        await addDoc(collection(db, 'followUps'), newFollowUp);
      } catch (e) {
        console.warn("Firestore followUp addDoc error", e);
      }
    }

    return newFollowUp;
  };

  // Convert Lead into Admission Record
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
      whatsappNumber: details.whatsappNumber || lead.whatsappNumber,
      email: details.email || lead.email,
      admissionClass: details.admissionClass || lead.admissionClass,
      course: details.course || lead.course,
      admissionDate: details.admissionDate || new Date().toISOString().split('T')[0],
      rollNumber: details.rollNumber || `R-${String(admissions.length + 1).padStart(2, '0')}`,
      bloodGroup: details.bloodGroup || 'Not Specified',
      address: details.address || `${lead.city}, ${lead.district}`,
      feesTotal: Number(details.feesTotal || 60000),
      feesPaid: Number(details.feesPaid || 25000),
      feesPending: Number((details.feesTotal || 60000) - (details.feesPaid || 25000)),
      status: 'Active',
      hostelAllocated: details.hostelAllocated || 'Hostel Block A',
      originalEnquiryHistory: {
        source: lead.leadSource,
        createdAt: lead.createdAt,
        assignedTelecaller: lead.assignedTelecallerName,
        initialNotes: lead.notes
      }
    };

    setAdmissions(prev => [newAdmission, ...prev]);

    // Update Lead status to Admitted
    await updateLead(leadId, {
      leadStatus: 'Admitted',
      admissionId: newAdmission.id,
      admissionNumber: admNumber,
      nextFollowUp: ''
    });

    if (isConfigured && db) {
      try {
        await addDoc(collection(db, 'admissions'), newAdmission);
      } catch (e) {
        console.warn("Firestore addDoc admissions error", e);
      }
    }

    return { success: true, admission: newAdmission };
  };

  // Add / manage telecallers
  const addTelecaller = (telecallerData) => {
    const newTelecaller = {
      uid: `telecaller-${Date.now()}`,
      email: telecallerData.email,
      displayName: telecallerData.displayName,
      role: 'telecaller',
      phone: telecallerData.phone || '',
      isActive: true
    };
    setTelecallers(prev => [...prev, newTelecaller]);
    return newTelecaller;
  };

  // Performance & KPI Dashboard Metrics calculation
  const getMetrics = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalEnquiries = visibleLeads.length;
    const newLeads = visibleLeads.filter(l => l.leadStatus === 'New').length;
    const assignedLeads = visibleLeads.filter(l => l.assignedTelecallerId).length;
    const admittedCount = visibleLeads.filter(l => l.leadStatus === 'Admitted').length;

    const todayFollowUps = visibleLeads.filter(l => l.nextFollowUp === todayStr && l.leadStatus !== 'Admitted').length;
    const overdueFollowUps = visibleLeads.filter(l => l.nextFollowUp && l.nextFollowUp < todayStr && l.leadStatus !== 'Admitted').length;
    const pendingFollowUps = visibleLeads.filter(l => l.nextFollowUp && l.leadStatus !== 'Admitted').length;

    const conversionRate = totalEnquiries > 0 ? ((admittedCount / totalEnquiries) * 100).toFixed(1) : 0;

    // Telecaller Performance Breakup
    const telecallerPerformance = telecallers.map(t => {
      const assigned = leads.filter(l => l.assignedTelecallerId === t.uid);
      const callsDone = followUps.filter(f => f.telecallerId === t.uid).length;
      const converted = assigned.filter(l => l.leadStatus === 'Admitted').length;
      const rate = assigned.length > 0 ? ((converted / assigned.length) * 100).toFixed(1) : 0;
      return {
        id: t.uid,
        name: t.displayName,
        email: t.email,
        assignedCount: assigned.length,
        callsDone,
        convertedCount: converted,
        conversionRate: rate
      };
    });

    return {
      totalEnquiries,
      newLeads,
      assignedLeads,
      pendingFollowUps,
      todayFollowUps,
      overdueFollowUps,
      totalAdmissions: admittedCount,
      conversionRate,
      telecallerPerformance
    };
  };

  const value = {
    leads: visibleLeads,
    allLeads: leads,
    followUps,
    admissions,
    telecallers,
    checkDuplicateLead,
    suggestNextFollowUpDate,
    addLead,
    updateLead,
    assignLead,
    logFollowUp,
    convertLeadToAdmission,
    addTelecaller,
    getMetrics
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
};
