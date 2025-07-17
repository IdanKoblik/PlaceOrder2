import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  checkAdminAccess: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is already signed in (from localStorage)
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const checkIfAdmin = (email: string): boolean => {
    // Define admin emails - you can move this to environment variables
    const adminEmails = [
      'admin@yourrestaurant.com',
      'manager@yourrestaurant.com',
      // Add more admin emails as needed
    ];
    
    return adminEmails.includes(email.toLowerCase());
  };

  const handleGoogleResponse = (response: any) => {
    try {
      setIsLoading(true);
      
      // Decode the JWT token to get user information
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const userData: User = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        isAdmin: checkIfAdmin(payload.email),
      };

      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      console.log('User signed in successfully:', userData);
    } catch (error) {
      console.error('Error processing Google response:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
      }

      if (!clientId.includes('googleusercontent.com')) {
        throw new Error('Invalid Google Client ID format. Please check your VITE_GOOGLE_CLIENT_ID configuration');
      }

      // Check if Google library is loaded
      if (!window.google) {
        throw new Error('Google Sign-In library not loaded');
      }

      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Try to prompt for sign-in
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google prompt not displayed, user needs to click sign-in button');
        }
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Google Sign-In error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    
    // Sign out from Google
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const checkAdminAccess = (): boolean => {
    return user?.isAdmin || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        signInWithGoogle,
        signOut,
        checkAdminAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Extend Window interface for Google Sign-In
declare global {
  interface Window {
    google: any;
  }
}