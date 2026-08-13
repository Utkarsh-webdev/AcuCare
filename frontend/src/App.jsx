// frontend/src/App.jsx

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HealthPlan from './pages/HealthPlan';
import Profile from './pages/Profile';
import DailyTracker from './pages/DailyTracker';

import Navbar from './components/Navbar';

function AppLayout() {
  const location = useLocation();

  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#0b2623] text-[#f5eee1]">
      {!isAuthPage && <Navbar />}

      <main
        className={
          isAuthPage
            ? 'min-h-screen'
            : 'mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8'
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/health-plan"
            element={
              <PrivateRoute>
                <HealthPlan />
              </PrivateRoute>
            }
          />

          <Route
            path="/daily-tracker"
            element={
              <PrivateRoute>
                <DailyTracker />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#f5eee1',
            color: '#0b2623',
            border: '1px solid rgba(11, 38, 35, 0.15)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;