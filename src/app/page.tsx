'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { getCurrentUser, initializeDemoData } from '@/utils/storage';
import LoginForm from '@/components/auth/LoginForm';
import PatientSignup from '@/components/auth/PatientSignup';
import Dashboard from '@/components/dashboard/Dashboard';
import { Heart, Activity } from 'lucide-react';

type AuthState = 'login' | 'signup';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('login');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization...');
        initializeDemoData();
        console.log('Demo data initialized');
        const user = getCurrentUser();
        console.log('Current user:', user);
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        console.log('Setting loading to false');
        setIsLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Loading timeout reached, forcing loading to false');
      setIsLoading(false);
    }, 5000);

    initializeApp();

    return () => clearTimeout(timeout);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleSignup = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleShowSignup = () => {
    setAuthState('signup');
  };

  const handleBackToLogin = () => {
    setAuthState('login');
  };

  if (isLoading) {
    return (
      <div className="login-page">
        <div className="login-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </div>
        <div className="login-container">
          <div className="text-center fade-in">
            <div className="flex items-center justify-center mb-8">
              <div className="logo-circle">
                <Heart className="w-12 h-12 text-white animate-pulse" />
              </div>
            </div>
            <h1 className="brand-title">Med Network</h1>
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-white/80 text-lg">Initializing healthcare system...</p>
            <div className="flex items-center justify-center mt-4 space-x-2">
              <Activity className="w-5 h-5 text-white/60 animate-pulse" />
              <span className="text-white/60 text-sm">Loading modules</span>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => setIsLoading(false)}
                className="text-white/60 text-sm underline hover:text-white/80"
              >
                Click here if loading takes too long
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (authState === 'signup') {
      return <PatientSignup onSignup={handleSignup} onBackToLogin={handleBackToLogin} />;
    }
    return <LoginForm onLogin={handleLogin} onShowSignup={handleShowSignup} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Dashboard currentUser={currentUser} onLogout={handleLogout} />
    </div>
  );
}
