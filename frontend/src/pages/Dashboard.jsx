import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Activity,
  Droplets,
  Zap,
  Ruler,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  ListChecks,
  Sparkles,
  PartyPopper,
  CalendarDays,
} from 'lucide-react';

import api from '../api/axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tracker, setTracker] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingTask, setUpdatingTask] = useState(null);

  const userId = user?._id || user?.id;

  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      console.log('Dashboard user:', userId);
      console.log(
        'Dashboard token exists:',
        !!localStorage.getItem('token')
      );

      // --------------------------------------------------------
      // TODAY TRACKER
      // --------------------------------------------------------

      try {
        const trackerResponse = await api.get(
          `/api/health/tracker/today/${userId}`
        );

        console.log('Today tracker response:', trackerResponse.data);

        // Handle both response formats:
        // 1. { success: true, tracker: {...} }
        // 2. Raw tracker object { _id, userId, date, tasks, ... }
        const trackerData =
          trackerResponse.data?.tracker ??
          (trackerResponse.data?._id ? trackerResponse.data : null);

        if (trackerData) {
          setTracker(trackerData);
        } else {
          setTracker(null);
        }

      } catch (error) {
        console.error(
          'Tracker request failed:',
          error.response?.data || error.message
        );
        setTracker(null);
      }

      // --------------------------------------------------------
      // WEEKLY STATS
      // --------------------------------------------------------

      try {
        const weeklyResponse = await api.get(
          `/api/health/stats/weekly/${userId}`
        );

        console.log('Weekly stats response:', weeklyResponse.data);

        // Handle both response formats:
        // 1. { success: true, stats: {...} }
        // 2. Raw stats object { dates: [], completionRates: [], ... }
        const statsData =
          weeklyResponse.data?.stats ??
          (weeklyResponse.data?.dates ? weeklyResponse.data : null);

        if (statsData) {
          setWeeklyStats(statsData);
        } else {
          setWeeklyStats(null);
        }

      } catch (error) {
        console.error(
          'Weekly stats request failed:',
          error.response?.data || error.message
        );
        setWeeklyStats(null);
      }

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
  }, [userId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ============================================================
  // TOGGLE TASK
  // ============================================================

  const handleToggleTask = async (
    taskId,
    currentStatus
  ) => {
    if (!userId || !taskId) return;

    try {
      setUpdatingTask(taskId);

      const response = await api.put(
        `/api/health/tracker/task/${userId}/${taskId}`,
        {
          isCompleted: !currentStatus,
        }
      );

      console.log('Task update response:', response.data);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
          'Failed to update task'
        );
      }

      const updatedTask = response.data.task;
      const progress = response.data.progress;

      setTracker((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          tasks: previous.tasks.map((task) =>
            String(task.taskId) === String(taskId)
              ? {
                  ...task,
                  isCompleted: updatedTask.isCompleted,
                  completedAt: updatedTask.completedAt,
                }
              : task
          ),
          completedTasks: progress.completed,
          totalTasks: progress.total,
        };
      });

      toast.success(
        !currentStatus
          ? 'Task completed'
          : 'Task marked incomplete'
      );

      // Refresh weekly stats only
      try {
        const weeklyResponse = await api.get(
          `/api/health/stats/weekly/${userId}`
        );

        // Handle both response formats
        const statsData =
          weeklyResponse.data?.stats ??
          (weeklyResponse.data?.dates ? weeklyResponse.data : null);

        if (statsData) {
          setWeeklyStats(statsData);
        }

      } catch (error) {
        console.error(
          'Weekly refresh failed:',
          error.response?.data || error.message
        );
      }

    } catch (error) {
      console.error(
        'Failed to update task:',
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update task'
      );

    } finally {
      setUpdatingTask(null);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="acu-page min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Activity
            size={30}
            className="mx-auto mb-4 text-accent-500 animate-pulse"
          />

          <p className="acu-mono text-[9px] opacity-50">
            LOADING YOUR HEALTH DATA...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // VALUES
  // ============================================================

  const tasks = tracker?.tasks || [];
  const totalTasks = tracker?.totalTasks ?? tasks.length;
  const completedTasks = tracker?.completedTasks ??
    tasks.filter((task) => task.isCompleted).length;

  const completionRate = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const remainingTasks = Math.max(totalTasks - completedTasks, 0);
  const allTasksCompleted = totalTasks > 0 && completedTasks === totalTasks;

  const energy = tracker?.energyLevel ?? 0;
  const water = tracker?.waterIntake ?? 0;
  const bmi = user?.bmi ?? user?.BMI ?? '-';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="acu-page">
      {/* HEADER */}
      <section className="acu-dashboard-header">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="acu-mono text-[9px] text-accent-500 mb-3">
              CHART · TODAY ·{' '}
              {new Date()
                .toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
                .toUpperCase()}
            </div>

            <h1 className="acu-display text-4xl md:text-5xl">
              Welcome back,{' '}
              <span className="text-accent-500 italic">
                {user?.name || 'there'}
              </span>
            </h1>

            <p className="mt-2 text-sm opacity-60">
              Here's your health summary for today.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/health-plan')}
            className="acu-button hidden sm:flex"
          >
            Health Plan
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* STAT CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {/* PROGRESS */}
        <div className="acu-stat-card">
          <div className="acu-stat-label">
            Today's Progress
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="acu-stat-value">
                {completionRate}%
              </div>

              <div className="acu-stat-meta">
                {completedTasks} of {totalTasks} tasks completed
              </div>
            </div>

            <div className="relative w-12 h-12">
              <svg
                className="w-12 h-12 -rotate-90"
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#dfd2bd"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#ef5937"
                  strokeWidth="3"
                  strokeDasharray={`${completionRate} 100`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ENERGY */}
        <div className="acu-stat-card">
          <div className="acu-stat-label">
            Energy
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Zap size={17} className="text-accent-500" />
            <span className="acu-stat-value">
              {energy || '-'}
            </span>
            <span className="text-xs opacity-50">/10</span>
          </div>

          <div className="acu-stat-meta">
            Daily energy level
          </div>
        </div>

        {/* WATER */}
        <div className="acu-stat-card">
          <div className="acu-stat-label">
            Water
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Droplets size={17} className="text-primary-500" />
            <span className="acu-stat-value">
              {water}
            </span>
            <span className="text-xs opacity-50">glasses</span>
          </div>

          <div className="acu-stat-meta">
            Today's intake
          </div>
        </div>

        {/* BMI */}
        <div className="acu-stat-card">
          <div className="acu-stat-label">
            BMI
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Ruler size={17} className="text-primary-500" />
            <span className="acu-stat-value">
              {bmi}
            </span>
          </div>

          <div className="acu-stat-meta">
            Current body index
          </div>
        </div>
      </section>

      {/* TODAY'S ROUTINE */}
      <section className="acu-task-card mt-6 overflow-hidden">
        {/* HEADER */}
        <div className="p-5 border-b border-black/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ListChecks size={14} className="text-accent-500" />
                <span className="acu-mono text-[9px] text-primary-600">
                  DAILY ROUTINE
                </span>
              </div>

              <h2 className="acu-display text-2xl mt-1">
                Today's Tasks
              </h2>

              <p className="text-xs opacity-50 mt-1">
                Complete small actions to keep your health routine moving.
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="acu-mono text-[8px] opacity-40">
                {today.toUpperCase()}
              </div>

              <div className="text-xl font-semibold mt-1">
                {completedTasks}
                <span className="opacity-30">
                  /{totalTasks}
                </span>
              </div>
            </div>
          </div>

          {/* PROGRESS */}
          <div className="mt-5">
            <div className="flex justify-between mb-2">
              <span className="acu-mono text-[8px] opacity-40">
                DAILY PROGRESS
              </span>

              <span className="acu-mono text-[8px] text-accent-600">
                {completionRate}%
              </span>
            </div>

            <div className="h-2 bg-cream-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-500 rounded-full transition-all duration-500"
                style={{
                  width: `${completionRate}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* EMPTY */}
        {tasks.length === 0 && (
          <div className="acu-empty">
            <div className="acu-empty-icon">
              <Activity size={20} />
            </div>

            <h3 className="acu-empty-title">
              Your routine starts here
            </h3>

            <p className="acu-empty-text">
              Create today's personalized routine based on your health profile.
            </p>

            <button
              type="button"
              onClick={() => navigate('/health-plan')}
              className="acu-button mt-5"
            >
              Create Today's Routine
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* TASKS */}
        {tasks.length > 0 && (
          <div>
            {tasks.map((task, index) => {
              const isUpdating = updatingTask === task.taskId;

              return (
                <button
                  key={task.taskId}
                  type="button"
                  disabled={isUpdating}
                  onClick={() =>
                    handleToggleTask(task.taskId, task.isCompleted)
                  }
                  className={`
                    w-full
                    text-left
                    flex
                    items-center
                    gap-4
                    px-5
                    py-4
                    border-b
                    border-black/10
                    last:border-b-0
                    transition-all
                    duration-200
                    ${task.isCompleted ? 'bg-primary-50/60' : 'hover:bg-black/[0.025]'}
                    ${isUpdating ? 'opacity-50 cursor-wait' : ''}
                  `}
                >
                  {/* NUMBER */}
                  <div className="w-7 shrink-0">
                    <span
                      className={`
                        acu-mono text-[9px]
                        ${task.isCompleted ? 'opacity-30' : 'text-accent-600'}
                      `}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* CHECK */}
                  <div className="shrink-0">
                    {task.isCompleted ? (
                      <CheckCircle2 size={22} className="text-primary-500" />
                    ) : (
                      <Circle size={22} className="text-accent-500" />
                    )}
                  </div>

                  {/* TASK */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`
                        font-medium
                        ${task.isCompleted ? 'line-through opacity-35' : ''}
                      `}
                    >
                      {task.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {task.category && (
                        <span className="acu-badge acu-badge-green">
                          {task.category}
                        </span>
                      )}

                      {task.priority && (
                        <span
                          className={`
                            acu-badge
                            ${task.priority === 'High' ? 'acu-badge-coral' : 'acu-badge-green'}
                          `}
                        >
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* TIME */}
                  {task.scheduledTime && (
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1 acu-task-time">
                        <Clock3 size={11} />
                        {task.scheduledTime}
                      </div>

                      {task.isCompleted && (
                        <div className="text-[8px] text-primary-600 mt-1 acu-mono">
                          DONE
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* COMPLETE */}
        {allTasksCompleted && (
          <div className="p-5 bg-primary-50 border-t border-primary-100">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center">
                <PartyPopper size={19} className="text-accent-500" />
              </div>

              <div>
                <h3 className="acu-display text-xl text-primary-900">
                  Day complete.
                </h3>

                <p className="text-xs text-primary-700/70 mt-1">
                  You completed every task scheduled for today.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        {tasks.length > 0 && (
          <div className="px-5 py-4 border-t border-black/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-accent-500" />

              <span className="acu-mono text-[8px] opacity-50">
                {allTasksCompleted
                  ? 'ALL TASKS COMPLETE'
                  : `${remainingTasks} TASK${remainingTasks === 1 ? '' : 'S'} REMAINING`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/daily-tracker')}
              className="text-xs font-semibold text-accent-600 hover:text-accent-700 flex items-center gap-1"
            >
              Open Daily Tracker
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </section>

      {/* DAILY CHECK-IN */}
      {tasks.length > 0 && !allTasksCompleted && (
        <section className="mt-4">
          <button
            type="button"
            onClick={() => navigate('/daily-tracker')}
            className="
              w-full
              acu-card-dark
              p-4
              flex
              items-center
              justify-between
              gap-4
              text-left
              hover:bg-white/[0.06]
              transition-colors
            "
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-500/10 flex items-center justify-center">
                <Activity size={17} className="text-accent-500" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Keep your daily check-in updated
                </p>

                <p className="text-[11px] opacity-50 mt-0.5">
                  Track mood, energy and water intake.
                </p>
              </div>
            </div>

            <ArrowRight size={16} className="opacity-50 shrink-0" />
          </button>
        </section>
      )}

      {/* WEEKLY SUMMARY */}
      {weeklyStats && (
        <section className="acu-card-dark mt-6 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={17} className="text-accent-500" />
            <h2 className="acu-display text-xl">
              Seven Day Summary
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="acu-mono text-[9px] opacity-50">
                TASKS
              </div>

              <div className="text-2xl font-semibold mt-1">
                {weeklyStats.completedTasks || 0}
              </div>

              <div className="text-[10px] opacity-40 mt-1">
                completed
              </div>
            </div>

            <div>
              <div className="acu-mono text-[9px] opacity-50">
                TOTAL
              </div>

              <div className="text-2xl font-semibold mt-1">
                {weeklyStats.totalTasks || 0}
              </div>

              <div className="text-[10px] opacity-40 mt-1">
                scheduled
              </div>
            </div>

            <div>
              <div className="acu-mono text-[9px] opacity-50">
                ENERGY
              </div>

              <div className="text-2xl font-semibold mt-1">
                {weeklyStats.averageEnergy || '-'}
              </div>

              <div className="text-[10px] opacity-40 mt-1">
                average /10
              </div>
            </div>

            <div>
              <div className="acu-mono text-[9px] opacity-50">
                WATER
              </div>

              <div className="text-2xl font-semibold mt-1">
                {weeklyStats.totalWaterIntake || 0}
              </div>

              <div className="text-[10px] opacity-40 mt-1">
                glasses
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;