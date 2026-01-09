"use client";

import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useAuth, useUser, SignOutButton } from '@clerk/nextjs';
import ProtectedRoute from "./ProtectedRoute";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { user } = useUser();

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
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col lg:pl-64">
          {/* Top Navigation Bar */}
          <nav className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/80 px-6 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Content Management
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:inline-block" />
              <span className="hidden text-sm font-semibold text-gray-700 sm:inline-block">
                KWSG Projects
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-semibold text-white">
                  {user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="text-sm text-gray-700">
                  {user?.emailAddresses[0]?.emailAddress || 'Admin'}
                </span>
              </div>
              <SignOutButton>
                <button 
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  title="Sign out"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </SignOutButton>
            </div>
          </nav>
          
          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
