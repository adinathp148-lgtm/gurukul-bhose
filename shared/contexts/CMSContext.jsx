import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  institutionInfo as initialInfo, 
  heroSlides as initialSlides, 
  noticesList as initialNotices, 
  galleryList as initialGallery, 
  videosList as initialVideos, 
  coursesList as initialCourses,
  facilitiesList as initialFacilities
} from '../data/initialData';

// Dynamically load cmsService (and Firebase Firestore) on idle/demand so initial
// public website paint is never blocked by the Firebase SDK bundle.
let cmsServicePromise = null;
const loadCmsService = () => {
  if (!cmsServicePromise) {
    cmsServicePromise = import('../services/firestore/cmsService');
  }
  return cmsServicePromise;
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('gurukul_active_user') || 'null');
  } catch {
    return null;
  }
};

const CMSContext = createContext(null);

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};

export const CMSProvider = ({ children }) => {
  const currentUser = getStoredUser();

  // Local state initialized with cached / default data
  const [institution, setInstitution] = useState(() => {
    try {
      const saved = localStorage.getItem('gurukul_cms_institution');
      return saved ? JSON.parse(saved) : initialInfo;
    } catch {
      return initialInfo;
    }
  });

  const [homepageData, setHomepageData] = useState(() => {
    try {
      const saved = localStorage.getItem('gurukul_cms_homepage');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [pages, setPages] = useState(() => {
    try {
      const saved = localStorage.getItem('gurukul_cms_pages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [aboutData, setAboutData] = useState(() => {
    try {
      const saved = localStorage.getItem('gurukul_cms_about');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [programs, setPrograms] = useState(() => {
    try {
      const saved = localStorage.getItem('gurukul_cms_programs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('gurukul_cms_courses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return Array.isArray(initialCourses) ? initialCourses.map(c => ({
      courseId: c.id,
      id: c.id,
      ...c,
      status: 'published'
    })) : [];
  });
  const [gallery, setGallery] = useState(() => {
    try {
      const saved = localStorage.getItem('gurukul_cms_gallery_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return Array.isArray(initialGallery) ? initialGallery.map((g, idx) => ({
      id: g.id || `gal-${idx}`,
      imageId: g.id || `gal-${idx}`,
      title: g.title || '',
      caption: g.caption || g.title || '',
      category: g.category || 'कॅम्पस (Campus)',
      imageUrl: g.imageUrl || g.image || '',
      url: g.imageUrl || g.image || '',
      displayOrder: idx + 1,
      status: 'published'
    })) : [];
  });
  const [videos, setVideos] = useState(() => {
    try {
      const saved = localStorage.getItem('gurukul_cms_videos_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return Array.isArray(initialVideos) ? initialVideos.map((v, idx) => ({
      id: v.id || `vid-${idx}`,
      videoId: v.id || `vid-${idx}`,
      title: v.title || '',
      description: v.description || '',
      youtubeId: v.youtubeId || '',
      embedUrl: v.youtubeId ? `https://www.youtube.com/embed/${v.youtubeId}` : '',
      category: v.category || 'कॅम्पस (Campus)',
      displayOrder: idx + 1,
      status: 'published'
    })) : [];
  });

  const [notices, setNotices] = useState(() => {
    try {
      const saved = localStorage.getItem('gurukul_cms_notices_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return Array.isArray(initialNotices) ? initialNotices.map((n, idx) => ({
      noticeId: n.id || `not-${idx}`,
      id: n.id || `not-${idx}`,
      title: n.title,
      description: n.description || '',
      category: n.category || 'प्रवेश (Admission)',
      date: n.date || '2026-06-01',
      publishedAt: n.date || '2026-06-01',
      isImportant: Boolean(n.isImportant),
      downloadLink: n.downloadLink || '',
      fileUrl: n.downloadLink || '',
      attachmentUrl: n.downloadLink || '',
      fileName: n.pdfName || '',
      status: 'published'
    })) : [];
  });

  const [facilities, setFacilities] = useState(() => {
    try {
      const saved = localStorage.getItem('gurukul_cms_facilities_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return Array.isArray(initialFacilities) ? initialFacilities.map((f, idx) => ({
      facilityId: f.id || `fac-${idx}`,
      id: f.id || `fac-${idx}`,
      title: f.title || '',
      description: f.description || '',
      category: f.category || 'कॅम्पस (Campus)',
      imageUrl: f.image || f.imageUrl || '',
      status: 'published'
    })) : [];
  });
  const [contactInfo, setContactInfo] = useState(null);
  const [websiteSettings, setWebsiteSettings] = useState(null);
  const [seoSettings, setSeoSettings] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial load from CMS service (lazy-loaded to keep initial bundle lean)
  const loadAllCMSData = async () => {
    setLoading(true);
    try {
      const cms = await loadCmsService();
      const results = await Promise.allSettled([
        cms.getHomepageCMSData(),
        cms.getCMSPages(),
        cms.getAboutCMSData(),
        cms.getCMSPrograms(),
        cms.getCMSCourses(),
        cms.getCMSGallery(),
        cms.getCMSVideos(),
        cms.getCMSNotices(),
        cms.getCMSFacilities(),
        cms.getCMSContact(),
        cms.getCMSWebsiteSettings(),
        cms.getCMSSEOSettings(),
        cms.getCMSActivityLogs(30)
      ]);

      const val = (idx, fallback = null) => {
        const item = results[idx];
        return (item && item.status === 'fulfilled' && item.value !== undefined && item.value !== null)
          ? item.value
          : fallback;
      };

      const hp = val(0, null);
      const pgs = val(1, cms.initialPagesList || []);
      const abt = val(2, null);
      const prgs = val(3, []);
      const crs = val(4, []);
      const gal = val(5, []);
      const vids = val(6, []);
      const nts = val(7, []);
      const facs = val(8, []);
      const cnt = val(9, null);
      const sett = val(10, null);
      const seo = val(11, null);
      const logs = val(12, []);

      if (hp) setHomepageData(hp);
      if (Array.isArray(pgs) && pgs.length > 0) setPages(pgs);
      if (abt) setAboutData(abt);
      if (Array.isArray(prgs) && prgs.length > 0) setPrograms(prgs);
      if (Array.isArray(crs) && crs.length > 0) setCourses(crs);
      if (Array.isArray(gal) && gal.length > 0) {
        setGallery(gal);
      }
      if (Array.isArray(vids) && vids.length > 0) setVideos(vids);
      if (Array.isArray(nts) && nts.length > 0) setNotices(nts);
      if (Array.isArray(facs) && facs.length > 0) setFacilities(facs);
      if (cnt) setContactInfo(cnt);
      if (sett) setWebsiteSettings(sett);
      if (seo) setSeoSettings(seo);
      if (Array.isArray(logs)) setActivityLogs(logs);

      if (cnt) {
        setInstitution(prev => ({ ...prev, ...cnt }));
        localStorage.setItem('gurukul_cms_institution', JSON.stringify({ ...institution, ...cnt }));
      }
    } catch (err) {
      console.warn('[CMSContext] Error loading CMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/super-admin') || pathname.startsWith('/cms');
    if (isAdminRoute) {
      loadAllCMSData();
      return;
    }
    // Defer background Firestore CMS sync until after page load settles so
    // Firebase SDK never competes with critical LCP/TBT on mobile networks.
    let loaded = false;
    const triggerSync = () => {
      if (loaded) return;
      loaded = true;
      loadAllCMSData();
    };
    const timer = setTimeout(triggerSync, 4500);
    const onInteract = () => triggerSync();
    window.addEventListener('pointerdown', onInteract, { once: true, passive: true });
    window.addEventListener('keydown', onInteract, { once: true, passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, []);

  // 1. Homepage
  const updateHomepage = async (updates) => {
    const cms = await loadCmsService();
    const updated = await cms.updateHomepageCMSData(updates, getStoredUser() || currentUser);
    setHomepageData(updated);
    return updated;
  };

  // 2. Structured Pages
  const savePage = async (pageData) => {
    const cms = await loadCmsService();
    const updated = await cms.saveCMSPage(pageData, getStoredUser() || currentUser);
    setPages(prev => prev.some(p => p.pageId === updated.pageId)
      ? prev.map(p => p.pageId === updated.pageId ? updated : p)
      : [...prev, updated]
    );
    return updated;
  };

  // 3. About
  const updateAbout = async (updates) => {
    const cms = await loadCmsService();
    const updated = await cms.updateAboutCMSData(updates, getStoredUser() || currentUser);
    setAboutData(updated);
    return updated;
  };

  // 3B. Programs
  const saveProgram = async (programData) => {
    const cms = await loadCmsService();
    const updated = await cms.saveCMSProgram(programData, getStoredUser() || currentUser);
    setPrograms(prev => prev.some(p => p.programId === updated.programId || p.id === updated.id)
      ? prev.map(p => (p.programId === updated.programId || p.id === updated.id) ? updated : p)
      : [...prev, updated]
    );
    return updated;
  };

  const deleteProgram = async (programId) => {
    const cms = await loadCmsService();
    await cms.deleteCMSProgram(programId, getStoredUser() || currentUser);
    setPrograms(prev => prev.filter(p => p.programId !== programId && p.id !== programId));
    return true;
  };

  // 4. Courses
  const saveCourse = async (courseData) => {
    const cms = await loadCmsService();
    const updated = await cms.saveCMSCourse(courseData, getStoredUser() || currentUser);
    setCourses(prev => prev.some(c => c.courseId === updated.courseId)
      ? prev.map(c => c.courseId === updated.courseId ? updated : c)
      : [...prev, updated]
    );
    return updated;
  };

  const deleteCourse = async (courseId) => {
    const cms = await loadCmsService();
    await cms.deleteCMSCourse(courseId, getStoredUser() || currentUser);
    setCourses(prev => prev.filter(c => c.courseId !== courseId));
    return true;
  };

  // 5. Gallery
  const saveGalleryItem = async (itemData) => {
    const cms = await loadCmsService();
    const updated = await cms.saveCMSGalleryItem(itemData, getStoredUser() || currentUser);
    setGallery(prev => prev.some(g => g.imageId === updated.imageId)
      ? prev.map(g => g.imageId === updated.imageId ? updated : g)
      : [updated, ...prev]
    );
    return updated;
  };

  const deleteGalleryItem = async (imageId) => {
    const cms = await loadCmsService();
    await cms.deleteCMSGalleryItem(imageId, getStoredUser() || currentUser);
    setGallery(prev => prev.filter(g => g.imageId !== imageId));
    return true;
  };

  // 6. Videos
  const saveVideo = async (videoData) => {
    const cms = await loadCmsService();
    const updated = await cms.saveCMSVideo(videoData, getStoredUser() || currentUser);
    setVideos(prev => prev.some(v => v.videoId === updated.videoId)
      ? prev.map(v => v.videoId === updated.videoId ? updated : v)
      : [updated, ...prev]
    );
    return updated;
  };

  const deleteVideo = async (videoId) => {
    const cms = await loadCmsService();
    await cms.deleteCMSVideo(videoId, getStoredUser() || currentUser);
    setVideos(prev => prev.filter(v => v.videoId !== videoId));
    return true;
  };

  // 7. Notices
  const saveNotice = async (noticeData) => {
    const cms = await loadCmsService();
    const updated = await cms.saveCMSNotice(noticeData, getStoredUser() || currentUser);
    setNotices(prev => prev.some(n => n.noticeId === updated.noticeId)
      ? prev.map(n => n.noticeId === updated.noticeId ? updated : n)
      : [updated, ...prev]
    );
    return updated;
  };

  const deleteNotice = async (noticeId) => {
    const cms = await loadCmsService();
    await cms.deleteCMSNotice(noticeId, getStoredUser() || currentUser);
    setNotices(prev => prev.filter(n => n.noticeId !== noticeId && n.id !== noticeId));
    return true;
  };

  // 8. Facilities
  const saveFacility = async (facilityData) => {
    const cms = await loadCmsService();
    const updated = await cms.saveCMSFacility(facilityData, getStoredUser() || currentUser);
    setFacilities(prev => prev.some(f => f.facilityId === updated.facilityId)
      ? prev.map(f => f.facilityId === updated.facilityId ? updated : f)
      : [...prev, updated]
    );
    return updated;
  };

  const deleteFacility = async (facilityId) => {
    const cms = await loadCmsService();
    await cms.deleteCMSFacility(facilityId, getStoredUser() || currentUser);
    setFacilities(prev => prev.filter(f => f.facilityId !== facilityId));
    return true;
  };

  // 9. Contact & Institution Details
  const updateInstitution = async (updates) => {
    const cms = await loadCmsService();
    const updated = await cms.updateCMSContact(updates, getStoredUser() || currentUser);
    setContactInfo(updated);
    setInstitution(prev => ({ ...prev, ...updated }));
    return updated;
  };

  // 10. Website Settings
  const updateSettings = async (updates) => {
    const cms = await loadCmsService();
    const updated = await cms.updateCMSWebsiteSettings(updates, getStoredUser() || currentUser);
    setWebsiteSettings(updated);
    return updated;
  };

  // 11. SEO Settings
  const updateSEO = async (updates) => {
    const cms = await loadCmsService();
    const updated = await cms.updateCMSSEOSettings(updates, getStoredUser() || currentUser);
    setSeoSettings(updated);
    return updated;
  };

  // Refresh Activity Logs
  const refreshLogs = async () => {
    const cms = await loadCmsService();
    const logs = await cms.getCMSActivityLogs(50);
    setActivityLogs(logs);
    return logs;
  };

  // Reset to original institutional data
  const resetToDefaults = () => {
    setInstitution(initialInfo);
    localStorage.removeItem('gurukul_cms_institution');
    localStorage.removeItem('gurukul_cms_homepage');
    localStorage.removeItem('gurukul_cms_pages');
    localStorage.removeItem('gurukul_cms_about');
    localStorage.removeItem('gurukul_cms_courses');
    localStorage.removeItem('gurukul_cms_gallery_items');
    localStorage.removeItem('gurukul_cms_videos_items');
    localStorage.removeItem('gurukul_cms_notices_items');
    localStorage.removeItem('gurukul_cms_facilities_items');
    localStorage.removeItem('gurukul_cms_contact_info');
    localStorage.removeItem('gurukul_cms_website_settings');
    localStorage.removeItem('gurukul_cms_seo_settings');
    loadAllCMSData();
  };

  const value = {
    institution: institution || initialInfo,
    homepageData,
    pages: Array.isArray(pages) ? pages : [],
    aboutData,
    programs: Array.isArray(programs) ? programs : [],
    courses: Array.isArray(courses) ? courses : [],
    gallery: Array.isArray(gallery) ? gallery : [],
    videos: Array.isArray(videos) ? videos : [],
    notices: Array.isArray(notices) ? notices : [],
    facilities: Array.isArray(facilities) ? facilities : [],
    contactInfo,
    websiteSettings,
    seoSettings,
    activityLogs: Array.isArray(activityLogs) ? activityLogs : [],
    loading,
    refreshAll: loadAllCMSData,
    updateHomepage,
    savePage,
    updateAbout,
    saveProgram,
    deleteProgram,
    saveCourse,
    deleteCourse,
    saveGalleryItem,
    deleteGalleryItem,
    saveVideo,
    deleteVideo,
    saveNotice,
    deleteNotice,
    saveFacility,
    deleteFacility,
    updateInstitution,
    updateSettings,
    updateSEO,
    refreshLogs,
    resetToDefaults,
    pushToFirestore: async () => {
      const cms = await loadCmsService();
      const res = await cms.pushInitialDataToFirestore(getStoredUser() || currentUser);
      await loadAllCMSData();
      return res;
    },
    // Backwards-compatible aliases for Phase 2 components
    slides: homepageData?.heroSlides || initialSlides,
    addNotice: (n) => saveNotice(n),
    addGalleryItem: (g) => saveGalleryItem(g),
    addVideo: (v) => saveVideo(v)
  };

  return (
    <CMSContext.Provider value={value}>
      {children}
    </CMSContext.Provider>
  );
};

export default CMSContext;
