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
import { useLanguage } from '../../contexts/LanguageContext';

export const LeadsPage = () => {
  const { leads, telecallers, addLead, updateLead, assignLead, convertLeadToAdmission } = useCRM();
  const { isTelecaller, canManageUsers, userProfile } = useAuth();
  const { isMarathi } = useLanguage();

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
            {isMarathi ? 'लीड व्यवस्थापन व CRM (Lead Management)' : 'Lead Management & CRM'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isMarathi 
              ? 'वेबसाईट, फेसबुक ऍड्स, व्हॉट्सॲप व प्रत्यक्ष चौकशीतून आलेल्या सर्व लीड्स' 
              : 'All incoming leads from Website, Meta Ads, WhatsApp and Direct Enquiries'}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setAddModalOpen(true)}
          className="shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>{isMarathi ? 'नवीन लीड नोंदवा (Manual Entry)' : 'Add New Lead (Manual Entry)'}</span>
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
            placeholder={isMarathi ? 'नाव, मोबाईल किंवा शहराने शोधा...' : 'Search by name, phone or city...'}
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
            <option value="ALL">{isMarathi ? 'सर्व स्थिती (All Status)' : 'All Statuses'}</option>
            <option value="New">{isMarathi ? 'New (नवीन)' : 'New Leads'}</option>
            <option value="Assigned">{isMarathi ? 'Assigned (नेमून दिलेले)' : 'Assigned'}</option>
            <option value="Follow-up Scheduled">{isMarathi ? 'Follow-up Scheduled (फॉलो-अप)' : 'Follow-up Scheduled'}</option>
            <option value="Interested">{isMarathi ? 'Interested (इच्छुक)' : 'Interested'}</option>
            <option value="School Visit Planned">{isMarathi ? 'School Visit Planned (कॅम्पस भेट)' : 'School Visit Planned'}</option>
            <option value="Admitted">{isMarathi ? 'Admitted (प्रवेश निश्चित)' : 'Admitted'}</option>
            <option value="Lost / Not Interested">{isMarathi ? 'Lost / Not Interested (अनिच्छुक)' : 'Lost / Not Interested'}</option>
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
          >
            <option value="ALL">{isMarathi ? 'सर्व मार्ग (All Sources)' : 'All Sources'}</option>
            <option value="Website">{isMarathi ? 'वेबसाईट (Website)' : 'Website'}</option>
            <option value="Facebook Ads">{isMarathi ? 'फेसबुक ऍड्स (Facebook Ads)' : 'Facebook Ads'}</option>
            <option value="WhatsApp">{isMarathi ? 'व्हॉट्सॲप (WhatsApp)' : 'WhatsApp'}</option>
            <option value="Manual Entry">{isMarathi ? 'थेट नोंद (Manual Entry)' : 'Manual Entry'}</option>
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
              <option value="ALL">{isMarathi ? 'सर्व समुपदेशक (All Counselors)' : 'All Counselors'}</option>
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
                <th className="py-3.5 px-4">{isMarathi ? 'विद्यार्थी व पालक' : 'Student & Parent'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'मोबाईल / संपर्क' : 'Mobile / Contact'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'इयत्ता व शाखा' : 'Class & Stream'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'मार्ग (Source)' : 'Source'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'समुपदेशक (Assigned)' : 'Assigned Counselor'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'स्थिती (Status)' : 'Status'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'पुढील फॉलो-अप' : 'Next Follow-up'}</th>
                <th className="py-3.5 px-4 text-right">{isMarathi ? 'कृती (Actions)' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    {isMarathi ? 'कोणतीही लीड आढळली नाही.' : 'No leads found matching criteria.'}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Student & Parent */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{lead.studentName}</div>
                      <div className="text-[11px] text-slate-500">
                        {isMarathi ? 'पालक' : 'Parent'}: {lead.parentName}
                      </div>
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
                          title={isMarathi ? "कॉल करा" : "Call"}
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
                          {isMarathi ? 'अनियुक्त' : 'Unassigned'}
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
                          {isMarathi ? 'बदला (Assign)' : 'Assign Counselor'}
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
                          <span>{isMarathi ? 'प्रवेश द्या (Admit)' : 'Admit Student'}</span>
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
        title={isMarathi ? 'नवीन लीड नोंदवा (Add New Lead)' : 'Add New Lead (Manual Entry)'}
        subtitle={isMarathi ? 'पालक व विद्यार्थ्याचा अचूक तपशील नोंदवा' : 'Enter accurate details of parent and student'}
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
                {isMarathi ? 'पालकांचे नाव *' : 'Parent Name *'}
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
                {isMarathi ? 'विद्यार्थ्याचे नाव *' : 'Student Name *'}
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
                {isMarathi ? 'मोबाईल नंबर *' : 'Mobile Number *'}
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
                {isMarathi ? 'WhatsApp नंबर' : 'WhatsApp Number'}
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
                {isMarathi ? 'प्रवेश इयत्ता *' : 'Admission Class *'}
              </label>
              <select
                value={newLeadForm.admissionClass}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, admissionClass: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
              >
                <option value="इ. 5 वी">{isMarathi ? 'इ. 5 वी' : '5th Standard'}</option>
                <option value="इ. 6 वी">{isMarathi ? 'इ. 6 वी' : '6th Standard'}</option>
                <option value="इ. 7 वी">{isMarathi ? 'इ. 7 वी' : '7th Standard'}</option>
                <option value="इ. 8 वी">{isMarathi ? 'इ. 8 वी' : '8th Standard'}</option>
                <option value="इ. 9 वी">{isMarathi ? 'इ. 9 वी' : '9th Standard'}</option>
                <option value="इ. 10 वी">{isMarathi ? 'इ. 10 वी' : '10th Standard'}</option>
                <option value="इ. 11 वी सायन्स">{isMarathi ? 'इ. 11 वी सायन्स' : '11th Science'}</option>
                <option value="इ. 11 वी आर्टस्">{isMarathi ? 'इ. 11 वी आर्टस्' : '11th Arts'}</option>
                <option value="इ. 12 वी सायन्स">{isMarathi ? 'इ. 12 वी सायन्स' : '12th Science'}</option>
                <option value="इ. 12 वी आर्टस्">{isMarathi ? 'इ. 12 वी आर्टस्' : '12th Arts'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isMarathi ? 'मार्ग (Lead Source)' : 'Lead Source'}
              </label>
              <select
                value={newLeadForm.leadSource}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, leadSource: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Manual Entry">{isMarathi ? 'Manual Entry (प्रत्यक्ष नोंद)' : 'Manual Entry'}</option>
                <option value="Website">{isMarathi ? 'वेबसाईट (Website)' : 'Website'}</option>
                <option value="Facebook Ads">{isMarathi ? 'फेसबुक ऍड्स (Facebook Ads)' : 'Facebook Ads'}</option>
                <option value="WhatsApp">{isMarathi ? 'व्हॉट्सॲप (WhatsApp)' : 'WhatsApp'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isMarathi ? 'गाव / शहर' : 'Village / City'}
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
                {isMarathi ? 'जिल्हा' : 'District'}
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
              {isMarathi ? 'प्राथमिक नोंद / टिपण्णी' : 'Initial Remarks / Notes'}
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
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" size="md">
              {isMarathi ? 'लीड जतन करा' : 'Save Lead'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Telecaller Modal */}
      <Modal
        isOpen={Boolean(assignModalLead)}
        onClose={() => setAssignModalLead(null)}
        title={isMarathi ? 'लीड समुपदेशकास सोपवा (Assign Lead)' : 'Assign Lead to Counselor'}
        subtitle={`${isMarathi ? 'विद्यार्थी' : 'Student'}: ${assignModalLead?.studentName} (${assignModalLead?.mobileNumber})`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isMarathi ? 'टेलिकॉलर / समुपदेशक निवडा *' : 'Select Counselor *'}
            </label>
            <select
              value={selectedTelecaller}
              onChange={(e) => setSelectedTelecaller(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">{isMarathi ? '-- समुपदेशक निवडा --' : '-- Select Counselor --'}</option>
              {telecallers.map(t => (
                <option key={t.uid} value={t.uid}>{t.displayName} ({t.email})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={() => setAssignModalLead(null)}>
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!selectedTelecaller}
              onClick={handleAssign}
            >
              {isMarathi ? 'नेमणूक निश्चित करा' : 'Confirm Assignment'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Convert to Admission Modal */}
      <Modal
        isOpen={Boolean(convertModalLead)}
        onClose={() => setConvertModalLead(null)}
        title={isMarathi ? 'लीडचे प्रवेशात रूपांतर करा (Convert to Admission)' : 'Convert Lead to Admission'}
        subtitle={`${isMarathi ? 'विद्यार्थी' : 'Student'}: ${convertModalLead?.studentName} | ${isMarathi ? 'वर्ग' : 'Class'}: ${convertModalLead?.admissionClass}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleConvert} className="space-y-4">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            {isMarathi 
              ? 'ही कृती या लीडला कायमस्वरूपी ऍडमिशन रेकॉर्डमध्ये रूपांतरित करेल आणि मूळ चौकशी इतिहास जतन करेल.' 
              : 'This action permanently converts this lead into an official enrolled admission record while preserving past history.'}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isMarathi ? 'एकूण फी (Total Fees ₹) *' : 'Total Course Fees (₹) *'}
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
                {isMarathi ? 'भरलेली फी (Paid ₹) *' : 'Paid Advance (₹) *'}
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
                {isMarathi ? 'रोल नंबर / हजेरी क्रमांक' : 'Roll / Admission Number'}
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
                {isMarathi ? 'वसतिगृह रूम वाटप (Hostel Room)' : 'Hostel Room Allocated'}
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
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </Button>
            <Button type="submit" variant="success" size="md">
              {isMarathi ? 'प्रवेश निश्चित करा (Confirm Admission)' : 'Confirm Admission'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
