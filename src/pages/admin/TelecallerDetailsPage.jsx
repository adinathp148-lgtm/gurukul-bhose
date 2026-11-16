import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  MapPin, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  UserX, 
  UserCheck, 
  Edit3,
  Save,
  PhoneCall
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useCRM } from '../../contexts/CRMContext';
import { 
  fetchTelecallersList, 
  updateTelecallerStatus, 
  updateTelecallerProfile, 
  sendPasswordReset 
} from '../../services/auth/authService';

export const TelecallerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads } = useCRM();

  const [telecaller, setTelecaller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Status modal
  const [confirmStatusModal, setConfirmStatusModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Reset modal
  const [resetModal, setResetModal] = useState({ open: false, link: null });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const list = await fetchTelecallersList();
      const found = list.find(t => (t.uid === id || t.userId === id || t.id === id || t.employeeId === id));
      if (found) {
        setTelecaller(found);
        setEditForm({
          fullName: found.fullName || '',
          phone: found.phone || found.mobileNumber || '',
          whatsappNumber: found.whatsappNumber || '',
          assignedDepartment: found.assignedDepartment || '',
          address: found.address || ''
        });
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const showNotification = (msg, isError = false) => {
    setNotification({ message: msg, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    const targetId = telecaller.uid || telecaller.userId || telecaller.id;
    const res = await updateTelecallerProfile(targetId, editForm);
    if (res.success) {
      setTelecaller(prev => ({ ...prev, ...editForm }));
      setEditing(false);
      showNotification('समुपदेशक तपशील यशस्वीपणे अद्ययावत केले!');
    } else {
      showNotification('माहिती साठवताना अडचण आली.', true);
    }
    setSaveLoading(false);
  };

  const handleToggleStatus = async () => {
    setStatusLoading(true);
    const targetId = telecaller.uid || telecaller.userId || telecaller.id;
    const newStatus = telecaller.status === 'active' ? 'inactive' : 'active';
    const res = await updateTelecallerStatus(targetId, newStatus);
    if (res.success) {
      setTelecaller(prev => ({ ...prev, status: newStatus }));
      showNotification(`खाते ${newStatus === 'active' ? 'सक्रिय' : 'निष्क्रिय'} करण्यात आले.`);
    } else {
      showNotification('स्थिती बदलताना त्रुटी आली.', true);
    }
    setStatusLoading(false);
    setConfirmStatusModal(false);
  };

  const handleSendResetLink = async () => {
    const res = await sendPasswordReset(telecaller.email);
    if (res.success) {
      setResetModal({ open: true, link: res.resetLink });
      showNotification(`पासवर्ड रीसेट लिंक तयार झाली.`);
    } else {
      showNotification(res.error || 'त्रुटी आढळली.', true);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gurukul-saffron-500 mx-auto mb-3"></div>
        <span>समुपदेशक माहिती लोड होत आहे...</span>
      </div>
    );
  }

  if (!telecaller) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">समुपदेशक खाते सापडले नाही.</h3>
        <Link to="/admin/telecallers">
          <Button variant="primary" size="md">
            टेलिकॉलर यादीकडे परत जा
          </Button>
        </Link>
      </div>
    );
  }

  const assignedLeads = leads.filter(l => l.assignedTelecallerId === (telecaller.uid || telecaller.userId || telecaller.id));
  const isActive = telecaller.status !== 'inactive';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/telecallers"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-gurukul-navy-900 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>{telecaller.fullName}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Employee ID: {telecaller.employeeId || 'TC-N/A'} • {telecaller.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendResetLink}
          >
            <KeyRound className="w-3.5 h-3.5 mr-1 text-amber-500" />
            <span>पासवर्ड रीसेट लिंक</span>
          </Button>

          <Button
            variant={isActive ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => setConfirmStatusModal(true)}
          >
            {isActive ? <UserX className="w-3.5 h-3.5 mr-1" /> : <UserCheck className="w-3.5 h-3.5 mr-1" />}
            <span>{isActive ? 'खाते निष्क्रिय करा' : 'खाते सक्रिय करा'}</span>
          </Button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border shadow-sm ${
          notification.isError 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {notification.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gurukul-navy-900 text-white flex items-center justify-center font-black text-lg">
              {telecaller.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">समुपदेशक प्रोफाईल माहिती</h3>
              <p className="text-xs text-slate-500">भूमिका: Telecaller / Admission Counselor</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(!editing)}
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            <span>{editing ? 'रद्द करा' : 'माहिती संपादित करा'}</span>
          </Button>
        </div>

        {editing ? (
          /* Edit Form */
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">पूर्ण नाव</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">मोबाईल नंबर</label>
                <input
                  type="tel"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp नंबर</label>
                <input
                  type="tel"
                  value={editForm.whatsappNumber}
                  onChange={(e) => setEditForm({ ...editForm, whatsappNumber: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">नेमून दिलेला विभाग</label>
                <input
                  type="text"
                  value={editForm.assignedDepartment}
                  onChange={(e) => setEditForm({ ...editForm, assignedDepartment: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 border rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">पत्ता</label>
                <textarea
                  rows="2"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full text-xs p-3 border rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="md" onClick={() => setEditing(false)}>
                रद्द करा
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={saveLoading}>
                <Save className="w-4 h-4 mr-1.5" />
                <span>बदल सेव्ह करा</span>
              </Button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">कर्मचारी आयडी:</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{telecaller.employeeId || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">अधिकृत ईमेल:</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{telecaller.email}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">मोबाईल नंबर:</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{telecaller.phone || telecaller.mobileNumber || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">WhatsApp नंबर:</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{telecaller.whatsappNumber || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">रुजू तारीख:</span>
              <span className="font-medium text-slate-800 mt-0.5 block">{telecaller.joiningDate || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">विभाग / शाखा:</span>
              <span className="font-medium text-slate-800 mt-0.5 block">{telecaller.assignedDepartment || 'General Admissions'}</span>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <span className="text-slate-400 font-semibold block">पत्ता:</span>
              <span className="font-medium text-slate-800 mt-0.5 block">{telecaller.address || 'पत्ता नोंदवलेला नाही.'}</span>
            </div>
          </div>
        )}

      </div>

      {/* Assigned Leads Section for this Telecaller */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              या समुपदेशकाकडे सोपवलेल्या लीड्स ({assignedLeads.length})
            </h3>
            <p className="text-[11px] text-slate-500">विद्यार्थी व पालक चौकशी यादी</p>
          </div>
        </div>

        {assignedLeads.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            या समुपदेशकाकडे सध्या कोणत्याही लीड्स सोपवलेल्या नाहीत.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {assignedLeads.map((l) => (
              <div key={l.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{l.studentName}</span>
                    <Badge size="xs" variant={l.leadStatus}>{l.leadStatus}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    पालक: {l.parentName} • {l.mobileNumber} • {l.admissionClass}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">पुढील फॉलो-अप:</span>
                  <span className="font-bold text-gurukul-navy-900">{l.nextFollowUp || 'शेड्यूल नाही'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmStatusModal}
        onClose={() => setConfirmStatusModal(false)}
        title={isActive ? 'खाते निष्क्रिय करण्याची पुष्टी' : 'खाते पुन्हा सक्रिय करण्याची पुष्टी'}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            {isActive
              ? `आपण खरोखर समुपदेशक "${telecaller.fullName}" यांचे खाते निष्क्रिय करू इच्छिता? युझर पोर्टलवर लॉगिन करू शकणार नाही.`
              : `आपण समुपदेशक "${telecaller.fullName}" यांचे खाते पुन्हा सक्रिय करू इच्छिता?`}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={() => setConfirmStatusModal(false)}>
              रद्द करा
            </Button>
            <Button
              variant={isActive ? 'danger' : 'primary'}
              size="md"
              isLoading={statusLoading}
              onClick={handleToggleStatus}
            >
              {isActive ? 'होय, निष्क्रिय करा' : 'होय, सक्रिय करा'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Modal */}
      <Modal
        isOpen={resetModal.open}
        onClose={() => setResetModal({ open: false, link: null })}
        title="पासवर्ड रीसेट लिंक"
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            समुपदेशक <strong>{telecaller.fullName}</strong> यांच्यासाठी पासवर्ड रीसेट लिंक:
          </p>
          {resetModal.link && (
            <div className="p-3 bg-slate-50 border rounded-lg font-mono text-[11px] break-all select-all">
              {resetModal.link}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setResetModal({ open: false, link: null })}>
              पूर्ण झाले
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
