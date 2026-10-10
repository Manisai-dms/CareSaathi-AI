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
  website_url?: string;
  source_urls?: string[];
  verified_at?: string;
  verification_status?: 'verified' | 'partial' | 'unverified';
  departments?: string[];
  schemes_detail?: Array<{ scheme_code: string; scheme_name: string; status: string; source_url?: string }>;
  tariff_detail?: { type: 'published' | 'reference estimate' | 'not available'; min_cost?: number; max_cost?: number; source_url?: string; label?: string };
  specialty_match?: boolean;
  why_this_hospital?: string;
  rank_score?: number;
  // Google runtime enrichment fields
  road_distance_km?: number;
  road_duration_mins?: number;
  is_live_traffic?: boolean;
  place_id?: string;
  google_photos?: Array<{ url: string; attribution: string }>;
  google_rating?: number;
  google_user_rating_count?: number;
  google_is_open_now?: boolean;
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

export interface DetectedMedicineDetailDTO {
  medicine_id: string;
  name: string;
  generic_name: string;
  strength: string;
  formulation: string;
  frequency: string;
  duration: string;
  quantity: number;
  cost_branded: number;
  cost_jan_aushadhi: number;
  generic_alternative: string;
  source: string;
  is_verified: boolean;
  is_uncertain: boolean;
  visibly_extracted_text: string;
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
  detected_language?: string;
  detected_medicines_detailed?: DetectedMedicineDetailDTO[];
  uncertain_regions?: string[];
  is_handwritten?: boolean;
  image_quality_notes?: string;
  visibly_extracted_lines?: string[];
}

