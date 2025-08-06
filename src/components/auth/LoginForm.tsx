'use client';

import { useState } from 'react';
import { getUsers, setCurrentUser, resetDemoData } from '@/utils/storage';
import { User } from '@/types';
import { Eye, EyeOff, Sparkles, UserPlus, RefreshCw, Heart, Shield, Activity } from 'lucide-react';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onShowSignup: () => void;
}

export default function LoginForm({ onLogin, onShowSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        setCurrentUser(user);
        onLogin(user);
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = () => {
    setEmail('admin@mednetwork.com');
    setPassword('admin123');
  };

  return (
    <div className="login-page">
      {/* Background Animation */}
      <div className="login-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="brand-content">
            <div className="brand-logo">
              <div className="logo-circle">
                <Heart className="w-12 h-12" />
              </div>
            </div>
            <h1 className="brand-title">Med Network</h1>
            <p className="brand-subtitle">Healthcare Management System</p>
            <div className="brand-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <Shield className="w-6 h-6" />
                </div>
                <span>Secure & Reliable</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Activity className="w-6 h-6" />
                </div>
                <span>Real-time Monitoring</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="login-form-container">
            <div className="form-header">
              <h2 className="form-title">Welcome Back</h2>
              <p className="form-subtitle">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="login-button"
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Admin Quick Access */}
            <div className="admin-section">
              <h3 className="admin-title">
                <Sparkles className="w-5 h-5" />
                Admin Access
              </h3>
              <div className="admin-card" onClick={handleAdminLogin}>
                <div className="admin-info">
                  <div className="admin-avatar">S</div>
                  <div>
                    <p className="admin-name">System Administrator</p>
                    <p className="admin-email">admin@mednetwork.com</p>
                  </div>
                </div>
                <button className="admin-use-btn">Use</button>
              </div>
            </div>

            {/* Additional Actions */}
            <div className="additional-actions">
              <div className="signup-section">
                <p className="signup-text">New patient? Create your account</p>
                <button onClick={onShowSignup} className="signup-button">
                  <UserPlus className="w-4 h-4" />
                  Patient Signup
                </button>
              </div>

              <div className="reset-section">
                <button
                  onClick={() => {
                    resetDemoData();
                    alert('Demo data has been reset! You can now use the admin account.');
                  }}
                  className="reset-button"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset Demo Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="login-footer">
        <p>© 2024 Med Network Pvt Ltd. All rights reserved.</p>
      </div>
    </div>
  );
} 