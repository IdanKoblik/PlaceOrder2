import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface GoogleSignInProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const GoogleSignIn: React.FC<GoogleSignInProps> = ({ onSuccess, onError }) => {
  const { signInWithGoogle, isLoading } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleLoaded(true);
      initializeGoogleSignIn();
    };
    script.onerror = () => {
      setError('Failed to load Google Sign-In');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google || !buttonRef.current) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google Client ID not configured');
      return;
    }

    if (!clientId.includes('googleusercontent.com')) {
      setError('Invalid Google Client ID format');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 280,
        text: 'signin_with',
        shape: 'rectangular',
      });
    } catch (err) {
      console.error('Error initializing Google Sign-In:', err);
      setError('Failed to initialize Google Sign-In');
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      // Process the credential response
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      if (payload.email_verified) {
        onSuccess?.();
      } else {
        throw new Error('Email not verified');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      onError?.(error as Error);
    }
  };

  const handleManualSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign-in failed';
      setError(errorMessage);
      onError?.(error as Error);
    }
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Error Display */}
      {error && (
        <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Configuration Required Notice */}
      {!clientId && (
        <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            <strong>Setup Required:</strong> Create a <code>.env</code> file with your Google Client ID:
          </p>
          <code className="block mt-1 text-xs bg-amber-100 p-1 rounded">
            VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
          </code>
        </div>
      )}

      {/* Invalid Client ID Notice */}
      {clientId && !clientId.includes('googleusercontent.com') && (
        <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <strong>Invalid Configuration:</strong> Google Client ID must end with <code>.apps.googleusercontent.com</code>
          </p>
        </div>
      )}

      {/* Google Sign-In Button Container (only show if properly configured) */}
      {clientId && clientId.includes('googleusercontent.com') && googleLoaded && (
        <div ref={buttonRef} id="google-signin-button" />
      )}
      
      {/* Manual Sign-In Button (fallback) */}
      {clientId && clientId.includes('googleusercontent.com') && (
        <button
          onClick={handleManualSignIn}
          disabled={isLoading}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span className="text-gray-700 font-medium">
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </span>
        </button>
      )}

      {/* Setup Instructions */}
      {!clientId && (
        <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Google OAuth Setup Instructions:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
            <li>Create a new project or select existing one</li>
            <li>Enable the Google+ API</li>
            <li>Create OAuth 2.0 credentials</li>
            <li>Add your domain to authorized origins</li>
            <li>Copy the Client ID to your .env file</li>
          </ol>
        </div>
      )}
    </div>
  );
};