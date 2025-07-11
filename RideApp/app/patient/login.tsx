import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors, styles } from "../../constants/TailwindStyles";
import { getServerUrl } from "../../utils/network";

export default function PatientLoginScreen() {
  const router = useRouter();
  const [phoneDigits, setPhoneDigits] = useState<string[]>(Array(10).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>(Array(10).fill(null));

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

  const getPhoneNumber = () => {
    const phoneNumber = phoneDigits.join("");
    return phoneNumber.length === 10 ? "+91" + phoneNumber : "";
  };

  const validatePhone = () => {
    const phoneNumber = phoneDigits.join("");
    return phoneNumber.length === 10 && /^\d{10}$/.test(phoneNumber);
  };

  const handlePatientLogin = async () => {
    const phoneNumber = phoneDigits.join("");

    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    if (!validatePhone()) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = getPhoneNumber();

      const response = await fetch(`${getServerUrl()}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formattedPhone,
          role: "patient",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("access_token", data.access_token);
        await AsyncStorage.setItem("refresh_token", data.refresh_token);
        await AsyncStorage.setItem("role", "patient");
        await AsyncStorage.setItem("user_id", data.user._id);

        // Check if patient profile is complete
        const isProfileComplete = data.user.name && 
                                 data.user.age && 
                                 data.user.gender && 
                                 data.user.bloodGroup && 
                                 data.user.emergencyContact;

        if (!isProfileComplete) {
          // Redirect to profile completion
          Alert.alert(
            'Welcome!',
            data.message === 'User created successfully' 
              ? 'Please complete your profile to help us provide better emergency care.'
              : 'Please complete your profile information to continue.',
            [
              {
                text: 'Complete Profile',
                onPress: () => router.replace('/patient/profile-setup'),
              },
            ]
          );
        } else {
          // Profile is complete, go to patient home/index
          Alert.alert("Success", "Login successful!", [
            {
              text: "Continue",
              onPress: () => router.replace("/patient"),
            },
          ]);
        }
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
    <KeyboardAvoidingView
      style={[styles.flex1]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.flex1, { backgroundColor: colors.gray[50] }]}
        contentContainerStyle={[styles.flexGrow, styles.justifyCenter]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.px5, styles.py6]}>
          {/* Header */}
          <View style={[styles.alignCenter, styles.mb6]}>
            <View
              style={{
                backgroundColor: colors.primary[600],
                width: 80,
                height: 80,
                borderRadius: 40,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 40, color: colors.white }}>🏥</Text>
            </View>
            <Text
              style={[
                styles.text3xl,
                styles.fontBold,
                styles.textGray900,
                styles.textCenter,
              ]}
            >
              Patient Login
            </Text>
            <Text
              style={[
                styles.textBase,
                styles.textGray600,
                styles.textCenter,
                styles.mt2,
              ]}
            >
              Book an ambulance for immediate medical assistance
            </Text>
          </View>

          {/* Phone Number Input */}
          <View style={[styles.mb6]}>
            <Text style={[styles.textXs, styles.textGray500, styles.mb3]}>
              Enter your mobile number
            </Text>

            {/* Phone Number Boxes */}
            <View style={[styles.flexRow, styles.justifyCenter, { gap: 6 }]}>
              {phoneDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    {
                      width: 32,
                      height: 40,
                      borderWidth: 1,
                      borderColor: digit
                        ? colors.primary[600]
                        : colors.gray[300],
                      borderRadius: 8,
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "600",
                      backgroundColor: colors.white,
                      color: colors.gray[900],
                    },
                    digit && {
                      borderColor: colors.primary[600],
                      backgroundColor: colors.primary[50],
                    },
                  ]}
                  value={digit}
                  onChangeText={(value) => handleDigitChange(index, value)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(index, nativeEvent.key)
                  }
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
          <TouchableOpacity
            style={[
              styles.wFull,
              styles.py4,
              styles.alignCenter,
              styles.roundedLg,
              {
                backgroundColor: loading || !validatePhone()
                  ? colors.gray[300]
                  : colors.primary[600],
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              },
            ]}
            onPress={handlePatientLogin}
            disabled={loading || !validatePhone()}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={[styles.textWhite, styles.textLg, styles.fontBold]}>
                Book Emergency Ambulance
              </Text>
            )}
          </TouchableOpacity>

          {/* Emergency Info Card */}
          <View
            style={[
              styles.mt6,
              styles.p4,
              styles.roundedLg,
              { backgroundColor: colors.emergency[50], borderColor: colors.emergency[200], borderWidth: 1 },
            ]}
          >
            <Text
              style={[
                styles.textSm,
                styles.fontMedium,
                { color: colors.emergency[800] },
                styles.mb2,
              ]}
            >
              Emergency Services Available:
            </Text>
            <Text style={[styles.textXs, { color: colors.emergency[700] }, styles.mb1]}>
              1. Basic Life Support Ambulance
            </Text>
            <Text style={[styles.textXs, { color: colors.emergency[700] }, styles.mb1]}>
              2. Advanced Life Support (ALS)
            </Text>
            <Text style={[styles.textXs, { color: colors.emergency[700] }, styles.mb1]}>
              3. ICU Ambulance with Ventilator
            </Text>
            <Text style={[styles.textXs, { color: colors.emergency[700] }]}>
              4. Air Ambulance for Critical Cases
            </Text>
          </View>

          {/* Emergency Number */}
          <View
            style={[
              styles.mt4,
              styles.p3,
              styles.roundedLg,
              styles.bgGray100,
              styles.alignCenter,
            ]}
          >
            <Text style={[styles.textXs, styles.textGray600, styles.mb1]}>
              For immediate emergency, call:
            </Text>
            <Text style={[styles.textBase, styles.fontBold, styles.textGray900]}>
              📞 108 | 🚑 102
            </Text>
          </View>

          {/* Back to Driver Login */}
          <TouchableOpacity
            style={[styles.alignCenter, styles.mt6]}
            onPress={() => router.replace("/")}
            disabled={loading}
          >
            <Text style={[styles.textSm, styles.textGray600]}>
              Are you a driver?{" "}
              <Text style={[styles.textPrimary600, styles.fontMedium]}>
                Driver Portal
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
