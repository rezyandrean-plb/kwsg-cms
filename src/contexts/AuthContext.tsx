"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem("kwsg-auth");
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        if (authData.isAuthenticated && authData.user) {
          setIsAuthenticated(true);
          setUser(authData.user);
        }
      } catch (error) {
        console.error("Error parsing saved auth data:", error);
        localStorage.removeItem("kwsg-auth");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Validate email domain
    const domain = email.split('@')[1];
    if (domain !== 'kwsingapore.com') {
      return false;
    }

    // Simple authentication - in a real app, this would be an API call
    // For demo purposes, allow any kwsingapore.com email with password "admin123"
    if (password === "admin123") {
      setIsAuthenticated(true);
      setUser(email);
      
      // Save to localStorage
      localStorage.setItem("kwsg-auth", JSON.stringify({
        isAuthenticated: true,
        user: email,
        timestamp: Date.now()
      }));
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("kwsg-auth");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 