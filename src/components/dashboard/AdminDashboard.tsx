'use client';

import { useState, useEffect } from 'react';
import { getHospitals, addHospital, updateHospital, getDoctors, getPatients, getAppointments, addUser, getUsers, updateInStorage } from '@/utils/storage';
import { Hospital, User, Doctor, Patient, Appointment } from '@/types';
import { 
  Plus, 
  Building2, 
  Users, 
  Stethoscope, 
  Calendar, 
  MapPin, 
  Phone, 
  Clock, 
  Mail, 
  TrendingUp,
  Activity,
  Heart,
  Shield,
  Bell,
  Settings,
  ChevronDown,
  LogOut,
  Edit
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export default function AdminDashboard({ currentUser, onLogout }: AdminDashboardProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [newHospital, setNewHospital] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    helpline: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setHospitals(getHospitals());
    setDoctors(getDoctors());
    setPatients(getPatients());
    setAppointments(getAppointments());
  };

  const handleAddHospital = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hospital: Hospital = {
      id: Date.now().toString(),
      name: newHospital.name,
      email: newHospital.email,
      phone: newHospital.phone,
      address: newHospital.address,
      helpline: newHospital.helpline || undefined,
      description: newHospital.description || undefined,
      createdAt: new Date().toISOString()
    };

    // Create hospital admin user with email as username and "testing" as password
    const hospitalAdmin: User = {
      id: Date.now().toString() + '_admin',
      email: newHospital.email,
      phone: newHospital.phone,
      name: `${newHospital.name} Administrator`,
      role: 'hospital_admin',
      hospitalId: hospital.id,
      password: 'testing',
      isFirstLogin: true,
      createdAt: new Date().toISOString()
    };

    addHospital(hospital);
    addUser(hospitalAdmin);
    
    // Show success message with login credentials
    alert(`Hospital "${newHospital.name}" created successfully!\n\nLogin Credentials:\nEmail: ${newHospital.email}\nPassword: testing`);
    
    setNewHospital({ name: '', email: '', phone: '', address: '', helpline: '', description: '' });
    setShowAddForm(false);
    loadData();
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleEditHospital = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setShowEditForm(true);
  };

  const handleUpdateHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHospital) return;

    const updatedHospital: Hospital = {
      ...editingHospital,
      name: newHospital.name,
      email: newHospital.email,
      phone: newHospital.phone,
      address: newHospital.address,
      helpline: newHospital.helpline || undefined,
      description: newHospital.description || undefined,
    };

    updateHospital(updatedHospital);
    
    // Update the hospital admin user name if it exists
    const users = getUsers();
    const hospitalAdmin = users.find(user => user.hospitalId === editingHospital.id);
    if (hospitalAdmin) {
      const updatedUser = {
        ...hospitalAdmin,
        name: `${newHospital.name} Administrator`,
        email: newHospital.email,
        phone: newHospital.phone,
      };
      updateInStorage('users', updatedUser);
    }
    
    alert(`Hospital "${newHospital.name}" updated successfully!`);
    
    setNewHospital({ name: '', email: '', phone: '', address: '', helpline: '', description: '' });
    setShowEditForm(false);
    setEditingHospital(null);
    loadData();
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingHospital(null);
    setNewHospital({ name: '', email: '', phone: '', address: '', helpline: '', description: '' });
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
                <h1>Med Network</h1>
                <p>Healthcare Management</p>
              </div>
            </div>
            
            <div className="header-actions">
              <div className="notification-badge">
                <Bell className="w-6 h-6" />
                <span className="badge">3</span>
              </div>
              
              <div className="settings-icon">
                <Settings className="w-6 h-6" />
              </div>
              
              <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="user-avatar">
                  <span>S</span>
                </div>
                <div className="user-info">
                  <h3>System Administrator</h3>
                  <p>admin@mednetwork.com</p>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                
                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        <span>S</span>
                      </div>
                      <div className="dropdown-info">
                        <h4>System Administrator</h4>
                        <p>admin@mednetwork.com</p>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-actions">
                      <button className="dropdown-action">
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button className="dropdown-action">
                        <Shield className="w-4 h-4" />
                        Security
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
                <h1>Welcome back, Administrator</h1>
                <p>Manage your healthcare network and monitor system performance</p>
                <div className="stats-overview">
                  <div className="stat-item">
                    <div className="stat-number stat-hospitals">{hospitals.length}</div>
                    <div className="stat-label">Hospitals</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number stat-doctors">{doctors.length}</div>
                    <div className="stat-label">Doctors</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number stat-patients">{patients.length}</div>
                    <div className="stat-label">Patients</div>
                  </div>
                </div>
              </div>
              <div className="welcome-icon">
                <Activity className="w-16 h-16" />
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon blue">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-card-title">Total Hospitals</div>
              <div className="stat-card-number stat-hospitals">{hospitals.length}</div>
              <div className="stat-card-description">Healthcare facilities</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon green">
                  <Stethoscope className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-card-title">Total Doctors</div>
              <div className="stat-card-number stat-doctors">{doctors.length}</div>
              <div className="stat-card-description">Medical professionals</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon purple">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-card-title">Total Patients</div>
              <div className="stat-card-number stat-patients">{patients.length}</div>
              <div className="stat-card-description">Registered patients</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon orange">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-card-title">Total Appointments</div>
              <div className="stat-card-number">{appointments.length}</div>
              <div className="stat-card-description">Scheduled visits</div>
            </div>
          </section>

          {/* Main Layout */}
          <div className="main-layout">
            {/* Hospitals Management */}
            <div className="content-card">
              <div className="card-header">
                <div className="card-title">
                  <div className="card-title-icon blue">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h2>Manage Hospitals</h2>
                </div>
                <div className="card-subtitle">
                  Add and manage healthcare facilities in your network
                </div>
                <div className="card-actions">
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn btn-primary"
                  >
                    <Plus className="w-4 h-4" />
                    Add Hospital
                  </button>
                </div>
              </div>

              {showAddForm && (
                <div className="form-section slide-up">
                  <form onSubmit={handleAddHospital}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1a202c' }}>
                      Add New Hospital
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Hospital Name *</label>
                        <input
                          type="text"
                          value={newHospital.name}
                          onChange={(e) => setNewHospital({...newHospital, name: e.target.value})}
                          placeholder="Enter hospital name"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          value={newHospital.email}
                          onChange={(e) => setNewHospital({...newHospital, email: e.target.value})}
                          placeholder="Enter email address"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Phone *</label>
                        <input
                          type="text"
                          value={newHospital.phone}
                          onChange={(e) => setNewHospital({...newHospital, phone: e.target.value})}
                          placeholder="Enter phone number"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Address *</label>
                        <input
                          type="text"
                          value={newHospital.address}
                          onChange={(e) => setNewHospital({...newHospital, address: e.target.value})}
                          placeholder="Enter address"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Helpline</label>
                        <input
                          type="text"
                          value={newHospital.helpline}
                          onChange={(e) => setNewHospital({...newHospital, helpline: e.target.value})}
                          placeholder="Enter helpline number"
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <input
                          type="text"
                          value={newHospital.description}
                          onChange={(e) => setNewHospital({...newHospital, description: e.target.value})}
                          placeholder="Enter description"
                          className="form-input"
                        />
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        <Plus className="w-4 h-4" />
                        Add Hospital
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

              {showEditForm && editingHospital && (
                <div className="form-section slide-up">
                  <form onSubmit={handleUpdateHospital}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1a202c' }}>
                      Edit Hospital: {editingHospital.name}
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Hospital Name *</label>
                        <input
                          type="text"
                          value={newHospital.name}
                          onChange={(e) => setNewHospital({...newHospital, name: e.target.value})}
                          placeholder="Enter hospital name"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          value={newHospital.email}
                          onChange={(e) => setNewHospital({...newHospital, email: e.target.value})}
                          placeholder="Enter email address"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Phone *</label>
                        <input
                          type="text"
                          value={newHospital.phone}
                          onChange={(e) => setNewHospital({...newHospital, phone: e.target.value})}
                          placeholder="Enter phone number"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Address *</label>
                        <input
                          type="text"
                          value={newHospital.address}
                          onChange={(e) => setNewHospital({...newHospital, address: e.target.value})}
                          placeholder="Enter address"
                          required
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Helpline</label>
                        <input
                          type="text"
                          value={newHospital.helpline}
                          onChange={(e) => setNewHospital({...newHospital, helpline: e.target.value})}
                          placeholder="Enter helpline number"
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <input
                          type="text"
                          value={newHospital.description}
                          onChange={(e) => setNewHospital({...newHospital, description: e.target.value})}
                          placeholder="Enter description"
                          className="form-input"
                        />
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        Update Hospital
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

              {/* Hospitals List */}
              <div className="hospital-list">
                {hospitals.length > 0 ? (
                  hospitals.map((hospital) => (
                    <div key={hospital.id} className="hospital-item">
                      <div className="hospital-header">
                        <div className="hospital-icon">
                          <Building2 className="w-8 h-8" />
                        </div>
                        <div className="hospital-info">
                          <h3>{hospital.name}</h3>
                          <div className="hospital-details">
                            <div className="hospital-detail">
                              <Mail className="hospital-detail-icon" />
                              <span>{hospital.email}</span>
                            </div>
                            <div className="hospital-detail">
                              <Phone className="hospital-detail-icon" />
                              <span>{hospital.phone}</span>
                            </div>
                            <div className="hospital-detail">
                              <MapPin className="hospital-detail-icon" />
                              <span>{hospital.address}</span>
                            </div>
                            {hospital.helpline && (
                              <div className="hospital-detail">
                                <Clock className="hospital-detail-icon" />
                                <span>Helpline: {hospital.helpline}</span>
                              </div>
                            )}
                          </div>
                          {hospital.description && (
                            <div className="hospital-description">
                              &ldquo;{hospital.description}&rdquo;
                            </div>
                          )}
                        </div>
                        <div className="hospital-actions">
                          <button
                            onClick={() => {
                              setNewHospital({
                                name: hospital.name,
                                email: hospital.email,
                                phone: hospital.phone,
                                address: hospital.address,
                                helpline: hospital.helpline || '',
                                description: hospital.description || ''
                              });
                              handleEditHospital(hospital);
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
                      <Building2 className="w-10 h-10" />
                    </div>
                    <h3>No Hospitals Added</h3>
                    <p>
                      Start building your healthcare network by adding your first hospital facility.
                    </p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="btn btn-primary"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Hospital
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* System Health */}
              <div className="content-card" style={{ marginBottom: '32px' }}>
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-title-icon green">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h2>System Health</h2>
                  </div>
                  <div className="card-subtitle">
                    Overview of system performance and activity
                  </div>
                </div>
                
                <div className="status-list">
                  <div className="status-item green">
                    <div className="status-left">
                      <div className="status-icon green">
                        <Heart className="w-4 h-4" />
                      </div>
                      <span className="status-text green">System Status</span>
                    </div>
                    <span className="status-badge success">Healthy</span>
                  </div>
                  
                  <div className="status-item blue">
                    <div className="status-left">
                      <div className="status-icon blue">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="status-text blue">Security</span>
                    </div>
                    <span className="status-badge info">Protected</span>
                  </div>
                  
                  <div className="status-item purple">
                    <div className="status-left">
                      <div className="status-icon purple">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="status-text purple">Performance</span>
                    </div>
                    <span className="status-badge info">Optimal</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="content-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-title-icon purple">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h2>Quick Actions</h2>
                  </div>
                  <div className="card-subtitle">
                    Common administrative tasks
                  </div>
                </div>
                
                <div className="quick-actions">
                  <div className="action-list">
                    <button className="action-btn">
                      <Building2 className="w-4 h-4" />
                      Manage Hospitals
                    </button>
                    <button className="action-btn">
                      <Stethoscope className="w-4 h-4" />
                      View Doctors
                    </button>
                    <button className="action-btn">
                      <Users className="w-4 h-4" />
                      Patient Records
                    </button>
                    <button className="action-btn">
                      <Calendar className="w-4 h-4" />
                      Appointment Reports
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