/**
 * Standalone Super Admin Bootstrap Script
 * Project: Gurukul Bhose
 * 
 * Usage:
 *   node scripts/bootstrap-superadmin.js <email> <password> <fullName> [phone]
 * Example:
 *   node scripts/bootstrap-superadmin.js superadmin@gurukulbhose.com StrongPassword#2026 "Super Administrator" 9850449800
 */

const admin = require("firebase-admin");

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (e) {
    console.error("Initialization error. Make sure GOOGLE_APPLICATION_CREDENTIALS or Firebase project is set.");
    process.exit(1);
  }
}

async function bootstrap() {
  const [,, email, password, fullName, phone] = process.argv;

  if (!email || !password || !fullName) {
    console.log("Usage: node scripts/bootstrap-superadmin.js <email> <password> <fullName> [phone]");
    process.exit(1);
  }

  console.log(`[Bootstrap] Initializing Super Admin for: ${email}...`);

  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(email);
    console.log(`[Bootstrap] Existing auth account found (UID: ${userRecord.uid})`);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: fullName,
        emailVerified: true
      });
      console.log(`[Bootstrap] Created new auth account (UID: ${userRecord.uid})`);
    } else {
      throw err;
    }
  }

  // Set Custom Claim
  await admin.auth().setCustomUserClaims(userRecord.uid, {
    role: "super_admin",
    permissions: ["all"]
  });
  console.log("[Bootstrap] Set custom claim { role: 'super_admin' }");

  // Write to Firestore users collection
  const db = admin.firestore();
  await db.collection("users").doc(userRecord.uid).set({
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
    createdBy: "CLI_BOOTSTRAP"
  }, { merge: true });

  console.log("[Bootstrap] Firestore users document created successfully.");
  console.log("=================================================");
  console.log(" Super Admin bootstrap completed successfully!");
  console.log(` Email: ${email}`);
  console.log(` UID:   ${userRecord.uid}`);
  console.log("=================================================");
  process.exit(0);
}

bootstrap().catch(err => {
  console.error("[Bootstrap] Error:", err);
  process.exit(1);
});
