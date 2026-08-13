// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Visual language: "Vitals Chart" — matches Dashboard.jsx (deep ink
 * backdrop, parchment card, hand-inked pulse mark as the brand
 * signature). All state, handlers, and navigation are unchanged
 * from the original component; only markup and styling were touched.
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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center px-4" style={{ background: INK }}>
      <style>{FONTS}</style>
      <div className="rounded-sm border p-8 w-full max-w-md" style={{ background: PARCHMENT, borderColor: CARD_BORDER }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <PulseMark />
          </div>
          <h1 className="text-2xl leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#22201A' }}>
            Welcome Back
          </h1>
          <p className="mt-2 text-sm italic" style={{ fontFamily: "'Newsreader', serif", color: MUTED_INK }}>
            Sign in to your health tracker account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <FieldLabel>Email Address</FieldLabel>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClasses}
              style={{
                background: '#FBF8F0',
                borderColor: CARD_BORDER,
                color: '#22201A',
                fontFamily: "'Newsreader', serif"
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <FieldLabel>Password</FieldLabel>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClasses}
              style={{
                background: '#FBF8F0',
                borderColor: CARD_BORDER,
                color: '#22201A',
                fontFamily: "'Newsreader', serif"
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-sm text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: CORAL, color: PARCHMENT, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ fontFamily: "'Newsreader', serif", color: MUTED_INK }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium" style={{ color: CORAL }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;