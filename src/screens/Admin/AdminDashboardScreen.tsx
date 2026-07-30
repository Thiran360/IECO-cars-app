import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Dimensions, StatusBar, Modal, TextInput, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

const { width, height } = Dimensions.get('window');

// Mock Data for Admin Dashboard
const MOCK_STATS = [
  { id: 1, label: 'Total Bookings', value: '1,248', icon: 'calendar-outline', color: '#4F46E5' },
  { id: 2, label: 'Revenue', value: '$84,590', icon: 'cash-outline', color: '#10B981' },
  { id: 3, label: 'Active Cars', value: '42', icon: 'car-sport-outline', color: '#F59E0B' },
];

const MOCK_BOOKINGS = [
  { id: 'BK-1001', user: 'Alex Johnson', car: 'Honda Civic 2023', date: '2026-07-29', status: 'Upcoming', amount: '$45' },
  { id: 'BK-1002', user: 'Maria Garcia', car: 'Toyota Fortuner', date: '2026-07-28', status: 'Ongoing', amount: '$85' },
  { id: 'BK-1003', user: 'James Smith', car: 'Hyundai i20', date: '2026-07-27', status: 'Completed', amount: '$35' },
  { id: 'BK-1004', user: 'Sarah Connor', car: 'Tesla Model 3', date: '2026-07-26', status: 'Completed', amount: '$120' },
  { id: 'BK-1005', user: 'John Doe', car: 'Honda Civic 2023', date: '2026-07-29', status: 'Upcoming', amount: '$45' },
];

