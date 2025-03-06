import React, { useEffect, useRef, useState } from 'react';
import { loader } from '../lib/maps';
import { MapLocation, ParkingSpot } from '../types';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface MapProps {
  userLocation: MapLocation;
  spots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  onSpotSelect: (spot: ParkingSpot) => void;
}

export default function Map({ userLocation, spots, selectedSpot, onSpotSelect }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    loader.load().then(() => {
      const mapInstance = new google.maps.Map(mapRef.current!, {
        center: userLocation,
        zoom: 14,
        styles: [
          {
            "featureType": "all",
            "elementType": "geometry",
            "stylers": [{ "color": "#f5f5f5" }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#c9c9c9" }]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#9e9e9e" }]
          },
          {
            "featureType": "poi",
            "stylers": [{ "visibility": "off" }]
          }
        ],
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      const directionsRendererInstance = new google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#4F46E5',
          strokeWeight: 5
        }
      });

      setMap(mapInstance);
      setDirectionsRenderer(directionsRendererInstance);
      setMapLoaded(true);

      // Add user location marker with custom icon
      new google.maps.Marker({
        position: userLocation,
        map: mapInstance,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#4F46E5',
          fillOpacity: 1,
          strokeWeight: 3,
          strokeColor: '#FFFFFF',
        },
        title: 'Your Location'
      });

      // Add parking spot markers with custom icons and animations
      spots.forEach((spot, index) => {
        setTimeout(() => {
          const marker = new google.maps.Marker({
            position: { lat: spot.latitude, lng: spot.longitude },
            map: mapInstance,
            icon: {
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 7,
              fillColor: selectedSpot?.id === spot.id ? '#DC2626' : '#10B981',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
            },
            title: spot.address,
            animation: google.maps.Animation.DROP
          });

          // Add click listener with info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-bold">${spot.address}</h3>
                <p class="text-sm">₹${spot.price_per_minute * 60}/hour</p>
                <p class="text-sm">${spot.available_spaces} spots available</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
            onSpotSelect(spot);
          });
        }, index * 100); // Stagger marker animations
      });
    });
  }, [userLocation, spots]);

  useEffect(() => {
    if (!map || !directionsRenderer || !selectedSpot) return;

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: userLocation,
        destination: { lat: selectedSpot.latitude, lng: selectedSpot.longitude },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
        }
      }
    );
  }, [selectedSpot, map, directionsRenderer]);

  return (
    <motion.div 
      className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <MapPin className="h-12 w-12 text-blue-600" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}