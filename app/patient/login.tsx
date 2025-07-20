import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors, styles } from "../../constants/TailwindStyles";
import { getServerUrl } from "../../utils/network";

export default function PatientLoginScreen() {
  const router = useRouter();
  const [phoneDigits, setPhoneDigits] = useState<string[]>(Array(10).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = React.useRef<Array<TextInput | null>>([]);

  React.useEffect(() => {
    const checkSession = async () => {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) return;
      router.replace("/patient");
    };
    checkSession();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newDigits = [...phoneDigits];
    newDigits[index] = value;
    setPhoneDigits(newDigits);
    if (value && index < 9) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !phoneDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const getPhoneNumber = () => phoneDigits.join("");
  const validatePhone = () => /^\d{10}$/.test(getPhoneNumber());

  const handlePatientLogin = async () => {
    if (!validatePhone()) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      const formattedPhone = "+91" + getPhoneNumber();
      const response = await fetch(`${getServerUrl()}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, role: "patient" }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem("access_token", data.access_token);
        await AsyncStorage.setItem("refresh_token", data.refresh_token);
        await AsyncStorage.setItem("role", "patient");
        await AsyncStorage.setItem("user_id", data.user._id);
        // Always go to patient home after login
        router.replace("/patient");
      } else {
        Alert.alert(
          "Login Failed",
          data.message || "Unable to login. Please try again."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Error",
        "Network error. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.flex1]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={[styles.flex1, styles.bgGray100]}
                  contentContainerStyle={[styles.flexGrow, styles.justifyCenter]}
                  keyboardShouldPersistTaps="handled">
        <View style={[styles.px5, styles.py6]}>
          {/* Header */}
          <View style={[styles.alignCenter, styles.mb6]}>
            <View style={{ alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <FontAwesome5 name="ambulance" size={64} color={colors.emergency[600]} />
            </View>
            <Text style={[styles.text3xl, styles.fontBold, styles.textGray900, styles.textCenter]}>
              Patient Portal
            </Text>
            <Text style={[styles.textBase, styles.textGray600, styles.textCenter, styles.mt2]}>
              Book an ambulance for immediate medical assistance
            </Text>
          </View>

          {/* Phone Number Input */}
          <View style={[styles.mb6]}>
            <Text style={[styles.textXs, styles.textGray500, styles.mb3]}>
              Enter your mobile number
            </Text>
            <View style={[styles.flexRow, styles.justifyCenter, { gap: 6 }]}> 
              {phoneDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    {width: 32, height: 40, borderWidth: 1, borderColor: digit ? colors.emergency[500] : colors.gray[300],
                      borderRadius: 8, textAlign: "center", fontSize: 16, fontWeight: "600", backgroundColor: colors.white,
                      color: colors.gray[900]}, digit && 
                      { borderColor: colors.emergency[500], backgroundColor: colors.emergency[50] }]
                  }
                  value={digit}
                  onChangeText={value => handleDigitChange(index, value)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                  keyboardType="numeric"
                  maxLength={1}
                  autoComplete="off"
                  selectTextOnFocus
                  editable={!loading}
                />
              ))}
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={[styles.wFull, styles.py4, styles.alignCenter, styles.roundedLg, 
              {backgroundColor: loading || !validatePhone() ? colors.gray[300] : colors.emergency[500],
                shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
                shadowRadius: 4, elevation: 3}]} onPress={handlePatientLogin} disabled={loading || !validatePhone()}>
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={[styles.textWhite, styles.textLg, styles.fontBold]}>
                Book Emergency Ambulance
              </Text>
            )}
          </TouchableOpacity>

          {/* Emergency Info Card */}
          <View style={[styles.mt6, styles.p4, styles.rounded3xl, styles.bgEmergency50, styles.borderEmergency200, { borderWidth: 1 }]}> 
            <Text style={[styles.textSm, styles.fontMedium, { color: colors.emergency[800] }, styles.mb2]}>
              Emergency Services Available:
            </Text>
            <Text style={[styles.textXs, { color: colors.emergency[700] }, styles.mb1]}>
              1.  BLS - Basic Life Support
            </Text>
            <Text style={[styles.textXs, { color: colors.emergency[700] }, styles.mb1]}>
              2.  ALS - Advanced Life Support
            </Text>
            <Text style={[styles.textXs, { color: colors.emergency[700] }, styles.mb1]}>
              3.  CCS - Critical Care Support
            </Text>
            <Text style={[styles.textXs, { color: colors.emergency[700] }, styles.mb1]}>
              4.  Auto Ambulance (Specially Designed)
              </Text>
            <Text style={[styles.textXs, { color: colors.emergency[700] }, styles.mb1]}>
              5.  Bike Safety Unit (Specially Designed)
            </Text>
          </View>

          {/* Back to Driver Login */}
          <TouchableOpacity style={[styles.alignCenter, styles.mt6]} onPress={() => router.replace("/driver/login")} disabled={loading}>
            <Text style={[styles.textSm, styles.textGray600]}>
              Are you a driver?{" "}
              <Text style={[styles.textEmergency500, styles.fontMedium]}>
                Driver Portal
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}