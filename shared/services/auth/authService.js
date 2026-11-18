import { 
  auth, 
  db, 
  functions,
  httpsCallable,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  isConfigured 
} from '../../firebase/config.js';
import { demoUsers } from '../../data/initialData.js';

/**
 * Robust User Role Determination Utility
 * Ensures Admins and Super Admins are accurately detected without defaulting to 'telecaller'.
 */
export const determineUserRole = ({ customRole, profileData, email, portalHint = null }) => {
  const normEmail = (email || '').trim().toLowerCase();

  // 1. Explicit valid custom claim from Firebase Auth token
  if (customRole) {
    const cr = String(customRole).toLowerCase();
    if (cr === 'superadmin' || cr === 'super_admin') return 'super_admin';
    if (cr === 'admin') return 'admin';
    if (cr === 'telecaller') {
      if (profileData?.status === 'pending' || profileData?.status === 'pending_approval' || profileData?.status === 'inactive' || profileData?.role === 'pending_applicant') {
        return 'pending_applicant';
      }
      return 'telecaller';
    }
  }

  // 2. Profile role from Firestore or cached object
  if (profileData?.role) {
    const pr = String(profileData.role).toLowerCase();
    if (pr === 'superadmin' || pr === 'super_admin') return 'super_admin';
    if (pr === 'admin') return 'admin';
    if (pr === 'telecaller') {
      // Role can ONLY be telecaller if approved by admin
      if (profileData.status === 'pending' || profileData.status === 'pending_approval' || profileData.status === 'inactive' || profileData.role === 'pending_applicant') {
        return 'pending_applicant';
      }
      return 'telecaller';
    }
    if (pr === 'pending_applicant') return 'pending_applicant';
  }

  // 3. Known demo accounts (exact match)
  const demoMatch = demoUsers.find(u => (u.email || '').toLowerCase() === normEmail);
  if (demoMatch?.role) {
    const dr = demoMatch.role.toLowerCase();
    return (dr === 'superadmin' || dr === 'super_admin') ? 'super_admin' : dr;
  }

  // 4. Local admins created in AdminManagementPage
  try {
    const localAdmins = JSON.parse(localStorage.getItem('gurukul_local_admins') || '[]');
    const adminMatch = localAdmins.find(a => (a.email || '').toLowerCase() === normEmail);
    if (adminMatch?.role) {
      const ar = adminMatch.role.toLowerCase();
      return (ar === 'superadmin' || ar === 'super_admin') ? 'super_admin' : ar;
    }
  } catch (e) {}

  // 5. Admin Email patterns / domains
  if (normEmail.includes('superadmin') || normEmail.includes('super_admin')) {
    return 'super_admin';
  }
  if (
    normEmail.includes('admin') || 
    normEmail.startsWith('principal') || 
    normEmail.startsWith('director') || 
    normEmail.startsWith('head') ||
    normEmail === 'contact@gurukulbhose.com'
  ) {
    return 'admin';
  }

  // 6. Registered telecallers check (ONLY if portalHint is not 'admin' or 'super_admin')
  if (portalHint !== 'admin' && portalHint !== 'super_admin') {
    try {
      const registeredTCs = JSON.parse(localStorage.getItem('gurukul_registered_telecallers') || '[]');
      const tc = registeredTCs.find(t => (t.email || '').toLowerCase() === normEmail);
      if (tc) {
        if (tc.status === 'pending' || tc.status === 'pending_approval' || tc.role === 'pending_applicant') {
          return 'pending_applicant';
        }
        if (tc.status === 'active') {
          return 'telecaller';
        }
      }
      const storedTCs = JSON.parse(localStorage.getItem('gurukul_stored_telecallers') || '[]');
      const storedTc = storedTCs.find(t => (t.email || '').toLowerCase() === normEmail);
      if (storedTc) {
        if (storedTc.status === 'pending' || storedTc.status === 'pending_approval' || storedTc.role === 'pending_applicant') {
          return 'pending_applicant';
        }
        if (storedTc.status === 'active') {
          return 'telecaller';
        }
      }
    } catch (e) {}
  }

  // 7. Portal hint fallback: if logging in via admin portal, prioritize admin role
  if (portalHint === 'admin' || portalHint === 'super_admin') {
    return portalHint === 'super_admin' ? 'super_admin' : 'admin';
  }

  // 8. General fallback
  if (normEmail.includes('telecaller')) return 'telecaller';

  return portalHint || 'admin';
};

/**
 * Authentication and User Management Service
 * Supports Real Firebase Authentication & Custom Claims with safe fallback for development
 */

