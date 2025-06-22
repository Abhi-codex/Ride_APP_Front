import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StatusBar, Text, View } from "react-native";
import AcceptedRideInfo from "../../components/rider/AcceptedRideInfo";
import AvailableRidesList from "../../components/rider/AvailableRidesList";
import RiderControlPanel from "../../components/rider/RiderControlPanel";
import RiderMap from "../../components/rider/RiderMap";
import { colors, styles } from "../../constants/TailwindStyles";
import { useRiderLogic } from "../../hooks/useRiderLogic";
import { haversineDistance } from "../../utils/distance";

export default function RiderDrivingScreen() {
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    (async () => {
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

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setDriverLocation(region);
      } catch (error) {
        Alert.alert(
          "Location Error",
          "Unable to get your current location. Please try again."
        );
        console.error("Location error:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const distanceKm =
    driverLocation && destination
      ? (
          haversineDistance(
            driverLocation.latitude,
            driverLocation.longitude,
            destination.latitude,
            destination.longitude
          ) / 1000
        ).toFixed(2)
      : "0";

  const etaMinutes = driverLocation
    ? Math.ceil(parseFloat(distanceKm) / 0.666)
    : 0;
  const fare = Math.ceil(parseFloat(distanceKm) * 15);

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
        <StatusBar barStyle="dark-content" backgroundColor={colors.gray[50]} />
        <View style={[styles.alignCenter, styles.p6]}>
          <View
            style={[
              styles.w20,
              styles.h20,
              styles.bgPrimary100,
              styles.roundedFull,
              styles.justifyCenter,
              styles.alignCenter,
              styles.mb4,
            ]}
          >
            <Text style={[styles.text4xl]}>🚑</Text>
          </View>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text
            style={[
              styles.mt4,
              styles.textGray800,
              styles.textXl,
              styles.fontBold,
              styles.textCenter,
            ]}
          >
            Ambulance Driver
          </Text>
          <Text
            style={[
              styles.mt2,
              styles.textGray600,
              styles.textBase,
              styles.textCenter,
              styles.px4,
            ]}
          >
            Getting your location and checking for emergency ride requests...
          </Text>{" "}
          <View
            style={[
              styles.mt5,
              styles.bgPrimary50,
              styles.rounded2xl,
              styles.p4,
              styles.borderL,
              styles.border4,
              styles.borderPrimary500,
            ]}
          >
            <Text
              style={[
                styles.textPrimary700,
                styles.textSm,
                styles.fontMedium,
                styles.textCenter,
              ]}
            >
              🏥 Ready to serve patients in emergency situations
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (!driverLocation) {
    return (
      <View
        style={[
          styles.flex1,
          styles.justifyCenter,
          styles.alignCenter,
          styles.bgGray50,
          styles.p6,
        ]}
      >
        <StatusBar barStyle="dark-content" backgroundColor={colors.gray[50]} />
        <View
          style={[
            styles.bgWhite,
            styles.rounded2xl,
            styles.p6,
            styles.shadowLg,
            styles.alignCenter,
          ]}
        >
          <Text style={[styles.text3xl, styles.mb4]}>📍</Text>
          <Text
            style={[
              styles.textGray800,
              styles.textLg,
              styles.fontBold,
              styles.textCenter,
              styles.mb2,
            ]}
          >
            Location Access Needed
          </Text>
          <Text
            style={[
              styles.textGray600,
              styles.textBase,
              styles.textCenter,
              styles.mb4,
            ]}
          >
            Please enable location services to start receiving emergency ride
            requests.
          </Text>
          <View
            style={[
              styles.bgDanger500,
              styles.roundedLg,
              styles.p3,
              styles.wFull,
            ]}
          >
            <Text
              style={[
                styles.textWhite,
                styles.textSm,
                styles.textCenter,
                styles.fontMedium,
              ]}
            >
              🚨 Location required for emergency services
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.flex1, styles.bgGray50]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.primary[600]}
      />

      <RiderMap
        driverLocation={driverLocation}
        acceptedRide={acceptedRide}
        destination={destination}
        routeCoords={routeCoords}
      />

      <RiderControlPanel
        online={online}
        distanceKm={distanceKm}
        etaMinutes={etaMinutes}
        fare={fare}
        acceptedRide={acceptedRide}
        tripStarted={tripStarted}
        onToggleOnline={toggleOnline}
        onUpdateRideStatus={updateRideStatus}
      />

      <AvailableRidesList
        online={online}
        acceptedRide={acceptedRide}
        availableRides={availableRides}
        onAcceptRide={(rideId: string) =>
          handleAcceptRide(rideId, driverLocation)
        }
        onRejectRide={handleRejectRide}
      />

      <AcceptedRideInfo acceptedRide={acceptedRide} />
    </View>
  );
}
