import React, { useState, useMemo } from 'react';
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

export const LeadsPage = () => {
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

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeadIds(paginatedLeads.map(l => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              प्रवेश नोंदणी व लीड व्यवस्थापन (Admission CRM)
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-gurukul-saffron-800 border border-orange-200">
              {leads.length} एकूण लीड्स
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            वेबसाईट, थेट संपर्क, फेसबुक ऍड्स व फोनवरून आलेली सर्व प्रवेश विचारणा माहिती
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export Button (Role-Authorized) */}
          {isAdmin && (
            <Button
              variant="outline"
              size="md"
              onClick={handleExportCSV}
              className="text-xs rounded-xl shadow-sm border-slate-300"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
              <span>CSV निर्यात करा ({filteredLeads.length})</span>
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
              <span>नवीन नोंदणी जोडा (Manual Entry)</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Analytics - 10 Core Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="एकूण नोंदणी (Total)"
          value={analytics.totalEnquiries}
          icon={Users}
          color="navy"
          subtitle="सर्व प्रवेश चौकशी"
        />
        <StatCard
          title="नवीन लीड्स (New)"
          value={analytics.newLeads}
          icon={UserPlus}
          color="blue"
          subtitle="अद्याप संपर्क बाकी"
        />
        <StatCard
          title="नेमणूक झालेल्या (Assigned)"
          value={analytics.assignedLeads}
          icon={UserCheck}
          color="purple"
          subtitle="समुपदेशकाकडे वाटप"
        />
        <StatCard
          title="विनावाटप (Unassigned)"
          value={analytics.unassignedLeads}
          icon={Clock}
          color="amber"
          subtitle="नेमणूक बाकी"
        />
        <StatCard
          title="संपर्क साधलेल्या (Contacted)"
          value={analytics.contactedLeads}
          icon={Phone}
          color="sky"
          subtitle="प्राथमिक चर्चा पूर्ण"
        />
        <StatCard
          title="इच्छुक पालक (Interested)"
          value={analytics.interestedLeads}
          icon={Sparkles}
          color="amber"
          subtitle="सकारात्मक प्रतिसाद"
        />
        <StatCard
          title="फॉलो-अप बाकी (Follow-ups)"
          value={analytics.pendingFollowUps}
          icon={Calendar}
          color="orange"
          subtitle="पुढील तारीख नियोजित"
        />
        <StatCard
          title="शाळेस भेट (Visited)"
          value={analytics.visitedLeads}
          icon={GraduationCap}
          color="indigo"
          subtitle="कॅम्पस भेट झाली"
        />
        <StatCard
          title="प्रवेश निश्चित (Converted)"
          value={analytics.convertedLeads}
          icon={CheckCircle2}
          color="emerald"
          subtitle="प्रवेश पूर्ण झाला"
        />
        <StatCard
          title="प्रवेश गमावला (Lost)"
          value={analytics.lostLeads}
          icon={XCircle}
          color="rose"
          subtitle="अनिच्छुक किंवा रद्द"
        />
      </div>

      {/* 3. Distribution Overview Strip */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="border-r border-slate-100 pr-3">
          <span className="text-slate-400 block text-[11px] font-medium">आजची नोंदणी (Today):</span>
          <span className="text-lg font-black text-slate-800">{analytics.enquiriesToday} अर्ज</span>
        </div>
        <div className="border-r border-slate-100 pr-3">
          <span className="text-slate-400 block text-[11px] font-medium">या आठवड्यातील (This Week):</span>
          <span className="text-lg font-black text-slate-800">{analytics.enquiriesThisWeek} अर्ज</span>
        </div>
        <div className="border-r border-slate-100 pr-3">
          <span className="text-slate-400 block text-[11px] font-medium">या महिन्यातील (This Month):</span>
          <span className="text-lg font-black text-slate-800">{analytics.enquiriesThisMonth} अर्ज</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px] font-medium">प्रवेश रूपांतरण दर (Conversion Rate):</span>
          <span className="text-lg font-black text-emerald-600">{analytics.conversionRate}</span>
        </div>
      </div>

      {/* 4. Search & Multi-Criteria Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="नाव, मोबाईल, लीड नंबर किंवा गाव शोधा..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
            >
              <option value="ALL">सर्व स्थिती (All Status)</option>
              {statusList.map(st => (
                <option key={st} value={st}>{statusConfig[st]?.labelMr || st}</option>
              ))}
            </select>
          </div>

          {/* Admission Class Filter */}
          <div>
            <select
              value={classFilter}
              onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
            >
              <option value="ALL">सर्व इयत्ता (All Classes)</option>
              <option value="5">इ. 5 वी (5th Standard)</option>
              <option value="6">इ. 6 वी (6th Standard)</option>
              <option value="7">इ. 7 वी (7th Standard)</option>
              <option value="8">इ. 8 वी (8th Standard)</option>
              <option value="9">इ. 9 वी (9th Standard)</option>
              <option value="10">इ. 10 वी (10th Standard)</option>
              <option value="11">इ. 11 वी (11th Standard)</option>
              <option value="12">इ. 12 वी (12th Standard)</option>
            </select>
          </div>

          {/* Lead Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
            >
              <option value="ALL">सर्व मार्ग (All Sources)</option>
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
            <div>
              <select
                value={telecallerFilter}
                onChange={(e) => { setTelecallerFilter(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
              >
                <option value="ALL">सर्व समुपदेशक (All Counselors)</option>
                <option value="UNASSIGNED">विनावाटप (Unassigned Only)</option>
                {telecallers.map(t => (
                  <option key={t.uid || t.id} value={t.uid || t.id}>
                    {t.fullName || t.displayName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Academic Year Filter */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
            >
              <option value="ALL">सर्व शैक्षणिक वर्षे (All Years)</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2027-2028">2027-2028</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">पासून:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">पर्यंत:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white"
            />
          </div>
        </div>
      </div>

      {/* 5. Bulk Selection Action Bar */}
      {isAdmin && selectedLeadIds.length > 0 && (
        <div className="p-3.5 bg-gurukul-navy-900 text-white rounded-2xl flex items-center justify-between shadow-md text-xs">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-gurukul-saffron-400" />
            <span><strong>{selectedLeadIds.length}</strong> लीड्स निवडल्या आहेत</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLeadIds([])}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold"
            >
              निवड रद्द करा
            </button>
            <button
              onClick={() => setBulkAssignModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 text-white font-bold"
            >
              समुपदेशक नियुक्त करा (Bulk Assign)
            </button>
          </div>
        </div>
      )}

      {/* 6. Professional CRM Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                {isAdmin && (
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.length > 0 && selectedLeadIds.length === paginatedLeads.length}
                      onChange={handleSelectAll}
                      className="rounded text-gurukul-saffron-500"
                    />
                  </th>
                )}
                <th className="py-3.5 px-4">लीड नंबर (Lead No)</th>
                <th className="py-3.5 px-4">विद्यार्थी व पालक (Student / Parent)</th>
                <th className="py-3.5 px-4">मोबाईल (Mobile)</th>
                <th className="py-3.5 px-4">इयत्ता व कोर्स</th>
                <th className="py-3.5 px-4">मार्ग (Source)</th>
                <th className="py-3.5 px-4">समुपदेशक (Assigned)</th>
                <th className="py-3.5 px-4">स्थिती (Status)</th>
                <th className="py-3.5 px-4">नोंदणी तारीख</th>
                <th className="py-3.5 px-4 text-right">कृती (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 10 : 9} className="py-16 text-center text-slate-400">
                    कोणतीही नोंद आढळली नाही. कृपया शोध किंवा फिल्टर्स बदला.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const st = lead.status || lead.leadStatus || 'New';
                  const stConf = statusConfig[st] || { labelMr: st, bgColor: 'bg-slate-100 text-slate-700' };
                  const isSelected = selectedLeadIds.includes(lead.id);

                  return (
                    <tr key={lead.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-orange-50/30' : ''}`}>
                      
                      {/* Checkbox */}
                      {isAdmin && (
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(lead.id)}
                            className="rounded text-gurukul-saffron-500"
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
                            नक्कल शक्यता
                          </span>
                        )}
                      </td>

                      {/* Student & Parent */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{lead.studentName}</div>
                        <div className="text-[11px] text-slate-500">पालक: {lead.parentName}</div>
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
                            title="कॉल करा"
                          >
                            <Phone className="w-3 h-3 text-gurukul-saffron-600" />
                          </a>
                          <a
                            href={`https://wa.me/91${lead.whatsapp || lead.whatsappNumber || lead.normalizedMobile || lead.mobileNumber}?text=${encodeURIComponent(`नमस्कार ${lead.parentName}, मी गुरुकुल भोसे निवासी स्कूल व ज्युनिअर कॉलेजमधून संपर्क करत आहे.`)}`}
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
                            विनावाटप (Unassigned)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => { setStatusModalLead(lead); setQuickNewStatus(st); }}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-transform hover:scale-105 ${stConf.bgColor}`}
                          title="स्थिती बदलण्यासाठी क्लिक करा"
                        >
                          {stConf.labelMr}
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {lead.createdAt ? new Date(lead.createdAt?.toDate ? lead.createdAt.toDate() : lead.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <Link
                            to={isAdmin ? `/admin/leads/${lead.id}` : `/telecaller/leads/${lead.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="तपशील पहा (View Lead)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Quick Call Log */}
                          <button
                            onClick={() => setCallModalLead(lead)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                            title="कॉल नोंदवा (Log Call)"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>

                          {/* Assign / Reassign (Admin Only) */}
                          {isAdmin && (
                            <button
                              onClick={() => { setAssignModalLead(lead); setSelectedTelecaller(lead.assignedTo || lead.assignedTelecallerId || ''); }}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                              title={lead.assignedTo ? 'पुनर्नियुक्ती (Reassign)' : 'नेमणूक (Assign)'}
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
            एकूण <strong>{filteredLeads.length}</strong> पैकी <strong>{Math.min(filteredLeads.length, (currentPage - 1) * itemsPerPage + 1)}</strong> ते <strong>{Math.min(filteredLeads.length, currentPage * itemsPerPage)}</strong> दाखवत आहे
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">पृष्ठावर नोंदी:</span>
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
        title="नवीन प्रवेश नोंदणी जोडा (Manual Admission Enquiry)"
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
              १. पालक तपशील
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  पालकांचे पूर्ण नाव <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newLeadForm.parentName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, parentName: e.target.value })}
                  placeholder="उदा. श्री. विकास कदम"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  मोबाईल नंबर <span className="text-red-500">*</span>
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
                  placeholder="१० अंकी मोबाईल नंबर"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp नंबर
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={newLeadForm.whatsappNumber}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, whatsappNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="१० अंकी WhatsApp नंबर"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  शहर / गाव (City / Village)
                </label>
                <input
                  type="text"
                  value={newLeadForm.city}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                  placeholder="उदा. तासगाव / सांगली"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase text-slate-800 border-b border-slate-100 pb-1">
              २. विद्यार्थी तपशील
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  विद्यार्थ्याचे पूर्ण नाव <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newLeadForm.studentName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, studentName: e.target.value })}
                  placeholder="उदा. आदित्य विकास कदम"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  प्रवेश इयत्ता (Applying Class) <span className="text-red-500">*</span>
                </label>
                <select
                  value={newLeadForm.admissionClass}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, admissionClass: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-bold"
                >
                  <option value="इ. 5 वी (5th Std)">इ. 5 वी (5th Std) - सैनिक पॅटर्न निवासी</option>
                  <option value="इ. 6 वी (6th Std)">इ. 6 वी (6th Std) - सैनिक पॅटर्न निवासी</option>
                  <option value="इ. 7 वी (7th Std)">इ. 7 वी (7th Std) - सैनिक पॅटर्न निवासी</option>
                  <option value="इ. 8 वी (8th Std)">इ. 8 वी (8th Std) - सैनिक पॅटर्न निवासी</option>
                  <option value="इ. 9 वी (9th Std)">इ. 9 वी (9th Std) - सैनिक पॅटर्न निवासी</option>
                  <option value="इ. 10 वी (10th Std)">इ. 10 वी (10th Std)</option>
                  <option value="इ. 11 वी सायन्स (PCMB)">इ. 11 वी सायन्स (PCMB + NEET/JEE/NDA)</option>
                  <option value="इ. 11 वी आर्टस् (Defence / Arts)">इ. 11 वी आर्टस् (डिफेन्स अकॅडमी)</option>
                  <option value="इ. 12 वी सायन्स (PCMB)">इ. 12 वी सायन्स (PCMB)</option>
                  <option value="इ. 12 वी आर्टस् (Defence / Arts)">इ. 12 वी आर्टस्</option>
                </select>
              </div>
            </div>
          </div>

          {/* Admission & Source Info */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase text-slate-800 border-b border-slate-100 pb-1">
              ३. चौकशी मार्ग व समुपदेशक नेमणूक
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  चौकशी मार्ग (Lead Source)
                </label>
                <select
                  value={newLeadForm.source}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
                >
                  <option value="Manual Entry">Manual Entry (थेट नोंदणी)</option>
                  <option value="Phone Call">Phone Call (फोन आला)</option>
                  <option value="WhatsApp">WhatsApp विचारणा</option>
                  <option value="Website">Website (वेबसाईट)</option>
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="Other">Other (इतर)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  समुपदेशक नियुक्त करा (ऐच्छिक)
                </label>
                <select
                  value={newLeadForm.assignedTo}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, assignedTo: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
                >
                  <option value="">-- नंतर नियुक्त करा --</option>
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
                प्रशासकीय शेरा / टिपण (Admin Remarks)
              </label>
              <textarea
                rows={2}
                value={newLeadForm.adminRemarks}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, adminRemarks: e.target.value })}
                placeholder="उदा. पालकांनी प्रत्यक्ष कार्यालयात येऊन चौकशी केली."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddModalOpen(false)}>
              रद्द करा
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              नोंदणी पूर्ण करा (Create Lead)
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ASSIGN SINGLE LEAD */}
      <Modal
        isOpen={Boolean(assignModalLead)}
        onClose={() => setAssignModalLead(null)}
        title="समुपदेशक नेमणूक / पुनर्नियुक्ती (Assign Counselor)"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            विद्यार्थी: <strong>{assignModalLead?.studentName}</strong> ({assignModalLead?.admissionClass})
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              समुपदेशक निवडा <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedTelecaller}
              onChange={(e) => setSelectedTelecaller(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
            >
              <option value="">-- समुपदेशक निवडा --</option>
              {telecallers.map(t => (
                <option key={t.uid || t.id} value={t.uid || t.id}>
                  {t.fullName || t.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              नेमणुकीचे कारण (Reason)
            </label>
            <input
              type="text"
              value={assignmentReason}
              onChange={(e) => setAssignmentReason(e.target.value)}
              placeholder="उदा. नियमित वाटप / भाषा प्राधान्य"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setAssignModalLead(null)}>
              रद्द करा
            </Button>
            <Button variant="primary" size="sm" type="submit">
              जतन करा
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: BULK ASSIGN LEADS */}
      <Modal
        isOpen={bulkAssignModalOpen}
        onClose={() => setBulkAssignModalOpen(false)}
        title="एकत्रित समुपदेशक वाटप (Bulk Assign Leads)"
      >
        <form onSubmit={handleBulkAssignSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            निवडलेल्या <strong>{selectedLeadIds.length}</strong> लीड्स एका समुपदेशकाकडे सोपवण्यात येतील.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              समुपदेशक निवडा <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={bulkTelecallerId}
              onChange={(e) => setBulkTelecallerId(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
            >
              <option value="">-- समुपदेशक निवडा --</option>
              {telecallers.map(t => (
                <option key={t.uid || t.id} value={t.uid || t.id}>
                  {t.fullName || t.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              वाटपाचे कारण (Reason)
            </label>
            <input
              type="text"
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              placeholder="उदा. नवीन बॅच वाटप"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setBulkAssignModalOpen(false)}>
              रद्द करा
            </Button>
            <Button variant="primary" size="sm" type="submit">
              वाटप पूर्ण करा (Assign All)
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: QUICK STATUS CHANGE */}
      <Modal
        isOpen={Boolean(statusModalLead)}
        onClose={() => setStatusModalLead(null)}
        title="लीड स्थिती अद्ययावत करा"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            विद्यार्थी: <strong>{statusModalLead?.studentName}</strong> (सध्याची स्थिती: <strong>{statusModalLead?.status || statusModalLead?.leadStatus}</strong>)
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              नवीन स्थिती निवडा <span className="text-red-500">*</span>
            </label>
            <select
              value={quickNewStatus}
              onChange={(e) => setQuickNewStatus(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-bold"
              required
            >
              <option value="">-- स्थिती निवडा --</option>
              {statusList.map(st => (
                <option key={st} value={st}>{statusConfig[st]?.labelMr || st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              बदलाचे कारण / टिपण
            </label>
            <input
              type="text"
              value={statusChangeReason}
              onChange={(e) => setStatusChangeReason(e.target.value)}
              placeholder="उदा. पालकांनी सकारात्मकता दर्शवली"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setStatusModalLead(null)}>
              रद्द करा
            </Button>
            <Button variant="primary" size="sm" type="submit">
              जतन करा
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: QUICK CALL LOG */}
      <Modal
        isOpen={Boolean(callModalLead)}
        onClose={() => setCallModalLead(null)}
        title="कॉल नोंदवा (Log Call Attempt)"
      >
        <form onSubmit={handleCallSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            पालक: <strong>{callModalLead?.parentName}</strong> ({callModalLead?.normalizedMobile || callModalLead?.mobileNumber})
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              कॉलचा निकाल <span className="text-red-500">*</span>
            </label>
            <select
              value={callForm.callOutcome}
              onChange={(e) => setCallForm({ ...callForm, callOutcome: e.target.value })}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
            >
              <option value="Connected / Discussed">कॉल लागला व सविस्तर चर्चा झाली</option>
              <option value="Busy / Call Waiting">कॉल व्यस्त होता</option>
              <option value="Not Answered / Ringing">फोन वाजला पण उचलला नाही</option>
              <option value="Switch Off">स्विच ऑफ किंवा कव्हरेजबाहेर</option>
              <option value="Callback Requested">पालकांनी नंतर फोन करण्यास सांगितले</option>
              <option value="School Visit Booked">कॅम्पस भेट ठरली</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              पालकांचा प्रतिसाद व टिपण <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={callForm.parentResponse}
              onChange={(e) => setCallForm({ ...callForm, parentResponse: e.target.value })}
              placeholder="झालेल्या चर्चेचा मुख्य तपशील..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              पुढील फॉलो-अप तारीख
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
              रद्द करा
            </Button>
            <Button variant="primary" size="sm" type="submit">
              नोंद जतन करा
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
