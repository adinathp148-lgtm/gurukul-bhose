import React, { useState } from 'react';
import { useCRM } from '../../contexts/CRMContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PhoneCall, 
  Clock, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  MessageSquare, 
  Sparkles,
  Phone,
  MessageCircle,
  UserCheck
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const FollowUpsPage = () => {
  const { leads, followUps, logFollowUp, suggestNextFollowUpDate } = useCRM();
  const { userProfile, isTelecaller } = useAuth();

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');

  const [callForm, setCallForm] = useState({
    callType: 'Outgoing Call',
    statusOutcome: 'Interested',
    parentResponse: '',
    scheduledNextDate: '',
    suggestedAction: ''
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Open Call Log Modal for specific lead
  const openLogForLead = (lead) => {
    setSelectedLeadId(lead.id);
    const suggested = suggestNextFollowUpDate('Interested');
    setCallForm({
      callType: 'Outgoing Call',
      statusOutcome: 'Interested',
      parentResponse: '',
      scheduledNextDate: suggested,
      suggestedAction: 'Call to confirm campus visit'
    });
    setLogModalOpen(true);
  };

  const handleOutcomeChange = (e) => {
    const outcome = e.target.value;
    const autoDate = suggestNextFollowUpDate(outcome);
    setCallForm(prev => ({
      ...prev,
      statusOutcome: outcome,
      scheduledNextDate: autoDate
    }));
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeadId) return;

    await logFollowUp({
      leadId: selectedLeadId,
      ...callForm
    });

    setLogModalOpen(false);
  };

  // Group leads for priority follow-up
  const overdueQueue = leads.filter(l => l.nextFollowUp && l.nextFollowUp < todayStr && l.leadStatus !== 'Admitted');
  const todayQueue = leads.filter(l => l.nextFollowUp === todayStr && l.leadStatus !== 'Admitted');
  const upcomingQueue = leads.filter(l => l.nextFollowUp && l.nextFollowUp > todayStr && l.leadStatus !== 'Admitted');

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            फॉलो-अप व कॉल व्यवस्थापन (Follow-up Management)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            पालकांशी झालेले संवाद नोंदवा, पुढील तारखांचे नियोजन करा आणि वेळेवर स्मरणपत्रे मिळवा
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            if (leads.length > 0) {
              openLogForLead(leads[0]);
            }
          }}
        >
          <PhoneCall className="w-4 h-4 mr-1.5" />
          <span>कॉल प्रतिसाद नोंदवा (Log Call)</span>
        </Button>
      </div>

      {/* Overdue Alert Bar if any */}
      {overdueQueue.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <h4 className="font-bold text-xs">
                {overdueQueue.length} थकबाकी फॉलो-अप्स (Overdue Follow-ups) तातडीने पूर्ण करा!
              </h4>
              <p className="text-[11px] text-red-700 mt-0.5">
                या पालकांना आधी नियोजित केलेल्या तारखेला कॉल करणे बाकी आहे.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-600 text-white">
            High Priority
          </span>
        </div>
      )}

      {/* Follow-up Queue Tabs / Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active Follow-up Queue */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                कॉल्स रांग (Follow-up Calling Queue)
              </h3>
              <span className="text-xs text-slate-500">
                एकूण: {todayQueue.length + overdueQueue.length} प्रलंबित
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {[...overdueQueue, ...todayQueue, ...upcomingQueue].length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  सध्या कोणताही प्रलंबित कॉल नाही.
                </div>
              ) : (
                [...overdueQueue, ...todayQueue, ...upcomingQueue].map((lead) => {
                  const isOverdue = lead.nextFollowUp && lead.nextFollowUp < todayStr;
                  const isToday = lead.nextFollowUp === todayStr;

                  return (
                    <div 
                      key={lead.id} 
                      className={`p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4 ${
                        isOverdue ? 'bg-red-50/30' : isToday ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{lead.studentName}</span>
                          <Badge size="xs" variant={lead.leadStatus}>
                            {lead.leadStatus}
                          </Badge>
                          {isOverdue && (
                            <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-1.5 py-0.2 rounded">
                              Overdue
                            </span>
                          )}
                          {isToday && (
                            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                              Today
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500">
                          पालक: {lead.parentName} • {lead.mobileNumber} • {lead.admissionClass}
                        </p>

                        <p className="text-[11px] text-slate-600 font-medium">
                          शेवटची नोंद: {lead.notes || 'नवीन नोंद'}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                          <span>नियोजित: <strong>{lead.nextFollowUp || 'नाही'}</strong></span>
                          <span>•</span>
                          <span>समुपदेशक: {lead.assignedTelecallerName || 'Unassigned'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`tel:${lead.mobileNumber}`}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                          title="कॉल करा"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/91${lead.whatsappNumber || lead.mobileNumber}?text=${encodeURIComponent(`नमस्कार ${lead.parentName}, गुरुकुल भोसे निवासी स्कूल व कॉलेजमधून संपर्क करत आहोत.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openLogForLead(lead)}
                          className="text-[11px] py-1 px-2.5 font-bold"
                        >
                          नोंदवा (Log)
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Activity Timeline */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <History className="w-4 h-4 text-gurukul-saffron-600" />
              <h3 className="font-bold text-sm text-slate-900">
                संपूर्ण कॉलिंग इतिहास (Activity Timeline)
              </h3>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {followUps.length === 0 ? (
                <p className="text-xs text-slate-400">अद्याप कोणताही कॉल नोंदवलेला नाही.</p>
              ) : (
                followUps.map((fol) => {
                  const lead = leads.find(l => l.id === fol.leadId);
                  return (
                    <div key={fol.id} className="relative group">
                      <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-gurukul-saffron-500 border-2 border-white ring-2 ring-orange-200"></div>
                      
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900">
                            {lead ? lead.studentName : 'Lead'}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {new Date(fol.contactedAt).toLocaleDateString('mr-IN')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">
                          "{fol.parentResponse}"
                        </p>

                        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                          <span>समुपदेशक: <strong>{fol.telecallerName}</strong></span>
                          <Badge size="xs" variant={fol.statusOutcome}>
                            {fol.statusOutcome}
                          </Badge>
                        </div>

                        {fol.scheduledNextDate && (
                          <div className="text-[10px] text-gurukul-saffron-700 font-semibold pt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>पुढील फॉलो-अप: {fol.scheduledNextDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Log Call Modal */}
      <Modal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        title="कॉल संभाषण नोंदवा (Log Call Interaction)"
        subtitle="पालकांचा प्रतिसाद, स्थिती व पुढील तारीख नोंदवा"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              विद्यार्थी / पालक निवडा *
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
            >
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.studentName} ({l.parentName} - {l.mobileNumber}) [{l.leadStatus}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                कॉल प्रकार (Call Type)
              </label>
              <select
                value={callForm.callType}
                onChange={(e) => setCallForm({ ...callForm, callType: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Outgoing Call">Outgoing Call (संस्थेने केलेला कॉल)</option>
                <option value="Incoming Call">Incoming Call (पालकांचा कॉल)</option>
                <option value="WhatsApp Chat">WhatsApp Chat</option>
                <option value="School Visit">School Visit (कॅम्पस भेट)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                संभाषणाचा निष्कर्ष (Status) *
              </label>
              <select
                value={callForm.statusOutcome}
                onChange={handleOutcomeChange}
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white font-semibold"
              >
                <option value="Interested">Interested (इच्छुक - 3 Days)</option>
                <option value="High Interest">High Interest (अतिइच्छुक - 1 Day)</option>
                <option value="Follow-up Scheduled">Follow-up Scheduled (2 Days)</option>
                <option value="School Visit Planned">School Visit Planned (कॅम्पस भेट)</option>
                <option value="Call Not Picked / Busy">Call Not Picked / Busy (1 Day)</option>
                <option value="Thinking / Considering">Thinking / Considering (4 Days)</option>
                <option value="Lost / Not Interested">Lost / Not Interested</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              पालकांचा प्रतिसाद / संवाद तपशील (Parent Response) *
            </label>
            <textarea
              rows={3}
              required
              value={callForm.parentResponse}
              onChange={(e) => setCallForm({ ...callForm, parentResponse: e.target.value })}
              placeholder="उदा. पालकांशी चर्चा झाली. त्यांनी फी व हॉस्टेल सोयीबद्दल विचारले. रविवारी भेट देण्याचे ठरवले आहे."
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gurukul-saffron-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>पुढील फॉलो-अप तारीख नियोजन (Next Follow-up Date)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  const auto = suggestNextFollowUpDate(callForm.statusOutcome);
                  setCallForm(prev => ({ ...prev, scheduledNextDate: auto }));
                }}
                className="text-[10px] font-bold text-gurukul-saffron-700 hover:underline"
              >
                Auto-Suggest Date
              </button>
            </div>

            <input
              type="date"
              required
              value={callForm.scheduledNextDate}
              onChange={(e) => setCallForm({ ...callForm, scheduledNextDate: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={() => setLogModalOpen(false)}>
              रद्द करा
            </Button>
            <Button type="submit" variant="primary" size="md">
              कॉल नोंद सेव्ह करा
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
