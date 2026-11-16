import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  LogOut, 
  FileText, 
  Star, 
  MessageSquare, 
  AlertCircle, 
  Check, 
  Send,
  Sparkles,
  Phone,
  User,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCRM } from '../../contexts/CRMContext';
import { useAuth } from '../../contexts/AuthContext';

export const AdminVisitDeskPage = () => {
  const { isMarathi } = useLanguage();
  const { userProfile, currentUser } = useAuth();
  const { 
    visits, 
    checkInCampusVisit, 
    checkOutCampusVisit, 
    submitCampusVisitFeedback,
    visitInterestLevels,
    visitNextActions 
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [deskAction, setDeskAction] = useState(null); // 'checkin' | 'checkout' | 'feedback'

  // Check-In State
  const [checkInTime, setCheckInTime] = useState('');
  const [checkInNotes, setCheckInNotes] = useState('');

  // Check-Out State
  const [checkOutTime, setCheckOutTime] = useState('');
  const [checkOutNotes, setCheckOutNotes] = useState('');

  // Feedback State
  const [feedback, setFeedback] = useState({
    interestLevel: 'Interested',
    experienceRating: 5,
    facilitiesFeedback: '',
    feeEnquiry: true,
    academicEnquiry: true,
    metPrincipal: false,
    metTeacher: true,
    parentQuestions: '',
    concerns: '',
    nextAction: 'Call Parent',
    recommendedFollowUpAt: '',
    staffRemarks: ''
  });

  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Today's Date String
  const todayStr = new Date().toISOString().split('T')[0];

  // Active Desk Visits (Today's visits, Confirmed, Checked In, or In Progress)
  const todayVisits = useMemo(() => {
    return visits.filter(v => 
      v.requestedDate === todayStr || 
      v.status === 'Checked In' || 
      v.status === 'In Progress'
    );
  }, [visits, todayStr]);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return todayVisits;
    const term = searchTerm.toLowerCase().trim();
    return visits.filter(v => 
      (v.parentName && v.parentName.toLowerCase().includes(term)) ||
      (v.mobileNumber && v.mobileNumber.includes(term)) ||
      (v.visitNumber && v.visitNumber.toLowerCase().includes(term)) ||
      (v.studentName && v.studentName.toLowerCase().includes(term))
    );
  }, [visits, todayVisits, searchTerm]);

  const handleSelectVisit = (v) => {
    setSelectedVisit(v);
    setActionSuccess(null);
    setActionError(null);
    setCheckInTime(new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }));
    setCheckOutTime(new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }));
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVisit) return;
    setLoading(true);
    setActionError(null);

    try {
      const res = await checkInCampusVisit(selectedVisit.visitId, {
        arrivalTime: checkInTime,
        notes: checkInNotes
      });
      if (res.success) {
        setSelectedVisit(res.visit);
        setActionSuccess(isMarathi ? 'पालक चेक-इन यशस्वीरित्या पूर्ण झाले!' : 'Parent check-in recorded successfully!');
        setDeskAction(null);
      }
    } catch (err) {
      setActionError(err.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOutSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVisit) return;
    setLoading(true);
    setActionError(null);

    try {
      const res = await checkOutCampusVisit(selectedVisit.visitId, {
        departureTime: checkOutTime,
        completionNotes: checkOutNotes
      });

      // Submit feedback simultaneously if filled
      await submitCampusVisitFeedback({
        visitId: selectedVisit.visitId,
        leadId: selectedVisit.leadId,
        interestLevel: feedback.interestLevel,
        experienceRating: feedback.experienceRating,
        facilitiesFeedback: feedback.facilitiesFeedback,
        feeEnquiry: feedback.feeEnquiry,
        academicEnquiry: feedback.academicEnquiry,
        parentQuestions: feedback.parentQuestions,
        concerns: feedback.concerns,
        nextAction: feedback.nextAction,
        recommendedFollowUpAt: feedback.recommendedFollowUpAt,
        staffRemarks: `${feedback.staffRemarks}\n[Facilities]: ${feedback.facilitiesFeedback || 'Inspected campus'}\n[Principal Met]: ${feedback.metPrincipal ? 'Yes' : 'No'}`.trim()
      });

      if (res.success) {
        setSelectedVisit(res.visit);
        setActionSuccess(isMarathi ? 'भेट यशस्वीरित्या पूर्ण झाली व अभिप्राय नोंदवला गेला!' : 'Visit completed and parent feedback recorded!');
        setDeskAction(null);
      }
    } catch (err) {
      setActionError(err.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Desk Title Header */}
      <div className="bg-gradient-to-r from-gurukul-navy-900 to-gurukul-navy-800 p-6 rounded-2xl text-white shadow-sm border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-gurukul-saffron-400" />
            <h1 className="text-xl font-bold">
              {isMarathi ? 'कॅम्पस भेट स्वागत कक्ष (Campus Visit Desk)' : 'Campus Visit Reception & Desk'}
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {isMarathi 
              ? 'पालकांचे आगमन होताच गेट चेक-इन, समुपदेशन ट्रॅकिंग आणि भेट समाप्तीनंतरचा त्वरित अभिप्राय.' 
              : 'Live reception desk for parent arrival check-in, counselor routing, and visit completion feedback.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{userProfile?.fullName || 'Visit Desk Officer'}</span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Search & Visitor List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={isMarathi ? 'भेट क्र., मोबाईल किंवा पालक नाव...' : 'Search visit number, mobile or name...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              {searchTerm 
                ? (isMarathi ? `शोध परिणाम: ${searchResults.length}` : `Search results: ${searchResults.length}`)
                : (isMarathi ? `आजच्या भेटी: ${todayVisits.length}` : `Today's scheduled visitors: ${todayVisits.length}`)}
            </p>
          </div>

          {/* Visitor Cards List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {searchResults.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-400 text-xs">
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <span>{isMarathi ? 'कोणतेही अभ्यागत आढळले नाहीत.' : 'No visitors found.'}</span>
              </div>
            ) : (
              searchResults.map((v) => {
                const isSelected = selectedVisit?.visitId === v.visitId;
                return (
                  <div
                    key={v.visitId}
                    onClick={() => handleSelectVisit(v)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gurukul-saffron-50/50 border-gurukul-saffron-500 shadow-sm ring-1 ring-gurukul-saffron-500'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-gurukul-navy-900">{v.visitNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        v.status === 'Checked In' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        v.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        v.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {v.status}
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs font-bold text-slate-900">{v.parentName}</p>
                      <p className="text-[11px] text-slate-500">{v.studentName} ({v.applyingClass})</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                      <div className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{v.mobileNumber}</span>
                      </div>
                      <div className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-gurukul-saffron-600" />
                        <span>{v.timeSlot}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Visitor Workspace & Check-In/Check-Out Actions (7 Cols) */}
        <div className="lg:col-span-7">
          {!selectedVisit ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm h-full flex flex-col items-center justify-center text-slate-400">
              <Building2 className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700">
                {isMarathi ? 'डाव्या बाजूने भेट नोंद निवडा' : 'Select a Visitor from the Left List'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                {isMarathi 
                  ? 'पालक आल्यावर चेक-इन करण्यासाठी किंवा भेट पूर्ण झाल्यावर अभिप्राय नोंदवण्यासाठी भेट कार्डवर क्लिक करा.' 
                  : 'Click on a visitor card to record gate arrival, counselor interactions, and exit feedback.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
              {/* Alert Feedback Messages */}
              {actionSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}
              {actionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Selected Visitor Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gurukul-saffron-600">{selectedVisit.visitNumber}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {selectedVisit.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">{selectedVisit.parentName}</h2>
                  <p className="text-xs text-slate-500">
                    {isMarathi ? 'विद्यार्थी: ' : 'Student: '}
                    <span className="font-bold text-slate-800">{selectedVisit.studentName}</span> • {selectedVisit.applyingClass}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800">{selectedVisit.requestedDate}</div>
                  <div className="text-[11px] text-slate-500">{selectedVisit.timeSlot}</div>
                </div>
              </div>

              {/* Quick Details Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">मोबाईल</span>
                  <a href={`tel:${selectedVisit.mobileNumber}`} className="font-bold text-gurukul-navy-900 hover:underline">
                    {selectedVisit.mobileNumber}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">एकूण व्यक्ती</span>
                  <span className="font-bold text-slate-800">{selectedVisit.numberOfVisitors || 1} व्यक्ती</span>
                </div>
                <div>
                  <span className="text-slate-500 block">भेट उद्देश</span>
                  <span className="font-bold text-slate-800 truncate block">{selectedVisit.purpose}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">चेक-इन वेळ</span>
                  <span className="font-bold text-slate-800">{selectedVisit.checkedInAt || 'अद्याप नाही'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">चेक-आउट वेळ</span>
                  <span className="font-bold text-slate-800">{selectedVisit.checkedOutAt || 'अद्याप नाही'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">समन्वयक स्टाफ</span>
                  <span className="font-bold text-slate-800">{selectedVisit.assignedStaffName || 'Unassigned'}</span>
                </div>
              </div>

              {/* Action Buttons: Check-In or Check-Out */}
              <div className="flex flex-wrap gap-2.5">
                {selectedVisit.status !== 'Checked In' && selectedVisit.status !== 'Completed' && (
                  <button
                    onClick={() => setDeskAction('checkin')}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isMarathi ? 'पालक आगमन (Gate Check-In)' : 'Record Arrival (Check-In)'}</span>
                  </button>
                )}

                {selectedVisit.status === 'Checked In' && (
                  <button
                    onClick={() => setDeskAction('checkout')}
                    className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isMarathi ? 'भेट पूर्ण व अभिप्राय (Check-Out)' : 'Complete Visit (Check-Out)'}</span>
                  </button>
                )}
              </div>

              {/* CHECK-IN FORM */}
              {deskAction === 'checkin' && (
                <form onSubmit={handleCheckInSubmit} className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-4 animate-fadeIn">
                  <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isMarathi ? 'पालक गेट आगमन नोंदवा (Check-In)' : 'Record Parent Arrival'}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isMarathi ? 'आगमन वेळ' : 'Arrival Time'}
                      </label>
                      <input
                        type="text"
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isMarathi ? 'गेट नोंद / स्वागत टिप्पणी' : 'Arrival Notes'}
                    </label>
                    <input
                      type="text"
                      value={checkInNotes}
                      onChange={(e) => setCheckInNotes(e.target.value)}
                      placeholder={isMarathi ? 'उदा. पालक वेळेवर आले, प्राचार्य कार्यालयाकडे पाठवले.' : 'e.g. Arrived on time, routed to counselor.'}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeskAction(null)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
                    >
                      {isMarathi ? 'रद्द' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      {loading ? 'Saving...' : (isMarathi ? 'चेक-इन निश्चित करा' : 'Confirm Check-In')}
                    </button>
                  </div>
                </form>
              )}

              {/* CHECK-OUT & COMPREHENSIVE FEEDBACK FORM */}
              {deskAction === 'checkout' && (
                <form onSubmit={handleCheckOutSubmit} className="p-5 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-4 animate-fadeIn">
                  <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <LogOut className="w-4 h-4 text-purple-600" />
                    <span>{isMarathi ? 'भेट समाप्ती व अभिप्राय (Check-Out & Visit Feedback)' : 'Visit Check-Out & Feedback'}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isMarathi ? 'निर्गमन वेळ (Departure Time)' : 'Departure Time'}
                      </label>
                      <input
                        type="text"
                        value={checkOutTime}
                        onChange={(e) => setCheckOutTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isMarathi ? 'पालकांची आवड पातळी *' : 'Parent Interest Level *'}
                      </label>
                      <select
                        value={feedback.interestLevel}
                        onChange={(e) => setFeedback(prev => ({ ...prev, interestLevel: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                      >
                        {visitInterestLevels.map(lvl => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isMarathi ? 'कॅम्पस अनुभव रेटिंग' : 'Campus Rating'}
                      </label>
                      <select
                        value={feedback.experienceRating}
                        onChange={(e) => setFeedback(prev => ({ ...prev, experienceRating: Number(e.target.value) }))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 / 5)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 / 5)</option>
                        <option value={3}>⭐⭐⭐ (3 / 5)</option>
                        <option value={2}>⭐⭐ (2 / 5)</option>
                        <option value={1}>⭐ (1 / 5)</option>
                      </select>
                    </div>
                  </div>

                  {/* Checkboxes for facilities met */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={feedback.metTeacher}
                        onChange={(e) => setFeedback(prev => ({ ...prev, metTeacher: e.target.checked }))}
                        className="rounded-md text-gurukul-saffron-600"
                      />
                      <span>{isMarathi ? 'शिक्षकांशी भेट झाली' : 'Met Teacher'}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={feedback.metPrincipal}
                        onChange={(e) => setFeedback(prev => ({ ...prev, metPrincipal: e.target.checked }))}
                        className="rounded-md text-gurukul-saffron-600"
                      />
                      <span>{isMarathi ? 'प्राचार्यांशी भेट झाली' : 'Met Principal'}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={feedback.feeEnquiry}
                        onChange={(e) => setFeedback(prev => ({ ...prev, feeEnquiry: e.target.checked }))}
                        className="rounded-md text-gurukul-saffron-600"
                      />
                      <span>{isMarathi ? 'फी स्ट्रक्चर समजवले' : 'Fee Structure Explained'}</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isMarathi ? 'पुढील कृती (Next Action) *' : 'Next Action *'}
                      </label>
                      <select
                        value={feedback.nextAction}
                        onChange={(e) => setFeedback(prev => ({ ...prev, nextAction: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                      >
                        {visitNextActions.map(act => (
                          <option key={act} value={act}>{act}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isMarathi ? 'पुढील फॉलो-अप तारीख' : 'Recommended Follow-up Date'}
                      </label>
                      <input
                        type="date"
                        value={feedback.recommendedFollowUpAt}
                        onChange={(e) => setFeedback(prev => ({ ...prev, recommendedFollowUpAt: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isMarathi ? 'पालकांचे प्रश्न / आक्षेप व स्टाफ शेरा' : 'Parent Questions & Staff Remarks'}
                    </label>
                    <textarea
                      rows={2}
                      value={feedback.staffRemarks}
                      onChange={(e) => setFeedback(prev => ({ ...prev, staffRemarks: e.target.value }))}
                      placeholder={isMarathi ? 'पालकांचे समाधान झाले का? काही विशेष मागण्या...' : 'Parent queries, specific concerns...'}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeskAction(null)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
                    >
                      {isMarathi ? 'रद्द' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      {loading ? 'Saving...' : (isMarathi ? 'भेट पूर्ण करा व जतन करा' : 'Complete & Save Feedback')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVisitDeskPage;
