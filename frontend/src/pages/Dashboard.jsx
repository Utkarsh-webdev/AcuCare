// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Activity,
  Clock,
  Droplets,
  Ruler,
  Flame,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProgressRing from '../components/ProgressRing';

/**
 * Visual language: "Vitals Chart" — a bedside patient-chart feel
 * (deep ink backdrop, parchment cards, a hand-inked pulse line as
 * the signature mark). All data fetching, handlers, and conditional
 * rendering rules are unchanged from the original component; only
 * markup and styling were touched.
 *
 * NOTE: move the @import in <style> below into your global
 * stylesheet / index.html <head> — it's inlined here only so this
 * file is drop-in portable.
 */

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Newsreader:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const INK = '#0F2321';
const PARCHMENT = '#F6EFE3';
const CARD_BORDER = '#D9CFB8';
const CORAL = '#E4572E';
const BRASS = '#D9A441';
const FOREST = '#2D6A4F';
const SLATE = '#7C8B86';
const MUTED_INK = '#6B675A';
const DIVIDER = '#E4DCC5';

function PulseDivider({ progress = 0, color = CORAL, height = 46 }) {
  const amp = 6 + progress * 22;
  const path = `M0,${height / 2}
    L40,${height / 2}
    L52,${height / 2 - amp * 0.3}
    L60,${height / 2 + amp}
    L70,${height / 2 - amp * 1.6}
    L80,${height / 2 + amp * 0.6}
    L92,${height / 2}
    L140,${height / 2}
    L152,${height / 2 - amp * 0.3}
    L160,${height / 2 + amp}
    L170,${height / 2 - amp * 1.6}
    L180,${height / 2 + amp * 0.6}
    L192,${height / 2}
    L400,${height / 2}`;
  return (
    <svg viewBox={`0 0 400 ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function VitalTile({ icon: Icon, label, value, unit, hint, tone }) {
  const tones = {
    coral: { bg: '#FBEAE3', ring: CORAL, text: '#B23E1E' },
    brass: { bg: '#FBF1DD', ring: BRASS, text: '#8C6A1F' },
    forest: { bg: '#E7F0EA', ring: FOREST, text: '#215338' },
    slate: { bg: '#EEEDE8', ring: SLATE, text: '#4E5B57' }
  };
  const t = tones[tone];
  return (
    <div className="rounded-sm p-4 sm:p-5 border" style={{ background: PARCHMENT, borderColor: CARD_BORDER }}>
      <div className="flex items-start justify-between">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full" style={{ background: t.bg, color: t.ring }}>
          <Icon size={17} strokeWidth={2} />
        </span>
        <span
          className="text-[10px] tracking-[0.14em] uppercase font-medium px-1.5 py-0.5 rounded-sm"
          style={{ color: t.text, background: t.bg }}
        >
          {label}
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-3xl sm:text-4xl font-semibold tabular-nums" style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#22201A' }}>
          {value}
        </span>
        {unit && (
          <span className="text-xs" style={{ color: SLATE, fontFamily: "'IBM Plex Mono', monospace" }}>
            {unit}
          </span>
        )}
      </div>
      {hint && (
        <p className="mt-1.5 text-xs" style={{ color: MUTED_INK, fontFamily: "'Newsreader', serif" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

const Dashboard = () => {
  const { user } = useAuth();
  const [todayTracker, setTodayTracker] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [healthPlan, setHealthPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [trackerRes, statsRes, planRes] = await Promise.all([
        axios.get(`/api/health/tracker/today/${user.id}`),
        axios.get(`/api/health/stats/weekly/${user.id}`),
        axios.get(`/api/health/plan/${user.id}`).catch(() => ({ data: null }))
      ]);

      setTodayTracker(trackerRes.data);
      setWeeklyStats(statsRes.data);
      setHealthPlan(planRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId, isCompleted) => {
    try {
      await axios.put(`/api/health/tracker/task/${user.id}/${taskId}`, {
        isCompleted: !isCompleted
      });
      fetchDashboardData();
      toast.success('Task updated!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleGeneratePlan = async () => {
    try {
      toast.loading('Generating personalized health plan...');
      const response = await axios.post(`/api/health/generate-plan/${user.id}`);
      toast.dismiss();
      toast.success('Health plan generated successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate health plan');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" style={{ background: INK }}>
        <style>{FONTS}</style>
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 opacity-20" style={{ borderColor: CORAL }} />
          <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: CORAL }} />
        </div>
      </div>
    );
  }

  const completionRate = todayTracker?.totalTasks > 0
    ? (todayTracker.completedTasks / todayTracker.totalTasks) * 100
    : 0;

  return (
    <div className="min-h-screen w-full" style={{ background: INK }}>
      <style>{FONTS}</style>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">

        {/* Welcome Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[10px] tracking-[0.2em] uppercase px-2 py-1 rounded-sm"
              style={{ color: BRASS, background: 'rgba(217,164,65,0.12)', fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Chart · Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: '#5C776E', fontFamily: "'IBM Plex Mono', monospace" }}>
              {todayTracker?.completedTasks || 0} of {todayTracker?.totalTasks || 0} logged
            </span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: PARCHMENT }}>
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-2 text-sm sm:text-base italic" style={{ fontFamily: "'Newsreader', serif", color: '#9FB0A8' }}>
                Here's your health summary for today
              </p>
            </div>
            {!healthPlan && (
              <button
                onClick={handleGeneratePlan}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-medium transition-opacity hover:opacity-90"
                style={{ background: CORAL, color: PARCHMENT, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Sparkles size={15} />
                Generate Health Plan
              </button>
            )}
          </div>

          <PulseDivider progress={completionRate / 100} color={CORAL} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-sm p-4 sm:p-5 border" style={{ background: PARCHMENT, borderColor: CARD_BORDER }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] tracking-[0.14em] uppercase font-medium" style={{ color: '#B23E1E' }}>
                  Today's Progress
                </p>
                <p className="text-3xl sm:text-4xl font-semibold tabular-nums mt-2" style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#22201A' }}>
                  {Math.round(completionRate)}%
                </p>
              </div>
              <div className="w-14 h-14 flex-shrink-0">
                <ProgressRing progress={completionRate} />
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: MUTED_INK, fontFamily: "'Newsreader', serif" }}>
              {todayTracker?.completedTasks || 0} of {todayTracker?.totalTasks || 0} tasks completed
            </p>
          </div>

          <VitalTile
            icon={Activity}
            label="Energy"
            value={todayTracker?.energyLevel || '-'}
            unit="/10"
            tone="brass"
          />

          <VitalTile
            icon={Droplets}
            label="Water"
            value={todayTracker?.waterIntake || 0}
            unit="glasses"
            tone="forest"
          />

          <VitalTile
            icon={Ruler}
            label="BMI"
            value={user?.bmi?.toFixed(1) || '-'}
            tone="slate"
          />
        </div>

        {/* Today's Tasks */}
        <div className="rounded-sm border p-5 sm:p-6" style={{ background: PARCHMENT, borderColor: CARD_BORDER }}>
          <h2 className="text-base font-semibold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#22201A' }}>
            Today's Tasks
          </h2>
          {todayTracker?.tasks?.length > 0 ? (
            <div>
              {todayTracker.tasks.map((task) => (
                <div
                  key={task.taskId}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                  style={{ borderColor: DIVIDER }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task.taskId, task.isCompleted)}
                      aria-label={task.isCompleted ? 'Mark task not done' : 'Mark task done'}
                      className="relative flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors"
                      style={{
                        borderColor: task.isCompleted ? FOREST : '#B9AF95',
                        background: task.isCompleted ? FOREST : 'transparent'
                      }}
                    >
                      {task.isCompleted && (
                        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                          <path d="M1 4.5L4 7.5L10 1" stroke={PARCHMENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className="text-[15px] leading-tight truncate"
                        style={{
                          fontFamily: "'Newsreader', serif",
                          color: task.isCompleted ? '#A39C86' : '#22201A',
                          textDecoration: task.isCompleted ? 'line-through' : 'none'
                        }}
                      >
                        {task.title}
                      </p>
                      <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: '#8C6A1F', fontFamily: "'IBM Plex Mono', monospace" }}>
                        {task.category}
                      </span>
                    </div>
                  </div>
                  {task.scheduledTime && (
                    <div className="flex-shrink-0 flex items-center gap-1 text-xs pl-3" style={{ color: SLATE, fontFamily: "'IBM Plex Mono', monospace" }}>
                      <Clock size={12} />
                      {task.scheduledTime}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: '#8A8471', fontFamily: "'Newsreader', serif" }}>
              No tasks for today. Generate a health plan to get started!
            </p>
          )}
        </div>

        {/* Weekly Stats Chart */}
        {weeklyStats && weeklyStats.dates?.length > 0 && (
          <div className="rounded-sm border p-5 sm:p-6" style={{ background: PARCHMENT, borderColor: CARD_BORDER }}>
            <h2 className="text-base font-semibold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#22201A' }}>
              Weekly Overview
            </h2>
            <div className="h-48 flex items-end justify-between gap-2">
              {weeklyStats.dates.map((date, index) => {
                const rate = weeklyStats.completionRates[index] || 0;
                const isBest = rate === Math.max(...weeklyStats.completionRates);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full rounded-t-[2px] transition-all duration-500"
                      style={{
                        height: `${rate}%`,
                        minHeight: '4px',
                        background: isBest ? CORAL : BRASS
                      }}
                    />
                    <span className="text-[10px] uppercase mt-2" style={{ color: '#8A8471', fontFamily: "'IBM Plex Mono', monospace" }}>
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
            <div
              className="mt-4 pt-4 flex justify-between text-xs border-t"
              style={{ borderColor: DIVIDER, color: MUTED_INK, fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <span>
                Completion Rate:{' '}
                <span style={{ color: '#22201A' }}>
                  {Math.round(weeklyStats.completionRates.reduce((a, b) => a + b, 0) / weeklyStats.completionRates.length)}%
                </span>
              </span>
              <span>
                Average Energy: <span style={{ color: '#22201A' }}>{weeklyStats.averageEnergy}/10</span>
              </span>
              <span>
                Mood: <span style={{ color: '#22201A' }}>{weeklyStats.averageMood}/5</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;