import { Hospital, AmbulanceType } from '../types/patient';
import { EmergencyType, EMERGENCY_TYPES } from '../types/emergency';

/**
 * Filter ambulance types based on emergency requirements
 */
export function getAvailableAmbulanceTypes(emergencyId: string): AmbulanceType[] {
  const emergency = EMERGENCY_TYPES.find(e => e.id === emergencyId);
  if (!emergency) {
    // If no emergency selected, show all types
    return ['bls', 'als', 'ccs', 'auto', 'bike'];
  }
  return emergency.requiredAmbulanceTypes;
}

/**
 * Filter hospitals based on emergency services required
 */
export function filterHospitalsByEmergency(hospitals: Hospital[], emergencyId: string): Hospital[] {
  const emergency = EMERGENCY_TYPES.find(e => e.id === emergencyId);
  if (!emergency) {
    // If no emergency selected, show all hospitals
    return hospitals;
  }

  return hospitals.filter(hospital => {
    // If hospital doesn't have services data, include it (backward compatibility)
    if (!hospital.emergencyServices || hospital.emergencyServices.length === 0) {
      return true;
    }

    // Check if hospital has required services with fallback alternatives
    return emergency.requiredHospitalServices.every(requiredService => {
      // Direct match
      if (hospital.emergencyServices?.includes(requiredService)) {
        return true;
      }
      
      // Fallback alternatives for common services
      if (requiredService === 'pulmonology' && 
          hospital.emergencyServices?.includes('intensive_care')) {
        console.log(`Hospital ${hospital.name}: Accepting intensive_care as alternative to pulmonology`);
        return true;
      }
      
      if (requiredService === 'cardiology' && 
          hospital.emergencyServices?.includes('intensive_care')) {
        console.log(`Hospital ${hospital.name}: Accepting intensive_care as alternative to cardiology`);
        return true;
      }
      
      if (requiredService === 'cardiac_catheterization' && 
          (hospital.emergencyServices?.includes('cardiology') || 
           hospital.emergencyServices?.includes('intensive_care'))) {
        console.log(`Hospital ${hospital.name}: Accepting cardiology/intensive_care as alternative to cardiac_catheterization`);
        return true;
      }
      
      if (requiredService === 'neurology' && 
          hospital.emergencyServices?.includes('intensive_care')) {
        console.log(`Hospital ${hospital.name}: Accepting intensive_care as alternative to neurology`);
        return true;
      }
      
      // Additional cardiac service alternatives
      if (requiredService === 'cardiac_surgery' && 
          (hospital.emergencyServices?.includes('surgery') || 
           hospital.emergencyServices?.includes('cardiology'))) {
        console.log(`Hospital ${hospital.name}: Accepting surgery/cardiology as alternative to cardiac_surgery`);
        return true;
      }
      
      // Trauma alternatives
      if (requiredService === 'trauma_surgery' && 
          hospital.emergencyServices?.includes('surgery')) {
        console.log(`Hospital ${hospital.name}: Accepting surgery as alternative to trauma_surgery`);
        return true;
      }
      
      // Blood bank alternatives
      if (requiredService === 'blood_bank' && 
          hospital.emergencyServices?.includes('surgery')) {
        console.log(`Hospital ${hospital.name}: Accepting surgery as alternative to blood_bank`);
        return true;
      }
      
      return false;
    });
  });
}

/**
 * Check if a hospital is suitable for an emergency
 */
export function isHospitalSuitableForEmergency(hospital: Hospital, emergencyId: string): boolean {
  const emergency = EMERGENCY_TYPES.find(e => e.id === emergencyId);
  if (!emergency) return true;

  if (!hospital.emergencyServices || hospital.emergencyServices.length === 0) {
    return true; // Backward compatibility
  }

  return emergency.requiredHospitalServices.every(requiredService => 
    hospital.emergencyServices?.includes(requiredService)
  );
}

/**
 * Get emergency details by ID
 */
export function getEmergencyById(emergencyId: string): EmergencyType | undefined {
  return EMERGENCY_TYPES.find(e => e.id === emergencyId);
}

/**
 * Get priority color for emergency
 */
export function getEmergencyPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return '#ef4444';
    case 'high': return '#f59e0b';
    case 'medium': return '#3b82f6';
    case 'low': return '#10b981';
    default: return '#6b7280';
  }
}

/**
 * Get suggested ambulance type for emergency (most appropriate one)
 */
export function getSuggestedAmbulanceType(emergencyId: string): AmbulanceType {
  const emergency = EMERGENCY_TYPES.find(e => e.id === emergencyId);
  if (!emergency || emergency.requiredAmbulanceTypes.length === 0) {
    return 'bls'; // Default
  }

  // Return the most advanced ambulance type for the emergency
  const types = emergency.requiredAmbulanceTypes;
  if (types.includes('ccs')) return 'ccs';
  if (types.includes('als')) return 'als';
  if (types.includes('bls')) return 'bls';
  if (types.includes('auto')) return 'auto';
  return 'bike';
}

