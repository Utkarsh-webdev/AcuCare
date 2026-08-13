// frontend/src/pages/DailyTracker.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

import {
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Smile,
  Frown,
  Meh,
  Zap,
  Droplets,
  Activity,
  Save,
  ChevronRight,
} from 'lucide-react';

const DailyTracker = () => {
  const { user } = useAuth();

  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [mood, setMood] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [waterIntake, setWaterIntake] = useState(0);

  useEffect(() => {
    if (user) {
      fetchTracker();
    }
  }, [user, selectedDate]);

  const fetchTracker = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`/api/health/tracker/today/${user.id}`);

      setTracker(response.data);
      setMood(response.data.mood || '');
      setEnergyLevel(response.data.energyLevel || 5);
      setWaterIntake(response.data.waterIntake || 0);
    } catch (error) {
      toast.error('Failed to load tracker');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId, isCompleted) => {
    try {
      await axios.put(`/api/health/tracker/task/${user.id}/${taskId}`, {
        isCompleted: !isCompleted,
      });

      fetchTracker();

      toast.success('Task updated!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleUpdateDailyLog = async () => {
    try {
      await axios.put(`/api/health/tracker/daily/${user.id}`, {
        mood,
        energyLevel,
        waterIntake,
      });

      toast.success('Daily log updated!');

      fetchTracker();
    } catch (error) {
      toast.error('Failed to update daily log');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#aebbb5]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#35574f] border-t-[#ef5937]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
            Loading daily tracker
          </span>
        </div>
      </div>
    );
  }

  const completionRate =
    tracker?.totalTasks > 0
      ? (tracker.completedTasks / tracker.totalTasks) * 100
      : 0;

  const completedTasks = tracker?.completedTasks || 0;
  const totalTasks = tracker?.totalTasks || 0;

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const moodOptions = [
    { value: 'Great', label: 'Great', icon: Smile },
    { value: 'Good', label: 'Good', icon: Smile },
    { value: 'Ok', label: 'Okay', icon: Meh },
    { value: 'Bad', label: 'Bad', icon: Frown },
    { value: 'Terrible', label: 'Low', icon: Frown },
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
                Daily rhythm
              </span>
            </div>
            <h1 className="acu-display text-4xl text-[#f8f0e2] sm:text-5xl">
              Check in with
              <span className="italic text-[#ef5937]"> yourself.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#aebbb5]">
              Track your habits, energy, mood and hydration.
              Small actions build your daily rhythm.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#f5eee1]/10 bg-[#102d29] px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8f0e2] text-[#0b2623]">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="acu-mono text-[9px] uppercase tracking-[0.12em] text-[#71847d]">
                Today
              </p>
              <p className="mt-1 text-sm font-medium text-[#f8f0e2]">
                {formattedDate}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          PROGRESS
      ========================================= */}
      <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_250px]">
        <div className="acu-card overflow-hidden p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="acu-stat-label">Daily progress</p>
              <div className="mt-2 flex items-end gap-3">
                <h2 className="acu-display text-4xl">
                  {Math.round(completionRate)}%
                </h2>
                <p className="mb-1 text-xs text-[#77756e]">completed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-[#77756e]">
                {completedTasks}/{totalTasks}
              </p>
              <p className="mt-1 text-[11px] text-[#99998f]">tasks</p>
            </div>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#dfd5c4]">
            <div
              className="h-full rounded-full bg-[#ef5937] transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#99998f]">
              Start
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#99998f]">
              Daily goal
            </span>
          </div>
        </div>
        <div className="rounded-2xl bg-[#ef5937] p-6 text-white">
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="acu-mono text-[9px] uppercase tracking-[0.14em] text-white/70">
                Momentum
              </span>
              <Zap className="h-5 w-5" />
            </div>
            <div className="mt-8">
              <p className="acu-display text-4xl">{completedTasks}</p>
              <p className="mt-1 text-xs text-white/75">
                tasks completed today
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          DAILY CHECK-IN
      ========================================= */}
      <section className="acu-card mb-5 p-6 sm:p-7">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="acu-stat-label">Daily check-in</p>
            <h2 className="mt-1 font-serif text-2xl">How are you feeling?</h2>
            <p className="mt-2 text-sm text-[#77756e]">
              Record today's signals. Keep it simple.
            </p>
          </div>
          <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#0b2623] text-[#ef5937] sm:flex">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* MOOD */}
          <div className="rounded-xl bg-[#eee4d3] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="acu-stat-label">Mood</p>
                <p className="mt-1 text-sm font-medium">
                  {mood || 'Not recorded'}
                </p>
              </div>
              <Smile className="h-5 w-5 text-[#3f7164]" />
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {moodOptions.map(({ value, label, icon: Icon }) => {
                const active = mood === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMood(value)}
                    title={label}
                    className={`flex h-11 items-center justify-center rounded-lg border transition ${
                      active
                        ? 'border-[#0b2623] bg-[#0b2623] text-[#f8f0e2]'
                        : 'border-[#d7ccba] bg-[#fffaf1] text-[#77756e] hover:border-[#3f7164]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ENERGY */}
          <div className="rounded-xl bg-[#eee4d3] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="acu-stat-label">Energy</p>
                <p className="mt-1 text-sm font-medium">{energyLevel}/10</p>
              </div>
              <Zap className="h-5 w-5 text-[#ef5937]" />
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#d7ccba] accent-[#ef5937]"
            />
            <div className="mt-3 flex justify-between font-mono text-[9px] uppercase tracking-wider text-[#8b8a80]">
              <span>Low</span>
              <span>Balanced</span>
              <span>High</span>
            </div>
          </div>

          {/* WATER */}
          <div className="rounded-xl bg-[#eee4d3] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="acu-stat-label">Hydration</p>
                <p className="mt-1 text-sm font-medium">
                  {waterIntake} glasses
                </p>
              </div>
              <Droplets className="h-5 w-5 text-[#3f7164]" />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#d7ccba] bg-[#fffaf1] text-lg text-[#132521] transition hover:border-[#3f7164]"
              >
                −
              </button>
              <div className="flex h-11 flex-1 items-center justify-center rounded-lg bg-[#fffaf1] font-mono text-sm text-[#132521]">
                {waterIntake}
              </div>
              <button
                type="button"
                onClick={() => setWaterIntake(Math.min(20, waterIntake + 1))}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0b2623] text-lg text-[#f8f0e2] transition hover:bg-[#15352f]"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={handleUpdateDailyLog} className="acu-button">
            <Save className="h-4 w-4" />
            Save daily log
          </button>
        </div>
      </section>

      {/* =========================================
          TASKS
      ========================================= */}
      <section className="acu-task-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#132521]/10 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="acu-stat-label">Your routine</p>
            <h2 className="mt-1 font-serif text-2xl">Today's tasks</h2>
            <p className="mt-2 text-sm text-[#77756e]">
              Complete each action as you move through your day.
            </p>
          </div>
          {totalTasks > 0 && (
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#77756e]">
              {completedTasks} of {totalTasks} complete
            </div>
          )}
        </div>

        {tracker?.tasks?.length > 0 ? (
          <div>
            {tracker.tasks.map((task, index) => (
              <div key={task.taskId} className="acu-task-row group">
                <button
                  type="button"
                  onClick={() =>
                    handleToggleTask(task.taskId, task.isCompleted)
                  }
                  className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ef5937]/30"
                  aria-label={
                    task.isCompleted
                      ? `Mark ${task.title} incomplete`
                      : `Complete ${task.title}`
                  }
                >
                  {task.isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-[#3f7164]" />
                  ) : (
                    <Circle className="h-6 w-6 text-[#a49f94] transition group-hover:text-[#ef5937]" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium transition ${
                      task.isCompleted
                        ? 'text-[#99998f] line-through'
                        : 'text-[#132521]'
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="acu-badge acu-badge-green">
                      {task.category}
                    </span>
                  </div>
                </div>
                {task.scheduledTime && (
                  <div className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] text-[#77756e]">
                    <Clock className="h-3.5 w-3.5" />
                    {task.scheduledTime}
                  </div>
                )}
                <ChevronRight className="hidden h-4 w-4 text-[#c1b8a8] transition group-hover:text-[#ef5937] sm:block" />
              </div>
            ))}
          </div>
        ) : (
          <div className="acu-empty">
            <div className="acu-empty-icon">+</div>
            <h3 className="acu-empty-title">Nothing scheduled yet</h3>
            <p className="acu-empty-text">
              Generate your health plan to create personalized
              daily tasks for meals, movement, hydration and habits.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DailyTracker;