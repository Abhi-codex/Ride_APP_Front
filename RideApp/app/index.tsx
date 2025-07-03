import { useRouter } from "expo-router";
import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, styles as tailwindStyles } from "../constants/TailwindStyles";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View
      style={[
        tailwindStyles.flex1,
        tailwindStyles.justifyCenter,
        tailwindStyles.alignCenter,
        { backgroundColor: colors.gray[50] },
      ]}
    >
      {/* Header */}
      <View style={[tailwindStyles.alignCenter, tailwindStyles.mb6]}>
        <View
          style={{
            backgroundColor: colors.emergency[500],
            width: 100,
            height: 100,
            borderRadius: 50,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text style={{ fontSize: 50, color: colors.white }}>🚑</Text>
        </View>
        <Text style={[tailwindStyles.text3xl, tailwindStyles.fontBold, tailwindStyles.textGray900, tailwindStyles.textCenter]}>
          Emergency Medical Services
        </Text>
        <Text style={[tailwindStyles.textBase, tailwindStyles.textGray600, tailwindStyles.textCenter, tailwindStyles.mt2]}>
          Professional ambulance services at your fingertips
        </Text>
      </View>

      <View style={[tailwindStyles.px5, tailwindStyles.wFull]}>
        <TouchableOpacity
          style={[
            tailwindStyles.wFull,
            tailwindStyles.py4,
            tailwindStyles.alignCenter,
            tailwindStyles.roundedXl,
            tailwindStyles.mb4,
            {
              backgroundColor: colors.emergency[500],
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            },
          ]}
          onPress={() => router.push("/driver/login")}
        >
          <View style={[tailwindStyles.flexRow, tailwindStyles.alignCenter]}>
            <Text style={{ fontSize: 24, marginRight: 24 }}>🧑🏻‍⚕️</Text>
            <View>
              <Text style={[tailwindStyles.textWhite, tailwindStyles.textLg, tailwindStyles.fontBold]}>
                Driver Portal
              </Text>
              <Text style={[tailwindStyles.textWhite, tailwindStyles.textSm, { opacity: 0.9 }]}>
                For ambulance drivers and EMTs
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            tailwindStyles.wFull,
            tailwindStyles.py4,
            tailwindStyles.alignCenter,
            tailwindStyles.roundedXl,
            tailwindStyles.borderGray300,
            tailwindStyles.bgWhite,
            {
              borderWidth: 2,
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            },
          ]}
          onPress={() => router.push("/patient/login")}
        >
          <View style={[tailwindStyles.flexRow, tailwindStyles.alignCenter]}>
            <Text style={{ fontSize: 24, marginRight: 24 }}>🏥</Text>
            <View>
              <Text style={[tailwindStyles.textGray900, tailwindStyles.textLg, tailwindStyles.fontBold]}>
                Book an Ambulance
              </Text>
              <Text style={[tailwindStyles.textGray600, tailwindStyles.textSm]}>
                For patients and family members
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer Info */}
      <View style={[tailwindStyles.mt6, tailwindStyles.px5]}>
        <View
          style={[
            tailwindStyles.p4,
            tailwindStyles.roundedLg,
            tailwindStyles.bgGray100,
            tailwindStyles.borderGray200,
            { borderWidth: 1 },
          ]}
        >
          <Text style={[tailwindStyles.textSm, tailwindStyles.fontMedium, tailwindStyles.textGray800, tailwindStyles.textCenter, tailwindStyles.mb2]}>
           Emergency Services Available 24/7
          </Text>
          <Text style={[tailwindStyles.textXs, tailwindStyles.textGray600, tailwindStyles.textCenter]}>
            Professional medical transport • Certified EMT drivers • Real-time tracking
          </Text>
        </View>
      </View>
    </View>
  );
}
