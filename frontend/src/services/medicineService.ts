/**
 * CareSaathi AI - Medicine Rate Master & NPPA / Jan Aushadhi Sahi Daam Engine
 * 
 * Provides:
 * 1. Statutory Rate Master conforming to NPPA Ceiling Orders & PMBJP Rate Schedules
 * 2. Prefix & Fuzzy matching on Brand Name and Active Salt (e.g. "dola" -> Dolo 650)
 * 3. Exact unit-based calculations (strips vs tablets) with zero invented rates
 * 4. Official Pharma Sahi Daam portal URL constant with fallback advisory
 */

import rawMedicinesData from '../data/medicines.json';

export type PriceType = "CEILING" | "MRP_NON_SCHEDULED";

export interface MedicineRecord {
  brandName: string;
  activeSalt: string;
  strength: string;
  dosageForm: string;
  packSize: number;
  mrpPerStrip: number;
  mrpPerUnit: number;
  priceType: PriceType;
  ceilingPricePerUnit: number | null;
  ceilingNotificationRef: string | null;
  janAushadhiProductName: string;
  janAushadhiPricePerStrip: number;
  janAushadhiPricePerUnit: number;
  source: string;
  lastVerifiedDate: string;
}

export type QuantityUnit = 'strips' | 'tablets';

export interface MedicineCartItem {
  id: string;
  medicine: MedicineRecord | null;
  customName?: string;
  quantity: number;
  unit: QuantityUnit;
}

export interface MedicineCalculationRow {
  id: string;
  brandName: string;
  activeSalt: string;
  strength: string;
  dosageForm: string;
  packSize: number;
  quantity: number;
  unit: QuantityUnit;
  totalUnits: number;
  priceType: PriceType | 'UNVERIFIED';
  ceilingNotificationRef: string | null;
  mrpPerStrip: number | null;
  mrpPerUnit: number | null;
  janAushadhiProductName: string | null;
  janAushadhiPricePerStrip: number | null;
  janAushadhiPricePerUnit: number | null;
  totalBrandedCost: number | null;
  totalJanAushadhiCost: number | null;
  savings: number | null;
  savingsPct: number | null;
  isVerified: boolean;
  source: string;
  lastVerifiedDate: string;
}

export interface MedicineTotalsSummary {
  totalBranded: number;
  totalJanAushadhi: number;
  totalSavings: number;
  savingsPercentage: number;
  hasUnverified: boolean;
  verifiedCount: number;
  unverifiedCount: number;
}

/**
 * Official Pharma Sahi Daam web portal URL where Pharma Jan Samadhan was merged in June 2026.
 * Single source of truth constant for NPPA portal link updates.
 */
export const NPPA_PORTAL_URL = 'https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/';

export const MEDICINES_DATASET: MedicineRecord[] = rawMedicinesData as MedicineRecord[];

/**
 * Levenshtein distance for fuzzy typo matching
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Fuzzy & prefix matching on brandName and activeSalt.
 * Supports typos like "dola" -> "Dolo 650", "panto" -> "Pan 40", "paracetmol" -> "Dolo 650"
 */
export function searchMedicines(query: string): MedicineRecord[] {
  if (!query || query.trim().length === 0) {
    return MEDICINES_DATASET.slice(0, 6);
  }

  const cleanQuery = query.trim().toLowerCase();
  const queryTokens = cleanQuery.split(/[\s,+/]+/).filter(Boolean);

  const scored: Array<{ record: MedicineRecord; score: number }> = [];

  for (const record of MEDICINES_DATASET) {
    const brandLower = record.brandName.toLowerCase();
    const saltLower = record.activeSalt.toLowerCase();
    const strengthLower = record.strength.toLowerCase();

    let score = 0;

    // 1. Exact prefix match on brand
    if (brandLower.startsWith(cleanQuery)) {
      score += 100;
    } else if (brandLower.includes(cleanQuery)) {
      score += 60;
    }

    // 2. Exact prefix match on salt
    if (saltLower.startsWith(cleanQuery)) {
      score += 80;
    } else if (saltLower.includes(cleanQuery)) {
      score += 50;
    }

    // 3. Token-level matching
    let allTokensMatched = true;
    for (const token of queryTokens) {
      const tokenInBrand = brandLower.includes(token);
      const tokenInSalt = saltLower.includes(token);
      const tokenInStrength = strengthLower.includes(token);

      if (tokenInBrand || tokenInSalt || tokenInStrength) {
        score += 25;
      } else {
        // Fuzzy token check (Levenshtein distance <= 1 for short, <= 2 for words >= 5)
        const brandWords = brandLower.split(/[\s,+/]+/).filter(Boolean);
        const saltWords = saltLower.split(/[\s,+/]+/).filter(Boolean);
        const allWords = [...brandWords, ...saltWords];

        let fuzzyMatched = false;
        for (const word of allWords) {
          const maxDist = token.length <= 4 ? 1 : 2;
          const dist = levenshteinDistance(token, word);
          if (dist <= maxDist) {
            score += Math.max(5, 20 - dist * 5);
            fuzzyMatched = true;
            break;
          }
          // Prefix similarity check (e.g. "dola" vs "dolo")
          if (word.length >= 3 && token.length >= 3) {
            const prefixLen = Math.min(token.length, word.length);
            const prefixDist = levenshteinDistance(token.slice(0, prefixLen), word.slice(0, prefixLen));
            if (prefixDist <= 1) {
              score += 15;
              fuzzyMatched = true;
              break;
            }
          }
        }

        if (!fuzzyMatched) {
          allTokensMatched = false;
        }
      }
    }

    if (allTokensMatched) {
      score += 30;
    }

    if (score > 10) {
      scored.push({ record, score });
    }
  }

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);

  return scored.map(s => s.record);
}

