'use client';

import { User } from '@/types';
import AdminDashboard from './AdminDashboard';
import HospitalAdminDashboard from './HospitalAdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';
import { AlertTriangle, Shield } from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export default function Dashboard({ currentUser, onLogout }: DashboardProps) {
  switch (currentUser.role) {
    case 'admin':
      return <AdminDashboard currentUser={currentUser} onLogout={onLogout} />;
    case 'hospital_admin':
      return <HospitalAdminDashboard currentUser={currentUser} onLogout={onLogout} />;
    case 'doctor':
      return <DoctorDashboard currentUser={currentUser} onLogout={onLogout} />;
    case 'patient':
      return <PatientDashboard currentUser={currentUser} onLogout={onLogout} />;
    default:
      return (
        <div className="dashboard">
          <main className="main-content">
            <div className="container">
              <div className="content-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-title-icon red">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h2>Access Denied</h2>
                  </div>
                  <div className="card-subtitle">
                    You don't have permission to access this dashboard
                  </div>
                </div>
                
                <div className="form-section">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-6">
                      <div className="bg-red-100 rounded-full p-3 mr-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      </div>
                      <div className="bg-blue-100 rounded-full p-3">
                        <Shield className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-gray-500">
                        Current role: <span className="font-semibold text-gray-700">{currentUser.role}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Please contact your administrator for proper access permissions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
  }
} 