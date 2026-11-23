import React from 'react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../../contexts/CMSContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
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
  const { isMarathi } = useLanguage();

  const cmsModules = [
    {
      title: isMarathi ? 'मुख्यपृष्ठ व्यवस्थापन (Homepage)' : 'Homepage Management',
      desc: isMarathi
        ? 'हिरो बॅनर्स, स्वागत संदेश, वैशिष्ट्ये व प्रवेश CTA'
        : 'Manage hero banners, welcome message, highlights, and admission CTA',
      path: '/admin/cms/homepage',
      icon: Home,
      count: isMarathi
        ? `${homepageData?.heroSlides?.length || 3} बॅनर्स`
        : `${homepageData?.heroSlides?.length || 3} Banners`,
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      title: isMarathi ? 'पेज मॅनेजमेंट (Pages CMS)' : 'Pages Management (CMS)',
      desc: isMarathi
        ? 'सर्व मुख्य पेजेसचे कंटेंट ब्लॉक्स व मजकूर संपादन'
        : 'Edit structured content blocks and text across all website pages',
      path: '/admin/cms/pages',
      icon: Layers,
      count: isMarathi
        ? `${pages?.length || 8} पेजेस`
        : `${pages?.length || 8} Pages`,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      title: isMarathi ? 'आमच्याबद्दल (About Us)' : 'About Us',
      desc: isMarathi
        ? 'संस्थेचा इतिहास, ध्येय, नेतृत्व, यश व पायाभूत सुविधा'
        : 'Manage institutional history, vision, mission, leadership, and milestones',
      path: '/admin/cms/about',
      icon: Info,
      count: isMarathi ? 'सक्रिय' : 'Active',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      title: isMarathi ? 'शैक्षणिक विभाग (Programs)' : 'Academic Programs',
      desc: isMarathi
        ? 'विद्यामंदिर, जुनिअर कॉलेज व अकॅडमीज माहिती'
        : 'Manage Vidyamandir, Junior College, and specialized academies',
      path: '/admin/cms/programs',
      icon: GraduationCap,
      count: isMarathi ? '५ विभाग' : '5 Programs',
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      title: isMarathi ? 'कोर्सेस मॅनेजमेंट (Courses)' : 'Courses Management',
      desc: isMarathi
        ? 'अभ्यासक्रम तपशील, पात्रता, कालावधी व प्रवेश'
        : 'Manage course details, eligibility, duration, and admissions',
      path: '/admin/cms/courses',
      icon: BookOpen,
      count: isMarathi
        ? `${courses?.length || 0} कोर्सेस`
        : `${courses?.length || 0} Courses`,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      title: isMarathi ? 'फोटो गॅलरी (Gallery)' : 'Photo Gallery',
      desc: isMarathi
        ? 'कॅम्पस, स्नेहसंमेलन व उपक्रम छायाचित्रे अपलोड'
        : 'Upload and organize campus, gathering, and activity photos',
      path: '/admin/cms/gallery',
      icon: ImageIcon,
      count: isMarathi
        ? `${gallery?.length || 0} फोटो`
        : `${gallery?.length || 0} Photos`,
      color: 'bg-rose-50 text-rose-600 border-rose-200'
    },
    {
      title: isMarathi ? 'व्हिडिओ दालन (Videos)' : 'Video Gallery',
      desc: isMarathi
        ? 'YouTube व्हिडिओ, टूअर्स व सांस्कृतिक कार्यक्रम'
        : 'Manage YouTube videos, campus tours, and cultural events',
      path: '/admin/cms/videos',
      icon: Video,
      count: isMarathi
        ? `${videos?.length || 0} व्हिडिओ`
        : `${videos?.length || 0} Videos`,
      color: 'bg-red-50 text-red-600 border-red-200'
    },
    {
      title: isMarathi ? 'सूचना पत्रक (Notices & Bulletins)' : 'Notices & Bulletins',
      desc: isMarathi
        ? 'महत्त्वाच्या सूचना, प्रवेश नोटिसा व PDF सर्क्युलर्स'
        : 'Publish important notices, admission updates, and PDF circulars',
      path: '/admin/cms/notices',
      icon: Bell,
      count: isMarathi
        ? `${notices?.length || 0} सूचना`
        : `${notices?.length || 0} Notices`,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    },
    {
      title: isMarathi ? 'कॅम्पस सुविधा (Facilities)' : 'Campus Facilities',
      desc: isMarathi
        ? 'लॅब, ग्राउंड, हॉस्टेल, मेस व डिफेन्स सुविधा'
        : 'Manage labs, ground, hostel, mess, and defence training facilities',
      path: '/admin/cms/facilities',
      icon: Building2,
      count: isMarathi
        ? `${facilities?.length || 0} सुविधा`
        : `${facilities?.length || 0} Facilities`,
      color: 'bg-teal-50 text-teal-600 border-teal-200'
    },
    {
      title: isMarathi ? 'कॅम्पस संपर्क (Contact Info)' : 'Campus Contact Info',
      desc: isMarathi
        ? 'पत्ता, फोन, WhatsApp, नकाशे व कामकाजाची वेळ'
        : 'Update address, phone numbers, WhatsApp, maps, and office hours',
      path: '/admin/cms/contact',
      icon: Phone,
      count: isMarathi ? 'अद्ययावत' : 'Updated',
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      title: isMarathi ? 'SEO व मेटा टॅग्ज (SEO Manager)' : 'SEO & Meta Tags Manager',
      desc: isMarathi
        ? 'गुगल सर्च टायटल्स, मेटा डिस्क्रिप्शन्स व साइटमॅप'
        : 'Configure Google search titles, meta descriptions, and XML sitemap',
      path: '/admin/cms/seo',
      icon: Search,
      count: isMarathi ? 'सक्रिय' : 'Active',
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200'
    },
    {
      title: isMarathi ? 'वेबसाईट सेटिंग्स (Settings)' : 'Website Settings',
      desc: isMarathi
        ? 'लोगो, नोटीस बार, मेंटेनन्स मोड व कॉपीराइट'
        : 'Configure logo, announcement bar, maintenance mode, and copyright',
      path: '/admin/cms/settings',
      icon: Settings,
      count: isMarathi ? 'सिस्टम' : 'System',
      color: 'bg-slate-100 text-slate-700 border-slate-300'
    },
    {
      title: isMarathi ? 'कंटेंट ॲक्टिव्हिटी लॉग (Activity Logs)' : 'Content Activity Logs',
      desc: isMarathi
        ? 'बदल, अपडेट्स व डिलीशनचा संपूर्ण ऑडिट ट्रेल'
        : 'View full audit trail of content edits, updates, and deletions',
      path: '/admin/cms/activity-logs',
      icon: History,
      count: isMarathi
        ? `${activityLogs?.length || 0} नोंदी`
        : `${activityLogs?.length || 0} Logs`,
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
                {isMarathi ? 'Phase 4 • डायनॅमिक वेबसाईट CMS' : 'Phase 4 • Dynamic Website CMS'}
              </span>
              <span className="text-xs text-slate-400">
                {isMarathi ? 'लॉगिन:' : 'Logged in:'} {userProfile?.name || 'Administrator'} ({role})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {isMarathi ? 'वेबसाईट कंटेंट मॅनेजमेंट सिस्टीम (CMS Hub)' : 'Website Content Management System (CMS Hub)'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {isMarathi
                ? 'गुरुकुल भोसे अधिकृत वेबसाईटचा मजकूर, बॅनर्स, फोटो, कोर्सेस, व्हिडिओ आणि सूचना थेट येथून नियंत्रित करा.'
                : 'Control the official Gurukul Bhose website content, banners, photos, courses, videos, and notices directly from here.'}
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
              <span>{isMarathi ? 'लाईव्ह वेबसाईट पहा' : 'View Live Website'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">
            {isMarathi ? 'एकूण कोर्सेस' : 'Total Courses'}
          </span>
          <span className="text-2xl font-black text-gurukul-navy-900 mt-1 block">{courses?.length || 0}</span>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {isMarathi ? 'सर्व प्रकाशित' : 'All Published'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">
            {isMarathi ? 'गॅलरी छायाचित्रे' : 'Gallery Photos'}
          </span>
          <span className="text-2xl font-black text-gurukul-navy-900 mt-1 block">{gallery?.length || 0}</span>
          <span className="text-[11px] text-blue-600 font-semibold">
            {isMarathi ? 'अद्ययावत श्रेणी' : 'Updated Categories'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">
            {isMarathi ? 'सक्रिय सूचना' : 'Active Notices'}
          </span>
          <span className="text-2xl font-black text-gurukul-navy-900 mt-1 block">{notices?.length || 0}</span>
          <span className="text-[11px] text-amber-600 font-semibold">
            {isMarathi ? 'महत्त्वाच्या सूचना समाविष्ट' : 'Important Notices Included'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">
            {isMarathi ? 'कंटेंट ऑडिट नोंदी' : 'Content Audit Logs'}
          </span>
          <span className="text-2xl font-black text-gurukul-navy-900 mt-1 block">{activityLogs?.length || 0}</span>
          <span className="text-[11px] text-purple-600 font-semibold">
            {isMarathi ? 'सर्व बदल सुरक्षित' : 'All Changes Recorded'}
          </span>
        </div>
      </div>

      {/* Vercel & Website Real-time Sync Status Card */}
      <div className="bg-gradient-to-br from-slate-900 to-gurukul-navy-950 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>
                  {isMarathi
                    ? 'वेबसाईट व Vercel रिअल-टाईम सिंक (Live Website & Vercel Sync)'
                    : 'Live Website & Vercel Real-Time Sync'}
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {isMarathi ? (
                <>
                  ॲडमिन पॅनेलमधून फोटो, व्हिडिओ आणि सूचना अपडेट केल्यावर त्या लगेच मुख्य वेबसाईटवर (<span className="text-gurukul-saffron-300 font-mono">/gallery</span>, <span className="text-gurukul-saffron-300 font-mono">/videos</span>, <span className="text-gurukul-saffron-300 font-mono">/notices</span>) अपडेट होतात. हे बदल Vercel वर कायमस्वरूपी पुश करण्यासाठी खालील १-कमांड सिंक वापरा.
                </>
              ) : (
                <>
                  Photos, videos, and notices updated from the admin panel reflect immediately on the live website (<span className="text-gurukul-saffron-300 font-mono">/gallery</span>, <span className="text-gurukul-saffron-300 font-mono">/videos</span>, <span className="text-gurukul-saffron-300 font-mono">/notices</span>). Use the 1-command sync below to permanently deploy changes to Vercel.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const data = {
                  gallery,
                  videos,
                  notices,
                  exportedAt: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gurukul-bhose-cms-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
              title={isMarathi ? 'सध्याचा CMS डेटा JSON फॉरमॅटमध्ये डाऊनलोड करा' : 'Download current CMS data in JSON format'}
            >
              <span>{isMarathi ? 'डेटा बॅकअप (JSON)' : 'Data Backup (JSON)'}</span>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gurukul-saffron-500 hover:bg-gurukul-saffron-600 text-xs font-bold text-white shadow-md transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'लाईव्ह वेबसाईट पहा' : 'View Live Website'}</span>
            </a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 font-bold block mb-0.5">
              {isMarathi ? '१. फोटो गॅलरी (Photos)' : '1. Photo Gallery'}
            </span>
            <span className="text-emerald-400 font-medium">
              {isMarathi ? 'बदल आपोआप रिअल-टाईम दिसेल' : 'Changes appear automatically in real time'}
            </span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 font-bold block mb-0.5">
              {isMarathi ? '२. व्हिडिओ दालन (Videos)' : '2. Video Gallery'}
            </span>
            <span className="text-emerald-400 font-medium">
              {isMarathi ? 'YouTube एम्बेड सुरक्षित चालू होईल' : 'YouTube embeds play securely'}
            </span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 font-bold block mb-0.5">
              {isMarathi ? '३. Vercel १-कमांड डिप्लॉय' : '3. Vercel 1-Command Deploy'}
            </span>
            <span className="text-gurukul-saffron-300 font-mono text-[11px]">npm run deploy</span>
          </div>
        </div>
      </div>

      {/* 13 CMS Modules Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileEdit className="w-4 h-4 text-gurukul-saffron-500" />
          <span>{isMarathi ? 'वेबसाईट संपादन मॉड्यूल्स (All CMS Modules)' : 'All Website CMS Modules'}</span>
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
                  <span>{isMarathi ? 'व्यवस्थापित करा' : 'Manage'}</span>
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
            <h3 className="font-bold text-sm text-slate-800">
              {isMarathi ? 'नुकतीच झालेली कंटेंट ॲक्टिव्हिटी (Recent Activity Logs)' : 'Recent Content Activity Logs'}
            </h3>
          </div>
          <Link to="/admin/cms/activity-logs" className="text-xs font-bold text-gurukul-saffron-600 hover:underline">
            {isMarathi ? 'सर्व नोंदी पहा →' : 'View All Logs →'}
          </Link>
        </div>

        {(!activityLogs || activityLogs.length === 0) ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            {isMarathi ? 'अद्याप कोणतीही ॲक्टिव्हिटी नोंद झालेली नाही.' : 'No activity logs recorded yet.'}
          </p>
        ) : (
          <div className="space-y-3">
            {(activityLogs || []).slice(0, 5).map((log, idx) => (
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
                    <span className="font-semibold text-slate-800 block">{log.details || log.description}</span>
                    <span className="text-[11px] text-slate-400">
                      {isMarathi ? 'मॉड्यूल' : 'Module'}: {log.module} • {isMarathi ? 'कर्ता' : 'By'}: {log.performedBy || log.userEmail}
                    </span>
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
