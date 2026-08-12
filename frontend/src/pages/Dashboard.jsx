// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  Activity, 
  Calendar, 
  Heart,
  TrendingUp,
  Droplets,
  Moon
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProgressRing from '../components/ProgressRing';

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const completionRate = todayTracker?.totalTasks > 0
    ? (todayTracker.completedTasks / todayTracker.totalTasks) * 100
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's your health summary for today
            </p>
          </div>
          {!healthPlan && (
            <button
              onClick={handleGeneratePlan}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Generate Health Plan
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(completionRate)}%
              </p>
            </div>
            <div className="w-16 h-16">
              <ProgressRing progress={completionRate} />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {todayTracker?.completedTasks || 0} of {todayTracker?.totalTasks || 0} tasks completed
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Energy Level</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayTracker?.energyLevel || '-'}/10
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Droplets className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Water Intake</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayTracker?.waterIntake || 0} glasses
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">BMI</p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.bmi?.toFixed(1) || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Tasks</h2>
        {todayTracker?.tasks?.length > 0 ? (
          <div className="space-y-3">
            {todayTracker.tasks.map((task) => (
              <div
                key={task.taskId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleTask(task.taskId, task.isCompleted)}
                    className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className={`font-medium ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    <span className="text-sm text-gray-500">{task.category}</span>
                  </div>
                </div>
                {task.scheduledTime && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {task.scheduledTime}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No tasks for today. Generate a health plan to get started!
          </p>
        )}
      </div>

      {/* Weekly Stats Chart */}
      {weeklyStats && weeklyStats.dates?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Overview</h2>
          <div className="h-48 flex items-end justify-between gap-2">
            {weeklyStats.dates.map((date, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary-500 rounded-t-lg transition-all duration-500"
                  style={{ 
                    height: `${weeklyStats.completionRates[index] || 0}%`,
                    minHeight: '4px'
                  }}
                />
                <span className="text-xs text-gray-600 mt-2">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm text-gray-600">
            <span>Completion Rate: {Math.round(weeklyStats.completionRates.reduce((a, b) => a + b, 0) / weeklyStats.completionRates.length)}%</span>
            <span>Average Energy: {weeklyStats.averageEnergy}/10</span>
            <span>Mood: {weeklyStats.averageMood}/5</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;