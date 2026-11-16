/**
 * Gurukul Bhose - Admission Confirmation & Document Verification Workflow (Phase 7)
 * 
 * Provides:
 * - 14-Stage Admission Lifecycle Management
 * - Immutable Stage Transition History Tracking
 * - Configurable Document Checklist per Class
 * - Document Upload, Review, Verification and Rejection Workflows
 * - Fee Payment Status Tracking (without handling sensitive payment credentials)
 */

import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  isConfigured
} from '../../firebase/config';

// ==========================================
// 1. 14 ADMISSION STAGES CONSTANTS
// ==========================================

export const ADMISSION_STAGES = [
  'Enquiry Received',
  'Initial Contact',
  'Interested',
  'Campus Visit Scheduled',
  'Campus Visit Completed',
  'Admission Information Shared',
  'Application Started',
  'Documents Pending',
  'Documents Verified',
  'Admission Approved',
  'Fee Payment Pending',
  'Admission Confirmed',
  'Admission Rejected',
  'Admission Withdrawn'
];

export const STAGE_CONFIG = {
  'Enquiry Received': {
    color: 'slate',
    labelMr: 'चौकशी प्राप्त',
    step: 1
  },
  'Initial Contact': {
    color: 'blue',
    labelMr: 'प्राथमिक संपर्क पूर्ण',
    step: 2
  },
  'Interested': {
    color: 'indigo',
    labelMr: 'प्रवेशासाठी इच्छुक',
    step: 3
  },
  'Campus Visit Scheduled': {
    color: 'amber',
    labelMr: 'कॅम्पस भेट नियोजित',
    step: 4
  },
  'Campus Visit Completed': {
    color: 'cyan',
    labelMr: 'कॅम्पस भेट पूर्ण',
    step: 5
  },
  'Admission Information Shared': {
    color: 'teal',
    labelMr: 'प्रवेश माहिती व विवरण सामायिक',
    step: 6
  },
  'Application Started': {
    color: 'sky',
    labelMr: 'अर्ज प्रक्रिया सुरू',
    step: 7
  },
  'Documents Pending': {
    color: 'orange',
    labelMr: 'कागदपत्रे प्रलंबित',
    step: 8
  },
  'Documents Verified': {
    color: 'purple',
    labelMr: 'कागदपत्रे पडताळणी पूर्ण',
    step: 9
  },
  'Admission Approved': {
    color: 'emerald',
    labelMr: 'प्रवेश मंजूर (Admin Approved)',
    step: 10
  },
  'Fee Payment Pending': {
    color: 'yellow',
    labelMr: 'प्रवेश शुल्क प्रलंबित',
    step: 11
  },
  'Admission Confirmed': {
    color: 'green',
    labelMr: 'प्रवेश निश्चित (Confirmed)',
    step: 12
  },
  'Admission Rejected': {
    color: 'red',
    labelMr: 'प्रवेश नाकारला',
    step: -1
  },
  'Admission Withdrawn': {
    color: 'rose',
    labelMr: 'प्रवेश मागे घेतला (Withdrawn)',
    step: -2
  }
};

// ==========================================
// 2. DOCUMENT CHECKLIST CONSTANTS
// ==========================================

export const DOCUMENT_STATUSES = [
  'Not Submitted',
  'Uploaded',
  'Under Review',
  'Verified',
  'Rejected',
  'Resubmission Required'
];

export const DEFAULT_REQUIRED_DOCUMENTS = [
  { type: 'Birth Certificate', labelMr: 'जन्म दाखला', required: true },
  { type: 'Previous School Transfer Certificate', labelMr: 'शाळा सोडल्याचा दाखला (TC/LC)', required: true },
  { type: 'Previous Academic Report', labelMr: 'मागील इयत्तेचे गुणपत्रक', required: true },
  { type: 'Student Photograph', labelMr: 'विद्यार्थ्याचे पासपोर्ट फोटो (४ प्रती)', required: true },
  { type: 'Parent Identity Proof', labelMr: 'पालकांचे आधार कार्ड / ओळखपत्र', required: true },
  { type: 'Address Proof', labelMr: 'रहिवासी दाखला / वीज बिल', required: true },
  { type: 'Caste Certificate', labelMr: 'जात प्रमाणपत्र (लागू असल्यास)', required: false },
  { type: 'Medical Fitness Certificate', labelMr: 'वैद्यकीय तंदुरुस्ती प्रमाणपत्र', required: false }
];

