export type UserRole = 'admin' | 'hospital_admin' | 'doctor' | 'patient';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  hospitalId?: string;
  password?: string;
  isFirstLogin?: boolean;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  helpline?: string;
  description?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  hospitalId: string;
  hospitalName: string;
  qualification?: string;
  consultationFee?: number;
  isFirstLogin?: boolean;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age?: number;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxPatients: number;
  currentPatients: number;
  createdAt: string;
}

export interface WeeklySchedule {
  id: string;
  doctorId: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  startTime: string;
  endTime: string;
  maxPatients: number;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  timeSlotId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface SearchFilters {
  specialization?: string;
  doctorName?: string;
  hospitalName?: string;
  address?: string;
  date?: string;
  time?: string;
}

export interface Specialization {
  id: string;
  name: string;
  description?: string;
} 