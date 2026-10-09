import React, { useState } from 'react';
import { MapCommonProps } from './types';
import { GoogleMapProvider } from './GoogleMapProvider';
import { LeafletMapProvider } from './LeafletMapProvider';

export const HospitalMapContainer: React.FC<MapCommonProps> = (props) => {
  const googleApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const [googleLoadFailed, setGoogleLoadFailed] = useState(false);

  const shouldUseGoogle = Boolean(googleApiKey && !googleLoadFailed);

  if (shouldUseGoogle) {
    return (
      <GoogleMapProvider
        {...props}
        apiKey={googleApiKey}
        onError={() => setGoogleLoadFailed(true)}
      />
    );
  }

  return <LeafletMapProvider {...props} />;
};
