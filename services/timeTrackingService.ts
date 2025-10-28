// services/timeTrackingService.ts
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
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

export interface TimeTrackingRecord {
  id?: string;
  employeeId: string;
  employeeEmail: string;
  employeeUniqueId: string;
  clockInTime: Timestamp | Date;
  clockOutTime?: Timestamp | Date;
  workHours: number;
  date: string; // YYYY-MM-DD format
  status: 'clocked-in' | 'clocked-out';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface EmployeeTimeData {
  id: string;
  email: string;
  uniqueId: string;
  role: string;
  isClockedIn: boolean;
  clockInTime?: Date;
  clockOutTime?: Date;
  totalHoursToday: number;
  totalHoursThisWeek: number;
  totalHoursThisMonth: number;
  lastActivity?: Date;
  status: 'active' | 'inactive' | 'break';
}

interface UserData {
  id: string;
  email: string;
  uniqueId: string;
  role: string;
  displayName?: string;
  [key: string]: any;
}

// Clock in an employee
export const clockInEmployee = async (
  employeeId: string,
  employeeEmail: string,
  employeeUniqueId: string
): Promise<string> => {
  try {
    // Check authentication via localStorage
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      throw new Error('User not authenticated. Please log in.');
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Check if employee is already clocked in today
    const existingRecord = await getTodayTimeRecord(employeeId, today);
    if (existingRecord && existingRecord.status === 'clocked-in') {
      throw new Error('Employee is already clocked in today');
    }
    
    const timeRecord: any = {
      employeeId,
      employeeEmail,
      employeeUniqueId,
      clockInTime: serverTimestamp(),
      workHours: 0,
      date: today,
      status: 'clocked-in',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('📝 Creating clock-in record:', { employeeId, date: today, status: 'clocked-in' });
    const docRef = await addDoc(collection(db, 'timeTracking'), timeRecord);
    console.log('✅ Clock-in record created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error clocking in employee:', error);
    throw error;
  }
};

// Clock out an employee
export const clockOutEmployee = async (
  employeeId: string,
  employeeEmail: string,
  employeeUniqueId: string
): Promise<void> => {
  try {
    // Check authentication via localStorage
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      throw new Error('User not authenticated. Please log in.');
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Find today's clock-in record
    const existingRecord = await getTodayTimeRecord(employeeId, today);
    if (!existingRecord || existingRecord.status !== 'clocked-in') {
      throw new Error('No active clock-in record found for today');
    }
    
    const clockOutTime = new Date();
    const clockInTime = existingRecord.clockInTime instanceof Timestamp 
      ? existingRecord.clockInTime.toDate() 
      : new Date(existingRecord.clockInTime);
    
    const workHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
    
    console.log('📝 Updating clock-out record:', { 
      recordId: existingRecord.id, 
      workHours: Math.round(workHours * 100) / 100, 
      status: 'clocked-out' 
    });
    
    await updateDoc(doc(db, 'timeTracking', existingRecord.id!), {
      clockOutTime: serverTimestamp(),
      workHours: Math.round(workHours * 100) / 100, // Round to 2 decimal places
      status: 'clocked-out',
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Clock-out record updated successfully');
  } catch (error) {
    console.error('Error clocking out employee:', error);
    throw error;
  }
};

// Get today's time record for an employee
export const getTodayTimeRecord = async (
  employeeId: string, 
  date: string
): Promise<TimeTrackingRecord | null> => {
  try {
    const q = query(
      collection(db, 'timeTracking'),
      where('employeeId', '==', employeeId),
      where('date', '==', date)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    // Sort manually in JavaScript to avoid needing a composite index
    const records = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TimeTrackingRecord));
    
    // Return the most recent record (by createdAt)
    records.sort((a, b) => {
      const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });
    
    return records[0];
  } catch (error) {
    console.error('Error getting today\'s time record:', error);
    return null;
  }
};

// Get employee's time records for a date range
export const getEmployeeTimeRecords = async (
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<TimeTrackingRecord[]> => {
  try {
    const q = query(
      collection(db, 'timeTracking'),
      where('employeeId', '==', employeeId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TimeTrackingRecord[];
  } catch (error) {
    console.error('Error getting employee time records:', error);
    return [];
  }
};

// Get all employees' time data for admin monitoring
export const getAllEmployeesTimeData = async (): Promise<EmployeeTimeData[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    
    // Get all time records for today
    const todayQuery = query(
      collection(db, 'timeTracking'),
      where('date', '==', today)
    );
    
    const todaySnapshot = await getDocs(todayQuery);
    const todayRecords = todaySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TimeTrackingRecord[];
    
    // Get all unique employee IDs from time tracking records (any date)
    const allTimeRecordsQuery = query(collection(db, 'timeTracking'));
    const allTimeRecordsSnapshot = await getDocs(allTimeRecordsQuery);
    
    const uniqueEmployeeIds = new Set(
      allTimeRecordsSnapshot.docs.map(doc => doc.data().employeeId)
    );
    
    // Get user details for employees who have time tracking records
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    const employees = usersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as UserData))
      .filter(user => user.role !== 'admin' && uniqueEmployeeIds.has(user.id));
    
    // Build employee time data - only for employees with time tracking records
    const employeeTimeData: EmployeeTimeData[] = [];
    
    for (const employee of employees) {
      const todayRecord = todayRecords.find(record => record.employeeId === employee.id);
      
      // Calculate weekly hours
      const weeklyStart = startOfWeek.toISOString().split('T')[0];
      const weeklyRecords = await getEmployeeTimeRecords(employee.id, weeklyStart, today);
      const weeklyHours = weeklyRecords.reduce((sum, record) => sum + (record.workHours || 0), 0);
      
      // Calculate monthly hours
      const monthlyStart = startOfMonth.toISOString().split('T')[0];
      const monthlyRecords = await getEmployeeTimeRecords(employee.id, monthlyStart, today);
      const monthlyHours = monthlyRecords.reduce((sum, record) => sum + (record.workHours || 0), 0);
      
      const isClockedIn = todayRecord?.status === 'clocked-in';
      const clockInTime = todayRecord?.clockInTime 
        ? (todayRecord.clockInTime instanceof Timestamp 
            ? todayRecord.clockInTime.toDate() 
            : new Date(todayRecord.clockInTime))
        : undefined;
      
      const clockOutTime = todayRecord?.clockOutTime 
        ? (todayRecord.clockOutTime instanceof Timestamp 
            ? todayRecord.clockOutTime.toDate() 
            : new Date(todayRecord.clockOutTime))
        : undefined;
      
      employeeTimeData.push({
        id: employee.id,
        email: employee.email,
        uniqueId: employee.uniqueId,
        role: employee.role,
        isClockedIn,
        clockInTime,
        clockOutTime,
        totalHoursToday: todayRecord?.workHours || 0,
        totalHoursThisWeek: Math.round(weeklyHours * 100) / 100,
        totalHoursThisMonth: Math.round(monthlyHours * 100) / 100,
        lastActivity: todayRecord?.updatedAt 
          ? (todayRecord.updatedAt instanceof Timestamp 
              ? todayRecord.updatedAt.toDate() 
              : new Date(todayRecord.updatedAt))
          : undefined,
        status: isClockedIn ? 'active' : 'inactive'
      });
    }
    
    return employeeTimeData;
  } catch (error) {
    console.error('Error getting all employees time data:', error);
    return [];
  }
};

// Subscribe to real-time employee time data updates
export const subscribeToEmployeeTimeData = (
  callback: (data: EmployeeTimeData[]) => void
): (() => void) => {
  const today = new Date().toISOString().split('T')[0];
  
  console.log('🔔 Setting up admin monitoring subscription for date:', today);
  
  const q = query(
    collection(db, 'timeTracking'),
    where('date', '==', today)
  );
  
  return onSnapshot(q, async (snapshot) => {
    try {
      console.log('🔔 Admin monitoring snapshot received:', {
        empty: snapshot.empty,
        size: snapshot.size,
        docChanges: snapshot.docChanges().map(change => ({
          type: change.type,
          id: change.doc.id,
          employeeId: change.doc.data().employeeId,
          status: change.doc.data().status
        }))
      });
      
      const timeData = await getAllEmployeesTimeData();
      console.log('🔔 Fetched employee time data:', {
        count: timeData.length,
        employees: timeData.map(emp => ({
          id: emp.id,
          email: emp.email,
          isClockedIn: emp.isClockedIn,
          totalHoursToday: emp.totalHoursToday
        }))
      });
      
      callback(timeData);
    } catch (error) {
      console.error('❌ Error in time data subscription:', error);
      callback([]);
    }
  });
};

// Subscribe to specific employee's time tracking
export const subscribeToEmployeeTimeTracking = (
  employeeId: string,
  callback: (record: TimeTrackingRecord | null) => void
): (() => void) => {
  const today = new Date().toISOString().split('T')[0];
  
  console.log('📡 Setting up time tracking subscription:', { employeeId, date: today });
  
  const q = query(
    collection(db, 'timeTracking'),
    where('employeeId', '==', employeeId),
    where('date', '==', today)
  );
  
  return onSnapshot(q, (snapshot) => {
    console.log('📡 Time tracking snapshot received:', { 
      empty: snapshot.empty, 
      size: snapshot.size,
      docChanges: snapshot.docChanges().map(change => ({
        type: change.type,
        id: change.doc.id,
        status: change.doc.data().status
      }))
    });
    
    if (snapshot.empty) {
      console.log('📡 No records found - employee is clocked out');
      callback(null);
      return;
    }
    
    // Sort manually in JavaScript to avoid needing a composite index
    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TimeTrackingRecord));
    
    records.sort((a, b) => {
      const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });
    
    console.log('📡 Returning most recent record:', { 
      id: records[0].id, 
      status: records[0].status,
      workHours: records[0].workHours
    });
    
    callback(records[0]);
  });
};

// Add employees to monitoring system (create initial time tracking records)
export const addEmployeesToMonitoring = async (employeeIds: string[]): Promise<void> => {
  try {
    // Check authentication via localStorage
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      throw new Error('User not authenticated. Please log in.');
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Get employee details from users collection
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
    
    const employeesToAdd = allUsers.filter(user => 
      employeeIds.includes(user.id) && 
      user.role !== 'admin' && 
      user.role !== undefined && 
      user.email !== undefined
    );
    
    if (employeesToAdd.length === 0) {
      throw new Error('No valid employees found to add. Make sure the selected users have the correct role.');
    }
    
    // Create initial time tracking records for each employee
    const promises = employeesToAdd.map(async (employee) => {
      // Check if employee already has a record for today
      const existingRecord = await getTodayTimeRecord(employee.id, today);
      if (existingRecord) {
        return;
      }
      
      const timeRecord: any = {
        employeeId: employee.id,
        employeeEmail: employee.email,
        employeeUniqueId: employee.uniqueId,
        clockInTime: serverTimestamp(),
        workHours: 0,
        date: today,
        status: 'clocked-out', // Start as clocked out
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      try {
        await addDoc(collection(db, 'timeTracking'), timeRecord);
      } catch (error) {
        console.error(`Error creating record for ${employee.email}:`, error);
        throw error;
      }
    });
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Error adding employees to monitoring:', error);
    throw error;
  }
};
