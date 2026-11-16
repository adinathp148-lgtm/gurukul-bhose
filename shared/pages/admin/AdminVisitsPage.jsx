import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Eye, 
  UserCheck, 
  RotateCcw, 
  CalendarDays,
  FileText,
  Phone,
  MessageCircle,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCRM } from '../../contexts/CRMContext';
import { Badge } from '../../components/common/Badge';

export const AdminVisitsPage = () => {
  const { isMarathi } = useLanguage();
  const { 
    visits, 
    visitSettings,
    approveCampusVisit, 
    rejectCampusVisit, 
    rescheduleCampusVisit, 
    cancelCampusVisit,
    getVisitSlotAvailability,
    exportVisitsCSV,
    getVisitMetrics 
  } = useCRM();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [staffFilter, setStaffFilter] = useState('ALL');

  // Modals state
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'approve' | 'reject' | 'reschedule' | 'cancel' | 'assign_staff'
  const [targetVisit, setTargetVisit] = useState(null);

  // Form values in modal
  const [modalReason, setModalReason] = useState('');
  const [modalStaffId, setModalStaffId] = useState('');
  const [modalNewDate, setModalNewDate] = useState('');
  const [modalNewSlot, setModalNewSlot] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const metrics = useMemo(() => getVisitMetrics(), [visits, getVisitMetrics]);

  // Filtered visits
  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      const matchSearch = !searchTerm || 
        (v.parentName && v.parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.studentName && v.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.mobileNumber && v.mobileNumber.includes(searchTerm)) ||
        (v.visitNumber && v.visitNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
      const matchDate = !dateFilter || v.requestedDate === dateFilter;
      const matchClass = classFilter === 'ALL' || v.applyingClass === classFilter;
      const matchStaff = staffFilter === 'ALL' || v.assignedStaffId === staffFilter;

      return matchSearch && matchStatus && matchDate && matchClass && matchStaff;
    });
  }, [visits, searchTerm, statusFilter, dateFilter, classFilter, staffFilter]);

  const handleExportCSV = () => {
    const csvData = exportVisitsCSV(filteredVisits);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gurukul_campus_visits_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openActionModal = (type, visit) => {
    setTargetVisit(visit);
    setActionModal(type);
    setModalReason('');
    setModalStaffId(visit.assignedStaffId || visitSettings.availableStaff?.[0]?.id || '');
    setModalNewDate(visit.requestedDate || '');
    setModalNewSlot('');
    setActionError(null);
  };

  const closeActionModal = () => {
    setActionModal(null);
    setTargetVisit(null);
    setModalReason('');
    setActionError(null);
  };

  const executeModalAction = async (e) => {
    e.preventDefault();
    if (!targetVisit) return;
    setActionLoading(true);
    setActionError(null);

    try {
      if (actionModal === 'approve') {
        const staffObj = visitSettings.availableStaff.find(s => s.id === modalStaffId);
        await approveCampusVisit(targetVisit.visitId, {
          assignedStaffId: modalStaffId,
          assignedStaffName: staffObj?.name || 'Assigned Staff',
          notes: modalReason
        });
      } else if (actionModal === 'reject') {
        if (!modalReason.trim()) throw new Error(isMarathi ? 'नाकारण्याचे कारण आवश्यक आहे.' : 'Rejection reason is required.');
        await rejectCampusVisit(targetVisit.visitId, { reason: modalReason });
      } else if (actionModal === 'reschedule') {
        if (!modalNewDate) throw new Error(isMarathi ? 'नवीन तारीख निवडा.' : 'Select new date.');
        if (!modalNewSlot) throw new Error(isMarathi ? 'नवीन स्लॉट निवडा.' : 'Select new slot.');
        if (!modalReason.trim()) throw new Error(isMarathi ? 'पुनर्नियोजनाचे कारण आवश्यक आहे.' : 'Reason is required.');
        await rescheduleCampusVisit(targetVisit.visitId, {
          newDate: modalNewDate,
          newSlot: modalNewSlot,
          reason: modalReason
        });
      } else if (actionModal === 'cancel') {
        if (!modalReason.trim()) throw new Error(isMarathi ? 'रद्द करण्याचे कारण आवश्यक आहे.' : 'Cancellation reason is required.');
        await cancelCampusVisit(targetVisit.visitId, { reason: modalReason });
      }
      closeActionModal();
    } catch (err) {
      setActionError(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Confirmed</span>;
      case 'Pending Approval':
      case 'Requested':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending Approval</span>;
      case 'Checked In':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Checked In</span>;
      case 'In Progress':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">In Progress</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">Completed</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Cancelled</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Rejected</span>;
      case 'Rescheduled':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">Rescheduled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-gurukul-saffron-600" />
            <h1 className="text-xl font-bold text-slate-900">
              {isMarathi ? 'शाळा भेट व्यवस्थापन (Campus Visit Management)' : 'Campus Visit Management'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi 
              ? 'पालकांच्या शाळा भेटीचे नियोजन, मान्यता, स्वागत व समुपदेशन व्यवस्थापन.' 
              : 'Review visit requests, approve slots, assign counselors, and monitor campus footfall.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-300"
          >
            <Download className="w-4 h-4" />
            <span>{isMarathi ? 'CSV एक्सपोर्ट' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Analytics Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{isMarathi ? 'एकूण भेटी' : 'Total Visits'}</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{metrics.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">{isMarathi ? 'आजच्या भेटी' : "Today's Visits"}</p>
          <p className="text-xl font-extrabold text-emerald-700 mt-1">{metrics.today}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{isMarathi ? 'प्रलंबित मान्यता' : 'Pending'}</p>
          <p className="text-xl font-extrabold text-amber-600 mt-1">{metrics.pendingApproval}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{isMarathi ? 'निश्चित (Confirmed)' : 'Confirmed'}</p>
          <p className="text-xl font-extrabold text-blue-700 mt-1">{metrics.confirmed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">{isMarathi ? 'आगामी (Upcoming)' : 'Upcoming'}</p>
          <p className="text-xl font-extrabold text-indigo-700 mt-1">{metrics.upcoming}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">{isMarathi ? 'पूर्ण भेटी' : 'Completed'}</p>
          <p className="text-xl font-extrabold text-green-700 mt-1">{metrics.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">{isMarathi ? 'रद्द / नाकारल्या' : 'Cancelled'}</p>
          <p className="text-xl font-extrabold text-rose-600 mt-1">{metrics.cancelled}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{isMarathi ? 'अनुपस्थित (No Show)' : 'No Show'}</p>
          <p className="text-xl font-extrabold text-slate-600 mt-1">{metrics.noShow}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={isMarathi ? 'पालक, विद्यार्थी, मोबाईल, संदर्भ क्र...' : 'Search parent, student, mobile...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500 bg-white"
            >
              <option value="ALL">{isMarathi ? 'सर्व स्थिती (All Statuses)' : 'All Statuses'}</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked In">Checked In</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500 bg-white"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500 bg-white"
            >
              <option value="ALL">{isMarathi ? 'सर्व इयत्ता (All Classes)' : 'All Classes'}</option>
              <option value="इ. 5 वी (5th Standard)">5th Standard</option>
              <option value="इ. 8 वी (8th Standard)">8th Standard</option>
              <option value="इ. 11 वी सायन्स (11th Science)">11th Science</option>
              <option value="इ. 11 वी आर्टस् (11th Arts)">11th Arts</option>
              <option value="इ. 12 वी सायन्स (12th Science)">12th Science</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-center gap-2">
            {(searchTerm || statusFilter !== 'ALL' || dateFilter || classFilter !== 'ALL' || staffFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setDateFilter('');
                  setClassFilter('ALL');
                  setStaffFilter('ALL');
                }}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                {isMarathi ? 'फिल्टर्स काढा' : 'Clear Filters'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">{isMarathi ? 'भेट संदर्भ क्र.' : 'Visit No.'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'पालक व विद्यार्थी' : 'Parent & Student'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'मोबाईल' : 'Mobile'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'प्रवेश इयत्ता' : 'Class'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'तारीख व वेळ' : 'Date & Time'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'उद्देश' : 'Purpose'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'स्थिती' : 'Status'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'नियुक्त स्टाफ' : 'Assigned Staff'}</th>
                <th className="py-3.5 px-4 text-right">{isMarathi ? 'कृती' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>{isMarathi ? 'कोणतीही शाळा भेट नोंद आढळली नाही.' : 'No campus visit records match your filters.'}</span>
                  </td>
                </tr>
              ) : (
                filteredVisits.map((v) => (
                  <tr key={v.visitId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {v.visitNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{v.parentName}</div>
                      <div className="text-[11px] text-slate-500">{v.studentName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <a href={`tel:${v.mobileNumber}`} className="text-gurukul-navy-900 hover:text-gurukul-saffron-600 font-semibold">
                        {v.mobileNumber}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{v.applyingClass}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                        {v.requestedDate}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {v.timeSlot}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-600" title={v.purpose}>
                      {v.purpose} ({v.numberOfVisitors || 1} {isMarathi ? 'लोक' : 'ppl'})
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(v.status)}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      {v.assignedStaffName || (
                        <span className="text-amber-600 font-medium">{isMarathi ? 'अनियुक्त' : 'Unassigned'}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => setSelectedVisit(v)}
                          title="View Details"
                          className="p-1.5 text-slate-600 hover:text-gurukul-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Approve */}
                        {(v.status === 'Pending Approval' || v.status === 'Requested') && (
                          <button
                            onClick={() => openActionModal('approve', v)}
                            title="Approve Visit"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Reject */}
                        {(v.status === 'Pending Approval' || v.status === 'Requested') && (
                          <button
                            onClick={() => openActionModal('reject', v)}
                            title="Reject Visit"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Reschedule */}
                        {(v.status === 'Confirmed' || v.status === 'Pending Approval' || v.status === 'Rescheduled') && (
                          <button
                            onClick={() => openActionModal('reschedule', v)}
                            title="Reschedule Visit"
                            className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        {/* Cancel */}
                        {(v.status === 'Confirmed' || v.status === 'Pending Approval') && (
                          <button
                            onClick={() => openActionModal('cancel', v)}
                            title="Cancel Visit"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-mono font-bold text-gurukul-saffron-600">{selectedVisit.visitNumber}</span>
                <h3 className="text-base font-bold text-slate-900">{isMarathi ? 'शाळा भेट तपशील' : 'Campus Visit Details'}</h3>
              </div>
              <button onClick={() => setSelectedVisit(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">{isMarathi ? 'पालकांचे नाव' : 'Parent Name'}</span>
                  <span className="font-bold text-slate-900">{selectedVisit.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isMarathi ? 'विद्यार्थ्याचे नाव' : 'Student Name'}</span>
                  <span className="font-bold text-slate-900">{selectedVisit.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isMarathi ? 'मोबाईल' : 'Mobile'}</span>
                  <a href={`tel:${selectedVisit.mobileNumber}`} className="font-bold text-gurukul-navy-900 hover:underline">
                    {selectedVisit.mobileNumber}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">{isMarathi ? 'इयत्ता' : 'Class'}</span>
                  <span className="font-bold text-slate-900">{selectedVisit.applyingClass}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isMarathi ? 'तारीख व वेळ' : 'Date & Time'}</span>
                  <span className="font-bold text-slate-900">{selectedVisit.requestedDate} ({selectedVisit.timeSlot})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isMarathi ? 'व्यक्ती संख्या' : 'Visitors'}</span>
                  <span className="font-bold text-slate-900">{selectedVisit.numberOfVisitors || 1}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">{isMarathi ? 'भेटीचा उद्देश' : 'Visit Purpose'}</span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700">{selectedVisit.purpose}</p>
              </div>

              {selectedVisit.internalNotes && (
                <div>
                  <span className="text-slate-500 font-bold block mb-1">{isMarathi ? 'टिप्पणी / अंतर्गत नोट्स' : 'Internal Notes'}</span>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-700 whitespace-pre-wrap">{selectedVisit.internalNotes}</p>
                </div>
              )}

              {selectedVisit.checkedInAt && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                  <p className="font-bold">{isMarathi ? 'गेट चेक-इन नोंद' : 'Check-In Record'}</p>
                  <p>{isMarathi ? `चेक-इन वेळ: ${selectedVisit.checkedInAt} (द्वारा: ${selectedVisit.checkedInBy || 'Staff'})` : `Checked in at ${selectedVisit.checkedInAt}`}</p>
                  {selectedVisit.checkedOutAt && (
                    <p className="mt-1">{isMarathi ? `चेक-आउट वेळ: ${selectedVisit.checkedOutAt} (द्वारा: ${selectedVisit.checkedOutBy || 'Staff'})` : `Checked out at ${selectedVisit.checkedOutAt}`}</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedVisit(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                {isMarathi ? 'बंद करा' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Approve, Reject, Reschedule, Cancel) */}
      {actionModal && targetVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={executeModalAction} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-scaleUp space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {actionModal === 'approve' && (isMarathi ? 'शाळा भेट मंजूर करा (Approve Visit)' : 'Approve Campus Visit')}
              {actionModal === 'reject' && (isMarathi ? 'शाळा भेट नाकारा (Reject Visit)' : 'Reject Campus Visit')}
              {actionModal === 'reschedule' && (isMarathi ? 'शाळा भेट पुनर्नियोजित करा (Reschedule Visit)' : 'Reschedule Campus Visit')}
              {actionModal === 'cancel' && (isMarathi ? 'शाळा भेट रद्द करा (Cancel Visit)' : 'Cancel Campus Visit')}
            </h3>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {actionError}
              </div>
            )}

            {/* Staff selection for Approval */}
            {actionModal === 'approve' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isMarathi ? 'भेट समन्वयक स्टाफ नियुक्त करा' : 'Assign Coordinator Staff'}
                </label>
                <select
                  value={modalStaffId}
                  onChange={(e) => setModalStaffId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  {visitSettings.availableStaff?.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Reschedule Date & Slot Picker */}
            {actionModal === 'reschedule' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'नवीन तारीख निवडा *' : 'Select New Date *'}
                  </label>
                  <input
                    type="date"
                    value={modalNewDate}
                    onChange={(e) => setModalNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'नवीन वेळेचा स्लॉट निवडा *' : 'Select New Slot *'}
                  </label>
                  <select
                    value={modalNewSlot}
                    onChange={(e) => setModalNewSlot(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    required
                  >
                    <option value="">{isMarathi ? '-- स्लॉट निवडा --' : '-- Select Slot --'}</option>
                    {getVisitSlotAvailability(modalNewDate).filter(s => s.available).map(s => (
                      <option key={s.slot} value={s.slot}>{s.slot} ({s.remainingCapacity} seats left)</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Reason / Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {actionModal === 'approve' 
                  ? (isMarathi ? 'मान्यता टिप्पणी (ऐच्छिक)' : 'Approval Notes (Optional)')
                  : (isMarathi ? 'कारण प्रविष्ट करा *' : 'Reason *')}
              </label>
              <textarea
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                rows={3}
                placeholder={isMarathi ? 'येथे कारण किंवा टिप्पणी लिहा...' : 'Enter reason or remarks here...'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500"
                required={actionModal !== 'approve'}
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeActionModal}
                disabled={actionLoading}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                {isMarathi ? 'रद्द' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-colors ${
                  actionModal === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  actionModal === 'reject' ? 'bg-rose-600 hover:bg-rose-700' :
                  actionModal === 'reschedule' ? 'bg-cyan-600 hover:bg-cyan-700' :
                  'bg-slate-800 hover:bg-slate-900'
                }`}
              >
                {actionLoading ? 'Saving...' : (isMarathi ? 'पुष्टी करा' : 'Confirm')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminVisitsPage;
