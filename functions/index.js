/**
 * Firebase Cloud Functions for Gurukul Bhose
 * Multi-Role Authentication, Custom Claims & Staff Management
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Helper: Write entry to audit_logs collection
 */
async function recordAuditLog(actorId, actorRole, action, targetUserId, metadata = {}) {
  try {
    await db.collection("audit_logs").add({
      actorId: actorId || "SYSTEM",
      actorRole: actorRole || "SYSTEM",
      action,
      targetUserId: targetUserId || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

/**
 * Helper: Verify caller has admin or super_admin custom claim
 */
function verifyAdmin(auth) {
  if (!auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }
  const role = auth.token.role;
  if (role !== "admin" && role !== "super_admin" && role !== "superadmin") {
    throw new HttpsError("permission-denied", "Unauthorized. Requires Admin or Super Admin privileges.");
  }
  return role;
}

/**
 * 1. Bootstrap Initial Super Admin Account (Secure Initial Setup)
 * Can only be run if no Super Admin exists, or if valid server-side secret is provided.
 */
exports.bootstrapSuperAdmin = onCall(async (request) => {
  const { email, password, fullName, phone, secretKey } = request.data || {};

  if (!email || !password || !fullName) {
    throw new HttpsError("invalid-argument", "Email, password, and full name are required.");
  }

  const expectedSecret = process.env.SUPERADMIN_BOOTSTRAP_SECRET || "GurukulBhose#SuperAdmin2026";
  
  // Verify secret or check if any super_admin already exists
  const existingSuperAdmins = await db.collection("users").where("role", "in", ["super_admin", "superadmin"]).limit(1).get();

  if (!existingSuperAdmins.empty && secretKey !== expectedSecret) {
    throw new HttpsError(
      "permission-denied",
      "A Super Admin already exists. Initial bootstrap is locked without valid administrative secret."
    );
  }

  try {
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (e) {
      if (e.code === "auth/user-not-found") {
        userRecord = await admin.auth().createUser({
          email,
          password,
          displayName: fullName,
          emailVerified: true
        });
      } else {
        throw e;
      }
    }

    // Set custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: "super_admin",
      permissions: ["all"]
    });

    // Write to Firestore users collection
    const userDocRef = db.collection("users").doc(userRecord.uid);
    await userDocRef.set({
      uid: userRecord.uid,
      fullName,
      email,
      phone: phone || "9850449800",
      role: "super_admin",
      status: "active",
      employeeId: "SA-001",
      profileImage: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: "BOOTSTRAP_INIT"
    }, { merge: true });

    await recordAuditLog(
      userRecord.uid,
      "super_admin",
      "SUPER_ADMIN_BOOTSTRAP",
      userRecord.uid,
      { email, fullName }
    );

    return {
      success: true,
      message: "Super Admin account initialized successfully with super_admin custom claim.",
      uid: userRecord.uid
    };
  } catch (error) {
    console.error("Bootstrap error:", error);
    throw new HttpsError("internal", error.message || "Super Admin bootstrap failed.");
  }
});

/**
 * 2. Create Telecaller Account (Admin / Super Admin only)
 * Creates Auth user, sets telecaller custom claim, creates users and telecaller_profiles documents,
 * and generates a secure password setup link.
 */
exports.createTelecaller = onCall(async (request) => {
  const callerRole = verifyAdmin(request.auth);
  const callerUid = request.auth.uid;

  const {
    fullName,
    email,
    mobileNumber,
    whatsappNumber,
    employeeId,
    gender,
    address,
    joiningDate,
    assignedDepartment,
    initialPassword
  } = request.data || {};

  if (!fullName || !email || !mobileNumber || !employeeId) {
    throw new HttpsError("invalid-argument", "Full name, email, mobile number, and employee ID are required.");
  }

  // Validate employeeId uniqueness in Firestore
  const empCheck = await db.collection("users").where("employeeId", "==", employeeId).limit(1).get();
  if (!empCheck.empty) {
    throw new HttpsError("already-exists", `Employee ID ${employeeId} is already in use.`);
  }

  let userRecord;
  try {
    // Generate secure random temp password if not provided
    const password = initialPassword && initialPassword.length >= 6 
      ? initialPassword 
      : `GB#${Math.random().toString(36).substring(2, 8)}@${new Date().getFullYear()}`;

    // 1. Create Firebase Authentication account
    userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
      emailVerified: false,
      disabled: false
    });

    // 2. Set Custom Claim
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: "telecaller"
    });

    const now = admin.firestore.FieldValue.serverTimestamp();

    // 3. Create document in users collection
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      fullName,
      email,
      phone: mobileNumber,
      role: "telecaller",
      status: "active",
      employeeId,
      profileImage: null,
      createdAt: now,
      updatedAt: now,
      createdBy: callerUid
    });

    // 4. Create document in telecaller_profiles collection
    await db.collection("telecaller_profiles").doc(userRecord.uid).set({
      userId: userRecord.uid,
      employeeId,
      fullName,
      email,
      phone: mobileNumber,
      whatsappNumber: whatsappNumber || mobileNumber,
      gender: gender || "Not Specified",
      address: address || "",
      joiningDate: joiningDate || new Date().toISOString().split("T")[0],
      assignedDepartment: assignedDepartment || "General Admissions",
      status: "active",
      profileImage: null,
      createdAt: now,
      updatedAt: now,
      createdBy: callerUid
    });

    // 5. Generate Password Reset / Invitation Link
    let resetLink = null;
    try {
      resetLink = await admin.auth().generatePasswordResetLink(email);
    } catch (linkErr) {
      console.warn("Could not generate password reset link:", linkErr);
    }

    // 6. Record Audit Log
    await recordAuditLog(
      callerUid,
      callerRole,
      "TELECALLER_CREATED",
      userRecord.uid,
      { email, employeeId, fullName }
    );

    return {
      success: true,
      message: "Telecaller account created successfully with custom claim and Firestore profiles.",
      uid: userRecord.uid,
      employeeId,
      email,
      initialPassword: initialPassword ? undefined : password,
      resetLink
    };
  } catch (error) {
    console.error("createTelecaller error:", error);
    // Cleanup partial Auth creation if Firestore failed
    if (userRecord?.uid) {
      try {
        await admin.auth().deleteUser(userRecord.uid);
      } catch (cleanErr) {
        console.error("Cleanup error:", cleanErr);
      }
    }
    throw new HttpsError("internal", error.message || "Failed to create Telecaller account.");
  }
});

