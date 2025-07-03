import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { styles } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";
import { getServerUrl } from "../../utils/network";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AcceptedRideInfoProps {
  acceptedRide?: Ride | null;
  acceptedRideId?: string | null;
}

export default function AcceptedRideInfo({
  acceptedRide: propRide,
  acceptedRideId,
}: AcceptedRideInfoProps) {
  const [loading, setLoading] = useState(false);
  const [fetchedRide, setFetchedRide] = useState<Ride | null>(null);

  // Use the provided ride prop or the fetched ride
  const acceptedRide = propRide || fetchedRide;

  useEffect(() => {
    if (!propRide && acceptedRideId) {
      fetchAcceptedRide(acceptedRideId);
    }
  }, [acceptedRideId, propRide]);

  const fetchAcceptedRide = async (rideId: string) => {
    try {
      setLoading(true);
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
      setFetchedRide(data.ride);
    } catch (error) {
      console.error("Error fetching accepted ride details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.bgWhite,
          styles.roundedXl,
          styles.shadowLg,
          styles.p4,
          styles.alignCenter,
          styles.justifyCenter,
          styles.h32,
        ]}
      >
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={[styles.mt2, styles.textGray600]}>
          Loading trip details...
        </Text>
      </View>
    );
  }

  if (!acceptedRide) {
    return null;
  }

  return (
    <View
      style={[
        styles.bgWhite,
        styles.roundedXl,
        styles.shadowLg,
        styles.p4,
        styles.borderL,
        styles.borderPrimary500,
        { borderLeftWidth: 4 },
      ]}
    >
      <View
        style={[
          styles.flexRow,
          styles.alignCenter,
          styles.mb3,
          styles.pb2,
          styles.borderB,
          styles.borderGray200,
        ]}
      >
        <Text style={[styles.textLg, styles.fontBold, styles.textPrimary600]}>
          Active Trip
        </Text>
      </View>

      <View style={[styles.mb3]}>
        <Text
          style={[
            styles.textSm,
            styles.textGray600,
            styles.fontMedium,
            styles.mb1,
          ]}
        >
          Patient Pickup:
        </Text>
        <Text
          style={[styles.textSm, styles.textGray800, styles.fontMedium]}
          numberOfLines={3}
        >
          {acceptedRide.pickup.address}
        </Text>
      </View>

      <View style={[styles.mb3]}>
        <Text
          style={[
            styles.textSm,
            styles.textGray600,
            styles.fontMedium,
            styles.mb1,
          ]}
        >
          Hospital Destination:
        </Text>
        <Text
          style={[styles.textSm, styles.textGray800, styles.fontMedium]}
          numberOfLines={3}
        >
          {acceptedRide.drop.address}
        </Text>
      </View>

      <View
        style={[
          styles.flexRow,
          styles.justifyBetween,
          styles.alignCenter,
          styles.mt2,
          styles.pt3,
          styles.borderT,
          styles.borderGray200,
        ]}
      >
        <Text style={[styles.textSm, styles.textGray600, styles.fontMedium]}>
          Trip Fare:
        </Text>
        <Text style={[styles.textLg, styles.fontBold, styles.textSecondary600]}>
          ₹{acceptedRide.fare}
        </Text>
      </View>

      <View
        style={[
          styles.bgSecondary50,
          styles.roundedLg,
          styles.p2,
          styles.mt3,
          styles.alignCenter,
        ]}
      >
        <Text
          style={[
            styles.textSecondary700,
            styles.textXs,
            styles.fontBold,
            styles.textCenter,
          ]}
        >
          EMERGENCY MEDICAL TRANSPORT
        </Text>
      </View>
    </View>
  );
}
