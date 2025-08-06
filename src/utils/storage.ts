import { Hospital, Doctor, Patient, TimeSlot, Appointment, User, Specialization, WeeklySchedule } from '@/types';

const STORAGE_KEYS = {
  HOSPITALS: 'hospitals',
  DOCTORS: 'doctors',
  PATIENTS: 'patients',
  TIME_SLOTS: 'timeSlots',
  WEEKLY_SCHEDULES: 'weeklySchedules',
  APPOINTMENTS: 'appointments',
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  SPECIALIZATIONS: 'specializations',
} as const;

// Generic storage functions
export const getFromStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const setToStorage = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const addToStorage = <T>(key: string, item: T): void => {
  const data = getFromStorage<T>(key);
  data.push(item);
  setToStorage(key, data);
};

export const updateInStorage = <T extends { id: string }>(key: string, item: T): void => {
  const data = getFromStorage<T>(key);
  const index = data.findIndex(d => d.id === item.id);
  if (index !== -1) {
    data[index] = item;
    setToStorage(key, data);
  }
};

export const removeFromStorage = <T extends { id: string }>(key: string, id: string): void => {
  const data = getFromStorage<T>(key);
  const filtered = data.filter(item => item.id !== id);
  setToStorage(key, filtered);
};

// Specific storage functions
export const getHospitals = (): Hospital[] => getFromStorage<Hospital>(STORAGE_KEYS.HOSPITALS);
export const setHospitals = (hospitals: Hospital[]): void => setToStorage(STORAGE_KEYS.HOSPITALS, hospitals);
export const addHospital = (hospital: Hospital): void => addToStorage(STORAGE_KEYS.HOSPITALS, hospital);
export const updateHospital = (hospital: Hospital): void => updateInStorage(STORAGE_KEYS.HOSPITALS, hospital);

export const getDoctors = (): Doctor[] => getFromStorage<Doctor>(STORAGE_KEYS.DOCTORS);
export const setDoctors = (doctors: Doctor[]): void => setToStorage(STORAGE_KEYS.DOCTORS, doctors);
export const addDoctor = (doctor: Doctor): void => addToStorage(STORAGE_KEYS.DOCTORS, doctor);
export const updateDoctor = (doctor: Doctor): void => updateInStorage(STORAGE_KEYS.DOCTORS, doctor);

export const getPatients = (): Patient[] => getFromStorage<Patient>(STORAGE_KEYS.PATIENTS);
export const setPatients = (patients: Patient[]): void => setToStorage(STORAGE_KEYS.PATIENTS, patients);
export const addPatient = (patient: Patient): void => addToStorage(STORAGE_KEYS.PATIENTS, patient);

export const getTimeSlots = (): TimeSlot[] => getFromStorage<TimeSlot>(STORAGE_KEYS.TIME_SLOTS);
export const setTimeSlots = (timeSlots: TimeSlot[]): void => setToStorage(STORAGE_KEYS.TIME_SLOTS, timeSlots);
export const addTimeSlot = (timeSlot: TimeSlot): void => addToStorage(STORAGE_KEYS.TIME_SLOTS, timeSlot);
export const updateTimeSlot = (timeSlot: TimeSlot): void => updateInStorage(STORAGE_KEYS.TIME_SLOTS, timeSlot);

export const getWeeklySchedules = (): WeeklySchedule[] => getFromStorage<WeeklySchedule>(STORAGE_KEYS.WEEKLY_SCHEDULES);
export const setWeeklySchedules = (schedules: WeeklySchedule[]): void => setToStorage(STORAGE_KEYS.WEEKLY_SCHEDULES, schedules);
export const addWeeklySchedule = (schedule: WeeklySchedule): void => addToStorage(STORAGE_KEYS.WEEKLY_SCHEDULES, schedule);
export const updateWeeklySchedule = (schedule: WeeklySchedule): void => updateInStorage(STORAGE_KEYS.WEEKLY_SCHEDULES, schedule);

export const getAppointments = (): Appointment[] => getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
export const setAppointments = (appointments: Appointment[]): void => setToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
export const addAppointment = (appointment: Appointment): void => addToStorage(STORAGE_KEYS.APPOINTMENTS, appointment);

export const getUsers = (): User[] => getFromStorage<User>(STORAGE_KEYS.USERS);
export const setUsers = (users: User[]): void => setToStorage(STORAGE_KEYS.USERS, users);
export const addUser = (user: User): void => addToStorage(STORAGE_KEYS.USERS, user);

export const getSpecializations = (): Specialization[] => getFromStorage<Specialization>(STORAGE_KEYS.SPECIALIZATIONS);
export const setSpecializations = (specializations: Specialization[]): void => setToStorage(STORAGE_KEYS.SPECIALIZATIONS, specializations);

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

// Clear all demo data and reinitialize
export const resetDemoData = (): void => {
  // Clear all storage
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Reinitialize demo data
  initializeDemoData();
};

// Initialize demo data
export const initializeDemoData = (): void => {
  // Initialize specializations
  if (getSpecializations().length === 0) {
    const specializations: Specialization[] = [
      { id: '1', name: 'Cardiology', description: 'Heart and cardiovascular system' },
      { id: '2', name: 'Neurology', description: 'Brain and nervous system' },
      { id: '3', name: 'Pediatrics', description: 'Children and adolescents' },
      { id: '4', name: 'Orthopedics', description: 'Bones and joints' },
      { id: '5', name: 'Dermatology', description: 'Skin, hair, and nails' },
      { id: '6', name: 'Psychiatry', description: 'Mental health' },
      { id: '7', name: 'Oncology', description: 'Cancer treatment' },
      { id: '8', name: 'General Medicine', description: 'General health and wellness' },
    ];
    setSpecializations(specializations);
  }

  // Initialize admin user only
  if (getUsers().length === 0) {
    const adminUser: User = {
      id: '1',
      email: 'admin@mednetwork.com',
      name: 'System Administrator',
      role: 'admin',
      password: 'admin123',
      isFirstLogin: false,
      createdAt: new Date().toISOString(),
    };
    setUsers([adminUser]);
  }
}; 