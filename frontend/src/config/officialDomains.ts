// ==============================================================================
// CareSaathi AI - Official Government Scheme Portal Domain Allowlist & Validator
// Strict compliance: Only official .gov.in, .nic.in, or authorized statutory authority domains.
// Rejects aggregators, blogs, commercial brokerages, or unverified third-party portals.
// ==============================================================================

export const OFFICIAL_SCHEME_DOMAINS_ALLOWLIST = [
  'gov.in',
  'nic.in',
  'cmchistn.com',         // Official Tamil Nadu Chief Minister Comprehensive Health Insurance Project
  'www.cmchistn.com'
] as const;

/**
 * Validates whether a scheme portal URL is HTTPS and belongs to an authorized government domain.
 */
export function isValidOfficialPortalUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      return false;
    }
    
    const hostname = parsed.hostname.toLowerCase();
    
    // Check if hostname ends with .gov.in or .nic.in or matches explicit allowlist
    const isAllowed = OFFICIAL_SCHEME_DOMAINS_ALLOWLIST.some(domain => {
      if (domain === 'gov.in') return hostname === 'gov.in' || hostname.endsWith('.gov.in');
      if (domain === 'nic.in') return hostname === 'nic.in' || hostname.endsWith('.nic.in');
      return hostname === domain || hostname.endsWith(`.${domain}`);
    });
    
    return isAllowed;
  } catch {
    return false;
  }
}
