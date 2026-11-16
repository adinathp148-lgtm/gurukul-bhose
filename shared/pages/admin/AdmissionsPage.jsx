import React, { useState, useMemo } from 'react';
import { useCRM } from '../../contexts/CRMContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  GraduationCap, 
  Search, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Building2, 
  Phone,
  Eye, 
  ShieldCheck,
  Check,
  XCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Upload,
  UserCheck,
  ChevronRight,
  Filter,
  Layers,
  History
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const AdmissionsPage = () => {
  const { isMarathi } = useLanguage();
  const { 
    admissions, 
    admissionApplications, 
    admissionStageHistory,
    admissionStages, 
    stageConfig, 
    documentStatuses,
    updateAdmissionStage, 
    reviewAdmissionDocument 
  } = useCRM();

  const [activeTab, setActiveTab] = useState('WORKFLOW'); // 'WORKFLOW' | 'REGISTER'
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');

  // Modals
  const [selectedApp, setSelectedApp] = useState(null);
  const [stageChangeModal, setStageChangeModal] = useState(false);
  const [newStageSelect, setNewStageSelect] = useState('');
  const [stageChangeReason, setStageChangeReason] = useState('');
  const [documentReviewModal, setDocumentReviewModal] = useState(false);
  const [reviewingDoc, setReviewingDoc] = useState(null);
  const [docNewStatus, setDocNewStatus] = useState('Verified');
  const [docReviewNotes, setDocReviewNotes] = useState('');
  const [historyModal, setHistoryModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Filtered Applications
  const filteredApps = useMemo(() => {
    return admissionApplications.filter(app => {
      const matchSearch = !searchTerm ||
        (app.studentName && app.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.applicationNumber && app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.parentName && app.parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.parentMobile && app.parentMobile.includes(searchTerm));

      const matchStage = stageFilter === 'ALL' || app.currentStage === stageFilter;
      const matchClass = classFilter === 'ALL' || app.applyingClass === classFilter;

      return matchSearch && matchStage && matchClass;
    });
  }, [admissionApplications, searchTerm, stageFilter, classFilter]);

  // Filtered Confirmed Register
  const filteredRegister = useMemo(() => {
    return admissions.filter(a =>
      (a.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.admissionNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.parentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.mobileNumber || '').includes(searchTerm)
    );
  }, [admissions, searchTerm]);

  // Stage change handlers
  const openStageModal = (app) => {
    setSelectedApp(app);
    setNewStageSelect(app.currentStage);
    setStageChangeReason('');
    setActionError(null);
    setStageChangeModal(true);
  };

  const handleStageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setActionLoading(true);
    setActionError(null);

    try {
      await updateAdmissionStage({
        applicationId: selectedApp.applicationId,
        newStage: newStageSelect,
        reason: stageChangeReason
      });
      setStageChangeModal(false);
      setSelectedApp(null);
    } catch (err) {
      setActionError(err.message || 'Failed to update stage');
    } finally {
      setActionLoading(false);
    }
  };

  // Document review handlers
  const openDocReview = (app, docItem) => {
    setSelectedApp(app);
    setReviewingDoc(docItem);
    setDocNewStatus(docItem.status === 'Not Submitted' ? 'Verified' : docItem.status);
    setDocReviewNotes(docItem.reviewNotes || '');
    setActionError(null);
    setDocumentReviewModal(true);
  };

  const handleDocReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp || !reviewingDoc) return;
    setActionLoading(true);
    setActionError(null);

    try {
      await reviewAdmissionDocument({
        applicationId: selectedApp.applicationId,
        documentType: reviewingDoc.documentType,
        status: docNewStatus,
        reviewNotes: docReviewNotes
      });
      setDocumentReviewModal(false);
      setReviewingDoc(null);
    } catch (err) {
      setActionError(err.message || 'Failed to update document status');
    } finally {
      setActionLoading(false);
    }
  };

  const getDocBadge = (status) => {
    switch (status) {
      case 'Verified':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Verified</span>;
      case 'Under Review':
      case 'Uploaded':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">{status}</span>;
      case 'Rejected':
      case 'Resubmission Required':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">{status}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Not Submitted</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Mode Toggle */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-gurukul-saffron-600" />
            <h1 className="text-xl font-bold text-slate-900">
              {isMarathi ? 'प्रवेश प्रक्रिया व कागदपत्र पडताळणी (Admission Workflow)' : 'Admission Progress & Confirmation Workflow'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi 
              ? '१४-टप्प्यांची प्रवेश प्रक्रिया, कागदपत्रांची पडताळणी आणि अंतिम प्रवेश निश्चिती.' 
              : 'End-to-end 14-stage admission progression, document verification, and enrolled register.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('WORKFLOW')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'WORKFLOW' 
                ? 'bg-white text-gurukul-navy-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMarathi ? '१४-टप्पे प्रवेश प्रक्रिया' : '14-Stage Applications Pipeline'} ({admissionApplications.length})
          </button>
          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'REGISTER' 
                ? 'bg-white text-gurukul-navy-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMarathi ? 'निश्चित प्रवेश रजिस्टर' : 'Confirmed Students Register'} ({admissions.length})
          </button>
        </div>
      </div>

      {/* WORKFLOW VIEW: 14 Stages & Document Checklist */}
      {activeTab === 'WORKFLOW' && (
        <div className="space-y-6">
          {/* Search & Filter Controls */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={isMarathi ? 'अर्ज क्र., विद्यार्थी, पालक किंवा मोबाईल शोधा...' : 'Search application no., student, mobile...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>

            <div>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="ALL">{isMarathi ? 'सर्व प्रवेश टप्पे (All 14 Stages)' : 'All 14 Stages'}</option>
                {admissionStages.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="ALL">{isMarathi ? 'सर्व इयत्ता (All Classes)' : 'All Classes'}</option>
                <option value="इ. 5 वी (5th Standard)">5th Standard</option>
                <option value="इ. 8 वी (8th Standard)">8th Standard</option>
                <option value="इ. 11 वी सायन्स (11th Science)">11th Science</option>
                <option value="इ. 11 वी आर्टस् (11th Arts)">11th Arts</option>
                <option value="इ. 12 वी सायन्स (12th Science)">12th Science</option>
                <option value="इ. 12 वी आर्टस्">12th Arts</option>
              </select>
            </div>
          </div>

          {/* Applications Cards List */}
          <div className="space-y-4">
            {filteredApps.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <span>{isMarathi ? 'कोणतेही प्रवेश अर्ज आढळले नाहीत.' : 'No admission applications match your filter criteria.'}</span>
              </div>
            ) : (
              filteredApps.map((app) => {
                const verifiedDocsCount = (app.requiredDocuments || []).filter(d => d.status === 'Verified').length;
                const totalDocsCount = (app.requiredDocuments || []).length;
                const stageInfo = stageConfig[app.currentStage] || { color: 'slate', step: 1 };

                return (
                  <div key={app.applicationId} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 hover:border-slate-300 transition-all">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gurukul-saffron-600">{app.applicationNumber}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {app.academicYear || '2026-2027'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            app.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            app.approvalStatus === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {app.approvalStatus}
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-slate-900 mt-1">{app.studentName}</h2>
                        <p className="text-xs text-slate-500">
                          {isMarathi ? 'पालक: ' : 'Parent: '}
                          <span className="font-semibold text-slate-800">{app.parentName}</span> ({app.parentMobile}) • {app.applyingClass}
                        </p>
                      </div>

                      {/* Stage Progression & Action */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openStageModal(app)}
                          className="px-4 py-2 bg-gurukul-navy-900 hover:bg-gurukul-navy-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Layers className="w-3.5 h-3.5 text-gurukul-saffron-400" />
                          <span>{isMarathi ? 'टप्पा बदला (Update Stage)' : 'Update Stage'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Stage Badge & Step Indicator */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">{isMarathi ? 'सध्याचा टप्पा:' : 'Current Stage:'}</span>
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-gurukul-saffron-50 text-gurukul-saffron-700 border border-gurukul-saffron-300">
                          {app.currentStage}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {isMarathi ? 'पडताळणी झालेली कागदपत्रे: ' : 'Verified Documents: '}
                        <span className="font-bold text-slate-800">{verifiedDocsCount} / {totalDocsCount}</span>
                      </div>
                    </div>

                    {/* Document Checklist Items */}
                    <div>
                      <p className="text-xs font-bold text-slate-700 mb-2">
                        {isMarathi ? 'कागदपत्रे तपासणी यादी (Document Checklist per Class):' : 'Class Document Checklist:'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {(app.requiredDocuments || []).map((docItem, idx) => (
                          <div
                            key={idx}
                            onClick={() => openDocReview(app, docItem)}
                            className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 transition-all cursor-pointer flex items-center justify-between"
                          >
                            <div className="truncate pr-2">
                              <p className="text-xs font-semibold text-slate-800 truncate" title={docItem.documentType}>
                                {docItem.labelMr || docItem.documentType}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {docItem.required ? (isMarathi ? 'अनिवार्य' : 'Mandatory') : (isMarathi ? 'ऐच्छिक' : 'Optional')}
                              </span>
                            </div>
                            <div className="shrink-0">
                              {getDocBadge(docItem.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fee Details Note */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                      <div>
                        <span>{isMarathi ? 'शुल्क स्थिती: ' : 'Fee Status: '}</span>
                        <span className="font-bold text-slate-800">
                          {app.feeDetails?.paymentStatus || 'Pending'} (₹{app.feeDetails?.feePaid || 0} Paid / ₹{app.feeDetails?.totalFee || 65000})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {isMarathi ? 'शेवटचे अद्यतन: ' : 'Last Updated: '}
                        {new Date(app.updatedAt).toLocaleDateString('mr-IN')}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* REGISTER VIEW: Enrolled Students & Receipts */}
      {activeTab === 'REGISTER' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{isMarathi ? 'प्रवेश क्रमांक' : 'Admission No'}</th>
                  <th className="py-3.5 px-4">{isMarathi ? 'विद्यार्थी नाव' : 'Student Name'}</th>
                  <th className="py-3.5 px-4">{isMarathi ? 'पालक व संपर्क' : 'Parent'}</th>
                  <th className="py-3.5 px-4">{isMarathi ? 'इयत्ता व शाखा' : 'Class'}</th>
                  <th className="py-3.5 px-4">{isMarathi ? 'प्रवेश तारीख' : 'Date'}</th>
                  <th className="py-3.5 px-4">{isMarathi ? 'वसतिगृह रूम' : 'Hostel'}</th>
                  <th className="py-3.5 px-4">{isMarathi ? 'फी स्थिती' : 'Fees Paid'}</th>
                  <th className="py-3.5 px-4 text-right">{isMarathi ? 'कृती' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRegister.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-gurukul-navy-900">{adm.admissionNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{adm.studentName}</div>
                      <div className="text-[10px] text-slate-400">{adm.rollNumber || 'Roll N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700">{adm.parentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{adm.mobileNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{adm.admissionClass}</td>
                    <td className="py-3.5 px-4">{adm.admissionDate}</td>
                    <td className="py-3.5 px-4 text-slate-600">{adm.hostelAllocated || 'Day Scholar'}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-700">₹{adm.feesPaid?.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 block">एकूण: ₹{adm.feesTotal?.toLocaleString()}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UPDATE STAGE MODAL */}
      {stageChangeModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleStageSubmit} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-scaleUp space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {isMarathi ? 'प्रवेश टप्पा अद्ययावत करा' : 'Advance Admission Stage'}
            </h3>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {actionError}
              </div>
            )}

            <div>
              <span className="text-[11px] text-slate-500 block">विद्यार्थी</span>
              <p className="text-xs font-bold text-slate-800">{selectedApp.studentName} ({selectedApp.applicationNumber})</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'नवीन प्रवेश टप्पा निवडा *' : 'Select Target Stage *'}
              </label>
              <select
                value={newStageSelect}
                onChange={(e) => setNewStageSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                required
              >
                {admissionStages.map((stg) => (
                  <option key={stg} value={stg}>{stg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'टप्पा बदलण्याचे कारण / शेरा' : 'Transition Reason / Audit Remarks'}
              </label>
              <textarea
                value={stageChangeReason}
                onChange={(e) => setStageChangeReason(e.target.value)}
                rows={3}
                placeholder={isMarathi ? 'उदा. पालकांनी मूळ जन्मदाखला व गुणपत्रक जमा केले...' : 'e.g. Verified original TC and Marksheet...'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStageChangeModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                {isMarathi ? 'रद्द' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-gurukul-navy-900 hover:bg-gurukul-navy-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                {actionLoading ? 'Saving...' : (isMarathi ? 'टप्पा जतन करा' : 'Save Stage')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DOCUMENT REVIEW & VERIFICATION MODAL */}
      {documentReviewModal && reviewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleDocReviewSubmit} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-scaleUp space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gurukul-saffron-600" />
              <span>{isMarathi ? 'कागदपत्र पडताळणी' : 'Document Verification'}</span>
            </h3>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {actionError}
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block">{isMarathi ? 'कागदपत्राचा प्रकार:' : 'Document Type:'}</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{reviewingDoc.labelMr || reviewingDoc.documentType}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'पडताळणी स्थिती निवडा *' : 'Verification Status *'}
              </label>
              <select
                value={docNewStatus}
                onChange={(e) => setDocNewStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {documentStatuses.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMarathi ? 'पडताळणी शेरा / त्रुटी (लागू असल्यास)' : 'Verification Remarks / Deficiencies'}
              </label>
              <textarea
                value={docReviewNotes}
                onChange={(e) => setDocReviewNotes(e.target.value)}
                rows={3}
                placeholder={isMarathi ? 'उदा. मूळ प्रत पडताळली, छायाप्रत कार्यालयात जमा.' : 'e.g. Verified with original, copy retained.'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDocumentReviewModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                {isMarathi ? 'रद्द' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                {actionLoading ? 'Saving...' : (isMarathi ? 'स्थिती जतन करा' : 'Save Status')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdmissionsPage;
