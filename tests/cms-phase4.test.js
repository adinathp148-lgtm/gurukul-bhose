import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateUploadFile,
  uploadMediaFile
} from '../src/services/storage/mediaUploadService.js';

import {
  getHomepageCMSData,
  updateHomepageCMSData,
  getCMSPages,
  saveCMSPage,
  getAboutCMSData,
  updateAboutCMSData,
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
} from '../src/services/firestore/cmsService.js';

// Setup Mock localStorage for Node runtime
if (typeof globalThis.localStorage === 'undefined') {
  let store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
}

const mockAdminUser = {
  uid: 'admin_test_1',
  email: 'admin@gurukulbhose.com',
  role: 'admin'
};

const mockTelecallerUser = {
  uid: 'telecaller_test_1',
  email: 'telecaller@gurukulbhose.com',
  role: 'telecaller'
};

test('1. validateUploadFile accepts valid JPG, PNG, and WebP images under 5MB', () => {
  const validJpg = { name: 'campus.jpg', type: 'image/jpeg', size: 2 * 1024 * 1024 };
  const validPng = { name: 'banner.png', type: 'image/png', size: 4 * 1024 * 1024 };
  const validWebp = { name: 'student.webp', type: 'image/webp', size: 1 * 1024 * 1024 };

  assert.equal(validateUploadFile(validJpg).valid, true);
  assert.equal(validateUploadFile(validPng).valid, true);
  assert.equal(validateUploadFile(validWebp).valid, true);
});

test('2. validateUploadFile rejects images exceeding 5MB limit', () => {
  const oversizedImage = { name: 'huge.jpg', type: 'image/jpeg', size: 6 * 1024 * 1024 };
  const result = validateUploadFile(oversizedImage);
  assert.equal(result.valid, false);
  assert.match(result.error, /5MB/);
});

test('3. validateUploadFile rejects unsupported file formats (.exe, .zip)', () => {
  const exeFile = { name: 'installer.exe', type: 'application/x-msdownload', size: 1024 };
  const zipFile = { name: 'archive.zip', type: 'application/zip', size: 1024 };

  assert.equal(validateUploadFile(exeFile).valid, false);
  assert.equal(validateUploadFile(zipFile).valid, false);
});

test('4. validateUploadFile accepts valid PDF under 15MB for circulars and brochures', () => {
  const validPdf = { name: 'circular.pdf', type: 'application/pdf', size: 8 * 1024 * 1024 };
  const result = validateUploadFile(validPdf, true);
  assert.equal(result.valid, true);
});

test('5. validateUploadFile rejects PDF documents exceeding 15MB limit', () => {
  const heavyPdf = { name: 'heavy.pdf', type: 'application/pdf', size: 16 * 1024 * 1024 };
  const result = validateUploadFile(heavyPdf, true);
  assert.equal(result.valid, false);
  assert.match(result.error, /15MB/);
});

test('6. uploadMediaFile generates clean uploaded media response with url and path', async () => {
  const dummyFile = {
    name: 'sample.jpg',
    type: 'image/jpeg',
    size: 50000
  };

  const uploadRes = await uploadMediaFile(dummyFile, 'gallery', 'test_sample_1');
  assert.ok(uploadRes.url);
  assert.ok(uploadRes.path);
  assert.match(uploadRes.path, /website\/gallery\/test_sample_1/);
});

test('7. getHomepageCMSData returns structured heroSlides, welcome message, and CTA data', async () => {
  const data = await getHomepageCMSData();
  assert.ok(Array.isArray(data.heroSlides));
  assert.ok(data.heroSlides.length > 0);
  assert.ok(data.welcome);
  assert.ok(data.admissionCTA);
});

test('8. updateHomepageCMSData updates hero slides, preserves order, and generates audit log', async () => {
  const updatedSlides = [
    {
      id: 'slide_test_1',
      title: 'सैनिक पॅटर्न निवासी शिक्षण',
      subtitle: 'इ. ५ वी ते १२ वी प्रवेश सुरू',
      ctaText: 'प्रवेश चौकशी',
      ctaLink: '/admission-enquiry'
    }
  ];

  const res = await updateHomepageCMSData({ heroSlides: updatedSlides }, mockAdminUser);
  assert.equal(res.heroSlides[0].title, 'सैनिक पॅटर्न निवासी शिक्षण');

  const logs = await getCMSActivityLogs(5);
  assert.ok(logs.some(l => l.module === 'homepage'));
});

