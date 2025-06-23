import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  Text,
  View,
} from "react-native";
import {
  runOnJS,
  useAnimatedGestureHandler,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import RiderDrawer from "../../components/rider/RiderDrawer";
import RiderFloatingToggle from "../../components/rider/RiderFloatingToggle";
import RiderMap from "../../components/rider/RiderMap";
import { colors, styles } from "../../constants/TailwindStyles";
import { useRiderLogic } from "../../hooks/useRiderLogic";
import { useRideSearching } from "../../hooks/useRideSearching";
import { haversineDistance } from "../../utils/distance";

const { height: screenHeight } = Dimensions.get("window");

const SNAP_POINTS = {
  MINIMIZED: screenHeight - 180, 
  PARTIAL: screenHeight * 0.5,   
  FULL: screenHeight * 0.1,   
};

export default function RiderDrivingScreen() {
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const translateY = useSharedValue(SNAP_POINTS.MINIMIZED);
  const [currentSnapPoint, setCurrentSnapPoint] = useState<'MINIMIZED' | 'PARTIAL' | 'FULL'>('MINIMIZED');
  const {
    routeCoords,
    destination,
    tripStarted,
    online,
    availableRides,
    acceptedRide,
    handleAcceptRide,
    updateRideStatus,
    handleRejectRide,
    toggleOnline,
  } = useRiderLogic();

  const { isSearching } = useRideSearching({
    online,
    acceptedRide,
    availableRides,
  });
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      translateY.value = context.startY + event.translationY;
    },
    onEnd: (event) => {
      const { velocityY } = event;
      let destSnapPoint = SNAP_POINTS.MINIMIZED;
      
      const currentY = translateY.value;
      
      if (currentY < SNAP_POINTS.FULL + 100) {
        destSnapPoint = SNAP_POINTS.FULL;
        runOnJS(setCurrentSnapPoint)('FULL');
      } else if (currentY < SNAP_POINTS.PARTIAL + 100) {
        if (velocityY < -500) {
          destSnapPoint = SNAP_POINTS.FULL;
          runOnJS(setCurrentSnapPoint)('FULL');
        } else if (velocityY > 500) {
          destSnapPoint = SNAP_POINTS.MINIMIZED;
          runOnJS(setCurrentSnapPoint)('MINIMIZED');
        } else {
          destSnapPoint = SNAP_POINTS.PARTIAL;
          runOnJS(setCurrentSnapPoint)('PARTIAL');
        }
      } else {
        if (velocityY < -500) {
          destSnapPoint = SNAP_POINTS.PARTIAL;
          runOnJS(setCurrentSnapPoint)('PARTIAL');
        } else {
          destSnapPoint = SNAP_POINTS.MINIMIZED;
          runOnJS(setCurrentSnapPoint)('MINIMIZED');
        }
      }
      
      translateY.value = withSpring(destSnapPoint, {
        damping: 20,
        stiffness: 90,
      });
    },
  });

  const distanceKm = driverLocation && destination
    ? (haversineDistance(
        driverLocation.latitude,
        driverLocation.longitude,
        destination.latitude,
        destination.longitude
      ) / 1000).toFixed(2)
    : "0";

  const etaMinutes = driverLocation && destination
    ? Math.ceil(parseFloat(distanceKm) / 0.666)
    : 0;

  const fare = driverLocation && destination
    ? Math.ceil(parseFloat(distanceKm) * 15)
    : 0;
  useEffect(() => {
    const initializeLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Location Permission Required",
            "We need location access to help you navigate to patients and show your position on the map.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Request Again", onPress: () => setLoading(false) },
            ]
          );
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const region = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setDriverLocation(region);
        setLoading(false);

        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (newLocation) => {
            const newRegion = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };
            setDriverLocation(newRegion);
          }
        );

        return () => subscription.remove();
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert(
          "Location Error",
          "Unable to get your current location. Please check your location settings."
        );
        setLoading(false);
      }
    };

    initializeLocationTracking();
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.flex1,
          styles.justifyCenter,
          styles.alignCenter,
          styles.bgGray50,
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.mt4, styles.textBase, styles.textGray600]}>
          Initializing location...
        </Text>
      </View>
    );
  }
  return (
    <View style={[styles.flex1, styles.bgGray50]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      
      <View style={[styles.flex1]}>
        {driverLocation && (
          <RiderMap
            driverLocation={driverLocation}
            acceptedRide={acceptedRide}
            destination={destination}
            routeCoords={routeCoords}
            online={online}
            availableRides={availableRides}
            isSearching={isSearching}
          />
        )}
      </View>

      <RiderFloatingToggle
        online={online}
        onToggle={toggleOnline}
      />

      <RiderDrawer
        translateY={translateY}
        currentSnapPoint={currentSnapPoint}
        gestureHandler={gestureHandler}
        acceptedRide={acceptedRide}
        availableRides={availableRides}
        online={online}
        driverLocation={driverLocation}
        destination={destination}
        tripStarted={tripStarted}
        onAcceptRide={(rideId: string) => handleAcceptRide(rideId, driverLocation)}
        onRejectRide={handleRejectRide}
        onToggleOnline={toggleOnline}
        onUpdateRideStatus={updateRideStatus}
        distanceKm={distanceKm}
        etaMinutes={etaMinutes}
        fare={fare}
      />
    </View>
  );
}
