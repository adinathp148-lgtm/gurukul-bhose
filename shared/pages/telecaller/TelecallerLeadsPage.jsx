import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  PhoneCall,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCRM } from '../../contexts/CRMContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const TelecallerLeadsPage = () => {
  const { currentUser } = useAuth();
  const { leads } = useCRM();

  const telecallerUid = currentUser?.uid || '';

  // Strictly filter leads assigned ONLY to this telecaller
  const myLeads = leads.filter(l => l.assignedTelecallerId === telecallerUid);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = myLeads.filter(l => {
    const matchesSearch = 
      (l.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.parentName || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.mobileNumber || '').includes(search) ||
      (l.admissionClass || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || l.leadStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>माझ्याकडे नेमून दिलेल्या लीड्स ({myLeads.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            केवळ आपल्याला सोपवलेल्या विद्यार्थी व पालक प्रवेश चौकशी यादी
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ डेटा प्रायव्हसी सक्रिय: केवळ आपल्या लीड्स
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="विद्यार्थी, पालक किंवा मोबाईल शोधा..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'New', 'Follow-up Scheduled', 'Interested', 'School Visit Planned', 'Admitted'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'सर्व लीड्स' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p>कोणत्याही लीड्स आढळल्या नाहीत.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((lead) => (
              <div key={lead.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Link
                      to={`/leads/${lead.id}`}
                      className="font-bold text-sm text-slate-900 hover:text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>{lead.studentName}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                    <Badge size="xs" variant={lead.leadStatus}>{lead.leadStatus}</Badge>
                    <span className="text-[11px] font-bold text-gurukul-navy-900 px-2 py-0.5 rounded bg-blue-50">
                      {lead.admissionClass}
                    </span>
                    {lead.leadNumber && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {lead.leadNumber}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600">
                    पालक: <strong className="text-slate-800">{lead.parentName}</strong> • {lead.city || lead.district || 'सांगली'}
                  </p>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    नोंद: {lead.notes || 'कोणतीही नोंद नाही.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 font-semibold block">पुढील फॉलो-अप</span>
                    <span className="text-xs font-bold text-slate-800">{lead.nextFollowUp || 'शेड्यूल नाही'}</span>
                  </div>

                  <a
                    href={`tel:${lead.mobileNumber}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="कॉल करा"
                  >
                    <Phone className="w-4 h-4 text-gurukul-navy-900" />
                  </a>

                  <a
                    href={`https://wa.me/91${lead.whatsappNumber || lead.mobileNumber}?text=${encodeURIComponent(`नमस्कार ${lead.parentName}, गुरुकुल भोसे निवासी स्कूल व कॉलेजमधून संपर्क करत आहोत.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                    title="WhatsApp संदेश"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  <Link to={`/telecaller/follow-ups?leadId=${lead.id}`}>
                    <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1.5">
                      <PhoneCall className="w-3.5 h-3.5 mr-1" />
                      <span>कॉल नोंदवा</span>
                    </Button>
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
