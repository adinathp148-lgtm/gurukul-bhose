import React, { useState, useEffect } from 'react';
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
  ArrowRight, 
  Phone, 
  MessageCircle, 
  Calendar,
  UserCheck,
  UserX,
  Shield
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { fetchTelecallersList } from '../../services/auth/authService';

export const DashboardPage = () => {
  const { leads, getMetrics } = useCRM();
  const { userProfile, role, isTelecaller } = useAuth();
  const { isMarathi } = useLanguage();
  const metrics = getMetrics();

  const [telecallers, setTelecallers] = useState([]);
  const [telecallersLoading, setTelecallersLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchTelecallersList().then(list => {
      if (isMounted) {
        setTelecallers(list || []);
        setTelecallersLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const totalTelecallers = telecallers.length;
  const activeTelecallers = telecallers.filter(t => t.status !== 'inactive').length;
  const inactiveTelecallers = telecallers.filter(t => t.status === 'inactive').length;

  const todayStr = new Date().toISOString().split('T')[0];

  // Today's Follow-up Leads
  const todayLeads = leads.filter(l => l.nextFollowUp === todayStr && l.leadStatus !== 'Admitted');
  
  // Overdue Leads
  const overdueLeads = leads.filter(l => l.nextFollowUp && l.nextFollowUp < todayStr && l.leadStatus !== 'Admitted');

  // Recent New Leads
  const recentNewLeads = leads.filter(l => l.leadStatus === 'New').slice(0, 5);

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gurukul-navy-950 via-slate-900 to-gurukul-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-400">
            {role.toUpperCase()} PORTAL
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            {isMarathi ? `स्वागत आहे, ${userProfile?.displayName || 'User'}!` : `Welcome, ${userProfile?.displayName || 'User'}!`}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {isTelecaller 
              ? (isMarathi ? 'आपल्याला नेमून दिलेल्या लीड्स आणि आजचे फॉलो-अप्स खालीलप्रमाणे आहेत.' : 'Here are your assigned leads and today\'s follow-up schedule.')
              : (isMarathi ? 'सर्व शाखा, प्रवेश चौकशी, फॉलो-अप्स आणि टेलिकॉलर कामगिरीचा थेट आढावा.' : 'Live executive overview of all campus branches, enquiries, and admissions.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/telecallers">
            <Button variant="primary" size="md">
              <Users className="w-4 h-4 mr-1.5" />
              <span>{isMarathi ? 'टेलिकॉलर यादी पहा' : 'View Counselors'}</span>
            </Button>
          </Link>
          <Link to="/admin/follow-ups">
            <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <PhoneCall className="w-4 h-4 mr-1.5" />
              <span>{isMarathi ? 'कॉल रजिस्टर' : 'Call Register'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Main KPI Stat Cards as specified in Phase 3 Section 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={isMarathi ? "एकूण टेलिकॉलर्स (Total Staff)" : "Total Staff (Counselors)"}
          value={totalTelecallers}
          icon={Users}
          color="navy"
          subtitle={isMarathi ? "नोंदणीकृत समुपदेशक खाती" : "Registered Staff Accounts"}
        />

        <StatCard
          title={isMarathi ? "सक्रिय टेलिकॉलर्स (Active)" : "Active Counselors"}
          value={activeTelecallers}
          icon={UserCheck}
          color="emerald"
          subtitle={isMarathi ? "लॉगिन व कॉलिंग चालू" : "Active & Calling"}
        />

        <StatCard
          title={isMarathi ? "निष्क्रिय टेलिकॉलर्स (Inactive)" : "Inactive Accounts"}
          value={inactiveTelecallers}
          icon={UserX}
          color="rose"
          subtitle={isMarathi ? "प्रवेश रोखलेली खाती" : "Disabled Access Accounts"}
        />

        <StatCard
          title={isMarathi ? "एकूण चौकशी (Total Enquiries)" : "Total Enquiries"}
          value={metrics.totalEnquiries}
          icon={UserPlus}
          color="orange"
          subtitle={isMarathi ? "संस्थेकडे आलेल्या सर्व लीड्स" : "All Campus Inbound Leads"}
        />

        <StatCard
          title={isMarathi ? "नेमून दिलेल्या लीड्स (Assigned)" : "Assigned Leads"}
          value={metrics.assignedLeads}
          icon={Users}
          color="purple"
          subtitle={isMarathi ? "समुपदेशकांकडे सक्रिय" : "Active With Counselors"}
        />

        <StatCard
          title={isMarathi ? "प्रलंबित फॉलो-अप्स (Pending)" : "Pending Follow-ups"}
          value={metrics.pendingFollowUps}
          icon={Clock}
          color="amber"
          subtitle={isMarathi ? "पुढील दिवसांचे नियोजन" : "Upcoming Follow-ups"}
        />

        <StatCard
          title={isMarathi ? "निश्चित प्रवेश (Total Admissions)" : "Confirmed Admissions"}
          value={metrics.totalAdmissions}
          icon={GraduationCap}
          color="emerald"
          subtitle={isMarathi ? "कन्फर्म झालेले प्रवेश" : "Confirmed Enrolled Students"}
        />

        <StatCard
          title={isMarathi ? "कन्व्हर्जन दर (Conversion Rate)" : "Conversion Rate"}
          value={`${metrics.conversionRate}%`}
          icon={TrendingUp}
          color="emerald"
          subtitle={isMarathi ? "लीड ते प्रवेश यश टक्केवारी" : "Lead to Admission Ratio"}
        />
      </div>

      {/* 2. Today's & Overdue Follow-up Action Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Today's Follow-up Queue */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></div>
              <h3 className="font-bold text-sm text-slate-900">
                {isMarathi ? "आजचे फॉलो-अप्स (Today's Follow-ups)" : "Today's Follow-ups"} ({todayLeads.length})
              </h3>
            </div>
            <Link to="/admin/follow-ups" className="text-xs font-bold text-gurukul-saffron-600 hover:underline">
              {isMarathi ? "सर्व पहा" : "View All"}
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-96">
            {todayLeads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                {isMarathi ? "आजसाठी कोणतेही प्रलंबित फॉलो-अप्स शिल्लक नाहीत! उत्तम काम!" : "No pending follow-ups for today! Great job!"}
              </div>
            ) : (
              todayLeads.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4">
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {lead.studentName}
                      </span>
                      <Badge size="xs" variant={lead.leadStatus}>
                        {lead.leadStatus}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isMarathi ? 'पालक' : 'Parent'}: {lead.parentName} • {lead.admissionClass}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {isMarathi ? 'नोंद' : 'Note'}: {lead.notes}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${lead.mobileNumber}`}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                      title={isMarathi ? "कॉल करा" : "Call"}
                    >
                      <Phone className="w-4 h-4 text-gurukul-navy-900" />
                    </a>
                    <a
                      href={`https://wa.me/91${lead.whatsappNumber || lead.mobileNumber}?text=${encodeURIComponent(`नमस्कार ${lead.parentName}, गुरुकुल भोसे निवासी स्कूल व कॉलेजमधून संपर्क करत आहोत.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <Link to="/admin/follow-ups">
                      <Button variant="primary" size="sm" className="text-xs py-1 px-2.5">
                        {isMarathi ? "नोंदवा" : "Log Call"}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue Queue */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <h3 className="font-bold text-sm text-red-900">
                {isMarathi ? "थकबाकी फॉलो-अप्स (Overdue)" : "Overdue Follow-ups"} ({overdueLeads.length})
              </h3>
            </div>
            <span className="text-[11px] font-bold text-red-700">{isMarathi ? "तातडीचे" : "Urgent"}</span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-96">
            {overdueLeads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {isMarathi 
                  ? "कोणतीही थकबाकी नाही. सर्व कॉल्स वेळेवर पूर्ण झाले आहेत!" 
                  : "No overdue calls. All scheduled follow-ups are up to date!"}
              </div>
            ) : (
              overdueLeads.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-red-50/20 flex items-center justify-between gap-3">
                  <div className="overflow-hidden">
                    <p className="font-bold text-xs text-slate-900 truncate">{lead.studentName}</p>
                    <p className="text-[11px] text-slate-500">{lead.parentName} • {lead.mobileNumber}</p>
                    <p className="text-[10px] text-red-600 font-bold mt-0.5">
                      {isMarathi ? 'नियोजित तारीख' : 'Scheduled'}: {lead.nextFollowUp}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${lead.mobileNumber}`}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                      title={isMarathi ? "कॉल करा" : "Call"}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <Link to="/admin/follow-ups">
                      <Button variant="danger" size="sm" className="text-[11px] py-1 px-2">
                        {isMarathi ? "कॉल करा" : "Call Now"}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 3. Telecaller Performance Leaderboard (for Admin / Super Admin) */}
      {!isTelecaller && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isMarathi ? 'टेलिकॉलर कामगिरी अहवाल (Telecaller Performance)' : 'Counselor Performance Leaderboard'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isMarathi 
                  ? 'नेमून दिलेल्या लीड्स, पूर्ण केलेले कॉल्स आणि ऍडमिशन रूपांतरण दर' 
                  : 'Assigned leads, completed calls, and admission conversion rate'}
              </p>
            </div>
            <Link to="/admin/telecallers">
              <Button variant="outline" size="sm">
                {isMarathi ? 'कर्मचारी व्यवस्थापन' : 'Staff Management'}
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">{isMarathi ? 'समुपदेशक (Counselor)' : 'Counselor'}</th>
                  <th className="py-3 px-4">{isMarathi ? 'ईमेल' : 'Email'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'नेमून दिलेल्या लीड्स' : 'Assigned Leads'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'झालेले कॉल्स' : 'Calls Done'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'झालेले प्रवेश' : 'Admissions'}</th>
                  <th className="py-3 px-4 text-center">{isMarathi ? 'यश टक्केवारी (%)' : 'Success %'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.telecallerPerformance.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">{t.name}</td>
                    <td className="py-3 px-4 text-slate-500">{t.email}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">{t.assignedCount}</td>
                    <td className="py-3 px-4 text-center font-semibold text-blue-600">{t.callsDone}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">{t.convertedCount}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t.conversionRate}%
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
