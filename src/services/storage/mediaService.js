import { storage, ref, getDownloadURL, isConfigured } from '../../firebase/config';

/**
 * Reusable Media & Firebase Storage Service
 * Handles resolving Firebase Storage references, download URLs, and fallback image placeholders.
 */

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80';

export const resolveMediaUrl = async (pathOrUrl, fallback = FALLBACK_IMAGE) => {
  if (!pathOrUrl) return fallback;

  // If already a full http/https URL, return directly
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('data:')) {
    return pathOrUrl;
  }

  // If Firebase Storage path (e.g. "banners/hero-1.jpg") and Firebase is configured
  if (isConfigured && storage) {
    try {
      const storageRef = ref(storage, pathOrUrl);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err) {
      console.warn(`[MediaService] Could not resolve storage URL for: ${pathOrUrl}`, err);
    }
  }

  return fallback;
};

export const getYouTubeEmbedUrl = (videoIdOrUrl) => {
  if (!videoIdOrUrl) return '';
  if (videoIdOrUrl.includes('embed/')) return videoIdOrUrl;

  let videoId = videoIdOrUrl;
  if (videoIdOrUrl.includes('youtube.com/watch?v=')) {
    videoId = videoIdOrUrl.split('watch?v=')[1]?.split('&')[0];
  } else if (videoIdOrUrl.includes('youtu.be/')) {
    videoId = videoIdOrUrl.split('youtu.be/')[1]?.split('?')[0];
  }

  return `https://www.youtube.com/embed/${videoId}`;
};
