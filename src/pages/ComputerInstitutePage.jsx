import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, CheckCircle2, Award, Download, Clock, BookOpen, ShieldCheck, ArrowRight } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { CTASection } from '../components/sections/CTASection';
import { getWebsiteContent } from '../services/firestore/contentService';

export const ComputerInstitutePage = () => {
  const [institution, setInstitution] = useState({});

  useEffect(() => {
    getWebsiteContent().then(res => setInstitution(res.data));
  }, []);

  const courses = [
    {
      title: "MS-CIT (महाराष्ट्र राज्य ज्ञान महामंडळ अधिकृत)",
      duration: "३ महिने (१४४ तास)",
      description: "संगणक मूलभूत ज्ञान, MS Office, इंटरनेट, ईमेल, सायबर सुरक्षा व डिजिटल गव्हर्नन्सचे परिपूर्ण प्रशिक्षण. सर्व शासकीय नोकऱ्यांसाठी अनिवार्य.",
      topics: ["Computer Fundamentals & Windows OS", "MS Word, Excel, PowerPoint", "Internet, Google Workspace & Online Services", "Cyber Security Basics"]
    },
    {
      title: "Tally Prime ERP (अकाउंटिंग व जीएसटी)",
      duration: "३ महिने",
      description: "व्यावसायिक अकाउंटिंग, व्हाउचर एन्ट्री, जीएसटी इन्व्हॉइसिंग, बँक रिकन्सिलिएशन आणि बॅलन्स शीट तयार करण्याचे प्रॅक्टिकल ज्ञान.",
      topics: ["Accounting Fundamentals", "Voucher Entry & Ledger Creation", "GST Invoicing & Reports", "Inventory Management"]
    },
    {
      title: "मराठी व इंग्रजी संगणक टायपिंग (GCC-TBC)",
      duration: "६ महिने",
      description: "शासकीय टायपिंग परीक्षा (३० व ४० शब्द प्रति मिनिट) पूर्वतयारी. अचूकता व वेगावर विशेष भर.",
      topics: ["English Typing 30 & 40 WPM", "मराठी टायपिंग ३० व ४० श.प्र.मि.", "स्पीड टेस्ट्स व अचूकता सराव", "GCC-TBC परीक्षा पॅटर्न"]
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title="गुरुकुल कम्प्युटर इन्स्टिट्यूट | MS-CIT, Tally, Typing"
        description="गुरुकुल कम्प्युटर इन्स्टिट्यूट, भोसे. MS-CIT, Tally ERP, मराठी व इंग्रजी टायपिंग प्रशिक्षण. प्रत्येक विद्यार्थ्याला स्वतंत्र संगणक व लॅब सुविधा."
      />

      <PageHeader
        badge="डिजिटल कौशल्ये व संगणक साक्षरता"
        title="गुरुकुल कम्प्युटर इन्स्टिट्यूट, भोसे"
        subtitle="शाळा व कॉलेज शिक्षणासोबत आधुनिक संगणक प्रशिक्षण, MS-CIT, Tally व टायपिंग"
        breadcrumbs={[{ label: 'Academies', link: '/' }, { label: 'कम्प्युटर इन्स्टिट्यूट' }]}
      />

      {/* Main Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              शाळा व कॉलेज संकुलातच सुविधा
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 leading-tight">
              प्रत्येक विद्यार्थ्याला डिजिटल युगासाठी सक्षम करणारी संस्था
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              गुरुकुल भोसे निवासी संकुलामध्ये ५ वी ते १२ वी च्या विद्यार्थ्यांना शालेय वेळेव्यतिरिक्त कॉम्प्युटर लॅबमध्ये प्रात्यक्षिक प्रशिक्षण दिले जाते.
            </p>

            <div className="space-y-2.5">
              {[
                "शासकीय मान्यताप्राप्त MS-CIT कोर्स कॅम्पसमध्येच उपलब्ध",
                "GCC-TBC मराठी व इंग्रजी टायपिंग बोर्ड परीक्षा पूर्वतयारी",
                "Tally Prime ERP सह व्यावसायिक अकाउंटिंग प्रशिक्षण",
                "प्रत्येक विद्यार्थ्याला प्रॅक्टिकलसाठी स्वतंत्र अत्याधुनिक संगणक",
                "हाय-स्पीड ब्रॉडबँड इंटरनेट व सायबर सुरक्षा मार्गदर्शन",
                "प्रकल्प व सादरीकरणावर भर देणारी आधुनिक अध्यापन पद्धती"
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link to="/admission-enquiry">
                <Button variant="primary" size="md">
                  प्रवेश चौकशी करा
                </Button>
              </Link>
              <a href={institution.brochureUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="md">
                  <Download className="w-4 h-4 mr-1.5" />
                  माहिती पत्रक
                </Button>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1000&q=80"
                alt="गुरुकुल कम्प्युटर इन्स्टिट्यूट लॅब"
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
              <span>
                शासकीय व निमशासकीय नोकऱ्यांसाठी आवश्यक असणारे सर्व संगणक प्रमाणपत्र वर्ग संस्थेतच पूर्ण करून घेतले जातात.
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Courses Offered */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
            कोर्सेस तपशील
          </span>
          <h2 className="text-2xl font-black text-gurukul-navy-900 mt-1">
            उपलब्ध संगणक अभ्यासक्रम (Courses Offered)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gurukul-saffron-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    प्रमाणपत्र कोर्स
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-gurukul-navy-900">{course.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{course.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <h4 className="text-[11px] font-bold text-slate-800">प्रमुख घटक:</h4>
                  {course.topics.map((top, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{top}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Link to="/admission-enquiry" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <span>प्रवेश घ्या / चौकशी करा</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="कम्प्युटर, टायपिंग व शालेय शिक्षण एकाच ठिकाणी!"
          subtitle="शाळेसोबतच डिजिटल कौशल्ये आत्मसात करण्यासाठी आजच गुरुकुल भोसेमध्ये प्रवेश निश्चित करा."
          phone={institution.phones?.[0]}
          brochureUrl={institution.brochureUrl}
        />
      </section>
    </div>
  );
};
