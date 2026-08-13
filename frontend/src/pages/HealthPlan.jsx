// frontend/src/pages/HealthPlan.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Utensils,
  Pill,
  Dumbbell,
  Moon,
  Clock,
  AlertCircle,
  CheckCircle,
  Droplets,
  ShieldCheck,
  Leaf,
  HeartPulse,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const HealthPlan = () => {
  const { user } = useAuth();

  const [healthPlan, setHealthPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHealthPlan();
    }
  }, [user]);

  const fetchHealthPlan = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`/api/health/plan/${user.id}`);

      setHealthPlan(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setHealthPlan(null);
      } else {
        toast.error('Failed to load health plan');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategoryStyle = (category) => {
    const styles = {
      Exercise: 'bg-[#e2eee8] text-[#285b4d]',
      Sleep: 'bg-[#e8e6ef] text-[#55516d]',
      'Stress Management': 'bg-[#f8e8d9] text-[#99633f]',
      Other: 'bg-[#e9e7df] text-[#66665e]',
    };

    return styles[category] || styles.Other;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#aebbb5]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#35574f] border-t-[#ef5937]" />
          <span className="acu-mono text-[10px] uppercase tracking-[0.14em]">
            Preparing your health plan
          </span>
        </div>
      </div>
    );
  }

  if (!healthPlan) {
    return (
      <div className="acu-page mx-auto flex min-h-[75vh] w-full max-w-5xl items-center justify-center px-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#f5eee1]/10 bg-[#102d29]">
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#f8e7df] text-[#ef5937]">
              <HeartPulse className="h-7 w-7" />
            </div>
            <p className="acu-mono text-[10px] uppercase tracking-[0.16em] text-[#8fa39b]">
              Personalized care
            </p>
            <h1 className="mt-3 font-serif text-4xl text-[#f8f0e2]">
              Your plan starts here.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#9eafa8]">
              Generate your personalized health plan to receive
              nutrition, lifestyle and daily-care recommendations.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="acu-button mt-7"
            >
              Generate health plan
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="border-t border-[#f5eee1]/10 px-6 py-4 text-center">
            <p className="text-[11px] text-[#71847d]">
              Recommendations are generated from your health profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const meals = [
    {
      key: 'breakfast',
      label: 'Breakfast',
      items: healthPlan.dietaryPlan?.breakfast,
      icon: Utensils,
      accent: '#ef5937',
    },
    {
      key: 'lunch',
      label: 'Lunch',
      items: healthPlan.dietaryPlan?.lunch,
      icon: Leaf,
      accent: '#3f7164',
    },
    {
      key: 'dinner',
      label: 'Dinner',
      items: healthPlan.dietaryPlan?.dinner,
      icon: Moon,
      accent: '#55516d',
    },
    {
      key: 'snacks',
      label: 'Snacks',
      items: healthPlan.dietaryPlan?.snacks,
      icon: CheckCircle,
      accent: '#99633f',
    },
  ];

  return (
    <div className="acu-page mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* =========================================
          HEADER
      ========================================= */}
      <section className="acu-dashboard-header mb-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-8 rounded-full bg-[#ef5937]" />
              <span className="acu-mono text-[10px] uppercase tracking-[0.16em] text-[#8fa39b]">
                Personalized care plan
              </span>
            </div>
            <h1 className="acu-display text-4xl text-[#f8f0e2] sm:text-5xl">
              Your health,
              <span className="italic text-[#ef5937]"> mapped out.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#aebbb5]">
              A personalized set of nutrition, medication and
              lifestyle recommendations based on your health profile.
            </p>
          </div>
          <div className="rounded-xl border border-[#f5eee1]/10 bg-[#102d29] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f0e2] text-[#0b2623]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="acu-mono text-[9px] uppercase tracking-[0.13em] text-[#71847d]">
                  Plan status
                </p>
                <p className="mt-1 text-sm font-medium text-[#f8f0e2]">
                  Personalized
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conditions */}
        {healthPlan.conditionsHandled?.length > 0 && (
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="mr-1 acu-mono text-[9px] uppercase tracking-[0.12em] text-[#71847d]">
              Built around
            </span>
            {healthPlan.conditionsHandled.map((condition, index) => (
              <span key={index} className="acu-badge acu-badge-green">
                {condition}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* =========================================
          OVERVIEW STRIP
      ========================================= */}
      <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="acu-stat-card">
          <span className="acu-stat-label">Meals</span>
          <p className="acu-stat-value">
            {meals.filter((meal) => meal.items?.length > 0).length}
          </p>
          <p className="acu-stat-meta">meal sections</p>
        </div>
        <div className="acu-stat-card">
          <span className="acu-stat-label">Medication</span>
          <p className="acu-stat-value">
            {healthPlan.medicationSchedule?.length || 0}
          </p>
          <p className="acu-stat-meta">scheduled items</p>
        </div>
        <div className="acu-stat-card">
          <span className="acu-stat-label">Lifestyle</span>
          <p className="acu-stat-value">
            {healthPlan.lifestyleSuggestions?.length || 0}
          </p>
          <p className="acu-stat-meta">suggestions</p>
        </div>
        <div className="acu-stat-card">
          <span className="acu-stat-label">Hydration</span>
          <p className="acu-stat-value text-[22px]">
            {healthPlan.dietaryPlan?.fluidIntake?.recommended || '—'}
          </p>
          <p className="acu-stat-meta">daily target</p>
        </div>
      </section>

      {/* =========================================
          DIETARY PLAN
      ========================================= */}
      <section className="acu-card mb-5 overflow-hidden">
        <div className="border-b border-[#132521]/10 p-6 sm:p-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="acu-stat-label">Nutrition</p>
              <h2 className="mt-1 font-serif text-2xl">Dietary plan</h2>
              <p className="mt-2 text-sm text-[#77756e]">
                Suggested meals aligned with your health profile.
              </p>
            </div>
            <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#0b2623] text-[#ef5937] sm:flex">
              <Utensils className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-[#d9d0c0] md:grid-cols-2">
          {meals.map((meal) => {
            if (!meal.items?.length) {
              return null;
            }
            const Icon = meal.icon;
            return (
              <div key={meal.key} className="bg-[#f8f0e2] p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b2623] text-[#f8f0e2]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="acu-mono text-[9px] uppercase tracking-[0.13em] text-[#77756e]">
                        Meal
                      </p>
                      <h3 className="font-serif text-xl">{meal.label}</h3>
                    </div>
                  </div>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: meal.accent }}
                  />
                </div>
                <ul className="space-y-3">
                  {meal.items.map((item, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-sm leading-6 text-[#454841]"
                    >
                      <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef5937]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Hydration */}
        {healthPlan.dietaryPlan?.fluidIntake && (
          <div className="border-t border-[#132521]/10 bg-[#e6eee9] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0b2623] text-[#8fc2b0]">
                  <Droplets className="h-5 w-5" />
                </div>
                <div>
                  <p className="acu-stat-label">Hydration</p>
                  <h3 className="mt-1 font-serif text-xl text-[#132521]">
                    {healthPlan.dietaryPlan.fluidIntake.recommended}
                  </h3>
                  {healthPlan.dietaryPlan.fluidIntake.details && (
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-[#66746d]">
                      {healthPlan.dietaryPlan.fluidIntake.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restrictions */}
        {healthPlan.dietaryPlan?.restrictions?.length > 0 && (
          <div className="border-t border-[#132521]/10 bg-[#f8e7df] p-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b2623] text-[#ef5937]">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="acu-mono text-[9px] uppercase tracking-[0.13em] text-[#a94832]">
                  Dietary attention
                </p>
                <h3 className="mt-1 font-serif text-xl text-[#132521]">
                  Restrictions
                </h3>
                <ul className="mt-3 space-y-2">
                  {healthPlan.dietaryPlan.restrictions.map((restriction, index) => (
                    <li
                      key={index}
                      className="flex gap-2 text-sm leading-6 text-[#6f625b]"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef5937]" />
                      {restriction}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================
          MEDICATION
      ========================================= */}
      {healthPlan.medicationSchedule?.length > 0 && (
        <section className="acu-card mb-5 overflow-hidden">
          <div className="border-b border-[#132521]/10 p-6 sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="acu-stat-label">Medication</p>
                <h2 className="mt-1 font-serif text-2xl">Medication schedule</h2>
                <p className="mt-2 text-sm text-[#77756e]">
                  Scheduled medication information from your generated plan.
                </p>
              </div>
              <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#0b2623] text-[#ef5937] sm:flex">
                <Pill className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div>
            {healthPlan.medicationSchedule.map((med, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 border-b border-[#132521]/10 p-6 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-4">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9eee9] text-[#2d5c51]">
                    <Pill className="h-4 w-4" />
                    {index < healthPlan.medicationSchedule.length - 1 && (
                      <span className="absolute left-1/2 top-10 hidden h-8 w-px bg-[#d8d1c5] sm:block" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-[#132521]">
                      {med.medicineName}
                    </h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#77756e]">
                      {med.dosage}
                    </p>
                    {med.instructions && (
                      <p className="mt-2 max-w-xl text-sm leading-6 text-[#77756e]">
                        {med.instructions}
                      </p>
                    )}
                    {med.alternate && (
                      <p className="mt-2 text-xs text-[#77756e]">
                        Alternative: {med.alternate}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-lg bg-[#eee4d3] px-3 py-2 text-xs font-medium text-[#454841]">
                  <Clock className="h-3.5 w-3.5 text-[#ef5937]" />
                  {med.timing}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================
          LIFESTYLE
      ========================================= */}
      {healthPlan.lifestyleSuggestions?.length > 0 && (
        <section className="acu-card mb-5 overflow-hidden">
          <div className="border-b border-[#132521]/10 p-6 sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="acu-stat-label">Daily rhythm</p>
                <h2 className="mt-1 font-serif text-2xl">Lifestyle suggestions</h2>
                <p className="mt-2 text-sm text-[#77756e]">
                  Practical habits to support your overall routine.
                </p>
              </div>
              <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#0b2623] text-[#f8f0e2] sm:flex">
                <Dumbbell className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="grid gap-px bg-[#d9d0c0] md:grid-cols-2">
            {healthPlan.lifestyleSuggestions.map((suggestion, index) => (
              <article
                key={index}
                className="bg-[#f8f0e2] p-6 transition-colors hover:bg-[#fffaf1]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`acu-badge ${getCategoryStyle(suggestion.category)}`}
                  >
                    {suggestion.category}
                  </span>
                  <span className="acu-mono text-[9px] text-[#aaa79d]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-xl text-[#132521]">
                  {suggestion.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#77756e]">
                  {suggestion.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* =========================================
          DISCLAIMER
      ========================================= */}
      <section className="mb-5 overflow-hidden rounded-2xl border border-[#ef5937]/20 bg-[#f8e7df]">
        <div className="flex gap-4 p-5 sm:p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b2623] text-[#ef5937]">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="acu-mono text-[9px] uppercase tracking-[0.14em] text-[#a94832]">
              Important
            </p>
            <h3 className="mt-1 font-serif text-xl text-[#132521]">
              Medical disclaimer
            </h3>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-[#6f625b]">
              This health plan is generated by AI and is for
              informational purposes only. Always consult with
              a qualified healthcare professional before making
              health or medication decisions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HealthPlan;