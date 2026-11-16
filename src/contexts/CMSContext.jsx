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

import {
  getHomepageCMSData,
  updateHomepageCMSData,
  getCMSPages,
  saveCMSPage,
  getAboutCMSData,
  updateAboutCMSData,
  getCMSPrograms,
  saveCMSProgram,
  deleteCMSProgram,
  getCMSCourses,
  saveCMSCourse,
  deleteCMSCourse,
  getCMSGallery,
  saveCMSGalleryItem,
  deleteCMSGalleryItem,
  getCMSVideos,
  saveCMSVideo,
  deleteCMSVideo,
  getCMSNotices,
  saveCMSNotice,
  deleteCMSNotice,
  getCMSFacilities,
  saveCMSFacility,
  deleteCMSFacility,
  getCMSContact,
  updateCMSContact,
  getCMSWebsiteSettings,
  updateCMSWebsiteSettings,
  getCMSSEOSettings,
  updateCMSSEOSettings,
  getCMSActivityLogs,
  logCMSActivity
} from '../services/firestore/cmsService';

import { useAuth } from './AuthContext';

const CMSContext = createContext(null);

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};

export const CMSProvider = ({ children }) => {
  const auth = useAuth?.() || {};
  const currentUser = auth.currentUser;

  // Local state initialized with cached / default data
  const [institution, setInstitution] = useState(() => {
    try {
      const saved = localStorage.getItem('gurukul_cms_institution');
      return saved ? JSON.parse(saved) : initialInfo;
    } catch {
      return initialInfo;
    }
  });

  const [homepageData, setHomepageData] = useState(null);
  const [pages, setPages] = useState([]);
  const [aboutData, setAboutData] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [videos, setVideos] = useState([]);
  const [notices, setNotices] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [websiteSettings, setWebsiteSettings] = useState(null);
  const [seoSettings, setSeoSettings] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial load from CMS service
  const loadAllCMSData = async () => {
    setLoading(true);
    try {
      const [
        hp,
        pgs,
        abt,
        prgs,
        crs,
        gal,
        vids,
        nts,
        facs,
        cnt,
        sett,
        seo,
        logs
      ] = await Promise.all([
        getHomepageCMSData(),
        getCMSPages(),
        getAboutCMSData(),
        getCMSPrograms(),
        getCMSCourses(),
        getCMSGallery(),
        getCMSVideos(),
        getCMSNotices(),
        getCMSFacilities(),
        getCMSContact(),
        getCMSWebsiteSettings(),
        getCMSSEOSettings(),
        getCMSActivityLogs(30)
      ]);

      setHomepageData(hp);
      setPages(pgs);
      setAboutData(abt);
      setPrograms(prgs);
      setCourses(crs);
      setGallery(gal);
      setVideos(vids);
      setNotices(nts);
      setFacilities(facs);
      setContactInfo(cnt);
      setWebsiteSettings(sett);
      setSeoSettings(seo);
      setActivityLogs(logs);

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
    loadAllCMSData();
  }, []);

  // 1. Homepage
  const updateHomepage = async (updates) => {
    const updated = await updateHomepageCMSData(updates, currentUser);
    setHomepageData(updated);
    return updated;
  };

  // 2. Structured Pages
  const savePage = async (pageData) => {
    const updated = await saveCMSPage(pageData, currentUser);
    setPages(prev => prev.some(p => p.pageId === updated.pageId)
      ? prev.map(p => p.pageId === updated.pageId ? updated : p)
      : [...prev, updated]
    );
    return updated;
  };

  // 3. About
  const updateAbout = async (updates) => {
    const updated = await updateAboutCMSData(updates, currentUser);
    setAboutData(updated);
    return updated;
  };

  // 3B. Programs
  const saveProgram = async (programData) => {
    const updated = await saveCMSProgram(programData, currentUser);
    setPrograms(prev => prev.some(p => p.programId === updated.programId || p.id === updated.id)
      ? prev.map(p => (p.programId === updated.programId || p.id === updated.id) ? updated : p)
      : [...prev, updated]
    );
    return updated;
  };

  const deleteProgram = async (programId) => {
    await deleteCMSProgram(programId, currentUser);
    setPrograms(prev => prev.filter(p => p.programId !== programId && p.id !== programId));
    return true;
  };

  // 4. Courses
  const saveCourse = async (courseData) => {
    const updated = await saveCMSCourse(courseData, currentUser);
    setCourses(prev => prev.some(c => c.courseId === updated.courseId)
      ? prev.map(c => c.courseId === updated.courseId ? updated : c)
      : [...prev, updated]
    );
    return updated;
  };

  const deleteCourse = async (courseId) => {
    await deleteCMSCourse(courseId, currentUser);
    setCourses(prev => prev.filter(c => c.courseId !== courseId));
    return true;
  };

  // 5. Gallery
  const saveGalleryItem = async (itemData) => {
    const updated = await saveCMSGalleryItem(itemData, currentUser);
    setGallery(prev => prev.some(g => g.imageId === updated.imageId)
      ? prev.map(g => g.imageId === updated.imageId ? updated : g)
      : [updated, ...prev]
    );
    return updated;
  };

  const deleteGalleryItem = async (imageId) => {
    await deleteCMSGalleryItem(imageId, currentUser);
    setGallery(prev => prev.filter(g => g.imageId !== imageId));
    return true;
  };

  // 6. Videos
  const saveVideo = async (videoData) => {
    const updated = await saveCMSVideo(videoData, currentUser);
    setVideos(prev => prev.some(v => v.videoId === updated.videoId)
      ? prev.map(v => v.videoId === updated.videoId ? updated : v)
      : [updated, ...prev]
    );
    return updated;
  };

  const deleteVideo = async (videoId) => {
    await deleteCMSVideo(videoId, currentUser);
    setVideos(prev => prev.filter(v => v.videoId !== videoId));
    return true;
  };

  // 7. Notices
  const saveNotice = async (noticeData) => {
    const updated = await saveCMSNotice(noticeData, currentUser);
    setNotices(prev => prev.some(n => n.noticeId === updated.noticeId)
      ? prev.map(n => n.noticeId === updated.noticeId ? updated : n)
      : [updated, ...prev]
    );
    return updated;
  };

  const deleteNotice = async (noticeId) => {
    await deleteCMSNotice(noticeId, currentUser);
    setNotices(prev => prev.filter(n => n.noticeId !== noticeId));
    return true;
  };

  // 8. Facilities
  const saveFacility = async (facilityData) => {
    const updated = await saveCMSFacility(facilityData, currentUser);
    setFacilities(prev => prev.some(f => f.facilityId === updated.facilityId)
      ? prev.map(f => f.facilityId === updated.facilityId ? updated : f)
      : [...prev, updated]
    );
    return updated;
  };

  const deleteFacility = async (facilityId) => {
    await deleteCMSFacility(facilityId, currentUser);
    setFacilities(prev => prev.filter(f => f.facilityId !== facilityId));
    return true;
  };

  // 9. Contact & Institution Details
  const updateInstitution = async (updates) => {
    const updated = await updateCMSContact(updates, currentUser);
    setContactInfo(updated);
    setInstitution(prev => ({ ...prev, ...updated }));
    return updated;
  };

  // 10. Website Settings
  const updateSettings = async (updates) => {
    const updated = await updateCMSWebsiteSettings(updates, currentUser);
    setWebsiteSettings(updated);
    return updated;
  };

  // 11. SEO Settings
  const updateSEO = async (updates) => {
    const updated = await updateCMSSEOSettings(updates, currentUser);
    setSeoSettings(updated);
    return updated;
  };

  // Refresh Activity Logs
  const refreshLogs = async () => {
    const logs = await getCMSActivityLogs(50);
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
    institution,
    homepageData,
    pages,
    aboutData,
    programs,
    courses,
    gallery,
    videos,
    notices,
    facilities,
    contactInfo,
    websiteSettings,
    seoSettings,
    activityLogs,
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