// 1. Sign In With Email & Password
export const loginWithEmail = async (email, password, portalHint = null) => {
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (isConfigured && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Retrieve idTokenResult to read custom claims
      const tokenResult = await cred.user.getIdTokenResult();
      const customRole = tokenResult.claims.role;

      // Parallelized lookup across users, admins, and telecaller_profiles
      let profile = {};
      try {
        const [userDoc, adminDoc, teleDoc] = await Promise.all([
          getDoc(doc(db, 'users', cred.user.uid)).catch(() => null),
          getDoc(doc(db, 'admins', cred.user.uid)).catch(() => null),
          getDoc(doc(db, 'telecaller_profiles', cred.user.uid)).catch(() => null)
        ]);

        const docData = {
          ...(adminDoc?.exists() ? adminDoc.data() : {}),
          ...(teleDoc?.exists() ? teleDoc.data() : {}),
          ...(userDoc?.exists() ? userDoc.data() : {})
        };

        let emailData = {};
        if (!docData.fullName || !docData.phone) {
          const emailList = Array.from(new Set([cred.user.email, normalizedEmail].filter(Boolean)));
          const [uSnap, aSnap, tSnap] = await Promise.all([
            getDocs(query(collection(db, 'users'), where('email', 'in', emailList))).catch(() => null),
            getDocs(query(collection(db, 'admins'), where('email', 'in', emailList))).catch(() => null),
            getDocs(query(collection(db, 'telecaller_profiles'), where('email', 'in', emailList))).catch(() => null)
          ]);

          emailData = {
            ...(aSnap && !aSnap.empty ? aSnap.docs[0].data() : {}),
            ...(tSnap && !tSnap.empty ? tSnap.docs[0].data() : {}),
            ...(uSnap && !uSnap.empty ? uSnap.docs[0].data() : {})
          };
        }

        profile = { ...emailData, ...docData };
      } catch (e) {
        console.warn('Could not read user profile from Firestore:', e);
      }

      const role = determineUserRole({
        customRole,
        profileData: profile,
        email: cred.user.email,
        portalHint
      });

      // Name resolution
      const rawFullName = profile?.fullName || profile?.displayName || cred.user.displayName;
      const resolvedFullName = (rawFullName && !rawFullName.toLowerCase().includes('super admin') && rawFullName !== 'Administrator')
        ? rawFullName
        : ((normalizedEmail.includes('adinath')) ? 'Adinath Powar' : (rawFullName || normalizedEmail.split('@')[0]));

      // Update Firebase Auth user displayName if missing or mismatch
      try {
        if (resolvedFullName && (!cred.user.displayName || cred.user.displayName !== resolvedFullName)) {
          const { updateProfile } = await import('firebase/auth');
          await updateProfile(cred.user, { displayName: resolvedFullName }).catch(() => {});
        }
      } catch (e) {}

      // Self-heal: Ensure this user's document exists in 'users' collection with correct admin role and resolved name
      if (role === 'admin' || role === 'super_admin' || role === 'superadmin') {
        try {
          const userDocRef = doc(db, 'users', cred.user.uid);
          await setDoc(userDocRef, {
            uid: cred.user.uid,
            email: cred.user.email,
            fullName: resolvedFullName,
            displayName: resolvedFullName,
            role: role === 'superadmin' ? 'super_admin' : role,
            status: 'active',
            updatedAt: new Date().toISOString()
          }, { merge: true });

          const adminDocRef = doc(db, 'admins', cred.user.uid);
          await setDoc(adminDocRef, {
            uid: cred.user.uid,
            email: cred.user.email,
            fullName: resolvedFullName,
            displayName: resolvedFullName,
            role: role === 'superadmin' ? 'super_admin' : role,
            status: 'active',
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (syncErr) {
          console.warn('Could not sync admin profile to users collection:', syncErr);
        }
      }

      // Check account approval / activation status
      if (profile?.status === 'inactive' || profile?.status === 'deactivated') {
        return {
          success: false,
          error: 'हे खाते निष्क्रिय (Deactivated) करण्यात आले आहे. कृपया प्रशासकाशी संपर्क साधा.'
        };
      }

      if (profile?.status === 'pending' || profile?.status === 'pending_approval' || role === 'pending_applicant' || profile?.role === 'pending_applicant') {
        return {
          success: false,
          error: 'आपली नोंदणी प्राप्त झाली आहे, परंतु संस्था ॲडमिनने (Admin) अद्याप आपले खाते मंजूर केलेले नाही. ॲडमिनने मंजुरी (Approve) दिल्यानंतरच तुम्हाला टेलिकॉलर रोल व लॉगिन प्रवेश मिळेल.'
        };
      }

      const user = {
        ...profile,
        uid: cred.user.uid,
        email: cred.user.email,
        fullName: resolvedFullName,
        displayName: resolvedFullName,
        role,
        employeeId: profile?.employeeId || '',
        phone: profile?.phone || profile?.mobileNumber || '',
        whatsappNumber: profile?.whatsappNumber || profile?.phone || '',
        address: profile?.address || '',
        designation: profile?.designation || (role.includes('admin') ? 'Principal & Executive Director' : 'Admission Counselor'),
        profileImage: profile?.profileImage || null,
        isActive: profile?.status ? profile.status === 'active' : true,
        claims: tokenResult.claims
      };

      localStorage.setItem('gurukul_active_user', JSON.stringify(user));
      return { success: true, user };
    } catch (err) {
      console.error('Firebase Auth Login Error:', err);
      let errorMsg = 'लॉगिन अयशस्वी झाले. ईमेल किंवा पासवर्ड चुकीचा आहे.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorMsg = 'या ईमेलचा युझर अस्तित्वात नाही किंवा तपशील चुकीचा आहे.';
      } else if (err.code === 'auth/wrong-password') {
        errorMsg = 'पासवर्ड चुकीचा आहे. कृपया पुन्हा प्रयत्न करा.';
      } else if (err.code === 'auth/user-disabled') {
        errorMsg = 'हे खाते निष्क्रिय (Deactivated) करण्यात आले आहे. कृपया प्रशासकाशी संपर्क साधा.';
      }
      return { success: false, error: errorMsg, code: err.code };
    }
  }

  // Fallback for local development

  // 1. Check demo accounts first
  const found = demoUsers.find(u => u.email.toLowerCase() === normalizedEmail);
  if (found) {
    localStorage.setItem('gurukul_active_user', JSON.stringify(found));
    return { success: true, user: found };
  }

  // 2. Check local admins created in AdminManagementPage
  try {
    const localAdmins = JSON.parse(localStorage.getItem('gurukul_local_admins') || '[]');
    const adminMatch = localAdmins.find(a => (a.email || '').toLowerCase() === normalizedEmail);
    if (adminMatch) {
      if (adminMatch.password && adminMatch.password !== password) {
        return { success: false, error: 'पासवर्ड चुकीचा आहे. कृपया पुन्हा प्रयत्न करा.' };
      }
      const adminObj = {
        uid: adminMatch.uid,
        email: adminMatch.email,
        displayName: adminMatch.fullName || adminMatch.displayName || adminMatch.email.split('@')[0],
        role: adminMatch.role || 'admin',
        employeeId: adminMatch.employeeId || 'ADM-LOCAL',
        phone: adminMatch.phone || '',
        status: adminMatch.status || 'active',
        isActive: adminMatch.status !== 'inactive'
      };
      localStorage.setItem('gurukul_active_user', JSON.stringify(adminObj));
      return { success: true, user: adminObj };
    }
  } catch (e) {
    console.warn('Could not read local admins:', e);
  }

  // 3. Check locally registered telecallers (ONLY if portalHint is not 'admin' or 'super_admin')
  if (portalHint !== 'admin' && portalHint !== 'super_admin') {
    try {
      const registered = JSON.parse(localStorage.getItem('gurukul_registered_telecallers') || '[]');
      const storedTCs = JSON.parse(localStorage.getItem('gurukul_stored_telecallers') || '[]');
      const allTCs = [...registered, ...storedTCs];
      const matchReg = allTCs.find(u => (u.email || '').toLowerCase() === normalizedEmail);
      if (matchReg) {
        if (matchReg.password && matchReg.password !== password) {
          return { success: false, error: 'पासवर्ड चुकीचा आहे. कृपया पुन्हा प्रयत्न करा.' };
        }
        if (matchReg.status === 'inactive' || matchReg.status === 'deactivated') {
          return { success: false, error: 'हे खाते निष्क्रिय (Deactivated) करण्यात आले आहे. कृपया प्रशासकाशी संपर्क साधा.' };
        }
        if (matchReg.status === 'pending' || matchReg.status === 'pending_approval' || matchReg.role === 'pending_applicant') {
          return {
            success: false,
            error: 'आपली नोंदणी प्राप्त झाली आहे, परंतु संस्था ॲडमिनने (Admin) अद्याप आपले खाते मंजूर केलेले नाही. ॲडमिनने मंजुरी (Approve) दिल्यानंतरच तुम्हाला टेलिकॉलर रोल व लॉगिन प्रवेश मिळेल.'
          };
        }
        const userObj = {
          uid: matchReg.uid || matchReg.userId,
          email: matchReg.email,
          displayName: matchReg.fullName || matchReg.displayName || matchReg.email.split('@')[0],
          role: 'telecaller',
          employeeId: matchReg.employeeId || 'TC-REG',
          phone: matchReg.phone || matchReg.mobileNumber || '',
          status: 'active',
          isActive: true
        };
        localStorage.setItem('gurukul_active_user', JSON.stringify(userObj));
        return { success: true, user: userObj };
      }
    } catch (e) {
      console.warn('Could not read registered telecallers:', e);
    }
  }

  // 4. Block unauthorized telecaller login attempts
  if (portalHint === 'telecaller') {
    return {
      success: false,
      error: 'या ईमेलसाठी मंजूर टेलिकॉलर खाते आढळले नाही किंवा ॲडमिन मंजुरी प्रलंबित आहे. ॲडमिनने मंजूर केल्यानंतरच लॉगिन करता येईल.'
    };
  }

  // For developer convenience / test accounts (Admin portal only)
  const resolvedRole = determineUserRole({ email: normalizedEmail, portalHint });
  const generic = {
    uid: `user-${Date.now()}`,
    email,
    displayName: email.split('@')[0],
    role: resolvedRole,
    phone: '9850449800',
    isActive: true
  };
  localStorage.setItem('gurukul_active_user', JSON.stringify(generic));
  return { success: true, user: generic };
};

// 2. Sign Out
export const logoutUser = async () => {
  if (isConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase SignOut Error:', err);
    }
  }
  localStorage.removeItem('gurukul_active_user');
};

