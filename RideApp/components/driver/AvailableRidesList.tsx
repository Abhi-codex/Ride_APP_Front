import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";
import { getServerUrl } from "../../utils/network";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AvailableRidesListProps {
  online: boolean;
  acceptedRide: Ride | null;
  availableRides: Ride[];
  onAcceptRide: (rideId: string) => void;
  onRejectRide: (rideId: string) => void;
}

export default function AvailableRidesList({
  online,
  acceptedRide,
  availableRides: availableRidesProp,
  onAcceptRide,
  onRejectRide,
}: AvailableRidesListProps) {
  const [availableRides, setAvailableRides] = useState<Ride[]>(availableRidesProp);

  useEffect(() => {
    setAvailableRides(availableRidesProp);
  }, [availableRidesProp]);

  useEffect(() => {
    if (online && !acceptedRide) {
      fetchAvailableRides();
    }
  }, [online, acceptedRide]);

  const fetchAvailableRides = async () => {
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
      setAvailableRides(data.rides || []);
    } catch (error) {
      console.error("Error fetching available rides:", error);
    }
  };

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
      "Skip Emergency Call",
      "Are you sure you want to skip this emergency call?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          onPress: () => onRejectRide(rideId),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View>
      {availableRides.map((ride) => (
        <View
          key={ride._id}
          style={[
            styles.bgWhite,
            styles.roundedXl,
            styles.shadowLg,
            styles.p4,
            styles.mb3,
            styles.borderL,
            styles.borderSecondary500,
            { borderLeftWidth: 4 },
          ]}
        >
          <View style={[styles.flexRow, styles.justifyBetween, styles.mb2]}>
            <View>
              <Text
                style={[
                  styles.textLg,
                  styles.fontBold,
                  styles.textGray900,
                ]}
              >
                Emergency Call
              </Text>
              <Text
                style={[
                  styles.textSm,
                  styles.textGray500,
                ]}
              >
                Medical Emergency
              </Text>
            </View>
          </View>

          <View style={[styles.flexCol, styles.gap1, styles.my2]}>
            <View style={[styles.flexRow, styles.alignCenter]}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text
                style={[
                  styles.ml2,
                  styles.textSm,
                  styles.textGray700,
                ]}
              >
                {ride.pickup?.address || "Unknown pickup location"}
              </Text>
            </View>
            <View style={[styles.flexRow, styles.alignCenter]}>
              <Ionicons name="flag" size={16} color="#6B7280" />
              <Text
                style={[
                  styles.ml2,
                  styles.textSm,
                  styles.textGray700,
                ]}
              >
                {ride.drop?.address || "Unknown destination"}
              </Text>
            </View>
          </View>

          <View style={[styles.flexRow, styles.mt3, styles.gap2]}>
            <TouchableOpacity
              style={[
                styles.flex1,
                styles.bgSecondary500,
                styles.py2,
                styles.alignCenter,
                styles.roundedLg,
              ]}
              onPress={() => handleAcceptRide(ride._id)}
            >
              <Text style={[styles.textWhite, styles.fontMedium]}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.flex1,
                styles.bgGray200,
                styles.py2,
                styles.alignCenter,
                styles.roundedLg,
              ]}
              onPress={() => handleRejectRide(ride._id)}
            >
              <Text style={[styles.textGray700, styles.fontMedium]}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}