/**
 * Calculates row breakdown from cart item with explicit strip/tablet conversions
 */
export function calculateRow(item: MedicineCartItem): MedicineCalculationRow {
  const med = item.medicine;
  const qty = Math.max(1, item.quantity);
  const unit = item.unit || 'strips';

  if (!med) {
    return {
      id: item.id,
      brandName: item.customName || 'Unregistered Medicine',
      activeSalt: 'Unverified salt',
      strength: 'N/A',
      dosageForm: 'Unit',
      packSize: 1,
      quantity: qty,
      unit,
      totalUnits: qty,
      priceType: 'UNVERIFIED',
      ceilingNotificationRef: null,
      mrpPerStrip: null,
      mrpPerUnit: null,
      janAushadhiProductName: null,
      janAushadhiPricePerStrip: null,
      janAushadhiPricePerUnit: null,
      totalBrandedCost: null,
      totalJanAushadhiCost: null,
      savings: null,
      savingsPct: null,
      isVerified: false,
      source: 'Not in statutory database',
      lastVerifiedDate: 'Unverified'
    };
  }

  const packSize = Math.max(1, med.packSize);
  let totalUnits = qty;
  let totalBrandedCost = 0;
  let totalJanAushadhiCost = 0;

  if (unit === 'strips') {
    totalUnits = qty * packSize;
    totalBrandedCost = Math.round(qty * med.mrpPerStrip * 100) / 100;
    totalJanAushadhiCost = Math.round(qty * med.janAushadhiPricePerStrip * 100) / 100;
  } else {
    // Unit is tablets/individual units
    totalUnits = qty;
    totalBrandedCost = Math.round(qty * med.mrpPerUnit * 100) / 100;
    totalJanAushadhiCost = Math.round(qty * med.janAushadhiPricePerUnit * 100) / 100;
  }

  const savings = Math.max(0, Math.round((totalBrandedCost - totalJanAushadhiCost) * 100) / 100);
  const savingsPct = totalBrandedCost > 0 ? Math.round((savings / totalBrandedCost) * 100) : 0;

  return {
    id: item.id,
    brandName: med.brandName,
    activeSalt: med.activeSalt,
    strength: med.strength,
    dosageForm: med.dosageForm,
    packSize,
    quantity: qty,
    unit,
    totalUnits,
    priceType: med.priceType,
    ceilingNotificationRef: med.ceilingNotificationRef,
    mrpPerStrip: med.mrpPerStrip,
    mrpPerUnit: med.mrpPerUnit,
    janAushadhiProductName: med.janAushadhiProductName,
    janAushadhiPricePerStrip: med.janAushadhiPricePerStrip,
    janAushadhiPricePerUnit: med.janAushadhiPricePerUnit,
    totalBrandedCost,
    totalJanAushadhiCost,
    savings,
    savingsPct,
    isVerified: true,
    source: med.source,
    lastVerifiedDate: med.lastVerifiedDate
  };
}

/**
 * Computes overall totals for the medicine cart
 */
export function calculateTotals(rows: MedicineCalculationRow[]): MedicineTotalsSummary {
  let totalBranded = 0;
  let totalJanAushadhi = 0;
  let verifiedCount = 0;
  let unverifiedCount = 0;

  for (const row of rows) {
    if (row.isVerified && row.totalBrandedCost !== null && row.totalJanAushadhiCost !== null) {
      totalBranded += row.totalBrandedCost;
      totalJanAushadhi += row.totalJanAushadhiCost;
      verifiedCount++;
    } else {
      unverifiedCount++;
    }
  }

  totalBranded = Math.round(totalBranded * 100) / 100;
  totalJanAushadhi = Math.round(totalJanAushadhi * 100) / 100;
  const totalSavings = Math.max(0, Math.round((totalBranded - totalJanAushadhi) * 100) / 100);
  const savingsPercentage = totalBranded > 0 ? Math.round((totalSavings / totalBranded) * 100) : 0;

  return {
    totalBranded,
    totalJanAushadhi,
    totalSavings,
    savingsPercentage,
    hasUnverified: unverifiedCount > 0,
    verifiedCount,
    unverifiedCount
  };
}
