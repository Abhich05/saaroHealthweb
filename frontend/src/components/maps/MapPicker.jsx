import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { toast } from 'react-toastify';

const containerStyle = {
  width: '100%',
  height: '420px',
  borderRadius: '12px'
};

const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi fallback

export default function MapPicker({ isOpen, onClose, onSelect, initialPosition }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const startCenter = useMemo(() => initialPosition || defaultCenter, [initialPosition]);
  const [markerPos, setMarkerPos] = useState(startCenter);
  const [placeInfo, setPlaceInfo] = useState(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const onMapClick = useCallback((e) => {
    setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }, []);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    // Keep autocomplete suggestions biased to current map bounds
    if (autocompleteRef.current && map.getBounds) {
      autocompleteRef.current.setBounds(map.getBounds());
    }
    map.addListener('idle', () => {
      if (autocompleteRef.current && map.getBounds) {
        autocompleteRef.current.setBounds(map.getBounds());
      }
    });
  }, []);

  const recenterToMarker = () => {
    if (mapRef.current && markerPos) {
      mapRef.current.panTo(markerPos);
      mapRef.current.setZoom(15);
    }
  };

  const zoomIn = () => {
    if (!mapRef.current) return;
    mapRef.current.setZoom(mapRef.current.getZoom() + 1);
  };

  const zoomOut = () => {
    if (!mapRef.current) return;
    mapRef.current.setZoom(mapRef.current.getZoom() - 1);
  };

  const goToMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setMarkerPos(coords);
      if (mapRef.current) {
        mapRef.current.panTo(coords);
        mapRef.current.setZoom(15);
      }
      // Reverse geocode to show address/city
      try {
        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: coords }, (results, status) => {
            if (status === 'OK' && results && results.length) {
              const top = results[0];
              const formatted = top.formatted_address || '';
              let city = '';
              const comps = top.address_components || [];
              const locality = comps.find(c => c.types.includes('locality'));
              const administrative = comps.find(c => c.types.includes('administrative_area_level_2'));
              if (locality) city = locality.long_name;
              else if (administrative) city = administrative.long_name;
              setPlaceInfo({ clinicName: '', address: formatted, city });
            }
          });
        }
      } catch {}
    });
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!searchInputRef.current) return;
    const opts = {
      fields: ['geometry', 'formatted_address', 'name', 'address_components'],
      // Bias suggestions to current map viewport if available
      bounds: mapRef.current ? mapRef.current.getBounds() : undefined,
      strictBounds: false,
      componentRestrictions: { country: ['in'] },
      types: ['establishment', 'geocode']
    };
    const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, opts);
    autocompleteRef.current = autocomplete;
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setMarkerPos({ lat, lng });
      // Pan and zoom to result like Google Maps
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(16);
      }
      // parse city from address components
      let city = '';
      if (Array.isArray(place.address_components)) {
        const comp = place.address_components.find(c => c.types.includes('locality') || c.types.includes('administrative_area_level_2'));
        if (comp) city = comp.long_name;
      }
      setPlaceInfo({
        clinicName: place.name || '',
        address: place.formatted_address || '',
        city
      });
    });
    return () => listener && window.google.maps.event.removeListener(listener);
  }, [isLoaded]);

  // On open, center to user's current location if available
  useEffect(() => {
    if (!isOpen || !isLoaded) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setMarkerPos(coords);
      if (mapRef.current) {
        mapRef.current.panTo(coords);
        mapRef.current.setZoom(15);
      }
      // Reverse geocode once on open to prefill address
      try {
        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: coords }, (results, status) => {
            if (status === 'OK' && results && results.length) {
              const top = results[0];
              const formatted = top.formatted_address || '';
              let city = '';
              const comps = top.address_components || [];
              const locality = comps.find(c => c.types.includes('locality'));
              const administrative = comps.find(c => c.types.includes('administrative_area_level_2'));
              if (locality) city = locality.long_name;
              else if (administrative) city = administrative.long_name;
              setPlaceInfo({ clinicName: '', address: formatted, city });
            }
          });
        }
      } catch {}
    });
  }, [isOpen, isLoaded]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-5 py-4 border-b space-y-3 bg-gradient-to-r from-white to-purple-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pick Location</h3>
              <button onClick={onClose} className="text-2xl leading-none">&times;</button>
            </div>
            {isLoaded && (
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search clinic or city..."
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoComplete="off"
              />
            )}
            <p className="text-xs text-gray-500">Tip: Search your clinic or city, then fine-tune by dragging the marker.</p>
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
                onLoad={onMapLoad}
                options={{ streetViewControl: false, mapTypeControl: false }}
              >
                {markerPos && <Marker position={markerPos} draggable={true} onDragEnd={(e)=> setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() })} />}
              </GoogleMap>
            )}

            {/* Floating controls */}
            {isLoaded && (
              <div className="pointer-events-auto">
                <div className="-mt-12 flex gap-2">
                  <div className="ml-auto flex items-center gap-2">
                    <button onClick={zoomOut} className="px-3 py-2 rounded-lg bg-white shadow border text-sm">–</button>
                    <button onClick={zoomIn} className="px-3 py-2 rounded-lg bg-white shadow border text-sm">+</button>
                    <button onClick={recenterToMarker} className="px-3 py-2 rounded-lg bg-white shadow border text-sm">Recenter</button>
                    <button onClick={goToMyLocation} className="px-3 py-2 rounded-lg bg-white shadow border text-sm">My location</button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-600 space-y-1">
              {markerPos ? (
                <div>Lat: {markerPos.lat.toFixed(5)}, Lng: {markerPos.lng.toFixed(5)}</div>
              ) : (
                <div>Click on the map to choose a location</div>
              )}
              {placeInfo?.address && (
                <div className="text-xs text-gray-700">{placeInfo.address}</div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button
                onClick={() => {
                  if (!markerPos) return;
                  const shareUrl = `https://www.google.com/maps/search/?api=1&query=${markerPos.lat},${markerPos.lng}`;
                  navigator.clipboard?.writeText(shareUrl);
                  if (window.showToast) {
                    window.showToast('Link copied to clipboard', 'success', 2500);
                  } else if (typeof toast?.success === 'function') {
                    toast.success('Link copied to clipboard');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800"
                disabled={!markerPos}
              >
                Copy share link
              </button>
              <button
                onClick={() => {
                  if (!markerPos) return;
                  onSelect({
                    coords: markerPos,
                    clinicName: placeInfo?.clinicName || '',
                    address: placeInfo?.address || '',
                    city: placeInfo?.city || ''
                  });
                }}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white disabled:opacity-50"
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
