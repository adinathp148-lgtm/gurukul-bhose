import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  Clock, 
  AlertTriangle, 
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
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCRM } from '../contexts/CRMContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Badge } from '../components/common/Badge';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';

export const TelecallerLayout = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const { leads, getMetrics } = useCRM();
  const { isMarathi } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Filter metrics strictly for this telecaller
  const telecallerUid = currentUser?.uid || '';
  const myLeads = leads.filter(l => l.assignedTelecallerId === telecallerUid);
  const todayStr = new Date().toISOString().split('T')[0];
  const myTodayCount = myLeads.filter(l => l.nextFollowUp === todayStr && l.leadStatus !== 'Admitted').length;
  const myOverdueCount = myLeads.filter(l => l.nextFollowUp && l.nextFollowUp < todayStr && l.leadStatus !== 'Admitted').length;

  const prefix = location.pathname.startsWith('/telecaller') ? '/telecaller' : '';

  const handleLogout = async () => {
    await logout();
    navigate(prefix ? `${prefix}/login` : '/login');
  };

  const navItems = [
    {
      title: isMarathi ? 'माझे डॅशबोर्ड (My Dashboard)' : 'My Dashboard',
      path: `${prefix}/dashboard` || '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: isMarathi ? 'माझ्या लीड्स (My Assigned Leads)' : 'My Assigned Leads',
      path: `${prefix}/leads` || '/leads',
      icon: Users,
      badge: myLeads.length > 0 ? `${myLeads.length}` : null
    },
    {
      title: isMarathi ? 'आजचे फॉलो-अप्स (Today)' : 'Today\'s Follow-ups',
      path: `${prefix}/follow-ups?filter=today`,
      icon: Clock,
      badge: myTodayCount > 0 ? `${myTodayCount}` : null,
      badgeColor: 'amber'
    },
    {
      title: isMarathi ? 'प्रलंबित फॉलो-अप्स (Pending)' : 'Pending Follow-ups',
      path: `${prefix}/follow-ups?filter=pending`,
      icon: PhoneCall
    },
    {
      title: isMarathi ? 'थकबाकी फॉलो-अप्स (Overdue)' : 'Overdue Follow-ups',
      path: `${prefix}/follow-ups?filter=overdue`,
      icon: AlertTriangle,
      badge: myOverdueCount > 0 ? `${myOverdueCount}` : null,
      badgeColor: 'rose'
    },
    {
      title: isMarathi ? 'कॉल हिस्ट्री (Call History)' : 'Call History',
      path: `${prefix}/history` || '/history',
      icon: History
    },
    {
      title: isMarathi ? 'सूचना (Notifications)' : 'Notifications',
      path: `${prefix}/notifications` || '/notifications',
      icon: Bell
    },
    {
      title: isMarathi ? 'माझी प्रोफाईल (My Profile)' : 'My Profile',
      path: `${prefix}/profile` || '/profile',
      icon: User
    },
    {
      title: isMarathi ? 'पासवर्ड बदला (Change Password)' : 'Change Password',
      path: `${prefix}/change-password` || '/change-password',
      icon: KeyRound
    }
  ];

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Telecaller Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">समुपदेशक पोर्टल</h2>
              <p className="text-[10px] text-emerald-400 font-medium">Telecaller Workspace</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-emerald-300 shrink-0">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'T'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">
                {userProfile?.displayName || userProfile?.fullName || 'Telecaller'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
                  Counselor
                </span>
                {userProfile?.employeeId && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({userProfile.employeeId})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path.split('?')[0]);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.badgeColor === 'rose'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : item.badgeColor === 'amber'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/20 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <a
            href={import.meta.env.VITE_PUBLIC_WEBSITE_URL || "https://www.gurukulbhose.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>{isMarathi ? 'शाळा वेबसाईट' : 'School Website'}</span>
            </span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{isMarathi ? 'लॉगआउट (Logout)' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
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
              <h1 className="text-sm sm:text-base font-bold text-slate-800">
                {isMarathi ? 'गुरुकुल भोसे • समुपदेशक कार्यक्षेत्र' : 'Gurukul Bhose • Telecaller Workspace'}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {isMarathi 
                  ? 'केवळ स्वतःकडे नेमून दिलेल्या लीड्सचे व्यवस्थापन व फॉलो-अप' 
                  : 'Management and follow-ups for assigned student admission leads'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {myOverdueCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span>{myOverdueCount} {isMarathi ? 'थकबाकी' : 'Overdue'}</span>
              </div>
            )}

            {/* Language Switcher for Telecaller */}
            <LanguageSwitcher />

            <Badge variant="Telecaller">
              TELECALLER
            </Badge>
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
