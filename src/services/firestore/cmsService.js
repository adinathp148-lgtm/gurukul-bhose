import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  isConfigured
} from '../../firebase/config.js';

import {
  institutionInfo,
  heroSlides,
  programsList,
  coursesList,
  facilitiesList,
  noticesList,
  galleryList,
  videosList
} from '../../data/initialData.js';

/**
 * Complete CMS Data Management Service for Firestore
 * All operations support real Firestore persistence with localStorage fallback.
 * Automatically generates audit logs for any content mutation.
 */

// Helper: safe local storage read/write
const getLocal = (key, fallback) => {
  try {
    const val = localStorage.getItem(`gurukul_cms_${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

const setLocal = (key, data) => {
  try {
    localStorage.setItem(`gurukul_cms_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Local storage save error for ${key}:`, e);
  }
};

// ----------------------------------------------------
// 0. Audit Logging (content_activity_logs)
// ----------------------------------------------------
export const logCMSActivity = async ({ action, module, details, description, user }, currentUser = null) => {
  const activeUser = user || currentUser;
  const userEmail = activeUser?.email || activeUser?.name || 'Administrator';
  const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const logEntry = {
    id: logId,
    logId: logId,
    action, // 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'UNPUBLISH' | 'UPLOAD' | 'SETTINGS'
    module, // 'homepage' | 'pages' | 'about' | 'programs' | 'courses' | 'gallery' | 'videos' | 'notices' | 'facilities' | 'contact' | 'seo' | 'settings'
    details: details || description || '',
    description: description || details || '',
    performedBy: userEmail,
    userEmail: userEmail,
    role: activeUser?.role || 'admin',
    timestamp: new Date().toISOString()
  };

  // Sync to local
  const currentLogs = getLocal('activity_logs', []);
  setLocal('activity_logs', [logEntry, ...currentLogs.slice(0, 99)]);

  // Save to Firestore
  if (isConfigured && db) {
    try {
      await addDoc(collection(db, 'content_activity_logs'), {
        ...logEntry,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('[CMSService] Log write failed:', err);
    }
  }

  return logEntry;
};

export const getCMSActivityLogs = async (count = 50) => {
  if (isConfigured && db) {
    try {
      const q = query(
        collection(db, 'content_activity_logs'),
        orderBy('createdAt', 'desc'),
        firestoreLimit(count)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('[CMSService] Failed to fetch activity logs:', err);
    }
  }
  return getLocal('activity_logs', []);
};

// ----------------------------------------------------
// 1. Homepage Management
// ----------------------------------------------------
export const getHomepageCMSData = async () => {
  const defaultHomepage = {
    heroSlides: heroSlides,
    welcomeSection: {
      heading: 'गुरुकुल भोसे सैनिक पॅटर्न निवासी संकुलामध्ये आपले स्वागत आहे',
      introText: 'ग्रामीण भागातील होतकरू विद्यार्थ्यांना उच्च दर्जाचे सैनिक पॅटर्न निवासी शिक्षण, शिस्त आणि स्पर्धा परीक्षांचे मार्गदर्शन देणारी सांगली जिल्ह्यातील अग्रगण्य संस्था.',
      imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
      ctaText: 'अधिक माहिती वाचा',
      ctaLink: '/about'
    },
    welcome: {
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
    about: {
      title: '१५ वर्षे अखंड शैक्षणिक व सैनिक शिस्त परंपरा',
      description: 'गुरुकुल भोसे येथे इयत्ता ५ वी ते १२ वी मराठी व सेमी इंग्रजी तसेच सायन्स व आर्टस् शाखेचे निवासी शिक्षण दिले जाते.'
    },
    featuredPrograms: ['vidyamandir', 'junior-college', 'talent-search', 'science-academy'],
    admissionCTA: {
      heading: 'चालू शैक्षणिक वर्षामध्ये प्रवेश सुरू आहेत',
      description: 'इयत्ता ५ वी ते १० वी आणि ११ वी - १२ वी सायन्स / आर्टस् निवासी वर्गांसाठी प्रवेश मर्यादित जागांवर सुरू.',
      buttonText: 'ऑनलाईन प्रवेश नोंदणी करा',
      buttonLink: '/admission-enquiry'
    },
    status: 'published',
    updatedAt: new Date().toISOString()
  };

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'website_content', 'homepage');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...defaultHomepage, ...snap.data() };
      }
    } catch (e) {
      console.warn('[CMSService] getHomepage error:', e);
    }
  }

  return getLocal('homepage', defaultHomepage);
};

export const updateHomepageCMSData = async (updates, user) => {
  const current = await getHomepageCMSData();
  const merged = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: user?.email || 'admin'
  };

  setLocal('homepage', merged);

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'website_content', 'homepage'), {
        ...merged,
        lastModified: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('[CMSService] updateHomepage error:', e);
    }
  }

  await logCMSActivity({
    action: 'UPDATE',
    module: 'homepage',
    details: 'मुख्यपृष्ठ माहिती व बॅनर्स अद्ययावत केले (Updated homepage content)',
    user
  });

  return merged;
};

// ----------------------------------------------------
// 2. Structured Pages Management
// ----------------------------------------------------
export const initialPagesList = [
  {
    pageId: 'home',
    title: 'मुख्यपृष्ठ (Home)',
    slug: '/',
    status: 'published',
    updatedAt: '2026-03-01',
    blocks: [
      { id: 'b1', type: 'heading', content: 'गुरुकुल भोसे निवासी संकुल' },
      { id: 'b2', type: 'paragraph', content: 'सैनिक पॅटर्न निवासी शिक्षण, ५ वी ते १२ वी.' }
    ]
  },
  {
    pageId: 'about',
    title: 'आमच्याबद्दल (About Us)',
    slug: '/about',
    status: 'published',
    updatedAt: '2026-03-01',
    blocks: [
      { id: 'b1', type: 'heading', content: 'आमची शैक्षणिक परंपरा व ध्येय' },
      { id: 'b2', type: 'paragraph', content: 'गेल्या १५ वर्षांपासून शेकडो विद्यार्थ्यांचे सैनिक शाळा, एनडीए व शासकीय सेवेत निवड.' }
    ]
  },
  {
    pageId: 'vidyamandir',
    title: 'गुरुकुल विद्यामंदिर (५ वी ते १० वी)',
    slug: '/vidyamandir',
    status: 'published',
    updatedAt: '2026-03-01',
    blocks: [
      { id: 'b1', type: 'heading', content: 'माध्यमिक सैनिक पॅटर्न निवासी शिक्षण' },
      { id: 'b2', type: 'paragraph', content: 'मराठी व सेमी इंग्रजी माध्यम, स्कॉलरशिप व नवोदय विशेष बॅच.' }
    ]
  },
  {
    pageId: 'junior-college',
    title: 'गुरुकुल जुनियर कॉलेज (११ वी १२ वी)',
    slug: '/junior-college',
    status: 'published',
    updatedAt: '2026-03-01',
    blocks: [
      { id: 'b1', type: 'heading', content: 'उच्च माध्यमिक सायन्स व आर्टस् शाखा' },
      { id: 'b2', type: 'paragraph', content: 'NEET, JEE, NDA व CET विशेष निवासी मार्गदर्शन.' }
    ]
  },
  {
    pageId: 'talent-search',
    title: 'टॅलेंट सर्च अकॅडमी',
    slug: '/talent-search-academy',
    status: 'published',
    updatedAt: '2026-03-01',
    blocks: [
      { id: 'b1', type: 'heading', content: 'स्कॉलरशिप व नवोदय पूर्वतयारी' }
    ]
  },
  {
    pageId: 'science-academy',
    title: 'सायन्स अकॅडमी',
    slug: '/science-academy',
    status: 'published',
    updatedAt: '2026-03-01',
    blocks: [
      { id: 'b1', type: 'heading', content: 'NEET / JEE / NDA स्पर्धा परीक्षा तयारी' }
    ]
  },
  {
    pageId: 'sports-academy',
    title: 'स्पोर्ट्स व डिफेन्स अकॅडमी',
    slug: '/sports-academy',
    status: 'published',
    updatedAt: '2026-03-01',
    blocks: [
      { id: 'b1', type: 'heading', content: 'मैदानी कवायत, रनिंग ट्रॅक व शूटिंग' }
    ]
  },
  {
    pageId: 'contact',
    title: 'कॅम्पस संपर्क (Contact Us)',
    slug: '/contact',
    status: 'published',
    updatedAt: '2026-03-01',
    blocks: [
      { id: 'b1', type: 'heading', content: 'गुरुकुल भोसे प्रत्यक्ष भेट व संपर्क' }
    ]
  }
];

export const getCMSPages = async () => {
  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'website_pages'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ pageId: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('[CMSService] getPages error:', e);
    }
  }
  return getLocal('pages', initialPagesList);
};

export const saveCMSPage = async (pageData, user) => {
  const currentPages = await getCMSPages();
  const pageId = pageData.pageId || `page-${Date.now()}`;
  const updatedPage = {
    ...pageData,
    pageId,
    updatedAt: new Date().toISOString(),
    updatedBy: user?.email || 'admin'
  };

  const updatedList = currentPages.some(p => p.pageId === pageId)
    ? currentPages.map(p => p.pageId === pageId ? updatedPage : p)
    : [...currentPages, updatedPage];

  setLocal('pages', updatedList);

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'website_pages', pageId), {
        ...updatedPage,
        lastModified: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('[CMSService] saveCMSPage error:', e);
    }
  }

  await logCMSActivity({
    action: pageData.status === 'published' ? 'PUBLISH' : 'UPDATE',
    module: 'pages',
    details: `पेज अद्ययावत केले: ${updatedPage.title} (${pageId})`,
    user
  });

  return updatedPage;
};

// ----------------------------------------------------
// 3. About Us Editor
// ----------------------------------------------------
export const getAboutCMSData = async () => {
  const defaultAbout = {
    introduction: 'गुरुकुल भोसे हे सांगली जिल्ह्यातील मिरज तालुक्यातील भोसे येथे वसलेले एक अग्रगण्य सैनिक पॅटर्न निवासी शिक्षण संकुल आहे.',
    history: '२००९ मध्ये ग्रामीण व सामान्य कुटुंबातील विद्यार्थ्यांना शिस्तबद्ध, दर्जेदार आणि स्पर्धा परीक्षाभिमुख शिक्षण देण्याच्या उद्देशाने संस्थेची स्थापना झाली.',
    vision: 'प्रत्येक विद्यार्थ्यामध्ये राष्ट्रभक्ती, उच्च चारित्र्य, शारीरिक सुदृढता आणि उत्कृष्ट शैक्षणिक गुणवत्ता निर्माण करणे.',
    mission: 'अद्ययावत प्रयोगशाळा, अनुभवी शिक्षकवृंद, ४०० मी. धावपट्टी, रायफल शूटिंग आणि सुरक्षित निवासी वातावरणातून उज्ज्वल भविष्य घडवणे.',
    philosophy: 'प्राचीन गुरुकुल पद्धती आणि आधुनिक विज्ञान-तंत्रज्ञान यांचा सुवर्णसमन्वय साधणे.',
    leadership: [
      { name: 'संस्थापक अध्यक्ष', role: 'मार्गदर्शक', message: 'विद्यार्थ्यांचा सर्वांगीण विकास हेच आमचे अंतिम ध्येय.' },
      { name: 'मुख्याध्यापक', role: 'शैक्षणिक प्रमुख', message: 'सैनिक शिस्तीतून प्रत्येक विद्यार्थ्याचा आत्मविश्वास वाढतो.' }
    ],
    achievements: [
      '१५ वर्षे १००% निकाल परंपरा',
      'सैनिक स्कूल व नवोदय प्रवेश परीक्षेत उल्लेखनीय यश',
      'राज्य व राष्ट्रीय पातळीवर क्रीडा स्पर्धांमध्ये पदके'
    ],
    infrastructure: [
      '४ एकर सुरक्षित व प्रशस्त निसर्गरम्य कॅम्पस',
      'अद्ययावत भौतिकशास्त्र, रसायनशास्त्र व जीवशास्त्र प्रयोगशाळा',
      '४०० मीटर धावपट्टी, कराटे हॉल व रायफल शूटिंग रेंज',
      'स्वच्छ हॉस्टेल, सकस शाकाहारी भोजन व २४ तास सीसीटीव्ही सुरक्षा'
    ],
    status: 'published'
  };

  if (isConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'about_us', 'institution'));
      if (snap.exists()) {
        return { ...defaultAbout, ...snap.data() };
      }
    } catch (e) {
      console.warn('[CMSService] getAbout error:', e);
    }
  }

  return getLocal('about', defaultAbout);
};

export const updateAboutCMSData = async (updates, user) => {
  const current = await getAboutCMSData();
  const merged = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: user?.email || 'admin'
  };

  setLocal('about', merged);

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'about_us', 'institution'), {
        ...merged,
        lastModified: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('[CMSService] updateAbout error:', e);
    }
  }

  await logCMSActivity({
    action: 'UPDATE',
    module: 'about',
    details: 'आमच्याबद्दल (About Us) माहिती अद्ययावत केली',
    user
  });

  return merged;
};

// ----------------------------------------------------
// 3B. Educational Programs Management
// ----------------------------------------------------
export const getCMSPrograms = async () => {
  if (isConfigured && db) {
    try {
      const snap = await getDocs(query(collection(db, 'programs'), orderBy('displayOrder', 'asc')));
      if (!snap.empty) {
        return snap.docs.map(d => ({ programId: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('[CMSService] getPrograms error:', e);
    }
  }
  return getLocal('programs', programsList.map((p, idx) => ({
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
    status: 'published'
  })));
};

export const saveCMSProgram = async (programData, user) => {
  const current = await getCMSPrograms();
  const programId = programData.programId || programData.id || `prog_${Date.now()}`;
  const updatedProgram = {
    ...programData,
    programId,
    id: programId,
    status: programData.status || 'published',
    displayOrder: Number(programData.displayOrder) || 1,
    updatedAt: new Date().toISOString(),
    updatedBy: user?.email || 'admin'
  };

  const updatedList = current.some(p => p.programId === programId || p.id === programId)
    ? current.map(p => (p.programId === programId || p.id === programId) ? updatedProgram : p)
    : [...current, updatedProgram];

  setLocal('programs', updatedList);

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'programs', programId), {
        ...updatedProgram,
        lastModified: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('[CMSService] saveProgram error:', e);
    }
  }

  await logCMSActivity({
    action: current.some(p => p.programId === programId || p.id === programId) ? 'UPDATE' : 'CREATE',
    module: 'programs',
    details: `शैक्षणिक विभाग अद्ययावत केला: ${updatedProgram.title} (${programId})`,
    user
  });

  return updatedProgram;
};

export const deleteCMSProgram = async (programId, user) => {
  const current = await getCMSPrograms();
  const progToDelete = current.find(p => p.programId === programId || p.id === programId);
  const updatedList = current.filter(p => p.programId !== programId && p.id !== programId);
  setLocal('programs', updatedList);

  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, 'programs', programId));
    } catch (e) {
      console.warn('[CMSService] deleteProgram error:', e);
    }
  }

  await logCMSActivity({
    action: 'DELETE',
    module: 'programs',
    details: `शैक्षणिक विभाग हटवला: ${progToDelete?.title || programId}`,
    user
  });

  return true;
};

// ----------------------------------------------------
// 4. Courses Management
// ----------------------------------------------------
export const getCMSCourses = async () => {
  if (isConfigured && db) {
    try {
      const snap = await getDocs(query(collection(db, 'courses'), orderBy('displayOrder', 'asc')));
      if (!snap.empty) {
        return snap.docs.map(d => ({ courseId: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('[CMSService] getCourses error:', e);
    }
  }
  return getLocal('courses', coursesList.map(c => ({ courseId: c.id, ...c, status: 'published' })));
};

export const saveCMSCourse = async (courseData, user) => {
  const current = await getCMSCourses();
  const courseId = courseData.courseId || `course-${Date.now()}`;
  
  // Auto-generate clean slug if not given
  let baseSlug = courseData.slug || courseData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  if (!baseSlug.startsWith('/courses/')) {
    baseSlug = `/courses/${baseSlug.replace(/^\//, '')}`;
  }

  // Prevent duplicate slugs across different courses
  let slug = baseSlug;
  let counter = 1;
  while (current.some(c => c.courseId !== courseId && c.slug === slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  const updatedCourse = {
    ...courseData,
    courseId,
    slug,
    status: courseData.status || 'published',
    displayOrder: Number(courseData.displayOrder) || 1,
    updatedAt: new Date().toISOString(),
    updatedBy: user?.email || 'admin'
  };

  const updatedList = current.some(c => c.courseId === courseId)
    ? current.map(c => c.courseId === courseId ? updatedCourse : c)
    : [...current, updatedCourse];

  setLocal('courses', updatedList);

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'courses', courseId), {
        ...updatedCourse,
        lastModified: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('[CMSService] saveCourse error:', e);
    }
  }

  await logCMSActivity({
    action: current.some(c => c.courseId === courseId) ? 'UPDATE' : 'CREATE',
    module: 'courses',
    details: `कोर्स सेव्ह केला: ${updatedCourse.title} (${slug})`,
    user
  });

  return updatedCourse;
};

export const deleteCMSCourse = async (courseId, user) => {
  const current = await getCMSCourses();
  const courseToDelete = current.find(c => c.courseId === courseId);
  const updatedList = current.filter(c => c.courseId !== courseId);
  setLocal('courses', updatedList);

  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, 'courses', courseId));
    } catch (e) {
      console.warn('[CMSService] deleteCourse error:', e);
    }
  }

  await logCMSActivity({
    action: 'DELETE',
    module: 'courses',
    details: `कोर्स हटवला: ${courseToDelete?.title || courseId}`,
    user
  });

  return true;
};

