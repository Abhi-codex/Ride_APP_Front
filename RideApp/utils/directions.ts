export type LatLng = {
  latitude: number;
  longitude: number;
};

export type RideDirections = {
  toPickup: number; // duration in minutes
  toDropoff: number; // duration in minutes
  pickupDistance: number; // distance in km
  dropoffDistance: number; // distance in km
};

// Simple distance calculation as fallback
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371e3; // Earth's radius in meters
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1), Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fallback calculation based on distance (assumes 40 km/h average speed in city)
function getFallbackDuration(from: LatLng, to: LatLng): number {
  const distanceM = haversineDistance(from.latitude, from.longitude, to.latitude, to.longitude);
  return Math.ceil((distanceM / 1000) / 0.666); // 40 km/h = 0.666 km/min
}

// Get fallback distance in km
function getFallbackDistance(from: LatLng, to: LatLng): number {
  const distanceM = haversineDistance(from.latitude, from.longitude, to.latitude, to.longitude);
  return Math.round((distanceM / 1000) * 10) / 10; // Round to 1 decimal place
}

export async function getRideDurations(
  origin: LatLng,
  pickup: LatLng,
  dropoff: LatLng
): Promise<RideDirections> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // If no API key, use fallback calculation
  if (!apiKey) {
    console.warn('Google Maps API key not found in environment variables, using fallback calculation');
    return {
      toPickup: getFallbackDuration(origin, pickup),
      toDropoff: getFallbackDuration(pickup, dropoff),
      pickupDistance: getFallbackDistance(origin, pickup),
      dropoffDistance: getFallbackDistance(pickup, dropoff)
    };
  }

  const getDirectionData = async (from: LatLng, to: LatLng): Promise<{ duration: number; distance: number }> => {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${from.latitude},${from.longitude}` +
        `&destination=${to.latitude},${to.longitude}&key=${apiKey}&mode=driving`;
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const json = await res.json();
      
      if (json.status !== 'OK') {
        throw new Error(`Google Maps API error: ${json.status} - ${json.error_message || 'Unknown error'}`);
      }
      
      const leg = json.routes?.[0]?.legs?.[0];
      const durationSeconds = leg?.duration?.value;
      const distanceMeters = leg?.distance?.value;
      
      return {
        duration: durationSeconds ? Math.ceil(durationSeconds / 60) : getFallbackDuration(from, to),
        distance: distanceMeters ? Math.round((distanceMeters / 1000) * 10) / 10 : getFallbackDistance(from, to)
      };
    } catch (error) {
      console.warn('Failed to get directions from Google Maps API, using fallback:', error);
      return {
        duration: getFallbackDuration(from, to),
        distance: getFallbackDistance(from, to)
      };
    }
  };

  const [toPickupData, toDropoffData] = await Promise.all([
    getDirectionData(origin, pickup),
    getDirectionData(pickup, dropoff)
  ]);

  return {
    toPickup: toPickupData.duration,
    toDropoff: toDropoffData.duration,
    pickupDistance: toPickupData.distance,
    dropoffDistance: toDropoffData.distance
  };
}
