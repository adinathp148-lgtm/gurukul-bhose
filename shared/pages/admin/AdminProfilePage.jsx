import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { db, doc, getDoc, collection, query, where, getDocs, setDoc, isConfigured } from '../../firebase/config';
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Lock,
  LogOut,
  Save,
  Camera,
  X,
  BadgeCheck,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { updateAdminProfile, changeUserPassword } from '../../services/auth/authService';

export const AdminProfilePage = () => {
  const { isMarathi } = useLanguage();
  const { currentUser, userProfile, role, isSuperAdmin, logout, refreshUserProfile } = useAuth();
  const navigate = useNavigate();

  const getInitialName = () => {
    const raw = userProfile?.fullName || userProfile?.displayName || currentUser?.fullName || currentUser?.displayName;
    if (raw && !raw.toLowerCase().includes('super admin') && raw !== 'Administrator') {
      return raw;
    }
    const email = userProfile?.email || currentUser?.email || '';
    if (email.toLowerCase().includes('adinath')) {
      return 'Adinath Powar';
    }
    return raw || 'Adinath Powar';
  };

  const [formData, setFormData] = useState({
    fullName: getInitialName(),
    email: currentUser?.email || userProfile?.email || 'admin@gurukulbhose.com',
    phone: userProfile?.phone || userProfile?.mobileNumber || currentUser?.phone || '+91 9850449800',
    designation: userProfile?.designation || (isSuperAdmin ? 'Principal & Executive Director' : 'School Administrator'),
    profileImage: userProfile?.profileImage || null
  });

  const [fetchingLive, setFetchingLive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Live Firestore Data Connection on mount and when user session changes
  useEffect(() => {
    let isMounted = true;

    const loadLiveProfileFromFirestore = async () => {
      const active = userProfile || currentUser;
      const email = active?.email;
      const uid = active?.uid;

      // Initial populate from Auth Context
      let currentResolvedName = active?.fullName || active?.displayName;
      if (!currentResolvedName || currentResolvedName.toLowerCase().includes('super admin') || currentResolvedName === 'Administrator') {
        if (email?.toLowerCase().includes('adinath')) {
          currentResolvedName = 'Adinath Powar';
        }
      }

      if (isMounted) {
        setFormData(prev => ({
          ...prev,
          fullName: currentResolvedName || prev.fullName || 'Adinath Powar',
          email: email || prev.email,
          phone: active?.phone || active?.mobileNumber || prev.phone,
          designation: active?.designation || prev.designation,
          profileImage: active?.profileImage || prev.profileImage
        }));
      }

      // Fetch live record from Cloud Firestore
      if (isConfigured && db && (uid || email)) {
        setFetchingLive(true);
        try {
          const [userSnap, adminSnap] = await Promise.all([
            uid ? getDoc(doc(db, 'users', uid)).catch(() => null) : null,
            uid ? getDoc(doc(db, 'admins', uid)).catch(() => null) : null
          ]);

          let firestoreData = {
            ...(userSnap?.exists() ? userSnap.data() : {}),
            ...(adminSnap?.exists() ? adminSnap.data() : {})
          };

          // If UID doc was not found or has missing name/phone, query by email
          if (email && (!firestoreData.fullName || !firestoreData.phone)) {
            const emailList = Array.from(new Set([email, email.toLowerCase()].filter(Boolean)));
            const [uSnap, aSnap] = await Promise.all([
              getDocs(query(collection(db, 'users'), where('email', 'in', emailList))).catch(() => null),
              getDocs(query(collection(db, 'admins'), where('email', 'in', emailList))).catch(() => null)
            ]);

            firestoreData = {
              ...firestoreData,
              ...(uSnap && !uSnap.empty ? uSnap.docs[0].data() : {}),
              ...(aSnap && !aSnap.empty ? aSnap.docs[0].data() : {})
            };
          }

          if (isMounted && Object.keys(firestoreData).length > 0) {
            let firestoreName = firestoreData.fullName || firestoreData.displayName;
            if (!firestoreName || firestoreName.toLowerCase().includes('super admin') || firestoreName === 'Administrator') {
              if (email?.toLowerCase().includes('adinath')) {
                firestoreName = 'Adinath Powar';
              }
            }

            setFormData(prev => ({
              fullName: firestoreName || prev.fullName || 'Adinath Powar',
              email: firestoreData.email || email || prev.email,
              phone: firestoreData.phone || firestoreData.mobileNumber || prev.phone,
              designation: firestoreData.designation || prev.designation || 'Principal & Executive Director',
              profileImage: firestoreData.profileImage || prev.profileImage
            }));
          }
        } catch (fetchErr) {
          console.warn('Live Firestore profile fetch error:', fetchErr);
        } finally {
          if (isMounted) setFetchingLive(false);
        }
      }
    };

    loadLiveProfileFromFirestore();

    return () => {
      isMounted = false;
    };
  }, [currentUser, userProfile]);

  // Avatar presets for quick selection
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  ];

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const uid = currentUser?.uid || userProfile?.uid;
    const res = await updateAdminProfile(uid, {
      fullName: formData.fullName,
      phone: formData.phone,
      designation: formData.designation,
      profileImage: formData.profileImage
    });

    // Also write directly to Firestore users and admins docs
    if (isConfigured && db && uid) {
      try {
        const updatePayload = {
          fullName: formData.fullName,
          displayName: formData.fullName,
          phone: formData.phone,
          designation: formData.designation,
          profileImage: formData.profileImage,
          updatedAt: new Date().toISOString()
        };
        await Promise.all([
          setDoc(doc(db, 'users', uid), updatePayload, { merge: true }),
          setDoc(doc(db, 'admins', uid), updatePayload, { merge: true })
        ]);
      } catch (err) {
        console.warn('Direct Firestore setDoc in AdminProfilePage:', err);
      }
    }

    if (refreshUserProfile) {
      await refreshUserProfile();
    }

    setSaving(false);
    if (res.success) {
      setFeedbackMsg(isMarathi ? 'आपली प्रोफाइल माहिती यशस्वीपणे अद्ययावत झाली.' : 'Profile updated successfully.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setErrorMsg(res.error || 'त्रुटी आली.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg(isMarathi ? 'दोन्ही पासवर्ड जुळत नाहीत!' : 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg(isMarathi ? 'पासवर्ड किमान ६ अक्षरांचा असावा.' : 'Password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);
    setErrorMsg(null);
    const res = await changeUserPassword(newPassword);
    setPasswordLoading(false);

    if (res.success) {
      setFeedbackMsg(res.message);
      setPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setFeedbackMsg(null), 5000);
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true, state: null });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {isMarathi ? 'माझी प्रोफाइल व खाते सुरक्षा (My Profile)' : 'My Profile & Account Security'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {isMarathi
            ? 'प्रशासक खात्याची वैयक्तिक माहिती, पासवर्ड बदल आणि सुरक्षा व्यवस्थापन.'
            : 'Manage administrator personal profile, update password via Firebase Auth, and view security metadata.'}
        </p>
      </div>

      {/* 2. Feedback Alerts */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="p-1 text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="p-1 text-rose-600 hover:text-rose-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Profile Card (Single Clean Card) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          
          {/* Left: Avatar + Identity Details */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar */}
            <div className="relative shrink-0">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt={formData.fullName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-slate-100 shadow-md bg-slate-100"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-gurukul-navy-950 to-slate-800 text-gurukul-saffron-400 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md">
                  {formData.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Text Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {formData.fullName}
                </h3>
                <BadgeCheck className="w-5 h-5 text-gurukul-saffron-500 shrink-0" />
                <Badge variant={isSuperAdmin ? 'Super Admin' : 'Admin'}>
                  {role.toUpperCase()}
                </Badge>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {formData.designation}
              </p>
              {formData.email && (
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {formData.email}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 w-full sm:w-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPasswordModalOpen(true)}
              className="flex-1 sm:flex-none justify-center shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
              <span>{isMarathi ? 'पासवर्ड बदला' : 'Change Password'}</span>
            </Button>
          </div>

        </div>
      </div>

      {/* 4. Update Profile Form */}
      <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          {isMarathi ? 'वैयक्तिक माहिती संपादन (Edit Personal Info)' : 'Personal Information'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              पूर्ण नाव (Full Name) *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ईमेल पत्ता (Email - Read Only)
            </label>
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              मोबाईल क्रमांक (Phone Number) *
            </label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              पद / हुद्दा (Designation)
            </label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
            />
          </div>
        </div>

        {/* Avatar Preset Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            {isMarathi ? 'प्रोफाइल फोटो निवडा (Select Avatar Preset):' : 'Select Avatar Preset:'}
          </label>
          <div className="flex items-center gap-3">
            {avatarPresets.map((imgUrl, idx) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`Preset ${idx}`}
                onClick={() => setFormData({ ...formData, profileImage: imgUrl })}
                className={`w-12 h-12 rounded-xl object-cover cursor-pointer transition-all border-2 ${
                  formData.profileImage === imgUrl
                    ? 'border-gurukul-saffron-500 scale-105 shadow-md'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              />
            ))}
            {formData.profileImage && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, profileImage: null })}
                className="text-[11px] text-rose-600 font-bold hover:underline"
              >
                फोटो काढा
              </button>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="primary" size="md" type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>{saving ? (isMarathi ? 'जतन करत आहे...' : 'Saving...') : (isMarathi ? 'माहिती जतन करा' : 'Save Profile')}</span>
          </Button>
        </div>
      </form>

      {/* 5. Account Security Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          {isMarathi ? 'खाते सुरक्षा तपशील (Security Details)' : 'Security Details'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-slate-400 font-bold uppercase text-[10px]">भूमिका (Assigned Role)</p>
            <p className="font-bold text-slate-800 mt-1 uppercase">{role}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-slate-400 font-bold uppercase text-[10px]">खाते स्थिती (Account Status)</p>
            <p className="font-bold text-emerald-600 mt-1">सक्रिय (Active)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-slate-400 font-bold uppercase text-[10px]">प्रमाणीकरण (Authentication)</p>
            <p className="font-bold text-slate-800 mt-1">Firebase Auth Secure</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-800">
              {isMarathi ? 'खाते सत्र व्यवस्थापन (Session Control)' : 'Active Session Control'}
            </p>
            <p className="text-[11px] text-slate-500">
              {isMarathi ? 'काम पूर्ण झाल्यानंतर प्रशासक खात्यातून सुरक्षितपणे बाहेर पडा.' : 'Safely sign out from your administrative session when done.'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-rose-600 border-rose-300 hover:bg-rose-50 hover:text-rose-700 font-bold shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            <span>{isMarathi ? 'साइन आउट (Sign Out)' : 'Sign Out'}</span>
          </Button>
        </div>
      </div>

      {/* 6. Change Password Modal */}
      {passwordModalOpen && (
        <Modal
          isOpen={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          title={isMarathi ? 'पासवर्ड बदला (Change Password via Firebase Auth)' : 'Change Password'}
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            <p className="text-xs text-slate-500">
              {isMarathi
                ? 'सुरक्षेसाठी आपला नवीन पासवर्ड किमान ६ अक्षरांचा असावा.'
                : 'Enter your new password (minimum 6 characters). Passwords are never stored in plaintext.'}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                नवीन पासवर्ड (New Password) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="******"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                नवीन पासवर्ड पुन्हा टाका (Confirm New Password) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="******"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setPasswordModalOpen(false)}>
                रद्द करा
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={passwordLoading}>
                <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                <span>{passwordLoading ? 'बदलत आहे...' : 'पासवर्ड अपडेट करा'}</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