// ----------------------------------------------------
// 5. Gallery Management
// ----------------------------------------------------
export const getCMSGallery = async () => {
  if (isConfigured && db) {
    try {
      const snap = await getDocs(query(collection(db, 'gallery'), orderBy('displayOrder', 'asc')));
      if (!snap.empty) {
        return snap.docs.map(d => ({ imageId: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('[CMSService] getGallery error:', e);
    }
  }
  return getLocal('gallery_items', galleryList.map((g, idx) => ({
    imageId: g.id || `gal-${idx}`,
    title: g.title,
    caption: g.title,
    category: g.category || 'activities',
    imageUrl: g.imageUrl,
    displayOrder: idx + 1,
    status: 'published'
  })));
};

export const saveCMSGalleryItem = async (itemData, user) => {
  const current = await getCMSGallery();
  const imageId = itemData.imageId || `gal-${Date.now()}`;
  const updatedItem = {
    ...itemData,
    imageId,
    status: itemData.status || 'published',
    displayOrder: Number(itemData.displayOrder) || 1,
    updatedAt: new Date().toISOString()
  };

  const updatedList = current.some(g => g.imageId === imageId)
    ? current.map(g => g.imageId === imageId ? updatedItem : g)
    : [updatedItem, ...current];

  setLocal('gallery_items', updatedList);

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'gallery', imageId), {
        ...updatedItem,
        lastModified: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('[CMSService] saveGallery error:', e);
    }
  }

  await logCMSActivity({
    action: current.some(g => g.imageId === imageId) ? 'UPDATE' : 'CREATE',
    module: 'gallery',
    details: `गॅलरी फोटो अद्ययावत केला: ${updatedItem.title}`,
    user
  });

  return updatedItem;
};

export const deleteCMSGalleryItem = async (imageId, user) => {
  const current = await getCMSGallery();
  const itemToDelete = current.find(g => g.imageId === imageId);
  const updatedList = current.filter(g => g.imageId !== imageId);
  setLocal('gallery_items', updatedList);

  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, 'gallery', imageId));
    } catch (e) {
      console.warn('[CMSService] deleteGallery error:', e);
    }
  }

  await logCMSActivity({
    action: 'DELETE',
    module: 'gallery',
    details: `गॅलरी फोटो हटवला: ${itemToDelete?.title || imageId}`,
    user
  });

  return true;
};