export interface SpeechTranscribeDTO {
  transcript: string;
  detected_language: string;
  confidence?: number | null;
  confidence_label: string;
  is_code_switched: boolean;
  original_script: string;
  provider: string;
  is_fallback: boolean;
  status: string;
  message?: string | null;
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

export interface HospitalCardDTO {
  id: string;
  name: string;
  ownership: string;
  locality?: string;
  city: string;
  pricing_status: string;
  phone?: string;
}

export interface PrescriptionCardDTO {
  is_handwritten?: boolean;
  uncertain_regions?: string[];
  notice?: string;
  total_branded?: number;
  total_jan_aushadhi?: number;
  savings?: number;
  medicines?: DetectedMedicineDetailDTO[];
}

export interface GuidedChatResponseDTO {
  reply: string;
  reply_language?: string;
  emergency_detected: boolean;
  suggested_chips: string[];
  extracted_data?: Record<string, any>;
  structured_estimate?: CostEstimateDTO;
  hospitals_card?: HospitalCardDTO[];
  prescription_card?: PrescriptionCardDTO;
  audio_tts_text?: string;
  is_clarification?: boolean;
  clarification_options?: string[];
  action_plan?: PatientActionPlanDTO;
}

export interface PatientActionPlanDTO {
  title: string;
  user_stated_concern: string;
  confirmed_details: Record<string, any>;
  cost_estimate_summary: {
    procedure_name: string;
    government_cost: string;
    private_indicative_min: number;
    private_indicative_max: number;
    private_range_display: string;
    statutory_price_caps: string[];
  };
  estimate_limitations: string[];
  verified_hospitals: HospitalCardDTO[];
  official_lookup_routes: Array<{ name: string; url: string; purpose: string }>;
  applicable_schemes: Array<{ name: string; coverage_limit: string; eligibility_rule: string; empanelled_route: string }>;
  questions_to_ask_hospital: string[];
  documents_to_carry: string[];
  next_step_checklist: Array<{ step: number; task: string; done: boolean }>;
  printable_text: string;
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
    prescription_text?: string;
    prescription_filename?: string;
    language?: string;
  }): Promise<GuidedChatResponseDTO> {
    const res = await fetch(`${API_BASE}/chat/guided`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.detail || `Server returned error ${res.status}`);
    }
    return res.json();
  },

  async synthesizeSpeech(params: {
    text: string;
    language?: string;
    gender?: string;
  }): Promise<{ audio_base64?: string; language: string; status: string; notice: string }> {
    const res = await fetch(`${API_BASE}/speech/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: params.text,
        language: params.language || 'en-IN',
        gender: params.gender || 'female'
      })
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
    verified_only?: boolean;
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

  async transcribeSpeech(params: {
    audio_base64?: string;
    transcript_hint?: string;
    language?: string;
    format?: string;
  }): Promise<SpeechTranscribeDTO> {
    const res = await fetch(`${API_BASE}/speech/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_base64: params.audio_base64,
        transcript_hint: params.transcript_hint,
        language: params.language || 'en-IN',
        format: params.format || 'webm'
      })
    });
    if (!res.ok) {
      throw new Error(`Speech transcription failed: ${res.statusText}`);
    }
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
  },

  async getStates(): Promise<Array<{ code: string; name: string; type: string; capital: string; lat: number; lng: number }>> {
    const res = await fetch(`${API_BASE}/locations/states`);
    if (!res.ok) return [];
    return res.json();
  },

  async searchLocations(query: string): Promise<Array<{
    label: string;
    city: string;
    district: string;
    state: string;
    tier: string;
    lat: number;
    lng: number;
    pinCode?: string;
  }>> {
    const res = await fetch(`${API_BASE}/locations/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
  },

  async resolveLocation(params: { lat?: number; lng?: number; pin?: string; city?: string }): Promise<{
    city: string;
    state: string;
    district: string;
    tier: string;
    tier_label: string;
    cost_multiplier: number;
    lat: number;
    lng: number;
    matched_by: string;
  }> {
    const qs = new URLSearchParams();
    if (params.lat !== undefined) qs.set('lat', params.lat.toString());
    if (params.lng !== undefined) qs.set('lng', params.lng.toString());
    if (params.pin) qs.set('pin', params.pin);
    if (params.city) qs.set('city', params.city);
    const res = await fetch(`${API_BASE}/locations/resolve?${qs.toString()}`);
    if (!res.ok) throw new Error("Location resolution failed");
    return res.json();
  },

  async searchMedicines(query: string): Promise<MedicineDTO[]> {
    const res = await fetch(`${API_BASE}/medicines/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
  },

  async estimateMedicineCourse(items: Array<{ medicine_id?: string; name?: string; quantity: number; strength?: string; formulation?: string }>): Promise<MedicineCourseEstimateDTO> {
    const res = await fetch(`${API_BASE}/medicines/estimate-course`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    if (!res.ok) throw new Error("Medicine course estimation failed");
    return res.json();
  },

  async createPaymentOrder(params: {
    appointment_id: string;
    facility_name: string;
    consultation_fee?: number;
    registration_fee?: number;
  }): Promise<{ success: boolean; order: PaymentOrderDTO }> {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Payment order creation failed' }));
      throw new Error(err.detail || 'Payment order creation failed');
    }
    return res.json();
  },

  async verifyPayment(params: {
    order_id: string;
    payment_id: string;
    signature?: string;
    client_status?: string;
  }): Promise<PaymentVerificationResultDTO> {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Payment verification failed' }));
      throw new Error(err.detail || 'Payment verification failed');
    }
    return res.json();
  },

  async getPaymentStatus(orderId: string): Promise<PaymentOrderDTO> {
    const res = await fetch(`${API_BASE}/payments/status/${orderId}`);
    if (!res.ok) throw new Error("Failed to fetch payment status");
    return res.json();
  },

  async generateActionPlan(data: {
    user_concern: string;
    treatment_id?: string;
    city?: string;
    ownership_preference?: string;
    language?: string;
    user_budget?: number;
  }): Promise<PatientActionPlanDTO> {
    const res = await fetch(`${API_BASE}/action-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to generate patient action plan");
    return res.json();
  },

  // --- Google Proxy Methods ---
  async getRouteMatrix(origins: Array<{ lat: number; lng: number }>, destinations: Array<{ lat: number; lng: number }>, travelMode = 'DRIVE'): Promise<any> {
    const res = await fetch(`${API_BASE}/route-matrix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origins, destinations: destinations.slice(0, 25), travelMode })
    });
    if (!res.ok) throw new Error("Failed to calculate route matrix");
    return res.json();
  },

  async getPlacesNearby(lat: number, lng: number, radius = 5000, keyword = 'hospital'): Promise<any> {
    const res = await fetch(`${API_BASE}/places-nearby`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, radius, keyword })
    });
    if (!res.ok) throw new Error("Failed to search nearby places");
    return res.json();
  },

  async getPlaceDetails(place_id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/place-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ place_id })
    });
    if (!res.ok) throw new Error("Failed to fetch place details");
    return res.json();
  },

  getPlacePhotoUrl(photoName: string, maxHeight = 600, maxWidth = 800): string {
    return `${API_BASE}/place-photo?photo_name=${encodeURIComponent(photoName)}&max_height=${maxHeight}&max_width=${maxWidth}`;
  },

  async geocode(address?: string, lat?: number, lng?: number): Promise<any> {
    const res = await fetch(`${API_BASE}/geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, lat, lng })
    });
    if (!res.ok) throw new Error("Failed to geocode address");
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

export interface MedicineDTO {
  id: string;
  brand_name: string;
  generic_name: string;
  strength: string;
  formulation: string;
  pack_size: number;
  mrp_branded: number;
  nppa_ceiling_per_unit: number;
  jan_aushadhi_per_unit: number;
  manufacturer: string;
  generic_alternative: string;
  source: string;
  source_url: string;
  last_updated: string;
  is_nlem: boolean;
}

export interface MedicineCourseItemDTO {
  medicine_id?: string | null;
  brand_name: string;
  generic_name: string;
  strength: string;
  formulation: string;
  quantity: number;
  cost_branded: number | null;
  cost_nppa_ceiling: number | null;
  cost_jan_aushadhi: number | null;
  savings_potential: number;
  generic_alternative: string | null;
  source: string;
  source_url: string;
  last_updated: string;
  verified: boolean;
  status_note?: string;
}

export interface MedicineCourseEstimateDTO {
  items: MedicineCourseItemDTO[];
  total_estimated_branded_mrp: number;
  total_estimated_nppa_ceiling: number;
  total_estimated_jan_aushadhi: number;
  potential_generic_savings: number;
  potential_savings_percentage: number;
  price_source_disclaimer: string;
  has_unverified_items: boolean;
}

export interface PaymentFeeBreakdownDTO {
  doctor_consultation_fee: number;
  hospital_registration_fee: number;
  statutory_gst_18pct: number;
  total_payable_inr: number;
}

export interface PaymentOrderDTO {
  order_id: string;
  appointment_id: string;
  facility_name: string;
  currency: string;
  fee_breakdown: PaymentFeeBreakdownDTO;
  amount_paise: number;
  status: string;
  is_sandbox: boolean;
  razorpay_key_id: string;
  gateway_message: string;
  created_at: number;
}

export interface PaymentVerificationResultDTO {
  verified: boolean;
  status: string;
  order_id?: string;
  payment_id?: string;
  appointment_id?: string;
  total_paid_inr?: number;
  receipt?: string;
  message?: string;
  error?: string;
}

