import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Phone,
  MessageCircle,
  FileText
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCRM } from '../../contexts/CRMContext';
import { useAuth } from '../../contexts/AuthContext';

export const TelecallerVisitsPage = () => {
  const { isMarathi } = useLanguage();
  const { userProfile } = useAuth();
  const { 
    visits, 
    leads, 
    scheduleCampusVisit, 
    getVisitSlotAvailability, 
    visitPurposes, 
    visitSettings 
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Schedule Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitSlot, setVisitSlot] = useState('');
  const [visitorsCount, setVisitorsCount] = useState(2);
  const [visitPurpose, setVisitPurpose] = useState('School Admission Enquiry');
  const [internalNotes, setInternalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(null);

  // Available slots for selected date
  const availableSlots = useMemo(() => {
    if (!visitDate) return [];
    return getVisitSlotAvailability(visitDate);
  }, [visitDate, getVisitSlotAvailability]);

  // Telecaller's assigned leads only
  const myAssignedLeads = useMemo(() => {
    const callerId = userProfile?.uid;
    return leads.filter(l => l.assignedTelecallerId === callerId || l.assignedTo === callerId);
  }, [leads, userProfile]);

  // Filtered visits
  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      const matchSearch = !searchTerm ||
        (v.parentName && v.parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.studentName && v.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.mobileNumber && v.mobileNumber.includes(searchTerm)) ||
        (v.visitNumber && v.visitNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [visits, searchTerm, statusFilter]);

  const openScheduleModal = (preselectedLeadId = '') => {
    setSelectedLeadId(preselectedLeadId || (myAssignedLeads[0]?.id || ''));
    setVisitDate('');
    setVisitSlot('');
    setVisitorsCount(2);
    setVisitPurpose('School Admission Enquiry');
    setInternalNotes('');
    setModalError(null);
    setModalSuccess(null);
    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeadId) {
      setModalError(isMarathi ? 'कृपया नेमून दिलेली लीड निवडा.' : 'Please select an assigned lead.');
      return;
    }
    if (!visitDate) {
      setModalError(isMarathi ? 'कृपया भेटीची तारीख निवडा.' : 'Please select visit date.');
      return;
    }
    if (!visitSlot) {
      setModalError(isMarathi ? 'कृपया वेळेचा स्लॉट निवडा.' : 'Please select a time slot.');
      return;
    }

    const targetLead = myAssignedLeads.find(l => l.id === selectedLeadId || l.leadId === selectedLeadId);
    if (!targetLead) {
      setModalError(isMarathi ? 'केवळ स्वतःकडे नेमून दिलेल्या विद्यार्थ्यांची भेट नियोजित करू शकता.' : 'You can only schedule visits for leads assigned to you.');
      return;
    }

    setLoading(true);
    setModalError(null);

    try {
      const res = await scheduleCampusVisit({
        leadId: targetLead.id || targetLead.leadId,
        leadNumber: targetLead.leadNumber,
        parentName: targetLead.parentName,
        mobileNumber: targetLead.mobileNumber || targetLead.normalizedMobile,
        whatsappNumber: targetLead.whatsappNumber || targetLead.mobileNumber,
        email: targetLead.email,
        studentName: targetLead.studentName,
        currentClass: targetLead.currentClass || '',
        applyingClass: targetLead.admissionClass || targetLead.course || 'इ. 8 वी (8th Standard)',
        requestedDate: visitDate,
        timeSlot: visitSlot,
        numberOfVisitors: visitorsCount,
        purpose: visitPurpose,
        additionalMessage: internalNotes
      });

      if (res.success) {
        setModalSuccess(isMarathi ? `शाळा भेट यशस्वीरित्या नियोजित झाली! संदर्भ क्र.: ${res.visit.visitNumber}` : `Campus visit scheduled! Ref: ${res.visit.visitNumber}`);
        setTimeout(() => {
          setScheduleModalOpen(false);
          setModalSuccess(null);
        }, 1800);
      }
    } catch (err) {
      setModalError(err.message || 'Failed to schedule visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              {isMarathi ? 'शाळा भेट नियोजन (Campus Visits)' : 'Campus Visit Scheduling'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi 
              ? 'आपल्याकडे नेमून दिलेल्या विद्यार्थ्यांच्या पालकांसाठी गुरुकुल भोसे कॅम्पस भेटीचे नियोजन करा.' 
              : 'Schedule guided campus tours for your assigned admission leads and track visit progress.'}
          </p>
        </div>

        <button
          onClick={() => openScheduleModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isMarathi ? 'नवीन भेट नियोजित करा' : 'Schedule Campus Visit'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={isMarathi ? 'पालक, विद्यार्थी किंवा संदर्भ क्र. शोधा...' : 'Search parent, student, or visit no...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
          >
            <option value="ALL">{isMarathi ? 'सर्व स्थिती (All Statuses)' : 'All Statuses'}</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked In">Checked In</option>
            <option value="Completed">Completed</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Visits List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{isMarathi ? 'संदर्भ क्र.' : 'Visit No.'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'पालक व विद्यार्थी' : 'Parent & Student'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'मोबाईल' : 'Mobile'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'इयत्ता' : 'Class'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'भेटीची तारीख व वेळ' : 'Date & Time'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'स्थिती' : 'Status'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'समन्वयक स्टाफ' : 'Assigned Staff'}</th>
                <th className="py-3.5 px-4 text-right">{isMarathi ? 'संपर्क' : 'Contact'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>{isMarathi ? 'कोणतीही शाळा भेट आढळली नाही.' : 'No scheduled campus visits found.'}</span>
                  </td>
                </tr>
              ) : (
                filteredVisits.map((v) => (
                  <tr key={v.visitId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{v.visitNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{v.parentName}</div>
                      <div className="text-[11px] text-slate-500">{v.studentName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <a href={`tel:${v.mobileNumber}`} className="text-emerald-700 font-semibold hover:underline">
                        {v.mobileNumber}
                      </a>
                    </td>
                    <td className="py-3 px-4">{v.applyingClass}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        {v.requestedDate}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {v.timeSlot}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        v.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                        v.status === 'Checked In' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {v.assignedStaffName || (isMarathi ? 'प्रलंबित' : 'Pending')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={`tel:${v.mobileNumber}`}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={`https://wa.me/91${v.mobileNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCHEDULE MODAL */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleScheduleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-scaleUp space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>{isMarathi ? 'कॅम्पस भेट नियोजित करा' : 'Schedule Campus Visit for Lead'}</span>
            </h3>

            {modalSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Select Assigned Lead */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'नेमून दिलेली लीड निवडा *' : 'Select Assigned Student Lead *'}
              </label>
              {myAssignedLeads.length === 0 ? (
                <p className="text-xs text-rose-600 p-2 bg-rose-50 rounded-lg">
                  {isMarathi ? 'आपल्याकडे सध्या कोणतीही ऍक्टिव्ह लीड नेमून दिलेली नाही.' : 'No active leads assigned to you.'}
                </p>
              ) : (
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  required
                >
                  {myAssignedLeads.map(l => (
                    <option key={l.id || l.leadId} value={l.id || l.leadId}>
                      {l.studentName} ({l.parentName} - {l.mobileNumber}) - {l.admissionClass || 'इ. 8 वी'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isMarathi ? 'भेटीची तारीख *' : 'Preferred Visit Date *'}
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={visitDate}
                  onChange={(e) => { setVisitDate(e.target.value); setVisitSlot(''); }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isMarathi ? 'व्यक्ती संख्या' : 'Number of Visitors'}
                </label>
                <select
                  value={visitorsCount}
                  onChange={(e) => setVisitorsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} व्यक्ती</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Slot Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'वेळेचा स्लॉट निवडा *' : 'Select Time Slot *'}
              </label>
              {!visitDate ? (
                <p className="text-[11px] text-slate-400 p-2 bg-slate-50 rounded-lg">
                  {isMarathi ? 'कृपया प्रथम तारीख निवडा.' : 'Select a date first to view slots.'}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
                  {availableSlots.map(({ slot, available, remainingCapacity }) => (
                    <button
                      key={slot}
                      type="button"
                      disabled={!available}
                      onClick={() => setVisitSlot(slot)}
                      className={`p-2 rounded-lg border text-left text-[11px] transition-all ${
                        !available 
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : visitSlot === slot
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold">{slot}</div>
                      <div className="text-[9px] text-slate-500">{remainingCapacity} seats left</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'भेटीचा मुख्य उद्देश' : 'Purpose'}
              </label>
              <select
                value={visitPurpose}
                onChange={(e) => setVisitPurpose(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {visitPurposes.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'समुपदेशक अंतर्गत नोट्स' : 'Counselor Notes'}
              </label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={2}
                placeholder={isMarathi ? 'पालकांशी झालेल्या चर्चेचा संदर्भ...' : 'Discussion points with parent...'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                disabled={loading}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                {isMarathi ? 'रद्द' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading || myAssignedLeads.length === 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : (isMarathi ? 'भेट नोंदवा' : 'Schedule Visit')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TelecallerVisitsPage;
