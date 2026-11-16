import React from 'react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../../contexts/CMSContext';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  FileEdit, 
  Home, 
  Layers, 
  Info, 
  GraduationCap, 
  BookOpen, 
  Image as ImageIcon, 
  Video, 
  Bell, 
  Building2, 
  Phone, 
  Search, 
  Settings, 
  History, 
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Badge } from '../../../components/common/Badge';

export const CMSDashboardPage = () => {
  const { 
    homepageData, 
    pages, 
    courses, 
    gallery, 
    videos, 
    notices, 
    facilities, 
    activityLogs,
    loading 
  } = useCMS();
  const { userProfile, role } = useAuth();

  const cmsModules = [
    {
      title: 'मुख्यपृष्ठ व्यवस्थापन (Homepage)',
      desc: 'हिरो बॅनर्स, स्वागत संदेश, वैशिष्ट्ये व प्रवेश CTA',
      path: '/admin/cms/homepage',
      icon: Home,
      count: `${homepageData?.heroSlides?.length || 3} बॅनर्स`,
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      title: 'पेज मॅनेजमेंट (Pages CMS)',
      desc: 'सर्व मुख्य पेजेसचे कंटेंट ब्लॉक्स व मजकूर संपादन',
      path: '/admin/cms/pages',
      icon: Layers,
      count: `${pages?.length || 8} पेजेस`,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      title: 'आमच्याबद्दल (About Us)',
      desc: 'संस्थेचा इतिहास, ध्येय, नेतृत्व, यश व पायाभूत सुविधा',
      path: '/admin/cms/about',
      icon: Info,
      count: 'सक्रिय',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      title: 'शैक्षणिक विभाग (Programs)',
      desc: 'विद्यामंदिर, जुनिअर कॉलेज व अकॅडमीज माहिती',
      path: '/admin/cms/programs',
      icon: GraduationCap,
      count: '५ विभाग',
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      title: 'कोर्सेस मॅनेजमेंट (Courses)',
      desc: 'अभ्यासक्रम तपशील, पात्रता, कालावधी व प्रवेश',
      path: '/admin/cms/courses',
      icon: BookOpen,
      count: `${courses?.length || 0} कोर्सेस`,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      title: 'फोटो गॅलरी (Gallery)',
      desc: 'कॅम्पस, स्नेहसंमेलन व उपक्रम छायाचित्रे अपलोड',
      path: '/admin/cms/gallery',
      icon: ImageIcon,
      count: `${gallery?.length || 0} फोटो`,
      color: 'bg-rose-50 text-rose-600 border-rose-200'
    },
    {
      title: 'व्हिडिओ दालन (Videos)',
      desc: 'YouTube व्हिडिओ, टूअर्स व सांस्कृतिक कार्यक्रम',
      path: '/admin/cms/videos',
      icon: Video,
      count: `${videos?.length || 0} व्हिडिओ`,
      color: 'bg-red-50 text-red-600 border-red-200'
    },
    {
      title: 'सूचना पत्रक (Notices & Bulletins)',
      desc: 'महत्त्वाच्या सूचना, प्रवेश नोटिसा व PDF सर्क्युलर्स',
      path: '/admin/cms/notices',
      icon: Bell,
      count: `${notices?.length || 0} सूचना`,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    },
    {
      title: 'कॅम्पस सुविधा (Facilities)',
      desc: 'लॅब, ग्राउंड, हॉस्टेल, मेस व डिफेन्स सुविधा',
      path: '/admin/cms/facilities',
      icon: Building2,
      count: `${facilities?.length || 0} सुविधा`,
      color: 'bg-teal-50 text-teal-600 border-teal-200'
    },
    {
      title: 'कॅम्पस संपर्क (Contact Info)',
      desc: 'पत्ता, फोन, WhatsApp, नकाशे व कामकाजाची वेळ',
      path: '/admin/cms/contact',
      icon: Phone,
      count: 'अद्ययावत',
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      title: 'SEO व मेटा टॅग्ज (SEO Manager)',
      desc: 'गुगल सर्च टायटल्स, मेटा डिस्क्रिप्शन्स व साइटमॅप',
      path: '/admin/cms/seo',
      icon: Search,
      count: 'सक्रिय',
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200'
    },
    {
      title: 'वेबसाईट सेटिंग्स (Settings)',
      desc: 'लोगो, नोटीस बार, मेंटेनन्स मोड व कॉपीराइट',
      path: '/admin/cms/settings',
      icon: Settings,
      count: 'सिस्टम',
      color: 'bg-slate-100 text-slate-700 border-slate-300'
    },
    {
      title: 'कंटेंट ॲक्टिव्हिटी लॉग (Activity Logs)',
      desc: 'बदल, अपडेट्स व डिलीशनचा संपूर्ण ऑडिट ट्रेल',
      path: '/admin/cms/activity-logs',
      icon: History,
      count: `${activityLogs?.length || 0} नोंदी`,
      color: 'bg-slate-50 text-slate-800 border-slate-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gurukul-navy-950 to-gurukul-navy-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-gurukul-saffron-500/20 text-gurukul-saffron-300 text-xs font-bold border border-gurukul-saffron-500/30">
                Phase 4 • Dynamic Website CMS
              </span>
              <span className="text-xs text-slate-400">लॉगिन: {userProfile?.name || 'Administrator'} ({role})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              वेबसाईट कंटेंट मॅनेजमेंट सिस्टीम (CMS Hub)
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              गुरुकुल भोसे अधिकृत वेबसाईटचा मजकूर, बॅनर्स, फोटो, कोर्सेस, व्हिडिओ आणि सूचना थेट येथून नियंत्रित करा.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>लाईव्ह वेबसाईट पहा</span>
            </a>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">एकूण कोर्सेस</span>
          <span className="text-2xl font-black text-gurukul-navy-900 mt-1 block">{courses?.length || 0}</span>
          <span className="text-[11px] text-emerald-600 font-semibold">सर्व प्रकाशित</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">गॅलरी छायाचित्रे</span>
          <span className="text-2xl font-black text-gurukul-navy-900 mt-1 block">{gallery?.length || 0}</span>
          <span className="text-[11px] text-blue-600 font-semibold">अद्ययावत श्रेणी</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">सक्रिय सूचना</span>
          <span className="text-2xl font-black text-gurukul-navy-900 mt-1 block">{notices?.length || 0}</span>
          <span className="text-[11px] text-amber-600 font-semibold">महत्त्वाच्या सूचना समाविष्ट</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">कंटेंट ऑडिट नोंदी</span>
          <span className="text-2xl font-black text-gurukul-navy-900 mt-1 block">{activityLogs?.length || 0}</span>
          <span className="text-[11px] text-purple-600 font-semibold">सर्व बदल सुरक्षित</span>
        </div>
      </div>

      {/* 13 CMS Modules Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileEdit className="w-4 h-4 text-gurukul-saffron-500" />
          <span>वेबसाईट संपादन मॉड्यूल्स (All CMS Modules)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cmsModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Link
                key={idx}
                to={mod.path}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-gurukul-saffron-300 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${mod.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {mod.count}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-gurukul-saffron-600 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-gurukul-navy-900 group-hover:text-gurukul-saffron-600">
                  <span>व्यवस्थापित करा</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Log Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-sm text-slate-800">नुकतीच झालेली कंटेंट ॲक्टिव्हिटी (Recent Activity Logs)</h3>
          </div>
          <Link to="/admin/cms/activity-logs" className="text-xs font-bold text-gurukul-saffron-600 hover:underline">
            सर्व नोंदी पहा →
          </Link>
        </div>

        {activityLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">अद्याप कोणतीही ॲक्टिव्हिटी नोंद झालेली नाही.</p>
        ) : (
          <div className="space-y-3">
            {activityLogs.slice(0, 5).map((log, idx) => (
              <div key={idx} className="flex items-start justify-between text-xs py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-start gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                    log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                    log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                    log.action === 'PUBLISH' ? 'bg-green-100 text-green-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {log.action}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800 block">{log.details}</span>
                    <span className="text-[11px] text-slate-400">मॉड्यूल: {log.module} • कर्ता: {log.performedBy}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CMSDashboardPage;
