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
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          {/* Navbar */}
          <nav className="w-full h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">CMS</span>
              <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300" />
              <span className="text-sm font-medium text-gray-700">KWSG Projects</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-gray-600">
                {user?.emailAddresses[0]?.emailAddress || 'Admin'}
              </span>
              <SignOutButton>
                <button 
                  className="inline-flex items-center gap-2 px-3 h-10 rounded-lg text-gray-700 hover:text-blue-700 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
                  title="Logout"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
                  <span className="hidden sm:inline text-sm font-medium">Sign out</span>
                </button>
              </SignOutButton>
            </div>
          </nav>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 