import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, styles as tailwindStyles } from "../constants/TailwindStyles";
import { getServerUrl, makeRequest } from "../utils/network";
import { storage } from "../utils/storage";

export default function AuthScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"customer" | "rider">("customer");
  const [loading, setLoading] = useState(false);
  const [serverUrl] = useState(getServerUrl());

  const handleSubmit = async () => {
    if (!phone || !role) {
      Alert.alert(
        "Validation Error",
        "Please enter your phone number and select a role."
      );
      return;
    }

    setLoading(true);

    try {
      console.log(`Attempting to connect to: ${serverUrl}`);

      const { response, data } = await makeRequest(`${serverUrl}/auth/signin`, {
        method: "POST",
        body: JSON.stringify({ phone, role }),
      });

      if (response.ok) {
        const userRole = data.user?.role;

        if (!userRole) {
          Alert.alert("Error", "Role not found in response.");
          setLoading(false);
          return;
        }

        try {
          await storage.setItem("access_token", data.access_token);
          await storage.setItem("refresh_token", data.refresh_token);
          await storage.setItem("role", userRole);
        } catch (storageError) {
          console.warn("Storage error:", storageError);
        }

        if (userRole === "customer") {
          router.push("/user");
        } else if (userRole === "rider") {
          router.push("/rider/dashboard");
        } else {
          Alert.alert("Unknown role", "Could not determine user role.");
        }
      } else {
        Alert.alert("Login Failed", data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Connection error:", error);

      let errorMessage = "Connection failed. ";

      if (error instanceof Error) {
        errorMessage += error.message;
      }

      if (Platform.OS === "web") {
        errorMessage += `\n\nPlease check if the server is running at: ${serverUrl}`;
      } else {
        errorMessage += `\n\nTroubleshooting for mobile:\n`;
        errorMessage += `1. Make sure your phone and computer are on the same WiFi network\n`;
        errorMessage += `2. Check if your computer's IP is correct: ${serverUrl}\n`;
        errorMessage += `3. Try disabling your computer's firewall temporarily\n`;
        errorMessage += `4. Make sure your server is running and accessible\n`;
        errorMessage += `5. Your computer's IP might have changed`;
      }

      Alert.alert("Connection Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        tailwindStyles.flex1,
        tailwindStyles.p5,
        tailwindStyles.justifyCenter,
      ]}
    >
      <Text
        style={[
          tailwindStyles.text2xl,
          tailwindStyles.fontBold,
          tailwindStyles.textCenter,
          tailwindStyles.mb5,
        ]}
      >
        Sign In
      </Text>

      <TextInput
        placeholder="Phone Number"
        style={[
          tailwindStyles.border,
          tailwindStyles.borderGray300,
          tailwindStyles.p3,
          tailwindStyles.mb5,
          tailwindStyles.roundedLg,
        ]}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <View
        style={[
          tailwindStyles.flexRow,
          tailwindStyles.justifyBetween,
          tailwindStyles.mb5,
        ]}
      >
        <TouchableOpacity
          onPress={() => setRole("customer")}
          style={[
            tailwindStyles.p3,
            tailwindStyles.roundedLg,
            tailwindStyles.border,
            tailwindStyles.borderGray400,
            { width: "48%" },
            tailwindStyles.alignCenter,
            role === "customer" && tailwindStyles.bgPrimary100,
          ]}
        >
          <Text style={[tailwindStyles.fontBold]}>Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setRole("rider")}
          style={[
            tailwindStyles.p3,
            tailwindStyles.roundedLg,
            tailwindStyles.border,
            tailwindStyles.borderGray400,
            { width: "48%" },
            tailwindStyles.alignCenter,
            role === "rider" && tailwindStyles.bgPrimary100,
          ]}
        >
          <Text style={[tailwindStyles.fontBold]}>Rider</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary[500]} />
      ) : (
        <Button title="Sign In" onPress={handleSubmit} />
      )}
    </View>
  );
}