/**
 * 3. Update Telecaller Account Status (Activate / Deactivate)
 */
exports.updateTelecallerStatus = onCall(async (request) => {
  const callerRole = verifyAdmin(request.auth);
  const callerUid = request.auth.uid;

  const { userId, status } = request.data || {};

  if (!userId || !["active", "inactive"].includes(status)) {
    throw new HttpsError("invalid-argument", "Valid userId and status ('active' or 'inactive') are required.");
  }

  try {
    const isDeactivated = status === "inactive";

    // 1. Update Firebase Auth status (disabled disables token authentication immediately)
    await admin.auth().updateUser(userId, {
      disabled: isDeactivated
    });

    // 2. Revoke Refresh Tokens so active sessions are terminated immediately upon deactivation
    if (isDeactivated) {
      await admin.auth().revokeRefreshTokens(userId);
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    // 3. Update Firestore documents
    await db.collection("users").doc(userId).update({
      status,
      updatedAt: now,
      updatedBy: callerUid
    });

    const profileRef = db.collection("telecaller_profiles").doc(userId);
    const profileSnap = await profileRef.get();
    if (profileSnap.exists) {
      await profileRef.update({
        status,
        updatedAt: now,
        updatedBy: callerUid
      });
    }

    // 4. Record Audit Log
    await recordAuditLog(
      callerUid,
      callerRole,
      isDeactivated ? "TELECALLER_DEACTIVATED" : "TELECALLER_ACTIVATED",
      userId,
      { newStatus: status }
    );

    return {
      success: true,
      message: `Telecaller account ${status === "active" ? "activated" : "deactivated"} successfully.`
    };
  } catch (error) {
    console.error("updateTelecallerStatus error:", error);
    throw new HttpsError("internal", error.message || "Failed to update Telecaller status.");
  }
});

/**
 * 4. Update Telecaller Profile
 * Can be called by Admin / Super Admin (full edits) or Telecaller (only permitted personal fields).
 */
exports.updateTelecallerProfile = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const callerUid = request.auth.uid;
  const callerRole = request.auth.token.role || "telecaller";
  const { userId, updates } = request.data || {};

  if (!userId || !updates) {
    throw new HttpsError("invalid-argument", "userId and updates object are required.");
  }

  const isAdminUser = callerRole === "admin" || callerRole === "super_admin" || callerRole === "superadmin";

  // Telecallers can only edit their OWN profile and only permitted fields
  if (!isAdminUser) {
    if (callerUid !== userId) {
      throw new HttpsError("permission-denied", "Telecallers can only update their own profile.");
    }
    // Prevent Telecaller from modifying role, employeeId, status, permissions, joiningDate
    delete updates.role;
    delete updates.employeeId;
    delete updates.status;
    delete updates.joiningDate;
    delete updates.createdBy;
    delete updates.uid;
    delete updates.userId;
  }

  try {
    const now = admin.firestore.FieldValue.serverTimestamp();
    const payload = {
      ...updates,
      updatedAt: now,
      updatedBy: callerUid
    };

    // Update telecaller_profiles
    await db.collection("telecaller_profiles").doc(userId).set(payload, { merge: true });

    // Sync corresponding fields to users collection
    const userPayload = { updatedAt: now };
    if (updates.fullName) userPayload.fullName = updates.fullName;
    if (updates.phone) userPayload.phone = updates.phone;
    if (updates.profileImage !== undefined) userPayload.profileImage = updates.profileImage;
    if (isAdminUser && updates.status) userPayload.status = updates.status;

    await db.collection("users").doc(userId).set(userPayload, { merge: true });

    // If name changed, update auth displayName
    if (updates.fullName) {
      try {
        await admin.auth().updateUser(userId, { displayName: updates.fullName });
      } catch (e) {
        console.warn("Could not update auth displayName:", e);
      }
    }

    await recordAuditLog(
      callerUid,
      callerRole,
      "TELECALLER_PROFILE_UPDATED",
      userId,
      { fieldsModified: Object.keys(updates) }
    );

    return {
      success: true,
      message: "Profile updated successfully."
    };
  } catch (error) {
    console.error("updateTelecallerProfile error:", error);
    throw new HttpsError("internal", error.message || "Failed to update profile.");
  }
});

/**
 * 5. Send Password Reset Link for Telecaller
 */
exports.sendTelecallerPasswordReset = onCall(async (request) => {
  const callerRole = verifyAdmin(request.auth);
  const callerUid = request.auth.uid;

  const { email } = request.data || {};
  if (!email) {
    throw new HttpsError("invalid-argument", "Email address is required.");
  }

  try {
    const link = await admin.auth().generatePasswordResetLink(email);

    await recordAuditLog(
      callerUid,
      callerRole,
      "PASSWORD_RESET_LINK_GENERATED",
      null,
      { targetEmail: email }
    );

    return {
      success: true,
      message: "Password reset link generated successfully.",
      resetLink: link
    };
  } catch (error) {
    console.error("sendTelecallerPasswordReset error:", error);
    throw new HttpsError("internal", error.message || "Failed to generate password reset link.");
  }
});

// ===============================================================
// PHASE 5: ADMISSION ENQUIRY MANAGEMENT & CRM CLOUD FUNCTIONS
// ===============================================================

