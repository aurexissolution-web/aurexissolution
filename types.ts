

export interface Service {
  id: string;
  icon: string; // Placeholder for an icon name or SVG
  title: string;
  description: string;
  detailedDescription: string[];
  keyFeatures: string[];
  technologies: string[];
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  targetDate?: string; // YYYY-MM-DD format
  completedDate?: string; // YYYY-MM-DD format
  status: 'pending' | 'in-progress' | 'completed';
  order: number; // For sorting
}

export interface Project {
  id: string;
  title: string;
  description: string;
  
  // Portfolio vs Internal Project Management
  isPortfolioItem?: boolean; // TRUE = public portfolio showcase, FALSE/undefined = internal project
  
  // Portfolio-specific fields (when isPortfolioItem = true)
  category?: string; // e.g., "Web Development", "Mobile App"
  imageData?: string; // Image URL or base64 for portfolio display
  
  // Internal project management fields (when isPortfolioItem = false/undefined)
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string; // YYYY-MM-DD format
  createdAt?: any; // Firestore timestamp
  createdBy?: string; // Admin who created the project
  assignedTo?: string; // Customer, Employee, Team Lead, or Freelancer uniqueId
  assignedType?: 'customer' | 'employee' | 'team_lead' | 'freelancer';
  teamLead?: string; // Team lead email assigned to manage this project
  budget?: number;
  paymentStatus?: 'pending' | 'paid' | 'overdue' | 'internal';
  notes?: string;
  
  // Progress Tracking (visible to customers)
  completionPercentage?: number; // 0-100
  progressNotes?: string; // Latest update visible to customer
  lastProgressUpdate?: any; // Firestore timestamp
  milestones?: ProjectMilestone[]; // Project milestones
  
  // Customer tracking (for projects assigned to employees but belonging to customers)
  customerUniqueId?: string; // Original customer who requested the project
  customerName?: string; // Customer name for display
  customerEmail?: string; // Customer email
  
  // Attachments from customer (copied from project request)
  attachments?: string[]; // File URLs uploaded by customer
}

export interface ProjectRequest {
  id: string;
  customerEmail: string;
  customerUniqueId: string;
  customerName: string;
  
  // Project Details
  title: string;
  description: string;
  requirements: string;
  budgetRange: string; // e.g., "$5,000 - $10,000"
  desiredTimeline: string; // e.g., "3 months"
  category: string; // "Web Development", "Mobile App", etc.
  
  // Attachments (file URLs)
  attachments: string[];
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'need-more-info';
  adminNotes: string;
  rejectionReason?: string;
  
  // Tracking
  submittedAt: any; // Firestore timestamp
  reviewedAt?: any; // Firestore timestamp
  reviewedBy?: string; // Admin email
  
  // If approved
  convertedToProjectId?: string; // Link to actual project
  assignedToTeamLead?: string; // Team lead email
  assignedTeamLeadName?: string; // Team lead name for display
}

export interface ProjectFeedback {
  id: string;
  projectId: string;
  projectTitle: string;
  customerEmail: string;
  customerUniqueId: string;
  customerName: string;
  
  // Ratings (1-5 stars)
  overallRating: number;
  qualityRating: number;
  timelinessRating: number;
  communicationRating: number;
  
  // Comments
  whatWentWell: string;
  whatCouldImprove: string;
  additionalComments: string;
  
  // Would recommend?
  wouldRecommend: boolean;
  
  // Tracking
  submittedAt: any; // Firestore timestamp
  reviewedBy?: string; // Admin who viewed feedback
  reviewedAt?: any;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  company: string;
}

export interface ContactPerson {
  id: string;
  name: string;
  phone: string;
  role?: string;
}

export interface ContactInfo {
  heading: string;
  description: string;
  contacts: ContactPerson[];
  office: {
    label: string;
    address: string;
  };
}

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutText: string;
  logoUrl?: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    tiktok?: string;
  };
  contactInfo: ContactInfo;
}

export type UserRole = 
  | 'admin' 
  | 'customer' 
  | 'hr' 
  | 'freelancer'
  | 'finance_executive'
  | 'marketing_head'
  | 'manager'
  | 'team_lead'
  | 'normal_employee';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  uniqueId: string; // Auto-generated unique identifier
  defaultPassword: string; // General password set by admin
  password?: string; // Current password (for employees - fixed, for customers - changeable)
  hasChangedPassword: boolean; // For customers - tracks if they've changed password
  createdAt: any; // Firestore timestamp
  createdBy: string; // Admin who created this user
  isActive: boolean;
  
  // Organizational fields
  department?: string; // e.g., "Finance", "Marketing", "IT", "Sales"
  team?: string; // e.g., "Team A", "Team B"
  reportsTo?: string; // User ID of manager/supervisor
  position?: string; // Job title
  
  // Customer specific fields
  assignedProjects?: string[]; // Array of project IDs
  
  // Status tracking
  lastLogin?: any; // Firestore timestamp
  loginCount?: number;
}

