import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Award, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Download, 
  GraduationCap, 
  Clock, 
  HeartHandshake,
  Compass,
  Users,
  Target,
  Sparkles,
  Building,
  Flag
} from 'lucide-react';

import { useCMS } from '../contexts/CMSContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { CTASection } from '../components/sections/CTASection';

export const AboutPage = () => {
  const { institution } = useCMS();
  const { isMarathi } = useLanguage();
  const primaryPhone = institution.phones?.[0] || '9850449800';

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title={isMarathi ? "आमच्याबद्दल (About Us) | गुरुकुल विद्यामंदिर व ज्युनिअर कॉलेज, भोसे" : "About Us | Gurukul Vidyamandir & Junior College, Bhose"}
        description={isMarathi 
          ? "गुरुकुल भोसे निवासी शिक्षण संकुलाचा १५ वर्षांचा गौरवशाली इतिहास, ध्येय, शैक्षणिक तत्त्वज्ञान, पायाभूत सुविधा व यशोगाथा."
          : "15-year glorious legacy, vision, mission, educational philosophy, campus infrastructure and achievements of Gurukul Bhose Sainik Pattern Residential Campus."}
        canonicalUrl="/about"
      />

      {/* Page Header */}
      <PageHeader
        badge={isMarathi ? 'गुरुकुल भोसे संस्था परिचय' : 'Institution Overview'}
        title={isMarathi ? 'आमच्याबद्दल (About Gurukul Bhose)' : 'About Us (Gurukul Bhose)'}
        subtitle={isMarathi 
          ? '१५ वर्षांची गौरवशाली शैक्षणिक व क्रीडा परंपरा • सैनिक पॅटर्न निवासी शिक्षण • सर्वांगीण व्यक्तिमत्त्व विकास' 
          : '15 Years of Academic & Sports Excellence • Sainik Pattern Residential School • Holistic Development'}
        breadcrumbs={[
          { label: isMarathi ? 'आमच्याबद्दल (About Us)' : 'About Us' }
        ]}
      />

      {/* 1. Institution Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              {isMarathi ? 'संस्था परिचय (Introduction)' : 'Institution Overview (Introduction)'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 leading-tight">
              {isMarathi 
                ? 'प्रत्येक विद्यार्थ्याच्या शिक्षणाचा व जीवनाचा पाया भक्कम करणारी संस्था' 
                : 'Building a Strong Foundation for Every Student\'s Education and Life'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {isMarathi ? (
                <>
                  <strong>गुरुकुल विद्यामंदिर व गुरुकुल जुनियर कॉलेज, भोसे</strong> (ता. मिरज, जि. सांगली) ही पश्चिम महाराष्ट्रातील एक अग्रगण्य व नामांकित सैनिक पॅटर्न निवासी शिक्षण संस्था आहे. मिरज-पंढरपूर राष्ट्रीय महामार्गालगत, निसर्गरम्य दंडोबा डोंगर पायथ्याशी ४ एकरच्या प्रशस्त व प्रदूषण विरहित कॅम्पसमध्ये ही संस्था कार्यरत आहे.
                </>
              ) : (
                <>
                  <strong>Gurukul Vidyamandir & Gurukul Junior College, Bhose</strong> (Tal. Miraj, Dist. Sangli) is a premier and renowned Sainik pattern residential educational institution in Western Maharashtra. Situated along the Miraj-Pandharpur National Highway, at the scenic foothills of Dandoba hills, the institution operates within a spacious and pollution-free 4-acre campus.
                </>
              )}
            </p>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {isMarathi ? (
                'येथे इयत्ता ५ वी ते १० वी (मराठी व सेमी-इंग्रजी माध्यम) आणि इयत्ता ११ वी व १२ वी (आर्टस् व सायन्स PCMB) चे निवासी शिक्षण दिले जाते. शाळा, कॉलेज, अभ्यासिका, स्पर्धा परीक्षा मार्गदर्शन, मेस, वसतिगृह आणि दररोज सकाळ-संध्याकाळ मैदानी तयारी एकाच संकुलात उपलब्ध आहे.'
              ) : (
                'Residential education is provided here for classes 5th to 10th (Marathi & Semi-English medium) and classes 11th & 12th (Arts & Science PCMB). School, junior college, study hall, competitive exam guidance, mess, hostel, and daily morning-evening ground training are all available within a single integrated campus.'
              )}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-xs font-bold text-gurukul-saffron-700">
                <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500" />
                <span>{isMarathi ? '४ एकर निसर्गरम्य परिसर' : '4-Acre Scenic Campus'}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-gurukul-navy-800">
                <CheckCircle2 className="w-4 h-4 text-gurukul-navy-600" />
                <span>{isMarathi ? '१५ वर्षे अखंड सेवा' : '15 Years of Dedicated Service'}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isMarathi ? 'नो डोनेशन, थेट प्रवेश' : 'No Donation, Direct Admission'}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80"
                alt={isMarathi ? "गुरुकुल भोसे इमारत व परिसर" : "Gurukul Bhose Campus & Building"}
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. History & Background */}
      <section className="bg-slate-50 py-14 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              {isMarathi ? 'इतिहास व पार्श्वभूमी (History & Heritage)' : 'History & Heritage'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
              {isMarathi ? '१५ वर्षांची खडतर तपश्चर्या व राष्ट्रसेवेची परंपरा' : '15 Years of Dedicated Effort & Tradition of National Service'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-700">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-gurukul-saffron-600 flex items-center justify-center font-black text-lg mb-4">
                {isMarathi ? '१' : '1'}
              </div>
              <h3 className="font-bold text-base text-gurukul-navy-900 mb-2">
                {isMarathi ? 'ग्रामीण भागात सैनिक शिस्तीची मुहूर्तमेढ' : 'Pioneering Military Discipline in Rural Education'}
              </h3>
              <p className="leading-relaxed text-slate-600">
                {isMarathi 
                  ? 'ग्रामीण भागातील विद्यार्थ्यांना आर्थिक व सामाजिक मर्यादांमुळे उच्च शिक्षणापासून व सैन्यदलातील संधींपासून वंचित राहावे लागू नये, या उदात्त हेतूने संस्थेची स्थापना करण्यात आली.'
                  : 'Established with the noble mission to ensure that rural students are never deprived of higher education and defence career opportunities due to financial or geographical barriers.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-gurukul-navy-900 flex items-center justify-center font-black text-lg mb-4">
                {isMarathi ? '२' : '2'}
              </div>
              <h3 className="font-bold text-base text-gurukul-navy-900 mb-2">
                {isMarathi ? 'स्वावलंबी व संस्कारक्षम विद्यार्थी' : 'Self-Reliant & Value-Driven Students'}
              </h3>
              <p className="leading-relaxed text-slate-600">
                {isMarathi
                  ? 'शालेय वयातच स्वतःची कामे स्वतः करणे, वेळेचे तंतोतंत पालन करणे, गुरुजनांचा व पालकांचा आदर करणे आणि स्वावलंबनाची शिकवण देणे ही संस्थेची मुख्य कार्यशैली राहिली आहे.'
                  : 'Instilling self-reliance from an early age—doing one\'s own chores, strict punctuality, respect for elders and teachers, and disciplined living.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-4">
                {isMarathi ? '३' : '3'}
              </div>
              <h3 className="font-bold text-base text-gurukul-navy-900 mb-2">
                {isMarathi ? 'शेकडो माजी विद्यार्थ्यांची देशसेवा' : 'Hundreds of Alumni Serving the Nation'}
              </h3>
              <p className="leading-relaxed text-slate-600">
                {isMarathi
                  ? 'गेल्या १५ वर्षांत शेकडो माजी विद्यार्थ्यांनी भारतीय लष्कर (Indian Army), नौदल (Navy), हवाई दल (Air Force), महाराष्ट्र पोलीस, सीआरपीएफ आणि विविध शासकीय पदांवर यशस्वी कामगिरी केली आहे.'
                  : 'Over the past 15 years, hundreds of alumni have successfully joined the Indian Army, Navy, Air Force, Maharashtra Police, CRPF, and various government administrative services.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Vision & Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-gurukul-navy-900 to-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gurukul-saffron-500/20 border border-gurukul-saffron-400/40 text-gurukul-saffron-400 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black">{isMarathi ? 'ध्येय (Our Vision)' : 'Our Vision'}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isMarathi 
                ? 'प्रत्येक विद्यार्थ्यामध्ये राष्ट्रभक्ती, सैनिक शिस्त, बौद्धिक तेज, नैतिक मूल्ये आणि शारीरिक सुदृढता निर्माण करून देशाचे एक समर्थ, जबाबदार व यशस्वी नागरिक घडवणे.'
                : 'To instill patriotism, military discipline, intellectual sharpness, moral values, and physical fitness in every student, molding them into capable, responsible, and successful citizens of India.'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-gurukul-saffron-600 to-orange-700 text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black">{isMarathi ? 'उद्दिष्टे (Our Mission)' : 'Our Mission'}</h3>
            <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
              {isMarathi 
                ? 'नो डोनेशन, थेट प्रवेश धोरणाद्वारे सर्व स्तरातील विद्यार्थ्यांना समान शैक्षणिक संधी देणे, १२ वी नंतर हमखास सरकारी नोकरी व उच्च शिक्षणासाठी सक्षम बनवणे आणि एकाच कॅम्पसमध्ये सर्व आवश्यक सुविधा पुरवणे.'
                : 'Providing equal educational opportunities through direct admission with zero donation, preparing students for guaranteed government careers and higher education after 12th, and offering all essential facilities within a single integrated campus.'}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Educational Philosophy & Daily Schedule */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
            {isMarathi ? 'शैक्षणिक तत्त्वज्ञान (Educational Philosophy)' : 'Educational Philosophy'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
            {isMarathi ? '३६०° सर्वांगीण विकास व नियोजनबद्ध दिनचर्या' : '360° Holistic Development & Structured Routine'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            {isMarathi
              ? 'शैक्षणिक, शारीरिक, मानसिक, कौटुंबिक, आर्थिक व आध्यात्मिक अशा सर्व क्षेत्राचे ज्ञान देऊन घडवला जातो आदर्श विद्यार्थी.'
              : 'Nurturing ideal students through balanced development across academic, physical, mental, moral, and spiritual dimensions.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <Clock className="w-7 h-7 text-gurukul-saffron-500 mb-3" />
            <h4 className="font-bold text-sm text-slate-900">{isMarathi ? 'सकाळ ५:३० - ७:३०' : '5:30 AM - 7:30 AM'}</h4>
            <p className="text-xs font-semibold text-gurukul-saffron-600 mt-0.5">{isMarathi ? 'जागरण व मैदानी सराव' : 'Wake-up & Ground Drills'}</p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {isMarathi
                ? 'योगासने, प्राणायाम, रनिंग ट्रॅक सराव, शारीरिक व्यायाम, कवायत व पीटी.'
                : 'Yoga, Pranayama, track running, physical conditioning, parade drill, and PT.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <HeartHandshake className="w-7 h-7 text-emerald-600 mb-3" />
            <h4 className="font-bold text-sm text-slate-900">{isMarathi ? 'सकाळ ७:३० - ९:००' : '7:30 AM - 9:00 AM'}</h4>
            <p className="text-xs font-semibold text-emerald-600 mt-0.5">{isMarathi ? 'नाष्टा व स्वच्छता' : 'Breakfast & Hygiene'}</p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {isMarathi
                ? 'सकस व पौष्टिक नाष्टा, वैयक्तिक स्वच्छता, स्नान व शालेय गणवेश तयारी.'
                : 'Nutritious breakfast, personal hygiene, bath, and school uniform inspection.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <GraduationCap className="w-7 h-7 text-blue-600 mb-3" />
            <h4 className="font-bold text-sm text-slate-900">{isMarathi ? 'सकाळी ९:०० - ५:००' : '9:00 AM - 5:00 PM'}</h4>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">{isMarathi ? 'शाळा, कॉलेज व लॅब' : 'School, College & Labs'}</p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {isMarathi
                ? 'नियमित अभ्यासक्रम, सायन्स प्रयोग, कम्प्युटर लॅब, टायपिंग व दुपारचे जेवण.'
                : 'Regular academic classes, science experiments, computer lab, typing, and lunch.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <Award className="w-7 h-7 text-amber-500 mb-3" />
            <h4 className="font-bold text-sm text-slate-900">{isMarathi ? 'संध्या. ५:०० - १०:००' : '5:00 PM - 10:00 PM'}</h4>
            <p className="text-xs font-semibold text-amber-600 mt-0.5">{isMarathi ? 'स्पर्धा परीक्षा व अभ्यासिका' : 'Competitive Exam & Study Hall'}</p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {isMarathi
                ? 'मैदानी खेळ, १.५ तास स्पर्धा परीक्षा क्लास, रात्रीचे जेवण व सुपरवाईज्ड स्टडी.'
                : 'Evening sports, 1.5-hr competitive exam coaching, dinner, and supervised night study.'}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Leadership and Management */}
      <section className="bg-slate-100 py-14 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
                {isMarathi ? 'नेतृत्व आणि व्यवस्थापन (Leadership & Management)' : 'Leadership & Management'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900">
                {isMarathi ? 'अनुभवी शिक्षणतज्ज्ञ व माजी सैनिकांचे मार्गदर्शन' : 'Guided by Experienced Educationists & Ex-Servicemen'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {isMarathi
                  ? 'गुरुकुल भोसे शिक्षण संस्थेचे नेतृत्व हे निःस्वार्थी सेवाभाव आणि शैक्षणिक ध्येयवादाने प्रेरित आहे. संस्थेच्या व्यवस्थापन मंडळामध्ये शिक्षण क्षेत्रातील तज्ज्ञ, क्रीडा प्रशिक्षक आणि माजी संरक्षण अधिकारी कार्यरत आहेत.'
                  : 'The leadership of Gurukul Bhose is driven by selfless dedication and educational idealism. The management board includes veteran educators, sports trainers, and retired defence personnel.'}
              </p>
              <div className="space-y-2 pt-2 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-600 shrink-0" />
                  <span>{isMarathi ? 'पारदर्शक व विद्यार्थी-केंद्रित प्रशासन प्रणाली' : 'Transparent & student-centric administration system'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-600 shrink-0" />
                  <span>{isMarathi ? 'प्रत्येक विद्यार्थ्याच्या शैक्षणिक प्रगतीचा पालकांशी नियमित संवाद' : 'Regular communication with parents regarding student academic progress'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-600 shrink-0" />
                  <span>{isMarathi ? 'कोणतेही छुपा डोनेशन अथवा अनावश्यक फी आकारणी नाही' : 'No hidden donations or unjustified additional fees'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg text-center space-y-4">
              <Building className="w-12 h-12 text-gurukul-navy-900 mx-auto" />
              <h3 className="font-black text-lg text-gurukul-navy-900">
                {isMarathi ? 'व्यवस्थापन वचनबद्धता' : 'Management Commitment'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                {isMarathi
                  ? '"आमच्याकडे येणारा प्रत्येक विद्यार्थी हा केवळ विद्यार्थी नसून देशाचे भविष्य आहे. त्याला सक्षम, कणखर व यशस्वी बनवणे हेच आमचे कर्तव्य आहे."'
                  : '"Every student who walks through our doors is not just a student, but the future of our nation. Making them capable, resilient, and successful is our prime duty."'}
              </p>
              <div className="pt-2">
                <a href={`tel:${primaryPhone}`}>
                  <Button variant="primary" size="sm">
                    {isMarathi ? 'संस्थेच्या व्यवस्थापनाशी संपर्क साधा' : 'Contact Institution Management'}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Achievements & Milestones */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
            {isMarathi ? 'आमची यशोगाथा (Achievements)' : 'Our Achievements'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
            {isMarathi ? 'विद्यार्थ्यांचे उल्लेखनीय यश व निकाल' : 'Remarkable Student Achievements & Results'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <Flag className="w-8 h-8 text-amber-600" />
            <h4 className="font-bold text-base text-slate-900">
              {isMarathi ? 'डिफेन्स व पोलीस भरती' : 'Defence & Police Recruitment'}
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {isMarathi
                ? 'दरवर्षी १२ वी नंतर अनेक विद्यार्थी भारतीय सैन्यदल (Army), नौदल (Navy), हवाई दल (Air Force), महाराष्ट्र पोलीस आणि निमलष्करी दलात थेट भरती होतात.'
                : 'Every year after 12th standard, many students are directly selected for Indian Army, Navy, Air Force, Maharashtra Police, and paramilitary forces.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
            <Award className="w-8 h-8 text-blue-600" />
            <h4 className="font-bold text-base text-slate-900">
              {isMarathi ? 'स्कॉलरशिप व नवोदय यश' : 'Scholarship & Navodaya Success'}
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {isMarathi
                ? '५ वी व ८ वी शासकीय शिष्यवृत्ती परीक्षा आणि नवोदय विद्यालय प्रवेश परीक्षेत सांगली जिल्ह्यातील अव्वल गुणवत्ता यादीत संस्थेच्या विद्यार्थ्यांचा समावेश.'
                : 'Gurukul students consistently rank in the top merit lists of Sangli district in 5th and 8th Std. Government Scholarship and Navodaya Vidyalaya entrance exams.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <Sparkles className="w-8 h-8 text-emerald-600" />
            <h4 className="font-bold text-base text-slate-900">
              {isMarathi ? '१० ते १५ टक्के गुणांची वाढ' : '10% to 15% Score Improvement'}
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {isMarathi
                ? 'वर्गात फक्त ३० विद्यार्थी आणि तज्ज्ञ शिक्षकांच्या वैयक्तिक मार्गदर्शनामुळे बोर्ड परीक्षांमध्ये विद्यार्थ्यांच्या टक्केवारीत लक्षणीय वाढ होते.'
                : 'With only 30 students per class and personalized mentorship from veteran educators, students achieve substantial gains in board exam percentages.'}
            </p>
          </div>
        </div>
      </section>

      {/* 7. Infrastructure Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-400 block">
              {isMarathi ? 'पायाभूत सुविधा (Campus Infrastructure)' : 'Campus Infrastructure'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1">
              {isMarathi ? 'अत्याधुनिक, सुरक्षित व सर्वसोयीयुक्त कॅम्पस' : 'Modern, Secure & Well-Equipped Campus'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-300">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <strong className="block text-white mb-1">
                {isMarathi ? '✓ ४ एकर निसर्गरम्य परिसर' : '✓ 4-Acre Scenic Campus'}
              </strong>
              {isMarathi
                ? 'दंडोबा डोंगर पायथ्याशी प्रदूषण विरहित, शांत व सुरक्षित वातावरण.'
                : 'Pollution-free, peaceful, and secure environment at the foothills of Dandoba.'}
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <strong className="block text-white mb-1">
                {isMarathi ? '✓ मुले व मुलींसाठी स्वतंत्र वसतिगृह' : '✓ Separate Hostels for Boys & Girls'}
              </strong>
              {isMarathi
                ? 'स्वच्छ, हवेशीर खोल्या, २४ तास वॉर्डन देखरेख व गरम पाण्याची सोय.'
                : 'Clean, airy rooms with 24-hour warden supervision and solar hot water facility.'}
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <strong className="block text-white mb-1">
                {isMarathi ? '✓ स्वतःचे क्रीडांगण व रनिंग ट्रॅक' : '✓ Dedicated Sports Grounds & Running Track'}
              </strong>
              {isMarathi
                ? '४०० मीटर ट्रॅक, गोळाफेक, लांबउडी, रोप क्लायम्बिंग व रायफल शूटिंग रेंज.'
                : '400m running track, shot put, long jump, obstacle rope climbing, and rifle shooting range.'}
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <strong className="block text-white mb-1">
                {isMarathi ? '✓ सुसज्ज सायन्स प्रयोगशाळा' : '✓ Well-Equipped Science Laboratories'}
              </strong>
              {isMarathi
                ? 'Physics, Chemistry व Biology चे आधुनिक प्रात्यक्षिक साहित्य.'
                : 'Modern practical equipment and apparatus for Physics, Chemistry, and Biology.'}
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <strong className="block text-white mb-1">
                {isMarathi ? '✓ कॉम्प्युटर व टायपिंग लॅब' : '✓ Computer & Typing Labs'}
              </strong>
              {isMarathi
                ? 'शासकीय मान्यताप्राप्त MS-CIT, Tally आणि मराठी/इंग्रजी टायपिंग मशिन.'
                : 'Government-recognized MS-CIT, Tally ERP, and Marathi/English typing equipment.'}
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <strong className="block text-white mb-1">
                {isMarathi ? '✓ २४ तास सीसीटीव्ही निगराणी' : '✓ 24-Hour CCTV Surveillance'}
              </strong>
              {isMarathi
                ? 'संपूर्ण कॅम्पस, वर्ग, वसतिगृह परिसर व प्रवेशद्वारांवर सुरक्षा यंत्रणा.'
                : 'Complete campus, classrooms, hostel premises, and entrance gates under round-the-clock surveillance.'}
            </div>
          </div>
        </div>
      </section>

      {/* Admission CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title={isMarathi ? "आपल्या पाल्याच्या उज्ज्वल भविष्यासाठी आजच संपर्क साधा" : "Connect with Us Today for Your Child's Bright Future"}
          subtitle={isMarathi ? "इ. ५ वी ते १२ वी सैनिक पॅटर्न निवासी स्कूल व कॉलेज • मर्यादित जागा शिल्लक" : "5th to 12th Std. Sainik Pattern Residential School & College • Limited Seats Available"}
          brochureUrl={institution.brochureUrl}
          phone={primaryPhone}
        />
      </section>
    </div>
  );
};
