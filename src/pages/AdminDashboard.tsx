import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Users, Car, CreditCard, TrendingUp, Calendar, Settings, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminStats {
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  totalUsers: number;
  dailyBookings: { date: string; count: number }[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalBookings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    dailyBookings: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user?.email !== 'sagar') {
      toast.error('Unauthorized access');
      return;
    }
    fetchAdminStats();
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      // Fetch total bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*');
      
      // Fetch active bookings
      const { data: activeBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'active');

      // Fetch total revenue
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Fetch daily bookings for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: dailyBookings } = await supabase
        .from('bookings')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Process daily bookings data
      const dailyStats = dailyBookings?.reduce((acc: any, booking) => {
        const date = new Date(booking.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const dailyBookingsArray = Object.entries(dailyStats || {}).map(([date, count]) => ({
        date,
        count: count as number
      }));

      setStats({
        totalBookings: bookings?.length || 0,
        activeBookings: activeBookings?.length || 0,
        totalRevenue: payments?.reduce((acc, payment) => acc + payment.amount, 0) || 0,
        totalUsers: userCount || 0,
        dailyBookings: dailyBookingsArray
      });
    } catch (error) {
      toast.error('Error fetching admin stats');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <Car className="h-8 w-8 text-green-500" />,
                  label: "Total Bookings",
                  value: stats.totalBookings,
                  color: "green"
                },
                {
                  icon: <Car className="h-8 w-8 text-blue-500" />,
                  label: "Active Bookings",
                  value: stats.activeBookings,
                  color: "blue"
                },
                {
                  icon: <CreditCard className="h-8 w-8 text-yellow-500" />,
                  label: "Total Revenue",
                  value: `₹${stats.totalRevenue.toLocaleString()}`,
                  color: "yellow"
                },
                {
                  icon: <Users className="h-8 w-8 text-purple-500" />,
                  label: "Total Users",
                  value: stats.totalUsers,
                  color: "purple"
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${stat.color}-500`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-center">
                    {stat.icon}
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Revenue Chart */}
            <motion.div
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Revenue Overview</h2>
                <select className="border rounded-md p-2">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
              <div className="h-64">
                {/* Add your preferred charting library here */}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {/* Add recent activity items here */}
              </div>
            </motion.div>
          </div>
        );

      case 'bookings':
        return (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold mb-4 sm:mb-0">Manage Bookings</h2>
                <div className="flex space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      className="pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="border rounded-md px-4 py-2"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Add booking rows here */}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold mb-4 sm:mb-0">User Management</h2>
                <div className="flex space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Add User
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Add user rows here */}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-6">System Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-md font-medium mb-4">Booking Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Booking Duration (minutes)
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Booking Duration (hours)
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-md font-medium mb-4">Payment Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Rate (Two Wheeler)
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Rate (Four Wheeler)
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-blue-600">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-5 w-5" /> },
                { id: 'bookings', label: 'Bookings', icon: <Calendar className="h-5 w-5" /> },
                { id: 'users', label: 'Users', icon: <Users className="h-5 w-5" /> },
                { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> }
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-2 px-4 py-2 rounded-md ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}