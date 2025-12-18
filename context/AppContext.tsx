import React, { createContext, useState, ReactNode, useEffect, useMemo, useContext } from 'react';
import type { Service, Project, Testimonial, SiteContent, User, Invoice, Quotation, Attachment, ProjectRequest, Message, Founder, LineItem, Post, UserRole, PaymentReceipt, PaymentInvoice, ContactPerson } from '../types';
import { db, auth } from '../firebase/config';
import { 
  collection, onSnapshot, doc, getDoc, getDocs, writeBatch,
  addDoc, updateDoc, deleteDoc, query, setDoc, serverTimestamp, orderBy
} from "firebase/firestore";
import { 
  onAuthStateChanged, createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, signOut, User as FirebaseUser
} from "firebase/auth";
import { GoogleGenAI, Type } from "@google/genai";
import { UniqueCodeGenerator } from '../utils/uniqueCodeGenerator';
import { INITIAL_FOUNDERS, INITIAL_SITE_CONTENT, INITIAL_PROJECTS, INITIAL_SERVICES, INITIAL_TESTIMONIALS } from '../data/initialData';
import { logLogin, logLogout, logUserCreation, logUserUpdate, logUserDeletion } from '../services/auditLogService';
import { getDashboardRoute, hasPermission, Permission } from '../services/permissionsService';

// Mock data import removed - using ONLY Firebase data

export interface TaskAttachment {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType?: string;
  uploadedAt?: Date;
}

export interface Task {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeEmail?: string;
  assignedTo: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  progress: number;
  dueDate: string;
  deadline: string | Date;
  assignedBy: string;
  assignedByName?: string;
  attachments?: TaskAttachment[];
  adminFiles?: TaskAttachment[]; // Files from admin for freelancer to download
  freelancerSubmissions?: TaskAttachment[]; // Files from freelancer as completed work
  progressNotes?: string; // Progress update notes
  submissionNotes?: string; // Submission notes
  submittedAt?: Date | any; // Firebase Timestamp
  lastUpdated?: Date | any; // Firebase Timestamp
  createdAt: Date;
  updatedAt?: Date | any;
  // Commission fields
  commissionRate?: number; // Percentage (e.g., 10 for 10%)
  commissionAmount?: number; // Fixed amount in currency
  budget?: number; // Total budget for the task
}

export interface Commission {
  id: string;
  taskId: string;
  taskTitle: string;
  freelancerEmail: string;
  freelancerId: string;
  freelancerName?: string;
  commissionAmount: number;
  commissionRate?: number;
  taskBudget?: number;
  status: 'pending' | 'processing' | 'paid' | 'rejected';
  completedDate: Date | any;
  paymentDate?: Date | any;
  paymentReceipt?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: Date | any;
  };
  financeNotes?: string;
  processedBy?: string;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface TimeRecord {
  id: string;
  employeeId: string;
  employeeEmail?: string;
  employeeName?: string;
  date: string;
  clockIn: Date;
  clockOut?: Date;
  hoursWorked?: number;
  status: 'clocked-in' | 'clocked-out';
}

export interface Goal {
  id: string;
  employeeId: string;
  employeeName?: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeEmail?: string;
  employeeName?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'on-leave';
  clockIn?: string;
  clockOut?: string;
  hoursWorked?: number;
  notes?: string;
}

export interface PerformanceRating {
  id: string;
  employeeId: string;
  employeeEmail?: string;
  employeeName?: string;
  reviewDate: string | Date;
  reviewer: string;
  overallScore: number;
  technicalSkills: number;
  communication: number;
  teamwork: number;
  productivity: number;
  comments?: string;
}

export interface MarketingMetrics {
  id: string;
  month: string;
  leadsGenerated: number;
  conversionRate: number;
  campaignsActive: number;
  campaignsCompleted: number;
  marketingSpend: number;
  budget: number;
  roi: number;
}

export interface FinancialMetrics {
  id: string;
  period: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  cashFlow: number;
  outstandingInvoices: number;
  payablesDue: number;
}


