import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Shield,
  UserPlus,
  Mail,
  Phone,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertTriangle,
  Lock,
  X,
  Plus,
  Building2
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { fetchAdminsList, createAdminAccount, updateUserStatus } from '../../services/auth/authService';

export const AdminManagementPage = () => {
  const { isMarathi } = useLanguage();
  const { isSuperAdmin, isAdmin, role } = useAuth();
  const canManageAdmins = isSuperAdmin || isAdmin;

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: 'Admission Administrator',
    password: '',
    role: 'admin'
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchAdminsList().then(list => {
      if (isMounted) {
        setAdmins(list || []);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const res = await createAdminAccount(createForm);
    setSubmitting(false);

    if (res.success) {
      setFeedbackMsg(res.message);
      setAdmins(prev => [
        {
          id: res.uid,
          uid: res.uid,
          fullName: createForm.fullName,
          displayName: createForm.fullName,
          email: createForm.email,
          phone: createForm.phone,
          designation: createForm.designation,
          role: createForm.role,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
      setModalOpen(false);
      setCreateForm({
        fullName: '',
        email: '',
        phone: '',
        designation: 'Admission Administrator',
        password: '',
        role: 'admin'
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setErrorMsg(res.error || 'त्रुटी आली.');
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await updateUserStatus(adminId, newStatus);
    setAdmins(prev => prev.map(a => a.id === adminId || a.uid === adminId ? { ...a, status: newStatus } : a));
    setFeedbackMsg(`खाते स्थिती यशस्वीपणे बदलली: ${newStatus}`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isMarathi ? 'प्रशासक खाते व्यवस्थापन (Admin Management)' : 'Admin Management'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {admins.length} {isMarathi ? 'प्रशासक' : 'Admins'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi
              ? 'गुरुकुल भोसे सिस्टिम व प्रवेश विभागातील मुख्य प्रशासक (Admin) खात्यांचे नियंत्रण.'
              : 'Manage system administrators and executive director accounts.'}
          </p>
        </div>

        {canManageAdmins && (
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>{isMarathi ? 'नवीन प्रशासक जोडा' : 'Add Admin'}</span>
          </Button>
        )}
      </div>

      {/* 2. Feedback Alert */}
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

      {/* 3. Admins List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{isMarathi ? 'प्रशासक नाव' : 'Admin Name'}</th>
                <th className="py-3 px-4">{isMarathi ? 'ईमेल' : 'Email'}</th>
                <th className="py-3 px-4">{isMarathi ? 'संपर्क क्रमांक' : 'Phone'}</th>
                <th className="py-3 px-4">{isMarathi ? 'पद / हुद्दा' : 'Designation'}</th>
                <th className="py-3 px-4">{isMarathi ? 'भूमिका' : 'Role'}</th>
                <th className="py-3 px-4 text-center">{isMarathi ? 'खाते स्थिती' : 'Status'}</th>
                {canManageAdmins && (
                  <th className="py-3 px-4 text-center">{isMarathi ? 'कृती' : 'Action'}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((adm) => (
                <tr key={adm.id || adm.uid} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{adm.fullName || adm.displayName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{adm.uid}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{adm.email}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{adm.phone || '-'}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{adm.designation || 'Administrator'}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      ADMIN
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      adm.status === 'inactive'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {adm.status === 'inactive' ? 'निष्क्रिय (Inactive)' : 'सक्रिय (Active)'}
                    </span>
                  </td>
                  {canManageAdmins && (
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(adm.uid, adm.status || 'active')}
                        className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${
                          adm.status === 'inactive'
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        {adm.status === 'inactive' ? 'सक्रिय करा' : 'निष्क्रिय करा'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Create Admin Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={isMarathi ? 'नवीन प्रशासक खाते तयार करा (Create Admin Account)' : 'Create Admin Account'}
        >
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                पूर्ण नाव (Full Name) *
              </label>
              <input
                type="text"
                required
                value={createForm.fullName}
                onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                placeholder="उदा. डॉ. सचिन पाटील"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ईमेल पत्ता (Email) *
              </label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="admin@gurukulbhose.com"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  मोबाईल क्रमांक (Phone)
                </label>
                <input
                  type="text"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="9850449800"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पद / हुद्दा (Designation)
                </label>
                <input
                  type="text"
                  value={createForm.designation}
                  onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                  placeholder="उदा. Vice Principal"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                प्रारंभिक पासवर्ड (Initial Password) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="******"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
                रद्द करा
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                <span>{submitting ? 'तयार करत आहे...' : 'खाते तयार करा'}</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
