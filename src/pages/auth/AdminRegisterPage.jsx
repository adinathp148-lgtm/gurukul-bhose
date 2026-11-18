import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Shield,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/common/Button';

export const AdminRegisterPage = () => {
  const { registerAdminAccount } = useAuth();
  const { isMarathi } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    designation: 'प्राचार्य / प्रशासकीय संचालक (Principal & Director)',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.fullName.trim()) {
      setError(isMarathi ? 'कृपया आपले पूर्ण नाव प्रविष्ट करा.' : 'Please enter your full name.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError(isMarathi ? 'कृपया अधिकृत वैध ईमेल पत्ता प्रविष्ट करा.' : 'Please enter a valid official email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError(isMarathi ? 'पासवर्ड किमान ६ अक्षरांचा असावा.' : 'Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(isMarathi ? 'पासवर्ड आणि पासवर्ड पुष्टी जुळत नाहीत.' : 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerAdminAccount({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        designation: formData.designation,
        password: formData.password
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/login', { 
            state: { 
              registeredEmail: formData.email.trim(),
              successMessage: isMarathi 
                ? 'ॲडमिन नोंदणी यशस्वी झाली! आपण आता आपल्या ईमेल आणि पासवर्डने लॉगिन करू शकता.' 
                : 'Admin registration successful! Please sign in with your email and password.'
            } 
          });
        }, 1600);
      } else {
        setError(res.error || (isMarathi ? 'नोंदणी करताना त्रुटी आली.' : 'Error during registration.'));
      }
    } catch (err) {
      setError(err.message || (isMarathi ? 'तांत्रिक अडचण आली.' : 'Technical error occurred.'));
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gurukul-navy-950 via-slate-900 to-gurukul-navy-900 flex items-center justify-center p-4 py-8">
      <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-9 shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-gurukul-saffron-500 to-blue-600"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <img 
            src="/gurukul-logo.png" 
            alt="गुरुकुल भोसे Logo" 
            className="w-16 h-16 object-contain mx-auto drop-shadow-md mb-2" 
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-black uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>School Administration Portal</span>
          </div>
          <h2 className="text-2xl font-black text-gurukul-navy-900">
            {isMarathi ? 'शाळा ॲडमिन नोंदणी' : 'School Admin Registration'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi 
              ? 'गुरुकुल भोसे अधिकृत प्रशासकीय खाते तयार करा' 
              : 'Create an authorized administrative profile for Gurukul Bhose'}
          </p>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">
                {isMarathi ? 'ॲडमिन नोंदणी यशस्वी झाली!' : 'Admin Registration Successful!'}
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {isMarathi ? 'आपल्याला लॉगिन पृष्ठावर नेले जात आहे...' : 'Redirecting you to the sign-in portal...'}
              </p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'प्रशासकाचे पूर्ण नाव (Full Name) *' : 'Admin Full Name *'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder={isMarathi ? 'उदा. आदिनाथ पवार / Adinath Powar' : 'e.g. Adinath Powar'}
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'अधिकृत ईमेल (Admin Email) *' : 'Official Admin Email *'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="adinathp148@gmail.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {isMarathi ? 'हा ईमेल प्रशासक म्हणून थेट Firestore व Authentication मध्ये जोडला जाईल.' : 'This email will be granted administrative role in Firestore and Auth.'}
            </p>
          </div>

          {/* Phone and Designation in 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isMarathi ? 'मोबाईल नंबर (Phone)' : 'Mobile Phone'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="9850449800"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isMarathi ? 'प्रशासकीय पद (Designation)' : 'Designation'}
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
                >
                  <option value="प्राचार्य / संचालक (Principal & Director)">प्राचार्य / संचालक (Principal & Director)</option>
                  <option value="प्रशासकीय अधिकारी (Administrative Officer)">प्रशासकीय अधिकारी (Administrative Officer)</option>
                  <option value="प्रवेश विभाग प्रमुख (Admission Dean & HOD)">प्रवेश विभाग प्रमुख (Admission Dean & HOD)</option>
                  <option value="सिस्टम प्रशासक (System Administrator)">सिस्टम प्रशासक (System Administrator)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isMarathi ? 'पासवर्ड (Password) *' : 'Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="किमान ६ अक्षरे"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isMarathi ? 'पासवर्ड पुष्टी (Confirm) *' : 'Confirm Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="पासवर्ड पुन्हा टाका"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Security Badge notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              {isMarathi 
                ? 'हे खाते पूर्ण प्रशासकीय नियंत्रणासाठी (CRM, CMS व प्रवेश व्यवस्थापन) अधिकृत असेल.' 
                : 'This account will be granted full administrative authority for CRM and CMS.'}
            </span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full font-bold uppercase tracking-wider shadow-lg mt-2 py-3"
          >
            <span>{isMarathi ? 'ॲडमिन नोंदणी पूर्ण करा / Register Admin' : 'Complete Admin Registration'}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Footer links */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link to="/admin/login" className="hover:text-gurukul-saffron-600 font-bold text-blue-700">
            ← {isMarathi ? 'आधीच खाते आहे? लॉगिन करा' : 'Already registered? Sign In'}
          </Link>
          <Link to="/" className="hover:text-gurukul-saffron-600 font-semibold">
            {isMarathi ? 'शाळा मुख्य वेबसाईट' : 'School Website'}
          </Link>
        </div>
      </div>
    </div>
  );
};
