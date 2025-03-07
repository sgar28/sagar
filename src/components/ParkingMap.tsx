import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ParkingSpot } from '../types/parking';
import { motion } from 'framer-motion';

interface ParkingMapProps {
  spots: ParkingSpot[];
  onSpotSelect: (spot: ParkingSpot) => void;
}

const ParkingMap = ({ spots, onSpotSelect }: ParkingMapProps) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      });
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[500px] w-full rounded-lg shadow-lg overflow-hidden"
    >
      <MapContainer
        center={userLocation || [20.5937, 78.9629]} // Default to India's center
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{spot.name}</h3>
                <p>{spot.address}</p>
                <p>₹{spot.priceInINR}/hour</p>
                <p>{spot.availableSpots} spots available</p>
                <button
                  onClick={() => onSpotSelect(spot)}
                  className="mt-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                >
                  Select
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </motion.div>
  );
};

export default ParkingMap;
