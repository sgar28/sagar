import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Settings, CreditCard, Clock, Car } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
  full_name: string;
  phone: string;
  preferred_payment: 'card' | 'upi';
  notifications_enabled: boolean;
}

export default function Account() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    phone: '',
    preferred_payment: 'card',
    notifications_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [bookingHistory, setBookingHistory] = useState([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchBookingHistory();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (error) {
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          start_time,
          end_time,
          status,
          vehicle_type,
          actual_price,
          parking_spots (
            address
          )
        `)
        .eq('user_id', user?.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setBookingHistory(data || []);
    } catch (error) {
      toast.error('Error loading booking history');
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...profile,
          updated_at: new Date()
        });

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <User className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold">Profile Settings</h2>
              </div>
              <form onSubmit={updateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Payment</label>
                  <select
                    value={profile.preferred_payment}
                    onChange={(e) => setProfile({ ...profile, preferred_payment: e.target.value as 'card' | 'upi' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profile.notifications_enabled}
                    onChange={(e) => setProfile({ ...profile, notifications_enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Enable notifications
                  </label>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Settings className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold">Account Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Bookings</span>
                  <span className="font-semibold">{bookingHistory.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">
                    {new Date(user?.created_at || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Download Our App</h3>
              <p className="text-sm mb-4">Get the SpotMaster app for a better experience</p>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block bg-white text-gray-900 px-4 py-2 rounded-md text-center hover:bg-gray-100 transition-colors"
                >
                  Download for Android
                </a>
                <a
                  href="#"
                  className="block bg-white text-gray-900 px-4 py-2 rounded-md text-center hover:bg-gray-100 transition-colors"
                >
                  Download for iOS
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Booking History */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <Clock className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-2xl font-bold">Booking History</h2>
            </div>
            <div className="space-y-6">
              {bookingHistory.map((booking: any) => (
                <div key={booking.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Car className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="font-medium">{booking.parking_spots.address}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="block text-gray-500">Start Time</span>
                      {new Date(booking.start_time).toLocaleString()}
                    </div>
                    <div>
                      <span className="block text-gray-500">End Time</span>
                      {booking.end_time ? new Date(booking.end_time).toLocaleString() : 'Ongoing'}
                    </div>
                    <div>
                      <span className="block text-gray-500">Vehicle Type</span>
                      {booking.vehicle_type === 'two_wheeler' ? 'Two Wheeler' : 'Four Wheeler'}
                    </div>
                    <div>
                      <span className="block text-gray-500">Amount</span>
                      ${booking.actual_price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}