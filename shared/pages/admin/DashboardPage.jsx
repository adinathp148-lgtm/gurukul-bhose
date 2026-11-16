import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '../../contexts/CRMContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Users,
  UserPlus,
  PhoneCall,
  Clock,
  AlertTriangle,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  Phone,
  MessageCircle,
  Calendar,
  UserCheck,
  Building2,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
  Shield,
  Eye,
  CheckCheck
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const DashboardPage = () => {
  const { isMarathi } = useLanguage();
  const { userProfile, role, isTelecaller, isSuperAdmin } = useAuth();
  const {
    leads,
    allLeads,
    followUps,
    calls,
    telecallers,
    activities,
    admissionApplications,
    getMetrics,
    getSystemReports,
    completeFollowUp
  } = useCRM();

  const metrics = getMetrics();
  const reports = getSystemReports();

  const todayStr = new Date().toISOString().split('T')[0];

  // Today's Follow-up Leads Queue
  const todayFollowUps = useMemo(() => {
    return (followUps || []).filter(
      f => f.scheduledDate === todayStr && f.status !== 'Completed'
    ).slice(0, 8);
  }, [followUps, todayStr]);

  // Overdue Follow-ups
  const overdueFollowUps = useMemo(() => {
    return (followUps || []).filter(
      f => f.status === 'Overdue' || (f.status !== 'Completed' && f.scheduledDate && f.scheduledDate < todayStr)
    ).slice(0, 8);
  }, [followUps, todayStr]);

  // Recent 6 Enquiries
  const recentEnquiries = useMemo(() => {
    return (allLeads || leads).slice(0, 6);
  }, [allLeads, leads]);

  // Recent Activities
  const recentActivities = useMemo(() => {
    return (activities || []).slice(0, 6);
  }, [activities]);

  // Lead Status Breakdown for visual chart
  const leadStatusDistribution = useMemo(() => {
    const counts = {
      New: 0,
      Assigned: 0,
      Contacted: 0,
      Interested: 0,
      'Follow-up': 0,
      Visited: 0,
      Converted: 0,
      Lost: 0
    };
    (allLeads || leads).forEach(l => {
      const st = l.status || l.leadStatus || 'New';
      if (counts[st] !== undefined) counts[st]++;
      else counts.New++;
    });
    return counts;
  }, [allLeads, leads]);

  const handleQuickCompleteFollowUp = async (followUpId, leadId) => {
    await completeFollowUp({
      followUpId,
      leadId,
      completionNotes: 'कॉल व चर्चा पूर्ण झाली.'
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-gurukul-navy-950 via-slate-900 to-gurukul-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-400">
            {role.toUpperCase()} WORKSPACE • GURUKUL BHOSE
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            {isMarathi ? 'स्वागत आहे' : 'Welcome'}, {userProfile?.displayName || userProfile?.fullName || 'Administrator'}!
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {isMarathi
              ? 'गुरुकुल विद्यामंदिर व ज्युनिअर कॉलेज (सैनिक पॅटर्न निवासी) प्रवेश व लीड व्यवस्थापन CRM नियंत्रण कक्ष.'
              : 'Gurukul Vidyamandir & Junior College (Sainik Pattern Residential) Central Admission & CRM Control Hub.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link to="/admin/enquiries">
            <Button variant="primary" size="md">
              <UserPlus className="w-4 h-4 mr-1.5" />
              <span>{isMarathi ? 'प्रवेश अर्ज पहा' : 'View Enquiries'}</span>
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <TrendingUp className="w-4 h-4 mr-1.5" />
              <span>{isMarathi ? 'अहवाल' : 'Reports'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. All 10 Dynamic KPI Statistics Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {isMarathi ? 'मुख्य सांख्यिकी (Key Admission & CRM Metrics)' : 'Core Admission & CRM Metrics'}
          </h3>
          <span className="text-[11px] font-bold text-gurukul-saffron-600 font-mono">
            सत्र 2026-2027
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. Total Admission Enquiries */}
          <StatCard
            title={isMarathi ? 'एकूण चौकशी' : 'Total Enquiries'}
            value={metrics.totalEnquiries}
            icon={Users}
            color="navy"
            subtitle={isMarathi ? 'नोंदणी झालेले सर्व अर्ज' : 'All Registered Enquiries'}
          />

          {/* 2. New Enquiries */}
          <StatCard
            title={isMarathi ? 'नवीन अर्ज (New)' : 'New Enquiries'}
            value={metrics.newEnquiries}
            icon={UserPlus}
            color="orange"
            subtitle={isMarathi ? 'प्राथमिक संपर्क बाकी' : 'Awaiting Initial Contact'}
          />

          {/* 3. Assigned Leads */}
          <StatCard
            title={isMarathi ? 'नेमून दिलेल्या' : 'Assigned Leads'}
            value={metrics.assignedLeads}
            icon={UserCheck}
            color="purple"
            subtitle={isMarathi ? 'समुपदेशकांकडे सक्रिय' : 'Under Active Counselors'}
          />

          {/* 4. Contacted Leads */}
          <StatCard
            title={isMarathi ? 'संपर्क साधलेला' : 'Contacted Leads'}
            value={metrics.contactedLeads}
            icon={PhoneCall}
            color="navy"
            subtitle={isMarathi ? 'पालकांशी चर्चा पूर्ण' : 'Contact Established'}
          />

          {/* 5. Interested Parents */}
          <StatCard
            title={isMarathi ? 'इच्छुक पालक' : 'Interested Parents'}
            value={metrics.interestedParents}
            icon={TrendingUp}
            color="amber"
            subtitle={isMarathi ? 'सकारात्मक प्रतिसाद' : 'Positive Interest'}
          />

          {/* 6. Follow-ups Today */}
          <StatCard
            title={isMarathi ? 'आजचे फॉलो-अप्स' : "Today's Follow-ups"}
            value={metrics.todayFollowUps}
            icon={Clock}
            color="orange"
            subtitle={isMarathi ? 'आज संपर्क साधणे आवश्यक' : 'Due for Contact Today'}
          />

          {/* 7. Overdue Follow-ups */}
          <StatCard
            title={isMarathi ? 'थकबाकी फॉलो-अप्स' : 'Overdue Follow-ups'}
            value={metrics.overdueFollowUps}
            icon={AlertTriangle}
            color="rose"
            subtitle={isMarathi ? 'तातडीने लक्ष देण्याची गरज' : 'Urgent Attention Required'}
          />

          {/* 8. Completed Follow-ups */}
          <StatCard
            title={isMarathi ? 'पूर्ण केलेले फॉलो-अप्स' : 'Completed Follow-ups'}
            value={metrics.completedFollowUps}
            icon={CheckCircle2}
            color="emerald"
            subtitle={isMarathi ? 'यशस्वीरित्या पूर्ण' : 'Successfully Finished'}
          />

          {/* 9. Admission Applications */}
          <StatCard
            title={isMarathi ? 'प्रवेश अर्ज प्रक्रिया' : 'Applications Pipeline'}
            value={metrics.admissionApplications}
            icon={Layers}
            color="purple"
            subtitle={isMarathi ? 'कागदपत्रे व पडताळणी' : 'Under Verification'}
          />

          {/* 10. Confirmed Admissions */}
          <StatCard
            title={isMarathi ? 'निश्चित प्रवेश' : 'Confirmed Admissions'}
            value={metrics.confirmedAdmissions}
            icon={GraduationCap}
            color="emerald"
            subtitle={`${metrics.conversionRate}% ${isMarathi ? 'यश दर' : 'Conversion Rate'}`}
          />
        </div>
      </div>

      {/* 3. Analytical Charts Grid (Lead Status, Monthly Trends, Conversion Funnel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* A. Lead Status Distribution Visual Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {isMarathi ? 'लीड स्थिती वितरण (Status Distribution)' : 'Lead Status Breakdown'}
              </h4>
              <span className="text-[10px] text-slate-400 font-bold">{metrics.totalEnquiries} Leads</span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'नवीन (New)', count: leadStatusDistribution.New, color: 'bg-blue-500' },
                { label: 'नेमणूक (Assigned)', count: leadStatusDistribution.Assigned, color: 'bg-purple-500' },
                { label: 'संपर्क (Contacted)', count: leadStatusDistribution.Contacted, color: 'bg-sky-500' },
                { label: 'इच्छुक (Interested)', count: leadStatusDistribution.Interested, color: 'bg-amber-500' },
                { label: 'फॉलो-अप (Follow-up)', count: leadStatusDistribution['Follow-up'], color: 'bg-orange-500' },
                { label: 'शाळा भेट (Visited)', count: leadStatusDistribution.Visited, color: 'bg-indigo-500' },
                { label: 'प्रवेश निश्चित (Converted)', count: leadStatusDistribution.Converted, color: 'bg-emerald-500' }
              ].map((item, idx) => {
                const total = metrics.totalEnquiries || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{item.label}</span>
                      <span className="font-mono text-slate-500">{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(pct, item.count > 0 ? 5 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <Link to="/admin/leads" className="text-xs font-bold text-gurukul-saffron-600 hover:underline pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
            <span>{isMarathi ? 'संपूर्ण लीड CRM पहा' : 'View Full Leads CRM'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* B. Monthly Enquiry Trend Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {isMarathi ? 'मासिक चौकशी कल (Monthly Trend)' : 'Monthly Enquiry Trend'}
              </h4>
              <span className="text-[10px] text-slate-400 font-bold">Last 6 Months</span>
            </div>

            <div className="grid grid-cols-6 gap-2 items-end h-44 pt-4 border-b border-slate-100 pb-2">
              {(reports.last6Months || []).map((m, idx) => {
                const maxVal = Math.max(...reports.last6Months.map(x => x.totalEnquiries), 4);
                const heightPct = Math.round((m.totalEnquiries / maxVal) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-bold text-slate-800">{m.totalEnquiries}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-gurukul-navy-950 to-gurukul-saffron-500 transition-all duration-500"
                      style={{ height: `${Math.max(heightPct, 8)}%` }}
                    />
                    <span className="text-[9px] font-bold text-slate-500 text-center truncate w-full">
                      {m.monthName.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-between text-xs text-slate-500">
              <span>एकूण नोंदणी वाढीचा कल</span>
              <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                सकारात्मक (Positive)
              </span>
            </div>
          </div>

          <Link to="/admin/reports" className="text-xs font-bold text-gurukul-saffron-600 hover:underline pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
            <span>{isMarathi ? 'सविस्तर अहवाल पहा' : 'View Full Reports'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* C. Admission Conversion Funnel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {isMarathi ? 'प्रवेश रूपांतरण फनेल (Conversion Funnel)' : 'Admission Conversion Funnel'}
              </h4>
              <span className="text-[10px] font-bold text-emerald-600">{metrics.conversionRate}% Conv.</span>
            </div>

            <div className="space-y-3 pt-1">
              {(reports.pipelineFunnel || []).map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="truncate pr-2">{step.stage}</span>
                    <span className="font-mono text-slate-800 shrink-0 font-bold">{step.count} ({step.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gurukul-navy-900 to-gurukul-saffron-500 transition-all duration-500"
                      style={{ width: `${Math.max(step.percent, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link to="/admin/admissions" className="text-xs font-bold text-gurukul-saffron-600 hover:underline pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
            <span>{isMarathi ? 'प्रवेश प्रक्रिया यादी' : 'View Admission Register'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4. Action Queues: Today's Follow-ups & Overdue Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Follow-up Queue */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h3 className="font-bold text-sm text-slate-900">
                {isMarathi ? "आजचे फॉलो-अप्स (Today's Follow-ups)" : "Today's Follow-ups"} ({todayFollowUps.length})
              </h3>
            </div>
            <Link to="/admin/follow-ups" className="text-xs font-bold text-gurukul-saffron-600 hover:underline">
              {isMarathi ? 'सर्व पहा' : 'View All'}
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-80">
            {todayFollowUps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                {isMarathi ? 'आजसाठी कोणतेही प्रलंबित फॉलो-अप्स शिल्लक नाहीत! उत्तम काम!' : 'No follow-ups due today! All clear!'}
              </div>
            ) : (
              todayFollowUps.map((fu) => (
                <div key={fu.id || fu.followUpId} className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {fu.studentName || fu.leadNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                        {fu.scheduledTime || '10:00'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      पालक: {fu.parentName} • {fu.mobileNumber}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      समुपदेशक: {fu.assignedTelecallerName || 'Staff'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${fu.mobileNumber}`}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                      title="कॉल करा"
                    >
                      <Phone className="w-3.5 h-3.5 text-gurukul-navy-900" />
                    </a>
                    <a
                      href={`https://wa.me/91${fu.mobileNumber}?text=${encodeURIComponent(`नमस्कार ${fu.parentName}, गुरुकुल भोसे सैनिक पॅटर्न निवासी स्कूलमधून संपर्क करत आहोत.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                      title="WhatsApp मेसेज"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleQuickCompleteFollowUp(fu.id || fu.followUpId, fu.leadId)}
                      className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center gap-1"
                      title="पूर्ण म्हणून नोंदवा"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue Queue */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-red-50/40">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <h3 className="font-bold text-sm text-red-900">
                {isMarathi ? 'थकबाकी फॉलो-अप्स (Overdue)' : 'Overdue Follow-ups'} ({overdueFollowUps.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold text-red-700 uppercase bg-red-100 px-2 py-0.5 rounded">
              तातडीचे (Urgent)
            </span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-80">
            {overdueFollowUps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {isMarathi ? 'कोणतीही थकबाकी नाही. सर्व कॉल्स वेळेवर पूर्ण झाले आहेत!' : 'No overdue calls. All up to date!'}
              </div>
            ) : (
              overdueFollowUps.map((fu) => (
                <div key={fu.id || fu.followUpId} className="p-3 hover:bg-red-50/20 flex items-center justify-between gap-3">
                  <div className="overflow-hidden">
                    <p className="font-bold text-xs text-slate-900 truncate">{fu.studentName || fu.leadNumber}</p>
                    <p className="text-[11px] text-slate-500">{fu.parentName} • {fu.mobileNumber}</p>
                    <p className="text-[10px] text-red-600 font-bold mt-0.5 font-mono">
                      नियोजित तारीख: {fu.scheduledDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${fu.mobileNumber}`}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <Link to="/admin/follow-ups">
                      <Button variant="danger" size="sm" className="text-[11px] py-1 px-2">
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

      {/* 5. Recent Enquiries & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Enquiries Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {isMarathi ? 'अलीकडील प्रवेश चौकशी (Recent Enquiries)' : 'Recent Enquiries'}
                </h3>
                <p className="text-[11px] text-slate-500">वेबसाईट व सोशल मीडियावरून प्राप्त नवीन अर्ज</p>
              </div>
              <Link to="/admin/enquiries" className="text-xs font-bold text-gurukul-saffron-600 hover:underline">
                सर्व पहा
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">अर्ज क्र.</th>
                    <th className="py-2.5 px-3">विद्यार्थी नाव</th>
                    <th className="py-2.5 px-3">इयत्ता</th>
                    <th className="py-2.5 px-3">समुपदेशक</th>
                    <th className="py-2.5 px-3">स्थिती</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentEnquiries.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{lead.leadNumber || lead.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{lead.studentName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{lead.admissionClass || '5 वी'}</td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500">
                        {lead.assignedTelecallerName || 'नेमणूक बाकी'}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge size="xs" variant={lead.status || lead.leadStatus}>
                          {lead.status || lead.leadStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activities Timeline */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {isMarathi ? 'अलीकडील कृती (Recent Activities)' : 'Recent Activities'}
                </h3>
                <p className="text-[11px] text-slate-500">सिस्टममधील थेट घडामोडी</p>
              </div>
              <Link to="/admin/audit-logs" className="text-xs font-bold text-gurukul-saffron-600 hover:underline">
                ऑडिट लॉग्स
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">कोणत्याही अलीकडील नोंदी नाहीत.</p>
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-gurukul-saffron-500 mt-1.5 shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 truncate">{act.activityType || 'Action'}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {act.createdAt ? new Date(act.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Telecaller Performance Leaderboard Summary */}
      {!isTelecaller && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isMarathi ? 'टेलिकॉलर कामगिरी सारांश (Telecaller Performance Leaderboard)' : 'Telecaller Performance Summary'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                नेमून दिलेल्या लीड्स, झालेले कॉल्स, निश्चित प्रवेश आणि फॉलो-अप पूर्णता टक्केवारी
              </p>
            </div>
            <Link to="/admin/telecallers">
              <Button variant="outline" size="sm">
                {isMarathi ? 'सर्व समुपदेशक व्यवस्थापन' : 'Manage Telecallers'}
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">समुपदेशक (Counselor)</th>
                  <th className="py-3 px-4">ईमेल</th>
                  <th className="py-3 px-4 text-center">नेमून दिलेल्या लीड्स</th>
                  <th className="py-3 px-4 text-center">झालेले कॉल्स</th>
                  <th className="py-3 px-4 text-center">झालेले प्रवेश</th>
                  <th className="py-3 px-4 text-center">यश टक्केवारी (%)</th>
                  <th className="py-3 px-4 text-center">फॉलो-अप पूर्णता दर</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(reports.telecallerReport || []).slice(0, 5).map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">{t.telecallerName}</td>
                    <td className="py-3 px-4 text-slate-500">{t.email}</td>
                    <td className="py-3 px-4 text-center font-semibold text-purple-700">{t.assignedLeads}</td>
                    <td className="py-3 px-4 text-center font-semibold text-blue-600">{t.callsMade}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">{t.convertedAdmissions}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t.conversionRate}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {t.followUpCompletionRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
