import React from 'react';
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
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCRM } from '../../contexts/CRMContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const TelecallerDashboardPage = () => {
  const { currentUser, userProfile } = useAuth();
  const { leads } = useCRM();

  const telecallerUid = currentUser?.uid || '';

  // Filter leads strictly assigned to this telecaller
  const myLeads = leads.filter(l => l.assignedTelecallerId === telecallerUid);

  const todayStr = new Date().toISOString().split('T')[0];

  // Specific KPI computations for this telecaller
  const totalAssigned = myLeads.length;
  const newLeads = myLeads.filter(l => l.leadStatus === 'New').length;
  const interestedLeads = myLeads.filter(l => l.leadStatus === 'Interested').length;
  const todayFollowUps = myLeads.filter(l => l.nextFollowUp === todayStr && l.leadStatus !== 'Admitted');
  const overdueFollowUps = myLeads.filter(l => l.nextFollowUp && l.nextFollowUp < todayStr && l.leadStatus !== 'Admitted');
  const pendingFollowUps = myLeads.filter(l => l.nextFollowUp && l.nextFollowUp > todayStr && l.leadStatus !== 'Admitted').length;
  const convertedAdmissions = myLeads.filter(l => l.leadStatus === 'Admitted').length;

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            समुपदेशक पोर्टल (COUNSELOR WORKSPACE)
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            स्वागत आहे, {userProfile?.displayName || userProfile?.fullName || 'Counselor'}!
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            आज आपल्याकडे एकूण <strong>{todayFollowUps.length}</strong> कॉल्सचे नियोजन आहे आणि <strong>{overdueFollowUps.length}</strong> कॉल्स बाकी आहेत.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/telecaller/follow-ups?filter=today">
            <Button variant="primary" size="md" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
              <PhoneCall className="w-4 h-4 mr-1.5" />
              <span>आजचे कॉल्स सुरू करा</span>
            </Button>
          </Link>
          <Link to="/telecaller/leads">
            <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <span>माझ्या सर्व लीड्स</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 7 Telecaller KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="एकूण नेमून दिलेल्या लीड्स"
          value={totalAssigned}
          icon={Users}
          color="navy"
          subtitle="माझ्या खात्यावरील सक्रिय लीड्स"
        />

        <StatCard
          title="नवीन लीड्स (New Leads)"
          value={newLeads}
          icon={UserPlus}
          color="orange"
          subtitle="अद्याप पहिला कॉल बाकी"
        />

        <StatCard
          title="इच्छुक पालक (Interested)"
          value={interestedLeads}
          icon={Sparkles}
          color="amber"
          subtitle="प्रवेशासाठी सकारात्मक प्रतिसाद"
        />

        <StatCard
          title="आजचे फॉलो-अप्स (Today)"
          value={todayFollowUps.length}
          icon={Clock}
          color="emerald"
          subtitle="आज ठरवलेले संपर्क"
        />

        <StatCard
          title="थकबाकी फॉलो-अप्स (Overdue)"
          value={overdueFollowUps.length}
          icon={AlertTriangle}
          color="rose"
          subtitle="तारीख उलटून गेलेले कॉल्स"
        />

        <StatCard
          title="प्रलंबित फॉलो-अप्स (Pending)"
          value={pendingFollowUps}
          icon={Calendar}
          color="purple"
          subtitle="पुढील दिवसांचे नियोजन"
        />

        <StatCard
          title="निश्चित प्रवेश (Admissions)"
          value={convertedAdmissions}
          icon={GraduationCap}
          color="emerald"
          subtitle="कन्फर्म झालेले प्रवेश"
        />
      </div>

      {/* Action Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Today's Follow-up Queue */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
              <h3 className="font-bold text-sm text-slate-900">
                आजचे फॉलो-अप कॉल्स (Today's Calls) ({todayFollowUps.length})
              </h3>
            </div>
            <Link to="/telecaller/follow-ups?filter=today" className="text-xs font-bold text-emerald-700 hover:underline">
              सर्व पहा
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-96">
            {todayFollowUps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                आजसाठी कोणताही फॉलो-अप कॉल बाकी नाही! उत्तम काम!
              </div>
            ) : (
              todayFollowUps.map((lead) => (
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
                      पालक: {lead.parentName} • {lead.admissionClass}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      शेवटची नोंद: {lead.notes}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${lead.mobileNumber}`}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                      title="कॉल करा"
                    >
                      <Phone className="w-4 h-4 text-gurukul-navy-900" />
                    </a>
                    <a
                      href={`https://wa.me/91${lead.whatsappNumber || lead.mobileNumber}?text=${encodeURIComponent(`नमस्कार ${lead.parentName}, गुरुकुल भोसे निवासी स्कूल व कॉलेजमधून संपर्क करत आहोत.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                      title="WhatsApp मेसेज"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <Link to={`/telecaller/follow-ups?leadId=${lead.id}`}>
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

        {/* Overdue Queue */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-sm text-rose-900">
                थकबाकी कॉल्स (Overdue) ({overdueFollowUps.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold text-rose-700 uppercase">तातडीने कॉल करा</span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-96">
            {overdueFollowUps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                कोणतीही थकबाकी नाही. सर्व कॉल्स नियोजनानुसार पूर्ण झाले आहेत!
              </div>
            ) : (
              overdueFollowUps.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-rose-50/20 flex items-center justify-between gap-3">
                  <div className="overflow-hidden">
                    <p className="font-bold text-xs text-slate-900 truncate">{lead.studentName}</p>
                    <p className="text-[11px] text-slate-500">{lead.parentName} • {lead.mobileNumber}</p>
                    <p className="text-[10px] text-rose-600 font-bold mt-0.5">
                      नियोजित तारीख: {lead.nextFollowUp}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${lead.mobileNumber}`}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <Link to={`/telecaller/follow-ups?leadId=${lead.id}`}>
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

    </div>
  );
};
