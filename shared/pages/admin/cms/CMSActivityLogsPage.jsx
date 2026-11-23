import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  RotateCcw, 
  ArrowLeft, 
  User, 
  Clock, 
  Layers, 
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../../contexts/CMSContext';
import { useLanguage } from '../../../contexts/LanguageContext';

export const CMSActivityLogsPage = () => {
  const { activityLogs, refreshLogs } = useCMS();
  const { isMarathi } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshLogs();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredLogs = (activityLogs || []).filter(log => {
    const matchesSearch = 
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/cms" 
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title={isMarathi ? 'CMS डॅशबोर्डवर परत जा' : 'Back to CMS Dashboard'}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gurukul-navy-900 flex items-center gap-2">
              <History className="w-7 h-7 text-gurukul-saffron-600" />
              <span>{isMarathi ? 'कंटेंट ऑडिट व अ‍ॅक्टिव्हिटी लॉग्स (CMS Audit Trail)' : 'Content Audit & Activity Logs (CMS)'}</span>
            </h1>
            <p className="text-sm text-slate-500">
              {isMarathi
                ? 'प्रशासकीय बदल, मजकूर अद्यतने व हटवलेल्या नोंदींचा सुरक्षित व पारदर्शक लेखापरीक्षण अहवाल.'
                : 'Transparent audit trail of all administrative edits, content updates, and deletions.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs shadow-xs transition-all"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? (isMarathi ? 'रिफ्रेश होत आहे...' : 'Refreshing...') : (isMarathi ? 'लॉग्स रिफ्रेश करा' : 'Refresh Logs')}</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isMarathi ? 'लॉग्समध्ये शोधा (Search by user, action, description)...' : 'Search logs by user, action, or description...'}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none"
          >
            <option value="all">{isMarathi ? 'सर्व मॉड्यूल्स (All Modules)' : 'All Modules'}</option>
            <option value="homepage">{isMarathi ? 'मुख्यपृष्ठ (Homepage)' : 'Homepage'}</option>
            <option value="pages">{isMarathi ? 'पेजेस (Pages)' : 'Pages'}</option>
            <option value="about">{isMarathi ? 'आमच्याबद्दल (About)' : 'About Us'}</option>
            <option value="courses">{isMarathi ? 'अभ्यासक्रम (Courses)' : 'Courses'}</option>
            <option value="gallery">{isMarathi ? 'फोटो गॅलरी (Gallery)' : 'Gallery'}</option>
            <option value="videos">{isMarathi ? 'व्हिडिओ (Videos)' : 'Videos'}</option>
            <option value="notices">{isMarathi ? 'सूचना पत्रक (Notices)' : 'Notices'}</option>
            <option value="facilities">{isMarathi ? 'सुविधा (Facilities)' : 'Facilities'}</option>
            <option value="contact">{isMarathi ? 'संपर्क (Contact)' : 'Contact'}</option>
            <option value="settings">{isMarathi ? 'सेटिंग्ज (Settings)' : 'Settings'}</option>
            <option value="seo">SEO</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gurukul-navy-900">
            {isMarathi ? `नोंदवलेले व्यवहार (${filteredLogs.length})` : `Recorded Activities (${filteredLogs.length})`}
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Firestore Collection: content_activity_logs
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              {isMarathi ? 'कोणतेही अ‍ॅक्टिव्हिटी लॉग्स सापडले नाहीत.' : 'No activity logs found.'}
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.logId} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-gurukul-navy-900 flex items-center justify-center shrink-0 mt-0.5">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-orange-100 text-gurukul-saffron-700 text-[10px] font-bold uppercase tracking-wider">
                        {log.module}
                      </span>
                      <span className="font-bold text-gurukul-navy-900 text-sm">
                        {log.action}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1">
                      {log.description || log.details}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{log.userEmail || log.performedBy || 'Admin User'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {log.timestamp
                            ? new Date(log.timestamp).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')
                            : (isMarathi ? 'सध्या' : 'Just now')}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{isMarathi ? 'ऑडिट सत्यापित' : 'Audit Verified'}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CMSActivityLogsPage;
