import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getUserBookings } from '../../services/api';

const UserBookingsScreen = ({ navigation }: any) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // In a real app, userId should come from context/auth
      const userId = '1'; 
      const response = await getUserBookings(userId);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBooking = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Booking #{item.id}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status || 'Pending'}</Text>
      </View>
      <Text style={styles.info}>Date: {item.pickup_date}</Text>
      <Text style={styles.info}>Amount: ₹{item.total_amount}</Text>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return 'green';
      case 'cancelled': return 'red';
      case 'completed': return 'blue';
      default: return 'orange';
    }
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {bookings.length === 0 ? (
        <Text style={styles.emptyText}>No bookings found.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item: any) => item.id?.toString() || Math.random().toString()}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#1E293B', letterSpacing: -0.5 },
  status: { fontSize: 14, fontWeight: '700' },
  info: { fontSize: 14, color: '#64748B', marginVertical: 4 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#666', fontSize: 16 },
});

export default UserBookingsScreen;
