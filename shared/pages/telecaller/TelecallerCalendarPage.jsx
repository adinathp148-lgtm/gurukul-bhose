import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  CalendarDays, 
  List, 
  CalendarRange, 
  X, 
  User, 
  Eye, 
  Edit3, 
  Check, 
  Search,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCRM } from '../../contexts/CRMContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const TelecallerCalendarPage = () => {
  const { isMarathi } = useLanguage();
  const { currentUser } = useAuth();
  const { 
    leads, 
    followUps, 
    followUpHistory, 
    scheduleFollowUp, 
    rescheduleFollowUp, 
    completeFollowUp,
    validPriorities,
    validCallOutcomes 
  } = useCRM();

  // Active view: 'month' | 'week' | 'day' | 'agenda'
  const [viewMode, setViewMode] = useState('month');

  // Selected date anchor for navigation (default: today)
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Quick filter: 'ALL' | 'TODAY' | 'TOMORROW' | 'WEEK' | 'OVERDUE' | 'COMPLETED' | 'HIGH'
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [newFollowUpModalOpen, setNewFollowUpModalOpen] = useState(false);

  // Forms state
  const [rescheduleForm, setRescheduleForm] = useState({
    newScheduledDate: '',
    newScheduledTime: '10:00',
    newPriority: 'Medium',
    reason: ''
  });

  const [completeForm, setCompleteForm] = useState({
    callOutcome: 'Connected',
    completionNotes: ''
  });

  const [newFuForm, setNewFuForm] = useState({
    leadId: '',
    scheduledDate: '',
    scheduledTime: '11:00',
    priority: 'High',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper date strings
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const weekRange = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sun
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    const end = new Date(now);
    end.setDate(now.getDate() + (6 - dayOfWeek));
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }, []);

  // Filter follow-ups strictly assigned to this telecaller or visible
  const myFollowUps = useMemo(() => {
    return followUps.filter(fu => {
      // Overdue status dynamic calculation
      const isOverdue = fu.status !== 'Completed' && fu.status !== 'Cancelled' && (
        fu.scheduledDate < todayStr || 
        (fu.scheduledDate === todayStr && fu.scheduledTime && fu.scheduledTime < new Date().toTimeString().slice(0, 5))
      );

      // Search match
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const num = (fu.leadNumber || '').toLowerCase();
        const pName = (fu.parentName || '').toLowerCase();
        const sName = (fu.studentName || '').toLowerCase();
        if (!num.includes(q) && !pName.includes(q) && !sName.includes(q)) {
          return false;
        }
      }

      // Filter types
      if (filterType === 'TODAY') {
        return fu.scheduledDate === todayStr && fu.status !== 'Completed';
      }
      if (filterType === 'TOMORROW') {
        return fu.scheduledDate === tomorrowStr && fu.status !== 'Completed';
      }
      if (filterType === 'WEEK') {
        return fu.scheduledDate >= weekRange.start && fu.scheduledDate <= weekRange.end;
      }
      if (filterType === 'OVERDUE') {
        return isOverdue;
      }
      if (filterType === 'COMPLETED') {
        return fu.status === 'Completed';
      }
      if (filterType === 'HIGH') {
        return fu.priority === 'High' && fu.status !== 'Completed';
      }

      return true;
    });
  }, [followUps, filterType, searchTerm, todayStr, tomorrowStr, weekRange]);

  // Calendar Navigation
  const navigateDate = (delta) => {
    const newD = new Date(currentDate);
    if (viewMode === 'month') {
      newD.setMonth(newD.getMonth() + delta);
    } else if (viewMode === 'week') {
      newD.setDate(newD.getDate() + delta * 7);
    } else if (viewMode === 'day') {
      newD.setDate(newD.getDate() + delta);
    }
    setCurrentDate(newD);
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Month Grid Calculation
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      days.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        dayNum,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      days.push({
        date: dateObj,
        dateStr: dateObj.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: true
      });
    }

    // Next month leading days (to fill 35 or 42 grid cells)
    const totalSlots = days.length > 35 ? 42 : 35;
    const remaining = totalSlots - days.length;
    for (let d = 1; d <= remaining; d++) {
      const dateObj = new Date(year, month + 1, d);
      days.push({
        date: dateObj,
        dateStr: dateObj.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentDate]);

  // Week View Days
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay();
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNameMr: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'][d.getDay()],
        dayNum: d.getDate()
      });
    }
    return days;
  }, [currentDate]);

  // Open Actions
  const handleOpenEvent = (fu) => {
    setSelectedEvent(fu);
    setDetailModalOpen(true);
  };

  const handleOpenReschedule = (fu) => {
    setSelectedEvent(fu);
    setRescheduleForm({
      newScheduledDate: tomorrowStr,
      newScheduledTime: fu.scheduledTime || '10:00',
      newPriority: fu.priority || 'Medium',
      reason: ''
    });
    setDetailModalOpen(false);
    setRescheduleModalOpen(true);
  };

  const handleOpenComplete = (fu) => {
    setSelectedEvent(fu);
    setCompleteForm({
      callOutcome: 'Connected',
      completionNotes: ''
    });
    setDetailModalOpen(false);
    setCompleteModalOpen(true);
  };

  // Submit Reschedule
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleForm.newScheduledDate) {
      alert(isMarathi ? 'कृपया नवीन तारीख निवडा.' : 'Please select a new date.');
      return;
    }
    if (rescheduleForm.newScheduledDate < todayStr) {
      alert(isMarathi ? 'मागील तारखेला फॉलो-अप ठरवता येत नाही.' : 'Cannot reschedule follow-up to a past date.');
      return;
    }
    if (!rescheduleForm.reason.trim()) {
      alert(isMarathi ? 'कृपया तारीख बदलण्याचे कारण प्रविष्ट करा.' : 'Please enter reason for rescheduling.');
      return;
    }

    setSubmitting(true);
    const res = await rescheduleFollowUp({
      followUpId: selectedEvent.id || selectedEvent.followUpId,
      leadId: selectedEvent.leadId,
      newScheduledDate: rescheduleForm.newScheduledDate,
      newScheduledTime: rescheduleForm.newScheduledTime,
      newPriority: rescheduleForm.newPriority,
      reason: rescheduleForm.reason
    });
    setSubmitting(false);

    if (res.success) {
      showNotification(isMarathi ? 'फॉलो-अप यशस्वीरीत्या पुढे ढकलण्यात आला आहे!' : 'Follow-up rescheduled successfully!');
      setRescheduleModalOpen(false);
    } else {
      alert(res.error || 'Failed to reschedule follow-up');
    }
  };

  // Submit Complete
  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await completeFollowUp({
      followUpId: selectedEvent.id || selectedEvent.followUpId,
      leadId: selectedEvent.leadId,
      callOutcome: completeForm.callOutcome,
      completionNotes: completeForm.completionNotes
    });
    setSubmitting(false);

    if (res.success) {
      showNotification(isMarathi ? 'फॉलो-अप यशस्वीरीत्या पूर्ण म्हणून नोंदवला गेला!' : 'Follow-up marked as completed!');
      setCompleteModalOpen(false);
    } else {
      alert(res.error || 'Failed to complete follow-up');
    }
  };

  // Schedule New Follow-up
  const handleNewFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!newFuForm.leadId) {
      alert(isMarathi ? 'कृपया विद्यार्थी/पालक निवडा.' : 'Please select a lead.');
      return;
    }
    if (!newFuForm.scheduledDate) {
      alert(isMarathi ? 'कृपया तारीख निवडा.' : 'Please select date.');
      return;
    }
    if (newFuForm.scheduledDate < todayStr) {
      alert(isMarathi ? 'मागील तारखेला फॉलो-अप ठरवता येत नाही.' : 'Cannot schedule in the past.');
      return;
    }

    const lead = leads.find(l => l.id === newFuForm.leadId);

    setSubmitting(true);
    const res = await scheduleFollowUp({
      leadId: newFuForm.leadId,
      leadNumber: lead?.leadNumber,
      parentName: lead?.parentName,
      studentName: lead?.studentName,
      mobileNumber: lead?.mobileNumber,
      admissionClass: lead?.admissionClass,
      academicYear: lead?.academicYear,
      scheduledDate: newFuForm.scheduledDate,
      scheduledTime: newFuForm.scheduledTime,
      priority: newFuForm.priority,
      notes: newFuForm.notes
    });
    setSubmitting(false);

    if (res.success) {
      showNotification(isMarathi ? 'नवीन फॉलो-अप यशस्वीरीत्या तयार केला!' : 'New follow-up scheduled successfully!');
      setNewFollowUpModalOpen(false);
      setNewFuForm({
        leadId: '',
        scheduledDate: '',
        scheduledTime: '11:00',
        priority: 'High',
        notes: ''
      });
    } else {
      alert(res.error || 'Failed to schedule follow-up');
    }
  };

  // Priority badge styling
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">High</span>;
      case 'Medium':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Medium</span>;
      default:
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Low</span>;
    }
  };

  // Status badge styling
  const getStatusBadge = (fu) => {
    const isOverdue = fu.status !== 'Completed' && fu.status !== 'Cancelled' && (
      fu.scheduledDate < todayStr || 
      (fu.scheduledDate === todayStr && fu.scheduledTime && fu.scheduledTime < new Date().toTimeString().slice(0, 5))
    );

    if (fu.status === 'Completed') {
      return <Badge size="xs" variant="Confirmed">Completed</Badge>;
    }
    if (isOverdue) {
      return <Badge size="xs" variant="Lost">Overdue</Badge>;
    }
    if (fu.status === 'Rescheduled') {
      return <Badge size="xs" variant="Follow-up">Rescheduled</Badge>;
    }
    return <Badge size="xs" variant="Interested">Scheduled</Badge>;
  };

  return (
    <div className="space-y-6">

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center justify-between transition-all ${
          notification.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{notification.msg}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gurukul-saffron-600 uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4" />
            <span>{isMarathi ? 'फॉलो-अप कॅलेंडर व शेड्युल' : 'Follow-up Calendar & Scheduler'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gurukul-navy-950 mt-1">
            {isMarathi ? 'प्रवेश फॉलो-अप कॅलेंडर' : 'Admission Follow-up Calendar'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isMarathi 
              ? 'आपल्याकडे नियोजित असलेले सर्व कॉल्स व भेटींचे मासिक, साप्ताहिक व दैनिक वेळापत्रक.' 
              : 'Monthly, weekly, daily and agenda view of all scheduled calls and parent visits.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => setNewFollowUpModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{isMarathi ? '+ नवीन फॉलो-अप' : '+ Schedule Follow-up'}</span>
          </Button>
          <Link to="/telecaller/calls">
            <Button variant="outline" size="md" className="flex items-center gap-1.5 border-slate-300">
              <Phone className="w-4 h-4 text-gurukul-navy-800" />
              <span>{isMarathi ? 'कॉल व्यवस्थापन' : 'Call Management'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Controls & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Navigation & Current Period Display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => navigateDate(-1)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 hover:shadow-xs transition"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={jumpToToday}
              className="px-3 py-1 text-xs font-bold text-slate-800 hover:bg-white rounded-lg transition"
            >
              {isMarathi ? 'आज (Today)' : 'Today'}
            </button>
            <button
              onClick={() => navigateDate(1)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 hover:shadow-xs transition"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-sm font-black text-slate-900 tracking-tight min-w-[140px]">
            {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            {viewMode === 'week' && `${weekDays[0].dayNum} ${weekDays[0].date.toLocaleDateString('en-US', { month: 'short' })} - ${weekDays[6].dayNum} ${weekDays[6].date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
            {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            {viewMode === 'agenda' && (isMarathi ? 'सर्व प्रलंबित यादी' : 'All Follow-up Agenda')}
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start lg:self-auto">
          <button
            onClick={() => setViewMode('month')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'month' ? 'bg-white text-gurukul-navy-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'महिना' : 'Month'}</span>
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'week' ? 'bg-white text-gurukul-navy-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'आठवडा' : 'Week'}</span>
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'day' ? 'bg-white text-gurukul-navy-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'दिवस' : 'Day'}</span>
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'agenda' ? 'bg-white text-gurukul-navy-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'अजेंडा' : 'Agenda'}</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isMarathi ? 'पालक, विद्यार्थी किंवा क्रमांक...' : 'Search student or lead...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500 bg-slate-50"
          />
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          {isMarathi ? 'फिल्टर:' : 'Filter:'}
        </span>
        {[
          { id: 'ALL', label: isMarathi ? 'सर्व' : 'All', count: followUps.length },
          { id: 'TODAY', label: isMarathi ? 'आजचे (Today)' : 'Today', count: followUps.filter(f => f.scheduledDate === todayStr && f.status !== 'Completed').length, color: 'text-amber-700 bg-amber-50 border-amber-200' },
          { id: 'TOMORROW', label: isMarathi ? 'उद्या (Tomorrow)' : 'Tomorrow', count: followUps.filter(f => f.scheduledDate === tomorrowStr && f.status !== 'Completed').length },
          { id: 'WEEK', label: isMarathi ? 'या आठवड्यात' : 'This Week', count: followUps.filter(f => f.scheduledDate >= weekRange.start && f.scheduledDate <= weekRange.end).length },
          { id: 'OVERDUE', label: isMarathi ? 'थकबाकी (Overdue)' : 'Overdue', count: followUps.filter(f => f.status !== 'Completed' && f.scheduledDate < todayStr).length, color: 'text-rose-700 bg-rose-50 border-rose-200' },
          { id: 'HIGH', label: isMarathi ? 'उच्च प्राधान्य (High)' : 'High Priority', count: followUps.filter(f => f.priority === 'High' && f.status !== 'Completed').length },
          { id: 'COMPLETED', label: isMarathi ? 'पूर्ण झालेले (Done)' : 'Completed', count: followUps.filter(f => f.status === 'Completed').length, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setFilterType(item.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition flex items-center gap-1.5 ${
              filterType === item.id 
                ? 'bg-gurukul-navy-950 text-white border-gurukul-navy-950 shadow-xs' 
                : item.color || 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{item.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              filterType === item.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* VIEW 1: MONTHLY CALENDAR GRID */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center text-xs font-bold text-slate-600 py-2.5">
            {['रवि (Sun)', 'सोम (Mon)', 'मंगळ (Tue)', 'बुध (Wed)', 'गुरु (Thu)', 'शुक्र (Fri)', 'शनि (Sat)'].map((d, i) => (
              <div key={i} className="tracking-tight">{d}</div>
            ))}
          </div>

          {/* 35 or 42 Month Day Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {monthData.map((slot, idx) => {
              const dayFollowUps = myFollowUps.filter(f => f.scheduledDate === slot.dateStr);
              const isToday = slot.dateStr === todayStr;

              return (
                <div 
                  key={idx} 
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition ${
                    !slot.isCurrentMonth ? 'bg-slate-50/40 text-slate-400' : 'bg-white'
                  } ${isToday ? 'bg-amber-50/30 ring-2 ring-amber-400/50 inset-0' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black rounded-full w-6 h-6 flex items-center justify-center ${
                      isToday ? 'bg-amber-500 text-white shadow-xs' : slot.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {slot.dayNum}
                    </span>
                    {dayFollowUps.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                        {dayFollowUps.length} कॉल्स
                      </span>
                    )}
                  </div>

                  {/* List of 2-3 events max inside cell */}
                  <div className="space-y-1 mt-1.5 flex-1 overflow-hidden">
                    {dayFollowUps.slice(0, 3).map(fu => {
                      const isHigh = fu.priority === 'High';
                      const isDone = fu.status === 'Completed';
                      return (
                        <div
                          key={fu.id || fu.followUpId}
                          onClick={() => handleOpenEvent(fu)}
                          className={`p-1 rounded text-[10px] cursor-pointer truncate transition font-medium border ${
                            isDone 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 line-through opacity-70' 
                              : isHigh 
                                ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100' 
                                : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                          }`}
                          title={`${fu.studentName} (${fu.admissionClass}) - ${fu.scheduledTime || '10:00'}`}
                        >
                          <span className="font-bold mr-1">{fu.scheduledTime || '10:00'}</span>
                          <span>{fu.studentName || fu.parentName}</span>
                        </div>
                      );
                    })}

                    {dayFollowUps.length > 3 && (
                      <button
                        onClick={() => {
                          setCurrentDate(slot.date);
                          setViewMode('day');
                        }}
                        className="text-[10px] text-gurukul-saffron-600 font-bold hover:underline block w-full text-left"
                      >
                        + आणखी {dayFollowUps.length - 3} कॉल्स
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEKLY CALENDAR VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center py-3">
            {weekDays.map((wd, i) => {
              const isToday = wd.dateStr === todayStr;
              return (
                <div key={i} className="space-y-0.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">{wd.dayNameMr}</div>
                  <div className={`text-base font-black w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                    isToday ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-800'
                  }`}>
                    {wd.dayNum}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[420px]">
            {weekDays.map((wd, i) => {
              const dayFu = myFollowUps.filter(f => f.scheduledDate === wd.dateStr);
              return (
                <div key={i} className="p-2.5 space-y-2 bg-white">
                  {dayFu.length === 0 ? (
                    <div className="text-center text-[11px] text-slate-300 py-8">कॉल नाही</div>
                  ) : (
                    dayFu.map(fu => (
                      <div
                        key={fu.id || fu.followUpId}
                        onClick={() => handleOpenEvent(fu)}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-gurukul-navy-500 hover:shadow-xs transition bg-slate-50/50 cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {fu.scheduledTime || '10:00'}
                          </span>
                          {getPriorityBadge(fu.priority)}
                        </div>
                        <p className="text-xs font-bold text-slate-900 truncate">{fu.studentName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{fu.parentName} • {fu.admissionClass}</p>
                        <div className="flex items-center justify-between pt-1">
                          {getStatusBadge(fu)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DAILY TIMELINE VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              <p className="text-xs text-slate-500">
                {isMarathi ? 'या दिवसासाठी नियोजित कॉल्सची सविस्तर यादी:' : 'Scheduled follow-ups for this day:'}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {myFollowUps.filter(f => f.scheduledDate === currentDate.toISOString().split('T')[0]).length} कॉल्स
            </span>
          </div>

          <div className="space-y-3">
            {myFollowUps.filter(f => f.scheduledDate === currentDate.toISOString().split('T')[0]).length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                {isMarathi ? 'या तारखेसाठी कोणताही फॉलो-अप कॉल नियोजित नाही.' : 'No follow-up calls scheduled for this date.'}
              </div>
            ) : (
              myFollowUps
                .filter(f => f.scheduledDate === currentDate.toISOString().split('T')[0])
                .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''))
                .map(fu => (
                  <div
                    key={fu.id || fu.followUpId}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 text-center shrink-0 py-1 bg-slate-100 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-slate-500 mx-auto mb-0.5" />
                        <span className="text-xs font-black text-slate-800">{fu.scheduledTime || '10:00'}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{fu.studentName}</span>
                          <span className="text-[11px] font-bold text-gurukul-saffron-600">({fu.leadNumber})</span>
                          {getPriorityBadge(fu.priority)}
                          {getStatusBadge(fu)}
                        </div>
                        <p className="text-xs text-slate-600">
                          पालक: <strong>{fu.parentName}</strong> ({fu.mobileNumber}) • प्रवेश वर्ग: <strong>{fu.admissionClass}</strong>
                        </p>
                        {fu.notes && (
                          <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                            नोंद: {fu.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      <a
                        href={`tel:${fu.mobileNumber}`}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="कॉल करा"
                      >
                        <Phone className="w-4 h-4 text-gurukul-navy-900" />
                      </a>
                      <a
                        href={`https://wa.me/91${fu.mobileNumber}?text=${encodeURIComponent(`नमस्कार ${fu.parentName}, गुरुकुल भोसे निवासी स्कूल व कॉलेजमधून संपर्क करत आहोत.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReschedule(fu)}
                        className="text-xs"
                      >
                        {isMarathi ? 'तारीख बदला' : 'Reschedule'}
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenComplete(fu)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {isMarathi ? 'पूर्ण करा' : 'Complete'}
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: AGENDA / COMPREHENSIVE LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">तारीख व वेळ</th>
                  <th className="px-4 py-3">लीड व विद्यार्थी</th>
                  <th className="px-4 py-3">पालक व संपर्क</th>
                  <th className="px-4 py-3">प्राधान्य</th>
                  <th className="px-4 py-3">स्थिती</th>
                  <th className="px-4 py-3">मागील नोंद</th>
                  <th className="px-4 py-3 text-right">कृती (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myFollowUps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      कोणतेही फॉलो-अप सापडले नाहीत.
                    </td>
                  </tr>
                ) : (
                  myFollowUps.map(fu => {
                    const isOverdue = fu.status !== 'Completed' && fu.scheduledDate < todayStr;
                    return (
                      <tr key={fu.id || fu.followUpId} className={`hover:bg-slate-50 transition ${isOverdue ? 'bg-rose-50/20' : ''}`}>
                        <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                          <div>{fu.scheduledDate}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {fu.scheduledTime || '10:00'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{fu.studentName}</div>
                          <div className="text-[11px] text-gurukul-saffron-600 font-semibold">{fu.leadNumber}</div>
                          <div className="text-[11px] text-slate-500">{fu.admissionClass}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{fu.parentName}</div>
                          <div className="text-[11px] text-slate-500">{fu.mobileNumber}</div>
                        </td>
                        <td className="px-4 py-3">
                          {getPriorityBadge(fu.priority)}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(fu)}
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-slate-500 italic">
                          {fu.notes || '—'}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => handleOpenEvent(fu)}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
                            title="पहा"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`tel:${fu.mobileNumber}`}
                            className="p-1.5 inline-block hover:bg-slate-100 rounded text-gurukul-navy-900"
                            title="Call Now"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleOpenReschedule(fu)}
                            className="p-1.5 hover:bg-slate-100 rounded text-amber-700"
                            title="Reschedule"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenComplete(fu)}
                            className="p-1.5 hover:bg-emerald-50 rounded text-emerald-600"
                            title="Complete"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: EVENT DETAILS MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={isMarathi ? 'फॉलो-अप तपशील (Follow-up Details)' : 'Follow-up Details'}
        size="md"
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gurukul-saffron-600 text-sm">{selectedEvent.leadNumber}</span>
                {getStatusBadge(selectedEvent)}
              </div>
              <h3 className="text-base font-bold text-slate-900">{selectedEvent.studentName}</h3>
              <p className="text-slate-600">पालक: <strong>{selectedEvent.parentName}</strong></p>
              <p className="text-slate-600">प्रवेश वर्ग: <strong>{selectedEvent.admissionClass}</strong></p>
              <p className="text-slate-600">मोबाईल: <strong>{selectedEvent.mobileNumber}</strong></p>
              <div className="flex items-center gap-3 pt-1">
                <span className="font-semibold text-slate-700">वेळापत्रक: {selectedEvent.scheduledDate} {selectedEvent.scheduledTime}</span>
                {getPriorityBadge(selectedEvent.priority)}
              </div>
            </div>

            {selectedEvent.notes && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-700 block mb-1">नोंद (Notes):</span>
                <p className="text-slate-600 italic">{selectedEvent.notes}</p>
              </div>
            )}

            {/* Previous History for this follow-up if rescheduled */}
            {followUpHistory.filter(h => h.followUpId === selectedEvent.id || h.followUpId === selectedEvent.followUpId).length > 0 && (
              <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-2">
                <span className="font-bold text-amber-900 block">इतिहास (Reschedule History):</span>
                <div className="space-y-1.5 divide-y divide-amber-100 text-[11px]">
                  {followUpHistory
                    .filter(h => h.followUpId === selectedEvent.id || h.followUpId === selectedEvent.followUpId)
                    .map((h, i) => (
                      <div key={i} className="pt-1.5 text-slate-600">
                        <span className="font-semibold text-slate-800">{h.action || 'Rescheduled'}:</span> {h.reason || 'No reason specified'}
                        <div className="text-[10px] text-slate-400">मागील वेळ: {h.previousScheduledAt} → नवीन: {h.newScheduledAt}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedEvent.mobileNumber}`}
                  className="px-3 py-1.5 rounded-lg bg-gurukul-navy-900 text-white font-bold flex items-center gap-1.5 hover:bg-gurukul-navy-800"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
                <a
                  href={`https://wa.me/91${selectedEvent.mobileNumber}?text=${encodeURIComponent(`नमस्कार ${selectedEvent.parentName}, गुरुकुल भोसे निवासी स्कूल व कॉलेजमधून संपर्क करत आहोत.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold flex items-center gap-1.5 hover:bg-emerald-700"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenReschedule(selectedEvent)}
                >
                  {isMarathi ? 'तारीख बदला' : 'Reschedule'}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleOpenComplete(selectedEvent)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isMarathi ? 'पूर्ण करा' : 'Complete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: RESCHEDULE MODAL */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title={isMarathi ? 'फॉलो-अप तारीख व वेळ बदला (Reschedule)' : 'Reschedule Follow-up'}
        size="md"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
            <strong>नियम:</strong> तारीख बदलल्यास मागील तारीख व कारण ऑडिट हिस्ट्रीमध्ये कायमस्वरूपी सेव्ह केले जाईल.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">नवीन तारीख *</label>
              <input
                type="date"
                min={todayStr}
                required
                value={rescheduleForm.newScheduledDate}
                onChange={(e) => setRescheduleForm(prev => ({ ...prev, newScheduledDate: e.target.value }))}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">नवीन वेळ *</label>
              <input
                type="time"
                required
                value={rescheduleForm.newScheduledTime}
                onChange={(e) => setRescheduleForm(prev => ({ ...prev, newScheduledTime: e.target.value }))}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">प्राधान्य (Priority)</label>
            <select
              value={rescheduleForm.newPriority}
              onChange={(e) => setRescheduleForm(prev => ({ ...prev, newPriority: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg"
            >
              <option value="High">High (उच्च)</option>
              <option value="Medium">Medium (मध्यम)</option>
              <option value="Low">Low (कमी)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">तारीख बदलण्याचे कारण * (Reason)</label>
            <textarea
              rows={3}
              required
              placeholder="उदा. पालकांनी उद्या दुपारी बोलण्यास सांगितले..."
              value={rescheduleForm.reason}
              onChange={(e) => setRescheduleForm(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRescheduleModalOpen(false)}
            >
              रद्द करा
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {submitting ? 'जतन करत आहे...' : 'तारीख अद्ययावत करा'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: COMPLETE FOLLOW-UP MODAL */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title={isMarathi ? 'फॉलो-अप पूर्ण नोंदवा (Complete Follow-up)' : 'Complete Follow-up'}
        size="md"
      >
        <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">कॉल / संपर्क निष्कर्ष (Call Outcome) *</label>
            <select
              value={completeForm.callOutcome}
              onChange={(e) => setCompleteForm(prev => ({ ...prev, callOutcome: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg font-semibold"
            >
              {validCallOutcomes.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">शेवटची नोंद व अभिप्राय (Completion Notes)</label>
            <textarea
              rows={3}
              placeholder="उदा. पालकांसोबत सविस्तर चर्चा झाली, रविवारच्या कॅम्पस भेटीची निश्चिती केली..."
              value={completeForm.completionNotes}
              onChange={(e) => setCompleteForm(prev => ({ ...prev, completionNotes: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCompleteModalOpen(false)}
            >
              रद्द करा
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? 'नोंदवत आहे...' : 'फॉलो-अप पूर्ण करा'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: NEW FOLLOW-UP MODAL */}
      <Modal
        isOpen={newFollowUpModalOpen}
        onClose={() => setNewFollowUpModalOpen(false)}
        title={isMarathi ? 'नवीन फॉलो-अप नियोजन करा' : 'Schedule New Follow-up'}
        size="md"
      >
        <form onSubmit={handleNewFollowUpSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">विद्यार्थी / पालक निवडा *</label>
            <select
              required
              value={newFuForm.leadId}
              onChange={(e) => setNewFuForm(prev => ({ ...prev, leadId: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg font-semibold"
            >
              <option value="">-- विद्यार्थी निवडा --</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.leadNumber} - {lead.studentName} (पालक: {lead.parentName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">तारीख *</label>
              <input
                type="date"
                min={todayStr}
                required
                value={newFuForm.scheduledDate}
                onChange={(e) => setNewFuForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">वेळ *</label>
              <input
                type="time"
                required
                value={newFuForm.scheduledTime}
                onChange={(e) => setNewFuForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">प्राधान्य (Priority)</label>
            <select
              value={newFuForm.priority}
              onChange={(e) => setNewFuForm(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg font-semibold"
            >
              <option value="High">High (उच्च)</option>
              <option value="Medium">Medium (मध्यम)</option>
              <option value="Low">Low (कमी)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">नोंद (Notes / Agenda)</label>
            <textarea
              rows={3}
              placeholder="उदा. प्रवेश फी सवलतीबाबत चर्चा करणे..."
              value={newFuForm.notes}
              onChange={(e) => setNewFuForm(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setNewFollowUpModalOpen(false)}
            >
              रद्द करा
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? 'नियोजन करत आहे...' : 'फॉलो-अप शेड्युल करा'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
