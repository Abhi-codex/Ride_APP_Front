import React, { useEffect, useState, useMemo } from "react";
import { Text, View } from "react-native";
import { colors, styles } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";
import { MapViewWrapper as MapView, MarkerWrapper as Marker, PolylineWrapper as Polyline } from "../MapView";
import { getCachedDirectionData, LatLng, formatDuration, formatDistance, getFallbackDistance } from "@/utils/directions";

interface DriverMapProps {
  driverLocation: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  acceptedRide: Ride | null;
  destination: { latitude: number; longitude: number } | null;
  routeCoords: Array<{ latitude: number; longitude: number }>;
  online?: boolean;
  availableRides?: Ride[];
  isSearching?: boolean;
}

export default function DriverMap({
  driverLocation,
  acceptedRide,
  destination,
  routeCoords,
  online = true,
  availableRides = [],
  isSearching = false,
}: DriverMapProps) {

  const [pendingCalculations, setPendingCalculations] = useState(new Set<string>());
  const [rideDistances, setRideDistances] = useState<{[rideId: string]: {distance: number, duration: number}}>({});
  const [acceptedRideDetails, setAcceptedRideDetails] = useState<{distance: number, duration: number} | null>(null);
  const closestRide = useMemo(() => {
    if (availableRides.length === 0 || Object.keys(rideDistances).length === 0) return null;
    const ridesWithDistances = availableRides
      .filter(ride => rideDistances[ride._id])
      .map(ride => ({
        ...ride,
        driverToPickupDistance: rideDistances[ride._id]?.distance || 999999,
        driverToPickupDuration: rideDistances[ride._id]?.duration || 999999
      }));
    
    if (ridesWithDistances.length === 0) return null;
    
    return [...ridesWithDistances].sort(
      (a, b) => a.driverToPickupDistance - b.driverToPickupDistance
    )[0];
  }, [availableRides, rideDistances]);
  useEffect(() => {
    if (!driverLocation || !online || availableRides.length === 0) return;
    
    const BATCH_SIZE = 3;
    let cancelled = false;
    
    const calculateRideDistances = async () => {
      const newDistances: {[rideId: string]: {distance: number, duration: number}} = {};
      
      for (let i = 0; i < availableRides.length; i += BATCH_SIZE) {
        if (cancelled) break;
        
        const batch = availableRides.slice(i, i + BATCH_SIZE);
        const batchPromises = [];
        
        for (const ride of batch) {
          if (!ride.pickup || !ride.drop || !ride._id) continue;
          
          const cacheKey = `${ride._id}`;
          if (pendingCalculations.has(cacheKey)) continue;
          
          setPendingCalculations(prev => new Set(prev).add(cacheKey));
          const origin: LatLng = {
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude
          };
          
          const pickup: LatLng = {
            latitude: ride.pickup.latitude,
            longitude: ride.pickup.longitude
          };
          
          const promise = getCachedDirectionData(origin, pickup)
            .then(result => {
              if (cancelled) return;
              
              newDistances[ride._id] = {
                distance: result.distance,
                duration: result.duration
              };
            })
            .catch(error => {
              if (cancelled) return;
              
              console.warn('Error calculating distance for ride:', ride._id, error);
              const fallbackDistance = getFallbackDistance(
                origin,
                pickup
              );
              
              newDistances[ride._id] = {
                distance: fallbackDistance,
                duration: Math.ceil(fallbackDistance / 0.666)
              };
            })
            .finally(() => {
              if (cancelled) return;
              
              setPendingCalculations(prev => {
                const newSet = new Set(prev);
                newSet.delete(cacheKey);
                return newSet;
              });
            });
          
          batchPromises.push(promise);
        }
        
        if (batchPromises.length > 0) {
          await Promise.allSettled(batchPromises);
          
          if (Object.keys(newDistances).length > 0) {
            setRideDistances(prev => ({
              ...prev,
              ...newDistances
            }));
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    };
    
    calculateRideDistances();
    
    return () => {
      cancelled = true;
    };
  }, [driverLocation, availableRides, online]);

  // Effect to calculate distance and duration for accepted ride
  useEffect(() => {
    if (!driverLocation || !acceptedRide || !online) {
      setAcceptedRideDetails(null);
      return;
    }
    
    // Skip if no pickup or drop coordinates
    if (!acceptedRide.pickup || !acceptedRide.drop) return;
    
    let cancelled = false;
    
    const calculateAcceptedRideDetails = async () => {
      try {
        // Calculate from driver to pickup point
        const origin: LatLng = {
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude
        };
        
        const pickup: LatLng = {
          latitude: acceptedRide.pickup.latitude,
          longitude: acceptedRide.pickup.longitude
        };
        
        // Use the same Google Maps API functions used elsewhere
        const result = await getCachedDirectionData(origin, pickup);
        
        if (!cancelled) {
          setAcceptedRideDetails({
            distance: result.distance,
            duration: result.duration
          });
        }
      } catch (error) {
        console.warn('Error calculating accepted ride details:', error);
        
        // Use fallback calculation if API call fails
        if (!cancelled) {
          const fallbackDistance = getFallbackDistance(
            { latitude: driverLocation.latitude, longitude: driverLocation.longitude },
            { latitude: acceptedRide.pickup.latitude, longitude: acceptedRide.pickup.longitude }
          );
          
          setAcceptedRideDetails({
            distance: fallbackDistance,
            duration: Math.ceil(fallbackDistance / 0.666)
          });
        }
      }
    };
    
    calculateAcceptedRideDetails();
    
    return () => {
      cancelled = true;
    };
  }, [driverLocation, acceptedRide, online]);

  return (
    <View style={[styles.flex2]}>
      <MapView style={[styles.flex1]} region={driverLocation}>
        <Marker
          coordinate={driverLocation}
          title="Your Location"
          pinColor={colors.emergency[500]}
        />

        {acceptedRide && (
          <Marker
            coordinate={acceptedRide.pickup}
            title="Patient Pickup"
            pinColor={colors.warning[500]}
          />
        )}

        {destination && (
          <Marker
            coordinate={destination}
            title="Hospital Destination"
            pinColor={colors.danger[500]}
          />
        )}

        {/* Display available rides on the map */}
        {!acceptedRide &&
          availableRides.map((ride, index) => {
            // Get distance and ETA from state (or fallback to Haversine)
            const rideData = rideDistances[ride._id];
            const distanceAway = rideData?.distance || 
              getFallbackDistance(
                {latitude: driverLocation.latitude, longitude: driverLocation.longitude},
                {latitude: ride.pickup.latitude, longitude: ride.pickup.longitude}
              );
            
            const etaMinutes = rideData?.duration || 
              Math.ceil(distanceAway / 0.666); // Fallback calculation (40km/h)

            return (
              <Marker
                key={`ride-${ride._id || index}`}
                coordinate={ride.pickup}
                title={`Patient #${index + 1} (${distanceAway}km, ${formatDuration(etaMinutes)} away)`}
                pinColor={
                  closestRide && ride._id === closestRide._id
                    ? colors.secondary[500]
                    : colors.warning[400]
                }
              />
            );
          })}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={colors.emergency[500]}
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Unified legend for map status and available rides */}
      {online && !acceptedRide && (
        <View
          style={[styles.absolute, styles.bgWhite, styles.roundedXl, styles.px3, styles.py2, 
            { top: 16, left: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }]}
        >
          <View style={[styles.flexRow, styles.alignCenter, styles.mb2]}>
            <Text
              style={[styles.textSm, styles.fontMedium, {
                color: availableRides.length > 0 ? colors.warning[700] : isSearching ? colors.emergency[700] : colors.gray[600],
              }]}
            >
                {availableRides.length > 0
                ? availableRides.length === 1
                  ? "1 Patient Found"
                  : `${availableRides.length} Patients Found`
                : isSearching
                ? "Searching for Patients..."
                : "No Patients Found"}
            </Text>
          </View>

          {availableRides.length > 0 && (
            <>
              <View style={[styles.flexRow, styles.alignCenter, styles.mb1]}>
                <View
                  style={[styles.mr2, {
                    width: 8, 
                    height: 8, 
                    borderRadius: 4, 
                    backgroundColor: colors.warning[400],
                  }]}
                />
                <Text style={[styles.textXs]}>Available Patients</Text>
              </View>

              {closestRide && (
                <View style={[styles.flexRow, styles.alignCenter]}>
                  <View style={[styles.mr2, {width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary[500] }]}/>
                  <Text style={[styles.textXs]}>
                    Nearest Patient ({closestRide.driverToPickupDistance}km, {formatDuration(closestRide.driverToPickupDuration)} away)
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {online && acceptedRide && (
        <View
          style={[styles.absolute, styles.top10, styles.left5, styles.bgWhite, styles.roundedXl, styles.px3, styles.py3, 
            { shadowColor: "#10b981", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 }]}
        >
          <View style={[styles.flexRow, styles.alignCenter, styles.mb1]}>
            <Text
              style={[styles.textSm, styles.fontBold, { color: "#dc2626" }]}
            >
              Active Emergency
            </Text>
          </View>

          <View style={[styles.flexRow, styles.alignCenter, styles.mb1]}>
            <View style={[styles.w3, styles.mr1]}>
              <Text style={[styles.textXs, styles.textGray500]}>🚑</Text>
            </View>
            <Text style={[styles.textXs, styles.fontMedium]}>
              {acceptedRide.vehicle || "Standard Ambulance"}
            </Text>
          </View>

          <View style={[styles.flexRow, styles.alignCenter, styles.mb1]}>
            <View style={[styles.w3, styles.mr1]}>
              <Text style={[styles.textXs, styles.textGray500]}>⏱️</Text>
            </View>
            <Text style={[styles.textXs]}>
              {acceptedRideDetails 
                ? `${formatDistance(acceptedRideDetails.distance)} (${formatDuration(acceptedRideDetails.duration)})`
                : acceptedRide.distance
                  ? `${formatDistance(acceptedRide.distance)} (${formatDuration(Math.ceil(acceptedRide.distance / 0.666))})`
                  : "Calculating distance..."}
            </Text>
          </View>

          {destination && (
            <View style={[styles.flexRow, styles.alignCenter]}>
              <View style={[styles.w3, styles.mr1]}>
          <Text style={[styles.textXs, styles.textGray500]}>🏥</Text>
              </View>
              <Text style={[styles.textXs]} numberOfLines={1}>
          {(acceptedRide.drop?.address || "Hospital destination").slice(0, 15)}
          {acceptedRide.drop?.address && acceptedRide.drop.address.length > 15 ? "..." : ""}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Offline status indicator */}
      {!online && (
        <View
          style={[ styles.absolute, styles.top10, styles.left5, styles.bgWhite, styles.roundedXl,
            styles.px3, styles.py2, { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 }, styles.flexRow, styles.alignCenter]}>
          <View
            style={[{width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray[400]}, styles.mr2]}/>
          <Text
            style={[styles.textSm, styles.fontMedium, { color: colors.gray[600] } ]}>
            Offline
          </Text>
        </View>
      )}
    </View>
  );
}
