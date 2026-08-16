import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Circle,
  Smile,
  Meh,
  Frown,
  Zap,
  Droplets,
  ArrowLeft,
  Save,
  Activity,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const DailyTracker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [mood, setMood] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [waterIntake, setWaterIntake] = useState(0);

  const userId = user?._id || user?.id;

  // ============================================================
  // FETCH TRACKER
  // ============================================================

  const fetchTracker = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      console.log('DailyTracker user:', userId);
      console.log('DailyTracker token exists:', !!localStorage.getItem('token'));

      const response = await api.get(`/api/health/tracker/today/${userId}`);

      console.log('Daily tracker response:', response.data);

      // Backend may respond either as { success, tracker }
      // or as the raw tracker document itself — handle both.
      const trackerData =
        response.data?.tracker ??
        (response.data?._id ? response.data : null);

      if (!trackerData) {
        throw new Error(
          response.data?.message || 'Failed to load tracker'
        );
      }

      setTracker(trackerData);
      setMood(trackerData?.mood || '');
      setEnergyLevel(trackerData?.energyLevel ?? 5);
      setWaterIntake(trackerData?.waterIntake ?? 0);

    } catch (error) {
      console.error(
        'Failed to load tracker:',
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Failed to load tracker'
      );

    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTracker();
  }, [fetchTracker]);

  // ============================================================
  // TOGGLE TASK
  // ============================================================

  const handleToggleTask = async (taskId, isCompleted) => {
    if (!taskId) return;

    try {
      const response = await api.put(
        `/api/health/tracker/task/${userId}/${taskId}`,
        {
          isCompleted: !isCompleted,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Failed to update task'
        );
      }

      toast.success(
        isCompleted
          ? 'Task marked incomplete'
          : 'Task completed'
      );

      await fetchTracker();

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
    }
  };

  // ============================================================
  // UPDATE DAILY LOG
  // ============================================================

  const handleUpdateDailyLog = async () => {
    try {
      setSaving(true);

      const response = await api.put(
        `/api/health/tracker/daily/${userId}`,
        {
          mood,
          energyLevel,
          waterIntake,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Failed to update daily log'
        );
      }

      toast.success('Daily log saved');
      await fetchTracker();

    } catch (error) {
      console.error(
        'Failed to update daily log:',
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update daily log'
      );

    } finally {
      setSaving(false);
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
            size={32}
            className="mx-auto mb-4 animate-pulse text-accent-500"
          />
          <p className="acu-mono text-[10px] opacity-60">
            LOADING DAILY TRACKER...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // CALCULATIONS
  // ============================================================

  const tasks = tracker?.tasks || [];
  const totalTasks = tracker?.totalTasks ?? tasks.length;
  const completedTasks = tracker?.completedTasks ??
    tasks.filter((task) => task.isCompleted).length;

  const completionRate = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // ============================================================
  // MOOD ICON
  // ============================================================

  const getMoodIcon = (value) => {
    if (value === 'Great' || value === 'Good') {
      return <Smile size={18} />;
    }
    if (value === 'Ok') {
      return <Meh size={18} />;
    }
    return <Frown size={18} />;
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="acu-page">
      {/* HEADER */}
      <section className="acu-dashboard-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="acu-mono text-[9px] text-accent-500 mb-3">
              DAILY RHYTHM
            </div>

            <h1 className="acu-display text-4xl md:text-5xl">
              Check in with{' '}
              <span className="text-accent-500 italic">
                yourself.
              </span>
            </h1>

            <p className="mt-2 text-sm opacity-60 max-w-xl">
              Track your habits, energy, mood and hydration.
              Small actions build your daily rhythm.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="acu-button-outline hidden sm:flex"
          >
            <ArrowLeft size={14} />
            Dashboard
          </button>
        </div>
      </section>

      {/* DATE */}
      <section className="acu-card-dark mt-5 p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-cream-100 text-ink-900 flex items-center justify-center">
          <CalendarDays size={17} />
        </div>

        <div>
          <div className="acu-mono text-[8px] opacity-50">
            TODAY
          </div>
          <p className="text-sm font-semibold">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </section>

      {/* PROGRESS */}
      <section className="acu-card mt-5 p-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="acu-stat-label">
              DAILY PROGRESS
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="acu-display text-4xl">
                {completionRate}%
              </span>
              <span className="text-xs opacity-50">
                completed
              </span>
            </div>
          </div>

          <div className="acu-mono text-[9px] opacity-50">
            {completedTasks}/{totalTasks} TASKS
          </div>
        </div>

        <div className="mt-4 h-2 bg-cream-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-500 rounded-full transition-all duration-500"
            style={{
              width: `${completionRate}%`,
            }}
          />
        </div>

        <div className="flex justify-between mt-2">
          <span className="acu-mono text-[8px] opacity-40">
            START
          </span>
          <span className="acu-mono text-[8px] opacity-40">
            DAILY GOAL
          </span>
        </div>
      </section>

      {/* DAILY LOG */}
      <section className="acu-card mt-5 p-5">
        <div className="mb-5">
          <div className="acu-mono text-[9px] text-accent-600">
            DAILY CHECK-IN
          </div>
          <h2 className="acu-display text-3xl mt-1">
            How are you feeling?
          </h2>
          <p className="text-sm opacity-55 mt-1">
            Record today's signals. Keep it simple.
          </p>
        </div>

        {/* MOOD */}
        <div>
          <label className="acu-stat-label">
            MOOD
          </label>

          <div className="grid grid-cols-5 gap-2 mt-3">
            {['Great', 'Good', 'Ok', 'Bad', 'Terrible'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMood(value)}
                className={`
                  min-h-[58px]
                  rounded-lg
                  border
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  text-xs
                  transition-all
                  ${mood === value
                    ? 'bg-accent-500 text-white border-accent-500'
                    : 'bg-cream-50 text-ink-900 border-black/10 hover:border-accent-500'
                  }
                `}
              >
                {getMoodIcon(value)}
                <span>{value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ENERGY */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <label className="acu-stat-label">
              ENERGY LEVEL
            </label>
            <span className="acu-mono text-xs text-accent-600">
              {energyLevel}/10
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <Zap size={17} className="text-accent-500" />
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) =>
                setEnergyLevel(Number(e.target.value))
              }
              className="w-full accent-[#ef5937]"
            />
          </div>

          <div className="flex justify-between mt-1">
            <span className="text-[10px] opacity-40">
              LOW
            </span>
            <span className="text-[10px] opacity-40">
              HIGH
            </span>
          </div>
        </div>

        {/* WATER */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <label className="acu-stat-label">
              WATER INTAKE
            </label>
            <span className="acu-mono text-xs text-primary-600">
              {waterIntake} glasses
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <Droplets size={18} className="text-primary-500" />
            <input
              type="number"
              min="0"
              max="20"
              value={waterIntake}
              onChange={(e) =>
                setWaterIntake(
                  Math.max(0, Number(e.target.value) || 0)
                )
              }
              className="acu-input"
            />
          </div>
        </div>

        {/* SAVE */}
        <button
          type="button"
          onClick={handleUpdateDailyLog}
          disabled={saving}
          className="acu-button mt-6 w-full sm:w-auto"
        >
          <Save size={15} />
          {saving ? 'Saving...' : 'Save daily check-in'}
        </button>
      </section>

      {/* TASKS */}
      <section className="acu-task-card mt-5">
        <div className="p-5 border-b border-black/10">
          <div className="acu-mono text-[9px] text-primary-600">
            ROUTINE
          </div>
          <div className="flex items-center justify-between">
            <h2 className="acu-display text-2xl mt-1">
              Today's Tasks
            </h2>
            <span className="acu-mono text-[9px] opacity-50">
              {completedTasks}/{totalTasks}
            </span>
          </div>
        </div>

        {tasks.length > 0 ? (
          <div>
            {tasks.map((task) => (
              <div
                key={task.taskId}
                className="acu-task-row"
              >
                <button
                  type="button"
                  onClick={() =>
                    handleToggleTask(task.taskId, task.isCompleted)
                  }
                  className="shrink-0"
                >
                  {task.isCompleted ? (
                    <CheckCircle2 size={22} className="text-primary-500" />
                  ) : (
                    <Circle size={22} className="text-accent-500" />
                  )}
                </button>

                <div className="min-w-0">
                  <p className={task.isCompleted ? 'line-through opacity-40' : 'font-medium'}>
                    {task.title}
                  </p>
                  {task.category && (
                    <span className="text-xs opacity-50">
                      {task.category}
                    </span>
                  )}
                </div>

                {task.scheduledTime && (
                  <div className="acu-task-time flex items-center gap-1">
                    <Clock size={11} />
                    {task.scheduledTime}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="acu-empty">
            <div className="acu-empty-icon">
              <Activity size={20} />
            </div>
            <h3 className="acu-empty-title">
              No tasks today
            </h3>
            <p className="acu-empty-text">
              Generate your health plan to create today's routine.
            </p>
            <button
              type="button"
              onClick={() => navigate('/health-plan')}
              className="acu-button mt-5"
            >
              Generate Health Plan
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default DailyTracker;