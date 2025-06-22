import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [tokenLoaded, setTokenLoaded] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        router.replace('/');
      } else {
        setTokenLoaded(true);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    router.replace('/');
  };

  if (!tokenLoaded) {
    return null;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Service</Text>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/ride')}>
        <Text style={styles.emoji}>🚑</Text>
        <Text style={styles.label}>Ride</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/dashboard')}>
        <Text style={styles.emoji}>🚗</Text>
        <Text style={styles.label}>Driver</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/medicine')}>
        <Text style={styles.emoji}>💊</Text>
        <Text style={styles.label}>Medicine</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/ai')}>
        <Text style={styles.emoji}>🤖</Text>
        <Text style={styles.label}>AI Assistant</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#333' },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingHorizontal: 32,
    marginVertical: 10,
    width: '80%',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  logout: {
    marginTop: 30,
    padding: 10,
  },
  logoutText: {
    color: 'red',
    fontWeight: 'bold',
  },
});