# Clerk UI Customization Guide

## Overview
This guide covers different methods to customize Clerk's authentication UI to match your application's design.

## Method 1: Appearance Prop (Recommended)

### Basic Styling
The `appearance` prop allows you to customize individual elements using CSS classes:

```jsx
<SignIn 
  appearance={{
    elements: {
      formButtonPrimary: 'bg-orange-600 hover:bg-orange-700',
      card: 'shadow-lg rounded-lg',
      headerTitle: 'text-2xl font-bold'
    }
  }}
/>
```

### Advanced Styling with Variables
Use the `variables` object for consistent theming:

```jsx
<SignIn 
  appearance={{
    elements: {
      formButtonPrimary: 'bg-orange-600 hover:bg-orange-700 text-white',
      formFieldInput: 'border border-gray-300 rounded-lg'
    },
    variables: {
      colorPrimary: '#ea580c',        // Orange-600
      colorBackground: '#ffffff',     // White background
      colorInputBackground: '#ffffff', // Input background
      colorInputText: '#374151',      // Gray-700 text
      borderRadius: '0.5rem'          // 8px border radius
    }
  }}
/>
```

## Method 2: Custom CSS Classes

### Create a Custom CSS File
Create `src/styles/clerk-custom.css`:

```css
/* Custom Clerk Styles */
.cl-signIn-root {
  max-width: 400px;
  margin: 0 auto;
}

.cl-card {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  border: none;
}

.cl-formButtonPrimary {
  background-color: #ea580c;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cl-formButtonPrimary:hover {
  background-color: #c2410c;
  transform: translateY(-1px);
}

.cl-formFieldInput {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;
}

.cl-formFieldInput:focus {
  outline: none;
  border-color: #ea580c;
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
}
```

### Import in Your Layout
```jsx
// In src/app/layout.tsx
import '../styles/clerk-custom.css'
```

## Method 3: Custom Components (Advanced)

### Create Custom Sign-In Component
```jsx
// src/components/CustomSignIn.tsx
"use client";

import { useSignIn } from '@clerk/nextjs';
import { useState } from 'react';

export default function CustomSignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      }
    } catch (err: any) {
      setError(err.errors[0].message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Sign In
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
```

## Method 4: Theme Configuration

### Global Theme Setup
Create a theme configuration file:

```jsx
// src/lib/clerk-theme.ts
export const clerkTheme = {
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
    
    // Error messages
    formFieldErrorText: 'text-red-600 text-sm',
    alertText: 'text-red-600 text-sm',
  },
  variables: {
    colorPrimary: '#ea580c',
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    colorInputText: '#374151',
    borderRadius: '0.5rem'
  }
};
```

### Use the Theme
```jsx
import { clerkTheme } from '@/lib/clerk-theme';

<SignIn appearance={clerkTheme} />
```

## Available Customization Elements

### Form Elements
- `formButtonPrimary` - Primary action button
- `formButtonSecondary` - Secondary action button
- `formFieldInput` - Input fields
- `formFieldLabel` - Field labels
- `formFieldErrorText` - Error messages
- `formFieldSuccessText` - Success messages

### Layout Elements
- `rootBox` - Main container
- `card` - Main card container
- `headerTitle` - Page title
- `headerSubtitle` - Page subtitle
- `footer` - Footer section

### Social Elements
- `socialButtonsBlockButton` - Social login buttons
- `socialButtonsBlockButtonText` - Social button text
- `socialButtonsProviderIcon` - Social provider icons

### Navigation Elements
- `footerActionLink` - Footer links
- `identityPreviewText` - User identity preview
- `dividerLine` - Divider lines
- `dividerText` - Divider text

## Best Practices

1. **Consistent Branding**: Use your brand colors and fonts
2. **Responsive Design**: Test on different screen sizes
3. **Accessibility**: Ensure good contrast and keyboard navigation
4. **Loading States**: Style loading spinners and disabled states
5. **Error Handling**: Make error messages clear and styled
6. **Theme Variables**: Use variables for consistent theming

## Testing Your Customizations

1. Test all authentication flows (sign in, sign up, forgot password)
2. Test on different devices and screen sizes
3. Test with different browsers
4. Verify accessibility with screen readers
5. Test error states and edge cases

## Resources

- [Clerk Appearance Documentation](https://clerk.com/docs/customization/appearance)
- [Clerk Custom Components Guide](https://clerk.com/docs/customization/custom-components)
- [Clerk Theme Variables](https://clerk.com/docs/customization/appearance#variables)

