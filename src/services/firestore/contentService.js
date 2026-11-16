import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  isConfigured 
} from '../../firebase/config';

import { 
  institutionInfo, 
  heroSlides, 
  programsList, 
  coursesList, 
  facilitiesList, 
  noticesList, 
  galleryList, 
  videosList 
} from '../../data/initialData';

/**
 * Reusable Firestore Content Service
 * Supports querying published content from Firestore collections
 * and gracefully falls back to authentic preloaded data when offline or unconfigured.
 */

// 1. General Website Settings / Section Content
export const getWebsiteContent = async (sectionKey = 'general') => {
  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'website_content', sectionKey);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { data: snapshot.data(), fromFirestore: true };
      }
    } catch (err) {
      console.warn(`[ContentService] Error fetching website_content/${sectionKey}:`, err);
    }
  }

  // Fallback to local stored or initialData
  const saved = localStorage.getItem('gurukul_cms_institution');
  return { 
    data: saved ? JSON.parse(saved) : institutionInfo, 
    fromFirestore: false 
  };
};

// 2. Educational Programs
export const getPrograms = async () => {
  if (isConfigured && db) {
    try {
      const q = query(
        collection(db, 'programs'),
        where('status', '==', 'published'),
        orderBy('displayOrder', 'asc')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return {
          data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })),
          fromFirestore: true
        };
      }
    } catch (err) {
      console.warn('[ContentService] Error fetching programs collection:', err);
    }
  }

  let list = programsList;
  try {
    const saved = localStorage.getItem('gurukul_cms_programs');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed.filter(p => p.status !== 'draft');
      }
    }
  } catch (e) {
    console.warn('[ContentService] Error parsing cached programs:', e);
  }

  return { data: list, fromFirestore: false };
};

export const getProgramBySlug = async (slug) => {
  const { data: programs } = await getPrograms();
  const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;
  const found = programs.find(p => p.slug === normalizedSlug || p.slug === slug || p.id === slug);
  return found || null;
};

// 3. Courses
export const getCourses = async (categoryFilter = 'ALL') => {
  if (isConfigured && db) {
    try {
      let q = query(
        collection(db, 'courses'),
        where('status', '==', 'published'),
        orderBy('displayOrder', 'asc')
      );
      if (categoryFilter && categoryFilter !== 'ALL') {
        q = query(
          collection(db, 'courses'),
          where('status', '==', 'published'),
          where('category', '==', categoryFilter),
          orderBy('displayOrder', 'asc')
        );
      }
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return {
          data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })),
          fromFirestore: true
        };
      }
    } catch (err) {
      console.warn('[ContentService] Error fetching courses collection:', err);
    }
  }

  let list = coursesList;
  try {
    const saved = localStorage.getItem('gurukul_cms_courses');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed.filter(c => c.status !== 'draft');
      }
    }
  } catch (e) {
    console.warn('[ContentService] Error parsing cached courses:', e);
  }

  if (categoryFilter && categoryFilter !== 'ALL') {
    list = list.filter(c => c.category === categoryFilter);
  }
  return { data: list, fromFirestore: false };
};

export const getCourseBySlug = async (slug) => {
  const { data: courses } = await getCourses('ALL');
  const cleanParam = String(slug || '').replace(/^\/courses\//, '').replace(/^\//, '').toLowerCase();
  const found = courses.find(c => {
    const cSlug = String(c.slug || '').replace(/^\/courses\//, '').replace(/^\//, '').toLowerCase();
    const cId = String(c.id || c.courseId || '').toLowerCase();
    return cSlug === cleanParam || cId === cleanParam;
  });
  return found || null;
};

// 4. Photo Gallery
export const getGalleryImages = async (categoryFilter = 'all') => {
  if (isConfigured && db) {
    try {
      let q = query(
        collection(db, 'gallery'),
        where('status', '==', 'published'),
        orderBy('displayOrder', 'asc')
      );
      if (categoryFilter && categoryFilter !== 'all') {
        q = query(
          collection(db, 'gallery'),
          where('status', '==', 'published'),
          where('category', '==', categoryFilter),
          orderBy('displayOrder', 'asc')
        );
      }
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return {
          data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })),
          fromFirestore: true
        };
      }
    } catch (err) {
      console.warn('[ContentService] Error fetching gallery collection:', err);
    }
  }

  let list = galleryList;
  try {
    const saved = localStorage.getItem('gurukul_cms_gallery_items');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed.filter(g => g.status !== 'draft');
      }
    }
  } catch (e) {
    console.warn('[ContentService] Error parsing cached gallery:', e);
  }

  if (categoryFilter && categoryFilter !== 'all') {
    list = list.filter(g => g.category?.toLowerCase() === categoryFilter.toLowerCase());
  }
  return { data: list, fromFirestore: false };
};

// 5. Videos
export const getVideos = async () => {
  if (isConfigured && db) {
    try {
      const q = query(
        collection(db, 'videos'),
        where('status', '==', 'published'),
        orderBy('displayOrder', 'asc')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return {
          data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })),
          fromFirestore: true
        };
      }
    } catch (err) {
      console.warn('[ContentService] Error fetching videos collection:', err);
    }
  }

  let list = videosList;
  try {
    const saved = localStorage.getItem('gurukul_cms_videos_items');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed.filter(v => v.status !== 'draft');
      }
    }
  } catch (e) {
    console.warn('[ContentService] Error parsing cached videos:', e);
  }

  return { data: list, fromFirestore: false };
};

// 6. School Notices & Bulletins
export const getNotices = async (count = 10) => {
  if (isConfigured && db) {
    try {
      const q = query(
        collection(db, 'notices'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        firestoreLimit(count)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return {
          data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })),
          fromFirestore: true
        };
      }
    } catch (err) {
      console.warn('[ContentService] Error fetching notices collection:', err);
    }
  }

  let list = noticesList;
  try {
    const saved = localStorage.getItem('gurukul_cms_notices_items');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed.filter(n => n.status !== 'draft');
      }
    }
  } catch (e) {
    console.warn('[ContentService] Error parsing cached notices:', e);
  }

  return { data: list.slice(0, count), fromFirestore: false };
};

// 7. Facilities
export const getFacilities = async () => {
  if (isConfigured && db) {
    try {
      const q = query(
        collection(db, 'facilities'),
        where('status', '==', 'published'),
        orderBy('displayOrder', 'asc')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return {
          data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })),
          fromFirestore: true
        };
      }
    } catch (err) {
      console.warn('[ContentService] Error fetching facilities collection:', err);
    }
  }

  let list = facilitiesList;
  try {
    const saved = localStorage.getItem('gurukul_cms_facilities_items');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed.filter(f => f.status !== 'draft');
      }
    }
  } catch (e) {
    console.warn('[ContentService] Error parsing cached facilities:', e);
  }

  return { data: list, fromFirestore: false };
};