const LEAD_STATUSES = [
  'New',
  'Assigned',
  'Contacted',
  'Interested',
  'Follow-up',
  'Visited',
  'Converted',
  'Not Interested',
  'Lost'
];

const PERMITTED_STATUS_TRANSITIONS = {
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

// Rate limiter store in memory
const submissionRateMap = new Map();
function checkRateLimit(key, maxLimit = 6, windowMs = 5 * 60 * 1000) {
  const now = Date.now();
  const entry = submissionRateMap.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  submissionRateMap.set(key, entry);
  return entry.count <= maxLimit;
}

function normalizeMobile(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return cleaned;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned.slice(2);
  if (cleaned.length > 10) return cleaned.slice(-10);
  return cleaned;
}

function sanitizeString(str, maxLen = 500) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '').slice(0, maxLen);
}

/**
 * Concurrency-safe unique Lead Number generator
 * Format: GB-YYYY-000001
 */
async function generateUniqueLeadNumber(year) {
  const targetYear = year || new Date().getFullYear().toString();
  const counterRef = db.collection('counters').doc(`lead_counter_${targetYear}`);

  return await db.runTransaction(async (transaction) => {
    const docSnap = await transaction.get(counterRef);
    let nextSeq = 1;
    if (docSnap.exists) {
      const cur = docSnap.data().lastSequence || 0;
      nextSeq = cur + 1;
    }
    transaction.set(counterRef, {
      lastSequence: nextSeq,
      year: targetYear,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return `GB-${targetYear}-${String(nextSeq).padStart(6, '0')}`;
  });
}

/**
 * Duplicate check across normalized mobile, student name, admission class, and academic year
 */
async function checkDuplicateEnquiry(normalizedMobile, studentName, admissionClass, academicYear) {
  if (!normalizedMobile) return { isDuplicate: false };

  let q = db.collection('enquiries').where('normalizedMobile', '==', normalizedMobile);
  if (academicYear) {
    q = q.where('academicYear', '==', academicYear);
  }
  const snap = await q.limit(5).get();
  
  const cleanInputName = (studentName || '').trim().toLowerCase();
  const cleanInputClass = (admissionClass || '').trim().toLowerCase();

  if (!snap.empty) {
    for (const d of snap.docs) {
      const existing = d.data();
      const existingName = (existing.studentName || '').trim().toLowerCase();
      const existingClass = (existing.admissionClass || '').trim().toLowerCase();

      if (existingName === cleanInputName && (!existingClass || existingClass === cleanInputClass)) {
        return {
          isDuplicate: true,
          matchedLeadId: d.id,
          matchedLeadNumber: existing.leadNumber || d.id,
          reason: 'Identical student, class and mobile number match'
        };
      }
    }
    return {
      isDuplicate: false,
      isSibling: true,
      siblingOf: snap.docs[0].data().studentName
    };
  }

  // Check fallback in 'leads' collection
  const snapLeads = await db.collection('leads').where('mobileNumber', '==', normalizedMobile).limit(5).get();
  if (!snapLeads.empty) {
    for (const d of snapLeads.docs) {
      const existing = d.data();
      const existingName = (existing.studentName || '').trim().toLowerCase();
      if (existingName === cleanInputName) {
        return {
          isDuplicate: true,
          matchedLeadId: d.id,
          matchedLeadNumber: existing.leadNumber || d.id,
          reason: 'Matched in existing leads pipeline'
        };
      }
    }
    return {
      isDuplicate: false,
      isSibling: true,
      siblingOf: snapLeads.docs[0].data().studentName
    };
  }

  return { isDuplicate: false };
}

/**
 * 6. Submit Admission Enquiry (Public Website)
 * Concurrency-safe, server-validated, spam-protected, rate-limited, duplicate-aware.
 */
exports.submitAdmissionEnquiry = onCall(async (request) => {
  const data = request.data || {};
  const ip = request.rawRequest?.ip || '0.0.0.0';

  const rawMobile = data.mobileNumber || '';
  const normalizedMobile = normalizeMobile(rawMobile);
  const rateKey = `${ip}_${normalizedMobile}`;

  if (!checkRateLimit(rateKey, 6, 5 * 60 * 1000)) {
    throw new HttpsError("resource-exhausted", "Too many submission attempts. Please wait 5 minutes before trying again.");
  }

  const parentName = sanitizeString(data.parentName, 100);
  const studentName = sanitizeString(data.studentName, 100);
  const admissionClass = sanitizeString(data.admissionClass, 50);

  if (!parentName || !studentName || !admissionClass) {
    throw new HttpsError("invalid-argument", "Parent Name, Student Name, and Admission Class are required.");
  }

  if (normalizedMobile.length !== 10) {
    throw new HttpsError("invalid-argument", "Please enter a valid 10-digit mobile number.");
  }

  const email = (data.email || '').trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "Please provide a valid email address.");
  }

  const academicYear = sanitizeString(data.academicYear || '2026-2027', 20);

  // Idempotency check
  const idempotencyKey = sanitizeString(data.idempotencyKey, 64);
  if (idempotencyKey) {
    const existingKeySnap = await db.collection('enquiries')
      .where('idempotencyKey', '==', idempotencyKey)
      .limit(1).get();
    if (!existingKeySnap.empty) {
      const existing = existingKeySnap.docs[0].data();
      return {
        success: true,
        leadNumber: existing.leadNumber,
        message: "Thank you! Your admission enquiry has been submitted successfully. Our admission team will contact you soon."
      };
    }
  }

  // Duplicate detection
  const dupCheck = await checkDuplicateEnquiry(normalizedMobile, studentName, admissionClass, academicYear);

  // Unique Lead Number generation
  const yearStr = academicYear.includes('-') ? academicYear.split('-')[0] : new Date().getFullYear().toString();
  const leadNumber = await generateUniqueLeadNumber(yearStr);

  const now = admin.firestore.FieldValue.serverTimestamp();

  const enquiryPayload = {
    leadNumber,
    parentName,
    studentName,
    mobile: rawMobile,
    normalizedMobile,
    whatsapp: data.whatsappNumber ? normalizeMobile(data.whatsappNumber) : normalizedMobile,
    email: email || '',
    address: sanitizeString(data.address, 250),
    city: sanitizeString(data.city, 100),
    state: sanitizeString(data.state || 'Maharashtra', 50),
    pinCode: sanitizeString(data.pinCode, 10),
    dob: sanitizeString(data.dob, 20),
    gender: sanitizeString(data.gender || 'Not Specified', 20),
    currentSchool: sanitizeString(data.currentSchool, 150),
    currentClass: sanitizeString(data.currentClass, 50),
    admissionClass,
    academicYear,
    program: sanitizeString(data.program || 'Gurukul Vidyamandir', 100),
    course: sanitizeString(data.course || 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)', 150),
    preferredContactTime: sanitizeString(data.preferredContactTime || 'Anytime', 50),
    message: sanitizeString(data.message, 1000),
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
    whatsappOptIn: Boolean(data.whatsappOptIn ?? true),
    isDuplicate: Boolean(dupCheck.isDuplicate),
    duplicateMatchId: dupCheck.matchedLeadId || null,
    duplicateReviewStatus: dupCheck.isDuplicate ? 'pending' : null,
    isSibling: Boolean(dupCheck.isSibling),
    siblingOf: dupCheck.siblingOf || null,
    idempotencyKey: idempotencyKey || null
  };

  // Save to enquiries
  const enquiryRef = await db.collection('enquiries').add(enquiryPayload);
  const leadId = enquiryRef.id;

  // Sync to leads collection for backwards compatibility
  await db.collection('leads').doc(leadId).set({
    ...enquiryPayload,
    id: leadId,
    mobileNumber: normalizedMobile,
    whatsappNumber: enquiryPayload.whatsapp,
    leadSource: 'Website'
  });

  // Write initial activity
  await db.collection('lead_activities').add({
    leadId,
    leadNumber,
    activityType: 'Enquiry Created',
    description: `Admission enquiry submitted via website for ${studentName} (${admissionClass})`,
    previousValue: null,
    newValue: 'New',
    performedBy: 'SYSTEM',
    performedByRole: 'public',
    createdAt: now
  });

  // If duplicate detected, log duplicate activity and record
  if (dupCheck.isDuplicate) {
    await db.collection('lead_duplicates').add({
      leadId,
      leadNumber,
      matchedLeadId: dupCheck.matchedLeadId,
      matchedLeadNumber: dupCheck.matchedLeadNumber,
      parentName,
      studentName,
      normalizedMobile,
      admissionClass,
      academicYear,
      status: 'pending_review',
      createdAt: now
    });

    await db.collection('lead_activities').add({
      leadId,
      leadNumber,
      activityType: 'Duplicate Flagged',
      description: `Possible duplicate enquiry matching Lead #${dupCheck.matchedLeadNumber}`,
      previousValue: null,
      newValue: 'Pending Admin Review',
      performedBy: 'SYSTEM',
      performedByRole: 'system',
      createdAt: now
    });
  }

  // Create admin notification
  await db.collection('notifications').add({
    recipientId: 'ADMIN',
    title: 'नवीन प्रवेश नोंदणी (New Admission Enquiry)',
    message: `नवीन प्रवेश अर्ज: ${studentName} (${admissionClass}) - ${leadNumber}`,
    category: 'enquiry',
    leadId,
    leadNumber,
    read: false,
    createdAt: now
  });

  // Never return internal doc ID to public caller
  return {
    success: true,
    leadNumber,
    message: "Thank you! Your admission enquiry has been submitted successfully. Our admission team will contact you soon."
  };
});

