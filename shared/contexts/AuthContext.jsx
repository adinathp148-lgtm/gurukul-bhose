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

            // Read Firestore Profile with parallelized lookups
            let profileData = null;
            try {
              // 1. Check users, telecaller_profiles, and admins concurrently by UID
              const [userSnap, teleSnap, adminSnap] = await Promise.all([
                getDoc(doc(db, 'users', firebaseUser.uid)).catch(() => null),
                getDoc(doc(db, 'telecaller_profiles', firebaseUser.uid)).catch(() => null),
                getDoc(doc(db, 'admins', firebaseUser.uid)).catch(() => null)
              ]);

              if (userSnap && userSnap.exists()) {
                profileData = { ...(teleSnap && teleSnap.exists() ? teleSnap.data() : {}), ...userSnap.data() };
              } else if (teleSnap && teleSnap.exists()) {
                profileData = teleSnap.data();
              } else if (adminSnap && adminSnap.exists()) {
                profileData = adminSnap.data();
              } else {
                // 2. Concurrently check email lookups if UID doc wasn't found
                const [uSnap, aSnap] = await Promise.all([
                  getDocs(query(collection(db, 'users'), where('email', '==', firebaseUser.email))).catch(() => null),
                  getDocs(query(collection(db, 'admins'), where('email', '==', firebaseUser.email))).catch(() => null)
                ]);
                if (uSnap && !uSnap.empty) {
                  profileData = uSnap.docs[0].data();
                } else if (aSnap && !aSnap.empty) {
                  profileData = aSnap.docs[0].data();
                }
              }
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
              profileData: profileData || (existingStoredRole ? { role: existingStoredRole } : null),
              email: firebaseUser.email,
              portalHint: existingStoredRole || null
            });

            // Self-heal: ensure admin record exists in 'users' collection
            if (normalizedRole === 'admin' || normalizedRole === 'super_admin' || normalizedRole === 'superadmin') {
              try {
                await setDoc(doc(db, 'users', firebaseUser.uid), {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: profileData?.fullName || profileData?.displayName || firebaseUser.displayName || firebaseUser.email.split('@')[0],
                  role: normalizedRole === 'superadmin' ? 'super_admin' : normalizedRole,
                  status: 'active',
                  updatedAt: new Date().toISOString()
                }, { merge: true });
              } catch (syncErr) {
                console.warn('Auto-heal users doc error:', syncErr);
              }
            }

            const profile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: profileData?.fullName || profileData?.displayName || firebaseUser.displayName || firebaseUser.email.split('@')[0],
              role: normalizedRole,
              employeeId: profileData?.employeeId || '',
              phone: profileData?.phone || '',
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
    if (!currentUser?.uid) return;
    if (isConfigured && db) {
      try {
        const [userSnap, teleSnap] = await Promise.all([
          getDoc(doc(db, 'users', currentUser.uid)).catch(() => null),
          getDoc(doc(db, 'telecaller_profiles', currentUser.uid)).catch(() => null)
        ]);
        const mergedData = {
          ...(teleSnap && teleSnap.exists() ? teleSnap.data() : {}),
          ...(userSnap && userSnap.exists() ? userSnap.data() : {})
        };
        if (Object.keys(mergedData).length > 0) {
          const updated = { ...currentUser, ...mergedData };
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
      target = demoUsers.find(u => u.role === 'telecaller') || {
        uid: "tc-sachin-101",
        email: "telecaller1@gurukulbhose.com",
        displayName: "सचिन पाटील (कौन्सिलर)",
        fullName: "Sachin Patil",
        role: "telecaller",
        employeeId: "TC-101",
        phone: "9850123451",
        status: "active",
        isActive: true
      };
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
