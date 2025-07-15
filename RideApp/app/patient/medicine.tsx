import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';

interface Medicine {
  id: string;
  brand_name: string;
  generic_name: string;
  purpose: string;
}

export default function MedicineScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('Paracetamol');
  const router = useRouter();

  const fetchMedicines = async (query: string) => {
    setLoading(true);
    try {
      const encodedURL = encodeURIComponent(
        `https://medicine-api.p.rapidapi.com/medicine?id=123&name=${query}&product_name=${query}`
      );

      const response = await fetch(
        `https://medicine-api3.p.rapidapi.com/medicine?url=${encodedURL}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'medicine-api3.p.rapidapi.com',
            'x-rapidapi-key': '762c682ee7mshb4cfe8d5e1ea774p1386ebjsnf7089a511810',
          },
        }
      );

      const data = await response.json();
      console.log('API Response:', data);

      const meds = Array.isArray(data) ? data : [data];

      const formattedMeds = meds.map((item: any, index: number) => ({
        id: item.id || index.toString(),
        brand_name: item.brand_name,
        generic_name: item.generic_name,
        purpose: item.purpose,
      }));

      setMedicines(formattedMeds);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch medicines from RapidAPI.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines(searchQuery);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      fetchMedicines(searchQuery.trim());
    } else {
      Alert.alert('Input Error', 'Please enter a medicine name.');
    }
  };

  const renderItem = ({ item }: { item: Medicine }) => (
    <View style={styles.card}>
      <Text style={styles.brandName}>{item.brand_name}</Text>
      <Text style={styles.genericName}>{item.generic_name}</Text>
      <Text style={styles.purpose}>{item.purpose}</Text>
    </View>
  );

//   return (
//     <View style={styles.container}>
//   <Text style={styles.emoji}>💊</Text>
//   <Text style={styles.title}>Medicine Finder</Text>

//   <TextInput
//     style={styles.input}
//     placeholder="Enter medicine name"
//     value={searchQuery}
//     onChangeText={setSearchQuery}
//     onSubmitEditing={handleSearch}
//     returnKeyType="search"
//   />

//   <TouchableOpacity style={styles.button} onPress={handleSearch}>
//     <Text style={styles.buttonText}>🔍 Search</Text>
//   </TouchableOpacity>

//   {loading ? (
//     <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
//   ) : (
//     <View style={{ flex: 1 }}>
//       {medicines.length > 0 ? (
//         <FlatList
//           data={medicines}
//           keyExtractor={(item) => item.id}
//           renderItem={renderItem}
//           contentContainerStyle={styles.list}
//         />
//       ) : (
//         <View style={styles.comingSoonWrapper}>
//           <Text style={styles.comingSoonText}>🚧 Coming Soon...</Text>
//         </View>
//       )}
//     </View>
//   )}

//   <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//     <Text style={styles.buttonText}>← Back to Home</Text>
//   </TouchableOpacity>
// </View>

  //   );
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💊</Text>
      <Text style={styles.title}>Coming soon ..</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  emoji: { fontSize: 64, textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  brandName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  genericName: { fontSize: 16, color: '#555', marginBottom: 4 },
  purpose: { fontSize: 14, color: '#777' },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  comingSoonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
  },
});