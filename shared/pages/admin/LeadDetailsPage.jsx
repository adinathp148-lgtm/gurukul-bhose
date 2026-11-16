import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  User, 
  GraduationCap, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  FileText, 
  History, 
  PhoneCall, 
  Plus, 
  Send, 
  Copy, 
  Check,
  Edit,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useCRM } from '../../contexts/CRMContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const LeadDetailsPage = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { isMarathi } = useLanguage();
  const { 
    leads, 
    telecallers, 
    activities, 
    assignments, 
    statusHistory, 
    duplicates, 
    statusConfig, 
    statusList,
    permittedTransitions,
    assignLead, 
    changeLeadStatus, 
    logCallAttempt, 
    resolveDuplicate 
  } = useCRM();
  const { isAdmin, isSuperAdmin, isTelecaller, currentUser, userProfile } = useAuth();

  const [copied, setCopied] = useState(false);

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTelecaller, setSelectedTelecaller] = useState('');
  const [assignmentReason, setAssignmentReason] = useState('');
  
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callForm, setCallForm] = useState({
    callOutcome: 'Connected / Discussed',
    parentResponse: '',
    nextFollowupAt: '',
    statusChange: ''
  });

  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateActionNotes, setDuplicateActionNotes] = useState('');

  // Find lead by id or leadNumber
  const lead = useMemo(() => {
    return leads.find(l => l.id === leadId || l.leadNumber === leadId);
  }, [leads, leadId]);

  // Lead-specific activities
  const leadActivities = useMemo(() => {
    return activities.filter(a => a.leadId === lead?.id || a.leadId === leadId || a.leadNumber === lead?.leadNumber)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [activities, lead, leadId]);

  // Lead-specific assignments
  const leadAssignments = useMemo(() => {
    return assignments.filter(a => a.leadId === lead?.id || a.leadId === leadId)
      .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
  }, [assignments, lead, leadId]);

  // Lead-specific status history
  const leadStatusHistory = useMemo(() => {
    return statusHistory.filter(h => h.leadId === lead?.id || h.leadId === leadId)
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
  }, [statusHistory, lead, leadId]);

  // Lead-specific duplicate info
  const duplicateInfo = useMemo(() => {
    return duplicates.find(d => d.leadId === lead?.id || d.leadId === leadId);
  }, [duplicates, lead, leadId]);

  if (!lead) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">
          {isMarathi ? 'प्रवेश नोंदणी सापडली नाही (Lead Not Found)' : 'Lead Not Found'}
        </h3>
        <p className="text-xs text-slate-500">
          {isMarathi 
            ? 'दिलेल्या क्रमांकाची नोंद डेटाबेसमध्ये उपलब्ध नाही अथवा काढून टाकण्यात आली आहे.'
            : 'The requested lead record is not available in the database or has been removed.'}
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/leads')}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>{isMarathi ? 'सर्व लीड्सकडे परत जा' : 'Back to All Leads'}</span>
        </Button>
      </div>
    );
  }

  // Telecaller isolation check: Telecaller can ONLY view assigned leads
  if (isTelecaller && !isAdmin) {
    const callerId = userProfile?.uid || currentUser?.uid;
    const isAssigned = lead.assignedTo === callerId || lead.assignedTelecallerId === callerId;
    if (!isAssigned) {
      return (
        <div className="p-8 bg-white rounded-3xl border border-red-200 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-xl font-bold text-red-800">
            {isMarathi ? 'प्रवेश नाकारला (Access Denied)' : 'Access Denied'}
          </h3>
          <p className="text-xs text-slate-500">
            {isMarathi 
              ? 'आपणाकडे ही लीड सोपवलेली नसल्याने ही माहिती पाहण्याची परवानगी नाही.'
              : 'You do not have permission to view this lead because it is not assigned to you.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/telecaller/leads')}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>{isMarathi ? 'माझ्या लीड्सकडे परत जा' : 'Back to My Leads'}</span>
          </Button>
        </div>
      );
    }
  }

  const currentStatus = lead.status || lead.leadStatus || 'New';
  const stConfig = statusConfig[currentStatus] || { 
    labelMr: currentStatus, 
    labelEn: currentStatus,
    bgColor: 'bg-slate-100 text-slate-700' 
  };

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(lead.leadNumber || lead.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTelecaller) return;
    await assignLead(lead.id, selectedTelecaller, assignmentReason);
    setAssignModalOpen(false);
    setSelectedTelecaller('');
    setAssignmentReason('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!targetStatus) return;
    await changeLeadStatus(lead.id, targetStatus, statusReason);
    setStatusModalOpen(false);
    setTargetStatus('');
    setStatusReason('');
  };

  const handleCallSubmit = async (e) => {
    e.preventDefault();
    await logCallAttempt(lead.id, callForm);
    setCallModalOpen(false);
    setCallForm({
      callOutcome: 'Connected / Discussed',
      parentResponse: '',
      nextFollowupAt: '',
      statusChange: ''
    });
  };

  const handleDuplicateReview = async (action) => {
    await resolveDuplicate(lead.id, duplicateInfo?.id, action, duplicateActionNotes);
    setDuplicateModalOpen(false);
    setDuplicateActionNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(isAdmin ? '/admin/leads' : '/telecaller/leads')}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
            title={isMarathi ? 'मागे जा' : 'Go back'}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-orange-50 text-gurukul-saffron-700 border border-orange-200">
                {lead.leadNumber || lead.id}
              </span>
              <button onClick={handleCopy} className="text-slate-400 hover:text-slate-600" title={isMarathi ? 'कॉपी करा' : 'Copy'}>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${stConfig.bgColor}`}>
                {isMarathi ? stConfig.labelMr : (stConfig.labelEn || currentStatus)}
              </span>
              {lead.isDuplicate && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{isMarathi ? 'संभाव्य नक्कल (Duplicate)' : 'Duplicate'}</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {lead.studentName} ({lead.admissionClass})
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Call */}
          <a
            href={`tel:${lead.normalizedMobile || lead.mobileNumber || lead.mobile}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-gurukul-saffron-600" />
            <span>{isMarathi ? 'कॉल: ' : 'Call: '}{lead.normalizedMobile || lead.mobileNumber || lead.mobile}</span>
          </a>

          {/* Quick WhatsApp */}
          <a
            href={`https://wa.me/91${lead.whatsapp || lead.whatsappNumber || lead.normalizedMobile || lead.mobileNumber}?text=${encodeURIComponent(isMarathi ? `नमस्कार ${lead.parentName}, मी गुरुकुल भोसे निवासी स्कूल व ज्युनिअर कॉलेजमधून संपर्क करत आहे.` : `Hello ${lead.parentName}, this is Gurukul Bhose Residential School & Junior College contacting you.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          {/* Record Call / Notes */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCallModalOpen(true)}
            className="text-xs rounded-xl"
          >
            <PhoneCall className="w-3.5 h-3.5 mr-1 text-gurukul-navy-700" />
            <span>{isMarathi ? 'कॉल नोंदवा' : 'Log Call'}</span>
          </Button>

          {/* Change Status */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusModalOpen(true)}
            className="text-xs rounded-xl"
          >
            <Edit className="w-3.5 h-3.5 mr-1 text-gurukul-saffron-600" />
            <span>{isMarathi ? 'स्थिती बदला' : 'Change Status'}</span>
          </Button>

          {/* Assign / Reassign (Admins Only) */}
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAssignModalOpen(true)}
              className="text-xs rounded-xl shadow-sm bg-gurukul-navy-900 hover:bg-gurukul-navy-800"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              <span>
                {lead.assignedTo || lead.assignedTelecallerId 
                  ? (isMarathi ? 'पुनर्नियुक्ती (Reassign)' : 'Reassign') 
                  : (isMarathi ? 'नेमणूक करा (Assign)' : 'Assign')}
              </span>
            </Button>
          )}

          {/* Duplicate Review Button (If Flagged) */}
          {isAdmin && lead.isDuplicate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDuplicateModalOpen(true)}
              className="text-xs rounded-xl border-red-300 text-red-700 hover:bg-red-50"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              <span>{isMarathi ? 'नक्कल पडताळणी' : 'Review Duplicate'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Duplicate Warning Alert Banner (If Applicable) */}
      {lead.isDuplicate && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{isMarathi ? 'संभाव्य नक्कल अर्ज (Duplicate Warning)' : 'Potential Duplicate Application'}</p>
              <p className="text-amber-800 mt-0.5">
                {isMarathi 
                  ? 'या अर्जातील मोबाईल क्रमांक व नाव पूर्वनोंदणीशी जुळत आहे.' 
                  : 'The mobile number and name in this application match an existing record.'}
                {duplicateInfo?.matchedLeadNumber && ` ${isMarathi ? 'जुळणारा लीड क्रमांक' : 'Matching Lead ID'}: ${duplicateInfo.matchedLeadNumber}`}
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setDuplicateModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 whitespace-nowrap self-start sm:self-auto"
            >
              {isMarathi ? 'निर्णय घ्या / Review' : 'Review'}
            </button>
          )}
        </div>
      )}

      {/* Grid: 3 Main Column Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: Lead Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Student & Parent Profile */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            
            {/* Student Section */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <GraduationCap className="w-4 h-4 text-gurukul-saffron-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {isMarathi ? 'विद्यार्थी तपशील (Student Details)' : 'Student Details'}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'विद्यार्थ्याचे पूर्ण नाव:' : 'Student Full Name:'}</span>
                  <span className="font-bold text-slate-800 text-sm">{lead.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'प्रवेश इयत्ता (Applying For):' : 'Applying For Class:'}</span>
                  <span className="font-bold text-gurukul-saffron-700 text-sm">{lead.admissionClass}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'सध्याची शाळा (Current School):' : 'Current School:'}</span>
                  <span className="font-medium text-slate-700">{lead.currentSchool || (isMarathi ? 'नोंद नाही' : 'Not recorded')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'सध्याची इयत्ता (Current Class):' : 'Current Class:'}</span>
                  <span className="font-medium text-slate-700">{lead.currentClass || (isMarathi ? 'नोंद नाही' : 'Not recorded')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'जन्मतारीख (DOB):' : 'Date of Birth (DOB):'}</span>
                  <span className="font-medium text-slate-700">{lead.dob || (isMarathi ? 'उपलब्ध नाही' : 'Not available')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'लिंग (Gender):' : 'Gender:'}</span>
                  <span className="font-medium text-slate-700">{lead.gender || 'Not Specified'}</span>
                </div>
              </div>
            </div>

            {/* Parent Section */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-gurukul-saffron-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {isMarathi ? 'पालक तपशील (Parent Details)' : 'Parent Details'}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'पालकांचे नाव:' : 'Parent Name:'}</span>
                  <span className="font-bold text-slate-800">{lead.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'मोबाईल क्रमांक:' : 'Mobile Number:'}</span>
                  <span className="font-bold font-mono text-slate-800">{lead.normalizedMobile || lead.mobileNumber || lead.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'WhatsApp क्रमांक:' : 'WhatsApp Number:'}</span>
                  <span className="font-medium font-mono text-slate-700">{lead.whatsapp || lead.whatsappNumber || (isMarathi ? 'उपलब्ध नाही' : 'Not available')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'ईमेल पत्ता:' : 'Email Address:'}</span>
                  <span className="font-medium text-slate-700">{lead.email || (isMarathi ? 'उपलब्ध नाही' : 'Not available')}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'पत्ता / गाव / शहर:' : 'Address / Town / City:'}</span>
                  <span className="font-medium text-slate-700">
                    {[lead.address, lead.city, lead.district, lead.state, lead.pinCode].filter(Boolean).join(', ') || (isMarathi ? 'उपलब्ध नाही' : 'Not available')}
                  </span>
                </div>
              </div>
            </div>

            {/* Enquiry Information */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-gurukul-saffron-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {isMarathi ? 'प्रवेश व अर्ज तपशील (Enquiry Details)' : 'Enquiry Details'}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'शैक्षणिक वर्ष (Academic Year):' : 'Academic Year:'}</span>
                  <span className="font-bold text-slate-800">{lead.academicYear || '2026-2027'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'इच्छुक कोर्स / शाखा:' : 'Interested Course / Stream:'}</span>
                  <span className="font-medium text-slate-700">{lead.course}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'अर्जाचा मार्ग (Source):' : 'Source:'}</span>
                  <span className="font-medium text-slate-700">{lead.source || lead.leadSource || 'Website'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'सोयीची संपर्क वेळ:' : 'Preferred Contact Time:'}</span>
                  <span className="font-medium text-slate-700">{lead.preferredContactTime || 'Anytime'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'नोंदणी दिनांक:' : 'Registration Date:'}</span>
                  <span className="font-medium text-slate-700">
                    {lead.createdAt ? new Date(lead.createdAt?.toDate ? lead.createdAt.toDate() : lead.createdAt).toLocaleString('en-IN') : (isMarathi ? 'उपलब्ध नाही' : 'Not available')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isMarathi ? 'शेवटचा संपर्क:' : 'Last Contacted:'}</span>
                  <span className="font-medium text-slate-700">
                    {lead.lastContactedAt ? new Date(lead.lastContactedAt?.toDate ? lead.lastContactedAt.toDate() : lead.lastContactedAt).toLocaleString('en-IN') : (isMarathi ? 'अद्याप नाही' : 'Not yet')}
                  </span>
                </div>
              </div>

              {lead.message && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isMarathi ? 'पालकांचा संदेश / विचारणा:' : 'Parent Message / Query:'}</span>
                  <p className="text-slate-700 mt-1 italic">"{lead.message}"</p>
                </div>
              )}

              {lead.adminRemarks && (
                <div className="mt-3 p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs">
                  <span className="text-orange-700 block text-[10px] uppercase font-bold">{isMarathi ? 'प्रशासकीय शेरा (Admin Remarks):' : 'Admin Remarks:'}</span>
                  <p className="text-slate-800 mt-1">{lead.adminRemarks}</p>
                </div>
              )}
            </div>

          </div>

          {/* Card 2: Chronological Activity Timeline */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-gurukul-saffron-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {isMarathi ? 'संपूर्ण कालक्रमानुसार इतिहास (Activity Timeline)' : 'Activity Timeline'} ({leadActivities.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {isMarathi ? 'बदलाव न करता येणारा नोंदींचा संग्रह' : 'Immutable audit trail'}
              </span>
            </div>

            {leadActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">{isMarathi ? 'अद्याप कोणतीही ॲक्टिव्हिटी नोंदवली नाही.' : 'No activity logged yet.'}</p>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {leadActivities.map((act) => (
                  <div key={act.id} className="relative group">
                    <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-gurukul-saffron-500 ring-4 ring-white"></span>
                    <div className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/60 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800">{act.activityType}</span>
                        <span className="text-[10px] text-slate-400">
                          {act.createdAt ? new Date(act.createdAt?.toDate ? act.createdAt.toDate() : act.createdAt).toLocaleString('en-IN') : ''}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{act.description}</p>
                      <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-400">
                        <span>{isMarathi ? 'कर्ते' : 'By'}: {act.performedByRole || 'Staff'}</span>
                        {act.newValue && (
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-600">
                            {act.newValue}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT: Assignments, Status History, Telecaller Workload (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Assigned Telecaller Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {isMarathi ? 'नियुक्त समुपदेशक (Assigned Counselor)' : 'Assigned Counselor'}
                </h3>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="text-xs font-bold text-gurukul-saffron-600 hover:text-gurukul-saffron-700"
                >
                  {isMarathi ? 'बदला' : 'Change'}
                </button>
              )}
            </div>

            {lead.assignedTo || lead.assignedTelecallerId ? (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                  {lead.assignedTelecallerName?.[0] || 'C'}
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">{lead.assignedTelecallerName || (isMarathi ? 'नियुक्त टेलिकॉलर' : 'Assigned Telecaller')}</h4>
                  <p className="text-emerald-800 text-[11px] mt-0.5">{isMarathi ? 'समुपदेशक सक्रिय आहे' : 'Counselor is active'}</p>
                  {lead.assignedAt && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      {isMarathi ? 'नेमणूक वेळ:' : 'Assigned at:'} {new Date(lead.assignedAt?.toDate ? lead.assignedAt.toDate() : lead.assignedAt).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs space-y-2">
                <p className="text-slate-500 font-medium">{isMarathi ? 'कोणताही समुपदेशक नियुक्त नाही (Unassigned)' : 'No counselor assigned (Unassigned)'}</p>
                {isAdmin && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setAssignModalOpen(true)}
                    className="w-full text-xs rounded-xl"
                  >
                    {isMarathi ? 'समुपदेशक नियुक्त करा' : 'Assign Counselor'}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Status Progression & History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {isMarathi ? 'स्थिती इतिहास (Status History)' : 'Status History'} ({leadStatusHistory.length})
              </h3>
              <button
                onClick={() => setStatusModalOpen(true)}
                className="text-xs font-bold text-gurukul-saffron-600 hover:text-gurukul-saffron-700"
              >
                {isMarathi ? 'स्थिती बदला' : 'Change Status'}
              </button>
            </div>

            {leadStatusHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">{isMarathi ? 'केवळ मूळ \'नवीन\' स्थिती नोंद आहे.' : 'Only initial \'New\' status recorded.'}</p>
            ) : (
              <div className="space-y-2.5">
                {leadStatusHistory.map((hist) => (
                  <div key={hist.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{hist.previousStatus} → {hist.newStatus}</span>
                      <span className="text-[10px] text-slate-400">
                        {hist.changedAt ? new Date(hist.changedAt?.toDate ? hist.changedAt.toDate() : hist.changedAt).toLocaleDateString('en-IN') : ''}
                      </span>
                    </div>
                    {hist.reason && <p className="text-[11px] text-slate-600 italic">{isMarathi ? 'कारण:' : 'Reason:'} {hist.reason}</p>}
                    <p className="text-[10px] text-slate-400">{isMarathi ? 'बदल कर्ते:' : 'Changed by:'} {hist.userRole || 'Staff'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignment History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
              {isMarathi ? 'नेमणूक इतिहास (Assignment History)' : 'Assignment History'} ({leadAssignments.length})
            </h3>
            {leadAssignments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">{isMarathi ? 'अद्याप नेमणूक इतिहास नाही.' : 'No assignment history yet.'}</p>
            ) : (
              <div className="space-y-2">
                {leadAssignments.map((asg) => (
                  <div key={asg.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{asg.telecallerName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${asg.assignmentStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {asg.assignmentStatus === 'active' ? (isMarathi ? 'सक्रिय' : 'Active') : (isMarathi ? 'बदली' : 'Transferred')}
                      </span>
                    </div>
                    {asg.assignmentReason && (
                      <p className="text-[11px] text-slate-500 mt-1">{isMarathi ? 'कारण:' : 'Reason:'} {asg.assignmentReason}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {isMarathi ? 'वेळ:' : 'Time:'} {asg.assignedAt ? new Date(asg.assignedAt?.toDate ? asg.assignedAt.toDate() : asg.assignedAt).toLocaleString('en-IN') : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MODAL 1: ASSIGN / REASSIGN TELECALLER */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={lead.assignedTo || lead.assignedTelecallerId 
          ? (isMarathi ? "लीड पुनर्नियुक्त करा (Reassign Lead)" : "Reassign Lead") 
          : (isMarathi ? "लीड समुपदेशकाकडे सोपवा (Assign Lead)" : "Assign Lead to Counselor")}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            {isMarathi ? 'विद्यार्थी:' : 'Student:'} <strong>{lead.studentName}</strong> ({lead.admissionClass}) [<strong>{lead.leadNumber}</strong>]
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'समुपदेशक निवडा (Select Telecaller)' : 'Select Counselor'} <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTelecaller}
              onChange={(e) => setSelectedTelecaller(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
              required
            >
              <option value="">{isMarathi ? '-- समुपदेशक निवडा --' : '-- Select Counselor --'}</option>
              {telecallers.map(t => (
                <option key={t.uid || t.id} value={t.uid || t.id}>
                  {t.fullName || t.displayName} ({t.employeeId || 'Telecaller'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'नेमणुकीचे / पुनर्नियुक्तीचे कारण (Reason)' : 'Assignment / Reassignment Reason'}
            </label>
            <input
              type="text"
              value={assignmentReason}
              onChange={(e) => setAssignmentReason(e.target.value)}
              placeholder={isMarathi ? 'उदा. नियमित वाटप, रजेमुळे वर्ग, इत्यादी.' : 'e.g. Regular allocation, transfer due to leave, etc.'}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setAssignModalOpen(false)}>
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {isMarathi ? 'जतन करा (Confirm Assignment)' : 'Confirm Assignment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: STATUS CHANGE */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={isMarathi ? 'लीड स्थिती अद्ययावत करा (Change Lead Status)' : 'Update Lead Status'}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <p>{isMarathi ? 'सध्याची स्थिती:' : 'Current Status:'} <strong>{isMarathi ? (statusConfig[currentStatus]?.labelMr || currentStatus) : (statusConfig[currentStatus]?.labelEn || currentStatus)}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'नवीन स्थिती (New Status)' : 'New Status'} <span className="text-red-500">*</span>
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-bold"
              required
            >
              <option value="">{isMarathi ? '-- नवीन स्थिती निवडा --' : '-- Select New Status --'}</option>
              {statusList.map(st => {
                const isAllowed = isAdmin || (permittedTransitions[currentStatus] || []).includes(st) || st === currentStatus;
                return (
                  <option key={st} value={st} disabled={!isAllowed}>
                    {isMarathi ? (statusConfig[st]?.labelMr || st) : (statusConfig[st]?.labelEn || st)} {!isAllowed ? (isMarathi ? '(परवानगी नाही)' : '(Not permitted)') : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'बदलाचे कारण / शेरा (Reason)' : 'Reason / Remarks'}
            </label>
            <input
              type="text"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder={isMarathi ? 'उदा. पालकांनी सकारात्मक प्रतिसाद दिला / फी भरण्यास तयार' : 'e.g. Parents gave positive response, ready for admission'}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setStatusModalOpen(false)}>
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {isMarathi ? 'स्थिती बदला (Update)' : 'Update Status'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: LOG CALL / CONTACT ATTEMPT */}
      <Modal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        title={isMarathi ? 'कॉल व संपर्क नोंदवा (Log Contact Attempt)' : 'Log Contact Attempt'}
      >
        <form onSubmit={handleCallSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'कॉलचा निकाल (Call Outcome)' : 'Call Outcome'} <span className="text-red-500">*</span>
            </label>
            <select
              value={callForm.callOutcome}
              onChange={(e) => setCallForm({ ...callForm, callOutcome: e.target.value })}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
            >
              <option value="Connected / Discussed">{isMarathi ? 'कॉल लागला व सविस्तर चर्चा झाली (Connected)' : 'Connected / Detailed Discussion'}</option>
              <option value="Busy / Call Waiting">{isMarathi ? 'कॉल व्यस्त / वेटिंग (Busy)' : 'Busy / Waiting'}</option>
              <option value="Not Answered / Ringing">{isMarathi ? 'फोन वाजला पण उचलला नाही (Ringing)' : 'Ringing / No Answer'}</option>
              <option value="Switch Off / Unreachable">{isMarathi ? 'स्विच ऑफ किंवा कव्हरेज क्षेत्राबाहेर (Switch Off)' : 'Switched Off / Unreachable'}</option>
              <option value="Callback Requested">{isMarathi ? 'पालकांनी नंतर फोन करण्यास सांगितले (Callback)' : 'Callback Requested'}</option>
              <option value="School Visit Booked">{isMarathi ? 'कॅम्पस भेट ठरली (Visit Scheduled)' : 'School Visit Scheduled'}</option>
              <option value="Wrong Number">{isMarathi ? 'चुकीचा नंबर (Wrong Number)' : 'Wrong Number'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'पालकांचा प्रतिसाद व टिपण (Parent Response & Call Notes)' : 'Parent Response & Notes'} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={callForm.parentResponse}
              onChange={(e) => setCallForm({ ...callForm, parentResponse: e.target.value })}
              placeholder={isMarathi ? 'पालकांशी झालेल्या संभाषणाचा मुख्य मुद्दे येथे लिहा...' : 'Record discussion points here...'}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isMarathi ? 'पुढील फॉलो-अप तारीख (Next Follow-up Date)' : 'Next Follow-up Date'}
              </label>
              <input
                type="date"
                value={callForm.nextFollowupAt}
                onChange={(e) => setCallForm({ ...callForm, nextFollowupAt: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isMarathi ? 'स्थिती बदला (ऐच्छिक)' : 'Change Status (Optional)'}
              </label>
              <select
                value={callForm.statusChange}
                onChange={(e) => setCallForm({ ...callForm, statusChange: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
              >
                <option value="">{isMarathi ? 'सध्याचीच स्थिती ठेवा' : 'Keep current status'}</option>
                {statusList.map(st => (
                  <option key={st} value={st}>
                    {isMarathi ? (statusConfig[st]?.labelMr || st) : (statusConfig[st]?.labelEn || st)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setCallModalOpen(false)}>
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {isMarathi ? 'नोंद जतन करा (Save Note)' : 'Save Call Note'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: DUPLICATE RESOLUTION (ADMIN) */}
      <Modal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        title={isMarathi ? 'नक्कल अर्जाची पडताळणी (Duplicate Review)' : 'Duplicate Review'}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            {isMarathi 
              ? 'या अर्जाची मुख्य पूर्वनोंदणीशी पडताळणी करा. दोन्ही नोंदी एकाच कुटुंबातील वेगवेगळ्या भावंडांच्या असल्यास किंवा स्वतंत्र असल्यास \'नवीन नोंदणी मंजूर करा\' निवडा.'
              : 'Review this enquiry against existing records. If this enquiry is for a sibling or separate student, select \'Keep as New Application\'.'}
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isMarathi ? 'प्रशासकीय शेरा (Admin Review Notes):' : 'Admin Review Notes:'}
            </label>
            <input
              type="text"
              value={duplicateActionNotes}
              onChange={(e) => setDuplicateActionNotes(e.target.value)}
              placeholder={isMarathi ? 'उदा. भावंड असल्याने स्वतंत्र अर्ज म्हणून मंजूर' : 'e.g. Sibling admission approved as separate lead'}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDuplicateReview('update_existing')}
              className="text-amber-800 border-amber-300 hover:bg-amber-50"
            >
              {isMarathi ? 'जुनी नोंद अपडेट करा (Merge)' : 'Merge into Existing'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleDuplicateReview('keep_as_new')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isMarathi ? 'नवीन स्वतंत्र अर्ज म्हणून मंजूर करा (Keep New)' : 'Keep as New Application'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
