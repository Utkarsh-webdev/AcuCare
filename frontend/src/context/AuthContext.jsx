// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from "react";

import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(localStorage.getItem("token"));

  // =========================================
  // Set / remove authorization token
  // =========================================

  const setAuthToken = (authToken) => {
    if (authToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // =========================================
  // Fetch logged-in user
  // =========================================

  const fetchUser = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/api/users/profile");

      /*
       * Backend may return:
       *
       * { user: {...} }
       *
       * OR
       *
       * {...}
       *
       * Support both.
       */

      const fetchedUser = response.data?.user || response.data;

      if (!fetchedUser) {
        throw new Error("Invalid user response from server");
      }

      console.log("✅ User profile loaded:", fetchedUser);

      setUser(fetchedUser);
    } catch (error) {
      console.error(
        "❌ Failed to fetch user:",
        error.response?.data || error.message,
      );

      /*
       * IMPORTANT:
       *
       * Do NOT logout for every error.
       *
       * 401 / 403 = authentication invalid.
       *
       * 500 / network / MongoDB errors =
       * server problem. Keep user logged in.
       */

      const status = error.response?.status;

      if (status === 401 || status === 403) {
        localStorage.removeItem("token");

        setToken(null);
        setUser(null);

        setAuthToken(null);

        toast.error("Session expired. Please login again.");
      }

      /*
       * For 500 / MongoDB / network errors:
       *
       * Keep token.
       * Do not redirect to login.
       */
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Authentication initialization
  // =========================================

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      setAuthToken(null);
      return;
    }

    setAuthToken(token);

    fetchUser();
  }, [token]);

  // =========================================
  // Register
  // =========================================

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/users/register", userData);

      const newToken = response.data?.token;
      const newUser = response.data?.user || response.data?.data;

      if (!newToken) {
        throw new Error("Token not received from server");
      }

      localStorage.setItem("token", newToken);

      setAuthToken(newToken);

      setToken(newToken);

      /*
       * Use returned user if available.
       * Otherwise fetch complete profile.
       */

      if (newUser) {
        setUser(newUser);
      }

      toast.success("Registration successful! Please complete your profile.");

      return true;
    } catch (error) {
      console.error(
        "❌ Registration error:",
        error.response?.data || error.message,
      );

      toast.error(error.response?.data?.message || "Registration failed");

      return false;
    }
  };

  // =========================================
  // Login
  // =========================================

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/users/login", {
        email,
        password,
      });

      const newToken = response.data?.token;

      const loggedInUser = response.data?.user || response.data?.data;

      if (!newToken) {
        throw new Error("Token not received from server");
      }

      /*
       * Save token FIRST.
       */

      localStorage.setItem("token", newToken);

      /*
       * Configure Axios immediately.
       */

      setAuthToken(newToken);

      /*
       * Update React auth state.
       */

      setToken(newToken);

      if (loggedInUser) {
        setUser(loggedInUser);
      }

      /*
       * fetchUser() will run automatically
       * because token changes.
       *
       * It will retrieve complete profile.
       */

      toast.success("Welcome back!");

      return true;
    } catch (error) {
      console.error("❌ Login error:", error.response?.data || error.message);

      toast.error(error.response?.data?.message || "Login failed");

      return false;
    }
  };

  // =========================================
  // Update user in frontend state
  // =========================================

  const updateUser = (updatedUser) => {
    const normalizedUser = updatedUser?.user || updatedUser;

    console.log("✅ Updating local user:", normalizedUser);

    setUser(normalizedUser);
  };

  // =========================================
  // Refresh user profile
  // =========================================

  const refreshUser = async () => {
    if (!token) {
      return false;
    }

    await fetchUser();

    return true;
  };

  // =========================================
  // Logout
  // =========================================

  const logout = () => {
    localStorage.removeItem("token");

    setAuthToken(null);

    setToken(null);

    setUser(null);

    toast.success("Logged out successfully");
  };

  // =========================================
  // Context
  // =========================================

  const value = {
    user,
    loading,

    login,
    register,

    logout,

    updateUser,
    refreshUser,

    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
