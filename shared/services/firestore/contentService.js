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

// Helper: Match categories across Marathi and English labels
export const matchesCategory = (itemCategory = '', filter = 'all') => {
  if (!filter || filter === 'all') return true;
  const cat = String(itemCategory || '').toLowerCase();
  const f = String(filter).toLowerCase();
  if (cat === f) return true;
  if (cat.includes(f) || f.includes(cat)) return true;
  if ((f === 'yoga' || f === 'योगा' || f.includes('yoga') || f.includes('योगा') || f.includes('योग')) && (cat.includes('yoga') || cat.includes('योगा') || cat.includes('योग') || cat.includes('ध्यान') || cat.includes('प्राणायाम') || cat.includes('सूर्यनमस्कार') || cat.includes('आसन'))) return true;
  if ((f === 'activities' || f === 'उपक्रम') && (cat.includes('उपक्रम') || cat.includes('activities') || cat.includes('कार्यक्रम') || cat.includes('events')) && !cat.includes('yoga') && !cat.includes('योगा')) return true;
  if ((f === 'sports' || f === 'क्रीडा') && (cat.includes('क्रीडा') || cat.includes('sports') || cat.includes('ग्राउंड') || cat.includes('ग्राऊंड') || cat.includes('मैदान'))) return true;
  if ((f === 'campus' || f === 'कॅम्पस') && (cat.includes('कॅम्पस') || cat.includes('campus') || cat.includes('परिसर'))) return true;
  if ((f === 'gathering' || f === 'स्नेहसंमेलन') && (cat.includes('स्नेहसंमेलन') || cat.includes('gathering') || cat.includes('महोत्सव'))) return true;
  if ((f === 'result' || f === 'निकाल') && (cat.includes('निकाल') || cat.includes('result') || cat.includes('गुणवंत'))) return true;
  if ((f === 'academic' || f === 'शैक्षणिक') && (cat.includes('शैक्षणिक') || cat.includes('academic') || cat.includes('अभ्यास'))) return true;
  return false;
};

// 4. Photo Gallery
export const getGalleryImages = async (categoryFilter = 'all') => {
  if (isConfigured && db) {
    try {
      // Query collection directly to avoid composite index requirements
      const snapshot = await getDocs(collection(db, 'gallery'));
      if (!snapshot.empty) {
        let items = snapshot.docs.map(d => {
          const data = d.data();
          const imgUrl = data.imageUrl || data.url || '';
          return {
            id: d.id,
            imageId: d.id,
            ...data,
            imageUrl: imgUrl,
            url: imgUrl,
            category: data.category || 'कॅम्पस (Campus)',
            displayOrder: Number(data.displayOrder) || 999
          };
        }).filter(g => g.status === 'published' || (!g.status || g.status !== 'draft'));

        items.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

        if (categoryFilter && categoryFilter !== 'all') {
          items = items.filter(g => matchesCategory(g.category, categoryFilter));
        }

        return { data: items, fromFirestore: true };
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
        const existingIds = new Set(parsed.map(p => p.id || p.imageId));
        const missingDefaults = galleryList.filter(g => !existingIds.has(g.id));
        list = [...parsed, ...missingDefaults].filter(g => g.status !== 'draft');
      }
    }
  } catch (e) {
    console.warn('[ContentService] Error parsing cached gallery:', e);
  }

  let normalizedList = list.map((g, idx) => {
    const imgUrl = g.imageUrl || g.url || '';
    return {
      id: g.id || g.imageId || `gal-${idx}`,
      imageId: g.imageId || g.id || `gal-${idx}`,
      ...g,
      imageUrl: imgUrl,
      url: imgUrl,
      displayOrder: Number(g.displayOrder) || idx + 1
    };
  });

  if (categoryFilter && categoryFilter !== 'all') {
    normalizedList = normalizedList.filter(g => matchesCategory(g.category, categoryFilter));
  }
  return { data: normalizedList, fromFirestore: false };
};