export const getClassRequiredDocuments = (className = '') => {
  // Can be customized per standard (e.g. 11th Science requires 10th Board marksheet)
  const docs = [...DEFAULT_REQUIRED_DOCUMENTS];
  if (className.includes('11') || className.includes('12')) {
    docs.push({ type: '10th Board Passing Certificate', labelMr: '१० वी बोर्ड उत्तीर्ण प्रमाणपत्र', required: true });
  }
  return docs;
};

// ==========================================
// 3. APPLICATION NUMBER GENERATOR
// ==========================================

export const generateApplicationNumber = (existingApps = []) => {
  const currentYear = new Date().getFullYear();
  const prefix = `APP-${currentYear}-`;
  
  let maxSeq = 0;
  existingApps.forEach(a => {
    if (a.applicationNumber && a.applicationNumber.startsWith(prefix)) {
      const seqStr = a.applicationNumber.replace(prefix, '');
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });

  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(6, '0')}`;
};

// ==========================================
// 4. APPLICATION CREATION & STAGE PROGRESSION
// ==========================================

export const createAdmissionApplication = async ({
  leadId,
  leadNumber,
  studentName,
  parentName,
  parentMobile,
  parentEmail = '',
  applyingClass,
  academicYear = '2026-2027',
  assignedStaffId = null,
  assignedStaffName = null,
  initialStage = 'Application Started',
  notes = '',
  adminUser,
  existingApplications = []
}) => {
  if (!studentName || !studentName.trim()) {
    throw new Error('विद्यार्थ्याचे नाव आवश्यक आहे (Student name is required).');
  }
  if (!parentName || !parentName.trim()) {
    throw new Error('पालकांचे नाव आवश्यक आहे (Parent name is required).');
  }
  if (!parentMobile || !parentMobile.trim()) {
    throw new Error('मोबाईल नंबर आवश्यक आहे (Mobile number is required).');
  }
  if (!applyingClass || !applyingClass.trim()) {
    throw new Error('प्रवेशासाठी इयत्ता आवश्यक आहे (Applying class is required).');
  }

  const applicationId = `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const applicationNumber = generateApplicationNumber(existingApplications);
  const checklist = getClassRequiredDocuments(applyingClass).map(docDef => ({
    documentType: docDef.type,
    labelMr: docDef.labelMr,
    required: docDef.required,
    status: 'Not Submitted',
    uploadedAt: null,
    storagePath: null,
    reviewedAt: null,
    reviewNotes: ''
  }));

  const newApp = {
    applicationId,
    applicationNumber,
    leadId: leadId || null,
    leadNumber: leadNumber || null,
    studentName: studentName.trim(),
    parentName: parentName.trim(),
    parentMobile: parentMobile.trim(),
    parentEmail: parentEmail.trim().toLowerCase(),
    applyingClass: applyingClass.trim(),
    academicYear: academicYear.trim(),
    currentStage: initialStage,
    assignedStaffId: assignedStaffId || adminUser?.uid || null,
    assignedStaffName: assignedStaffName || adminUser?.fullName || 'School Admin',
    requiredDocuments: checklist,
    approvalStatus: 'Pending',
    feeDetails: {
      totalFee: 65000,
      feePaid: 0,
      feePending: 65000,
      paymentStatus: 'Pending' // Payment status workflow only, no card collection
    },
    internalNotes: notes ? [notes] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Add initial history entry
  const initialHistory = {
    historyId: `hist-${Date.now()}`,
    applicationId,
    leadId: leadId || null,
    previousStage: 'None',
    newStage: initialStage,
    changedBy: adminUser?.uid || 'SYSTEM',
    changedByName: adminUser?.fullName || 'Administrator',
    changedByRole: adminUser?.role || 'admin',
    reason: 'Application initialized',
    createdAt: new Date().toISOString()
  };

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'admission_applications', applicationId), newApp);
      await setDoc(doc(db, 'admission_stage_history', initialHistory.historyId), initialHistory);
    } catch (e) {
      console.warn('Firestore error creating admission application:', e);
    }
  }

  return { application: newApp, historyEntry: initialHistory };
};

