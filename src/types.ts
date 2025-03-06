export interface ParkingSpot {
  id: string;
  address: string;
  price_per_minute: number;
  base_price: number;
  is_available: boolean;
  latitude: number;
  longitude: number;
  total_spaces: number;
  available_spaces: number;
  two_wheeler_spaces: number;
  four_wheeler_spaces: number;
  demand_factor: number;
  time_factor: number;
}

export interface Booking {
  id: string;
  spot_id: string;
  start_time: string;
  end_time: string | null;
  status: string;
  vehicle_type: 'two_wheeler' | 'four_wheeler';
  parking_spots: {
    address: string;
    price_per_minute: number;
  };
  estimated_price: number;
  actual_price: number;
}

export interface MapLocation {
  lat: number;
  lng: number;
}

export interface DynamicPricing {
  base_price: number;
  demand_factor: number;
  time_factor: number;
  duration_minutes: number;
}

export interface NavigationInfo {
  distance: string;
  duration: string;
  route: google.maps.DirectionsResult | null;
}