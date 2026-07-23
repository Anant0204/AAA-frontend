import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { dbService } from '../services/dbService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('crm-auth-user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const isAuthenticated = !!currentUser;

  // ── Startup: validate stored token against backend ──────────────────────
  const hasValidated = useRef(false);
  useEffect(() => {
    if (hasValidated.current) return;
    hasValidated.current = true;

    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('crm-auth-user');

    if (!token || !savedUser) return; // Nothing saved, normal state

    // Try to verify the token with the backend
    dbService.verifyToken()
      .then(() => {
        // Token is valid — do nothing, keep session
      })
      .catch(() => {
        // Backend down OR token expired/invalid → force logout
        localStorage.removeItem('crm-auth-user');
        localStorage.removeItem('token');
        setCurrentUser(null);
      });
  }, []);

  // Background sync: keep currentUser in sync with crm-agents-list updates
  useEffect(() => {
    if (!currentUser) return;
    try {
      const savedAgents = localStorage.getItem('crm-agents-list');
      if (savedAgents) {
        const agents = JSON.parse(savedAgents);
        const freshUser = agents.find(a => a.id === currentUser.id);
        if (freshUser) {
          // If customPermissions or other profile info changed, update auth session
          if (JSON.stringify(freshUser.customPermissions) !== JSON.stringify(currentUser.customPermissions) ||
              freshUser.name !== currentUser.name ||
              freshUser.email !== currentUser.email) {
            
            const updated = {
              ...currentUser,
              name: freshUser.name,
              email: freshUser.email,
              role: freshUser.role || currentUser.role,
              customPermissions: freshUser.customPermissions
            };
            localStorage.setItem('crm-auth-user', JSON.stringify(updated));
            setCurrentUser(updated);
          }
        }
      }
    } catch (e) {
      console.warn("Error syncing user session with agents list:", e);
    }
  }, [currentUser]);

  const login = (user, token) => {
    localStorage.setItem('crm-auth-user', JSON.stringify(user));
    if (token) {
      localStorage.setItem('token', token);
    }
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('crm-auth-user');
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // Refresh current user from a full updated agent object
  // Called when an admin updates an agent's permissions while they are logged in
  const refreshUser = (updatedAgent) => {
    if (!currentUser || currentUser.id !== updatedAgent.id) return;
    const updatedUser = {
      ...currentUser,
      name: updatedAgent.name,
      email: updatedAgent.email,
      role: updatedAgent.role || currentUser.role,
      avatar: updatedAgent.avatar || currentUser.avatar,
      customPermissions: updatedAgent.customPermissions,
    };
    localStorage.setItem('crm-auth-user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const changeRole = async (role) => {
    let email = 'admin@aaaconsultancy.com';
    if (role === 'super_admin') email = 'superadmin@aaaconsultancy.com';
    else if (role === 'marketing') email = 'marketing@aaaconsultancy.com';
    else if (role === 'consultant') email = 'agent@aaaconsultancy.com';
    else if (role === 'finance') email = 'finance@aaaconsultancy.com';
    else if (role === 'operations') email = 'operations@aaaconsultancy.com';

    const res = await dbService.authLogin(email, 'password123');
    if (!res || !res.token) {
      throw new Error('Login failed: no token received from server.');
    }
    localStorage.setItem('token', res.token);
    localStorage.setItem('crm-auth-user', JSON.stringify(res.user));
    setCurrentUser(res.user);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout, changeRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
