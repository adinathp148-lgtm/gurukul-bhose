import React, { useState } from 'react';
import { useCRM } from '../../contexts/CRMContext';
import { 
  GraduationCap, 
  Search, 
  Printer, 
  Receipt, 
  FileText, 
  CheckCircle2, 
  Building2, 
  Phone,
  Eye,
  Shield
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useLanguage } from '../../contexts/LanguageContext';

export const AdmissionsPage = () => {
  const { admissions } = useCRM();
  const { isMarathi } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmission, setSelectedAdmission] = useState(null);

  const filtered = admissions.filter(a => 
    (a.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.admissionNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.parentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.mobileNumber || '').includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            {isMarathi ? 'प्रवेश व्यवस्थापन व विद्यार्थी प्रोफाइल (Admissions Management)' : 'Admissions Register & Student Profiles'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isMarathi 
              ? 'लीड्समधून निश्चित झालेले सर्व प्रवेश, मूळ चौकशी इतिहास व वसतिगृह तपशील' 
              : 'All confirmed student admissions, preserved enquiry history and hostel records'}
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          <span>{isMarathi ? `एकूण निश्चित प्रवेश: ${admissions.length} विद्यार्थी` : `Total Confirmed Admissions: ${admissions.length}`}</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isMarathi ? 'प्रवेश क्रमांक, विद्यार्थी किंवा पालकाचे नाव शोधा...' : 'Search by admission no., student or parent name...'}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full max-w-full min-w-0">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full min-w-[880px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{isMarathi ? 'प्रवेश क्रमांक' : 'Admission No.'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'विद्यार्थी नाव' : 'Student Name'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'पालक व संपर्क' : 'Parent & Contact'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'इयत्ता व शाखा' : 'Class & Course'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'प्रवेश तारीख' : 'Admission Date'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'वसतिगृह रूम' : 'Hostel Room'}</th>
                <th className="py-3.5 px-4">{isMarathi ? 'फी स्थिती (Fees)' : 'Fee Status'}</th>
                <th className="py-3.5 px-4 text-right">{isMarathi ? 'कृती' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    {isMarathi ? 'कोणतेही प्रवेश रेकॉर्ड आढळले नाही.' : 'No admission records found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-gurukul-navy-900">
                      {adm.admissionNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{adm.studentName}</div>
                      <div className="text-[10px] text-slate-400">
                        {isMarathi ? 'हजेरी क्रमांक' : 'Roll No'}: {adm.rollNumber || (isMarathi ? 'अद्याप नाही' : 'Not assigned')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700">{adm.parentName}</div>
                      <div className="text-[11px] text-slate-500">{adm.mobileNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{adm.admissionClass}</div>
                      <div className="text-[10px] text-slate-500">{adm.course}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {adm.admissionDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold text-slate-700 px-2 py-0.5 rounded bg-slate-100">
                        {adm.hostelAllocated}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">₹{adm.feesPaid} / ₹{adm.feesTotal}</div>
                      {adm.feesPending > 0 ? (
                        <div className="text-[10px] font-bold text-amber-600">
                          {isMarathi ? `बाकी: ₹${adm.feesPending}` : `Pending: ₹${adm.feesPending}`}
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-emerald-600">
                          {isMarathi ? 'पूर्ण भरणा ✓' : 'Fully Paid ✓'}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAdmission(adm)}
                        className="text-xs py-1 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>{isMarathi ? 'तपशील' : 'View Details'}</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Admission Profile & Original History Modal */}
      <Modal
        isOpen={Boolean(selectedAdmission)}
        onClose={() => setSelectedAdmission(null)}
        title={isMarathi ? 'विद्यार्थी प्रवेश प्रोफाइल (Student Admission Profile)' : 'Student Admission Profile & Dossier'}
        subtitle={`${isMarathi ? 'प्रवेश क्रमांक' : 'Admission No.'}: ${selectedAdmission?.admissionNumber}`}
        maxWidth="max-w-2xl"
      >
        {selectedAdmission && (
          <div className="space-y-6">
            
            {/* Top Badge Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-gurukul-navy-950 to-gurukul-navy-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-gurukul-saffron-400">
                  {isMarathi ? 'निश्चित प्रवेश नोंद (Confirmed Admission)' : 'Confirmed Admission Record'}
                </span>
                <h3 className="text-lg font-black">{selectedAdmission.studentName}</h3>
                <p className="text-xs text-slate-300">
                  {selectedAdmission.admissionClass} • {selectedAdmission.course}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">{isMarathi ? 'प्रवेश दिनांक' : 'Admission Date'}</span>
                <span className="font-bold text-sm text-yellow-400">{selectedAdmission.admissionDate}</span>
              </div>
            </div>

            {/* Academic & Hostel Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border">
                <span className="text-slate-400 block text-[10px]">{isMarathi ? 'रोल नंबर' : 'Roll Number'}</span>
                <span className="font-bold text-slate-900">{selectedAdmission.rollNumber || (isMarathi ? 'अद्याप नाही' : 'N/A')}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border">
                <span className="text-slate-400 block text-[10px]">{isMarathi ? 'वसतिगृह रूम' : 'Hostel Room'}</span>
                <span className="font-bold text-slate-900">{selectedAdmission.hostelAllocated}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border">
                <span className="text-slate-400 block text-[10px]">{isMarathi ? 'रक्तगट (Blood Group)' : 'Blood Group'}</span>
                <span className="font-bold text-slate-900">{selectedAdmission.bloodGroup || (isMarathi ? 'नोंद नाही' : 'Not Specified')}</span>
              </div>
            </div>

            {/* Parent Details */}
            <div className="p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-gurukul-saffron-600">
                {isMarathi ? 'पालक संपर्क व पत्ता' : 'Parent Contact & Residential Details'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <p><strong>{isMarathi ? 'पालकांचे नाव:' : 'Parent Name:'}</strong> {selectedAdmission.parentName}</p>
                <p><strong>{isMarathi ? 'मोबाईल नंबर:' : 'Mobile Number:'}</strong> {selectedAdmission.mobileNumber}</p>
                <p><strong>{isMarathi ? 'WhatsApp:' : 'WhatsApp:'}</strong> {selectedAdmission.whatsappNumber}</p>
                <p><strong>{isMarathi ? 'पत्ता:' : 'Address:'}</strong> {selectedAdmission.address || (isMarathi ? 'सांगली' : 'Sangli')}</p>
              </div>
            </div>

            {/* Preserved Original Enquiry History */}
            {selectedAdmission.originalEnquiryHistory && (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1.5">
                <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isMarathi ? 'जतन केलेला मूळ चौकशी इतिहास (Preserved Enquiry History)' : 'Preserved Inbound Lead History'}</span>
                </h4>
                <p className="text-slate-700">
                  <strong>{isMarathi ? 'मूळ मार्ग (Source):' : 'Original Lead Source:'}</strong> {selectedAdmission.originalEnquiryHistory.source}
                </p>
                <p className="text-slate-700">
                  <strong>{isMarathi ? 'चौकशी नोंदणी तारीख:' : 'Original Inbound Date:'}</strong> {selectedAdmission.originalEnquiryHistory.createdAt ? new Date(selectedAdmission.originalEnquiryHistory.createdAt).toLocaleString(isMarathi ? 'mr-IN' : 'en-US') : 'N/A'}
                </p>
                <p className="text-slate-700">
                  <strong>{isMarathi ? 'नेमून दिलेले समुपदेशक:' : 'Assigned Counselor:'}</strong> {selectedAdmission.originalEnquiryHistory.assignedTelecaller || 'N/A'}
                </p>
                <p className="text-slate-700">
                  <strong>{isMarathi ? 'प्राथमिक टिपण्णी:' : 'Original Notes:'}</strong> {selectedAdmission.originalEnquiryHistory.initialNotes}
                </p>
              </div>
            )}

            {/* Fee summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">{isMarathi ? 'एकूण शुल्क' : 'Total Course Fees'}</span>
                <span className="font-black text-slate-900 text-base">₹{selectedAdmission.feesTotal}</span>
              </div>
              <div>
                <span className="text-emerald-700 block font-semibold">{isMarathi ? 'भरलेली रक्कम' : 'Fees Paid'}</span>
                <span className="font-black text-emerald-700 text-base">₹{selectedAdmission.feesPaid}</span>
              </div>
              <div>
                <span className="text-amber-700 block font-semibold">{isMarathi ? 'शिल्लक बाकी' : 'Balance Due'}</span>
                <span className="font-black text-amber-700 text-base">₹{selectedAdmission.feesPending}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-1.5" />
                <span>{isMarathi ? 'प्रिंट पावती (Print Receipt)' : 'Print Receipt (PDF)'}</span>
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setSelectedAdmission(null)}
              >
                {isMarathi ? 'बंद करा' : 'Close'}
              </Button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};
