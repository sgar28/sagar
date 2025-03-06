import React from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, CreditCard, MessageSquare, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Map Background */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Find Your Perfect Parking Spot
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              SpotMaster helps you find and book parking spots in real-time. Save time and avoid the hassle of searching for parking.
            </p>
            
            {/* Quick Booking Section */}
            <div className="mt-10 max-w-xl mx-auto">
              <div className="bg-white rounded-lg shadow-xl p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter location or landmark"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Find Parking
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-gray-900">Premium Parking Experience</h2>
            <p className="mt-4 text-xl text-gray-600">Everything you need for hassle-free parking</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Car className="h-12 w-12 text-blue-600" />,
                title: "Smart Booking",
                description: "Book parking spots instantly with real-time availability"
              },
              {
                icon: <MapPin className="h-12 w-12 text-purple-600" />,
                title: "GPS Navigation",
                description: "Get turn-by-turn directions to your parking spot"
              },
              {
                icon: <CreditCard className="h-12 w-12 text-green-600" />,
                title: "Secure Payments",
                description: "Pay safely using UPI or cards with instant confirmation"
              },
              {
                icon: <MessageSquare className="h-12 w-12 text-yellow-600" />,
                title: "24/7 Support",
                description: "Get help anytime with our AI-powered assistant"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gray-50 rounded-2xl shadow-lg">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Start Parking Smarter?</h2>
            <p className="text-xl mb-8">Join thousands of happy users who've simplified their parking experience</p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 border-2 border-white rounded-lg text-lg font-medium hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}