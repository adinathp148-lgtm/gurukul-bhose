import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle2, 
  Download, 
  Phone, 
  Award, 
  Briefcase, 
  BookOpen, 
  FlaskConical, 
  Activity, 
  Users, 
  Clock, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';

import { useCMS } from '../contexts/CMSContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { CTASection } from '../components/sections/CTASection';

export const JuniorCollegePage = () => {
  const { institution, gallery } = useCMS();
  const { isMarathi } = useLanguage();
  const primaryPhone = institution.phones?.[0] || '9850449800';

  const collegePhotos = gallery.slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title="गुरुकुल जुनियर कॉलेज, भोसे (इ. ११ वी व १२ वी) | आर्टस् व सायन्स सैनिक पॅटर्न"
        description="इ. ११ वी व १२ वी आर्टस् व सायन्स सैनिक पॅटर्न निवासी कॉलेज. बारावी पास नंतर हमखास सरकारी नोकरी, आर्मी, पोलीस, नेव्ही, NDA लेखी व फिजिकल १००% तयारी."
        canonicalUrl="/junior-college"
      />

      {/* Page Header */}
      <PageHeader
        badge={isMarathi ? "इयत्ता ११ वी व १२ वी निवासी जुनिअर कॉलेज" : "Std 11th & 12th Residential Junior College"}
        title={isMarathi ? "गुरुकुल जुनियर कॉलेज, भोसे" : "Gurukul Junior College, Bhose"}
        subtitle={isMarathi ? "सैनिक पॅटर्न निवासी आर्टस् व सायन्स • बारावी पास नंतर हमखास सरकारी नोकरी व उच्च करिअर" : "Military Pattern Residential Arts & Science • Assured Government Jobs & Higher Career After 12th"}
        breadcrumbs={[
          { label: isMarathi ? 'मुख्यपृष्ठ' : 'Home', link: '/' },
          { label: isMarathi ? 'गुरुकुल जुनियर कॉलेज' : 'Gurukul Junior College' }
        ]}
      />

      {/* 1. College Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold border border-red-200">
              <Briefcase className="w-4 h-4 text-red-600" />
              <span>बारावी पास नंतर हमखास सरकारी नोकरी देणारे महाराष्ट्रातील एकमेव कॉलेज</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 leading-tight">
              आर्टस् व सायन्स सोबत डिफेन्स व स्पर्धा परीक्षांची परिपूर्ण तयारी
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              मुलां / मुलींच्या जीवनाच्या महत्त्वपूर्ण टप्प्यावर (Career Turning Point) शैक्षणिक, शारीरिक, मानसिक, कौटुंबिक, आर्थिक व आध्यात्मिक अशा सर्व क्षेत्राचे ज्ञान देऊन सर्वगुणसंपन्न विद्यार्थी घडवणारे हे निवासी कॉलेज आहे.
            </p>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              येथे विद्यार्थ्यांना नियमित महाराष्ट्र राज्य HSC बोर्ड अभ्यासक्रमासोबतच भारतीय सैन्यदल (Army), नौदल (Navy), हवाई दल (Air Force), NDA, महाराष्ट्र पोलीस आणि शासकीय नोकऱ्यांसाठी लागणारे फिजिकल ग्राउंड आणि लेखी परीक्षेचे १००% मार्गदर्शन दिले जाते.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Button to="/admission-enquiry" variant="primary" size="md">
                <span>प्रवेश चौकशी करा / Apply</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button href={institution.brochureUrl || "https://bit.ly/3mUeaH6"} target="_blank" rel="noopener noreferrer" variant="outline" size="md">
                <Download className="w-4 h-4 mr-1.5" />
                <span>माहिती पत्रक (Brochure)</span>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80"
                alt="गुरुकुल जुनियर कॉलेज विद्यार्थी"
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Available Streams (Verified from authentic info) */}
      <section className="bg-slate-50 py-14 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              उपलब्ध शाखा (Available Academic Streams)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
              ११ वी व १२ वी सायन्स आणि आर्टस् शाखा
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Science Stream */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gurukul-navy-900">सायन्स शाखा (Science Stream)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                भौतिकशास्त्र (Physics), रसायनशास्त्र (Chemistry), गणित (Mathematics) आणि जीवशास्त्र (Biology - PCMB) विषयांचे सखोल ज्ञान आणि प्रॅक्टिकल्स.
              </p>
              <div className="space-y-2 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0" />
                  <span>NEET, JEE Mains, MHT-CET नियमित कोचिंग</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0" />
                  <span>NDA (National Defence Academy) गणित व सामान्य ज्ञान</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0" />
                  <span>अद्ययावत सुसज्ज सायन्स लॅबोरेटरी</span>
                </div>
              </div>
            </div>

            {/* Arts Stream */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-gurukul-saffron-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gurukul-navy-900">आर्टस् शाखा (Arts Stream)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                इतिहास, भूगोल, राज्यशास्त्र, अर्थशास्त्र आणि भाषा विषयांचे सर्वसमावेशक अध्यापन. स्पर्धा परीक्षा व पोलीस/डिफेन्स भरतीसाठी अत्यंत अनुकूल शाखा.
              </p>
              <div className="space-y-2 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0" />
                  <span>MPSC, UPSC व सरळसेवा भरती फौंडेशन</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0" />
                  <span>पोलीस व सैन्यदल भरती लेखी परीक्षा सराव</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0" />
                  <span>सामान्य ज्ञान व चालू घडामोडी नियमित चर्चासत्रे</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Defence & Physical Training Component */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-gurukul-navy-900 to-gurukul-navy-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-400 block">
                डिफेन्स ट्रेनिंग पॅटर्न (Defence & Police Pre-recruitment)
              </span>
              <h3 className="text-2xl sm:text-3xl font-black">
                १२ वी नंतर हमखास देशसेवेची संधी
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                कॉलेजच्या अभ्यासासोबतच विद्यार्थ्यांचे शारीरिक मानके (Physical Standards) परिपूर्ण करण्यासाठी माजी सैनिकांच्या मार्गदर्शनाखाली दररोज सकाळी व संध्याकाळी विशेष सराव घेतला जातो.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200 pt-2">
                <div className="flex items-center gap-2">✓ १६०० मी. / १०० मी. रनिंग ट्रॅक सराव</div>
                <div className="flex items-center gap-2">✓ लांबउडी व गोळाफेक तंत्रशुद्ध सराव</div>
                <div className="flex items-center gap-2">✓ पूल-अप्स, पुश-अप्स व रोप क्लायम्बिंग</div>
                <div className="flex items-center gap-2">✓ रायफल शूटिंग व कराटे स्वसंरक्षण तंत्र</div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 border border-white/20 p-6 rounded-2xl text-center space-y-3 backdrop-blur-sm">
              <Shield className="w-12 h-12 text-gurukul-saffron-400 mx-auto" />
              <h4 className="font-bold text-base text-white">शारीरिक व लेखी १००% तयारी</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                "बारावीनंतर वेळ वाया न घालवता थेट सरकारी नोकरी मिळवून देणारा सैनिक पॅटर्न"
              </p>
              <Link to="/admission-enquiry">
                <Button variant="primary" size="sm" className="mt-2">
                  प्रवेशासाठी संपर्क साधा
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. College Features Checklist */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h3 className="text-2xl font-black text-gurukul-navy-900 text-center">
          गुरुकुल जुनियर कॉलेजची ठळक वैशिष्ट्ये
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
          {[
            "११ वी व १२ वी सायन्स व आर्टस् शाखांसाठी थेट व पारदर्शक प्रवेश.",
            "शाळा, कॉलेज, अभ्यास, क्लास, अकॅडमी, नाष्टा, जेवण, राहणे एकाच ठिकाणी.",
            "आर्मी, पोलीस, नेव्ही, एअर फोर्स, NDA भरतीसाठी लागणारे ग्राऊंड व लेखी परीक्षेची १००% तयारी.",
            "सकाळी ५:३० ते रात्री १०:०० पर्यंतचे नियोजनबद्ध व काटेकोर वेळापत्रक.",
            "वर्गात फक्त ३० विद्यार्थी, तज्ज्ञ व समर्पित प्राध्यापक वर्ग.",
            "अद्ययावत सायन्स लॅबोरेटरी व डिजिटल क्लासरूम्सची सुविधा.",
            "मुले व मुलींसाठी स्वतंत्र, सुरक्षित व CCTV युक्त वसतिगृह.",
            "MS-CIT, Tally आणि मराठी/इंग्रजी टायपिंग संस्थेतच करण्याची सोय."
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. College Photo Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              ज्युनिअर कॉलेज फोटो (Gallery Preview)
            </span>
            <h2 className="text-2xl font-black text-gurukul-navy-900 mt-1">
              वर्ग, लॅब व मैदानी सरावाची क्षणचित्रे
            </h2>
          </div>
          <Link to="/gallery" className="text-xs font-bold text-gurukul-saffron-600 hover:underline flex items-center gap-1">
            <span>सर्व फोटो पहा</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {collegePhotos.map((img) => (
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
          title="११ वी व १२ वी आर्टस् आणि सायन्स प्रवेश सुरू!"
          subtitle="बारावी नंतर हमखास सरकारी नोकरी • सैनिक पॅटर्न निवासी तयारी • मर्यादित जागा शिल्लक"
          brochureUrl={institution.brochureUrl}
          phone={primaryPhone}
        />
      </section>
    </div>
  );
};