// 3. Request Password Reset Link
export const sendPasswordReset = async (email) => {
  if (!email) return { success: false, error: 'ईमेल आवश्यक आहे.' };

  if (isConfigured && auth) {
    try {
      // In web client, we can send password reset email via client SDK
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'पासवर्ड रीसेट लिंक आपल्या ईमेलवर पाठवण्यात आली आहे.' };
    } catch (err) {
      console.error('Password reset error:', err);
      return { success: false, error: err.message || 'पासवर्ड रीसेट लिंक पाठवताना त्रुटी आली.' };
    }
  }

  return { 
    success: true, 
    message: `[डेमो मोड] ${email} या पत्त्यावर पासवर्ड रीसेट सूचना पाठवली गेली आहे.` 
  };
};

// 4. Create Telecaller (Admin Functionality)
export const createTelecallerAccount = async (telecallerData) => {
  const { fullName, email, mobileNumber, whatsappNumber, employeeId, gender, address, initialPassword, assignedDepartment } = telecallerData;
  const finalEmpId = (employeeId && String(employeeId).trim()) ? String(employeeId).trim() : await getNextTelecallerEmployeeId();

  if (isConfigured && db) {
    try {
      // If Cloud Functions are deployed, we call the callable function
      if (functions && typeof httpsCallable === 'function') {
        const createFn = httpsCallable(functions, 'createTelecaller');
        const result = await createFn({ ...telecallerData, employeeId: finalEmpId });
        return result.data;
      }
    } catch (fnErr) {
      console.warn('Cloud Function invocation failed, applying direct Firestore transaction fallback:', fnErr);
      
      // Direct Firestore creation fallback
      const uid = `telecaller-${Date.now()}`;
      const now = new Date().toISOString();

      await setDoc(doc(db, 'users', uid), {
        uid,
        fullName,
        email,
        phone: mobileNumber,
        role: 'telecaller',
        status: 'active',
        employeeId: finalEmpId,
        profileImage: null,
        createdAt: now,
        updatedAt: now
      });

      await setDoc(doc(db, 'telecaller_profiles', uid), {
        userId: uid,
        employeeId: finalEmpId,
        fullName,
        email,
        phone: mobileNumber,
        whatsappNumber: whatsappNumber || mobileNumber,
        gender: gender || 'Not Specified',
        address: address || '',
        joiningDate: new Date().toISOString().split('T')[0],
        assignedDepartment: assignedDepartment || 'General Admissions',
        status: 'active',
        profileImage: null,
        createdAt: now,
        updatedAt: now
      });

      // Audit log
      try {
        await setDoc(doc(db, 'audit_logs', `log-${Date.now()}`), {
          action: 'TELECALLER_CREATED',
          targetUserId: uid,
          timestamp: now,
          metadata: { email, employeeId: finalEmpId, fullName }
        });
      } catch (e) {}

      return {
        success: true,
        uid,
        message: 'टेलिकॉलर खाते यशस्वीपणे तयार झाले.'
      };
    }
  }

  // Local state persistence fallback
  const mockId = `telecaller-${Date.now()}`;
  const mockRecord = {
    uid: mockId,
    userId: mockId,
    fullName,
    email,
    phone: mobileNumber,
    whatsappNumber: whatsappNumber || mobileNumber,
    employeeId: finalEmpId,
    gender: gender || 'Male',
    address: address || '',
    joiningDate: new Date().toISOString().split('T')[0],
    assignedDepartment: assignedDepartment || 'General Admissions',
    role: 'telecaller',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const stored = JSON.parse(localStorage.getItem('gurukul_stored_telecallers') || '[]');
  stored.unshift(mockRecord);
  localStorage.setItem('gurukul_stored_telecallers', JSON.stringify(stored));

  return {
    success: true,
    uid: mockId,
    message: 'नवीन टेलिकॉलर खाते तयार झाले (स्थानिक डेटा सेव्ह).'
  };
};

// 4b. Self-Registration for Telecallers (From Registration Form)
export const registerTelecaller = async (telecallerData) => {
  const { 
    fullName, 
    email, 
    mobileNumber, 
    whatsappNumber, 
    department, 
    password, 
    gender, 
    address 
  } = telecallerData;

  const normalizedEmail = (email || '').trim().toLowerCase();
  const empId = await getNextTelecallerEmployeeId();
  const now = new Date().toISOString();

  // If live Firebase auth is configured
  if (isConfigured && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const uid = userCredential.user.uid;

      try {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(userCredential.user, { displayName: fullName }).catch(() => {});
      } catch (e) {}

      if (db) {
        // 1. Create User Document with pending status & pending_applicant role
        await setDoc(doc(db, 'users', uid), {
          uid,
          fullName,
          displayName: fullName,
          email: normalizedEmail,
          phone: mobileNumber,
          role: 'pending_applicant',
          status: 'pending',
          approvedByAdmin: false,
          employeeId: empId,
          profileImage: null,
          createdAt: now,
          updatedAt: now
        });

        // 2. Create Telecaller Profile Document
        await setDoc(doc(db, 'telecaller_profiles', uid), {
          userId: uid,
          uid,
          employeeId: empId,
          fullName,
          displayName: fullName,
          email: normalizedEmail,
          phone: mobileNumber,
          whatsappNumber: whatsappNumber || mobileNumber,
          gender: gender || 'Not Specified',
          address: address || '',
          joiningDate: now.split('T')[0],
          assignedDepartment: department || 'General Admissions',
          role: 'pending_applicant',
          status: 'pending',
          approvedByAdmin: false,
          profileImage: null,
          createdAt: now,
          updatedAt: now
        });

        // 3. Dispatch Live Admin Notification
        try {
          const notifId = `notif-${Date.now()}`;
          await setDoc(doc(db, 'notifications', notifId), {
            id: notifId,
            recipientId: 'admin_broadcast',
            title: 'नवीन समुपदेशक (Telecaller) नोंदणी',
            message: `${fullName} (${normalizedEmail}) यांनी टेलिकॉलर म्हणून नोंदणी केली आहे. कृपया ॲडमिन पॅनेलमध्ये मंजुरी (Approval) द्या.`,
            type: 'TELECALLER_REGISTRATION',
            category: 'telecaller_approval',
            targetRole: 'admin',
            telecallerId: uid,
            telecallerEmail: normalizedEmail,
            telecallerName: fullName,
            status: 'pending',
            read: false,
            createdAt: now
          });
        } catch (notifErr) {
          console.warn('Could not write admin notification:', notifErr);
        }
      }

      // Also keep in localStorage for seamless instant sync
      try {
        const localRegistered = JSON.parse(localStorage.getItem('gurukul_registered_telecallers') || '[]');
        localRegistered.unshift({
          uid,
          fullName,
          email: normalizedEmail,
          password,
          mobileNumber,
          employeeId: empId,
          department: department || 'General Admissions',
          status: 'pending',
          createdAt: now
        });
        localStorage.setItem('gurukul_registered_telecallers', JSON.stringify(localRegistered));
      } catch (e) {}

      // Add to local notifications
      try {
        const localNotifs = JSON.parse(localStorage.getItem('gurukul_notifications') || '[]');
        localNotifs.unshift({
          id: `notif-${Date.now()}`,
          title: 'नवीन समुपदेशक (Telecaller) नोंदणी',
          message: `${fullName} (${normalizedEmail}) यांनी टेलिकॉलर म्हणून नोंदणी केली आहे. कृपया ॲडमिन पॅनेलमध्ये मंजुरी (Approval) द्या.`,
          type: 'TELECALLER_REGISTRATION',
          category: 'telecaller_approval',
          targetRole: 'admin',
          telecallerId: uid,
          telecallerEmail: normalizedEmail,
          telecallerName: fullName,
          read: false,
          createdAt: now
        });
        localStorage.setItem('gurukul_notifications', JSON.stringify(localNotifs));
      } catch (e) {}

      return {
        success: true,
        uid,
        email: normalizedEmail,
        message: 'नोंदणी यशस्वी झाली! आपले खाते प्रशासकाच्या (Admin) मंजुरीच्या प्रतीक्षेत आहे. प्रशासकाने मंजूर केल्यानंतर आपण लॉगिन करू शकाल.'
      };
    } catch (err) {
      console.error('Firebase Auth Registration Error:', err);
      let errorMsg = 'नोंदणी करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'हा ईमेल पत्ता आधीपासूनच नोंदणीकृत आहे. कृपया लॉगिन करा.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'पासवर्ड किमान ६ अक्षरांचा असावा.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.';
      }
      return { success: false, error: errorMsg, code: err.code };
    }
  }

  // Local fallback persistence
  let localRegistered = [];
  try {
    localRegistered = JSON.parse(localStorage.getItem('gurukul_registered_telecallers') || '[]');
  } catch (e) {
    localRegistered = [];
  }

  const exists = localRegistered.some(u => (u.email || '').toLowerCase() === normalizedEmail);
  if (exists) {
    return {
      success: false,
      error: 'हा ईमेल पत्ता आधीपासूनच नोंदणीकृत आहे. कृपया लॉगिन करा.'
    };
  }

  const mockId = `telecaller-${Date.now()}`;
  const newAccount = {
    uid: mockId,
    userId: mockId,
    fullName,
    email: normalizedEmail,
    password,
    phone: mobileNumber,
    mobileNumber,
    whatsappNumber: whatsappNumber || mobileNumber,
    employeeId: empId,
    gender: gender || 'Male',
    address: address || '',
    joiningDate: now.split('T')[0],
    assignedDepartment: department || 'General Admissions',
    role: 'pending_applicant',
    status: 'pending',
    approvedByAdmin: false,
    createdAt: now
  };

  localRegistered.unshift(newAccount);
  localStorage.setItem('gurukul_registered_telecallers', JSON.stringify(localRegistered));

  // Also add to gurukul_stored_telecallers so admin sees it in telecaller list
  try {
    const stored = JSON.parse(localStorage.getItem('gurukul_stored_telecallers') || '[]');
    stored.unshift(newAccount);
    localStorage.setItem('gurukul_stored_telecallers', JSON.stringify(stored));
  } catch (e) {}

  // Add notification for admin
  try {
    const localNotifs = JSON.parse(localStorage.getItem('gurukul_notifications') || '[]');
    localNotifs.unshift({
      id: `notif-${Date.now()}`,
      title: 'नवीन समुपदेशक (Telecaller) नोंदणी',
      message: `${fullName} (${normalizedEmail}) यांनी टेलिकॉलर म्हणून नोंदणी केली आहे. कृपया ॲडमिन पॅनेलमध्ये मंजुरी (Approval) द्या.`,
      type: 'TELECALLER_REGISTRATION',
      category: 'telecaller_approval',
      targetRole: 'admin',
      telecallerId: mockId,
      telecallerEmail: normalizedEmail,
      telecallerName: fullName,
      read: false,
      createdAt: now
    });
    localStorage.setItem('gurukul_notifications', JSON.stringify(localNotifs));
  } catch (e) {}

  return {
    success: true,
    uid: mockId,
    email: normalizedEmail,
    message: 'नोंदणी यशस्वी झाली! आपले खाते प्रशासकीय मंजुरीसाठी प्रलंबित आहे. ॲडमिनने मंजूर केल्यानंतरच टेलिकॉलर रोल व लॉगिन प्रवेश मिळेल.'
  };
};

