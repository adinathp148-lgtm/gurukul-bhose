/**
 * Gurukul Bhose - CMS to Codebase Static Synchronizer
 * 
 * Imports CMS data (from a JSON backup file or Firestore) directly into
 * shared/data/initialData.js and src/data/initialData.js so that Vercel builds
 * will permanently contain all updated images, videos, and notices even
 * without an active Firestore connection.
 * 
 * Usage:
 *   node scripts/sync-cms-to-codebase.mjs [path-to-cms-backup.json]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targetJsonPath = process.argv[2];

if (!targetJsonPath) {
  console.log(`
ℹ Usage:
  node scripts/sync-cms-to-codebase.mjs <path-to-exported-cms-backup.json>

💡 Tip:
  You can download the CMS JSON Backup directly from the Admin Panel:
  Admin Panel -> CMS Hub -> "डेटा बॅकअप (JSON)"
  Then run this script to commit those changes permanently for Vercel builds!
`);
  process.exit(0);
}

const resolvedPath = path.isAbsolute(targetJsonPath) ? targetJsonPath : path.resolve(process.cwd(), targetJsonPath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ Error: File not found at ${resolvedPath}`);
  process.exit(1);
}

try {
  const content = fs.readFileSync(resolvedPath, 'utf8');
  const parsed = JSON.parse(content);

  const sharedDataPath = path.join(rootDir, 'shared', 'data', 'initialData.js');
  const srcDataPath = path.join(rootDir, 'src', 'data', 'initialData.js');

  console.log(`\n========================================`);
  console.log(`🔄 Syncing CMS Data into Website Codebase...`);
  console.log(`========================================\n`);

  // Update gallery if present
  let sharedContent = fs.readFileSync(sharedDataPath, 'utf8');

  if (Array.isArray(parsed.gallery) && parsed.gallery.length > 0) {
    const formattedGallery = JSON.stringify(parsed.gallery, null, 2);
    sharedContent = sharedContent.replace(
      /export const galleryList = \[[\s\S]*?\];/m,
      `export const galleryList = ${formattedGallery};`
    );
    console.log(`✓ Updated galleryList (${parsed.gallery.length} photos)`);
  }

  if (Array.isArray(parsed.videos) && parsed.videos.length > 0) {
    const formattedVideos = JSON.stringify(parsed.videos, null, 2);
    sharedContent = sharedContent.replace(
      /export const videosList = \[[\s\S]*?\];/m,
      `export const videosList = ${formattedVideos};`
    );
    console.log(`✓ Updated videosList (${parsed.videos.length} videos)`);
  }

  if (Array.isArray(parsed.notices) && parsed.notices.length > 0) {
    const formattedNotices = JSON.stringify(parsed.notices, null, 2);
    sharedContent = sharedContent.replace(
      /export const noticesList = \[[\s\S]*?\];/m,
      `export const noticesList = ${formattedNotices};`
    );
    console.log(`✓ Updated noticesList (${parsed.notices.length} notices)`);
  }

  fs.writeFileSync(sharedDataPath, sharedContent, 'utf8');
  fs.writeFileSync(srcDataPath, sharedContent, 'utf8');

  console.log(`\n========================================`);
  console.log(`✓ successfully synced to initialData.js in both shared and src!`);
  console.log(`🚀 Run 'npm run deploy' to push to GitHub & Vercel.`);
  console.log(`========================================\n`);

} catch (err) {
  console.error(`❌ Failed to sync CMS data:`, err.message);
  process.exit(1);
}