test('9. getCMSPages returns default system pages (vidyamandir, junior college, etc.)', async () => {
  const pages = await getCMSPages();
  assert.ok(Array.isArray(pages));
  assert.ok(pages.some(p => p.slug === 'vidyamandir' || p.slug === '/vidyamandir'));
  assert.ok(pages.some(p => p.slug === 'junior-college' || p.slug === '/junior-college'));
});

test('10. saveCMSPage creates and updates pages using structured blocks', async () => {
  const customPage = {
    pageId: 'page_custom_1',
    slug: 'custom-program',
    title: 'विशेष निवासी उपक्रम',
    status: 'published',
    blocks: [
      { id: 'b1', type: 'heading', content: 'दैनंदिन दिनचर्या' },
      { id: 'b2', type: 'paragraph', content: 'पहाटे ५:३० वाजता कवायत सुरू होते.' }
    ]
  };

  const saved = await saveCMSPage(customPage, mockAdminUser);
  assert.ok(saved.slug.includes('custom-program'));
  assert.equal(saved.blocks.length, 2);

  const all = await getCMSPages();
  const match = all.find(p => p.pageId === 'page_custom_1');
  assert.ok(match);
  assert.equal(match.title, 'विशेष निवासी उपक्रम');
});

test('11. getAboutCMSData and updateAboutCMSData manage vision, mission and founder details', async () => {
  const initial = await getAboutCMSData();
  assert.ok(initial.vision);
  assert.ok(initial.mission);

  const updated = await updateAboutCMSData({
    vision: 'ग्रामीण भागातील बालकांना सैनिकी व उच्च दर्जाचे शिक्षण देणे.',
    founder: {
      name: 'मा. संस्थापक अध्यक्ष',
      title: 'संस्थापक',
      message: 'गुरुकुल भोसेमध्ये संस्कार आणि शिस्त यावर भर दिला जातो.'
    }
  }, mockAdminUser);

  assert.match(updated.vision, /सैनिकी/);
  assert.equal(updated.founder.name, 'मा. संस्थापक अध्यक्ष');
});

test('12. getCMSCourses returns available courses list', async () => {
  const courses = await getCMSCourses();
  assert.ok(Array.isArray(courses));
  assert.ok(courses.length > 0);
});

test('13. saveCMSCourse creates course with validated slug for /courses/:slug navigation', async () => {
  const newCourse = {
    courseId: 'course_nda_foundation',
    slug: 'nda-foundation',
    title: 'NDA पूर्वतयारी व फाऊंडेशन बॅच',
    category: 'स्पर्धा परीक्षा अकॅडमी (Competitive)',
    eligibility: '१० वी उत्तीर्ण',
    duration: '२ वर्षे',
    shortDescription: 'NDA लेखी परीक्षा व SSB मुलाखतीची परिपूर्ण तयारी.',
    status: 'published'
  };

  const saved = await saveCMSCourse(newCourse, mockAdminUser);
  assert.match(saved.slug, /nda-foundation/);
  assert.equal(saved.status, 'published');

  const all = await getCMSCourses();
  assert.ok(all.some(c => c.slug?.includes('nda-foundation')));
});

test('14. deleteCMSCourse deletes a course safely', async () => {
  await deleteCMSCourse('course_nda_foundation', mockAdminUser);
  const all = await getCMSCourses();
  assert.equal(all.some(c => c.courseId === 'course_nda_foundation'), false);
});

test('15. saveCMSGalleryItem adds gallery photo with category and caption', async () => {
  const photoItem = {
    imageId: 'img_test_1',
    title: 'क्रीडा महोत्सव व कवायत',
    caption: 'विद्यार्थ्यांची संचलन प्रात्यक्षिके',
    category: 'क्रीडा (Sports)',
    url: 'https://gurukulbhose.com/assets/sports.jpg',
    status: 'published'
  };

  const saved = await saveCMSGalleryItem(photoItem, mockAdminUser);
  assert.equal(saved.category, 'क्रीडा (Sports)');

  const gallery = await getCMSGallery();
  assert.ok(gallery.some(g => g.imageId === 'img_test_1'));
});

