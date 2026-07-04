import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, 'features');
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

const ROUTES = [
  { name: 'home',               path: '/',                           role: 'public' },
  { name: 'login',              path: '/login',                      role: 'public' },
  { name: 'admin-dashboard',    path: '/admin/dashboard',            role: 'admin' },
  { name: 'admin-patients',     path: '/admin/patients',             role: 'admin' },
  { name: 'admin-doctors',      path: '/admin/doctors',              role: 'admin' },
  { name: 'admin-appointments', path: '/admin/appointments',         role: 'admin' },
  { name: 'admin-inventory',    path: '/admin/inventory',            role: 'admin' },
  { name: 'admin-system-services', path: '/admin/services',          role: 'admin' },
  { name: 'admin-settings',     path: '/admin/settings',             role: 'admin' },
  { name: 'admin-profile',      path: '/admin/profile',              role: 'admin' },
  { name: 'doctor-dashboard',   path: '/doctor/dashboard',           role: 'doctor' },
  { name: 'doctor-appointments', path: '/doctor/appointments',       role: 'doctor' },
  { name: 'doctor-calendar',    path: '/doctor/calendar',            role: 'doctor' },
  { name: 'doctor-patients',    path: '/doctor/patients',            role: 'doctor' },
  { name: 'doctor-profile',     path: '/doctor/profile',             role: 'doctor' },
  { name: 'patient-dashboard',  path: '/patient/dashboard',          role: 'patient' },
  { name: 'patient-appointments', path: '/patient/appointments',     role: 'patient' },
  { name: 'patient-profile',    path: '/patient/profile',            role: 'patient' },
  { name: 'doctor-add-treatment', path: '/doctor/appointments/1/add-treatment', role: 'doctor' },
  { name: 'doctor-patient-detail', path: '/doctor/patients/1',       role: 'doctor' },
];

function getFakeUser(role) {
  if (role === 'admin') return FAKE_USER_ADMIN;
  if (role === 'doctor') return FAKE_USER_DOCTOR;
  if (role === 'patient') return FAKE_USER_PATIENT;
  return null;
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  for (const route of ROUTES) {
    console.log(`\n[${route.name}] ${route.path}`);
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    if (route.role !== 'public') {
      await ctx.addCookies([{
        name: 'dc_access_token',
        value: encodeURIComponent('mock-token-for-screenshot'),
        domain: 'localhost',
        path: '/',
      }]);

      const fakeUser = getFakeUser(route.role);

      // Single route handler for all API calls
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

        // For GET list endpoints, return empty array
        if (method === 'GET') {
          return r.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        }
        return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      });
    }

    try {
      await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(3000);
      console.log(`    Final URL: ${page.url()}`);
      await page.screenshot({ path: resolve(OUT, `${route.name}.png`), fullPage: true });
      console.log(`    OK`);
    } catch (err) {
      console.error(`    FAILED: ${err.message}`);
      try {
        console.log(`    Final URL: ${page.url()}`);
        await page.screenshot({ path: resolve(OUT, `${route.name}.png`), fullPage: true });
      } catch { /* ignore */ }
    } finally {
      await page.close();
      await ctx.close();
    }
  }

  await browser.close();
  console.log('\nDone!');
}

main().catch(err => { console.error(err); process.exit(1); });
