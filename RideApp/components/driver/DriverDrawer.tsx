import React, { useEffect, useState } from "react";
import { Dimensions, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { styles } from "../../constants/TailwindStyles";
import DriverDrawerContent from "./DriverDrawerContent";
import DriverMinimizedInfo from "./DriverMinimizedInfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getServerUrl } from "../../utils/network";
import { RideStatus } from "../../types/rider";

const { height: screenHeight } = Dimensions.get("window");

interface DriverDrawerProps {
  translateY: any;
  currentSnapPoint: 'MINIMIZED' | 'PARTIAL' | 'FULL';
  gestureHandler: any;
  acceptedRideId: string | null;
  online: boolean;
  onToggleOnline: () => void;
}

export default function DriverDrawer({
  translateY,
  currentSnapPoint,
  gestureHandler,
  acceptedRideId,
  online,
  onToggleOnline,
}: DriverDrawerProps) {
  const [availableRidesCount, setAvailableRidesCount] = useState(0);

  useEffect(() => {
    if (online && !acceptedRideId) {
      fetchAvailableRidesCount();
    } else {
      setAvailableRidesCount(0);
    }
  }, [online, acceptedRideId]);

  const fetchAvailableRidesCount = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const url = `${getServerUrl()}/ride/driverrides`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      // Filter rides to count only those with SEARCHING status
      const searchingRides = data.rides?.filter((ride: any) => ride.status === RideStatus.SEARCHING) || [];
      setAvailableRidesCount(searchingRides.length);
    } catch (error) {
      console.error("Error fetching available rides:", error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, screenHeight],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  return (
    <PanGestureHandler {...gestureHandler}>
      <Animated.View style={[styles.flex1, animatedStyle]}>
        {currentSnapPoint === "MINIMIZED" ? (
          <DriverMinimizedInfo availableRidesCount={availableRidesCount} />
        ) : (
          <DriverDrawerContent
            currentSnapPoint={currentSnapPoint}
            acceptedRideId={acceptedRideId}
            online={online}
            onToggleOnline={onToggleOnline}
          />
        )}
      </Animated.View>
    </PanGestureHandler>
  );
}