const AdminDashboardScreen = ({ onLogout }: any) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [categories, setCategories] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>(MOCK_BOOKINGS);
  
  React.useEffect(() => {
    fetchCategories();
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('https://primary-sculpture-empathy.ngrok-free.dev/carapp/bookings/');
      const data = await res.json();
      if (data && data.data) {
        setBookings(data.data.reverse());
      }
    } catch (e) {
      console.log('Failed to fetch bookings', e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('https://primary-sculpture-empathy.ngrok-free.dev/carapp/categories/');
      const data = await res.json();
      if (data && data.data) {
        setCategories(data.data);
      } else if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (e) {
      console.log('Failed to fetch categories', e);
    }
  };
  
  // Category Form State
  const [isCatModalVisible, setIsCatModalVisible] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catPrice, setCatPrice] = useState('');
  const [catImage, setCatImage] = useState<any>(null);
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Vehicle Form State
  const [isVehModalVisible, setIsVehModalVisible] = useState(false);
  const [vehName, setVehName] = useState('');
  const [vehNumber, setVehNumber] = useState('');
  const [vehCatId, setVehCatId] = useState('');
  const [vehSeats, setVehSeats] = useState('');
  const [vehFuel, setVehFuel] = useState('');
  const [vehTrans, setVehTrans] = useState('');
  const [vehImage, setVehImage] = useState<any>(null);
  const [isSubmittingVeh, setIsSubmittingVeh] = useState(false);

  // Driver Form State
  const [isDriverModalVisible, setIsDriverModalVisible] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [driverImage, setDriverImage] = useState<any>(null);
  const [isSubmittingDriver, setIsSubmittingDriver] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('isAdmin');
    if (onLogout) onLogout();
  };

  const pickImage = async (setter: any) => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.assets && result.assets.length > 0) {
      setter(result.assets[0]);
    }
  };

  const submitCategory = async () => {
    if (!catName || !catImage) {
      Alert.alert('Error', 'Name and Image are required.');
      return;
    }
    setIsSubmittingCat(true);
    try {
      const formData = new FormData();
      formData.append('name', catName);
      formData.append('description', catDesc);
      formData.append('perkm_price', catPrice || '0');
      formData.append('image', {
        uri: catImage.uri,
        type: catImage.type || 'image/jpeg',
        name: catImage.fileName || 'category.jpg',
      });

      const res = await fetch('https://primary-sculpture-empathy.ngrok-free.dev/carapp/create-category/', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!res.ok) throw new Error('Upload failed');
      
      Alert.alert('Success', 'Category uploaded successfully!');
      setIsCatModalVisible(false);
      setCatName(''); setCatDesc(''); setCatPrice(''); setCatImage(null);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const submitVehicle = async () => {
    if (!vehName || !vehCatId || !vehImage) {
      Alert.alert('Error', 'Name, Category ID, and Image are required.');
      return;
    }
    setIsSubmittingVeh(true);
    try {
      const formData = new FormData();
      formData.append('category', vehCatId);
      formData.append('vehicle_name', vehName);
      formData.append('vehicle_number', vehNumber);
      formData.append('seating_capacity', vehSeats);
      formData.append('fuel_type', vehFuel);
      formData.append('transmission', vehTrans);
      formData.append('status', 'Available');
      formData.append('image', {
        uri: vehImage.uri,
        type: vehImage.type || 'image/jpeg',
        name: vehImage.fileName || 'vehicle.jpg',
      });

      const res = await fetch('https://primary-sculpture-empathy.ngrok-free.dev/carapp/create-vehicle/', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!res.ok) throw new Error('Upload failed');
      
      Alert.alert('Success', 'Vehicle pushed successfully!');
      setIsVehModalVisible(false);
      setVehName(''); setVehNumber(''); setVehCatId(''); setVehSeats(''); setVehFuel(''); setVehTrans(''); setVehImage(null);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSubmittingVeh(false);
    }
  };

  const submitDriver = async () => {
    if (!driverName || !driverPhone || !driverLicense) {
      Alert.alert('Error', 'Name, Phone, and License are required.');
      return;
    }
    setIsSubmittingDriver(true);
    try {
      const formData = new FormData();
      formData.append('name', driverName);
      formData.append('phone', driverPhone);
      formData.append('license', driverLicense);
      if (driverImage) {
        formData.append('image', {
          uri: driverImage.uri,
          type: driverImage.type || 'image/jpeg',
          name: driverImage.fileName || 'driver.jpg',
        });
      }

      const res = await fetch('https://primary-sculpture-empathy.ngrok-free.dev/carapp/create-driver/', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!res.ok) throw new Error('Upload failed');
      
      Alert.alert('Success', 'Driver added successfully!');
      setIsDriverModalVisible(false);
      setDriverName('');
      setDriverPhone('');
      setDriverLicense('');
      setDriverImage(null);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSubmittingDriver(false);
    }
  };

  const renderStatCard = ({ item }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: item.color + '15' }]}>
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </View>
  );

  const renderBookingItem = ({ item }: any) => {
    let statusColor = '#64748B';
    let statusBg = '#F1F5F9';
    const status = item.status || 'Upcoming';
    
    if (status === 'Completed' || status === 'Confirmed') {
      statusColor = '#10B981';
      statusBg = '#D1FAE5';
    } else if (status === 'Ongoing') {
      statusColor = '#2563EB';
      statusBg = '#DBEAFE';
    } else {
      statusColor = '#F59E0B';
      statusBg = '#FEF3C7';
    }

    const userName = item.user_name || item.user || 'Unknown User';
    const carName = item.vehicle_name || item.vehicle_number || item.vehicle || item.car || 'Unknown Vehicle';
    const dateStr = item.pickup_date || item.date || 'N/A';
    const amountStr = item.total_amount ? `₹${item.total_amount}` : (item.amount || 'N/A');

    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingId}>BK-{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
          </View>
        </View>
        
        <View style={styles.bookingDetails}>
          <View style={styles.bookingInfo}>
            <Text style={styles.infoTitle}>User ID</Text>
            <Text style={styles.infoValue}>{userName}</Text>
          </View>
          <View style={styles.bookingInfo}>
            <Text style={styles.infoTitle}>Vehicle ID</Text>
            <Text style={styles.infoValue}>{carName}</Text>
          </View>
        </View>
        
        <View style={styles.bookingFooter}>
          <View style={styles.dateRow}>
            <Icon name="calendar-outline" size={14} color="#64748B" />
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
          <Text style={styles.amountText}>{amountStr}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FF" />
      
      {/* Admin Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View>
            <Text style={styles.headerSubtitle}>Good Morning,</Text>
            <Text style={styles.headerTitle}>Admin Panel</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => setIsVehModalVisible(true)}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#EEF2FF' }]}>
            <Icon name="car" size={24} color="#4F46E5" />
          </View>
          <Text style={styles.quickActionText}>Add Car</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => setIsCatModalVisible(true)}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#ECFDF5' }]}>
            <Icon name="albums" size={24} color="#10B981" />
          </View>
          <Text style={styles.quickActionText}>Add Category</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#FFFBEB' }]}>
            <Icon name="document-text" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.quickActionText}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => setIsDriverModalVisible(true)}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#FEF2F2' }]}>
            <Icon name="person-add" size={24} color="#EF4444" />
          </View>
          <Text style={styles.quickActionText}>Add Driver</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitleOverview}>Overview</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={MOCK_STATS}
          renderItem={renderStatCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['Overview', 'Bookings', 'Vehicles', 'Users'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.bookingsList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Add Category Modal */}
      <Modal visible={isCatModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsCatModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Category</Text>
              <TouchableOpacity onPress={() => setIsCatModalVisible(false)}>
                <Icon name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput style={styles.input} placeholder="Category Name" value={catName} onChangeText={setCatName} />
              <TextInput style={styles.input} placeholder="Description" value={catDesc} onChangeText={setCatDesc} />
              <TextInput style={styles.input} placeholder="Price per km" value={catPrice} onChangeText={setCatPrice} keyboardType="numeric" />
              
              <TouchableOpacity style={styles.imagePickerBtn} onPress={() => pickImage(setCatImage)}>
                {catImage ? <Image source={{ uri: catImage.uri }} style={styles.pickedImage} /> : <Text style={styles.imagePickerText}>Select Category Image</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitBtn} onPress={submitCategory} disabled={isSubmittingCat}>
                {isSubmittingCat ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Upload Category</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal visible={isVehModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsVehModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Push Vehicle</Text>
              <TouchableOpacity onPress={() => setIsVehModalVisible(false)}>
                <Icon name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput style={styles.input} placeholder="Vehicle Name" value={vehName} onChangeText={setVehName} />
              
              <Text style={styles.label}>Select Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map((cat: any) => (
                  <TouchableOpacity 
                    key={cat.id} 
                    style={[styles.categoryChip, vehCatId === cat.id.toString() && styles.categoryChipSelected]}
                    onPress={() => setVehCatId(cat.id.toString())}
                  >
                    <Text style={[styles.categoryChipText, vehCatId === cat.id.toString() && styles.categoryChipTextSelected]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TextInput style={styles.input} placeholder="Vehicle Number" value={vehNumber} onChangeText={setVehNumber} />
              <TextInput style={styles.input} placeholder="Seats (e.g. 5)" value={vehSeats} onChangeText={setVehSeats} keyboardType="numeric" />
              <TextInput style={styles.input} placeholder="Fuel Type (Petrol/Diesel)" value={vehFuel} onChangeText={setVehFuel} />
              <TextInput style={styles.input} placeholder="Transmission (Auto/Manual)" value={vehTrans} onChangeText={setVehTrans} />
              
              <TouchableOpacity style={styles.imagePickerBtn} onPress={() => pickImage(setVehImage)}>
                {vehImage ? <Image source={{ uri: vehImage.uri }} style={styles.pickedImage} /> : <Text style={styles.imagePickerText}>Select Vehicle Image</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitBtn} onPress={submitVehicle} disabled={isSubmittingVeh}>
                {isSubmittingVeh ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Push Vehicle</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Driver Modal */}
      <Modal visible={isDriverModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Driver</Text>
              <TouchableOpacity onPress={() => setIsDriverModalVisible(false)}>
                <Icon name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              
              <TouchableOpacity style={styles.imagePickerBtn} onPress={() => pickImage(setDriverImage)}>
                {driverImage ? (
                  <Image source={{ uri: driverImage.uri }} style={styles.pickedImage} />
                ) : (
                  <Text style={styles.imagePickerText}>Select Driver Photo</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.label}>Driver Name</Text>
              <TextInput style={styles.input} placeholder="Enter driver name" value={driverName} onChangeText={setDriverName} />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} placeholder="Enter phone number" keyboardType="phone-pad" value={driverPhone} onChangeText={setDriverPhone} />
              
              <Text style={styles.label}>License Number</Text>
              <TextInput style={styles.input} placeholder="Enter license number" value={driverLicense} onChangeText={setDriverLicense} />
              
              <TouchableOpacity style={styles.submitBtn} onPress={submitDriver} disabled={isSubmittingDriver}>
                {isSubmittingDriver ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Submit Driver</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FF' },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginRight: 12, shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 5 },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  headerSubtitle: { color: '#64748B', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  headerTitle: { color: '#0F172A', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  logoutButton: { width: 44, height: 44, backgroundColor: '#FFFFFF', borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 3 },
  
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  quickActionBtn: { alignItems: 'center' },
  quickActionIcon: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
  quickActionText: { fontSize: 12, fontWeight: '600', color: '#475569' },

  statsContainer: { marginBottom: 12 },
  sectionTitleOverview: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5, paddingHorizontal: 20, marginBottom: 8 },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 24,
    marginRight: 16,
    width: width * 0.4,
    shadowColor: '#94A3B8',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },
  statIconContainer: { width: 40, height: 40, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { color: '#0F172A', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 },
  tabButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 100, marginRight: 8, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  tabButtonActive: { backgroundColor: '#4F46E5', shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4 },
  tabText: { color: '#64748B', fontSize: 14, fontWeight: '700' },
  tabTextActive: { color: '#FFFFFF' },
  
  contentContainer: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: -4 }, shadowRadius: 12, elevation: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  seeAllText: { fontSize: 14, fontWeight: '700', color: '#4F46E5' },
  
  bookingsList: { paddingHorizontal: 24, paddingBottom: 40 },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#94A3B8',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  bookingId: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  statusText: { fontSize: 12, fontWeight: '700' },
  
  bookingDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16 },
  bookingInfo: { flex: 1 },
  infoTitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 13, color: '#64748B', marginLeft: 6, fontWeight: '600' },
  amountText: { fontSize: 18, fontWeight: '800', color: '#4F46E5' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: height * 0.85 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  label: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 8, marginLeft: 4 },
  categoryScroll: { flexDirection: 'row', marginBottom: 16 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, backgroundColor: '#F1F5F9', marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
  categoryChipSelected: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  categoryChipText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  categoryChipTextSelected: { color: '#4F46E5', fontWeight: '800' },
  input: { backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, marginBottom: 16, fontSize: 16, color: '#0F172A', fontWeight: '500', borderWidth: 1, borderColor: '#E2E8F0' },
  imagePickerBtn: { height: 120, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 24, overflow: 'hidden' },
  imagePickerText: { color: '#64748B', fontWeight: '600' },
  pickedImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  submitBtn: { backgroundColor: '#4F46E5', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 5, marginBottom: 20 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default AdminDashboardScreen;
