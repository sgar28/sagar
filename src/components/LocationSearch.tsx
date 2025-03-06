import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Place {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const LocationSearch = ({ onLocationSelect }: { onLocationSelect: (location: { lat: number; lng: number; address: string }) => void }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.google && !autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      if (mapRef.current) {
        placesService.current = new google.maps.places.PlacesService(mapRef.current);
      }
    }
  }, []);

  const handleSearch = async (input: string) => {
    setQuery(input);
    if (!input || !autocompleteService.current) return;

    setIsLoading(true);
    try {
      const response = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
        autocompleteService.current?.getPlacePredictions(
          {
            input,
            componentRestrictions: { country: 'IN' },
            types: ['establishment', 'geocode']
          },
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              reject(status);
            }
          }
        );
      });

      setSuggestions(response as Place[]);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Error fetching location suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceSelect = (placeId: string) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId,
        fields: ['geometry', 'formatted_address']
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || ''
          };
          onLocationSelect(location);
          setQuery(place.formatted_address || '');
          setSuggestions([]);
        } else {
          toast.error('Error fetching location details');
        }
      }
    );
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for parking locations..."
          className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
      </div>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-x-0 top-full mt-2 p-4 bg-white rounded-lg shadow-lg"
        >
          Loading suggestions...
        </motion.div>
      )}

      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-x-0 top-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-50"
        >
          {suggestions.map((suggestion) => (
            <motion.button
              key={suggestion.place_id}
              whileHover={{ backgroundColor: '#f3f4f6' }}
              onClick={() => handlePlaceSelect(suggestion.place_id)}
              className="w-full px-4 py-3 text-left flex items-start gap-3 border-b border-gray-100 last:border-0"
            >
              <MapPin className="mt-1 text-gray-400 flex-shrink-0" size={18} />
              <div>
                <div className="font-medium">{suggestion.structured_formatting.main_text}</div>
                <div className="text-sm text-gray-500">{suggestion.structured_formatting.secondary_text}</div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      <div ref={mapRef} className="hidden" />
    </div>
  );
}; 