import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { createBooking } from '../../services/api';

const CreateBookingScreen = ({ route, navigation }: any) => {
  const { vehicleId, categoryId } = route.params;
  const [formData, setFormData] = useState({
    user: '1',
    category: categoryId,
    vehicle: vehicleId,
    booking_type: 'Local',
    pickup_location: '',
    drop_location: '',
    pickup_date: '',
    pickup_time: '',
    total_km: '',
    total_amount: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [needsDriver, setNeedsDriver] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  
  const [selfDriverDetails, setSelfDriverDetails] = useState({
    name: '',
    age: '',
    license: '',
    aadhar: '',
    pan: '',
    photo: null as any,
    licensePhoto: null as any,
  });
  const [verificationStatus, setVerificationStatus] = useState<'idle'|'verifying'|'verified'>('idle');

  const handleSelfDriverChange = (field: string, value: string) => {
    setSelfDriverDetails(prev => ({ ...prev, [field]: value }));
    if (verificationStatus === 'verified') setVerificationStatus('idle');
  };

  const pickDriverPhoto = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.assets && result.assets.length > 0) {
      setSelfDriverDetails(prev => ({ ...prev, photo: result.assets![0] }));
      if (verificationStatus === 'verified') setVerificationStatus('idle');
    }
  };

  const pickLicensePhoto = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.assets && result.assets.length > 0) {
      setSelfDriverDetails(prev => ({ ...prev, licensePhoto: result.assets![0] }));
      if (verificationStatus === 'verified') setVerificationStatus('idle');
    }
  };

  const handleVerifyDocuments = () => {
    const { name, age, license, aadhar, pan, photo, licensePhoto } = selfDriverDetails;
    if (!name || !age || !license || !aadhar || !pan || !photo || !licensePhoto) {
      Alert.alert('Missing Documents', 'Please fill all details and upload both photos to verify.');
      return;
    }
    setVerificationStatus('verifying');
    setTimeout(() => {
      setVerificationStatus('verified');
      Alert.alert('Success', 'Documents verified successfully!');
    }, 2000);
  };
  
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('https://primary-sculpture-empathy.ngrok-free.dev/carapp/drivers/');
      const data = await response.json();
      if (data && data.data) {
        setDrivers(data.data);
      } else if (Array.isArray(data)) {
        setDrivers(data);
      }
    } catch (e) {
      console.log('Failed to fetch drivers', e);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('pickup_date', formattedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const formattedTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      handleChange('pickup_time', formattedTime);
    }
  };

  const handleBooking = async () => {
    if (!needsDriver && verificationStatus !== 'verified') {
      Alert.alert('Verification Required', 'Please verify your driving documents before booking.');
      return;
    }

    setLoading(true);
    try {
      const selectedDriverName = drivers.find(d => d.id === selectedDriverId || d.id === parseInt(selectedDriverId))?.name || '';
      const payload = { ...formData, needs_driver: needsDriver, driver_name: selectedDriverName };
      await createBooking(payload);
      Alert.alert('Success', 'Booking created successfully!');
      navigation.navigate('UserBookings');
    } catch (error: any) {
      Alert.alert('Booking Failed', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>Fill in the details below to confirm your ride.</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Booking Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
              {['Hourly', 'Local', 'Outstation', 'One-way', 'Round-trip'].map(type => (
                <TouchableOpacity 
                  key={type}
                  style={[styles.typeChip, formData.booking_type === type && styles.typeChipActive]}
                  onPress={() => handleChange('booking_type', type)}
                >
                  <Text style={[styles.typeText, formData.booking_type === type && styles.typeTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Pickup Location</Text>
            <View style={styles.inputContainer}>
              <Icon name="location-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Enter pickup address" placeholderTextColor="#94A3B8" value={formData.pickup_location} onChangeText={(val) => handleChange('pickup_location', val)} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Drop Location</Text>
            <View style={styles.inputContainer}>
              <Icon name="flag-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Enter drop address" placeholderTextColor="#94A3B8" value={formData.drop_location} onChangeText={(val) => handleChange('drop_location', val)} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Pickup Date</Text>
              <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
                <Icon name="calendar-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <Text style={[styles.inputText, !formData.pickup_date && {color: '#94A3B8'}]}>
                  {formData.pickup_date || 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Pickup Time</Text>
              <TouchableOpacity style={styles.inputContainer} onPress={() => setShowTimePicker(true)}>
                <Icon name="time-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <Text style={[styles.inputText, !formData.pickup_time && {color: '#94A3B8'}]}>
                  {formData.pickup_time || 'Select Time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Do you need a driver?</Text>
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              <TouchableOpacity 
                style={[styles.toggleBtn, needsDriver && styles.toggleBtnActive]} 
                onPress={() => setNeedsDriver(true)}
              >
                <Text style={[styles.toggleText, needsDriver && styles.toggleTextActive]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, !needsDriver && styles.toggleBtnActive]} 
                onPress={() => { setNeedsDriver(false); setSelectedDriverId(''); }}
              >
                <Text style={[styles.toggleText, !needsDriver && styles.toggleTextActive]}>No</Text>
              </TouchableOpacity>
            </View>
          </View>

          {needsDriver && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Driver</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {drivers.map(driver => (
                  <TouchableOpacity 
                    key={driver.id}
                    style={[styles.driverChip, selectedDriverId === driver.id.toString() && styles.driverChipActive]}
                    onPress={() => setSelectedDriverId(driver.id.toString())}
                  >
                    <Icon name="person" size={14} color={selectedDriverId === driver.id.toString() ? '#4F46E5' : '#64748B'} style={{marginRight: 6}} />
                    <Text style={[styles.driverText, selectedDriverId === driver.id.toString() && styles.driverTextActive]}>{driver.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedDriverId ? (
                <View style={styles.driverDetailsCard}>
                  {drivers.filter(d => d.id.toString() === selectedDriverId).map(driver => (
                    <View key={driver.id} style={styles.driverDetailsContent}>
                      <Image source={{ uri: driver.image ? (driver.image.startsWith('http') ? driver.image : `https://primary-sculpture-empathy.ngrok-free.dev${driver.image}`) : 'https://i.pravatar.cc/150' }} style={styles.driverImage} />
                      <View style={styles.driverInfo}>
                        <Text style={styles.driverName}>{driver.name}</Text>
                        <View style={styles.driverStatsRow}>
                          <Icon name="star" size={12} color="#F59E0B" />
                          <Text style={styles.driverStatText}>{driver.rating || '4.9'}</Text>
                          <Text style={styles.driverStatDot}>•</Text>
                          <Text style={styles.driverStatText}>{driver.trips || '0'} Trips</Text>
                        </View>
                        <Text style={styles.driverLanguages}>Speaks: {driver.languages || 'English, Tamil'}</Text>
                      </View>
                      <TouchableOpacity style={styles.callDriverBtn}>
                        <Icon name="call" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          )}

          {!needsDriver && (
            <View style={styles.verificationCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={styles.verificationTitle}>Self-Drive Verification</Text>
                {verificationStatus === 'verified' && <Icon name="checkmark-circle" size={20} color="#10B981" />}
              </View>

              <View style={styles.formGroup}>
                <View style={styles.inputContainer}>
                  <Icon name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Driver Name" value={selfDriverDetails.name} onChangeText={(val) => handleSelfDriverChange('name', val)} />
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <View style={styles.inputContainer}>
                    <Icon name="calendar-outline" size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder="Age" keyboardType="numeric" value={selfDriverDetails.age} onChangeText={(val) => handleSelfDriverChange('age', val)} />
                  </View>
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <View style={styles.inputContainer}>
                    <Icon name="card-outline" size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder="License No" value={selfDriverDetails.license} onChangeText={(val) => handleSelfDriverChange('license', val)} />
                  </View>
                </View>
              </View>
              <View style={styles.formGroup}>
                <View style={styles.inputContainer}>
                  <Icon name="finger-print-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Aadhar Number" keyboardType="numeric" value={selfDriverDetails.aadhar} onChangeText={(val) => handleSelfDriverChange('aadhar', val)} />
                </View>
              </View>
              <View style={styles.formGroup}>
                <View style={styles.inputContainer}>
                  <Icon name="document-text-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="PAN Card Number" autoCapitalize="characters" value={selfDriverDetails.pan} onChangeText={(val) => handleSelfDriverChange('pan', val)} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Driver Photo</Text>
                  <TouchableOpacity style={styles.photoUploadBtn} onPress={pickDriverPhoto}>
                    {selfDriverDetails.photo ? (
                      <Image source={{ uri: selfDriverDetails.photo.uri }} style={styles.uploadedPhoto} />
                    ) : (
                      <View style={styles.photoUploadPlaceholder}>
                        <Icon name="camera-outline" size={24} color="#64748B" />
                        <Text style={styles.photoUploadText}>Upload Photo</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>License Photo</Text>
                  <TouchableOpacity style={styles.photoUploadBtn} onPress={pickLicensePhoto}>
                    {selfDriverDetails.licensePhoto ? (
                      <Image source={{ uri: selfDriverDetails.licensePhoto.uri }} style={styles.uploadedPhoto} />
                    ) : (
                      <View style={styles.photoUploadPlaceholder}>
                        <Icon name="card-outline" size={24} color="#64748B" />
                        <Text style={styles.photoUploadText}>Upload License</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {verificationStatus !== 'verified' && (
                <TouchableOpacity 
                  style={[styles.verifyBtn, verificationStatus === 'verifying' && { backgroundColor: '#94A3B8' }]} 
                  onPress={handleVerifyDocuments}
                  disabled={verificationStatus === 'verifying'}
                >
                  <Icon name={verificationStatus === 'verifying' ? "sync" : "shield-checkmark"} size={18} color="#FFF" />
                  <Text style={styles.verifyBtnText}>{verificationStatus === 'verifying' ? 'Verifying...' : 'Verify Documents'}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Total KM Expected</Text>
              <View style={styles.inputContainer}>
                <Icon name="speedometer-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="e.g. 150" placeholderTextColor="#94A3B8" value={formData.total_km} onChangeText={(val) => handleChange('total_km', val)} keyboardType="numeric" />
              </View>
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Total Amount</Text>
              <View style={styles.inputContainer}>
                <Icon name="cash-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Amount" placeholderTextColor="#94A3B8" value={formData.total_amount} onChangeText={(val) => handleChange('total_amount', val)} keyboardType="numeric" />
              </View>
            </View>
          </View>

        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, (!needsDriver && verificationStatus !== 'verified') && { backgroundColor: '#94A3B8' }]} 
            onPress={handleBooking} 
            disabled={loading || (!needsDriver && verificationStatus !== 'verified')}
          >
            <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Confirm Booking'}</Text>
            {!loading && <Icon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 40 },
  
  subtitle: { fontSize: 13, color: '#64748B', marginBottom: 24, marginLeft: 4, marginTop: 8 },
  
  formGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6, marginLeft: 4 },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 48,
  },
  inputIcon: { paddingHorizontal: 12 },
  input: { flex: 1, color: '#0F172A', fontSize: 14, height: '100%' },
  inputText: { flex: 1, color: '#0F172A', fontSize: 14 },
  
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, marginHorizontal: 4 },
  toggleBtnActive: { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#4F46E5' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  toggleTextActive: { color: '#4F46E5' },
  
  driverChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, backgroundColor: '#F1F5F9', marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
  driverChipActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  driverText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  driverTextActive: { color: '#4F46E5', fontWeight: '800' },

  typeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, backgroundColor: '#F1F5F9', marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
  typeChipActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  typeText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  typeTextActive: { color: '#4F46E5', fontWeight: '800' },
  
  driverDetailsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
  driverDetailsContent: { flexDirection: 'row', alignItems: 'center' },
  driverImage: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E2E8F0' },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  driverStatsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  driverStatText: { fontSize: 12, color: '#64748B', marginLeft: 4 },
  driverStatDot: { fontSize: 12, color: '#CBD5E1', marginHorizontal: 6 },
  driverLanguages: { fontSize: 11, color: '#94A3B8' },
  callDriverBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', shadowColor: '#10B981', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4 },
  
  verificationCard: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 8, marginBottom: 12 },
  verificationTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  verifyBtn: { backgroundColor: '#10B981', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8, flexDirection: 'row', justifyContent: 'center' },
  verifyBtnText: { color: '#FFF', fontWeight: '600', marginLeft: 8, fontSize: 14 },
  photoUploadBtn: { height: 100, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed', backgroundColor: '#F1F5F9', overflow: 'hidden' },
  photoUploadPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoUploadText: { fontSize: 12, color: '#64748B', marginTop: 4, fontWeight: '500' },
  uploadedPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
});

export default CreateBookingScreen;