// 5. Update Telecaller Account Status (Activate / Deactivate / Approve)
export const updateTelecallerStatus = async (userId, newStatus) => {
  const isApproved = newStatus === 'active';
  const role = isApproved ? 'telecaller' : (newStatus === 'pending' ? 'pending_applicant' : 'telecaller');

  if (isConfigured && db) {
    try {
      if (functions && typeof httpsCallable === 'function') {
        const statusFn = httpsCallable(functions, 'updateTelecallerStatus');
        const res = await statusFn({ userId, status: newStatus, role, approvedByAdmin: isApproved });
        return res.data;
      }
    } catch (err) {
      console.warn('Cloud Function status update fallback:', err);
      await updateDoc(doc(db, 'users', userId), { 
        status: newStatus, 
        role,
        approvedByAdmin: isApproved,
        updatedAt: serverTimestamp() 
      });
      try {
        await updateDoc(doc(db, 'telecaller_profiles', userId), { 
          status: newStatus, 
          role,
          approvedByAdmin: isApproved,
          updatedAt: serverTimestamp() 
        });
      } catch (e) {}
      return { success: true };
    }
  }

  // Local fallback
  const stored = JSON.parse(localStorage.getItem('gurukul_stored_telecallers') || '[]');
  const updated = stored.map(t => (t.uid === userId || t.userId === userId || t.id === userId) ? { 
    ...t, 
    status: newStatus,
    role,
    approvedByAdmin: isApproved
  } : t);
  localStorage.setItem('gurukul_stored_telecallers', JSON.stringify(updated));

  try {
    const registered = JSON.parse(localStorage.getItem('gurukul_registered_telecallers') || '[]');
    const regUpdated = registered.map(t => (t.uid === userId || t.userId === userId || t.id === userId) ? { 
      ...t, 
      status: newStatus,
      role,
      approvedByAdmin: isApproved
    } : t);
    localStorage.setItem('gurukul_registered_telecallers', JSON.stringify(regUpdated));
  } catch (e) {}

  return { success: true };
};

