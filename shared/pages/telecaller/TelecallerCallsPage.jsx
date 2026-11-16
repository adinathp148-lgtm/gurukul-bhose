import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Phone, 
  PhoneCall, 
  MessageCircle, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Eye, 
  Plus, 
  History, 
  Sparkles,
  ArrowUpDown,
  ChevronDown,
  X,
  Flame,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCRM } from '../../contexts/CRMContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const TelecallerCallsPage = () => {
  const { isMarathi } = useLanguage();
  const { currentUser } = useAuth();
  const { 
    leads, 
    calls, 
    followUps, 
    recordCall, 
    scheduleFollowUp, 
    statusConfig,
    validCallOutcomes,
    validInterestLevels,
    validPriorities 
  } = useCRM();

  const [searchParams] = useSearchParams();
  const preselectedLeadId = searchParams.get('leadId');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Modal States
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Call Recording Form State
  const [callForm, setCallForm] = useState({
    callOutcome: 'Connected',
    callDurationSeconds: 120,
    interestLevel: 'High',
    notes: '',
    parentResponse: '',
    nextFollowUpRequired: true,
    nextFollowUpDate: '',
    nextFollowUpTime: '11:00',
    followUpPriority: 'High'
  });

  // Schedule Follow-Up Form State
  const [scheduleForm, setScheduleForm] = useState({
    scheduledDate: '',
    scheduledTime: '10:00',
    priority: 'Medium',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Set default follow-up date to tomorrow
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // Open Call Recording Modal
  const openCallModal = (lead) => {
    setSelectedLead(lead);
    setCallForm({
      callOutcome: 'Connected',
      callDurationSeconds: 120,
      interestLevel: 'High',
      notes: '',
      parentResponse: '',
      nextFollowUpRequired: true,
      nextFollowUpDate: getTomorrowDate(),
      nextFollowUpTime: '11:00',
      followUpPriority: 'High'
    });
    setCallModalOpen(true);
  };

  // Open Schedule Follow-Up Modal
  const openScheduleModal = (lead) => {
    setSelectedLead(lead);
    setScheduleForm({
      scheduledDate: getTomorrowDate(),
      scheduledTime: '10:00',
      priority: 'Medium',
      notes: ''
    });
    setScheduleModalOpen(true);
  };

  // Open History Modal
  const openHistoryModal = (lead) => {
    setSelectedLead(lead);
    setHistoryModalOpen(true);
  };

  // Handle Call Submission
  const handleSaveCall = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    if (callForm.nextFollowUpRequired && !callForm.nextFollowUpDate) {
      alert(isMarathi ? 'कृपया पुढील फॉलो-अप तारीख निवडा.' : 'Please select next follow-up date.');
      return;
    }

    if (callForm.nextFollowUpRequired && callForm.nextFollowUpDate < new Date().toISOString().split('T')[0]) {
      alert(isMarathi ? 'फॉलो-अप तारीख भूतकाळातील असू शकत नाही.' : 'Follow-up date cannot be in the past.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await recordCall({
        leadId: selectedLead.id,
        leadNumber: selectedLead.leadNumber,
        callOutcome: callForm.callOutcome,
        callDurationSeconds: Number(callForm.callDurationSeconds) || 0,
        interestLevel: callForm.interestLevel,
        notes: callForm.notes,
        parentResponse: callForm.parentResponse,
        nextFollowUpRequired: callForm.nextFollowUpRequired,
        nextFollowUpDate: callForm.nextFollowUpDate,
        nextFollowUpTime: callForm.nextFollowUpTime,
        followUpPriority: callForm.followUpPriority
      });

      if (res.success) {
        setNotification({
          type: 'success',
          message: isMarathi 
            ? `कॉल रेकॉर्ड यशस्वीरित्या सेव्ह झाला! (स्थिती: ${res.leadStatus || 'Updated'})`
            : `Call record saved successfully! (Status: ${res.leadStatus || 'Updated'})`
        });
        setCallModalOpen(false);
      }
    } catch (err) {
      alert(err.message || 'Error recording call.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Schedule Follow-Up Submission
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    if (!scheduleForm.scheduledDate || scheduleForm.scheduledDate < new Date().toISOString().split('T')[0]) {
      alert(isMarathi ? 'कृपया भविष्यकालीन वैध तारीख निवडा.' : 'Please select a valid future date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await scheduleFollowUp({
        leadId: selectedLead.id,
        leadNumber: selectedLead.leadNumber,
        parentName: selectedLead.parentName,
        studentName: selectedLead.studentName,
        mobileNumber: selectedLead.mobileNumber || selectedLead.mobile,
        admissionClass: selectedLead.admissionClass,
        academicYear: selectedLead.academicYear,
        scheduledDate: scheduleForm.scheduledDate,
        scheduledTime: scheduleForm.scheduledTime,
        priority: scheduleForm.priority,
        notes: scheduleForm.notes
      });

      if (res.success) {
        setNotification({
          type: 'success',
          message: isMarathi 
            ? 'फॉलो-अप यशस्वीरित्या नियोजित झाला!'
            : 'Follow-up scheduled successfully!'
        });
        setScheduleModalOpen(false);
      }
    } catch (err) {
      alert(err.message || 'Error scheduling follow-up.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !searchTerm || 
        (l.leadNumber && l.leadNumber.toLowerCase().includes(q)) ||
        (l.parentName && l.parentName.toLowerCase().includes(q)) ||
        (l.studentName && l.studentName.toLowerCase().includes(q)) ||
        (l.mobileNumber && l.mobileNumber.includes(q)) ||
        (l.mobile && l.mobile.includes(q));

      const matchStatus = statusFilter === 'ALL' || l.status === statusFilter || l.leadStatus === statusFilter;
      const matchClass = classFilter === 'ALL' || l.admissionClass === classFilter;

      return matchSearch && matchStatus && matchClass;
    });
  }, [leads, searchTerm, statusFilter, classFilter]);

  // Lead Calls History Helper
  const getLeadCalls = (leadId) => {
    return calls.filter(c => c.leadId === leadId).sort((a, b) => new Date(b.callTimestamp?.toDate ? b.callTimestamp.toDate() : b.callTimestamp) - new Date(a.callTimestamp?.toDate ? a.callTimestamp.toDate() : a.callTimestamp));
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gurukul-navy-950 via-slate-900 to-gurukul-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-400">
            {isMarathi ? 'कॉल व्यवस्थापन व पालक संपर्क' : 'Call Management & Parent Calling'}
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-1">
            {isMarathi ? 'माझ्याकडे नेमून दिलेल्या प्रवेश लीड्स' : 'My Assigned Admission Enquiries'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {isMarathi 
              ? 'थेट कॉल करा, WhatsApp संदेश पाठवा, प्रत्येक कॉलचा निकाल नोंदवा व पुढील फॉलो-अप वेळेत पूर्ण करा.'
              : 'Direct calling, WhatsApp contact, structured call recording and next follow-up scheduling.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/25 hover:border-white/40 shadow-xs backdrop-blur-xs font-semibold"
          >
            {viewMode === 'table' ? (
              <LayoutGrid className="w-4 h-4 mr-1.5 text-gurukul-saffron-300" />
            ) : (
              <TableIcon className="w-4 h-4 mr-1.5 text-gurukul-saffron-300" />
            )}
            <span>{viewMode === 'table' ? (isMarathi ? 'कार्ड व्ह्यू' : 'Card View') : (isMarathi ? 'टेबल व्ह्यू' : 'Table View')}</span>
          </Button>

          <Link to="/telecaller/calendar">
            <Button variant="secondary" size="sm" className="bg-gurukul-saffron-500 hover:bg-gurukul-saffron-600 text-white border-none shadow">
              <Calendar className="w-4 h-4 mr-1.5" />
              <span>{isMarathi ? 'फॉलो-अप कॅलेंडर' : 'Follow-up Calendar'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isMarathi ? 'नाव, मोबाईल, लीड नंबर शोधा...' : 'Search Name, Mobile, Lead #...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">{isMarathi ? 'सर्व स्थिती (All Status)' : 'All Status'}</option>
            {Object.keys(statusConfig).map(s => (
              <option key={s} value={s}>{statusConfig[s]?.labelMr || s}</option>
            ))}
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">{isMarathi ? 'सर्व वर्ग (All Classes)' : 'All Classes'}</option>
            <option value="5th">5th Standard</option>
            <option value="6th">6th Standard</option>
            <option value="7th">7th Standard</option>
            <option value="8th">8th Standard</option>
            <option value="9th">9th Standard</option>
            <option value="10th">10th Standard</option>
            <option value="11th Science">11th Science</option>
            <option value="12th Science">12th Science</option>
          </select>

          <span className="text-xs font-bold text-slate-500 whitespace-nowrap px-2">
            {filteredLeads.length} {isMarathi ? 'लीड्स' : 'Leads'}
          </span>
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Lead #</th>
                  <th className="py-3 px-4">{isMarathi ? 'पालक व विद्यार्थी' : 'Parent & Student'}</th>
                  <th className="py-3 px-4">{isMarathi ? 'मोबाईल' : 'Mobile'}</th>
                  <th className="py-3 px-4">{isMarathi ? 'इयत्ता' : 'Class'}</th>
                  <th className="py-3 px-4">{isMarathi ? 'स्थिती' : 'Status'}</th>
                  <th className="py-3 px-4">{isMarathi ? 'शेवटचा संपर्क' : 'Last Contact'}</th>
                  <th className="py-3 px-4">{isMarathi ? 'पुढील फॉलो-अप' : 'Next Follow-up'}</th>
                  <th className="py-3 px-4 text-right">{isMarathi ? 'कृती (Actions)' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      <PhoneCall className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                      <p className="text-sm font-semibold">{isMarathi ? 'कोणतीही लीड सापडली नाही.' : 'No assigned leads found matching criteria.'}</p>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map(lead => {
                    const status = statusConfig[lead.status || lead.leadStatus] || statusConfig['New'];
                    const mobile = lead.normalizedMobile || lead.mobileNumber || lead.mobile || '';
                    const cleanPhone = mobile.replace(/\D/g, '').slice(-10);

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-gurukul-navy-900 whitespace-nowrap">
                          {lead.leadNumber || lead.id.slice(0, 8)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{lead.parentName || 'N/A'}</div>
                          <div className="text-[11px] text-slate-500">{lead.studentName || 'Student'}</div>
                        </td>
                        <td className="py-3 px-4 font-mono whitespace-nowrap">
                          {mobile || 'N/A'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            {lead.admissionClass || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${status.bgColor}`}>
                            {isMarathi ? status.labelMr : status.labelEn}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                          {lead.lastContactedAt ? (
                            new Date(lead.lastContactedAt?.toDate ? lead.lastContactedAt.toDate() : lead.lastContactedAt).toLocaleDateString('en-IN')
                          ) : (
                            <span className="text-slate-400 italic">कधीही नाही (Never)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[11px] whitespace-nowrap">
                          {lead.nextFollowUp || lead.nextFollowupAt ? (
                            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {lead.nextFollowUp || lead.nextFollowupAt.split('T')[0]}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Call Now */}
                            <a 
                              href={`tel:${cleanPhone}`} 
                              title="Call Now via Phone Dialer"
                              className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            {/* WhatsApp */}
                            <a 
                              href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`नमस्कार ${lead.parentName || 'पालक'}, मी गुरुकुल भोसे (सैनिक पॅटर्न निवासी शाळा व ज्युनिअर कॉलेज) येथून प्रवेश समुपदेशक बोलत आहे.`)}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              title="Open WhatsApp"
                              className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>

                            {/* Add Call Record */}
                            <Button 
                              size="sm" 
                              onClick={() => openCallModal(lead)}
                              className="h-8 px-2.5 text-xs bg-gurukul-saffron-500 hover:bg-gurukul-saffron-600 text-white font-bold"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              <span>{isMarathi ? 'कॉल नोंद' : 'Record'}</span>
                            </Button>

                            {/* Schedule Follow-up */}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openScheduleModal(lead)}
                              className="h-8 px-2.5 text-xs text-slate-700 hover:text-gurukul-navy-900 border-slate-200"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>{isMarathi ? 'फॉलो-अप' : 'Follow-up'}</span>
                            </Button>

                            {/* History Modal */}
                            <button
                              onClick={() => openHistoryModal(lead)}
                              title={isMarathi ? 'कॉल इतिहास पहा' : 'View Call History'}
                              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 flex items-center justify-center transition-colors"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            {/* View Details */}
                            <Link 
                              to={`/telecaller/leads/${lead.id}`}
                              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 flex items-center justify-center transition-colors"
                              title={isMarathi ? 'पूर्ण तपशील पहा' : 'View Full Details'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <PhoneCall className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-semibold">{isMarathi ? 'कोणतीही लीड सापडली नाही.' : 'No assigned leads found.'}</p>
            </div>
          ) : (
            filteredLeads.map(lead => {
              const status = statusConfig[lead.status || lead.leadStatus] || statusConfig['New'];
              const mobile = lead.normalizedMobile || lead.mobileNumber || lead.mobile || '';
              const cleanPhone = mobile.replace(/\D/g, '').slice(-10);

              return (
                <div key={lead.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-4 text-left">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-gurukul-navy-900 block">
                        #{lead.leadNumber || lead.id.slice(0, 8)}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 mt-0.5">{lead.parentName}</h3>
                      <p className="text-xs text-slate-500 font-medium">विद्यार्थी: {lead.studentName || 'Student'}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${status.bgColor} shrink-0`}>
                      {isMarathi ? status.labelMr : status.labelEn}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">इयत्ता (Class)</span>
                      <span className="font-bold text-slate-800">{lead.admissionClass || 'General'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">मोबाईल (Phone)</span>
                      <span className="font-mono font-bold text-slate-800">{mobile || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">शेवटचा संपर्क</span>
                      <span className="font-medium text-slate-700">
                        {lead.lastContactedAt ? new Date(lead.lastContactedAt?.toDate ? lead.lastContactedAt.toDate() : lead.lastContactedAt).toLocaleDateString('en-IN') : 'None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">पुढील फॉलो-अप</span>
                      <span className="font-bold text-amber-700">
                        {lead.nextFollowUp || (lead.nextFollowupAt ? lead.nextFollowupAt.split('T')[0] : 'None')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <a 
                      href={`tel:${cleanPhone}`}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{isMarathi ? 'कॉल' : 'Call'}</span>
                    </a>
                    <a 
                      href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`नमस्कार ${lead.parentName || 'पालक'}, मी गुरुकुल भोसे येथून प्रवेश समुपदेशक बोलत आहे.`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs hover:bg-emerald-500 hover:text-white transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                    <Button 
                      size="sm"
                      onClick={() => openCallModal(lead)}
                      className="py-2 text-xs font-bold bg-gurukul-saffron-500 hover:bg-gurukul-saffron-600 text-white rounded-xl"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      <span>{isMarathi ? 'नोंदवा' : 'Record'}</span>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 1. CALL RECORDING MODAL */}
      <Modal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        title={isMarathi ? `कॉल निकाल नोंदवा (#${selectedLead?.leadNumber || ''})` : `Record Call Outcome (#${selectedLead?.leadNumber || ''})`}
      >
        {selectedLead && (
          <form onSubmit={handleSaveCall} className="space-y-4 text-left">
            {/* Lead Summary Header */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">पालक (Parent)</span>
                <span className="font-bold text-slate-900">{selectedLead.parentName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">विद्यार्थी (Student)</span>
                <span className="font-bold text-slate-900">{selectedLead.studentName} ({selectedLead.admissionClass})</span>
              </div>
            </div>

            {/* Call Outcome (Required) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'कॉलचा निकाल (Call Outcome) *' : 'Call Outcome *'}
              </label>
              <select
                value={callForm.callOutcome}
                onChange={(e) => setCallForm({ ...callForm, callOutcome: e.target.value })}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                required
              >
                {validCallOutcomes.map(out => (
                  <option key={out} value={out}>{out}</option>
                ))}
              </select>
            </div>

            {/* Duration & Interest Level */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isMarathi ? 'कॉल कालावधी (सेकंद)' : 'Call Duration (Seconds)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={callForm.callDurationSeconds}
                  onChange={(e) => setCallForm({ ...callForm, callDurationSeconds: e.target.value })}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isMarathi ? 'इन्टरेस्ट लेव्हल (Interest)' : 'Interest Level'}
                </label>
                <select
                  value={callForm.interestLevel}
                  onChange={(e) => setCallForm({ ...callForm, interestLevel: e.target.value })}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                >
                  {validInterestLevels.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parent Response */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'पालकांचे म्हणणे / प्रतिसाद (Parent Response)' : 'Parent Response / Feedback'}
              </label>
              <textarea
                rows="2"
                placeholder={isMarathi ? 'उदा. पालक फी व निवासी हॉस्टेलबद्दल अधिक माहिती विचारत आहेत...' : 'e.g. Parent requested hostel & syllabus info...'}
                value={callForm.parentResponse}
                onChange={(e) => setCallForm({ ...callForm, parentResponse: e.target.value })}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
              ></textarea>
            </div>

            {/* Call Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'समुपदेशक नोंदी (Call Notes)' : 'Counselor Notes'}
              </label>
              <textarea
                rows="2"
                placeholder={isMarathi ? 'महत्त्वाच्या अंतर्गत नोंदी...' : 'Internal call notes...'}
                value={callForm.notes}
                onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
              ></textarea>
            </div>

            {/* Follow-up Section Toggle */}
            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={callForm.nextFollowUpRequired}
                  onChange={(e) => setCallForm({ ...callForm, nextFollowUpRequired: e.target.checked })}
                  className="rounded text-gurukul-saffron-600 focus:ring-gurukul-saffron-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">
                  {isMarathi ? 'पुढील फॉलो-अप निश्चित करायचा आहे (Schedule Next Follow-up)' : 'Schedule Next Follow-up'}
                </span>
              </label>

              {callForm.nextFollowUpRequired && (
                <div className="mt-3 p-3 bg-orange-50/70 border border-orange-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isMarathi ? 'फॉलो-अप तारीख *' : 'Follow-up Date *'}
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={callForm.nextFollowUpDate}
                        onChange={(e) => setCallForm({ ...callForm, nextFollowUpDate: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        required={callForm.nextFollowUpRequired}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isMarathi ? 'फॉलो-अप वेळ' : 'Follow-up Time'}
                      </label>
                      <input
                        type="time"
                        value={callForm.nextFollowUpTime}
                        onChange={(e) => setCallForm({ ...callForm, nextFollowUpTime: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isMarathi ? 'प्राधान्य (Priority)' : 'Priority'}
                    </label>
                    <select
                      value={callForm.followUpPriority}
                      onChange={(e) => setCallForm({ ...callForm, followUpPriority: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                    >
                      {validPriorities.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setCallModalOpen(false)}>
                {isMarathi ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="bg-gurukul-saffron-500 hover:bg-gurukul-saffron-600 text-white font-bold">
                {submitting ? (isMarathi ? 'जतन करत आहे...' : 'Saving...') : (isMarathi ? 'कॉल सेव्ह करा' : 'Save Call Record')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 2. SCHEDULE FOLLOW-UP MODAL */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title={isMarathi ? `फॉलो-अप नियोजन (#${selectedLead?.leadNumber || ''})` : `Schedule Follow-up (#${selectedLead?.leadNumber || ''})`}
      >
        {selectedLead && (
          <form onSubmit={handleSaveSchedule} className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isMarathi ? 'तारीख *' : 'Date *'}
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={scheduleForm.scheduledDate}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isMarathi ? 'वेळ' : 'Time'}
                </label>
                <input
                  type="time"
                  value={scheduleForm.scheduledTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'प्राधान्य (Priority)' : 'Priority'}
              </label>
              <select
                value={scheduleForm.priority}
                onChange={(e) => setScheduleForm({ ...scheduleForm, priority: e.target.value })}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
              >
                {validPriorities.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'फॉलो-अप विषय / नोंदी' : 'Follow-up Agenda / Notes'}
              </label>
              <textarea
                rows="3"
                placeholder={isMarathi ? 'उदा. प्रवेश निश्चित करण्यासाठी पालकांशी चर्चा करणे...' : 'e.g. Call parent to confirm admission...'}
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setScheduleModalOpen(false)}>
                {isMarathi ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="bg-gurukul-saffron-500 hover:bg-gurukul-saffron-600 text-white font-bold">
                {submitting ? (isMarathi ? 'नियोजन करत आहे...' : 'Scheduling...') : (isMarathi ? 'नियोजित करा' : 'Schedule')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 3. CALL HISTORY MODAL */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={isMarathi ? `कॉल इतिहास (#${selectedLead?.leadNumber || ''})` : `Call History (#${selectedLead?.leadNumber || ''})`}
      >
        {selectedLead && (
          <div className="space-y-3 text-left max-h-96 overflow-y-auto">
            {getLeadCalls(selectedLead.id).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8 italic">
                {isMarathi ? 'या लीडसाठी अद्याप कोणताही कॉल रेकॉर्ड नाही.' : 'No calls recorded for this lead yet.'}
              </p>
            ) : (
              getLeadCalls(selectedLead.id).map(c => (
                <div key={c.id || c.callId} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">{c.callOutcome}</span>
                    <span className="text-slate-500 text-[11px]">
                      {c.callTimestamp ? new Date(c.callTimestamp?.toDate ? c.callTimestamp.toDate() : c.callTimestamp).toLocaleString('en-IN') : ''}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-3">
                    <span>कालावधी: {c.callDurationSeconds || 0}s</span>
                    <span>इन्टरेस्ट: <strong>{c.interestLevel || 'Medium'}</strong></span>
                    <span>समुपदेशक: {c.telecallerName || 'Counselor'}</span>
                  </div>
                  {c.parentResponse && (
                    <div className="bg-white p-2 rounded-lg border border-slate-100 text-slate-700 text-[11px]">
                      <strong>प्रतिसाद:</strong> {c.parentResponse}
                    </div>
                  )}
                  {c.notes && (
                    <div className="text-slate-500 text-[11px]">
                      <strong>नोंद:</strong> {c.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};

export default TelecallerCallsPage;
