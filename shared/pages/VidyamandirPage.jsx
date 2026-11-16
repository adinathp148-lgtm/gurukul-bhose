import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle2, 
  Download, 
  Phone, 
  BookOpen, 
  Award, 
  Users, 
  Activity, 
  Clock, 
  ArrowRight,
  Sparkles,
  School
} from 'lucide-react';

import { useCMS } from '../contexts/CMSContext';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { CTASection } from '../components/sections/CTASection';

export const VidyamandirPage = () => {
  const { institution, gallery } = useCMS();
  const primaryPhone = institution.phones?.[0] || '9850449800';

  // Filter school-related gallery images or fallback
  const schoolPhotos = gallery.slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title="गुरुकुल विद्यामंदिर, भोसे (इ. ५ वी ते १० वी) | सैनिक पॅटर्न निवासी शाळा"
        description="इ. ५ वी ते १० वी सैनिक पॅटर्न निवासी मराठी व सेमी-इंग्रजी स्कूल. स्कॉलरशिप, नवोदय, सैनिक स्कूल स्पर्धा परीक्षा तयारी, नो डोनेशन थेट प्रवेश."
        canonicalUrl="/vidyamandir"
      />

      {/* Page Header */}
      <PageHeader
        badge="इयत्ता ५ वी ते १० वी निवासी शाळा"
        title="गुरुकुल विद्यामंदिर, भोसे"
        subtitle="सैनिक पॅटर्न निवासी मराठी व सेमी माध्यम स्कूल • विद्यार्थ्यांच्या शिक्षणाचा व जीवनाचा भक्कम पाया"
        breadcrumbs={[
          { label: 'मुख्यपृष्ठ (Home)', link: '/' },
          { label: 'गुरुकुल विद्यामंदिर' }
        ]}
      />

      {/* 1. School Introduction & Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              शाळा परिचय (School Introduction)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 leading-tight">
              सर्वगुणसंपन्न विद्यार्थी घडवणारी एकमेव सैनिक पॅटर्न निवासी शाळा
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong>गुरुकुल विद्यामंदिर</strong> ही इयत्ता ५ वी ते १० वी च्या विद्यार्थ्यांसाठी चालवली जाणारी महाराष्ट्रातील एक अग्रगण्य निवासी शाळा आहे. येथे महाराष्ट्र राज्य माध्यमिक व उच्च माध्यमिक शिक्षण मंडळ (SSC Board) अभ्यासक्रमानुसार मराठी व सेमी-इंग्रजी माध्यमातून गुणवत्तापूर्ण अध्यापन केले जाते.
            </p>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              केवळ शालेय पुस्तकी ज्ञानावर अवलंबून न राहता, विद्यार्थ्यांमध्ये देशप्रेम, शिस्त, वेळेचे काटेकोर नियोजन, स्वावलंबन आणि नेतृत्वगुणांची जोपासना केली जाते.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/admission-enquiry">
                <Button variant="primary" size="md">
                  <span>प्रवेश अर्ज करा / Apply</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <a href={institution.brochureUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="md">
                  <Download className="w-4 h-4 mr-1.5" />
                  <span>माहिती पत्रक (Brochure)</span>
                </Button>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80"
                alt="गुरुकुल विद्यामंदिर विद्यार्थी"
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Educational Objectives */}
      <section className="bg-slate-50 py-14 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              शैक्षणिक उद्दिष्टे (Educational Objectives)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
              आमच्या अध्यापनाचे प्रमुख पैलू व ध्येय
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <BookOpen className="w-8 h-8 text-gurukul-saffron-600" />
              <h3 className="font-bold text-base text-slate-900">पायाभूत शिक्षण व वैयक्तिक लक्ष</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                प्रत्येक वर्गात फक्त ३० विद्यार्थी असल्यामुळे शिक्षकांचे प्रत्येक मुलावर वैयक्तिक लक्ष असते. अभ्यासात मागे पडणाऱ्या विद्यार्थ्यांसाठी स्वतंत्र मार्गदर्शन दिले जाते.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <Award className="w-8 h-8 text-blue-600" />
              <h3 className="font-bold text-base text-slate-900">स्पर्धा परीक्षांची पूर्वतयारी</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ५ वी व ८ वी शिष्यवृत्ती (Scholarship), नवोदय विद्यालय, सैनिक स्कूल (AISSEE), NMMS, NTS व SPI परीक्षांची नियमित निवासी बॅचेसद्वारे तयारी करून घेतली जाते.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <Shield className="w-8 h-8 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">सैनिक शिस्त व शारीरिक सक्षमता</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                सकाळ-संध्याकाळ मैदानी कसरत, योगा, रनिंग ट्रॅक सराव, लांबउडी आणि पीटीमुळे विद्यार्थ्यांचे आरोग्य निरोगी व मन एकाग्र राहते.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Classes and Admission Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
            इयत्ता व वर्ग रचना (Available Classes)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
            इ. ५ वी ते १० वी मराठी व सेमी-इंग्रजी माध्यम
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { standard: "इयत्ता ५ वी (Class 5th)", desc: "स्कॉलरशिप व नवोदय पूर्वतयारीची पायाभूत बॅच. स्वावलंबन व चांगल्या सवयींचे संवर्धन." },
            { standard: "इयत्ता ६ वी (Class 6th)", desc: "मूलभूत गणित व इंग्रजी संभाषण सराव. नियमित मैदानी व्यायाम व योगासने." },
            { standard: "इयत्ता ७ वी (Class 7th)", desc: "NMMS व माध्यमिक शिष्यवृत्ती पायाभरणी. विज्ञान प्रयोगांचे प्रत्यक्ष आकलन." },
            { standard: "इयत्ता ८ वी (Class 8th)", desc: "८ वी शासकीय शिष्यवृत्ती व सैनिक स्कूल परीक्षा विशेष मार्गदर्शन बॅच." },
            { standard: "इयत्ता ९ वी (Class 9th)", desc: "१० वी बोर्ड परीक्षेची पूर्वतयारी व NDA फौंडेशन लेव्हल अभ्यासक्रम." },
            { standard: "इयत्ता १० वी (Class 10th - SSC)", desc: "बोर्ड परीक्षेत हमखास १० ते १५% गुणांची वाढ, प्रश्नपत्रिका सराव व टेस्ट सिरीज." }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-gurukul-saffron-400 transition-colors">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-orange-50 text-gurukul-saffron-700 text-xs font-bold mb-3">
                <School className="w-3.5 h-3.5" />
                <span>{item.standard}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Daily Activities & Routine */}
      <section className="bg-gradient-to-br from-gurukul-navy-950 to-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-400 block">
              दैनंदिन उपक्रम व दिनचर्या
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1">
              विद्यार्थ्यांची संतुलित व कार्यक्षम दिनचर्या
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs sm:text-sm text-slate-200">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <strong className="block text-white text-base mb-2">🏃 सकाळ ५:३० - ७:३०</strong>
              रनिंग ट्रॅक सराव, लांबउडी, गोळाफेक, योगा, प्राणायाम व शारीरिक कवायत.
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <strong className="block text-white text-base mb-2">🥣 सकाळ ७:३० - ९:००</strong>
              सकस नाष्टा, आंघोळ, वैयक्तिक स्वच्छता व शालेय प्रार्थना तयारी.
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <strong className="block text-white text-base mb-2">📚 सकाळ ९:०० - ५:००</strong>
              शालेय तासिका, प्रॅक्टिकल्स, कम्प्युटर लॅब, टायपिंग व दुपारचे सकस जेवण.
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <strong className="block text-white text-base mb-2">📖 संध्या. ५:०० - १०:००</strong>
              दीड तास स्पर्धा परीक्षा वर्ग, संध्याकाळचे खेळ, रात्रीचे जेवण व अभ्यासिका.
            </div>
          </div>
        </div>
      </section>

      {/* 5. Key Highlights / Why Gurukul Vidyamandir */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-orange-50 border border-orange-200 rounded-3xl p-8 sm:p-10 space-y-6">
          <h3 className="text-xl sm:text-2xl font-black text-gurukul-navy-900">
            गुरुकुल विद्यामंदिरची ठळक वैशिष्ट्ये
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-800">
            {[
              "नो डोनेशन, टक्केवारीची अट नाही – थेट प्रवेश.",
              "प्रत्येक विद्यार्थ्यावर वैयक्तिक लक्ष – एका वर्गात फक्त ३० विद्यार्थी.",
              "१० ते १५ टक्के मुलांच्या टक्केवारीत हमखास वाढ.",
              "सकाळी ५:३० ते रात्री १०:०० पर्यंतचे नियोजनबद्ध, शिस्तबद्ध वेळापत्रक.",
              "रोज सकाळ व संध्याकाळ ग्राऊंडची तयारी (फिजिकल फिटनेस).",
              "कम्प्युटर, टायपिंग, MS-CIT संस्थेतच करण्याची सोय.",
              "मुले व मुलींसाठी स्वतंत्र, सुरक्षित व CCTV युक्त वसतिगृह.",
              "स्वादिष्ट, सकस व पौष्टिक शाकाहारी भोजन."
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-600 shrink-0 mt-0.5" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. School Gallery Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              शालेय छायाचित्रे (School Gallery)
            </span>
            <h2 className="text-2xl font-black text-gurukul-navy-900 mt-1">
              शाळा, वर्ग व दैनंदिन उपक्रमांची झलक
            </h2>
          </div>
          <Link to="/gallery" className="text-xs font-bold text-gurukul-saffron-600 hover:underline flex items-center gap-1">
            <span>सर्व फोटो पहा</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {schoolPhotos.map((img) => (
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

      {/* 7. Admission CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="इयत्ता ५ वी ते १० वी प्रवेशासाठी त्वरित नाव नोंदवा!"
          subtitle="नो डोनेशन • थेट प्रवेश • सुरक्षित वसतिगृह • सैनिक पॅटर्न निवासी शाळा"
          brochureUrl={institution.brochureUrl}
          phone={primaryPhone}
        />
      </section>
    </div>
  );
};
