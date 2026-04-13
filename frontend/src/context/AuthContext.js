import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockLogin, mockSignup, fetchCloudData } from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('mock-user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    const user = await mockLogin(identifier, password);
    setCurrentUser(user);
    localStorage.setItem('mock-user', JSON.stringify(user));
    await syncLocalToCloud(user.uid);
  };

  const signup = async (name, email, phone, password) => {
    const user = await mockSignup(name, email, phone, password);
    setCurrentUser(user);
    localStorage.setItem('mock-user', JSON.stringify(user));
    await syncLocalToCloud(user.uid);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mock-user');
  };

  const syncLocalToCloud = async (uid) => {
    // Simulates pulling local tracking files and pushing to the 'Cloud' mapping them by UID permanently.
    const dsa = localStorage.getItem('dsa-names') || '[]';
    const vault = localStorage.getItem('architect-vault') || '{}';
    localStorage.setItem(`cloud-${uid}-dsa`, dsa);
    localStorage.setItem(`cloud-${uid}-vault`, vault);
    return true;
  };

  const value = {
    currentUser,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
