import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  HeartPulse,
  LockKeyhole,
  Mail,
  UserRound,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, password, confirmPassword } = formData;
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const success = await register({
      name: name.trim(),
      email: email.trim(),
      password
    });
    setLoading(false);

    if (success) navigate('/profile');
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-primary-900 px-4 py-8 sm:px-6">
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
              Start your care profile
            </span>
            <h1 className="mt-5 font-display text-4xl leading-tight tracking-tight text-cream-100">
              Build your
              <br />
              <span className="italic text-accent-500">
                health rhythm.
              </span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-primary-200">
              Create your account first. Then complete your health profile
              so AcuCare can build a more personalized experience.
            </p>
          </div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-3 text-sm text-primary-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-accent-500">
                <UserRound className="h-4 w-4" />
              </div>
              <span>Create your account</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-primary-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-accent-500">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span>Complete health profile</span>
            </div>
          </div>
        </div>

        {/* FORM PANEL */}
        <div className="flex items-center bg-cream-100 p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            {/* MOBILE BRAND */}
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-900 text-accent-500">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-semibold text-ink-900">
                AcuCare
              </span>
            </div>

            {/* HEADER */}
            <div className="mb-7">
              <p className="acu-mono text-[9px] uppercase tracking-[0.16em] text-primary-600">
                New account
              </p>
              <h2 className="mt-2 font-display text-4xl leading-tight text-ink-900">
                Begin your
                <span className="block italic text-accent-500">
                  care journey.
                </span>
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink-500">
                Create your account. Health details come next.
              </p>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mb-5 rounded-xl border border-accent-500/20 bg-accent-50 px-4 py-3 text-sm text-accent-700">
                {error}
              </div>
            )}

            {/* FORM — Icons removed inside inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="acu-mono mb-2 block text-[9px] uppercase tracking-[0.13em] text-ink-500"
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="acu-input px-4"
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="acu-input px-4"
                  placeholder="@example.com"
                  autoComplete="email"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="acu-mono mb-2 block text-[9px] uppercase tracking-[0.13em] text-ink-500"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="acu-input px-4"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="acu-mono mb-2 block text-[9px] uppercase tracking-[0.13em] text-ink-500"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="acu-input px-4"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="acu-button mt-2 w-full"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* NEXT STEP */}
            <div className="mt-5 flex gap-3 rounded-xl border border-primary-500/15 bg-primary-50 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
              <p className="text-xs leading-5 text-primary-700">
                After registration, you'll complete your health profile
                with relevant health information.
              </p>
            </div>

            {/* LOGIN */}
            <div className="mt-6 border-t border-ink-900/10 pt-6 text-center">
              <p className="text-sm text-ink-500">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-accent-600 transition-colors hover:text-accent-700"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;