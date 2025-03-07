export interface ParkingSpot {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
  priceInINR: number;
  totalSpots: number;
  availableSpots: number;
  features: string[];
}

export interface BookingDetails {
  id: string;
  userId: string;
  parkingSpotId: string;
  vehicleNumber: string;
  startTime: Date;
  endTime: Date;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed';
  paymentMethod: 'upi' | 'credit_card';
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicles: Vehicle[];
  locationEnabled: boolean;
}

export interface Vehicle {
  id: string;
  type: 'car' | 'bike' | 'other';
  number: string;
  model: string;
}
