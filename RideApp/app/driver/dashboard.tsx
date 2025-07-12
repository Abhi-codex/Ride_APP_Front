import { ActionCard, FloatingActionButton, QuickStats, StatsCard, WelcomeHeader } from '../../components/dashboard';
import { colors, styles } from '../../constants/TailwindStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { getServerUrl } from '../../utils/network';

export default function DriverDashboard() {
  const router = useRouter();
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [driverStats, setDriverStats] = useState({
    totalRides: 0,
    todayEarnings: 0,
    weeklyEarnings: 0,
    rating: 0,
    todayRides: 0,
    weeklyRides: 0,
    monthlyEarnings: 0,
  });
  const [driverProfile, setDriverProfile] = useState({
    name: 'Driver',
    id: '',
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
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        router.replace('/');
        return;
      }

      // Fetch driver statistics
      const statsResponse = await fetch(`${getServerUrl()}/driver/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Driver stats:', statsData);
        setDriverStats({
          totalRides: statsData.data.totalRides || 0,
          todayEarnings: statsData.data.todayEarnings || 0,
          weeklyEarnings: statsData.data.weeklyEarnings || 0,
          rating: statsData.data.rating || 0,
          todayRides: statsData.data.todayRides || 0,
          weeklyRides: statsData.data.weeklyRides || 0,
          monthlyEarnings: statsData.data.monthlyEarnings || 0,
        });
      } else {
        console.error('Failed to fetch driver stats:', statsResponse.status);
        // Don't show error alert on first load, just log it
        if (!dataLoaded) {
          console.log('Using default stats values for first load');
        }
      }

      // Fetch driver profile
      const profileResponse = await fetch(`${getServerUrl()}/driver/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('Driver profile:', profileData);
        setDriverProfile({
          name: profileData.data.name || 'Driver',
          id: profileData.data._id || '',
        });
        
        // Set online status from backend
        setIsOnline(profileData.data.isOnline || false);
      } else {
        console.error('Failed to fetch driver profile:', profileResponse.status);
        // Don't show error alert on first load, just log it
        if (!dataLoaded) {
          console.log('Using default profile values for first load');
        }
      }

      setDataLoaded(true);

    } catch (error) {
      console.error('Error loading driver data:', error);
      if (dataLoaded) {
        // Only show error alert if this is a refresh, not initial load
        Alert.alert('Error', 'Failed to load driver data. Please try again.');
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDriverData();
    setRefreshing(false);
  };

  const toggleOnlineStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const newStatus = !isOnline;
      
      // Update backend first
      const response = await fetch(`${getServerUrl()}/driver/online-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isOnline: newStatus }),
      });

      if (response.ok) {
        setIsOnline(newStatus);
        Alert.alert(
          newStatus ? 'Going Online' : 'Going Offline',
          newStatus 
            ? 'You are now online and ready to accept ride requests.'
            : 'You are now offline and will stop receiving new requests.',
          [{ text: 'OK' }]
        );
      } else {
        console.error('Failed to update online status:', response.status);
        Alert.alert('Error', 'Failed to update online status. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling online status:', error);
      Alert.alert('Error', 'Failed to update online status. Please try again.');
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

  const navigateToDriverMap = () => {
    if (isOnline) {
      router.push('/driver/map');
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
    router.push('/driver/profile');
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
              driverName={driverProfile.name}
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
                value={dataLoaded ? driverStats.totalRides : '...'}
                subtitle="All time"
                style={{ flex: 1 }}
              />
              <StatsCard
                title="Rating"
                value={dataLoaded ? driverStats.rating.toFixed(1) : '...'}
                subtitle="Average"
                style={{ flex: 1 }}
              />
            </View>

            <View style={[styles.flexRow, styles.mb6, { gap: 12 }]}>
              <StatsCard
                title="Weekly Rides"
                value={dataLoaded ? driverStats.weeklyRides : '...'}
                subtitle="This week"
                style={{ flex: 1 }}
              />
              <StatsCard
                title="Weekly Earnings"
                value={dataLoaded ? `₹${driverStats.weeklyEarnings}` : '...'}
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
                onPress={navigateToDriverMap}
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
