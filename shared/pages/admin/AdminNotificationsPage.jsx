import React, { useState } from 'react';
import { useCRM } from '../../contexts/CRMContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Building2,
  GraduationCap,
  Sparkles,
  Filter,
  CheckCheck,
  Megaphone,
  X,
  Radio,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';

export const AdminNotificationsPage = () => {
  const { isMarathi } = useLanguage();
  const { userProfile, role } = useAuth();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    sendAnnouncement,
    triggerRemindersCheck
  } = useCRM();

  const [filterCategory, setFilterCategory] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    targetAudience: 'ALL',
    priority: 'NORMAL',
    publishToWebsite: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Filtered Notifications
  const filteredNotifs = (notifications || []).filter(n => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'ENQUIRIES') return n.category === 'enquiry' || n.category === 'lead';
    if (filterCategory === 'FOLLOWUPS') return n.category === 'followup' || n.category === 'reminder';
    if (filterCategory === 'VISITS') return n.category === 'visit';
    if (filterCategory === 'ANNOUNCEMENTS') return n.category === 'announcement';
    return true;
  });

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) return;

    setSubmitting(true);
    const res = await sendAnnouncement({
      title: announcementForm.title,
      message: announcementForm.message,
      targetAudience: announcementForm.targetAudience,
      priority: announcementForm.priority,
      publishToWebsite: announcementForm.publishToWebsite
    });
    setSubmitting(false);

    if (res?.success) {
      setFeedbackMsg(isMarathi ? `घोषणा "${announcementForm.title}" यशस्वीपणे पाठवली गेली (वेबसाईटवरही प्रकाशित झाली)!` : `Announcement "${announcementForm.title}" published successfully!`);
      setAnnouncementForm({ title: '', message: '', targetAudience: 'ALL', priority: 'NORMAL', publishToWebsite: true });
      setModalOpen(false);
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const handleDeleteNotification = async (notif) => {
    const title = notif.title || 'सूचना';
    if (!window.confirm(isMarathi ? `तुम्हाला खात्री आहे की "${title}" ही सूचना हटवायची आहे? (ती वेबसाईटच्या सूचना पत्रकातूनही कायमची काढली जाईल)` : `Are you sure you want to delete "${title}"? It will also be deleted from the website notice board.`)) {
      return;
    }

    try {
      await deleteNotification(notif.id);
      setFeedbackMsg(isMarathi ? `सूचना "${title}" यशस्वीपणे हटवली गेली!` : `Notification "${title}" deleted successfully.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      setFeedbackMsg(`त्रुटी: ${err.message}`);
    }
  };

  const handleTriggerQuickReminders = async () => {
    const res = await triggerRemindersCheck();
    setFeedbackMsg(`स्वयंचलित फॉलो-अप स्मरणपत्रे तपासली गेली (${res.remindersSent || 0} स्मरणपत्रे पाठवली).`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'enquiry':
      case 'lead':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'visit':
        return <Building2 className="w-4 h-4 text-purple-500" />;
      case 'admission':
        return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isMarathi ? 'सूचना व घोषणा व्यवस्थापन (Notifications)' : 'Notification Management'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gurukul-saffron-50 text-gurukul-saffron-700 border border-gurukul-saffron-200">
              {filteredNotifs.length} {isMarathi ? 'सूचना' : 'Alerts'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi
              ? 'प्रवेश अर्ज अलर्ट्स, फॉलो-अप रिमाइंडर आणि समुपदेशकांना महत्त्वाच्या सूचना पाठवण्याचे केंद्र.'
              : 'Monitor system events, send broadcasts to counselors, and manage alerts.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleTriggerQuickReminders}>
            <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <span>{isMarathi ? 'स्मरणपत्रे तपासा' : 'Check Reminders'}</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Megaphone className="w-3.5 h-3.5 mr-1" />
            <span>{isMarathi ? 'नवीन घोषणा पाठवा' : 'Send Announcement'}</span>
          </Button>
        </div>
      </div>

      {/* 2. Feedback Message */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="p-1 text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Category Filter Tabs & Mark All as Read */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === 'ALL'
                ? 'bg-gurukul-navy-950 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isMarathi ? 'सर्व सूचना' : 'All'}
          </button>
          <button
            onClick={() => setFilterCategory('ENQUIRIES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === 'ENQUIRIES'
                ? 'bg-gurukul-navy-950 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isMarathi ? 'प्रवेश अर्ज (Enquiries)' : 'Enquiries'}
          </button>
          <button
            onClick={() => setFilterCategory('FOLLOWUPS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === 'FOLLOWUPS'
                ? 'bg-gurukul-navy-950 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isMarathi ? 'फॉलो-अप्स (Follow-ups)' : 'Follow-ups'}
          </button>
          <button
            onClick={() => setFilterCategory('VISITS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === 'VISITS'
                ? 'bg-gurukul-navy-950 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isMarathi ? 'शाळा भेट (Visits)' : 'Visits'}
          </button>
          <button
            onClick={() => setFilterCategory('ANNOUNCEMENTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === 'ANNOUNCEMENTS'
                ? 'bg-gurukul-navy-950 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isMarathi ? 'घोषणा (Announcements)' : 'Announcements'}
          </button>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="text-xs font-bold text-slate-500 hover:text-gurukul-navy-900 flex items-center gap-1 shrink-0"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>{isMarathi ? 'सर्व वाचल्याचे चिन्हांकित करा' : 'Mark All as Read'}</span>
        </button>
      </div>

      {/* 4. Notifications Feed */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-bold">
              {isMarathi ? 'कोणत्याही नवीन सूचना उपलब्ध नाहीत.' : 'No notifications in this category.'}
            </p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 group ${
                notif.read
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-orange-50/20 border-gurukul-saffron-200 shadow-sm hover:border-gurukul-saffron-300'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                {getCategoryIcon(notif.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>{notif.title}</span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-gurukul-saffron-500 shrink-0" />
                      )}
                    </h4>
                    {notif.websiteNoticeId && (
                      <a
                        href="/notices"
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gurukul-saffron-50 text-gurukul-saffron-700 border border-gurukul-saffron-200 hover:bg-gurukul-saffron-100 transition-colors"
                        title={isMarathi ? 'वेबसाईटवर सूचना पत्रक उघडा' : 'View on website notices'}
                      >
                        <span>{isMarathi ? 'वेबसाईटवर लाईव्ह' : 'Live on Website'}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString('en-IN') : ''}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notif);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title={isMarathi ? 'काढून टाका (Delete from admin & website)' : 'Delete notification'}
                      aria-label={isMarathi ? 'सूचना काढून टाका' : 'Delete notification'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.senderName && (
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    पाठवणारे: {notif.senderName}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Send Announcement Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={isMarathi ? 'नवीन घोषणा पाठवा (Send System Broadcast)' : 'Send Announcement'}
        >
          <form onSubmit={handleSendAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                घोषणा शीर्षक (Announcement Title) *
              </label>
              <input
                type="text"
                required
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                placeholder="उदा. सत्र 2026-2027 प्रवेश बैठक किंवा फॉलो-अप अलर्ट"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  लक्षित वर्ग (Target Audience)
                </label>
                <select
                  value={announcementForm.targetAudience}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, targetAudience: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                >
                  <option value="ALL">सर्व वापरकर्ते (All Users)</option>
                  <option value="TELECALLERS">केवळ समुपदेशक (Telecallers Only)</option>
                  <option value="ADMINS">केवळ प्रशासक (Admins Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  महत्त्व (Priority)
                </label>
                <select
                  value={announcementForm.priority}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
                >
                  <option value="NORMAL">सामान्य (Normal)</option>
                  <option value="HIGH">महत्त्वाचे (High Priority)</option>
                  <option value="URGENT">तातडीचे (Urgent Alert)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                घोषणा संदेश (Detailed Message) *
              </label>
              <textarea
                rows={4}
                required
                value={announcementForm.message}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                placeholder="सर्व समुपदेशकांनी आज संध्याकाळी 5 वाजेपर्यंत आपले आजचे सर्व प्रलंबित फॉलो-अप्स पूर्ण करावेत..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gurukul-saffron-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="publishToWebsite"
                checked={Boolean(announcementForm.publishToWebsite)}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, publishToWebsite: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-gurukul-saffron-600 focus:ring-gurukul-saffron-500 cursor-pointer"
              />
              <label htmlFor="publishToWebsite" className="text-xs text-slate-700 leading-snug cursor-pointer select-none">
                <span className="font-bold text-slate-900 block">
                  {isMarathi ? 'मुख्य वेबसाईटच्या "सूचना पत्रक" (Notices) वर सुद्धा थेट प्रकाशित करा' : 'Publish directly to main website Notices page as well'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {isMarathi
                    ? 'पालक व विद्यार्थ्यांना वेबसाईटवरील सूचना पत्रकावर (School Notices & Bulletins) ही सूचना तात्काळ दिसेल.'
                    : 'Parents & students will immediately see this notice on the public website notice board.'}
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
                रद्द करा
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>{submitting ? 'पाठवत आहे...' : 'घोषणा पाठवा'}</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