/**
 * 7. Create Manual Enquiry (Admin / Staff)
 */
exports.createManualEnquiry = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }
  const callerUid = request.auth.uid;
  const callerRole = request.auth.token.role || 'admin';

  const data = request.data || {};
  const parentName = sanitizeString(data.parentName, 100);
  const studentName = sanitizeString(data.studentName, 100);
  const admissionClass = sanitizeString(data.admissionClass, 50);
  const rawMobile = data.mobileNumber || '';
  const normalizedMobile = normalizeMobile(rawMobile);

  if (!parentName || !studentName || !admissionClass || normalizedMobile.length !== 10) {
    throw new HttpsError("invalid-argument", "Valid Parent Name, Student Name, Class, and 10-digit mobile are required.");
  }

  const academicYear = sanitizeString(data.academicYear || '2026-2027', 20);
  const dupCheck = await checkDuplicateEnquiry(normalizedMobile, studentName, admissionClass, academicYear);

  const yearStr = academicYear.includes('-') ? academicYear.split('-')[0] : new Date().getFullYear().toString();
  const leadNumber = await generateUniqueLeadNumber(yearStr);
  const now = admin.firestore.FieldValue.serverTimestamp();

  let assignedTelecaller = null;
  if (data.assignedTo) {
    const teleSnap = await db.collection('users').doc(data.assignedTo).get();
    if (teleSnap.exists && teleSnap.data().role === 'telecaller' && teleSnap.data().status === 'active') {
      assignedTelecaller = {
        uid: data.assignedTo,
        fullName: teleSnap.data().fullName,
        employeeId: teleSnap.data().employeeId
      };
    }
  }

  const initialStatus = assignedTelecaller ? 'Assigned' : (data.status || 'New');

  const payload = {
    leadNumber,
    parentName,
    studentName,
    mobile: rawMobile,
    normalizedMobile,
    whatsapp: data.whatsappNumber ? normalizeMobile(data.whatsappNumber) : normalizedMobile,
    email: (data.email || '').trim().toLowerCase(),
    address: sanitizeString(data.address, 250),
    city: sanitizeString(data.city, 100),
    state: sanitizeString(data.state || 'Maharashtra', 50),
    pinCode: sanitizeString(data.pinCode, 10),
    dob: sanitizeString(data.dob, 20),
    gender: sanitizeString(data.gender || 'Not Specified', 20),
    currentSchool: sanitizeString(data.currentSchool, 150),
    currentClass: sanitizeString(data.currentClass, 50),
    admissionClass,
    academicYear,
    program: sanitizeString(data.program || 'Gurukul Vidyamandir', 100),
    course: sanitizeString(data.course || 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)', 150),
    preferredContactTime: sanitizeString(data.preferredContactTime || 'Anytime', 50),
    message: sanitizeString(data.message, 1000),
    adminRemarks: sanitizeString(data.adminRemarks, 1000),
    source: sanitizeString(data.source || 'Manual Entry', 50),
    status: initialStatus,
    leadStatus: initialStatus,
    assignedTo: assignedTelecaller?.uid || null,
    assignedTelecallerId: assignedTelecaller?.uid || null,
    assignedTelecallerName: assignedTelecaller?.fullName || null,
    assignedTelecallerEmployeeId: assignedTelecaller?.employeeId || null,
    assignedAt: assignedTelecaller ? now : null,
    createdBy: callerUid,
    createdAt: now,
    updatedAt: now,
    lastContactedAt: null,
    nextFollowupAt: null,
    consent: true,
    whatsappOptIn: Boolean(data.whatsappOptIn ?? true),
    isDuplicate: Boolean(dupCheck.isDuplicate),
    duplicateMatchId: dupCheck.matchedLeadId || null,
    duplicateReviewStatus: dupCheck.isDuplicate ? 'pending' : null
  };

  const ref = await db.collection('enquiries').add(payload);
  const leadId = ref.id;

  await db.collection('leads').doc(leadId).set({
    ...payload,
    id: leadId,
    mobileNumber: normalizedMobile,
    whatsappNumber: payload.whatsapp,
    leadSource: payload.source
  });

  await db.collection('lead_activities').add({
    leadId,
    leadNumber,
    activityType: 'Enquiry Created',
    description: `Manual enquiry created by ${callerRole} (${payload.source})`,
    previousValue: null,
    newValue: initialStatus,
    performedBy: callerUid,
    performedByRole: callerRole,
    createdAt: now
  });

  if (assignedTelecaller) {
    await db.collection('lead_assignments').add({
      leadId,
      telecallerId: assignedTelecaller.uid,
      telecallerName: assignedTelecaller.fullName,
      telecallerEmployeeId: assignedTelecaller.employeeId,
      assignedBy: callerUid,
      assignedAt: now,
      previousTelecallerId: null,
      previousTelecallerName: null,
      assignmentReason: data.assignmentReason || 'Initial Manual Assignment',
      assignmentStatus: 'active'
    });

    await db.collection('notifications').add({
      recipientId: assignedTelecaller.uid,
      title: 'नवीन लीड नियुक्त (New Lead Assigned)',
      message: `आपल्याकडे नवीन प्रवेश नोंदणी सोपवली आहे: ${studentName} (${admissionClass}) [${leadNumber}]`,
      category: 'assignment',
      leadId,
      leadNumber,
      read: false,
      createdAt: now
    });
  }

  await recordAuditLog(callerUid, callerRole, "MANUAL_ENQUIRY_CREATED", leadId, {
    leadNumber,
    studentName,
    admissionClass,
    source: payload.source
  });

  return {
    success: true,
    leadId,
    leadNumber,
    message: "Admission enquiry created successfully."
  };
});

