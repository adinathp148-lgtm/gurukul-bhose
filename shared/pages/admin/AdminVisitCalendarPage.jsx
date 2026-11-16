import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Filter,
  Phone
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCRM } from '../../contexts/CRMContext';

export const AdminVisitCalendarPage = () => {
  const { isMarathi } = useLanguage();
  const { visits } = useCRM();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('MONTH'); // 'MONTH' | 'WEEK' | 'DAY' | 'AGENDA'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedVisit, setSelectedVisit] = useState(null);

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNamesMr = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevPeriod = () => {
    if (viewMode === 'MONTH') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'WEEK') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'MONTH') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'WEEK') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Filtered visits by status
  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'TODAY') {
        const todayStr = new Date().toISOString().split('T')[0];
        return v.requestedDate === todayStr;
      }
      if (statusFilter === 'TOMORROW') {
        const tom = new Date();
        tom.setDate(tom.getDate() + 1);
        return v.requestedDate === tom.toISOString().split('T')[0];
      }
      if (statusFilter === 'THIS_WEEK') {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const startStr = startOfWeek.toISOString().split('T')[0];
        const endStr = endOfWeek.toISOString().split('T')[0];
        return v.requestedDate >= startStr && v.requestedDate <= endStr;
      }
      return v.status === statusFilter;
    });
  }, [visits, statusFilter]);

  // Visits mapped by date string "YYYY-MM-DD"
  const visitsByDate = useMemo(() => {
    const map = {};
    filteredVisits.forEach(v => {
      if (v.requestedDate) {
        if (!map[v.requestedDate]) map[v.requestedDate] = [];
        map[v.requestedDate].push(v);
      }
    });
    return map;
  }, [filteredVisits]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Pending Approval': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'Checked In': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Rescheduled': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'Cancelled': return 'bg-slate-100 text-slate-600 border-slate-300';
      case 'Rejected': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-gurukul-saffron-600" />
            <h1 className="text-xl font-bold text-slate-900">
              {isMarathi ? 'शाळा भेट दिनदर्शिका (Campus Visit Calendar)' : 'Campus Visit Calendar'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi 
              ? 'पालकांच्या नियोजित भेटींचे मासिक, साप्ताहिक व दैनिक वेळापत्रक.' 
              : 'Interactive schedule of all requested, confirmed and completed parent visits.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {['MONTH', 'WEEK', 'DAY', 'AGENDA'].map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === m 
                    ? 'bg-white text-gurukul-navy-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m === 'MONTH' ? (isMarathi ? 'महिना' : 'Month') :
                 m === 'WEEK' ? (isMarathi ? 'आठवडा' : 'Week') :
                 m === 'DAY' ? (isMarathi ? 'दिवस' : 'Day') : (isMarathi ? 'यादी' : 'Agenda')}
              </button>
            ))}
          </div>

          {/* Quick Filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700"
          >
            <option value="ALL">{isMarathi ? 'सर्व भेटी' : 'All Visits'}</option>
            <option value="TODAY">{isMarathi ? 'आजच्या भेटी' : "Today's Visits"}</option>
            <option value="TOMORROW">{isMarathi ? 'उद्याच्या भेटी' : "Tomorrow's Visits"}</option>
            <option value="THIS_WEEK">{isMarathi ? 'या आठवड्यातील' : 'This Week'}</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Calendar Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={prevPeriod}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextPeriod}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-base font-extrabold text-slate-900 ml-2">
            {isMarathi ? `${monthNamesMr[month]} ${year}` : `${monthNamesEn[month]} ${year}`}
          </span>
        </div>

        <button
          onClick={jumpToToday}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300"
        >
          {isMarathi ? 'आज (Today)' : 'Today'}
        </button>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'MONTH' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-xs font-bold text-slate-600">
            {['रवि (Sun)', 'सोम (Mon)', 'मंगळ (Tue)', 'बुध (Wed)', 'गुरु (Thu)', 'शुक्र (Fri)', 'शनि (Sat)'].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[550px]">
            {/* Empty prefix cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50/50 p-2 min-h-[90px]"></div>
            ))}

            {/* Actual day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayVisits = visitsByDate[dateStr] || [];
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div 
                  key={dayNum} 
                  className={`p-2 min-h-[100px] flex flex-col justify-between transition-colors ${
                    isToday ? 'bg-amber-50/30 ring-2 ring-gurukul-saffron-400 inset-0' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-gurukul-saffron-600 text-white' : 'text-slate-700'
                    }`}>
                      {dayNum}
                    </span>
                    {dayVisits.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {dayVisits.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[85px]">
                    {dayVisits.slice(0, 3).map((v) => (
                      <div
                        key={v.visitId}
                        onClick={() => setSelectedVisit(v)}
                        className={`p-1 rounded-md text-[10px] border cursor-pointer truncate font-medium transition-all hover:scale-102 ${getStatusColor(v.status)}`}
                        title={`${v.parentName} (${v.studentName}) - ${v.timeSlot}`}
                      >
                        <div className="font-bold truncate">{v.studentName}</div>
                        <div className="text-[9px] opacity-80">{v.timeSlot?.split('-')[0]?.trim()}</div>
                      </div>
                    ))}
                    {dayVisits.length > 3 && (
                      <div className="text-[9px] text-slate-500 font-bold text-center">
                        +{dayVisits.length - 3} {isMarathi ? 'अधिक' : 'more'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA / LIST VIEW */}
      {viewMode === 'AGENDA' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {filteredVisits.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <span>{isMarathi ? 'कोणतीही नियोजित भेट नाही.' : 'No visits scheduled for this filter.'}</span>
            </div>
          ) : (
            filteredVisits.sort((a, b) => (a.requestedDate > b.requestedDate ? 1 : -1)).map((v) => (
              <div 
                key={v.visitId}
                onClick={() => setSelectedVisit(v)}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gurukul-saffron-50 text-gurukul-saffron-700 flex flex-col items-center justify-center font-bold text-xs shrink-0 border border-gurukul-saffron-200">
                    <span className="text-[10px] uppercase">{v.requestedDate?.split('-')[1]}</span>
                    <span className="text-sm font-black">{v.requestedDate?.split('-')[2]}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gurukul-navy-900">{v.visitNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(v.status)}`}>
                        {v.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {v.parentName} <span className="text-slate-400 font-normal">| {isMarathi ? 'पालक' : 'Parent'}</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      {isMarathi ? 'विद्यार्थी: ' : 'Student: '}
                      <span className="font-semibold text-slate-800">{v.studentName}</span> ({v.applyingClass})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 sm:text-right">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-gurukul-saffron-600" />
                      <span>{v.timeSlot}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {v.assignedStaffName || (isMarathi ? 'स्टाफ अनियुक्त' : 'Staff Unassigned')}
                    </div>
                  </div>

                  <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* WEEK / DAY FALLBACK TO AGENDA WITH ACTIVE BANNER */}
      {(viewMode === 'WEEK' || viewMode === 'DAY') && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
          <p className="text-xs font-bold text-slate-700">
            {isMarathi 
              ? `${viewMode === 'WEEK' ? 'साप्ताहिक' : 'दैनिक'} वेळापत्रक दृश्य` 
              : `${viewMode} View Mode`}
          </p>
          <div className="mt-4 divide-y divide-slate-100 text-left">
            {filteredVisits.slice(0, 10).map((v) => (
              <div key={v.visitId} onClick={() => setSelectedVisit(v)} className="p-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer text-xs">
                <div>
                  <span className="font-bold text-slate-900">{v.studentName}</span> ({v.applyingClass}) - {v.requestedDate} ({v.timeSlot})
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(v.status)}`}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-gurukul-saffron-600">{selectedVisit.visitNumber}</span>
                <h3 className="text-base font-bold text-slate-900">{isMarathi ? 'भेट तपशील' : 'Visit Details'}</h3>
              </div>
              <button onClick={() => setSelectedVisit(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-500 block">Parent</span>
                  <span className="font-bold text-slate-900">{selectedVisit.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Student</span>
                  <span className="font-bold text-slate-900">{selectedVisit.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Class</span>
                  <span className="font-bold text-slate-900">{selectedVisit.applyingClass}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Mobile</span>
                  <span className="font-bold text-slate-900">{selectedVisit.mobileNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date & Time</span>
                  <span className="font-bold text-slate-900">{selectedVisit.requestedDate} ({selectedVisit.timeSlot})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${getStatusColor(selectedVisit.status)}`}>
                    {selectedVisit.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Purpose</span>
                <p className="p-2.5 bg-slate-50 rounded-lg text-slate-700">{selectedVisit.purpose}</p>
              </div>

              {selectedVisit.assignedStaffName && (
                <div>
                  <span className="text-slate-500 font-bold block mb-1">Assigned Coordinator</span>
                  <p className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg font-semibold">{selectedVisit.assignedStaffName}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedVisit(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVisitCalendarPage;
