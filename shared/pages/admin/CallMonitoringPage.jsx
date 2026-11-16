import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneCall, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Filter, 
  Download, 
  Search, 
  Calendar, 
  ChevronRight, 
  Eye, 
  UserCheck, 
  Phone, 
  RotateCcw, 
  FileText, 
  Sparkles,
  GraduationCap,
  X,
  PhoneOff,
  Edit3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCRM } from '../../contexts/CRMContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const CallMonitoringPage = () => {
  const { isMarathi } = useLanguage();
  const { 
    allCalls, 
    allFollowUps, 
    allLeads, 
    telecallers, 
    assignLead, 
    rescheduleFollowUp, 
    completeFollowUp,
    exportCallMonitoringCSV,
    validCallOutcomes,
    validPriorities 
  } = useCRM();

  // Active Tab: 'calls' | 'followups'
  const [activeTab, setActiveTab] = useState('calls');

  // Filters State
  const [selectedTelecaller, setSelectedTelecaller] = useState('ALL');
  const [selectedOutcome, setSelectedOutcome] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL'); // 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'
  const [searchTerm, setSearchTerm] = useState('');

  // Modals State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // Selected call or follow-up
  const [newTelecallerId, setNewTelecallerId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  const [rescheduleForm, setRescheduleForm] = useState({
    newScheduledDate: '',
    newScheduledTime: '11:00',
    newPriority: 'Medium',
    reason: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // 1. KPI Calculations (Section 9)
  const totalCalls = allCalls.length;
  const callsToday = allCalls.filter(c => (c.callTimestamp || c.createdAt || '').startsWith(todayStr)).length;
  const connectedCalls = allCalls.filter(c => c.callOutcome === 'Connected').length;
  const missedCalls = allCalls.filter(c => ['No Answer', 'Busy', 'Switched Off', 'Invalid Number'].includes(c.callOutcome)).length;

  const totalFollowUps = allFollowUps.length;
  const pendingFollowUps = allFollowUps.filter(f => f.status === 'Scheduled' || f.status === 'Rescheduled').length;
  const overdueFollowUps = allFollowUps.filter(f => f.status !== 'Completed' && f.status !== 'Cancelled' && f.scheduledDate < todayStr).length;
  const completedFollowUps = allFollowUps.filter(f => f.status === 'Completed').length;
  const convertedAdmissions = allLeads.filter(l => l.leadStatus === 'Admitted' || l.leadStatus === 'Converted').length;

  // Filtered Calls
  const filteredCalls = useMemo(() => {
    return allCalls.filter(c => {
      if (selectedTelecaller !== 'ALL' && c.telecallerId !== selectedTelecaller) return false;
      if (selectedOutcome !== 'ALL' && c.callOutcome !== selectedOutcome) return false;
      if (dateRange === 'TODAY' && !(c.callTimestamp || c.createdAt || '').startsWith(todayStr)) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const lNum = (c.leadNumber || '').toLowerCase();
        const tName = (c.telecallerName || '').toLowerCase();
        const notes = (c.notes || '').toLowerCase();
        if (!lNum.includes(q) && !tName.includes(q) && !notes.includes(q)) return false;
      }

      return true;
    });
  }, [allCalls, selectedTelecaller, selectedOutcome, dateRange, searchTerm, todayStr]);

  // Filtered Follow-ups
  const filteredFollowUps = useMemo(() => {
    return allFollowUps.filter(f => {
      if (selectedTelecaller !== 'ALL' && f.assignedTo !== selectedTelecaller) return false;
      if (selectedPriority !== 'ALL' && f.priority !== selectedPriority) return false;
      if (selectedStatus !== 'ALL' && f.status !== selectedStatus) return false;
      if (dateRange === 'TODAY' && f.scheduledDate !== todayStr) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const lNum = (f.leadNumber || '').toLowerCase();
        const sName = (f.studentName || '').toLowerCase();
        const pName = (f.parentName || '').toLowerCase();
        const tName = (f.assignedTelecallerName || '').toLowerCase();
        if (!lNum.includes(q) && !sName.includes(q) && !pName.includes(q) && !tName.includes(q)) return false;
      }

      return true;
    });
  }, [allFollowUps, selectedTelecaller, selectedPriority, selectedStatus, dateRange, searchTerm, todayStr]);

  // Handle CSV Export
  const handleExportCSV = () => {
    const res = exportCallMonitoringCSV(filteredCalls, filteredFollowUps);
    if (res.success) {
      showNotification(isMarathi ? 'कॉल व फॉलो-अप रिपोर्ट CSV डाऊनलोड झाली!' : 'Call & Follow-up Report exported to CSV!');
    }
  };

  // Reassign Telecaller
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!newTelecallerId) {
      alert(isMarathi ? 'कृपया समुपदेशक निवडा.' : 'Please select telecaller.');
      return;
    }
    setSubmitting(true);
    const res = await assignLead(selectedItem.leadId, newTelecallerId, reassignReason || 'Reassigned from Admin Call Monitoring');
    setSubmitting(false);

    if (res.success) {
      showNotification(isMarathi ? 'समुपदेशक यशस्वीरीत्या पुनर्नियुक्त केला!' : 'Telecaller reassigned successfully!');
      setReassignModalOpen(false);
    } else {
      alert(res.error || 'Failed to reassign');
    }
  };

  // Reschedule Follow-up
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleForm.newScheduledDate) {
      alert(isMarathi ? 'कृपया तारीख निवडा.' : 'Please select date.');
      return;
    }
    if (!rescheduleForm.reason.trim()) {
      alert(isMarathi ? 'कृपया कारण लिहा.' : 'Please enter reschedule reason.');
      return;
    }

    setSubmitting(true);
    const res = await rescheduleFollowUp({
      followUpId: selectedItem.id || selectedItem.followUpId,
      leadId: selectedItem.leadId,
      newScheduledDate: rescheduleForm.newScheduledDate,
      newScheduledTime: rescheduleForm.newScheduledTime,
      newPriority: rescheduleForm.newPriority,
      reason: `Admin Reschedule: ${rescheduleForm.reason}`
    });
    setSubmitting(false);

    if (res.success) {
      showNotification(isMarathi ? 'फॉलो-अप तारीख बदलण्यात आली!' : 'Follow-up rescheduled by Admin!');
      setRescheduleModalOpen(false);
    } else {
      alert(res.error || 'Failed to reschedule');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gurukul-saffron-600 uppercase tracking-wider">
            <PhoneCall className="w-4 h-4" />
            <span>{isMarathi ? 'प्रवेश संवाद नियंत्रण' : 'CALL MONITORING & FOLLOW-UPS'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gurukul-navy-950 mt-1">
            {isMarathi ? 'कॉल मॉनिटरिंग व फॉलो-अप व्यवस्थापन' : 'Call Monitoring & Follow-up Management'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isMarathi 
              ? 'सर्व समुपदेशकांच्या दैनिक कॉलिंग नोंदी, संभाषण परिणाम व फॉलो-अप रांगेचे थेट निरीक्षण.' 
              : 'Real-time oversight of all telecaller calling activity, call outcomes, and follow-up queues.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs font-bold border-slate-300 hover:bg-slate-50"
          >
            <Download className="w-4 h-4 text-gurukul-saffron-600" />
            <span>{isMarathi ? 'CSV रिपोर्ट डाऊनलोड' : 'Export CSV Report'}</span>
          </Button>
          <Link to="/admin/telecaller-performance">
            <Button variant="primary" size="md" className="bg-gurukul-navy-900 hover:bg-gurukul-navy-800 text-white text-xs font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{isMarathi ? 'समुपदेशक कार्यक्षमता' : 'Telecaller Performance'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 9 Admin KPI Summary Cards (Section 9) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title={isMarathi ? 'एकूण कॉल्स' : 'Total Calls'}
          value={totalCalls}
          icon={PhoneCall}
          color="navy"
          subtitle={isMarathi ? 'नोंदवलेले कॉल्स' : 'All call records'}
        />

        <StatCard
          title={isMarathi ? 'आजचे कॉल्स' : 'Calls Today'}
          value={callsToday}
          icon={Phone}
          color="amber"
          subtitle={isMarathi ? 'आज झालेले कॉल्स' : 'Calls recorded today'}
        />

        <StatCard
          title={isMarathi ? 'यशस्वी कॉल्स' : 'Connected Calls'}
          value={connectedCalls}
          icon={CheckCircle2}
          color="emerald"
          subtitle={isMarathi ? 'पालकांशी थेट चर्चा' : 'Parent connected'}
        />

        <StatCard
          title={isMarathi ? 'अनुत्तरित / व्यस्त' : 'Missed Calls'}
          value={missedCalls}
          icon={PhoneOff}
          color="rose"
          subtitle={isMarathi ? 'व्यस्त / प्रतिसाद नाही' : 'Busy or no answer'}
        />

        <StatCard
          title={isMarathi ? 'एकूण फॉलो-अप्स' : 'Total Follow-ups'}
          value={totalFollowUps}
          icon={Calendar}
          color="purple"
          subtitle={isMarathi ? 'नियोजित संपर्क' : 'All scheduled queues'}
        />

        <StatCard
          title={isMarathi ? 'प्रलंबित फॉलो-अप्स' : 'Pending Follow-ups'}
          value={pendingFollowUps}
          icon={Clock}
          color="amber"
          subtitle={isMarathi ? 'नियोजन बाकी' : 'Awaiting completion'}
        />

        <StatCard
          title={isMarathi ? 'थकबाकी फॉलो-अप्स' : 'Overdue Follow-ups'}
          value={overdueFollowUps}
          icon={AlertTriangle}
          color="rose"
          subtitle={isMarathi ? 'वेळ उलटून गेलेले' : 'Requires urgent action'}
        />

        <StatCard
          title={isMarathi ? 'पूर्ण फॉलो-अप्स' : 'Completed Follow-ups'}
          value={completedFollowUps}
          icon={CheckCircle2}
          color="emerald"
          subtitle={isMarathi ? 'यशस्वीरीत्या संपवले' : 'Finished follow-ups'}
        />

        <StatCard
          title={isMarathi ? 'निश्चित प्रवेश' : 'Converted Leads'}
          value={convertedAdmissions}
          icon={GraduationCap}
          color="emerald"
          subtitle={isMarathi ? 'अंतिम प्रवेश' : 'Admissions secured'}
        />
      </div>

      {/* Tabs & Deep Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('calls')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'calls'
                  ? 'bg-gurukul-navy-950 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>{isMarathi ? 'कॉल इतिहास नोंदवही (Call Logs)' : 'Call Records'} ({filteredCalls.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('followups')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'followups'
                  ? 'bg-gurukul-navy-950 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{isMarathi ? 'फॉलो-अप रांग (Follow-up Queue)' : 'Follow-up Queue'} ({filteredFollowUps.length})</span>
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={isMarathi ? 'लीड #, विद्यार्थी, समुपदेशक किंवा नोंद...' : 'Search lead, student or telecaller...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">समुपदेशक (Telecaller)</label>
            <select
              value={selectedTelecaller}
              onChange={(e) => setSelectedTelecaller(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium"
            >
              <option value="ALL">सर्व समुपदेशक (All Telecallers)</option>
              {telecallers.map(t => (
                <option key={t.uid || t.id} value={t.uid || t.id}>{t.fullName || t.displayName}</option>
              ))}
            </select>
          </div>

          {activeTab === 'calls' ? (
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">कॉल निष्कर्ष (Call Outcome)</label>
              <select
                value={selectedOutcome}
                onChange={(e) => setSelectedOutcome(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium"
              >
                <option value="ALL">सर्व निष्कर्ष (All Outcomes)</option>
                {validCallOutcomes.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">प्राधान्य (Priority)</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium"
              >
                <option value="ALL">सर्व प्राधान्य (All Priorities)</option>
                {validPriorities.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">कालावधी (Date Filter)</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium"
            >
              <option value="ALL">सर्व नोंदी (All Time)</option>
              <option value="TODAY">केवळ आज (Today Only)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedTelecaller('ALL');
                setSelectedOutcome('ALL');
                setSelectedPriority('ALL');
                setSelectedStatus('ALL');
                setDateRange('ALL');
                setSearchTerm('');
              }}
              className="w-full py-2 px-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition text-center"
            >
              रीसेट करा (Reset Filters)
            </button>
          </div>
        </div>

      </div>

      {/* TAB 1: CALL MONITORING TABLE */}
      {activeTab === 'calls' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">लीड क्रमांक</th>
                  <th className="px-4 py-3">समुपदेशक</th>
                  <th className="px-4 py-3">कॉल वेळ व कालावधी</th>
                  <th className="px-4 py-3">कॉल निष्कर्ष</th>
                  <th className="px-4 py-3">पालक प्रतिसाद व नोंद</th>
                  <th className="px-4 py-3">पुढील फॉलो-अप</th>
                  <th className="px-4 py-3 text-right">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCalls.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      कोणत्याही कॉल नोंदी सापडल्या नाहीत.
                    </td>
                  </tr>
                ) : (
                  filteredCalls.map(c => {
                    const callDate = c.callTimestamp || c.createdAt;
                    return (
                      <tr key={c.id || c.callId} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <span className="font-bold text-gurukul-navy-950 block">{c.leadNumber}</span>
                          <span className="text-[10px] text-slate-400">{c.leadId}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800 block">{c.telecallerName || 'Counselor'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">
                            {callDate ? new Date(callDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {callDate ? new Date(callDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''} 
                            {c.callDurationSeconds ? ` • ${Math.floor(c.callDurationSeconds / 60)}m ${c.callDurationSeconds % 60}s` : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.callOutcome === 'Connected' ? 'bg-emerald-100 text-emerald-800' :
                            c.callOutcome === 'Interested' ? 'bg-amber-100 text-amber-800' :
                            c.callOutcome === 'Admission Confirmed' ? 'bg-green-100 text-green-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {c.callOutcome}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                          {c.notes || c.parentResponse || '—'}
                        </td>
                        <td className="px-4 py-3">
                          {c.nextFollowUpDate ? (
                            <div>
                              <span className="font-bold text-slate-800 block">{c.nextFollowUpDate}</span>
                              <span className="text-[10px] text-slate-400">{c.nextFollowUpTime || '10:00'}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link to={`/admin/leads/${c.leadId}`}>
                            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="View Lead">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FOLLOW-UP QUEUE TABLE */}
      {activeTab === 'followups' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">लीड व विद्यार्थी</th>
                  <th className="px-4 py-3">पालक व संपर्क</th>
                  <th className="px-4 py-3">समुपदेशक</th>
                  <th className="px-4 py-3">नियोजित वेळ</th>
                  <th className="px-4 py-3">प्राधान्य</th>
                  <th className="px-4 py-3">स्थिती</th>
                  <th className="px-4 py-3 text-right">व्यवस्थापक कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFollowUps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      कोणतीही फॉलो-अप रांग सापडली नाही.
                    </td>
                  </tr>
                ) : (
                  filteredFollowUps.map(fu => {
                    const isOverdue = fu.status !== 'Completed' && fu.scheduledDate < todayStr;
                    return (
                      <tr key={fu.id || fu.followUpId} className={`hover:bg-slate-50 transition ${isOverdue ? 'bg-rose-50/20' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{fu.studentName || 'Student'}</div>
                          <div className="text-[10px] text-gurukul-saffron-600 font-bold">{fu.leadNumber}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{fu.parentName}</div>
                          <div className="text-[10px] text-slate-400">{fu.mobileNumber}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800">{fu.assignedTelecallerName || 'Unassigned'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{fu.scheduledDate}</div>
                          <div className="text-[10px] text-slate-400">{fu.scheduledTime || '10:00'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            fu.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                            fu.priority === 'Medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {fu.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {fu.status === 'Completed' ? (
                            <Badge size="xs" variant="Confirmed">Completed</Badge>
                          ) : isOverdue ? (
                            <Badge size="xs" variant="Lost">Overdue</Badge>
                          ) : (
                            <Badge size="xs" variant="Interested">Scheduled</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                          <Link to={`/admin/leads/${fu.leadId}`}>
                            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="View Lead">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedItem(fu);
                              setNewTelecallerId(fu.assignedTo || '');
                              setReassignReason('');
                              setReassignModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded text-gurukul-navy-900"
                            title="Reassign Telecaller"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(fu);
                              setRescheduleForm({
                                newScheduledDate: fu.scheduledDate,
                                newScheduledTime: fu.scheduledTime || '11:00',
                                newPriority: fu.priority || 'Medium',
                                reason: ''
                              });
                              setRescheduleModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded text-amber-700"
                            title="Reschedule Follow-up"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: REASSIGN TELECALLER */}
      <Modal
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        title={isMarathi ? 'लीड समुपदेशक बदला (Reassign Telecaller)' : 'Reassign Telecaller'}
        size="md"
      >
        <form onSubmit={handleReassignSubmit} className="space-y-4 text-xs">
          <p className="text-slate-600">
            विद्यार्थी: <strong>{selectedItem?.studentName}</strong> ({selectedItem?.leadNumber})
          </p>

          <div>
            <label className="font-bold text-slate-700 block mb-1">नवीन समुपदेशक निवडा *</label>
            <select
              required
              value={newTelecallerId}
              onChange={(e) => setNewTelecallerId(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg font-semibold"
            >
              <option value="">-- समुपदेशक निवडा --</option>
              {telecallers.map(t => (
                <option key={t.uid || t.id} value={t.uid || t.id}>
                  {t.fullName || t.displayName} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">पुनर्नियुक्तीचे कारण (Audit Reason)</label>
            <textarea
              rows={3}
              placeholder="उदा. कार्यभार संतुलन किंवा पालकांची विनंती..."
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReassignModalOpen(false)}
            >
              रद्द करा
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              className="bg-gurukul-navy-950 hover:bg-gurukul-navy-900 text-white"
            >
              {submitting ? 'अद्ययावत करत आहे...' : 'समुपदेशक बदला'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADMIN RESCHEDULE */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title={isMarathi ? 'अ‍ॅडमिन फॉलो-अप तारीख बदला' : 'Admin Reschedule Follow-up'}
        size="md"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">नवीन तारीख *</label>
              <input
                type="date"
                min={todayStr}
                required
                value={rescheduleForm.newScheduledDate}
                onChange={(e) => setRescheduleForm(prev => ({ ...prev, newScheduledDate: e.target.value }))}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">नवीन वेळ *</label>
              <input
                type="time"
                required
                value={rescheduleForm.newScheduledTime}
                onChange={(e) => setRescheduleForm(prev => ({ ...prev, newScheduledTime: e.target.value }))}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">तारीख बदलण्याचे अधिकृत कारण * (Audit Trail)</label>
            <textarea
              rows={3}
              required
              placeholder="उदा. मुख्याध्यापकांच्या सूचनेनुसार तारीख पुढे ढकलली..."
              value={rescheduleForm.reason}
              onChange={(e) => setRescheduleForm(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRescheduleModalOpen(false)}
            >
              रद्द करा
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {submitting ? 'अद्ययावत करत आहे...' : 'शेड्युल अद्ययावत करा'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
export default CallMonitoringPage;
