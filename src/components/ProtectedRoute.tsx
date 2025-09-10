"use client";

import { useAuth, SignIn } from '@clerk/nextjs';
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading spinner while checking authentication
  if (!isLoaded) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <SignIn 
            appearance={{
              elements: {
                // Main container
                rootBox: 'mx-auto max-w-md w-full',
                card: 'shadow-xl rounded-xl border-0 bg-white',
                
                // Header
                headerTitle: 'text-3xl font-bold text-gray-900 text-center',
                headerSubtitle: 'text-sm text-gray-600 text-center mt-2',
                
                // Form elements
                formButtonPrimary: 'bg-orange-600 hover:bg-orange-700 text-white text-sm normal-case font-medium py-3 px-4 rounded-lg transition-colors duration-200',
                formFieldInput: 'border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors',
                formFieldLabel: 'text-sm font-medium text-gray-700 mb-2',
                
                // Social buttons
                socialButtonsBlockButton: 'border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors py-3',
                socialButtonsBlockButtonText: 'text-gray-700 font-medium',
                
                // Links
                footerActionLink: 'text-orange-600 hover:text-orange-700 font-medium transition-colors',
                identityPreviewText: 'text-gray-600',
                
                // Divider
                dividerLine: 'bg-gray-200',
                dividerText: 'text-gray-500 text-sm',
                
                // Error messages
                formFieldErrorText: 'text-red-600 text-sm',
                alertText: 'text-red-600 text-sm',
                
                // Loading states
                spinner: 'text-orange-600',
                
                // Footer
                footer: 'text-center text-xs text-gray-500 mt-6'
              },
              variables: {
                colorPrimary: '#ea580c', // Orange-600
                colorBackground: '#ffffff',
                colorInputBackground: '#ffffff',
                colorInputText: '#374151',
                borderRadius: '0.5rem'
              }
            }}
            redirectUrl="/"
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 