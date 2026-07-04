import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FEATURES = resolve(__dirname, 'features');
const BASE = 'http://localhost:3000';

const FAKE_USER_ADMIN = {
  id: '1', email: 'admin@denti.code', roles: ['ADMIN'],
  firstName: 'Admin', lastName: 'User', preferredLocale: 'en', avatarUrl: null,
};
const FAKE_USER_DOCTOR = {
  id: '2', email: 'doctor@denti.code', roles: ['DOCTOR'],
  firstName: 'Doctor', lastName: 'User', preferredLocale: 'en', avatarUrl: null,
};
const FAKE_USER_PATIENT = {
  id: '3', email: 'patient@denti.code', roles: ['PATIENT'],
  firstName: 'Patient', lastName: 'User', preferredLocale: 'en', avatarUrl: null,
};

function getFakeUser(role) {
  if (role === 'admin') return FAKE_USER_ADMIN;
  if (role === 'doctor') return FAKE_USER_DOCTOR;
  if (role === 'patient') return FAKE_USER_PATIENT;
  return null;
}

async function setupApiMocks(page, role) {
  if (role === 'public') return;
  const fakeUser = getFakeUser(role);

  await page.route(/\/api\/gateway\//, async r => {
    const url = r.request().url();
    const method = r.request().method();

    if (url.endsWith('/auth/profile')) {
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fakeUser) });
    }
    if (url.endsWith('/auth/locale')) {
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        defaultLocale: 'en',
        supportedLocales: [{ code: 'en', label: 'English' }, { code: 'es', label: 'Español' }]
      })});
    }
    if (url.endsWith('/services/status')) {
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        checkedAt: new Date().toISOString(), services: []
      })});
    }
    if (url.includes('/notifications')) {
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [] }) });
    }

    if (method === 'GET') {
      return r.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

const PAGES = [
  { name: 'home',          path: '/',                     role: 'public',  dir: 'public' },
  { name: 'login',         path: '/login',                role: 'public',  dir: 'public' },
  { name: 'dashboard',     path: '/admin/dashboard',      role: 'admin',   dir: 'admin' },
  { name: 'patients',      path: '/admin/patients',       role: 'admin',   dir: 'admin' },
  { name: 'doctors',       path: '/admin/doctors',        role: 'admin',   dir: 'admin' },
  { name: 'appointments',  path: '/admin/appointments',   role: 'admin',   dir: 'admin' },
  { name: 'inventory',     path: '/admin/inventory',      role: 'admin',   dir: 'admin' },
  { name: 'system-services', path: '/admin/services',     role: 'admin',   dir: 'admin' },
  { name: 'settings',      path: '/admin/settings',       role: 'admin',   dir: 'admin' },
  { name: 'profile',       path: '/admin/profile',        role: 'admin',   dir: 'admin' },
  { name: 'dashboard',     path: '/doctor/dashboard',     role: 'doctor',  dir: 'doctor' },
  { name: 'appointments',  path: '/doctor/appointments',  role: 'doctor',  dir: 'doctor' },
  { name: 'add-treatment', path: '/doctor/appointments/1/add-treatment', role: 'doctor', dir: 'doctor' },
  { name: 'calendar',      path: '/doctor/calendar',      role: 'doctor',  dir: 'doctor' },
  { name: 'patients',      path: '/doctor/patients',      role: 'doctor',  dir: 'doctor' },
  { name: 'patient-detail', path: '/doctor/patients/1',   role: 'doctor',  dir: 'doctor' },
  { name: 'profile',       path: '/doctor/profile',       role: 'doctor',  dir: 'doctor' },
  { name: 'dashboard',     path: '/patient/dashboard',    role: 'patient', dir: 'patient' },
  { name: 'appointments',  path: '/patient/appointments', role: 'patient', dir: 'patient' },
  { name: 'profile',       path: '/patient/profile',      role: 'patient', dir: 'patient' },
];

async function capturePage(browser, pageDef) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  if (pageDef.role !== 'public') {
    await ctx.addCookies([{
      name: 'dc_access_token',
      value: encodeURIComponent('mock-token-for-screenshot'),
      domain: 'localhost', path: '/',
    }]);
  }

  await setupApiMocks(page, pageDef.role);

  const outDir = resolve(FEATURES, pageDef.dir);
  ensureDir(outDir);
  const outPath = resolve(outDir, `${pageDef.name}.png`);

  try {
    await page.goto(`${BASE}${pageDef.path}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`  OK  ${pageDef.dir}/${pageDef.name}.png`);
  } catch (err) {
    console.error(`  FAIL ${pageDef.dir}/${pageDef.name}.png: ${err.message}`);
  } finally {
    await page.close();
    await ctx.close();
  }
}

async function captureGeneralFeatures(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await ctx.addCookies([{
    name: 'dc_access_token',
    value: encodeURIComponent('mock-token-for-screenshot'),
    domain: 'localhost', path: '/',
  }]);
  await setupApiMocks(page, 'doctor');

  // Mock notifications endpoint with sample data
  await page.route(/\/api\/gateway\/notifications/, async r => {
    await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
      notifications: [
        { id: '1', type: 'appointment_reminder', title: 'Appointment Reminder', message: 'Alice Johnson at 09:00', read: false, createdAt: new Date().toISOString(), link: null },
        { id: '2', type: 'new_patient', title: 'New Patient Registered', message: 'Bob Martinez has been registered', read: false, createdAt: new Date(Date.now() - 3600000).toISOString(), link: null },
        { id: '3', type: 'status_change', title: 'Status Update', message: 'Appointment #42 confirmed', read: true, createdAt: new Date(Date.now() - 7200000).toISOString(), link: null },
      ]
    })});
  });

  // Navigate to doctor dashboard
  await page.goto(`${BASE}/doctor/dashboard`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);

  // --- Notifications: click bell to open dropdown ---
  try {
    const bellBtn = page.locator('button[aria-label*="notification" i], button[aria-label*="bell" i], [data-testid="notification-bell"], button:has(svg), .notification-bell, button').filter({ hasText: /notifications/i }).first();
    // Try clicking any button in the header area that looks like a notification bell
    const headerButtons = page.locator('header button, [class*="header"] button, nav button');
    const count = await headerButtons.count();
    // Click the last few buttons (usually bell + avatar are on the right)
    for (let i = count - 2; i < count && i >= 0; i++) {
      const btn = headerButtons.nth(i);
      const text = await btn.textContent().catch(() => '');
      if (!text || text.trim() === '') {
        await btn.click().catch(() => {});
        break;
      }
    }
    await page.waitForTimeout(1000);
    const outDir = resolve(FEATURES, 'general');
    ensureDir(outDir);
    await page.screenshot({ path: resolve(outDir, 'notifications.png'), fullPage: false });
    console.log('  OK  general/notifications.png');
  } catch (err) {
    console.error(`  FAIL general/notifications.png: ${err.message}`);
  }

  // --- Language Switcher ---
  try {
    await page.goto(`${BASE}/doctor/dashboard`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);
    // Look for language switcher (select or button with EN/ES)
    const langSelect = page.locator('select:has(option[value="en"]), select:has(option[value="es"]), button:has-text("EN"), button:has-text("ES"), [class*="language"]').first();
    await langSelect.click().catch(() => {});
    await page.waitForTimeout(800);
    const outDir = resolve(FEATURES, 'general');
    ensureDir(outDir);
    await page.screenshot({ path: resolve(outDir, 'language-switcher.png'), fullPage: false });
    console.log('  OK  general/language-switcher.png');
  } catch (err) {
    console.error(`  FAIL general/language-switcher.png: ${err.message}`);
  }

  // --- Session Management: screenshot showing the auth/session flow info ---
  // This is a background concern; capture the profile page which shows session info
  try {
    await page.goto(`${BASE}/doctor/profile`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);
    const outDir = resolve(FEATURES, 'general');
    ensureDir(outDir);
    await page.screenshot({ path: resolve(outDir, 'session-management.png'), fullPage: true });
    console.log('  OK  general/session-management.png');
  } catch (err) {
    console.error(`  FAIL general/session-management.png: ${err.message}`);
  }

  await page.close();
  await ctx.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  console.log('--- Page screenshots ---');
  for (const p of PAGES) {
    await capturePage(browser, p);
  }

  console.log('\n--- General feature screenshots ---');
  await captureGeneralFeatures(browser);

  await browser.close();
  console.log('\nDone!');
}

main().catch(err => { console.error(err); process.exit(1); });
