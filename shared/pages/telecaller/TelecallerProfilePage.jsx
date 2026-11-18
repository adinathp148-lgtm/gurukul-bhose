import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { updateTelecallerProfile } from '../../services/auth/authService';
import { db, doc, getDoc, collection, query, where, getDocs, setDoc, isConfigured } from '../../firebase/config';

export const TelecallerProfilePage = () => {
  const { currentUser, userProfile, refreshUserProfile, isAdmin, isSuperAdmin } = useAuth();

  const [form, setForm] = useState({
    fullName: userProfile?.fullName || userProfile?.displayName || currentUser?.fullName || currentUser?.displayName || '',
    phone: userProfile?.phone || currentUser?.phone || '',
    whatsappNumber: userProfile?.whatsappNumber || userProfile?.phone || currentUser?.whatsappNumber || '',
    address: userProfile?.address || currentUser?.address || '',
    employeeId: userProfile?.employeeId || currentUser?.employeeId || '',
    department: userProfile?.assignedDepartment || userProfile?.department || ''
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Live Firestore Data Connection on mount
  useEffect(() => {
    let isMounted = true;

    const loadLiveTelecallerProfile = async () => {
      const active = userProfile || currentUser;
      const uid = active?.uid;
      const email = active?.email;

      // 1. Initial sync from context
      if (active && isMounted) {
        setForm(prev => ({
          ...prev,
          fullName: active.fullName || active.displayName || prev.fullName || '',
          phone: active.phone || active.mobileNumber || prev.phone || '',
          whatsappNumber: active.whatsappNumber || active.phone || prev.whatsappNumber || '',
          address: active.address || prev.address || '',
          employeeId: active.employeeId || prev.employeeId || '',
          department: active.assignedDepartment || active.department || prev.department || ''
        }));
      }

      // 2. Fetch live data from Firestore
      if (isConfigured && db && (uid || email)) {
        try {
          const [teleSnap, userSnap] = await Promise.all([
            uid ? getDoc(doc(db, 'telecaller_profiles', uid)).catch(() => null) : null,
            uid ? getDoc(doc(db, 'users', uid)).catch(() => null) : null
          ]);

          let firestoreData = {
            ...(teleSnap?.exists() ? teleSnap.data() : {}),
            ...(userSnap?.exists() ? userSnap.data() : {})
          };

          if (email && (!firestoreData.fullName || !firestoreData.phone)) {
            const emailList = Array.from(new Set([email, email.toLowerCase()].filter(Boolean)));
            const [tSnap, uSnap] = await Promise.all([
              getDocs(query(collection(db, 'telecaller_profiles'), where('email', 'in', emailList))).catch(() => null),
              getDocs(query(collection(db, 'users'), where('email', 'in', emailList))).catch(() => null)
            ]);

            firestoreData = {
              ...(tSnap && !tSnap.empty ? tSnap.docs[0].data() : {}),
              ...(uSnap && !uSnap.empty ? uSnap.docs[0].data() : {}),
              ...firestoreData
            };
          }

          if (isMounted && Object.keys(firestoreData).length > 0) {
            setForm(prev => ({
              fullName: firestoreData.fullName || firestoreData.displayName || prev.fullName || '',
              phone: firestoreData.phone || firestoreData.mobileNumber || prev.phone || '',
              whatsappNumber: firestoreData.whatsappNumber || firestoreData.phone || prev.whatsappNumber || '',
              address: firestoreData.address || prev.address || '',
              employeeId: firestoreData.employeeId || prev.employeeId || '',
              department: firestoreData.assignedDepartment || firestoreData.department || prev.department || ''
            }));
          }
        } catch (fetchErr) {
          console.warn('Live Firestore fetch in TelecallerProfilePage error:', fetchErr);
        }
      }
    };

    loadLiveTelecallerProfile();

    return () => {
      isMounted = false;
    };
  }, [userProfile, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const uid = currentUser?.uid || userProfile?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    try {
      const res = await updateTelecallerProfile(uid, {
        fullName: form.fullName,
        phone: form.phone,
        whatsappNumber: form.whatsappNumber,
        address: form.address
      });

      // Directly update Firestore telecaller_profiles and users collections
      if (isConfigured && db) {
        try {
          const updates = {
            fullName: form.fullName,
            displayName: form.fullName,
            phone: form.phone,
            whatsappNumber: form.whatsappNumber,
            address: form.address,
            updatedAt: new Date().toISOString()
          };
          await Promise.all([
            setDoc(doc(db, 'telecaller_profiles', uid), updates, { merge: true }),
            setDoc(doc(db, 'users', uid), {
              fullName: form.fullName,
              displayName: form.fullName,
              phone: form.phone,
              updatedAt: new Date().toISOString()
            }, { merge: true })
          ]);
        } catch (syncErr) {
          console.warn('Direct Firestore sync error on telecaller profile update:', syncErr);
        }
      }

      if (res.success) {
        setNotification({
          type: 'success',
          message: 'आपली प्रोफाईल माहिती यशस्वीपणे अद्ययावत केली गेली आहे.'
        });
        if (refreshUserProfile) {
          await refreshUserProfile();
        }
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'माहिती साठवताना त्रुटी आढळली.'
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'तांत्रिक त्रुटी.'
      });
    }
    setLoading(false);
  };

  const profile = userProfile || currentUser || {};
  const displayName = form.fullName || profile.fullName || profile.displayName || 'कौन्सिलर (Counselor)';
  const displayInitial = (displayName.trim().charAt(0) || 'T').toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-600" />
          <span>माझी प्रोफाईल (My Profile)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          आपली संपर्क माहिती तपासा व आवश्यक बदल करा. प्रशासकीय अधिकार व स्थिती लॉक केलेले आहेत.
        </p>
      </div>

      {(isAdmin || isSuperAdmin || currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.email?.toLowerCase()?.includes('adinath')) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold">
                शाळा प्रशासक (Admin) खाते ओळखले गेले
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                आपण मुख्य ॲडमिन प्रोफाइल आणि पासवर्ड सेटिंग्ज पाहू इच्छित असल्यास खालील बटणावर क्लिक करा.
              </p>
            </div>
          </div>
          <a
            href="/admin/profile"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gurukul-saffron-500 hover:bg-gurukul-saffron-600 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
          >
            <span>ॲडमिन प्रोफाइल उघडा →</span>
          </a>
        </div>
      )}

      {notification && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border shadow-sm ${
          notification.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Header Avatar and Basic Info */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
            {displayInitial}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {displayName}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Employee ID: {form.employeeId || profile.employeeId || 'TC-N/A'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                भूमिका: समुपदेशक (Telecaller)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                स्थिती: {profile.status === 'inactive' ? 'Inactive' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Read-Only Administrative Fields Explainer */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>सुरक्षा सूचना:</strong> कर्मचारी ID, अधिकृत ईमेल, भूमिका आणि खाते सक्रियता हे तपशील शाळा ॲडमिनिस्ट्रेशनद्वारे नियंत्रित केले जातात आणि ते स्वतः बदलता येत नाहीत.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name (Read-Only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>पूर्ण नाव</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              </label>
              <input
                type="text"
                disabled
                value={form.fullName || profile.fullName || profile.displayName || ''}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* Official Email (Read-Only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>अधिकृत ईमेल पत्ता</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              </label>
              <input
                type="email"
                disabled
                value={profile.email || ''}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* Calling Mobile Number (Editable) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                कॉलिंग मोबाईल नंबर *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* WhatsApp Number (Editable) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp नंबर
              </label>
              <input
                type="tel"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Joining Date (Read-Only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>रुजू तारीख</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              </label>
              <input
                type="text"
                disabled
                value={profile.joiningDate || '-'}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* Department (Read-Only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>नेमून दिलेला विभाग</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              </label>
              <input
                type="text"
                disabled
                value={profile.assignedDepartment || 'General Admissions'}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* Address (Editable) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                पत्ता (Address)
              </label>
              <textarea
                rows="2"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="आपला संपर्क पत्ता प्रविष्ट करा..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

          </div>

          <div className="pt-4 border-t flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            >
              <Save className="w-4 h-4 mr-1.5" />
              <span>बदल सेव्ह करा (Save Profile)</span>
            </Button>
          </div>

        </form>

      </div>

    </div>
  );
};