/**
 * Enhanced hospital search with Google Places API integration
 */
export async function searchHospitalsWithEmergencyServices(
  location: { latitude: number; longitude: number },
  emergencyId: string,
  radius: number = 10000
): Promise<Hospital[]> {
  const emergency = EMERGENCY_TYPES.find(e => e.id === emergencyId);
  if (!emergency) return [];

  // Build search query based on emergency type
  let searchQuery = 'hospital emergency';
  
  // Add specific search terms based on emergency type
  if (emergency.category === 'cardiac') {
    searchQuery += ' cardiology heart';
  } else if (emergency.category === 'trauma') {
    searchQuery += ' trauma center';
  } else if (emergency.category === 'neurological') {
    searchQuery += ' neurology stroke center';
  } else if (emergency.category === 'pediatric') {
    searchQuery += ' pediatric children';
  } else if (emergency.category === 'obstetric') {
    searchQuery += ' maternity obstetrics';
  } else if (emergency.category === 'burns') {
    searchQuery += ' burn unit';
  } else if (emergency.category === 'psychiatric') {
    searchQuery += ' psychiatric mental health';
  }

  try {
    // Note: In a real implementation, you would use Google Places API here
    // For now, this is a placeholder that demonstrates the concept
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${location.latitude},${location.longitude}&` +
      `radius=${radius}&` +
      `type=hospital&` +
      `keyword=${encodeURIComponent(searchQuery)}&` +
      `key=YOUR_GOOGLE_PLACES_API_KEY`
    );

    const data = await response.json();
    
    if (data.results) {
      return data.results.map((place: any, index: number) => ({
        id: place.place_id || `hospital_${index}`,
        name: place.name,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        distance: calculateDistance(
          location.latitude,
          location.longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
        rating: place.rating,
        photoUrl: place.photos?.[0]?.photo_reference ? 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=YOUR_GOOGLE_PLACES_API_KEY` : 
          undefined,
        placeId: place.place_id,
        emergencyServices: inferServicesFromPlace(place, emergency),
        specialties: extractSpecialties(place.types, emergency.category)
      }));
    }
  } catch (error) {
    console.error('Error searching hospitals with Google Places:', error);
  }

  return [];
}

/**
 * Calculate distance between two coordinates
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Infer available services from Google Places result
 */
function inferServicesFromPlace(place: any, emergency: EmergencyType): string[] {
  const services: string[] = ['emergency_room']; // All hospitals have ER
  
  // Infer services based on place name and types
  const name = place.name.toLowerCase();
  const types = place.types || [];
  
  if (name.includes('cardiac') || name.includes('heart')) {
    services.push('cardiology', 'cardiac_catheterization');
  }
  
  if (name.includes('trauma') || name.includes('medical center')) {
    services.push('trauma_center', 'surgery', 'blood_bank');
  }
  
  if (name.includes('children') || name.includes('pediatric')) {
    services.push('pediatrics', 'nicu');
  }
  
  if (name.includes('maternity') || name.includes('women')) {
    services.push('obstetrics', 'gynecology', 'delivery_room');
  }
  
  if (name.includes('neuro') || name.includes('brain')) {
    services.push('neurology', 'neurosurgery', 'stroke_center');
  }
  
  if (name.includes('burn')) {
    services.push('burn_unit', 'plastic_surgery');
  }
  
  // Add general services for larger hospitals
  if (name.includes('medical center') || name.includes('general hospital')) {
    services.push('intensive_care', 'ct_scan', 'surgery', 'blood_bank');
  }
  
  return services;
}

/**
 * Extract specialties from Google Places types
 */
function extractSpecialties(types: string[], emergencyCategory: string): string[] {
  const specialties: string[] = [];
  
  if (types.includes('hospital')) {
    specialties.push('General Medicine');
  }
  
  switch (emergencyCategory) {
    case 'cardiac':
      specialties.push('Cardiology', 'Emergency Medicine');
      break;
    case 'trauma':
      specialties.push('Trauma Surgery', 'Orthopedics', 'Emergency Medicine');
      break;
    case 'neurological':
      specialties.push('Neurology', 'Neurosurgery', 'Emergency Medicine');
      break;
    case 'pediatric':
      specialties.push('Pediatrics', 'Emergency Medicine');
      break;
    case 'obstetric':
      specialties.push('Obstetrics', 'Gynecology');
      break;
    case 'respiratory':
      specialties.push('Pulmonology', 'Emergency Medicine');
      break;
    case 'burns':
      specialties.push('Burn Care', 'Plastic Surgery');
      break;
    case 'psychiatric':
      specialties.push('Psychiatry', 'Mental Health');
      break;
    default:
      specialties.push('Emergency Medicine');
  }
  
  return specialties;
}
