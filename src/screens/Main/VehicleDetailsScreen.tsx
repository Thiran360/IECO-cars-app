import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native';
import { getVehicleDetails } from '../../services/api';

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

const VehicleDetailsScreen = ({ route, navigation }: any) => {
  const { vehicleId } = route.params;
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicleDetails();
  }, [vehicleId]);

  const getMockVehicle = (id: number) => {
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
    return MOCK_VEHICLES.find(v => v.id === id) || {
      id, category: 1, vehicle_name: 'Premium Car ' + id, vehicle_number: 'TN XX 0000',
      image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800',
      seating_capacity: '5', fuel_type: 'Hybrid', transmission: 'Automatic', status: 'Available',
    };
  };

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://primary-sculpture-empathy.ngrok-free.dev/carapp/vehicles/${vehicleId}/`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (data && data.data) {
        setVehicle(data.data);
      } else {
        setVehicle(data);
      }
    } catch (error) {
      console.log('Failed to set vehicle details:', error);
      setVehicle(getMockVehicle(vehicleId));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />;
  }

  if (!vehicle) {
    return <Text style={styles.errorText}>Vehicle not found.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: getImageUrl(vehicle.image) }} 
        style={styles.image} 
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>{vehicle.vehicle_name}</Text>
        <Text style={styles.subtitle}>{vehicle.vehicle_number}</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Seats</Text>
            <Text style={styles.infoValue}>{vehicle.seating_capacity}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Fuel</Text>
            <Text style={styles.infoValue}>{vehicle.fuel_type}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Transmission</Text>
            <Text style={styles.infoValue}>{vehicle.transmission}</Text>
          </View>
        </View>
        
        <Text style={styles.statusLabel}>
          Status: <Text style={{ color: vehicle.status === 'Available' ? 'green' : 'red' }}>{vehicle.status}</Text>
        </Text>

        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresList}>
            {['AC', 'Bluetooth', 'Airbags', 'GPS', 'USB Port'].map((feature, idx) => (
              <View key={idx} style={styles.featureBadge}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.sectionTitle}>Estimated Price Preview</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Rate per day</Text>
            <Text style={styles.priceValue}>₹2000</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes & Fees</Text>
            <Text style={styles.priceValue}>₹350</Text>
          </View>
          <View style={[styles.priceRow, { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, marginTop: 5 }]}>
            <Text style={[styles.priceLabel, { fontWeight: 'bold' }]}>Total per day</Text>
            <Text style={[styles.priceValue, { fontWeight: 'bold', color: '#2563eb' }]}>₹2350</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, vehicle.status !== 'Available' && styles.buttonDisabled]} 
          disabled={vehicle.status !== 'Available'}
          onPress={() => navigation.navigate('CreateBooking', { vehicleId: vehicle.id, categoryId: vehicle.category })}
        >
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#EF4444' },
  image: { width: '100%', height: 300, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  imagePlaceholderText: { color: '#64748B', fontSize: 16, fontWeight: '500' },
  content: { padding: 24, marginTop: -20, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  title: { fontSize: 28, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 8, marginBottom: 24, fontWeight: '500' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  infoBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, flex: 1, marginHorizontal: 6, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.02, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 1 },
  infoLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginTop: 6 },
  statusLabel: { fontSize: 16, fontWeight: '700', marginBottom: 32, color: '#1E293B' },
  button: {
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: { backgroundColor: '#94A3B8', shadowOpacity: 0, elevation: 0 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
  featuresContainer: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 16, letterSpacing: -0.5 },
  featuresList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100 },
  featureText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  priceContainer: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, marginBottom: 32, borderWidth: 1, borderColor: '#E2E8F0' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  priceLabel: { color: '#64748B', fontSize: 15, fontWeight: '500' },
  priceValue: { color: '#1E293B', fontSize: 15, fontWeight: '600' },
});

export default VehicleDetailsScreen;
