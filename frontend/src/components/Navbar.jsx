// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">❤️</span>
              <span className="text-xl font-bold text-gray-900">HealthTracker</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
              <Link to="/register" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">❤️</span>
            <span className="text-xl font-bold text-gray-900">HealthTracker</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link to="/health-plan" className="text-gray-600 hover:text-gray-900">Health Plan</Link>
            <Link to="/daily-tracker" className="text-gray-600 hover:text-gray-900">Daily Tracker</Link>
            <Link to="/profile" className="text-gray-600 hover:text-gray-900">Profile</Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden md:block">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <span className="text-xl">🚪</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;