import React from "react";
import { Dimensions, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";
import { styles } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";
import DriverDrawerContent from "./DriverDrawerContent";
import DriverMinimizedInfo from "./DriverMinimizedInfo";

const { height: screenHeight } = Dimensions.get("window");

interface DriverDrawerProps {
  translateY: any;
  currentSnapPoint: "MINIMIZED" | "PARTIAL" | "FULL";
  gestureHandler: any;
  acceptedRide: Ride | null;
  availableRides: Ride[];
  online: boolean;
  driverLocation: any;
  destination: any;
  tripStarted: boolean;
  onAcceptRide: (rideId: string) => void;
  onRejectRide: (rideId: string) => void;
  onToggleOnline: () => void;
  onUpdateRideStatus: (rideId: string, status: any) => void;
  distanceKm: string;
  etaMinutes: number;
  fare: number;
}

export default function DriverDrawer({
  translateY,
  currentSnapPoint,
  gestureHandler,
  acceptedRide,
  availableRides,
  online,
  driverLocation,
  destination,
  tripStarted,
  onAcceptRide,
  onRejectRide,
  onToggleOnline,
  onUpdateRideStatus,
  distanceKm,
  etaMinutes,
  fare,
}: DriverDrawerProps) {
  const drawerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleStyle = useAnimatedStyle(() => {
    const SNAP_POINTS = {
      MINIMIZED: screenHeight - 180,
      PARTIAL: screenHeight * 0.5,
      FULL: screenHeight * 0.1,
    };

    const opacity = interpolate(
      translateY.value,
      [SNAP_POINTS.FULL, SNAP_POINTS.PARTIAL, SNAP_POINTS.MINIMIZED],
      [0.3, 0.6, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });
  return (
    <Animated.View
      style={[ styles.absolute, styles.left1, styles.right1, styles.bgWhite, styles.rounded2xl, 
        styles.shadowLg, styles.z999, styles.roundedTl3xl, styles.roundedTr3xl,
        { height: screenHeight, top: 0 }, drawerStyle ]}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={[ styles.alignCenter, styles.py3, styles.borderB1, styles.borderGray100, handleStyle ]}>
          <View
            style={[styles.w12, styles.h1, styles.bgGray300, styles.rounded]}
          />
        </Animated.View>
      </PanGestureHandler>

      {currentSnapPoint === "MINIMIZED" ? (
        <DriverMinimizedInfo
          availableRidesCount={availableRides.length}
          online={online}
          todaysEarnings="125"
          ongoingRide={acceptedRide}
        />
      ) : (
        <DriverDrawerContent
          currentSnapPoint={currentSnapPoint}
          acceptedRide={acceptedRide}
          availableRides={availableRides}
          online={online}
          driverLocation={driverLocation}
          destination={destination}
          tripStarted={tripStarted}
          onAcceptRide={onAcceptRide}
          onRejectRide={onRejectRide}
          onToggleOnline={onToggleOnline}
          onUpdateRideStatus={onUpdateRideStatus}
          distanceKm={distanceKm}
          etaMinutes={etaMinutes}
          fare={fare}
        />
      )}
    </Animated.View>
  );
}
