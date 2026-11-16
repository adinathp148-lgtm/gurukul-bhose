import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Three-App Separation & Architecture Isolation Test Suite
 * Applications:
 *   1. Public Website (www.gurukulbhose.com)
 *   2. Admin Panel (admin.gurukulbhose.com)
 *   3. Telecaller Panel (admin.gurukulbhose.com/telecaller)
 */

const projectRoot = process.cwd();

test('1. Architecture: Directory structure contains all 3 frontend apps and shared module', () => {
  const publicDir = path.join(projectRoot, 'apps', 'public-website');
  const adminDir = path.join(projectRoot, 'apps', 'admin-panel');
  const telecallerDir = path.join(projectRoot, 'apps', 'telecaller-panel');
  const sharedDir = path.join(projectRoot, 'shared');

  assert.ok(fs.existsSync(publicDir), 'apps/public-website must exist');
  assert.ok(fs.existsSync(adminDir), 'apps/admin-panel must exist');
  assert.ok(fs.existsSync(telecallerDir), 'apps/telecaller-panel must exist');
  assert.ok(fs.existsSync(sharedDir), 'shared/ directory must exist');

  // Verify index.html & vite.config.js for each app
  assert.ok(fs.existsSync(path.join(publicDir, 'index.html')));
  assert.ok(fs.existsSync(path.join(publicDir, 'vite.config.js')));
  assert.ok(fs.existsSync(path.join(adminDir, 'index.html')));
  assert.ok(fs.existsSync(path.join(adminDir, 'vite.config.js')));
  assert.ok(fs.existsSync(path.join(telecallerDir, 'index.html')));
  assert.ok(fs.existsSync(path.join(telecallerDir, 'vite.config.js')));
});

test('2. Public Website Isolation: No Admin or Telecaller routes in public bundle', () => {
  const publicRoutesFile = path.join(projectRoot, 'apps', 'public-website', 'src', 'routes', 'AppRoutes.jsx');
  const content = fs.readFileSync(publicRoutesFile, 'utf8');

  // Verify public routes are present
  assert.match(content, /path="\/"/);
  assert.match(content, /path="\/about"/);
  assert.match(content, /path="\/courses"/);
  assert.match(content, /path="\/gallery"/);
  assert.match(content, /path="\/videos"/);
  assert.match(content, /path="\/notices"/);
  assert.match(content, /path="\/contact"/);
  assert.match(content, /path="\/admission-enquiry"/);

  // Strictly verify privileged components are NOT imported or routed
  assert.doesNotMatch(content, /DashboardPage/);
  assert.doesNotMatch(content, /CMSPage/);
  assert.doesNotMatch(content, /SuperAdmin/);
  assert.doesNotMatch(content, /TelecallerDashboardPage/);
  assert.doesNotMatch(content, /TelecallersListPage/);
  assert.doesNotMatch(content, /CreateTelecallerPage/);
});

test('3. Admin Panel Completeness: Contains all CMS and CRM management features', () => {
  const adminRoutesFile = path.join(projectRoot, 'apps', 'admin-panel', 'src', 'routes', 'AppRoutes.jsx');
  const content = fs.readFileSync(adminRoutesFile, 'utf8');

  // CRM Features
  assert.match(content, /DashboardPage/);
  assert.match(content, /TelecallersListPage/);
  assert.match(content, /CreateTelecallerPage/);
  assert.match(content, /TelecallerDetailsPage/);
  assert.match(content, /LeadsPage/);
  assert.match(content, /FollowUpsPage/);
  assert.match(content, /AdmissionsPage/);

  // Complete CMS Modules
  assert.match(content, /CMSHomepagePage/);
  assert.match(content, /CMSCoursesPage/);
  assert.match(content, /CMSGalleryPage/);
  assert.match(content, /CMSVideosPage/);
  assert.match(content, /CMSNoticesPage/);
  assert.match(content, /CMSFacilitiesPage/);
  assert.match(content, /CMSContactPage/);
  assert.match(content, /CMSSEOPage/);
  assert.match(content, /CMSSettingsPage/);
});

test('4. Telecaller Panel Isolation: Telecaller cannot access Admin CMS or Admin Dashboards', () => {
  const telecallerRoutesFile = path.join(projectRoot, 'apps', 'telecaller-panel', 'src', 'routes', 'AppRoutes.jsx');
  const content = fs.readFileSync(telecallerRoutesFile, 'utf8');

  // Must have telecaller workspace
  assert.match(content, /TelecallerDashboardPage/);
  assert.match(content, /TelecallerLeadsPage/);
  assert.match(content, /TelecallerFollowUpsPage/);
  assert.match(content, /TelecallerProfilePage/);

  // Must NOT include CMS modules or Admin pages
  assert.doesNotMatch(content, /CMSDashboardPage/);
  assert.doesNotMatch(content, /CMSHomepagePage/);
  assert.doesNotMatch(content, /CMSPagesPage/);
  assert.doesNotMatch(content, /CMSAboutPage/);
  assert.doesNotMatch(content, /CreateTelecallerPage/);
  assert.doesNotMatch(content, /TelecallersListPage/);
});

test('5. Reusable Shared Firebase Configuration: Single source of truth', () => {
  const sharedConfig = path.join(projectRoot, 'shared', 'firebase', 'config.js');
  assert.ok(fs.existsSync(sharedConfig), 'shared/firebase/config.js must exist');

  const content = fs.readFileSync(sharedConfig, 'utf8');
  assert.match(content, /getAuth/);
  assert.match(content, /getFirestore/);
  assert.match(content, /getStorage/);
  assert.match(content, /getCloudMessaging/);
});

test('6. Deployment Configuration: Multi-target Firebase Hosting', () => {
  const firebaseJsonFile = path.join(projectRoot, 'firebase.json');
  assert.ok(fs.existsSync(firebaseJsonFile));

  const config = JSON.parse(fs.readFileSync(firebaseJsonFile, 'utf8'));
  assert.ok(Array.isArray(config.hosting), 'Hosting configuration must be an array of targets');

  const publicTarget = config.hosting.find(h => h.target === 'public');
  assert.ok(publicTarget, 'Public hosting target must exist');
  assert.equal(publicTarget.public, 'dist/public');

  const adminTarget = config.hosting.find(h => h.target === 'admin');
  assert.ok(adminTarget, 'Admin hosting target must exist');
  assert.equal(adminTarget.public, 'dist/admin');

  // Verify telecaller rewrite inside admin site
  const telecallerRewrite = adminTarget.rewrites.find(r => r.source === '/telecaller/**');
  assert.ok(telecallerRewrite, 'Telecaller SPA rewrite must exist in admin target');
  assert.equal(telecallerRewrite.destination, '/telecaller/index.html');
});
