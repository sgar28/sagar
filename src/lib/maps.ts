import { Loader } from '@googlemaps/js-api-loader';
import { MapLocation } from '../types';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'geometry', 'directions']
});

export const calculateRoute = async (
  origin: MapLocation,
  destination: MapLocation
): Promise<google.maps.DirectionsResult> => {
  await loader.load();
  const directionsService = new google.maps.DirectionsService();
  
  const result = await directionsService.route({
    origin: origin,
    destination: destination,
    travelMode: google.maps.TravelMode.DRIVING,
  });

  return result;
};

export const calculateDynamicPrice = (
  basePrice: number,
  demandFactor: number,
  timeFactor: number,
  durationMinutes: number
): number => {
  // Base price per minute
  let price = basePrice;

  // Apply demand factor (1.0 - 2.0)
  price *= demandFactor;

  // Apply time of day factor (0.8 - 1.5)
  price *= timeFactor;

  // Calculate total price for duration
  const totalPrice = price * durationMinutes;

  return Math.round(totalPrice * 100) / 100;
};

export const getDemandFactor = (spotsAvailable: number, totalSpots: number): number => {
  const occupancyRate = (totalSpots - spotsAvailable) / totalSpots;
  
  if (occupancyRate > 0.9) return 2.0;     // Very high demand
  if (occupancyRate > 0.7) return 1.5;     // High demand
  if (occupancyRate > 0.5) return 1.2;     // Moderate demand
  return 1.0;                              // Low demand
};

export const getTimeFactor = (): number => {
  const hour = new Date().getHours();
  
  // Peak hours (9 AM - 5 PM)
  if (hour >= 9 && hour <= 17) return 1.5;
  
  // Shoulder hours (7 AM - 9 AM, 5 PM - 7 PM)
  if ((hour >= 7 && hour < 9) || (hour > 17 && hour <= 19)) return 1.3;
  
  // Off-peak hours
  return 0.8;
};