import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import LoginImage from "../assets/images/login.png";
import { styles } from "../constants/TailwindStyles";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter, styles.bgGray50]}>
      {/* Header */}
      <View style={[styles.alignCenter, styles.mb6]}>
        <View style={[styles.alignCenter, styles.justifyCenter]}>
          <Image
            source={LoginImage}
            style={[styles.w64, styles.h64, styles.roundedFull]}
            resizeMode="cover"
            accessibilityLabel="Ambulance Login Icon"
          />
        </View>
        <Text style={[styles.textSm, styles.textGray600, styles.textCenter]}>
          Professional ambulance services at your fingertips
        </Text>
      </View>

      <View style={[styles.px5, styles.wFull]}>
        <TouchableOpacity
          style={[styles.wFull, styles.py4, styles.alignCenter, styles.roundedXl, styles.mb4, styles.bgEmergency500, styles.shadowMd]}
          onPress={() => router.push("/patient/login")}
        >
          <View style={[styles.flexRow, styles.alignCenter]}>
            <MaterialCommunityIcons name="ambulance" size={36} color="#fff" style={styles.mr4} />
            <View>
              <Text style={[styles.textWhite, styles.textLg, styles.fontBold]}>
                Book an Ambulance
              </Text>
              <Text style={[styles.textWhite, styles.textSm]}>
                For patients and family members
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.wFull, styles.py4, styles.alignCenter, styles.roundedXl, styles.borderGray300, styles.bgWhite, styles.shadowSm, styles.border2]}
          onPress={() => router.push("/driver/login")}
        >
          <View style={[styles.flexRow, styles.alignCenter]}>
            <FontAwesome5 name="user-md" size={34} color={styles.textGray900.color || "#111"} style={styles.mr4} />
            <View>
              <Text style={[styles.textGray900, styles.textLg, styles.fontBold]}>
                Driver Portal
              </Text>
              <Text style={[styles.textGray600, styles.textSm]}>
                For ambulance drivers and EMTs
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer Info */}
      <View style={[styles.mt6, styles.px5]}>
        <View style={[styles.p4]}> 
          <Text style={[styles.textSm, styles.fontMedium, styles.textGray800, styles.textCenter, styles.mb2]}>
           Emergency Services Available 24/7
          </Text>
          <Text style={[styles.textXs, styles.textGray600, styles.textCenter]}>
            Certified EMTs • Real-time tracking
          </Text>
        </View>
      </View>
    </View>
  );
}
