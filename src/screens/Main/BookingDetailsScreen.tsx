import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { getBookingDetails, cancelBooking, confirmBooking, completeBooking } from '../../services/api';

const BookingDetailsScreen = ({ route, navigation }: any) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await getBookingDetails(bookingId);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'cancel' | 'confirm' | 'complete') => {
    try {
      setLoading(true);
      if (action === 'cancel') await cancelBooking(bookingId);
      if (action === 'confirm') await confirmBooking(bookingId);
      if (action === 'complete') await completeBooking(bookingId);
      Alert.alert('Success', `Booking ${action}ed successfully.`);
      fetchBookingDetails(); // Refresh
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  if (loading && !booking) {
    return <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />;
  }

  if (!booking) {
    return <Text style={styles.errorText}>Booking not found.</Text>;
  }

  const status = booking.status?.toLowerCase() || 'pending';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Booking #{booking.id}</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{booking.status || 'Pending'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pickup:</Text>
          <Text style={styles.value}>{booking.pickup_location} ({booking.pickup_date} {booking.pickup_time})</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Drop:</Text>
          <Text style={styles.value}>{booking.drop_location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Amount:</Text>
          <Text style={[styles.value, styles.amount]}>₹{booking.total_amount}</Text>
        </View>

        <View style={styles.actionContainer}>
          {status === 'pending' && (
            <>
              <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => handleAction('cancel')}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.confirmBtn]} onPress={() => handleAction('confirm')}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </>
          )}
          {status === 'confirmed' && (
            <TouchableOpacity style={[styles.button, styles.completeBtn]} onPress={() => handleAction('complete')}>
              <Text style={styles.buttonText}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>

        {(status === 'confirmed' || status === 'pending') && (
          <TouchableOpacity 
            style={styles.trackButton} 
            onPress={() => navigation.navigate('Tracking', { bookingId })}
          >
            <Text style={styles.trackButtonText}>Track Vehicle</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#EF4444' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
  },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', color: '#1E293B', letterSpacing: -0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  label: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  value: { fontSize: 15, fontWeight: '700', color: '#1E293B', textAlign: 'right', flex: 1, marginLeft: 16 },
  amount: { fontSize: 18, color: '#4F46E5' },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 32, gap: 12 },
  buttonContainer: { marginTop: 32, gap: 12 },
  button: { padding: 18, borderRadius: 100, alignItems: 'center', flex: 1 },
  cancelBtn: { backgroundColor: '#EF4444', shadowColor: '#EF4444', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 4 },
  confirmBtn: { backgroundColor: '#10B981', shadowColor: '#10B981', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 4 },
  completeBtn: { backgroundColor: '#4F46E5', shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 4 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
  trackButton: {
    backgroundColor: '#0F172A',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 6,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  }
});

export default BookingDetailsScreen;
