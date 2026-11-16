import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const AdminLoginPage = () => {
  const { login, requestPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Password reset modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState({ loading: false, message: null, error: null });

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      if (res.user.role === 'telecaller') {
        navigate('/telecaller/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
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
    <div className="min-h-screen bg-gradient-to-br from-gurukul-navy-950 via-slate-900 to-gurukul-navy-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-gurukul-saffron-500 to-blue-600"></div>

        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/gurukul-logo.png" 
            alt="गुरुकुल भोसे Logo" 
            className="w-16 h-16 object-contain mx-auto drop-shadow-md mb-3" 
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Administrative Portal
          </span>
          <h2 className="text-2xl font-black text-gurukul-navy-900 mt-2">
            शाळा ॲडमिन लॉगिन
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            गुरुकुल भोसे प्रवेश व्यवस्थापन व प्रशासन पोर्टल
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
              अधिकृत ईमेल (Admin Email) *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gurukulbhose.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
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
                className="text-[11px] text-gurukul-saffron-600 hover:underline font-semibold"
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
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full font-bold uppercase tracking-wider shadow-lg mt-2"
          >
            <span>लॉगिन करा / Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link to="/telecaller/login" className="hover:text-gurukul-saffron-600 font-semibold">
            समुपदेशक (Telecaller) लॉगिन →
          </Link>
          <Link to="/" className="hover:text-gurukul-saffron-600 font-semibold">
            मुख्य वेबसाईट
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
                placeholder="admin@gurukulbhose.com"
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
