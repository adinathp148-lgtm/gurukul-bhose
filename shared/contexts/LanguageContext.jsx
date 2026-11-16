import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  nav: {
    home: { mr: 'मुख्यपृष्ठ', en: 'Home' },
    about: { mr: 'आमच्याबद्दल', en: 'About Us' },
    academics: { mr: 'शैक्षणिक', en: 'Academics' },
    courses: { mr: 'अभ्यासक्रम', en: 'Courses' },
    gallery: { mr: 'गॅलरी', en: 'Gallery' },
    notices: { mr: 'सूचना पत्रक', en: 'Notices' },
    contact: { mr: 'संपर्क', en: 'Contact' },
    crm: { mr: 'CRM पोर्टल', en: 'CRM Portal' },
    brochure: { mr: 'माहिती पत्रक', en: 'Brochure' },
    enquiry: { mr: 'प्रवेश चौकशी', en: 'Admission Enquiry' },
    applyNow: { mr: 'प्रवेश नोंदणी / Apply', en: 'Apply for Admission' },
    enquiryShort: { mr: 'चौकशी', en: 'Enquiry' }
  },
  header: {
    schoolName: { mr: 'गुरुकुल भोसे', en: 'Gurukul Bhose' },
    tagline: { 
      mr: 'विद्यामंदिर व ज्युनिअर कॉलेज (सैनिक पॅटर्न निवासी)', 
      en: 'Vidyamandir & Junior College (Sainik Pattern Residential)' 
    }
  },
  hero: {
    slide1Badge: { mr: 'प्रवेश सुरू - चालू शैक्षणिक वर्ष', en: 'Admissions Open - Current Academic Year' },
    slide1Title: { mr: 'गुरुकुल विद्यामंदिर व गुरुकुल जुनियर कॉलेज, भोसे', en: 'Gurukul Vidyamandir & Junior College, Bhose' },
    slide1Subtitle: { mr: 'इ. 5 वी ते 12 वी सैनिक पॅटर्न निवासी स्कूल व कॉलेज', en: '5th to 12th Std. Sainik Pattern Residential School & College' },
    slide1Desc: { mr: 'चार एकर निसर्गरम्य सुरक्षित कॅम्पस, सैनिक शिस्त, दर्जेदार शिक्षण आणि हमखास करिअर यश.', en: '4-acre scenic safe campus, military discipline, quality education and guaranteed career success.' },
    slide2Badge: { mr: 'सैनिक पॅटर्न निवासी तयारी', en: 'Sainik Pattern Residential Preparation' },
    slide2Title: { mr: '12 वी नंतर हमखास सरकारी नोकरी व करिअर', en: 'Assured Government Jobs & Careers After 12th' },
    slide2Subtitle: { mr: 'NDA, Army, Navy, Airforce, Police, MPSC, UPSC', en: 'NDA, Army, Navy, Airforce, Police, MPSC, UPSC' },
    slide2Desc: { mr: 'शाळा व कॉलेज अभ्यासासोबत दररोज सकाळ-संध्याकाळ फिजिकल ग्राऊंड, रायफल शूटिंग आणि स्पर्धा परीक्षा वर्ग.', en: 'Daily morning and evening physical training, rifle shooting and competitive exam coaching along with schooling.' },
    slide3Badge: { mr: 'दर्जेदार निकालांची परंपरा', en: 'Proven Tradition of Academic Excellence' },
    slide3Title: { mr: 'गुरुकुल निवासी सायन्स व टॅलेंट अकॅडमी', en: 'Gurukul Residential Science & Talent Academy' },
    slide3Subtitle: { mr: 'NEET, JEE, MHT-CET, स्कॉलरशिप, नवोदय विद्यालय', en: 'NEET, JEE, MHT-CET, Scholarship, Navodaya School' },
    slide3Desc: { mr: 'प्रत्येक विद्यार्थ्यावर वैयक्तिक लक्ष, वर्गात फक्त ३० विद्यार्थी, डिजिटल लॅब व तज्ज्ञ प्राध्यापक.', en: 'Personal attention on every student, max 30 students per classroom, digital labs and veteran mentors.' },
    applyBtn: { mr: 'प्रवेश अर्ज करा / Apply', en: 'Apply for Admission' },
    brochureBtn: { mr: 'माहिती पत्रक (Brochure)', en: 'Download Brochure' },
    noDonationBadge: { mr: '✓ नो डोनेशन, थेट प्रवेश', en: '✓ No Donation, Direct Admission' },
    dailyGroundBadge: { mr: '✓ रोज सकाळ-संध्याकाळ मैदानी सराव', en: '✓ Daily Morning & Evening Ground Training' },
    defenceBadge: { mr: '✓ NDA, Army, Police भरती पूर्वतयारी', en: '✓ NDA, Army & Police Recruitment Prep' }
  },
  whyChooseUs: {
    badge: { mr: 'आमची वैशिष्ट्ये (Why Choose Gurukul Bhose)', en: 'Our Key Highlights (Why Choose Gurukul Bhose)' },
    title: { mr: 'सैनिक पॅटर्न निवासी शिक्षणाची प्रमुख वैशिष्ट्ये', en: 'Salient Features of Sainik Pattern Residential Education' },
    subtitle: { mr: 'नो डोनेशन • थेट प्रवेश • रोज सकाळ-संध्याकाळ ग्राऊंड • बारावी नंतर हमखास सरकारी नोकरी', en: 'No Donation • Direct Admission • Daily Ground Drills • Assured Government Jobs After 12th' },
    traditionBadge: { mr: '१५ वर्षांची गौरवशाली शैक्षणिक व क्रीडा परंपरा', en: '15 Years of Glorious Academic & Sports Heritage' },
    downloadBrochurePdf: { mr: 'अधिकृत माहिती पत्रक डाऊनलोड करा (PDF)', en: 'Download Official Information Brochure (PDF)' },
    features: [
      {
        mr: 'नो डोनेशन, टक्केवारीची अट नाही. ५ वी ते १०वी मराठी व सेमी तसेच ११ वी १२ वी आर्ट, सायन्सला थेट प्रवेश.',
        en: 'No donation, no percentage cut-off barrier. Direct admission to 5th–10th (Marathi & Semi) and 11th–12th (Arts & Science).'
      },
      {
        mr: 'उत्कृष्ट राहणे + नाष्टा + जेवण + कॉलेज + क्लास + अभ्यास + ग्राऊंड + स्पर्धा परीक्षा अभ्यास एकाच ठिकाणी.',
        en: 'Premium boarding + nutritional meals + college + coaching + study hall + ground sports + competitive exam prep all in one campus.'
      },
      {
        mr: '१२ वी पास झाल्यानंतर हमखास सरकारी नोकरी पूर्वतयारी.',
        en: 'Structured pre-training for guaranteed government job opportunities after passing 12th standard.'
      },
      {
        mr: '५ वी ते १० वी शाळेच्या अभ्यासासोबत स्कॉलरशिप, नवोदय विद्यालय, सैनिक स्कूल, NMMS, NTS, SPI, NDA परीक्षांची तयारी.',
        en: '5th–10th schooling integrated with Scholarship, Navodaya, Sainik School, NMMS, NTS, SPI and NDA preparation.'
      },
      {
        mr: '५ वी ते १० वी सोबत JEE, NEET, MPSC, UPSC फौंडेशन कोर्स तयारी.',
        en: 'Integrated JEE, NEET, MPSC and UPSC Foundation course mentoring right from 5th to 10th standard.'
      },
      {
        mr: '११ वी १२ वी कॉलेजच्या अभ्यासासोबत आर्मी, पोलीस, नेव्ही, एअरफोर्स, NDA परीक्षांची तयारी.',
        en: 'Pre-recruitment coaching for Army, Police, Navy, Air Force and NDA concurrently with 11th & 12th classes.'
      },
      {
        mr: 'MHT-CET, JEE, NEET परीक्षेची नियमित टेस्ट सिरीज.',
        en: 'Comprehensive periodic test series, performance benchmarking and analytics for MHT-CET, JEE and NEET.'
      },
      {
        mr: 'प्रत्येक विद्यार्थ्यावर वैयक्तिक लक्ष – एका वर्गात फक्त ३० विद्यार्थी.',
        en: 'Individual mentorship for each learner – capped strictly at 30 students per classroom.'
      },
      {
        mr: '१० ते १५ टक्के मुलांच्या टक्केवारीत हमखास वाढ.',
        en: 'Assured 10% to 15% increase in academic test scores through structured daily evening supervised self-study.'
      },
      {
        mr: 'सकाळी ५:३० ते रात्री १०:०० पर्यंतचे नियोजनबद्ध, शिस्तबद्ध वेळापत्रक.',
        en: 'Disciplined and well-balanced military-style routine running from 5:30 AM to 10:00 PM daily.'
      },
      {
        mr: 'रोज सकाळ / संध्याकाळ ग्राऊंडची तयारी (फिजिकल फिटनेस) व दीड तास स्पर्धा परीक्षा क्लास.',
        en: 'Daily mandatory morning and evening ground physical fitness plus 1.5 hours of competitive exam classroom coaching.'
      },
      {
        mr: 'कम्प्युटर, टायपिंग, MS-CIT, Tally संस्थेतच करण्याची सोय.',
        en: 'In-house certified training facilities for Computers, Marathi/English Typing, MS-CIT and Tally ERP.'
      }
    ]
  },
  academicPrograms: {
    title: { mr: 'शैक्षणिक विभाग व अकॅडमीज', en: 'Academic Programs & Academies' },
    subtitle: { mr: 'इयत्ता ५ वी ते १२ वी निवासी शिक्षण आणि विशेष स्पर्धा परीक्षा तयारी', en: 'Class 5th to 12th Residential Schooling and Specialized Exam Prep' },
    schoolSection: { mr: 'शाळा व ज्युनिअर कॉलेज', en: 'School & Junior College' },
    academiesSection: { mr: 'विशेष अकॅडमीज', en: 'Specialized Academies' },
    vidyamandir: { mr: 'गुरुकुल विद्यामंदिर', en: 'Gurukul Vidyamandir' },
    vidyamandirDesc: { mr: 'इ. ५ वी ते १० वी (मराठी व सेमी)', en: 'Std. 5th to 10th (Marathi & Semi)' },
    juniorCollege: { mr: 'गुरुकुल जुनियर कॉलेज', en: 'Gurukul Junior College' },
    juniorCollegeDesc: { mr: 'इ. ११ वी १२ वी (आर्टस् व सायन्स)', en: 'Std. 11th & 12th (Arts & Science)' },
    talentSearch: { mr: 'टॅलेंट सर्च अकॅडमी', en: 'Talent Search Academy' },
    talentSearchDesc: { mr: 'स्कॉलरशिप, नवोदय, सैनिक स्कूल', en: 'Scholarship, Navodaya, Sainik School' },
    scienceAcademy: { mr: 'सायन्स अकॅडमी', en: 'Science Academy' },
    scienceAcademyDesc: { mr: 'NEET, JEE, PCMB, NDA & CET', en: 'NEET, JEE, PCMB, NDA & CET' },
    sportsAcademy: { mr: 'स्पोर्ट्स व डिफेन्स अकॅडमी', en: 'Sports & Defence Academy' },
    sportsAcademyDesc: { mr: 'रनिंग ट्रॅक, रायफल शूटिंग, कराटे, योगा', en: 'Running Track, Rifle Shooting, Karate, Yoga' }
  },
  facilities: {
    badge: { mr: 'कॅम्पस सोयी-सुविधा', en: 'Campus Infrastructure & Facilities' },
    title: { mr: '४ एकर निसर्गरम्य व सुरक्षित शैक्षणिक संकुल', en: '4-Acre Safe, Scenic Educational Campus' },
    subtitle: { mr: 'दंडोबा डोंगर पायथ्याशी आधुनिक, प्रदूषणमुक्त व सुरक्षित निवासी वातावरण', en: 'Modern, pollution-free and highly secure residential campus at the foothills of Dandoba hills' },
    items: [
      {
        id: 'fac-1',
        title: { mr: '४ एकर सुरक्षित व निसर्गरम्य कॅम्पस', en: '4-Acre Safe & Scenic Campus' },
        desc: { mr: 'दंडोबा डोंगर पायथ्याशी वसलेले प्रशस्त, प्रदूषण विरहित व सुरक्षित शैक्षणिक संकुल. सुरक्षेसाठी २४ तास CCTV निगराणी व सुरक्षा रक्षक.', en: 'Spacious, pollution-free campus with 24-hour CCTV surveillance and security guards at Dandoba foothills.' }
      },
      {
        id: 'fac-2',
        title: { mr: 'स्वतंत्र व सुरक्षित वसतिगृह (Hostel)', en: 'Separate & Secure Hostels' },
        desc: { mr: 'मुले आणि मुलींसाठी पूर्णतः स्वतंत्र, सुरक्षित व हवेशीर खोल्या. वॉर्डन देखरेख, शुद्ध पिण्याचे पाणी (RO System) व गरम पाण्याची सोय.', en: 'Separate, airy rooms for boys & girls with warden supervision, RO water purifiers and hot water.' }
      },
      {
        id: 'fac-3',
        title: { mr: 'सकस व पौष्टिक भोजन (Mess & Dining)', en: 'Nutritious & Hygienic Dining Mess' },
        desc: { mr: 'घरगुती चवीचे, स्वच्छ व ताजे नाष्टा, दुपारचे व रात्रीचे जेवण. वाढत्या वयातील विद्यार्थ्यांसाठी प्रोटीनयुक्त व संतुलित आहार.', en: 'Homestyle, hygienic and fresh breakfast, lunch, and dinner with high-protein balanced diet for growing children.' }
      },
      {
        id: 'fac-4',
        title: { mr: 'भव्य क्रीडांगण व रनिंग ट्रॅक', en: 'Grand Sports Complex & Running Track' },
        desc: { mr: '४०० मीटर रनिंग ट्रॅक, लांबउडी खड्डा, गोळाफेक रिंग, रोप क्लायम्बिंग, रायफल शूटिंग रेंज व विविध मैदानी खेळांचे प्रशिक्षण ग्राउंड.', en: '400m running track, long jump pit, shot-put ring, obstacle rope climbing, and rifle shooting range.' }
      },
      {
        id: 'fac-5',
        title: { mr: 'सायन्स लॅब व डिजिटल कम्प्युटर इन्स्टिट्यूट', en: 'Modern Science Labs & Computer Institute' },
        desc: { mr: 'भौतिकशास्त्र, रसायनशास्त्र व जीवशास्त्र प्रयोगांसाठी अद्ययावत प्रयोगशाळा आणि आधुनिक संगणक व इंटरनेट सुविधा.', en: 'Fully equipped physics, chemistry, biology laboratories and modern computer lab with high-speed internet.' }
      },
      {
        id: 'fac-6',
        title: { mr: 'सुपरवाईज्ड अभ्यासिका व वाचनालय', en: 'Supervised Study Hall & Library' },
        desc: { mr: 'शिक्षकांच्या उपस्थितीत दररोज संध्याकाळी अनिवार्य अभ्यासिका (Study Hall), संदर्भ पुस्तके, वर्तमानपत्रे व मासिके.', en: 'Mandatory daily evening supervised study hall with teachers, extensive reference books and newspapers.' }
      }
    ]
  },
  quickForm: {
    title: { mr: 'त्वरित प्रवेश चौकशी व नोंदणी', en: 'Quick Admission Enquiry & Registration' },
    subtitle: { mr: 'चालू शैक्षणिक वर्षासाठी मर्यादित जागा. त्वरित आपला प्रवेश आरक्षित करा.', en: 'Limited seats available for current academic year. Reserve admission today.' },
    studentName: { mr: 'विद्यार्थ्याचे संपूर्ण नाव', en: "Student's Full Name" },
    parentName: { mr: 'पालकांचे नाव', en: "Parent's / Guardian's Name" },
    mobile: { mr: 'मोबाईल नंबर (WhatsApp)', en: 'Mobile Number (WhatsApp)' },
    admissionClass: { mr: 'प्रवेश घ्यावयाची इयत्ता', en: 'Seeking Admission For Class' },
    notes: { mr: 'काही विशेष माहिती किंवा प्रश्न (ऐच्छिक)', en: 'Questions or Comments (Optional)' },
    submitBtn: { mr: 'प्रवेश अर्ज सबमिट करा', en: 'Submit Admission Request' },
    submittingBtn: { mr: 'सबमिट होत आहे...', en: 'Submitting...' },
    successMsg: { mr: 'धन्यवाद! आपली चौकशी यशस्वीरित्या नोंदवली गेली आहे. आमचे समुपदेशक लवकरच संपर्क करतील.', en: 'Thank you! Your enquiry has been received. Our counselor will contact you shortly.' },
    badge: { mr: 'थेट प्रवेश सुरू', en: 'Direct Admissions Open' }
  },
  media: {
    photoGallery: { mr: 'फोटो गॅलरी', en: 'Photo Gallery' },
    photoGalleryDesc: { mr: 'कॅम्पस, स्नेहसंमेलन व उपक्रम क्षणचित्रे', en: 'Campus, Gatherings & Activities Photos' },
    videoGallery: { mr: 'व्हिडिओ गॅलरी', en: 'Video Gallery' },
    videoGalleryDesc: { mr: 'कॅम्पस टूअर, वृत्त व सांस्कृतिक व्हिडिओ', en: 'Campus Tour, News & Cultural Videos' }
  },
  common: {
    callNow: { mr: 'कॉल करा', en: 'Call Now' },
    whatsappChat: { mr: 'WhatsApp वर संपर्क करा', en: 'Chat on WhatsApp' },
    readMore: { mr: 'सविस्तर माहिती', en: 'Read More' },
    viewAll: { mr: 'सर्व पहा', en: 'View All' },
    admissionsOpen: { mr: 'प्रवेश सुरू', en: 'Admissions Open' },
    downloadBrochure: { mr: 'माहिती पत्रक डाऊनलोड करा', en: 'Download Brochure' },
    contactUs: { mr: 'संपर्क साधा', en: 'Contact Us' },
    applyOnline: { mr: 'ऑनलाईन प्रवेश नोंदणी करा', en: 'Apply for Online Admission' },
    courses: { mr: 'अभ्यासक्रम', en: 'Courses' },
    notices: { mr: 'सूचना पत्रक', en: 'Notices' },
    importantNotice: { mr: 'महत्त्वाची सूचना', en: 'Important Notice' }
  },
  footer: {
    schoolName: { mr: 'गुरुकुल भोसे', en: 'Gurukul Bhose' },
    tagline: { mr: 'विद्यामंदिर व ज्युनिअर कॉलेज', en: 'Vidyamandir & Junior College' },
    desc: { 
      mr: 'गुरुकुल विद्यामंदिर व गुरुकुल जुनियर कॉलेज, भोसे (ता. मिरज, जि. सांगली). इ. ५ वी ते १२ वी सैनिक पॅटर्न निवासी स्कूल व कॉलेज. १५ वर्षे अविरत सेवेत, शेकडो विद्यार्थी सरकारी नोकरीत कार्यरत.', 
      en: 'Gurukul Vidyamandir & Gurukul Junior College, Bhose (Miraj, Sangli). 5th to 12th Std. Sainik Pattern Residential School & College. 15 years of uninterrupted excellence with hundreds of alumni in government civil & defence services.' 
    },
    badge: { mr: 'सैनिक पॅटर्न निवासी शिक्षण', en: 'Sainik Pattern Residential Education' },
    quickLinks: { mr: 'महत्त्वाचे दुवे (Quick Links)', en: 'Quick Links' },
    contactTitle: { mr: 'कॅम्पस संपर्क (Contact)', en: 'Campus Contact' },
    address: { 
      mr: 'दंडोबा डोंगर पायथ्याला, यल्लामा मंदिर जवळ, मिरज-पंढरपूर हायवे लगत, नायरा पेट्रोल पंपाच्या मागे, भोसे, ता. मिरज, जि. सांगली.', 
      en: 'Foothills of Dandoba, Near Yallamma Temple, Miraj-Pandharpur Highway, Behind Nayara Petrol Pump, Bhose, Tal. Miraj, Dist. Sangli.' 
    },
    timing: { mr: 'सोमवार - रविवार: ९ AM - ५ PM (७ दिवस सुरू)', en: 'Monday - Sunday: 9:00 AM - 5:00 PM (Open All 7 Days)' },
    admissionNotice: { 
      mr: 'चालू शैक्षणिक वर्षामध्ये ५ वी ते १२ वी मराठी व इंग्रजी सेमी तसेच सायन्स व आर्टस् प्रवेश सुरू आहेत.', 
      en: 'Admissions are open for 5th to 12th Std. (Marathi & Semi-English Medium) and 11th-12th Science & Arts for the current academic session.' 
    },
    allRightsReserved: { mr: 'सर्व हक्क राखीव.', en: 'All rights reserved.' }
  },
  admin: {
    crmHeader: { mr: 'गुरुकुल ऍडमिशन व लीड मॅनेजमेंट CRM', en: 'Gurukul Admission & Lead CRM' },
    crmSubHeader: { mr: 'गुरुकुल विद्यामंदिर व ज्युनिअर कॉलेज, भोसे (ता. मिरज, सांगली)', en: 'Gurukul Vidyamandir & Junior College, Bhose (Miraj, Sangli)' },
    dashboard: { mr: 'डॅशबोर्ड (Dashboard)', en: 'Dashboard' },
    telecallers: { mr: 'टेलिकॉलर व्यवस्थापन (Telecallers)', en: 'Telecallers' },
    leads: { mr: 'लीड मॅनेजमेंट (Leads CRM)', en: 'Leads CRM' },
    followUps: { mr: 'फॉलो-अप व्यवस्थापन (Follow-ups)', en: 'Follow-ups' },
    admissions: { mr: 'प्रवेश यादी (Admissions)', en: 'Admissions' },
    parentComm: { mr: 'पालक संदेश (Parent Comm.)', en: 'Parent Comm.' },
    cms: { mr: 'वेबसाईट CMS (Website CMS)', en: 'Website CMS' },
    metaIntegration: { mr: 'Meta & WhatsApp API', en: 'Meta & WhatsApp API' },
    superAdmin: { mr: 'मास्टर कंट्रोल (Super Admin)', en: 'Super Admin Control' },
    switchRole: { mr: 'रोल बदला (Demo Mode):', en: 'Switch Role (Demo):' },
    openWebsite: { mr: 'शाळा वेबसाईट उघडा', en: 'Open School Website' },
    signOut: { mr: 'लॉगआउट (Sign Out)', en: 'Sign Out' },
    welcomeUser: { mr: 'स्वागत आहे', en: 'Welcome' },
    telecallerSubtitle: { mr: 'आपल्याला नेमून दिलेल्या लीड्स आणि आजचे फॉलो-अप्स खालीलप्रमाणे आहेत.', en: 'Your assigned leads and today\'s follow-ups are summarized below.' },
    adminSubtitle: { mr: 'सर्व शाखा, प्रवेश चौकशी, फॉलो-अप्स आणि टेलिकॉलर कामगिरीचा थेट आढावा.', en: 'Live overview of all branches, admission inquiries, follow-ups and counselor metrics.' },
    totalStaff: { mr: 'एकूण टेलिकॉलर्स (Staff)', en: 'Total Counselors (Staff)' },
    totalLeads: { mr: 'एकूण लीड्स (Total Leads)', en: 'Total Leads' },
    todayFollowUps: { mr: 'आजचे फॉलो-अप्स (Today)', en: 'Today\'s Follow-ups' },
    overdueCalls: { mr: 'थकबाकी कॉल्स (Overdue)', en: 'Overdue Follow-ups' },
    admittedCount: { mr: 'निश्चित प्रवेश (Admissions)', en: 'Confirmed Admissions' },
    conversionRate: { mr: 'प्रवेश रूपांतरण दर (Conversion)', en: 'Conversion Rate' },
    viewTelecallersList: { mr: 'टेलिकॉलर यादी पहा', en: 'View Counselors List' },
    callRegister: { mr: 'कॉल रजिस्टर', en: 'Call Register' }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('gurukul_language') || 'mr';
    } catch {
      return 'mr';
    }
  });

  const setLanguage = (lang) => {
    if (lang === 'mr' || lang === 'en') {
      setLanguageState(lang);
      try {
        localStorage.setItem('gurukul_language', lang);
      } catch (e) {
        console.warn('Could not save language to storage', e);
      }
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'mr' ? 'en' : 'mr');
  };

  // Dual text helper: returns mrText when Marathi, enText when English
  const dual = (mrText, enText) => {
    return language === 'mr' ? mrText : (enText || mrText);
  };

  // Helper function to resolve translated string by nested path like 'nav.home'
  const t = (path, fallback = '') => {
    if (!path) return fallback;
    const parts = path.split('.');
    let current = translations;
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part];
      } else {
        return fallback || path;
      }
    }
    if (current && typeof current === 'object' && current[language] !== undefined) {
      return current[language];
    }
    return fallback || path;
  };

  useEffect(() => {
    const isMr = language === 'mr';
    document.documentElement.lang = isMr ? 'mr' : 'en';
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.classList.add('notranslate');
    if (isMr) {
      document.documentElement.classList.add('lang-mr');
      document.documentElement.classList.remove('lang-en');
    } else {
      document.documentElement.classList.add('lang-en');
      document.documentElement.classList.remove('lang-mr');
    }
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        isMarathi: language === 'mr',
        isEnglish: language === 'en',
        setLanguage,
        toggleLanguage,
        dual,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
