import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { 
  getRideDurations, 
  getDirectionsCacheKey,
  RideDirections, 
  formatDuration, 
  formatDistance,
  CACHE_DURATION,
  directionsCache,
  LatLng
} from "../../utils/directions";
import { styles } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";

interface AvailableRidesListProps {
  online: boolean;
  acceptedRide: Ride | null;
  availableRides: Ride[];
  driverLocation: { latitude: number; longitude: number };
  onAcceptRide: (rideId: string) => void;
  onRejectRide: (rideId: string) => void;
}

// Utility function to calculate relative time
const getRelativeTime = (createdAt: string | Date): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  
  // Handle invalid dates or future dates
  if (isNaN(diffMs) || diffMs < 0) return "Just now";
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 30) return "Just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes === 1) return "1 min ago";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours === 1) return "1 hr ago";
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};

export default function AvailableRidesList({
  online,
  acceptedRide,
  availableRides,
  driverLocation,
  onAcceptRide,
  onRejectRide,
}: AvailableRidesListProps) {
  if (!online || acceptedRide) {
    return null;
  }
  if (availableRides.length === 0) {
    return null;
  }

  const handleAcceptRide = (rideId: string) => {
    Alert.alert(
      "Accept Emergency Request",
      "Are you ready to respond to this emergency ambulance request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => onAcceptRide(rideId),
          style: "default",
        },
      ]
    );
  };

  const handleRejectRide = (rideId: string) => {
    Alert.alert(
      "Reject Request",
      "Are you sure you want to reject this ambulance request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          onPress: () => onRejectRide(rideId),
          style: "destructive",
        },
      ]
    );
  };

  const RideItem = ({ 
    ride, 
    index 
  }: { 
    ride: Ride; 
    index: number; 
  }) => {
    const [directions, setDirections] = useState<RideDirections>({ 
      toPickup: 0, 
      toDropoff: 0,
      pickupDistance: 0,
      dropoffDistance: 0
    });
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [relativeTime, setRelativeTime] = useState(getRelativeTime(ride.createdAt));

    // Update relative time every 30 seconds
    useEffect(() => {
      const updateTime = () => setRelativeTime(getRelativeTime(ride.createdAt));
      updateTime(); // Initial update
      
      const interval = setInterval(updateTime, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }, [ride.createdAt]);

    const cacheKey = useMemo(() => {
      if (!driverLocation) return null;
      return getDirectionsCacheKey(
        { latitude: driverLocation.latitude, longitude: driverLocation.longitude },
        ride.pickup,
        ride.drop
      );
    }, [driverLocation, ride.pickup, ride.drop]);

    useEffect(() => {
      if (!driverLocation || !cacheKey) {
        setLoading(false);
        setHasError(true);
        setDirections({ toPickup: 0, toDropoff: 0, pickupDistance: 0, dropoffDistance: 0 });
        return;
      }

      // Check cache first
      const cached = directionsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setDirections(cached.directions);
        setLoading(false);
        setHasError(false);
        return;
      }

      setLoading(true);
      setHasError(false);
      
      // Create LatLng objects
      const origin: LatLng = { 
        latitude: driverLocation.latitude, 
        longitude: driverLocation.longitude 
      };
      
      getRideDurations(origin, ride.pickup, ride.drop)
        .then((result) => {
          setDirections(result);
          setHasError(false);
          // Cache is handled inside getRideDurations
        })
        .catch((error) => {
          console.error('Error fetching ride durations for ride:', ride._id, error);
          setHasError(true);
          // Always provide fallback durations - better than showing 0
          const fallbackDirections: RideDirections = { toPickup: 8, toDropoff: 12, pickupDistance: 5.0, dropoffDistance: 8.0 };
          setDirections(fallbackDirections);
        })
        .finally(() => setLoading(false));
    }, [cacheKey, ride._id]);

    const formatFare = (fare: number): number => {
      return Math.round(fare / 5) * 5;
    };

    const renderEtaText = (): string => {
      if (loading) return "Calculating route...";
      if (hasError && directions.toPickup === 0) return "Location required for ETA";
      if (hasError) return `~${formatDuration(directions.toPickup)} pickup, ~${formatDuration(directions.toDropoff)} dropoff (estimated)`;
      return `Pickup: ${formatDuration(directions.toPickup)}, Dropoff: ${formatDuration(directions.toDropoff)}`;
    };

    const renderDistanceText = (): string => {
      if (loading) return "Calculating distance...";
      if (hasError && directions.pickupDistance === 0) return "Distance unavailable";
      if (hasError) return `~${formatDistance(directions.pickupDistance)} pickup, ~${formatDistance(directions.dropoffDistance)} dropoff (estimated)`;
      return `Pickup: ${formatDistance(directions.pickupDistance)}, Dropoff: ${formatDistance(directions.dropoffDistance)}`;
    };

    return (
      <View style={[styles.bgWhite, styles.roundedXl, styles.mb4, styles.overflowHidden, { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.1, shadowRadius: 12, elevation: 8, borderWidth: 1, borderColor: "#e0f2fe" }]}>
        {/* Priority Badge */}
        <View style={[styles.px4, styles.py2, { backgroundColor: "#dc2626", shadowColor: "#dc2626", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 }]}>
          <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween]}>
            <View style={[styles.flexRow, styles.alignCenter]}>
              <Text style={[styles.textWhite, styles.fontBold, styles.textSm, styles.ml2]}>
                EMERGENCY {index + 1}
              </Text>
            </View>
            <View style={[styles.flexRow, styles.alignCenter]}>
              <Ionicons name="time" size={14} color="#fbbf24" />
              <Text style={[styles.textWhite, styles.textXs, styles.ml1, styles.fontMedium]}>
                {relativeTime}
              </Text>
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
                <Text style={[styles.textXs, { color: "#3b82f6" }, styles.fontBold, styles.mb1]}>PICKUP LOCATION</Text>
                <Text style={[styles.textSm, styles.textGray900, styles.fontMedium]} numberOfLines={2}>{ride.pickup.address}</Text>
              </View>
            </View>
            
            {/* Route Line */}
            <View style={[styles.flexRow, styles.alignCenter, styles.mb3]}>
              <View style={[styles.w4, styles.alignCenter]}>
                <View style={[styles.w0Point5, styles.h6, { backgroundColor: "#06b6d4" }]} />
              </View>
              <View style={[styles.flex1, styles.ml3]}>
                <View style={[styles.flexRow, styles.alignCenter, styles.mb1]}>
                  <Ionicons name={loading ? "time" : "car"} size={14} color={hasError ? "#ef4444" : "#06b6d4"} />
                  <Text style={[styles.textXs, hasError ? { color: "#ef4444" } : { color: "#374151" }, styles.ml2, loading && styles.fontMedium]}>{renderEtaText()}</Text>
                  {loading && <View style={[styles.ml2]}><Text style={[styles.textXs, { color: "#06b6d4" }]}>●</Text></View>}
                </View>
                <View style={[styles.flexRow, styles.alignCenter]}>
                  <Ionicons name={loading ? "time" : "navigate"} size={14} color={hasError ? "#ef4444" : "#8b5cf6"} />
                  <Text style={[styles.textXs, hasError ? { color: "#ef4444" } : { color: "#6b7280" }, styles.ml2, loading && styles.fontMedium]}>{renderDistanceText()}</Text>
                  {loading && <View style={[styles.ml2]}><Text style={[styles.textXs, { color: "#8b5cf6" }]}>●</Text></View>}
                </View>
              </View>
            </View>
            
            {/* Drop Location */}
            <View style={[styles.flexRow, styles.alignCenter]}>
              <View style={[styles.w5, styles.h5, styles.roundedFull, styles.alignCenter, styles.justifyCenter, styles.mr3, { backgroundColor: "#10b981" }]}>
                <Ionicons name="medical" size={12} color="white" />
              </View>
              <View style={[styles.flex1]}>
                <Text style={[styles.textXs, { color: "#10b981" }, styles.fontBold, styles.mb1]}>DESTINATION HOSPITAL</Text>
                <Text style={[styles.textSm, styles.textGray900, styles.fontMedium]} numberOfLines={2}>{ride.drop.address}</Text>
              </View>
            </View>
          </View>

          {/* Fare & Distance Info */}
          <View style={[{ backgroundColor: "#f0f9ff" }, styles.roundedLg, styles.p3, styles.mb4, styles.flexRow, styles.justifyBetween, styles.alignCenter]}>
            <View style={[styles.flexRow, styles.alignCenter]}>
              <Ionicons name="cash" size={16} color="#0ea5e9" />
              <Text style={[styles.textSm, { color: "#0ea5e9" }, styles.ml2, styles.fontMedium]}>Fare</Text>
            </View>
            <Text style={[styles.textLg, styles.fontBold, { color: "#0ea5e9" }]}>₹{formatFare(ride.fare)}</Text>
          </View>

          {/* Action Buttons */}
          <View style={[styles.flexRow, styles.gap3]}>
            <TouchableOpacity style={[styles.flex1, styles.py3, styles.px4, styles.roundedLg, styles.alignCenter, { backgroundColor: "#fef2f2"}]} 
              onPress={() => handleRejectRide(ride._id)} activeOpacity={0.7}>
              <View style={[styles.flexRow, styles.alignCenter]}>
                <Ionicons name="close" size={16} color="#dc2626" />
                <Text style={[{ color: "#dc2626" }, styles.fontBold, styles.textSm, styles.ml1]}>
                  Pass
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.flex2, styles.py3, styles.px4, styles.roundedLg, styles.alignCenter, 
              { backgroundColor: "#10b981", shadowColor: "#10b981", shadowOffset: { width: 0, height: 3 }, 
                shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 }]} 
              onPress={() => handleAcceptRide(ride._id)} activeOpacity={0.8}>
              <View style={[styles.flexRow, styles.alignCenter]}>
                <Ionicons name="checkmark-circle" size={18} color="white" />
                <Text style={[styles.textWhite, styles.fontBold, styles.textBase, styles.ml2]}>
                  Accept Emergency
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={[styles.flex1]}>
      {/* Header */}
      <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween, styles.mb4]}>
        <View style={[styles.flexRow, styles.alignCenter]}>
          <Text style={[styles.textLg, styles.fontBold, { color: "#1f2937" }]}>Emergency Requests</Text>
        </View>
        <View style={[{ backgroundColor: "#ddd6fe" }, styles.px3, styles.py1, styles.roundedFull]}>
          <Text style={[styles.textSm, styles.fontBold, { color: "#7c3aed" }]}>{availableRides.length} Available</Text>
        </View>
      </View>

      {/* Rides List */}
      <View style={[styles.flex1]}>
        {availableRides.map((ride, index) => (
          <RideItem key={ride._id} ride={ride} index={index} />
        ))}
        {/* End Spacer */}
        <View style={{ height: 20 }} />
      </View>
    </View>
  );
}
