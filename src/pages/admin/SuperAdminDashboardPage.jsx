import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  UserCheck, 
  KeyRound, 
  History, 
  Activity, 
  Lock, 
  Server, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Database,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCRM } from '../../contexts/CRMContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { fetchTelecallersList, fetchAuditLogs } from '../../services/auth/authService';

export const SuperAdminDashboardPage = () => {
  const { userProfile } = useAuth();
  const { leads } = useCRM();
  const { isMarathi } = useLanguage();

  const [telecallers, setTelecallers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teleList, logs] = await Promise.all([
        fetchTelecallersList(),
        fetchAuditLogs(15)
      ]);
      setTelecallers(teleList);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Super Admin data fetch error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCount = telecallers.filter(t => t.status !== 'inactive').length;
  const inactiveCount = telecallers.filter(t => t.status === 'inactive').length;

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-gurukul-navy-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-rose-900/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Super Administrator Control Panel</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            {isMarathi ? 'प्लॅटफॉर्म मास्टर कंट्रोल डॅशबोर्ड' : 'Platform Master Control Dashboard'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {isMarathi 
              ? 'प्लॅटफॉर्म सुरक्षा, ऑडिट लॉग्स, ॲडमिन क्रेडेंशियल्स आणि सिस्टीम आर्किटेक्चर' 
              : 'Platform security, immutable audit logs, staff credentials and system architecture'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" onClick={loadData} disabled={loading} className="bg-white/10 text-white border-white/20">
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            <span>रिफ्रेश</span>
          </Button>

          <Link to="/admin/telecallers/create">
            <Button variant="primary" size="md" className="bg-rose-600 hover:bg-rose-700 text-white shadow-md">
              <Users className="w-4 h-4 mr-1.5" />
              <span>नवीन स्टाफ जोडा</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="एकूण समुपदेशक (Telecallers)"
          value={telecallers.length}
          icon={Users}
          color="navy"
          subtitle="नोंदणीकृत कर्मचारी खाती"
        />

        <StatCard
          title="सक्रिय खाती (Active Accounts)"
          value={activeCount}
          icon={UserCheck}
          color="emerald"
          subtitle="लॉगिन व कॉलिंग सक्षम"
        />

        <StatCard
          title="निष्क्रिय खाती (Inactive)"
          value={inactiveCount}
          icon={AlertTriangle}
          color="rose"
          subtitle="प्रवेश रोखण्यात आलेले"
        />

        <StatCard
          title="एकूण लीड्स ट्रॅक केलेल्या"
          value={leads.length}
          icon={Database}
          color="purple"
          subtitle="डेटाबेस एकूण नोंदी"
        />
      </div>

      {/* Security Invariants & Role Architecture Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">कस्टम क्लेम्स सुरक्षा (Custom Claims)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            प्रत्येक युझरचा रोल Firebase Auth टोकनमध्ये क्रिप्टोग्राफिकली स्वाक्षरीकृत आहे. क्लायंट-साइड डेटा छेडछाडीपासून पूर्णतः सुरक्षित.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">फायरस्टोअर सुरक्षा नियम (Firestore Rules)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            टेलिकॉलर्स केवळ त्यांना नेमून दिलेल्या लीड्स वाचू व अपडेट करू शकतात. इतरांचा गोपनीय डेटा पूर्णपणे लॉक आहे.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">क्लाउड फंक्शन्स बॅकएंड (Admin SDK)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            टेलिकॉलर खाते निर्मिती व पासवर्ड जनरेशन केवळ सर्व्हर-साइड क्लाउड फंक्शन्सद्वारे होते.
          </p>
        </div>
      </div>

      {/* Audit Log Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900">प्लॅटफॉर्म ऑडिट लॉग्स (Security Audit Logs)</h3>
              <p className="text-xs text-slate-500">प्रशासकीय कृती, खाते निर्मिती व स्थिती बदलांची अखंड नोंद</p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Immutable Append-Only
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              कोणतीही ऑडिट नोंद उपलब्ध नाही.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                      {log.action}
                    </span>
                    <span className="text-slate-500 font-semibold">
                      द्वारे: {log.actorRole || 'System'} ({log.actorId ? log.actorId.slice(0, 10) : 'SYS'}...)
                    </span>
                  </div>
                  {log.metadata && (
                    <p className="text-[11px] text-slate-600 font-mono">
                      {JSON.stringify(log.metadata)}
                    </p>
                  )}
                </div>

                <div className="text-right text-slate-400 font-mono text-[11px] shrink-0">
                  {log.timestamp ? new Date(log.timestamp.toDate ? log.timestamp.toDate() : log.timestamp).toLocaleString('mr-IN') : '-'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