// 6. Update Telecaller Profile
export const updateTelecallerProfile = async (userId, updates) => {
  if (isConfigured && db) {
    try {
      if (functions && typeof httpsCallable === 'function') {
        const updateFn = httpsCallable(functions, 'updateTelecallerProfile');
        const res = await updateFn({ userId, updates });
        return res.data;
      }
    } catch (err) {
      console.warn('Cloud function profile update fallback:', err);
      await setDoc(doc(db, 'telecaller_profiles', userId), updates, { merge: true });
      if (updates.fullName || updates.phone) {
        await setDoc(doc(db, 'users', userId), {
          fullName: updates.fullName,
          phone: updates.phone
        }, { merge: true });
      }
      return { success: true };
    }
  }

  // Local fallback
  const stored = JSON.parse(localStorage.getItem('gurukul_stored_telecallers') || '[]');
  const updated = stored.map(t => (t.uid === userId || t.userId === userId) ? { ...t, ...updates } : t);
  localStorage.setItem('gurukul_stored_telecallers', JSON.stringify(updated));

  // If current active user is updating self, update active session
  const active = JSON.parse(localStorage.getItem('gurukul_active_user') || '{}');
  if (active.uid === userId) {
    localStorage.setItem('gurukul_active_user', JSON.stringify({ ...active, ...updates }));
  }

  return { success: true };
};

