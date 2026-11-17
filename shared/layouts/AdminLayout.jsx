import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  GraduationCap, 
  MessageSquare, 
  FileEdit, 
  UserCheck, 
  Share2, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink, 
  Bell, 
  Shield, 
  ChevronRight, 
  ChevronDown, 
  Flame, 
  Headset, 
  Trophy, 
  Activity, 
  Building2, 
  CalendarDays, 
  Settings, 
  UserPlus, 
  BarChart3, 
  ClipboardList, 
  User 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCRM } from '../contexts/CRMContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Badge } from '../components/common/Badge';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { NotificationCenter } from '../components/common/NotificationCenter';
import { getPublicWebsiteUrl } from '../services/navigation/navigationUrls';

export const AdminLayout = () => {
  const { 
    currentUser, 
    userProfile, 
    role, 
    logout, 
    isSuperAdmin, 
    isAdmin, 
    isTelecaller, 
    switchDemoAccount 
  } = useAuth();

  const { isMarathi } = useLanguage();
  const { getMetrics, unreadNotificationsCount } = useCRM();
  const metrics = getMetrics();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmsOpen, setCmsOpen] = useState(() => location.pathname.startsWith('/admin/cms'));
  const [visitsOpen, setVisitsOpen] = useState(() => location.pathname.startsWith('/admin/visit') || location.pathname.startsWith('/admin/campus-visit'));

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Exactly ordered 14 Navigation Items with Category Partitioning
  const navItems = [
    // --- Group 1: Core Admissions & Leads ---
    {
      category: 'operations',
      title: isMarathi ? 'डॅशबोर्ड (Dashboard)' : 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      category: 'operations',
      title: isMarathi ? 'वेबसाईट CMS व्यवस्थापन' : 'Website CMS',
      path: '/admin/cms',
      icon: FileEdit,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      category: 'operations',
      title: isMarathi ? 'प्रवेश चौकशी अर्ज' : 'Admission Enquiries',
      path: '/admin/enquiries',
      icon: UserPlus,
      badge: metrics.newEnquiries > 0 ? `${metrics.newEnquiries} New` : null,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      category: 'operations',
      title: isMarathi ? 'विद्यार्थी लीड्स CRM' : 'Leads Management CRM',
      path: '/admin/leads',
      icon: Users,
      badge: metrics.assignedLeads > 0 ? `${metrics.assignedLeads}` : null,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      category: 'operations',
      title: isMarathi ? 'फॉलो-अप मॅनेजमेंट' : 'Follow-up Management',
      path: '/admin/follow-ups',
      icon: PhoneCall,
      badge: metrics.todayFollowUps > 0 ? `${metrics.todayFollowUps} Today` : null,
      badgeColor: 'amber',
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      category: 'operations',
      title: isMarathi ? 'कॉल हिस्टरी व मॉनिटरिंग' : 'Call History & Monitoring',
      path: '/admin/call-monitoring',
      icon: Activity,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      category: 'operations',
      title: isMarathi ? 'कॅम्पस भेट व्यवस्थापन' : 'Campus Visits Desk',
      path: '/admin/campus-visits',
      icon: Building2,
      roles: ['super_admin', 'superadmin', 'admin']
    },

    // --- Group 2: Administration & Reports ---
    {
      category: 'management',
      title: isMarathi ? 'प्रशासक व्यवस्थापन' : 'Admin Management',
      path: '/admin/admins',
      icon: Shield,
      roles: ['admin', 'super_admin', 'superadmin']
    },
    {
      category: 'management',
      title: isMarathi ? 'समुपदेशक व्यवस्थापन' : 'Telecaller Management',
      path: '/admin/telecallers',
      icon: UserCheck,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      category: 'management',
      title: isMarathi ? 'अहवाल व विश्लेषण' : 'Reports & Analytics',
      path: '/admin/reports',
      icon: BarChart3,
      roles: ['super_admin', 'superadmin', 'admin']
    },

    // --- Group 3: System & Configuration ---
    {
      category: 'system',
      title: isMarathi ? 'सूचना व अलर्ट्स' : 'Notifications',
      path: '/admin/notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : null,
      badgeColor: 'rose',
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      category: 'system',
      title: isMarathi ? 'ऑडिट लॉग्स (Audit Logs)' : 'Audit Logs',
      path: '/admin/audit-logs',
      icon: ClipboardList,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      category: 'system',
      title: isMarathi ? 'सिस्टम सेटिंग्ज' : 'System Settings',
      path: '/admin/settings',
      icon: Settings,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      category: 'system',
      title: isMarathi ? 'माझी प्रोफाइल' : 'My Profile',
      path: '/admin/profile',
      icon: User,
      roles: ['super_admin', 'superadmin', 'admin']
    }
  ];

  const allowedNavItems = navItems.filter(item => {
    return item.roles.some(r => {
      if ((r === 'super_admin' || r === 'superadmin') && isSuperAdmin) return true;
      if (r === 'admin' && isAdmin) return true;
      return r === role;
    });
  });

  const categoryTitles = {
    operations: isMarathi ? 'प्रवेश व लीड्स कार्यक्षेत्र' : 'ADMISSIONS & LEADS',
    management: isMarathi ? 'प्रशासन व कर्मचारी' : 'ADMIN & COUNSELORS',
    system: isMarathi ? 'सिस्टम व कॉन्फिगरेशन' : 'SYSTEM & SETTINGS'
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] font-sans selection:bg-gurukul-saffron-500 selection:text-white antialiased">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gradient-to-b from-gurukul-navy-950 via-[#0a1928] to-gurukul-navy-950 text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-17 px-4 border-b border-slate-800/90 flex items-center justify-between bg-gurukul-navy-950/70">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
            <img 
              src="/gurukul-logo.png" 
              alt="गुरुकुल भोसे" 
              className="w-9 h-9 object-contain bg-white/10 rounded-xl p-0.5 shadow shrink-0 group-hover:scale-105 transition-transform" 
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-white text-sm tracking-tight">
                  {isMarathi ? 'गुरुकुल भोसे' : 'Gurukul Bhose'}
                </h2>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-gurukul-saffron-500 text-white uppercase tracking-wider">
                  ADMIN CRM
                </span>
              </div>
              <p className="text-[10px] text-gurukul-saffron-400 font-semibold leading-tight mt-0.5">
                {isMarathi ? 'प्रशासकीय नियंत्रण कक्ष' : 'School Admin Portal'}
              </p>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3.5 space-y-1 overflow-y-auto custom-scrollbar">
          {allowedNavItems.map((item, idx) => {
            const Icon = item.icon;
            const isCMS = item.path === '/admin/cms';
            const isVisits = item.path === '/admin/campus-visits';
            const active = isCMS 
              ? location.pathname.startsWith('/admin/cms')
              : isVisits
              ? (location.pathname.startsWith('/admin/visit') || location.pathname.startsWith('/admin/campus-visit'))
              : isActive(item.path);

            const showCategoryHeader = idx === 0 || allowedNavItems[idx - 1].category !== item.category;

            if (isCMS) {
              const cmsSubItems = [
                { title: isMarathi ? 'डॅशबोर्ड (CMS Hub)' : 'CMS Hub', path: '/admin/cms' },
                { title: isMarathi ? 'मुख्यपृष्ठ (Homepage)' : 'Homepage', path: '/admin/cms/homepage' },
                { title: isMarathi ? 'पेजेस (Pages)' : 'Pages', path: '/admin/cms/pages' },
                { title: isMarathi ? 'आमच्याबद्दल (About)' : 'About Us', path: '/admin/cms/about' },
                { title: isMarathi ? 'शैक्षणिक विभाग (Programs)' : 'Programs', path: '/admin/cms/programs' },
                { title: isMarathi ? 'अभ्यासक्रम (Courses)' : 'Courses', path: '/admin/cms/courses' },
                { title: isMarathi ? 'फोटो गॅलरी (Gallery)' : 'Gallery', path: '/admin/cms/gallery' },
                { title: isMarathi ? 'व्हिडिओ गॅलरी (Videos)' : 'Videos', path: '/admin/cms/videos' },
                { title: isMarathi ? 'सूचना पत्रक (Notices)' : 'Notices', path: '/admin/cms/notices' },
                { title: isMarathi ? 'सुविधा (Facilities)' : 'Facilities', path: '/admin/cms/facilities' },
                { title: isMarathi ? 'संपर्क व पत्ता (Contact)' : 'Contact Details', path: '/admin/cms/contact' },
                { title: isMarathi ? 'SEO व्यवस्थापन (SEO)' : 'SEO Management', path: '/admin/cms/seo' },
                { title: isMarathi ? 'वेबसाईट सेटिंग्ज (Settings)' : 'Website Settings', path: '/admin/cms/settings' },
                { title: isMarathi ? 'अ‍ॅक्टिव्हिटी लॉग्स (Logs)' : 'Activity Logs', path: '/admin/cms/activity-logs' }
              ];

              return (
                <div key="cms_group" className="space-y-1">
                  {showCategoryHeader && (
                    <p className="text-[10px] uppercase font-black tracking-widest text-gurukul-saffron-400/90 px-3 pt-3 pb-1">
                      {categoryTitles[item.category]}
                    </p>
                  )}
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      active
                        ? 'bg-gradient-to-r from-gurukul-saffron-600 to-gurukul-saffron-500 text-white shadow-md shadow-orange-950/40'
                        : 'text-slate-300 hover:bg-white/6 hover:text-white'
                    }`}
                    onClick={() => setCmsOpen(!cmsOpen)}
                  >
                    <Link
                      to="/admin/cms"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSidebarOpen(false);
                      }}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.title}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCmsOpen(!cmsOpen);
                      }}
                      className="p-1 hover:text-white"
                      aria-label="Toggle CMS Submenu"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${cmsOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {cmsOpen && (
                    <div className="pl-5 pr-1 py-1 space-y-0.5 border-l-2 border-gurukul-saffron-500/30 ml-3.5">
                      {cmsSubItems.map((sub) => {
                        const subActive = location.pathname === sub.path;
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`block px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                              subActive
                                ? 'bg-orange-500/20 text-gurukul-saffron-300 font-bold border-l-2 border-gurukul-saffron-400 pl-2'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {sub.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (isVisits) {
              const visitSubItems = [
                { title: isMarathi ? 'सर्व भेटी यादी (Visits List)' : 'Visits List', path: '/admin/campus-visits' },
                { title: isMarathi ? 'स्वागत कक्ष (Visit Desk Check-In)' : 'Visit Desk Check-In', path: '/admin/visit-desk' },
                { title: isMarathi ? 'भेट दिनदर्शिका (Visit Calendar)' : 'Visit Calendar', path: '/admin/visit-calendar' },
                { title: isMarathi ? 'वेळापत्रक सेटिंग्ज (Schedule Settings)' : 'Schedule Settings', path: '/admin/visit-settings' }
              ];

              return (
                <div key="visits_group" className="space-y-1">
                  {showCategoryHeader && (
                    <p className="text-[10px] uppercase font-black tracking-widest text-gurukul-saffron-400/90 px-3 pt-3 pb-1">
                      {categoryTitles[item.category]}
                    </p>
                  )}
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      active
                        ? 'bg-gradient-to-r from-gurukul-saffron-600 to-gurukul-saffron-500 text-white shadow-md shadow-orange-950/40'
                        : 'text-slate-300 hover:bg-white/6 hover:text-white'
                    }`}
                    onClick={() => setVisitsOpen(!visitsOpen)}
                  >
                    <Link
                      to="/admin/campus-visits"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSidebarOpen(false);
                      }}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.title}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVisitsOpen(!visitsOpen);
                      }}
                      className="p-1 hover:text-white"
                      aria-label="Toggle Visits Submenu"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${visitsOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {visitsOpen && (
                    <div className="pl-5 pr-1 py-1 space-y-0.5 border-l-2 border-gurukul-saffron-500/30 ml-3.5">
                      {visitSubItems.map((sub) => {
                        const subActive = location.pathname === sub.path;
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`block px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                              subActive
                                ? 'bg-orange-500/20 text-gurukul-saffron-300 font-bold border-l-2 border-gurukul-saffron-400 pl-2'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {sub.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={item.path} className="space-y-1">
                {showCategoryHeader && (
                  <p className="text-[10px] uppercase font-black tracking-widest text-gurukul-saffron-400/90 px-3 pt-3 pb-1">
                    {categoryTitles[item.category]}
                  </p>
                )}
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-gurukul-saffron-600 to-gurukul-saffron-500 text-white shadow-md shadow-orange-950/40'
                      : 'text-slate-300 hover:bg-white/6 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      active ? 'bg-white/20 text-white' : 'bg-gurukul-saffron-500/20 text-gurukul-saffron-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen min-w-0 w-full">
        {/* Top bar with authentic Gurukul Website branding */}
        <header className="h-16 sm:h-17 bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between shadow-xs w-full min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group text-left min-w-0">
              <img 
                src="/gurukul-logo.png" 
                alt="गुरुकुल भोसे" 
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-xs shrink-0 group-hover:scale-105 transition-transform" 
              />
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg text-gurukul-navy-950 leading-tight tracking-tight truncate">
                    {isMarathi ? 'गुरुकुल भोसे' : 'Gurukul Bhose'}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 border border-orange-200 text-gurukul-saffron-700 shrink-0">
                    CRM Portal
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-gurukul-saffron-600 hidden md:block lg:hidden xl:block leading-tight mt-0.5 truncate max-w-[280px]">
                  {isMarathi 
                    ? 'विद्यामंदिर व ज्युनिअर कॉलेज (सैनिक पॅटर्न निवासी)' 
                    : 'Sainik Pattern Residential School & College'}
                </span>
              </div>
            </Link>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
            {/* Quick Overdue Alert if any */}
            {metrics.overdueFollowUps > 0 && (
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold shrink-0">
                <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span>{metrics.overdueFollowUps} {isMarathi ? 'थकबाकी' : 'Overdue'}</span>
              </div>
            )}

            {/* Language Switcher for Admin */}
            <LanguageSwitcher />

            {/* In-App Notification Center */}
            <NotificationCenter />

            {/* Role indicator */}
            <Badge variant={role === 'telecaller' ? 'Telecaller' : 'Admin'} className="shrink-0">
              {role === 'telecaller' ? 'TELECALLER' : 'ADMIN'}
            </Badge>

            {/* Website CTA button styled matching website navbar CTA */}
            <a
              href={getPublicWebsiteUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-white bg-gradient-to-r from-gurukul-saffron-600 to-gurukul-saffron-500 hover:from-gurukul-saffron-500 hover:to-gurukul-saffron-600 shadow-xs hover:shadow transition-all shrink-0"
            >
              <span>{isMarathi ? 'शाळा वेबसाईट' : 'View Website'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 xl:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
