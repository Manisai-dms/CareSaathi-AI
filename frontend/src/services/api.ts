const API_BASE = '/api';

export interface TreatmentDTO {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  description: string;
  indicative_min: number;
  indicative_max: number;
  package_code_pmjay?: string;
  package_code_aarogyasri?: string;
  standard_stay_duration: string;
  common_diagnostics_required: string[];
}

export interface CostBreakdownDTO {
  consultation_and_registration: number;
  diagnostics_and_lab: number;
  room_and_nursing: number;
  surgeon_ot_anesthesia: number;
  medicines_and_consumables: number;
  implant_or_prosthesis: number;
  rehabilitation_physiotherapy?: number;
  tax_and_admin: number;
}

export interface CostComponentItemDTO {
  component_name: string;
  min_cost: number;
  max_cost: number;
  source_name: string;
  source_url: string;
  effective_date: string;
  is_verified: boolean;
  status_label: string;
  description: string;
}

export interface OutOfPocketStepDTO {
  name: string;
  amount_min: number;
  amount_max: number;
  type: string;
  note: string;
}

export interface OutOfPocketWaterfallDTO {
  total_cost_min: number;
  total_cost_max: number;
  scheme_coverage_min: number;
  scheme_coverage_max: number;
  scheme_name: string;
  patient_share_min: number;
  patient_share_max: number;
  verification_status: string;
  steps: OutOfPocketStepDTO[];
}

export interface ChecklistDataDTO {
  questions_to_ask: string[];
  documents_to_carry: string[];
}

export interface TierComparisonItemDTO {
  tier_name: string;
  category_key?: string; // government, private, premium, charitable
  min_price: number;
  max_price: number;
  price_type?: string;
  source_name?: string;
  source_url?: string;
  last_updated?: string;
  confidence_level?: string;
  confidence_explanation?: string;
  ward_amenity: string;
  scheme_support: string;
  waiting_time: string;
  key_advantage: string;
  exemplar_facility: string;
  cost_breakdown?: CostBreakdownDTO;
  extra_expenses?: string[];
  exclusions?: string[];
}

export interface FacilityDTO {
  id: string;
  name: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  pin_code: string;
  lat: number;
  lng: number;
  ownership: string;
  facility_class?: string; // Standard, Premium
  recommendation_reason?: string;
  phone?: string;
  website?: string;
  rating?: number;
  verified_treatments: string[];
  empanelled_schemes: string[];
  room_types: Record<string, number>;
  last_verified_date: string;
  pricing_status?: string;
  price_confidence?: string;
  distance_km?: number;
  estimated_cost_min?: number;
  estimated_cost_max?: number;
  image_url?: string;
  image_source?: string;
  image_attribution?: string;
  image_license?: string;
  initials?: string;
}

export interface CostEstimateDTO {
  query_treatment: string;
  canonical_treatment?: TreatmentDTO;
  workflow: string;
  selected_facility?: FacilityDTO;
  overall_min: number;
  overall_max: number;
  currency: string;
  price_type: string;
  confidence: string;
  confidence_explanation: string;
  cost_breakdown: CostBreakdownDTO;
  detailed_components: CostComponentItemDTO[];
  waterfall?: OutOfPocketWaterfallDTO;
  checklists: ChecklistDataDTO;
  tier_comparisons: TierComparisonItemDTO[];
  comparable_facilities: FacilityDTO[];
  applicable_schemes: Array<{
    id: string;
    name: string;
    authority: string;
    package_code: string;
    coverage_limit: string;
    status: string;
    notes: string;
  }>;
  assumptions_and_exclusions: string[];
  disclaimer: string;
  data_freshness_date: string;
}

export interface NLPParseDTO {
  raw_query: string;
  detected_intent: string;
  extracted_treatment?: string;
  matched_treatment_id?: string;
  extracted_location?: string;
  extracted_budget?: number;
  extracted_hospital_preference?: string;
  detected_symptoms: string[];
  is_symptom_not_diagnosis: boolean;
  emergency_detected: boolean;
  emergency_interrupt_required?: boolean;
  triage_guidance?: string;
  clarification_question?: string;
  suggested_action: string;
}

export interface SchemeMatchDTO {
  scheme: {
    id: string;
    name: string;
    full_name: string;
    authority: string;
    coverage_limit_inr: string;
    eligibility_summary: string;
    eligible_categories: string[];
    states: string[];
    official_portal: string;
    helpline: string;
    required_documents: string[];
  };
  match_status: string;
  status_color: string;
  matching_reasons: string[];
  caution_notes: string[];
  package_reimbursement_estimate?: string;
  empanelment_status?: string;
  official_verification_url: string;
  helpline: string;
}

export interface PrescriptionOCRDTO {
  extracted_raw_text: string;
  confidence_score: number;
  detected_treatments: string[];
  detected_diagnostics: string[];
  detected_medicines: string[];
  requires_user_confirmation: boolean;
  notice: string;
  suggested_search_query?: string;
}

export interface TrustDashboardDataDTO {
  official_count: number;
  reference_count: number;
  illustrative_count: number;
  total_facilities: number;
  total_treatments: number;
  data_freshness_records: Array<{ source: string; date: string; authority: string }>;
  city_coverage: Record<string, number>;
  audit_completeness_pct: number;
  last_audit_date: string;
}

export interface MetadataResponse {
  app_name: string;
  version: string;
  total_facilities: number;
  total_treatments: number;
  supported_schemes: number;
  demo_mode: boolean;
  data_sources: Array<{ name: string; type: string; freshness: string }>;
  trust_metrics?: TrustDashboardDataDTO;
}