// ----------------------------------------------------
// 6. Videos Management
// ----------------------------------------------------
export const getCMSVideos = async () => {
  if (isConfigured && db) {
    try {
      const snap = await getDocs(query(collection(db, 'videos'), orderBy('displayOrder', 'asc')));
      if (!snap.empty) {
        return snap.docs.map(d => ({ videoId: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('[CMSService] getVideos error:', e);
    }
  }
  return getLocal('videos_items', videosList.map((v, idx) => ({
    videoId: v.id || `vid-${idx}`,
    title: v.title,
    youtubeUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
    youtubeVideoId: v.youtubeId,
    category: v.category || 'General',
    displayOrder: idx + 1,
    status: 'published'
  })));
};

export const saveCMSVideo = async (videoData, user) => {
  const current = await getCMSVideos();
  const videoId = videoData.videoId || `vid-${Date.now()}`;
  
  // Extract YouTube ID safely
  let ytId = videoData.youtubeVideoId || '';
  if (!ytId && videoData.youtubeUrl) {
    const url = videoData.youtubeUrl;
    if (url.includes('v=')) ytId = url.split('v=')[1]?.split('&')[0];
    else if (url.includes('youtu.be/')) ytId = url.split('youtu.be/')[1]?.split('?')[0];
    else if (url.includes('embed/')) ytId = url.split('embed/')[1]?.split('?')[0];
    else ytId = url;
  }

  const updatedVideo = {
    ...videoData,
    videoId,
    youtubeVideoId: ytId,
    embedId: ytId,
    thumbnailUrl: videoData.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ''),
    thumbnail: videoData.thumbnail || videoData.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ''),
    status: videoData.status || 'published',
    displayOrder: Number(videoData.displayOrder) || 1,
    updatedAt: new Date().toISOString()
  };

  const updatedList = current.some(v => v.videoId === videoId)
    ? current.map(v => v.videoId === videoId ? updatedVideo : v)
    : [updatedVideo, ...current];

  setLocal('videos_items', updatedList);

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'videos', videoId), {
        ...updatedVideo,
        lastModified: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('[CMSService] saveVideo error:', e);
    }
  }

  await logCMSActivity({
    action: current.some(v => v.videoId === videoId) ? 'UPDATE' : 'CREATE',
    module: 'videos',
    details: `व्हिडिओ जोडला/बदलला: ${updatedVideo.title}`,
    user
  });

  return updatedVideo;
};

