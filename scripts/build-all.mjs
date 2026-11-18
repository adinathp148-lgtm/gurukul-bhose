import { build } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const target = process.argv[2] ? process.argv[2].toLowerCase() : 'all';

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
}

async function buildPublic() {
  console.log(`\n========================================`);
  console.log(`[BUILD 1/3] Building Public Website...`);
  console.log(`Config: apps/public-website/vite.config.js`);
  console.log(`========================================\n`);
  const configPath = path.resolve(rootDir, 'apps/public-website/vite.config.js');
  await build({ configFile: configPath });
}

async function buildAdmin() {
  console.log(`\n========================================`);
  console.log(`[BUILD 2/3] Building Admin Panel...`);
  console.log(`Config: apps/admin-panel/vite.config.js`);
  console.log(`========================================\n`);
  const configPath = path.resolve(rootDir, 'apps/admin-panel/vite.config.js');
  await build({ configFile: configPath });
}

async function buildTelecaller() {
  console.log(`\n========================================`);
  console.log(`[BUILD 3/3] Building Telecaller Panel...`);
  console.log(`Config: apps/telecaller-panel/vite.config.js`);
  console.log(`========================================\n`);
  const configPath = path.resolve(rootDir, 'apps/telecaller-panel/vite.config.js');
  await build({ configFile: configPath });
}

function syncDist() {
  console.log('\n[POST-BUILD] Synchronizing dist directory for Vercel deployment...');

  const distDir = path.join(rootDir, 'dist');
  const distPublic = path.join(distDir, 'public');
  const distAdmin = path.join(distDir, 'admin');
  const distTelecaller = path.join(distDir, 'telecaller');
  const distAssets = path.join(distDir, 'assets');

  // Ensure dist/telecaller is populated from dist/admin/telecaller
  const adminTelecaller = path.join(distAdmin, 'telecaller');
  if (fs.existsSync(adminTelecaller)) {
    copyDir(adminTelecaller, distTelecaller);
    console.log('✓ Synced dist/admin/telecaller -> dist/telecaller');
  }

  // Ensure Public Website files exist at root of dist (so Vercel serves public website at /)
  if (fs.existsSync(distPublic)) {
    copyDir(distPublic, distDir);
    console.log('✓ Synced dist/public -> dist/ (Root Vercel Output)');
  }

  // Ensure assets from admin and telecaller are also present in dist/assets
  if (fs.existsSync(path.join(distAdmin, 'assets'))) {
    copyDir(path.join(distAdmin, 'assets'), distAssets);
    console.log('✓ Merged dist/admin/assets -> dist/assets');
  }

  if (fs.existsSync(path.join(distTelecaller, 'assets'))) {
    copyDir(path.join(distTelecaller, 'assets'), distAssets);
    console.log('✓ Merged dist/telecaller/assets -> dist/assets');
  }
}

async function main() {
  console.log('Starting Unified Multi-App Production Build for Vercel & Firebase...');
  console.log(`Target: ${target}`);

  try {
    if (target === 'public') {
      await buildPublic();
      syncDist();
    } else if (target === 'admin') {
      await buildAdmin();
      syncDist();
    } else if (target === 'telecaller') {
      await buildTelecaller();
      syncDist();
    } else {
      // Build all 3
      await buildPublic();
      await buildAdmin();
      await buildTelecaller();
      syncDist();
    }

    console.log('\n========================================');
    console.log('✓ Production Build Successfully Completed & Ready for Vercel!');
    console.log('========================================\n');
  } catch (err) {
    console.error('\n❌ Build failed:', err);
    process.exit(1);
  }
}

main();
