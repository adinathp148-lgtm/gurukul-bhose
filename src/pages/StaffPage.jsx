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

  const staffMembers = [
    // 1. Leadership
    {
      id: 'staff-lead-1',
      category: 'leadership',
      name: isMarathi ? 'मा. संस्थापक अध्यक्ष' : 'Hon. Founder President',
      role: isMarathi ? 'संस्थापक व व्यवस्थापकीय संचालक' : 'Founder & Managing Director',
      qualification: isMarathi ? 'शिक्षण व सामाजिक क्षेत्रात २५+ वर्षे अनुभव' : '25+ Years in Education & Leadership',
      dept: isMarathi ? 'संस्था प्रशासन व धोरण' : 'Institutional Governance',
      bio: isMarathi 
        ? 'ग्रामीण भागातील सर्वसामान्य कुटुंबातील मुलांना दर्जेदार सैनिक पॅटर्न शिक्षण आणि हमखास करिअर मिळवून देण्याचा ध्यास.'
        : 'Dedicated to providing top-tier military-pattern education and disciplined career paths to rural youth.',
      specialties: [
        isMarathi ? 'संस्थात्मक धोरण' : 'Strategic Governance',
        isMarathi ? 'विद्यार्थी सर्वांगीण विकास' : 'Holistic Development',
        isMarathi ? 'पालक विश्वास' : 'Parent Trust'
      ],
      icon: Shield,
      accentColor: 'from-orange-500 to-amber-600'
    },
    {
      id: 'staff-lead-2',
      category: 'leadership',
      name: isMarathi ? 'प्रा. अनिकेत कदम' : 'Prof. Aniket Kadam',
      role: isMarathi ? 'प्राचार्य व शैक्षणिक समन्वयक' : 'Principal & Academic Coordinator',
      qualification: 'M.Sc. (Physics), B.Ed. (२०+ वर्षे अनुभव)',
      dept: isMarathi ? 'शैक्षणिक नियोजन व गुणवत्ता' : 'Academic Planning & Excellence',
      bio: isMarathi 
        ? 'इ. ५ वी ते १२ वी स्टेट बोर्ड अभ्यासक्रम, डिजिटल क्लासरूम्स आणि १००% बोर्ड निकाल परंपरेचे प्रमुख मार्गदर्शक.'
        : 'Guiding 5th to 12th state board curriculum, modern digital classrooms, and maintaining a 100% board passing record.',
      specialties: [
        isMarathi ? 'बोर्ड निकाल व्यवस्थापन' : 'Board Result Management',
        isMarathi ? 'मायक्रो-प्लॅनिंग' : 'Curriculum Micro-Planning',
        isMarathi ? 'विद्यार्थी समुपदेशन' : 'Student Counseling'
      ],
      icon: GraduationCap,
      accentColor: 'from-blue-600 to-indigo-700'
    },

    // 2. Defence & Physical Coaches
    {
      id: 'staff-def-1',
      category: 'defence',
      name: isMarathi ? 'सुभेदार आर. एस. जाधव (माजी सैनिक)' : 'Subhedar R. S. Jadhav (Retd.)',
      role: isMarathi ? 'चीफ फिजिकल व डिफेन्स इन्स्ट्रक्टर' : 'Chief Military & Physical Drill Instructor',
      qualification: isMarathi ? 'भारतीय सैन्यदल (Indian Army) २४ वर्षे सेवा पदक' : 'Indian Army Veteran (24 Yrs Service Medal)',
      dept: isMarathi ? 'सैनिक पॅटर्न, मैदानी कवायत व ग्राऊंड' : 'Sainik Pattern & Ground Drills',
      bio: isMarathi 
        ? 'रोज सकाळ-संध्याकाळ रनिंग ट्रॅक, अडथळा शर्यत (Obstacle Course), बीम, गोळाफेक आणि सैनिक शिस्तीचे थेट लष्करी प्रशिक्षण.'
        : 'Conducting intensive morning & evening 400m running drills, obstacle course training, and strict military discipline.',
      specialties: [
        isMarathi ? '४०० मी. रनिंग ट्रॅक' : '400m Track Training',
        isMarathi ? 'आर्मी व पोलीस भरती' : 'Army & Police Drills',
        isMarathi ? 'कमांडो अडथळा शर्यत' : 'Obstacle Course'
      ],
      icon: Shield,
      accentColor: 'from-emerald-600 to-teal-700'
    },
    {
      id: 'staff-def-2',
      category: 'defence',
      name: isMarathi ? 'प्रशिक्षक विक्रम पाटील' : 'Coach Vikram Patil',
      role: isMarathi ? 'राष्ट्रीय रायफल शूटिंग व धनुरविद्या प्रशिक्षक' : 'National Rifle Shooting & Archery Coach',
      qualification: isMarathi ? 'राष्ट्रीय नेमबाज व अधिकृत ISSF सर्टिफाईड कोच' : 'National Marksman & Certified ISSF Coach',
      dept: isMarathi ? 'गुरुकुल नेमबाजी व आर्चरी अकॅडमी' : 'Shooting & Archery Range',
      bio: isMarathi 
        ? '१० मीटर एअर रायफल, एअर पिस्तूल आणि धनुरविद्येचे शास्त्रोक्त प्रशिक्षण; राज्य व राष्ट्रीय स्पर्धांसाठी नेमबाज घडवणे.'
        : 'Professional coaching in 10m Air Rifle, Air Pistol, and Archery for state and national sporting competitions.',
      specialties: [
        isMarathi ? '१० मी. एअर रायफल' : '10m Air Rifle',
        isMarathi ? 'धनुरविद्या (Archery)' : 'Archery Training',
        isMarathi ? 'एकाग्रता तंत्रे' : 'Focus & Precision'
      ],
      icon: Target,
      accentColor: 'from-red-600 to-rose-700'
    },
    {
      id: 'staff-def-3',
      category: 'defence',
      name: isMarathi ? 'मास्टर सचिन कांबळे' : 'Sensei Sachin Kamble',
      role: isMarathi ? 'मार्शल आर्ट्स व कराटे मुख्य प्रशिक्षक' : 'Martial Arts & Self-Defence Instructor',
      qualification: isMarathi ? 'ब्लॅक बेल्ट ४ थी डॅन (Black Belt 4th Dan)' : 'Black Belt 4th Dan, National Referee',
      dept: isMarathi ? 'स्वसंरक्षण व कराटे अकॅडमी' : 'Self Defence & Martial Arts',
      bio: isMarathi 
        ? 'विद्यार्थ्यांमध्ये स्वसंरक्षण क्षमता, चपळता आणि मानसिक कणखरता निर्माण करण्यासाठी सक्तीचे कराटे व ज्युडो मार्गदर्शन.'
        : 'Imparting self-defence, agility, and mental resilience through disciplined Karate and Judo training.',
      specialties: [
        isMarathi ? 'कराटे बेल्ट परीक्षा' : 'Belt Grading Exams',
        isMarathi ? 'मुलींसाठी स्वसंरक्षण' : 'Girls Self-Defence',
        isMarathi ? 'किक बॉक्सिंग' : 'Kickboxing Drills'
      ],
      icon: Activity,
      accentColor: 'from-amber-600 to-orange-700'
    },

    // 3. Junior College & Academy Faculty
    {
      id: 'staff-acad-1',
      category: 'academics',
      name: isMarathi ? 'प्रा. सचिन सावंत' : 'Prof. Sachin Sawant',
      role: isMarathi ? 'भौतिकशास्त्र विभाग प्रमुख (Head of Physics)' : 'Head of Physics & NDA Faculty',
      qualification: 'M.Sc. (Physics), B.Ed., SET (१२+ वर्षे अनुभव)',
      dept: isMarathi ? 'ज्युनियर कॉलेज सायन्स व अकॅडमी' : 'Junior College Science',
      bio: isMarathi 
        ? 'NEET, JEE Mains, MHT-CET आणि NDA लेखी परीक्षेसाठी भौतिकशास्त्र संकल्पनांचे सोप्या भाषेत प्रायोगिक अध्यापन.'
        : 'Delivering conceptual and experimental Physics lectures tailored for NEET, JEE, and NDA written examinations.',
      specialties: [
        isMarathi ? 'NDA Physics' : 'NDA Physics Prep',
        isMarathi ? 'NEET / JEE न्यूमेरिकल्स' : 'NEET / JEE Numericals',
        isMarathi ? 'प्रायोगिक लॅब प्रयोग' : 'Experimental Lab Work'
      ],
      icon: FlaskConical,
      accentColor: 'from-purple-600 to-violet-700'
    },
    {
      id: 'staff-acad-2',
      category: 'academics',
      name: isMarathi ? 'प्रा. सौ. सुवर्णा मोरे' : 'Prof. Mrs. Suvarna More',
      role: isMarathi ? 'रसायनशास्त्र विभाग प्रमुख (Head of Chemistry)' : 'Head of Chemistry',
      qualification: 'M.Sc. (Organic Chemistry), B.Ed. (१०+ वर्षे अनुभव)',
      dept: isMarathi ? 'ज्युनियर कॉलेज सायन्स' : 'Junior College Science',
      bio: isMarathi 
        ? 'ऑर्गॅनिक व इनऑर्गॅनिक केमिस्ट्रीचे चार्ट्स, रिअ‍ॅक्शन मेकॅनिझम आणि सुसज्ज सायन्स लॅबमध्ये प्रत्यक्ष प्रयोग सराव.'
        : 'Specialist in reaction mechanisms, chemical formulation charts, and hands-on laboratory sessions.',
      specialties: [
        isMarathi ? 'ऑर्गॅनिक केमिस्ट्री' : 'Organic Chemistry',
        isMarathi ? 'NEET केमिस्ट्री सराव' : 'NEET Chemistry Practice',
        isMarathi ? 'लॅब सुरक्षितता' : 'Lab Experiments'
      ],
      icon: FlaskConical,
      accentColor: 'from-cyan-600 to-blue-700'
    },
    {
      id: 'staff-acad-3',
      category: 'academics',
      name: isMarathi ? 'प्रा. गणेश माने' : 'Prof. Ganesh Mane',
      role: isMarathi ? 'गणित व आकडेमोड विभाग प्रमुख (Head of Mathematics)' : 'Head of Mathematics',
      qualification: 'M.Sc. (Mathematics), B.Ed. (१४ वर्षे अनुभव)',
      dept: isMarathi ? 'गणित व स्पर्धा परीक्षा विभाग' : 'Mathematics & Analytics',
      bio: isMarathi 
        ? 'गणिताची भीती घालवून शॉर्टकट ट्रिक्स, NDA मॅथेमॅटिक्स आणि स्पीड कॅल्क्युलेशनचे प्रभावी मार्गदर्शन.'
        : 'Eliminating math anxiety with rapid shortcut tricks, NDA advanced maths, and speed arithmetic mastery.',
      specialties: [
        isMarathi ? 'NDA ३०० गुण मॅथ्स' : 'NDA 300-Mark Math',
        isMarathi ? 'स्पीड कॅल्क्युलेशन' : 'Speed Arithmetic',
        isMarathi ? 'MHT-CET शॉर्टकट्स' : 'MHT-CET Shortcuts'
      ],
      icon: BookOpen,
      accentColor: 'from-indigo-600 to-blue-700'
    },
    {
      id: 'staff-acad-4',
      category: 'academics',
      name: isMarathi ? 'प्रा. डॉ. प्रविण पाटील' : 'Dr. Pravin Patil',
      role: isMarathi ? 'जीवशास्त्र विभाग प्रमुख (Head of Biology)' : 'Head of Biology & Medical Mentor',
      qualification: 'Ph.D. / M.Sc. (Botany/Zoology), B.Ed.',
      dept: isMarathi ? 'सायन्स अकॅडमी व NEET' : 'Science Academy & NEET',
      bio: isMarathi 
        ? 'NEET ३६० गुण टार्गेट ठेवून NCERT लाईन-बाय-लाईन रिव्हिजन आणि उच्च दर्जाची डायग्रामॅटिक तयारी.'
        : 'Targeting top NEET 360-mark scores with line-by-line NCERT mastery and diagrammatic precision.',
      specialties: [
        isMarathi ? 'NEET ३६० स्कोअरिंग' : 'NEET 360 Scoring',
        isMarathi ? 'ह्युमन अ‍ॅनाटॉमी' : 'Human Anatomy',
        isMarathi ? 'मायक्रोबायोलॉजी' : 'Microbiology Concepts'
      ],
      icon: FlaskConical,
      accentColor: 'from-emerald-600 to-teal-700'
    },

    // 4. Competitive Exams & Talent Search
    {
      id: 'staff-comp-1',
      category: 'competitive',
      name: isMarathi ? 'श्री. समाधान मोहिते' : 'Mr. Samadhan Mohite',
      role: isMarathi ? 'टॅलेंट सर्च व स्कॉलरशिप प्रमुख' : 'Head of Talent Search & Scholarships',
      qualification: 'B.Sc. (Maths), B.Ed. (११ वर्षे अनुभव)',
      dept: isMarathi ? 'गुरुकुल टॅलेंट सर्च अकॅडमी' : 'Talent Search Academy',
      bio: isMarathi 
        ? '५ वी व ८ वी शासकीय शिष्यवृत्ती, नवोदय व सैनिक स्कूल प्रवेश परीक्षेत सांगली जिल्ह्यात सातत्यपूर्ण गुणवत्ता यादी निकाल.'
        : 'Guiding 5th & 8th Scholarship, Navodaya, and Sainik School aspirants with district merit list rankings.',
      specialties: [
        isMarathi ? 'शासकीय शिष्यवृत्ती' : 'Govt Scholarship Exam',
        isMarathi ? 'नवोदय प्रवेश परीक्षा' : 'Navodaya Entrance',
        isMarathi ? 'सैनिक स्कूल मॉडेल टेस्ट' : 'Sainik School Mock Tests'
      ],
      icon: Award,
      accentColor: 'from-yellow-600 to-amber-700'
    },
    {
      id: 'staff-comp-2',
      category: 'competitive',
      name: isMarathi ? 'श्री. दीपक चव्हाण' : 'Mr. Deepak Chavan',
      role: isMarathi ? 'सामान्य ज्ञान व चालू घडामोडी मार्गदर्शक' : 'General Studies & Current Affairs Faculty',
      qualification: 'M.A. (History & Pol. Sci.), M.Phil.',
      dept: isMarathi ? 'आर्टस् व डिफेन्स भरती पूर्वतयारी' : 'Defence Recruitment Prep',
      bio: isMarathi 
        ? 'पोलीस भरती, सैन्यदल भरती व सरळसेवा स्पर्धा परीक्षांसाठी दर्जेदार सामान्य ज्ञान व दैनंदिन चालू घडामोडी सराव वर्ग.'
        : 'Preparing students for Maharashtra Police, Army GD, and public service exams with dynamic GK coaching.',
      specialties: [
        isMarathi ? 'पोलीस भरती GK' : 'Police Recruitment GK',
        isMarathi ? 'भारतीय संविधान व इतिहास' : 'Constitution & History',
        isMarathi ? 'मॉक मुलाखती' : 'Mock Interviews'
      ],
      icon: Trophy,
      accentColor: 'from-amber-600 to-rose-700'
    },

    // 5. Technical & Labs
    {
      id: 'staff-tech-1',
      category: 'technical',
      name: isMarathi ? 'इंजि. राहुल शिंदे' : 'Engr. Rahul Shinde',
      role: isMarathi ? 'संगणक संस्था प्रमुख (Head of IT)' : 'Head of Computer Institute & IT Lab',
      qualification: 'B.E. (Computer Science), MS-CIT Certified Instructor',
      dept: isMarathi ? 'गुरुकुल कम्प्युटर इन्स्टिट्यूट' : 'Gurukul Computer Institute',
      bio: isMarathi 
        ? 'प्रत्येक विद्यार्थ्याला स्वतंत्र पीसी, MS-CIT, Tally ERP आणि मराठी-इंग्रजी टायपिंग शासकीय प्रमाणपत्राची हमखास तयारी.'
        : 'Overseeing modern computer labs, hands-on typing labs (GCC-TBC), Tally ERP, and MS-CIT certifications.',
      specialties: [
        isMarathi ? 'शासकीय टायपिंग कोर्स' : 'Govt Typing Courses',
        isMarathi ? 'MS-CIT व Tally' : 'MS-CIT & Tally ERP',
        isMarathi ? 'डिजिटल क्लासरूम्स' : 'Smart Digital Systems'
      ],
      icon: Monitor,
      accentColor: 'from-blue-600 to-cyan-700'
    },

    // 6. Residential & Student Care
    {
      id: 'staff-res-1',
      category: 'residential',
      name: isMarathi ? 'श्री. तानाजी पाटील' : 'Mr. Tanaji Patil',
      role: isMarathi ? 'मुख्य वसतिगृह अधीक्षक (Senior Boys Warden)' : 'Senior Boys Hostel Superintendent',
      qualification: isMarathi ? 'विद्यार्थी कल्याण व अनुशासन व्यवस्थापन' : 'Student Welfare & Discipline Administration',
      dept: isMarathi ? 'निवासी वसतिगृह संकुल' : 'Residential Hostel Complex',
      bio: isMarathi 
        ? '२४ तास सुरक्षितता, वेळेवर नाश्ता-भोजन, रात्रीची अनिवार्य अभ्यासिका आणि आजारपणात तात्काळ वैयक्तिक शुश्रूषा.'
        : 'Ensuring round-the-clock safety, hygienic dining, structured study hours, and proactive medical attention.',
      specialties: [
        isMarathi ? '२४/७ विद्यार्थी सुरक्षा' : '24/7 Student Security',
        isMarathi ? 'सैनिक शिस्तबद्ध दिनचर्या' : 'Disciplined Daily Routine',
        isMarathi ? 'आरोग्य व स्वच्छता' : 'Health & Hygiene Care'
      ],
      icon: HeartHandshake,
      accentColor: 'from-emerald-600 to-teal-700'
    },
    {
      id: 'staff-res-2',
      category: 'residential',
      name: isMarathi ? 'सौ. अलका जाधव' : 'Mrs. Alka Jadhav',
      role: isMarathi ? 'मुलींच्या वसतिगृहाच्या अधीक्षिका (Girls Hostel Matron)' : 'Girls Hostel Warden & Caretaker',
      qualification: isMarathi ? 'महिला व बाल संगोपन समुपदेशक' : 'Child Care & Residential Mentor',
      dept: isMarathi ? 'स्वतंत्र कन्या वसतिगृह' : 'Girls Residential Wing',
      bio: isMarathi 
        ? 'मुलींसाठी स्वतंत्र, सुरक्षित व कौटुंबिक वातावरणातील वसतिगृह व्यवस्था; वैयक्तिक लक्ष व आपुलकीचे मार्गदर्शन.'
        : 'Fostering a nurturing, completely secure, and home-like environment for resident female students.',
      specialties: [
        isMarathi ? 'कौटुंबिक सुरक्षित वातावरण' : 'Home-like Nurturing',
        isMarathi ? 'स्वतंत्र हॉस्टेल विंग' : 'Dedicated Safe Wing',
        isMarathi ? 'पालकांशी नियमित संवाद' : 'Regular Parent Contact'
      ],
      icon: HeartHandshake,
      accentColor: 'from-rose-600 to-pink-700'
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

      {/* 4. Interactive Category Filters */}
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

      {/* 5. Staff Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
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
                    {/* Role & Avatar */}
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${staff.accentColor} text-white flex items-center justify-center font-black text-xl shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-7 h-7" />
                      </div>
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
                      </div>
                    </div>

                    {/* Qualification Pill */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 font-medium">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