export const deleteCMSVideo = async (videoId, user) => {
  const current = await getCMSVideos();
  const vidToDelete = current.find(v => v.videoId === videoId);
  const updatedList = current.filter(v => v.videoId !== videoId);
  setLocal('videos_items', updatedList);

  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, 'videos', videoId));
    } catch (e) {
      console.warn('[CMSService] deleteVideo error:', e);
    }
  }

  await logCMSActivity({
    action: 'DELETE',
    module: 'videos',
    details: `व्हिडिओ हटवला: ${vidToDelete?.title || videoId}`,
    user
  });

  return true;
};

// ----------------------------------------------------
// 7. Notices Management
// ----------------------------------------------------
export const getCMSNotices = async () => {
  if (isConfigured && db) {
    try {
      const snap = await getDocs(query(collection(db, 'notices'), orderBy('publishedAt', 'desc')));
      if (!snap.empty) {
        return snap.docs.map(d => ({ noticeId: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('[CMSService] getNotices error:', e);
    }
  }
  return getLocal('notices_items', noticesList.map((n, idx) => ({
    noticeId: n.id || `not-${idx}`,
    title: n.title,
    description: n.description,
    category: n.category || 'General',
    isImportant: Boolean(n.isImportant),
    publishedAt: n.date || '2026-03-01',
    status: 'published'
  })));
};

export const saveCMSNotice = async (noticeData, user) => {
  const current = await getCMSNotices();
  const noticeId = noticeData.noticeId || `not-${Date.now()}`;
  const updatedNotice = {
    ...noticeData,
    noticeId,
    status: noticeData.status || 'published',
    publishedAt: noticeData.publishedAt || new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  };

  const updatedList = current.some(n => n.noticeId === noticeId)
    ? current.map(n => n.noticeId === noticeId ? updatedNotice : n)
    : [updatedNotice, ...current];

  setLocal('notices_items', updatedList);

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'notices', noticeId), {
        ...updatedNotice,
        lastModified: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('[CMSService] saveNotice error:', e);
    }
  }

  await logCMSActivity({
    action: current.some(n => n.noticeId === noticeId) ? 'UPDATE' : 'CREATE',
    module: 'notices',
    details: `सूचना प्रकाशित/अद्ययावत केली: ${updatedNotice.title}`,
    user
  });

  return updatedNotice;
};

export const deleteCMSNotice = async (noticeId, user) => {
  const current = await getCMSNotices();
  const noticeToDelete = current.find(n => n.noticeId === noticeId);
  const updatedList = current.filter(n => n.noticeId !== noticeId);
  setLocal('notices_items', updatedList);

  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, 'notices', noticeId));
    } catch (e) {
      console.warn('[CMSService] deleteNotice error:', e);
    }
  }

  await logCMSActivity({
    action: 'DELETE',
    module: 'notices',
    details: `सूचना हटवली: ${noticeToDelete?.title || noticeId}`,
    user
  });

  return true;
};

