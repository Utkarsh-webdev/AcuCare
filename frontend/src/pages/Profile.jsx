
// frontend/src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

import {
  User,
  Edit2,
  Save,
  X,
  Activity,
  Heart,
  Ruler,
  Droplets,
  AlertCircle,
  ShieldCheck,
  Scale,
  ChevronRight
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isHealthInfoEditing, setIsHealthInfoEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    height: '',
    weight: '',
    gender: 'Male',
    medicalConditions: [],
    dietType: 'Omnivore',
    allergies: []
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        height: user.height || '',
        weight: user.weight || '',
        gender: user.gender || 'Male',
        medicalConditions: user.medicalConditions || [],
        dietType: user.dietType || 'Omnivore',
        allergies: user.allergies || []
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (e) => {
    const { name, value } = e.target;

    const array = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item);

    setFormData((prev) => ({
      ...prev,
      [name]: array
    }));
  };

  const resetForm = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      age: user.age || '',
      height: user.height || '',
      weight: user.weight || '',
      gender: user.gender || 'Male',
      medicalConditions: user.medicalConditions || [],
      dietType: user.dietType || 'Omnivore',
      allergies: user.allergies || []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await axios.put(
        '/api/users/profile',
        formData
      );

      updateUser(response.data.user);

      toast.success('Profile updated successfully!');

      setIsEditing(false);
      setIsHealthInfoEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const editingNow = isEditing || isHealthInfoEditing;

  const statsSource = editingNow ? formData : user;

  const calculateBMI = (height, weight) => {
    if (height && weight) {
      const heightInMeters = height / 100;

      return (
        weight /
        (heightInMeters * heightInMeters)
      ).toFixed(1);
    }

    return null;
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#b7c3bd]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#35574f] border-t-[#ef5937]" />
          <span className="font-mono text-xs uppercase tracking-wider">
            Loading profile
          </span>
        </div>
      </div>
    );
  }

  const bmi = calculateBMI(
    statsSource.height,
    statsSource.weight
  );

  const stats = [
    {
      label: 'Age',
      value: statsSource.age
        ? `${statsSource.age} yrs`
        : '—',
      icon: Activity
    },
    {
      label: 'BMI',
      value: bmi || '—',
      icon: Heart
    },
    {
      label: 'Weight',
      value: statsSource.weight
        ? `${statsSource.weight} kg`
        : '—',
      icon: Scale
    },
    {
      label: 'Height',
      value: statsSource.height
        ? `${statsSource.height} cm`
        : '—',
      icon: Ruler
    }
  ];

  const inputClass =
    'w-full min-h-[46px] rounded-[10px] border border-[#d8cdbb] bg-[#fffaf1] px-4 py-2.5 text-sm text-[#132521] outline-none transition focus:border-[#3f7164] focus:ring-4 focus:ring-[#3f7164]/10 disabled:cursor-not-allowed disabled:bg-[#eee4d3] disabled:text-[#96978e]';

  const labelClass =
    'mb-2 block font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#77756e]';

  return (
    <div className="acu-page mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <section className="mb-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-8 rounded-full bg-[#ef5937]" />

              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8fa39b]">
                Account / Profile
              </span>
            </div>

            <h1 className="font-serif text-4xl font-semibold tracking-[-0.04em] text-[#f8f0e2] sm:text-5xl">
              Your health,
              <span className="italic text-[#ef5937]">
                {' '}your data.
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#aebbb5]">
              Keep your personal details and health information
              up to date for more relevant AcuCare recommendations.
            </p>
          </div>

          {!editingNow && (
            <button
              onClick={() => setIsEditing(true)}
              className="acu-button self-start sm:self-auto"
            >
              <Edit2 className="h-4 w-4" />
              Edit profile
            </button>
          )}
        </div>
      </section>

      {/* =========================================
          PROFILE IDENTITY
      ========================================= */}

      <section className="mb-5 overflow-hidden rounded-2xl border border-[#f5eee1]/10 bg-[#102d29]">

        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#f8f0e2] text-[#0b2623]">
            <User className="h-7 w-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-2xl text-[#f8f0e2]">
                {user.name || 'Your profile'}
              </h2>

              <span className="acu-badge acu-badge-green">
                <ShieldCheck className="h-3 w-3" />
                Account active
              </span>
            </div>

            <p className="mt-1 truncate text-sm text-[#9eafa8]">
              {user.email}
            </p>
          </div>

          <div className="hidden text-right sm:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#71847d]">
              Profile status
            </p>

            <p className="mt-1 text-sm font-medium text-[#dbe6df]">
              {(!user.age ||
                !user.height ||
                !user.weight ||
                !user.dietType)
                ? 'Incomplete'
                : 'Complete'}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          QUICK STATS
      ========================================= */}

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="acu-stat-card"
          >
            <div className="flex items-center justify-between">
              <span className="acu-stat-label">
                {label}
              </span>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b2623] text-[#ef5937]">
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <p className="acu-stat-value">
              {value}
            </p>

            {label === 'BMI' && bmi && (
              <p className="acu-stat-meta">
                Body mass index
              </p>
            )}
          </div>
        ))}

      </section>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      {!editingNow ? (

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">

          {/* PERSONAL INFORMATION */}

          <section className="acu-card p-6 sm:p-7">

            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="acu-stat-label">
                  Personal
                </p>

                <h3 className="mt-1 font-serif text-2xl">
                  Personal information
                </h3>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b2623] text-[#f8f0e2]">
                <User className="h-4 w-4" />
              </div>
            </div>

            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8a8a80]">
                  Full name
                </p>

                <p className="mt-2 text-sm font-medium">
                  {user.name || 'Not specified'}
                </p>
              </div>

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8a8a80]">
                  Email address
                </p>

                <p className="mt-2 break-all text-sm font-medium">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8a8a80]">
                  Gender
                </p>

                <p className="mt-2 text-sm font-medium">
                  {user.gender || 'Not specified'}
                </p>
              </div>

            </div>
          </section>

          {/* HEALTH INFORMATION */}

          <section className="acu-card p-6 sm:p-7">

            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="acu-stat-label">
                  Wellness
                </p>

                <h3 className="mt-1 font-serif text-2xl">
                  Health information
                </h3>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b2623] text-[#ef5937]">
                <Heart className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-5">

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8a8a80]">
                  Diet
                </p>

                <p className="mt-2 text-sm font-medium">
                  {user.dietType || 'Not specified'}
                </p>
              </div>

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8a8a80]">
                  Medical conditions
                </p>

                <div className="mt-2 flex flex-wrap gap-2">

                  {user.medicalConditions?.length > 0 ? (

                    user.medicalConditions.map(
                      (condition, index) => (
                        <span
                          key={index}
                          className="acu-badge acu-badge-green"
                        >
                          {condition}
                        </span>
                      )
                    )

                  ) : (

                    <span className="text-sm text-[#92938a]">
                      None reported
                    </span>

                  )}

                </div>
              </div>

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8a8a80]">
                  Allergies
                </p>

                <div className="mt-2 flex flex-wrap gap-2">

                  {user.allergies?.length > 0 ? (

                    user.allergies.map(
                      (allergy, index) => (
                        <span
                          key={index}
                          className="acu-badge acu-badge-coral"
                        >
                          {allergy}
                        </span>
                      )
                    )

                  ) : (

                    <span className="text-sm text-[#92938a]">
                      None reported
                    </span>

                  )}

                </div>
              </div>

            </div>
          </section>

        </div>

      ) : (

        /* =========================================
           EDIT MODE
        ========================================= */

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* PERSONAL */}

          <section className="acu-card p-6 sm:p-7">

            <div className="mb-7">
              <p className="acu-stat-label">
                Step 01
              </p>

              <h3 className="mt-1 font-serif text-2xl">
                Personal information
              </h3>

              <p className="mt-2 text-sm text-[#77756e]">
                Basic information used to personalize your experience.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className={labelClass}>
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className={inputClass}
                />

                <p className="mt-2 text-[11px] text-[#8a8a80]">
                  Email address cannot be changed here.
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  Gender
                </label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

            </div>

          </section>

          {/* HEALTH */}

          <section className="acu-card p-6 sm:p-7">

            <div className="mb-7">
              <p className="acu-stat-label">
                Step 02
              </p>

              <h3 className="mt-1 font-serif text-2xl">
                Health information
              </h3>

              <p className="mt-2 text-sm text-[#77756e]">
                These details help AcuCare personalize health guidance.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className={labelClass}>
                  Age
                </label>

                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={inputClass}
                  min="1"
                  max="150"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Height · cm
                </label>

                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className={inputClass}
                  min="50"
                  max="300"
                  step="0.1"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Weight · kg
                </label>

                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className={inputClass}
                  min="1"
                  max="500"
                  step="0.1"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Diet type
                </label>

                <select
                  name="dietType"
                  value={formData.dietType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Omnivore">Omnivore</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Keto">Keto</option>
                  <option value="Paleo">Paleo</option>
                  <option value="Mediterranean">
                    Mediterranean
                  </option>
                  <option value="Diabetic-Friendly">
                    Diabetic-Friendly
                  </option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Medical conditions
                </label>

                <input
                  type="text"
                  name="medicalConditions"
                  value={formData.medicalConditions.join(', ')}
                  onChange={handleArrayChange}
                  placeholder="Type 2 Diabetes, Hypertension"
                  className={inputClass}
                />

                <p className="mt-2 text-[11px] text-[#8a8a80]">
                  Separate multiple conditions with commas.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Allergies
                </label>

                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies.join(', ')}
                  onChange={handleArrayChange}
                  placeholder="Peanuts, Shellfish"
                  className={inputClass}
                />

                <p className="mt-2 text-[11px] text-[#8a8a80]">
                  Separate multiple allergies with commas.
                </p>
              </div>

            </div>

          </section>

          {/* ACTION BAR */}

          <section className="flex flex-col gap-3 rounded-2xl border border-[#f5eee1]/10 bg-[#102d29] p-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-medium text-[#f8f0e2]">
                Ready to save?
              </p>

              <p className="mt-1 text-xs text-[#8fa39b]">
                Your updated information will be used for personalization.
              </p>
            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setIsHealthInfoEditing(false);
                  resetForm();
                }}
                className="acu-button-outline"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="acu-button"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving…' : 'Save changes'}
              </button>

            </div>

          </section>

        </form>
      )}

      {/* =========================================
          PROFILE COMPLETION
      ========================================= */}

      {!editingNow &&
        (!user.age ||
          !user.height ||
          !user.weight ||
          !user.dietType) && (

          <section className="mt-5 overflow-hidden rounded-2xl border border-[#ef5937]/20 bg-[#f8e7df]">

            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

              <div className="flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0b2623] text-[#ef5937]">
                  <AlertCircle className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#a94832]">
                    Profile incomplete
                  </p>

                  <h3 className="mt-1 font-serif text-xl text-[#132521]">
                    Complete your health profile
                  </h3>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-[#6f625b]">
                    Add missing health details so AcuCare can
                    generate more personalized recommendations.
                  </p>
                </div>

              </div>

              <button
                onClick={() => setIsHealthInfoEditing(true)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[9px] bg-[#ef5937] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d94729]"
              >
                Add health info
                <ChevronRight className="h-4 w-4" />
              </button>

            </div>

          </section>
        )}

    </div>
  );
};

export default Profile;