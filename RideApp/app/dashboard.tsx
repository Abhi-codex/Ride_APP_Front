import {
  ActionCard,
  FloatingActionButton,
  QuickStats,
  StatsCard,
  WelcomeHeader,
} from '@/components/dashboard';
import { colors, styles } from '@/constants/TailwindStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [driverStats, setDriverStats] = useState({
    totalRides: 156,
    todayEarnings: 2850,
    weeklyEarnings: 18500,
    rating: 4.8,
    todayRides: 8,
    weeklyRides: 42,
    monthlyEarnings: 78500,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        router.replace('/');
      } else {
        setTokenLoaded(true);
        setLoading(false);
        await loadDriverData();
      }
    };
    checkAuth();
  }, []);

  const loadDriverData = async () => {
    setTimeout(() => {
      setDriverStats(prev => ({
        ...prev,
        totalRides: Math.floor(Math.random() * 200) + 100,
        todayEarnings: Math.floor(Math.random() * 5000) + 1000,
        weeklyEarnings: Math.floor(Math.random() * 25000) + 10000,
      }));
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDriverData();
    setRefreshing(false);
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      Alert.alert(
        'Going Online',
        'You are now online and ready to accept ride requests.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Going Offline',
        'You are now offline and will stop receiving new requests.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('refresh_token');
            await AsyncStorage.removeItem('role');
            router.replace('/');
          },
        },
      ]
    );
  };

  const navigateToRiderDashboard = () => {
    if (isOnline) {
      router.push('/rider/' as any);
    } else {
      Alert.alert(
        'Go Online First',
        'Please go online to start receiving ride requests.',
        [{ text: 'OK' }]
      );
    }
  };

  const navigateToEarnings = () => {
    Alert.alert('Coming Soon', 'Earnings feature is coming soon!');
  };

  const handleProfilePress = () => {
    Alert.alert('Profile', 'Profile management coming soon!');
  };

  if (loading) {
    return (
      <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter, { backgroundColor: colors.gray[50] }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.gray[50]} />
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: 20,
            padding: 40,
            alignItems: 'center',
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <ActivityIndicator size="large" color={colors.gray[600]} />
          <Text style={[styles.mt4, styles.textGray600, styles.textBase, { textAlign: 'center' }]}>
            Loading dashboard...
          </Text>
        </View>
      </View>
    );
  }

  if (!tokenLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.gray[50]} />
      <View style={[styles.flex1, { backgroundColor: colors.gray[50] }]}>
        <ScrollView
          style={[styles.flex1]}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 60 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.gray[600]]}
              tintColor={colors.gray[600]}
            />
          }
        >
          <View style={{ padding: 20 }}>
            {/* Welcome Header */}
            <WelcomeHeader
              driverName="John Driver"
              onProfilePress={handleProfilePress}
              isOnline={isOnline}
            />

            {/* Quick Stats */}
            <QuickStats
              todayRides={driverStats.todayRides}
              totalRides={driverStats.totalRides}
              rating={driverStats.rating}
              todayEarnings={driverStats.todayEarnings}
              onStatsPress={navigateToEarnings}
            />

            {/* Stats Grid */}
            <View style={[styles.flexRow, styles.mb4, { gap: 12 }]}>
              <StatsCard
                title="Total Rides"
                value={driverStats.totalRides}
                subtitle="All time"
                style={{ flex: 1 }}
              />
              <StatsCard
                title="Rating"
                value={driverStats.rating}
                subtitle="Average"
                style={{ flex: 1 }}
              />
            </View>

            <View style={[styles.flexRow, styles.mb6, { gap: 12 }]}>
              <StatsCard
                title="Weekly Rides"
                value={driverStats.weeklyRides}
                subtitle="This week"
                style={{ flex: 1 }}
              />
              <StatsCard
                title="Weekly Earnings"
                value={`₹${driverStats.weeklyEarnings}`}
                subtitle="7 days total"
                style={{ flex: 1 }}
              />
            </View>

            {/* Action Cards */}
            <View style={[styles.mb6]}>
              <Text style={[styles.textXl, styles.fontBold, styles.textGray900, styles.mb4]}>
                Quick Actions
              </Text>

              <ActionCard
                title="Start Driving"
                subtitle="Go online and start accepting ride requests"
                onPress={navigateToRiderDashboard}
              />

              <ActionCard
                title="View Earnings"
                subtitle="Track your earnings and payment details"
                onPress={navigateToEarnings}
              />
            </View>

            {/* Logout Button */}
            <View style={[styles.alignCenter, { marginTop: 20 }]}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.white,
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.gray[300],
                  shadowColor: colors.black,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={handleLogout}
              >
                <Text
                  style={{
                    color: colors.gray[700],
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <FloatingActionButton
          onPress={toggleOnlineStatus}
          isOnline={isOnline}
        />
      </View>
    </>
  );
}
