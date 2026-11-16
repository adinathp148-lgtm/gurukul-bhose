import React, { useState } from 'react';
import { KeyRound, Lock, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';

export const TelecallerChangePasswordPage = () => {
  const { currentUser, requestPasswordReset } = useAuth();

  const [email] = useState(currentUser?.email || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSendReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await requestPasswordReset(email);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-emerald-600" />
          <span>पासवर्ड व्यवस्थापन (Change Password)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          सुरक्षिततेसाठी आपला पासवर्ड वेळोवेळी बदला.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>सुरक्षित पासवर्ड रीसेट प्रक्रिया</span>
          </div>
          <p className="leading-relaxed">
            सुरक्षेच्या कारणास्तव, आपल्या अधिकृत ईमेल पत्त्यावर (<strong>{email}</strong>) थेट पासवर्ड रीसेट लिंक पाठवली जाईल. त्या लिंकवर क्लिक करून आपण नवीन पासवर्ड सेट करू शकता.
          </p>
        </div>

        {result && (
          <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border shadow-sm ${
            result.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
            <span className="font-semibold">{result.message || result.error}</span>
          </div>
        )}

        <form onSubmit={handleSendReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              आपला अधिकृत ईमेल
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 cursor-not-allowed"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold uppercase tracking-wider"
          >
            <span>पासवर्ड रीसेट लिंक पाठवा (Send Reset Link)</span>
          </Button>
        </form>

      </div>

    </div>
  );
};
