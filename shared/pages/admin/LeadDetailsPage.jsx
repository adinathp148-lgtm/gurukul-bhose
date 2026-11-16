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
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const LeadDetailsPage = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
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
        <h3 className="text-xl font-bold text-slate-800">प्रवेश नोंदणी सापडली नाही (Lead Not Found)</h3>
        <p className="text-xs text-slate-500">दिलेल्या क्रमांकाची नोंद डेटाबेसमध्ये उपलब्ध नाही अथवा काढून टाकण्यात आली आहे.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/leads')}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>सर्व लीड्सकडे परत जा</span>
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
          <h3 className="text-xl font-bold text-red-800">प्रवेश नाकारला (Access Denied)</h3>
          <p className="text-xs text-slate-500">आपणाकडे ही लीड सोपवलेली नसल्याने ही माहिती पाहण्याची परवानगी नाही.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/telecaller/leads')}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>माझ्या लीड्सकडे परत जा</span>
          </Button>
        </div>
      );
    }
  }

  const currentStatus = lead.status || lead.leadStatus || 'New';
  const stConfig = statusConfig[currentStatus] || { labelMr: currentStatus, bgColor: 'bg-slate-100 text-slate-700' };

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
            title="मागे जा"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-orange-50 text-gurukul-saffron-700 border border-orange-200">
                {lead.leadNumber || lead.id}
              </span>
              <button onClick={handleCopy} className="text-slate-400 hover:text-slate-600" title="कॉपी करा">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${stConfig.bgColor}`}>
                {stConfig.labelMr}
              </span>
              {lead.isDuplicate && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>संभाव्य नक्कल (Duplicate)</span>
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
            <span>कॉल: {lead.normalizedMobile || lead.mobileNumber || lead.mobile}</span>
          </a>

          {/* Quick WhatsApp */}
          <a
            href={`https://wa.me/91${lead.whatsapp || lead.whatsappNumber || lead.normalizedMobile || lead.mobileNumber}?text=${encodeURIComponent(`नमस्कार ${lead.parentName}, मी गुरुकुल भोसे निवासी स्कूल व ज्युनिअर कॉलेजमधून संपर्क करत आहे.`)}`}
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
            <span>कॉल नोंदवा</span>
          </Button>

          {/* Change Status */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusModalOpen(true)}
            className="text-xs rounded-xl"
          >
            <Edit className="w-3.5 h-3.5 mr-1 text-gurukul-saffron-600" />
            <span>स्थिती बदला</span>
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
              <span>{lead.assignedTo || lead.assignedTelecallerId ? 'पुनर्नियुक्ती (Reassign)' : 'नेमणूक करा (Assign)'}</span>
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
              <span>नक्कल पडताळणी</span>
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
              <p className="font-bold">संभाव्य नक्कल अर्ज (Duplicate Warning)</p>
              <p className="text-amber-800 mt-0.5">
                या अर्जातील मोबाईल क्रमांक व नाव पूर्वनोंदणीशी जुळत आहे. 
                {duplicateInfo?.matchedLeadNumber && ` जुळणारा लीड क्रमांक: ${duplicateInfo.matchedLeadNumber}`}
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setDuplicateModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 whitespace-nowrap self-start sm:self-auto"
            >
              निर्णय घ्या / Review
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
                  विद्यार्थी तपशील (Student Details)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">विद्यार्थ्याचे पूर्ण नाव:</span>
                  <span className="font-bold text-slate-800 text-sm">{lead.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">प्रवेश इयत्ता (Applying For):</span>
                  <span className="font-bold text-gurukul-saffron-700 text-sm">{lead.admissionClass}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">सध्याची शाळा (Current School):</span>
                  <span className="font-medium text-slate-700">{lead.currentSchool || 'नोंद नाही'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">सध्याची इयत्ता (Current Class):</span>
                  <span className="font-medium text-slate-700">{lead.currentClass || 'नोंद नाही'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">जन्मतारीख (DOB):</span>
                  <span className="font-medium text-slate-700">{lead.dob || 'उपलब्ध नाही'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">लिंग (Gender):</span>
                  <span className="font-medium text-slate-700">{lead.gender || 'Not Specified'}</span>
                </div>
              </div>
            </div>

            {/* Parent Section */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-gurukul-saffron-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  पालक तपशील (Parent Details)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">पालकांचे नाव:</span>
                  <span className="font-bold text-slate-800">{lead.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">मोबाईल क्रमांक:</span>
                  <span className="font-bold font-mono text-slate-800">{lead.normalizedMobile || lead.mobileNumber || lead.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">WhatsApp क्रमांक:</span>
                  <span className="font-medium font-mono text-slate-700">{lead.whatsapp || lead.whatsappNumber || 'उपलब्ध नाही'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ईमेल पत्ता:</span>
                  <span className="font-medium text-slate-700">{lead.email || 'उपलब्ध नाही'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">पत्ता / गाव / शहर:</span>
                  <span className="font-medium text-slate-700">
                    {[lead.address, lead.city, lead.district, lead.state, lead.pinCode].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Enquiry Information */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-gurukul-saffron-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  प्रवेश व अर्ज तपशील (Enquiry Details)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">शैक्षणिक वर्ष (Academic Year):</span>
                  <span className="font-bold text-slate-800">{lead.academicYear || '2026-2027'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">इच्छुक कोर्स / शाखा:</span>
                  <span className="font-medium text-slate-700">{lead.course}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">अर्जाचा मार्ग (Source):</span>
                  <span className="font-medium text-slate-700">{lead.source || lead.leadSource || 'Website'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">सोयीची संपर्क वेळ:</span>
                  <span className="font-medium text-slate-700">{lead.preferredContactTime || 'Anytime'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">नोंदणी दिनांक:</span>
                  <span className="font-medium text-slate-700">
                    {lead.createdAt ? new Date(lead.createdAt?.toDate ? lead.createdAt.toDate() : lead.createdAt).toLocaleString('en-IN') : 'उपलब्ध नाही'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">शेवटचा संपर्क:</span>
                  <span className="font-medium text-slate-700">
                    {lead.lastContactedAt ? new Date(lead.lastContactedAt?.toDate ? lead.lastContactedAt.toDate() : lead.lastContactedAt).toLocaleString('en-IN') : 'अद्याप नाही'}
                  </span>
                </div>
              </div>

              {lead.message && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">पालकांचा संदेश / विचारणा:</span>
                  <p className="text-slate-700 mt-1 italic">"{lead.message}"</p>
                </div>
              )}

              {lead.adminRemarks && (
                <div className="mt-3 p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs">
                  <span className="text-orange-700 block text-[10px] uppercase font-bold">प्रशासकीय शेरा (Admin Remarks):</span>
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
                  संपूर्ण कालक्रमानुसार इतिहास (Activity Timeline) ({leadActivities.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">बदलाव न करता येणारा नोंदींचा संग्रह</span>
            </div>

            {leadActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">अद्याप कोणतीही ॲक्टिव्हिटी नोंदवली नाही.</p>
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
                        <span>कर्ते: {act.performedByRole || 'Staff'}</span>
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
                  नियुक्त समुपदेशक (Assigned Counselor)
                </h3>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="text-xs font-bold text-gurukul-saffron-600 hover:text-gurukul-saffron-700"
                >
                  बदला
                </button>
              )}
            </div>

            {lead.assignedTo || lead.assignedTelecallerId ? (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                  {lead.assignedTelecallerName?.[0] || 'C'}
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">{lead.assignedTelecallerName || 'Assigned Telecaller'}</h4>
                  <p className="text-emerald-800 text-[11px] mt-0.5">समुपदेशक सक्रिय आहे</p>
                  {lead.assignedAt && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      नेमणूक वेळ: {new Date(lead.assignedAt?.toDate ? lead.assignedAt.toDate() : lead.assignedAt).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs space-y-2">
                <p className="text-slate-500 font-medium">कोणताही समुपदेशक नियुक्त नाही (Unassigned)</p>
                {isAdmin && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setAssignModalOpen(true)}
                    className="w-full text-xs rounded-xl"
                  >
                    समुपदेशक नियुक्त करा
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Status Progression & History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                स्थिती इतिहास (Status History) ({leadStatusHistory.length})
              </h3>
              <button
                onClick={() => setStatusModalOpen(true)}
                className="text-xs font-bold text-gurukul-saffron-600 hover:text-gurukul-saffron-700"
              >
                स्थिती बदला
              </button>
            </div>

            {leadStatusHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">केवळ मूळ 'नवीन' स्थिती नोंद आहे.</p>
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
                    {hist.reason && <p className="text-[11px] text-slate-600 italic">कारण: {hist.reason}</p>}
                    <p className="text-[10px] text-slate-400">बदल कर्ते: {hist.userRole || 'Staff'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignment History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
              नेमणूक इतिहास (Assignment History) ({leadAssignments.length})
            </h3>
            {leadAssignments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">अद्याप नेमणूक इतिहास नाही.</p>
            ) : (
              <div className="space-y-2">
                {leadAssignments.map((asg) => (
                  <div key={asg.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{asg.telecallerName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${asg.assignmentStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {asg.assignmentStatus === 'active' ? 'सक्रिय' : 'बदली'}
                      </span>
                    </div>
                    {asg.assignmentReason && (
                      <p className="text-[11px] text-slate-500 mt-1">कारण: {asg.assignmentReason}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      वेळ: {asg.assignedAt ? new Date(asg.assignedAt?.toDate ? asg.assignedAt.toDate() : asg.assignedAt).toLocaleString('en-IN') : ''}
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
        title={lead.assignedTo || lead.assignedTelecallerId ? "लीड पुनर्नियुक्त करा (Reassign Lead)" : "लीड समुपदेशकाकडे सोपवा (Assign Lead)"}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            विद्यार्थी: <strong>{lead.studentName}</strong> ({lead.admissionClass}) [<strong>{lead.leadNumber}</strong>]
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              समुपदेशक निवडा (Select Telecaller) <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTelecaller}
              onChange={(e) => setSelectedTelecaller(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
              required
            >
              <option value="">-- समुपदेशक निवडा --</option>
              {telecallers.map(t => (
                <option key={t.uid || t.id} value={t.uid || t.id}>
                  {t.fullName || t.displayName} ({t.employeeId || 'Telecaller'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              नेमणुकीचे / पुनर्नियुक्तीचे कारण (Reason)
            </label>
            <input
              type="text"
              value={assignmentReason}
              onChange={(e) => setAssignmentReason(e.target.value)}
              placeholder="उदा. नियमित वाटप, रजेमुळे वर्ग, इत्यादी."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setAssignModalOpen(false)}>
              रद्द करा
            </Button>
            <Button variant="primary" size="sm" type="submit">
              जतन करा (Confirm Assignment)
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: STATUS CHANGE */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="लीड स्थिती अद्ययावत करा (Change Lead Status)"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <p>सध्याची स्थिती: <strong>{currentStatus}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              नवीन स्थिती (New Status) <span className="text-red-500">*</span>
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-bold"
              required
            >
              <option value="">-- नवीन स्थिती निवडा --</option>
              {statusList.map(st => {
                const isAllowed = isAdmin || (permittedTransitions[currentStatus] || []).includes(st) || st === currentStatus;
                return (
                  <option key={st} value={st} disabled={!isAllowed}>
                    {statusConfig[st]?.labelMr || st} {!isAllowed ? '(परवानगी नाही)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              बदलाचे कारण / शेरा (Reason)
            </label>
            <input
              type="text"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="उदा. पालकांनी सकारात्मक प्रतिसाद दिला / फी भरण्यास तयार"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setStatusModalOpen(false)}>
              रद्द करा
            </Button>
            <Button variant="primary" size="sm" type="submit">
              स्थिती बदला (Update)
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: LOG CALL / CONTACT ATTEMPT */}
      <Modal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        title="कॉल व संपर्क नोंदवा (Log Contact Attempt)"
      >
        <form onSubmit={handleCallSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              कॉलचा निकाल (Call Outcome) <span className="text-red-500">*</span>
            </label>
            <select
              value={callForm.callOutcome}
              onChange={(e) => setCallForm({ ...callForm, callOutcome: e.target.value })}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white font-medium"
            >
              <option value="Connected / Discussed">कॉल लागला व सविस्तर चर्चा झाली (Connected)</option>
              <option value="Busy / Call Waiting">कॉल व्यस्त / वेटिंग (Busy)</option>
              <option value="Not Answered / Ringing">फोन वाजला पण उचलला नाही (Ringing)</option>
              <option value="Switch Off / Unreachable">स्विच ऑफ किंवा कव्हरेज क्षेत्राबाहेर (Switch Off)</option>
              <option value="Callback Requested">पालकांनी नंतर फोन करण्यास सांगितले (Callback)</option>
              <option value="School Visit Booked">कॅम्पस भेट ठरली (Visit Scheduled)</option>
              <option value="Wrong Number">चुकीचा नंबर (Wrong Number)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              पालकांचा प्रतिसाद व टिपण (Parent Response & Call Notes) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={callForm.parentResponse}
              onChange={(e) => setCallForm({ ...callForm, parentResponse: e.target.value })}
              placeholder="पालकांशी झालेल्या संभाषणाचा मुख्य मुद्दे येथे लिहा..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                पुढील फॉलो-अप तारीख (Next Follow-up Date)
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
                स्थिती बदला (ऐच्छिक)
              </label>
              <select
                value={callForm.statusChange}
                onChange={(e) => setCallForm({ ...callForm, statusChange: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
              >
                <option value="">सध्याचीच स्थिती ठेवा</option>
                {statusList.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setCallModalOpen(false)}>
              रद्द करा
            </Button>
            <Button variant="primary" size="sm" type="submit">
              नोंद जतन करा (Save Note)
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: DUPLICATE RESOLUTION (ADMIN) */}
      <Modal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        title="नक्कल अर्जाची पडताळणी (Duplicate Review)"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            या अर्जाची मुख्य पूर्वनोंदणीशी पडताळणी करा. दोन्ही नोंदी एकाच कुटुंबातील वेगवेगळ्या भावंडांच्या असल्यास किंवा स्वतंत्र असल्यास 'नवीन नोंदणी मंजूर करा' निवडा.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              प्रशासकीय शेरा (Admin Review Notes):
            </label>
            <input
              type="text"
              value={duplicateActionNotes}
              onChange={(e) => setDuplicateActionNotes(e.target.value)}
              placeholder="उदा. भावंड असल्याने स्वतंत्र अर्ज म्हणून मंजूर"
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
              जुनी नोंद अपडेट करा (Merge)
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleDuplicateReview('keep_as_new')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              नवीन स्वतंत्र अर्ज म्हणून मंजूर करा (Keep New)
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