// Helper: Identify demo telecallers to exclude
export const isDemoTelecaller = (t) => {
  if (!t) return false;
  const id = String(t.id || t.uid || t.userId || '');
  const email = String(t.email || '').toLowerCase().trim();
  const name = String(t.fullName || t.displayName || t.name || '');
  const empId = String(t.employeeId || '');

  return id === 'telecaller-001' ||
         id === 'telecaller-002' ||
         email === 'telecaller1@gurukulbhose.com' ||
         email === 'telecaller2@gurukulbhose.com' ||
         empId === 'TC-101' ||
         empId === 'TC-102' ||
         name.includes('Sachin Patil') ||
         name.includes('Pooja Shinde');
};

// 7. Get Telecallers List (Only real-time telecallers, no demo mock data)
export const fetchTelecallersList = async () => {
  if (isConfigured && db) {
    try {
      const q = query(collection(db, 'telecaller_profiles'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const liveList = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => !isDemoTelecaller(t));
        if (liveList.length > 0) return liveList;
      }
      // Fallback check users collection with role == telecaller
      const uq = query(collection(db, 'users'), where('role', '==', 'telecaller'));
      const usnap = await getDocs(uq);
      if (!usnap.empty) {
        const liveList = usnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => !isDemoTelecaller(t));
        if (liveList.length > 0) return liveList;
      }
    } catch (err) {
      console.warn('Error fetching telecallers from Firestore:', err);
    }
  }

  // Local storage fallback (Sanitize out demo telecallers)
  try {
    const rawStored = JSON.parse(localStorage.getItem('gurukul_stored_telecallers') || '[]');
    const cleanedStored = rawStored.filter(t => !isDemoTelecaller(t));
    if (cleanedStored.length !== rawStored.length) {
      localStorage.setItem('gurukul_stored_telecallers', JSON.stringify(cleanedStored));
    }
    if (cleanedStored.length > 0) return cleanedStored;

    const rawReg = JSON.parse(localStorage.getItem('gurukul_registered_telecallers') || '[]');
    const cleanedReg = rawReg.filter(t => !isDemoTelecaller(t));
    if (cleanedReg.length > 0) return cleanedReg;
  } catch (e) {}

  return [];
};

