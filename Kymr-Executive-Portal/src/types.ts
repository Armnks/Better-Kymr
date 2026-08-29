export type InquiryStatus = "NEW" | "QUALIFIED" | "CONTACTED" | "MEETING" | "QUOTED" | "WON" | "LOST";
export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type MeetingStatus = "PENDING" | "COMPLETED" | "CANCELLED";
export type QuoteStatus = "DRAFT" | "READY" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "VOID";
export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type InvoiceStatus = "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "VOID";
export type DeliverableStatus = "NOT_STARTED" | "IN_PROGRESS" | "IN_REVIEW" | "DELIVERED";

export interface ScopeRequest {
  serviceId?: string;
  serviceName?: string;
  estimatedBudget?: string;
  timeline?: string;
  deliverables?: string[];
  notes?: string;
  rawPayload?: any;
  volume?: number | null;
  mix?: string | null;
  cadence?: string | null;
  tier?: string | null;
}

export interface Inquiry {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
  serviceInterest?: string;
  message?: string;
  budgetRange?: string;
  source?: string;
  submissionType?: "GENERAL_INQUIRY" | "CONFIGURED_SCOPE" | "BOOKING";
  scopeRequest?: ScopeRequest;
  externalBookingId?: string;
  status: InquiryStatus;
  priority?: Priority;
  ownerId?: string;
  notes?: string;
  convertedClientId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id?: string;
  name: string;
  company?: string;
  primaryContact?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  id?: string;
  title: string;
  date: Date;
  durationMinutes: number;
  attendeeName: string;
  attendeeEmail: string;
  attendeeCompany?: string;
  status: MeetingStatus;
  notes?: string;
  meetUrl?: string;
  calendarEventId?: string;
  relatedId?: string; // inquiryId or clientId
  relatedType?: "INQUIRY" | "CLIENT" | "PROJECT";
  isSynthetic?: boolean;
  providerVerified?: boolean;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CatalogService {
  id?: string;
  name: string;
  shortDescription?: string;
  clientDescription?: string;
  billingType: "FIXED" | "PER_DELIVERABLE" | "PER_HOUR" | "PER_DAY" | "MONTHLY" | "CUSTOM";
  defaultRate: number;
  defaultCurrency: string;
  unit?: string;
  defaultQuantity: number;
  defaultTurnaround?: string;
  defaultRevisionCount?: number;
  internalCost?: number;
  categoryId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceCategory {
  id?: string;
  name: string;
  createdAt: Date;
}

export interface ServiceItem {
  id?: string;
  catalogServiceId?: string;
  name: string;
  description?: string;
  rate: number;
  billingType: "FIXED" | "PER_DELIVERABLE" | "PER_HOUR" | "PER_DAY" | "MONTHLY" | "CUSTOM";
  unit?: string;
  quantity: number;
  currency: string;
}

export interface Quote {
  id?: string;
  quoteNumber: string;
  title: string;
  clientId?: string;
  inquiryId?: string;
  projectId?: string;
  invoiceId?: string;
  status: QuoteStatus;
  items: ServiceItem[];
  subtotal: number;
  discount: number;
  discountType?: 'PERCENTAGE' | 'FIXED';
  tax: number;
  total: number;
  currency: string;
  validUntil?: Date;
  internalNotes?: string;
  clientNotes?: string;
  timeline?: string;
  revisionTerms?: string;
  paymentTerms?: string;
  sentAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  isTemplate?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deliverable {
  id?: string;
  projectId: string;
  name: string;
  description?: string;
  quantity: number;
  status: DeliverableStatus;
  dueDate?: Date;
  assignedTo?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Project {
  id?: string;
  name: string;
  clientId: string;
  quoteId?: string;
  status: ProjectStatus;
  budget: number;
  currency: string;
  startDate?: Date;
  deadline?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id?: string;
  title: string;
  projectId?: string;
  clientId?: string;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  title: string;
  projectId?: string;
  clientId: string;
  quoteId?: string;
  status: InvoiceStatus;
  items: ServiceItem[];
  subtotal: number;
  discount: number;
  discountType?: 'PERCENTAGE' | 'FIXED';
  tax: number;
  total: number;
  amountPaid: number;
  currency: string;
  issueDate?: Date;
  dueDate?: Date;
  paymentInstructions?: string;
  notes?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id?: string;
  invoiceId: string;
  clientId: string;
  amount: number;
  currency: string;
  date: Date;
  method: "BANK_TRANSFER" | "UPI" | "CARD" | "CASH" | "OTHER";
  reference?: string;
  notes?: string;
  createdAt: Date;
}

export interface ActivityEvent {
  id?: string;
  type: string;
  actorId: string;
  entityType: string;
  entityId: string;
  description: string;
  createdAt: Date;
}
