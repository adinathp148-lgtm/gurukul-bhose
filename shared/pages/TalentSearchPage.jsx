import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  CheckCircle2, 
  Download, 
  BookOpen, 
  Star, 
  Target, 
  Sparkles, 
  FileText, 
  ArrowRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

import { useCMS } from '../contexts/CMSContext';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { CTASection } from '../components/sections/CTASection';

export const TalentSearchPage = () => {
  const { institution, gallery } = useCMS();
  const primaryPhone = institution.phones?.[0] || '9850449800';

  const talentPhotos = gallery.slice(0, 3);

  const programs = [
    {
      title: "शासकीय शिष्यवृत्ती परीक्षा (Scholarship Exam)",
      standard: "इयत्ता ५ वी व ८ वी",
      desc: "महाराष्ट्र राज्य परीक्षा परिषद (MSCE Pune) तर्फे आयोजित ५ वी (PUP) व ८ वी (PSS) शिष्यवृत्ती परीक्षांची सखोल निवासी तयारी.",
      features: ["मागील १० वर्षांच्या प्रश्नपत्रिकांचे विश्लेषण", "गणित व बुद्धिमत्ता शॉर्टकट ट्रिक्स", "साप्ताहिक मॉक टेस्ट सिरीज"]
    },
    {
      title: "जवाहर नवोदय विद्यालय प्रवेश परीक्षा (JNVST)",
      standard: "इयत्ता ५ वी",
      desc: "नवोदय विद्यालयातील मोफत दर्जेदार शिक्षणासाठी आवश्यक असणाऱ्या ऑल इंडिया प्रवेश परीक्षेचे विशेष निवासी कोचिंग.",
      features: ["मानसिक क्षमता चाचणी (Mental Ability) १००% सराव", "भाषा व अंकगणित सराव", "OMR शीट अचूक भरणे मार्गदर्शन"]
    },
    {
      title: "ऑल इंडिया सैनिक स्कूल प्रवेश परीक्षा (AISSEE)",
      standard: "इयत्ता ६ वी व ९ वी प्रवेश",
      desc: "देशभरातील नामांकित सैनिक शाळांमध्ये प्रवेश मिळवण्यासाठी राष्ट्रीय परीक्षा एजन्सी (NTA) द्वारे आयोजित परीक्षेची परिपूर्ण तयारी.",
      features: ["गणित, बुद्धिमत्ता व सामान्य ज्ञान सखोल सराव", "शारीरिक व वैद्यकीय प्राथमिक तपासणी", "इंग्रजी संभाषण व व्याकरण पाया"]
    },
    {
      title: "NMMS (National Means-cum-Merit Scholarship)",
      standard: "इयत्ता ८ वी",
      desc: "आर्थिक दुर्बल घटकांतील गुणवंत विद्यार्थ्यांसाठी केंद्र शासनाची ४८,०००/- रु. शिष्यवृत्ती मिळवून देणारी विशेष बॅच.",
      features: ["MAT (बौद्धिक क्षमता चाचणी) विशेष सराव", "SAT (शालेय क्षमता चाचणी) मार्गदर्शन", "हमीपूर्वक निकाल"]
    },
    {
      title: "NTS (National Talent Search Exam)",
      standard: "इयत्ता १० वी",
      desc: "राष्ट्रीय पातळीवरील अत्यंत मानाची प्रज्ञाशोध परीक्षा. उच्च शिक्षणासाठी आयुष्यभर शिष्यवृत्ती व सन्मान मिळवून देणारी तयारी.",
      features: ["स्टेट लेव्हल (Stage 1) व नॅशनल लेव्हल (Stage 2) तयारी", "उच्च दर्जाचे स्टडी मटेरियल", "तज्ज्ञ प्राध्यापकांचे मार्गदर्शन"]
    },
    {
      title: "SPI (Services Preparatory Institute) औरंगाबाद",
      standard: "इयत्ता १० वी उत्तीर्ण विद्यार्थी",
      desc: "एनडीए (NDA) मध्ये थेट लेफ्टनंट व अधिकारी बनण्यासाठी सैनिकी सेवा पूर्वशिक्षण संस्था (SPI) प्रवेशाची लेखी व मुलाखत तयारी.",
      features: ["लेखी परीक्षा सराव (गणित व इंग्रजी)", "मुलाखत (Personal Interview) तंत्र", "फिजिकल फिटनेस चाचणी सराव"]
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title="गुरुकुल निवासी टॅलेंट सर्च अकॅडमी | स्कॉलरशिप, नवोदय व सैनिक स्कूल परीक्षा"
        description="इ. ५ वी व ८ वी स्कॉलरशिप, नवोदय विद्यालय, सैनिक स्कूल (AISSEE), NMMS, NTS, SPI स्पर्धा परीक्षांची विशेष निवासी बॅच."
        canonicalUrl="/talent-search-academy"
      />

      {/* Page Header */}
      <PageHeader
        badge="विशेष निवासी स्पर्धा परीक्षा केंद्र"
        title="गुरुकुल निवासी टॅलेंट सर्च अकॅडमी"
        subtitle="स्कॉलरशिप, नवोदय विद्यालय, सैनिक स्कूल प्रवेश परीक्षा, BDS, NMMS, NTS व SPI विशेष निवासी बॅचेस"
        breadcrumbs={[
          { label: 'मुख्यपृष्ठ (Home)', link: '/' },
          { label: 'टॅलेंट सर्च अकॅडमी' }
        ]}
      />

      {/* 1. Academy Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              अकॅडमी परिचय (About Academy)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 leading-tight">
              शालेय वयातच स्पर्धा परीक्षांची भक्कम पूर्वतयारी
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong>गुरुकुल निवासी टॅलेंट सर्च अकॅडमी</strong> ही विद्यार्थ्यांच्या तार्किक, बौद्धिक आणि विश्लेषणात्मक क्षमतेला शालेय वयातच पैलू पाडणारी एक विशेष संस्था आहे. शाळेच्या नियमित पाठ्यपुस्तकीय अभ्यासासोबत दररोज १.५ तास स्पर्धा परीक्षांचे विशेष मार्गदर्शन केले जाते.
            </p>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              दरवर्षी ५ वी व ८ वी स्कॉलरशिप परीक्षेत तसेच नवोदय विद्यालय व सैनिक स्कूल प्रवेश परीक्षेत गुरुकुलचे विद्यार्थी मेरिट लिस्टमध्ये अग्रस्थानी झळकतात.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/admission-enquiry">
                <Button variant="primary" size="md">
                  <span>प्रवेशासाठी नाव नोंदवा</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <a href={institution.brochureUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="md">
                  <Download className="w-4 h-4 mr-1.5" />
                  <span>Brochure</span>
                </Button>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80"
                alt="टॅलेंट सर्च अकॅडमी विद्यार्थी"
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Programs / Exams Prepared */}
      <section className="bg-slate-50 py-14 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              तयारी केल्या जाणाऱ्या प्रमुख परीक्षा (Exams Covered)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
              राष्ट्रीय व राज्यस्तरीय शिष्यवृत्ती व प्रवेश परीक्षा
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((p, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-gurukul-saffron-700">
                      {p.standard}
                    </span>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <h3 className="font-bold text-base text-gurukul-navy-900 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {p.desc}
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link to="/admission-enquiry" className="text-xs font-bold text-gurukul-saffron-600 hover:underline flex items-center gap-1">
                    <span>या परीक्षेसाठी नोंदणी करा</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Key Benefits of Residential Talent Academy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
            निवासी अकॅडमीचे फायदे (Key Benefits)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
            गुरुकुल टॅलेंट सर्च अकॅडमीची वैशिष्ट्ये
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <BrainCircuit className="w-8 h-8 text-gurukul-saffron-500 mx-auto mb-3" />
            <h4 className="font-bold text-sm text-slate-900">बुद्धिमत्ता व तार्किक क्षमता</h4>
            <p className="text-xs text-slate-600 mt-1">शॉर्टकट युक्त्या, आकृत्यांचे विश्लेषण व जलद गणिताचा नियमित सराव.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h4 className="font-bold text-sm text-slate-900">साप्ताहिक प्रगती अहवाल</h4>
            <p className="text-xs text-slate-600 mt-1">दर शनिवारी ओएमआर (OMR) आधारित मॉक टेस्ट व पालकांना निकाल रिपोर्ट.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <BookOpen className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <h4 className="font-bold text-sm text-slate-900">समृद्ध संदर्भ ग्रंथालय</h4>
            <p className="text-xs text-slate-600 mt-1">सर्व स्पर्धा परीक्षांचे अधिकृत संदर्भ ग्रंथ, प्रश्नसंच व मासिके उपलब्ध.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <Award className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h4 className="font-bold text-sm text-slate-900">हजारो रुपयांची शिष्यवृत्ती</h4>
            <p className="text-xs text-slate-600 mt-1">शासकीय शिष्यवृत्तीधारक बनून पालकांवरील शैक्षणिक खर्चाचा भार कमी करणे.</p>
          </div>
        </div>
      </section>

      {/* 4. Gallery Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              अभ्यासिका व वर्ग फोटो (Gallery)
            </span>
            <h2 className="text-2xl font-black text-gurukul-navy-900 mt-1">
              स्पर्धा परीक्षा वर्ग व सराव परीक्षा
            </h2>
          </div>
          <Link to="/gallery" className="text-xs font-bold text-gurukul-saffron-600 hover:underline flex items-center gap-1">
            <span>सर्व फोटो पहा</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {talentPhotos.map((img) => (
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

      {/* 5. CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="टॅलेंट सर्च अकॅडमीच्या विशेष निवासी बॅचमध्ये आजच प्रवेश घ्या!"
          subtitle="स्कॉलरशिप • नवोदय विद्यालय • सैनिक स्कूल प्रवेश परीक्षा तयारी • थेट प्रवेश"
          brochureUrl={institution.brochureUrl}
          phone={primaryPhone}
        />
      </section>
    </div>
  );
};
