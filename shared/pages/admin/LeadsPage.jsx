import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCRM } from '../../contexts/CRMContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  MessageCircle, 
  UserCheck, 
  GraduationCap, 
  Calendar, 
  AlertCircle, 
  ChevronRight, 
  ExternalLink,
  PhoneCall,
  Download,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  X,
  HelpCircle,
  Eye,
  FileSpreadsheet,
  AlertTriangle,
  UserPlus,
  ArrowUpDown,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { StatCard } from '../../components/common/StatCard';
import { useLanguage } from '../../contexts/LanguageContext';

export const LeadsPage = () => {
  const { isMarathi } = useLanguage();
  const navigate = useNavigate();
  const { 
    leads, 
    allLeads,
    telecallers, 
    analytics,
    statusConfig,
    statusList,
    permittedTransitions,
    addLead, 
    updateLead, 
    assignLead, 
    bulkAssign,
    changeLeadStatus,
    logCallAttempt,
    convertLeadToAdmission,
    exportCRMLeads,
    resolveDuplicate
  } = useCRM();

  const { isTelecaller, isAdmin, isSuperAdmin, userProfile } = useAuth();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [telecallerFilter, setTelecallerFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Bulk Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);
  const [bulkTelecallerId, setBulkTelecallerId] = useState('');
  const [bulkReason, setBulkReason] = useState('');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [assignModalLead, setAssignModalLead] = useState(null);
  const [selectedTelecaller, setSelectedTelecaller] = useState('');
  const [assignmentReason, setAssignmentReason] = useState('');

  const [statusModalLead, setStatusModalLead] = useState(null);
  const [quickNewStatus, setQuickNewStatus] = useState('');
  const [statusChangeReason, setStatusChangeReason] = useState('');

  const [callModalLead, setCallModalLead] = useState(null);
  const [callForm, setCallForm] = useState({
    callOutcome: 'Connected / Discussed',
    parentResponse: '',
    nextFollowupAt: '',
    statusChange: ''
  });

  const [duplicateModalLead, setDuplicateModalLead] = useState(null);

  // Manual entry form
  const [newLeadForm, setNewLeadForm] = useState({
    parentName: '',
    studentName: '',
    mobileNumber: '',
    whatsappNumber: '',
    sameAsMobile: true,
    email: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pinCode: '',
    dob: '',
    gender: 'Male',
    currentSchool: '',
    currentClass: 'इ. 4 वी (4th Std)',
    admissionClass: 'इ. 5 वी (5th Std)',
    academicYear: '2026-2027',
    course: 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)',
    source: 'Manual Entry',
    preferredContactTime: 'Anytime',
    adminRemarks: '',
    assignedTo: '',
    status: 'New'
  });
  const [addError, setAddError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtering logic
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q ||
        (l.studentName || '').toLowerCase().includes(q) ||
        (l.parentName || '').toLowerCase().includes(q) ||
        (l.normalizedMobile || l.mobileNumber || l.mobile || '').includes(q) ||
        (l.leadNumber || '').toLowerCase().includes(q) ||
        (l.city || '').toLowerCase().includes(q);

      const st = l.status || l.leadStatus || 'New';
      const matchesStatus = statusFilter === 'ALL' || st === statusFilter;

      const src = l.source || l.leadSource || 'Website';
      const matchesSource = sourceFilter === 'ALL' || src === sourceFilter;

      const cls = l.admissionClass || '';
      const matchesClass = classFilter === 'ALL' || cls.includes(classFilter) || cls === classFilter;

      const yr = l.academicYear || '2026-2027';
      const matchesYear = yearFilter === 'ALL' || yr === yearFilter;

      const tc = l.assignedTo || l.assignedTelecallerId || '';
      const matchesTelecaller = telecallerFilter === 'ALL' || 
        (telecallerFilter === 'UNASSIGNED' ? !tc : tc === telecallerFilter);

      let matchesDate = true;
      if (startDate || endDate) {
        const leadDate = new Date(l.createdAt?.toDate ? l.createdAt.toDate() : l.createdAt);
        if (!isNaN(leadDate)) {
          if (startDate && leadDate < new Date(`${startDate}T00:00:00`)) matchesDate = false;
          if (endDate && leadDate > new Date(`${endDate}T23:59:59`)) matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesSource && matchesClass && matchesYear && matchesTelecaller && matchesDate;
    });
  }, [leads, searchTerm, statusFilter, sourceFilter, classFilter, yearFilter, telecallerFilter, startDate, endDate]);

  // Sorting
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'createdAt') {
        const dateA = new Date(a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt || 0);
        const dateB = new Date(b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt || 0);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLeads, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedLeads.slice(start, start + itemsPerPage);
  }, [sortedLeads, currentPage, itemsPerPage]);

  // Ref for the header checkbox to support indeterminate state and clean DOM syncing
  const headerCheckboxRef = useRef(null);

  // Helper to get lead ID consistently
  const getLeadId = (l) => l?.id || l?.leadId || '';

  // Check if all currently paginated leads are selected
  const allPaginatedSelected = useMemo(() => {
    if (!paginatedLeads || paginatedLeads.length === 0) return false;
    return paginatedLeads.every(l => {
      const lid = getLeadId(l);
      return lid && selectedLeadIds.includes(lid);
    });
  }, [paginatedLeads, selectedLeadIds]);

  // Sync indeterminate state on the header checkbox
  useEffect(() => {
    if (headerCheckboxRef.current) {
      const isSomeSelected = selectedLeadIds.length > 0 && !allPaginatedSelected;
      headerCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [selectedLeadIds, allPaginatedSelected]);

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      const currentIds = paginatedLeads.map(l => getLeadId(l)).filter(Boolean);
      setSelectedLeadIds(prev => Array.from(new Set([...prev, ...currentIds])));
    } else {
      const currentIds = new Set(paginatedLeads.map(l => getLeadId(l)));
      setSelectedLeadIds(prev => prev.filter(id => !currentIds.has(id)));
    }
  };

  const handleSelectOne = (leadOrId) => {
    const id = typeof leadOrId === 'string' ? leadOrId : getLeadId(leadOrId);
    if (!id) return;
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Dedicated Cancel Selection Handler that guarantees clean deselect across state and DOM
  const handleCancelSelection = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedLeadIds([]);
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.checked = false;
      headerCheckboxRef.current.indeterminate = false;
    }
  };

  const handleBulkAssignSubmit = async (e) => {
    e.preventDefault();
    if (!bulkTelecallerId || selectedLeadIds.length === 0) return;
    await bulkAssign(selectedLeadIds, bulkTelecallerId, bulkReason);
    setBulkAssignModalOpen(false);
    setSelectedLeadIds([]);
    setBulkTelecallerId('');
    setBulkReason('');
  };

  // Create Manual Lead Submit
  const handleCreateLead = async (e) => {
    e.preventDefault();
    setAddError(null);
    setIsSubmitting(true);

    try {
      const res = await addLead(newLeadForm);
      if (res.success) {
        setAddModalOpen(false);
        setNewLeadForm({
          parentName: '',
          studentName: '',
          mobileNumber: '',
          whatsappNumber: '',
          sameAsMobile: true,
          email: '',
          address: '',
          city: '',
          state: 'Maharashtra',
          pinCode: '',
          dob: '',
          gender: 'Male',
          currentSchool: '',
          currentClass: 'इ. 4 वी (4th Std)',
          admissionClass: 'इ. 5 वी (5th Std)',
          academicYear: '2026-2027',
          course: 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)',
          source: 'Manual Entry',
          preferredContactTime: 'Anytime',
          adminRemarks: '',
          assignedTo: '',
          status: 'New'
        });
      } else {
        setAddError(res.message || 'नोंदणी करताना त्रुटी आढळली.');
      }
    } catch (err) {
      setAddError(err.message || 'सर्व्हर त्रुटी.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Individual Assign Submit
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignModalLead || !selectedTelecaller) return;
    await assignLead(assignModalLead.id, selectedTelecaller, assignmentReason);
    setAssignModalLead(null);
    setSelectedTelecaller('');
    setAssignmentReason('');
  };

  // Status Change Submit
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalLead || !quickNewStatus) return;
    await changeLeadStatus(statusModalLead.id, quickNewStatus, statusChangeReason);
    setStatusModalLead(null);
    setQuickNewStatus('');
    setStatusChangeReason('');
  };

  // Call Note Submit
  const handleCallSubmit = async (e) => {
    e.preventDefault();
    if (!callModalLead) return;
    await logCallAttempt(callModalLead.id, callForm);
    setCallModalLead(null);
    setCallForm({
      callOutcome: 'Connected / Discussed',
      parentResponse: '',
      nextFollowupAt: '',
      statusChange: ''
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    exportCRMLeads(filteredLeads);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header & Primary Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900 tracking-tight">
              {isMarathi ? 'प्रवेश नोंदणी व लीड व्यवस्थापन (Admission CRM)' : 'Admission Lead Management (CRM)'}
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-gurukul-saffron-800 border border-orange-200 shrink-0">
              {leads.length} {isMarathi ? 'एकूण लीड्स' : 'Total Leads'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi 
              ? 'वेबसाईट, थेट संपर्क, फेसबुक ऍड्स व फोनवरून आलेली सर्व प्रवेश विचारणा माहिती' 
              : 'All admission inquiries captured from website, direct walk-ins, phone calls and Meta ads'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* CSV Export Button (Role-Authorized) */}
          {isAdmin && (
            <Button
              variant="outline"
              size="md"
              onClick={handleExportCSV}
              className="text-xs rounded-xl shadow-sm border-slate-300"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
              <span>{isMarathi ? `CSV निर्यात करा (${filteredLeads.length})` : `Export CSV (${filteredLeads.length})`}</span>
            </Button>
          )}

          {/* Create Manual Lead */}
          {isAdmin && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setAddModalOpen(true)}
              className="text-xs rounded-xl shadow-md bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>{isMarathi ? 'नवीन नोंदणी जोडा (Manual Entry)' : 'Add New Lead (Manual Entry)'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Analytics - 10 Core Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-3.5">
        <StatCard
          title={isMarathi ? 'एकूण नोंदणी (Total)' : 'Total Enquiries'}
          value={analytics.totalEnquiries}
          icon={Users}
          color="navy"
          subtitle={isMarathi ? 'सर्व प्रवेश चौकशी' : 'All Inquiries'}
        />
        <StatCard
          title={isMarathi ? 'नवीन लीड्स (New)' : 'New Leads'}
          value={analytics.newLeads}
          icon={UserPlus}
          color="blue"
          subtitle={isMarathi ? 'अद्याप संपर्क बाकी' : 'Awaiting Contact'}
        />
        <StatCard
          title={isMarathi ? 'नेमणूक झालेल्या (Assigned)' : 'Assigned Leads'}
          value={analytics.assignedLeads}
          icon={UserCheck}
          color="purple"
          subtitle={isMarathi ? 'समुपदेशकाकडे वाटप' : 'Under Counselors'}
        />
        <StatCard
          title={isMarathi ? 'विनावाटप (Unassigned)' : 'Unassigned'}
          value={analytics.unassignedLeads}
          icon={Clock}
          color="amber"
          subtitle={isMarathi ? 'नेमणूक बाकी' : 'Needs Assignment'}
        />
        <StatCard
          title={isMarathi ? 'संपर्क साधलेल्या (Contacted)' : 'Contacted'}
          value={analytics.contactedLeads}
          icon={Phone}
          color="sky"
          subtitle={isMarathi ? 'प्राथमिक चर्चा पूर्ण' : 'Initial Contact Done'}
        />
        <StatCard
          title={isMarathi ? 'इच्छुक पालक (Interested)' : 'Interested'}
          value={analytics.interestedLeads}
          icon={Sparkles}
          color="amber"
          subtitle={isMarathi ? 'सकारात्मक प्रतिसाद' : 'Positive Response'}
        />
        <StatCard
          title={isMarathi ? 'फॉलो-अप बाकी (Follow-ups)' : 'Follow-ups Due'}
          value={analytics.pendingFollowUps}
          icon={Calendar}
          color="orange"
          subtitle={isMarathi ? 'पुढील तारीख नियोजित' : 'Scheduled Follow-up'}
        />
        <StatCard
          title={isMarathi ? 'शाळेस भेट (Visited)' : 'Campus Visited'}
          value={analytics.visitedLeads}
          icon={GraduationCap}
          color="indigo"
          subtitle={isMarathi ? 'कॅम्पस भेट झाली' : 'Visit Completed'}
        />
        <StatCard
          title={isMarathi ? 'प्रवेश निश्चित (Converted)' : 'Converted / Admitted'}
          value={analytics.convertedLeads}
          icon={CheckCircle2}
          color="emerald"
          subtitle={isMarathi ? 'प्रवेश पूर्ण झाला' : 'Admission Confirmed'}
        />
        <StatCard
          title={isMarathi ? 'प्रवेश गमावला (Lost)' : 'Lost / Dropped'}
          value={analytics.lostLeads}
          icon={XCircle}
          color="rose"
          subtitle={isMarathi ? 'अनिच्छुक किंवा रद्द' : 'Declined / Dropped'}
        />
      </div>

      {/* 3. Distribution Overview Strip */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs min-w-0">
        <div className="border-r border-slate-100 pr-3 min-w-0">
          <span className="text-slate-400 block text-[11px] font-medium truncate">{isMarathi ? 'आजची नोंदणी (Today):' : "Today's Enquiries:"}</span>
          <span className="text-lg font-black text-slate-800">{analytics.enquiriesToday} {isMarathi ? 'अर्ज' : 'Leads'}</span>
        </div>
        <div className="border-r border-slate-100 pr-3 min-w-0">
          <span className="text-slate-400 block text-[11px] font-medium truncate">{isMarathi ? 'या आठवड्यातील (This Week):' : 'This Week:'}</span>
          <span className="text-lg font-black text-slate-800">{analytics.enquiriesThisWeek} {isMarathi ? 'अर्ज' : 'Leads'}</span>
        </div>
        <div className="border-r border-slate-100 pr-3 min-w-0">
          <span className="text-slate-400 block text-[11px] font-medium truncate">{isMarathi ? 'या महिन्यातील (This Month):' : 'This Month:'}</span>
          <span className="text-lg font-black text-slate-800">{analytics.enquiriesThisMonth} {isMarathi ? 'अर्ज' : 'Leads'}</span>
        </div>
        <div className="min-w-0">
          <span className="text-slate-400 block text-[11px] font-medium truncate">{isMarathi ? 'प्रवेश रूपांतरण दर (Conversion Rate):' : 'Conversion Rate:'}</span>
          <span className="text-lg font-black text-emerald-600">{analytics.conversionRate}</span>
        </div>
      </div>

      {/* 4. Search & Multi-Criteria Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder={isMarathi ? "नाव, मोबाईल, लीड नंबर किंवा गाव शोधा..." : "Search name, phone, lead ID, village..."}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none min-w-0"
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-0">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium min-w-0"
            >
              <option value="ALL">{isMarathi ? 'सर्व स्थिती (All Status)' : 'All Statuses'}</option>
              {statusList.map(st => (
                <option key={st} value={st}>{isMarathi ? (statusConfig[st]?.labelMr || st) : (statusConfig[st]?.labelEn || st)}</option>
              ))}
            </select>
          </div>

          {/* Admission Class Filter */}
          <div className="min-w-0">
            <select
              value={classFilter}
              onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium min-w-0"
            >
              <option value="ALL">{isMarathi ? 'सर्व इयत्ता (All Classes)' : 'All Classes'}</option>
              <option value="5">{isMarathi ? 'इ. 5 वी (5th Standard)' : 'Class 5th'}</option>
              <option value="6">{isMarathi ? 'इ. 6 वी (6th Standard)' : 'Class 6th'}</option>
              <option value="7">{isMarathi ? 'इ. 7 वी (7th Standard)' : 'Class 7th'}</option>
              <option value="8">{isMarathi ? 'इ. 8 वी (8th Standard)' : 'Class 8th'}</option>
              <option value="9">{isMarathi ? 'इ. 9 वी (9th Standard)' : 'Class 9th'}</option>
              <option value="10">{isMarathi ? 'इ. 10 वी (10th Standard)' : 'Class 10th'}</option>
              <option value="11">{isMarathi ? 'इ. 11 वी (11th Standard)' : 'Class 11th'}</option>
              <option value="12">{isMarathi ? 'इ. 12 वी (12th Standard)' : 'Class 12th'}</option>
            </select>
          </div>

          {/* Lead Source Filter */}
          <div className="min-w-0">
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium min-w-0"
            >
              <option value="ALL">{isMarathi ? 'सर्व मार्ग (All Sources)' : 'All Sources'}</option>
              <option value="Website">Website</option>
              <option value="Manual Entry">Manual Entry</option>
              <option value="Phone Call">Phone Call</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Facebook Ads">Facebook Ads</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Second Row: Counselor & Date Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Telecaller Filter */}
          {isAdmin && (
            <div className="min-w-0">
              <select
                value={telecallerFilter}
                onChange={(e) => { setTelecallerFilter(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium min-w-0"
              >
                <option value="ALL">{isMarathi ? 'सर्व समुपदेशक (All Counselors)' : 'All Counselors'}</option>
                <option value="UNASSIGNED">{isMarathi ? 'विनावाटप (Unassigned Only)' : 'Unassigned Only'}</option>
                {telecallers.map(t => (
                  <option key={t.uid || t.id} value={t.uid || t.id}>
                    {t.fullName || t.displayName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Academic Year Filter */}
          <div className="min-w-0">
            <select
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium min-w-0"
            >
              <option value="ALL">{isMarathi ? 'सर्व शैक्षणिक वर्षे (All Years)' : 'All Academic Years'}</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2027-2028">2027-2028</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">{isMarathi ? 'पासून:' : 'From:'}</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white min-w-0"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">{isMarathi ? 'पर्यंत:' : 'To:'}</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white min-w-0"
            />
          </div>
        </div>
      </div>

      {/* 5. Bulk Selection Action Bar */}
      {isAdmin && selectedLeadIds.length > 0 && (
        <div className="p-3.5 bg-gurukul-navy-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md text-xs min-w-0 transition-all">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-4 h-4 text-gurukul-saffron-400 shrink-0" />
            <span className="font-medium">
              <strong className="text-white font-bold">{selectedLeadIds.length}</strong> {isMarathi ? 'लीड्स निवडल्या आहेत' : 'leads selected'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCancelSelection}
              className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-white/20"
              title={isMarathi ? 'सर्व निवड रद्द करा' : 'Cancel Selection'}
            >
              <X className="w-3.5 h-3.5 text-white/90" />
              <span>{isMarathi ? 'निवड रद्द करा' : 'Cancel Selection'}</span>
            </button>
            <button
              type="button"
              onClick={() => setBulkAssignModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'समुपदेशक नियुक्त करा (Bulk Assign)' : 'Assign Counselor (Bulk)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. Professional CRM Data Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-full min-w-0">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                {isAdmin && (
                  <th className="py-3.5 px-4 w-10">
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      checked={allPaginatedSelected}
                      onChange={handleSelectAll}
                      className="rounded text-gurukul-saffron-500 cursor-pointer w-4 h-4"
                      aria-label={isMarathi ? 'सर्व निवडा / रद्द करा' : 'Select all / Deselect all'}
                    />
                  </th>
                )}
                <th className="py-3.5 px-4">{isMarathi ? 'लीड नंबर (Lead No)' : 'Lead ID'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'विद्यार्थी व पालक (Student / Parent)' : 'Student & Parent'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'मोबाईल (Mobile)' : 'Mobile'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'इयत्ता व कोर्स' : 'Class & Course'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'मार्ग (Source)' : 'Source'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'समुपदेशक (Assigned)' : 'Counselor'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'स्थिती (Status)' : 'Status'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'नोंदणी तारीख' : 'Created Date'}</th>
                <th className="py-3.5 px-4 text-right">{isMarathi ? 'कृती (Actions)' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 10 : 9} className="py-16 text-center text-slate-400">
                    {isMarathi ? 'कोणतीही नोंद आढळली नाही. कृपया शोध किंवा फिल्टर्स बदला.' : 'No records found. Please adjust your search or filters.'}
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const st = lead.status || lead.leadStatus || 'New';
                  const stConf = statusConfig[st] || { labelMr: st, labelEn: st, bgColor: 'bg-slate-100 text-slate-700' };
                  const leadKey = getLeadId(lead);
                  const isSelected = selectedLeadIds.includes(leadKey);

                  return (
                    <tr key={leadKey || lead.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-orange-50/30' : ''}`}>
                      
                      {/* Checkbox */}
                      {isAdmin && (
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(leadKey)}
                            className="rounded text-gurukul-saffron-500 cursor-pointer w-4 h-4"
                            aria-label={`Select lead ${lead.leadNumber || leadKey}`}
                          />
                        </td>
                      )}

                      {/* Lead Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <Link
                          to={isAdmin ? `/admin/leads/${lead.id}` : `/telecaller/leads/${lead.id}`}
                          className="hover:text-gurukul-saffron-600 flex items-center gap-1.5"
                        >
                          <span>{lead.leadNumber || lead.id}</span>
                          <ExternalLink className="w-3 h-3 text-slate-300" />
                        </Link>
                        {lead.isDuplicate && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-red-100 text-red-700 text-[9px] font-bold">
                            {isMarathi ? 'नक्कल शक्यता' : 'Possible Duplicate'}
                          </span>
                        )}
                      </td>

                      {/* Student & Parent */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{lead.studentName}</div>
                        <div className="text-[11px] text-slate-500">{isMarathi ? 'पालक:' : 'Parent:'} {lead.parentName}</div>
                        {lead.city && (
                          <div className="text-[10px] text-slate-400">{lead.city}</div>
                        )}
                      </td>

                      {/* Mobile Number & Quick Contacts */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 font-mono">
                          {lead.normalizedMobile || lead.mobileNumber || lead.mobile}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <a
                            href={`tel:${lead.normalizedMobile || lead.mobileNumber || lead.mobile}`}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title={isMarathi ? "कॉल करा" : "Call"}
                          >
                            <Phone className="w-3 h-3 text-gurukul-saffron-600" />
                          </a>
                          <a
                            href={`https://wa.me/91${lead.whatsapp || lead.whatsappNumber || lead.normalizedMobile || lead.mobileNumber}?text=${encodeURIComponent(isMarathi ? `नमस्कार ${lead.parentName}, मी गुरुकुल भोसे निवासी स्कूल व ज्युनिअर कॉलेजमधून संपर्क करत आहे.` : `Hello ${lead.parentName}, contacting you from Gurukul Bhose Residential School & College.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      {/* Class & Course */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gurukul-saffron-700">{lead.admissionClass}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]" title={lead.course}>
                          {lead.course}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
                          {lead.source || lead.leadSource || 'Website'}
                        </span>
                      </td>

                      {/* Assigned Telecaller */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {lead.assignedTo || lead.assignedTelecallerId ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="font-semibold text-slate-800">
                              {lead.assignedTelecallerName || 'Counselor'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {isMarathi ? 'विनावाटप (Unassigned)' : 'Unassigned'}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => { setStatusModalLead(lead); setQuickNewStatus(st); }}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-transform hover:scale-105 ${stConf.bgColor}`}
                          title={isMarathi ? "स्थिती बदलण्यासाठी क्लिक करा" : "Click to change status"}
                        >
                          {isMarathi ? (stConf.labelMr || st) : (stConf.labelEn || st)}
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {lead.createdAt ? new Date(lead.createdAt?.toDate ? lead.createdAt.toDate() : lead.createdAt).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN') : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <Link
                            to={isAdmin ? `/admin/leads/${lead.id}` : `/telecaller/leads/${lead.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title={isMarathi ? "तपशील पहा (View Lead)" : "View Lead Details"}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Quick Call Log */}
                          <button
                            onClick={() => setCallModalLead(lead)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                            title={isMarathi ? "कॉल नोंदवा (Log Call)" : "Log Call Attempt"}
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>

                          {/* Assign / Reassign (Admin Only) */}
                          {isAdmin && (
                            <button
                              onClick={() => { setAssignModalLead(lead); setSelectedTelecaller(lead.assignedTo || lead.assignedTelecallerId || ''); }}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                              title={lead.assignedTo ? (isMarathi ? 'पुनर्नियुक्ती (Reassign)' : 'Reassign') : (isMarathi ? 'नेमणूक (Assign)' : 'Assign')}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            {isMarathi 
              ? <>एकूण <strong>{filteredLeads.length}</strong> पैकी <strong>{Math.min(filteredLeads.length, (currentPage - 1) * itemsPerPage + 1)}</strong> ते <strong>{Math.min(filteredLeads.length, currentPage * itemsPerPage)}</strong> दाखवत आहे</>
              : <>Showing <strong>{Math.min(filteredLeads.length, (currentPage - 1) * itemsPerPage + 1)}</strong> to <strong>{Math.min(filteredLeads.length, currentPage * itemsPerPage)}</strong> of <strong>{filteredLeads.length}</strong> entries</>
            }
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">{isMarathi ? 'पृष्ठावर नोंदी:' : 'Rows per page:'}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="text-xs px-2 py-1 border border-slate-200 rounded-lg bg-white"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <div className="flex items-center gap-1 ml-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-bold text-slate-800">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: CREATE MANUAL LEAD */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={isMarathi ? "नवीन प्रवेश नोंदणी जोडा (Manual Admission Enquiry)" : "Add New Admission Enquiry (Manual Entry)"}
      >
        <form onSubmit={handleCreateLead} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {addError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {addError}
            </div>
          )}

          {/* Parent Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-800 border-b border-slate-100 pb-1">
              {isMarathi ? '१. पालक तपशील' : '1. Parent Details'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'पालकांचे पूर्ण नाव' : 'Parent Full Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newLeadForm.parentName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, parentName: e.target.value })}
                  placeholder={isMarathi ? "उदा. श्री. विकास कदम" : "e.g. Mr. Vikas Kadam"}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'मोबाईल नंबर' : 'Mobile Number'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={newLeadForm.mobileNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setNewLeadForm({
                      ...newLeadForm,
                      mobileNumber: val,
                      whatsappNumber: newLeadForm.sameAsMobile ? val : newLeadForm.whatsappNumber
                    });
                  }}
                  placeholder={isMarathi ? "१० अंकी मोबाईल नंबर" : "10-digit mobile number"}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'WhatsApp नंबर' : 'WhatsApp Number'}
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={newLeadForm.whatsappNumber}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, whatsappNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder={isMarathi ? "१० अंकी WhatsApp नंबर" : "10-digit WhatsApp number"}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'शहर / गाव (City / Village)' : 'City / Village'}
                </label>
                <input
                  type="text"
                  value={newLeadForm.city}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                  placeholder={isMarathi ? "उदा. तासगाव / सांगली" : "e.g. Tasgaon / Sangli"}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase text-slate-800 border-b border-slate-100 pb-1">
              {isMarathi ? '२. विद्यार्थी तपशील' : '2. Student Details'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'विद्यार्थ्याचे पूर्ण नाव' : 'Student Full Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newLeadForm.studentName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, studentName: e.target.value })}
                  placeholder={isMarathi ? "उदा. आदित्य विकास कदम" : "e.g. Aditya Vikas Kadam"}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'प्रवेश इयत्ता (Applying Class)' : 'Applying Class'} <span className="text-red-500">*</span>
                </label>
                <select
                  value={newLeadForm.admissionClass}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, admissionClass: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-bold"
                >
                  <option value="इ. 5 वी (5th Std)">{isMarathi ? 'इ. 5 वी (5th Std) - सैनिक पॅटर्न निवासी' : 'Std. 5th - Sainik Pattern Residential'}</option>
                  <option value="इ. 6 वी (6th Std)">{isMarathi ? 'इ. 6 वी (6th Std) - सैनिक पॅटर्न निवासी' : 'Std. 6th - Sainik Pattern Residential'}</option>
                  <option value="इ. 7 वी (7th Std)">{isMarathi ? 'इ. 7 वी (7th Std) - सैनिक पॅटर्न निवासी' : 'Std. 7th - Sainik Pattern Residential'}</option>
                  <option value="इ. 8 वी (8th Std)">{isMarathi ? 'इ. 8 वी (8th Std) - सैनिक पॅटर्न निवासी' : 'Std. 8th - Sainik Pattern Residential'}</option>
                  <option value="इ. 9 वी (9th Std)">{isMarathi ? 'इ. 9 वी (9th Std) - सैनिक पॅटर्न निवासी' : 'Std. 9th - Sainik Pattern Residential'}</option>
                  <option value="इ. 10 वी (10th Std)">{isMarathi ? 'इ. 10 वी (10th Std)' : 'Std. 10th (SSC Board)'}</option>
                  <option value="इ. 11 वी सायन्स (PCMB)">{isMarathi ? 'इ. 11 वी सायन्स (PCMB + NEET/JEE/NDA)' : '11th Science (PCMB + NEET/JEE/NDA)'}</option>
                  <option value="इ. 11 वी आर्टस् (Defence / Arts)">{isMarathi ? 'इ. 11 वी आर्टस् (डिफेन्स अकॅडमी)' : '11th Arts (Defence Academy)'}</option>
                  <option value="इ. 12 वी सायन्स (PCMB)">{isMarathi ? 'इ. 12 वी सायन्स (PCMB)' : '12th Science (PCMB)'}</option>
                  <option value="इ. 12 वी आर्टस् (Defence / Arts)">{isMarathi ? 'इ. 12 वी आर्टस्' : '12th Arts'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Admission & Source Info */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase text-slate-800 border-b border-slate-100 pb-1">
              {isMarathi ? '३. चौकशी मार्ग व समुपदेशक नेमणूक' : '3. Lead Source & Counselor Assignment'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'चौकशी मार्ग (Lead Source)' : 'Lead Source'}
                </label>
                <select
                  value={newLeadForm.source}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
                >
                  <option value="Manual Entry">Manual Entry</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Website">Website</option>
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'समुपदेशक नियुक्त करा (ऐच्छिक)' : 'Assign Counselor (Optional)'}
                </label>
                <select
                  value={newLeadForm.assignedTo}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, assignedTo: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
                >
                  <option value="">{isMarathi ? '-- नंतर नियुक्त करा --' : '-- Assign Later --'}</option>
                  {telecallers.map(t => (
                    <option key={t.uid || t.id} value={t.uid || t.id}>
                      {t.fullName || t.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isMarathi ? 'प्रशासकीय शेरा / टिपण (Admin Remarks)' : 'Admin Remarks'}
              </label>
              <textarea
                rows={2}
                value={newLeadForm.adminRemarks}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, adminRemarks: e.target.value })}
                placeholder={isMarathi ? "उदा. पालकांनी प्रत्यक्ष कार्यालयात येऊन चौकशी केली." : "e.g. Parent visited campus office directly."}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddModalOpen(false)}>
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              {isMarathi ? 'नोंदणी पूर्ण करा (Create Lead)' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ASSIGN SINGLE LEAD */}
      <Modal
        isOpen={Boolean(assignModalLead)}
        onClose={() => setAssignModalLead(null)}
        title={isMarathi ? "समुपदेशक नेमणूक / पुनर्नियुक्ती (Assign Counselor)" : "Assign / Reassign Counselor"}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            {isMarathi ? 'विद्यार्थी:' : 'Student:'} <strong>{assignModalLead?.studentName}</strong> ({assignModalLead?.admissionClass})
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'समुपदेशक निवडा' : 'Select Counselor'} <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedTelecaller}
              onChange={(e) => setSelectedTelecaller(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
            >
              <option value="">{isMarathi ? '-- समुपदेशक निवडा --' : '-- Select Counselor --'}</option>
              {telecallers.map(t => (
                <option key={t.uid || t.id} value={t.uid || t.id}>
                  {t.fullName || t.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'नेमणुकीचे कारण (Reason)' : 'Assignment Reason'}
            </label>
            <input
              type="text"
              value={assignmentReason}
              onChange={(e) => setAssignmentReason(e.target.value)}
              placeholder={isMarathi ? "उदा. नियमित वाटप / भाषा प्राधान्य" : "e.g. Regular allocation / Language match"}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setAssignModalLead(null)}>
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {isMarathi ? 'जतन करा' : 'Save Assignment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: BULK ASSIGN LEADS */}
      <Modal
        isOpen={bulkAssignModalOpen}
        onClose={() => setBulkAssignModalOpen(false)}
        title={isMarathi ? "एकत्रित समुपदेशक वाटप (Bulk Assign Leads)" : "Bulk Assign Leads"}
      >
        <form onSubmit={handleBulkAssignSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            {isMarathi 
              ? <>निवडलेल्या <strong>{selectedLeadIds.length}</strong> लीड्स एका समुपदेशकाकडे सोपवण्यात येतील.</>
              : <>Selected <strong>{selectedLeadIds.length}</strong> leads will be assigned to the chosen counselor.</>
            }
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'समुपदेशक निवडा' : 'Select Counselor'} <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={bulkTelecallerId}
              onChange={(e) => setBulkTelecallerId(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
            >
              <option value="">{isMarathi ? '-- समुपदेशक निवडा --' : '-- Select Counselor --'}</option>
              {telecallers.map(t => (
                <option key={t.uid || t.id} value={t.uid || t.id}>
                  {t.fullName || t.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'वाटपाचे कारण (Reason)' : 'Reason'}
            </label>
            <input
              type="text"
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              placeholder={isMarathi ? "उदा. नवीन बॅच वाटप" : "e.g. New lead batch allocation"}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setBulkAssignModalOpen(false)}>
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {isMarathi ? 'वाटप पूर्ण करा (Assign All)' : 'Assign All'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: QUICK STATUS CHANGE */}
      <Modal
        isOpen={Boolean(statusModalLead)}
        onClose={() => setStatusModalLead(null)}
        title={isMarathi ? "लीड स्थिती अद्ययावत करा" : "Update Lead Status"}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            {isMarathi ? 'विद्यार्थी:' : 'Student:'} <strong>{statusModalLead?.studentName}</strong> ({isMarathi ? 'सध्याची स्थिती:' : 'Current Status:'} <strong>{statusModalLead?.status || statusModalLead?.leadStatus}</strong>)
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'नवीन स्थिती निवडा' : 'Select New Status'} <span className="text-red-500">*</span>
            </label>
            <select
              value={quickNewStatus}
              onChange={(e) => setQuickNewStatus(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-bold"
              required
            >
              <option value="">{isMarathi ? '-- स्थिती निवडा --' : '-- Select Status --'}</option>
              {statusList.map(st => (
                <option key={st} value={st}>{isMarathi ? (statusConfig[st]?.labelMr || st) : (statusConfig[st]?.labelEn || st)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'बदलाचे कारण / टिपण' : 'Reason / Notes'}
            </label>
            <input
              type="text"
              value={statusChangeReason}
              onChange={(e) => setStatusChangeReason(e.target.value)}
              placeholder={isMarathi ? "उदा. पालकांनी सकारात्मकता दर्शवली" : "e.g. Parent showed high interest"}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setStatusModalLead(null)}>
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {isMarathi ? 'जतन करा' : 'Save Status'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: QUICK CALL LOG */}
      <Modal
        isOpen={Boolean(callModalLead)}
        onClose={() => setCallModalLead(null)}
        title={isMarathi ? "कॉल नोंदवा (Log Call Attempt)" : "Log Call Attempt"}
      >
        <form onSubmit={handleCallSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            {isMarathi ? 'पालक:' : 'Parent:'} <strong>{callModalLead?.parentName}</strong> ({callModalLead?.normalizedMobile || callModalLead?.mobileNumber})
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'कॉलचा निकाल' : 'Call Outcome'} <span className="text-red-500">*</span>
            </label>
            <select
              value={callForm.callOutcome}
              onChange={(e) => setCallForm({ ...callForm, callOutcome: e.target.value })}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
            >
              <option value="Connected / Discussed">{isMarathi ? 'कॉल लागला व सविस्तर चर्चा झाली' : 'Connected / Discussed'}</option>
              <option value="Busy / Call Waiting">{isMarathi ? 'कॉल व्यस्त होता' : 'Busy / Call Waiting'}</option>
              <option value="Not Answered / Ringing">{isMarathi ? 'फोन वाजला पण उचलला नाही' : 'Not Answered / Ringing'}</option>
              <option value="Switch Off">{isMarathi ? 'स्विच ऑफ किंवा कव्हरेजबाहेर' : 'Switched Off / Out of Coverage'}</option>
              <option value="Callback Requested">{isMarathi ? 'पालकांनी नंतर फोन करण्यास सांगितले' : 'Callback Requested'}</option>
              <option value="School Visit Booked">{isMarathi ? 'कॅम्पस भेट ठरली' : 'Campus Visit Booked'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'पालकांचा प्रतिसाद व टिपण' : 'Parent Response & Notes'} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={callForm.parentResponse}
              onChange={(e) => setCallForm({ ...callForm, parentResponse: e.target.value })}
              placeholder={isMarathi ? "झालेल्या चर्चेचा मुख्य तपशील..." : "Key highlights of the conversation..."}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'पुढील फॉलो-अप तारीख' : 'Next Follow-up Date'}
            </label>
            <input
              type="date"
              value={callForm.nextFollowupAt}
              onChange={(e) => setCallForm({ ...callForm, nextFollowupAt: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setCallModalLead(null)}>
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {isMarathi ? 'नोंद जतन करा' : 'Save Call Log'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
