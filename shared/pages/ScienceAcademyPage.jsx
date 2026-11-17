import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FlaskConical, 
  CheckCircle2, 
  Download, 
  Award, 
  Sparkles, 
  Cpu, 
  ArrowRight,
  Microscope,
  Stethoscope,
  Atom,
  Clock,
  BookOpen
} from 'lucide-react';

import { useCMS } from '../contexts/CMSContext';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { CTASection } from '../components/sections/CTASection';

export const ScienceAcademyPage = () => {
  const { institution, gallery } = useCMS();
  const primaryPhone = institution.phones?.[0] || '9850449800';

  const sciencePhotos = gallery.slice(0, 3);

  const programs = [
    {
      title: "NEET (National Eligibility cum Entrance Test)",
      target: "मेडिकल (MBBS, BDS, BAMS, BHMS) प्रवेश",
      icon: Stethoscope,
      color: "emerald",
      desc: "बायोलॉजी, फिजिक्स आणि केमिस्ट्री विषयांचे NCERT-आधारित सखोल कोचिंग, आकृत्यांचे स्पष्टीकरण आणि रोजचे प्रश्नोत्तर सराव."
    },
    {
      title: "JEE Main & Advanced",
      target: "इंजिनिअरिंग (IIT, NIT, शासकीय अभियांत्रिकी)",
      icon: Atom,
      color: "blue",
      desc: "गणित व भौतिकशास्त्रातील कठीण संकल्पनांचे सुलभ विश्लेषण, फॉर्म्युला शीट सराव आणि उच्च दर्जाचे मॉक टेस्ट पेपर्स."
    },
    {
      title: "MHT-CET (महाराष्ट्र राज्य सामाईक प्रवेश परीक्षा)",
      target: "इंजिनिअरिंग, फार्मसी व ॲग्रिकल्चर पदवी",
      icon: Cpu,
      color: "orange",
      desc: "महाराष्ट्र राज्य बोर्ड अभ्यासक्रमावर आधारित जलद सोडवणूक तंत्र, टाईम मॅनेजमेंट आणि ऑनलाइन टेस्ट सिरीज प्रॅक्टिस."
    },
    {
      title: "NDA (National Defence Academy) सायन्स",
      target: "भारतीय सैन्यदलात अधिकारी (Lieutenant / Officer)",
      icon: Award,
      color: "purple",
      desc: "११ वी १२ वी सायन्ससोबत NDA गणित, जनरल सायन्स, इंग्रजी आणि चालू घडामोडींचे निवासी मार्गदर्शन."
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title="गुरुकुल निवासी सायन्स अकॅडमी | NEET, JEE, MHT-CET, NDA & PCMB"
        description="गुरुकुल निवासी सायन्स अकॅडमी - अद्ययावत फिजिक्स, केमिस्ट्री, बायो लॅब, अनुभवी प्राध्यापक, टेस्ट सिरीज आणि हमखास करिअर मार्गदर्शन."
        canonicalUrl="/science-academy"
      />

      {/* Page Header */}
      <PageHeader
        badge="NEET • JEE • PCMB • NDA • MHT-CET"
        title="गुरुकुल निवासी सायन्स अकॅडमी"
        subtitle="तज्ज्ञ फॅकल्टी, अद्ययावत प्रयोगशाळा, टेस्ट सिरीज आणि वैयक्तिक डाऊट सोल्युशन"
        breadcrumbs={[
          { label: 'मुख्यपृष्ठ (Home)', link: '/' },
          { label: 'सायन्स अकॅडमी' }
        ]}
      />

      {/* 1. Academy Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              सायन्स अकॅडमी परिचय (About Academy)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 leading-tight">
              सायन्स, इंजिनिअरिंग, मेडिकल व डिफेन्स प्रवेश परीक्षांची परिपूर्ण तयारी
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong>गुरुकुल निवासी सायन्स अकॅडमी</strong> ही ११ वी व १२ वी सायन्सच्या विद्यार्थ्यांना दर्जेदार कोचिंग, प्रयोगशाळा प्रात्यक्षिके आणि स्पर्धा परीक्षा मार्गदर्शन एकाच छताखाली देणारी निवासी संस्था आहे.
            </p>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              बोर्ड परीक्षेसोबतच NEET, JEE, MHT-CET आणि NDA परीक्षांमध्ये विद्यार्थ्यांचे गुण वाढवण्यासाठी विशेष मायक्रो-प्लॅनिंग आणि डेली प्रॅक्टिस प्रॉब्लेम्स (DPP) घेतले जातात.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Button to="/admission-enquiry" variant="primary" size="md">
                <span>प्रवेश नोंदणी करा / Apply</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button href={institution.brochureUrl || "https://bit.ly/3mUeaH6"} target="_blank" rel="noopener noreferrer" variant="outline" size="md">
                <Download className="w-4 h-4 mr-1.5" />
                <span>Brochure</span>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80"
                alt="सायन्स अकॅडमी लॅबोरेटरी"
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Specialized Programs */}
      <section className="bg-slate-50 py-14 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              सायन्स प्रोग्राम्स (Science Programs)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
              मेडिकल, इंजिनिअरिंग व संरक्षण सेवांची एकात्मिक तयारी
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-gurukul-saffron-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-gurukul-saffron-600 block">{item.target}</span>
                        <h3 className="font-bold text-base text-gurukul-navy-900">{item.title}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">निवासी बॅच • मर्यादित जागा</span>
                    <Link to="/admission-enquiry" className="text-xs font-bold text-gurukul-navy-900 hover:text-gurukul-saffron-600 flex items-center gap-1">
                      <span>चौकशी करा</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Laboratory Facilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
            अद्ययावत प्रयोगशाळा (Laboratory Facilities)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
            प्रत्यक्ष प्रयोगांतून विज्ञानाची गोडी व सखोल आकलन
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <Atom className="w-8 h-8 text-blue-600" />
            <h4 className="font-bold text-base text-slate-900">भौतिकशास्त्र लॅब (Physics Lab)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              ऑप्टिक्स, मेकॅनिक्स, इलेक्ट्रिसिटी व मॅग्नेटिझमचे सर्व आवश्यक उपकरणे, व्हर्नियर कॅलिपर्स, स्क्रू गेज व आधुनिक प्रायोगिक किट्स.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <FlaskConical className="w-8 h-8 text-purple-600" />
            <h4 className="font-bold text-base text-slate-900">रसायनशास्त्र लॅब (Chemistry Lab)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              रासायनिक अभिक्रिया, टायट्रेशन, सेंद्रिय व अजैविक घटकांची चाचणी करण्यासाठी सर्व सुरक्षित रसायने व काचपात्रे.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <Microscope className="w-8 h-8 text-emerald-600" />
            <h4 className="font-bold text-base text-slate-900">जीवशास्त्र लॅब (Biology Lab)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              हाय-पॉवर मायक्रोस्कोप्स, वनस्पती व प्राणी पेशी मॉडेल्स, डिसेक्शन बॉक्स आणि स्थायी स्लाइड्सचा समृद्ध संग्रह.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Teaching Methodology */}
      <section className="bg-gradient-to-br from-gurukul-navy-950 to-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-400 block">
              अध्यापन कार्यपद्धती (Teaching Methodology)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1">
              संकल्पना स्पष्टता व नियमित सराव परीक्षा
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs sm:text-sm text-slate-200">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <strong className="block text-white text-base mb-2">१. कॉन्सेप्ट क्लिनिक</strong>
              प्रत्येक धड्याचा पाया पक्का करणे. रट्टा मारण्याऐवजी लॉजिक आणि उदाहरणांवर भर.
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <strong className="block text-white text-base mb-2">२. डेली प्रॅक्टिस (DPP)</strong>
              दररोज वर्गात शिकवलेल्या भागावर १५ ते २५ वस्तुनिष्ठ प्रश्नांचा गृहपाठ व तपासणी.
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <strong className="block text-white text-base mb-2">३. डाऊट सॉल्व्हिंग</strong>
              दररोज संध्याकाळी १ तास शिक्षक स्वतः उपस्थित राहून मुलांच्या सर्व शंका दूर करतात.
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <strong className="block text-white text-base mb-2">४. साप्ताहिक टेस्ट सिरीज</strong>
              प्रत्येक रविवारी NEET / JEE / CET पॅटर्ननुसार ओएमआर आधारित परीक्षा व प्रगती विश्लेषण.
            </div>
          </div>
        </div>
      </section>

      {/* 5. Gallery Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              सायन्स लॅब व वर्ग (Gallery)
            </span>
            <h2 className="text-2xl font-black text-gurukul-navy-900 mt-1">
              प्रयोगशाळा व प्रात्यक्षिकांची क्षणचित्रे
            </h2>
          </div>
          <Link to="/gallery" className="text-xs font-bold text-gurukul-saffron-600 hover:underline flex items-center gap-1">
            <span>सर्व फोटो पहा</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {sciencePhotos.map((img) => (
            <div key={img.id} className="rounded-2xl overflow-hidden aspect-video bg-slate-100 shadow-sm">
              <img
                src={img.imageUrl}
                alt={img.title}
                loading="lazy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 6. Admission CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="सायन्स अकॅडमीमध्ये प्रवेश घेऊन डॉक्टर, इंजिनिअर व ऑफिसर बना!"
          subtitle="११ वी व १२ वी सायन्स (PCMB) • NEET, JEE, MHT-CET, NDA निवासी कोचिंग • मर्यादित जागा"
          brochureUrl={institution.brochureUrl}
          phone={primaryPhone}
        />
      </section>
    </div>
  );
};
