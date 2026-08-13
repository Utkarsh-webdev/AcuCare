// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Helper: Set/remove Axios Authorization heade

  const setAuthToken = (authToken) => {
    if (authToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Fetch logged-in user from backen
  
  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/users/profile");

      // Backend may return { user: {...} } or just {...}
      const fetchedUser = response.data?.user || response.data;
      if (!fetchedUser) throw new Error("Invalid user response from server");

      console.log("✅ User profile loaded:", fetchedUser);
      setUser(fetchedUser);
    } catch (error) {
      console.error("❌ Failed to fetch user:", error.response?.data || error.message);

      const status = error.response?.status;
      // Only clear session on authentication errors
      if (status === 401 || status === 403) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setAuthToken(null);
        toast.error("Session expired. Please login again.");
      }
      // For 500 / network errors, keep token and user state intact
    } finally {
      setLoading(false);
    }
  };

  // Auto‑initialise on token chang

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

  // Registe

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/users/register", userData);
      const newToken = response.data?.token;
      const newUser = response.data?.user || response.data?.data;

      if (!newToken) throw new Error("Token not received from server");

      localStorage.setItem("token", newToken);
      setAuthToken(newToken);
      setToken(newToken);

      if (newUser) setUser(newUser);

      toast.success("Registration successful! Please complete your profile.");
      return true;
    } catch (error) {
      console.error("❌ Registration error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Registration failed");
      return false;
    }
  };

  // Logi

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/users/login", { email, password });
      const newToken = response.data?.token;
      const loggedInUser = response.data?.user || response.data?.data;

      if (!newToken) throw new Error("Token not received from server");

      localStorage.setItem("token", newToken);
      setAuthToken(newToken);
      setToken(newToken);

      if (loggedInUser) setUser(loggedInUser);

      toast.success("Welcome back!");
      return true;
    } catch (error) {
      console.error("❌ Login error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  };

  // Update local user state (e.g., after profile edit

  const updateUser = (updatedUser) => {
    const normalized = updatedUser?.user || updatedUser;
    console.log("✅ Updating local user:", normalized);
    setUser(normalized);
  };

  // Manually refresh user dat

  const refreshUser = async () => {
    if (!token) return false;
    await fetchUser();
    return true;
  };

  // Logou

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  // Context valu

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