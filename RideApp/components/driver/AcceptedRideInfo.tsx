import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useMemo } from "react";
import { Text, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { getRideDurations, RideDirections } from "../../utils/directions";
import { styles, colors } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";
import { Linking } from "react-native";
import { storage } from "../../utils/storage";

interface AcceptedRideInfoProps {
  acceptedRide: Ride | null;
  driverLocation: { latitude: number; longitude: number } | null;
}

const dataCache = new Map<string, { 
  directions: RideDirections; 
  timestamp: number; 
}>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for accepted ride directions

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
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [relativeTime, setRelativeTime] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpStorageKey, setOtpStorageKey] = useState<string>("");

  // Generate storage key for OTP verification state
  // This ensures each ride has its own persistent OTP verification state
  const generateOtpStorageKey = (rideId: string) => {
    return `otp_verified_${rideId}`;
  };

  // Load OTP verification state from storage
  // This allows the verification state to persist across drawer open/close cycles
  const loadOtpVerificationState = async (rideId: string) => {
    try {
      const storageKey = generateOtpStorageKey(rideId);
      const storedState = await storage.getItem(storageKey);
      if (storedState === "true") {
        setIsOtpVerified(true);
      }
      setOtpStorageKey(storageKey);
    } catch (error) {
      console.warn("Failed to load OTP verification state:", error);
    }
  };

  // Save OTP verification state to storage
  // This persists the verification state so it survives drawer minimization
  const saveOtpVerificationState = async (rideId: string, isVerified: boolean) => {
    try {
      const storageKey = generateOtpStorageKey(rideId);
      if (isVerified) {
        await storage.setItem(storageKey, "true");
      } else {
        await storage.removeItem(storageKey);
      }
    } catch (error) {
      console.warn("Failed to save OTP verification state:", error);
    }
  };

  // Clean up old OTP verification entries (older than 24 hours)
  const cleanupOldOtpEntries = async () => {
    try {
      // Clean up the current ride's entry when the ride is completed
      if (acceptedRide && acceptedRide.status === "COMPLETED") {
        await storage.removeItem(generateOtpStorageKey(acceptedRide._id));
      }
    } catch (error) {
      console.warn("Failed to cleanup old OTP entries:", error);
    }
  };

  // Utility function to manually clear OTP verification (for testing/debugging)
  const clearOtpVerification = async () => {
    if (acceptedRide) {
      setIsOtpVerified(false);
      setOtpInput("");
      await saveOtpVerificationState(acceptedRide._id, false);
    }
  };

  const cacheKey = useMemo(() => {
    if (!driverLocation || !acceptedRide) return null;
    return `accepted-${driverLocation.latitude.toFixed(4)},${driverLocation.longitude.toFixed(4)}-${acceptedRide.pickup.latitude.toFixed(4)},${acceptedRide.pickup.longitude.toFixed(4)}-${acceptedRide.drop.latitude.toFixed(4)},${acceptedRide.drop.longitude.toFixed(4)}`;
  }, [driverLocation, acceptedRide]);

  useEffect(() => {
    if (!acceptedRide) return;
    
    // Load OTP verification state when ride changes
    loadOtpVerificationState(acceptedRide._id);
    
    // Clean up old entries
    cleanupOldOtpEntries();
    
    const updateTime = () => setRelativeTime(getRelativeTime(acceptedRide.createdAt));
    updateTime(); // Initial update
    
    const interval = setInterval(updateTime, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [acceptedRide?._id, acceptedRide?.createdAt]);

  // Reset OTP state when ride changes
  useEffect(() => {
    if (!acceptedRide) {
      setOtpInput("");
      setIsOtpVerified(false);
      setOtpStorageKey("");
    }
  }, [acceptedRide?._id]);

  useEffect(() => {
    if (!driverLocation || !acceptedRide || !cacheKey) {
      setLoading(false);
      setHasError(true);
      return;
    }

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log('Google Maps API key available:', !!apiKey);
    if (apiKey) {
      console.log('API key starts with:', apiKey.substring(0, 10) + '...');
    }

    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setDirections(cached.directions);
      setLoading(false);
      setHasError(false);
      return;
    }

    setLoading(true);
    setHasError(false);

    getRideDurations(driverLocation, acceptedRide.pickup, acceptedRide.drop)
      .then((directionsResult) => {
        console.log('Fetched directions:', directionsResult);
        setDirections(directionsResult);
        setHasError(false);
        dataCache.set(cacheKey, { 
          directions: directionsResult, 
          timestamp: Date.now() 
        });
      })
      .catch((error) => {
        console.error('Error fetching accepted ride data:', error);
        setHasError(true);
        const fallbackDirections: RideDirections = { 
          toPickup: 5, 
          toDropoff: 10, 
          pickupDistance: 3.2, 
          dropoffDistance: 6.8 
        };
        setDirections(fallbackDirections);
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
  // OTP verification function
  const handleOtpVerification = async () => {
    if (!acceptedRide) return;
    
    if (otpInput.trim() === acceptedRide?.otp) {
      setIsOtpVerified(true);
      await saveOtpVerificationState(acceptedRide._id, true);
      Alert.alert("Success", "OTP verified successfully!");
    } else {
      Alert.alert("Error", "Invalid OTP. Please try again.");
    }
  };

  // Format vehicle type for display
  const formatVehicleType = (vehicleType: string): string => {
    return vehicleType.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
  };

  if (!acceptedRide) {
    return null;
  }

  return (
    <ScrollView style={[styles.flex1]} showsVerticalScrollIndicator={false}>
      <View style={[styles.bgWhite, styles.roundedXl, styles.overflowHidden, styles.mb6, styles.shadowSm]}>
        
        {/* Header */}
        <View style={[styles.px4, styles.py3, styles.bgGray800]}>
          <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween]}>
            <View style={[styles.flexRow, styles.alignCenter]}>
              <Ionicons name="pulse" size={16} color={colors.medical[500]} />
              <Text style={[styles.textWhite, styles.textSm, styles.ml2, styles.fontMedium]}>{relativeTime}</Text>
            </View>
            <View style={[styles.flexRow, styles.alignCenter]}>
              <View style={[styles.w2, styles.h2, styles.roundedFull, styles.bgMedical500, styles.mr2]} />
              <Text style={[styles.textWhite, styles.textSm, styles.fontMedium]}>
                {acceptedRide.status === "START" ? "EN ROUTE" : 
                 acceptedRide.status === "ARRIVED" ? "AT PICKUP" : 
                 acceptedRide.status === "COMPLETED" ? "COMPLETED" : "ACTIVE"}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={[styles.pb4, styles.mb6]}>
          {/* Route Information */}
          <View style={[styles.mb4, styles.p4, styles.roundedLg, styles.bgGray50]}>
            {/* Pickup Location */}
            <View style={[styles.flexRow, styles.alignCenter, styles.mb4]}>
              <View style={[styles.w8, styles.h8, styles.roundedFull, styles.alignCenter, styles.justifyCenter, styles.mr3, styles.bgGray800]}>
                <Ionicons name="location" size={16} color={colors.medical[500]} />
              </View>
              <View style={[styles.flex1]}>
                <Text style={[styles.textSm, styles.textGray600, styles.fontMedium, styles.mb1]}>PICKUP LOCATION</Text>
                <Text style={[styles.textBase, styles.textGray900, styles.fontMedium]} numberOfLines={2}>{acceptedRide.pickup.address}</Text>
              </View>
            </View>
            
            {/* Route Info */}
            <View style={[styles.flexRow, styles.alignCenter, styles.mb4]}>
              <View style={[styles.w8, styles.alignCenter]}>
                <View style={[styles.w1, styles.h8, styles.bgGray400]} />
              </View>
              <View style={[styles.flex1, styles.ml3]}>
                <View style={[styles.flexRow, styles.alignCenter, styles.mb1]}>
                  <Ionicons name={loading ? "time" : "car"} size={16} color={hasError ? colors.danger[500] : colors.gray[800]} />
                  <Text style={[styles.textSm, styles.textGray700, styles.ml2, styles.fontMedium]}>
                    {loading ? "Calculating route..." : `Pickup: ${formatDuration(directions.toPickup)}, Dropoff: ${formatDuration(directions.toDropoff)}`}
                  </Text>
                </View>
                <View style={[styles.flexRow, styles.alignCenter]}>
                  <Ionicons name={loading ? "time" : "navigate"} size={16} color={hasError ? colors.danger[500] : colors.gray[800]} />
                  <Text style={[styles.textSm, styles.textGray700, styles.ml2, styles.fontMedium]}>
                    {loading ? "Calculating distance..." : `Pickup: ${formatDistance(directions.pickupDistance)}, Dropoff: ${formatDistance(directions.dropoffDistance)}`}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Drop Location */}
            <View style={[styles.flexRow, styles.alignCenter]}>
              <View style={[styles.w8, styles.h8, styles.roundedFull, styles.alignCenter, styles.justifyCenter, styles.mr3, styles.bgGray800]}>
                <Ionicons name="medical" size={16} color={colors.medical[500]} />
              </View>
              <View style={[styles.flex1]}>
                <Text style={[styles.textSm, styles.textGray600, styles.fontMedium, styles.mb1]}>DESTINATION HOSPITAL</Text>
                <Text style={[styles.textBase, styles.textGray900, styles.fontMedium]} numberOfLines={2}>{acceptedRide.drop.address}</Text>
              </View>
            </View>
          </View>

          {/* OTP Verification */}
          <View style={[styles.mb4, styles.p4, styles.roundedLg, styles.bgGray50]}>
            <View style={[styles.flexRow, styles.alignCenter, styles.mb3]}>
            </View>
            
            <View style={[styles.flexRow, styles.alignCenter, styles.gap4]}>
              <View style={[styles.flex1]}>
                <Text style={[styles.textXs, styles.textGray500, styles.mb2]}>
                  {isOtpVerified ? "Patient verified" : "Enter OTP provided by patient"}
                </Text>
                <TextInput
                  style={[
                    styles.p3, 
                    styles.roundedLg, 
                    styles.border, 
                    styles.borderGray300, 
                    styles.textCenter, 
                    styles.textLg, 
                    styles.fontBold, 
                    isOtpVerified ? styles.bgGray100 : styles.bgWhite
                  ]}
                  placeholder="0000"
                  value={isOtpVerified ? acceptedRide.otp : otpInput}
                  onChangeText={setOtpInput}
                  keyboardType="numeric"
                  maxLength={4}
                  editable={!isOtpVerified}
                />
              </View>
              <TouchableOpacity
                style={[styles.py3, styles.mt6, styles.px4, styles.roundedLg, isOtpVerified ? styles.bgMedical500 : styles.bgGray800, styles.alignCenter]}
                onPress={handleOtpVerification}
                disabled={otpInput.length !== 4 || isOtpVerified}
              >
                <Text style={[styles.textWhite, styles.textSm, styles.fontMedium]}>
                  {isOtpVerified ? "VERIFIED" : "VERIFY"}
                </Text>
              </TouchableOpacity>
            </View>
            
            {isOtpVerified && (
              <View style={[styles.flexRow, styles.alignCenter, styles.justifyCenter, styles.mt3]}>
                <Ionicons name="checkmark-circle" size={16} color={colors.medical[500]} />
                <Text style={[styles.textSm, styles.textMedical500, styles.ml2, styles.fontMedium]}>Patient verified successfully</Text>
              </View>
            )}
            
            {/* Debug info for development - remove in production */}
            {__DEV__ && (
              <View style={[styles.mt3, styles.p2, styles.roundedLg, styles.bgGray200]}>
                <Text style={[styles.textXs, styles.textGray600]}>Debug: Expected OTP = {acceptedRide.otp}</Text>
                <Text style={[styles.textXs, styles.textGray600]}>Verification persisted: {isOtpVerified ? "Yes" : "No"}</Text>
              </View>
            )}
          </View>

          {/* Status Action Buttons */}
          {acceptedRide.status === "START" && isOtpVerified && (
            <View style={[styles.mb4]}>
              <TouchableOpacity
                style={[styles.py4, styles.px4, styles.roundedLg, styles.bgGray800, styles.alignCenter]}
                onPress={() => {
                  // TODO: Implement status update to ARRIVED
                  console.log('Update status to ARRIVED');
                }}
              >
                <Text style={[styles.textWhite, styles.textBase, styles.fontMedium]}>ARRIVED AT PICKUP LOCATION</Text>
              </TouchableOpacity>
            </View>
          )}

          {acceptedRide.status === "ARRIVED" && isOtpVerified && (
            <View style={[styles.mb4]}>
              <TouchableOpacity
                style={[styles.py4, styles.px4, styles.roundedLg, styles.bgMedical500, styles.alignCenter]}
                onPress={async () => {
                  // TODO: Implement status update to COMPLETED
                  console.log('Update status to COMPLETED');
                  
                  // Clear OTP verification state when ride is completed
                  if (acceptedRide) {
                    await saveOtpVerificationState(acceptedRide._id, false);
                  }
                }}
              >
                <Text style={[styles.textWhite, styles.textBase, styles.fontMedium]}>COMPLETE EMERGENCY TRANSPORT</Text>
              </TouchableOpacity>
            </View>
          )}

          {acceptedRide.status === "COMPLETED" && (
            <View style={[styles.mb4, styles.p4, styles.roundedLg, styles.bgMedical50]}>
              <View style={[styles.flexRow, styles.alignCenter, styles.justifyCenter]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.medical[500]} />
                <Text style={[styles.textSm, styles.textMedical500, styles.ml2, styles.fontMedium]}>EMERGENCY TRANSPORT COMPLETED</Text>
              </View>
            </View>
          )}

          {/* OTP Required Message */}
          {!isOtpVerified && acceptedRide.status !== "COMPLETED" && (
            <View style={[styles.mb4, styles.p4, styles.roundedLg, styles.bgDanger50]}>
              <View style={[styles.flexRow, styles.alignCenter, styles.justifyCenter]}>
                <Ionicons name="information-circle" size={16} color={colors.danger[500]} />
                <Text style={[styles.textSm, styles.textDanger500, styles.ml2, styles.fontMedium]}>
                  Please verify OTP before proceeding
                </Text>
              </View>
            </View>
          )}          
          
          {/* Patient Details */}
          <View style={[styles.mb4, styles.p4, styles.roundedLg, styles.bgGray50]}>
            
            {/* Patient Name */}
            <View style={[styles.flexRow, styles.alignCenter, styles.mb4]}>
              <View style={[styles.w8, styles.h8, styles.roundedFull, styles.alignCenter, styles.justifyCenter, styles.mr3, styles.bgGray800]}>
                <Ionicons name="person" size={16} color={colors.medical[500]} />
              </View>
              <View style={[styles.flex1]}>
                <Text style={[styles.textXs, styles.textGray500, styles.mb1]}>Name</Text>
                <Text style={[styles.textBase, styles.textGray900, styles.fontMedium]}>
                  {acceptedRide.customer.name || "Name not provided"}
                </Text>
              </View>
            </View>

            {/* Phone Number */}
            <View style={[styles.flexRow, styles.alignCenter, styles.mb4]}>
              <View style={[styles.w8, styles.h8, styles.roundedFull, styles.alignCenter, styles.justifyCenter, styles.mr3, styles.bgGray800]}>
                <Ionicons name="call" size={16} color={colors.medical[500]} />
              </View>
              <View style={[styles.flex1]}>
                <Text style={[styles.textXs, styles.textGray500, styles.mb1]}>Contact Number</Text>
                <View style={[styles.flexRow, styles.alignCenter]}>
                  <Text style={[styles.textBase, styles.textGray900, styles.fontMedium, styles.flex1]}>
                    {acceptedRide.customer.phone}
                  </Text>
                  <TouchableOpacity
                    style={[styles.ml2, styles.py2, styles.px3, styles.roundedLg, styles.bgMedical500]}
                    onPress={() => {
                      if (acceptedRide.customer.phone) {
                        const phoneNumber = `tel:${acceptedRide.customer.phone}`;
                        Linking.openURL(phoneNumber);
                      }
                    }}
                  >
                    <Text style={[styles.textWhite, styles.textXs, styles.fontMedium]}>CALL</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Patient ID */}
            <View style={[styles.flexRow, styles.alignCenter]}>
              <View style={[styles.w8, styles.h8, styles.roundedFull, styles.alignCenter, styles.justifyCenter, styles.mr3, styles.bgGray800]}>
                <Ionicons name="id-card" size={16} color={colors.medical[500]} />
              </View>
              <View style={[styles.flex1]}>
                <Text style={[styles.textXs, styles.textGray500, styles.mb1]}>Patient ID</Text>
                <Text style={[styles.textBase, styles.textGray900, styles.fontMedium]}>
                  {acceptedRide.customer._id.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Fare Info */}
          <View style={[styles.mb4, styles.p4, styles.roundedLg, styles.bgGray50, styles.flexRow, styles.justifyBetween, styles.alignCenter]}>
            <View style={[styles.flexRow, styles.alignCenter]}>
              <View style={[styles.w8, styles.h8, styles.roundedFull, styles.alignCenter, styles.justifyCenter, styles.mr3, styles.bgGray800]}>
                <Ionicons name="cash" size={16} color={colors.medical[500]} />
              </View>
              <Text style={[styles.textBase, styles.textGray700, styles.fontMedium]}>Emergency Transport Fare</Text>
            </View>
            <Text style={[styles.textXl, styles.fontBold, styles.textGray900]}>₹{formatFare(acceptedRide.fare)}</Text>
          </View>

        </View>
      </View>
    </ScrollView>
  );
}
