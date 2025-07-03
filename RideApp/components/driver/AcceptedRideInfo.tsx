import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useMemo } from "react";
import { Text, View, Image, ScrollView, TouchableOpacity } from "react-native";
import { getRideDurations, RideDirections } from "../../utils/directions";
import { styles } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";

interface AcceptedRideInfoProps {
  acceptedRide: Ride | null;
  driverLocation: { latitude: number; longitude: number } | null;
}

const dataCache = new Map<string, { 
  directions: RideDirections; 
  hospitalImages: string[];
  timestamp: number; 
}>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for accepted rides

// Utility function to calculate relative time for ride start
const getRelativeTime = (createdAt: string | Date): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  
  if (isNaN(diffMs) || diffMs < 0) return "Just started";
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 30) return "Just started";
  if (diffSeconds < 60) return `Started ${diffSeconds}s ago`;
  if (diffMinutes === 1) return "Started 1 min ago";
  if (diffMinutes < 60) return `Started ${diffMinutes} min ago`;
  if (diffHours === 1) return "Started 1 hr ago";
  return `Started ${diffHours} hr ago`;
};

export default function AcceptedRideInfo({
  acceptedRide,
  driverLocation,
}: AcceptedRideInfoProps) {
  const [directions, setDirections] = useState<RideDirections>({ 
    toPickup: 0, 
    toDropoff: 0,
    pickupDistance: 0,
    dropoffDistance: 0
  });
  const [hospitalImages, setHospitalImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [relativeTime, setRelativeTime] = useState("");

  const cacheKey = useMemo(() => {
    if (!driverLocation || !acceptedRide) return null;
    return `accepted-${driverLocation.latitude.toFixed(4)},${driverLocation.longitude.toFixed(4)}-${acceptedRide.pickup.latitude.toFixed(4)},${acceptedRide.pickup.longitude.toFixed(4)}-${acceptedRide.drop.latitude.toFixed(4)},${acceptedRide.drop.longitude.toFixed(4)}`;
  }, [driverLocation, acceptedRide]);

  useEffect(() => {
    if (!acceptedRide) return;
    
    const updateTime = () => setRelativeTime(getRelativeTime(acceptedRide.createdAt));
    updateTime(); // Initial update
    
    const interval = setInterval(updateTime, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [acceptedRide?.createdAt]);

  useEffect(() => {
    if (!driverLocation || !acceptedRide || !cacheKey) {
      setLoading(false);
      setHasError(true);
      return;
    }

    // Debug API key availability
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log('Google Maps API key available:', !!apiKey);
    if (apiKey) {
      console.log('API key starts with:', apiKey.substring(0, 10) + '...');
    }

    // Check cache first
    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setDirections(cached.directions);
      setHospitalImages(cached.hospitalImages);
      setLoading(false);
      setHasError(false);
      return;
    }

    setLoading(true);
    setHasError(false);

    const fetchHospitalImages = async (): Promise<string[]> => {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key not available for hospital images');
        return [];
      }

      try {
        // Use nearbysearch similar to book-ride.tsx - search for hospitals near the drop location
        const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${acceptedRide.drop.latitude},${acceptedRide.drop.longitude}&radius=500&type=hospital&key=${apiKey}`;
        
        console.log('Fetching hospital images near:', acceptedRide.drop.latitude, acceptedRide.drop.longitude);
        const searchResponse = await fetch(searchUrl);
        
        if (!searchResponse.ok) {
          throw new Error(`HTTP ${searchResponse.status}: ${searchResponse.statusText}`);
        }
        
        const searchData = await searchResponse.json();
        console.log('Hospital search response:', searchData.status, 'Results:', searchData.results?.length || 0);
        
        if (searchData.status !== 'OK') {
          console.warn('Google Places API error:', searchData.status, searchData.error_message);
          return [];
        }
        
        if (!searchData.results?.length) {
          console.warn('No hospitals found near coordinates:', acceptedRide.drop.latitude, acceptedRide.drop.longitude);
          return [];
        }

        let selectedHospital = searchData.results[0];
        
        const targetWords = acceptedRide.drop.address.toLowerCase().split(' ');
        for (const hospital of searchData.results) {
          const hospitalName = hospital.name.toLowerCase();
          const matchCount = targetWords.filter(word => hospitalName.includes(word)).length;
          if (matchCount > 0) {
            selectedHospital = hospital;
            break;
          }
        }
        
        console.log('Selected hospital:', selectedHospital.name, 'Photos:', selectedHospital.photos?.length || 0);
        
        if (!selectedHospital.photos || selectedHospital.photos.length === 0) {
          console.warn('No photos available for hospital:', selectedHospital.name);
          return [];
        }

        const photos = selectedHospital.photos.slice(0, 2);
        const imageUrls = photos.map((photo: any) => {
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`;
          return photoUrl;
        });
        
        console.log('Successfully fetched', imageUrls.length, 'hospital images');
        return imageUrls;
      } catch (error) {
        console.error('Error fetching hospital images:', error);
        return [];
      }
    };

    Promise.all([
      getRideDurations(driverLocation, acceptedRide.pickup, acceptedRide.drop),
      fetchHospitalImages()
    ])
      .then(([directionsResult, imagesResult]) => {
        setDirections(directionsResult);
        setHospitalImages(imagesResult);
        setHasError(false);
        dataCache.set(cacheKey, { 
          directions: directionsResult, 
          hospitalImages: imagesResult,
          timestamp: Date.now() 
        });
      })
      .catch((error) => {
        console.error('Error fetching accepted ride data:', error);
        setHasError(true);
        // Provide fallback data
        const fallbackDirections: RideDirections = { 
          toPickup: 5, 
          toDropoff: 10, 
          pickupDistance: 3.2, 
          dropoffDistance: 6.8 
        };
        setDirections(fallbackDirections);
        setHospitalImages([]);
      })
      .finally(() => setLoading(false));
  }, [cacheKey, acceptedRide?._id]);

  const formatDuration = (minutes: number): string => {
    if (minutes < 1) return "< 1 min";
    return `${Math.round(minutes)} min`;
  };

  const formatDistance = (km: number): string => {
    if (km < 0.1) return "< 0.1 km";
    return `${km} km`;
  };

  const formatFare = (fare: number): number => {
    return Math.round(fare / 5) * 5;
  };

  if (!acceptedRide) {
    return null;
  }

  return (
    <ScrollView style={[styles.flex1]} showsVerticalScrollIndicator={false}>
      <View style={[styles.bgWhite, styles.roundedXl, styles.overflowHidden, styles.border, styles.borderGray300,]}>
        
        {/* Active Trip Header */}
        <View style={[styles.px4, styles.py3, { backgroundColor: "#10b981", shadowColor: "#10b981", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 }]}>
          <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween]}>
            <View style={[styles.flexRow, styles.alignCenter]}>
              <Ionicons name="pulse" size={16} color="#fbbf24" />
              <Text style={[styles.textWhite, styles.textSm, styles.ml1, styles.fontMedium]}>{relativeTime}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={[styles.p4]}>
          {/* Route Information */}
          <View style={[styles.mb4]}>
            {/* Pickup Location */}
            <View style={[styles.flexRow, styles.alignCenter, styles.mb3]}>
              <View style={[styles.w5, styles.h5, styles.roundedFull, styles.alignCenter, styles.justifyCenter, styles.mr3, { backgroundColor: "#3b82f6" }]}>
                <Ionicons name="location" size={12} color="white" />
              </View>
              <View style={[styles.flex1]}>
                <Text style={[styles.textSm, { color: "#3b82f6" }, styles.fontBold, styles.mb1]}>PATIENT PICKUP LOCATION</Text>
                <Text style={[styles.textBase, styles.textGray900, styles.fontMedium]} numberOfLines={2}>{acceptedRide.pickup.address}</Text>
              </View>
            </View>
            
            {/* Route Info */}
            <View style={[styles.flexRow, styles.alignCenter, styles.mb3]}>
              <View style={[styles.w5, styles.alignCenter]}>
                <View style={[styles.w1, styles.h8, { backgroundColor: "#06b6d4" }]} />
              </View>
              <View style={[styles.flex1, styles.ml3]}>
                <View style={[styles.flexRow, styles.alignCenter, styles.mb1]}>
                  <Ionicons name={loading ? "time" : "car"} size={12} color={hasError ? "#ef4444" : "#06b6d4"} />
                  <Text style={[styles.textSm, hasError ? { color: "#ef4444" } : { color: "#374151" }, styles.ml2, styles.fontMedium]}>
                    {loading ? "Calculating route..." : `Pickup: ${formatDuration(directions.toPickup)}, Dropoff: ${formatDuration(directions.toDropoff)}`}
                  </Text>
                </View>
                <View style={[styles.flexRow, styles.alignCenter]}>
                  <Ionicons name={loading ? "time" : "navigate"} size={16} color={hasError ? "#ef4444" : "#8b5cf6"} />
                  <Text style={[styles.textSm, hasError ? { color: "#ef4444" } : { color: "#6b7280" }, styles.ml2, styles.fontMedium]}>
                    {loading ? "Calculating distance..." : `Pickup: ${formatDistance(directions.pickupDistance)}, Dropoff: ${formatDistance(directions.dropoffDistance)}`}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Drop Location */}
            <View style={[styles.flexRow, styles.alignCenter]}>
              <View style={[styles.w5, styles.h5, styles.roundedFull, styles.alignCenter, styles.justifyCenter, styles.mr3, { backgroundColor: "#10b981" }]}>
                <Ionicons name="medical" size={16} color="white" />
              </View>
              <View style={[styles.flex1]}>
                <Text style={[styles.textSm, { color: "#10b981" }, styles.fontBold, styles.mb1]}>DESTINATION HOSPITAL</Text>
                <Text style={[styles.textBase, styles.textGray900, styles.fontMedium]} numberOfLines={2}>{acceptedRide.drop.address}</Text>
              </View>
            </View>
          </View>

          {/* Hospital Images */}
          <View style={[styles.mb4]}>
            <Text style={[styles.textSm, styles.fontBold, { color: "#374151" }, styles.mb3]}>
              Destination Hospital Images
            </Text>
            {loading ? (
              <View style={[styles.flexRow, styles.gap3]}>
                <View style={[styles.flex1, styles.roundedLg, { backgroundColor: "#f3f4f6", aspectRatio: 1.5, height: 100 }, styles.alignCenter, styles.justifyCenter]}>
                  <Ionicons name="time" size={20} color="#9ca3af" />
                  <Text style={[styles.textXs, { color: "#9ca3af" }, styles.mt1]}>Loading images...</Text>
                </View>
                <View style={[styles.flex1, styles.roundedLg, { backgroundColor: "#f3f4f6", aspectRatio: 1.5, height: 100 }, styles.alignCenter, styles.justifyCenter]}>
                  <Ionicons name="time" size={20} color="#9ca3af" />
                  <Text style={[styles.textXs, { color: "#9ca3af" }, styles.mt1]}>Loading images...</Text>
                </View>
              </View>
            ) : hospitalImages.length > 0 ? (
              <View style={[styles.flexRow, styles.gap3]}>
                {hospitalImages.map((imageUrl, index) => (
                  <View key={index} style={[styles.flex1, styles.roundedLg, styles.overflowHidden, { aspectRatio: 1.5, height: 100 }]}>
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={[styles.wFull, styles.hFull]}
                      resizeMode="cover"
                      onError={(error) => console.log('Image load error:', error)}
                      onLoad={() => console.log('Image loaded successfully:', imageUrl)}
                    />
                  </View>
                ))}
                {/* Add placeholder if only one image */}
                {hospitalImages.length === 1 && (
                  <View style={[styles.flex1, styles.roundedLg, { backgroundColor: "#f9fafb", aspectRatio: 1.5, height: 100 }, styles.alignCenter, styles.justifyCenter, styles.border, { borderColor: "#e5e7eb" }]}>
                    <Ionicons name="medical" size={24} color="#d1d5db" />
                    <Text style={[styles.textXs, { color: "#9ca3af" }, styles.mt1]}>No additional image</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={[styles.flexRow, styles.gap3]}>
                <View style={[styles.flex1, styles.roundedLg, { backgroundColor: "#f9fafb", aspectRatio: 1.5, height: 100 }, styles.alignCenter, styles.justifyCenter, styles.border, { borderColor: "#e5e7eb" }]}>
                  <Ionicons name="medical" size={24} color="#d1d5db" />
                  <Text style={[styles.textXs, { color: "#9ca3af" }, styles.mt1]}>No images found</Text>
                </View>
                <View style={[styles.flex1, styles.roundedLg, { backgroundColor: "#f9fafb", aspectRatio: 1.5, height: 100 }, styles.alignCenter, styles.justifyCenter, styles.border, { borderColor: "#e5e7eb" }]}>
                  <Ionicons name="medical" size={24} color="#d1d5db" />
                  <Text style={[styles.textXs, { color: "#9ca3af" }, styles.mt1]}>No images found</Text>
                </View>
              </View>
            )}
          </View>

          {/* Fare Info */}
          <View style={[{ backgroundColor: "#f0f9ff" }, styles.roundedLg, styles.p4, styles.mb4, styles.flexRow, styles.justifyBetween, styles.alignCenter]}>
            <View style={[styles.flexRow, styles.alignCenter]}>
              <Ionicons name="cash" size={18} color="#0ea5e9" />
              <Text style={[styles.textBase, { color: "#0ea5e9" }, styles.ml2, styles.fontMedium]}>Emergency Transport Fare</Text>
            </View>
            <Text style={[styles.textXl, styles.fontBold, { color: "#0ea5e9" }]}>₹{formatFare(acceptedRide.fare)}</Text>
          </View>

          {/* Emergency Status Banner */}
          <View style={[{ backgroundColor: "#dc2626" }, styles.roundedLg, styles.p4, styles.alignCenter]}>
            <Text style={[styles.textWhite, styles.textSm, styles.textCenter, styles.fontMedium]}>
              Drive safely and follow all traffic protocols for emergency vehicles
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
