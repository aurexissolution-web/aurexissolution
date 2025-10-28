// services/database.ts
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed';
  progress: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate: string;
  deadline: string;
  team: string[];
  budget: number;
  spent: number;
  deliverables: Deliverable[];
  milestones: Milestone[];
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  assignedTo: string;
  files: string[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  completedDate?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  assignee: string;
  created: Timestamp;
  updated: Timestamp;
  dueDate?: string;
  tags: string[];
  userId: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  description: string;
  paymentMethod?: string;
  paidDate?: string;
  items: InvoiceItem[];
  userId: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Subscription {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'Monthly' | 'Annually';
  status: 'Active' | 'Cancelled' | 'Expired';
  nextBilling: string;
  features: string[];
  userId: string;
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  unit: string;
  icon: string;
  color: string;
  timestamp: Timestamp;
}

// Projects
export const getProjects = async (userId: string): Promise<Project[]> => {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project));
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
};

export const getProject = async (projectId: string): Promise<Project | null> => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (projectSnap.exists()) {
      return {
        id: projectSnap.id,
        ...projectSnap.data()
      } as Project;
    }
    return null;
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
};

export const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    console.log('Creating project with data:', project);
    
    // Clean the project data by removing undefined values
    const cleanProjectData = Object.fromEntries(
      Object.entries(project).filter(([_, value]) => value !== undefined)
    );
    
    console.log('Cleaned project data:', cleanProjectData);
    
    const projectsRef = collection(db, 'projects');
    const docRef = await addDoc(projectsRef, {
      ...cleanProjectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Project created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<void> => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Tickets
export const getTickets = async (userId: string): Promise<Ticket[]> => {
  try {
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, where('userId', '==', userId), orderBy('created', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Ticket));
  } catch (error) {
    console.error('Error getting tickets:', error);
    throw error;
  }
};

export const getTicket = async (ticketId: string): Promise<Ticket | null> => {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    const ticketSnap = await getDoc(ticketRef);
    
    if (ticketSnap.exists()) {
      return {
        id: ticketSnap.id,
        ...ticketSnap.data()
      } as Ticket;
    }
    return null;
  } catch (error) {
    console.error('Error getting ticket:', error);
    throw error;
  }
};

export const createTicket = async (ticket: Omit<Ticket, 'id' | 'created' | 'updated'>): Promise<string> => {
  try {
    console.log('Creating ticket with data:', ticket);
    
    // Clean the ticket data by removing undefined values
    const cleanTicketData = Object.fromEntries(
      Object.entries(ticket).filter(([_, value]) => value !== undefined)
    );
    
    console.log('Cleaned ticket data:', cleanTicketData);
    
    const ticketsRef = collection(db, 'tickets');
    const docRef = await addDoc(ticketsRef, {
      ...cleanTicketData,
      created: serverTimestamp(),
      updated: serverTimestamp()
    });
    console.log('Ticket created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

export const updateTicket = async (ticketId: string, updates: Partial<Ticket>): Promise<void> => {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    await updateDoc(ticketRef, {
      ...updates,
      updated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
};

export const deleteTicket = async (ticketId: string): Promise<void> => {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    await deleteDoc(ticketRef);
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
};

// Invoices
export const getInvoices = async (userId: string): Promise<Invoice[]> => {
  try {
    const invoicesRef = collection(db, 'invoices');
    const q = query(invoicesRef, where('userId', '==', userId), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Invoice));
  } catch (error) {
    console.error('Error getting invoices:', error);
    throw error;
  }
};

export const createInvoice = async (invoice: Omit<Invoice, 'id'>): Promise<string> => {
  try {
    const invoicesRef = collection(db, 'invoices');
    const docRef = await addDoc(invoicesRef, invoice);
    return docRef.id;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

// Subscriptions
export const getSubscriptions = async (userId: string): Promise<Subscription[]> => {
  try {
    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(subscriptionsRef, where('userId', '==', userId), orderBy('nextBilling', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Subscription));
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    throw error;
  }
};

// Analytics
export const getAnalyticsMetrics = async (userId: string): Promise<AnalyticsMetric[]> => {
  try {
    const metricsRef = collection(db, 'analytics');
    const q = query(metricsRef, where('userId', '==', userId), orderBy('timestamp', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AnalyticsMetric));
  } catch (error) {
    console.error('Error getting analytics metrics:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToProjects = (userId: string, callback: (projects: Project[]) => void) => {
  console.log('Setting up projects subscription for user:', userId);
  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, 
    (querySnapshot) => {
      console.log('Projects snapshot received:', querySnapshot.docs.length, 'projects');
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
      callback(projects);
    },
    (error) => {
      console.error('Error in projects subscription:', error);
      callback([]); // Return empty array on error
    }
  );
};

export const subscribeToTickets = (userId: string, callback: (tickets: Ticket[]) => void) => {
  console.log('Setting up tickets subscription for user:', userId);
  const ticketsRef = collection(db, 'tickets');
  
  let q;
  
  // If userId is 'all', admin wants to see all tickets
  if (userId === 'all') {
    q = query(ticketsRef);
  } else {
    // Regular user sees only their tickets
    q = query(ticketsRef, where('userId', '==', userId));
  }
  
  return onSnapshot(q, 
    (querySnapshot) => {
      console.log('Tickets snapshot received:', querySnapshot.docs.length, 'tickets');
      console.log('Tickets data:', querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const tickets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ticket));
      callback(tickets);
    },
    (error) => {
      console.error('Error in tickets subscription:', error);
      callback([]); // Return empty array on error
    }
  );
};

export const subscribeToInvoices = (userId: string, callback: (invoices: Invoice[]) => void) => {
  console.log('Setting up invoices subscription for user:', userId);
  const invoicesRef = collection(db, 'invoices');
  const q = query(invoicesRef, where('userId', '==', userId), orderBy('date', 'desc'));
  
  return onSnapshot(q, 
    (querySnapshot) => {
      console.log('Invoices snapshot received:', querySnapshot.docs.length, 'invoices');
      const invoices = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Invoice));
      callback(invoices);
    },
    (error) => {
      console.error('Error in invoices subscription:', error);
      callback([]); // Return empty array on error
    }
  );
};

export const subscribeToSubscriptions = (userId: string, callback: (subscriptions: Subscription[]) => void) => {
  console.log('Setting up subscriptions subscription for user:', userId);
  const subscriptionsRef = collection(db, 'subscriptions');
  const q = query(subscriptionsRef, where('userId', '==', userId), orderBy('nextBilling', 'asc'));
  
  return onSnapshot(q, 
    (querySnapshot) => {
      console.log('Subscriptions snapshot received:', querySnapshot.docs.length, 'subscriptions');
      const subscriptions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Subscription));
      callback(subscriptions);
    },
    (error) => {
      console.error('Error in subscriptions subscription:', error);
      callback([]); // Return empty array on error
    }
  );
};
