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

export interface SearchState {
  query: string;
  treatmentId: string;
  treatmentName: string;
  city: string;
  locality: string;
  pinCode?: string;
  hospitalName: string;
  comparisonList: FacilityItem[];
  recentSearches: string[];
}

interface SearchContextType {
  searchState: SearchState;
  setSearchQuery: (query: string) => void;
  setTreatment: (id: string, name: string) => void;
  setLocation: (city: string, locality?: string, pinCode?: string) => void;
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
  locality: "",
  pinCode: "",
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

  const setLocation = (city: string, locality?: string, pinCode?: string) => {
    setState(prev => ({ 
      ...prev, 
      city, 
      locality: locality !== undefined ? locality : prev.locality,
      pinCode: pinCode !== undefined ? pinCode : prev.pinCode 
    }));
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
