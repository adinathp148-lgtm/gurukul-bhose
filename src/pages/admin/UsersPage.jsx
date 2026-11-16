import React, { useState } from 'react';
import { useCRM } from '../../contexts/CRMContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserCheck, Plus, Shield, Mail, Phone, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const UsersPage = () => {
  const { telecallers, addTelecaller, leads } = useCRM();
  const { role, isSuperAdmin, isAdmin } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [successMsg, setSuccessMsg] = useState(null);

  const handleCreate = (e) => {
    e.preventDefault();
    addTelecaller(form);
    setSuccessMsg(`नवीन समुपदेशक ${form.displayName} यशस्वीपणे जोडले गेले!`);
    setForm({ displayName: '', email: '', phone: '', password: '' });
    setModalOpen(false);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            कर्मचारी व समुपदेशक व्यवस्थापन (Staff & Telecallers)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            नवीन टेलिकॉलर खाती तयार करा, परवानग्या नियंत्रित करा आणि कामगिरी तपासा
          </p>
        </div>

        {isAdmin && (
          <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>नवीन समुपदेशक जोडा (Create Telecaller)</span>
          </Button>
        )}
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Role-Based Permissions Explainer Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
          <div className="flex items-center gap-2 font-bold text-rose-900 mb-1">
            <Shield className="w-4 h-4 text-rose-600" />
            <span>Super Admin</span>
          </div>
          <p className="text-rose-800 text-[11px] leading-relaxed">
            सर्व अधिकार: डेटाबेस ऍक्सेस, टेलिकॉलर व्यवस्थापन, सर्व लीड्स, वित्तीय तपशील, CMS व सिस्टीम सेटिंग्ज.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 font-bold text-blue-900 mb-1">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>School Admin / Principal</span>
          </div>
          <p className="text-blue-800 text-[11px] leading-relaxed">
            प्रवेश व्यवस्थापन, टेलिकॉलर तयार करणे व लीड्स सोपवणे, पालक संप्रेषण आणि वेबसाईट CMS व्यवस्थापन.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Telecaller / Counselor</span>
          </div>
          <p className="text-emerald-800 text-[11px] leading-relaxed">
            केवळ स्वतःला नेमून दिलेल्या लीड्स पाहणे, कॉल करणे, प्रतिसाद नोंदवणे आणि पुढील तारीख शेड्यूल करणे.
          </p>
        </div>
      </div>

      {/* Telecaller List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            सक्रिय समुपदेशक यादी ({telecallers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">नाव</th>
                <th className="py-3 px-4">ईमेल</th>
                <th className="py-3 px-4">मोबाईल</th>
                <th className="py-3 px-4">भूमिका (Role)</th>
                <th className="py-3 px-4 text-center">नेमून दिलेल्या लीड्स</th>
                <th className="py-3 px-4 text-center">स्थिती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {telecallers.map((t) => {
                const assignedCount = leads.filter(l => l.assignedTelecallerId === t.uid).length;
                return (
                  <tr key={t.uid} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{t.displayName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{t.email}</td>
                    <td className="py-3.5 px-4 text-slate-600">{t.phone || '-'}</td>
                    <td className="py-3.5 px-4">
                      <Badge size="xs" variant="Telecaller">Telecaller</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-gurukul-navy-900">
                      {assignedCount} Leads
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="नवीन टेलिकॉलर खाते तयार करा"
        subtitle="समुपदेशकाचे नाव, ईमेल व लॉगिन तपशील नोंदवा"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              पूर्ण नाव *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. सचिन पाटील (Counselor)"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              अधिकृत ईमेल *
            </label>
            <input
              type="email"
              required
              placeholder="telecaller@gurukulbhose.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              मोबाईल नंबर *
            </label>
            <input
              type="tel"
              required
              placeholder="१० अंकी मोबाईल नंबर"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              प्रारंभिक पासवर्ड *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={() => setModalOpen(false)}>
              रद्द करा
            </Button>
            <Button type="submit" variant="primary" size="md">
              खाते तयार करा
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