// ----------------------------------------------------
// 8. Facilities Management
// ----------------------------------------------------
export const getCMSFacilities = async () => {
  if (isConfigured && db) {
    try {
      const snap = await getDocs(query(collection(db, 'facilities'), orderBy('displayOrder', 'asc')));
      if (!snap.empty) {
        return snap.docs.map(d => ({ facilityId: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('[CMSService] getFacilities error:', e);
    }
  }
  return getLocal('facilities_items', facilitiesList.map((f, idx) => ({
    facilityId: f.id || `fac-${idx}`,
    title: f.title,
    description: f.description,
    imageUrl: f.imageUrl,
    displayOrder: idx + 1,
    status: 'published'
  })));
};

export const saveCMSFacility = async (facilityData, user) => {
  const current = await getCMSFacilities();
  const facilityId = facilityData.facilityId || `fac-${Date.now()}`;
  const updatedFacility = {
    ...facilityData,
    facilityId,
    displayOrder: Number(facilityData.displayOrder) || 1,
    status: facilityData.status || 'published',
    updatedAt: new Date().toISOString()
  };

  const updatedList = current.some(f => f.facilityId === facilityId)
    ? current.map(f => f.facilityId === facilityId ? updatedFacility : f)
    : [...current, updatedFacility];

  setLocal('facilities_items', updatedList);

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'facilities', facilityId), {
        ...updatedFacility,
        lastModified: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('[CMSService] saveFacility error:', e);
    }
  }

  await logCMSActivity({
    action: current.some(f => f.facilityId === facilityId) ? 'UPDATE' : 'CREATE',
    module: 'facilities',
    details: `सुविधा अद्ययावत केली: ${updatedFacility.title}`,
    user
  });

  return updatedFacility;
};

export const deleteCMSFacility = async (facilityId, user) => {
  const current = await getCMSFacilities();
  const facToDelete = current.find(f => f.facilityId === facilityId);
  const updatedList = current.filter(f => f.facilityId !== facilityId);
  setLocal('facilities_items', updatedList);

  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, 'facilities', facilityId));
    } catch (e) {
      console.warn('[CMSService] deleteFacility error:', e);
    }
  }

  await logCMSActivity({
    action: 'DELETE',
    module: 'facilities',
    details: `सुविधा हटवली: ${facToDelete?.title || facilityId}`,
    user
  });

  return true;
};

