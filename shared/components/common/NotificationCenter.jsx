import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  UserPlus, 
  PhoneCall, 
  Sparkles, 
  AlertCircle,
  ExternalLink,
  X
} from 'lucide-react';
import { useCRM } from '../../contexts/CRMContext';
import { useAuth } from '../../contexts/AuthContext';

export const NotificationCenter = ({ isTelecaller = false }) => {
  const { notifications, unreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } = useCRM();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const popoverRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      markNotificationAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.leadId) {
      const targetPath = isTelecaller && !isAdmin
        ? `/leads/${notif.leadId}`
        : `/admin/leads/${notif.leadId}`;
      navigate(targetPath);
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'enquiry':
        return <UserPlus className="w-4 h-4 text-gurukul-saffron-600" />;
      case 'assignment':
        return <PhoneCall className="w-4 h-4 text-purple-600" />;
      case 'conversion':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        title="सूचना केंद्र (Notifications)"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-[9px] font-bold text-white items-center justify-center">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                सूचना केंद्र (Notifications)
              </h4>
              {unreadNotificationsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                  {unreadNotificationsCount} नवीन
                </span>
              )}
            </div>

            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] font-bold text-gurukul-saffron-600 hover:text-gurukul-saffron-700 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>सर्व वाचले</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center border-b border-slate-100 bg-white px-3 py-1.5 gap-2 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              सर्व ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'unread' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              न वाचलेल्या ({unreadNotificationsCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-1">
                <Bell className="w-8 h-8 text-slate-200 mx-auto" />
                <p>कोणतीही नवीन सूचना नाही.</p>
              </div>
            ) : (
              filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 text-xs ${
                    !n.read ? 'bg-orange-50/20' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getCategoryIcon(n.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-bold text-xs truncate ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-gurukul-saffron-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {n.createdAt ? new Date(n.createdAt?.toDate ? n.createdAt.toDate() : n.createdAt).toLocaleString('en-IN') : ''}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              गोपनीयता धोरण: सूचनांमध्ये पालकांचे खाजगी तपशील दाखवले जात नाहीत.
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