// 5. Videos
export const getVideos = async () => {
  if (isConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'videos'));
      if (!snapshot.empty) {
        let items = snapshot.docs.map(d => {
          const data = d.data();
          const ytId = data.youtubeVideoId || data.embedId || data.youtubeId || '';
          const embedUrl = data.embedUrl || (ytId ? `https://www.youtube.com/embed/${ytId}` : (data.youtubeUrl ? data.youtubeUrl.replace('watch?v=', 'embed/') : ''));
          return {
            id: d.id,
            videoId: d.id,
            ...data,
            youtubeVideoId: ytId,
            embedId: ytId,
            embedUrl,
            displayOrder: Number(data.displayOrder) || 999
          };
        }).filter(v => v.status === 'published' || (!v.status || v.status !== 'draft'));

        items.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
        return { data: items, fromFirestore: true };
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

  let normalizedList = list.map((v, idx) => {
    const ytId = v.youtubeVideoId || v.embedId || v.youtubeId || '';
    const embedUrl = v.embedUrl || (ytId ? `https://www.youtube.com/embed/${ytId}` : (v.youtubeUrl ? v.youtubeUrl.replace('watch?v=', 'embed/') : ''));
    return {
      id: v.id || v.videoId || `vid-${idx}`,
      videoId: v.videoId || v.id || `vid-${idx}`,
      ...v,
      youtubeVideoId: ytId,
      embedId: ytId,
      embedUrl,
      displayOrder: Number(v.displayOrder) || idx + 1
    };
  });

  normalizedList.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
  return { data: normalizedList, fromFirestore: false };
};

// 6. School Notices & Bulletins
export const getNotices = async (count = 10) => {
  let deletedIds = [];
  try {
    const storedDeleted = localStorage.getItem('gurukul_cms_notices_deleted');
    if (storedDeleted) deletedIds = JSON.parse(storedDeleted);
  } catch (e) {}

  if (isConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'notices'));
      if (!snapshot.empty) {
        let items = snapshot.docs.map(d => {
          const data = d.data();
          const fileLink = data.downloadLink || data.attachmentUrl || data.fileUrl || '';
          const dateStr = data.publishedAt || data.date || '';
          return {
            id: d.id,
            noticeId: d.id,
            ...data,
            date: dateStr,
            publishedAt: dateStr,
            downloadLink: fileLink,
            attachmentUrl: fileLink,
            fileUrl: fileLink
          };
        }).filter(n => {
          const id = n.noticeId || n.id;
          if (deletedIds.includes(id)) return false;
          return n.status === 'published' || (!n.status || n.status !== 'draft');
        });

        items.sort((a, b) => new Date(b.publishedAt || b.date || 0) - new Date(a.publishedAt || a.date || 0));
        return { data: items.slice(0, count), fromFirestore: true };
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
      if (Array.isArray(parsed)) {
        const now = new Date().toISOString();
        list = parsed.filter(n => {
          const id = n.noticeId || n.id;
          if (deletedIds.includes(id)) return false;
          return n.status === 'published' || (n.status !== 'draft' && (!n.publishAt || n.publishAt <= now));
        });
        list.sort((a, b) => new Date(b.publishedAt || b.date || 0) - new Date(a.publishedAt || a.date || 0));
        return { data: list.slice(0, count), fromFirestore: false };
      }
    }
  } catch (e) {
    console.warn('[ContentService] Error parsing cached notices:', e);
  }

  let normalizedList = list
    .filter(n => !deletedIds.includes(n.id) && !deletedIds.includes(n.noticeId))
    .map((n, idx) => {
      const fileLink = n.downloadLink || n.attachmentUrl || n.fileUrl || '';
      const dateStr = n.publishedAt || n.date || '';
      return {
        id: n.id || n.noticeId || `not-${idx}`,
        noticeId: n.noticeId || n.id || `not-${idx}`,
        ...n,
        date: dateStr,
        publishedAt: dateStr,
        downloadLink: fileLink,
        attachmentUrl: fileLink,
        fileUrl: fileLink
      };
    });

  normalizedList.sort((a, b) => new Date(b.publishedAt || b.date || 0) - new Date(a.publishedAt || a.date || 0));
  return { data: normalizedList.slice(0, count), fromFirestore: false };
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
