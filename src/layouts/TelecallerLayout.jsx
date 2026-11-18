import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  Clock, 
  History, 
  Bell, 
  User, 
  KeyRound, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink,
  Phone,
  Flame,
  CheckCircle2,
  Calendar,
  Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCRM } from '../contexts/CRMContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Badge } from '../components/common/Badge';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { NotificationCenter } from '../components/common/NotificationCenter';
import { getPublicWebsiteUrl } from '../services/navigation/navigationUrls';

export const TelecallerLayout = () => {
  const { currentUser, userProfile, logout, isTelecaller } = useAuth();
  const { leads, getMetrics } = useCRM();
  const { isMarathi } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isBasenameTelecaller = window.location.pathname.startsWith('/telecaller') && !location.pathname.startsWith('/telecaller');
  const prefix = isBasenameTelecaller ? '' : (location.pathname.startsWith('/telecaller') ? '/telecaller' : '');

  const isActive = (path) => {
    if (location.pathname === path) return true;
    if (path.startsWith('/telecaller/') && location.pathname === path.replace('/telecaller', '')) return true;
    if (!path.startsWith('/telecaller') && location.pathname === `/telecaller${path}`) return true;
    return false;
  };

  // Filter metrics strictly for this telecaller
  const telecallerUid = currentUser?.uid || '';
  const myLeads = leads.filter(l => l.assignedTelecallerId === telecallerUid);
  const todayStr = new Date().toISOString().split('T')[0];
  const myTodayCount = myLeads.filter(l => l.nextFollowUp === todayStr && l.leadStatus !== 'Admitted').length;
  const myOverdueCount = myLeads.filter(l => l.nextFollowUp && l.nextFollowUp < todayStr && l.leadStatus !== 'Admitted').length;

  // Display counselor personal details from live userProfile / currentUser
  const counselorName = 
    userProfile?.fullName || 
    userProfile?.displayName || 
    currentUser?.fullName || 
    currentUser?.displayName || 
    (currentUser?.email ? currentUser.email.split('@')[0] : (isMarathi ? 'समुपदेशक' : 'Counselor'));

  const counselorEmail = userProfile?.email || currentUser?.email || 'counselor@gurukulbhose.com';

  const employeeId = userProfile?.employeeId || currentUser?.employeeId || '';
  const counselorInitial = (counselorName.trim().charAt(0) || 'C').toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate(isBasenameTelecaller ? '/login' : (prefix ? `${prefix}/login` : '/login'));
  };

  const navItems = [
    {
      category: 'calling',
      title: isMarathi ? 'माझे डॅशबोर्ड (Dashboard)' : 'My Dashboard',
      path: prefix ? `${prefix}/dashboard` : '/dashboard',
      icon: LayoutDashboard
    },
    {
      category: 'calling',
      title: isMarathi ? 'कॉल व्यवस्थापन (Calls)' : 'Call Management',
      path: prefix ? `${prefix}/calls` : '/calls',
      icon: PhoneCall
    },
    {
      category: 'calling',
      title: isMarathi ? 'फॉलो-अप कॅलेंडर (Calendar)' : 'Follow-up Calendar',
      path: prefix ? `${prefix}/calendar` : '/calendar',
      icon: Calendar
    },
    {
      category: 'calling',
      title: isMarathi ? 'शाळा भेट नियोजन (Visits)' : 'Campus Visits',
      path: prefix ? `${prefix}/visits` : '/visits',
      icon: Building2
    },
    {
      category: 'leads',
      title: isMarathi ? 'माझ्या लीड्स (My Leads)' : 'My Assigned Leads',
      path: prefix ? `${prefix}/leads` : '/leads',
      icon: Users,
      badge: myLeads.length > 0 ? `${myLeads.length}` : null
    },
    {
      category: 'leads',
      title: isMarathi ? 'आजचे फॉलो-अप्स (Today)' : "Today's Follow-ups",
      path: prefix ? `${prefix}/follow-ups` : '/follow-ups',
      icon: Clock,
      badge: myTodayCount > 0 ? `${myTodayCount}` : null,
      badgeColor: 'amber'
    },
    {
      category: 'leads',
      title: isMarathi ? 'कॉल हिस्ट्री (Call History)' : 'Call History',
      path: prefix ? `${prefix}/history` : '/history',
      icon: History
    },
    {
      category: 'account',
      title: isMarathi ? 'सूचना व अलर्ट्स' : 'Notifications',
      path: prefix ? `${prefix}/notifications` : '/notifications',
      icon: Bell
    },
    {
      category: 'account',
      title: isMarathi ? 'माझी प्रोफाइल (My Profile)' : 'My Profile',
      path: prefix ? `${prefix}/profile` : '/profile',
      icon: User
    },
    {
      category: 'account',
      title: isMarathi ? 'पासवर्ड बदला (Password)' : 'Change Password',
      path: prefix ? `${prefix}/change-password` : '/change-password',
      icon: KeyRound
    }
  ];

  const categoryTitles = {
    calling: isMarathi ? 'कॉलिंग व वेळापत्रक' : 'CALLING & SCHEDULE',
    leads: isMarathi ? 'माझ्या लीड्स व फॉलो-अप्स' : 'MY LEADS & TASKS',
    account: isMarathi ? 'खाते व सेटिंग्ज' : 'ACCOUNT & SETTINGS'
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] font-sans selection:bg-emerald-600 selection:text-white antialiased">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Telecaller Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-gurukul-navy-950 via-[#0a1928] to-gurukul-navy-950 text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-20 px-4 border-b border-slate-800/80 flex items-center justify-between bg-gurukul-navy-950/90 shrink-0">
          <Link to={prefix ? `${prefix}/dashboard` : '/dashboard'} className="flex items-center gap-3 group min-w-0">
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
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 text-white uppercase tracking-wider shrink-0 shadow-sm border border-emerald-400/30">
                  COUNSELOR
                </span>
              </div>
              <p className="text-[11.5px] text-emerald-400 font-semibold leading-tight mt-1 truncate">
                {isMarathi ? 'समुपदेशक कार्यक्षेत्र' : 'Counselor Workspace'}
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

        {/* Navigation items */}
        <nav className="flex-1 px-3.5 py-3.5 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isActive(item.path.split('?')[0]);
            const showCategoryHeader = idx === 0 || navItems[idx - 1].category !== item.category;

            return (
              <div key={item.path} className="space-y-1">
                {showCategoryHeader && item.category !== 'admin' && (
                  <div className={`px-3 ${idx === 0 ? 'pt-2' : 'pt-5'} pb-1.5`}>
                    <p className="text-[11px] uppercase font-black tracking-wider text-emerald-400 select-none">
                      {categoryTitles[item.category]}
                    </p>
                  </div>
                )}
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] sm:text-sm font-semibold transition-all outline-none focus:outline-none ${
                    active
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 shadow-xs ${
                      item.badgeColor === 'rose'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : item.badgeColor === 'amber'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : active
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3.5 border-t border-slate-800/80 bg-gurukul-navy-950/95 shrink-0">
          <div className="flex items-center gap-2">
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

      {/* Main Workspace */}
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
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 shrink-0">
                    Telecaller Workspace
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 hidden md:block lg:hidden xl:block leading-tight mt-0.5 truncate max-w-[280px]">
                  {isMarathi 
                    ? 'विद्यामंदिर व ज्युनिअर कॉलेज (सैनिक पॅटर्न निवासी) • समुपदेशक व कॉलिंग पोर्टल' 
                    : 'Sainik Pattern Residential School & College • Admission Counselor Hub'}
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
            {myOverdueCount > 0 && (
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold shrink-0">
                <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span>{myOverdueCount} {isMarathi ? 'थकबाकी' : 'Overdue'}</span>
              </div>
            )}

            {/* Language Switcher for Telecaller */}
            <LanguageSwitcher />

            {/* In-App Notification Center */}
            <NotificationCenter isTelecaller={true} />

            <Badge variant="Telecaller" className="shrink-0">
              TELECALLER
            </Badge>

            {/* Website CTA button */}
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
          <Outlet />
        </main>
      </div>
    </div>
  );
};
