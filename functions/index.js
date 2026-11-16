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
