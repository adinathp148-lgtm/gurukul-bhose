import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  PhoneCall, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  Plus, 
  Save, 
  ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCRM } from '../../contexts/CRMContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const TelecallerFollowUpsPage = () => {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'today';
  const leadIdParam = searchParams.get('leadId');

  const { currentUser } = useAuth();
  const { leads, followUps, addFollowUp } = useCRM();

  const telecallerUid = currentUser?.uid || '';
  const myLeads = leads.filter(l => l.assignedTelecallerId === telecallerUid);

  const todayStr = new Date().toISOString().split('T')[0];

  const [activeTab, setActiveTab] = useState(filterParam);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Call record form
  const [callForm, setCallForm] = useState({
    callType: 'Outgoing Call',
    parentResponse: '',
    statusOutcome: 'Interested',
    scheduledNextDate: '',
    suggestedAction: ''
  });

  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (leadIdParam) {
      const target = myLeads.find(l => l.id === leadIdParam);
      if (target) {
        setSelectedLead(target);
        setCallModalOpen(true);
      }
    }
  }, [leadIdParam, myLeads]);

  // Tab Filtering
  const todayLeads = myLeads.filter(l => l.nextFollowUp === todayStr && l.leadStatus !== 'Admitted');
  const overdueLeads = myLeads.filter(l => l.nextFollowUp && l.nextFollowUp < todayStr && l.leadStatus !== 'Admitted');
  const pendingLeads = myLeads.filter(l => l.nextFollowUp && l.nextFollowUp > todayStr && l.leadStatus !== 'Admitted');
  const allFollowUps = myLeads.filter(l => l.nextFollowUp);

  const displayedList = 
    activeTab === 'today' ? todayLeads :
    activeTab === 'overdue' ? overdueLeads :
    activeTab === 'pending' ? pendingLeads : allFollowUps;

  const handleOpenCallModal = (lead) => {
    setSelectedLead(lead);
    setCallForm({
      callType: 'Outgoing Call',
      parentResponse: '',
      statusOutcome: lead.leadStatus || 'Interested',
      scheduledNextDate: '',
      suggestedAction: ''
    });
    setCallModalOpen(true);
  };

  const handleSaveCall = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    await addFollowUp({
      leadId: selectedLead.id,
      ...callForm
    });

    setSuccessMsg(`${selectedLead.studentName} यांच्या पालकांशी झालेला कॉल यशस्वीपणे नोंदवला!`);
    setCallModalOpen(false);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-emerald-600" />
            <span>फॉलो-अप व कॉलिंग व्यवस्थापन</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            पालकांशी संपर्क साधा, कॉलचा सारांश नोंदवा आणि पुढील तारीख शेड्यूल करा
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'today'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>आजचे फॉलो-अप्स ({todayLeads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'overdue'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>थकबाकी (Overdue) ({overdueLeads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>पुढील फॉलो-अप्स ({pendingLeads.length})</span>
        </button>
      </div>

      {/* Calls Queue List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {displayedList.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-600">या विभागात कोणतेही कॉल्स प्रलंबित नाहीत!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedList.map((lead) => (
              <div key={lead.id} className="p-4 sm:p-5 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{lead.studentName}</span>
                    <Badge size="xs" variant={lead.leadStatus}>{lead.leadStatus}</Badge>
                    <span className="text-[11px] font-bold text-gurukul-navy-900 px-2 py-0.5 rounded bg-blue-50">
                      {lead.admissionClass}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    पालक: <strong className="text-slate-800">{lead.parentName}</strong> • {lead.mobileNumber}
                  </p>

                  <p className="text-xs text-slate-500">
                    शेवटचा प्रतिसाद: {lead.notes || 'नवीन लीड'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {lead.nextFollowUp || 'तारीख नाही'}
                  </span>

                  <a
                    href={`tel:${lead.mobileNumber}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="कॉल करा"
                  >
                    <Phone className="w-4 h-4 text-gurukul-navy-900" />
                  </a>

                  <a
                    href={`https://wa.me/91${lead.whatsappNumber || lead.mobileNumber}?text=${encodeURIComponent(`नमस्कार ${lead.parentName}, गुरुकुल भोसे निवासी स्कूल व कॉलेजमधून संपर्क करत आहोत.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                    title="WhatsApp मेसेज"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenCallModal(lead)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>कॉल नोंदवा</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call Recording Modal */}
      <Modal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        title="कॉल संभाषण नोंदवा (Log Follow-up Call)"
        subtitle={selectedLead ? `${selectedLead.studentName} (पालक: ${selectedLead.parentName} • ${selectedLead.mobileNumber})` : ''}
      >
        {selectedLead && (
          <form onSubmit={handleSaveCall} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  कॉलचा प्रकार
                </label>
                <select
                  value={callForm.callType}
                  onChange={(e) => setCallForm({ ...callForm, callType: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Outgoing Call">जाणारा कॉल (Outgoing Call)</option>
                  <option value="Incoming Call">आलेला कॉल (Incoming Call)</option>
                  <option value="WhatsApp Chat">WhatsApp चॅट</option>
                  <option value="Campus Visit">कॅम्पस भेट (In-Person)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  कॉलचा निकाल / स्थिती *
                </label>
                <select
                  value={callForm.statusOutcome}
                  onChange={(e) => setCallForm({ ...callForm, statusOutcome: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white font-bold"
                >
                  <option value="Interested">इच्छुक (Interested)</option>
                  <option value="Follow-up Scheduled">पुढील फॉलो-अप आवश्यक</option>
                  <option value="School Visit Planned">कॅम्पस भेट ठरली</option>
                  <option value="Admitted">प्रवेश निश्चित (Admitted)</option>
                  <option value="Not Interested">इच्छुक नाही (Not Interested)</option>
                  <option value="RNR">रिंग वाजली, उचलला नाही (RNR)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                पालकांचा प्रतिसाद व संभाषण सारांश *
              </label>
              <textarea
                required
                rows="3"
                placeholder="पालकांशी काय चर्चा झाली? शुल्काविषयी, हॉस्टेलविषयी किंवा भेटीविषयी काय ठरले?"
                value={callForm.parentResponse}
                onChange={(e) => setCallForm({ ...callForm, parentResponse: e.target.value })}
                className="w-full text-xs p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  पुढील फॉलो-अप तारीख (Next Date)
                </label>
                <input
                  type="date"
                  value={callForm.scheduledNextDate}
                  onChange={(e) => setCallForm({ ...callForm, scheduledNextDate: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  पुढील कृती योजना (Suggested Action)
                </label>
                <input
                  type="text"
                  placeholder="उदा. WhatsApp वर फी स्ट्रक्चर पाठवणे"
                  value={callForm.suggestedAction}
                  onChange={(e) => setCallForm({ ...callForm, suggestedAction: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" size="md" onClick={() => setCallModalOpen(false)}>
                रद्द करा
              </Button>
              <Button type="submit" variant="primary" size="md" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Save className="w-4 h-4 mr-1.5" />
                <span>नोंद साठवा (Save Record)</span>
              </Button>
            </div>

          </form>
        )}
      </Modal>

    </div>
  );
};
