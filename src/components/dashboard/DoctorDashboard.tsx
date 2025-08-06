'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTimeSlots, addTimeSlot, getWeeklySchedules, addWeeklySchedule, updateWeeklySchedule, getAppointments, updateInStorage, getPatients, getHospitals, getDoctors } from '@/utils/storage';
import { TimeSlot, Appointment, User, Hospital, WeeklySchedule } from '@/types';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  Stethoscope, 
  TrendingUp, 
  Activity, 
  Heart,
  Bell,
  Settings,
  ChevronDown,
  LogOut
} from 'lucide-react';

interface DoctorDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export default function DoctorDashboard({ currentUser, onLogout }: DoctorDashboardProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    maxPatients: 1
  });
  const [weeklySchedule, setWeeklySchedule] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
    startTime: '',
    endTime: '',
    maxPatients: 1
  });

  const loadData = useCallback(() => {
    const allTimeSlots = getTimeSlots();
    const allAppointments = getAppointments();
    const allHospitals = getHospitals();
    
    console.log('Doctor Dashboard - Loaded data:', {
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      totalAppointments: allAppointments.length,
      totalTimeSlots: allTimeSlots.length,
      myAppointments: allAppointments.filter(apt => apt.doctorId === currentUser.id).length,
      myTimeSlots: allTimeSlots.filter(slot => slot.doctorId === currentUser.id).length,
      allAppointmentDoctorIds: [...new Set(allAppointments.map(apt => apt.doctorId))],
      sampleAppointments: allAppointments.slice(0, 3).map(apt => ({
        id: apt.id,
        doctorId: apt.doctorId,
        patientId: apt.patientId,
        date: apt.date,
        status: apt.status
      }))
    });
    
    setTimeSlots(allTimeSlots);
    setWeeklySchedules(getWeeklySchedules());
    setAppointments(allAppointments);
    setHospitals(allHospitals);
  }, [currentUser.id, currentUser.name]);

  useEffect(() => {
    loadData();
    // Real-time updates
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    
    const slot: TimeSlot = {
      id: Date.now().toString(),
      doctorId: currentUser.id,
      date: newSlot.date,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      isAvailable: true,
      maxPatients: newSlot.maxPatients,
      currentPatients: 0,
      createdAt: new Date().toISOString()
    };

    addTimeSlot(slot);
    setNewSlot({ date: '', startTime: '', endTime: '', maxPatients: 1 });
    setShowAddSlot(false);
    loadData();
  };

  const handleAppointmentAction = (appointmentId: string, action: 'confirm' | 'complete' | 'cancel') => {
    const appointments = getAppointments();
    const appointment = appointments.find(a => a.id === appointmentId);
    
    if (appointment) {
      let newStatus: 'scheduled' | 'completed' | 'cancelled';
      
      switch (action) {
        case 'confirm':
          newStatus = 'scheduled';
          break;
        case 'complete':
          newStatus = 'completed';
          break;
        case 'cancel':
          newStatus = 'cancelled';
          break;
        default:
          return;
      }

      const updatedAppointment = { ...appointment, status: newStatus };
      updateInStorage('appointments', updatedAppointment);
      loadData();
    }
  };

  const handleWeeklySchedule = (e: React.FormEvent) => {
    e.preventDefault();
    
    const schedule: WeeklySchedule = {
      id: Date.now().toString(),
      doctorId: currentUser.id,
      monday: weeklySchedule.monday,
      tuesday: weeklySchedule.tuesday,
      wednesday: weeklySchedule.wednesday,
      thursday: weeklySchedule.thursday,
      friday: weeklySchedule.friday,
      saturday: weeklySchedule.saturday,
      sunday: weeklySchedule.sunday,
      startTime: weeklySchedule.startTime,
      endTime: weeklySchedule.endTime,
      maxPatients: weeklySchedule.maxPatients,
      createdAt: new Date().toISOString()
    };

    // Check if doctor already has a weekly schedule
    const existingSchedule = weeklySchedules.find(s => s.doctorId === currentUser.id);
    if (existingSchedule) {
      updateWeeklySchedule({ ...schedule, id: existingSchedule.id });
    } else {
      addWeeklySchedule(schedule);
    }

    // Generate time slots for the next 4 weeks based on the schedule
    generateWeeklySlots(schedule);
    
    setWeeklySchedule({
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
      startTime: '',
      endTime: '',
      maxPatients: 1
    });
    setShowWeeklySchedule(false);
    loadData();
  };

  const generateWeeklySlots = (schedule: WeeklySchedule) => {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    
    // Generate slots for the next 4 weeks
    for (let week = 0; week < 4; week++) {
      for (let day = 0; day < 7; day++) {
        const dayName = daysOfWeek[day] as keyof Pick<WeeklySchedule, 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>;
        
        if (schedule[dayName]) {
          const slotDate = new Date(today);
          slotDate.setDate(today.getDate() + (week * 7) + day);
          
          // Only create slots for future dates
          if (slotDate >= today) {
            const slot: TimeSlot = {
              id: Date.now().toString() + `_${week}_${day}`,
              doctorId: currentUser.id,
              date: slotDate.toISOString().split('T')[0],
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              isAvailable: true,
              maxPatients: schedule.maxPatients,
              currentPatients: 0,
              createdAt: new Date().toISOString()
            };
            
            // Check if slot already exists for this date and time
            const existingSlots = getTimeSlots();
            const slotExists = existingSlots.find(s => 
              s.doctorId === currentUser.id && 
              s.date === slot.date && 
              s.startTime === slot.startTime
            );
            
            if (!slotExists) {
              addTimeSlot(slot);
            }
          }
        }
      }
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <span className="status-badge info">Scheduled</span>;
      case 'completed':
        return <span className="status-badge success">Completed</span>;
      case 'cancelled':
        return <span className="status-badge error">Cancelled</span>;
      default:
        return <span className="status-badge info">{status}</span>;
    }
  };

  const myTimeSlots = timeSlots.filter(slot => slot.doctorId === currentUser.id);
  const myAppointments = appointments.filter(apt => apt.doctorId === currentUser.id);
  const todayAppointments = myAppointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]);
  
  // Get hospital name from hospitalId
  const getHospitalName = () => {
    const hospital = hospitals.find(h => h.id === currentUser.hospitalId);
    return hospital ? hospital.name : 'Hospital';
  };

  // Function to fix appointment doctor ID mismatch
  const fixAppointmentDoctorIdMismatch = () => {
    const allAppointments = getAppointments();
    const allDoctors = getDoctors();
    
    // Find appointments that have doctor IDs that don't exist
    const orphanedAppointments = allAppointments.filter(appointment => {
      const doctor = allDoctors.find(d => d.id === appointment.doctorId);
      return !doctor; // Appointment has a doctor ID that doesn't exist
    });
    
    if (orphanedAppointments.length > 0) {
      console.log(`Found ${orphanedAppointments.length} orphaned appointments, assigning to current doctor`);
      
      // Assign orphaned appointments to the current doctor
      orphanedAppointments.forEach(appointment => {
        const updatedAppointment = { ...appointment, doctorId: currentUser.id };
        updateInStorage('appointments', updatedAppointment);
      });
      
      // Reload data
      loadData();
      
      alert(`Assigned ${orphanedAppointments.length} orphaned appointments to Dr. ${currentUser.name}`);
    } else {
      alert('No orphaned appointments found to fix.');
    }
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
                <p>Doctor Portal</p>
              </div>
            </div>
            
            <div className="header-actions">
              <div className="notification-badge">
                <Bell className="w-6 h-6" />
                <span className="badge">{todayAppointments.length}</span>
              </div>
              
              <div className="settings-icon">
                <Settings className="w-6 h-6" />
              </div>
              
              <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="user-avatar">
                  <span>D</span>
                </div>
                <div className="user-info">
                  <h3>Dr. {currentUser.name}</h3>
                  <p>{currentUser.email}</p>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                
                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        <span>D</span>
                      </div>
                      <div className="dropdown-info">
                        <h4>Dr. {currentUser.name}</h4>
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
                        <Stethoscope className="w-4 h-4" />
                        Profile
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
                <h1>Welcome back, Dr. {currentUser.name}!</h1>
                <p>Manage your appointments and time slots efficiently</p>
                <div className="stats-overview">
                  <div className="stat-item">
                    <div className="stat-number stat-doctors">{myTimeSlots.length}</div>
                    <div className="stat-label">Time Slots</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number stat-patients">{myAppointments.length}</div>
                    <div className="stat-label">Total Appointments</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{todayAppointments.length}</div>
                    <div className="stat-label">Today&apos;s Appointments</div>
                  </div>
                </div>
              </div>
              <div className="welcome-icon">
                <Stethoscope className="w-16 h-16" />
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon blue">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-card-title">Available Slots</div>
              <div className="stat-card-number">{myTimeSlots.filter(slot => slot.isAvailable).length}</div>
              <div className="stat-card-description">Open time slots</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon green">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-card-title">Today&apos;s Patients</div>
              <div className="stat-card-number">{todayAppointments.length}</div>
              <div className="stat-card-description">Scheduled today</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon purple">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-card-title">Completed</div>
              <div className="stat-card-number">{myAppointments.filter(apt => apt.status === 'completed').length}</div>
              <div className="stat-card-description">Finished appointments</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon orange">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-card-title">Total Patients</div>
              <div className="stat-card-number">{new Set(myAppointments.map(apt => apt.patientId)).size}</div>
              <div className="stat-card-description">Unique patients</div>
            </div>
          </section>

          {/* Main Layout */}
          <div className="main-layout">
            {/* Left Side - Time Slots and Appointments */}
            <div>
              {/* Add Time Slot */}
              <div className="content-card" style={{ marginBottom: '32px' }}>
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-title-icon green">
                      <Plus className="w-5 h-5" />
                    </div>
                    <h2>Add Time Slot</h2>
                  </div>
                  <div className="card-subtitle">
                    Create new availability for patients
                  </div>
                  <div className="card-actions">
                    <button
                      onClick={() => setShowAddSlot(!showAddSlot)}
                      className="btn btn-primary"
                    >
                      <Plus className="w-4 h-4" />
                      Add Slot
                    </button>
                    <button
                      onClick={() => setShowWeeklySchedule(!showWeeklySchedule)}
                      className="btn btn-secondary"
                      style={{ marginLeft: '8px' }}
                    >
                      <Calendar className="w-4 h-4" />
                      Weekly Schedule
                    </button>
                  </div>
                </div>

                {showAddSlot && (
                  <div className="form-section slide-up">
                    <form onSubmit={handleAddSlot}>
                      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1a202c' }}>
                        Create New Time Slot
                      </h3>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Date *</label>
                          <input
                            type="date"
                            value={newSlot.date}
                            onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                            required
                            className="form-input"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Start Time *</label>
                          <input
                            type="time"
                            value={newSlot.startTime}
                            onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                            required
                            className="form-input"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">End Time *</label>
                          <input
                            type="time"
                            value={newSlot.endTime}
                            onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                            required
                            className="form-input"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Max Patients *</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={newSlot.maxPatients}
                            onChange={(e) => setNewSlot({...newSlot, maxPatients: parseInt(e.target.value)})}
                            required
                            className="form-input"
                          />
                        </div>
                      </div>
                      
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                          <Plus className="w-4 h-4" />
                          Add Time Slot
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddSlot(false)}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Weekly Schedule */}
              {showWeeklySchedule && (
                <div className="content-card" style={{ marginBottom: '32px' }}>
                  <div className="form-section slide-up">
                    <form onSubmit={handleWeeklySchedule}>
                      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1a202c' }}>
                        Set Weekly Schedule
                      </h3>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Start Time *</label>
                          <input
                            type="time"
                            value={weeklySchedule.startTime}
                            onChange={(e) => setWeeklySchedule({...weeklySchedule, startTime: e.target.value})}
                            required
                            className="form-input"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">End Time *</label>
                          <input
                            type="time"
                            value={weeklySchedule.endTime}
                            onChange={(e) => setWeeklySchedule({...weeklySchedule, endTime: e.target.value})}
                            required
                            className="form-input"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Max Patients per Slot *</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={weeklySchedule.maxPatients}
                            onChange={(e) => setWeeklySchedule({...weeklySchedule, maxPatients: parseInt(e.target.value)})}
                            required
                            className="form-input"
                          />
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '24px' }}>
                        <label className="form-label">Available Days</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginTop: '8px' }}>
                          {[
                            { key: 'monday', label: 'Monday' },
                            { key: 'tuesday', label: 'Tuesday' },
                            { key: 'wednesday', label: 'Wednesday' },
                            { key: 'thursday', label: 'Thursday' },
                            { key: 'friday', label: 'Friday' },
                            { key: 'saturday', label: 'Saturday' },
                            { key: 'sunday', label: 'Sunday' }
                          ].map(({ key, label }) => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={weeklySchedule[key as keyof typeof weeklySchedule] as boolean}
                                onChange={(e) => setWeeklySchedule({
                                  ...weeklySchedule,
                                  [key]: e.target.checked
                                })}
                                style={{ width: '16px', height: '16px' }}
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                          <Calendar className="w-4 h-4" />
                          Set Weekly Schedule
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowWeeklySchedule(false)}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Time Slots List */}
              <div className="content-card" style={{ marginBottom: '32px' }}>
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-title-icon blue">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h2>Your Time Slots</h2>
                  </div>
                  <div className="card-subtitle">
                    {myTimeSlots.length} time slots created
                  </div>
                </div>
                
                <div className="status-list">
                  {myTimeSlots.length > 0 ? (
                    myTimeSlots.map((slot) => (
                      <div key={slot.id} className="status-item">
                        <div className="status-left">
                          <div className="status-icon blue">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="status-text blue">{slot.startTime} - {slot.endTime}</span>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                              {slot.date} • {slot.currentPatients}/{slot.maxPatients} patients
                            </div>
                          </div>
                        </div>
                        <span className={`status-badge ${slot.isAvailable ? 'success' : 'error'}`}>
                          {slot.isAvailable ? 'Available' : 'Full'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Clock className="w-10 h-10" />
                      </div>
                      <h3>No Time Slots</h3>
                      <p>Create your first time slot to start accepting appointments.</p>
                      <button
                        onClick={() => setShowAddSlot(true)}
                        className="btn btn-primary"
                      >
                        <Plus className="w-4 h-4" />
                        Add First Slot
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointments */}
              <div className="content-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-title-icon purple">
                      <Users className="w-5 h-5" />
                    </div>
                    <h2>Your Appointments</h2>
                  </div>
                  <div className="card-subtitle">
                    {myAppointments.length} total appointments
                  </div>
                </div>
                
                <div className="status-list">
                  {myAppointments.length > 0 ? (
                    myAppointments.map((appointment) => {
                      const patients = getPatients();
                      const patient = patients.find(p => p.id === appointment.patientId);
                      return (
                        <div key={appointment.id} className="status-item">
                          <div className="status-left">
                            <div className="status-icon purple">
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="status-text purple">{patient?.name || 'Unknown Patient'}</span>
                              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                {appointment.date} • {appointment.startTime}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {getStatusBadge(appointment.status)}
                            {appointment.status === 'scheduled' && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  onClick={() => handleAppointmentAction(appointment.id, 'complete')}
                                  className="admin-use-btn"
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                                  className="reset-button"
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Users className="w-10 h-10" />
                      </div>
                      <h3>No Appointments</h3>
                      <p>Appointments will appear here once patients book your time slots.</p>
                      
                      {/* Debug Information */}
                      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fde68a' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#d97706' }}>🔍 Debug: Appointment Data</h4>
                        <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>Total appointments in system: {appointments.length}</p>
                        <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>Your appointments: {myAppointments.length}</p>
                        <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>Your doctor ID: {currentUser.id}</p>
                        <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '8px' }}>Doctor IDs in appointments: {[...new Set(appointments.map(apt => apt.doctorId))].join(', ')}</p>
                        
                        {appointments.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <p style={{ fontSize: '12px', color: '#92400e', fontWeight: '600' }}>Sample appointments:</p>
                            {appointments.slice(0, 3).map((apt) => (
                              <div key={apt.id} style={{ fontSize: '11px', marginBottom: '2px', padding: '2px', backgroundColor: '#fef2f2', borderRadius: '2px' }}>
                                ID: {apt.id} | Doctor: {apt.doctorId} | Patient: {apt.patientId} | Date: {apt.date} | Status: {apt.status}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Fix Button */}
                        <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#dbeafe', borderRadius: '4px', border: '1px solid #93c5fd' }}>
                          <p style={{ fontSize: '12px', color: '#1e40af', marginBottom: '8px' }}>
                            <strong>🔧 Fix Appointment ID Mismatch:</strong> If appointments exist but aren&apos;t showing, click below to fix the doctor ID mismatch.
                          </p>
                          <button
                            onClick={fixAppointmentDoctorIdMismatch}
                            className="btn btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            🔧 Fix Appointments for Dr. {currentUser.name}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Quick Stats */}
            <div>
              {/* Today's Schedule */}
              <div className="content-card" style={{ marginBottom: '32px' }}>
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-title-icon orange">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h2>Today&apos;s Schedule</h2>
                  </div>
                  <div className="card-subtitle">
                    {todayAppointments.length} appointments today
                  </div>
                </div>
                
                <div className="status-list">
                  {todayAppointments.length > 0 ? (
                    todayAppointments.map((appointment) => {
                      const patients = getPatients();
                      const patient = patients.find(p => p.id === appointment.patientId);
                      return (
                        <div key={appointment.id} className="status-item">
                          <div className="status-left">
                            <div className="status-icon orange">
                              <Clock className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="status-text orange">{patient?.name || 'Unknown Patient'}</span>
                              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                {appointment.startTime}
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                      <Calendar className="w-8 h-8 mx-auto mb-2" />
                      <p>No appointments scheduled for today</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="content-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-title-icon green">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h2>Quick Actions</h2>
                  </div>
                  <div className="card-subtitle">
                    Common doctor tasks
                  </div>
                </div>
                
                <div className="quick-actions">
                  <div className="action-list">
                    <button className="action-btn">
                      <Plus className="w-4 h-4" />
                      Add Time Slot
                    </button>
                    <button className="action-btn">
                      <Users className="w-4 h-4" />
                      View Patients
                    </button>
                    <button className="action-btn">
                      <Calendar className="w-4 h-4" />
                      Schedule
                    </button>
                    <button className="action-btn">
                      <TrendingUp className="w-4 h-4" />
                      Reports
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