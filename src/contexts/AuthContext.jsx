import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  onAuthStateChanged,
  doc, 
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  isConfigured 
} from '../firebase/config';
import { 
  loginWithEmail, 
  logoutUser, 
  sendPasswordReset,
  registerTelecaller,
  registerAdminAccount,
  determineUserRole
} from '../services/auth/authService';
import { demoUsers } from '../data/initialData';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and restore session from localStorage / Firebase Auth
  useEffect(() => {
    let isMounted = true;

    // Check if there is an active user in localStorage
    const savedUser = localStorage.getItem('gurukul_active_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (isMounted) {
          setCurrentUser(parsed);
          setUserProfile(parsed);
        }
      } catch (e) {
        console.error('Failed to parse active user from localStorage', e);
      }
    }

    // Subscribe to live Firebase Auth state changes
    let unsubscribe = () => {};
    if (isConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMounted) return;

        if (firebaseUser) {
          try {
            // Read Custom Claims (cached for speed, no blocking network wait)
            const idTokenResult = await firebaseUser.getIdTokenResult(false);
            const customRole = idTokenResult.claims.role;

            // Read Firestore Profile with parallelized lookups across users, admins, and telecaller_profiles
            let profileData = {};
            try {
              const [userSnap, teleSnap, adminSnap] = await Promise.all([
                getDoc(doc(db, 'users', firebaseUser.uid)).catch(() => null),
                getDoc(doc(db, 'telecaller_profiles', firebaseUser.uid)).catch(() => null),
                getDoc(doc(db, 'admins', firebaseUser.uid)).catch(() => null)
              ]);

              const docData = {
                ...(teleSnap?.exists() ? teleSnap.data() : {}),
                ...(userSnap?.exists() ? userSnap.data() : {}),
                ...(adminSnap?.exists() ? adminSnap.data() : {})
              };

              let emailData = {};
              if (!docData.fullName || !docData.phone || !docData.role) {
                const emailList = Array.from(new Set([firebaseUser.email, firebaseUser.email?.toLowerCase()].filter(Boolean)));
                const [uSnap, aSnap, tSnap] = await Promise.all([
                  getDocs(query(collection(db, 'users'), where('email', 'in', emailList))).catch(() => null),
                  getDocs(query(collection(db, 'admins'), where('email', 'in', emailList))).catch(() => null),
                  getDocs(query(collection(db, 'telecaller_profiles'), where('email', 'in', emailList))).catch(() => null)
                ]);

                emailData = {
                  ...(tSnap && !tSnap.empty ? tSnap.docs[0].data() : {}),
                  ...(uSnap && !uSnap.empty ? uSnap.docs[0].data() : {}),
                  ...(aSnap && !aSnap.empty ? aSnap.docs[0].data() : {})
                };
              }

              profileData = { ...emailData, ...docData };
            } catch (readErr) {
              console.warn('Could not read user profile from Firestore:', readErr);
            }

            // Check if active session in localStorage was an admin
            let existingStoredRole = null;
            try {
              const saved = JSON.parse(localStorage.getItem('gurukul_active_user') || 'null');
              if (saved?.email?.toLowerCase() === firebaseUser.email?.toLowerCase()) {
                existingStoredRole = saved.role;
              }
            } catch (e) {}

            const normalizedRole = determineUserRole({
              customRole,
              profileData: Object.keys(profileData).length > 0 ? profileData : (existingStoredRole ? { role: existingStoredRole } : null),
              email: firebaseUser.email,
              portalHint: existingStoredRole || null
            });

            // Name resolution
            const rawFullName = profileData?.fullName || profileData?.displayName || firebaseUser.displayName;
            const resolvedFullName = (rawFullName && !rawFullName.toLowerCase().includes('super admin') && rawFullName !== 'Administrator')
              ? rawFullName
              : ((firebaseUser.email?.toLowerCase().includes('adinath')) ? 'Adinath Powar' : (rawFullName || firebaseUser.email?.split('@')[0] || 'User'));

            // Self-heal: ensure admin record exists in 'users' and 'admins' collection
            if (normalizedRole === 'admin' || normalizedRole === 'super_admin' || normalizedRole === 'superadmin') {
              try {
                const adminPayload = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  fullName: resolvedFullName,
                  displayName: resolvedFullName,
                  role: normalizedRole === 'superadmin' ? 'super_admin' : normalizedRole,
                  status: 'active',
                  updatedAt: new Date().toISOString()
                };
                await Promise.all([
                  setDoc(doc(db, 'users', firebaseUser.uid), adminPayload, { merge: true }),
                  setDoc(doc(db, 'admins', firebaseUser.uid), adminPayload, { merge: true })
                ]);
              } catch (syncErr) {
                console.warn('Auto-heal users doc error:', syncErr);
              }
            }

            const profile = {
              ...profileData,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              fullName: resolvedFullName,
              displayName: resolvedFullName,
              role: normalizedRole,
              employeeId: profileData?.employeeId || '',
              phone: profileData?.phone || profileData?.mobileNumber || '',
              whatsappNumber: profileData?.whatsappNumber || profileData?.phone || '',
              address: profileData?.address || '',
              designation: profileData?.designation || (normalizedRole.includes('admin') ? 'Principal & Executive Director' : 'Admission Counselor'),
              profileImage: profileData?.profileImage || null,
              status: profileData?.status || 'active',
              isActive: profileData?.status !== 'inactive'
            };

            setCurrentUser(profile);
            setUserProfile(profile);
            localStorage.setItem('gurukul_active_user', JSON.stringify(profile));
          } catch (err) {
            console.warn('Live user profile fetch error:', err);
          }
        }
        if (isMounted) {
          setLoading(false);
        }
      });
    } else {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Standard Login function
  const login = async (email, password, portalHint = null) => {
    setLoading(true);
    const result = await loginWithEmail(email, password, portalHint);
    if (result.success) {
      setCurrentUser(result.user);
      setUserProfile(result.user);
    }
    setLoading(false);
    return result;
  };

  // Standard Logout function
  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Password Reset function
  const requestPasswordReset = async (email) => {
    return await sendPasswordReset(email);
  };

  // Refresh profile
  const refreshUserProfile = async () => {
    const userToRefresh = currentUser || userProfile;
    if (!userToRefresh?.uid && !userToRefresh?.email) return;
    if (isConfigured && db) {
      try {
        const uid = userToRefresh.uid;
        const email = userToRefresh.email;

        const [userSnap, teleSnap, adminSnap] = await Promise.all([
          uid ? getDoc(doc(db, 'users', uid)).catch(() => null) : null,
          uid ? getDoc(doc(db, 'telecaller_profiles', uid)).catch(() => null) : null,
          uid ? getDoc(doc(db, 'admins', uid)).catch(() => null) : null
        ]);

        const docData = {
          ...(teleSnap?.exists() ? teleSnap.data() : {}),
          ...(userSnap?.exists() ? userSnap.data() : {}),
          ...(adminSnap?.exists() ? adminSnap.data() : {})
        };

        let emailData = {};
        if (email && (!docData.fullName || !docData.role || Object.keys(docData).length === 0)) {
          const emailList = Array.from(new Set([email, email.toLowerCase()].filter(Boolean)));
          const [uSnap, aSnap, tSnap] = await Promise.all([
            getDocs(query(collection(db, 'users'), where('email', 'in', emailList))).catch(() => null),
            getDocs(query(collection(db, 'admins'), where('email', 'in', emailList))).catch(() => null),
            getDocs(query(collection(db, 'telecaller_profiles'), where('email', 'in', emailList))).catch(() => null)
          ]);
          emailData = {
            ...(tSnap && !tSnap.empty ? tSnap.docs[0].data() : {}),
            ...(uSnap && !uSnap.empty ? uSnap.docs[0].data() : {}),
            ...(aSnap && !aSnap.empty ? aSnap.docs[0].data() : {})
          };
        }

        const mergedData = { ...emailData, ...docData };
        if (Object.keys(mergedData).length > 0) {
          const rawName = mergedData.fullName || mergedData.displayName || userToRefresh.displayName;
          const resolvedName = (rawName && !rawName.toLowerCase().includes('super admin') && rawName !== 'Administrator')
            ? rawName
            : ((email?.toLowerCase().includes('adinath')) ? 'Adinath Powar' : (rawName || 'User'));

          const updated = {
            ...userToRefresh,
            ...mergedData,
            fullName: resolvedName,
            displayName: resolvedName,
            phone: mergedData.phone || mergedData.mobileNumber || userToRefresh.phone || '',
            whatsappNumber: mergedData.whatsappNumber || mergedData.phone || userToRefresh.whatsappNumber || '',
            address: mergedData.address || userToRefresh.address || '',
            designation: mergedData.designation || userToRefresh.designation || '',
            profileImage: mergedData.profileImage || userToRefresh.profileImage || null
          };
          setCurrentUser(updated);
          setUserProfile(updated);
          localStorage.setItem('gurukul_active_user', JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Could not refresh user profile:', e);
      }
    }
  };

  // Demo account switch helper for testing role views
  const switchDemoAccount = (roleType) => {
    let target = demoUsers[0];
    if (roleType === 'superadmin' || roleType === 'super_admin') {
      target = demoUsers.find(u => u.role === 'superadmin' || u.role === 'super_admin') || demoUsers[0];
    } else if (roleType === 'admin') {
      target = demoUsers.find(u => u.role === 'admin') || demoUsers[1];
    } else if (roleType === 'telecaller') {
      target = demoUsers.find(u => u.role === 'telecaller') || null;
      if (!target) return;
    }
    setCurrentUser(target);
    setUserProfile(target);
    localStorage.setItem('gurukul_active_user', JSON.stringify(target));
  };

  // Normalized Role Computations
  const rawRole = (userProfile?.role || currentUser?.role || 'guest').toLowerCase();
  const rawStatus = (userProfile?.status || currentUser?.status || 'active').toLowerCase();
  const isSuperAdmin = rawRole === 'super_admin' || rawRole === 'superadmin';
  const isAdmin = isSuperAdmin || rawRole === 'admin';
  // Telecaller role is strictly active ONLY when approved by admin
  const isPendingApproval = rawStatus === 'pending' || rawStatus === 'pending_approval' || rawRole === 'pending_applicant';
  const isTelecaller = rawRole === 'telecaller' && !isPendingApproval && rawStatus === 'active';
  const canManageUsers = isSuperAdmin || rawRole === 'admin';
  const canAccessAllLeads = isSuperAdmin || rawRole === 'admin';

  const role = isSuperAdmin ? 'super_admin' : (isPendingApproval ? 'pending_applicant' : rawRole);

  const value = {
    currentUser,
    userProfile,
    role,
    isSuperAdmin,
    isAdmin,
    isTelecaller,
    isPendingApproval,
    canManageUsers,
    canAccessAllLeads,
    login,
    logout,
    registerTelecaller,
    registerAdminAccount,
    requestPasswordReset,
    refreshUserProfile,
    switchDemoAccount,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
