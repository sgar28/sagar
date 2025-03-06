import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { MapPin, MapOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 20.5937,
  lng: 78.9629 // India's center coordinates
};

interface ParkingSpot {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  pricePerHour: number;
  availableSpots: number;
}

export const ParkingSearch = () => {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState(center);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);

  const convertToINR = (usdPrice: number) => {
    // Using a fixed conversion rate (you should use a real-time API in production)
    const conversionRate = 75;
    return Math.round(usdPrice * conversionRate);
  };

  useEffect(() => {
    if (locationEnabled) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast.success('Location accessed successfully');
        },
        (error) => {
          toast.error('Error accessing location');
          console.error(error);
        }
      );
    }
  }, [locationEnabled]);

  const toggleLocation = () => {
    setLocationEnabled(!locationEnabled);
  };

  const handleSpotSelect = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
    // Navigate to booking page or open modal
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto p-4"
    >
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleLocation}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          {locationEnabled ? <MapPin /> : <MapOff />}
          {locationEnabled ? 'Location On' : 'Location Off'}
        </button>
      </div>

      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation}
          zoom={13}
        >
          {/* User location marker */}
          {locationEnabled && (
            <Marker
              position={userLocation}
              icon={{
                url: '/user-location.png',
                scaledSize: new window.google.maps.Size(30, 30)
              }}
            />
          )}

          {/* Parking spot markers */}
          {parkingSpots.map((spot) => (
            <Marker
              key={spot.id}
              position={spot.location}
              onClick={() => handleSpotSelect(spot)}
            />
          ))}
        </GoogleMap>
      </LoadScript>

      {selectedSpot && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-4 p-4 bg-white rounded-lg shadow-lg"
        >
          <h3 className="text-xl font-bold">{selectedSpot.name}</h3>
          <p>Price per hour: ₹{convertToINR(selectedSpot.pricePerHour)}</p>
          <p>Available spots: {selectedSpot.availableSpots}</p>
          <button
            onClick={() => {/* Navigate to booking page */}}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Book Now
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}; 