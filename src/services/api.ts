import AsyncStorage from '@react-native-async-storage/async-storage';

// --- MOCK DATA ---
const MOCK_CATEGORIES = [
  { id: 1, name: 'Sedan', description: 'Comfortable sedans for city drives.', perkm_price: '12', image: 'https://picsum.photos/seed/sedan/300/200' },
  { id: 2, name: 'SUV', description: 'Spacious SUVs for outstation trips.', perkm_price: '18', image: 'https://picsum.photos/seed/suv/300/200' },
  { id: 3, name: 'Hatchback', description: 'Compact cars for easy parking.', perkm_price: '9', image: 'https://picsum.photos/seed/hatchback/300/200' },
];

const MOCK_VEHICLES = [
  { id: 1, category: 1, vehicle_name: 'Honda City', vehicle_number: 'TN 01 AB 1234', image: 'https://picsum.photos/seed/honda/300/200', seating_capacity: '5', fuel_type: 'Petrol', transmission: 'Automatic', status: 'Available' },
  { id: 2, category: 1, vehicle_name: 'Hyundai Verna', vehicle_number: 'TN 02 XY 9876', image: 'https://picsum.photos/seed/verna/300/200', seating_capacity: '5', fuel_type: 'Diesel', transmission: 'Manual', status: 'Available' },
  { id: 3, category: 2, vehicle_name: 'Toyota Innova', vehicle_number: 'TN 03 CD 5555', image: 'https://picsum.photos/seed/innova/300/200', seating_capacity: '7', fuel_type: 'Diesel', transmission: 'Automatic', status: 'Available' },
  { id: 4, category: 2, vehicle_name: 'Mahindra XUV700', vehicle_number: 'TN 04 EF 7777', image: 'https://picsum.photos/seed/xuv/300/200', seating_capacity: '7', fuel_type: 'Petrol', transmission: 'Automatic', status: 'Maintenance' },
  { id: 5, category: 3, vehicle_name: 'Maruti Swift', vehicle_number: 'TN 05 GH 1111', image: 'https://picsum.photos/seed/swift/300/200', seating_capacity: '5', fuel_type: 'Petrol', transmission: 'Manual', status: 'Available' },
  { id: 6, category: 1, vehicle_name: 'BMW 3 Series', vehicle_number: 'TN 06 IJ 2222', image: 'https://picsum.photos/seed/bmw/300/200', seating_capacity: '5', fuel_type: 'Petrol', transmission: 'Automatic', status: 'Available' },
  { id: 7, category: 1, vehicle_name: 'Mercedes C-Class', vehicle_number: 'TN 07 KL 3333', image: 'https://picsum.photos/seed/mercedes/300/200', seating_capacity: '5', fuel_type: 'Diesel', transmission: 'Automatic', status: 'Available' },
  { id: 8, category: 2, vehicle_name: 'Ford Endeavour', vehicle_number: 'TN 08 MN 4444', image: 'https://picsum.photos/seed/ford/300/200', seating_capacity: '7', fuel_type: 'Diesel', transmission: 'Automatic', status: 'Available' },
  { id: 9, category: 2, vehicle_name: 'Tata Safari', vehicle_number: 'TN 09 OP 5555', image: 'https://picsum.photos/seed/tata/300/200', seating_capacity: '7', fuel_type: 'Diesel', transmission: 'Manual', status: 'Available' },
  { id: 10, category: 3, vehicle_name: 'Hyundai i20', vehicle_number: 'TN 10 QR 6666', image: 'https://picsum.photos/seed/i20/300/200', seating_capacity: '5', fuel_type: 'Petrol', transmission: 'Automatic', status: 'Available' },
  { id: 11, category: 1, vehicle_name: 'Audi A4', vehicle_number: 'TN 11 ST 7777', image: 'https://picsum.photos/seed/audi/300/200', seating_capacity: '5', fuel_type: 'Petrol', transmission: 'Automatic', status: 'Available' },
];

// --- MOCK API ENDPOINTS ---

export const signup = async (data: any) => {
  await new Promise<void>(r => setTimeout(r, 1000));
  await AsyncStorage.setItem('mock_user', JSON.stringify(data));
  return { data: { success: true } };
};

export const login = async (data: any) => {
  await new Promise<void>(r => setTimeout(r, 1000));
  // Mock accepting any login credentials
  return { data: { token: 'mock-jwt-token-12345' } };
};

export const getCategories = async () => {
  await new Promise<void>(r => setTimeout(r, 500));
  return { data: MOCK_CATEGORIES };
};

export const getCategoryDetails = async (id: string) => {
  await new Promise<void>(r => setTimeout(r, 500));
  return { data: MOCK_CATEGORIES.find(c => c.id.toString() === id.toString()) };
};

export const getVehicles = async () => {
  await new Promise<void>(r => setTimeout(r, 500));
  return { data: MOCK_VEHICLES };
};

export const getVehiclesByCategory = async (id: string) => {
  await new Promise<void>(r => setTimeout(r, 500));
  return { data: MOCK_VEHICLES.filter(v => v.category.toString() === id.toString()) };
};

export const getVehicleDetails = async (id: string) => {
  await new Promise<void>(r => setTimeout(r, 500));
  return { data: MOCK_VEHICLES.find(v => v.id.toString() === id.toString()) };
};

export const createBooking = async (data: any) => {
  try {
    const res = await fetch('https://primary-sculpture-empathy.ngrok-free.dev/carapp/bookings/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend validation error:', errorText);
      throw new Error(`Booking failed: ${errorText}`);
    }
    
    const json = await res.json();
    return { data: json };
  } catch (error) {
    console.error('Error creating booking:', error);
    // fallback to mock
    const existingStr = await AsyncStorage.getItem('mock_bookings');
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const newBooking = { ...data, id: Date.now(), status: 'Pending' };
    await AsyncStorage.setItem('mock_bookings', JSON.stringify([newBooking, ...existing]));
    return { data: newBooking };
  }
};

export const getUserBookings = async (userId: string) => {
  await new Promise<void>(r => setTimeout(r, 500));
  const existingStr = await AsyncStorage.getItem('mock_bookings');
  return { data: existingStr ? JSON.parse(existingStr) : [] };
};

export const getBookingDetails = async (id: string) => {
  await new Promise<void>(r => setTimeout(r, 500));
  const existingStr = await AsyncStorage.getItem('mock_bookings');
  const existing = existingStr ? JSON.parse(existingStr) : [];
  return { data: existing.find((b: any) => b.id.toString() === id.toString()) };
};

const updateBookingStatus = async (id: string, status: string) => {
  await new Promise<void>(r => setTimeout(r, 500));
  const existingStr = await AsyncStorage.getItem('mock_bookings');
  const existing = existingStr ? JSON.parse(existingStr) : [];
  const updated = existing.map((b: any) => b.id.toString() === id.toString() ? { ...b, status } : b);
  await AsyncStorage.setItem('mock_bookings', JSON.stringify(updated));
  return { data: { success: true } };
};
 
export const cancelBooking = (id: string) => updateBookingStatus(id, 'Cancelled');
export const confirmBooking = (id: string) => updateBookingStatus(id, 'Confirmed');
export const completeBooking = (id: string) => updateBookingStatus(id, 'Completed');
