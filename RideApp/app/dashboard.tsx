import { colors, styles } from '@/constants/TailwindStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function RiderScreen() {
  const router = useRouter();
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [driverStats, setDriverStats] = useState({
    totalRides: 0,
    todayEarnings: 0,
    weeklyEarnings: 0,
    rating: 4.8
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        router.replace('/');
      } else {
        setTokenLoaded(true);
        setLoading(false);
        // TODO: Fetch driver stats from API
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('role');
    router.replace('/');
  };

  const navigateToRiderDashboard = () => {
    router.push('/rider/' as any);
  };

  const navigateToRiderHistory = () => {
    Alert.alert('Coming Soon', 'Ride history feature is coming soon!');
  };

  const navigateToRiderSettings = () => {
    Alert.alert('Coming Soon', 'Driver settings feature is coming soon!');
  };

  if (loading) {
    return (
      <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter, styles.bgGray50]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.mt4, styles.textGray600, styles.textBase]}>Loading driver dashboard...</Text>
      </View>
    );
  }

  if (!tokenLoaded) {
    return null;
  }

  return (
    <View style={[styles.flex1, styles.bgGray50]}>
      <ScrollView contentContainerStyle={[styles.p4]}>
        {/* Welcome Header */}
        <View style={[styles.bgWhite, styles.roundedLg, styles.p4, styles.mb4, styles.shadowLg]}>
          <Text style={[styles.textXl, styles.fontBold, styles.textGray800, styles.mb2]}>
            Welcome, Driver! 👋
          </Text>
          <Text style={[styles.textBase, styles.textGray600]}>
            Ready to help patients get to their medical appointments safely.
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={[styles.flexRow, styles.mb4]}>
          <View style={[styles.flex1, styles.bgWhite, styles.roundedLg, styles.p3, styles.mr2, styles.shadowLg]}>
            <Text style={[styles.textSm, styles.textGray600]}>Today's Earnings</Text>
            <Text style={[styles.textLg, styles.fontBold, styles.textPrimary600]}>₹{driverStats.todayEarnings}</Text>
          </View>
          <View style={[styles.flex1, styles.bgWhite, styles.roundedLg, styles.p3, styles.shadowLg]}>
            <Text style={[styles.textSm, styles.textGray600]}>Total Rides</Text>
            <Text style={[styles.textLg, styles.fontBold, styles.textSecondary600]}>
              {driverStats.totalRides}
            </Text>
          </View>
        </View>

        <View style={[styles.flexRow, styles.mb4]}>
          <View style={[styles.flex1, styles.bgWhite, styles.roundedLg, styles.p3, styles.mr2, styles.shadowLg]}>
            <Text style={[styles.textSm, styles.textGray600]}>Rating</Text>
            <Text style={[styles.textLg, styles.fontBold, { color: colors.warning[500] }]}>
              ⭐ {driverStats.rating}
            </Text>
          </View>
          <View style={[styles.flex1, styles.bgWhite, styles.roundedLg, styles.p3, styles.shadowLg]}>
            <Text style={[styles.textSm, styles.textGray600]}>This Week</Text>
            <Text style={[styles.textLg, styles.fontBold, styles.textGray800]}>₹{driverStats.weeklyEarnings}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.mb4]}>
          <TouchableOpacity
            style={[
              styles.bgPrimary500,
              styles.py4,
              styles.px4,
              styles.roundedLg,
              styles.alignCenter,
              styles.mb3,
              styles.shadowLg,
            ]}
            onPress={navigateToRiderDashboard}
          >
            <Text style={[styles.textWhite, styles.textLg, styles.fontBold]}>
              🚑 Start Driving
            </Text>
            <Text style={[styles.textWhite, styles.textSm, styles.mt1]}>
              Go online and start accepting ambulance requests
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bgSecondary500,
              styles.py4,
              styles.px4,
              styles.roundedLg,
              styles.alignCenter,
              styles.mb3,
              styles.shadowLg,
            ]}
            onPress={navigateToRiderHistory}
          >
            <Text style={[styles.textWhite, styles.textLg, styles.fontBold]}>
              📋 Ride History
            </Text>
            <Text style={[styles.textWhite, styles.textSm, styles.mt1]}>
              View your completed rides and earnings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bgGray500,
              styles.py4,
              styles.px4,
              styles.roundedLg,
              styles.alignCenter,
              styles.shadowLg,
            ]}
            onPress={navigateToRiderSettings}
          >
            <Text style={[styles.textWhite, styles.textLg, styles.fontBold]}>
              ⚙️ Settings
            </Text>
            <Text style={[styles.textWhite, styles.textSm, styles.mt1]}>
              Manage your driver profile and preferences
            </Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Info */}
        <View style={[styles.bgDanger500, styles.roundedLg, styles.p4, styles.mb4]}>
          <Text style={[styles.textWhite, styles.fontBold, styles.textBase, styles.mb2]}>
            🚨 Emergency Protocol
          </Text>
          <Text style={[styles.textWhite, styles.textSm]}>
            Always prioritize patient safety. In case of emergency, call 108 immediately.
          </Text>
        </View>

        {/* Logout Button */}
        <View style={[styles.alignCenter, styles.mt4]}>
          <TouchableOpacity
            style={[
              styles.bgGray100,
              styles.py3,
              styles.px4,
              styles.roundedLg,
              styles.border,
              { borderColor: colors.danger[500] }
            ]}
            onPress={handleLogout}
          >
            <Text style={[{ color: colors.danger[600] }, styles.textBase, styles.fontBold]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
