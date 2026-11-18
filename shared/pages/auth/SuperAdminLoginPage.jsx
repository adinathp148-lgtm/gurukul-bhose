import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const SuperAdminLoginPage = () => {
  const { login, requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Password reset modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState({ loading: false, message: null, error: null });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password, 'super_admin');
    if (res.success) {
      if (res.user.role === 'super_admin' || res.user.role === 'superadmin') {
        navigate('/super-admin/dashboard', { replace: true });
      } else {
        // If logged in user is not a superadmin, inform them
        setError('हे पोर्टल फक्त सुपर ॲडमिनिस्ट्रेटरसाठी आरक्षित आहे. आपल्या भूमिकेनुसार योग्य पोर्टलवर लॉगिन करा.');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gurukul-navy-950 to-slate-900 flex flex-col items-center justify-center py-6 sm:py-10 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 lg:p-9 shadow-2xl border border-slate-800/20 relative overflow-hidden my-auto">
        {/* Subtle security accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600"></div>

        {/* Security Badge & Title */}
        <div className="text-center mb-5 sm:mb-7">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg mb-2.5">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Root Level Access
          </span>
          <h2 className="text-2xl font-black text-gurukul-navy-900 mt-2">
            सुपर ॲडमिन लॉगिन
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            गुरुकुल भोसे प्लॅटफॉर्म मास्टर कंट्रोल पोर्टल
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              सुपर ॲडमिन ईमेल (Official Email) *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@gurukulbhose.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                पासवर्ड (Password) *
              </label>
              <button
                type="button"
                onClick={() => setResetModalOpen(true)}
                className="text-[11px] text-rose-600 hover:underline font-semibold"
              >
                पासवर्ड विसरलात?
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
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="danger"
            size="lg"
            isLoading={loading}
            className="w-full font-bold uppercase tracking-wider shadow-lg bg-rose-600 hover:bg-rose-700 text-white mt-2"
          >
            <span>सुरक्षित लॉगिन करा (Sign In)</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link to="/admin/login" className="hover:text-gurukul-saffron-600 font-semibold">
            ← ॲडमिन लॉगिन
          </Link>
          <Link to="/" className="hover:text-gurukul-saffron-600 font-semibold">
            मुख्य वेबसाईट →
          </Link>
        </div>
      </div>

      {/* Password Reset Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="पासवर्ड रीसेट विनंती"
        subtitle="आपला अधिकृत ईमेल पत्ता प्रविष्ट करा. आम्ही पासवर्ड रीसेट लिंक पाठवू."
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
                placeholder="superadmin@gurukulbhose.com"
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
