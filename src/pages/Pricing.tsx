import React from 'react';
import { CreditCard, Clock, Calendar, Zap } from 'lucide-react';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Simple, Dynamic Pricing</h1>
          <p className="text-xl text-gray-600 mb-12">Pay only for the time you park, with rates that adapt to demand</p>
        </div>

        {/* Pricing Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <CreditCard className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Base Rate</h3>
            <p className="text-gray-600">Starting from $2/hour for two-wheelers and $4/hour for four-wheelers</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Clock className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Time of Day</h3>
            <p className="text-gray-600">Peak hours (9 AM - 5 PM) may have higher rates</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Calendar className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Duration</h3>
            <p className="text-gray-600">Longer stays may qualify for discounted rates</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Zap className="h-8 w-8 text-yellow-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Demand</h3>
            <p className="text-gray-600">Prices adjust based on spot availability</p>
          </div>
        </div>

        {/* Vehicle Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-500">
            <h3 className="text-2xl font-bold mb-4">Two Wheelers</h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="w-4 h-4 bg-blue-500 rounded-full mr-3"></span>
                Base rate: $2/hour
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-blue-500 rounded-full mr-3"></span>
                Peak hour rate: $3/hour
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-blue-500 rounded-full mr-3"></span>
                Off-peak discount: 20% off
              </li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-green-500">
            <h3 className="text-2xl font-bold mb-4">Four Wheelers</h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
                Base rate: $4/hour
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
                Peak hour rate: $6/hour
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
                Off-peak discount: 15% off
              </li>
            </ul>
          </div>
        </div>

        {/* Special Offers */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-4">Special Offers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Early Bird</h4>
              <p>30% off for bookings before 8 AM</p>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Weekend Pass</h4>
              <p>Flat rates for 48-hour parking</p>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Monthly Pass</h4>
              <p>Save up to 40% with monthly subscriptions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}