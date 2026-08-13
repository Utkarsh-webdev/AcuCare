import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, HeartPulse } from 'lucide-react'; // Icons removed from inside inputs
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Custom validation – both fields required
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const success = await login(email.trim(), password.trim());
    setLoading(false);

    if (success) navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-primary-900 px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-cream-100 shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        {/* LEFT BRAND PANEL */}
        <div className="relative hidden overflow-hidden bg-primary-900 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary-700/30" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-primary-700/20" />
          <div className="relative">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-accent-500">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-semibold text-cream-100">
                AcuCare
              </span>
            </div>
            <span className="acu-mono text-[9px] uppercase tracking-[0.16em] text-primary-300">
              Personal health rhythm
            </span>
            <h1 className="mt-5 font-display text-4xl leading-tight tracking-tight text-cream-100">
              Your health.
              <br />
              <span className="italic text-accent-500">
                Your rhythm.
              </span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-primary-200">
              Keep your health information, daily habits and personalized
              care plan connected in one place.
            </p>
          </div>
          <div className="relative">
            <div className="mb-5 h-px w-20 bg-accent-500" />
            <p className="max-w-xs font-display text-lg italic leading-7 text-cream-200">
              Small signals. Better habits. More informed days.
            </p>
          </div>
        </div>

        {/* FORM PANEL */}
        <div className="flex items-center bg-cream-100 p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            {/* MOBILE BRAND */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-900 text-accent-500">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-semibold text-ink-900">
                AcuCare
              </span>
            </div>

            {/* HEADER */}
            <div className="mb-8">
              <p className="acu-mono text-[9px] uppercase tracking-[0.16em] text-primary-600">
                Welcome back
              </p>
              <h2 className="mt-2 font-display text-4xl leading-tight text-ink-900">
                Continue your
                <span className="block italic text-accent-500">
                  health journey.
                </span>
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink-500">
                Sign in to access your health dashboard and daily plan.
              </p>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mb-5 rounded-xl border border-accent-500/20 bg-accent-50 px-4 py-3 text-sm text-accent-700">
                {error}
              </div>
            )}

            {/* FORM – No icons inside inputs */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="acu-mono mb-2 block text-[9px] uppercase tracking-[0.13em] text-ink-500"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="acu-input px-4"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="acu-mono text-[9px] uppercase tracking-[0.13em] text-ink-500"
                  >
                    Password
                  </label>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="acu-input px-4"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="acu-button w-full"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* REGISTER */}
            <div className="mt-7 border-t border-ink-900/10 pt-6 text-center">
              <p className="text-sm text-ink-500">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-accent-600 transition-colors hover:text-accent-700"
                >
                  Create one
                </Link>
              </p>
            </div>

            {/* FOOTNOTE */}
            <p className="mt-8 text-center text-[10px] leading-5 text-ink-300">
              Your health information stays private and protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;