// ----------------------------------------------------
// 9. Contact Information & Settings
// ----------------------------------------------------
export const getCMSContact = async () => {
  const defaultContact = {
    name: institutionInfo.name,
    tagline: institutionInfo.tagline,
    address: institutionInfo.address,
    phones: institutionInfo.phones,
    email: institutionInfo.email,
    workingHours: institutionInfo.workingHours,
    googleMapsUrl: 'https://maps.google.com/?q=Gurukul+Bhose+Miraj',
    whatsappNumber: '919850449800',
    facebookUrl: institutionInfo.facebookUrl,
    instagramUrl: institutionInfo.instagramUrl,
    youtubeUrl: institutionInfo.youtubeUrl,
    brochureUrl: institutionInfo.brochureUrl
  };

  if (isConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'contact_info', 'general'));
      if (snap.exists()) {
        return { ...defaultContact, ...snap.data() };
      }
    } catch (e) {
      console.warn('[CMSService] getContact error:', e);
    }
  }

  return getLocal('contact_info', defaultContact);
};

export const updateCMSContact = async (updates, user) => {
  const current = await getCMSContact();
  const merged = { ...current, ...updates, updatedAt: new Date().toISOString() };
  setLocal('contact_info', merged);
  setLocal('institution', { ...getLocal('institution', institutionInfo), ...merged });

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'contact_info', 'general'), {
        ...merged,
        lastModified: serverTimestamp()
      }, { merge: true });
      await setDoc(doc(db, 'website_content', 'general'), merged, { merge: true });
    } catch (e) {
      console.warn('[CMSService] updateContact error:', e);
    }
  }

  await logCMSActivity({
    action: 'SETTINGS',
    module: 'contact',
    details: 'कॅम्पस संपर्क माहिती अद्ययावत केली (Updated Contact Information)',
    user
  });

  return merged;
};

