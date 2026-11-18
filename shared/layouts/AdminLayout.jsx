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
import { ErrorBoundary } from '../components/common/ErrorState';
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

  const adminName = userProfile?.fullName || userProfile?.displayName || userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || (isMarathi ? 'प्रशासक' : 'Administrator');
  const adminInitial = (adminName.trim().charAt(0) || 'A').toUpperCase();
  const adminRoleLabel = isSuperAdmin 
    ? (isMarathi ? 'मुख्य प्रशासक (Super Admin)' : 'Super Admin')
    : (isMarathi ? 'शाळा प्रशासक (Admin)' : 'School Admin');

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-gurukul-navy-950 via-[#0a1928] to-gurukul-navy-950 text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-20 px-4 border-b border-slate-800/80 flex items-center justify-between bg-gurukul-navy-950/90 shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-md ring-1 ring-white/20 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img 
                src="/gurukul-logo.png" 
                alt="गुरुकुल भोसे" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-black text-white text-[15px] sm:text-base tracking-tight truncate leading-tight">
                  {isMarathi ? 'गुरुकुल भोसे' : 'Gurukul Bhose'}
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-gurukul-saffron-500 to-amber-500 text-white uppercase tracking-wider shrink-0 shadow-sm border border-amber-400/30">
                  ADMIN CRM
                </span>
              </div>
              <p className="text-[11.5px] text-gurukul-saffron-400 font-semibold leading-tight mt-1 truncate">
                {isMarathi ? 'प्रशासकीय नियंत्रण कक्ष' : 'School Admin Portal'}
              </p>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3.5 py-3 space-y-1 overflow-y-auto custom-scrollbar">
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
              const isExact = location.pathname === '/admin/cms';
              const hasChildActive = active && !isExact;
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
                <div key="cms_group" className="space-y-0.5">
                  {showCategoryHeader && (
                    <div className={`px-3 ${idx === 0 ? 'pt-2' : 'pt-5'} pb-1.5`}>
                      <p className="text-[11px] uppercase font-black tracking-wider text-gurukul-saffron-400 select-none">
                        {categoryTitles[item.category]}
                      </p>
                    </div>
                  )}
                  <div
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] sm:text-sm font-semibold cursor-pointer transition-all outline-none focus:outline-none ${
                      isExact
                        ? 'bg-gradient-to-r from-gurukul-saffron-600 to-gurukul-saffron-500 text-white shadow-md shadow-orange-950/40 font-bold'
                        : hasChildActive
                        ? 'bg-slate-800/80 text-white border-l-2 border-gurukul-saffron-400 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                    onClick={() => {
                      if (!active) {
                        setCmsOpen(true);
                        navigate('/admin/cms');
                        setSidebarOpen(false);
                      } else {
                        setCmsOpen(!cmsOpen);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 outline-none focus:outline-none">
                      <Icon className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span className="truncate">{item.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCmsOpen(!cmsOpen);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-white transition-colors outline-none focus:outline-none"
                      aria-label="Toggle CMS Submenu"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${cmsOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {cmsOpen && (
                    <div className="mt-1 ml-4 pl-3.5 py-1.5 space-y-1 border-l-2 border-slate-700/80">
                      {cmsSubItems.map((sub) => {
                        const subActive = location.pathname === sub.path;
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all outline-none focus:outline-none ${
                              subActive
                                ? 'bg-gurukul-saffron-500/20 text-gurukul-saffron-300 font-bold shadow-xs'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full transition-all shrink-0 ${
                              subActive
                                ? 'bg-gurukul-saffron-400 ring-2 ring-gurukul-saffron-400/30'
                                : 'bg-slate-600 group-hover:bg-slate-400'
                            }`} />
                            <span className="truncate">{sub.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (isVisits) {
              const isExact = location.pathname === '/admin/campus-visits';
              const hasChildActive = active && !isExact;
              const visitSubItems = [
                { title: isMarathi ? 'सर्व भेटी यादी (Visits List)' : 'Visits List', path: '/admin/campus-visits' },
                { title: isMarathi ? 'स्वागत कक्ष (Visit Desk Check-In)' : 'Visit Desk Check-In', path: '/admin/visit-desk' },
                { title: isMarathi ? 'भेट दिनदर्शिका (Visit Calendar)' : 'Visit Calendar', path: '/admin/visit-calendar' },
                { title: isMarathi ? 'वेळापत्रक सेटिंग्ज (Schedule Settings)' : 'Schedule Settings', path: '/admin/visit-settings' }
              ];

              return (
                <div key="visits_group" className="space-y-0.5">
                  {showCategoryHeader && (
                    <div className={`px-3 ${idx === 0 ? 'pt-2' : 'pt-5'} pb-1.5`}>
                      <p className="text-[11px] uppercase font-black tracking-wider text-gurukul-saffron-400 select-none">
                        {categoryTitles[item.category]}
                      </p>
                    </div>
                  )}
                  <div
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] sm:text-sm font-semibold cursor-pointer transition-all outline-none focus:outline-none ${
                      isExact
                        ? 'bg-gradient-to-r from-gurukul-saffron-600 to-gurukul-saffron-500 text-white shadow-md shadow-orange-950/40 font-bold'
                        : hasChildActive
                        ? 'bg-slate-800/80 text-white border-l-2 border-gurukul-saffron-400 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                    onClick={() => {
                      if (!active) {
                        setVisitsOpen(true);
                        navigate('/admin/campus-visits');
                        setSidebarOpen(false);
                      } else {
                        setVisitsOpen(!visitsOpen);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 outline-none focus:outline-none">
                      <Icon className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span className="truncate">{item.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVisitsOpen(!visitsOpen);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-white transition-colors outline-none focus:outline-none"
                      aria-label="Toggle Visits Submenu"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${visitsOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {visitsOpen && (
                    <div className="mt-1 ml-4 pl-3.5 py-1.5 space-y-1 border-l-2 border-slate-700/80">
                      {visitSubItems.map((sub) => {
                        const subActive = location.pathname === sub.path;
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all outline-none focus:outline-none ${
                              subActive
                                ? 'bg-gurukul-saffron-500/20 text-gurukul-saffron-300 font-bold shadow-xs'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full transition-all shrink-0 ${
                              subActive
                                ? 'bg-gurukul-saffron-400 ring-2 ring-gurukul-saffron-400/30'
                                : 'bg-slate-600 group-hover:bg-slate-400'
                            }`} />
                            <span className="truncate">{sub.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={item.path} className="space-y-0.5">
                {showCategoryHeader && (
                  <div className={`px-3 ${idx === 0 ? 'pt-2' : 'pt-5'} pb-1.5`}>
                    <p className="text-[11px] uppercase font-black tracking-wider text-gurukul-saffron-400 select-none">
                      {categoryTitles[item.category]}
                    </p>
                  </div>
                )}
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] sm:text-sm font-semibold transition-all outline-none focus:outline-none ${
                    active
                      ? 'bg-gradient-to-r from-gurukul-saffron-600 to-gurukul-saffron-500 text-white shadow-md shadow-orange-950/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      active
                        ? 'bg-white/20 text-white'
                        : item.badgeColor === 'rose'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : item.badgeColor === 'amber'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-gurukul-saffron-500/20 text-gurukul-saffron-300 border border-gurukul-saffron-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Pinned User Profile & Quick Actions Footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-gurukul-navy-950/95 space-y-2.5 shrink-0">
          <Link
            to="/admin/profile"
            onClick={() => setSidebarOpen(false)}
            className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all outline-none focus:outline-none ${
              location.pathname === '/admin/profile'
                ? 'bg-gurukul-saffron-500/20 text-white border border-gurukul-saffron-500/30 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gurukul-saffron-500 to-amber-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm ring-1 ring-white/10">
              {adminInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">
                {adminName}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <p className="text-xs text-slate-400 truncate">
                  {adminRoleLabel}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${
              location.pathname === '/admin/profile'
                ? 'text-gurukul-saffron-300'
                : 'text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5'
            }`} />
          </Link>

          <div className="flex items-center gap-2 pt-1.5 border-t border-slate-800/60">
            <a
              href={getPublicWebsiteUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors outline-none focus:outline-none"
              title={isMarathi ? 'शाळा वेबसाईट उघडा' : 'View School Website'}
            >
              <ExternalLink className="w-3.5 h-3.5 text-gurukul-saffron-400 shrink-0" />
              <span className="truncate">{isMarathi ? 'वेबसाईट' : 'Website'}</span>
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors outline-none focus:outline-none"
              title={isMarathi ? 'लॉगआउट करा' : 'Sign out'}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isMarathi ? 'लॉगआउट' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen min-w-0 w-full">
        {/* Top bar with authentic Gurukul Website branding */}
        <header className="h-14 sm:h-15 lg:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 px-3 sm:px-5 lg:px-6 flex items-center justify-between shadow-xs w-full min-w-0">
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
        <main className="flex-1 p-3.5 sm:p-4 lg:p-5 xl:p-6 max-w-7xl w-full mx-auto space-y-4 sm:space-y-5 xl:space-y-6 min-w-0">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
