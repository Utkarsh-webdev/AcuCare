// frontend/src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Clock,
  Droplets,
  Ruler,
  Sparkles,
  ArrowRight,
  Check,
  CalendarDays,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ProgressRing from '../components/ProgressRing';

const Dashboard = () => {
  const { user } = useAuth();

  const [todayTracker, setTodayTracker] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [healthPlan, setHealthPlan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [trackerRes, statsRes, planRes] = await Promise.all([
        api.get('/api/health/tracker/today'),

        api.get('/api/health/stats/weekly'),

        api.get('/api/health/plan').catch((error) => {
          if (error.response?.status === 404) {
            return { data: null };
          }

          throw error;
        })
      ]);

      setTodayTracker(trackerRes.data);
      setWeeklyStats(statsRes.data);
      setHealthPlan(planRes.data);

    } catch (error) {
      console.error(
        'Failed to fetch dashboard data:',
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        'Failed to load dashboard data'
      );

    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId, isCompleted) => {
    try {
      await api.put(`/api/health/tracker/task/${taskId}`, {
        isCompleted: !isCompleted
      });

      await fetchDashboardData();

      toast.success(
        isCompleted
          ? 'Task marked as pending'
          : 'Task completed'
      );

    } catch (error) {
      console.error(
        'Task update error:',
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        'Failed to update task'
      );
    }
  };

  const handleGeneratePlan = async () => {
    if (generatingPlan) return;

    try {
      setGeneratingPlan(true);

      const loadingToast = toast.loading(
        'Generating personalized health plan...'
      );

      await api.post('/api/health/generate-plan');

      toast.dismiss(loadingToast);

      toast.success(
        'Health plan generated successfully!'
      );

      await fetchDashboardData();

    } catch (error) {
      console.error(
        'Generate health plan error:',
        error.response?.data || error.message
      );

      toast.dismiss();

      toast.error(
        error.response?.data?.message ||
        'Failed to generate health plan'
      );

    } finally {
      setGeneratingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="acu-page flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">

          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-primary-500/20" />

            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent-500" />
          </div>

          <p className="acu-mono text-[10px] uppercase tracking-[0.14em] text-primary-300">
            Loading health data
          </p>

        </div>
      </div>
    );
  }

  const totalTasks = todayTracker?.totalTasks || 0;
  const completedTasks = todayTracker?.completedTasks || 0;

  const completionRate =
    totalTasks > 0
      ? (completedTasks / totalTasks) * 100
      : 0;

  const averageCompletion =
    weeklyStats?.completionRates?.length
      ? Math.round(
          weeklyStats.completionRates.reduce(
            (sum, value) => sum + value,
            0
          ) / weeklyStats.completionRates.length
        )
      : 0;

  return (
    <div className="acu-page">

      <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">

        {/* =========================
            HEADER
        ========================= */}

        <section className="acu-dashboard-header">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <span className="acu-badge acu-badge-coral">
                  <CalendarDays className="h-3 w-3" />

                  TODAY
                </span>

                <span className="acu-mono text-[9px] uppercase tracking-[0.12em] text-primary-300">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>

              </div>

              <h1 className="acu-display text-3xl text-cream-100 sm:text-4xl lg:text-5xl">

                Welcome back,
                <span className="ml-2 italic text-accent-500">
                  {user?.name || 'there'}.
                </span>

              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-primary-200">
                Here's your health summary for today.
                Keep small habits moving forward.
              </p>

            </div>

            {!healthPlan && (
              <button
                onClick={handleGeneratePlan}
                disabled={generatingPlan}
                className="acu-button"
              >
                <Sparkles className="h-4 w-4" />

                {generatingPlan
                  ? 'Generating...'
                  : 'Generate Health Plan'}
              </button>
            )}

          </div>

          {/* Pulse line */}

          <div className="mt-7 flex items-center gap-3">

            <div className="h-px flex-1 bg-cream-100/10" />

            <svg
              width="180"
              height="32"
              viewBox="0 0 180 32"
              fill="none"
              className="text-accent-500"
            >
              <path
                d="M0 16H48L57 16L64 8L70 25L77 3L84 22L91 16H125L132 16L139 8L146 24L153 4L160 22L167 16H180"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="h-px flex-1 bg-cream-100/10" />

          </div>

        </section>

        {/* =========================
            STATS
        ========================= */}

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          {/* Progress */}

          <div className="acu-stat-card">

            <div className="flex items-start justify-between">

              <div>

                <p className="acu-stat-label">
                  Today's progress
                </p>

                <p className="acu-stat-value">
                  {Math.round(completionRate)}%
                </p>

              </div>

              <div className="h-12 w-12">
                <ProgressRing
                  progress={completionRate}
                />
              </div>

            </div>

            <p className="acu-stat-meta">
              {completedTasks} of {totalTasks} tasks completed
            </p>

          </div>

          {/* Energy */}

          <div className="acu-stat-card">

            <div className="flex items-start justify-between">

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-accent-500">
                <Activity className="h-4 w-4" />
              </span>

              <span className="acu-stat-label">
                Energy
              </span>

            </div>

            <div className="mt-4 flex items-baseline gap-1">

              <span className="acu-stat-value">
                {todayTracker?.energyLevel || '-'}
              </span>

              <span className="acu-mono text-[10px] text-ink-500">
                /10
              </span>

            </div>

            <p className="acu-stat-meta">
              Daily energy level
            </p>

          </div>

          {/* Water */}

          <div className="acu-stat-card">

            <div className="flex items-start justify-between">

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <Droplets className="h-4 w-4" />
              </span>

              <span className="acu-stat-label">
                Water
              </span>

            </div>

            <div className="mt-4 flex items-baseline gap-1">

              <span className="acu-stat-value">
                {todayTracker?.waterIntake || 0}
              </span>

              <span className="acu-mono text-[10px] text-ink-500">
                glasses
              </span>

            </div>

            <p className="acu-stat-meta">
              Today's intake
            </p>

          </div>

          {/* BMI */}

          <div className="acu-stat-card">

            <div className="flex items-start justify-between">

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-ink-700">
                <Ruler className="h-4 w-4" />
              </span>

              <span className="acu-stat-label">
                BMI
              </span>

            </div>

            <div className="mt-4">

              <span className="acu-stat-value">
                {user?.bmi
                  ? Number(user.bmi).toFixed(1)
                  : '-'}
              </span>

            </div>

            <p className="acu-stat-meta">
              Current body index
            </p>

          </div>

        </section>

        {/* =========================
            TASKS
        ========================= */}

        <section className="mt-6">

          <div className="mb-3 flex items-end justify-between">

            <div>

              <p className="acu-stat-label text-primary-300">
                Daily routine
              </p>

              <h2 className="mt-1 text-2xl text-cream-100">
                Today's Tasks
              </h2>

            </div>

            <Link
              to="/daily-tracker"
              className="hidden items-center gap-1 text-xs font-semibold text-accent-400 transition-colors hover:text-accent-300 sm:flex"
            >
              Open tracker

              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

          </div>

          <div className="acu-task-card">

            {todayTracker?.tasks?.length > 0 ? (

              <div>

                {todayTracker.tasks.map((task) => (

                  <div
                    key={task.taskId}
                    className="acu-task-row group"
                  >

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleTask(
                          task.taskId,
                          task.isCompleted
                        )
                      }
                      aria-label={
                        task.isCompleted
                          ? 'Mark task not done'
                          : 'Mark task done'
                      }
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        task.isCompleted
                          ? 'border-primary-500 bg-primary-500 text-white'
                          : 'border-ink-300 bg-transparent hover:border-accent-500'
                      }`}
                    >
                      {task.isCompleted && (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <div className="min-w-0">

                      <p
                        className={`truncate text-sm font-medium ${
                          task.isCompleted
                            ? 'text-ink-300 line-through'
                            : 'text-ink-900'
                        }`}
                      >
                        {task.title}
                      </p>

                      <span className="acu-mono text-[9px] uppercase tracking-[0.08em] text-primary-600">
                        {task.category}
                      </span>

                    </div>

                    {task.scheduledTime && (

                      <div className="acu-task-time flex items-center gap-1">

                        <Clock className="h-3 w-3" />

                        {task.scheduledTime}

                      </div>

                    )}

                  </div>

                ))}

              </div>

            ) : (

              <div className="acu-empty">

                <div className="acu-empty-icon">
                  <Activity className="h-5 w-5" />
                </div>

                <h3 className="acu-empty-title">
                  No tasks yet
                </h3>

                <p className="acu-empty-text">
                  Generate your personalized health plan
                  to create today's routine.
                </p>

                {!healthPlan && (
                  <button
                    onClick={handleGeneratePlan}
                    disabled={generatingPlan}
                    className="acu-button mt-5"
                  >
                    <Sparkles className="h-4 w-4" />

                    {generatingPlan
                      ? 'Generating...'
                      : 'Generate plan'}
                  </button>
                )}

              </div>

            )}

          </div>

          <Link
            to="/daily-tracker"
            className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-accent-400 sm:hidden"
          >
            Open daily tracker

            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

        </section>

        {/* =========================
            WEEKLY OVERVIEW
        ========================= */}

        {weeklyStats?.dates?.length > 0 && (

          <section className="mt-6">

            <div className="mb-3 flex items-end justify-between">

              <div>

                <p className="acu-stat-label text-primary-300">
                  Recent activity
                </p>

                <h2 className="mt-1 text-2xl text-cream-100">
                  Weekly Overview
                </h2>

              </div>

              <TrendingUp className="h-5 w-5 text-primary-400" />

            </div>

            <div className="acu-card p-5 sm:p-6">

              {/* Chart */}

              <div className="flex h-48 items-end gap-2 sm:gap-4">

                {weeklyStats.dates.map((date, index) => {

                  const rate =
                    weeklyStats.completionRates?.[index] || 0;

                  const maxRate =
                    Math.max(
                      ...(weeklyStats.completionRates || [0])
                    );

                  const isBest =
                    rate === maxRate && rate > 0;

                  return (

                    <div
                      key={index}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >

                      <div className="flex w-full flex-1 items-end">

                        <div
                          className={`w-full rounded-t-md transition-all duration-500 ${
                            isBest
                              ? 'bg-accent-500'
                              : 'bg-primary-400'
                          }`}
                          style={{
                            height: `${Math.max(rate, 3)}%`
                          }}
                          title={`${Math.round(rate)}% completion`}
                        />

                      </div>

                      <span className="acu-mono mt-3 text-[9px] uppercase text-ink-500">
                        {new Date(date).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'short'
                          }
                        )}
                      </span>

                    </div>

                  );

                })}

              </div>

              {/* Summary */}

              <div className="mt-5 grid grid-cols-3 border-t border-ink-900/10 pt-5">

                <div>

                  <p className="acu-stat-label">
                    Completion
                  </p>

                  <p className="mt-1 font-display text-xl text-ink-900">
                    {averageCompletion}%
                  </p>

                </div>

                <div className="border-l border-ink-900/10 pl-4">

                  <p className="acu-stat-label">
                    Energy
                  </p>

                  <p className="mt-1 font-display text-xl text-ink-900">
                    {weeklyStats.averageEnergy || '-'}
                    <span className="acu-mono ml-1 text-[9px] text-ink-500">
                      /10
                    </span>
                  </p>

                </div>

                <div className="border-l border-ink-900/10 pl-4">

                  <p className="acu-stat-label">
                    Mood
                  </p>

                  <p className="mt-1 font-display text-xl text-ink-900">
                    {weeklyStats.averageMood || '-'}
                    <span className="acu-mono ml-1 text-[9px] text-ink-500">
                      /5
                    </span>
                  </p>

                </div>

              </div>

            </div>

          </section>

        )}

        {/* =========================
            HEALTH PLAN CTA
        ========================= */}

        {healthPlan && (

          <section className="mt-6">

            <div className="acu-card overflow-hidden">

              <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <ShieldCheck className="h-4 w-4" />
                    </span>

                    <span className="acu-stat-label">
                      Personalized care
                    </span>

                  </div>

                  <h2 className="mt-3 text-2xl text-ink-900">
                    Your health plan is ready.
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-ink-500">
                    Review your dietary recommendations,
                    medication schedule and lifestyle suggestions.
                  </p>

                </div>

                <Link
                  to="/health-plan"
                  className="acu-button"
                >
                  View health plan

                  <ArrowRight className="h-4 w-4" />
                </Link>

              </div>

            </div>

          </section>

        )}

        {/* =========================
            FOOTNOTE
        ========================= */}

        <div className="mt-8 flex items-start gap-2 border-t border-white/10 pt-5">

          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-400" />

          <p className="text-[10px] leading-5 text-primary-400">
            AcuCare provides health information for tracking
            and educational purposes. It does not replace
            professional medical advice.
          </p>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;