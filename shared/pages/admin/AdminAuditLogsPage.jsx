import React, { useState, useMemo } from 'react';
import { useCRM } from '../../contexts/CRMContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  Shield,
  Clock,
  User,
  CheckCircle2,
  Lock,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const AdminAuditLogsPage = () => {
  const { isMarathi } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const { auditLogs, exportAuditLogsCSV } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState('ALL');

  const actionTypes = [
    'ALL',
    'LOGIN',
    'LOGOUT',
    'LEAD_ASSIGNED',
    'LEAD_REASSIGNED',
    'LEAD_STATUS_CHANGED',
    'TELECALLER_CREATED',
    'TELECALLER_STATUS_CHANGED',
    'ADMIN_CREATED',
    'SYSTEM_SETTINGS_UPDATED',
    'CMS_CONTENT_CHANGED',
    'ANNOUNCEMENT_BROADCAST',
    'REPORT_EXPORTED'
  ];

  const filteredLogs = useMemo(() => {
    return (auditLogs || []).filter(log => {
      // 1. Search Query
      const q = searchTerm.toLowerCase();
      const matchSearch = !searchTerm ||
        (log.userName && log.userName.toLowerCase().includes(q)) ||
        (log.userId && log.userId.toLowerCase().includes(q)) ||
        (log.recordId && log.recordId.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // 2. Action Filter
      if (selectedActionFilter !== 'ALL') {
        if (!log.action || !log.action.includes(selectedActionFilter)) return false;
      }

      return true;
    });
  }, [auditLogs, searchTerm, selectedActionFilter]);

  const getActionBadgeColor = (action) => {
    if (!action) return 'slate';
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'blue';
    if (action.includes('ASSIGN')) return 'purple';
    if (action.includes('STATUS')) return 'amber';
    if (action.includes('CREATED')) return 'emerald';
    if (action.includes('SETTINGS') || action.includes('CMS')) return 'indigo';
    return 'slate';
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isMarathi ? 'प्रशासकीय ऑडिट लॉग्स (System Audit Logs)' : 'System Audit Logs'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {filteredLogs.length} {isMarathi ? 'नोंदी' : 'Entries'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi
              ? 'लॉगिन, लीड वाटप, खाते निर्मिती, स्थिती बदल व सिस्टम बदल या सर्व प्रशासकीय कृतींचा अपरिवर्तनीय इतिहास.'
              : 'Immutable record of login/logout, lead assignments, status transitions, user management, and settings mutations.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportAuditLogsCSV(filteredLogs)}>
            <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <span>{isMarathi ? 'ऑडिट लॉग CSV निर्यात' : 'Export Audit CSV'}</span>
          </Button>
        </div>
      </div>

      {/* 2. Security Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-gurukul-saffron-400 shrink-0" />
          <span>
            {isMarathi
              ? 'ऑडिट लॉग्स केवळ वाचनीय (Read-Only) आहेत. सुरक्षेसाठी कोणत्याही वापरकर्त्याला लॉग्स संपादित अथवा हटवण्याची परवानगी नाही.'
              : 'Audit records are strictly append-only and immutable. Deletion and tampering are disallowed.'}
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase text-gurukul-saffron-400 font-bold hidden sm:inline">
          COMPLIANCE READY
        </span>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isMarathi ? 'वापरकर्ता, कृती, अर्ज क्र. किंवा तपशील शोधा...' : 'Search by user, action, lead ID, details...'}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500"
          />
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 shrink-0">
            {isMarathi ? 'कृती प्रकार:' : 'Action Type:'}
          </label>
          <select
            value={selectedActionFilter}
            onChange={(e) => setSelectedActionFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            {actionTypes.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{isMarathi ? 'तारीख व वेळ' : 'Timestamp'}</th>
                <th className="py-3 px-4">{isMarathi ? 'प्रशासकीय कृती' : 'Action'}</th>
                <th className="py-3 px-4">{isMarathi ? 'वापरकर्ता व भूमिका' : 'Actor & Role'}</th>
                <th className="py-3 px-4">{isMarathi ? 'रेकॉर्ड आयडी' : 'Record ID'}</th>
                <th className="py-3 px-4">{isMarathi ? 'तपशील' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    {isMarathi ? 'कोणतेही ऑडिट नोंदी आढळल्या नाहीत.' : 'No audit entries match the criteria.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : '-'}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{log.userName || log.userId}</p>
                      <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        {log.userRole || 'admin'}
                      </span>
                    </td>

                    {/* Record ID */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {log.recordId || '-'}
                    </td>

                    {/* Details */}
                    <td className="py-3.5 px-4 text-slate-600 leading-relaxed max-w-md">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
