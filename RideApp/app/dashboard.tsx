import {
  ActionCard,
  EmergencyPanel,
  FloatingActionButton,
  NotificationBanner,
  QuickStats,
  RecentActivityCard,
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

export default function RiderScreen() {
  const router = useRouter();
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [driverStats, setDriverStats] = useState({
    totalRides: 156,
    todayEarnings: 2850,
    weeklyEarnings: 18500,
    rating: 4.8,
    todayRides: 8,
    weeklyRides: 42,
    monthlyEarnings: 78500,
  });

  const [recentActivities] = useState([
    {
      id: '1',
      type: 'ride_completed' as const,
      message: 'Emergency transport to AIIMS Hospital',
      time: '2 hours ago',
      amount: 450,
    },
    {
      id: '2',
      type: 'payment_received' as const,
      message: 'Payment received for emergency ride',
      time: '3 hours ago',
      amount: 320,
    },
    {
      id: '3',
      type: 'rating_received' as const,
      message: 'Received appreciation from patient family',
      time: '4 hours ago',
    },
    {
      id: '4',
      type: 'ride_completed' as const,
      message: 'Patient transfer to Max Hospital',
      time: '5 hours ago',
      amount: 280,
    },
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        router.replace('/');
      } else {
        setTokenLoaded(true);
        setLoading(false);
        // TODO: Fetch driver stats from API
        await loadDriverData();
      }
    };
    checkAuth();
  }, []);

  const loadDriverData = async () => {
    // Simulate API call
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
        '🚑 Going Online',
        'You are now online and ready to respond to emergency medical transport requests. Please ensure your ambulance is properly equipped and you are ready to provide medical assistance.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        '🛑 Going Offline',
        'You are now offline and will stop receiving new emergency requests. Make sure to complete any ongoing transports safely.',
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
        'Please go online to start receiving emergency medical transport requests.',
        [{ text: 'OK' }]
      );
    }
  };

  const navigateToRiderHistory = () => {
    Alert.alert('Coming Soon', 'Emergency transport history feature is coming soon!');
  };

  const navigateToEarnings = () => {
    Alert.alert('Coming Soon', 'Detailed earnings analysis feature is coming soon!');
  };

  const navigateToRiderSettings = () => {
    Alert.alert('Coming Soon', 'Driver profile and certification management is coming soon!');
  };

  const handleEmergencyPress = () => {
    Alert.alert(
      '🚨 Emergency Contacts',
      'Emergency Medical: 108\nPolice: 100\nFire: 101\nAmbulance Support: +91-XXXXXXXXXX\nHospital Dispatch: +91-XXXXXXXXXX',
      [{ text: 'OK' }]
    );
  };

  const handleProfilePress = () => {
    Alert.alert('Driver Profile', 'Medical certification and profile management coming soon!');
  };

  if (loading) {
    return (
      <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary[600]} />
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
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={[styles.mt4, styles.textGray600, styles.textBase, { textAlign: 'center' }]}>
            Loading your dashboard...
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
      <View style={[styles.flex1]}>
        {/* Background Gradient */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 200,
            backgroundColor: colors.gray[50],
          }}
        />
        
        <ScrollView
          style={[styles.flex1]}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary[600]]}
              tintColor={colors.primary[600]}
            />
          }
        >
          <View style={{ padding: 20 }}>
            {/* Welcome Header */}
            <WelcomeHeader
              driverName="Dr. Rajesh Kumar"
              onProfilePress={handleProfilePress}
              isOnline={isOnline}
            />        {isOnline && (
          <NotificationBanner
            message="Emergency services active. Standby for incoming requests from medical facilities."
            type="success"
            onClose={() => setShowNotification(false)}
          />
        )}

        {!isOnline && showNotification && (
          <NotificationBanner
            message="You are currently offline. Go online to receive emergency requests."
            type="warning"
            actionText="Go Online"
            onActionPress={toggleOnlineStatus}
            onClose={() => setShowNotification(false)}
          />
        )}

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
                title="Today's Rides"
                value={driverStats.todayRides}
                subtitle="Emergency calls"
                icon="�"
                color={colors.medical[500]}
                style={{ flex: 1 }}
              />
              <StatsCard
                title="Service Rating"
                value={driverStats.rating}
                subtitle="Patient feedback"
                icon="⭐"
                color={colors.warning[500]}
                style={{ flex: 1 }}
              />
            </View>

            <View style={[styles.flexRow, styles.mb4, { gap: 12 }]}>
              <StatsCard
                title="Weekly Rides"
                value={driverStats.weeklyRides}
                subtitle="This week"
                icon="�"
                color={colors.secondary[500]}
                style={{ flex: 1 }}
              />
              <StatsCard
                title="Weekly Earnings"
                value={`₹${driverStats.weeklyEarnings}`}
                subtitle="7 days total"
                icon="💰"
                color={colors.gray[600]}
                style={{ flex: 1 }}
              />
            </View>

            {/* Action Cards */}
            <View style={[styles.mb4]}>
              <Text style={[styles.text2xl, styles.fontBold, styles.textGray900, styles.mb4]}>
                Quick Actions
              </Text>

              <ActionCard
                title="Emergency History"
                subtitle="View completed emergency transports and patient details"
                icon="📋"
                backgroundColor={colors.medical[600]}
                onPress={navigateToRiderHistory}
              />

              <ActionCard
                title="Earnings Report"
                subtitle="Track your earnings and payment details"
                icon="💳"
                backgroundColor={colors.secondary[600]}
                onPress={navigateToEarnings}
              />

              <ActionCard
                title="Driver Profile"
                subtitle="Update certification, vehicle info and emergency contacts"
                icon="👨‍⚕️"
                backgroundColor={colors.gray[600]}
                onPress={navigateToRiderSettings}
              />
            </View>

            {/* Emergency Panel */}
            <EmergencyPanel onEmergencyPress={handleEmergencyPress} />

            {/* Recent Activity */}
            <RecentActivityCard activities={recentActivities} />

            {/* Logout Button */}
            <View style={[styles.alignCenter, { marginTop: 20 }]}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.white,
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.danger[300],
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
                    color: colors.danger[600],
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