interface AppContextType {
  user: User | null;
  login: (credential: string, password: string, selectedRole: string) => Promise<{ success: boolean, message: string, requiresPasswordChange?: boolean }>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<{ success: boolean, message: string }>;
  isAdmin: boolean;
  isCustomer: boolean;
  isHR: boolean;
  isFreelancer: boolean;
  isFinanceExecutive: boolean;
  isMarketingHead: boolean;
  isManager: boolean;
  isTeamLead: boolean;
  isNormalEmployee: boolean;
  isLoggingOut: boolean;
  // Permission checking
  checkPermission: (permission: Permission) => boolean;
  // User management (admin only)
  users: User[];
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'hasChangedPassword' | 'isActive'>) => Promise<{ success: boolean, message: string, uniqueId?: string, defaultPassword?: string }>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  // Project management
  projects: Project[];
  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (service: Service) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  testimonials: Testimonial[];
  addTestimonial: (testimonial: Omit<Testimonial, 'id'>) => Promise<void>;
  updateTestimonial: (testimonial: Testimonial) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  siteContent: SiteContent;
  updateSiteContent: (content: SiteContent) => Promise<void>;
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, 'id'>) => Promise<void>;
  updateQuotation: (quotation: Quotation) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;
  attachments: Attachment[];
  addAttachment: (attachment: Omit<Attachment, 'id'>) => Promise<void>;
  updateAttachment: (attachment: Attachment) => Promise<void>;
  deleteAttachment: (id: string) => Promise<void>;
  projectRequests: ProjectRequest[];
  addProjectRequest: (request: Omit<ProjectRequest, 'id'>) => Promise<void>;
  updateProjectRequest: (request: ProjectRequest) => Promise<void>;
  deleteProjectRequest: (id: string) => Promise<void>;
  // Payment Receipts
  paymentReceipts: PaymentReceipt[];
  addPaymentReceipt: (receipt: Omit<PaymentReceipt, 'id'>) => Promise<void>;
  updatePaymentReceipt: (receipt: PaymentReceipt) => Promise<void>;
  deletePaymentReceipt: (id: string) => Promise<void>;
  // Payment Invoices
  paymentInvoices: PaymentInvoice[];
  addPaymentInvoice: (invoice: Omit<PaymentInvoice, 'id'>) => Promise<void>;
  updatePaymentInvoice: (invoice: PaymentInvoice) => Promise<void>;
  deletePaymentInvoice: (id: string) => Promise<void>;
  // Tasks (for employees and freelancers)
  tasks: Task[];
  // Time Records (for employees)
  timeRecords: TimeRecord[];
  // Goals (for employees and teams)
  goals: Goal[];
  // Attendance Records (clock in/out)
  attendanceRecords: AttendanceRecord[];
  // Performance Ratings
  performanceRatings: PerformanceRating[];
  // Marketing Metrics
  marketingMetrics: MarketingMetrics[];
  // Financial Metrics
  financialMetrics: FinancialMetrics[];
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => Promise<boolean>;
  deleteMessage: (id: string) => Promise<void>;
  founders: Founder[];
  updateFounder: (founder: Founder) => Promise<void>;
  seedFounders: () => Promise<void>;
  checkFoundersInDatabase: () => Promise<void>;
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => Promise<void>;
  updatePost: (post: Post) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  generateLineItemsFromPrompt: (prompt: string) => Promise<LineItem[] | null>;
  generateBlogPostFromPrompt: (prompt: string) => Promise<Partial<Post> | null>;
  loading: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Role-based access control
  const isCustomer = useMemo(() => user?.role === 'customer', [user]);
  const isHR = useMemo(() => user?.role === 'hr', [user]);
  const isFreelancer = useMemo(() => user?.role === 'freelancer', [user]);
  const isFinanceExecutive = useMemo(() => user?.role === 'finance_executive', [user]);
  const isMarketingHead = useMemo(() => user?.role === 'marketing_head', [user]);
  const isManager = useMemo(() => user?.role === 'manager', [user]);
  const isTeamLead = useMemo(() => user?.role === 'team_lead', [user]);
  const isNormalEmployee = useMemo(() => user?.role === 'normal_employee', [user]);

  // Permission checking function
  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>(INITIAL_SITE_CONTENT);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);
  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>([]);
  const [paymentInvoices, setPaymentInvoices] = useState<PaymentInvoice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [performanceRatings, setPerformanceRatings] = useState<PerformanceRating[]>([]);
  const [marketingMetrics, setMarketingMetrics] = useState<MarketingMetrics[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const applyArrayFallback = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, fallback: T[]) => {
    setter(prev => (prev.length > 0 ? prev : fallback));
  };

  const safeString = (value: string | undefined | null, fallback: string) =>
    value && value.trim().length ? value : fallback;

  const safeArray = <T,>(value: T[] | undefined | null, fallback: T[]) =>
    value && value.length ? value : fallback;

  const normalizeDate = (value: unknown): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number' || typeof value === 'string') {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    try {
      if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
        return (value as { toDate: () => Date }).toDate();
      }
    } catch {
      return null;
    }
    return null;
  };

  const ensureDate = (value: unknown, fallback: Date = new Date()) => normalizeDate(value) ?? fallback;

  // --- DATA SEEDING REMOVED ---
  // --- MOCK DATA REMOVED - Using ONLY Firebase data ---

  // --- REAL-TIME DATA FETCHING (Public) ---
  useEffect(() => {
    let unsubscribers: (() => void)[] = [];
    
    try {
      console.log('Starting data fetch...');
      unsubscribers = [
        onSnapshot(collection(db, 'services'), 
          snap => {
            const servicesData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Service));
            if (servicesData.length === 0) {
              console.log('No services found, using default services');
              setServices(INITIAL_SERVICES);
            } else {
              setServices(servicesData);
            }
          },
          error => {
            console.error("Error fetching services:", error);
            applyArrayFallback(setServices, INITIAL_SERVICES);
          }
        ),
        onSnapshot(query(collection(db, 'projects'), orderBy('createdAt', 'desc')), 
          snap => {
            const projectsData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Project));
            console.log('🚀 Projects synced:', projectsData.length, '| Changes:', snap.docChanges().length);
            snap.docChanges().forEach(change => {
              const data = change.doc.data();
              console.log(`  ${change.type}:`, data.title, '| Status:', data.status, '| Customer:', data.customerEmail || 'N/A');
            });
            // Use ONLY Firebase data (no mock fallback)
            console.log('📁 Using Firebase projects:', projectsData.length);
            setProjects(projectsData);
          },
          error => {
            console.error("❌ Error fetching projects:", error);
            applyArrayFallback(setProjects, INITIAL_PROJECTS);
          }
        ),
        onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), 
          snap => {
            const usersData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
            console.log('👥 Users synced:', usersData.length, '| Changes:', snap.docChanges().length);
            snap.docChanges().forEach(change => {
              const data = change.doc.data();
              console.log(`  ${change.type}:`, data.email, '| Role:', data.role, '| ID:', data.uniqueId);
            });
            // Use ONLY Firebase data (YOUR REAL USERS - no mock fallback)
            console.log('👥 Using Firebase users (REAL USERS ONLY):', usersData.length);
            setUsers(usersData);
          },
          error => {
            console.error("❌ Error fetching users:", error);
            setUsers([]); // Keep empty on error
          }
        ),
        onSnapshot(collection(db, 'testimonials'), 
          snap => {
            const testimonialsData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Testimonial));
            if (testimonialsData.length === 0) {
              console.log('No testimonials found, using default testimonials');
              setTestimonials(INITIAL_TESTIMONIALS);
            } else {
              setTestimonials(testimonialsData);
            }
          },
          error => {
            console.error("Error fetching testimonials:", error);
            applyArrayFallback(setTestimonials, INITIAL_TESTIMONIALS);
          }
        ),
        onSnapshot(query(collection(db, 'founders'), orderBy('name')), 
          snap => {
            const foundersData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Founder));
            if (foundersData.length === 0) {
              console.log('No founders found, setting default founders in state');
              // Set default founders in state only (don't auto-seed to avoid permission issues)
              setFounders(INITIAL_FOUNDERS.map((founder, index) => ({ ...founder, id: `founder-${index + 1}` })));
            } else {
              setFounders(foundersData);
            }
          },
          error => {
            console.error("Error fetching founders:", error);
            setFounders([]);
          }
        ),
        onSnapshot(
          doc(db, 'siteContent', 'main'),
          docSnap => {
            if (docSnap.exists()) {
              const data = docSnap.data() as Partial<SiteContent>;
              const mergedContent: SiteContent = {
                ...INITIAL_SITE_CONTENT,
                ...data,
                heroTitle: safeString(data.heroTitle, INITIAL_SITE_CONTENT.heroTitle),
                heroSubtitle: safeString(data.heroSubtitle, INITIAL_SITE_CONTENT.heroSubtitle),
                aboutTitle: safeString(data.aboutTitle, INITIAL_SITE_CONTENT.aboutTitle),
                aboutText: safeString(data.aboutText, INITIAL_SITE_CONTENT.aboutText),
                logoUrl: safeString(data.logoUrl, INITIAL_SITE_CONTENT.logoUrl),
                socialMedia: {
                  ...INITIAL_SITE_CONTENT.socialMedia,
                  ...(data.socialMedia || {})
                },
                contactInfo: {
                  ...INITIAL_SITE_CONTENT.contactInfo,
                  ...(data.contactInfo || {}),
                  description: safeString(
                    data.contactInfo?.description,
                    INITIAL_SITE_CONTENT.contactInfo.description
                  ),
                  heading: safeString(
                    data.contactInfo?.heading,
                    INITIAL_SITE_CONTENT.contactInfo.heading
                  ),
                  contacts: safeArray(
                    data.contactInfo?.contacts,
                    INITIAL_SITE_CONTENT.contactInfo.contacts
                  ).map((contact, index) => ({
                    ...contact,
                    id: contact.id || `contact-${index + 1}`
                  }))
                }
              };
              setSiteContent(mergedContent);
            } else {
              console.log('Site content document does not exist, using defaults');
              setSiteContent(INITIAL_SITE_CONTENT);
            }
          },
          error => {
            console.error('Error fetching site content:', error);
            // Keep default site content on error
          }
        ),
        onSnapshot(query(collection(db, 'posts'), orderBy('publishedAt', 'desc')), 
          snap => setPosts(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Post))),
          error => {
            console.error("Error fetching posts:", error);
            setPosts([]);
          }
        ),
      ];
    } catch (error) {
      console.error("Error setting up Firebase listeners:", error);
      // No fallback data - start with empty arrays
    }
    
    // Set loading to false after initial setup
    setLoading(false);
    
    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  // --- REAL-TIME DATA FETCHING (Admin-Only - Messages) ---
  useEffect(() => {
    if (isAdmin) {
      let unsubscribers: (() => void)[] = [];
      
      try {
        unsubscribers = [
          onSnapshot(query(collection(db, 'messages'), orderBy('timestamp', 'desc')), 
            snap => setMessages(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Message))),
            error => {
              console.error("Error fetching messages:", error);
              setMessages([]);
            }
          ),
        ];
      } catch (error) {
        console.error("Error setting up admin Firebase listeners:", error);
        setMessages([]);
      }
      
      return () => unsubscribers.forEach(unsub => unsub());
    } else {
      // Clear admin-specific data on logout or if user is not admin
      setMessages([]);
    }
  }, [isAdmin]);

  // --- REAL-TIME DATA FETCHING (Invoices & Quotations - Admin & Customer) ---
  useEffect(() => {
    console.log('🔄 Setting up Invoices & Quotations sync | Admin:', isAdmin, '| Customer:', isCustomer);
    
    if (isAdmin || isCustomer) {
      let unsubscribers: (() => void)[] = [];
      
      try {
        unsubscribers = [
          onSnapshot(collection(db, 'invoices'), 
            snap => {
              const invoicesData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Invoice));
              console.log('💰 Invoices synced:', invoicesData.length, '| Changes:', snap.docChanges().length);
              // Use ONLY Firebase data (no mock fallback)
              console.log('💰 Using Firebase invoices:', invoicesData.length);
              setInvoices(invoicesData);
            },
            error => {
              console.error("❌ Error fetching invoices:", error);
              setInvoices([]); // Keep empty on error
            }
          ),
          onSnapshot(collection(db, 'quotations'), 
            snap => {
              const quotationsData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Quotation));
              console.log('📄 Quotations synced:', quotationsData.length, '| Changes:', snap.docChanges().length);
              snap.docChanges().forEach(change => {
                const data = change.doc.data();
                console.log(`  ${change.type}:`, data.quoteNumber || change.doc.id);
              });
              // Use ONLY Firebase data (no mock fallback)
              console.log('📄 Using Firebase quotations:', quotationsData.length);
              setQuotations(quotationsData);
            },
            error => {
              console.error("❌ Error fetching quotations:", error);
              setQuotations([]); // Keep empty on error
            }
          ),
        ];
        console.log('✅ Invoices & Quotations listeners active');
      } catch (error) {
        console.error("❌ Error setting up invoice/quotation listeners:", error);
        setInvoices([]);
        setQuotations([]);
      }
      
      return () => {
        console.log('🛑 Cleaning up Invoices & Quotations listeners');
        unsubscribers.forEach(unsub => unsub());
      };
    } else {
      console.log('⚠️ Not admin or customer - keeping data empty');
      setInvoices([]);
      setQuotations([]);
    }
  }, [isAdmin, isCustomer]);

  // --- REAL-TIME DATA FETCHING (Attachments - Admin & Customer) ---
  useEffect(() => {
    console.log('🔄 Setting up Attachments sync | Admin:', isAdmin, '| Customer:', isCustomer);
    
    if (isAdmin || isCustomer) {
      const unsubscribe = onSnapshot(
        query(collection(db, 'attachments'), orderBy('uploadedAt', 'desc')), 
        snap => {
          const attachmentsData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Attachment));
          console.log('📎 Attachments synced:', attachmentsData.length, '| Changes:', snap.docChanges().length);
          // Use ONLY Firebase data (no mock fallback)
          console.log('📎 Using Firebase attachments:', attachmentsData.length);
          setAttachments(attachmentsData);
        },
        error => {
          console.error("❌ Error fetching attachments:", error);
          setAttachments([]); // Keep empty on error
        }
      );
      
      console.log('✅ Attachments listener active');
      return () => {
        console.log('🛑 Cleaning up Attachments listener');
        unsubscribe();
      };
    } else {
      console.log('⚠️ Not admin or customer - keeping data empty');
      setAttachments([]);
    }
  }, [isAdmin, isCustomer]);

  // --- REAL-TIME DATA FETCHING (Project Requests - Admin & Customer) ---
  useEffect(() => {
    console.log('🔄 Setting up Project Requests sync | Admin:', isAdmin, '| Customer:', isCustomer);
    
    if (isAdmin || isCustomer) {
      const unsubscribe = onSnapshot(
        query(collection(db, 'projectRequests'), orderBy('submittedAt', 'desc')), 
        snap => {
          const requestsData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as ProjectRequest));
          console.log('📋 Project Requests synced:', requestsData.length, '| Changes:', snap.docChanges().length);
          snap.docChanges().forEach(change => {
            const data = change.doc.data();
            console.log(`  ${change.type}:`, data.projectTitle || change.doc.id, '| Status:', data.status);
          });
          // Use ONLY Firebase data (no mock fallback)
          console.log('📬 Using Firebase project requests:', requestsData.length);
          setProjectRequests(requestsData);
        },
        error => {
          console.error("❌ Error fetching project requests:", error);
          setProjectRequests([]); // Keep empty on error
        }
      );
      
      console.log('✅ Project Requests listener active');
      return () => {
        console.log('🛑 Cleaning up Project Requests listener');
        unsubscribe();
      };
    } else {
      console.log('⚠️ Not admin or customer - keeping data empty');
      setProjectRequests([]);
    }
  }, [isAdmin, isCustomer]);

  // --- REAL-TIME DATA FETCHING (Payment Receipts - Admin, Finance & Customer) ---
  useEffect(() => {
    console.log('🔄 Setting up Payment Receipts sync | Admin:', isAdmin, '| Finance:', isFinanceExecutive, '| Customer:', isCustomer);
    
    if (isAdmin || isFinanceExecutive || isCustomer) {
      const unsubscribe = onSnapshot(
        query(collection(db, 'paymentReceipts'), orderBy('uploadedAt', 'desc')), 
        snap => {
          const receiptsData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as PaymentReceipt));
          console.log('💳 Payment Receipts synced:', receiptsData.length, '| Changes:', snap.docChanges().length);
          snap.docChanges().forEach(change => {
            const data = change.doc.data();
            console.log(`  ${change.type}:`, data.customerEmail, '| Amount:', data.amount, '| Status:', data.status);
          });
          // Use ONLY Firebase data (no mock fallback)
          console.log('💳 Using Firebase payment receipts:', receiptsData.length);
          setPaymentReceipts(receiptsData);
        },
        error => {
          console.error("❌ Error fetching payment receipts:", error);
          setPaymentReceipts([]); // Keep empty on error
        }
      );
      
      console.log('✅ Payment Receipts listener active');
      return () => {
        console.log('🛑 Cleaning up Payment Receipts listener');
        unsubscribe();
      };
    } else {
      console.log('⚠️ Not admin/finance/customer - keeping data empty');
      setPaymentReceipts([]);
    }
  }, [isAdmin, isFinanceExecutive, isCustomer]);

  // --- REAL-TIME DATA FETCHING (Payment Invoices - Admin, Finance & Customer) ---
  useEffect(() => {
    console.log('🔄 Setting up Payment Invoices sync | Admin:', isAdmin, '| Finance:', isFinanceExecutive, '| Customer:', isCustomer);
    
    if (isAdmin || isFinanceExecutive || isCustomer) {
      const unsubscribe = onSnapshot(
        query(collection(db, 'paymentInvoices'), orderBy('createdAt', 'desc')), 
        snap => {
          const invoicesData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as PaymentInvoice));
          console.log('🧾 Payment Invoices synced:', invoicesData.length, '| Changes:', snap.docChanges().length);
          snap.docChanges().forEach(change => {
            const data = change.doc.data();
            console.log(`  ${change.type}:`, data.invoiceNumber, '| Customer:', data.customerEmail, '| Status:', data.status);
          });
          // Use ONLY Firebase data (no mock fallback)
          console.log('🧾 Using Firebase payment invoices:', invoicesData.length);
          setPaymentInvoices(invoicesData);
        },
        error => {
          console.error("❌ Error fetching payment invoices:", error);
          setPaymentInvoices([]); // Keep empty on error
        }
      );
      
      console.log('✅ Payment Invoices listener active');
      return () => {
        console.log('🛑 Cleaning up Payment Invoices listener');
        unsubscribe();
      };
    } else {
      console.log('⚠️ Not admin/finance/customer - keeping data empty');
      setPaymentInvoices([]);
    }
  }, [isAdmin, isFinanceExecutive, isCustomer]);

  // --- REAL-TIME DATA FETCHING (Tasks - Admin & Freelancers) ---
  useEffect(() => {
    const isFreelancer = user?.role === 'freelancer';
    const isEmployee = user?.role === 'finance_executive' || user?.role === 'marketing_head' || 
                       user?.role === 'manager' || user?.role === 'team_lead' || 
                       user?.role === 'normal_employee';
    
    console.log('🔄 Setting up Tasks sync | Admin:', isAdmin, '| Freelancer:', isFreelancer, '| Employee:', isEmployee);
    
    if (isAdmin || isFreelancer || isEmployee) {
      const unsubscribe = onSnapshot(
        query(collection(db, 'tasks'), orderBy('createdAt', 'desc')), 
        snap => {
          const tasksData = snap.docs.map(doc => {
            const data = doc.data() as Task;
            const normalizedTask: Task = {
              ...data,
              id: doc.id,
              deadline: ensureDate((data as any).deadline, new Date()),
              createdAt: ensureDate((data as any).createdAt, new Date()),
              updatedAt: ensureDate((data as any).updatedAt, new Date()),
              submittedAt: normalizeDate((data as any).submittedAt) ?? (data as any).submittedAt ?? null,
              lastUpdated: normalizeDate((data as any).lastUpdated) ?? (data as any).lastUpdated ?? null,
            };
            return normalizedTask;
          });
          
          console.log('✅ Tasks synced:', tasksData.length, '| Changes:', snap.docChanges().length);
          snap.docChanges().forEach(change => {
            const data = change.doc.data();
            console.log(`  ${change.type}:`, data.title || change.doc.id, '| Assigned to:', data.assignedTo, '| Status:', data.status);
          });
          
          setTasks(tasksData);
        },
        error => {
          console.error("❌ Error fetching tasks:", error);
          setTasks([]); // Keep empty on error
        }
      );
      
      console.log('✅ Tasks listener active');
      return () => {
        console.log('🛑 Cleaning up Tasks listener');
        unsubscribe();
      };
    } else {
      console.log('⚠️ Not admin/freelancer/employee - keeping tasks empty');
      setTasks([]);
    }
  }, [isAdmin, user?.role]);

  // --- REAL-TIME DATA FETCHING (Commissions - Admin, Finance & Freelancers) ---
  useEffect(() => {
    const isFreelancer = user?.role === 'freelancer';
    
    console.log('🔄 Setting up Commissions sync | Admin:', isAdmin, '| Finance:', isFinanceExecutive, '| Freelancer:', isFreelancer);
    
    if (isAdmin || isFinanceExecutive || isFreelancer) {
      const unsubscribe = onSnapshot(
        query(collection(db, 'commissions'), orderBy('createdAt', 'desc')), 
        snap => {
          const commissionsData = snap.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              completedDate: data.completedDate?.toDate ? data.completedDate.toDate() : new Date(data.completedDate),
              paymentDate: data.paymentDate?.toDate ? data.paymentDate.toDate() : null,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
              paymentReceipt: data.paymentReceipt ? {
                ...data.paymentReceipt,
                uploadedAt: data.paymentReceipt.uploadedAt?.toDate ? data.paymentReceipt.uploadedAt.toDate() : new Date()
              } : undefined
            } as Commission;
          });
          
          console.log('💰 Commissions synced:', commissionsData.length, '| Changes:', snap.docChanges().length);
          snap.docChanges().forEach(change => {
            const data = change.doc.data();
            console.log(`  ${change.type}:`, data.taskTitle || change.doc.id, '| Freelancer:', data.freelancerEmail, '| Status:', data.status, '| Amount:', data.commissionAmount);
          });
          
          setCommissions(commissionsData);
        },
        error => {
          console.error("❌ Error fetching commissions:", error);
          setCommissions([]); // Keep empty on error
        }
      );
      
      console.log('✅ Commissions listener active');
      return () => {
        console.log('🛑 Cleaning up Commissions listener');
        unsubscribe();
      };
    } else {
      console.log('⚠️ Not admin/finance/freelancer - keeping commissions empty');
      setCommissions([]);
    }
  }, [isAdmin, isFinanceExecutive, user?.role]);


  // --- AUTHENTICATION ---
  useEffect(() => {
    // Load user from localStorage on app start
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credential: string, password: string, selectedRole: string): Promise<{ success: boolean, message: string, requiresPasswordChange?: boolean }> => {
    try {
      let foundUser: User | null = null;

      console.log('🔐 Login attempt:', { credential, selectedRole });

      // All employee-type roles
      const allEmployeeRoles = ['finance_executive', 'marketing_head', 'manager', 'team_lead', 'normal_employee'];
      
      // Roles that use email for login
      const emailBasedRoles = ['admin', 'hr'];
      
      // Check Firebase for real users
      console.log('🔍 Checking Firebase users...');
      
      if (emailBasedRoles.includes(selectedRole)) {
        // For admin and HR, search by email
        const usersQuery = query(collection(db, 'users'), orderBy('email', 'asc'));
        const usersSnapshot = await getDocs(usersQuery);
        
        usersSnapshot.docs.forEach(doc => {
          const userData = { ...doc.data(), id: doc.id } as User;
          if (userData.isActive) {
            // Check if credential matches email (case-insensitive)
            const emailMatch = userData.email.toLowerCase() === credential.toLowerCase();
            
            if (emailMatch && userData.role === selectedRole) {
                foundUser = userData;
              console.log('✅ Found user in Firebase:', userData.email, '| Role:', userData.role);
            }
          }
        });
      } else {
        // For customer, freelancer, and employee - search by uniqueId
        const usersQuery = query(collection(db, 'users'), orderBy('uniqueId', 'asc'));
        const usersSnapshot = await getDocs(usersQuery);
        
        usersSnapshot.docs.forEach(doc => {
          const userData = { ...doc.data(), id: doc.id } as User;
          if (userData.uniqueId && userData.uniqueId.toUpperCase() === credential.toUpperCase() && userData.isActive) {
            // If "employee" button clicked, match ANY employee role
            if (selectedRole === 'employee' && allEmployeeRoles.includes(userData.role)) {
            foundUser = userData;
              console.log('✅ Found employee in Firebase:', userData.uniqueId, '| Role:', userData.role);
            }
            // Otherwise, exact match required
            else if (userData.role === selectedRole) {
              foundUser = userData;
              console.log('✅ Found user in Firebase:', userData.uniqueId, '| Role:', userData.role);
            }
          }
        });
      }

      if (!foundUser) {
        console.error('❌ User not found:', { credential, selectedRole });
        // Log failed login attempt
        await logLogin('unknown', credential, selectedRole as UserRole, 'failed');
        return {
          success: false,
          message: "Invalid credentials or account not found."
        };
      }

      console.log('✅ User found! Checking password...');

      // Check if the selected role category matches the user's actual role
      // If "employee" selected, allow any employee role type
      const isEmployeeLogin = selectedRole === 'employee' && allEmployeeRoles.includes(foundUser.role);
      const isValidRoleSelection = foundUser.role === selectedRole || isEmployeeLogin;
      
      if (!isValidRoleSelection) {
        await logLogin(foundUser.id, foundUser.email, foundUser.role, 'failed');
        return {
          success: false,
          message: `This account is registered as a ${foundUser.role}, not ${selectedRole}. Please select the correct role.`
        };
      }

      // For now, we'll use a simple password check
      // In production, you should hash passwords properly
      if (foundUser.defaultPassword !== password) {
        console.error('❌ Password mismatch');
        await logLogin(foundUser.id, foundUser.email, foundUser.role, 'failed');
        return {
          success: false,
          message: "Invalid credentials."
        };
      }

      console.log('✅ Password correct! Logging in...');

      // Update last login and login count
      const userRef = doc(db, 'users', foundUser.id);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        loginCount: (foundUser.loginCount || 0) + 1
      });
      console.log('✅ Updated login stats in Firebase');

      // Check if customer needs to change password
      const requiresPasswordChange = foundUser.role === 'customer' && !foundUser.hasChangedPassword;

      setUser(foundUser);
      setIsAdmin(foundUser.role === 'admin');

      // Save user to localStorage for session persistence
      localStorage.setItem('user', JSON.stringify(foundUser));

      console.log('✅ Login successful!', { user: foundUser.email, role: foundUser.role });

      // DEBUG: Show what data is available for this user
      console.log('\n🎯 ===== DATA AVAILABLE FOR USER =====');
      console.log('👤 User:', foundUser.email, '(', foundUser.role, ')');
      console.log('🆔 Unique ID:', foundUser.uniqueId);
      console.log('\n📁 Projects assigned to you:', projects.filter(p => 
        p.assignedTo === foundUser.uniqueId || 
        p.assignedTo === foundUser.email ||
        p.customerEmail === foundUser.email ||
        p.teamLead === foundUser.email
      ).map(p => `${p.title} (${p.status})`));
      console.log('\n📋 Tasks assigned to you:', tasks.filter(t => 
        t.assignedTo === foundUser.email || 
        t.assignedTo === foundUser.uniqueId ||
        t.employeeId === foundUser.id
      ).map(t => `${t.title} (${t.status})`));
      console.log('\n💰 Invoices:', invoices.filter(i => 
        i.customerUniqueId === foundUser.uniqueId
      ).length);
      console.log('📄 Quotations:', quotations.filter(q => 
        q.customerUniqueId === foundUser.uniqueId
      ).length);
      console.log('⏰ Time Records:', timeRecords.filter(tr => 
        tr.employeeId === foundUser.id || tr.employeeEmail === foundUser.email
      ).length);
      console.log('🎯 Goals:', goals.filter(g => 
        g.employeeId === foundUser.id
      ).length);
      console.log('📊 Attendance Records:', attendanceRecords.filter(ar => 
        ar.employeeId === foundUser.id || ar.employeeEmail === foundUser.email
      ).length);
      console.log('🎯 ==============================\n');

      // Log successful login
      await logLogin(foundUser.id, foundUser.email, foundUser.role, 'success');

      return {
        success: true,
        message: "Login successful!",
        requiresPasswordChange
      };
    } catch (error: any) {
      console.error("Login failed:", error);
      return {
        success: false,
        message: error.message || "Login failed"
      };
    }
  };

  const logout = () => {
    console.log('🔴 LOGOUT CALLED - Creating vanilla JS overlay');
    
    // Clear localStorage immediately (no React state updates to avoid conflicts)
    localStorage.removeItem('user');
    
    // Create logout overlay using vanilla JS (bypasses React completely!)
    const overlay = document.createElement('div');
    overlay.id = 'logout-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      animation: fadeIn 0.3s ease-in;
    `;
    
    overlay.innerHTML = `
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
      </style>
      <div style="text-align: center;">
        <div style="margin-bottom: 2rem;">
          <div style="width: 128px; height: 128px; margin: 0 auto 1rem auto; background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 1rem;">
            <div style="text-align: center;">
              <div style="position: relative; margin-bottom: 0.25rem;">
                <svg width="24" height="12" viewBox="0 0 24 12" style="margin: 0 auto;">
                  <polygon points="12,2 4,8 8,8 12,2 16,8 20,8" fill="none" stroke="white" stroke-width="0.5"/>
                  <polygon points="12,2 8,8 16,8" fill="#60A5FA" stroke="white" stroke-width="0.5"/>
                </svg>
                <div style="width: 1px; height: 8px; background: white; margin: 0 auto;"></div>
              </div>
              <div style="color: white; font-weight: bold; font-size: 12px; line-height: 1.2;">
                <div style="display: flex; justify-content: center;">
                  <span style="color: white;">AUR</span>
                  <span style="color: #BFDBFE;">EX</span>
                  <span style="color: white;">IS</span>
                </div>
                <div style="color: white; font-weight: normal; font-size: 12px; margin-top: 2px;">SOLUTION</div>
              </div>
              <div style="position: relative; margin-top: 0.25rem;">
                <div style="width: 1px; height: 8px; background: white; margin: 0 auto 4px auto;"></div>
                <svg width="16" height="8" viewBox="0 0 16 8" style="margin: 0 auto;">
                  <polygon points="8,2 4,6 12,6" fill="#60A5FA" stroke="white" stroke-width="0.5"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <h1 style="font-size: 2rem; font-weight: bold; color: #f3f4f6; margin-bottom: 1rem;">Aurexis Solution</h1>
        <p style="font-size: 1.25rem; color: #9ca3af; margin-bottom: 1.5rem;">See You Again!</p>
        <div style="margin-top: 1.5rem;">
          <div class="spinner" style="width: 32px; height: 32px; border: 2px solid transparent; border-top-color: #3b82f6; border-radius: 50%; margin: 0 auto;"></div>
        </div>
      </div>
    `;
    
    // Append to body
    document.body.appendChild(overlay);
    console.log('🔴 Logout overlay created and appended to DOM');
    console.log('🔴 Waiting 2.5 seconds before redirect...');
    
    // Redirect after 2.5 seconds (page reload will reset all React state)
    setTimeout(() => {
      console.log('🔴 Redirecting to homepage now...');
      window.location.href = '/';
    }, 2500);
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean, message: string }> => {
    try {
      if (!user || user.role !== 'customer') {
        return {
          success: false,
          message: "Only customers can change their password."
        };
      }

      // Update user's password and mark as changed
      await updateDoc(doc(db, 'users', user.id), {
        defaultPassword: newPassword,
        hasChangedPassword: true
      });

      // Update local user state
      setUser({
        ...user,
        defaultPassword: newPassword,
        hasChangedPassword: true
      });

      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify({
        ...user,
        defaultPassword: newPassword,
        hasChangedPassword: true
      }));

      return {
        success: true,
        message: "Password changed successfully!"
      };
    } catch (error: any) {
      console.error("Error changing password:", error);
      return {
        success: false,
        message: error.message || "Failed to change password"
      };
    }
  };

  // --- USER MANAGEMENT (ADMIN ONLY) ---
  const generateUniqueId = async (): Promise<string> => {
    try {
      return await UniqueCodeGenerator.generateUniqueCode({
        collectionName: 'users',
        fieldName: 'uniqueId',
        length: 5  // 1 alphabet + 5 digits
      });
    } catch (error) {
      console.error('Error generating unique user ID:', error);
      // Fallback to timestamp-based ID if unique code generation fails
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      return `${timestamp}${random}`.toUpperCase();
    }
  };

  const generateDefaultPassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'hasChangedPassword' | 'isActive'>): Promise<{ success: boolean, message: string, uniqueId?: string, defaultPassword?: string }> => {
    try {
      if (!isAdmin && !isHR) {
        return {
          success: false,
          message: "Only admins and HR can create users."
        };
      }

      const uniqueId = await generateUniqueId();
      const defaultPassword = generateDefaultPassword();

      const newUser = {
        ...userData,
        uniqueId,
        defaultPassword,
        hasChangedPassword: false,
        isActive: true,
        createdAt: serverTimestamp(),
        createdBy: user?.email || 'admin'
      };

      await addDoc(collection(db, 'users'), newUser);

      return {
        success: true,
        message: "User created successfully!",
        uniqueId,
        defaultPassword
      };
    } catch (error: any) {
      console.error("Error creating user:", error);
      return {
        success: false,
        message: error.message || "Failed to create user"
      };
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      if (!isAdmin && !isHR) {
        throw new Error("Only admins and HR can update users.");
      }

      await updateDoc(doc(db, 'users', userId), updates);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    try {
      if (!isAdmin && !isHR) {
        throw new Error("Only admins and HR can delete users.");
      }

      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  // --- PROJECT MANAGEMENT ---
  const createProject = async (project: Omit<Project, 'id' | 'createdAt'>): Promise<void> => {
    try {
      if (!isAdmin) {
        throw new Error("Only admins can create projects.");
      }

      const newProject = {
        ...project,
        createdAt: serverTimestamp(),
        createdBy: user?.email || 'admin'
      };

      await addDoc(collection(db, 'projects'), newProject);
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  };

  const updateProject = async (project: Project): Promise<void> => {
    try {
      if (!isAdmin) {
        throw new Error("Only admins can update projects.");
      }

      await updateDoc(doc(db, 'projects', project.id), project as any);
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      if (!isAdmin) {
        throw new Error("Only admins can delete projects.");
      }

      await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  };
  
  // --- GEMINI AI INTEGRATION ---
  const generateLineItemsFromPrompt = async (prompt: string): Promise<LineItem[] | null> => {
    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert financial assistant. Your task is to generate a list of line items for an invoice or quotation based on a user's prompt. You MUST adhere strictly to the provided JSON schema. For each billable item you identify, you must provide all of the following fields: 'itemCode' (a short, descriptive code like 'WEB-DEV' or 'MAINT-HR'), 'description' (a clear, professional description of the service or product), 'quantity' (a numeric value), 'unit' (a standard unit like 'UNIT', 'SET', 'HR', 'SF'), 'price' (the price per unit), and 'discount' (a percentage, typically 0 unless specified in the prompt). Break down complex requests into distinct, logical line items.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                itemCode: {
                  type: Type.STRING,
                  description: "A short code for the line item (e.g., 'DEV-01', 'CONSULT-HR')."
                },
                description: {
                  type: Type.STRING,
                  description: 'The detailed description of the line item.',
                },
                quantity: {
                  type: Type.NUMBER,
                  description: 'The quantity for the line item.',
                },
                unit: {
                    type: Type.STRING,
                    description: "The unit of measurement (e.g., 'SF', 'UNIT', 'SET', 'HR')."
                },
                price: {
                  type: Type.NUMBER,
                  description: 'The unit price for the line item.',
                },
                discount: {
                    type: Type.NUMBER,
                    description: "The discount percentage for the line item (e.g., 0 for no discount, 10 for 10%)."
                }
              },
              required: ["itemCode", "description", "quantity", "unit", "price", "discount"],
            },
          },
        },
      });
      
      const jsonStr = response.text.trim();
      const items = JSON.parse(jsonStr) as Omit<LineItem, 'id'>[];

      return items.map((item, index) => ({
        ...item,
        id: `item-${Date.now()}-${index}`
      }));

    } catch (error) {
      console.error("Error generating items with AI:", error);
      return null;
    }
  };

  const generateBlogPostFromPrompt = async (prompt: string): Promise<Partial<Post> | null> => {
    try {
      // Load API keys from Firebase
      const settingsDoc = doc(db, 'aiSettings', 'main');
      const settingsSnap = await getDoc(settingsDoc);
      
      if (!settingsSnap.exists()) {
        throw new Error("AI settings not configured. Please set API keys in Admin Panel > AI Settings.");
      }
      
      const settings = settingsSnap.data();
      
      // Try Perplexity AI first (cost-effective)
      if (settings?.perplexityApiKey) {
        try {
          const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${settings.perplexityApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.1-sonar-small-128k-online',
              messages: [
                {
                  role: 'system',
                  content: `You are a professional tech blogger and content creator for an IT solutions company named Aurexis Solution. Your tone should be expert, yet accessible and engaging. Based on the user's prompt, generate a blog post.

CRITICAL FORMATTING REQUIREMENTS:
- Use Markdown formatting for the 'content' field (NOT HTML)
- Use # for main title, ## for major sections, ### for subsections
- Use **text** for bold and *text* for italic
- Use - for bullet lists and 1. for numbered lists
- Use > for blockquotes
- Use \`\`\` for code blocks and \`code\` for inline code
- Use [text](url) for links
- Write in clear, engaging paragraphs
- Use proper spacing and structure
- Make content visually appealing and easy to read

STRUCTURE REQUIREMENTS:
- Start with compelling introduction
- Use ## for major sections with clear hierarchy
- Use ### for subsections within main sections
- Include bullet points and numbered lists where appropriate
- Add blockquotes for key insights and quotes
- End with strong conclusion
- Use proper spacing and paragraph breaks

CONTENT REQUIREMENTS:
- Write detailed, informative content
- Include specific examples and use cases
- Make it engaging with proper formatting
- Use professional tone throughout
- Include actionable insights and recommendations

Create a short, compelling 'excerpt' of about 20-30 words. Ensure the 'title' is catchy and SEO-friendly.

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Your Blog Title Here",
  "content": "Your Markdown content here...",
  "excerpt": "Your excerpt here..."
}`
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              max_tokens: 4000,
              temperature: 0.7
            })
          });

          if (perplexityResponse.ok) {
            const perplexityData = await perplexityResponse.json();
            const content = perplexityData.choices[0]?.message?.content;
            
            if (content) {
              // Try to parse as JSON
              try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  return parsed as Partial<Post>;
                }
              } catch (parseError) {
                console.log("Perplexity response not in expected JSON format, trying Gemini...");
              }
            }
          }
        } catch (perplexityError) {
          console.log("Perplexity AI failed, trying Gemini...", perplexityError);
        }
      }
      
      // Fallback to Gemini
      if (settings?.geminiApiKey) {
        const ai = new GoogleGenAI({ apiKey: settings.geminiApiKey });
        
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: `You are a professional tech blogger and content creator for an IT solutions company named Aurexis Solution. Your tone should be expert, yet accessible and engaging. Based on the user's prompt, generate a blog post. 

CRITICAL FORMATTING REQUIREMENTS:
- Use Markdown formatting for the 'content' field (NOT HTML)
- Use # for main title, ## for major sections, ### for subsections
- Use **text** for bold and *text* for italic
- Use - for bullet lists and 1. for numbered lists
- Use > for blockquotes
- Use \`\`\` for code blocks and \`code\` for inline code
- Use [text](url) for links
- Write in clear, engaging paragraphs
- Use proper spacing and structure
- Make content visually appealing and easy to read

STRUCTURE REQUIREMENTS:
- Start with compelling introduction
- Use ## for major sections with clear hierarchy
- Use ### for subsections within main sections
- Include bullet points and numbered lists where appropriate
- Add blockquotes for key insights and quotes
- End with strong conclusion
- Use proper spacing and paragraph breaks

CONTENT REQUIREMENTS:
- Write detailed, informative content
- Include specific examples and use cases
- Make it engaging with proper formatting
- Use professional tone throughout
- Include actionable insights and recommendations

Create a short, compelling 'excerpt' of about 20-30 words. Ensure the 'title' is catchy and SEO-friendly.`,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING, description: "The full blog post content in Markdown format." },
                excerpt: { type: Type.STRING },
              },
              required: ["title", "content", "excerpt"],
            },
          },
        });
        
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as Partial<Post>;
      }
      
      throw new Error("No AI API keys configured. Please set Perplexity or Gemini API key in Admin Panel > AI Settings.");

    } catch (error) {
      console.error("Error generating blog post with AI:", error);
      return null;
    }
  };


  // --- CRUD OPERATIONS ---
  const createCrudFunctions = <T extends { id: string }>(collectionName: string) => ({
    add: async (item: Omit<T, 'id'>) => {
      await addDoc(collection(db, collectionName), item);
    },
    update: async (item: T) => {
      const docRef = doc(db, collectionName, item.id);
      await updateDoc(docRef, { ...item });
    },
    delete: async (id: string) => {
      await deleteDoc(doc(db, collectionName, id));
    },
  });

  const serviceCrud = useMemo(() => createCrudFunctions<Service>('services'), []);
  const projectCrud = useMemo(() => createCrudFunctions<Project>('projects'), []);
  const testimonialCrud = useMemo(() => createCrudFunctions<Testimonial>('testimonials'), []);
  const invoiceCrud = useMemo(() => createCrudFunctions<Invoice>('invoices'), []);
  const quotationCrud = useMemo(() => createCrudFunctions<Quotation>('quotations'), []);
  const attachmentCrud = useMemo(() => createCrudFunctions<Attachment>('attachments'), []);
  const projectRequestCrud = useMemo(() => createCrudFunctions<ProjectRequest>('projectRequests'), []);
  const paymentReceiptCrud = useMemo(() => createCrudFunctions<PaymentReceipt>('paymentReceipts'), []);
  const paymentInvoiceCrud = useMemo(() => createCrudFunctions<PaymentInvoice>('paymentInvoices'), []);
  const messageCrud = useMemo(() => createCrudFunctions<Message>('messages'), []);
  const founderCrud = useMemo(() => createCrudFunctions<Founder>('founders'), []);
  const postCrud = useMemo(() => createCrudFunctions<Post>('posts'), []);
  
  const updateSiteContent = async (content: SiteContent) => {
    await setDoc(doc(db, 'siteContent', 'main'), { ...content }, { merge: true });
  };

  const seedFounders = async () => {
    try {
      console.log('Manually seeding founders to database...');
      console.log('Current user:', user);
      console.log('Is admin:', isAdmin);
      
      if (!isAdmin) {
        console.error('User is not admin, cannot seed founders');
        return;
      }
      
      const foundersToSeed = INITIAL_FOUNDERS.map((founder, index) => ({ ...founder, id: `founder-${index + 1}` }));
      console.log('Founders to seed:', foundersToSeed);
      
      // Use batch write for better performance
      const batch = writeBatch(db);
      foundersToSeed.forEach((founder) => {
        const docRef = doc(db, 'founders', founder.id);
        batch.set(docRef, founder);
        console.log('Adding founder to batch:', founder.id);
      });
      
      await batch.commit();
      console.log('Founders seeded successfully to database');
    } catch (error) {
      console.error('Error seeding founders:', error);
    }
  };

  const checkFoundersInDatabase = async () => {
    try {
      console.log('Checking founders in database...');
      const foundersSnapshot = await getDocs(collection(db, 'founders'));
      console.log('Founders in database:', foundersSnapshot.docs.length);
      foundersSnapshot.docs.forEach(doc => {
        console.log('Founder doc:', doc.id, doc.data());
      });
    } catch (error) {
      console.error('Error checking founders in database:', error);
    }
  };

  const addMessage = async (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    try {
      await addDoc(collection(db, "messages"), {
        ...message,
        timestamp: serverTimestamp(),
        isRead: false
      });
      return true;
    } catch (error) {
      console.error("Error adding message:", error);
      return false;
    }
  };
  
  const addPost = async (post: Omit<Post, 'id' | 'createdAt'>) => {
     await addDoc(collection(db, 'posts'), {
        ...post,
        createdAt: serverTimestamp(),
        publishedAt: post.status === 'Published' ? serverTimestamp() : null
     });
  };
  
  const updatePost = async (post: Post) => {
      const docRef = doc(db, 'posts', post.id);
      const postData: Partial<Post> = { ...post };
      
      // If status is changing to Published for the first time
      const originalPost = posts.find(p => p.id === post.id);
      if (post.status === 'Published' && originalPost?.status !== 'Published') {
        postData.publishedAt = serverTimestamp();
      }

      await updateDoc(docRef, postData);
  };

  const value = {
    user,
    isAdmin,
    isCustomer,
    isHR,
    isFreelancer,
    isFinanceExecutive,
    isMarketingHead,
    isManager,
    isTeamLead,
    isNormalEmployee,
    isLoggingOut,
    checkPermission,
    login,
    logout,
    changePassword,
    users,
    createUser,
    updateUser,
    deleteUser,
    projects,
    createProject,
    updateProject,
    deleteProject,
    services,
    addService: serviceCrud.add,
    updateService: serviceCrud.update,
    deleteService: serviceCrud.delete,
    testimonials,
    addTestimonial: testimonialCrud.add,
    updateTestimonial: testimonialCrud.update,
    deleteTestimonial: testimonialCrud.delete,
    siteContent,
    updateSiteContent,
    invoices,
    addInvoice: invoiceCrud.add,
    updateInvoice: invoiceCrud.update,
    deleteInvoice: invoiceCrud.delete,
    quotations,
    addQuotation: quotationCrud.add,
    updateQuotation: quotationCrud.update,
    deleteQuotation: quotationCrud.delete,
    attachments,
    addAttachment: attachmentCrud.add,
    updateAttachment: attachmentCrud.update,
    deleteAttachment: attachmentCrud.delete,
    projectRequests,
    addProjectRequest: projectRequestCrud.add,
    updateProjectRequest: projectRequestCrud.update,
    deleteProjectRequest: projectRequestCrud.delete,
    paymentReceipts,
    addPaymentReceipt: paymentReceiptCrud.add,
    updatePaymentReceipt: paymentReceiptCrud.update,
    deletePaymentReceipt: paymentReceiptCrud.delete,
    paymentInvoices,
    addPaymentInvoice: paymentInvoiceCrud.add,
    updatePaymentInvoice: paymentInvoiceCrud.update,
    deletePaymentInvoice: paymentInvoiceCrud.delete,
    tasks,
    commissions,
    timeRecords,
    goals,
    attendanceRecords,
    performanceRatings,
    marketingMetrics,
    financialMetrics,
    messages,
    addMessage,
    deleteMessage: messageCrud.delete,
    founders,
    updateFounder: founderCrud.update,
    seedFounders,
    checkFoundersInDatabase,
    posts,
    addPost,
    updatePost,
    deletePost: postCrud.delete,
    generateLineItemsFromPrompt,
    generateBlogPostFromPrompt,
    loading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Export the hook for use in components
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};