import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  UserPlus, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/common/Button';

export const TelecallerRegisterPage = () => {
  const { registerTelecaller } = useAuth();
  const { isMarathi } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    whatsappNumber: '',
    department: 'शालेय प्रवेश (5th - 10th)',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Detect whether we are on admin panel or telecaller panel
  const isTelecallerRoute = location.pathname.startsWith('/telecaller');
  const loginPath = isTelecallerRoute ? '/telecaller/login' : '/login';

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
      setError(isMarathi ? 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.' : 'Please enter a valid email address.');
      return;
    }

    if (formData.mobileNumber.length < 10) {
      setError(isMarathi ? 'कृपया १० अंकी वैध मोबाईल नंबर प्रविष्ट करा.' : 'Please enter a valid 10-digit mobile number.');
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
      const res = await registerTelecaller({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        whatsappNumber: formData.whatsappNumber.trim() || formData.mobileNumber.trim(),
        department: formData.department,
        password: formData.password
      });

      if (res.success) {
        setSuccess(true);
        // Automatically redirect to login page with prefilled email after 1.8 seconds
        setTimeout(() => {
          navigate(loginPath, { 
            state: { 
              registeredEmail: formData.email.trim(),
              successMessage: isMarathi 
                ? 'नोंदणी यशस्वी झाली! कृपया आता आपल्या ईमेल आणि पासवर्डने लॉगिन करा.' 
                : 'Registration successful! Please sign in with your email and password.'
            } 
          });
        }, 1800);
      } else {
        setError(res.error || (isMarathi ? 'नोंदणी करताना त्रुटी आली.' : 'Error during registration.'));
      }
    } catch (err) {
      setError(err.message || (isMarathi ? 'तांत्रिक अडचण आली.' : 'Technical error occurred.'));
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-gurukul-navy-950 flex items-center justify-center p-4 py-8">
      <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-9 shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <img 
              src="/gurukul-logo.png" 
              alt="गुरुकुल भोसे" 
              className="w-16 h-16 object-contain mx-auto drop-shadow-md" 
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <UserPlus className="w-3 h-3" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Admission Counselor Portal
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gurukul-navy-900 mt-2">
            {isMarathi ? 'नवीन समुपदेशक (Telecaller) नोंदणी' : 'New Counselor Registration'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi 
              ? 'गुरुकुल भोसे प्रवेश व कॉलिंग टीममध्ये आपले स्वागत आहे' 
              : 'Join Gurukul Bhose Admission & Calling Team'}
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 text-center animate-in fade-in">
            <div className="flex items-center justify-center gap-2 font-bold text-sm text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{isMarathi ? 'नोंदणी यशस्वी झाली!' : 'Registration Successful!'}</span>
            </div>
            <p>
              {isMarathi 
                ? 'आपले खाते तयार झाले आहे. आपल्याला लॉगिन पृष्ठावर पाठवले जात आहे...' 
                : 'Your account is created. Redirecting to login page...'}
            </p>
            <div className="pt-2">
              <Link to={loginPath} state={{ registeredEmail: formData.email }}>
                <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  <span>{isMarathi ? 'थेट लॉगिन करा →' : 'Proceed to Sign In →'}</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isMarathi ? 'पूर्ण नाव (Full Name) *' : 'Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder={isMarathi ? 'उदा. सचिन मारुती पाटील' : 'e.g. Sachin Maruti Patil'}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isMarathi ? 'अधिकृत ईमेल पत्ता (Email) *' : 'Official Email *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="telecaller@gurukulbhose.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Calling Mobile & WhatsApp in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'मोबाईल नंबर (Calling Mobile) *' : 'Calling Mobile *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="mobileNumber"
                    required
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder={isMarathi ? '१० अंकी मोबाईल नंबर' : '10-digit number'}
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'WhatsApp क्रमांक' : 'WhatsApp Number'}
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder={isMarathi ? 'पालकांशी चॅटिंगसाठी' : 'For parents chat'}
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isMarathi ? 'प्रवेश विभाग (Department)' : 'Department'}
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                >
                  <option value="शालेय प्रवेश (5th - 10th)">{isMarathi ? 'शालेय प्रवेश (5th - 10th)' : 'School Admissions (5th - 10th)'}</option>
                  <option value="कॉलेज प्रवेश (11th - 12th Science & Arts)">{isMarathi ? 'कॉलेज प्रवेश (11th - 12th Science & Arts)' : 'College Admissions (11th - 12th)'}</option>
                  <option value="टॅलेंट सर्च व स्कॉलरशिप">{isMarathi ? 'टॅलेंट सर्च व स्कॉलरशिप' : 'Talent Search & Scholarship'}</option>
                  <option value="स्पोर्ट्स व डिफेन्स अकॅडमी">{isMarathi ? 'स्पोर्ट्स व डिफेन्स अकॅडमी' : 'Sports & Defense Academy'}</option>
                  <option value="सर्वसाधारण प्रवेश चौकशी">{isMarathi ? 'सर्वसाधारण प्रवेश चौकशी' : 'General Admission Enquiries'}</option>
                </select>
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
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full font-bold uppercase tracking-wider shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <span>{isMarathi ? 'खाते तयार करा / Register Account' : 'Register Account'}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>
        )}

        {/* Footer links */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <Link 
            to={loginPath} 
            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5"
          >
            <span>{isMarathi ? 'आधीच खाते आहे? लॉगिन करा' : 'Already have an account? Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link to="/" className="hover:text-emerald-600 font-semibold">
            {isMarathi ? 'मुख्य वेबसाईट' : 'Main Website'}
          </Link>
        </div>

      </div>
    </div>
  );
};
