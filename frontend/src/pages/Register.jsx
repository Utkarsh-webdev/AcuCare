// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Visual language: "Vitals Chart" — matches Login.jsx / Dashboard.jsx
 * (deep ink backdrop, parchment card, hand-inked pulse mark as the
 * brand signature). All state, validation, and submit logic are
 * unchanged from the original component; only markup and styling
 * were touched.
 *
 * NOTE: move the @import in <style> below into your global
 * stylesheet / index.html <head> in the real app.
 */

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Newsreader:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const INK = '#0F2321';
const PARCHMENT = '#F6EFE3';
const CARD_BORDER = '#D9CFB8';
const CORAL = '#E4572E';
const BRASS = '#D9A441';
const MUTED_INK = '#6B675A';

function PulseMark({ size = 34 }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 68 40" fill="none">
      <path
        d="M0,20 L18,20 L23,12 L27,30 L31,6 L35,26 L39,20 L68,20"
        stroke={CORAL}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FieldLabel({ children }) {
  return (
    <label
      className="block text-[10px] tracking-[0.14em] uppercase font-medium mb-2"
      style={{ color: '#8C6A1F', fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {children}
    </label>
  );
}

const fieldClasses =
  'w-full px-4 py-2.5 rounded-sm border outline-none transition-colors focus:ring-2';

const fieldStyle = {
  background: '#FBF8F0',
  borderColor: CARD_BORDER,
  color: '#22201A',
  fontFamily: "'Newsreader', serif"
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    // Only send basic info for registration
    const registrationData = {
      name: formData.name,
      email: formData.email,
      password: formData.password
    };

    const success = await register(registrationData);
    setLoading(false);

    if (success) {
      navigate('/profile'); // Redirect to profile to complete health info
    }
  };

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center px-4 py-8" style={{ background: INK }}>
      <style>{FONTS}</style>
      <div className="rounded-sm border p-8 w-full max-w-md" style={{ background: PARCHMENT, borderColor: CARD_BORDER }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <PulseMark />
          </div>
          <h1 className="text-2xl leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#22201A' }}>
            Create Account
          </h1>
          <p className="mt-2 text-sm italic" style={{ fontFamily: "'Newsreader', serif", color: MUTED_INK }}>
            Start your health journey today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="px-4 py-3 rounded-sm text-sm border"
              style={{ background: '#FBEAE3', borderColor: '#E7B8A5', color: '#B23E1E', fontFamily: "'Newsreader', serif" }}
            >
              {error}
            </div>
          )}

          <div>
            <FieldLabel>Full Name</FieldLabel>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={fieldClasses}
              style={fieldStyle}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <FieldLabel>Email Address</FieldLabel>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={fieldClasses}
              style={fieldStyle}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <FieldLabel>Password</FieldLabel>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={fieldClasses}
              style={fieldStyle}
              placeholder="Create a password (min 6 characters)"
              required
              minLength="6"
            />
          </div>

          <div>
            <FieldLabel>Confirm Password</FieldLabel>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={fieldClasses}
              style={fieldStyle}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-sm text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: CORAL, color: PARCHMENT, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ fontFamily: "'Newsreader', serif", color: MUTED_INK }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: CORAL }}>
            Sign in
          </Link>
        </p>

        <div className="mt-6 p-4 rounded-sm border" style={{ background: '#FBF1DD', borderColor: '#E9D9AC' }}>
          <p className="text-xs leading-relaxed" style={{ fontFamily: "'Newsreader', serif", color: '#8C6A1F' }}>
            <span
              className="uppercase tracking-[0.1em] font-medium mr-1"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: BRASS }}
            >
              Note —
            </span>
            After registration, you'll be guided to complete your health profile with medical information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;