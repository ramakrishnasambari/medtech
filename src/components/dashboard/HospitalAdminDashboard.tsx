'use client';

import { useState, useEffect } from 'react';
import { getDoctors, addDoctor, updateDoctor, getHospitals, getAppointments, addUser, getUsers, updateInStorage } from '@/utils/storage';        
import { Doctor, User, Appointment, Hospital } from '@/types';
import { 
  Plus, 
  Stethoscope, 
  Users, 
  Calendar, 
  Mail, 
  Phone, 
  Building2, 
  Heart,
  Bell,
  Settings,
  ChevronDown,
  LogOut,
  Edit,
  TrendingUp
} from 'lucide-react';

interface HospitalAdminDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export default function HospitalAdminDashboard({ currentUser, onLogout }: HospitalAdminDashboardProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsDateFilter, setAnalyticsDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    qualification: '',
    consultationFee: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setDoctors(getDoctors());
    setAppointments(getAppointments());
    setHospitals(getHospitals());
  };

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    
    const doctor: Doctor = {
      id: Date.now().toString(),
      name: newDoctor.name,
      email: newDoctor.email,
      phone: newDoctor.phone,
      specialization: newDoctor.specialization,
      experience: parseInt(newDoctor.experience),
      qualification: newDoctor.qualification || undefined,
      consultationFee: newDoctor.consultationFee ? parseInt(newDoctor.consultationFee) : undefined,
      hospitalId: currentUser.hospitalId || '',
      hospitalName: currentUser.name?.replace(' Administrator', '') || 'Hospital',
      isFirstLogin: true,
      createdAt: new Date().toISOString()
    };

    // Create doctor user with email as username and "testing" as password
    const doctorUser: User = {
      id: Date.now().toString() + '_doctor',
      email: newDoctor.email,
      phone: newDoctor.phone,
      name: newDoctor.name,
      role: 'doctor',
      hospitalId: currentUser.hospitalId || '',
      password: 'testing',
      isFirstLogin: true,
      createdAt: new Date().toISOString()
    };

    addDoctor(doctor);
    addUser(doctorUser);
    
    // Show success message with login credentials
    alert(`Doctor "${newDoctor.name}" added successfully!\n\nLogin Credentials:\nEmail: ${newDoctor.email}\nPassword: testing`);
    
    setNewDoctor({ name: '', email: '', phone: '', specialization: '', experience: '', qualification: '', consultationFee: '' });
    setShowAddForm(false);
    loadData();
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setShowEditForm(true);
  };

  const handleUpdateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    const updatedDoctor: Doctor = {
      ...editingDoctor,
      name: newDoctor.name,
      email: newDoctor.email,
      phone: newDoctor.phone,
      specialization: newDoctor.specialization,
      experience: parseInt(newDoctor.experience),
      qualification: newDoctor.qualification || undefined,
      consultationFee: newDoctor.consultationFee ? parseInt(newDoctor.consultationFee) : undefined,
    };

    updateDoctor(updatedDoctor);
    
    // Update the doctor user if it exists
    const users = getUsers();
    const doctorUser = users.find(user => user.email === editingDoctor.email);
    if (doctorUser) {
      const updatedUser = {
        ...doctorUser,
        name: newDoctor.name,
        email: newDoctor.email,
        phone: newDoctor.phone,
      };
      updateInStorage('users', updatedUser);
    }
    
    alert(`Doctor "${newDoctor.name}" updated successfully!`);
    
    setNewDoctor({ name: '', email: '', phone: '', specialization: '', experience: '', qualification: '', consultationFee: '' });
    setShowEditForm(false);
    setEditingDoctor(null);
    loadData();
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingDoctor(null);
    setNewDoctor({ name: '', email: '', phone: '', specialization: '', experience: '', qualification: '', consultationFee: '' });
  };

  const getAnalyticsData = () => {
    const today = analyticsDateFilter;
    const filteredAppointments = hospitalAppointments.filter(apt => apt.date === today);
    
    return {
      totalAppointments: filteredAppointments.length,
      completedAppointments: filteredAppointments.filter(apt => apt.status === 'completed').length,
      pendingAppointments: filteredAppointments.filter(apt => apt.status === 'scheduled').length,
      cancelledAppointments: filteredAppointments.filter(apt => apt.status === 'cancelled').length,
      appointmentsByDoctor: hospitalDoctors.map(doctor => ({
        doctorName: doctor.name,
        appointments: filteredAppointments.filter(apt => apt.doctorId === doctor.id).length
      }))
    };
  };

  const hospitalDoctors = doctors.filter(doctor => doctor.hospitalId === currentUser.hospitalId);
  const hospitalAppointments = appointments.filter(apt => apt.hospitalId === currentUser.hospitalId);
  
  // Get hospital name from hospitalId
  const getHospitalName = () => {
    const hospital = hospitals.find(h => h.id === currentUser.hospitalId);
    return hospital ? hospital.name : 'Hospital';
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">
                <Heart className="w-6 h-6" />
              </div>
              <div className="logo-text">
                <h1>{getHospitalName()}</h1>
                <p>Hospital Admin Portal</p>
              </div>
            </div>
            
            <div className="header-actions">
              <div className="notification-badge">
                <Bell className="w-6 h-6" />
                <span className="badge">{hospitalAppointments.length}</span>
              </div>
              
              <div className="settings-icon">
                <Settings className="w-6 h-6" />
              </div>
              
              <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="user-avatar">
                  <span>H</span>
                </div>
                <div className="user-info">
                  <h3>{currentUser.name}</h3>
                  <p>{currentUser.email}</p>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                
                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        <span>H</span>
                      </div>
                      <div className="dropdown-info">
                        <h4>{currentUser.name}</h4>
                        <p>{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-actions">
                      <button className="dropdown-action">
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button className="dropdown-action">
                        <Building2 className="w-4 h-4" />
                        Hospital Info
                      </button>
                      <button className="dropdown-action logout" onClick={handleLogout}>
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Welcome Section */}
          <section className="welcome-section fade-in">
            <div className="welcome-content">
              <div className="welcome-text">
                <h1>Welcome back, {currentUser.name}!</h1>
                <p>Manage your hospital&apos;s doctors and monitor patient appointments</p>
                <div className="stats-overview">
                  <div className="stat-item">
                    <div className="stat-number stat-doctors">{hospitalDoctors.length}</div>
                    <div className="stat-label">Doctors</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number stat-patients">{hospitalAppointments.length}</div>
                    <div className="stat-label">Appointments</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{hospitalAppointments.filter(apt => apt.status === 'scheduled').length}</div>
                    <div className="stat-label">Scheduled</div>
                  </div>
                </div>
              </div>
              <div className="welcome-icon">
                <Building2 className="w-16 h-16" />
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon blue">
                  <Stethoscope className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-card-title">Total Doctors</div>
              <div className="stat-card-number stat-doctors">{hospitalDoctors.length}</div>
              <div className="stat-card-description">Medical professionals</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon green">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-card-title">Total Appointments</div>
              <div className="stat-card-number stat-patients">{hospitalAppointments.length}</div>
              <div className="stat-card-description">Patient visits</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon purple">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-card-title">Scheduled</div>
              <div className="stat-card-number">{hospitalAppointments.filter(apt => apt.status === 'scheduled').length}</div>
              <div className="stat-card-description">Upcoming appointments</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon orange">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-card-title">Completed</div>
              <div className="stat-card-number">{hospitalAppointments.filter(apt => apt.status === 'completed').length}</div>
              <div className="stat-card-description">Finished visits</div>
            </div>
          </section>

          {/* Main Layout */}
          <div className="main-layout">
            {/* Doctors Management */}
            <div className="content-card">
              <div className="card-header">
                <div className="card-title">
                  <div className="card-title-icon green">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h2>Manage Doctors</h2>
                </div>
                <div className="card-subtitle">
                  Add and manage medical professionals in your hospital
                </div>
                <div className="card-actions">
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn btn-primary"
                  >
                    <Plus className="w-4 h-4" />
                    Add Doctor
                  </button>
                </div>
              </div>

              {showAddForm && (
                <div className="form-section slide-up">
                  <form onSubmit={handleAddDoctor}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1a202c' }}>
                      Add New Doctor
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Doctor Name *</label>
                        <input
                          type="text"
                          value={newDoctor.name}
                          onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                          placeholder="Enter doctor's full name"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          value={newDoctor.email}
                          onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                          placeholder="Enter email address"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Phone *</label>
                        <input
                          type="text"
                          value={newDoctor.phone}
                          onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                          placeholder="Enter phone number"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Specialization *</label>
                        <input
                          type="text"
                          value={newDoctor.specialization}
                          onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                          placeholder="e.g., Cardiology, Neurology"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Experience (Years) *</label>
                        <input
                          type="number"
                          value={newDoctor.experience}
                          onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})}
                          placeholder="Enter years of experience"
                          min="0"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Qualification</label>
                        <input
                          type="text"
                          value={newDoctor.qualification}
                          onChange={(e) => setNewDoctor({...newDoctor, qualification: e.target.value})}
                          placeholder="e.g., MBBS, MD, PhD"
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Consultation Fee</label>
                        <input
                          type="number"
                          value={newDoctor.consultationFee}
                          onChange={(e) => setNewDoctor({...newDoctor, consultationFee: e.target.value})}
                          placeholder="Enter consultation fee"
                          min="0"
                          className="form-input"
                        />
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        <Plus className="w-4 h-4" />
                        Add Doctor
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {showEditForm && editingDoctor && (
                <div className="form-section slide-up">
                  <form onSubmit={handleUpdateDoctor}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1a202c' }}>
                      Edit Doctor: {editingDoctor.name}
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Doctor Name *</label>
                        <input
                          type="text"
                          value={newDoctor.name}
                          onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                          placeholder="Enter doctor's full name"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          value={newDoctor.email}
                          onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                          placeholder="Enter email address"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Phone *</label>
                        <input
                          type="text"
                          value={newDoctor.phone}
                          onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                          placeholder="Enter phone number"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Specialization *</label>
                        <input
                          type="text"
                          value={newDoctor.specialization}
                          onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                          placeholder="e.g., Cardiology, Neurology"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Experience (Years) *</label>
                        <input
                          type="number"
                          value={newDoctor.experience}
                          onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})}
                          placeholder="Enter years of experience"
                          min="0"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Qualification</label>
                        <input
                          type="text"
                          value={newDoctor.qualification}
                          onChange={(e) => setNewDoctor({...newDoctor, qualification: e.target.value})}
                          placeholder="e.g., MBBS, MD, PhD"
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Consultation Fee</label>
                        <input
                          type="number"
                          value={newDoctor.consultationFee}
                          onChange={(e) => setNewDoctor({...newDoctor, consultationFee: e.target.value})}
                          placeholder="Enter consultation fee"
                          min="0"
                          className="form-input"
                        />
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        Update Doctor
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Doctors List */}
              <div className="hospital-list">
                {hospitalDoctors.length > 0 ? (
                  hospitalDoctors.map((doctor) => (
                    <div key={doctor.id} className="hospital-item">
                      <div className="hospital-header">
                        <div className="hospital-icon">
                          <Stethoscope className="w-8 h-8" />
                        </div>
                        <div className="hospital-info">
                          <h3>Dr. {doctor.name}</h3>
                          <div className="hospital-details">
                            <div className="hospital-detail">
                              <Stethoscope className="hospital-detail-icon" />
                              <span>{doctor.specialization}</span>
                            </div>
                            <div className="hospital-detail">
                              <Mail className="hospital-detail-icon" />
                              <span>{doctor.email}</span>
                            </div>
                            <div className="hospital-detail">
                              <Phone className="hospital-detail-icon" />
                              <span>{doctor.phone}</span>
                            </div>
                            <div className="hospital-detail">
                              <Users className="hospital-detail-icon" />
                              <span>{doctor.experience} years experience</span>
                            </div>
                          </div>
                          {doctor.qualification && (
                            <div className="hospital-description">
                              Qualification: {doctor.qualification}
                            </div>
                          )}
                        </div>
                        <div className="hospital-actions">
                          <button
                            onClick={() => {
                              setNewDoctor({
                                name: doctor.name,
                                email: doctor.email,
                                phone: doctor.phone,
                                specialization: doctor.specialization,
                                experience: doctor.experience.toString(),
                                qualification: doctor.qualification || '',
                                consultationFee: doctor.consultationFee?.toString() || ''
                              });
                              handleEditDoctor(doctor);
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '8px', minWidth: 'auto' }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Stethoscope className="w-10 h-10" />
                    </div>
                    <h3>No Doctors Added</h3>
                    <p>
                      Start building your medical team by adding your first doctor.
                    </p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="btn btn-primary"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Doctor
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Analytics Section */}
            <div className="content-card" style={{ marginBottom: '32px' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-title-icon orange">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h2>Appointment Analytics</h2>
                </div>
                <div className="card-subtitle">
                  Monitor appointment statistics and performance
                </div>
                <div className="card-actions">
                  <input
                    type="date"
                    value={analyticsDateFilter}
                    onChange={(e) => setAnalyticsDateFilter(e.target.value)}
                    className="form-input"
                    style={{ width: 'auto', marginRight: '8px' }}
                  />
                  <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="btn btn-primary"
                  >
                    <TrendingUp className="w-4 h-4" />
                    View Analytics
                  </button>
                </div>
              </div>

              {showAnalytics && (
                <div className="analytics-section slide-up">
                  {(() => {
                    const analytics = getAnalyticsData();
                    return (
                      <div>
                        <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                          <div className="analytics-card" style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>{analytics.totalAppointments}</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>Total Appointments</div>
                          </div>
                          <div className="analytics-card" style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{analytics.completedAppointments}</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>Completed</div>
                          </div>
                          <div className="analytics-card" style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>{analytics.pendingAppointments}</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>Pending</div>
                          </div>
                          <div className="analytics-card" style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>{analytics.cancelledAppointments}</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>Cancelled</div>
                          </div>
                        </div>
                        
                        <div style={{ marginTop: '24px' }}>
                          <h4 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Appointments by Doctor</h4>
                          <div className="doctor-analytics">
                            {analytics.appointmentsByDoctor.map((item, index) => (
                              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '500' }}>Dr. {item.doctorName}</span>
                                <span style={{ backgroundColor: '#1e40af', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                  {item.appointments} appointments
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              {/* Hospital Info */}
              <div className="content-card" style={{ marginBottom: '32px' }}>
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-title-icon blue">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h2>Hospital Information</h2>
                  </div>
                  <div className="card-subtitle">
                    Your hospital details
                  </div>
                </div>
                
                <div className="status-list">
                  <div className="status-item blue">
                    <div className="status-left">
                      <div className="status-icon blue">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="status-text blue">Hospital Name</span>
                    </div>
                    <span className="status-badge info">{currentUser.name?.replace(' Administrator', '')}</span>
                  </div>
                  
                  <div className="status-item green">
                    <div className="status-left">
                      <div className="status-icon green">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="status-text green">Email</span>
                    </div>
                    <span className="status-badge info">{currentUser.email}</span>
                  </div>
                  
                  <div className="status-item purple">
                    <div className="status-left">
                      <div className="status-icon purple">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="status-text purple">Phone</span>
                    </div>
                    <span className="status-badge info">{currentUser.phone}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="content-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-title-icon purple">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h2>Quick Actions</h2>
                  </div>
                  <div className="card-subtitle">
                    Common hospital tasks
                  </div>
                </div>
                
                <div className="quick-actions">
                  <div className="action-list">
                    <button className="action-btn">
                      <Stethoscope className="w-4 h-4" />
                      Manage Doctors
                    </button>
                    <button className="action-btn">
                      <Calendar className="w-4 h-4" />
                      View Appointments
                    </button>
                    <button className="action-btn">
                      <Users className="w-4 h-4" />
                      Patient Records
                    </button>
                    <button className="action-btn">
                      <Building2 className="w-4 h-4" />
                      Hospital Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 