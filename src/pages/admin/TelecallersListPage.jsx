import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  UserX, 
  UserCheck, 
  KeyRound, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useCRM } from '../../contexts/CRMContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  fetchTelecallersList, 
  updateTelecallerStatus, 
  sendPasswordReset 
} from '../../services/auth/authService';

export const TelecallersListPage = () => {
  const { isSuperAdmin, isAdmin } = useAuth();
  const { leads } = useCRM();
  const { isMarathi } = useLanguage();
  const navigate = useNavigate();

  const [telecallers, setTelecallers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Feedback notifications
  const [notification, setNotification] = useState(null);

  // Status toggle confirmation modal
  const [confirmModal, setConfirmModal] = useState({ open: false, telecaller: null, action: null });
  const [actionLoading, setActionLoading] = useState(false);

  // Password reset confirmation modal
  const [resetModal, setResetModal] = useState({ open: false, telecaller: null, link: null });

  const loadTelecallers = async () => {
    setLoading(true);
    try {
      const list = await fetchTelecallersList();
      setTelecallers(list);
    } catch (err) {
      console.error('Failed to load telecallers list:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTelecallers();
  }, []);

  const showNotification = (msg, isError = false) => {
    setNotification({ message: msg, isError });
    setTimeout(() => setNotification(null), 5000);
  };

  // Toggle activation status
  const handleConfirmStatusToggle = async () => {
    if (!confirmModal.telecaller) return;
    setActionLoading(true);

    const target = confirmModal.telecaller;
    const newStatus = target.status === 'active' ? 'inactive' : 'active';
    const id = target.uid || target.userId || target.id;

    const res = await updateTelecallerStatus(id, newStatus);
    if (res.success) {
      showNotification(
        `समुपदेशक ${target.fullName} यांचे खाते यशस्वीपणे ${newStatus === 'active' ? 'सक्रिय (Activated)' : 'निष्क्रिय (Deactivated)'} केले.`
      );
      setTelecallers(prev => prev.map(t => (t.uid === id || t.userId === id || t.id === id) ? { ...t, status: newStatus } : t));
    } else {
      showNotification('स्थिती बदलताना त्रुटी आढळली.', true);
    }

    setActionLoading(false);
    setConfirmModal({ open: false, telecaller: null, action: null });
  };

  // Trigger Password Reset Link
  const handleSendResetEmail = async (telecaller) => {
    const res = await sendPasswordReset(telecaller.email);
    if (res.success) {
      setResetModal({
        open: true,
        telecaller,
        link: res.resetLink || null
      });
      showNotification(`पासवर्ड रीसेट सूचना ${telecaller.email} या पत्त्यावर पाठवली गेली.`);
    } else {
      showNotification(res.error || 'त्रुटी आढळली.', true);
    }
  };

  // Filtered & Searched list
  const filteredList = telecallers.filter(t => {
    const matchesSearch = 
      (t.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.phone || '').includes(searchQuery);

    const matchesStatus = 
      statusFilter === 'ALL' ? true : 
      statusFilter === 'ACTIVE' ? (t.status === 'active' || !t.status) :
      statusFilter === 'INACTIVE' ? t.status === 'inactive' : true;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-gurukul-navy-900" />
            <span>{isMarathi ? 'टेलिकॉलर व्यवस्थापन (Telecaller Management)' : 'Counselor & Staff Management'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi 
              ? 'शाळेचे सर्व समुपदेशक, त्यांची खाती, लॉगिन परवानग्या आणि कामगिरीचे थेट नियंत्रण' 
              : 'Direct control over counselor accounts, login credentials, and performance analytics'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="md" onClick={loadTelecallers} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isMarathi ? 'रिफ्रेश' : 'Refresh'}</span>
            </Button>

            <Link to="/admin/telecallers/create">
              <Button variant="primary" size="md" className="shadow-md">
                <UserPlus className="w-4 h-4 mr-1.5" />
                <span>{isMarathi ? 'नवीन टेलिकॉलर जोडा (Add Telecaller)' : 'Add New Counselor'}</span>
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Notifications */}
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

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isMarathi ? 'नाव, ईमेल किंवा Employee ID शोधा...' : 'Search by name, email or Employee ID...'}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-stretch md:self-auto">
          <button
            onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'ALL' ? 'bg-white text-gurukul-navy-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMarathi ? `सर्व (${telecallers.length})` : `All (${telecallers.length})`}
          </button>
          <button
            onClick={() => { setStatusFilter('ACTIVE'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMarathi ? `सक्रिय (${telecallers.filter(t => t.status !== 'inactive').length})` : `Active (${telecallers.filter(t => t.status !== 'inactive').length})`}
          </button>
          <button
            onClick={() => { setStatusFilter('INACTIVE'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'INACTIVE' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMarathi ? `निष्क्रिय (${telecallers.filter(t => t.status === 'inactive').length})` : `Inactive (${telecallers.filter(t => t.status === 'inactive').length})`}
          </button>
        </div>
      </div>

      {/* Telecaller Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3.5 px-4">{isMarathi ? 'कर्मचारी ID' : 'Emp ID'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'समुपदेशक तपशील' : 'Counselor Profile'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'ईमेल व संपर्क' : 'Contact & Email'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'विभाग / शाखा' : 'Branch / Dept'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'रुजू तारीख' : 'Join Date'}</th>
                <th className="py-3.5 px-4 text-center">{isMarathi ? 'नेमून दिलेल्या लीड्स' : 'Assigned Leads'}</th>
                <th className="py-3.5 px-4 text-center">{isMarathi ? 'खाते स्थिती' : 'Status'}</th>
                <th className="py-3.5 px-4 text-right">{isMarathi ? 'कृती (Actions)' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gurukul-saffron-500" />
                    {isMarathi ? 'टेलिकॉलर यादी लोड होत आहे...' : 'Loading staff directory...'}
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    {isMarathi ? 'कोणतेही टेलिकॉलर खाते सापडले नाही.' : 'No counselor accounts found.'}
                  </td>
                </tr>
              ) : (
                paginatedList.map((telecaller) => {
                  const id = telecaller.uid || telecaller.userId || telecaller.id;
                  const assignedCount = leads.filter(l => l.assignedTelecallerId === id).length;
                  const isActive = telecaller.status !== 'inactive';

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Employee ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {telecaller.employeeId || 'TC-N/A'}
                      </td>

                      {/* Full Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-gurukul-navy-900 shrink-0">
                            {telecaller.fullName ? telecaller.fullName.charAt(0).toUpperCase() : 'T'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{telecaller.fullName}</p>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {telecaller.gender || (isMarathi ? 'समुपदेशक' : 'Counselor')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-slate-700 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{telecaller.email}</span>
                          </p>
                          <p className="text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{telecaller.phone || telecaller.mobileNumber || '-'}</span>
                          </p>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {telecaller.assignedDepartment || (isMarathi ? 'प्रवेश समुपदेशन' : 'Admissions Dept')}
                      </td>

                      {/* Joining Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {telecaller.joiningDate || '-'}
                      </td>

                      {/* Assigned Leads Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-gurukul-navy-900 border border-blue-200">
                          {assignedCount} {isMarathi ? 'लीड्स' : 'Leads'}
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                          <span>{isActive ? (isMarathi ? 'सक्रिय (Active)' : 'Active') : (isMarathi ? 'निष्क्रिय (Inactive)' : 'Inactive')}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View / Edit */}
                          <Link
                            to={`/admin/telecallers/${id}`}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-gurukul-navy-900 hover:bg-slate-100"
                            title={isMarathi ? "प्रोफाईल पहा / संपादन" : "View Profile"}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Send Password Reset Link */}
                          <button
                            onClick={() => handleSendResetEmail(telecaller)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50"
                            title={isMarathi ? "पासवर्ड रीसेट लिंक पाठवा" : "Send Password Reset Link"}
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Toggle Status (Activate / Deactivate) */}
                          <button
                            onClick={() => setConfirmModal({ open: true, telecaller, action: isActive ? 'deactivate' : 'activate' })}
                            className={`p-1.5 rounded-lg ${
                              isActive 
                                ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50' 
                                : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={isActive ? (isMarathi ? 'खाते निष्क्रिय करा' : 'Deactivate Account') : (isMarathi ? 'खाते सक्रिय करा' : 'Activate Account')}
                          >
                            {isActive ? <UserX className="w-4 h-4 text-rose-500" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              {isMarathi 
                ? `पृष्ठ ${currentPage} / ${totalPages} (एकूण ${filteredList.length} समुपदेशक)`
                : `Page ${currentPage} of ${totalPages} (${filteredList.length} counselors total)`}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Activate / Deactivate */}
      <Modal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, telecaller: null, action: null })}
        title={confirmModal.action === 'deactivate' 
          ? (isMarathi ? 'खाते निष्क्रिय (Deactivate) करण्याची पुष्टी' : 'Confirm Account Deactivation') 
          : (isMarathi ? 'खाते पुन्हा सक्रिय (Activate) करण्याची पुष्टी' : 'Confirm Account Activation')}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            {confirmModal.action === 'deactivate'
              ? (isMarathi 
                  ? `आपण खरोखर समुपदेशक "${confirmModal.telecaller?.fullName}" यांचे खाते निष्क्रिय करू इच्छिता? निष्क्रिय केल्यावर हा युझर पोर्टलवर लॉगिन करू शकणार नाही. (या युझरच्या ऐतिहासिक कॉल्सचा डेटा सुरक्षित राहील).`
                  : `Are you sure you want to deactivate counselor "${confirmModal.telecaller?.fullName}"? They will lose access to the portal immediately. Past interaction history remains preserved.`)
              : (isMarathi
                  ? `आपण समुपदेशक "${confirmModal.telecaller?.fullName}" यांचे खाते पुन्हा सक्रिय करू इच्छिता? युझर त्वरित पुन्हा लॉगिन करू शकेल.`
                  : `Reactivate counselor "${confirmModal.telecaller?.fullName}"? They can log in immediately.`)}
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setConfirmModal({ open: false, telecaller: null, action: null })}
            >
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </Button>
            <Button
              variant={confirmModal.action === 'deactivate' ? 'danger' : 'primary'}
              size="md"
              isLoading={actionLoading}
              onClick={handleConfirmStatusToggle}
            >
              {confirmModal.action === 'deactivate' 
                ? (isMarathi ? 'होय, निष्क्रिय करा' : 'Yes, Deactivate') 
                : (isMarathi ? 'होय, सक्रिय करा' : 'Yes, Activate')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        isOpen={resetModal.open}
        onClose={() => setResetModal({ open: false, telecaller: null, link: null })}
        title={isMarathi ? "पासवर्ड रीसेट लिंक तयार झाली" : "Password Reset Link Generated"}
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            {isMarathi 
              ? `समुपदेशक ${resetModal.telecaller?.fullName} (${resetModal.telecaller?.email}) यांच्यासाठी अधिकृत पासवर्ड रीसेट लिंक तयार करण्यात आली आहे:`
              : `Password reset link successfully generated for ${resetModal.telecaller?.fullName} (${resetModal.telecaller?.email}):`}
          </p>
          {resetModal.link && (
            <div className="p-3 bg-slate-50 border rounded-lg font-mono text-[11px] break-all select-all text-slate-800">
              {resetModal.link}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setResetModal({ open: false, telecaller: null, link: null })}>
              {isMarathi ? 'पूर्ण झाले' : 'Done'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