/**
 * 8. Assign / Reassign Lead (Admin / Super Admin only)
 */
exports.assignLeadToTelecaller = onCall(async (request) => {
  const callerRole = verifyAdmin(request.auth);
  const callerUid = request.auth.uid;

  const { leadId, telecallerId, reason } = request.data || {};
  if (!leadId || !telecallerId) {
    throw new HttpsError("invalid-argument", "leadId and telecallerId are required.");
  }

  // Verify telecaller exists & active
  const teleUserSnap = await db.collection('users').doc(telecallerId).get();
  if (!teleUserSnap.exists || teleUserSnap.data().role !== 'telecaller' || teleUserSnap.data().status !== 'active') {
    throw new HttpsError("failed-precondition", "Target user does not exist, is not a telecaller, or is inactive.");
  }

  const telecaller = teleUserSnap.data();
  const enquiryRef = db.collection('enquiries').doc(leadId);
  const enquirySnap = await enquiryRef.get();

  if (!enquirySnap.exists) {
    throw new HttpsError("not-found", "Lead enquiry record not found.");
  }

  const lead = enquirySnap.data();
  const previousTelecallerId = lead.assignedTo || lead.assignedTelecallerId || null;
  const previousTelecallerName = lead.assignedTelecallerName || null;
  const isReassignment = Boolean(previousTelecallerId && previousTelecallerId !== telecallerId);

  const now = admin.firestore.FieldValue.serverTimestamp();
  const newStatus = (lead.status === 'New' || !lead.status) ? 'Assigned' : lead.status;

  // 1. Update enquiry doc
  const updateData = {
    assignedTo: telecallerId,
    assignedTelecallerId: telecallerId,
    assignedTelecallerName: telecaller.fullName,
    assignedTelecallerEmployeeId: telecaller.employeeId || '',
    assignedAt: now,
    status: newStatus,
    leadStatus: newStatus,
    updatedAt: now
  };
  await enquiryRef.update(updateData);

  // Sync to leads collection
  await db.collection('leads').doc(leadId).set(updateData, { merge: true });

  // 2. Mark previous assignment reassigned if exists
  if (previousTelecallerId) {
    const prevAssignments = await db.collection('lead_assignments')
      .where('leadId', '==', leadId)
      .where('assignmentStatus', '==', 'active')
      .get();
    const batch = db.batch();
    prevAssignments.forEach(docSnap => {
      batch.update(docSnap.ref, { assignmentStatus: 'reassigned', reassignedAt: now });
    });
    await batch.commit();
  }

  // 3. Create lead_assignments record
  await db.collection('lead_assignments').add({
    leadId,
    telecallerId,
    telecallerName: telecaller.fullName,
    telecallerEmployeeId: telecaller.employeeId || '',
    assignedBy: callerUid,
    assignedAt: now,
    previousTelecallerId,
    previousTelecallerName,
    assignmentReason: reason || (isReassignment ? 'Lead Reassignment' : 'Routine Lead Allocation'),
    assignmentStatus: 'active'
  });

  // 4. Create lead_activities log
  await db.collection('lead_activities').add({
    leadId,
    leadNumber: lead.leadNumber || leadId,
    activityType: isReassignment ? 'Lead Reassigned' : 'Lead Assigned',
    description: isReassignment 
      ? `Reassigned from ${previousTelecallerName} to ${telecaller.fullName}. Reason: ${reason || 'N/A'}`
      : `Assigned to ${telecaller.fullName} (${telecaller.employeeId || 'Staff'})`,
    previousValue: previousTelecallerName || 'Unassigned',
    newValue: telecaller.fullName,
    performedBy: callerUid,
    performedByRole: callerRole,
    createdAt: now
  });

  // 5. Notification to new telecaller
  await db.collection('notifications').add({
    recipientId: telecallerId,
    title: isReassignment ? 'लीड पुनर्नियुक्त (Lead Reassigned)' : 'नवीन लीड नियुक्त (New Lead Assigned)',
    message: `आपल्याकडे नवीन प्रवेश नोंदणी सोपवली आहे: ${lead.studentName} (${lead.admissionClass}) [${lead.leadNumber}]`,
    category: 'assignment',
    leadId,
    leadNumber: lead.leadNumber || '',
    read: false,
    createdAt: now
  });

  // 6. Notification to previous telecaller if reassigned
  if (isReassignment && previousTelecallerId) {
    await db.collection('notifications').add({
      recipientId: previousTelecallerId,
      title: 'लीड इतरत्र वर्ग केली (Lead Reassigned Away)',
      message: `लीड ${lead.studentName} [${lead.leadNumber}] इतर समुपदेशकाकडे वर्ग करण्यात आली आहे.`,
      category: 'assignment',
      leadId,
      leadNumber: lead.leadNumber || '',
      read: false,
      createdAt: now
    });
  }

  // 7. Audit log
  await recordAuditLog(callerUid, callerRole, isReassignment ? "LEAD_REASSIGNED" : "LEAD_ASSIGNED", telecallerId, {
    leadId,
    leadNumber: lead.leadNumber,
    previousTelecallerId,
    targetTelecaller: telecaller.fullName,
    reason
  });

  return {
    success: true,
    message: `Lead successfully ${isReassignment ? 'reassigned' : 'assigned'} to ${telecaller.fullName}.`
  };
});

