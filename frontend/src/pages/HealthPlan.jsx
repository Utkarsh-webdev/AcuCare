import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Utensils,
  Pill,
  Moon,
  Clock,
  AlertCircle,
  HeartPulse,
  Droplets
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const HealthPlan = () => {
  const { user } = useAuth();

  const [healthPlan, setHealthPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHealthPlan();
    }
  }, [user]);

  const getUserId = () => {
    return user?._id || user?.id;
  };

  // =====================================================
  // GET HEALTH PLAN
  // =====================================================

  const fetchHealthPlan = async () => {
    try {
      setLoading(true);

      const userId = getUserId();

      if (!userId) {
        console.error('User ID missing');
        return;
      }

      const response = await api.get(
        `/api/health/plan/${userId}`
      );

      setHealthPlan(
        response.data.healthPlan || response.data
      );

    } catch (error) {
      console.error(
        'Fetch health plan error:',
        error.response?.status,
        error.response?.data || error.message
      );

      if (error.response?.status === 404) {
        setHealthPlan(null);
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('You are not authorized for this plan.');
      } else {
        toast.error('Failed to load health plan');
      }

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GENERATE HEALTH PLAN
  // =====================================================

  const handleGeneratePlan = async () => {
    try {
      setGenerating(true);

      const userId = getUserId();

      if (!userId) {
        toast.error('User information unavailable');
        return;
      }

      console.log('Generating plan for:', userId);

      const token = localStorage.getItem('token');

      console.log(
        'Token exists:',
        Boolean(token)
      );

      const response = await api.post(
        `/api/health/generate-plan/${userId}`
      );

      console.log(
        'Health plan generated:',
        response.data
      );

      setHealthPlan(
        response.data.healthPlan
      );

      toast.success(
        'Health plan generated successfully'
      );

    } catch (error) {
      console.error(
        'Generate health plan error:',
        error.response?.status,
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        toast.error(
          'Authentication failed. Please login again.'
        );
      } else if (error.response?.status === 403) {
        toast.error(
          'You are not authorized to generate this plan.'
        );
      } else {
        toast.error(
          error.response?.data?.message ||
          'Failed to generate health plan'
        );
      }

    } finally {
      setGenerating(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-accent-500" />
      </div>
    );
  }

  // =====================================================
  // EMPTY STATE
  // =====================================================

  if (!healthPlan) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4">

        <div className="acu-card-dark w-full overflow-hidden text-center">

          <div className="px-6 py-12 sm:px-12">

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-accent-600">
              <HeartPulse className="h-8 w-8" />
            </div>

            <p className="acu-mono text-[10px] uppercase tracking-[0.15em] text-primary-300">
              Personalized care
            </p>

            <h1 className="mt-3 text-4xl text-cream-100">
              Your plan starts here.
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-primary-200">
              Generate your personalized health plan
              to receive nutrition, lifestyle and
              daily-care recommendations.
            </p>

            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={generating}
              className="acu-button mt-7"
            >
              {generating
                ? 'Generating...'
                : 'Generate health plan'}

              {!generating && (
                <span>›</span>
              )}
            </button>

          </div>

          <div className="border-t border-white/10 px-6 py-4">
            <p className="text-xs text-primary-300">
              Recommendations are generated from your health profile.
            </p>
          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // PLAN
  // =====================================================

  return (
    <div className="acu-page">

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        <div className="acu-dashboard-header">

          <p className="acu-stat-label text-primary-300">
            Personalized care
          </p>

          <h1 className="mt-2 text-4xl text-cream-100">
            Your Health Plan
          </h1>

          <p className="mt-2 text-sm text-primary-200">
            Personalized recommendations based on your
            health profile.
          </p>

        </div>

        {healthPlan.conditionsHandled?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {healthPlan.conditionsHandled.map(
              (condition, index) => (
                <span
                  key={index}
                  className="acu-badge acu-badge-coral"
                >
                  {condition}
                </span>
              )
            )}
          </div>
        )}

        {/* Dietary Plan */}

        <section className="acu-card mt-5 p-6">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-primary-100 p-2 text-primary-600">
              <Utensils className="h-5 w-5" />
            </div>

            <h2 className="text-2xl text-ink-900">
              Dietary Plan
            </h2>

          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">

            {[
              ['Breakfast', healthPlan.dietaryPlan?.breakfast],
              ['Lunch', healthPlan.dietaryPlan?.lunch],
              ['Dinner', healthPlan.dietaryPlan?.dinner],
              ['Snacks', healthPlan.dietaryPlan?.snacks]
            ].map(([title, items]) =>
              items?.length > 0 ? (
                <div key={title}>

                  <p className="acu-stat-label">
                    {title}
                  </p>

                  <ul className="mt-3 space-y-2">

                    {items.map((item, index) => (
                      <li
                        key={index}
                        className="text-sm leading-6 text-ink-700"
                      >
                        <span className="mr-2 text-accent-500">
                          •
                        </span>
                        {item}
                      </li>
                    ))}

                  </ul>

                </div>
              ) : null
            )}

          </div>

          {healthPlan.dietaryPlan?.fluidIntake && (
            <div className="mt-6 rounded-xl bg-primary-50 p-4">

              <div className="flex gap-3">

                <Droplets className="h-5 w-5 text-primary-500" />

                <div>

                  <p className="font-semibold text-ink-900">
                    Fluid Intake
                  </p>

                  <p className="mt-1 text-sm text-ink-700">
                    {healthPlan.dietaryPlan.fluidIntake.recommended}
                  </p>

                  {healthPlan.dietaryPlan.fluidIntake.details && (
                    <p className="mt-1 text-xs text-ink-500">
                      {healthPlan.dietaryPlan.fluidIntake.details}
                    </p>
                  )}

                </div>

              </div>

            </div>
          )}

        </section>

        {/* Medication */}

        {healthPlan.medicationSchedule?.length > 0 && (
          <section className="acu-card mt-5 p-6">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-accent-100 p-2 text-accent-600">
                <Pill className="h-5 w-5" />
              </div>

              <h2 className="text-2xl text-ink-900">
                Medication Schedule
              </h2>

            </div>

            <div className="mt-6 space-y-3">

              {healthPlan.medicationSchedule.map(
                (medication, index) => (

                  <div
                    key={index}
                    className="rounded-xl bg-cream-50 p-4"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="font-semibold text-ink-900">
                          {medication.medicineName}
                        </p>

                        <p className="mt-1 text-sm text-ink-500">
                          {medication.dosage}
                        </p>

                        {medication.instructions && (
                          <p className="mt-2 text-xs text-ink-500">
                            {medication.instructions}
                          </p>
                        )}

                      </div>

                      <div className="acu-mono flex items-center gap-1 text-[10px] text-ink-500">
                        <Clock className="h-3 w-3" />
                        {medication.timing}
                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>
        )}

        {/* Lifestyle */}

        {healthPlan.lifestyleSuggestions?.length > 0 && (
          <section className="acu-card mt-5 p-6">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-primary-100 p-2 text-primary-600">
                <Moon className="h-5 w-5" />
              </div>

              <h2 className="text-2xl text-ink-900">
                Lifestyle Suggestions
              </h2>

            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              {healthPlan.lifestyleSuggestions.map(
                (suggestion, index) => (

                  <div
                    key={index}
                    className="rounded-xl bg-cream-50 p-4"
                  >

                    <span className="acu-badge acu-badge-green">
                      {suggestion.category}
                    </span>

                    <h3 className="mt-3 font-semibold text-ink-900">
                      {suggestion.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-ink-500">
                      {suggestion.description}
                    </p>

                  </div>

                )
              )}

            </div>

          </section>
        )}

        {/* Disclaimer */}

        <div className="mt-5 rounded-xl border border-accent-200 bg-accent-50 p-4">

          <p className="text-xs leading-5 text-accent-700">
            AI-generated health recommendations are for
            informational purposes only. Consult qualified
            healthcare professionals before making medical
            decisions.
          </p>

        </div>

      </div>

    </div>
  );
};

export default HealthPlan;