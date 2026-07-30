import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, TextInput, Dimensions, StatusBar, Modal, ScrollView, PermissionsAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategories, getVehicles } from '../../services/api';
import Geolocation from '@react-native-community/geolocation';

const { width, height } = Dimensions.get('window');

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

interface Category {
  id: number;
  name: string;
  description: string;
  perkm_price: string;
  image: string;
}

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

// Removed BANNERS array

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

const FALLBACK_CATEGORIES = [
  {id: 1, name: 'Toyota', description: '', perkm_price: '', image: 'https://images.unsplash.com/photo-1629897048514-3dd74142277f?auto=format&fit=crop&w=200&q=80'},
  {id: 2, name: 'Honda', description: '', perkm_price: '', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80'},
  {id: 3, name: 'Nissan', description: '', perkm_price: '', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=200&q=80'},
  {id: 4, name: 'BMW', description: '', perkm_price: '', image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=200&q=80'},
  {id: 5, name: 'Suzuki', description: '', perkm_price: '', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=200&q=80'}
];

const CategoriesScreen = ({ navigation }: any) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerRef = useRef<FlatList>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Chennai, TN');

  const LOCATIONS = ['Chennai, TN', 'Coimbatore, TN', 'Madurai, TN', 'Bangalore, KA', 'Hyderabad, TS', 'Mumbai, MH'];

  useEffect(() => {
    fetchData();
  }, []);

  const bannerData = vehicles.length > 0 ? vehicles.slice(0, 3) : [];

  useEffect(() => {
    if (bannerData.length === 0) return;
    let interval = setInterval(() => {
      setActiveBanner((prev) => {
        const nextIndex = (prev + 1) % bannerData.length;
        bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [bannerData.length]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://primary-sculpture-empathy.ngrok-free.dev/carapp/categories/');
      if (!response.ok) throw new Error('Network response was not ok');
      const responseJson = await response.json();
      
      if (responseJson.status && Array.isArray(responseJson.data)) {
        setCategories(responseJson.data);
      } else {
        setCategories(responseJson); // Fallback if API changes format
      }
      
      setVehicles(MOCK_VEHICLES);
    } catch (error) {
      console.error('Failed to set data:', error);
      setCategories(FALLBACK_CATEGORIES);
      setVehicles(MOCK_VEHICLES);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveLocation = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Eco Cars needs access to your location so you can find cars nearby.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setIsLocationModalVisible(false);
        setSelectedLocation('Locating...');
        Geolocation.getCurrentPosition(
          (position) => {
            // Mock reverse geocoding since we don't have a Google Maps API Key
            const lat = position.coords.latitude.toFixed(2);
            const lon = position.coords.longitude.toFixed(2);
            // Simulating an async API call delay
            setTimeout(() => {
              setSelectedLocation(`GPS (${lat}, ${lon})`);
            }, 1000);
          },
          (error) => {
            console.error(error);
            setSelectedLocation('Location Error');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleCategoryPress = (category: any) => {
    navigation.navigate('Vehicles', { categoryId: category.id, categoryName: category.name });
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const isSelected = activeCategory === item.id;
    return (
      <TouchableOpacity
        style={styles.circleCategoryContainer}
        onPress={() => handleCategoryPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.circleImageContainer, isSelected && styles.circleImageContainerSelected]}>
          <Image source={{ uri: getImageUrl(item.image) }} style={styles.circleImage} resizeMode="cover" />
        </View>
        <Text style={[styles.circleCategoryText, isSelected && styles.circleCategoryTextSelected]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderBanner = ({ item }: { item: Vehicle }) => (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerInner}>
        <Image source={{ uri: getImageUrl(item.image) }} style={styles.bannerCarImage} resizeMode="cover" />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1 }]} />
        
        <View style={styles.bannerContent}>
          <Text style={[styles.bannerSuperTitle, { color: '#93C5FD' }]}>{item.fuel_type ? item.fuel_type.toUpperCase() : 'PREMIUM'}</Text>
          <Text style={[styles.bannerTitle, { color: '#FFFFFF' }]}>{item.vehicle_name || 'Best Deals on Top Cars'}</Text>
          <Text style={[styles.bannerSubtitle, { color: '#E2E8F0' }]}>{item.transmission || 'Automatic'} Transmission</Text>
          
          <TouchableOpacity style={styles.claimButton} onPress={() => navigation.navigate('VehicleDetails', { vehicleId: item.id })}>
            <Text style={styles.claimButtonText}>Explore Cars</Text>
            <Icon name="chevron-forward" size={14} color="#FFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      style={styles.vehicleCard}
      onPress={() => navigation.navigate('VehicleDetails', { vehicleId: item.id })}
      activeOpacity={0.9}
    >
      <View style={styles.vehicleImageContainer}>
        <Image 
          source={{ uri: getImageUrl(item.image) }} 
          style={styles.vehicleImage} 
          resizeMode="cover" 
        />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>₹2500<Text style={styles.priceTextSub}>/day</Text></Text>
        </View>
      </View>
      
      <View style={styles.vehicleInfo}>
        <View style={styles.vehicleHeaderRow}>
          <Text style={styles.vehicleTitle}>{item.vehicle_name}</Text>
          <View style={styles.ratingRow}>
            <Icon name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>

        <Text style={styles.vehicleSubtitle}>{item.category === 1 ? 'Sedan' : item.category === 2 ? 'SUV' : 'Hatchback'} • {item.fuel_type}</Text>

        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <Icon name="people-outline" size={16} color="#64748B" />
            <Text style={styles.featureText}>{item.seating_capacity} Seats</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="settings-outline" size={16} color="#64748B" />
            <Text style={styles.featureText}>{item.transmission}</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="speedometer-outline" size={16} color="#64748B" />
            <Text style={styles.featureText}>Unlimited</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      
      {/* Auto Slider */}
      {bannerData.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <FlatList
            ref={bannerRef}
            data={bannerData}
            renderItem={renderBanner}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setActiveBanner(index);
            }}
          />
          <View style={styles.paginationContainer}>
            {bannerData.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeBanner ? styles.activeDot : styles.inactiveDot]} />
            ))}
          </View>
        </View>
      )}

      {/* Horizontal Categories */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories.length > 0 ? categories : FALLBACK_CATEGORIES}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategory}
        contentContainerStyle={styles.categoryList}
      />
      
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>Available Cars</Text>
        <TouchableOpacity>
          <Icon name="options-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const activeCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = vehicle.vehicle_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrandId ? vehicle.category === selectedBrandId : true;
    return matchesSearch && matchesBrand;
  });

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Custom Modern Header */}
      <View style={styles.topHeader}>
        <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        
        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.notificationBtn}>
            <Icon name="notifications-outline" size={24} color="#0F172A" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=68' }} style={styles.profileImg} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Banner */}
      <View style={styles.locationBanner}>
        <View style={styles.locationLeftRow}>
          <View style={styles.locationIconWrapper}>
            <Icon name="location" size={20} color="#1D4ED8" />
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>Your Location</Text>
            <TouchableOpacity style={styles.locationRow} onPress={() => setIsLocationModalVisible(true)}>
              <Text style={styles.locationText}>{selectedLocation}</Text>
              <Icon name="chevron-down" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={styles.changeLocationBtn} onPress={() => setIsLocationModalVisible(true)}>
          <Icon name="locate" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.changeLocationText}>Change Location</Text>
        </TouchableOpacity>
      </View>

      {/* Modern Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Icon name="search-outline" size={22} color="#94A3B8" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search your favorite car..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setIsFilterModalVisible(true)}>
          <Icon name="options" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVehicle}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.mainList}
        refreshing={loading}
        onRefresh={fetchData}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.barItem} onPress={() => {}}>
          <Icon name="home" size={18} color="#4F46E5" />
          <Text style={[styles.barText, { color: '#4F46E5', fontWeight: '700' }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.barItem} onPress={() => navigation.navigate('Vehicles', { categoryId: null, categoryName: 'All Cars' })}>
          <Icon name="car-sport-outline" size={18} color="#94A3B8" />
          <Text style={styles.barText}>Vehicles</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.barItem} onPress={() => navigation.navigate('UserBookings')}>
          <Icon name="calendar-outline" size={18} color="#94A3B8" />
          <Text style={styles.barText}>Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.barItem} onPress={() => navigation.navigate('Profile')}>
          <Icon name="person-outline" size={18} color="#94A3B8" />
          <Text style={styles.barText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Location Selection Modal */}
      <Modal
        visible={isLocationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setIsLocationModalVisible(false)}>
                <Icon name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Live Location Option */}
              <TouchableOpacity
                style={[styles.brandOption, { backgroundColor: '#EFF6FF', marginBottom: 12, borderBottomWidth: 0, borderRadius: 12, paddingHorizontal: 12 }]}
                onPress={fetchLiveLocation}
              >
                <View style={styles.brandOptionLeft}>
                  <View style={[styles.locationIconWrapper, { backgroundColor: '#2563EB', width: 32, height: 32, marginRight: 12 }]}>
                    <Icon name="locate" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.brandOptionText, { color: '#1E3A8A', fontWeight: '700' }]}>
                    Use Current Location
                  </Text>
                </View>
              </TouchableOpacity>

              {LOCATIONS.map((loc, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.brandOption, selectedLocation === loc && styles.brandOptionSelected]}
                  onPress={() => {
                    setSelectedLocation(loc);
                    setIsLocationModalVisible(false);
                  }}
                >
                  <View style={styles.brandOptionLeft}>
                    <Icon name="location-outline" size={24} color="#475569" style={{ marginRight: 12 }} />
                    <Text style={[styles.brandOptionText, selectedLocation === loc && styles.brandOptionTextSelected]}>
                      {loc}
                    </Text>
                  </View>
                  {selectedLocation === loc && <Icon name="checkmark-circle" size={24} color="#2563EB" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Brand Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Brand</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <Icon name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.brandOption, selectedBrandId === null && styles.brandOptionSelected]}
                onPress={() => setSelectedBrandId(null)}
              >
                <Text style={[styles.brandOptionText, selectedBrandId === null && styles.brandOptionTextSelected]}>All Brands</Text>
                {selectedBrandId === null && <Icon name="checkmark-circle" size={24} color="#2563EB" />}
              </TouchableOpacity>
              
              {activeCategories.map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  style={[styles.brandOption, selectedBrandId === brand.id && styles.brandOptionSelected]}
                  onPress={() => setSelectedBrandId(brand.id)}
                >
                  <View style={styles.brandOptionLeft}>
                    <Image source={{ uri: getImageUrl(brand.image) }} style={styles.brandOptionImage} />
                    <Text style={[styles.brandOptionText, selectedBrandId === brand.id && styles.brandOptionTextSelected]}>
                      {brand.name}
                    </Text>
                  </View>
                  {selectedBrandId === brand.id && <Icon name="checkmark-circle" size={24} color="#2563EB" />}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.applyFilterBtn}
              onPress={() => setIsFilterModalVisible(false)}
            >
              <Text style={styles.applyFilterText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  
  // Header
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  logoImage: { width: 160, height: 60, marginLeft: -25 },
  headerRightActions: { flexDirection: 'row', alignItems: 'center' },
  notificationBtn: { marginRight: 16, position: 'relative' },
  notificationDot: { position: 'absolute', top: 0, right: 2, width: 10, height: 10, backgroundColor: '#2563EB', borderRadius: 5, borderWidth: 2, borderColor: '#FFFFFF' },
  profileBtn: { width: 44, height: 44, borderRadius: 22, padding: 2, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3, borderWidth: 2, borderColor: '#2563EB' },
  profileImg: { width: '100%', height: '100%', borderRadius: 22 },
  
  // Location Banner
  locationBanner: {
    backgroundColor: 'transparent',
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationLeftRow: { flexDirection: 'row', alignItems: 'center' },
  locationIconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  locationTextContainer: { justifyContent: 'center' },
  locationLabel: { fontSize: 11, color: '#64748B', fontWeight: '500', marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  changeLocationBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  changeLocationText: { color: '#0F172A', fontSize: 12, fontWeight: '600' },

  // Search
  searchWrapper: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 4, marginBottom: 4, alignItems: 'center', gap: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, height: 56, shadowColor: '#94A3B8', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 4 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#0F172A', fontWeight: '500' },
  filterBtn: { width: 56, height: 56, backgroundColor: '#2563EB', borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 6 },

  // List Layout
  mainList: { paddingBottom: 32 },
  listHeader: { paddingBottom: 8, paddingTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },

  // Circle Categories
  categoryList: { paddingHorizontal: 20, gap: 16 },
  circleCategoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  circleImageContainerSelected: {
    borderColor: '#2563EB',
  },
  circleImage: {
    width: 64,
    height: 64,
  },
  circleCategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  circleCategoryTextSelected: {
    color: '#0F172A',
    fontWeight: '800',
  },

  // Banners
  bannerContainer: { 
    width: width, 
    paddingHorizontal: 20,
  },
  bannerInner: {
    width: '100%',
    height: 180,
    borderRadius: 24, 
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  bannerCircle: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#F8FAFC',
  },
  bannerContent: { 
    padding: 20, 
    justifyContent: 'center', 
    width: '100%', 
    zIndex: 10 
  },
  bannerSuperTitle: { color: '#2563EB', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  bannerTitle: { color: '#0F172A', fontSize: 20, fontWeight: '900', lineHeight: 24, marginBottom: 8 },
  bannerSubtitle: { color: '#475569', fontSize: 11, fontWeight: '500', marginBottom: 16, maxWidth: '90%' },
  claimButton: { 
    backgroundColor: '#035EE8', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 8, 
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center'
  },
  claimButtonText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  bannerCarImage: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%', 
    height: '100%', 
    zIndex: 0 
  },
  
  // Pagination
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  dot: { height: 6, borderRadius: 3, marginHorizontal: 4 },
  activeDot: { width: 16, backgroundColor: '#035EE8' },
  inactiveDot: { width: 6, backgroundColor: '#BBD1EA' },

  // Vehicles
  vehicleCard: { backgroundColor: '#FFFFFF', borderRadius: 24, marginHorizontal: 20, marginBottom: 20, overflow: 'hidden', shadowColor: '#94A3B8', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 12 }, shadowRadius: 24, elevation: 6 },
  vehicleImageContainer: { width: '100%', height: 180, backgroundColor: '#F1F5F9' },
  vehicleImage: { width: '100%', height: '100%' },
  vehicleImagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  priceTag: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(15, 23, 42, 0.9)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  priceText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  priceTextSub: { fontSize: 12, fontWeight: '500', color: '#CBD5E1' },
  vehicleInfo: { padding: 16, paddingTop: 20 },
  vehicleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehicleTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#B45309', marginLeft: 4 },
  vehicleSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 16, fontWeight: '500' },
  featuresRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center' },
  featureText: { fontSize: 13, color: '#475569', marginLeft: 6, fontWeight: '600' },

  // Bottom Navigation
  bottomBar: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10,
  },
  barItem: { alignItems: 'center' },
  barText: { fontSize: 10, marginTop: 2, color: '#94A3B8', fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: height * 0.7 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  brandOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  brandOptionSelected: { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 12, borderBottomWidth: 0, marginVertical: 4 },
  brandOptionLeft: { flexDirection: 'row', alignItems: 'center' },
  brandOptionImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  brandOptionText: { fontSize: 16, fontWeight: '600', color: '#475569' },
  brandOptionTextSelected: { color: '#0F172A', fontWeight: '800' },
  applyFilterBtn: { backgroundColor: '#0F172A', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 24 },
  applyFilterText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default CategoriesScreen;