export interface GuidedChatResponseDTO {
  reply: string;
  emergency_detected: boolean;
  suggested_chips: string[];
  extracted_data?: Record<string, any>;
  structured_estimate?: CostEstimateDTO;
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getMetadata(): Promise<MetadataResponse> {
    const res = await fetch(`${API_BASE}/metadata`);
    return res.json();
  },

  async getTrustMetrics(): Promise<TrustDashboardDataDTO> {
    const res = await fetch(`${API_BASE}/trust/metrics`);
    return res.json();
  },

  async guidedChat(params: {
    message: string;
    treatment_id?: string;
    city?: string;
    history?: Array<{ role: string; content: string }>;
  }): Promise<GuidedChatResponseDTO> {
    const res = await fetch(`${API_BASE}/chat/guided`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async getTreatments(): Promise<TreatmentDTO[]> {
    const res = await fetch(`${API_BASE}/treatments`);
    return res.json();
  },

  async getTreatment(id: string): Promise<TreatmentDTO> {
    const res = await fetch(`${API_BASE}/treatments/${id}`);
    return res.json();
  },

  async parseNLP(text: string, currentLocation?: string): Promise<NLPParseDTO> {
    const res = await fetch(`${API_BASE}/nlp/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, current_location: currentLocation })
    });
    return res.json();
  },

  async estimateCost(params: {
    treatment: string;
    city?: string;
    locality?: string;
    hospital_name?: string;
    budget_limit?: number;
    room_category_preference?: string;
    ownership_preference?: string;
    annual_income?: number;
    ration_card_type?: string;
  }): Promise<CostEstimateDTO> {
    const res = await fetch(`${API_BASE}/cost/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async getFacilities(params?: {
    lat?: number;
    lng?: number;
    city?: string;
    locality?: string;
    pin?: string;
    treatment_id?: string;
    ownership?: string;
    scheme?: string;
    radius?: number;
    sort?: string;
    treatment_available_only?: boolean;
  }): Promise<FacilityDTO[]> {
    const url = new URL(`${API_BASE}/facilities`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          url.searchParams.append(k, String(v));
        }
      });
    }
    const res = await fetch(url.toString());
    return res.json();
  },

  async getFacility(id: string, treatmentId?: string): Promise<{
    facility: FacilityDTO;
    treatment_verified: boolean;
    treatment_status_text: string;
    treatment_details?: TreatmentDTO;
    directions_url: string;
    osm_url: string;
  }> {
    const url = new URL(`${API_BASE}/facilities/${id}`, window.location.origin);
    if (treatmentId) url.searchParams.append('treatment_id', treatmentId);
    const res = await fetch(url.toString());
    return res.json();
  },

  async compareFacilities(facilityIds: string[], treatmentId: string): Promise<{
    treatment: TreatmentDTO;
    facilities: FacilityDTO[];
    comparison_count: number;
  }> {
    const res = await fetch(`${API_BASE}/facilities/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facility_ids: facilityIds,
        treatment_id: treatmentId
      })
    });
    return res.json();
  },

  async matchSchemes(params: {
    treatment_id?: string;
    treatment_name?: string;
    state?: string;
    annual_income?: number;
    ration_card_type?: string;
    is_formal_sector_employed?: boolean;
    is_central_govt_employee?: boolean;
    selected_facility_id?: string;
  }): Promise<SchemeMatchDTO[]> {
    const res = await fetch(`${API_BASE}/schemes/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async ocrPrescription(file?: File, rawText?: string): Promise<PrescriptionOCRDTO> {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (rawText) formData.append('raw_text', rawText);

    const res = await fetch(`${API_BASE}/ocr/prescription`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  // --- Phase 3 Auth & User Services ---
  async register(name: string, email: string, password: string, language = 'en'): Promise<AuthResponseDTO> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, language })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<AuthResponseDTO> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid email or password');
    }
    return res.json();
  },

  async demoLogin(): Promise<AuthResponseDTO> {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (!res.ok) throw new Error('Demo login failed');
    return res.json();
  },

  async getMe(token: string): Promise<UserProfileDTO> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Session invalid');
    return res.json();
  },

  async saveComparison(token: string, facilityIds: string[], treatmentName: string): Promise<SavedComparisonDTO> {
    const res = await fetch(`${API_BASE}/user/saved-comparisons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ facility_ids: facilityIds, treatment_name: treatmentName })
    });
    if (!res.ok) throw new Error('Failed to save comparison');
    return res.json();
  },

  async getSavedComparisons(token: string): Promise<SavedComparisonDTO[]> {
    const res = await fetch(`${API_BASE}/user/saved-comparisons`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return res.json();
  },

  async deleteSavedComparison(token: string, id: string): Promise<void> {
    await fetch(`${API_BASE}/user/saved-comparisons/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  async getFacilityPhoto(facilityId: string): Promise<HospitalPhotoDTO> {
    const res = await fetch(`${API_BASE}/facilities/${facilityId}/photo`);
    if (!res.ok) {
      return {
        has_photo: false,
        image_url: null,
        initials: 'HSP',
        source: 'Branded Placeholder',
        attribution: 'CareSaathi Directory',
        license: 'Platform Original',
        is_verified: false
      };
    }
    return res.json();
  }
};

// Phase 3 DTOs
export interface UserProfileDTO {
  id: string;
  name: string;
  email: string;
  language: string;
}

export interface AuthResponseDTO {
  access_token: string;
  token_type: string;
  user: UserProfileDTO;
}

export interface SavedComparisonDTO {
  id: string;
  facility_ids: string[];
  treatment_name: string;
  created_at: string;
}

export interface HospitalPhotoDTO {
  has_photo: boolean;
  image_url: string | null;
  initials?: string;
  source: string;
  attribution: string;
  license: string;
  is_verified: boolean;
}