/**
 * 9. Bulk Assign Leads (Admin / Super Admin only)
 */
exports.bulkAssignLeads = onCall(async (request) => {
  const callerRole = verifyAdmin(request.auth);
  const callerUid = request.auth.uid;

  const { leadIds, telecallerId, reason } = request.data || {};
  if (!Array.isArray(leadIds) || leadIds.length === 0 || !telecallerId) {
    throw new HttpsError("invalid-argument", "leadIds array and telecallerId are required.");
  }

  const teleUserSnap = await db.collection('users').doc(telecallerId).get();
  if (!teleUserSnap.exists || teleUserSnap.data().role !== 'telecaller' || teleUserSnap.data().status !== 'active') {
    throw new HttpsError("failed-precondition", "Target telecaller does not exist or is inactive.");
  }

  const telecaller = teleUserSnap.data();
  const now = admin.firestore.FieldValue.serverTimestamp();
  let assignedCount = 0;

  for (const leadId of leadIds) {
    try {
      const enquiryRef = db.collection('enquiries').doc(leadId);
      const snap = await enquiryRef.get();
      if (!snap.exists) continue;

      const lead = snap.data();
      const previousTelecallerId = lead.assignedTo || lead.assignedTelecallerId || null;
      const previousTelecallerName = lead.assignedTelecallerName || null;
      const isReassignment = Boolean(previousTelecallerId && previousTelecallerId !== telecallerId);
      const newStatus = (lead.status === 'New' || !lead.status) ? 'Assigned' : lead.status;

      await enquiryRef.update({
        assignedTo: telecallerId,
        assignedTelecallerId: telecallerId,
        assignedTelecallerName: telecaller.fullName,
        assignedTelecallerEmployeeId: telecaller.employeeId || '',
        assignedAt: now,
        status: newStatus,
        leadStatus: newStatus,
        updatedAt: now
      });

      await db.collection('leads').doc(leadId).set({
        assignedTo: telecallerId,
        assignedTelecallerId: telecallerId,
        assignedTelecallerName: telecaller.fullName,
        assignedTelecallerEmployeeId: telecaller.employeeId || '',
        assignedAt: now,
        status: newStatus,
        leadStatus: newStatus,
        updatedAt: now
      }, { merge: true });

      await db.collection('lead_assignments').add({
        leadId,
        telecallerId,
        telecallerName: telecaller.fullName,
        telecallerEmployeeId: telecaller.employeeId || '',
        assignedBy: callerUid,
        assignedAt: now,
        previousTelecallerId,
        previousTelecallerName,
        assignmentReason: reason || 'Bulk Allocation',
        assignmentStatus: 'active'
      });

      await db.collection('lead_activities').add({
        leadId,
        leadNumber: lead.leadNumber || leadId,
        activityType: isReassignment ? 'Lead Reassigned' : 'Lead Assigned',
        description: `Bulk assigned to ${telecaller.fullName}`,
        previousValue: previousTelecallerName || 'Unassigned',
        newValue: telecaller.fullName,
        performedBy: callerUid,
        performedByRole: callerRole,
        createdAt: now
      });

      assignedCount++;
    } catch (err) {
      console.error(`Bulk assignment failed for ${leadId}:`, err);
    }
  }

  await db.collection('notifications').add({
    recipientId: telecallerId,
    title: 'एकत्रित लीड वाटप (Bulk Leads Assigned)',
    message: `आपल्याकडे एकत्रित ${assignedCount} प्रवेश नोंदी सोपवण्यात आल्या आहेत.`,
    category: 'assignment',
    leadId: leadIds[0] || '',
    read: false,
    createdAt: now
  });

  await recordAuditLog(callerUid, callerRole, "BULK_LEADS_ASSIGNED", telecallerId, {
    count: assignedCount,
    leadIds
  });

  return {
    success: true,
    assignedCount,
    message: `${assignedCount} leads assigned to ${telecaller.fullName} successfully.`
  };
});

