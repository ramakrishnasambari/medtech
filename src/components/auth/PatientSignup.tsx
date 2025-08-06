'use client';

import { useState } from 'react';
import { addUser, getUsers, addPatient } from '@/utils/storage';
import { User, Patient } from '@/types';
import { Eye, EyeOff, Heart, ArrowLeft, UserPlus } from 'lucide-react';

interface PatientSignupProps {
  onSignup: (user: User) => void;
  onBackToLogin: () => void;
}

export default function PatientSignup({ onSignup, onBackToLogin }: PatientSignupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    age: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check if user already exists
      const existingUsers = getUsers();
      const userExists = existingUsers.find(user => user.email === formData.email);
      
      if (userExists) {
        setError('A user with this email already exists');
        return;
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'patient',
        createdAt: new Date().toISOString()
      };

      const newPatient: Patient = {
        id: newUser.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: parseInt(formData.age) || undefined,
        createdAt: new Date().toISOString()
      };

      addUser(newUser);
      addPatient(newPatient);
      onSignup(newUser);
    } catch {
      setError('An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
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
            <p className="brand-subtitle">Patient Registration</p>
            <div className="brand-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <UserPlus className="w-6 h-6" />
                </div>
                <span>Easy Registration</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Heart className="w-6 h-6" />
                </div>
                <span>Quality Healthcare</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="login-form-section">
          <div className="login-form-container">
            <div className="form-header">
              <h2 className="form-title">Create Account</h2>
              <p className="form-subtitle">Join our healthcare network</p>
            </div>

            <form onSubmit={handleSignup} className="login-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a password"
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
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="additional-actions">
              <div className="signup-section">
                <p className="signup-text">Already have an account?</p>
                <button onClick={onBackToLogin} className="signup-button">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
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