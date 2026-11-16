import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '../../contexts/CRMContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Search,
  Filter,
  Phone,
  MessageCircle,
  UserCheck,
  GraduationCap,
  Calendar,
  AlertCircle,
  Download,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  FileSpreadsheet,
  AlertTriangle,
  UserPlus,
  RefreshCw,
  CheckSquare,
  Square,
  X,
  ChevronRight,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { StatCard } from '../../components/common/StatCard';

export const AdminEnquiriesPage = () => {
  const { isMarathi } = useLanguage();
  const { userProfile, role, isSuperAdmin, isAdmin } = useAuth();
  const {
    leads,
    allLeads,
    telecallers,
    activities,
    statusConfig,
    assignLead,
    bulkAssign,
    changeLeadStatus,
    resolveDuplicate,
    exportCRMLeads
  } = useCRM();

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL');
  const [selectedTelecaller, setSelectedTelecaller] = useState('ALL');

  // Selection for bulk assignment
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetTelecallerId, setTargetTelecallerId] = useState('');
  const [assignmentReason, setAssignmentReason] = useState('');

  // Single lead action modals
  const [activeLead, setActiveLead] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const [notificationMsg, setNotificationMsg] = useState(null);

  // Available Filter Options
  const classOptions = [
    'ALL',
    'इ. 5 वी',
    'इ. 6 वी',
    'इ. 7 वी',
    'इ. 8 वी',
    'इ. 9 वी',
    'इ. 10 वी',
    'इ. 11 वी (सायन्स)',
    'इ. 12 वी (सायन्स)',
    'इ. 11 वी (आर्ट्स)',
    'इ. 12 वी (आर्ट्स)'
  ];

  const yearOptions = ['ALL', '2026-2027', '2025-2026'];

  const statusOptions = [
    'ALL',
    'New',
    'Assigned',
    'Contacted',
    'Interested',
    'Not Interested',
    'Follow-up Required',
    'Visit Scheduled',
    'Admission Applied',
    'Admission Confirmed',
    'Closed'
  ];

  // Map internal status variations to Phase 9 Standard statuses
  const normalizeStatus = (st) => {
    if (!st) return 'New';
    if (st === 'Converted' || st === 'Admitted') return 'Admission Confirmed';
    if (st === 'Follow-up' || st === 'Pending') return 'Follow-up Required';
    if (st === 'School Visit Planned' || st === 'Visited') return 'Visit Scheduled';
    if (st === 'Application Started' || st === 'Documents Pending' || st === 'Documents Verified') return 'Admission Applied';
    if (st === 'Lost') return 'Closed';
    return st;
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Monday of current week
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff)).toISOString().split('T')[0];

    // 1st of month
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    return (allLeads || leads).filter((l) => {
      // 1. Search Query
      const query = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (l.studentName && l.studentName.toLowerCase().includes(query)) ||
        (l.parentName && l.parentName.toLowerCase().includes(query)) ||
        (l.mobileNumber && l.mobileNumber.includes(query)) ||
        (l.leadNumber && l.leadNumber.toLowerCase().includes(query)) ||
        (l.admissionClass && l.admissionClass.toLowerCase().includes(query));

      if (!matchSearch) return false;

      // 2. Class Filter
      if (selectedClass !== 'ALL') {
        const cls = l.admissionClass || l.applyingClass;
        if (cls !== selectedClass) return false;
      }

      // 3. Academic Year Filter
      if (selectedYear !== 'ALL') {
        const yr = l.academicYear || '2026-2027';
        if (yr !== selectedYear) return false;
      }

      // 4. Status Filter
      if (selectedStatus !== 'ALL') {
        const norm = normalizeStatus(l.status || l.leadStatus);
        if (norm !== selectedStatus && (l.status || l.leadStatus) !== selectedStatus) return false;
      }

      // 5. Date Filter
      if (selectedDateFilter !== 'ALL') {
        const createdDate = l.createdAt ? l.createdAt.split('T')[0] : '';
        if (selectedDateFilter === 'TODAY' && createdDate !== todayStr) return false;
        if (selectedDateFilter === 'WEEK' && createdDate < monday) return false;
        if (selectedDateFilter === 'MONTH' && createdDate < firstOfMonth) return false;
      }

      // 6. Telecaller Filter
      if (selectedTelecaller !== 'ALL') {
        if (selectedTelecaller === 'UNASSIGNED') {
          if (l.assignedTo || l.assignedTelecallerId) return false;
        } else {
          if (l.assignedTo !== selectedTelecaller && l.assignedTelecallerId !== selectedTelecaller) return false;
        }
      }

      return true;
    });
  }, [allLeads, leads, searchTerm, selectedClass, selectedYear, selectedStatus, selectedDateFilter, selectedTelecaller]);

  // Statistics
  const totalCount = (allLeads || leads).length;
  const newCount = (allLeads || leads).filter(l => (l.status || l.leadStatus) === 'New').length;
  const assignedCount = (allLeads || leads).filter(l => Boolean(l.assignedTo || l.assignedTelecallerId)).length;
  const interestedCount = (allLeads || leads).filter(l => (l.status || l.leadStatus) === 'Interested').length;
  const confirmedCount = (allLeads || leads).filter(l => ['Converted', 'Admitted', 'Admission Confirmed'].includes(l.status || l.leadStatus)).length;

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id) => {
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Execute Bulk / Single Assignment
  const handleAssign = async () => {
    if (!targetTelecallerId) return;
    const leadsToAssign = activeLead ? [activeLead.id] : selectedLeadIds;
    if (leadsToAssign.length === 0) return;

    if (leadsToAssign.length === 1) {
      await assignLead(leadsToAssign[0], targetTelecallerId, assignmentReason);
    } else {
      await bulkAssign(leadsToAssign, targetTelecallerId, assignmentReason);
    }

    const tc = telecallers.find(t => (t.uid === targetTelecallerId || t.id === targetTelecallerId));
    setNotificationMsg(
      `${leadsToAssign.length} चौकशी नोंदी ${tc?.fullName || 'समुपदेशक'} यांच्याकडे यशस्वीपणे नेमल्या.`
    );
    setSelectedLeadIds([]);
    setActiveLead(null);
    setAssignModalOpen(false);
    setAssignmentReason('');
    setTargetTelecallerId('');
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Execute Status Change
  const handleStatusChange = async () => {
    if (!activeLead || !newStatus) return;
    await changeLeadStatus(activeLead.id, newStatus, statusReason);
    setNotificationMsg(`लीड ${activeLead.leadNumber} ची स्थिती '${newStatus}' मध्ये बदलली गेली.`);
    setStatusChangeModalOpen(false);
    setActiveLead(null);
    setNewStatus('');
    setStatusReason('');
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Open Details Modal
  const openLeadDetails = (lead) => {
    setActiveLead(lead);
    setDetailsModalOpen(true);
  };

  // Lead Activities Timeline
  const leadTimeline = useMemo(() => {
    if (!activeLead) return [];
    return (activities || []).filter(a => a.leadId === activeLead.id || a.leadNumber === activeLead.leadNumber);
  }, [activeLead, activities]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isMarathi ? 'प्रवेश चौकशी व्यवस्थापन (Admission Enquiries)' : 'Admission Enquiry Management'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gurukul-saffron-50 text-gurukul-saffron-700 border border-gurukul-saffron-200">
              {filteredLeads.length} {isMarathi ? 'नोंदी' : 'Records'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi
              ? 'शाळा वेबसाईट व इतर माध्यमातून आलेल्या सर्व प्रवेश चौकशींची पडताळणी, समुपदेशक वाटप व पाठपुरावा.'
              : 'Review, verify, assign to counselors, and track all admission enquiries submitted across all channels.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedLeadIds.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActiveLead(null);
                setAssignModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <UserCheck className="w-4 h-4 mr-1.5" />
              <span>{isMarathi ? `नेमणूक करा (${selectedLeadIds.length})` : `Assign (${selectedLeadIds.length})`}</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCRMLeads(filteredLeads)}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4 mr-1.5 text-slate-500" />
            <span>{isMarathi ? 'CSV निर्यात' : 'Export CSV'}</span>
          </Button>

          <Link to="/admin/leads">
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              <Users className="w-4 h-4 mr-1.5 text-gurukul-saffron-600" />
              <span>{isMarathi ? 'लीड CRM पाइपलाइन' : 'CRM Pipeline'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Notification Banner */}
      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="p-1 text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase">{isMarathi ? 'एकूण चौकशी' : 'Total Enquiries'}</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">सत्र 2026-2027</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200/80 bg-blue-50/20 shadow-sm">
          <p className="text-[11px] font-bold text-blue-700 uppercase">{isMarathi ? 'नवीन नोंदी' : 'New Enquiries'}</p>
          <p className="text-2xl font-black text-blue-900 mt-1">{newCount}</p>
          <p className="text-[10px] text-blue-600 mt-0.5">प्राथमिक संपर्क बाकी</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-200/80 bg-purple-50/20 shadow-sm">
          <p className="text-[11px] font-bold text-purple-700 uppercase">{isMarathi ? 'नेमून दिलेल्या' : 'Assigned'}</p>
          <p className="text-2xl font-black text-purple-900 mt-1">{assignedCount}</p>
          <p className="text-[10px] text-purple-600 mt-0.5">समुपदेशकांकडे सक्रिय</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-sm">
          <p className="text-[11px] font-bold text-amber-700 uppercase">{isMarathi ? 'इच्छुक पालक' : 'Interested'}</p>
          <p className="text-2xl font-black text-amber-900 mt-1">{interestedCount}</p>
          <p className="text-[10px] text-amber-600 mt-0.5">सकारात्मक प्रतिसाद</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold text-emerald-700 uppercase">{isMarathi ? 'प्रवेश निश्चित' : 'Confirmed'}</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">{confirmedCount}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">अंतिम प्रवेश झालेले</p>
        </div>
      </div>

      {/* 4. Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isMarathi ? 'विद्यार्थी, पालक नाव, मोबाईल किंवा अर्ज क्रमांक शोधा...' : 'Search by student, parent, phone or lead number...'}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Clear Button */}
          {(searchTerm || selectedClass !== 'ALL' || selectedYear !== 'ALL' || selectedStatus !== 'ALL' || selectedDateFilter !== 'ALL' || selectedTelecaller !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('ALL');
                setSelectedYear('ALL');
                setSelectedStatus('ALL');
                setSelectedDateFilter('ALL');
                setSelectedTelecaller('ALL');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'फिल्टर्स रीसेट' : 'Reset'}</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          {/* Class Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              {isMarathi ? 'इयत्ता (Class)' : 'Class'}
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/50 font-medium text-slate-700 focus:bg-white"
            >
              {classOptions.map(cls => (
                <option key={cls} value={cls}>{cls === 'ALL' ? (isMarathi ? 'सर्व इयत्ता' : 'All Classes') : cls}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              {isMarathi ? 'स्थिती (Status)' : 'Status'}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/50 font-medium text-slate-700 focus:bg-white"
            >
              {statusOptions.map(st => (
                <option key={st} value={st}>{st === 'ALL' ? (isMarathi ? 'सर्व स्थिती' : 'All Statuses') : st}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              {isMarathi ? 'तारीख (Enquiry Date)' : 'Date'}
            </label>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/50 font-medium text-slate-700 focus:bg-white"
            >
              <option value="ALL">{isMarathi ? 'सर्व तारखा (All Time)' : 'All Time'}</option>
              <option value="TODAY">{isMarathi ? 'आजचे अर्ज (Today)' : 'Today'}</option>
              <option value="WEEK">{isMarathi ? 'या आठवड्यातील (This Week)' : 'This Week'}</option>
              <option value="MONTH">{isMarathi ? 'या महिन्यातील (This Month)' : 'This Month'}</option>
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              {isMarathi ? 'शैक्षणिक वर्ष (Year)' : 'Academic Year'}
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/50 font-medium text-slate-700 focus:bg-white"
            >
              {yearOptions.map(yr => (
                <option key={yr} value={yr}>{yr === 'ALL' ? (isMarathi ? 'सर्व वर्षे' : 'All Years') : yr}</option>
              ))}
            </select>
          </div>

          {/* Counselor Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              {isMarathi ? 'समुपदेशक (Counselor)' : 'Counselor'}
            </label>
            <select
              value={selectedTelecaller}
              onChange={(e) => setSelectedTelecaller(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/50 font-medium text-slate-700 focus:bg-white"
            >
              <option value="ALL">{isMarathi ? 'सर्व समुपदेशक' : 'All Counselors'}</option>
              <option value="UNASSIGNED">{isMarathi ? 'नेमणूक बाकी (Unassigned)' : 'Unassigned'}</option>
              {telecallers.map(t => (
                <option key={t.uid || t.id} value={t.uid || t.id}>{t.fullName || t.displayName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5. Main Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-700 focus:outline-none"
                    title={selectedLeadIds.length === filteredLeads.length ? 'Unselect All' : 'Select All'}
                  >
                    {filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length ? (
                      <CheckSquare className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">{isMarathi ? 'अर्ज क्र.' : 'Lead No'}</th>
                <th className="py-3 px-4">{isMarathi ? 'विद्यार्थी नाव' : 'Student Name'}</th>
                <th className="py-3 px-4">{isMarathi ? 'पालक व संपर्क' : 'Parent & Mobile'}</th>
                <th className="py-3 px-4">{isMarathi ? 'इयत्ता' : 'Class'}</th>
                <th className="py-3 px-4">{isMarathi ? 'शैक्षणिक वर्ष' : 'Year'}</th>
                <th className="py-3 px-4">{isMarathi ? 'नोंदणी तारीख' : 'Date'}</th>
                <th className="py-3 px-4">{isMarathi ? 'समुपदेशक' : 'Assigned To'}</th>
                <th className="py-3 px-4">{isMarathi ? 'स्थिती' : 'Status'}</th>
                <th className="py-3 px-4 text-center">{isMarathi ? 'कृती' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    <UserPlus className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    {isMarathi ? 'निवडलेल्या निकषांनुसार कोणतीही प्रवेश चौकशी आढळली नाही.' : 'No admission enquiries found matching the selected filters.'}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const normalizedSt = normalizeStatus(lead.status || lead.leadStatus);
                  const isDup = lead.isDuplicate || lead.duplicateReviewStatus === 'pending_review';

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-purple-50/30' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleSelectLead(lead.id)}
                          className="text-slate-400 hover:text-slate-700 focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Lead Number */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>{lead.leadNumber || lead.id}</span>
                          {isDup && (
                            <span
                              className="w-2 h-2 rounded-full bg-amber-500 animate-ping"
                              title="Duplicate/Sibling Warning"
                            />
                          )}
                        </div>
                      </td>

                      {/* Student Name */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {lead.studentName}
                      </td>

                      {/* Parent & Contact */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{lead.parentName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <a
                            href={`tel:${lead.mobileNumber || lead.mobile}`}
                            className="text-[11px] font-mono text-slate-500 hover:text-gurukul-navy-900 flex items-center gap-0.5"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            {lead.mobileNumber || lead.mobile}
                          </a>
                          <a
                            href={`https://wa.me/91${lead.whatsappNumber || lead.mobileNumber || lead.mobile}?text=${encodeURIComponent(`नमस्कार ${lead.parentName}, गुरुकुल भोसे सैनिक पॅटर्न निवासी स्कूलमधून प्रवेशाबाबत संपर्क करत आहोत.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700"
                            title="WhatsApp Chat"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {lead.admissionClass || lead.applyingClass || '5 वी'}
                      </td>

                      {/* Academic Year */}
                      <td className="py-3 px-4 text-slate-500">
                        {lead.academicYear || '2026-2027'}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN') : '-'}
                      </td>

                      {/* Assigned Telecaller */}
                      <td className="py-3 px-4">
                        {lead.assignedTelecallerName || lead.assignedToName ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-semibold text-[11px]">
                            <UserCheck className="w-3 h-3 text-purple-600" />
                            {lead.assignedTelecallerName || lead.assignedToName}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveLead(lead);
                              setAssignModalOpen(true);
                            }}
                            className="text-[11px] font-bold text-amber-600 hover:text-amber-800 hover:underline flex items-center gap-1"
                          >
                            <span>नेमणूक करा</span>
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setActiveLead(lead);
                            setNewStatus(normalizedSt);
                            setStatusChangeModalOpen(true);
                          }}
                          className="focus:outline-none hover:opacity-85 text-left"
                          title="Click to change status"
                        >
                          <Badge size="xs" variant={normalizedSt}>
                            {normalizedSt}
                          </Badge>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openLeadDetails(lead)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="तपशील पहा (View Details)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setActiveLead(lead);
                              setTargetTelecallerId(lead.assignedTo || lead.assignedTelecallerId || '');
                              setAssignModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700"
                            title="पुनर्वाटप करा (Reassign)"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
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
      </div>

      {/* 6. Lead Assignment & Reassignment Modal */}
      {assignModalOpen && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setActiveLead(null);
          }}
          title={
            activeLead
              ? `चौकशी नेमणूक / पुनर्वाटप (${activeLead.leadNumber})`
              : `एकत्रित नेमणूक (Bulk Assign ${selectedLeadIds.length} Enquiries)`
          }
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              {activeLead
                ? `विद्यार्थी: ${activeLead.studentName} (${activeLead.admissionClass}) - पालक: ${activeLead.parentName}`
                : `निवडलेल्या ${selectedLeadIds.length} चौकशी नोंदी कोणत्या समुपदेशकाकडे सोपवायच्या आहेत ते निवडा.`}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                प्रवेश समुपदेशक निवडा (Select Telecaller) *
              </label>
              <select
                value={targetTelecallerId}
                onChange={(e) => setTargetTelecallerId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
              >
                <option value="">-- समुपदेशक निवडा --</option>
                {telecallers.map((t) => (
                  <option key={t.uid || t.id} value={t.uid || t.id}>
                    {t.fullName || t.displayName} ({t.employeeId || 'TC'}) - {t.phone || ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                नेमणूक टीप / कारण (Assignment Notes / Reason)
              </label>
              <input
                type="text"
                value={assignmentReason}
                onChange={(e) => setAssignmentReason(e.target.value)}
                placeholder="उदा. सायन्स विभाग चौकशी, पालक सांगली स्थानिक..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAssignModalOpen(false);
                  setActiveLead(null);
                }}
              >
                रद्द करा
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAssign}
                disabled={!targetTelecallerId}
                className="bg-purple-600 hover:bg-purple-700"
              >
                नेमणूक निश्चित करा
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. Status Change Modal */}
      {statusChangeModalOpen && activeLead && (
        <Modal
          isOpen={statusChangeModalOpen}
          onClose={() => {
            setStatusChangeModalOpen(false);
            setActiveLead(null);
          }}
          title={`स्थिती बदला: ${activeLead.studentName} (${activeLead.leadNumber})`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              सध्याची स्थिती: <span className="font-bold text-slate-800">{activeLead.status || activeLead.leadStatus}</span>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                नवीन स्थिती निवडा (New Status) *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
              >
                {statusOptions.filter(s => s !== 'ALL').map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                बदलाचे कारण / चर्चा टीप (Reason / Notes)
              </label>
              <textarea
                rows={3}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="उदा. पालकांशी चर्चा झाली, प्रत्यक्ष भेट देण्यास तयार..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusChangeModalOpen(false);
                  setActiveLead(null);
                }}
              >
                रद्द करा
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStatusChange}
              >
                स्थिती अद्ययावत करा
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 8. Lead Details & Timeline Modal */}
      {detailsModalOpen && activeLead && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setActiveLead(null);
          }}
          title={`प्रवेश चौकशी तपशील: ${activeLead.studentName} (${activeLead.leadNumber})`}
        >
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Student & Parent Info Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">
                  विद्यार्थी माहिती (Student Info)
                </h4>
                <p className="text-xs text-slate-700"><strong>नाव:</strong> {activeLead.studentName}</p>
                <p className="text-xs text-slate-700 mt-1"><strong>इयत्ता:</strong> {activeLead.admissionClass || activeLead.applyingClass}</p>
                <p className="text-xs text-slate-700 mt-1"><strong>शैक्षणिक वर्ष:</strong> {activeLead.academicYear || '2026-2027'}</p>
                <p className="text-xs text-slate-700 mt-1"><strong>अभ्यासक्रम:</strong> {activeLead.course || 'गुरुकुल सैनिक पॅटर्न निवासी'}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">
                  पालक संपर्क (Parent Contact)
                </h4>
                <p className="text-xs text-slate-700"><strong>पालक नाव:</strong> {activeLead.parentName}</p>
                <p className="text-xs text-slate-700 mt-1"><strong>मोबाईल:</strong> {activeLead.mobileNumber || activeLead.mobile}</p>
                <p className="text-xs text-slate-700 mt-1"><strong>WhatsApp:</strong> {activeLead.whatsappNumber || activeLead.mobileNumber || '-'}</p>
                <p className="text-xs text-slate-700 mt-1"><strong>ईमेल:</strong> {activeLead.email || 'उपलब्ध नाही'}</p>
                <p className="text-xs text-slate-700 mt-1"><strong>पत्ता:</strong> {activeLead.address || activeLead.city || 'मिरज/सांगली'}</p>
              </div>
            </div>

            {/* Status & Assigned Staff */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 border border-purple-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-700">नियुक्त समुपदेशक:</span>
                <p className="text-xs font-bold text-purple-950 mt-0.5">
                  {activeLead.assignedTelecallerName || activeLead.assignedToName || 'नेमणूक झालेली नाही'}
                </p>
              </div>
              <div>
                <Badge variant={normalizeStatus(activeLead.status || activeLead.leadStatus)}>
                  {normalizeStatus(activeLead.status || activeLead.leadStatus)}
                </Badge>
              </div>
            </div>

            {/* Enquiry Message */}
            {activeLead.message && (
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-800">पालकांचा संदेश:</span>
                <p className="text-xs text-amber-950 mt-1 italic">"{activeLead.message}"</p>
              </div>
            )}

            {/* Activity History Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1.5 mb-3">
                कृती व संपर्क इतिहास (Activity Timeline)
              </h4>
              {leadTimeline.length === 0 ? (
                <p className="text-xs text-slate-400 italic">अद्याप कोणताही संपर्क इतिहास नोंदवलेला नाही.</p>
              ) : (
                <div className="space-y-2.5">
                  {leadTimeline.map((act) => (
                    <div key={act.id} className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-gurukul-saffron-500 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800">{act.activityType || 'Activity'}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {act.createdAt ? new Date(act.createdAt).toLocaleString('en-IN') : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                        <p className="text-[10px] text-slate-400 mt-1">नोंदवणारा: {act.performedByRole || 'Staff'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <a
                href={`tel:${activeLead.mobileNumber || activeLead.mobile}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gurukul-navy-900 hover:underline"
              >
                <Phone className="w-4 h-4 text-gurukul-saffron-500" />
                <span>पालकांना कॉल करा</span>
              </a>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDetailsModalOpen(false);
                  setTargetTelecallerId(activeLead.assignedTo || activeLead.assignedTelecallerId || '');
                  setAssignModalOpen(true);
                }}
              >
                समुपदेशक बदला
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