// 7b. Get Next Telecaller Employee ID (Auto starts from TC-01)
export const getNextTelecallerEmployeeId = async () => {
  try {
    const liveList = await fetchTelecallersList();
    let rawStored = [];
    let rawReg = [];
    try {
      rawStored = JSON.parse(localStorage.getItem('gurukul_stored_telecallers') || '[]');
      rawReg = JSON.parse(localStorage.getItem('gurukul_registered_telecallers') || '[]');
    } catch (e) {}

    const all = [...(liveList || []), ...rawStored, ...rawReg].filter(t => !isDemoTelecaller(t));

    const existingNums = new Set();
    all.forEach(t => {
      const empId = String(t.employeeId || '').trim();
      const match = empId.match(/TC[-_\s]*(\d+)/i) || empId.match(/^(\d+)$/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val > 0) {
          existingNums.add(val);
        }
      }
    });

    let nextNum = 1;
    while (existingNums.has(nextNum)) {
      nextNum++;
    }

    return `TC-${String(nextNum).padStart(2, '0')}`;
  } catch (err) {
    console.warn('Error calculating next telecaller ID:', err);
    return 'TC-01';
  }
};

// 8. Fetch Audit Logs
export const fetchAuditLogs = async (maxCount = 20) => {
  if (isConfigured && db) {
    try {
      const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('Error fetching audit logs:', err);
    }
  }

  return [
    {
      id: 'log-1',
      actorId: 'superadmin-001',
      actorRole: 'super_admin',
      action: 'SYSTEM_AUDIT_INITIALIZED',
      targetUserId: null,
      timestamp: new Date().toISOString(),
      metadata: { note: 'Role-based authentication initialized.' }
    }
  ];
};

// ===============================================================
// PHASE 9: ADMIN MANAGEMENT, PROFILE & SECURE AUTH
// ===============================================================

/**
 * 9. Update Admin Profile (Full Name, Phone, Designation, Profile Image)
 */
export const updateAdminProfile = async (userId, updates) => {
  const allowedUpdates = {
    fullName: updates.fullName,
    displayName: updates.fullName,
    phone: updates.phone,
    designation: updates.designation || 'Administrator',
    profileImage: updates.profileImage || null,
    updatedAt: new Date().toISOString()
  };

  // Remove undefined fields
  Object.keys(allowedUpdates).forEach(k => allowedUpdates[k] === undefined && delete allowedUpdates[k]);

  if (isConfigured && db && userId) {
    try {
      await setDoc(doc(db, 'users', userId), allowedUpdates, { merge: true });
      try {
        await setDoc(doc(db, 'admins', userId), allowedUpdates, { merge: true });
      } catch (e) {}
    } catch (err) {
      console.warn('Could not update Firestore user document directly, using fallback:', err.message);
    }
  }

  // Update Firebase Auth user displayName if accessible
  try {
    if (auth?.currentUser && allowedUpdates.fullName) {
      const { updateProfile } = await import('firebase/auth');
      await updateProfile(auth.currentUser, { 
        displayName: allowedUpdates.fullName,
        photoURL: allowedUpdates.profileImage || null 
      }).catch(() => {});
    }
  } catch (e) {}

  // Update localStorage session
  const activeUser = JSON.parse(localStorage.getItem('gurukul_active_user') || '{}');
  if (activeUser.uid === userId || !activeUser.uid) {
    const updated = { ...activeUser, ...allowedUpdates, updatedAt: new Date().toISOString() };
    localStorage.setItem('gurukul_active_user', JSON.stringify(updated));
  }

  return { success: true, message: 'प्रोफाइल माहिती यशस्वीपणे अद्ययावत झाली.' };
};

/**
 * 10. Change User Password securely via Firebase Authentication
 * Never stores plaintext passwords!
 */
export const changeUserPassword = async (newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'पासवर्ड किमान 6 अक्षरांचा असावा.' };
  }

  if (isConfigured && auth && auth.currentUser) {
    try {
      const { updatePassword } = await import('firebase/auth');
      await updatePassword(auth.currentUser, newPassword);
      return { success: true, message: 'आपला पासवर्ड यशस्वीपणे बदलला गेला आहे.' };
    } catch (err) {
      console.error('Firebase Auth updatePassword error:', err);
      if (err.code === 'auth/requires-recent-login') {
        return {
          success: false,
          error: 'सुरक्षेसाठी कृपया पुन्हा एकदा लॉगिन करून पासवर्ड बदला (Re-authentication required).'
        };
      }
      return { success: false, error: err.message || 'पासवर्ड बदलताना तांत्रिक त्रुटी आली.' };
    }
  }

  // Local demo mode simulation
  return {
    success: true,
    message: 'डेमो मोड: पासवर्ड सुरक्षितपणे अद्ययावत करण्यात आला.'
  };
};

/**
 * 11. Fetch All Admin Accounts (Admins & Super Admins)
 */
