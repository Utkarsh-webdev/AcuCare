// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Edit2, Save, X, Activity, Heart, Droplets, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isHealthInfoEditing, setIsHealthInfoEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    height: '',
    weight: '',
    gender: 'Male',
    medicalConditions: [],
    dietType: 'Omnivore',
    allergies: []
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        height: user.height || '',
        weight: user.weight || '',
        gender: user.gender || 'Male',
        medicalConditions: user.medicalConditions || [],
        dietType: user.dietType || 'Omnivore',
        allergies: user.allergies || []
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [name]: array }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put('/api/users/profile', formData);
      // Update user context
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setIsHealthInfoEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const heightInMeters = formData.height / 100;
      return (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  if (!user) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const bmi = calculateBMI();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Personal Information Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-full">
              <User className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500">Manage your personal and health information</p>
            </div>
          </div>
          {!isEditing && !isHealthInfoEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Edit2 className="h-4 w-4" /> Edit Profile
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">Age</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{user.age || '-'} yrs</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">BMI</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{bmi || '-'}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-600">Weight</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{user.weight || '-'} kg</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">📏</span>
              <span className="text-sm text-gray-600">Height</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{user.height || '-'} cm</p>
          </div>
        </div>

        {!isEditing && !isHealthInfoEditing ? (
          // View Mode
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-gray-900">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Gender</label>
                  <p className="mt-1 text-gray-900">{user.gender || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Diet Type</label>
                  <p className="mt-1 text-gray-900">{user.dietType || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Medical Conditions</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {user.medicalConditions?.length > 0 ? (
                      user.medicalConditions.map((condition, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {condition}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">None reported</p>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Allergies</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {user.allergies?.length > 0 ? (
                      user.allergies.map((allergy, index) => (
                        <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                          {allergy}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">None reported</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {(!user.age || !user.height || !user.weight || !user.dietType) && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Complete Your Profile</h4>
                    <p className="text-sm text-yellow-700">
                      Add your health information to get personalized health recommendations and diet plans.
                    </p>
                    <button
                      onClick={() => setIsHealthInfoEditing(true)}
                      className="mt-2 px-4 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
                    >
                      Add Health Info
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="1"
                    max="150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="50"
                    max="300"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="1"
                    max="500"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
                  <select
                    name="dietType"
                    value={formData.dietType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Omnivore">Omnivore</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Keto">Keto</option>
                    <option value="Paleo">Paleo</option>
                    <option value="Mediterranean">Mediterranean</option>
                    <option value="Diabetic-Friendly">Diabetic-Friendly</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Conditions (comma separated)
                  </label>
                  <input
                    type="text"
                    name="medicalConditions"
                    value={formData.medicalConditions.join(', ')}
                    onChange={handleArrayChange}
                    placeholder="e.g., Type 2 Diabetes, Hypertension"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies (comma separated)
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies.join(', ')}
                    onChange={handleArrayChange}
                    placeholder="e.g., Peanuts, Shellfish"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setIsHealthInfoEditing(false);
                  // Reset form data to current user data
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    age: user.age || '',
                    height: user.height || '',
                    weight: user.weight || '',
                    gender: user.gender || 'Male',
                    medicalConditions: user.medicalConditions || [],
                    dietType: user.dietType || 'Omnivore',
                    allergies: user.allergies || []
                  });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;