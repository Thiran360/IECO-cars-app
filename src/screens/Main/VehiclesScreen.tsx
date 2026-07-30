import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getVehiclesByCategory } from '../../services/api';

const getImageUrl = (image: string | null | undefined) => {
  if (!image) return 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80';
  let url = image;
  if (url.includes('127.0.0.1') || url.includes('localhost')) {
    url = url.replace(/http:\/\/(127\.0\.0\.1|localhost)(:\d+)?/, 'https://primary-sculpture-empathy.ngrok-free.dev');
  } else if (!url.startsWith('http')) {
    url = `https://primary-sculpture-empathy.ngrok-free.dev${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
};

interface Vehicle {
  id: number;
  category: number;
  vehicle_name: string;
  vehicle_number: string;
  image: string;
  seating_capacity: string;
  fuel_type: string;
  transmission: string;
  status: string;
}

const MOCK_VEHICLES = [
  {
    id: 101, category: 1, vehicle_name: 'Toyota Fortuner', vehicle_number: 'TN 43 XY 9876',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    seating_capacity: '7', fuel_type: 'Diesel', transmission: 'Automatic', status: 'Available',
  },
  {
    id: 104, category: 1, vehicle_name: 'Toyota Innova Crysta', vehicle_number: 'TN 01 EV 9999',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=600&q=80',
    seating_capacity: '7', fuel_type: 'Diesel', transmission: 'Manual', status: 'Available',
  },
  {
    id: 105, category: 1, vehicle_name: 'Toyota Camry', vehicle_number: 'TN 09 AZ 1001',
    image: 'https://images.unsplash.com/photo-1512151608677-495bc997d4fc?auto=format&fit=crop&w=600&q=80',
    seating_capacity: '5', fuel_type: 'Petrol', transmission: 'Automatic', status: 'Available',
  },
  {
    id: 102, category: 2, vehicle_name: 'Honda Civic 2023', vehicle_number: 'TN 38 CB 1234',
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80',
    seating_capacity: '5', fuel_type: 'Petrol', transmission: 'Automatic', status: 'Available',
  },
  {
    id: 106, category: 2, vehicle_name: 'Honda City', vehicle_number: 'TN 11 RR 5555',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
    seating_capacity: '5', fuel_type: 'Petrol', transmission: 'Automatic', status: 'Available',
  },
  {
    id: 107, category: 3, vehicle_name: 'Nissan Magnite', vehicle_number: 'TN 22 MX 7000',
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=600&q=80',
    seating_capacity: '5', fuel_type: 'Petrol', transmission: 'Manual', status: 'Available',
  },
  {
    id: 103, category: 4, vehicle_name: 'BMW X5', vehicle_number: 'TN 11 AB 5566',
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=600&q=80',
    seating_capacity: '5', fuel_type: 'Petrol', transmission: 'Automatic', status: 'Available',
  },
  {
    id: 108, category: 4, vehicle_name: 'BMW 3 Series', vehicle_number: 'TN 88 FD 1500',
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=600&q=80',
    seating_capacity: '5', fuel_type: 'Diesel', transmission: 'Automatic', status: 'Available',
  },
  {
    id: 109, category: 5, vehicle_name: 'Suzuki Swift', vehicle_number: 'TN 33 CH 8888',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80',
    seating_capacity: '5', fuel_type: 'Petrol', transmission: 'Manual', status: 'Available',
  }
];

const VehiclesScreen = ({ route, navigation }: any) => {
  const { categoryId } = route.params;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, [categoryId]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const url = categoryId 
        ? `https://primary-sculpture-empathy.ngrok-free.dev/carapp/vehicles/?category=${categoryId}`
        : `https://primary-sculpture-empathy.ngrok-free.dev/carapp/vehicles/`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const responseJson = await response.json();
      
      let fetchedVehicles = [];
      if (responseJson.status && Array.isArray(responseJson.data)) {
        fetchedVehicles = responseJson.data;
      } else if (Array.isArray(responseJson)) {
        fetchedVehicles = responseJson;
      } else if (responseJson.vehicles && Array.isArray(responseJson.vehicles)) {
        fetchedVehicles = responseJson.vehicles;
      } else if (responseJson.data && Array.isArray(responseJson.data.vehicles)) {
        fetchedVehicles = responseJson.data.vehicles;
      } else {
        throw new Error('Unrecognized data format');
      }
      
      if (categoryId) {
        fetchedVehicles = fetchedVehicles.filter((v: any) => v.category === categoryId);
      }
      
      setVehicles(fetchedVehicles);
    } catch (error) {
      console.error('Failed to set vehicles:', error);
      // Fallback to local mock data
      const filtered = MOCK_VEHICLES.filter(v => v.category === categoryId);
      setVehicles(filtered.length > 0 ? filtered : MOCK_VEHICLES);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((v: any) => 
    v.vehicle_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.transmission.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderVehicle = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('VehicleDetails', { vehicleId: item.id })}
    >
      <Image 
        source={{ uri: getImageUrl(item.image) }} 
        style={styles.image} 
      />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.vehicle_name}</Text>
        <Text style={styles.subtitle}>{item.vehicle_number} • {item.seating_capacity} Seats</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badge}>{item.fuel_type}</Text>
          <Text style={styles.badge}>{item.transmission}</Text>
        </View>
        <Text style={[styles.status, { color: item.status === 'Available' ? 'green' : 'red' }]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search vehicles..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredVehicles}
        keyExtractor={(item: any) => item.id?.toString() || Math.random().toString()}
        renderItem={renderVehicle}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchVehicles}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', margin: 16, marginBottom: 0, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 2 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, color: '#1E293B', fontSize: 16 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
    flexDirection: 'row',
  },
  image: { width: 130, height: '100%' },
  imagePlaceholder: {
    width: 130,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: { color: '#64748B', fontSize: 12, fontWeight: '500' },
  cardContent: { padding: 16, flex: 1 },
  title: { fontSize: 18, fontWeight: '800', color: '#1E293B', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginVertical: 6 },
  badgeContainer: { flexDirection: 'row', gap: 6, marginVertical: 6, flexWrap: 'wrap' },
  badge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, fontSize: 11, color: '#475569', fontWeight: '600' },
  status: { fontSize: 13, fontWeight: '700', marginTop: 8 },
});

export default VehiclesScreen;
