import React from "react";
import { ScrollView, Text, View } from "react-native";
import { styles } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";
import AcceptedRideInfo from "./AcceptedRideInfo";
import AvailableRidesList from "./AvailableRidesList";
import NoRidesAvailable from "./NoRidesAvailable";
import RiderControlPanel from "./RiderControlPanel";
import RiderQuickStats from "./RiderQuickStats";

interface RiderDrawerContentProps {
  currentSnapPoint: 'MINIMIZED' | 'PARTIAL' | 'FULL';
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

export default function RiderDrawerContent({
  currentSnapPoint,
  acceptedRide,
  availableRides,
  online,
  onAcceptRide,
  onRejectRide,
  onToggleOnline,
  onUpdateRideStatus,
  tripStarted,
  distanceKm,
  etaMinutes,
  fare,
}: RiderDrawerContentProps) {  return (
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
          <RiderQuickStats
            availableRidesCount={availableRides.length}
            rating="4.9"
            todaysEarnings="125"
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
              Nearby Ride Requests
            </Text>

            {availableRides.length > 0 ? (
              <AvailableRidesList
                online={online}
                acceptedRide={acceptedRide}
                availableRides={availableRides}
                onAcceptRide={(rideId: string) =>
                  onAcceptRide(rideId)
                }
                onRejectRide={onRejectRide}
              />
            ) : (
              <NoRidesAvailable />
            )}
          </View>

          {currentSnapPoint === 'FULL' && (
            <View style={[styles.mt6]}>
              <RiderControlPanel
                online={online}
                distanceKm={distanceKm}
                etaMinutes={etaMinutes}
                fare={fare}
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
