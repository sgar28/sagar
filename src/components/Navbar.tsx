import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, LogOut, User, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SpotMaster</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/pricing"
              className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/pricing') ? 'text-blue-600' : ''
              }`}
            >
              <div className="flex items-center space-x-1">
                <CreditCard className="h-4 w-4" />
                <span>Pricing</span>
              </div>
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/dashboard') ? 'text-blue-600' : ''
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/account"
                  className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/account') ? 'text-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Account</span>
                  </div>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}