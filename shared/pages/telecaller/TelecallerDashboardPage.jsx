import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  PhoneCall, 
  Clock, 
  AlertTriangle, 
  GraduationCap, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  Sparkles,
  ArrowRight,
  UserPlus,
  Flame,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  PhoneIncoming,
  RotateCcw,
  CheckCircle,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCRM } from '../../contexts/CRMContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const TelecallerDashboardPage = () => {
  const { currentUser, userProfile } = useAuth();
  const { 
    leads, 
    calls, 
    followUps, 
    statusConfig, 
    validCallOutcomes 
  } = useCRM();
  const { isMarathi } = useLanguage();

  const telecallerUid = currentUser?.uid || '';
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter leads, calls, and follow-ups assigned to this telecaller
  const myLeads = useMemo(() => {
    return leads.filter(l => l.assignedTelecallerId === telecallerUid || l.assignedTo === telecallerUid);
  }, [leads, telecallerUid]);

  const myCalls = useMemo(() => {
    return calls.filter(c => c.telecallerId === telecallerUid);
  }, [calls, telecallerUid]);

  const myFollowUps = useMemo(() => {
    return followUps.filter(f => f.assignedTo === telecallerUid);
  }, [followUps, telecallerUid]);

  // 1. KPI Calculations (Section 8)
  const totalAssigned = myLeads.length;
  
  // Calls today
  const callsToday = useMemo(() => {
    return myCalls.filter(c => (c.callTimestamp || c.createdAt || '').startsWith(todayStr)).length;
  }, [myCalls, todayStr]);

  // Follow-ups today & overdue
  const todayFollowUpsList = useMemo(() => {
    return myFollowUps.filter(f => f.scheduledDate === todayStr && f.status !== 'Completed' && f.status !== 'Cancelled');
  }, [myFollowUps, todayStr]);

  const overdueFollowUpsList = useMemo(() => {
    return myFollowUps.filter(f => f.status !== 'Completed' && f.status !== 'Cancelled' && (
      f.scheduledDate < todayStr || 
      (f.scheduledDate === todayStr && f.scheduledTime && f.scheduledTime < new Date().toTimeString().slice(0, 5))
    ));
  }, [myFollowUps, todayStr]);

  const pendingFollowUps = myFollowUps.filter(f => f.status === 'Scheduled' || f.status === 'Rescheduled').length;
  const connectedCallsCount = myCalls.filter(c => c.callOutcome === 'Connected').length;
  const callBacksCount = myCalls.filter(c => c.callOutcome === 'Call Back Requested').length;
  const interestedLeadsCount = myLeads.filter(l => l.leadStatus === 'Interested' || l.status === 'Interested').length;
  const admissionsConverted = myLeads.filter(l => l.leadStatus === 'Admitted' || l.leadStatus === 'Converted').length;

  // Follow-up completion rate = Completed / (Completed + Overdue) * 100
  const completedFollowUpsCount = myFollowUps.filter(f => f.status === 'Completed').length;
  const completionRateDenominator = completedFollowUpsCount + overdueFollowUpsList.length;
  const completionRate = completionRateDenominator > 0 
    ? Math.round((completedFollowUpsCount / completionRateDenominator) * 100) 
    : 100;

  // 2. High priority, recently assigned, recently contacted lists
  const highPriorityLeads = useMemo(() => {
    return myLeads
      .filter(l => l.leadStatus !== 'Admitted' && l.leadStatus !== 'Lost')
      .slice(0, 5);
  }, [myLeads]);

  const recentlyAssignedLeads = useMemo(() => {
    return [...myLeads]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [myLeads]);

  const recentlyContactedLeads = useMemo(() => {
    return [...myLeads]
      .filter(l => l.lastContactedAt)
      .sort((a, b) => new Date(b.lastContactedAt || 0) - new Date(a.lastContactedAt || 0))
      .slice(0, 5);
  }, [myLeads]);

  // 3. Chart 1: Daily Calls Bar Chart (Past 7 Days)
  const last7DaysData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = myCalls.filter(c => (c.callTimestamp || c.createdAt || '').startsWith(dateStr)).length;
      days.push({ dateStr, dayLabel, count });
    }
    return days;
  }, [myCalls]);

  const maxDailyCalls = Math.max(...last7DaysData.map(d => d.count), 5);

  // 4. Chart 2: Call Outcomes Breakdown
  const outcomeBreakdown = useMemo(() => {
    const counts = {};
    validCallOutcomes.forEach(o => { counts[o] = 0; });
    myCalls.forEach(c => {
      if (counts[c.callOutcome] !== undefined) {
        counts[c.callOutcome]++;
      } else {
        counts[c.callOutcome] = 1;
      }
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([outcome, count]) => ({
        outcome,
        count,
        percent: myCalls.length > 0 ? Math.round((count / myCalls.length) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [myCalls, validCallOutcomes]);

  // 5. Chart 3: Lead Status Distribution
  const statusDistribution = useMemo(() => {
    const counts = {};
    myLeads.forEach(l => {
      const st = l.leadStatus || l.status || 'New';
      counts[st] = (counts[st] || 0) + 1;
    });

    return Object.entries(counts).map(([st, count]) => ({
      status: st,
      count,
      percent: myLeads.length > 0 ? Math.round((count / myLeads.length) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [myLeads]);

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gurukul-navy-950 via-slate-900 to-gurukul-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-400">
            {isMarathi ? 'समुपदेशक कार्यक्षेत्र (COUNSELOR PORTAL)' : 'COUNSELOR PORTAL'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            {isMarathi ? 'स्वागत आहे' : 'Welcome'}, {userProfile?.displayName || userProfile?.fullName || 'Counselor'}!
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {isMarathi ? (
              <>आज आपल्याकडे <strong>{todayFollowUpsList.length}</strong> नियोजित कॉल्स आहेत आणि <strong>{overdueFollowUpsList.length}</strong> थकबाकी कॉल्स आहेत.</>
            ) : (
              <>You have <strong>{todayFollowUpsList.length}</strong> calls scheduled for today and <strong>{overdueFollowUpsList.length}</strong> overdue follow-ups.</>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/telecaller/calls">
            <Button variant="primary" size="md" className="bg-gurukul-saffron-500 hover:bg-gurukul-saffron-600 text-white font-bold shadow-md flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4" />
              <span>{isMarathi ? 'कॉल सुरू करा' : 'Start Calling'}</span>
            </Button>
          </Link>
          <Link to="/telecaller/calendar">
            <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{isMarathi ? 'कॅलेंडर पहा' : 'View Calendar'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 9 KPI Summary Cards (Section 8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title={isMarathi ? 'एकूण लीड्स' : 'Assigned Leads'}
          value={totalAssigned}
          icon={Users}
          color="navy"
          subtitle={isMarathi ? 'सक्रिय प्रवेश चौकशी' : 'Total in pipeline'}
        />

        <StatCard
          title={isMarathi ? 'आजचे कॉल्स' : 'Calls Today'}
          value={callsToday}
          icon={PhoneCall}
          color="amber"
          subtitle={isMarathi ? 'आज नोंदवलेले कॉल्स' : 'Calls recorded today'}
        />

        <StatCard
          title={isMarathi ? 'आजचे फॉलो-अप्स' : 'Today Follow-ups'}
          value={todayFollowUpsList.length}
          icon={Clock}
          color="emerald"
          subtitle={isMarathi ? 'आजचे शेड्युल' : 'Scheduled for today'}
        />

        <StatCard
          title={isMarathi ? 'थकबाकी फॉलो-अप्स' : 'Overdue Follow-ups'}
          value={overdueFollowUpsList.length}
          icon={AlertTriangle}
          color="rose"
          subtitle={isMarathi ? 'तातडीने संपर्क करा' : 'Needs urgent call'}
        />

        <StatCard
          title={isMarathi ? 'प्रलंबित फॉलो-अप्स' : 'Pending Follow-ups'}
          value={pendingFollowUps}
          icon={Calendar}
          color="purple"
          subtitle={isMarathi ? 'शेड्युल केलेले कॉल्स' : 'Scheduled in future'}
        />

        <StatCard
          title={isMarathi ? 'यशस्वी कॉल्स' : 'Connected Calls'}
          value={connectedCallsCount}
          icon={CheckCircle}
          color="emerald"
          subtitle={isMarathi ? 'पालकांशी थेट संवाद' : 'Calls connected'}
        />

        <StatCard
          title={isMarathi ? 'कॉल बॅक विनंती' : 'Call Backs'}
          value={callBacksCount}
          icon={RotateCcw}
          color="amber"
          subtitle={isMarathi ? 'पुन्हा कॉल सांगणारे' : 'Call backs requested'}
        />

        <StatCard
          title={isMarathi ? 'इच्छुक पालक' : 'Interested Leads'}
          value={interestedLeadsCount}
          icon={Sparkles}
          color="orange"
          subtitle={isMarathi ? 'प्रवेशासाठी सकारात्मक' : 'High interest leads'}
        />

        <StatCard
          title={isMarathi ? 'निश्चित प्रवेश' : 'Admissions Converted'}
          value={admissionsConverted}
          icon={GraduationCap}
          color="emerald"
          subtitle={isMarathi ? 'कन्फर्म झालेले प्रवेश' : 'Confirmed admissions'}
        />

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{isMarathi ? 'पूर्णता दर (Completion)' : 'Completion Rate'}</span>
            <Activity className="w-4 h-4 text-gurukul-saffron-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{completionRate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                completionRate >= 80 ? 'bg-emerald-500' : completionRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Dynamic Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Daily Calls Bar Chart (Past 7 Days) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gurukul-saffron-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {isMarathi ? 'दैनिक कॉल्स आलेख (मागील ७ दिवस)' : 'Daily Calls Activity (Last 7 Days)'}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {myCalls.length} एकूण कॉल्स
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
            {last7DaysData.map((d, i) => {
              const heightPercent = maxDailyCalls > 0 ? (d.count / maxDailyCalls) * 100 : 0;
              const isToday = d.dateStr === todayStr;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition">
                    {d.count}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden max-w-[36px]">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday ? 'bg-gurukul-saffron-500' : 'bg-gurukul-navy-900 hover:bg-gurukul-navy-800'
                      }`}
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold ${isToday ? 'text-gurukul-saffron-600 font-bold' : 'text-slate-400'}`}>
                    {d.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>सरासरी: {Math.round(myCalls.length / 7)} कॉल्स / दिवस</span>
            <span className="text-gurukul-saffron-600 font-bold">आज: {callsToday} कॉल्स</span>
          </div>
        </div>

        {/* Chart 2: Call Outcomes Breakdown */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {isMarathi ? 'कॉल निष्कर्ष वर्गीकरण (Call Outcomes)' : 'Call Outcomes Breakdown'}
              </h3>
            </div>
            <Link to="/telecaller/calls" className="text-xs font-bold text-gurukul-saffron-600 hover:underline">
              सर्व पहा
            </Link>
          </div>

          {outcomeBreakdown.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
              अद्याप कोणताही कॉल नोंदवला गेला नाही.
            </div>
          ) : (
            <div className="space-y-2.5 pt-2">
              {outcomeBreakdown.slice(0, 5).map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.outcome}</span>
                    <span className="text-slate-500 font-bold">{item.count} ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.outcome === 'Connected' ? 'bg-emerald-500' :
                        item.outcome === 'Interested' ? 'bg-gurukul-saffron-500' :
                        item.outcome === 'Admission Confirmed' ? 'bg-green-600' :
                        item.outcome === 'Busy' || item.outcome === 'No Answer' ? 'bg-amber-400' : 'bg-slate-400'
                      }`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Section 8: Today's Work Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 1. Today's Follow-up Calls Queue */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="font-bold text-sm text-slate-900">
                {isMarathi ? `आजचे फॉलो-अप्स (${todayFollowUpsList.length})` : `Today's Follow-ups (${todayFollowUpsList.length})`}
              </h3>
            </div>
            <Link to="/telecaller/calendar" className="text-xs font-bold text-emerald-700 hover:underline">
              कॅलेंडरमध्ये पहा
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-96">
            {todayFollowUpsList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                {isMarathi ? 'आजसाठी सर्व फॉलो-अप कॉल्स पूर्ण झाले आहेत!' : 'All follow-up calls completed for today! Great job!'}
              </div>
            ) : (
              todayFollowUpsList.map((fu) => (
                <div key={fu.id || fu.followUpId} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 transition">
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">{fu.studentName}</span>
                      <span className="text-[10px] font-bold text-gurukul-saffron-600">({fu.leadNumber})</span>
                      <Badge size="xs" variant={fu.priority === 'High' ? 'Lost' : 'Interested'}>{fu.priority}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      पालक: {fu.parentName} • {fu.admissionClass} • वेळ: <strong>{fu.scheduledTime || '10:00'}</strong>
                    </p>
                    {fu.notes && (
                      <p className="text-[11px] text-slate-400 truncate italic">
                        नोंद: {fu.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${fu.mobileNumber}`}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                      title="Call Now"
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
                    <Link to={`/telecaller/calls?leadId=${fu.leadId}`}>
                      <Button variant="primary" size="sm" className="text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                        नोंदवा
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Overdue Follow-ups Queue */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-sm text-rose-900">
                {isMarathi ? `थकबाकी कॉल्स (${overdueFollowUpsList.length})` : `Overdue Follow-ups (${overdueFollowUpsList.length})`}
              </h3>
            </div>
            <span className="text-[10px] font-bold text-rose-700 uppercase">तातडीने कॉल करा</span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-96">
            {overdueFollowUpsList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                कोणतीही थकबाकी नाही. सर्व कॉल्स नियोजनानुसार पूर्ण झाले आहेत!
              </div>
            ) : (
              overdueFollowUpsList.map((fu) => (
                <div key={fu.id || fu.followUpId} className="p-4 hover:bg-rose-50/20 flex items-center justify-between gap-3 transition">
                  <div className="overflow-hidden space-y-0.5">
                    <p className="font-bold text-xs text-slate-900 truncate">{fu.studentName}</p>
                    <p className="text-[11px] text-slate-500">{fu.parentName} • {fu.mobileNumber}</p>
                    <p className="text-[10px] text-rose-600 font-bold">
                      नियोजित तारीख: {fu.scheduledDate} {fu.scheduledTime}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${fu.mobileNumber}`}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      <Phone className="w-3.5 h-3.5 text-gurukul-navy-900" />
                    </a>
                    <Link to={`/telecaller/calls?leadId=${fu.leadId}`}>
                      <Button variant="danger" size="sm" className="text-[11px] py-1 px-2.5">
                        कॉल करा
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 3. Recently Assigned Leads & Recently Contacted Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recently Assigned Leads */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {isMarathi ? 'नुकत्याच नेमून दिलेल्या लीड्स (Recently Assigned)' : 'Recently Assigned Leads'}
            </h3>
            <Link to="/telecaller/leads" className="text-xs font-bold text-gurukul-saffron-600 hover:underline">
              सर्व पहा
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentlyAssignedLeads.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">कोणतीही नवीन लीड नाही.</div>
            ) : (
              recentlyAssignedLeads.map(lead => (
                <div key={lead.id} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{lead.studentName}</div>
                    <div className="text-[11px] text-slate-500">पालक: {lead.parentName} • {lead.admissionClass}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge size="xs" variant={lead.leadStatus || lead.status}>{lead.leadStatus || lead.status}</Badge>
                    <Link to={`/telecaller/calls?leadId=${lead.id}`}>
                      <Button size="xs" variant="outline" className="text-[11px]">कॉल करा</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Contacted Leads */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {isMarathi ? 'नुकताच संपर्क झालेले पालक (Recently Contacted)' : 'Recently Contacted Leads'}
            </h3>
            <Link to="/telecaller/calls" className="text-xs font-bold text-gurukul-saffron-600 hover:underline">
              कॉल हिस्ट्री
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentlyContactedLeads.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">अद्याप कोणताही संपर्क झालेला नाही.</div>
            ) : (
              recentlyContactedLeads.map(lead => (
                <div key={lead.id} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{lead.studentName}</div>
                    <div className="text-[11px] text-slate-500">
                      शेवटचा कॉल: {lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {lead.lastCallOutcome || lead.leadStatus}
                    </span>
                    <Link to={`/telecaller/calls?leadId=${lead.id}`}>
                      <Button size="xs" variant="primary" className="text-[11px] bg-gurukul-navy-900 hover:bg-gurukul-navy-800 text-white">
                        फॉलो-अप
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
export default TelecallerDashboardPage;
