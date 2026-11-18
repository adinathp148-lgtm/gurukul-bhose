/**
 * Gurukul Bhose - Unified Cross-Application Navigation URLs
 * 
 * Dynamically resolves public website, admin panel, and telecaller panel URLs
 * across Local Development (localhost:3000 / localhost:3001), Firebase Hosting
 * (*.web.app), Vercel deployments, and Custom Production Domains.
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

  // 3. Fallback to current origin (Vercel, custom domain, single-origin host)
  return window.location.origin;
};

export const getAdminPanelUrl = () => {
  if (typeof window === 'undefined') {
    return '';
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

  // 3. Dedicated admin subdomain (if DNS is configured)
  if (hostname.startsWith('admin.')) {
    return window.location.origin;
  }

  // 4. Vercel deployment & unified single-origin domains (e.g. *.vercel.app or gurukulbhose.com)
  // On Vercel, all 3 applications live on the SAME origin (/admin, /telecaller, /)
  return window.location.origin;
};

export const getTelecallerPanelUrl = () => {
  if (typeof window === 'undefined') {
    return '/telecaller';
  }

  const hostname = window.location.hostname;

  // 1. Localhost development: telecaller panel
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    if (window.location.port === '3002') {
      return `${window.location.origin}/telecaller`;
    }
    return 'http://localhost:3001/telecaller';
  }

  // 2. Firebase hosting: telecaller is hosted under admin hosting target
  if (hostname.includes('web.app') || hostname.includes('firebaseapp.com')) {
    return 'https://gurukul-bhose-admin.web.app/telecaller';
  }

  // 3. Dedicated admin subdomain
  if (hostname.startsWith('admin.')) {
    return `${window.location.origin}/telecaller`;
  }

  // 4. Unified single-origin deployment (Vercel, preview domains, custom domains)
  return `${window.location.origin}/telecaller`;
};
