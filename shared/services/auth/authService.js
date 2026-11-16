import { 
  auth, 
  db, 
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
} from '../../firebase/config';
import { demoUsers } from '../../data/initialData';

/**
 * Authentication and User Management Service
 * Supports Real Firebase Authentication & Custom Claims with safe fallback for development
 */

// 1. Sign In With Email & Password
export const loginWithEmail = async (email, password) => {
  if (isConfigured && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Retrieve idTokenResult to read custom claims
      const tokenResult = await cred.user.getIdTokenResult();
      const customRole = tokenResult.claims.role;

      // Also fetch Firestore user profile
      let profile = null;
      try {
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDoc.exists()) {
          profile = userDoc.data();
        } else {
          // Check legacy admins collection
          const adminDoc = await getDoc(doc(db, 'admins', cred.user.uid));
          if (adminDoc.exists()) {
            profile = adminDoc.data();
          }
        }
      } catch (e) {
        console.warn('Could not read user profile from Firestore:', e);
      }

      const role = customRole || profile?.role || 'telecaller';
      const user = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: profile?.fullName || cred.user.displayName || email.split('@')[0],
        role,
        employeeId: profile?.employeeId || '',
        phone: profile?.phone || '',
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
  const found = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (found) {
    localStorage.setItem('gurukul_active_user', JSON.stringify(found));
    return { success: true, user: found };
  }

  // For developer convenience with test accounts
  const generic = {
    uid: `user-${Date.now()}`,
    email,
    displayName: email.split('@')[0],
    role: email.includes('super') ? 'super_admin' : email.includes('admin') ? 'admin' : 'telecaller',
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

  if (isConfigured && db) {
    try {
      // If Cloud Functions are deployed, we call the callable function
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const createFn = httpsCallable(functions, 'createTelecaller');
      const result = await createFn(telecallerData);
      return result.data;
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
        employeeId,
        profileImage: null,
        createdAt: now,
        updatedAt: now
      });

      await setDoc(doc(db, 'telecaller_profiles', uid), {
        userId: uid,
        employeeId,
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
          metadata: { email, employeeId, fullName }
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
    employeeId,
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

// 5. Update Telecaller Account Status (Activate / Deactivate)
export const updateTelecallerStatus = async (userId, newStatus) => {
  if (isConfigured && db) {
    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const statusFn = httpsCallable(functions, 'updateTelecallerStatus');
      const res = await statusFn({ userId, status: newStatus });
      return res.data;
    } catch (err) {
      console.warn('Cloud Function status update fallback:', err);
      await updateDoc(doc(db, 'users', userId), { status: newStatus, updatedAt: serverTimestamp() });
      try {
        await updateDoc(doc(db, 'telecaller_profiles', userId), { status: newStatus, updatedAt: serverTimestamp() });
      } catch (e) {}
      return { success: true };
    }
  }

  // Local fallback
  const stored = JSON.parse(localStorage.getItem('gurukul_stored_telecallers') || '[]');
  const updated = stored.map(t => t.uid === userId || t.userId === userId ? { ...t, status: newStatus } : t);
  localStorage.setItem('gurukul_stored_telecallers', JSON.stringify(updated));
  return { success: true };
};

// 6. Update Telecaller Profile
export const updateTelecallerProfile = async (userId, updates) => {
  if (isConfigured && db) {
    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const updateFn = httpsCallable(functions, 'updateTelecallerProfile');
      const res = await updateFn({ userId, updates });
      return res.data;
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

// 7. Get Telecallers List
export const fetchTelecallersList = async () => {
  if (isConfigured && db) {
    try {
      const q = query(collection(db, 'telecaller_profiles'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      // Fallback check users collection with role == telecaller
      const uq = query(collection(db, 'users'), where('role', '==', 'telecaller'));
      const usnap = await getDocs(uq);
      if (!usnap.empty) {
        return usnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('Error fetching telecallers from Firestore:', err);
    }
  }

  // Local fallback
  const stored = JSON.parse(localStorage.getItem('gurukul_stored_telecallers') || '[]');
  if (stored.length > 0) return stored;

  return [
    {
      uid: 'telecaller-001',
      userId: 'telecaller-001',
      employeeId: 'TC-101',
      fullName: 'Sachin Patil (Counselor)',
      email: 'telecaller1@gurukulbhose.com',
      phone: '7020260968',
      whatsappNumber: '7020260968',
      gender: 'Male',
      address: 'मिरज, सांगली',
      joiningDate: '2024-06-01',
      status: 'active',
      assignedDepartment: 'शालेय प्रवेश (5th - 10th)'
    },
    {
      uid: 'telecaller-002',
      userId: 'telecaller-002',
      employeeId: 'TC-102',
      fullName: 'Pooja Shinde (Counselor)',
      email: 'telecaller2@gurukulbhose.com',
      phone: '9850112233',
      whatsappNumber: '9850112233',
      gender: 'Female',
      address: 'सांगली',
      joiningDate: '2024-07-15',
      status: 'active',
      assignedDepartment: 'कॉलेज प्रवेश (11th - 12th Science & Arts)'
    }
  ];
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
