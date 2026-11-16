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
  Flame
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCRM } from '../contexts/CRMContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Badge } from '../components/common/Badge';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';

export const AdminLayout = () => {
  const { 
    currentUser, 
    userProfile, 
    role, 
    logout, 
    isSuperAdmin, 
    isAdmin, 
    isTelecaller, 
    canManageUsers,
    switchDemoAccount 
  } = useAuth();

  const { isMarathi } = useLanguage();
  const { getMetrics } = useCRM();
  const metrics = getMetrics();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmsOpen, setCmsOpen] = useState(() => location.pathname.startsWith('/admin/cms'));

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      title: isMarathi ? 'डॅशबोर्ड (Dashboard)' : 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      title: isMarathi ? 'टेलिकॉलर व्यवस्थापन (Telecallers)' : 'Telecallers Management',
      path: '/admin/telecallers',
      icon: UserCheck,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      title: isMarathi ? 'लीड मॅनेजमेंट (Leads CRM)' : 'Leads CRM',
      path: '/admin/leads',
      icon: Users,
      badge: metrics.newLeads > 0 ? `${metrics.newLeads} New` : null,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      title: isMarathi ? 'फॉलो-अप मॅनेजमेंट (Follow-ups)' : 'Follow-ups Management',
      path: '/admin/follow-ups',
      icon: PhoneCall,
      badge: metrics.todayFollowUps > 0 ? `${metrics.todayFollowUps} Today` : null,
      badgeColor: 'amber',
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      title: isMarathi ? 'प्रवेश यादी (Admissions)' : 'Admissions Register',
      path: '/admin/admissions',
      icon: GraduationCap,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      title: isMarathi ? 'पालक संदेश (Parent Comm.)' : 'Parent Communication',
      path: '/admin/parent-communication',
      icon: MessageSquare,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      title: isMarathi ? 'वेबसाईट CMS (Website CMS)' : 'Website CMS Portal',
      path: '/admin/cms',
      icon: FileEdit,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      title: 'Meta & WhatsApp API',
      path: '/admin/meta-integration',
      icon: Share2,
      roles: ['super_admin', 'superadmin', 'admin']
    },
    {
      title: isMarathi ? 'मास्टर कंट्रोल (Super Admin)' : 'Super Admin Control',
      path: '/super-admin/dashboard',
      icon: Shield,
      roles: ['super_admin', 'superadmin']
    }
  ];

  const allowedNavItems = navItems.filter(item => {
    return item.roles.some(r => {
      if ((r === 'super_admin' || r === 'superadmin') && isSuperAdmin) return true;
      if (r === 'admin' && isAdmin) return true;
      return r === role;
    });
  });

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gurukul-navy-950 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/gurukul-logo.png" 
              alt="गुरुकुल भोसे" 
              className="w-9 h-9 object-contain bg-white/10 rounded-lg p-0.5 shadow shrink-0" 
            />
            <div>
              <h2 className="font-bold text-white text-sm">
                {isMarathi ? 'गुरुकुल भोसे CRM' : 'Gurukul Bhose CRM'}
              </h2>
              <p className="text-[10px] text-gurukul-saffron-400 font-medium">
                {isMarathi ? 'प्रवेश व लीड व्यवस्थापन' : 'Admission & Lead System'}
              </p>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-yellow-400">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{userProfile?.displayName || 'User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isTelecaller ? 'bg-emerald-400' : 'bg-gurukul-saffron-400'}`}></span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isCMS = item.path === '/admin/cms';
            const active = isCMS 
              ? location.pathname.startsWith('/admin/cms')
              : isActive(item.path);

            if (isCMS) {
              const cmsSubItems = [
                { title: 'डॅशबोर्ड (CMS Hub)', path: '/admin/cms' },
                { title: 'मुख्यपृष्ठ (Homepage)', path: '/admin/cms/homepage' },
                { title: 'पेजेस (Pages)', path: '/admin/cms/pages' },
                { title: 'आमच्याबद्दल (About)', path: '/admin/cms/about' },
                { title: 'शैक्षणिक विभाग (Programs)', path: '/admin/cms/programs' },
                { title: 'अभ्यासक्रम (Courses)', path: '/admin/cms/courses' },
                { title: 'फोटो गॅलरी (Gallery)', path: '/admin/cms/gallery' },
                { title: 'व्हिडिओ गॅलरी (Videos)', path: '/admin/cms/videos' },
                { title: 'सूचना पत्रक (Notices)', path: '/admin/cms/notices' },
                { title: 'सुविधा (Facilities)', path: '/admin/cms/facilities' },
                { title: 'संपर्क व पत्ता (Contact)', path: '/admin/cms/contact' },
                { title: 'SEO व्यवस्थापन (SEO)', path: '/admin/cms/seo' },
                { title: 'वेबसाईट सेटिंग्ज (Settings)', path: '/admin/cms/settings' },
                { title: 'अ‍ॅक्टिव्हिटी लॉग्स (Logs)', path: '/admin/cms/activity-logs' }
              ];

              return (
                <div key="cms_group" className="space-y-1 pt-1">
                  <div
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      active
                        ? 'bg-gurukul-saffron-500 text-white font-bold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                    onClick={() => setCmsOpen(!cmsOpen)}
                  >
                    <Link
                      to="/admin/cms"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSidebarOpen(false);
                      }}
                      className="flex items-center gap-3 flex-1"
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.title}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCmsOpen(!cmsOpen);
                      }}
                      className="p-1 hover:text-white"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${cmsOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {cmsOpen && (
                    <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-slate-800 ml-3">
                      {cmsSubItems.map((sub) => {
                        const subActive = location.pathname === sub.path;
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`block px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                              subActive
                                ? 'bg-orange-500/20 text-gurukul-saffron-400 font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
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
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-gurukul-saffron-500 text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-gurukul-saffron-500/20 text-gurukul-saffron-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Role Switcher for instant developer testing */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-[11px]">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
            Switch Role (Demo Mode):
          </p>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => switchDemoAccount('superadmin')}
              className={`py-1 px-1 rounded text-center font-bold text-[10px] transition-colors ${
                isSuperAdmin ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              SuperAdmin
            </button>
            <button
              onClick={() => switchDemoAccount('admin')}
              className={`py-1 px-1 rounded text-center font-bold text-[10px] transition-colors ${
                role === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => switchDemoAccount('telecaller')}
              className={`py-1 px-1 rounded text-center font-bold text-[10px] transition-colors ${
                isTelecaller ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Telecaller
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <a
            href={import.meta.env.VITE_PUBLIC_WEBSITE_URL || "https://www.gurukulbhose.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-gurukul-saffron-400" />
              <span>{isMarathi ? 'शाळा वेबसाईट उघडा' : 'Open School Website'}</span>
            </span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{isMarathi ? 'लॉगआउट (Sign Out)' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-800">
                {isMarathi ? 'गुरुकुल ऍडमिशन व लीड मॅनेजमेंट CRM' : 'Gurukul Admission & Lead CRM'}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                {isMarathi 
                  ? 'गुरुकुल विद्यामंदिर व ज्युनिअर कॉलेज, भोसे (ता. मिरज, सांगली)' 
                  : 'Gurukul Vidyamandir & Junior College, Bhose (Miraj, Sangli)'}
              </p>
            </div>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Overdue Alert if any */}
            {metrics.overdueFollowUps > 0 && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span>{metrics.overdueFollowUps} {isMarathi ? 'थकबाकी' : 'Overdue'}</span>
              </div>
            )}

            {/* Language Switcher for Admin */}
            <LanguageSwitcher />

            {/* Role indicator */}
            <Badge variant={role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Telecaller'}>
              {role.toUpperCase()}
            </Badge>

            <a
              href={import.meta.env.VITE_PUBLIC_WEBSITE_URL || "https://www.gurukulbhose.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-600 hover:text-gurukul-saffron-600 font-medium"
            >
              <span>{isMarathi ? 'वेबसाईट' : 'Website'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
