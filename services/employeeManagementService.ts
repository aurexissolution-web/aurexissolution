// services/employeeManagementService.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { auth } from '../firebase/config';

// Employee Profile Interface
export interface EmployeeProfile {
  id?: string;
  userId: string;
  email: string;
  displayName: string;
  role: string;
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  dateOfJoining?: Date;
  status: 'active' | 'inactive' | 'on-leave';
  profileImageUrl?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// Task Interface
export interface Task {
  id?: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'overdue';
  progress: number; // 0-100
  deadline: Timestamp | Date | string;
  assignedBy: string;
  assignedByName: string;
  attachments: TaskAttachment[];
  adminFiles?: TaskAttachment[]; // Files uploaded by admin for freelancer to download
  freelancerSubmissions?: TaskAttachment[]; // Files uploaded by freelancer as completed work
  progressNotes?: string; // Notes added when updating progress
  submissionNotes?: string; // Notes added when submitting completed work
  submittedAt?: Timestamp | Date; // When freelancer submitted the work
  lastUpdated?: Timestamp | Date; // Last time progress was updated
  assignedTo?: string; // Who the task is assigned to (email or uniqueId)
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// Task Attachment Interface
export interface TaskAttachment {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType?: string;
  uploadedAt?: Date;
}

// Leave Request Interface
export interface LeaveRequest {
  id?: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  leaveType: 'sick' | 'vacation' | 'personal' | 'other';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// Work Report Interface
export interface WorkReport {
  id?: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  date: string;
  totalHours: number;
  tasksCompleted: number;
  productivity: number;
  notes?: string;
  createdAt: Timestamp | Date;
}

// Helper function to ensure authentication  
// Note: This app uses localStorage for auth, not Firebase Auth
const ensureAuthenticated = async (): Promise<void> => {
  // Check if user is logged in via localStorage
  const savedUser = localStorage.getItem('user');
  if (!savedUser) {
    throw new Error('User not authenticated. Please log in.');
  }
  
  try {
    const userData = JSON.parse(savedUser);
    if (!userData || !userData.id) {
      throw new Error('Invalid user session. Please log in again.');
    }
  } catch (error) {
    throw new Error('Invalid user session. Please log in again.');
  }
};

// Helper function to safely convert deadline to Date
const convertToDate = (deadline: any): Date => {
  if (!deadline) return new Date();
  if (deadline.toDate && typeof deadline.toDate === 'function') {
    return deadline.toDate(); // Firestore Timestamp
  }
  if (deadline instanceof Date) {
    return deadline;
  }
  return new Date(deadline); // String or number
};

// Employee Profile Management
export const createEmployeeProfile = async (profile: Omit<EmployeeProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    await ensureAuthenticated();
    const profileData: any = {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, 'employeeProfiles'), profileData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating employee profile:', error);
    throw error;
  }
};

export const updateEmployeeProfile = async (profileId: string, updates: Partial<EmployeeProfile>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'employeeProfiles', profileId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating employee profile:', error);
    throw error;
  }
};

export const deleteEmployeeProfile = async (profileId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'employeeProfiles', profileId));
  } catch (error) {
    console.error('Error deleting employee profile:', error);
    throw error;
  }
};

export const getEmployeeProfile = async (employeeId: string): Promise<EmployeeProfile | null> => {
  try {
    const q = query(collection(db, 'employeeProfiles'), where('userId', '==', employeeId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as EmployeeProfile;
  } catch (error) {
    console.error('Error getting employee profile:', error);
    return null;
  }
};

export const getAllEmployeeProfiles = async (): Promise<EmployeeProfile[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'employeeProfiles'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmployeeProfile));
  } catch (error) {
    console.error('Error getting all employee profiles:', error);
    return [];
  }
};

// Task Management
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    await ensureAuthenticated();
    const taskData: any = {
      ...task,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, 'tasks'), taskData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const getEmployeeTasks = async (employeeId: string): Promise<Task[]> => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('employeeId', '==', employeeId)
    );
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    
    // Sort by deadline on client side
    tasks.sort((a, b) => {
      const aDeadline = convertToDate(a.deadline);
      const bDeadline = convertToDate(b.deadline);
      return aDeadline.getTime() - bDeadline.getTime();
    });
    
    return tasks;
  } catch (error) {
    console.error('Error getting employee tasks:', error);
    return [];
  }
};

export const getAllTasks = async (): Promise<Task[]> => {
  try {
    const q = query(collection(db, 'tasks'));
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    
    // Sort by deadline on client side
    tasks.sort((a, b) => {
      const aDeadline = convertToDate(a.deadline);
      const bDeadline = convertToDate(b.deadline);
      return aDeadline.getTime() - bDeadline.getTime();
    });
    
    return tasks;
  } catch (error) {
    console.error('Error getting all tasks:', error);
    return [];
  }
};

// Subscribe to tasks
export const subscribeToTasks = (employeeId: string | null, callback: (tasks: Task[]) => void): (() => void) => {
  let q;
  if (employeeId) {
    q = query(
      collection(db, 'tasks'),
      where('employeeId', '==', employeeId)
    );
  } else {
    q = query(collection(db, 'tasks'));
  }

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    
    // Sort by deadline on client side to avoid index requirement
    tasks.sort((a, b) => {
      const aDeadline = convertToDate(a.deadline);
      const bDeadline = convertToDate(b.deadline);
      return aDeadline.getTime() - bDeadline.getTime();
    });
    
    callback(tasks);
  });
};

// Leave Management
export const createLeaveRequest = async (leave: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    await ensureAuthenticated();
    const leaveData: any = {
      ...leave,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, 'leaveRequests'), leaveData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating leave request:', error);
    throw error;
  }
};

export const updateLeaveRequest = async (leaveId: string, updates: Partial<LeaveRequest>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'leaveRequests', leaveId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating leave request:', error);
    throw error;
  }
};

export const getEmployeeLeaveRequests = async (employeeId: string): Promise<LeaveRequest[]> => {
  try {
    const q = query(
      collection(db, 'leaveRequests'),
      where('employeeId', '==', employeeId),
      orderBy('startDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest));
  } catch (error) {
    console.error('Error getting leave requests:', error);
    return [];
  }
};

export const getAllLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const q = query(collection(db, 'leaveRequests'), orderBy('startDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest));
  } catch (error) {
    console.error('Error getting all leave requests:', error);
    return [];
  }
};

// Work Reports
export const generateWorkReport = async (employeeId: string, date: string): Promise<WorkReport> => {
  try {
    // This would aggregate data from time tracking and tasks
    // For now, return a basic structure
    const report: WorkReport = {
      employeeId,
      employeeName: '',
      employeeEmail: '',
      date,
      totalHours: 0,
      tasksCompleted: 0,
      productivity: 0,
      createdAt: new Date()
    };
    return report;
  } catch (error) {
    console.error('Error generating work report:', error);
    throw error;
  }
};

// Export functionality
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return `"${value}"`;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

