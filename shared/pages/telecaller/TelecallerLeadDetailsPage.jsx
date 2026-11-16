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
  PhoneCall, 
  History, 
  ShieldCheck, 
  AlertTriangle,
  Edit,
  CheckCircle2
} from 'lucide-react';
import { useCRM } from '../../contexts/CRMContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const TelecallerLeadDetailsPage = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { 
    leads, 
    activities, 
    statusConfig, 
    statusList, 
    permittedTransitions, 
    changeLeadStatus, 
    logCallAttempt 
  } = useCRM();
  const { currentUser, userProfile, isAdmin } = useAuth();

  const callerUid = currentUser?.uid || userProfile?.uid;

  // Find lead
  const lead = useMemo(() => {
    return leads.find(l => l.id === leadId || l.leadNumber === leadId);
  }, [leads, leadId]);

  // Lead activities
  const leadActivities = useMemo(() => {
    return activities.filter(a => a.leadId === lead?.id || a.leadId === leadId || a.leadNumber === lead?.leadNumber)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [activities, lead, leadId]);

  // Modals
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callForm, setCallForm] = useState({
    callOutcome: 'Connected / Discussed',
    parentResponse: '',
    nextFollowupAt: '',
    statusChange: ''
  });

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  if (!lead) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">लीड उपलब्ध नाही (Lead Not Found)</h3>
        <p className="text-xs text-slate-500">दिलेल्या क्रमांकाची नोंद उपलब्ध नाही अथवा आपल्याकडे नेमलेली नाही.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/leads')}>
          माझ्या लीड्सकडे परत जा
        </Button>
      </div>
    );
  }

  // Strict Telecaller Isolation
  const isAssignedToMe = lead.assignedTo === callerUid || lead.assignedTelecallerId === callerUid;
  if (!isAssignedToMe && !isAdmin) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-red-200 text-center space-y-3">
        <ShieldCheck className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-red-800">प्रवेश नाकारला (Access Denied)</h3>
        <p className="text-xs text-slate-500">आपल्याकडे ही लीड सोपवलेली नाही. आपण केवळ स्वतःच्या लीड्स पाहू शकता.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/leads')}>
          माझ्या लीड्सकडे परत जा
        </Button>
      </div>
    );
  }

  const currentStatus = lead.status || lead.leadStatus || 'New';
  const stConf = statusConfig[currentStatus] || { labelMr: currentStatus, bgColor: 'bg-slate-100 text-slate-700' };

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

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!targetStatus) return;
    await changeLeadStatus(lead.id, targetStatus, statusReason);
    setStatusModalOpen(false);
    setTargetStatus('');
    setStatusReason('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/leads')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {lead.leadNumber || lead.id}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${stConf.bgColor}`}>
                {stConf.labelMr}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">
              {lead.studentName} ({lead.admissionClass})
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`tel:${lead.normalizedMobile || lead.mobileNumber || lead.mobile}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gurukul-navy-900 hover:bg-gurukul-navy-800 text-white text-xs font-bold shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>कॉल करा</span>
          </a>

          <a
            href={`https://wa.me/91${lead.whatsapp || lead.whatsappNumber || lead.normalizedMobile || lead.mobileNumber}?text=${encodeURIComponent(`नमस्कार ${lead.parentName}, मी गुरुकुल भोसे निवासी स्कूल व ज्युनिअर कॉलेजमधून संपर्क करत आहे.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCallModalOpen(true)}
            className="text-xs rounded-xl"
          >
            <PhoneCall className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span>कॉल नोंदवा</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusModalOpen(true)}
            className="text-xs rounded-xl"
          >
            <Edit className="w-3.5 h-3.5 mr-1 text-gurukul-saffron-600" />
            <span>स्थिती</span>
          </Button>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Lead Profile & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            {/* Student Info */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase text-slate-800">विद्यार्थी माहिती (Student Details)</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">नाव:</span>
                  <span className="font-bold text-slate-800">{lead.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">प्रवेश इयत्ता:</span>
                  <span className="font-bold text-emerald-700">{lead.admissionClass}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">सध्याची शाळा:</span>
                  <span className="text-slate-700 font-medium">{lead.currentSchool || 'नोंद नाही'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">सध्याची इयत्ता:</span>
                  <span className="text-slate-700 font-medium">{lead.currentClass || 'नोंद नाही'}</span>
                </div>
              </div>
            </div>

            {/* Parent Info */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase text-slate-800">पालक माहिती (Parent Details)</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">पालकांचे नाव:</span>
                  <span className="font-bold text-slate-800">{lead.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">मोबाईल:</span>
                  <span className="font-bold font-mono text-slate-800">{lead.normalizedMobile || lead.mobileNumber || lead.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">WhatsApp:</span>
                  <span className="font-medium font-mono text-slate-700">{lead.whatsapp || lead.whatsappNumber || 'उपलब्ध नाही'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">पत्ता / गाव:</span>
                  <span className="text-slate-700 font-medium">{lead.address || lead.city || 'सांगली'}</span>
                </div>
              </div>
            </div>

            {/* Program & Preferences */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase text-slate-800">कोर्स व प्राधान्य</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">शैक्षणिक वर्ष:</span>
                  <span className="font-bold text-slate-800">{lead.academicYear || '2026-2027'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">निवडलेला कोर्स:</span>
                  <span className="text-slate-700 font-medium">{lead.course}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">सोयीची वेळ:</span>
                  <span className="text-slate-700 font-medium">{lead.preferredContactTime || 'Anytime'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">पुढील फॉलो-अप:</span>
                  <span className="font-bold text-emerald-700">{lead.nextFollowUp || lead.nextFollowupAt || 'नियोजित नाही'}</span>
                </div>
              </div>

              {lead.message && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] font-bold">पालकांचे मूळ टिपण:</span>
                  <p className="text-slate-700 italic mt-0.5">"{lead.message}"</p>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right: Activity & Call History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase text-slate-800">कॉल व संपर्क इतिहास ({leadActivities.length})</h4>
              </div>
              <button
                onClick={() => setCallModalOpen(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                + नवीन कॉल
              </button>
            </div>

            {leadActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">अद्याप कोणताही कॉल किंवा बदल नोंदवलेला नाही.</p>
            ) : (
              <div className="space-y-3">
                {leadActivities.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{act.activityType}</span>
                      <span className="text-[10px] text-slate-400">
                        {act.createdAt ? new Date(act.createdAt?.toDate ? act.createdAt.toDate() : act.createdAt).toLocaleDateString('en-IN') : ''}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{act.description}</p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      नोंद कर्ते: {act.performedByRole || 'Telecaller'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MODAL: LOG CALL */}
      <Modal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        title="कॉल नोंदवा (Log Call Attempt)"
      >
        <form onSubmit={handleCallSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              कॉलचा निकाल <span className="text-red-500">*</span>
            </label>
            <select
              value={callForm.callOutcome}
              onChange={(e) => setCallForm({ ...callForm, callOutcome: e.target.value })}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
            >
              <option value="Connected / Discussed">कॉल लागला व सविस्तर चर्चा झाली</option>
              <option value="Busy / Call Waiting">कॉल व्यस्त होता</option>
              <option value="Not Answered / Ringing">फोन वाजला पण उचलला नाही</option>
              <option value="Switch Off">स्विच ऑफ किंवा कव्हरेजबाहेर</option>
              <option value="Callback Requested">पालकांनी नंतर फोन करण्यास सांगितले</option>
              <option value="School Visit Booked">कॅम्पस भेट ठरली</option>
              <option value="Not Interested">अनिच्छुक (Not Interested)</option>
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
              placeholder="पालकांशी झालेल्या संभाषणाचा तपशील..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                स्थिती बदला
              </label>
              <select
                value={callForm.statusChange}
                onChange={(e) => setCallForm({ ...callForm, statusChange: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="">सध्याची स्थिती ठेवा</option>
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
            <Button variant="primary" size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              नोंद जतन करा
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: STATUS CHANGE */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="स्थिती अद्ययावत करा"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">सध्याची स्थिती: <strong>{currentStatus}</strong></p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              नवीन स्थिती <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-bold"
            >
              <option value="">-- निवडा --</option>
              {statusList.map(st => {
                const allowed = (permittedTransitions[currentStatus] || []).includes(st) || st === currentStatus;
                return (
                  <option key={st} value={st} disabled={!allowed}>
                    {statusConfig[st]?.labelMr || st} {!allowed ? '(नियमबाह्य)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              कारण / टिपण
            </label>
            <input
              type="text"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="उदा. प्रवेश शुल्काविषयी विचारणा"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setStatusModalOpen(false)}>
              रद्द करा
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              स्थिती बदला
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