// Audit Log interface
export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: string; // e.g., "login", "logout", "create_user", "update_invoice"
  details?: string; // Additional context
  ipAddress?: string;
  timestamp: any; // Firestore timestamp
  status: 'success' | 'failed';
}

export interface LineItem {
  id:string;
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  discount: number; // Percentage
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerAddress: string;
  customerCode: string;
  customerContactPerson: string;
  invoiceDate: string; // YYYY-MM-DD format
  dueDate: string; // YYYY-MM-DD format
  creditTerm: string;
  items: LineItem[];
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  sstRate: number; // Percentage
  deliveryDate: string;
  deliveryAddress: string;
  notes: string;
  bankDetails: string;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerAddress: string;
  customerCode: string;
  customerContactPerson: string;
  quoteDate: string; // YYYY-MM-DD format
  expiryDate: string; // YYYY-MM-DD format
  creditTerm: string;
  items: LineItem[];
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  sstRate: number; // Percentage
  deliveryDate: string;
  deliveryAddress: string;
  notes: string;
  bankDetails: string;
  
  // Enhanced fields for customer linking and file management
  customerEmail?: string; // Customer email for linking
  customerUniqueId?: string; // Customer uniqueId for proper linking
  projectId?: string; // Link to related project
  quotationFileUrl?: string; // PDF or image URL
  quotationFileName?: string;
  quotationFileType?: string;
  createdBy?: string; // Admin who created
  createdAt?: any; // Firestore timestamp
  updatedAt?: any; // Firestore timestamp
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string; // MIME type or file extension
  fileSize: number; // in bytes
  uploadedBy: string; // User email
  uploadedByName: string; // User name
  customerCode: string; // Customer uniqueId
  projectId?: string; // Optional: link to specific project
  projectTitle?: string; // For easier reference
  description?: string; // User-provided description
  category?: 'document' | 'image' | 'design' | 'requirement' | 'other';
  uploadedAt: any; // Firestore timestamp
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string; // Admin can add notes
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: any; // Firestore timestamp
  isRead: boolean;
}

export interface Founder {
  id: string;
  name: string;
  title: string;
  handle: string;
  status: string;
  imageData: string;
  bio: string;
  linkedinUrl: string;
  twitterUrl: string;
  githubUrl: string;
  profileUrl: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown or HTML content
  excerpt: string;
  imageUrl: string;
  author: string;
  status: 'Draft' | 'Published';
  createdAt: any; // Firestore timestamp
  publishedAt?: any; // Firestore timestamp
}

export interface PaymentReceipt {
  id: string;
  customerEmail: string;
  customerUniqueId: string;
  customerName: string;
  
  // Payment Details
  amount: number;
  paymentMethod: string; // e.g., "Bank Transfer", "Credit Card", "PayPal"
  transactionId?: string;
  paymentDate: string; // YYYY-MM-DD format
  invoiceId?: string; // Link to related invoice
  projectId?: string; // Link to related project
  
  // Receipt File
  receiptFileUrl: string; // Base64 or storage URL
  receiptFileName: string;
  receiptFileType: string; // e.g., "image/jpeg", "application/pdf"
  
  // Status Tracking
  status: 'pending' | 'verified' | 'rejected';
  
  // Admin/Finance Review
  reviewedBy?: string; // Finance team member email
  reviewedAt?: any; // Firestore timestamp
  reviewNotes?: string; // Notes from finance team
  rejectionReason?: string; // Reason if rejected
  
  // Tracking
  uploadedAt: any; // Firestore timestamp
  updatedAt?: any; // Firestore timestamp
}

export interface PaymentInvoice {
  id: string;
  customerEmail: string;
  customerUniqueId: string;
  customerName: string;
  
  // Invoice Details
  invoiceNumber: string;
  amount: number;
  currency: string; // e.g., "USD", "EUR"
  dueDate: string; // YYYY-MM-DD format
  issueDate: string; // YYYY-MM-DD format
  projectId?: string; // Link to related project
  
  // Invoice File
  invoiceFileUrl: string; // Base64 or storage URL
  invoiceFileName: string;
  invoiceFileType: string; // e.g., "application/pdf"
  
  // Status
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentReceiptId?: string; // Link to payment receipt if paid
  
  // Line Items (optional)
  description?: string;
  notes?: string;
  
  // Tracking
  createdBy: string; // Admin/Finance who created
  createdAt: any; // Firestore timestamp
  updatedAt?: any; // Firestore timestamp
}