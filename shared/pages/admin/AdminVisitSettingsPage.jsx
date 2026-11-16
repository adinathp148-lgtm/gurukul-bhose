import React, { useState } from 'react';
import { 
  Settings, 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Plus, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCRM } from '../../contexts/CRMContext';

export const AdminVisitSettingsPage = () => {
  const { isMarathi } = useLanguage();
  const { visitSettings, updateVisitScheduleSettings } = useCRM();

  const [formData, setFormData] = useState({
    workingDays: visitSettings.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    startTime: visitSettings.startTime || '10:00 AM',
    endTime: visitSettings.endTime || '04:00 PM',
    slotDurationMinutes: visitSettings.slotDurationMinutes || 30,
    maxVisitorsPerSlot: visitSettings.maxVisitorsPerSlot || 5,
    maxVisitsPerDay: visitSettings.maxVisitsPerDay || 30,
    slotBufferMinutes: visitSettings.slotBufferMinutes || 10,
    advanceBookingDays: visitSettings.advanceBookingDays || 30,
    minimumBookingNoticeHours: visitSettings.minimumBookingNoticeHours || 4,
    holidays: visitSettings.holidays || ['2026-01-26', '2026-05-01', '2026-08-15', '2026-10-02'],
    specialClosureDates: visitSettings.specialClosureDates || []
  });

  const [newHoliday, setNewHoliday] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const addHoliday = () => {
    if (!newHoliday) return;
    if (!formData.holidays.includes(newHoliday)) {
      setFormData(prev => ({
        ...prev,
        holidays: [...prev.holidays, newHoliday]
      }));
    }
    setNewHoliday('');
  };

  const removeHoliday = (dateStr) => {
    setFormData(prev => ({
      ...prev,
      holidays: prev.holidays.filter(h => h !== dateStr)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateVisitScheduleSettings(formData);
    setSuccessMsg(isMarathi ? 'वेळापत्रक सेटिंग्ज यशस्वीरित्या सेव्ह झाल्या!' : 'Schedule settings saved successfully!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-gurukul-saffron-600" />
            <h1 className="text-xl font-bold text-slate-900">
              {isMarathi ? 'शाळा भेट वेळापत्रक व क्षमता सेटिंग्ज' : 'Visit Schedule & Capacity Settings'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isMarathi 
              ? 'शाळेचे कामाचे दिवस, दैनंदिन भेटीची वेळ, स्लॉट मर्यादा आणि सुट्ट्यांचे व्यवस्थापन.' 
              : 'Configure working days, slot intervals, visitor capacities, and holidays to prevent double-booking.'}
          </p>
        </div>

        {successMsg && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        {/* Working Days */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">
            {isMarathi ? 'शाळा भेटीसाठी उपलब्ध आठवड्याचे दिवस *' : 'Campus Visit Working Days *'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {daysOfWeek.map(day => {
              const active = formData.workingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                    active 
                      ? 'bg-gurukul-saffron-50 border-gurukul-saffron-500 text-gurukul-navy-900 ring-1 ring-gurukul-saffron-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <span>{day}</span>
                  {active && <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hours & Capacity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'सुरू वेळ (Daily Start Time)' : 'Daily Start Time'}
            </label>
            <input
              type="text"
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'समाप्ती वेळ (Daily End Time)' : 'Daily End Time'}
            </label>
            <input
              type="text"
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'स्लॉट अवधी (Slot Duration Mins)' : 'Slot Duration (Mins)'}
            </label>
            <input
              type="number"
              value={formData.slotDurationMinutes}
              onChange={(e) => setFormData(prev => ({ ...prev, slotDurationMinutes: Number(e.target.value) }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'प्रति स्लॉट कमाल अभ्यागत क्षमता *' : 'Max Visitors Per Slot *'}
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={formData.maxVisitorsPerSlot}
              onChange={(e) => setFormData(prev => ({ ...prev, maxVisitorsPerSlot: Number(e.target.value) }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />
            <p className="text-[10px] text-slate-500 mt-1">डबल-बुकिंग टाळण्यासाठी प्रति स्लॉट कमाल क्षमता.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'एका दिवसातील कमाल भेटी' : 'Max Visits Per Day'}
            </label>
            <input
              type="number"
              min={5}
              max={100}
              value={formData.maxVisitsPerDay}
              onChange={(e) => setFormData(prev => ({ ...prev, maxVisitsPerDay: Number(e.target.value) }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isMarathi ? 'अगोदर बुकिंग कालावधी (दिवस)' : 'Advance Booking Window (Days)'}
            </label>
            <input
              type="number"
              value={formData.advanceBookingDays}
              onChange={(e) => setFormData(prev => ({ ...prev, advanceBookingDays: Number(e.target.value) }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>

        {/* Holidays & Closed Dates Management */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-800 mb-1">
            {isMarathi ? 'शाळा सुट्टी व बंद असणाऱ्या तारखा (Holidays / Closed Dates)' : 'Holidays & Closed Dates'}
          </label>
          <p className="text-[11px] text-slate-500 mb-3">
            {isMarathi 
              ? 'या तारखांना पालक वेबसाइटवरून भेटीचा स्लॉट आरक्षित करू शकत नाहीत.' 
              : 'Public visitors will be prevented from booking slots on these closed dates.'}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <input
              type="date"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />
            <button
              type="button"
              onClick={addHoliday}
              className="inline-flex items-center gap-1 px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'तारीख जोडा' : 'Add Holiday'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.holidays.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold"
              >
                <span>{h}</span>
                <button
                  type="button"
                  onClick={() => removeHoliday(h)}
                  className="hover:text-rose-900 p-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gurukul-navy-900 hover:bg-gurukul-navy-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isMarathi ? 'सेटिंग्ज जतन करा (Save Settings)' : 'Save Schedule Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminVisitSettingsPage;
