import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { PhoneCall, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, UserCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const TelecallerLoginPage = () => {
  const { login, requestPasswordReset } = useAuth();
  const { isMarathi } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(location.state?.errorMessage || null);
  const [pendingNotice, setPendingNotice] = useState(location.state?.pendingNotice || false);
  const [successBanner, setSuccessBanner] = useState(location.state?.successMessage || null);
  const [loading, setLoading] = useState(false);

  // Password reset modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState({ loading: false, message: null, error: null });

  const registerPath = location.pathname.startsWith('/telecaller') ? '/telecaller/register' : '/register';

  const from = location.state?.from?.pathname || '/telecaller/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password, 'telecaller');
    if (res.success) {
      if (res.user.role === 'admin' || res.user.role === 'super_admin' || res.user.role === 'superadmin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/telecaller/dashboard', { replace: true });
      }
    } else {
      setError(res.error || 'लॉगिन अयशस्वी झाले. कृपया ईमेल आणि पासवर्ड तपासा.');
    }
    setLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetStatus({ loading: true, message: null, error: null });
    const res = await requestPasswordReset(resetEmail);
    if (res.success) {
      setResetStatus({ loading: false, message: res.message, error: null });
    } else {
      setResetStatus({ loading: false, message: null, error: res.error });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-gurukul-navy-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-3">
            <img 
              src="/gurukul-logo.png" 
              alt="गुरुकुल भोसे" 
              className="w-16 h-16 object-contain mx-auto drop-shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <PhoneCall className="w-3 h-3" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Admission Counselor Portal
            </span>
          </div>
          <h2 className="text-2xl font-black text-gurukul-navy-900 mt-2">
            {isMarathi ? 'समुपदेशक (Telecaller) लॉगिन' : 'Counselor (Telecaller) Sign In'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi ? 'गुरुकुल भोसे कॉलिंग व फॉलो-अप मॅनेजमेंट' : 'Gurukul Bhose Calling & Follow-up Management'}
          </p>
        </div>

        {/* Pending Approval Notice */}
        {pendingNotice && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                {isMarathi ? 'खाते मंजुरी प्रलंबित (Pending Admin Approval)' : 'Account Pending Admin Approval'}
              </span>
              <span className="text-[11px] text-amber-800">
                {isMarathi 
                  ? 'शाळा ॲडमिनने आपले खाते मंजूर (Approve) केल्याशिवाय टेलिकॉलर रोल व लॉगिन उपलब्ध होणार नाही.' 
                  : 'You will only be able to sign in after a School Admin explicitly approves your registration.'}
              </span>
            </div>
          </div>
        )}

        {/* Success Banner (e.g. redirected after registration) */}
        {successBanner && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'समुपदेशक ईमेल (Telecaller Email) *' : 'Counselor Email *'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="telecaller@gurukulbhose.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                {isMarathi ? 'पासवर्ड (Password) *' : 'Password *'}
              </label>
              <button
                type="button"
                onClick={() => setResetModalOpen(true)}
                className="text-[11px] text-emerald-600 hover:underline font-semibold"
              >
                {isMarathi ? 'पासवर्ड विसरलात?' : 'Forgot Password?'}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full font-bold uppercase tracking-wider shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
          >
            <span>{isMarathi ? 'लॉगिन करा / SIGN IN' : 'SIGN IN'}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Quick Demo Counselor Login */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            {isMarathi ? 'डेमो समुपदेशक लॉगिन (Quick Login)' : 'Quick Demo Counselor Login'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('telecaller1@gurukulbhose.com');
                setPassword('Gurukul#2026');
              }}
              className="p-2 text-left rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 transition-colors"
            >
              <span className="font-bold text-emerald-950 block text-[11px] truncate">सचिन पाटील</span>
              <span className="text-[10px] text-emerald-700 block font-mono">TC-101</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('telecaller2@gurukulbhose.com');
                setPassword('Gurukul#2026');
              }}
              className="p-2 text-left rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100 transition-colors"
            >
              <span className="font-bold text-teal-950 block text-[11px] truncate">पूजा शिंदे</span>
              <span className="text-[10px] text-teal-700 block font-mono">TC-102</span>
            </button>
          </div>
        </div>

        {/* New Telecaller Registration Callout */}
        <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-emerald-950">
              {isMarathi ? 'नवीन समुपदेशक आहात का?' : 'New Counselor?'}
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              {isMarathi ? 'पोर्टल वापरण्यासाठी प्रथम नोंदणी करा' : 'Register first to access portal'}
            </p>
          </div>
          <Link
            to={registerPath}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs whitespace-nowrap shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'नोंदणी करा' : 'Register'}</span>
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link to="/admin/login" className="hover:text-emerald-600 font-semibold">
            {isMarathi ? '← ॲडमिन पोर्टल' : '← Admin Portal'}
          </Link>
          <Link to="/" className="hover:text-emerald-600 font-semibold">
            {isMarathi ? 'मुख्य वेबसाईट' : 'Main Website'}
          </Link>
        </div>
      </div>

      {/* Password Reset Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="पासवर्ड रीसेट विनंती"
        subtitle="आपला नोंदणीकृत ईमेल पत्ता प्रविष्ट करा. आम्ही पासवर्ड रीसेट लिंक पाठवू."
      >
        {resetStatus.message ? (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <p className="font-semibold">{resetStatus.message}</p>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            {resetStatus.error && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">
                {resetStatus.error}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ईमेल पत्ता</label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="telecaller@gurukulbhose.com"
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="md" onClick={() => setResetModalOpen(false)}>
                रद्द करा
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={resetStatus.loading}>
                रीसेट लिंक पाठवा
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