/**
 * 10. Update Lead Status & History
 * Permitted for Admin or assigned Telecaller
 */
exports.updateLeadStatus = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const callerUid = request.auth.uid;
  const callerRole = request.auth.token.role || 'telecaller';
  const isAdminUser = callerRole === 'admin' || callerRole === 'super_admin' || callerRole === 'superadmin';

  const { leadId, newStatus, reason, nextFollowupAt, notes } = request.data || {};

  if (!leadId || !newStatus || !LEAD_STATUSES.includes(newStatus)) {
    throw new HttpsError("invalid-argument", "Valid leadId and standard newStatus are required.");
  }

  const enquiryRef = db.collection('enquiries').doc(leadId);
  const enquirySnap = await enquiryRef.get();
  if (!enquirySnap.exists) {
    throw new HttpsError("not-found", "Lead record not found.");
  }

  const lead = enquirySnap.data();
  const currentAssigned = lead.assignedTo || lead.assignedTelecallerId;

  // Authorization check
  if (!isAdminUser && currentAssigned !== callerUid) {
    throw new HttpsError("permission-denied", "You can only update leads assigned to you.");
  }

  const prevStatus = lead.status || lead.leadStatus || 'New';

  // Permitted transition check (Admins can override)
  if (!isAdminUser && prevStatus !== newStatus) {
    const allowedTargets = PERMITTED_STATUS_TRANSITIONS[prevStatus] || [];
    if (!allowedTargets.includes(newStatus)) {
      throw new HttpsError("failed-precondition", `Transition from '${prevStatus}' to '${newStatus}' is not permitted.`);
    }
  }

  const now = admin.firestore.FieldValue.serverTimestamp();
  const updates = {
    status: newStatus,
    leadStatus: newStatus,
    updatedAt: now,
    lastContactedAt: now
  };
  if (nextFollowupAt !== undefined) {
    updates.nextFollowupAt = nextFollowupAt;
  }
  if (notes) {
    updates.latestNote = sanitizeString(notes, 1000);
  }

  await enquiryRef.update(updates);
  await db.collection('leads').doc(leadId).set(updates, { merge: true });

  // Append status history
  await db.collection('lead_status_history').add({
    leadId,
    leadNumber: lead.leadNumber || leadId,
    previousStatus: prevStatus,
    newStatus,
    changedBy: callerUid,
    userRole: callerRole,
    changedAt: now,
    reason: reason || ''
  });

  // Append activity timeline
  await db.collection('lead_activities').add({
    leadId,
    leadNumber: lead.leadNumber || leadId,
    activityType: newStatus === 'Converted' ? 'Lead Converted' : 'Status Changed',
    description: `Status changed from ${prevStatus} to ${newStatus}.${reason ? ` Reason: ${reason}` : ''}`,
    previousValue: prevStatus,
    newValue: newStatus,
    performedBy: callerUid,
    performedByRole: callerRole,
    createdAt: now
  });

  // If Converted, notify Admin
  if (newStatus === 'Converted') {
    await db.collection('notifications').add({
      recipientId: 'ADMIN',
      title: '🎉 प्रवेश निश्चित (Admission Converted)',
      message: `विद्यार्थी ${lead.studentName} (${lead.admissionClass}) चा प्रवेश निश्चित करण्यात आला आहे! [${lead.leadNumber}]`,
      category: 'conversion',
      leadId,
      leadNumber: lead.leadNumber || '',
      read: false,
      createdAt: now
    });
  }

  return {
    success: true,
    previousStatus: prevStatus,
    newStatus,
    message: `Lead status updated to ${newStatus}.`
  };
});

/**
 * 11. Add Call Attempt / Telecaller Notes
 */
