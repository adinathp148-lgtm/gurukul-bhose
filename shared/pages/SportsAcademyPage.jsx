import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, Award, Download, Shield, Trophy, ArrowRight } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { CTASection } from '../components/sections/CTASection';
import { getWebsiteContent } from '../services/firestore/contentService';

export const SportsAcademyPage = () => {
  const [institution, setInstitution] = useState({});

  useEffect(() => {
    getWebsiteContent().then(res => setInstitution(res.data));
  }, []);

  const sportsDisciplines = [
    {
      title: "मैदानी सराव व रनिंग ट्रॅक (Running & Athletics)",
      desc: "४०० मीटर रनिंग ट्रॅकवर १०० मी., ४०० मी. आणि १६०० मीटर धावण्याचा दररोज सकाळ-संध्याकाळ सराव. दमछाक व तग धरून ठेवण्याची क्षमता (Stamina) वाढवणे."
    },
    {
      title: "लांबउडी व गोळाफेक (Long Jump & Shot Put)",
      desc: "पोलीस व सैन्यदल भरतीतील नियमाप्रमाणे लांबउडी खड्डा व अधिकृत वजनाच्या गोळाफेकीचे तंत्रशुद्ध प्रशिक्षण."
    },
    {
      title: "रोप क्लायम्बिंग व मलखांब (Rope Climbing & Mallakhamb)",
      desc: "हातांच्या स्नायूंना बळकटी देण्यासाठी उभ्या दोरीवर चढणे व पारंपरिक मलखांब प्रात्यक्षिके."
    },
    {
      title: "रायफल शूटिंग व धनुरविद्या (Rifle Shooting & Archery)",
      desc: "एकाग्रता व अचूक निशाणेबाजीसाठी १० मीटर एअर रायफल शूटिंग रेंज आणि धनुर्विद्या प्रशिक्षण."
    },
    {
      title: "कराटे, जुडो व किक बॉक्सिंग (Martial Arts)",
      desc: "स्वसंरक्षण, चपळता आणि मानसिक कणखरतेसाठी ब्लॅक बेल्ट प्रशिक्षकांकडून मार्शल आर्ट्स मार्गदर्शन."
    },
    {
      title: "योगा व प्राणायाम (Yoga & Meditation)",
      desc: "रोज सकाळी ५:३० वाजता ध्यानधारणा, सूर्यनमस्कार आणि प्राणायामाद्वारे मानसिक शांती व आरोग्य संवर्धन."
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title="गुरुकुल निवासी स्पोर्ट्स व डिफेन्स अकॅडमी | क्रीडा व शारीरिक प्रशिक्षण"
        description="गुरुकुल निवासी स्पोर्ट्स अकॅडमी, भोसे. ४ एकर क्रीडांगण, रनिंग ट्रॅक, रायफल शूटिंग, धनुरविद्या, कराटे व डिफेन्स फिजिकल ट्रेनिंग."
      />

      <PageHeader
        badge="सैनिक पॅटर्न शारीरिक तंदुरुस्ती"
        title="गुरुकुल निवासी स्पोर्ट्स व डिफेन्स अकॅडमी"
        subtitle="योगा, मैदानी खेळ, धावणे, लांबउडी, गोळाफेक, रोप क्लायम्बिंग, रायफल शूटिंग व डिफेन्स ट्रेनिंग"
        breadcrumbs={[{ label: 'Academies', link: '/' }, { label: 'स्पोर्ट्स अकॅडमी' }]}
      />

      {/* Main Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              ४ एकर मैदानी संकुल
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 leading-tight">
              उत्कृष्ट खेळाडू, सैनिक व अधिकारी घडवणारी क्रीडा अकॅडमी
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              गुरुकुल भोसेमध्ये शिक्षणासोबतच विद्यार्थ्यांच्या शारीरिक विकासाला सर्वोच्च प्राधान्य दिले जाते. दररोज सकाळी ५:३० ते ७:३० आणि संध्याकाळी ५:०० ते ६:३० या वेळेत सक्तीचे मैदानी प्रशिक्षण घेतले जाते.
            </p>

            <div className="space-y-2.5">
              {[
                "४ एकरमध्ये प्रशस्त रनिंग ट्रॅक व बहुउद्देशीय क्रीडांगण",
                "आर्मी, पोलीस, नेव्ही, NDA भरतीसाठी लागणाऱ्या फिजिकल टेस्टची १००% तयारी",
                "माजी लष्करी सुभेदार व राष्ट्रीय स्तरावरील क्रीडा प्रशिक्षकांचे थेट मार्गदर्शन",
                "रायफल शूटिंग व धनुरविद्या शिकण्याची स्वतंत्र सोय",
                "पोषणतज्ज्ञांच्या सल्ल्यानुसार सकस व पौष्टिक आहार",
                "क्रीडा स्पर्धांमध्ये राज्य व राष्ट्रीय स्तरावर सहभाग व पदके"
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-gurukul-saffron-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Button to="/admission-enquiry" variant="primary" size="md">
                प्रवेशासाठी संपर्क साधा
              </Button>
              <Button href={institution.brochureUrl || "https://bit.ly/3mUeaH6"} target="_blank" rel="noopener noreferrer" variant="outline" size="md">
                <Download className="w-4 h-4 mr-1.5" />
                माहिती पत्रक
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80"
                alt="गुरुकुल भोसे क्रीडांगण व सराव"
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>
                दरवर्षी शेकडो विद्यार्थी सैन्यदल, पोलीस दल व क्रीडा क्षेत्रातील शारीरिक चाचणीत पैकीच्या पैकी गुण मिळवतात.
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Sports Disciplines */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
            क्रीडा प्रकार व प्रशिक्षण
          </span>
          <h2 className="text-2xl font-black text-gurukul-navy-900 mt-1">
            गुरुकुल भोसे स्पोर्ट्स अकॅडमीमधील खेळ व उपक्रम
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sportsDisciplines.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-gurukul-saffron-600 flex items-center justify-center font-bold mb-3">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-gurukul-navy-900">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="सैनिक शिस्त, तंदुरुस्ती आणि उज्ज्वल करिअर!"
          subtitle="आपल्या पाल्याला शारीरिक व मानसिकदृष्ट्या सक्षम बनवण्यासाठी आजच गुरुकुल भोसेमध्ये प्रवेश घ्या."
          phone={institution.phones?.[0]}
          brochureUrl={institution.brochureUrl}
        />
      </section>
    </div>
  );
};