export const updateAdmissionStage = async ({
  applicationId,
  newStage,
  reason = '',
  adminUser,
  existingApplications = []
}) => {
  if (!applicationId) throw new Error('Application ID is required.');
  if (!newStage || !ADMISSION_STAGES.includes(newStage)) {
    throw new Error(`अवैध प्रवेश टप्पा (${newStage}). कृपया वैध टप्पा निवडा.`);
  }

  const app = existingApplications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('प्रवेश अर्ज नोंद आढळली नाही (Application record not found).');

  // Strict Rule: Visit completed must NEVER automatically mark admission as confirmed
  if (newStage === 'Admission Confirmed' && app.approvalStatus !== 'Approved') {
    // Only confirm if formally approved or this is an intentional confirmation by admin
    if (adminUser?.role !== 'admin' && adminUser?.role !== 'superadmin' && adminUser?.role !== 'super_admin') {
      throw new Error('केवळ अधिकृत ॲडमिन प्रवेश निश्चित (Confirm) करू शकतात.');
    }
  }

  const previousStage = app.currentStage;
  const historyId = `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const historyEntry = {
    historyId,
    applicationId,
    leadId: app.leadId || null,
    previousStage,
    newStage,
    changedBy: adminUser?.uid || 'ADMIN',
    changedByName: adminUser?.fullName || 'Administrator',
    changedByRole: adminUser?.role || 'admin',
    reason: reason.trim() || `Stage changed from ${previousStage} to ${newStage}`,
    createdAt: new Date().toISOString()
  };

  const updatedApprovalStatus = newStage === 'Admission Approved' 
    ? 'Approved' 
    : newStage === 'Admission Rejected' 
    ? 'Rejected' 
    : newStage === 'Admission Withdrawn' 
    ? 'Withdrawn' 
    : app.approvalStatus;

  const updatedApp = {
    ...app,
    currentStage: newStage,
    approvalStatus: updatedApprovalStatus,
    updatedAt: new Date().toISOString()
  };

  if (isConfigured && db) {
    try {
      await updateDoc(doc(db, 'admission_applications', applicationId), {
        currentStage: newStage,
        approvalStatus: updatedApprovalStatus,
        updatedAt: serverTimestamp()
      });
      await setDoc(doc(db, 'admission_stage_history', historyId), historyEntry);
    } catch (e) {
      console.warn('Firestore error updating admission stage:', e);
    }
  }

  return { application: updatedApp, historyEntry };
};

// ==========================================
// 5. DOCUMENT REVIEW & VERIFICATION
// ==========================================

export const reviewAdmissionDocument = async ({
  applicationId,
  documentType,
  status,
  reviewNotes = '',
  adminUser,
  existingApplications = []
}) => {
  if (!DOCUMENT_STATUSES.includes(status)) {
    throw new Error(`अवैध दस्तऐवज स्थिती: ${status}`);
  }

  const app = existingApplications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('प्रवेश अर्ज नोंद आढळली नाही.');

  const updatedDocuments = (app.requiredDocuments || []).map(d => {
    if (d.documentType === documentType) {
      return {
        ...d,
        status,
        reviewedBy: adminUser?.uid || 'ADMIN',
        reviewedByName: adminUser?.fullName || 'Verifier',
        reviewNotes: reviewNotes.trim(),
        reviewedAt: new Date().toISOString()
      };
    }
    return d;
  });

  // Check if all required documents are verified
  const allRequiredVerified = updatedDocuments
    .filter(d => d.required)
    .every(d => d.status === 'Verified');

  const updatedApp = {
    ...app,
    requiredDocuments: updatedDocuments,
    currentStage: allRequiredVerified && app.currentStage === 'Documents Pending' 
      ? 'Documents Verified' 
      : app.currentStage,
    updatedAt: new Date().toISOString()
  };

  if (isConfigured && db) {
    try {
      await updateDoc(doc(db, 'admission_applications', applicationId), {
        requiredDocuments: updatedDocuments,
        currentStage: updatedApp.currentStage,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Firestore error reviewing document:', e);
    }
  }

  return updatedApp;
};