export const fetchAdminsList = async () => {
  if (isConfigured && db) {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', 'in', ['admin', 'super_admin', 'superadmin'])
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, uid: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('Error fetching admins from Firestore:', err.message);
    }
  }

  // Local fallback
  return [
    {
      uid: 'superadmin-001',
      id: 'superadmin-001',
      fullName: 'Principal Sir',
      displayName: 'Principal Sir',
      email: 'principal@gurukulbhose.com',
      phone: '+91 9850449800',
      role: 'super_admin',
      designation: 'Principal & Executive Director',
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      uid: 'admin-001',
      id: 'admin-001',
      fullName: 'Admission HOD',
      displayName: 'Admission HOD',
      email: 'admissions@gurukulbhose.com',
      phone: '+91 7020260968',
      role: 'admin',
      designation: 'Admission Department Head',
      status: 'active',
      createdAt: '2024-02-15T00:00:00.000Z'
    }
  ];
};

/**
 * 12. Create New Admin Account (Super Admin action)
 */
export const createAdminAccount = async ({ fullName, email, phone, designation, password, role = 'admin' }) => {
  if (!fullName || !email) {
    return { success: false, error: 'नाव आणि ईमेल आवश्यक आहेत.' };
  }

  const now = new Date().toISOString();
  const uid = `admin-${Date.now()}`;

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'users', uid), {
        uid,
        fullName,
        displayName: fullName,
        email,
        phone: phone || '',
        designation: designation || 'System Administrator',
        role,
        status: 'active',
        createdAt: now,
        updatedAt: now
      });

      return { success: true, uid, message: `नवीन प्रशासक खाते ${fullName} यशस्वीपणे तयार केले.` };
    } catch (err) {
      console.warn('Could not save admin directly to Firestore:', err.message);
    }
  }

  return { success: true, uid, message: `स्थानिक डेमो: नवीन प्रशासक खाते ${fullName} तयार झाले.` };
};

/**
 * 13. Update User Status (Activate / Deactivate any account)
 */
export const updateUserStatus = async (userId, newStatus) => {
  if (isConfigured && db && userId) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
      });
      return { success: true };
    } catch (err) {
      console.warn('updateUserStatus error:', err.message);
    }
  }
  return { success: true };
};

/**
 * 14. Self-Registration for School Administrator (Before Login)
 * Allows Admin account creation with Firebase Auth and Firestore persistence
 */
export const registerAdminAccount = async ({ fullName, email, mobileNumber, designation, password, passcode }) => {
  if (!fullName || !email || !password) {
    return { success: false, error: 'कृपया सर्व आवश्यक माहिती प्रविष्ट करा (नाव, ईमेल आणि पासवर्ड).' };
  }

  const normalizedEmail = (email || '').trim().toLowerCase();
  const now = new Date().toISOString();
  let uid = `admin-${Date.now()}`;

  // If live Firebase auth is configured
  if (isConfigured && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      uid = userCredential.user.uid;

      try {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(userCredential.user, { displayName: fullName }).catch(() => {});
      } catch (e) {}

      if (db) {
        // Save in users collection
        await setDoc(doc(db, 'users', uid), {
          uid,
          fullName,
          displayName: fullName,
          email: normalizedEmail,
          phone: mobileNumber || '',
          designation: designation || 'School Administrator',
          role: 'admin',
          status: 'active',
          profileImage: null,
          createdAt: now,
          updatedAt: now
        });

        // Save in legacy admins collection as well
        await setDoc(doc(db, 'admins', uid), {
          uid,
          fullName,
          displayName: fullName,
          email: normalizedEmail,
          phone: mobileNumber || '',
          designation: designation || 'School Administrator',
          role: 'admin',
          status: 'active',
          createdAt: now,
          updatedAt: now
        });

        // Audit log
        try {
          await setDoc(doc(db, 'audit_logs', `log-${Date.now()}`), {
            action: 'ADMIN_REGISTERED',
            targetUserId: uid,
            timestamp: now,
            metadata: { email: normalizedEmail, fullName, designation }
          });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Firebase Auth Admin Register Error:', err);
      let errorMsg = 'नोंदणी करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'हा ईमेल आधीपासून नोंदणीकृत आहे. कृपया थेट लॉगिन करा.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'पासवर्ड किमान ६ अक्षरांचा असावा.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.';
      }
      return { success: false, error: errorMsg, code: err.code };
    }
  }

  // Local storage persistence
  const newAdmin = {
    uid,
    fullName,
    displayName: fullName,
    email: normalizedEmail,
    password,
    phone: mobileNumber || '',
    designation: designation || 'School Administrator',
    role: 'admin',
    status: 'active',
    createdAt: now,
    updatedAt: now
  };

  try {
    const localAdmins = JSON.parse(localStorage.getItem('gurukul_local_admins') || '[]');
    const existingIdx = localAdmins.findIndex(a => (a.email || '').toLowerCase() === normalizedEmail);
    if (existingIdx >= 0) {
      localAdmins[existingIdx] = newAdmin;
    } else {
      localAdmins.unshift(newAdmin);
    }
    localStorage.setItem('gurukul_local_admins', JSON.stringify(localAdmins));
  } catch (e) {}

  return {
    success: true,
    uid,
    message: 'ॲडमिन नोंदणी यशस्वी झाली! आपण आता अधिकृत ॲडमिन म्हणून लॉगिन करू शकता.'
  };
};

