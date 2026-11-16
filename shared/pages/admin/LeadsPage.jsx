import React, { useState } from 'react';
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
  PhoneCall
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const LeadsPage = () => {
  const { leads, telecallers, addLead, updateLead, assignLead, convertLeadToAdmission } = useCRM();
  const { isTelecaller, canManageUsers, userProfile } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [telecallerFilter, setTelecallerFilter] = useState('ALL');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [assignModalLead, setAssignModalLead] = useState(null);
  const [selectedTelecaller, setSelectedTelecaller] = useState('');
  const [convertModalLead, setConvertModalLead] = useState(null);
  const [convertData, setConvertData] = useState({
    feesTotal: 60000,
    feesPaid: 25000,
    rollNumber: '',
    hostelAllocated: 'Hostel Block A - Room 101'
  });

  // Manual entry form
  const [newLeadForm, setNewLeadForm] = useState({
    parentName: '',
    studentName: '',
    mobileNumber: '',
    whatsappNumber: '',
    email: '',
    admissionClass: 'इ. 5 वी',
    course: 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)',
    leadSource: 'Manual Entry',
    city: '',
    district: 'सांगली',
    notes: ''
  });
  const [addError, setAddError] = useState(null);

  // Filtering logic
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      (l.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.parentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.mobileNumber || '').includes(searchTerm) ||
      (l.city || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || l.leadStatus === statusFilter;
    const matchesSource = sourceFilter === 'ALL' || l.leadSource === sourceFilter;
    const matchesTelecaller = telecallerFilter === 'ALL' || l.assignedTelecallerId === telecallerFilter;

    return matchesSearch && matchesStatus && matchesSource && matchesTelecaller;
  });

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setAddError(null);

    const res = await addLead(newLeadForm);
    if (res.success) {
      setAddModalOpen(false);
      setNewLeadForm({
        parentName: '',
        studentName: '',
        mobileNumber: '',
        whatsappNumber: '',
        email: '',
        admissionClass: 'इ. 5 वी',
        course: 'गुरुकुल विद्यामंदिर (सैनिक पॅटर्न निवासी)',
        leadSource: 'Manual Entry',
        city: '',
        district: 'सांगली',
        notes: ''
      });
    } else {
      setAddError(res.message || 'त्रुटी आढळली.');
    }
  };

  const handleAssign = async () => {
    if (!assignModalLead || !selectedTelecaller) return;
    await assignLead(assignModalLead.id, selectedTelecaller);
    setAssignModalLead(null);
    setSelectedTelecaller('');
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!convertModalLead) return;
    await convertLeadToAdmission(convertModalLead.id, convertData);
    setConvertModalLead(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            लीड व्यवस्थापन व CRM (Lead Management)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            वेबसाईट, फेसबुक ऍड्स, व्हॉट्सॲप व प्रत्यक्ष चौकशीतून आलेल्या सर्व लीड्स
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setAddModalOpen(true)}
          className="shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>नवीन लीड नोंदवा (Manual Entry)</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="नाव, मोबाईल किंवा शहराने शोधा..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
          >
            <option value="ALL">सर्व स्थिती (All Status)</option>
            <option value="New">New (नवीन)</option>
            <option value="Assigned">Assigned (नेमून दिलेले)</option>
            <option value="Follow-up Scheduled">Follow-up Scheduled</option>
            <option value="Interested">Interested (इच्छुक)</option>
            <option value="School Visit Planned">School Visit Planned</option>
            <option value="Admitted">Admitted (प्रवेश निश्चित)</option>
            <option value="Lost / Not Interested">Lost / Not Interested</option>
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
          >
            <option value="ALL">सर्व मार्ग (All Sources)</option>
            <option value="Website">Website</option>
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Manual Entry">Manual Entry</option>
          </select>
        </div>

        {/* Telecaller Filter (for Admins) */}
        {!isTelecaller && (
          <div>
            <select
              value={telecallerFilter}
              onChange={(e) => setTelecallerFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
            >
              <option value="ALL">सर्व समुपदेशक (All Counselors)</option>
              {telecallers.map(t => (
                <option key={t.uid} value={t.uid}>{t.displayName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">विद्यार्थी व पालक</th>
                <th className="py-3.5 px-4">मोबाईल / संपर्क</th>
                <th className="py-3.5 px-4">इयत्ता व शाखा</th>
                <th className="py-3.5 px-4">मार्ग (Source)</th>
                <th className="py-3.5 px-4">समुपदेशक (Assigned)</th>
                <th className="py-3.5 px-4">स्थिती (Status)</th>
                <th className="py-3.5 px-4">पुढील फॉलो-अप</th>
                <th className="py-3.5 px-4 text-right">कृती (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    कोणतीही लीड आढळली नाही.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Student & Parent */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{lead.studentName}</div>
                      <div className="text-[11px] text-slate-500">पालक: {lead.parentName}</div>
                      {lead.city && (
                        <div className="text-[10px] text-slate-400">{lead.city}, {lead.district}</div>
                      )}
                    </td>

                    {/* Mobile & WhatsApp */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{lead.mobileNumber}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <a
                          href={`tel:${lead.mobileNumber}`}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                          title="कॉल करा"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://wa.me/91${lead.whatsappNumber || lead.mobileNumber}?text=${encodeURIComponent(`नमस्कार ${lead.parentName}, गुरुकुल भोसे निवासी स्कूल व कॉलेजमधून संपर्क करत आहोत.`)}`}
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
                      <div className="font-bold text-gurukul-navy-900">{lead.admissionClass}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{lead.course}</div>
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {lead.leadSource}
                      </span>
                    </td>

                    {/* Assigned Telecaller */}
                    <td className="py-3.5 px-4">
                      {lead.assignedTelecallerName ? (
                        <span className="text-[11px] font-semibold text-slate-800 block">
                          {lead.assignedTelecallerName}
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-bold">
                          Unassigned
                        </span>
                      )}
                      {canManageUsers && (
                        <button
                          onClick={() => {
                            setAssignModalLead(lead);
                            setSelectedTelecaller(lead.assignedTelecallerId || '');
                          }}
                          className="text-[10px] text-gurukul-saffron-600 hover:underline block mt-0.5"
                        >
                          बदला (Assign)
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge size="xs" variant={lead.leadStatus}>
                        {lead.leadStatus}
                      </Badge>
                    </td>

                    {/* Next Follow-up */}
                    <td className="py-3.5 px-4">
                      {lead.nextFollowUp ? (
                        <span className="text-[11px] font-bold text-slate-700">
                          {lead.nextFollowUp}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {lead.leadStatus !== 'Admitted' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => {
                            setConvertModalLead(lead);
                            setConvertData({
                              feesTotal: 60000,
                              feesPaid: 25000,
                              rollNumber: `R-${Math.floor(10 + Math.random() * 89)}`,
                              hostelAllocated: 'Hostel Block A - Room 102'
                            });
                          }}
                          className="text-[10px] py-1 px-2"
                        >
                          <GraduationCap className="w-3 h-3 mr-1" />
                          <span>प्रवेश द्या (Admit)</span>
                        </Button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="नवीन लीड नोंदवा (Add New Lead)"
        subtitle="पालक व विद्यार्थ्याचा अचूक तपशील नोंदवा"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          {addError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{addError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                पालकांचे नाव *
              </label>
              <input
                type="text"
                required
                value={newLeadForm.parentName}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, parentName: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                विद्यार्थ्याचे नाव *
              </label>
              <input
                type="text"
                required
                value={newLeadForm.studentName}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, studentName: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                मोबाईल नंबर *
              </label>
              <input
                type="tel"
                required
                value={newLeadForm.mobileNumber}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, mobileNumber: e.target.value, whatsappNumber: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp नंबर
              </label>
              <input
                type="tel"
                value={newLeadForm.whatsappNumber}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, whatsappNumber: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                प्रवेश इयत्ता *
              </label>
              <select
                value={newLeadForm.admissionClass}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, admissionClass: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
              >
                <option value="इ. 5 वी">इ. 5 वी</option>
                <option value="इ. 6 वी">इ. 6 वी</option>
                <option value="इ. 7 वी">इ. 7 वी</option>
                <option value="इ. 8 वी">इ. 8 वी</option>
                <option value="इ. 9 वी">इ. 9 वी</option>
                <option value="इ. 10 वी">इ. 10 वी</option>
                <option value="इ. 11 वी सायन्स">इ. 11 वी सायन्स</option>
                <option value="इ. 11 वी आर्टस्">इ. 11 वी आर्टस्</option>
                <option value="इ. 12 वी सायन्स">इ. 12 वी सायन्स</option>
                <option value="इ. 12 वी आर्टस्">इ. 12 वी आर्टस्</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                मार्ग (Lead Source)
              </label>
              <select
                value={newLeadForm.leadSource}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, leadSource: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Manual Entry">Manual Entry (प्रत्यक्ष नोंद)</option>
                <option value="Website">Website</option>
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                गाव / शहर
              </label>
              <input
                type="text"
                value={newLeadForm.city}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                जिल्हा
              </label>
              <input
                type="text"
                value={newLeadForm.district}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, district: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              प्राथमिक नोंद / टिपण्णी
            </label>
            <textarea
              rows={2}
              value={newLeadForm.notes}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="md" onClick={() => setAddModalOpen(false)}>
              रद्द करा
            </Button>
            <Button type="submit" variant="primary" size="md">
              लीड जतन करा
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Telecaller Modal */}
      <Modal
        isOpen={Boolean(assignModalLead)}
        onClose={() => setAssignModalLead(null)}
        title="लीड समुपदेशकास सोपवा (Assign Lead)"
        subtitle={`विद्यार्थी: ${assignModalLead?.studentName} (${assignModalLead?.mobileNumber})`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              टेलिकॉलर / समुपदेशक निवडा *
            </label>
            <select
              value={selectedTelecaller}
              onChange={(e) => setSelectedTelecaller(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">-- समुपदेशक निवडा --</option>
              {telecallers.map(t => (
                <option key={t.uid} value={t.uid}>{t.displayName} ({t.email})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={() => setAssignModalLead(null)}>
              रद्द करा
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!selectedTelecaller}
              onClick={handleAssign}
            >
              नेमणूक निश्चित करा
            </Button>
          </div>
        </div>
      </Modal>

      {/* Convert to Admission Modal */}
      <Modal
        isOpen={Boolean(convertModalLead)}
        onClose={() => setConvertModalLead(null)}
        title="लीडचे प्रवेशात रूपांतर करा (Convert to Admission)"
        subtitle={`विद्यार्थी: ${convertModalLead?.studentName} | वर्ग: ${convertModalLead?.admissionClass}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleConvert} className="space-y-4">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            ही कृती या लीडला कायमस्वरूपी ऍडमिशन रेकॉर्डमध्ये रूपांतरित करेल आणि मूळ चौकशी इतिहास जतन करेल.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                एकूण फी (Total Fees ₹) *
              </label>
              <input
                type="number"
                required
                value={convertData.feesTotal}
                onChange={(e) => setConvertData({ ...convertData, feesTotal: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                भरलेली फी (Paid ₹) *
              </label>
              <input
                type="number"
                required
                value={convertData.feesPaid}
                onChange={(e) => setConvertData({ ...convertData, feesPaid: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                रोल नंबर / हजेरी क्रमांक
              </label>
              <input
                type="text"
                value={convertData.rollNumber}
                onChange={(e) => setConvertData({ ...convertData, rollNumber: e.target.value })}
                placeholder="उदा. 10A-14"
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                वसतिगृह रूम वाटप (Hostel Room)
              </label>
              <input
                type="text"
                value={convertData.hostelAllocated}
                onChange={(e) => setConvertData({ ...convertData, hostelAllocated: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={() => setConvertModalLead(null)}>
              रद्द करा
            </Button>
            <Button type="submit" variant="success" size="md">
              प्रवेश निश्चित करा (Confirm Admission)
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
