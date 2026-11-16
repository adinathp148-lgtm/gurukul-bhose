import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { ContactInfoSection } from '../components/sections/ContactInfoSection';
import { getWebsiteContent } from '../services/firestore/contentService';

export const ContactPage = () => {
  const [institution, setInstitution] = useState({});
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  useEffect(() => {
    getWebsiteContent().then(res => setInstitution(res.data));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'नाव आवश्यक आहे.';
    const cleanMobile = form.mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) errs.mobile = 'वैध १० अंकी मोबाईल नंबर आवश्यक आहे.';
    if (!form.message.trim()) errs.message = 'संदेश आवश्यक आहे.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus({ loading: true, success: false, error: null });

    // Client-side confirmation structure for Phase 2
    setTimeout(() => {
      setStatus({ loading: false, success: true, error: null });
      setForm({ name: '', mobile: '', email: '', subject: '', message: '' });
      setErrors({});
    }, 800);
  };

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title="कॅम्पस संपर्क व पत्ता | गुरुकुल भोसे"
        description="गुरुकुल भोसे संपर्क: दंडोबा डोंगर पायथ्याला, यल्लामा मंदिर जवळ, मिरज-पंढरपूर हायवे लगत, भोसे, ता. मिरज, जि. सांगली. फोन: ९८५०४४९८०० / ९८५०४४९८०८."
      />

      <PageHeader
        badge="थेट संपर्क"
        title="आमच्याशी संपर्क साधा (Contact Us)"
        subtitle="प्रवेश माहिती, कॅम्पस भेट, वसतिगृह पाहणी व समुपदेशनासाठी थेट संपर्क करा"
        breadcrumbs={[{ label: 'संपर्क (Contact Us)' }]}
      />

      {/* Main Info Section & Google Maps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ContactInfoSection institution={institution} />
      </section>

      {/* Contact Enquiry Interface */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="text-center max-w-lg mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              संदेश पाठवा
            </span>
            <h2 className="text-2xl font-black text-gurukul-navy-900 mt-1">
              ऑनलाईन चौकशी संदेश (Online Enquiry Form)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              खालील फॉर्म भरा, आमचे प्रतिनिधी २४ तासांत आपल्याशी संपर्क साधतील.
            </p>
          </div>

          {status.success ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-lg text-emerald-950">आपला संदेश यशस्वीपणे प्राप्त झाला आहे!</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                गुरुकुल भोसे प्रशासकीय कार्यालय लवकरच आपल्याशी फोन किंवा ईमेलवर संपर्क करेल.
              </p>
              <button
                onClick={() => setStatus({ loading: false, success: false, error: null })}
                className="text-xs font-bold text-emerald-900 underline mt-3 inline-block"
              >
                आणखी एक संदेश पाठवा
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    आपले पूर्ण नाव *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="उदा. श्री. संतोष माने"
                    className={`w-full text-xs px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                      errors.name ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    मोबाईल नंबर *
                  </label>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="१० अंकी मोबाईल नंबर"
                    className={`w-full text-xs px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                      errors.mobile ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.mobile && <p className="text-[11px] text-red-600 mt-1">{errors.mobile}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ईमेल पत्ता (पर्यायी)
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    विषय (Subject)
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="उदा. ५ वी प्रवेश विचारणा"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  संदेश / विचारणा (Message) *
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="आपला प्रश्न किंवा विचारणा येथे लिहा..."
                  className={`w-full text-xs px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none ${
                    errors.message ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.message && <p className="text-[11px] text-red-600 mt-1">{errors.message}</p>}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={status.loading}
                className="w-full font-bold uppercase tracking-wider"
              >
                <Send className="w-4 h-4 mr-2" />
                <span>संदेश पाठवा / Send Message</span>
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
