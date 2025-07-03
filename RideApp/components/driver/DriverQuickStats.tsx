import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from "../../constants/TailwindStyles";
import { getServerUrl } from "../../utils/network";

interface DriverQuickStatsProps {
  availableRidesCount: number;
}

export default function DriverQuickStats({
  availableRidesCount,
}: DriverQuickStatsProps) {
  const [loading, setLoading] = useState(true);
  const [driverStats, setDriverStats] = useState({
    rating: "0",
    todaysEarnings: "0",
    totalRides: 0,
    todayRides: 0,
    weeklyRides: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0
  });

  useEffect(() => {
    fetchDriverStats();
  }, []);

  const fetchDriverStats = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found");
        setLoading(false);
        return;
      }

      const url = `${getServerUrl()}/driver/stats`;
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
      setDriverStats({
        rating: (data.data?.rating || 0).toFixed(1),
        todaysEarnings: `$${(data.data?.todayEarnings || 0).toFixed(0)}`,
        totalRides: data.data?.totalRides || 0,
        todayRides: data.data?.todayRides || 0,
        weeklyRides: data.data?.weeklyRides || 0,
        weeklyEarnings: data.data?.weeklyEarnings || 0,
        monthlyEarnings: data.data?.monthlyEarnings || 0
      });
    } catch (error) {
      console.error("Error fetching driver stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.flexRow, styles.justifyBetween, styles.mb6, styles.alignCenter]}>
        <ActivityIndicator size="small" color="#4f46e5" />
        <Text style={[styles.textSm, styles.textGray500]}>Loading stats...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.flexRow, styles.justifyBetween, styles.mb6]}>
      <View style={[styles.alignCenter]}>
        <Text
          style={[
            styles.text2xl,
            styles.fontBold,
            styles.textPrimary600,
          ]}
        >
          {availableRidesCount}
        </Text>
        <Text style={[styles.textSm, styles.textGray500]}>
          Emergency Calls
        </Text>
      </View>
      <View style={[styles.alignCenter]}>
        <Text
          style={[
            styles.text2xl,
            styles.fontBold,
            styles.textSecondary600,
          ]}
        >
          {driverStats.rating}
        </Text>
        <Text style={[styles.textSm, styles.textGray500]}>
          Rating
        </Text>
      </View>
      <View style={[styles.alignCenter]}>
        <Text
          style={[
            styles.text2xl,
            styles.fontBold,
            styles.textPrimary600,
          ]}
        >
          {driverStats.todaysEarnings}
        </Text>
        <Text style={[styles.textSm, styles.textGray500]}>
          Today's Earnings
        </Text>
      </View>
    </View>
  );
}
