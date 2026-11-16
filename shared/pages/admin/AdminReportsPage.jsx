import React, { useState, useMemo } from 'react';
import { useCRM } from '../../contexts/CRMContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  GraduationCap,
  PhoneCall,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const AdminReportsPage = () => {
  const { isMarathi } = useLanguage();
  const { getSystemReports, exportReportCSV } = useCRM();
  const reports = getSystemReports();

  const [activeTab, setActiveTab] = useState('daily_weekly');
  const [selectedYear, setSelectedYear] = useState('2026-2027');

  // CSV Exporters
  const exportDailyWeeklyCSV = () => {
    const headers = ['तारीख / दिवस (Date / Day)', 'प्राप्त चौकशी संख्या (Enquiries Count)'];
    const rows = (reports.last7Days || []).map(d => [
      `${d.date} (${d.day})`,
      d.enquiries
    ]);
    exportReportCSV('Daily_Enquiries_Report', headers, rows, 'Daily_Enquiries_Gurukul');
  };

  const exportMonthlyCSV = () => {
    const headers = ['महिना (Month)', 'एकूण चौकशी (Total Enquiries)', 'निश्चित प्रवेश (Admissions)', 'रूपांतरण दर (Conversion Rate)'];
    const rows = (reports.last6Months || []).map(m => [
      m.monthName,
      m.totalEnquiries,
      m.convertedAdmissions,
      m.conversionRate
    ]);
    exportReportCSV('Monthly_Enquiries_Report', headers, rows, 'Monthly_Enquiries_Gurukul');
  };

  const exportClassWiseCSV = () => {
    const headers = ['इयत्ता (Class)', 'एकूण चौकशी (Total Enquiries)', 'इच्छुक पालक (Interested)', 'निश्चित प्रवेश (Admissions)', 'यश टक्केवारी (Conversion Rate)'];
    const rows = (reports.classWiseReport || []).map(c => [
      c.className,
      c.totalEnquiries,
      c.interested,
      c.converted,
      c.conversionRate
    ]);
    exportReportCSV('Class_Wise_Enquiries_Report', headers, rows, 'Class_Wise_Report_Gurukul');
  };

  const exportTelecallerPerformanceCSV = () => {
    const headers = [
      'समुपदेशक (Counselor)',
      'कर्मचारी क्र. (Emp ID)',
      'नेमून दिलेल्या लीड्स (Assigned Leads)',
      'झालेले कॉल्स (Calls Made)',
      'इच्छुक पालक (Interested)',
      'झालेले प्रवेश (Admissions)',
      'कन्व्हर्जन दर (Conversion %)',
      'पूर्ण केलेले फॉलो-अप्स (Completed F/U)',
      'थकबाकी (Overdue F/U)',
      'फॉलो-अप पूर्णता दर (Completion Rate)'
    ];
    const rows = (reports.telecallerReport || []).map(t => [
      t.telecallerName,
      t.employeeId,
      t.assignedLeads,
      t.callsMade,
      t.interestedLeads,
      t.convertedAdmissions,
      t.conversionRate,
      t.completedFollowUps,
      t.overdueFollowUps,
      t.followUpCompletionRate
    ]);
    exportReportCSV('Telecaller_Performance_Report', headers, rows, 'Telecaller_Performance_Gurukul');
  };

  const exportFunnelCSV = () => {
    const headers = ['टप्पा (Pipeline Stage)', 'विद्यार्थी संख्या (Count)', 'टक्केवारी (Percent %)'];
    const rows = (reports.pipelineFunnel || []).map(f => [
      f.stage,
      f.count,
      `${f.percent}%`
    ]);
    exportReportCSV('Lead_Conversion_Funnel_Report', headers, rows, 'Conversion_Funnel_Gurukul');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isMarathi ? 'प्रवेश अहवाल व विश्लेषण (Reports & Analytics)' : 'Reports & Analytics'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gurukul-saffron-50 text-gurukul-saffron-700 border border-gurukul-saffron-200">
              {isMarathi ? 'सत्र 2026-2027' : 'Session 2026-2027'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi
              ? 'दैनिक, साप्ताहिक, मासिक, इयत्तानिहाय चौकशी व समुपदेशक कामगिरीचे थेट विश्लेषण.'
              : 'Real-time analytical reports on daily trends, class-wise distribution, telecaller performance, and conversion.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-xl border border-slate-300 font-bold text-slate-700 bg-white shadow-sm"
          >
            <option value="2026-2027">2026-2027 (चालू वर्ष)</option>
            <option value="2025-2026">2025-2026 (मागील वर्ष)</option>
          </select>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('daily_weekly')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'daily_weekly'
              ? 'bg-gurukul-saffron-500 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {isMarathi ? 'दैनिक व साप्ताहिक चौकशी' : 'Daily & Weekly'}
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'monthly'
              ? 'bg-gurukul-saffron-500 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {isMarathi ? 'मासिक अहवाल (Monthly)' : 'Monthly Trends'}
        </button>
        <button
          onClick={() => setActiveTab('class_wise')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'class_wise'
              ? 'bg-gurukul-saffron-500 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {isMarathi ? 'इयत्तानिहाय अहवाल (Class-wise)' : 'Class-wise'}
        </button>
        <button
          onClick={() => setActiveTab('telecallers')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'telecallers'
              ? 'bg-gurukul-saffron-500 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {isMarathi ? 'समुपदेशक कामगिरी (Counselors)' : 'Telecallers'}
        </button>
        <button
          onClick={() => setActiveTab('conversion_funnel')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'conversion_funnel'
              ? 'bg-gurukul-saffron-500 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {isMarathi ? 'प्रवेश रूपांतरण फनेल (Conversion)' : 'Conversion Funnel'}
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB A: Daily & Weekly Enquiries */}
      {activeTab === 'daily_weekly' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {isMarathi ? 'गेल्या ७ दिवसांतील दैनिक चौकशी (Daily Enquiries - Last 7 Days)' : 'Daily Enquiries - Last 7 Days'}
            </h3>
            <Button variant="outline" size="sm" onClick={exportDailyWeeklyCSV}>
              <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>{isMarathi ? 'CSV डाउनलोड करा' : 'Export CSV'}</span>
            </Button>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-7 gap-3 items-end h-56 pt-6">
              {(reports.last7Days || []).map((day, idx) => {
                const maxEnquiries = Math.max(...reports.last7Days.map(d => d.enquiries), 5);
                const heightPct = Math.round((day.enquiries / maxEnquiries) * 100);

                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-black text-gurukul-navy-900">{day.enquiries}</span>
                    <div
                      className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-gurukul-navy-950 to-gurukul-saffron-500 transition-all duration-500"
                      style={{ height: `${Math.max(heightPct, 6)}%` }}
                    />
                    <div className="text-center">
                      <p className="text-[11px] font-bold text-slate-700">{day.day}</p>
                      <p className="text-[9px] text-slate-400 font-mono">{day.date.slice(5)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Summary Cards */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">
              {isMarathi ? 'साप्ताहिक चौकशी प्रवाह (Weekly Aggregations)' : 'Weekly Enquiries Breakdown'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(reports.last4Weeks || []).map((w, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-xs font-bold text-slate-600">{w.weekLabel}</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{w.enquiries}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">नोंदणी झालेले अर्ज</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB B: Monthly Enquiries Report */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {isMarathi ? 'मासिक प्रवेश चौकशी व रूपांतरण अहवाल (Monthly Breakdown)' : 'Monthly Breakdown'}
            </h3>
            <Button variant="outline" size="sm" onClick={exportMonthlyCSV}>
              <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>{isMarathi ? 'CSV डाउनलोड करा' : 'Export CSV'}</span>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{isMarathi ? 'महिना' : 'Month'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'एकूण चौकशी' : 'Total Enquiries'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'निश्चित प्रवेश' : 'Admitted'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'रूपांतरण टक्केवारी' : 'Conversion Rate'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(reports.last6Months || []).map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{m.monthName}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">{m.totalEnquiries}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{m.convertedAdmissions}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {m.conversionRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB C: Class-wise Enquiries Report */}
      {activeTab === 'class_wise' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {isMarathi ? 'इयत्तानिहाय प्रवेश मागणी व यश टक्केवारी (Class-wise Demands)' : 'Class-wise Enquiries'}
            </h3>
            <Button variant="outline" size="sm" onClick={exportClassWiseCSV}>
              <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>{isMarathi ? 'CSV डाउनलोड करा' : 'Export CSV'}</span>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{isMarathi ? 'इयत्ता / वर्ग' : 'Class / Department'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'एकूण चौकशी' : 'Total Enquiries'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'सकारात्मक / इच्छुक' : 'Interested'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'निश्चित प्रवेश' : 'Confirmed Admissions'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'कन्व्हर्जन दर' : 'Conversion %'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(reports.classWiseReport || []).map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.className}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">{c.totalEnquiries}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-amber-600">{c.interested}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{c.converted}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">{c.conversionRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB D: Telecaller Performance Report */}
      {activeTab === 'telecallers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {isMarathi ? 'समुपदेशक कार्यक्षमता व फॉलो-अप पूर्तता अहवाल' : 'Telecaller Performance & Follow-up Completion'}
            </h3>
            <Button variant="outline" size="sm" onClick={exportTelecallerPerformanceCSV}>
              <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>{isMarathi ? 'CSV डाउनलोड करा' : 'Export CSV'}</span>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{isMarathi ? 'समुपदेशक' : 'Counselor'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'असाइन लीड्स' : 'Assigned'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'झालेले कॉल्स' : 'Calls'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'इच्छुक पालक' : 'Interested'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'झालेले प्रवेश' : 'Admitted'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'कन्व्हर्जन दर' : 'Conversion %'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'फॉलो-अप पूर्णता' : 'F/U Completion %'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(reports.telecallerReport || []).map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{t.telecallerName}</p>
                      <p className="text-[10px] text-slate-400">{t.email} • {t.employeeId}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-purple-700">{t.assignedLeads}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600">{t.callsMade}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-amber-600">{t.interestedLeads}</td>
                    <td className="py-3.5 px-4 text-center font-black text-emerald-600">{t.convertedAdmissions}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700">{t.conversionRate}</td>
                    <td className="py-3.5 px-4 text-center">
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

      {/* TAB E: Lead Conversion Funnel */}
      {activeTab === 'conversion_funnel' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {isMarathi ? 'प्रवेश रूपांतरण फनेल (Lead to Admission Funnel)' : 'Lead Conversion Funnel'}
            </h3>
            <Button variant="outline" size="sm" onClick={exportFunnelCSV}>
              <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>{isMarathi ? 'CSV डाउनलोड करा' : 'Export CSV'}</span>
            </Button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            {(reports.pipelineFunnel || []).map((step, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{step.stage}</span>
                  <span>{step.count} ({step.percent}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200/60">
                  <div
                    className="bg-gradient-to-r from-gurukul-navy-900 to-gurukul-saffron-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(step.percent, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
