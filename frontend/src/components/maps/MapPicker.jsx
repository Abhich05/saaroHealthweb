import React, { useCallback, useMemo, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '420px',
  borderRadius: '12px'
};

const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi fallback

export default function MapPicker({ isOpen, onClose, onSelect, initialPosition }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const startCenter = useMemo(() => initialPosition || defaultCenter, [initialPosition]);
  const [markerPos, setMarkerPos] = useState(startCenter);

  const onMapClick = useCallback((e) => {
    setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="text-lg font-semibold">Pick Location</h3>
            <button onClick={onClose} className="text-2xl leading-none">&times;</button>
          </div>

          <div className="p-5">
            {loadError && (
              <div className="text-red-600">Failed to load Google Maps. Check your API key.</div>
            )}
            {!isLoaded ? (
              <div className="text-gray-600">Loading map…</div>
            ) : (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={markerPos || startCenter}
                zoom={14}
                onClick={onMapClick}
                options={{ streetViewControl: false, mapTypeControl: false }}
              >
                {markerPos && <Marker position={markerPos} draggable={true} onDragEnd={(e)=> setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() })} />}
              </GoogleMap>
            )}

            <div className="mt-4 text-sm text-gray-600">
              {markerPos ? (
                <span>Lat: {markerPos.lat.toFixed(5)}, Lng: {markerPos.lng.toFixed(5)}</span>
              ) : (
                <span>Click on the map to choose a location</span>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button
                onClick={() => markerPos && onSelect(markerPos)}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white disabled:opacity-50"
                disabled={!markerPos}
              >
                Use this location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
