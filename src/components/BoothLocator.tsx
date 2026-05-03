'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

/**
 * Domain-specific booth structure.
 */
interface Booth {
  readonly id: string;
  readonly name: string;
  readonly lat: number;
  readonly lng: number;
  readonly address: string;
}

/**
 * Static Mock Data (Purity: Constant outside component).
 */
const MOCK_BOOTHS: ReadonlyArray<Booth> = [
  { id: '1', name: 'Booth A (North District)', lat: 40.7128, lng: -74.006, address: '123 Civic Center Dr' },
  { id: '2', name: 'Booth B (South District)', lat: 40.7282, lng: -73.9942, address: '456 Democracy Way' },
  { id: '3', name: 'Booth C (East District)', lat: 40.7048, lng: -74.0137, address: '789 Liberty Ave' },
];

const MAP_CONTAINER_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem',
};

/**
 * Memoized Google Map component.
 */
const MemoizedGoogleMap = memo(GoogleMap);

/**
 * Individual Booth row component.
 */
const BoothRow = memo(({ 
  booth, 
  isActive, 
  onClick 
}: { 
  readonly booth: Booth, 
  readonly isActive: boolean, 
  readonly onClick: () => void 
}): JSX.Element => (
  <div
    onClick={onClick}
    className={`p-4 m-2 rounded-xl cursor-pointer transition-all ${
      isActive
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 border shadow-sm'
        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
    }`}
  >
    <h3 className={`font-semibold ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
      {booth.name}
    </h3>
    <p className="text-xs text-gray-500 flex items-start mt-2">
      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {booth.address}
    </p>
  </div>
), (prev, next) => prev.isActive === next.isActive && prev.booth.id === next.booth.id);
BoothRow.displayName = 'BoothRow';

/**
 * Memoized Marker component with custom comparator.
 */
const MemoizedMarker = memo(Marker, (prev, next) => 
  prev.position.lat === next.position.lat && 
  prev.position.lng === next.position.lng &&
  prev.animation === next.animation
);
MemoizedMarker.displayName = 'MemoizedMarker';

/**
 * BoothLocator: Interactive map for finding polling stations.
 * Refactored for Zenith Purity (Nodes 1, 2, 6, 9).
 */
export default function BoothLocator(): JSX.Element {
  const [activeBooth, setActiveBooth] = useState<Booth>(MOCK_BOOTHS[0]);
  const [mapError, setMapError] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [filterAccessible, setFilterAccessible] = useState(false);

  useEffect((): void => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setFallbackMode(true);
    }
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map): void => {
    const bounds = new window.google.maps.LatLngBounds();
    MOCK_BOOTHS.forEach((booth) => bounds.extend({ lat: booth.lat, lng: booth.lng }));
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback((): void => {
    setMap(null);
  }, []);

  if (loadError) {
    setMapError(true);
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row h-[500px]">
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex flex-col h-1/2 md:h-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Booth Locator</h2>
          <p className="text-sm text-gray-500 mt-1">Find your mock polling station</p>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {MOCK_BOOTHS.map((booth) => (
            <BoothRow 
              key={booth.id} 
              booth={booth} 
              isActive={activeBooth.id === booth.id} 
              onClick={() => setActiveBooth(booth)} 
            />
          ))}
        </div>
      </div>

      <div className="flex-1 bg-gray-100 dark:bg-gray-800 relative h-1/2 md:h-full p-2">
        {fallbackMode || mapError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
             <h3 className="text-gray-500 dark:text-gray-400 font-medium text-lg">Interactive Map Offline</h3>
             <strong className="text-gray-600 dark:text-gray-300 mt-2 block">{activeBooth.name}</strong>
          </div>
        ) : isLoaded ? (
          <div aria-describedby="map-instructions" className="h-full w-full">
            <MemoizedGoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={{ lat: activeBooth.lat, lng: activeBooth.lng }}
              zoom={14}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{ disableDefaultUI: true, zoomControl: true }}
            >
              {MOCK_BOOTHS.map((booth) => (
                <MemoizedMarker
                  key={booth.id}
                  position={{ lat: booth.lat, lng: booth.lng }}
                  onClick={() => setActiveBooth(booth)}
                  animation={activeBooth.id === booth.id ? (window.google.maps.Animation.BOUNCE as any) : undefined}
                />
              ))}
            </MemoizedGoogleMap>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}
