import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Award, 
  Shield, 
  BookOpen, 
  GraduationCap, 
  FlaskConical, 
  Trophy, 
  Activity, 
  Monitor, 
  HeartHandshake, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Phone, 
  ArrowRight,
  LogIn,
  Home,
  Star,
  Target
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCMS } from '../contexts/CMSContext';
import { Button } from '../components/common/Button';
import { getAdminPanelUrl, getTelecallerPanelUrl } from '../services/navigation/navigationUrls';

export const StaffPage = () => {
  const { isMarathi } = useLanguage();
  const { institution } = useCMS();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const primaryPhone = institution?.phones?.[0] || '9850449800';

  // Direct Staff CRM / Login URL
  const crmUrls = {
    login: `${getAdminPanelUrl()}/login`,
    telecaller: getTelecallerPanelUrl()
  };

  const categories = [
    { id: 'all', label: isMarathi ? 'सर्व कर्मचारी (All)' : 'All Staff' },
    { id: 'leadership', label: isMarathi ? 'नेतृत्व व प्रशासन' : 'Leadership & Admin' },
    { id: 'academics', label: isMarathi ? 'शाळा व कॉलेज शिक्षक' : 'School & College Faculty' },
    { id: 'defence', label: isMarathi ? 'सैनिक व क्रीडा प्रशिक्षक' : 'Defence & Sports Coaches' },
    { id: 'competitive', label: isMarathi ? 'स्पर्धा परीक्षा अकॅडमी' : 'Competitive Exam Mentors' },
    { id: 'technical', label: isMarathi ? 'कम्प्युटर व प्रयोगशाळा' : 'IT & Lab Instructors' },
    { id: 'residential', label: isMarathi ? 'वसतिगृह व विद्यार्थी काळजी' : 'Hostel & Student Care' }
  ];

  // Official Gurukul Bhose Staff Members
  const staffMembers = [
    {
      id: 'staff-priyanka-shinde',
      category: 'academics',
      name: isMarathi ? 'प्रा. प्रियांका साहेबराव शिंदे' : 'Prof. Priyanka Sahebrao Shinde',
      role: isMarathi ? 'रसायनशास्त्र प्राध्यापिका (Faculty of Chemistry)' : 'Faculty of Chemistry (Junior College)',
      qualification: 'M.Sc. (Chem), B.Ed.',
      experience: isMarathi ? 'अनुभव - ५ वर्षे' : '5 Years Experience',
      dept: isMarathi ? 'ज्युनियर कॉलेज सायन्स (केमिस्ट्री)' : 'Junior College Science (Chemistry)',
      bio: isMarathi 
        ? 'इ. ११ वी व १२ वी सायन्स, NEET व JEE परीक्षेसाठी सखोल केमिस्ट्री मार्गदर्शन. रासायनिक समीकरणे, प्रत्यक्ष प्रयोगशाळा सराव व विद्यार्थ्यांच्या शंका निरसनावर विशेष भर.'
        : 'Dedicated Chemistry professor for 11th & 12th Science, NEET and JEE aspirants with 5 years of teaching experience. Emphasizes laboratory experiments, conceptual clarity, and dedicated student guidance.',
      specialties: [
        isMarathi ? 'रसायनशास्त्र (Chemistry)' : 'Chemistry',
        isMarathi ? '५ वर्षे अध्यापन अनुभव' : '5 Years Experience',
        isMarathi ? 'NEET / JEE सराव' : 'NEET / JEE Prep',
        isMarathi ? 'प्रायोगिक लॅब सराव' : 'Lab Experiments'
      ],
      image: '/images/staff/priyanka-shinde.png',
      icon: FlaskConical,
      accentColor: 'from-orange-500 to-amber-600'
    },
    {
      id: 'staff-mandakini-khamkar',
      category: 'technical',
      name: isMarathi ? 'मंदाकिनी विकास खामकर' : 'Mandakini Vikas Khamkar',
      role: isMarathi ? 'संगणक व IT प्रशिक्षक (IT & Computer Faculty)' : 'Faculty of Computer Science & IT',
      qualification: 'BCA (.NET & Oracle Certification)',
      experience: isMarathi ? 'अनुभव - ७ वर्षे' : '7 Years Experience',
      dept: isMarathi ? 'कम्प्युटर इन्स्टिट्यूट व IT विभाग' : 'Computer Institute & IT Lab',
      bio: isMarathi 
        ? 'संगणक शिक्षण, .NET आणि Oracle सर्टिफाइड तंत्रज्ञानाचे सखोल ज्ञान. विद्यार्थ्यांना आधुनिक संगणक लॅबमध्ये कोडिंग, सॉफ्टवेअर स्किल्स, MS-CIT व प्रॅक्टिकलचे उत्कृष्ट मार्गदर्शन.'
        : 'Experienced IT educator with 7 years of teaching experience, certified in .NET & Oracle. Committed to practical IT skills, software applications, hands-on computer labs, and digital literacy.',
      specialties: [
        isMarathi ? 'BCA (.NET & Oracle)' : 'BCA (.NET & Oracle)',
        isMarathi ? '७ वर्षे IT अनुभव' : '7 Yrs IT Experience',
        isMarathi ? 'संगणक व सॉफ्टवेअर लॅब' : 'Computer & IT Lab',
        isMarathi ? 'प्रॅक्टिकल कोडिंग प्रशिक्षण' : 'Hands-on Practice'
      ],
      image: '/images/staff/mandakini-khamkar.jpg',
      icon: Monitor,
      accentColor: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'staff-satish-jadhav',
      category: 'academics',
      name: isMarathi ? 'सतीश जगन्नाथ जाधव' : 'Satish Jagannath Jadhav',
      role: isMarathi ? 'ज्येष्ठ शिक्षक व शैक्षणिक मार्गदर्शक' : 'Senior Faculty & Academic Mentor',
      qualification: 'M.A.',
      experience: isMarathi ? 'अनुभव - २७ वर्षे' : '27 Years Experience',
      dept: isMarathi ? 'गुरुकुल विद्यामंदिर व ज्युनिअर कॉलेज' : 'Vidyamandir & Junior College',
      bio: isMarathi 
        ? '२७ वर्षांचा प्रदीर्घ व समृद्ध अध्यापन अनुभव. भाषा व सामाजिक शास्त्रे, विद्यार्थ्यांचे नैतिक संस्कार, शिस्तबद्ध अभ्यास आणि बोर्ड परीक्षेच्या उत्तम निकालासाठी सातत्यपूर्ण मार्गदर्शन.'
        : 'Distinguished senior educator with 27 years of dedicated teaching and mentorship experience. Committed to academic rigor, student discipline, moral development, and board exam excellence.',
      specialties: [
        isMarathi ? '२७ वर्षे प्रदीर्घ अनुभव' : '27 Years Experience',
        isMarathi ? 'ज्येष्ठ शैक्षणिक मार्गदर्शक' : 'Senior Academic Mentor',
        isMarathi ? 'बोर्ड निकाल गुणवत्ता' : 'Board Exam Excellence',
        isMarathi ? 'विद्यार्थी समुपदेशन' : 'Student Counseling'
      ],
      image: '/images/staff/satish-jadhav.jpg',
      icon: GraduationCap,
      accentColor: 'from-indigo-600 to-purple-600'
    }
  ];

  const filteredStaff = selectedCategory === 'all' 
    ? staffMembers 
    : staffMembers.filter(s => s.category === selectedCategory);

  return (
    <div className="bg-slate-50 min-h-screen text-left">
      {/* 1. SEO Helmet Meta */}
      <Helmet>
        <title>
          {isMarathi 
            ? 'आमचे शिक्षक व कर्मचारी (Faculty & Staff) | गुरुकुल भोसे सैनिक पॅटर्न निवासी संकुल'
            : 'Our Faculty & Staff | Gurukul Bhose Sainik Pattern Residential School'}
        </title>
        <meta 
          name="description" 
          content={isMarathi
            ? 'गुरुकुल भोसे निवासी स्कूल व जुनियर कॉलेजचे अनुभवी शिक्षक, माजी लष्करी सुभेदार, राष्ट्रीय क्रीडा प्रशिक्षक आणि समर्पित कर्मचारी वर्ग. वर्गात फक्त ३० विद्यार्थी व वैयक्तिक मार्गदर्शन.'
            : 'Meet the experienced faculty, retired Army drill instructors, national sports coaches, and dedicated residential staff of Gurukul Bhose.'}
        />
        <link rel="canonical" href="https://gurukulbhose.com/staff" />
      </Helmet>

      {/* 2. Top Header & Breadcrumb Hero */}
      <section className="relative bg-gradient-to-br from-gurukul-navy-950 via-slate-900 to-gurukul-navy-900 text-white pt-10 pb-16 sm:pb-20 overflow-hidden">
        {/* Decorative backdrop shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-gurukul-saffron-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-gurukul-saffron-400 transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'मुख्यपृष्ठ' : 'Home'}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-gurukul-saffron-400 font-semibold">
              {isMarathi ? 'शिक्षक व कर्मचारी (Staff)' : 'Faculty & Staff'}
            </span>
          </nav>

          {/* Badge & Title */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs sm:text-sm font-semibold text-gurukul-saffron-300">
              <Sparkles className="w-4 h-4 text-gurukul-saffron-400" />
              <span>
                {isMarathi ? 'अनुभवी मार्गदर्शक • माजी सैनिक प्रशिक्षक • समर्पित शिक्षकवृंद' : 'Experienced Educators • Ex-Army Drill Instructors • Dedicated Mentors'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {isMarathi ? 'आमचे शिक्षकवृंद व कर्मचारी' : 'Our Faculty, Mentors & Staff'}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-medium leading-relaxed">
              {isMarathi 
                ? 'सैनिक शिस्त, समर्पित अध्यापन आणि संस्कारांची अखंड परंपरा. वर्गात फक्त ३० विद्यार्थी आणि संध्याकाळी शिक्षकांच्या उपस्थितीत अनिवार्य अभ्यासिका (Study Hall) हेच आमच्या यशाचे गमक आहे.'
                : 'Military discipline, devoted academic instruction, and holistic character building. With just 30 students per class and daily teacher-supervised evening study halls, we shape every child for triumph.'}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link to="/admission-enquiry">
                <Button variant="primary" size="md" className="shadow-lg shadow-orange-500/25">
                  <span>{isMarathi ? 'प्रवेश अर्ज करा' : 'Apply for Admission'}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <a 
                href={crmUrls.login} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-colors"
                title={isMarathi ? 'थेट स्टाफ व शिक्षक लॉगिन' : 'Direct Staff & Faculty Login'}
              >
                <LogIn className="w-4 h-4 text-gurukul-saffron-400" />
                <span>{isMarathi ? 'स्टाफ लॉगिन पोर्टल' : 'Staff Login Portal'}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Institutional Mentorship Pillars */}
      <section className="relative -mt-8 sm:-mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/90 flex items-start gap-3.5 group hover:border-orange-300 transition-all">
            <div className="w-11 h-11 rounded-xl bg-orange-100 text-gurukul-saffron-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-black text-xl text-gurukul-navy-900 leading-tight">१:३०</span>
              <span className="block text-xs font-bold text-slate-800 mt-0.5">
                {isMarathi ? 'विद्यार्थी-शिक्षक गुणोत्तर' : 'Teacher-Student Ratio'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {isMarathi ? 'प्रत्येक विद्यार्थ्याच्या क्षमतेवर सूक्ष्म वैयक्तिक लक्ष.' : 'Individual attention to every child in class.'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/90 flex items-start gap-3.5 group hover:border-orange-300 transition-all">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-black text-xl text-gurukul-navy-900 leading-tight">
                {isMarathi ? 'माजी सैनिक' : 'Ex-Army'}
              </span>
              <span className="block text-xs font-bold text-slate-800 mt-0.5">
                {isMarathi ? 'थेट लष्करी डिफेन्स कोच' : 'Military Ground Coaches'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {isMarathi ? '४०० मी. ट्रॅक, अडथळा शर्यत व सकाळ-संध्याकाळ सराव.' : '400m track, obstacle drills and daily ground.'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/90 flex items-start gap-3.5 group hover:border-orange-300 transition-all">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-black text-xl text-gurukul-navy-900 leading-tight">
                {isMarathi ? 'दररोज संध्या.' : 'Daily Study'}
              </span>
              <span className="block text-xs font-bold text-slate-800 mt-0.5">
                {isMarathi ? 'शिक्षकांच्या देखरेखीखाली अभ्यासिका' : 'Supervised Study Hall'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {isMarathi ? 'शिक्षकांच्या उपस्थितीत डाऊट्स व स्वाध्याय सोडवणे.' : 'Faculty present to solve doubts daily.'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/90 flex items-start gap-3.5 group hover:border-orange-300 transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-black text-xl text-gurukul-navy-900 leading-tight">२४×७</span>
              <span className="block text-xs font-bold text-slate-800 mt-0.5">
                {isMarathi ? 'सुरक्षित निवासी हॉस्टेल वॉर्डन' : 'Hostel Wardens & Care'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {isMarathi ? 'मुले व मुलींसाठी स्वतंत्र, सुरक्षित व कौटुंबिक काळजी.' : 'Dedicated safe wings with family warmth.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Category Filters (Displayed when staff members are listed) */}
      {staffMembers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
                {isMarathi ? 'आमची टीम (Departments)' : 'Departments & Faculty'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-0.5">
                {isMarathi ? 'अनुभवी शिक्षक व मार्गदर्शक वर्ग' : 'Our Mentors & Department Faculty'}
              </h2>
            </div>

            {/* Quick Counter */}
            <div className="text-xs sm:text-sm font-semibold text-slate-600 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs self-start md:self-auto">
              <span>{isMarathi ? 'एकूण प्रदर्शित:' : 'Showing:'} </span>
              <span className="font-bold text-gurukul-saffron-600">{filteredStaff.length}</span>
              <span> {isMarathi ? 'कर्मचारी व मार्गदर्शक' : 'Members'}</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gurukul-navy-900 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-gurukul-saffron-600 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 5. Staff Cards Grid / Updating Soon State */}
      <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${staffMembers.length === 0 ? 'pt-12 pb-16' : 'pb-16'}`}>
        {filteredStaff.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-slate-200/90 shadow-sm max-w-2xl mx-auto space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-gurukul-saffron-600 flex items-center justify-center mx-auto shadow-xs">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {isMarathi ? 'अधिकृत शिक्षक व कर्मचारी माहिती लवकरच उपलब्ध होत आहे' : 'Official Faculty & Staff Details Updating Soon'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
                {isMarathi 
                  ? 'गुरुकुल भोसे सैनिक पॅटर्न निवासी संकुलातील सर्व शिक्षक, क्रीडा प्रशिक्षक व वसतिगृह अधीक्षकांची अधिकृत माहिती लवकरच येथे अद्ययावत केली जाईल. तात्काळ चौकशीसाठी खालील क्रमांकावर संपर्क साधावा.'
                  : 'Official teacher profiles, sports coaches, and residential administration details are currently being updated. For immediate inquiries, please reach out to our campus office.'}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <a 
                href={`tel:${primaryPhone}`} 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 text-white font-bold text-sm shadow-md transition-all hover:scale-105"
              >
                <Phone className="w-4 h-4" />
                <span>{isMarathi ? `थेट संपर्क: ${primaryPhone}` : `Call Office: ${primaryPhone}`}</span>
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all"
              >
                <span>{isMarathi ? 'कार्यालय पत्ता व वेळ' : 'Campus Contact & Hours'}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staff) => {
              const IconComponent = staff.icon || Users;
              return (
                <div 
                  key={staff.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group text-left"
                >
                  <div>
                    {/* Card Header with Top Gradient Banner */}
                    <div className={`h-3 bg-gradient-to-r ${staff.accentColor}`} />

                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Role & Avatar / Photo */}
                      <div className="flex items-start gap-4">
                        {staff.image ? (
                          <div className="w-18 h-22 sm:w-20 sm:h-24 rounded-2xl overflow-hidden border-2 border-orange-200/90 shadow-md shrink-0 group-hover:scale-105 transition-transform bg-slate-100">
                            <img 
                              src={staff.image} 
                              alt={staff.name} 
                              className="w-full h-full object-cover object-center"
                            />
                          </div>
                        ) : (
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${staff.accentColor} text-white flex items-center justify-center font-black text-xl shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                            <IconComponent className="w-7 h-7" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider text-gurukul-saffron-600 bg-orange-50 px-2.5 py-0.5 rounded-md mb-1 border border-orange-200/50">
                            {staff.dept}
                          </span>
                          <h3 className="font-black text-base sm:text-lg text-slate-900 leading-snug group-hover:text-gurukul-saffron-600 transition-colors">
                            {staff.name}
                          </h3>
                          <p className="text-xs font-bold text-gurukul-navy-900 mt-0.5">
                            {staff.role}
                          </p>
                          {staff.experience && (
                            <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1.5 border border-emerald-200/60">
                              ⏱ {staff.experience}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Qualification Pill */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 font-semibold">
                        <GraduationCap className="w-3.5 h-3.5 text-gurukul-saffron-600 shrink-0" />
                        <span className="truncate">{staff.qualification}</span>
                      </div>

                      {/* Bio / Description */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {staff.bio}
                      </p>

                      {/* Key Specialties Tags */}
                      {staff.specialties && staff.specialties.length > 0 && (
                        <div className="pt-1">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            {isMarathi ? 'प्रमुख वैशिष्ट्ये / कौशल्ये' : 'Core Focus Areas'}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {staff.specialties.map((spec, i) => (
                              <span 
                                key={i} 
                                className="text-[11px] font-semibold text-slate-700 bg-slate-100/90 hover:bg-orange-50 px-2 py-0.5 rounded-md transition-colors"
                              >
                                ✓ {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer action / quick contact */}
                  <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {isMarathi ? 'गुरुकुल भोसे संकुल' : 'Gurukul Campus'}
                    </span>
                    <a 
                      href={`tel:${primaryPhone}`}
                      className="font-bold text-gurukul-saffron-600 hover:text-gurukul-saffron-700 flex items-center gap-1 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{isMarathi ? 'माहिती विचारा' : 'Enquire'}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Why Our Faculty Makes a Difference */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
              {isMarathi ? 'अध्यापन वैशिष्ट्ये (Why Gurukul Faculty)' : 'Pedagogy & Discipline'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gurukul-navy-900 mt-1">
              {isMarathi ? 'आमच्या शिक्षकवृंदाची मुख्य वैशिष्ट्ये' : 'What Makes Our Mentorship Unique?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {isMarathi 
                ? 'केवळ पुस्तकी ज्ञान न देता विद्यार्थ्यांचे चारित्र्य, शारीरिक क्षमता आणि करिअरची दिशा निश्चित करणारे अनुभवी शिक्षक.'
                : 'Beyond standard textbooks, our faculty builds disciplined habits, robust physical stamina, and clear career trajectories.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                १
              </div>
              <h3 className="font-black text-base text-slate-900">
                {isMarathi ? 'वर्गात फक्त ३० विद्यार्थी' : 'Only 30 Students Per Class'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {isMarathi 
                  ? 'गर्दी न करता प्रत्येक विद्यार्थ्याच्या शंका, गृहपाठ आणि समजून घेण्याच्या गतीवर शिक्षकांचे थेट लक्ष असते.'
                  : 'Zero overcrowding. Faculty personally tracks homework, conceptual clarity, and individual student pace.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                २
              </div>
              <h3 className="font-black text-base text-slate-900">
                {isMarathi ? 'अनिवार्य संध्याकाळ अभ्यासिका' : 'Supervised Evening Study Hall'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {isMarathi 
                  ? 'दररोज संध्याकाळी १ तास विषय शिक्षक स्वतः उपस्थित राहून मुलांच्या सर्व शंका दूर करतात व सराव करून घेतात.'
                  : 'Subject teachers remain present every evening to resolve doubts, review notes, and supervise daily practice.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                ३
              </div>
              <h3 className="font-black text-base text-slate-900">
                {isMarathi ? 'पालकांशी थेट व पारदर्शक संवाद' : 'Direct & Transparent Parent Connect'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {isMarathi 
                  ? 'दरमहा पालक-शिक्षक सभा (PTM) आणि विद्यार्थ्यांच्या शैक्षणिक व शारीरिक प्रगतीचे साप्ताहिक व्हॉट्सॲप रिपोर्टिंग.'
                  : 'Monthly PTMs and weekly reports so parents stay continuously updated about their child\'s growth.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
        <div className="relative rounded-3xl bg-gradient-to-r from-gurukul-navy-950 to-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-400 block">
              {isMarathi ? 'प्रवेश सुरू • मर्यादित जागा' : 'Admissions Open • Limited Seats'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {isMarathi 
                ? 'आपल्या पाल्याच्या उज्ज्वल भविष्यासाठी आजच गुरुकुल भोसे परिवारात सहभागी व्हा!'
                : 'Shape Your Child\'s Bright Career with Gurukul Bhose Today!'}
            </h2>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              {isMarathi 
                ? 'इ. ५ वी ते १२ वी सैनिक पॅटर्न निवासी स्कूल व कॉलेज. कोणतीही छुपा फी नाही, थेट प्रवेश व हमखास करिअर यश.'
                : '5th to 12th Std Sainik Pattern Residential School & College. Direct admission, transparent fees, and career success.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link to="/admission-enquiry">
                <Button variant="primary" size="lg" className="shadow-lg shadow-orange-500/25">
                  <span>{isMarathi ? 'प्रवेश अर्ज करा' : 'Apply Online'}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href={`tel:${primaryPhone}`}>
                <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <Phone className="w-4 h-4 mr-2 text-gurukul-saffron-400" />
                  <span>{primaryPhone}</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StaffPage;
