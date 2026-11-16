import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
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
  BadgeCheck
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { updateAdminProfile, changeUserPassword } from '../../services/auth/authService';

export const AdminProfilePage = () => {
  const { isMarathi } = useLanguage();
  const { currentUser, userProfile, role, isSuperAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: userProfile?.displayName || userProfile?.fullName || 'Administrator',
    email: currentUser?.email || userProfile?.email || 'admin@gurukulbhose.com',
    phone: userProfile?.phone || '+91 9850449800',
    designation: userProfile?.designation || (isSuperAdmin ? 'Principal & Executive Director' : 'Admission Department Head'),
    profileImage: userProfile?.profileImage || null
  });

  const [saving, setSaving] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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
    navigate('/login');
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

      {/* 3. Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-gurukul-navy-950 via-slate-900 to-gurukul-navy-900 relative">
          <div className="absolute top-3 right-4">
            <Badge variant={isSuperAdmin ? 'Super Admin' : 'Admin'}>
              {role.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* User Info Bar */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12">
          <div className="flex items-end gap-4">
            <div className="relative">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt={formData.fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-slate-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gurukul-navy-900 text-yellow-400 font-black text-2xl flex items-center justify-center border-4 border-white shadow-md">
                  {formData.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">{formData.fullName}</h3>
                <BadgeCheck className="w-4 h-4 text-gurukul-saffron-500" />
              </div>
              <p className="text-xs text-slate-500 font-medium">{formData.designation}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPasswordModalOpen(true)}>
              <KeyRound className="w-3.5 h-3.5 mr-1.5" />
              <span>{isMarathi ? 'पासवर्ड बदला' : 'Change Password'}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-rose-600 border-rose-200 hover:bg-rose-50">
              <LogOut className="w-3.5 h-3.5 mr-1" />
              <span>{isMarathi ? 'लॉगआउट' : 'Logout'}</span>
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
