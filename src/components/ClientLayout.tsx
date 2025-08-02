"use client";

import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  useEffect(() => {
    // Suppress hydration warnings for browser extension attributes
    const suppressHydrationWarning = () => {
      const body = document.body;
      if (body && body.getAttribute('cz-shortcut-listen')) {
        // This is a known issue with browser extensions, suppress the warning
        console.log('Browser extension detected, suppressing hydration warning');
      }
    };
    
    suppressHydrationWarning();
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          {/* Navbar */}
          <nav className="w-full h-16 flex items-center justify-end px-8 bg-white border-b shadow-sm">
            <span className="font-medium text-gray-700 mr-4">{user || 'Admin'}</span>
            <button 
              onClick={logout}
              className="p-2 rounded hover:bg-gray-100 transition-colors" 
              title="Logout"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="text-2xl text-gray-500" />
            </button>
          </nav>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 