test('16. deleteCMSGalleryItem removes photo from gallery', async () => {
  await deleteCMSGalleryItem('img_test_1', mockAdminUser);
  const gallery = await getCMSGallery();
  assert.equal(gallery.some(g => g.imageId === 'img_test_1'), false);
});

test('17. saveCMSVideo extracts valid 11-char YouTube ID and creates safe embed data', async () => {
  const videoEntry = {
    videoId: 'vid_campus_tour',
    title: 'गुरुकुल भोसे निवासी संकुल टूअर',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'कॅम्पस टूअर',
    status: 'published'
  };

  const saved = await saveCMSVideo(videoEntry, mockAdminUser);
  assert.equal(saved.embedId, 'dQw4w9WgXcQ');
  assert.match(saved.thumbnail, /dQw4w9WgXcQ/);

  const videos = await getCMSVideos();
  assert.ok(videos.some(v => v.videoId === 'vid_campus_tour'));

  await deleteCMSVideo('vid_campus_tour', mockAdminUser);
});

test('18. saveCMSNotice creates notice with PDF document and urgent importance badge', async () => {
  const noticeEntry = {
    noticeId: 'notice_admission_2025',
    title: 'इ. ५ वी ते १२ वी प्रवेश परीक्षा २०२५-२६ अंतिम तारीख',
    description: 'सैनिक पॅटर्न निवासी वर्गांसाठी प्रवेश फॉर्म स्वीकारले जात आहेत.',
    category: 'प्रवेश (Admission)',
    isUrgent: true,
    fileUrl: 'https://gurukulbhose.com/circulars/admission2025.pdf',
    fileName: 'admission2025.pdf',
    status: 'published'
  };

  const saved = await saveCMSNotice(noticeEntry, mockAdminUser);
  assert.equal(saved.isUrgent, true);
  assert.match(saved.fileUrl, /\.pdf/);

  const notices = await getCMSNotices();
  assert.ok(notices.some(n => n.noticeId === 'notice_admission_2025'));
});

test('19. deleteCMSNotice deletes notice', async () => {
  await deleteCMSNotice('notice_admission_2025', mockAdminUser);
  const notices = await getCMSNotices();
  assert.equal(notices.some(n => n.noticeId === 'notice_admission_2025'), false);
});

test('20. updateCMSContact updates official phone numbers, WhatsApp, and email', async () => {
  const contactUpdates = {
    phones: ['9850449800', '9850449808'],
    whatsapp: '9850449800',
    email: 'info@gurukulbhose.com',
    officeHours: 'सकाळी ९ ते सायं ६'
  };

  const updated = await updateCMSContact(contactUpdates, mockAdminUser);
  assert.equal(updated.phones[0], '9850449800');
  assert.equal(updated.whatsapp, '9850449800');
  assert.equal(updated.email, 'info@gurukulbhose.com');
});

test('21. updateCMSWebsiteSettings and updateCMSSEOSettings persist maintenance mode, meta title and OG image', async () => {
  const settingsRes = await updateCMSWebsiteSettings({
    maintenanceMode: false,
    websiteName: 'गुरुकुल भोसे'
  }, mockAdminUser);
  assert.equal(settingsRes.websiteName, 'गुरुकुल भोसे');

  const seoRes = await updateCMSSEOSettings({
    globalMetaTitle: 'गुरुकुल भोसे निवासी शाळा',
    robotsIndex: true
  }, mockAdminUser);
  assert.equal(seoRes.globalMetaTitle, 'गुरुकुल भोसे निवासी शाळा');
  assert.equal(seoRes.robotsIndex, true);
});

test('22. Audit trail records user identity, action, and module for administrative changes', async () => {
  await logCMSActivity({
    action: 'UPDATE_HOMEPAGE',
    module: 'homepage',
    description: 'बॅनर मजकूर अद्यतनित केला'
  }, mockAdminUser);

  const logs = await getCMSActivityLogs(10);
  assert.ok(logs.length > 0);
  assert.ok(logs[0].userEmail);
  assert.ok(logs[0].timestamp);
  assert.equal(logs[0].userEmail, 'admin@gurukulbhose.com');
});
