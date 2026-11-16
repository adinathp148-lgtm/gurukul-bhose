import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  PhoneCall, 
  Clock, 
  AlertTriangle, 
  Users, 
  Download, 
  Search, 
  Flame, 
  Target, 
  ArrowUpRight, 
  GraduationCap, 
  X,
  Eye,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCRM } from '../../contexts/CRMContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';

export const TelecallerPerformancePage = () => {
  const { isMarathi } = useLanguage();
  const { 
    telecallers, 
    allLeads, 
    allCalls, 
    allFollowUps, 
    getPerformanceAnalytics, 
    exportPerformanceCSV 
  } = useCRM();

  // Filter state
  const [dateFilter, setDateFilter] = useState('ALL'); // 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Compute performance analytics
  const performanceData = useMemo(() => {
    return getPerformanceAnalytics();
  }, [getPerformanceAnalytics, allLeads, allCalls, allFollowUps, telecallers]);

  // Filter by search term
  const filteredPerformance = useMemo(() => {
    if (!searchTerm.trim()) return performanceData;
    const q = searchTerm.toLowerCase();
    return performanceData.filter(p => 
      (p.telecallerName || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q)
    );
  }, [performanceData, searchTerm]);

  // Leaderboard Champions (Section 10)
  const topConversion = useMemo(() => {
    if (performanceData.length === 0) return null;
    return [...performanceData].sort((a, b) => b.conversionRate - a.conversionRate)[0];
  }, [performanceData]);

  const topCaller = useMemo(() => {
    if (performanceData.length === 0) return null;
    return [...performanceData].sort((a, b) => b.totalCalls - a.totalCalls)[0];
  }, [performanceData]);

  const topCompletion = useMemo(() => {
    if (performanceData.length === 0) return null;
    return [...performanceData].sort((a, b) => b.completionRate - a.completionRate)[0];
  }, [performanceData]);

  const overallLeader = useMemo(() => {
    if (performanceData.length === 0) return null;
    // Composite score: conversion * 0.5 + completion * 0.3 + (calls / 10) * 0.2
    return [...performanceData].sort((a, b) => {
      const scoreA = (a.conversionRate * 0.5) + (a.completionRate * 0.3) + (a.totalCalls * 0.2);
      const scoreB = (b.conversionRate * 0.5) + (b.completionRate * 0.3) + (b.totalCalls * 0.2);
      return scoreB - scoreA;
    })[0];
  }, [performanceData]);

  // Handle Export CSV
  const handleExportCSV = () => {
    const res = exportPerformanceCSV();
    if (res.success) {
      showNotification(isMarathi ? 'समुपदेशक कार्यक्षमता रिपोर्ट CSV डाऊनलोड झाली!' : 'Telecaller performance report exported to CSV!');
    }
  };

  return (
    <div className="space-y-8">

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gurukul-saffron-600 uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>{isMarathi ? 'कार्यक्षमता व गुणवत्ता मूल्यमापन' : 'PERFORMANCE & KPI ANALYTICS'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gurukul-navy-950 mt-1">
            {isMarathi ? 'समुपदेशक कार्यक्षमता व लीडरबोर्ड' : 'Telecaller Performance & Leaderboard'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isMarathi 
              ? 'प्रवेश रुपांतरण दर (Conversion Rate), फॉलो-अप पूर्णता दर व दैनिक कॉलिंग उद्दिष्टे.' 
              : 'Conversion rate, follow-up completion rate, call volume, and staff leaderboards.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs font-bold border-slate-300 hover:bg-slate-50"
          >
            <Download className="w-4 h-4 text-gurukul-saffron-600" />
            <span>{isMarathi ? 'CSV रिपोर्ट डाऊनलोड' : 'Export Performance CSV'}</span>
          </Button>
          <Link to="/admin/call-monitoring">
            <Button variant="primary" size="md" className="bg-gurukul-navy-900 hover:bg-gurukul-navy-800 text-white text-xs font-bold flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4" />
              <span>{isMarathi ? 'कॉल मॉनिटरिंग' : 'Call Monitoring'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Leaderboard Champion Cards (Section 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Top Performer Overall */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute right-2 top-2 opacity-15">
            <Trophy className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-200">
            <Trophy className="w-4 h-4" />
            <span>{isMarathi ? 'सर्वोत्कृष्ट समुपदेशक' : 'Top Performer'}</span>
          </div>
          <div>
            <h3 className="text-lg font-black">{overallLeader?.telecallerName || 'No Data'}</h3>
            <p className="text-xs text-amber-100">{overallLeader?.email}</p>
          </div>
          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
            <span>रुपांतरण दर: <strong>{overallLeader?.conversionRate || 0}%</strong></span>
            <span>पूर्णता दर: <strong>{overallLeader?.completionRate || 0}%</strong></span>
          </div>
        </div>

        {/* Highest Conversion Rate */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute right-2 top-2 opacity-15">
            <GraduationCap className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-200">
            <Award className="w-4 h-4" />
            <span>{isMarathi ? 'सर्वोच्च प्रवेश रुपांतरण' : 'Highest Conversion'}</span>
          </div>
          <div>
            <h3 className="text-lg font-black">{topConversion?.telecallerName || 'No Data'}</h3>
            <p className="text-xs text-emerald-100">
              {topConversion?.convertedAdmissions || 0} प्रवेश निश्चित केले
            </p>
          </div>
          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
            <span>Conversion Rate:</span>
            <span className="text-base font-black text-emerald-200">{topConversion?.conversionRate || 0}%</span>
          </div>
        </div>

        {/* Highest Calls Made */}
        <div className="bg-gradient-to-br from-gurukul-navy-900 via-gurukul-navy-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute right-2 top-2 opacity-15">
            <PhoneCall className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gurukul-saffron-400">
            <Flame className="w-4 h-4" />
            <span>{isMarathi ? 'सर्वाधिक कॉल्स' : 'Highest Calls Made'}</span>
          </div>
          <div>
            <h3 className="text-lg font-black">{topCaller?.telecallerName || 'No Data'}</h3>
            <p className="text-xs text-slate-300">
              {topCaller?.connectedCalls || 0} यशस्वी थेट संभाषण
            </p>
          </div>
          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
            <span>एकूण कॉल्स:</span>
            <span className="text-base font-black text-gurukul-saffron-300">{topCaller?.totalCalls || 0} Calls</span>
          </div>
        </div>

        {/* Best Follow-up Completion */}
        <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 text-white rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute right-2 top-2 opacity-15">
            <CheckCircle2 className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-200">
            <Target className="w-4 h-4" />
            <span>{isMarathi ? 'फॉलो-अप शिस्त' : 'Best Completion Rate'}</span>
          </div>
          <div>
            <h3 className="text-lg font-black">{topCompletion?.telecallerName || 'No Data'}</h3>
            <p className="text-xs text-purple-200">
              {topCompletion?.completedFollowUps || 0} फॉलो-अप पूर्ण
            </p>
          </div>
          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
            <span>Completion Rate:</span>
            <span className="text-base font-black text-purple-200">{topCompletion?.completionRate || 0}%</span>
          </div>
        </div>

      </div>

      {/* Controls & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Date Filter Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {[
            { id: 'ALL', label: isMarathi ? 'सर्व वेळ (All)' : 'All Time' },
            { id: 'TODAY', label: isMarathi ? 'आज (Today)' : 'Today' },
            { id: 'WEEK', label: isMarathi ? 'या आठवड्यात' : 'This Week' },
            { id: 'MONTH', label: isMarathi ? 'या महिन्यात' : 'This Month' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                dateFilter === f.id
                  ? 'bg-white text-gurukul-navy-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[240px] w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isMarathi ? 'समुपदेशकाचे नाव किंवा ईमेल...' : 'Search telecaller...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500"
          />
        </div>
      </div>

      {/* Performance Comparison Master Table (Section 10) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            {isMarathi ? 'समुपदेशक तुलनात्मक विश्लेषण तक्ता' : 'Comparative Performance Table'} ({filteredPerformance.length})
          </h3>
          <span className="text-xs text-slate-400">
            {isMarathi ? 'कन्वर्जन = निश्चित प्रवेश / एकूण लीड्स × १००' : 'Conversion Rate = Converted / Assigned × 100'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">समुपदेशक (Telecaller)</th>
                <th className="px-4 py-3 text-center">नेमून दिलेल्या लीड्स</th>
                <th className="px-4 py-3 text-center">एकूण कॉल्स</th>
                <th className="px-4 py-3 text-center">यशस्वी संभाषण</th>
                <th className="px-4 py-3 text-center">प्रलंबित फॉलो-अप्स</th>
                <th className="px-4 py-3 text-center">थकबाकी (Overdue)</th>
                <th className="px-4 py-3 text-center">निश्चित प्रवेश</th>
                <th className="px-4 py-3 text-center">रुपांतरण दर (Conversion)</th>
                <th className="px-4 py-3 text-center">पूर्णता दर (Completion)</th>
                <th className="px-4 py-3 text-right">तपशील</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPerformance.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    कोणतेही समुपदेशक सापडले नाहीत.
                  </td>
                </tr>
              ) : (
                filteredPerformance.map(t => (
                  <tr key={t.telecallerId} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{t.telecallerName}</div>
                      <div className="text-[11px] text-slate-400">{t.email}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">
                      {t.assignedLeads}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-800">
                      {t.totalCalls}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-emerald-700">
                      {t.connectedCalls}
                    </td>
                    <td className="px-4 py-3 text-center text-amber-700 font-semibold">
                      {t.pendingFollowUps}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-rose-600">
                      {t.overdueFollowUps}
                    </td>
                    <td className="px-4 py-3 text-center font-black text-emerald-800">
                      {t.convertedAdmissions}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-black text-slate-900">{t.conversionRate}%</span>
                        <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full" 
                            style={{ width: `${Math.min(t.conversionRate, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-black text-slate-900">{t.completionRate}%</span>
                        <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${t.completionRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                            style={{ width: `${Math.min(t.completionRate, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/telecallers/${t.telecallerId}`}>
                        <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="View Telecaller Details">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default TelecallerPerformancePage;
