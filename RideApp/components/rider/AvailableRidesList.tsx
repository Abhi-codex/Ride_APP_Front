import { Ionicons } from '@expo/vector-icons';
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";

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
  availableRides,
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
  };  return (
    <View style={[styles.flex1]}>
      {/* Header */}
      <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween, styles.mb4]}>
        <View style={[styles.flexRow, styles.alignCenter]}>
          <View style={[
            styles.w3, styles.h3, styles.bgSecondary500, styles.roundedFull, styles.mr3,
            { shadowColor: '#ef4444', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 }
          ]} />
          <Text style={[styles.textLg, styles.fontBold, styles.textGray900]}>
            Emergency Requests
          </Text>
        </View>
        <View style={[
          styles.bgSecondary100, styles.px3, styles.py1, styles.roundedFull
        ]}>
          <Text style={[styles.textSm, styles.fontBold, styles.textSecondary700]}>
            {availableRides.length} Available
          </Text>
        </View>
      </View>      {/* Rides List */}
      <View style={[styles.flex1]}>
        {availableRides.map((ride, index) => (
          <View
            key={ride._id}
            style={[
              styles.bgWhite,
              styles.roundedXl,
              styles.mb4,
              styles.overflowHidden,
              { 
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
                borderWidth: 1,
                borderColor: '#f1f5f9'
              }
            ]}
          >            {/* Priority Badge */}
            <View
              style={[
                styles.px4, 
                styles.py2, 
                styles.bgSecondary500,
                { 
                  shadowColor: '#ef4444',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4
                }
              ]}
            >
              <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween]}>
                <View style={[styles.flexRow, styles.alignCenter]}>
                  <Ionicons name="medical" size={16} color="white" />
                  <Text style={[styles.textWhite, styles.fontBold, styles.textSm, styles.ml2]}>
                    EMERGENCY #{index + 1}
                  </Text>
                </View>
                <View style={[styles.flexRow, styles.alignCenter]}>
                  <Ionicons name="time" size={14} color="white" />
                  <Text style={[styles.textWhite, styles.textXs, styles.ml1, styles.fontMedium]}>
                    Now
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
                  <View style={[
                    styles.w4, styles.h4, styles.bgPrimary500, styles.roundedFull, 
                    styles.alignCenter, styles.justifyCenter, styles.mr3
                  ]}>
                    <Ionicons name="location" size={12} color="white" />
                  </View>
                  <View style={[styles.flex1]}>
                    <Text style={[styles.textXs, styles.textGray500, styles.fontMedium, styles.mb1]}>
                      PICKUP LOCATION
                    </Text>
                    <Text style={[styles.textSm, styles.textGray900, styles.fontMedium]} numberOfLines={2}>
                      {ride.pickup.address}
                    </Text>
                  </View>
                </View>                {/* Route Line */}
                <View style={[styles.flexRow, styles.alignCenter, styles.mb3]}>
                  <View style={[styles.w4, styles.alignCenter]}>
                    <View style={[
                      styles.w0Point5, styles.h6, styles.bgGray300
                    ]} />
                  </View>
                  <View style={[styles.flex1, styles.ml3]}>
                    <View style={[styles.flexRow, styles.alignCenter]}>
                      <Ionicons name="car" size={14} color="#6b7280" />
                      <Text style={[styles.textXs, styles.textGray500, styles.ml2]}>
                        Estimated 8-12 mins
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Drop Location */}
                <View style={[styles.flexRow, styles.alignCenter]}>
                  <View style={[
                    styles.w4, styles.h4, styles.bgSecondary500, styles.roundedFull, 
                    styles.alignCenter, styles.justifyCenter, styles.mr3
                  ]}>
                    <Ionicons name="medical" size={12} color="white" />
                  </View>
                  <View style={[styles.flex1]}>
                    <Text style={[styles.textXs, styles.textGray500, styles.fontMedium, styles.mb1]}>
                      DESTINATION HOSPITAL
                    </Text>
                    <Text style={[styles.textSm, styles.textGray900, styles.fontMedium]} numberOfLines={2}>
                      {ride.drop.address}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Fare & Distance Info */}
              <View style={[
                styles.bgGray50, styles.roundedLg, styles.p3, styles.mb4,
                styles.flexRow, styles.justifyBetween, styles.alignCenter
              ]}>
                <View style={[styles.flexRow, styles.alignCenter]}>
                  <Ionicons name="cash" size={16} color="#059669" />
                  <Text style={[styles.textSm, styles.textGray600, styles.ml2]}>Fare</Text>
                </View>
                <Text style={[styles.textLg, styles.fontBold, styles.textPrimary600]}>
                  ₹{ride.fare}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={[styles.flexRow, styles.gap3]}>
                <TouchableOpacity
                  style={[
                    styles.flex1,
                    styles.py3Point5,
                    styles.px4,
                    styles.roundedLg,
                    styles.alignCenter,
                    styles.borderWidth2,
                    styles.borderGray300,
                    styles.bgGray50,
                  ]}
                  onPress={() => handleRejectRide(ride._id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.flexRow, styles.alignCenter]}>
                    <Ionicons name="close" size={16} color="#6b7280" />
                    <Text style={[styles.textGray700, styles.fontBold, styles.textSm, styles.ml1]}>
                      Pass
                    </Text>
                  </View>
                </TouchableOpacity>                <TouchableOpacity
                  style={[
                    styles.flex2,
                    styles.py3Point5,
                    styles.px4,
                    styles.roundedLg,
                    styles.alignCenter,
                    styles.bgSecondary500,
                    { 
                      shadowColor: '#22c55e',
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 6
                    }
                  ]}
                  onPress={() => handleAcceptRide(ride._id)}
                  activeOpacity={0.8}
                >
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
        ))}        
        {/* End Spacer */}
        <View style={{ height: 20 }} />
      </View>
    </View>
  );
}
