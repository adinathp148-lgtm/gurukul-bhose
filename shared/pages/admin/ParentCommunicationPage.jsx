import React, { useState } from 'react';
import { useCRM } from '../../contexts/CRMContext';
import { useCMS } from '../../contexts/CMSContext';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Calendar, 
  CheckCircle2, 
  BookOpen, 
  Bell, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const ParentCommunicationPage = () => {
  const { admissions } = useCRM();
  const { notices, addNotice } = useCMS();

  const [messageType, setMessageType] = useState('PTM Reminder');
  const [targetGroup, setTargetGroup] = useState('All Admitted Students');
  const [customTitle, setCustomTitle] = useState('पालक-शिक्षक सभा (PTM) आणि मासिक प्रगती आढावा');
  const [messageBody, setMessageBody] = useState(
    'आदरणीय पालक, गुरुकुल भोसे निवासी स्कूल व कॉलेजच्या वतीने आपल्या पाल्याच्या शैक्षणिक व शारीरिक प्रगतीबाबत चर्चा करण्यासाठी रविवार रोजी सकाळी १० ते २ या वेळेत पालक-शिक्षक सभा आयोजित करण्यात आली आहे. आपली उपस्थिती प्रार्थनीय आहे.'
  );

  const [sendSuccess, setSendSuccess] = useState(false);
  const [broadcastLog, setBroadcastLog] = useState([
    {
      id: 'b-01',
      title: 'मासिक प्रगती पत्रक व आरोग्य तपासणी अहवाल',
      type: 'Monthly Progress Update',
      sentAt: '2026-11-01',
      recipientsCount: 42,
      channel: 'WhatsApp & SMS'
    },
    {
      id: 'b-02',
      title: 'दिवाळी सुट्टी व वसतिगृह रजा नियोजन',
      type: 'School Notice',
      sentAt: '2026-10-25',
      recipientsCount: 45,
      channel: 'WhatsApp & Notice Board'
    }
  ]);

  const handleTemplateChange = (type) => {
    setMessageType(type);
    if (type === 'PTM Reminder') {
      setCustomTitle('पालक-शिक्षक सभा (PTM) आणि मासिक प्रगती आढावा');
      setMessageBody('आदरणीय पालक, गुरुकुल भोसे निवासी स्कूल व कॉलेजच्या वतीने आपल्या पाल्याच्या शैक्षणिक व शारीरिक प्रगतीबाबत चर्चा करण्यासाठी रविवार रोजी सकाळी १० ते २ या वेळेत पालक-शिक्षक सभा आयोजित करण्यात आली आहे. आपली उपस्थिती प्रार्थनीय आहे.');
    } else if (type === 'Monthly Progress') {
      setCustomTitle('मासिक शैक्षणिक व मैदानी प्रगती पत्रक उपलब्ध');
      setMessageBody('आदरणीय पालक, आपल्या पाल्याचे या महिन्यातील वर्गातील गुण, हजेरी, रनिंग सराव व वर्तणूक प्रगती पत्रक तयार आहे. कृपया अवलोकन करावे.');
    } else if (type === 'Fee Reminder') {
      setCustomTitle('द्वितीय सत्र शुल्क भरणा स्मरणपत्र');
      setMessageBody('आदरणीय पालक, गुरुकुल भोसे निवासी स्कूल व कॉलेजचे द्वितीय सत्राचे उर्वरित शैक्षणिक व वसतिगृह शुल्क कृपया पुढील आठवड्यापर्यंत संस्थेच्या खात्यावर जमा करावे.');
    } else if (type === 'Academic Update') {
      setCustomTitle('सराव परीक्षा वेळापत्रक व सुट्टी नियोजन');
      setMessageBody('आदरणीय पालक, आगामी आठवड्यात विद्यार्थ्यांची पूर्वतयारी सराव परीक्षा सुरू होत आहे. विद्यार्थ्यांनी वेळेवर उपस्थित राहावे.');
    }
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    setSendSuccess(true);

    const newLog = {
      id: `b-${Date.now()}`,
      title: customTitle,
      type: messageType,
      sentAt: new Date().toISOString().split('T')[0],
      recipientsCount: targetGroup === 'All Admitted Students' ? admissions.length : Math.max(1, Math.floor(admissions.length / 2)),
      channel: 'Meta WhatsApp Cloud API'
    };

    setBroadcastLog(prev => [newLog, ...prev]);

    // Also publish as public notice optionally
    addNotice({
      title: customTitle,
      category: 'पालक संदेश (Parent Notice)',
      description: messageBody,
      isImportant: true
    });

    setTimeout(() => {
      setSendSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            पालक संदेश व संप्रेषण केंद्र (Parent Communication Hub)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            पालक-शिक्षक सभा, मासिक प्रगती पत्रके, नोटीस व व्हॉट्सॲप संदेश एकाच ठिकाणाहून पाठवा
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-3.5 py-1.5 rounded-full border border-slate-200">
          <Users className="w-4 h-4 text-gurukul-saffron-600" />
          <span>नोंदणीकृत पालक संख्या: {admissions.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Message Composer */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gurukul-saffron-600" />
            <span>नवीन संदेश पाठवा (Broadcast Message Composer)</span>
          </h3>

          {sendSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">संदेश यशस्वीपणे सर्व पालकांना पाठवला गेला!</p>
                <p className="text-[11px] mt-0.5">Meta WhatsApp Business Cloud API द्वारे संदेश वितरित करण्यात आले आहेत.</p>
              </div>
            </div>
          )}

          {/* Quick Template Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              जलद टेम्पलेट निवडा (Quick Templates):
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'PTM Reminder', label: 'पालक सभा (PTM)' },
                { id: 'Monthly Progress', label: 'मासिक प्रगती (Progress)' },
                { id: 'Fee Reminder', label: 'फी स्मरणपत्र (Fee)' },
                { id: 'Academic Update', label: 'शैक्षणिक अपडेट (Academic)' }
              ].map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleTemplateChange(tpl.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                    messageType === tpl.id
                      ? 'bg-gurukul-saffron-500 text-white border-gurukul-saffron-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  लक्षित पालक गट (Target Group) *
                </label>
                <select
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="All Admitted Students">सर्व प्रवेशित विद्यार्थी ({admissions.length} पालक)</option>
                  <option value="Vidyamandir 5th to 10th">गुरुकुल विद्यामंदिर (५ वी ते १० वी)</option>
                  <option value="Junior College 11th & 12th">गुरुकुल जुनियर कॉलेज (११ वी व १२ वी)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  संदेश माध्यम (Channel)
                </label>
                <div className="flex items-center gap-2 p-2 border rounded-lg bg-slate-50 text-xs text-slate-700 font-semibold">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Meta WhatsApp Cloud API</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                संदेश शीर्षक (Message Title) *
              </label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                संदेश मजकूर (Message Body) *
              </label>
              <textarea
                rows={5}
                required
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-lg leading-relaxed"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold uppercase tracking-wider"
            >
              <Send className="w-4 h-4 mr-2" />
              <span>पालकांना पाठवा (Broadcast Message)</span>
            </Button>
          </form>
        </div>

        {/* Right: Broadcast History */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>मागील संदेश इतिहास (Broadcast History)</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {broadcastLog.map(item => (
              <div key={item.id} className="py-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{item.title}</span>
                  <span className="text-[10px] text-slate-400">{item.sentAt}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                    {item.type}
                  </span>
                  <span className="text-emerald-700 font-bold text-[10px]">
                    {item.recipientsCount} पालकांना वितरित ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
