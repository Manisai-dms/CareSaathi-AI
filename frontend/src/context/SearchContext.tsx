import React, { createContext, useContext, useState, useEffect } from 'react';

export interface FacilityItem {
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
  phone?: string;
  website?: string;
  rating?: number;
  verified_treatments: string[];
  empanelled_schemes: string[];
  room_types: Record<string, number>;
  last_verified_date: string;
  pricing_status?: string;
  price_confidence?: string;
  facility_class?: string;
  recommendation_reason?: string;
  distance_km?: number;
  estimated_cost_min?: number;
  estimated_cost_max?: number;
  image_url?: string;
  image_source?: string;
  image_attribution?: string;
  image_license?: string;
  initials?: string;
}

export interface LocationPayload {
  city: string;
  state?: string;
  district?: string;
  locality?: string;
  pinCode?: string;
  lat?: number;
  lng?: number;
}

export interface SearchState {
  query: string;
  treatmentId: string;
  treatmentName: string;
  city: string;
  state: string;
  district?: string;
  locality: string;
  pinCode?: string;
  lat?: number;
  lng?: number;
  hospitalName: string;
  comparisonList: FacilityItem[];
  recentSearches: string[];
}

export type SetLocationFn = {
  (city: string, locality?: string, pinCode?: string, state?: string, lat?: number, lng?: number): void;
  (payload: LocationPayload): void;
};

interface SearchContextType {
  searchState: SearchState;
  setSearchQuery: (query: string) => void;
  setTreatment: (id: string, name: string) => void;
  setLocation: SetLocationFn;
  setHospitalName: (name: string) => void;
  addToComparison: (facility: FacilityItem) => void;
  removeFromComparison: (facilityId: string) => void;
  clearComparison: () => void;
  addRecentSearch: (term: string) => void;
}

const defaultState: SearchState = {
  query: "",
  treatmentId: "knee_replacement",
  treatmentName: "Total Knee Replacement (TKR)",
  city: "Hyderabad",
  state: "Telangana",
  district: "Hyderabad",
  locality: "",
  pinCode: "500001",
  lat: 17.3850,
  lng: 78.4867,
  hospitalName: "",
  comparisonList: [],
  recentSearches: ["Knee replacement in Hyderabad", "MRI brain scan", "Cataract surgery near me"]
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchState, setState] = useState<SearchState>(() => {
    try {
      const saved = localStorage.getItem('caresaathi_search_state');
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('caresaathi_search_state', JSON.stringify({
        ...searchState,
        comparisonList: searchState.comparisonList.slice(0, 4)
      }));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [searchState]);

  const setSearchQuery = (query: string) => {
    setState(prev => ({ ...prev, query }));
  };

  const setTreatment = (id: string, name: string) => {
    setState(prev => ({ ...prev, treatmentId: id, treatmentName: name }));
  };

  const setLocation: SetLocationFn = (
    cityOrPayload: string | LocationPayload,
    locality?: string,
    pinCode?: string,
    state?: string,
    lat?: number,
    lng?: number
  ) => {
    if (typeof cityOrPayload === 'object' && cityOrPayload !== null) {
      setState(prev => ({
        ...prev,
        city: cityOrPayload.city,
        state: cityOrPayload.state !== undefined ? cityOrPayload.state : prev.state,
        district: cityOrPayload.district !== undefined ? cityOrPayload.district : prev.district,
        locality: cityOrPayload.locality !== undefined ? cityOrPayload.locality : prev.locality,
        pinCode: cityOrPayload.pinCode !== undefined ? cityOrPayload.pinCode : prev.pinCode,
        lat: cityOrPayload.lat !== undefined ? cityOrPayload.lat : prev.lat,
        lng: cityOrPayload.lng !== undefined ? cityOrPayload.lng : prev.lng,
      }));
    } else {
      const cityString: string = typeof cityOrPayload === 'string' ? cityOrPayload : '';
      setState(prev => ({ 
        ...prev, 
        city: cityString, 
        locality: locality !== undefined ? locality : prev.locality,
        pinCode: pinCode !== undefined ? pinCode : prev.pinCode,
        state: state !== undefined ? state : prev.state,
        lat: lat !== undefined ? lat : prev.lat,
        lng: lng !== undefined ? lng : prev.lng
      }));
    }
  };

  const setHospitalName = (name: string) => {
    setState(prev => ({ ...prev, hospitalName: name }));
  };

  const addToComparison = (facility: FacilityItem) => {
    setState(prev => {
      if (prev.comparisonList.some(f => f.id === facility.id)) return prev;
      if (prev.comparisonList.length >= 3) {
        // limit to 3 for clean side-by-side view
        return { ...prev, comparisonList: [...prev.comparisonList.slice(1), facility] };
      }
      return { ...prev, comparisonList: [...prev.comparisonList, facility] };
    });
  };

  const removeFromComparison = (facilityId: string) => {
    setState(prev => ({
      ...prev,
      comparisonList: prev.comparisonList.filter(f => f.id !== facilityId)
    }));
  };

  const clearComparison = () => {
    setState(prev => ({ ...prev, comparisonList: [] }));
  };

  const addRecentSearch = (term: string) => {
    if (!term.trim()) return;
    setState(prev => {
      const filtered = prev.recentSearches.filter(s => s.toLowerCase() !== term.toLowerCase());
      return { ...prev, recentSearches: [term, ...filtered].slice(0, 5) };
    });
  };

  return (
    <SearchContext.Provider value={{
      searchState,
      setSearchQuery,
      setTreatment,
      setLocation,
      setHospitalName,
      addToComparison,
      removeFromComparison,
      clearComparison,
      addRecentSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
