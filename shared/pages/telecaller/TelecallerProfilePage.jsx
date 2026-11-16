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

export const TelecallerProfilePage = () => {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    whatsappNumber: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (userProfile || currentUser) {
      const u = userProfile || currentUser;
      setForm({
        fullName: u.displayName || u.fullName || '',
        phone: u.phone || '',
        whatsappNumber: u.whatsappNumber || u.phone || '',
        address: u.address || ''
      });
    }
  }, [userProfile, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const uid = currentUser?.uid;
    if (!uid) return;

    try {
      const res = await updateTelecallerProfile(uid, {
        phone: form.phone,
        whatsappNumber: form.whatsappNumber,
        address: form.address
      });

      if (res.success) {
        setNotification({
          type: 'success',
          message: 'आपली प्रोफाईल माहिती यशस्वीपणे अद्ययावत केली गेली आहे.'
        });
        await refreshUserProfile();
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
            {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'T'}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {profile.displayName || profile.fullName || 'Telecaller'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Employee ID: {profile.employeeId || 'TC-N/A'}
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
                value={profile.displayName || profile.fullName || ''}
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
