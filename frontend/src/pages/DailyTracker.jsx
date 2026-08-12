// frontend/src/pages/DailyTracker.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Clock, CheckCircle, XCircle, Smile, Frown, Meh, Zap } from 'lucide-react';

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
        isCompleted: !isCompleted
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
        waterIntake
      });
      toast.success('Daily log updated!');
      fetchTracker();
    } catch (error) {
      toast.error('Failed to update daily log');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const completionRate = tracker?.totalTasks > 0
    ? (tracker.completedTasks / tracker.totalTasks) * 100
    : 0;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Daily Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(completionRate)}% Complete
          </span>
        </div>
      </div>

      {/* Daily Log */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How are you feeling today?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select mood</option>
              <option value="Great">😊 Great</option>
              <option value="Good">🙂 Good</option>
              <option value="Ok">😐 Ok</option>
              <option value="Bad">😔 Bad</option>
              <option value="Terrible">😢 Terrible</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Energy Level (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low</span>
              <span>{energyLevel}/10</span>
              <span>High</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Water Intake (glasses)
            </label>
            <input
              type="number"
              value={waterIntake}
              onChange={(e) => setWaterIntake(parseInt(e.target.value) || 0)}
              min="0"
              max="20"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <button
          onClick={handleUpdateDailyLog}
          className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Update Daily Log
        </button>
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Tasks</h2>
        {tracker?.tasks?.length > 0 ? (
          <div className="space-y-3">
            {tracker.tasks.map((task) => (
              <div
                key={task.taskId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleTask(task.taskId, task.isCompleted)}
                    className="focus:outline-none"
                  >
                    {task.isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
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
            No tasks for today
          </p>
        )}
      </div>
    </div>
  );
};

export default DailyTracker;