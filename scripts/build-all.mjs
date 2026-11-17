import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function run(cmd, desc) {
  console.log(`\n========================================`);
  console.log(`[BUILD] ${desc}...`);
  console.log(`Command: ${cmd}`);
  console.log(`========================================\n`);
  execSync(cmd, { cwd: rootDir, stdio: 'inherit' });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
}

console.log('Starting Unified Multi-App Production Build for Vercel & Firebase...');

// 1. Build Public Website
run('npx vite build --config apps/public-website/vite.config.js apps/public-website', 'Building Public Website');

// 2. Build Admin Panel
run('npx vite build --config apps/admin-panel/vite.config.js apps/admin-panel', 'Building Admin Panel');

// 3. Build Telecaller Panel
run('npx vite build --config apps/telecaller-panel/vite.config.js apps/telecaller-panel', 'Building Telecaller Panel');

console.log('\n[POST-BUILD] Synchronizing dist directory for Vercel deployment...');

const distDir = path.join(rootDir, 'dist');
const distPublic = path.join(distDir, 'public');
const distAdmin = path.join(distDir, 'admin');
const distTelecaller = path.join(distDir, 'telecaller');
const distAssets = path.join(distDir, 'assets');

// 4. Ensure dist/telecaller is populated from dist/admin/telecaller
const adminTelecaller = path.join(distAdmin, 'telecaller');
if (fs.existsSync(adminTelecaller)) {
  copyDir(adminTelecaller, distTelecaller);
  console.log('✓ Synced dist/admin/telecaller -> dist/telecaller');
}

// 5. Ensure Public Website files exist at root of dist (so Vercel serves public website at /)
if (fs.existsSync(distPublic)) {
  copyDir(distPublic, distDir);
  console.log('✓ Synced dist/public -> dist/ (Root Vercel Output)');
}

// 6. Ensure assets from admin and telecaller are also present in dist/assets
if (fs.existsSync(path.join(distAdmin, 'assets'))) {
  copyDir(path.join(distAdmin, 'assets'), distAssets);
  console.log('✓ Merged dist/admin/assets -> dist/assets');
}

if (fs.existsSync(path.join(distTelecaller, 'assets'))) {
  copyDir(path.join(distTelecaller, 'assets'), distAssets);
  console.log('✓ Merged dist/telecaller/assets -> dist/assets');
}

console.log('\n========================================');
console.log('✓ All 3 Applications Successfully Built & Ready for Vercel!');
console.log('========================================\n');
