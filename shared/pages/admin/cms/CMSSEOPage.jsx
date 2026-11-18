import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, 
  Save, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Search, 
  Share2, 
  Bot,
  Copy,
  Download,
  FileCode,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../../contexts/CMSContext';
import { uploadMediaFile, validateUploadFile } from '../../../services/storage/mediaUploadService';

export const CMSSEOPage = () => {
  const { seoSettings, updateSEO, courses = [], pages = [] } = useCMS();

  const [saving, setSaving] = useState(false);
  const [uploadingOgImage, setUploadingOgImage] = useState(false);
  const [message, setMessage] = useState(null);
  const [copiedSitemap, setCopiedSitemap] = useState(false);

  const defaultSEO = {
    globalMetaTitle: 'गुरुकुल भोसे | सैनिक पॅटर्न निवासी शाळा व ज्युनिअर कॉलेज, मिरज',
    globalMetaDescription: 'गुरुकुल भोसे निवासी संकुल, ता. मिरज, जि. सांगली. इ. ५ वी ते १२ वी सैनिक पॅटर्न निवासी शिक्षण, स्कॉलरशिप, नवोदय, NEET, JEE व NDA पूर्वतयारी.',
    keywords: 'गुरुकुल भोसे, सैनिक पॅटर्न निवासी शाळा, Gurukul Bhose, Sainik school Miraj, Sangli residential school, NEET JEE NDA classes',
    canonicalUrl: 'https://gurukulbhose.com',
    ogImage: '',
    robotsIndex: true,
    googleSiteVerification: '',
    pagesSEO: {
      home: { title: 'मुख्यपृष्ठ | गुरुकुल भोसे', description: 'गुरुकुल भोसे निवासी शाळा व ज्युनिअर कॉलेज अधिकृत पोर्टल.' },
      about: { title: 'आमच्याबद्दल | गुरुकुल भोसे', description: 'गुरुकुल भोसे संस्थेचे ध्येय, तत्त्वज्ञान व परंपरा.' },
      courses: { title: 'अभ्यासक्रम | गुरुकुल भोसे', description: '५ वी ते १२ वी सैनिक पॅटर्न निवासी अभ्यासक्रम.' },
      gallery: { title: 'फोटो व व्हिडिओ गॅलरी | गुरुकुल भोसे', description: 'कॅम्पस, स्नेहसंमेलन व क्रीडा उपक्रम क्षणचित्रे.' },
      contact: { title: 'संपर्क | गुरुकुल भोसे', description: 'गुरुकुल भोसेशी संपर्क साधा, पत्ता व फोन नंबर.' }
    }
  };

  const [formData, setFormData] = useState(defaultSEO);

  useEffect(() => {
    if (seoSettings) {
      setFormData(prev => ({
        ...prev,
        ...seoSettings,
        pagesSEO: {
          ...prev.pagesSEO,
          ...(seoSettings.pagesSEO || {})
        }
      }));
    }
  }, [seoSettings]);

  const safeCourses = Array.isArray(courses) ? courses : [];
  const safePages = Array.isArray(pages) ? pages : [];

  // Compute published pages and courses for sitemap
  const publishedCourses = useMemo(() => {
    return safeCourses.filter(c => c.status !== 'draft');
  }, [safeCourses]);

  const publishedPages = useMemo(() => {
    return safePages.filter(p => p.status !== 'draft');
  }, [safePages]);

  const dynamicSitemapXml = useMemo(() => {
    const baseUrl = (formData.canonicalUrl || 'https://gurukulbhose.com').replace(/\/$/, '');
    const today = new Date().toISOString().split('T')[0];

    const staticRoutes = [
      { loc: '', changefreq: 'daily', priority: '1.0' },
      { loc: '/about', changefreq: 'monthly', priority: '0.8' },
      { loc: '/courses', changefreq: 'weekly', priority: '0.9' },
      { loc: '/gurukul-vidyamandir', changefreq: 'weekly', priority: '0.9' },
      { loc: '/gurukul-junior-college', changefreq: 'weekly', priority: '0.9' },
      { loc: '/talent-search-academy', changefreq: 'weekly', priority: '0.8' },
      { loc: '/science-academy', changefreq: 'weekly', priority: '0.8' },
      { loc: '/computer-institute', changefreq: 'weekly', priority: '0.8' },
      { loc: '/sports-academy', changefreq: 'weekly', priority: '0.8' },
      { loc: '/gallery', changefreq: 'weekly', priority: '0.7' },
      { loc: '/videos', changefreq: 'weekly', priority: '0.7' },
      { loc: '/notices', changefreq: 'daily', priority: '0.8' },
      { loc: '/contact', changefreq: 'monthly', priority: '0.7' }
    ];

    let urls = staticRoutes.map(r => `  <url>
    <loc>${baseUrl}${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n');

    // Add published dynamic courses
    publishedCourses.forEach(c => {
      const slug = c.slug || c.id || c.courseId;
      if (slug) {
        urls += `\n  <url>
    <loc>${baseUrl}/courses/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    });

    // Add custom published pages if any
    publishedPages.forEach(p => {
      const slug = p.slug;
      if (slug && !staticRoutes.some(sr => sr.loc === `/${slug}`)) {
        urls += `\n  <url>
    <loc>${baseUrl}/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }, [formData.canonicalUrl, publishedCourses, publishedPages]);

  const handleCopySitemap = () => {
    navigator.clipboard.writeText(dynamicSitemapXml);
    setCopiedSitemap(true);
    setTimeout(() => setCopiedSitemap(false), 2500);
  };

  const handleDownloadSitemap = () => {
    const blob = new Blob([dynamicSitemapXml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOgImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error });
      return;
    }

    try {
      setUploadingOgImage(true);
      const res = await uploadMediaFile(file, 'seo', `og_preview_${Date.now()}`);
      const uploadedUrl = res.downloadURL || res.url;
      setFormData(prev => ({ ...prev, ogImage: uploadedUrl }));
      setMessage({ type: 'success', text: 'Social Share (OG) इमेज यशस्वीरीत्या अपलोड झाली.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'इमेज अपलोड करताना त्रुटी आली.' });
    } finally {
      setUploadingOgImage(false);
    }
  };

  const handlePageSeoChange = (pageKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      pagesSEO: {
        ...prev.pagesSEO,
        [pageKey]: {
          ...(prev.pagesSEO?.[pageKey] || {}),
          [field]: value
        }
      }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateSEO(formData);
      setMessage({ type: 'success', text: 'SEO व सोशल शेअरिंग सेटिंग्ज यशस्वीरीत्या अद्यतनित झाल्या!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'जतन करताना त्रुटी आली.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/cms" 
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="CMS डॅशबोर्डवर परत जा"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gurukul-navy-900 flex items-center gap-2">
              <Globe className="w-7 h-7 text-gurukul-saffron-600" />
              <span>SEO व सर्च इंजिन व्यवस्थापन (SEO Management)</span>
            </h1>
            <p className="text-sm text-slate-500">
              मेटा टायटल्स, वर्णने, Open Graph सोशल कार्ड्स, XML साईटमॅप व गुगल पडताळणी व्यवस्थापित करा.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gurukul-saffron-600 hover:bg-gurukul-saffron-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'जतन करत आहे...' : 'SEO सेव्ह करा'}</span>
        </button>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold animate-in fade-in ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Global Meta Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Search className="w-5 h-5 text-gurukul-saffron-600" />
            <span>ग्लोबल सर्च इंजिन टॅग्ज (Global Metadata)</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              वेबसाईटचे मुख्य Meta Title * (६० अक्षरांच्या आत शिफारसित)
            </label>
            <input
              type="text"
              required
              value={formData.globalMetaTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, globalMetaTitle: e.target.value }))}
              placeholder="गुरुकुल भोसे | सैनिक पॅटर्न निवासी शाळा..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">अक्षर मर्यादा: {formData.globalMetaTitle?.length || 0}/60</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              ग्लोबल Meta Description * (१६० अक्षरांच्या आत शिफारसित)
            </label>
            <textarea
              rows={3}
              required
              value={formData.globalMetaDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, globalMetaDescription: e.target.value }))}
              placeholder="गुगल सर्च रिझल्ट्समध्ये दिसणारे संक्षिप्त वर्णन..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">अक्षर मर्यादा: {formData.globalMetaDescription?.length || 0}/160</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                शोध कीवर्ड्स (Keywords, comma-separated)
              </label>
              <input
                type="text"
                value={formData.keywords || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="गुरुकुल भोसे, सैनिक शाळा, निवासी शाळा..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                अधिकृत कॅनोनिकल URL (Canonical URL)
              </label>
              <input
                type="text"
                value={formData.canonicalUrl || 'https://gurukulbhose.com'}
                onChange={(e) => setFormData(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Social Share Preview (OG Tags) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Share2 className="w-5 h-5 text-gurukul-saffron-600" />
            <span>सोशल शेअरिंग प्रिव्ह्यू (Open Graph & WhatsApp Preview Card)</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              WhatsApp / Facebook शेअरिंग इमेज (OG Image - 1200x630px शिफारसित)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={formData.ogImage || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, ogImage: e.target.value }))}
                placeholder="इमेज URL किंवा थेट अपलोड करा"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
              />
              <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0">
                <Upload className="w-4 h-4 text-gurukul-saffron-600" />
                <span>{uploadingOgImage ? '...' : 'OG इमेज अपलोड'}</span>
                <input type="file" accept="image/*" onChange={handleOgImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Social Card Mockup */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              WhatsApp लिंक प्रिव्ह्यू मॉडेल (Live Simulation):
            </span>
            <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-xs">
              {formData.ogImage ? (
                <img src={formData.ogImage} alt="OG Preview" className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-24 bg-gradient-to-r from-gurukul-navy-900 to-gurukul-saffron-600 flex items-center justify-center text-white text-xs font-bold">
                  गुरुकुल भोसे अधिकृत बॅनर
                </div>
              )}
              <div className="p-3">
                <p className="text-[10px] text-slate-400 font-mono">gurukulbhose.com</p>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{formData.globalMetaTitle}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{formData.globalMetaDescription}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Dynamic XML Sitemap Preview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-gurukul-saffron-600" />
              <span>डायनॅमिक XML साईटमॅप (Live Dynamic Sitemap)</span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySitemap}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSitemap ? 'कॉपी झाले!' : 'XML कॉपी करा'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSitemap}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gurukul-navy-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>sitemap.xml डाऊनलोड</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">एकूण पेजेस</span>
              <span className="text-lg font-black text-gurukul-navy-900">13</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">प्रकाशित अभ्यासक्रम</span>
              <span className="text-lg font-black text-gurukul-saffron-600">{publishedCourses.length}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">कस्टम पेजेस</span>
              <span className="text-lg font-black text-gurukul-navy-900">{publishedPages.length}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">मसुदा (वगळलेले)</span>
              <span className="text-lg font-black text-amber-600">
                {(safeCourses.length - publishedCourses.length) + (safePages.length - publishedPages.length)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              sitemap.xml प्रिव्ह्यू (Dynamic Live Generated):
            </label>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
              {dynamicSitemapXml}
            </pre>
            <p className="text-[11px] text-slate-500 mt-1">
              टीप: मसुदा (Draft) असलेले अभ्यासक्रम व पेजेस सर्च इंजिन साईटमॅपमधून स्वयंचलित वगळले जातात.
            </p>
          </div>
        </div>

        {/* Section 4: Search Engine Indexing & Robots */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gurukul-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bot className="w-5 h-5 text-gurukul-saffron-600" />
            <span>सर्च इंजिन रोबॉट्स व पडताळणी (Indexing & Webmaster Verification)</span>
          </h2>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-sm font-bold text-gurukul-navy-900 block">
                Google व इतर सर्च इंजिन्सना वेबसाईट इंडेक्स करण्याची परवानगी द्या
              </span>
              <span className="text-xs text-slate-500">
                (Robots meta tag: "index, follow" किंवा "noindex")
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.robotsIndex !== false}
                onChange={(e) => setFormData(prev => ({ ...prev, robotsIndex: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Google Search Console Verification Tag
            </label>
            <input
              type="text"
              value={formData.googleSiteVerification || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, googleSiteVerification: e.target.value }))}
              placeholder="google-site-verification=..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white outline-none"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CMSSEOPage;
