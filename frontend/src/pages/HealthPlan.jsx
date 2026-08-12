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
  CheckCircle
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

  const getCategoryColor = (category) => {
    const colors = {
      'Exercise': 'bg-green-100 text-green-800',
      'Sleep': 'bg-purple-100 text-purple-800',
      'Stress Management': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!healthPlan) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex p-4 bg-yellow-100 rounded-full mb-4">
          <AlertCircle className="h-12 w-12 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Health Plan Found
        </h2>
        <p className="text-gray-600 mb-6">
          Generate a personalized health plan to get started
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Generate Plan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Health Plan</h1>
        <p className="text-gray-600 mt-1">
          Personalized recommendations based on your health profile
        </p>
        {healthPlan.conditionsHandled?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {healthPlan.conditionsHandled.map((condition, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {condition}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dietary Plan */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Utensils className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Dietary Plan</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {healthPlan.dietaryPlan?.breakfast?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Breakfast</h3>
              <ul className="space-y-1">
                {healthPlan.dietaryPlan.breakfast.map((item, index) => (
                  <li key={index} className="text-gray-600">• {item}</li>
                ))}
              </ul>
            </div>
          )}
          {healthPlan.dietaryPlan?.lunch?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Lunch</h3>
              <ul className="space-y-1">
                {healthPlan.dietaryPlan.lunch.map((item, index) => (
                  <li key={index} className="text-gray-600">• {item}</li>
                ))}
              </ul>
            </div>
          )}
          {healthPlan.dietaryPlan?.dinner?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Dinner</h3>
              <ul className="space-y-1">
                {healthPlan.dietaryPlan.dinner.map((item, index) => (
                  <li key={index} className="text-gray-600">• {item}</li>
                ))}
              </ul>
            </div>
          )}
          {healthPlan.dietaryPlan?.snacks?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Snacks</h3>
              <ul className="space-y-1">
                {healthPlan.dietaryPlan.snacks.map((item, index) => (
                  <li key={index} className="text-gray-600">• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {healthPlan.dietaryPlan?.fluidIntake && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800">Fluid Intake</h3>
            <p className="text-blue-700">{healthPlan.dietaryPlan.fluidIntake.recommended}</p>
            {healthPlan.dietaryPlan.fluidIntake.details && (
              <p className="text-sm text-blue-600 mt-1">{healthPlan.dietaryPlan.fluidIntake.details}</p>
            )}
          </div>
        )}

        {healthPlan.dietaryPlan?.restrictions?.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800">Restrictions</h3>
            <ul className="mt-1 space-y-1">
              {healthPlan.dietaryPlan.restrictions.map((restriction, index) => (
                <li key={index} className="text-yellow-700">• {restriction}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Medication Schedule */}
      {healthPlan.medicationSchedule?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Pill className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Medication Schedule</h2>
          </div>
          
          <div className="space-y-3">
            {healthPlan.medicationSchedule.map((med, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{med.medicineName}</p>
                  <p className="text-sm text-gray-600">{med.dosage}</p>
                  {med.instructions && (
                    <p className="text-sm text-gray-500">{med.instructions}</p>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {med.timing}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifestyle Suggestions */}
      {healthPlan.lifestyleSuggestions?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Moon className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Lifestyle Suggestions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthPlan.lifestyleSuggestions.map((suggestion, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(suggestion.category)}`}>
                    {suggestion.category}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mt-2">{suggestion.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800">Medical Disclaimer</h3>
            <p className="text-sm text-yellow-700">
              This health plan is generated by AI and is for informational purposes only. 
              Always consult with a qualified healthcare professional before making any health decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthPlan;