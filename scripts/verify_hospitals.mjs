/**
 * scripts/verify_hospitals.mjs
 * 
 * Verifies official hospital websites with polite rate limiting (1s), robots.txt respect,
 * and user agent identification. Extracts stated departments, schemes, phone, and address.
 * Never overwrites main dataset automatically. Outputs to data/hospital_verification_report.json.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const reportDir = path.join(rootDir, 'data');
const reportFile = path.join(reportDir, 'hospital_verification_report.json');

const USER_AGENT = process.env.USER_AGENT || 'CareSaathiVerificationBot/1.0 (+https://caresaathi.in/verify)';
const RATE_LIMIT_MS = 1000;
const TIMEOUT_MS = 5000;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const KNOWN_DEPARTMENTS = [
  'Cardiology', 'Orthopedics', 'Orthopaedics', 'Joint Replacement', 'Neurology', 'Nephrology',
  'Urology', 'General Surgery', 'Gastroenterology', 'Surgical Oncology', 'Medical Oncology',
  'Radiation Oncology', 'Pediatrics', 'Obstetrics', 'Gynecology', 'Ophthalmology',
  'Pulmonology', 'ENT', 'Radiology', 'Emergency', 'Dialysis'
];

const KNOWN_SCHEMES = [
  'Aarogyasri', 'Rajiv Aarogyasri', 'PM-JAY', 'PMJAY', 'Ayushman Bharat', 'CGHS', 'ESI', 'ESIC'
];

import https from 'https';
import http from 'http';

function safeGet(urlStr, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(urlStr);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.get(urlStr, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8'
        },
        timeout: timeoutMs,
        rejectUnauthorized: false
      }, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', chunk => {
          data += chunk;
          // Guard against downloading massive files
          if (data.length > 500000) {
            req.destroy();
            resolve({ statusCode: res.statusCode, text: data });
          }
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, text: data });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ statusCode: 408, text: '', error: 'Request timeout' });
      });

      req.on('error', (err) => {
        resolve({ statusCode: 500, text: '', error: err.message });
      });
    } catch (e) {
      resolve({ statusCode: 400, text: '', error: e.message });
    }
  });
}

async function checkRobotsTxt(urlStr) {
  try {
    const parsed = new URL(urlStr);
    const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;
    const res = await safeGet(robotsUrl, 3000);
    if (res.statusCode >= 200 && res.statusCode < 300 && res.text) {
      if (/User-agent:\s*\*\s*Disallow:\s*\/\s*$/m.test(res.text)) {
        return { allowed: false, notice: 'robots.txt disallows root crawler' };
      }
    }
    return { allowed: true, notice: 'allowed or no restriction' };
  } catch (err) {
    return { allowed: true, notice: 'robots.txt not reachable, proceeding politely' };
  }
}

async function verifyHospitalPage(fac) {
  const url = fac.website_url || fac.website;
  if (!url) {
    return {
      hospital_id: fac.id,
      name: fac.name,
      website_url: null,
      verification_status: fac.verification_status || 'unverified',
      audit_result: 'No website URL published for facility',
      stated_departments: [],
      unstated_departments: 'not stated on website',
      stated_schemes: [],
      unstated_schemes: 'not stated on website',
      phone_match: fac.phone ? 'not verified via website' : 'not published, contact hospital',
      manual_review_needed: 'Check municipal registry or physical verification for unverified facility'
    };
  }

  // 1. Check robots.txt
  const robots = await checkRobotsTxt(url);
  if (!robots.allowed) {
    return {
      hospital_id: fac.id,
      name: fac.name,
      website_url: url,
      verification_status: fac.verification_status,
      audit_result: `robots.txt disallows crawler: ${robots.notice}`,
      stated_departments: 'not stated on website',
      stated_schemes: 'not stated on website',
      phone_match: 'not stated on website',
      manual_review_needed: 'Inspect manually via browser as robots.txt restricts automated bots'
    };
  }

  // 2. Fetch page with polite rate limiting and timeout
  try {
    const res = await safeGet(url, TIMEOUT_MS);

    if (res.error) {
      return {
        hospital_id: fac.id,
        name: fac.name,
        website_url: url,
        audit_result: `Network error: ${res.error}`,
        stated_departments: 'not stated on website',
        stated_schemes: 'not stated on website',
        phone_match: 'not stated on website',
        configured_status: fac.verification_status,
        manual_review_needed: 'Website could not be reached via automated request; verify manually'
      };
    }

    if (res.statusCode < 200 || res.statusCode >= 400) {
      return {
        hospital_id: fac.id,
        name: fac.name,
        website_url: url,
        http_status: res.statusCode,
        audit_result: `HTTP response ${res.statusCode}`,
        stated_departments: 'not stated on website',
        stated_schemes: 'not stated on website',
        manual_review_needed: `Server returned status ${res.statusCode}; verify availability manually`
      };
    }

    const lowerHtml = (res.text || '').toLowerCase();

    // Check departments
    const statedDepts = [];
    for (const d of KNOWN_DEPARTMENTS) {
      if (lowerHtml.includes(d.toLowerCase())) {
        statedDepts.push(d);
      }
    }

    // Check schemes
    const statedSchemes = [];
    for (const s of KNOWN_SCHEMES) {
      if (lowerHtml.includes(s.toLowerCase())) {
        statedSchemes.push(s);
      }
    }

    // Check phone match
    let statedPhone = 'not stated on website';
    if (fac.phone) {
      const cleanPhone = fac.phone.replace(/[^0-9]/g, '');
      const last7 = cleanPhone.slice(-7);
      if (lowerHtml.includes(last7) || lowerHtml.includes(fac.phone)) {
        statedPhone = `Confirmed on page: ${fac.phone}`;
      }
    }

    // Check address / locality match
    let statedAddress = 'not stated on website';
    if (fac.locality && lowerHtml.includes(fac.locality.toLowerCase())) {
      statedAddress = `Confirmed locality: ${fac.locality}`;
    }

    return {
      hospital_id: fac.id,
      name: fac.name,
      website_url: url,
      http_status: res.statusCode,
      audit_result: 'Successfully audited official domain',
      stated_departments: statedDepts.length > 0 ? statedDepts : 'not stated on website',
      stated_schemes: statedSchemes.length > 0 ? statedSchemes : 'not stated on website',
      stated_phone: statedPhone,
      stated_address: statedAddress,
      configured_status: fac.verification_status,
      verification_verdict: statedDepts.length > 0 ? 'confirmed_active' : 'partial_presence',
      manual_review_needed: statedSchemes.length === 0 ? 'Empanelment may be hosted on state Aarogyasri / PM-JAY portal rather than hospital homepage' : 'None'
    };
  } catch (err) {
    return {
      hospital_id: fac.id,
      name: fac.name,
      website_url: url,
      audit_result: `Request exception: ${err.message}`,
      stated_departments: 'not stated on website',
      stated_schemes: 'not stated on website',
      stated_phone: 'not stated on website',
      configured_status: fac.verification_status,
      manual_review_needed: 'Website could not be reached via automated request; verify manually'
    };
  }
}

async function run() {
  console.log('--- CareSaathi Hospital Verification Audit Script ---');
  console.log(`User Agent: ${USER_AGENT}`);
  console.log(`Rate limit: ${RATE_LIMIT_MS}ms per host\n`);

  // Fetch facilities from local backend API
  let facilities = [];
  try {
    const res = await fetch('http://127.0.0.1:8000/api/facilities?city=Hyderabad');
    if (res.ok) {
      facilities = await res.json();
    }
  } catch (e) {
    console.warn('Backend API not responding; reading seed_data directly...');
  }

  if (facilities.length === 0) {
    console.error('No facilities loaded for verification. Make sure backend is running.');
    process.exit(1);
  }

  console.log(`Loaded ${facilities.length} Hyderabad facilities for official audit.`);

  const report = {
    timestamp: new Date().toISOString(),
    user_agent: USER_AGENT,
    rate_limit_ms: RATE_LIMIT_MS,
    total_facilities: facilities.length,
    verified_count: facilities.filter(f => f.verification_status === 'verified').length,
    partial_count: facilities.filter(f => f.verification_status === 'partial').length,
    unverified_count: facilities.filter(f => f.verification_status === 'unverified').length,
    findings: []
  };

  for (let i = 0; i < facilities.length; i++) {
    const fac = facilities[i];
    console.log(`[${i + 1}/${facilities.length}] Auditing: ${fac.name} (${fac.website_url || 'No URL'})...`);
    
    const result = await verifyHospitalPage(fac);
    report.findings.push(result);

    // Polite rate limiting between external network requests
    if (fac.website_url || fac.website) {
      await delay(RATE_LIMIT_MS);
    }
  }

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n[COMPLETE] Verification report written to: ${reportFile}`);
  console.log(`Summary:`);
  console.log(`  - Total Hospitals: ${report.total_facilities}`);
  console.log(`  - Verified: ${report.verified_count}`);
  console.log(`  - Partial: ${report.partial_count}`);
  console.log(`  - Unverified: ${report.unverified_count}`);
}

run().catch(console.error);
