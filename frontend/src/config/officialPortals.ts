/**
 * Official Government Portal Domain Allowlist & Validation.
 * Strictly permits official government (.gov.in, .nic.in) and statutory state trust domains.
 * Rejects aggregator, blog, or unofficial third-party domains.
 */

export const ALLOWED_OFFICIAL_DOMAINS: string[] = [
  // National Portals
  'pmjay.gov.in',
  'beneficiary.nha.gov.in',
  'nha.gov.in',
  'cghs.nic.in',
  'cghs.gov.in',
  'esic.gov.in',
  'janaushadhi.gov.in',

  // Telangana
  'aarogyasri.telangana.gov.in',
  'telangana.gov.in',

  // Maharashtra
  'jeevandayee.gov.in',

  // Karnataka
  'arogya.karnataka.gov.in',
  'karnataka.gov.in',

  // Andhra Pradesh
  'aarogyasri.ap.gov.in',
  'ap.gov.in',

  // Gujarat
  'pmjay.gujarat.gov.in',
  'gujarat.gov.in',

  // West Bengal
  'swasthyasathi.gov.in',
  'wb.gov.in',

  // Kerala
  'sha.kerala.gov.in',
  'kerala.gov.in',

  // Tamil Nadu (Statutory Trust)
  'cmchistn.com',
  'www.cmchistn.com',
  'tn.gov.in',

  // Rajasthan
  'chiranjeevi.rajasthan.gov.in',
  'rajasthan.gov.in',

  // Uttar Pradesh
  'sachis.up.gov.in',
  'up.gov.in',

  // Delhi
  'dghs.delhi.gov.in',
  'delhi.gov.in'
];

export interface PortalValidationResult {
  isValid: boolean;
  statusLabel: 'Verified Official Portal' | 'Not verified';
  reason: string;
}

export function validateOfficialPortalUrl(url?: string | null): PortalValidationResult {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return {
      isValid: false,
      statusLabel: 'Not verified',
      reason: 'No portal URL provided'
    };
  }

  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') {
      return {
        isValid: false,
        statusLabel: 'Not verified',
        reason: 'URL must use secure HTTPS protocol'
      };
    }

    const hostname = parsed.hostname.toLowerCase();
    const isAllowed = ALLOWED_OFFICIAL_DOMAINS.some(allowed => 
      hostname === allowed || 
      hostname.endsWith('.' + allowed) || 
      hostname.endsWith('.gov.in') || 
      hostname.endsWith('.nic.in')
    );

    if (isAllowed) {
      return {
        isValid: true,
        statusLabel: 'Verified Official Portal',
        reason: `Verified authority domain: ${hostname}`
      };
    }

    return {
      isValid: false,
      statusLabel: 'Not verified',
      reason: `Domain '${hostname}' is outside the verified official government allowlist`
    };
  } catch {
    return {
      isValid: false,
      statusLabel: 'Not verified',
      reason: 'Malformed URL structure'
    };
  }
}
