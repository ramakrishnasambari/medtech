'use client';

import { useState, useEffect } from 'react';
import { getDoctors, getTimeSlots, getAppointments, addAppointment, updateInStorage, getPatients } from '@/utils/storage';
import { Doctor, TimeSlot, Appointment, User, SearchFilters, Patient } from '@/types';
import { 
  Search, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Stethoscope, 
  Heart, 
  CalendarDays,
  AlertCircle,
  Filter,
  Star,
  XCircle,
  LogOut
} from 'lucide-react';

interface PatientDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export default function PatientDashboard({ currentUser, onLogout }: PatientDashboardProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    specialization: '',
    doctorName: '',
    hospitalName: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    const loadData = () => {
      const allDoctors = getDoctors();
      const allTimeSlots = getTimeSlots();
      const allAppointments = getAppointments();
      const allPatients = getPatients();
      
      console.log('Loaded data:', {
        doctors: allDoctors.length,
        timeSlots: allTimeSlots.length,
        appointments: allAppointments.length,
        patients: allPatients.length
      });
      
      setDoctors(allDoctors);
      setTimeSlots(allTimeSlots);
      setAppointments(allAppointments.filter(apt => apt.patientId === currentUser.id));
      
      const patientData = allPatients.find(p => p.id === currentUser.id);
      setPatientInfo(patientData ?? null);
    };

    loadData();
  }, [currentUser.id]);

  const handleLogout = () => {
    onLogout();
  };

  // Filter doctors based on search criteria
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSpecialization = !searchFilters.specialization || 
      doctor.specialization.toLowerCase().includes(searchFilters.specialization.toLowerCase());
    
    const matchesDoctorName = !searchFilters.doctorName || 
      doctor.name.toLowerCase().includes(searchFilters.doctorName.toLowerCase());
    
    const matchesHospitalName = !searchFilters.hospitalName || 
      doctor.hospitalName.toLowerCase().includes(searchFilters.hospitalName.toLowerCase());
    
    return matchesSpecialization && matchesDoctorName && matchesHospitalName;
  });

  // Filter available time slots
  const availableSlots = timeSlots.filter(slot => {
    // Basic availability check
    if (!slot.isAvailable || slot.currentPatients >= slot.maxPatients) {
      return false;
    }
    
    // Filter by selected date if specified
    if (searchFilters.date) {
      // Normalize date formats for comparison
      const slotDate = new Date(slot.date).toISOString().split('T')[0];
      const filterDate = searchFilters.date;
      
      if (slotDate !== filterDate) {
        return false;
      }
    }
    
    return true;
  });

  // Get slots for the selected doctor
  const doctorSlots = availableSlots.filter(slot => slot.doctorId === selectedDoctor?.id);
  
  // Debug logging
  console.log('Debug info:', {
    selectedDoctor: selectedDoctor?.name,
    selectedDoctorId: selectedDoctor?.id,
    totalSlots: timeSlots.length,
    availableSlots: availableSlots.length,
    doctorSlots: doctorSlots.length,
    searchFilters,
    allDoctors: doctors.map(d => ({ id: d.id, name: d.name, email: d.email })),
    allDoctorIds: [...new Set(doctors.map(d => d.id))],
    allSlotDoctorIds: [...new Set(timeSlots.map(s => s.doctorId))],
    sampleTimeSlots: timeSlots.slice(0, 3).map(s => ({
      id: s.id,
      doctorId: s.doctorId,
      date: s.date,
      startTime: s.startTime,
      isAvailable: s.isAvailable,
      currentPatients: s.currentPatients,
      maxPatients: s.maxPatients
    }))
  });

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    
    setIsBooking(true);
    
    try {
      const appointment: Appointment = {
        id: Date.now().toString(),
        patientId: currentUser.id,
        doctorId: selectedDoctor.id,
        timeSlotId: selectedSlot.id,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        status: 'scheduled',
        notes: '',
        createdAt: new Date().toISOString()
      };

      addAppointment(appointment);
      
      // Update time slot
      const updatedSlot = { ...selectedSlot, currentPatients: selectedSlot.currentPatients + 1 };
      updateInStorage('timeSlots', updatedSlot);

      setAppointments(prev => [...prev, appointment]);
      setSelectedDoctor(null);
      setSelectedSlot(null);
      
      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelAppointment = (appointmentId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      const appointments = getAppointments();
      const appointment = appointments.find(a => a.id === appointmentId);
      
      if (appointment) {
        const updatedAppointment = { ...appointment, status: 'cancelled' as const };
        updateInStorage('appointments', updatedAppointment);
        
        // Update the time slot to reflect the cancellation
        const timeSlots = getTimeSlots();
        const slot = timeSlots.find(s => s.id === appointment.timeSlotId);
        if (slot) {
          const updatedSlot = { 
            ...slot, 
            currentPatients: Math.max(0, slot.currentPatients - 1),
            isAvailable: true
          };
          updateInStorage('timeSlots', updatedSlot);
        }
        
        // Reload data
        const allAppointments = getAppointments();
        setAppointments(allAppointments.filter(apt => apt.patientId === currentUser.id));
        
        alert('Appointment cancelled successfully!');
      }
    }
  };

  // Function to fix doctor ID mismatch in time slots
  const fixDoctorIdMismatch = (doctorEmail: string, correctDoctorId: string) => {
    const allTimeSlots = getTimeSlots();
    const allDoctors = getDoctors();
    
    // Find the doctor by email
    const doctor = allDoctors.find(d => d.email === doctorEmail);
    if (!doctor) {
      console.log('Doctor not found:', doctorEmail);
      return;
    }
    
    // Find time slots that should belong to this doctor but have wrong ID
    const slotsToUpdate = allTimeSlots.filter(slot => {
      // Check if this slot was created for this doctor but has wrong ID
      // We'll assume slots created around the same time as the doctor belong to them
      const slotDate = new Date(slot.createdAt);
      const doctorDate = new Date(doctor.createdAt);
      const timeDiff = Math.abs(slotDate.getTime() - doctorDate.getTime());
      
      // If slot was created within 5 minutes of doctor creation, it likely belongs to them
      return timeDiff < 5 * 60 * 1000 && slot.doctorId !== correctDoctorId;
    });
    
    // If no slots found by time, try to find orphaned slots (slots with doctor IDs that don't exist)
    if (slotsToUpdate.length === 0) {
      const orphanedSlots = allTimeSlots.filter(slot => {
        const slotDoctor = allDoctors.find(d => d.id === slot.doctorId);
        return !slotDoctor; // Slot has a doctor ID that doesn't exist
      });
      
      // Assign orphaned slots to the selected doctor
      orphanedSlots.forEach(slot => {
        const updatedSlot = { ...slot, doctorId: correctDoctorId };
        updateInStorage('timeSlots', updatedSlot);
      });
      
      if (orphanedSlots.length > 0) {
        alert(`Assigned ${orphanedSlots.length} orphaned slots to Dr. ${doctor.name}`);
        // Reload data
        setTimeSlots(getTimeSlots());
      } else {
        alert('No orphaned slots found to fix.');
      }
    } else {
      // Update the found slots
      slotsToUpdate.forEach(slot => {
        const updatedSlot = { ...slot, doctorId: correctDoctorId };
        updateInStorage('timeSlots', updatedSlot);
      });
      
      alert(`Fixed ${slotsToUpdate.length} slots for Dr. ${doctor.name}`);
      // Reload data
      setTimeSlots(getTimeSlots());
    }
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
                <p>Patient Portal</p>
              </div>
            </div>
            
            <div className="header-actions">
              <div className="notification-badge">
                <AlertCircle className="w-6 h-6 text-gray-600" />
                <span className="badge">2</span>
              </div>
              
              <div className="user-profile">
                <div className="user-avatar">
                  <span>{patientInfo?.name?.charAt(0) || 'P'}</span>
                </div>
                <div className="user-info">
                  <h3>{patientInfo?.name || 'Patient'}</h3>
                  <p>{currentUser.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="admin-use-btn"
                  style={{ marginLeft: '12px' }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
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
                <h1>Welcome back, {patientInfo?.name || 'Patient'}!</h1>
                <p>Find and book appointments with our healthcare professionals</p>
                <div className="stats-overview">
                  <div className="stat-item">
                    <div className="stat-number stat-doctors">{doctors.length}</div>
                    <div className="stat-label">Available Doctors</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number stat-patients">{appointments.length}</div>
                    <div className="stat-label">Your Appointments</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{availableSlots.length}</div>
                    <div className="stat-label">Available Slots</div>
                  </div>
                </div>
              </div>
              <div className="welcome-icon">
                <UserIcon className="w-16 h-16" />
              </div>
            </div>
          </section>

          {/* Main Layout */}
          <div className="main-layout">
            {/* Left Side - Doctor Search and Booking */}
            <div>
              {/* Search Filters */}
              <div className="content-card" style={{ marginBottom: '32px' }}>
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-title-icon blue">
                      <Search className="w-5 h-5" />
                    </div>
                    <h2>Find a Doctor</h2>
                  </div>
                  <div className="card-subtitle">
                    Search and filter healthcare professionals
                  </div>
                </div>
                
                                 <div className="form-section">
                   <div className="form-grid">
                     <div className="form-group">
                       <label className="form-label">Specialization</label>
                       <input
                         type="text"
                         value={searchFilters.specialization}
                         onChange={(e) => setSearchFilters({...searchFilters, specialization: e.target.value})}
                         placeholder="e.g., Cardiology, Neurology"
                         className="form-input"
                       />
                     </div>
                     
                     <div className="form-group">
                       <label className="form-label">Doctor Name</label>
                       <input
                         type="text"
                         value={searchFilters.doctorName}
                         onChange={(e) => setSearchFilters({...searchFilters, doctorName: e.target.value})}
                         placeholder="e.g., Dr. Smith"
                         className="form-input"
                       />
                     </div>
                     
                     <div className="form-group">
                       <label className="form-label">Hospital Name</label>
                       <input
                         type="text"
                         value={searchFilters.hospitalName}
                         onChange={(e) => setSearchFilters({...searchFilters, hospitalName: e.target.value})}
                         placeholder="e.g., City Hospital"
                         className="form-input"
                       />
                     </div>
                     
                     <div className="form-group">
                       <label className="form-label">Preferred Date</label>
                       <input
                         type="date"
                         value={searchFilters.date}
                         onChange={(e) => setSearchFilters({...searchFilters, date: e.target.value})}
                         className="form-input"
                       />
                     </div>
                     
                     <div className="form-actions" style={{ marginTop: '16px' }}>
                       <button
                         type="button"
                         onClick={() => setSearchFilters({
                           specialization: '',
                           doctorName: '',
                           hospitalName: '',
                           date: '',
                           time: ''
                         })}
                         className="btn btn-secondary"
                       >
                         <Filter className="w-4 h-4" />
                         Clear Filters
                       </button>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Doctors List */}
              <div className="content-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-title-icon green">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <h2>Available Doctors</h2>
                  </div>
                  <div className="card-subtitle">
                    {filteredDoctors.length} doctors found
                  </div>
                </div>
                
                <div className="hospital-list">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                      <div 
                        key={doctor.id} 
                        className={`hospital-item ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                        onClick={() => setSelectedDoctor(doctor)}
                      >
                        <div className="hospital-header">
                          <div className="hospital-icon">
                            <UserIcon className="w-8 h-8" />
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
                                <Star className="hospital-detail-icon" />
                                <span>4.8/5 Rating</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Stethoscope className="w-10 h-10" />
                      </div>
                      <h3>No Doctors Found</h3>
                      <p>Try adjusting your search filters to find available healthcare professionals.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Time Slots and Appointments */}
            <div>
              {/* Time Slots */}
              {selectedDoctor && (
                <div className="content-card" style={{ marginBottom: '32px' }}>
                  <div className="card-header">
                    <div className="card-title">
                      <div className="card-title-icon purple">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <h2>Available Time Slots</h2>
                    </div>
                    <div className="card-subtitle">
                      Select a time slot for Dr. {selectedDoctor.name}
                    </div>
                  </div>
                  
                                     <div className="status-list">
                     {doctorSlots.length > 0 ? (
                       doctorSlots.map((slot) => (
                         <div 
                           key={slot.id}
                           className={`status-item ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                           onClick={() => setSelectedSlot(slot)}
                         >
                           <div className="status-left">
                             <div className="status-icon purple">
                               <Clock className="w-4 h-4" />
                             </div>
                             <div>
                               <span className="status-text purple">{slot.startTime} - {slot.endTime}</span>
                               <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                 {slot.date} • {slot.currentPatients}/{slot.maxPatients} patients
                               </div>
                             </div>
                           </div>
                           <button className="admin-use-btn">Select</button>
                         </div>
                       ))
                                           ) : (
                        // Show all slots for this doctor (for debugging)
                        timeSlots.filter(slot => slot.doctorId === selectedDoctor.id).length > 0 ? (
                          <div>
                            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fde68a' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#d97706' }}>⚠️ Debug: Showing ALL slots for Dr. {selectedDoctor.name}</h4>
                              <p style={{ fontSize: '12px', color: '#92400e' }}>Available slots filtered out due to availability/date constraints. Showing all slots below:</p>
                            </div>
                            {timeSlots
                              .filter(slot => slot.doctorId === selectedDoctor.id)
                              .map((slot) => (
                                <div 
                                  key={slot.id}
                                  className={`status-item ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                                  onClick={() => setSelectedSlot(slot)}
                                  style={{ 
                                    opacity: slot.isAvailable && slot.currentPatients < slot.maxPatients ? 1 : 0.6,
                                    border: slot.isAvailable && slot.currentPatients < slot.maxPatients ? '2px solid #10b981' : '2px solid #ef4444'
                                  }}
                                >
                                  <div className="status-left">
                                    <div className="status-icon purple">
                                      <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <span className="status-text purple">{slot.startTime} - {slot.endTime}</span>
                                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                        {slot.date} • {slot.currentPatients}/{slot.maxPatients} patients
                                        {!slot.isAvailable && ' • NOT AVAILABLE'}
                                        {slot.currentPatients >= slot.maxPatients && ' • FULL'}
                                      </div>
                                    </div>
                                  </div>
                                  <button className="admin-use-btn" disabled={!slot.isAvailable || slot.currentPatients >= slot.maxPatients}>
                                    {slot.isAvailable && slot.currentPatients < slot.maxPatients ? 'Select' : 'Unavailable'}
                                  </button>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="empty-state">
                            <div className="empty-state-icon">
                              <Clock className="w-10 h-10" />
                            </div>
                            <h3>No Available Slots</h3>
                            <p>
                                                             {searchFilters.date 
                                 ? `No time slots available for Dr. ${selectedDoctor.name} on ${searchFilters.date}. Try selecting a different date.`
                                 : `No time slots available for Dr. ${selectedDoctor.name}. The doctor may not have created any slots yet.`
                               }
                            </p>
                            <div style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
                                                             <p>Total slots in system: {timeSlots.length}</p>
                               <p>Available slots: {availableSlots.length}</p>
                               <p>Doctor&apos;s slots: {timeSlots.filter(s => s.doctorId === selectedDoctor.id).length}</p>
                               <p>Doctor&apos;s available slots: {timeSlots.filter(s => s.doctorId === selectedDoctor.id && s.isAvailable && s.currentPatients < s.maxPatients).length}</p>
                            </div>
                            {searchFilters.date && (
                              <button
                                onClick={() => setSearchFilters({...searchFilters, date: ''})}
                                className="btn btn-secondary"
                                style={{ marginTop: '12px' }}
                              >
                                <Filter className="w-4 h-4" />
                                Clear Date Filter
                              </button>
                            )}
                            
                                                         {/* Debug: Show all slots for this doctor */}
                             {timeSlots.filter(s => s.doctorId === selectedDoctor.id).length > 0 && (
                               <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                 <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>All Slots for Dr. {selectedDoctor.name}:</h4>
                                 {timeSlots
                                   .filter(s => s.doctorId === selectedDoctor.id)
                                   .map((slot) => (
                                     <div key={slot.id} style={{ fontSize: '12px', marginBottom: '4px', padding: '4px', backgroundColor: slot.isAvailable ? '#f0fdf4' : '#fef2f2', borderRadius: '4px' }}>
                                       {slot.date} {slot.startTime}-{slot.endTime} | 
                                       Available: {slot.isAvailable ? 'Yes' : 'No'} | 
                                       Patients: {slot.currentPatients}/{slot.maxPatients}
                                     </div>
                                   ))}
                               </div>
                             )}
                             
                             {/* Debug: Show ALL slots in system */}
                             <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fde68a' }}>
                               <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#d97706' }}>🔍 Debug: ALL Slots in System:</h4>
                               <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '8px' }}>Doctor IDs in slots: {[...new Set(timeSlots.map(s => s.doctorId))].join(', ')}</p>
                               <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '8px' }}>Current doctor ID: {selectedDoctor.id}</p>
                               {timeSlots.slice(0, 5).map((slot) => (
                                 <div key={slot.id} style={{ fontSize: '12px', marginBottom: '4px', padding: '4px', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
                                   Slot ID: {slot.id} | Doctor ID: {slot.doctorId} | {slot.date} {slot.startTime}-{slot.endTime}
                                 </div>
                               ))}
                               {timeSlots.length > 5 && (
                                 <div style={{ fontSize: '12px', color: '#92400e', fontStyle: 'italic' }}>
                                   ... and {timeSlots.length - 5} more slots
                                 </div>
                               )}
                               
                               {/* Fix ID Mismatch Button */}
                               <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#dbeafe', borderRadius: '4px', border: '1px solid #93c5fd' }}>
                                 <p style={{ fontSize: '12px', color: '#1e40af', marginBottom: '8px' }}>
                                   <strong>🔧 Fix ID Mismatch:</strong> If slots exist but aren&apos;t showing, click below to fix the doctor ID mismatch.
                                 </p>
                                 <button
                                   onClick={() => fixDoctorIdMismatch(selectedDoctor.email, selectedDoctor.id)}
                                   className="btn btn-secondary"
                                   style={{ fontSize: '12px', padding: '6px 12px' }}
                                 >
                                   🔧 Fix Slots for Dr. {selectedDoctor.name}
                                 </button>
                               </div>
                             </div>
                          </div>
                        )
                      )}
                   </div>
                  
                  {selectedSlot && (
                    <div className="form-section">
                      <button
                        onClick={handleBookAppointment}
                        disabled={isBooking}
                        className="login-button"
                      >
                        {isBooking ? (
                          <div className="loading-spinner"></div>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4" />
                            Book Appointment
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Your Appointments */}
              <div className="content-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-title-icon orange">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <h2>Your Appointments</h2>
                  </div>
                  <div className="card-subtitle">
                    {appointments.length} upcoming appointments
                  </div>
                </div>
                
                <div className="status-list">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => {
                      const doctor = doctors.find(d => d.id === appointment.doctorId);
                      return (
                                                 <div key={appointment.id} className="status-item">
                           <div className="status-left">
                             <div className="status-icon blue">
                               <Calendar className="w-4 h-4" />
                             </div>
                             <div>
                               <span className="status-text blue">Dr. {doctor?.name || 'Unknown'}</span>
                               <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                 {appointment.date} • {appointment.startTime}
                               </div>
                             </div>
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             {getStatusBadge(appointment.status)}
                             {appointment.status === 'scheduled' && (
                               <button
                                 onClick={() => handleCancelAppointment(appointment.id)}
                                 className="btn btn-secondary"
                                 style={{ padding: '4px 8px', fontSize: '12px' }}
                               >
                                 <XCircle className="w-3 h-3" />
                                 Cancel
                               </button>
                             )}
                           </div>
                         </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <CalendarDays className="w-10 h-10" />
                      </div>
                      <h3>No Appointments</h3>
                                             <p>You haven&apos;t booked any appointments yet. Start by finding a doctor above.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 