/**
 * Gurukul Bhose - Unified Cross-Application Navigation URLs
 * 
 * Dynamically resolves public website, admin panel, and telecaller panel URLs
 * across Local Development (localhost:3000 / localhost:3001), Firebase Hosting
 * (*.web.app), and Custom Production Domains (gurukulbhose.com).
 */

export const getPublicWebsiteUrl = () => {
  if (typeof window === 'undefined') {
    return import.meta.env?.VITE_PUBLIC_WEBSITE_URL || 'https://www.gurukulbhose.com';
  }

  const hostname = window.location.hostname;

  // 1. Localhost development: public website runs on port 3000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }

  // 2. Firebase hosting: public website is hosted on gurukul-bhose-web.web.app or gurukul-bhose.web.app
  if (hostname.includes('web.app') || hostname.includes('firebaseapp.com')) {
    return 'https://gurukul-bhose-web.web.app';
  }

  // 3. Explicitly configured environment variable
  if (import.meta.env?.VITE_PUBLIC_WEBSITE_URL) {
    return import.meta.env.VITE_PUBLIC_WEBSITE_URL;
  }

  // 4. Fallback custom domain
  return 'https://www.gurukulbhose.com';
};

export const getAdminPanelUrl = () => {
  if (typeof window === 'undefined') {
    return import.meta.env?.VITE_ADMIN_PANEL_URL || 'https://admin.gurukulbhose.com';
  }

  const hostname = window.location.hostname;

  // 1. Localhost development: admin panel runs on port 3001
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  // 2. Firebase hosting: admin panel is hosted on gurukul-bhose-admin.web.app
  if (hostname.includes('web.app') || hostname.includes('firebaseapp.com')) {
    return 'https://gurukul-bhose-admin.web.app';
  }

  // 3. Explicitly configured environment variable
  if (import.meta.env?.VITE_ADMIN_PANEL_URL) {
    return import.meta.env.VITE_ADMIN_PANEL_URL;
  }

  // 4. Fallback custom domain
  return 'https://admin.gurukulbhose.com';
};

export const getTelecallerPanelUrl = () => {
  if (typeof window === 'undefined') {
    return import.meta.env?.VITE_TELECALLER_PANEL_URL || 'https://admin.gurukulbhose.com/telecaller';
  }

  const adminUrl = getAdminPanelUrl();
  return import.meta.env?.VITE_TELECALLER_PANEL_URL || `${adminUrl}/telecaller`;
};