// ----------------------------------------------------
// 10. Website Settings & SEO Management
// ----------------------------------------------------
export const getCMSWebsiteSettings = async () => {
  const defaultSettings = {
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
    }
  };

  if (isConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'website_settings', 'general'));
      if (snap.exists()) {
        return { ...defaultSettings, ...snap.data() };
      }
    } catch (e) {
      console.warn('[CMSService] getSettings error:', e);
    }
  }

  return getLocal('website_settings', defaultSettings);
};

export const updateCMSWebsiteSettings = async (updates, user) => {
  const current = await getCMSWebsiteSettings();
  const merged = { ...current, ...updates, updatedAt: new Date().toISOString() };
  setLocal('website_settings', merged);

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'website_settings', 'general'), {
        ...merged,
        lastModified: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('[CMSService] updateSettings error:', e);
    }
  }

  await logCMSActivity({
    action: 'SETTINGS',
    module: 'settings',
    details: 'वेबसाईट मुख्य सेटिंग्स व मेटा माहिती बदलली (Updated Website Settings)',
    user
  });

  return merged;
};

export const getCMSSEOSettings = async () => {
  const defaultSEO = {
    siteName: 'गुरुकुल भोसे (Gurukul Bhose)',
    defaultTitle: 'गुरुकुल भोसे | सैनिक पॅटर्न निवासी स्कूल व ज्युनिअर कॉलेज, सांगली',
    defaultDescription: 'गुरुकुल भोसे, ता. मिरज, जि. सांगली. ५ वी ते १२ वी सैनिक पॅटर्न निवासी शिक्षण. स्कॉलरशिप, नवोदय, सैनिक स्कूल, NEET, JEE व NDA पूर्वतयारी.',
    defaultOgImage: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
    canonicalBase: 'https://gurukulbhose.com',
    robotsIndexing: true,
    sitemapUrls: [
      '/',
      '/about',
      '/vidyamandir',
      '/junior-college',
      '/talent-search-academy',
      '/science-academy',
      '/sports-academy',
      '/courses',
      '/gallery',
      '/videos',
      '/notices',
      '/contact',
      '/admission-enquiry'
    ]
  };

  if (isConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'website_settings', 'seo'));
      if (snap.exists()) {
        return { ...defaultSEO, ...snap.data() };
      }
    } catch (e) {
      console.warn('[CMSService] getSEO error:', e);
    }
  }

  return getLocal('seo_settings', defaultSEO);
};

export const updateCMSSEOSettings = async (updates, user) => {
  const current = await getCMSSEOSettings();
  const merged = { ...current, ...updates, updatedAt: new Date().toISOString() };
  setLocal('seo_settings', merged);

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'website_settings', 'seo'), {
        ...merged,
        lastModified: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('[CMSService] updateSEO error:', e);
    }
  }

  await logCMSActivity({
    action: 'SETTINGS',
    module: 'seo',
    details: 'SEO मेटा डेटा व साइटमॅप सेटिंग्स अद्ययावत केले (Updated SEO Metadata)',
    user
  });

  return merged;
};
