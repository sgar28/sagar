import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Clock, MapPin, CreditCard, Car, MessageSquare, Bot, Calendar, Bike, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface ParkingSpot {
  id: string;
  address: string;
  price_per_minute: number;
  is_available: boolean;
  latitude: number;
  longitude: number;
  total_spaces: number;
  available_spaces: number;
  two_wheeler_spaces: number;
  four_wheeler_spaces: number;
}

interface Booking {
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
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [bookingDate, setBookingDate] = useState<string>(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [duration, setDuration] = useState<number>(60);
  const [vehicleType, setVehicleType] = useState<'two_wheeler' | 'four_wheeler'>('four_wheeler');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I\'m your parking assistant. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchAvailableSpots();
    getUserLocation();
  }, [user]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast.success('Location detected successfully');
        },
        (error) => {
          toast.error('Error getting location. Please enable GPS.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const calculateDistance = (spot: ParkingSpot) => {
    if (!userLocation) return Infinity;
    
    const R = 6371;
    const dLat = (spot.latitude - userLocation.lat) * Math.PI / 180;
    const dLon = (spot.longitude - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(spot.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getAvailableSpaces = (spot: ParkingSpot) => {
    return vehicleType === 'two_wheeler' ? spot.two_wheeler_spaces : spot.four_wheeler_spaces;
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user' as const, content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    let response = '';
    const input = chatInput.toLowerCase();
    
    if (input.includes('book') || input.includes('reserve')) {
      response = 'To book a parking spot: 1. Select your vehicle type (2-wheeler/4-wheeler), 2. Choose a nearby spot, 3. Set your parking duration, 4. Complete the payment. Would you like help with any of these steps?';
    } else if (input.includes('payment') || input.includes('pay')) {
      response = 'We accept both card and UPI payments. You can select your preferred payment method when booking a spot. All transactions are secure and encrypted.';
    } else if (input.includes('cancel')) {
      response = 'To cancel a booking, go to "Your Bookings" section and click on the booking you want to cancel. Note that cancellation fees may apply depending on the timing.';
    } else if (input.includes('vehicle') || input.includes('two wheeler') || input.includes('four wheeler')) {
      response = 'We support both two-wheelers and four-wheelers. Select your vehicle type before booking to see available spots and applicable rates.';
    } else {
      response = 'I can help you with booking spots, payments, vehicle types, and finding locations. What would you like to know?';
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          spot_id,
          start_time,
          end_time,
          status,
          vehicle_type,
          parking_spots (
            address,
            price_per_minute
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      toast.error('Error fetching bookings');
    }
  };

  const fetchAvailableSpots = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_spots')
        .select('*')
        .eq('is_available', true);

      if (error) throw error;
      setSpots(data || []);
    } catch (error) {
      toast.error('Error fetching parking spots');
    } finally {
      setLoading(false);
    }
  };

  const bookSpot = async (spot: ParkingSpot) => {
    const availableSpaces = getAvailableSpaces(spot);
    if (!availableSpaces) {
      toast.error(`No ${vehicleType === 'two_wheeler' ? '2-wheeler' : '4-wheeler'} spaces available`);
      return;
    }

    try {
      const bookingTime = new Date(bookingDate);
      const endTime = new Date(bookingTime.getTime() + duration * 60000);

      // Check for overlapping bookings (FCFS)
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('spot_id', spot.id)
        .eq('vehicle_type', vehicleType)
        .eq('status', 'active')
        .or(`start_time.lte.${endTime.toISOString()},end_time.gte.${bookingTime.toISOString()}`);

      if (existingBookings && existingBookings.length > 0) {
        toast.error('This spot is already booked for the selected time period');
        return;
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user?.id,
            spot_id: spot.id,
            start_time: bookingTime.toISOString(),
            end_time: endTime.toISOString(),
            status: 'active',
            vehicle_type: vehicleType
          }
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create payment
      const amount = spot.price_per_minute * duration;
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            booking_id: booking.id,
            amount,
            payment_method: paymentMethod,
            status: 'completed'
          }
        ]);

      if (paymentError) throw paymentError;

      // Update available spaces
      const updateField = vehicleType === 'two_wheeler' ? 'two_wheeler_spaces' : 'four_wheeler_spaces';
      const { error: updateError } = await supabase
        .from('parking_spots')
        .update({ [updateField]: availableSpaces - 1 })
        .eq('id', spot.id);

      if (updateError) throw updateError;

      toast.success('Spot booked successfully! You can now park your vehicle.');
      
      // Send confirmation message
      await supabase
        .from('support_messages')
        .insert([
          {
            user_id: user?.id,
            message: `Booking confirmed for ${vehicleType === 'two_wheeler' ? '2-wheeler' : '4-wheeler'} at ${spot.address}. Your spot is ready!`,
            is_from_user: false
          }
        ]);

      setSelectedSpot(null);
      fetchBookings();
      fetchAvailableSpots();
    } catch (error) {
      toast.error('Error booking spot');
    }
  };

  const sendSupportMessage = async () => {
    if (!message.trim()) return;

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert([
          {
            user_id: user?.id,
            message: message.trim(),
            is_from_user: true
          }
        ]);

      if (error) throw error;
      toast.success('Message sent to support');
      setMessage('');
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-green-600">Loading...</div>
      </div>
    );
  }

  const sortedSpots = [...spots].sort((a, b) => 
    calculateDistance(a) - calculateDistance(b)
  );

  const renderBookingStep = () => {
    switch(bookingStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-xl font-bold mb-4">Step 1: Select Vehicle Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setVehicleType('two_wheeler');
                  setBookingStep(2);
                }}
                className={`p-6 rounded-lg border-2 ${
                  vehicleType === 'two_wheeler' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                } transition-all`}
              >
                <Bike className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <p className="text-center font-medium">Two Wheeler</p>
                <p className="text-sm text-gray-600 text-center mt-2">
                  Perfect for motorcycles and scooters
                </p>
              </button>
              <button
                onClick={() => {
                  setVehicleType('four_wheeler');
                  setBookingStep(2);
                }}
                className={`p-6 rounded-lg border-2 ${
                  vehicleType === 'four_wheeler' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                } transition-all`}
              >
                <Car className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <p className="text-center font-medium">Four Wheeler</p>
                <p className="text-sm text-gray-600 text-center mt-2">
                  Suitable for cars and SUVs
                </p>
              </button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-xl font-bold mb-4">Step 2: Choose Location</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedSpots.map((spot) => {
                const availableSpaces = getAvailableSpaces(spot);
                return (
                  <div key={spot.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-gray-900 font-medium">{spot.address}</span>
                      </div>
                      <span className="text-green-600 font-semibold">
                        ₹{spot.price_per_minute * 60}/hour
                      </span>
                    </div>
                    {userLocation && (
                      <p className="text-sm text-gray-600 mb-4">
                        Distance: {calculateDistance(spot).toFixed(2)} km
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mb-4">
                      Available Spaces: {availableSpaces}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedSpot(spot);
                        setBookingStep(3);
                      }}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!availableSpaces}
                    >
                      {availableSpaces ? 'Select This Spot' : 'No Spaces Available'}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-xl font-bold mb-4">Step 3: Enter Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={bookingDetails.name}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, name: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={bookingDetails.phone}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, phone: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={bookingDetails.email}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, email: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={bookingDetails.notes}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setBookingStep(2)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setBookingStep(4)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-xl font-bold mb-4">Step 4: Payment</h3>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <p>Vehicle Type: {vehicleType === 'two_wheeler' ? 'Two Wheeler' : 'Four Wheeler'}</p>
                  <p>Location: {selectedSpot?.address}</p>
                  <p>Duration: {duration} minutes</p>
                  <p>Total Amount: ₹{selectedSpot ? selectedSpot.price_per_minute * duration : 0}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="h-4 w-4 text-green-600"
                    />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="h-4 w-4 text-green-600"
                    />
                    <span>UPI</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setBookingStep(3)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (selectedSpot) {
                      bookSpot(selectedSpot);
                      setBookingStep(5);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-md p-6 text-center"
          >
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
            <p className="text-gray-600 mb-6">
              Your parking spot has been reserved. A confirmation has been sent to your email.
            </p>
            <button
              onClick={() => {
                setBookingStep(1);
                setSelectedSpot(null);
                setBookingDetails({
                  name: '',
                  phone: '',
                  email: '',
                  notes: ''
                });
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Book Another Spot
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Booking Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              'Select Vehicle',
              'Choose Location',
              'Enter Details',
              'Payment',
              'Confirmation'
            ].map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${
                  index < bookingStep ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                  index < bookingStep ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {index < bookingStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className="ml-2 text-sm hidden sm:block">{step}</span>
                {index < 4 && (
                  <div className={`h-0.5 w-12 sm:w-24 mx-2 ${
                    index < bookingStep - 1 ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Booking Step */}
        {renderBookingStep()}

        {/* Active Bookings */}
        {bookingStep === 1 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Active Bookings</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bookings.filter(b => b.status === 'active').map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {booking.vehicle_type === 'two_wheeler' ? (
                        <Bike className="h-5 w-5 text-blue-600 mr-2" />
                      ) : (
                        <Car className="h-5 w-5 text-blue-600 mr-2" />
                      )}
                      <span className="text-gray-900 font-medium">
                        {booking.parking_spots.address}
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Started: {new Date(booking.start_time).toLocaleString()}</span>
                    </div>
                    {booking.end_time && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Ends: {new Date(booking.end_time).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span>Rate: ₹{booking.parking_spots.price_per_minute * 60}/hour</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Support Chat */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setShowSupport(!showSupport)}
            className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors"
          >
            <MessageSquare className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}