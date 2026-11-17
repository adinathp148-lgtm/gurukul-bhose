/**
 * Gurukul Bhose - Firestore Seeder Script
 * Pushes all initial website content, programs, courses, gallery, notices,
 * facilities, and settings into Cloud Firestore.
 * 
 * Usage:
 *   node scripts/seed-firestore.mjs
 */

import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read .env if present
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  const envLocalPath = path.join(rootDir, '.env.local');
  const targetPath = fs.existsSync(envPath) ? envPath : (fs.existsSync(envLocalPath) ? envLocalPath : null);

  if (targetPath) {
    const lines = fs.readFileSync(targetPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

// Firebase Config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'gurukulbhose.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'gurukulbhose',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'gurukulbhose.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || '',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

console.log('====================================================');
console.log('🚀 Gurukul Bhose - Cloud Firestore Database Seeder');
console.log('====================================================');
console.log(`📌 Target Project: ${firebaseConfig.projectId}`);

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('Dummy')) {
  console.warn('\n⚠️ WARNING: Valid VITE_FIREBASE_API_KEY is not found in .env!');
  console.warn('Please provide your Firebase Web credentials in .env file before running.\n');
}

// Import initial data
import {
  institutionInfo,
  heroSlides,
  programsList,
  coursesList,
  facilitiesList,
  noticesList,
  galleryList,
  videosList,
  demoLeads,
  demoCampusVisits,
  demoAdmissionApplications
} from '../shared/data/initialData.js';

async function seedDatabase() {
  const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('⏳ Seeding Website CMS and initial data to Firestore...\n');

  try {
    // 1. Website Content - Homepage
    console.log('🔹 1. Pushing website_content/homepage...');
    await setDoc(doc(db, 'website_content', 'homepage'), {
      heroSlides: heroSlides,
      welcomeSection: {
        heading: 'गुरुकुल भोसे सैनिक पॅटर्न निवासी संकुलामध्ये आपले स्वागत आहे',
        introText: 'ग्रामीण भागातील होतकरू विद्यार्थ्यांना उच्च दर्जाचे सैनिक पॅटर्न निवासी शिक्षण, शिस्त आणि स्पर्धा परीक्षांचे मार्गदर्शन देणारी सांगली जिल्ह्यातील अग्रगण्य संस्था.',
        imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
        ctaText: 'अधिक माहिती वाचा',
        ctaLink: '/about'
      },
      aboutSection: {
        title: '१५ वर्षे अखंड शैक्षणिक व सैनिक शिस्त परंपरा',
        description: 'गुरुकुल भोसे येथे इयत्ता ५ वी ते १२ वी मराठी व सेमी इंग्रजी तसेच सायन्स व आर्टस् शाखेचे निवासी शिक्षण दिले जाते.',
        vision: 'ग्रामीण व सामान्य कुटुंबातील विद्यार्थ्यांना शिस्तबद्ध सैनिक जीवनपद्धती व उच्च गुणवत्तेचे शिक्षण देणे.',
        mission: 'प्रत्येक विद्यार्थ्यामध्ये राष्ट्रप्रेम, शारीरिक क्षमता, बौद्धिक तेज आणि स्वावलंबन निर्माण करणे.'
      },
      featuredPrograms: ['vidyamandir', 'junior-college', 'talent-search', 'science-academy'],
      admissionCTA: {
        heading: 'चालू शैक्षणिक वर्षामध्ये प्रवेश सुरू आहेत',
        description: 'इयत्ता ५ वी ते १० वी आणि ११ वी - १२ वी सायन्स / आर्टस् निवासी वर्गांसाठी प्रवेश मर्यादित जागांवर सुरू.',
        buttonText: 'ऑनलाईन प्रवेश नोंदणी करा',
        buttonLink: '/admission-enquiry'
      },
      lastUpdated: serverTimestamp()
    }, { merge: true });

    // 2. About Us - Institution
    console.log('🔹 2. Pushing about_us/institution...');
    await setDoc(doc(db, 'about_us', 'institution'), {
      title: 'गुरुकुल शिक्षण संकुल, भोसे (मिरज, सांगली)',
      tagline: 'सैनिक पॅटर्न निवासी शिक्षण पद्धती',
      story: 'गुरुकुल भोसे या शैक्षणिक संकुलाची स्थापना ग्रामीण भागातील गुणवंत विद्यार्थ्यांना एकाच छताखाली दर्जेदार शिक्षण, सैनिक शिस्त आणि स्पर्धा परीक्षांचे मार्गदर्शन मिळावे या हेतूने करण्यात आली.',
      history: 'गेल्या १५ वर्षांत शेकडो विद्यार्थ्यांनी एनडीए, पोलीस, सैन्यदल तसेच वैद्यकीय व अभियांत्रिकी क्षेत्रात उज्ज्वल यश संपादन केले आहे.',
      vision: 'राष्ट्रभक्त, सुदृढ, सुविद्य आणि आत्मनिर्भर भावी नागरिक घडवणे.',
      mission: 'शिस्त, संस्कार, शारीरिक क्षमता आणि बौद्धिक गुणवत्ता यांचा सुवर्णसंगम घडवून विद्यार्थ्यांचा सर्वांगीण विकास करणे.',
      directorMessage: 'गुरुकुल भोसे मध्ये आम्ही केवळ पुस्तकी ज्ञान देत नाही, तर विद्यार्थ्यांना जीवनातील प्रत्येक आव्हानाला सामोरे जाण्यासाठी सक्षम बनवतो.',
      directorName: 'मा. संचालक / व्यवस्थापन मंडळ',
      directorDesignation: 'गुरुकुल शिक्षण संस्था, भोसे',
      achievements: [
        '१५ वर्षांची गौरवशाली सैनिक निवासी परंपरा',
        'शेकडो माजी विद्यार्थ्यांची सैन्यदल, पोलीस दल व सरकारी सेवेत निवड',
        'सैनिक स्कूल व नवोदय प्रवेश परीक्षेत उल्लेखनीय यश',
        'राज्य व राष्ट्रीय पातळीवर क्रीडा स्पर्धांमध्ये पदके'
      ],
      infrastructure: [
        '४ एकर सुरक्षित व प्रशस्त निसर्गरम्य कॅम्पस',
        'अद्ययावत भौतिकशास्त्र, रसायनशास्त्र व जीवशास्त्र प्रयोगशाळा',
        '४०० मीटर धावपट्टी, कराटे हॉल व रायफल शूटिंग रेंज',
        'स्वच्छ हॉस्टेल, सकस शाकाहारी भोजन व २४ तास सीसीटीव्ही सुरक्षा'
      ],
      counters: institutionInfo.counters,
      status: 'published',
      lastUpdated: serverTimestamp()
    }, { merge: true });

    // 3. Contact Info - General
    console.log('🔹 3. Pushing contact_info/general...');
    await setDoc(doc(db, 'contact_info', 'general'), {
      institutionName: institutionInfo.name,
      tagline: institutionInfo.tagline,
      address: institutionInfo.address,
      phones: institutionInfo.phones,
      email: institutionInfo.email,
      workingHours: institutionInfo.workingHours,
      googleMapsUrl: 'https://maps.google.com/?q=Gurukul+Bhose+Miraj',
      mapEmbedUrl: institutionInfo.mapEmbedUrl,
      whatsappNumber: '919850449800',
      facebookUrl: institutionInfo.facebookUrl,
      instagramUrl: institutionInfo.instagramUrl,
      youtubeUrl: institutionInfo.youtubeUrl,
      twitterUrl: institutionInfo.twitterUrl,
      brochureUrl: institutionInfo.brochureUrl,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    // 4. Website Settings
    console.log('🔹 4. Pushing website_settings...');
    await setDoc(doc(db, 'website_settings', 'general'), {
      websiteTitle: 'गुरुकुल भोसे | सैनिक पॅटर्न निवासी स्कूल व ज्युनिअर कॉलेज',
      tagline: 'इ. ५ वी ते १२ वी सैनिक पॅटर्न निवासी शिक्षण संकुल',
      logoUrl: '/gurukul-logo.png',
      faviconUrl: '/gurukul-logo.png',
      footerCopyright: `© ${new Date().getFullYear()} गुरुकुल भोसे. सर्व हक्क सुरक्षित. (All Rights Reserved)`,
      announcementBar: {
        enabled: false,
        text: 'चालू शैक्षणिक वर्षामध्ये मर्यादित जागांवर प्रवेश सुरू आहेत.',
        linkText: 'प्रवेश नोंदणी करा',
        linkUrl: '/admission-enquiry'
      },
      maintenanceMode: {
        enabled: false,
        message: 'वेबसाईटचे काम सुरू आहे. कृपया थोड्या वेळाने भेट द्या.'
      },
      lastUpdated: serverTimestamp()
    }, { merge: true });

    // 5. System Settings
    console.log('🔹 5. Pushing system_settings/global_config...');
    await setDoc(doc(db, 'system_settings', 'global_config'), {
      schoolNameMr: 'गुरुकुल विद्यामंदिर व ज्युनिअर कॉलेज, भोसे',
      schoolNameEn: 'Gurukul Vidyamandir & Junior College, Bhose',
      activeAcademicYear: '2026-2027',
      upcomingAcademicYear: '2027-2028',
      admissionsStatus: 'open',
      primaryPhone: '9850449800',
      officialEmail: 'contact@gurukulbhose.com',
      lastUpdated: serverTimestamp()
    }, { merge: true });

    // 6. Programs (vidyamandir, junior-college, talent-search, science-academy)
    console.log(`🔹 6. Pushing ${programsList.length} programs to 'programs' collection...`);
    for (let idx = 0; idx < programsList.length; idx++) {
      const p = programsList[idx];
      const progDoc = {
        programId: p.id,
        id: p.id,
        title: p.title,
        subtitle: p.shortDesc || '',
        shortDesc: p.shortDesc || '',
        description: p.fullDesc || '',
        fullDesc: p.fullDesc || '',
        slug: p.slug,
        category: p.category || '',
        features: p.highlights || [],
        highlights: p.highlights || [],
        imageUrl: p.image || '',
        image: p.image || '',
        displayOrder: idx + 1,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'programs', p.id), progDoc, { merge: true });
    }

    // 7. Courses
    console.log(`🔹 7. Pushing ${coursesList.length} courses to 'courses' collection...`);
    for (let idx = 0; idx < coursesList.length; idx++) {
      const c = coursesList[idx];
      const courseDoc = {
        courseId: c.id,
        id: c.id,
        name: c.title,
        title: c.title,
        programId: c.programId || 'vidyamandir',
        category: c.category || '',
        duration: c.duration || '',
        eligibility: c.eligibility || '',
        intake: c.intake || '३० जागा / वर्ग',
        description: c.description || '',
        features: c.highlights || [],
        highlights: c.highlights || [],
        curriculum: c.curriculum || [],
        imageUrl: c.image || '',
        image: c.image || '',
        displayOrder: idx + 1,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'courses', c.id), courseDoc, { merge: true });
    }

    // 8. Facilities
    console.log(`🔹 8. Pushing ${facilitiesList.length} facilities to 'facilities' collection...`);
    for (let idx = 0; idx < facilitiesList.length; idx++) {
      const f = facilitiesList[idx];
      const facDoc = {
        facilityId: f.id,
        id: f.id,
        name: f.title,
        title: f.title,
        category: f.category || 'कॅम्पस सुविधा',
        description: f.description || '',
        features: f.features || [],
        imageUrl: f.image || '',
        image: f.image || '',
        displayOrder: idx + 1,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'facilities', f.id), facDoc, { merge: true });
    }

    // 9. Gallery
    console.log(`🔹 9. Pushing ${galleryList.length} gallery items to 'gallery' collection...`);
    for (let idx = 0; idx < galleryList.length; idx++) {
      const g = galleryList[idx];
      const galDoc = {
        imageId: g.id,
        id: g.id,
        title: g.title,
        category: g.category || 'कॅम्पस',
        imageUrl: g.image,
        image: g.image,
        caption: g.title,
        displayOrder: idx + 1,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'gallery', g.id), galDoc, { merge: true });
    }

    // 10. Videos
    console.log(`🔹 10. Pushing ${videosList.length} videos to 'videos' collection...`);
    for (let idx = 0; idx < videosList.length; idx++) {
      const v = videosList[idx];
      const vidDoc = {
        videoId: v.id,
        id: v.id,
        title: v.title,
        category: v.category || 'शैक्षणिक',
        youtubeUrl: v.youtubeUrl || '',
        thumbnailUrl: v.thumbnail || '',
        duration: v.duration || '',
        displayOrder: idx + 1,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'videos', v.id), vidDoc, { merge: true });
    }

    // 11. Notices
    console.log(`🔹 11. Pushing ${noticesList.length} notices to 'notices' collection...`);
    for (let idx = 0; idx < noticesList.length; idx++) {
      const n = noticesList[idx];
      const notDoc = {
        noticeId: n.id,
        id: n.id,
        title: n.title,
        content: n.description || n.title,
        description: n.description || '',
        publishedAt: n.date || new Date().toISOString().split('T')[0],
        date: n.date || new Date().toISOString().split('T')[0],
        badge: n.badge || (n.isNew ? 'नवीन' : 'सूचना'),
        isImportant: Boolean(n.isImportant),
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'notices', n.id), notDoc, { merge: true });
    }

    // 12. Demo CRM Leads
    console.log(`🔹 12. Pushing ${demoLeads.length} sample leads to 'leads' and 'enquiries'...`);
    for (const lead of demoLeads) {
      await setDoc(doc(db, 'leads', lead.id), {
        ...lead,
        createdAt: serverTimestamp()
      }, { merge: true });
      await setDoc(doc(db, 'enquiries', lead.id), {
        ...lead,
        createdAt: serverTimestamp()
      }, { merge: true });
    }

    console.log('\n====================================================');
    console.log('✅ ALL GURUKUL BHOSE DATA SUCCESSFULLY PUSHED TO FIRESTORE!');
    console.log('====================================================');
    console.log('Collections created/updated:');
    console.log('  ✔ website_content (homepage)');
    console.log('  ✔ about_us (institution)');
    console.log('  ✔ contact_info (general)');
    console.log('  ✔ website_settings (general)');
    console.log('  ✔ system_settings (global_config)');
    console.log('  ✔ programs (4 programs)');
    console.log('  ✔ courses (10 courses)');
    console.log('  ✔ facilities (7 facilities)');
    console.log('  ✔ gallery (8 items)');
    console.log('  ✔ videos (6 videos)');
    console.log('  ✔ notices (5 notices)');
    console.log('  ✔ leads / enquiries (sample CRM leads)');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ ERROR pushing data to Firestore:', err);
    console.error('\nTips:');
    console.error('1. Verify your VITE_FIREBASE_* credentials in .env.');
    console.error('2. Ensure your Firestore Security Rules permit write access, or sign in as Admin.');
    process.exit(1);
  }
}

seedDatabase();
