import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from "../../constants/TailwindStyles";
import { Ride, RideStatus } from "../../types/rider";
import { getServerUrl } from "../../utils/network";
import AcceptedRideInfo from "./AcceptedRideInfo";
import AvailableRidesList from "./AvailableRidesList";
import NoRidesAvailable from "./NoRidesAvailable";
import DriverControlPanel from "./DriverControlPanel";
import DriverQuickStats from "./DriverQuickStats";

interface DriverDrawerContentProps {
  currentSnapPoint?: 'MINIMIZED' | 'PARTIAL' | 'FULL';
  acceptedRideId: string | null;
  online: boolean;
  onToggleOnline: () => void;
}

export default function DriverDrawerContent({
  currentSnapPoint = 'PARTIAL',
  acceptedRideId,
  online,
  onToggleOnline,
}: DriverDrawerContentProps) {
  const [loading, setLoading] = useState(true);
  const [acceptedRide, setAcceptedRide] = useState<Ride | null>(null);
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [tripStarted, setTripStarted] = useState(false);

  useEffect(() => {
    if (acceptedRideId) {
      fetchAcceptedRide(acceptedRideId);
    } else {
      setAcceptedRide(null);
      fetchAvailableRides();
    }
  }, [acceptedRideId, online]);

  const fetchAcceptedRide = async (rideId: string) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const url = `${getServerUrl()}/ride/${rideId}`;
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
      setAcceptedRide(data.ride);
      setTripStarted(data.ride.status === RideStatus.START || data.ride.status === RideStatus.ARRIVED);
    } catch (error) {
      console.error("Error fetching accepted ride:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRides = async () => {
    try {
      if (!online) {
        setAvailableRides([]);
        return;
      }

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
      if (data.rides && Array.isArray(data.rides)) {
        const searchingRides = data.rides.filter((ride: Ride) => ride.status === RideStatus.SEARCHING);
        setAvailableRides(searchingRides);
      } else {
        setAvailableRides([]);
      }
    } catch (error) {
      console.error("Error fetching available rides:", error);
    } finally {
      setLoading(false);
    }
  };

  const onAcceptRide = async (rideId: string) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(`${getServerUrl()}/ride/accept/${rideId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setAcceptedRide(data.ride);
      setAvailableRides([]);
    } catch (error) {
      console.error("Error accepting ride:", error);
    }
  };

  const onRejectRide = (rideId: string) => {
    setAvailableRides(prev => prev.filter(r => r._id !== rideId));
  };

  const onUpdateRideStatus = async (rideId: string, status: RideStatus) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(`${getServerUrl()}/ride/update/${rideId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update ride status");
      }

      setAcceptedRide(data.ride);

      if (status === RideStatus.COMPLETED) {
        setAcceptedRide(null);
        fetchAvailableRides();
      } else if (status === RideStatus.START || status === RideStatus.ARRIVED) {
        setTripStarted(true);
      }
    } catch (error) {
      console.error("Error updating ride status:", error);
    }
  };

  return (
    <ScrollView
      style={[styles.flex1, styles.px4]}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      showsVerticalScrollIndicator={true}
      scrollEnabled={true}
      bounces={true}
      keyboardShouldPersistTaps="handled"
    >
      {acceptedRide ? (
        <View style={[styles.py4]}>
          <AcceptedRideInfo acceptedRide={acceptedRide} />
        </View>
      ) : (
        <View style={[styles.py4]}>
          <DriverQuickStats
            availableRidesCount={availableRides.length}
          />

          <View>
            <Text
              style={[
                styles.textLg,
                styles.fontSemibold,
                styles.textGray900,
                styles.mb3,
              ]}
            >
              Nearby Emergency Calls
            </Text>

            {availableRides.length > 0 ? (
              <AvailableRidesList
                online={online}
                acceptedRide={acceptedRide}
                availableRides={availableRides}
                onAcceptRide={onAcceptRide}
                onRejectRide={onRejectRide}
              />
            ) : (
              <NoRidesAvailable />
            )}
          </View>

          {currentSnapPoint === 'FULL' && (
            <View style={[styles.mt6]}>
              <DriverControlPanel
                online={online}
                acceptedRide={acceptedRide}
                tripStarted={tripStarted}
                onToggleOnline={onToggleOnline}
                onUpdateRideStatus={onUpdateRideStatus}
              />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