exports.addLeadCallAttempt = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const callerUid = request.auth.uid;
  const callerRole = request.auth.token.role || 'telecaller';
  const isAdminUser = callerRole === 'admin' || callerRole === 'super_admin' || callerRole === 'superadmin';

  const { leadId, callOutcome, parentResponse, nextFollowupAt, statusChange } = request.data || {};
  if (!leadId || !callOutcome) {
    throw new HttpsError("invalid-argument", "leadId and callOutcome are required.");
  }

  const enquiryRef = db.collection('enquiries').doc(leadId);
  const enquirySnap = await enquiryRef.get();
  if (!enquirySnap.exists) {
    throw new HttpsError("not-found", "Lead record not found.");
  }

  const lead = enquirySnap.data();
  const currentAssigned = lead.assignedTo || lead.assignedTelecallerId;

  if (!isAdminUser && currentAssigned !== callerUid) {
    throw new HttpsError("permission-denied", "You can only record calls for leads assigned to you.");
  }

  const now = admin.firestore.FieldValue.serverTimestamp();
  const cleanOutcome = sanitizeString(callOutcome, 100);
  const cleanResponse = sanitizeString(parentResponse, 1000);

  const updates = {
    lastContactedAt: now,
    updatedAt: now
  };
  if (nextFollowupAt !== undefined) {
    updates.nextFollowupAt = nextFollowupAt;
  }
  if (statusChange && LEAD_STATUSES.includes(statusChange)) {
    updates.status = statusChange;
    updates.leadStatus = statusChange;
  }

  await enquiryRef.update(updates);
  await db.collection('leads').doc(leadId).set(updates, { merge: true });

  // Record in lead_activities
  await db.collection('lead_activities').add({
    leadId,
    leadNumber: lead.leadNumber || leadId,
    activityType: cleanOutcome.toLowerCase().includes('connected') || cleanOutcome.toLowerCase().includes('successful') 
      ? 'Contact Successful' 
      : 'Call Attempt',
    description: `Call Outcome: ${cleanOutcome}.${cleanResponse ? ` Response: ${cleanResponse}` : ''}${nextFollowupAt ? ` Next follow-up: ${nextFollowupAt}` : ''}`,
    previousValue: null,
    newValue: cleanOutcome,
    performedBy: callerUid,
    performedByRole: callerRole,
    createdAt: now
  });

  return {
    success: true,
    message: "Call attempt and notes recorded successfully."
  };
});

/**
 * 12. Review Duplicate Lead (Admin / Super Admin only)
 */
exports.reviewDuplicateLead = onCall(async (request) => {
  const callerRole = verifyAdmin(request.auth);
  const callerUid = request.auth.uid;

  const { leadId, duplicateId, action, notes } = request.data || {};
  if (!leadId || !['update_existing', 'keep_as_new'].includes(action)) {
    throw new HttpsError("invalid-argument", "leadId and valid action ('update_existing' or 'keep_as_new') are required.");
  }

  const enquiryRef = db.collection('enquiries').doc(leadId);
  const snap = await enquiryRef.get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "Lead record not found.");
  }

  const lead = snap.data();
  const now = admin.firestore.FieldValue.serverTimestamp();

  if (action === 'update_existing') {
    await enquiryRef.update({
      duplicateReviewStatus: 'resolved_updated',
      adminRemarks: sanitizeString(notes, 500) || 'Marked duplicate and notes merged to master lead.',
      status: 'Contacted',
      leadStatus: 'Contacted',
      updatedAt: now
    });

    if (duplicateId) {
      await db.collection('lead_duplicates').doc(duplicateId).update({
        status: 'resolved_updated',
        resolvedBy: callerUid,
        resolvedAt: now,
        notes: notes || ''
      });
    }

    await db.collection('lead_activities').add({
      leadId,
      leadNumber: lead.leadNumber || leadId,
      activityType: 'Duplicate Reviewed',
      description: `Duplicate resolved by Admin (${callerRole}): Updated existing enquiry. Notes: ${notes || 'N/A'}`,
      previousValue: 'Pending Review',
      newValue: 'Resolved (Updated Existing)',
      performedBy: callerUid,
      performedByRole: callerRole,
      createdAt: now
    });
  } else if (action === 'keep_as_new') {
    await enquiryRef.update({
      isDuplicate: false,
      duplicateReviewStatus: 'resolved_new',
      adminRemarks: sanitizeString(notes, 500) || 'Verified genuine distinct lead / sibling by Admin.',
      updatedAt: now
    });

    if (duplicateId) {
      await db.collection('lead_duplicates').doc(duplicateId).update({
        status: 'resolved_new',
        resolvedBy: callerUid,
        resolvedAt: now,
        notes: notes || ''
      });
    }

    await db.collection('lead_activities').add({
      leadId,
      leadNumber: lead.leadNumber || leadId,
      activityType: 'Duplicate Reviewed',
      description: `Admin verified this is a distinct applicant / sibling. Cleared duplicate flag.`,
      previousValue: 'Flagged Duplicate',
      newValue: 'Approved New Lead',
      performedBy: callerUid,
      performedByRole: callerRole,
      createdAt: now
    });
  }

  await recordAuditLog(callerUid, callerRole, "DUPLICATE_REVIEWED", leadId, {
    action,
    leadNumber: lead.leadNumber,
    notes
  });

  return {
    success: true,
    action,
    message: `Duplicate lead review completed: ${action}.`
  };
});

/**
 * 13. Export Leads Data (Admin / Super Admin only)
 */
exports.exportLeadsData = onCall(async (request) => {
  const callerRole = verifyAdmin(request.auth);
  const callerUid = request.auth.uid;

  const filters = request.data?.filters || {};
  let q = db.collection('enquiries');

  if (filters.status && filters.status !== 'ALL') {
    q = q.where('status', '==', filters.status);
  }
  if (filters.admissionClass && filters.admissionClass !== 'ALL') {
    q = q.where('admissionClass', '==', filters.admissionClass);
  }
  if (filters.academicYear && filters.academicYear !== 'ALL') {
    q = q.where('academicYear', '==', filters.academicYear);
  }

  const snap = await q.limit(1000).get();
  const rows = [];

  snap.forEach(docSnap => {
    const d = docSnap.data();
    rows.push({
      leadNumber: d.leadNumber || '',
      parentName: d.parentName || '',
      studentName: d.studentName || '',
      mobile: d.normalizedMobile || d.mobile || '',
      admissionClass: d.admissionClass || '',
      course: d.course || '',
      source: d.source || '',
      assignedTelecaller: d.assignedTelecallerName || 'Unassigned',
      status: d.status || d.leadStatus || 'New',
      createdAt: d.createdAt ? new Date(d.createdAt.toDate?.() || d.createdAt).toLocaleDateString('en-IN') : ''
    });
  });

  await recordAuditLog(callerUid, callerRole, "LEADS_EXPORTED", null, {
    recordCount: rows.length,
    filters
  });

  return {
    success: true,
    recordCount: rows.length,
    rows
  };
});

