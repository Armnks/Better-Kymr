import { db, auth } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, Timestamp, DocumentData, writeBatch, onSnapshot } from 'firebase/firestore';
import { Inquiry, Client, ActivityEvent, InquiryStatus, TreasuryEntry, TreasuryGoal, ConnectorItem } from '../types';

import { handleFirestoreError, OperationType } from './errors';

const toDate = (timestamp: any) => timestamp?.toDate() || new Date();

export const cleanFirestorePayload = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date || obj instanceof Timestamp) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => cleanFirestorePayload(item));
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        cleaned[key] = cleanFirestorePayload(obj[key]);
      }
    }
    return cleaned;
  }
  return obj;
};

export const api = {
  // --- GENERIC DELETE HELPERS ---
  deleteDocument: async (collection: string, id: string): Promise<void> => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`/api/admin/${collection}/${id}`, {
      method: 'DELETE',
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || `Failed to delete ${id} from ${collection}`);
    }
  },

  deleteAllDocuments: async (collection: string): Promise<{ deletedCount: number }> => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`/api/admin/${collection}`, {
      method: 'DELETE',
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Failed to clear ${collection}`);
    return data;
  },
  // --- INQUIRIES ---
  getInquiries: async (): Promise<Inquiry[]> => {
    try {
      const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: toDate(doc.data().createdAt),
        updatedAt: toDate(doc.data().updatedAt),
      } as Inquiry));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'inquiries');
    }
  },

  deleteAllInquiries: async (): Promise<{ deletedCount: number }> => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch('/api/admin/inquiries', {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete inquiries');
    return data;
  },

  getInquiry: async (id: string): Promise<Inquiry | null> => {
    try {
      const d = await getDoc(doc(db, 'inquiries', id));
      if (!d.exists()) return null;
      return {
        ...d.data(),
        id: d.id,
        createdAt: toDate(d.data().createdAt),
        updatedAt: toDate(d.data().updatedAt),
      } as Inquiry;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `inquiries/${id}`);
    }
  },

  createInquiry: async (data: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const newRef = doc(collection(db, 'inquiries'));
      await setDoc(newRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'inquiries');
    }
  },

  updateInquiry: async (id: string, data: Partial<Inquiry>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'inquiries', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `inquiries/${id}`);
    }
  },

  // --- CLIENTS ---
  getClients: async (): Promise<Client[]> => {
    try {
      const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: toDate(doc.data().createdAt),
        updatedAt: toDate(doc.data().updatedAt),
      } as Client));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'clients');
    }
  },

  createClient: async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const newRef = doc(collection(db, 'clients'));
      await setDoc(newRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'clients');
    }
  },
  
  getClient: async (id: string): Promise<Client | null> => {
    try {
      const d = await getDoc(doc(db, 'clients', id));
      if (!d.exists()) return null;
      return {
        ...d.data(),
        id: d.id,
        createdAt: toDate(d.data().createdAt),
        updatedAt: toDate(d.data().updatedAt),
      } as Client;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `clients/${id}`);
    }
  },

  updateClient: async (id: string, data: Partial<Client>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'clients', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `clients/${id}`);
    }
  },

  convertInquiryToClient: async (inq: Inquiry): Promise<string> => {
    try {
      if (inq.convertedClientId) {
        return inq.convertedClientId;
      }
      
      const clientsQ = query(collection(db, 'clients'), where('sourceInquiryId', '==', inq.id));
      const existingClients = await getDocs(clientsQ);
      if (!existingClients.empty) {
        const existingClientId = existingClients.docs[0].id;
        await updateDoc(doc(db, 'inquiries', inq.id!), { 
          status: 'WON', 
          convertedClientId: existingClientId,
          updatedAt: serverTimestamp()
        });
        return existingClientId;
      }

      const payload: any = {
        name: inq.company || inq.name,
        primaryContact: inq.name,
        company: inq.company,
        email: inq.email,
        phone: inq.phone,
        website: inq.website,
        sourceInquiryId: inq.id,
        notes: `Converted from Inquiry: ${inq.id}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const batch = writeBatch(db);
      
      const newClientRef = doc(collection(db, 'clients'));
      batch.set(newClientRef, payload);
      
      const inquiryRef = doc(db, 'inquiries', inq.id!);
      batch.update(inquiryRef, {
        status: 'WON',
        convertedClientId: newClientRef.id,
        updatedAt: serverTimestamp(),
      });
      
      const activityRef = doc(collection(db, 'activity'));
      batch.set(activityRef, {
        type: 'INQUIRY_CONVERTED',
        actorId: 'system',
        entityType: 'CLIENT',
        entityId: newClientRef.id,
        description: `Converted inquiry ${inq.name} to new client`,
        createdAt: serverTimestamp(),
      });

      await batch.commit();
      
      return newClientRef.id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- ACTIVITY ---
  getRecentActivity: async (): Promise<ActivityEvent[]> => {
    try {
      const q = query(collection(db, 'activity'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: toDate(doc.data().createdAt),
      } as ActivityEvent));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'activity');
    }
  },

  logActivity: async (event: Omit<ActivityEvent, 'id' | 'createdAt'>): Promise<void> => {
    try {
      const newRef = doc(collection(db, 'activity'));
      await setDoc(newRef, {
        ...event,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      // Intentionally swallow errors for activity logging to not break the main flow.
      console.error('Failed to log activity', error);
    }
  },

  // --- MEETINGS ---
  getMeetings: async (): Promise<any[]> => {
    try {
      const q = query(collection(db, 'meetings'), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: toDate(doc.data().date),
        createdAt: toDate(doc.data().createdAt),
        updatedAt: toDate(doc.data().updatedAt),
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  createMeeting: async (data: Omit<any, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const newRef = doc(collection(db, 'meetings'));
      await setDoc(newRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newRef.id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateMeeting: async (id: string, data: Partial<any>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'meetings', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- QUOTES ---
  getQuotes: async (): Promise<any[]> => {
    try {
      const q = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: toDate(doc.data().createdAt),
        updatedAt: toDate(doc.data().updatedAt),
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  createQuote: async (data: Omit<any, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const newRef = doc(collection(db, 'quotes'));
      const safeData = cleanFirestorePayload(data);
      await setDoc(newRef, {
        ...safeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newRef.id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateQuote: async (id: string, data: Partial<any>): Promise<void> => {
    try {
      const safeData = cleanFirestorePayload(data);
      await updateDoc(doc(db, 'quotes', id), {
        ...safeData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- PROJECTS ---
  getProjects: async (): Promise<any[]> => {
    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: toDate(doc.data().createdAt),
        updatedAt: toDate(doc.data().updatedAt),
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  createProject: async (data: Omit<any, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const newRef = doc(collection(db, 'projects'));
      await setDoc(newRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newRef.id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateProject: async (id: string, data: Partial<any>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'projects', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- TASKS ---
  getTasks: async (): Promise<any[]> => {
    try {
      const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: toDate(doc.data().createdAt),
        updatedAt: toDate(doc.data().updatedAt),
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  createTask: async (data: Omit<any, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const newRef = doc(collection(db, 'tasks'));
      await setDoc(newRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newRef.id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateTask: async (id: string, data: Partial<any>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'tasks', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- INVOICES ---
  getInvoices: async (): Promise<any[]> => {
    try {
      const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: toDate(doc.data().createdAt),
        updatedAt: toDate(doc.data().updatedAt),
        dueDate: toDate(doc.data().dueDate),
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  createInvoice: async (data: Omit<any, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const newRef = doc(collection(db, 'invoices'));
      await setDoc(newRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newRef.id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  generateSwipeInvoice: async (projectId: string) => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch('/api/admin/invoices/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      body: JSON.stringify({ projectId })
    });
    const contentType = res.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(`Expected JSON but got ${contentType}. Status: ${res.status}. Preview: ${text.substring(0, 100)}`);
    }
    if (!res.ok) throw new Error(data.error || 'Failed to generate invoice');
    return data.invoiceId;
  },

  updateInvoice: async (id: string, data: Partial<any>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'invoices', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- CATALOG SERVICES ---
  getCatalogServices: async (): Promise<any[]> => {
    try {
      const q = query(collection(db, 'catalogServices'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: toDate(doc.data().createdAt),
        updatedAt: toDate(doc.data().updatedAt),
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  createCatalogService: async (data: Omit<any, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const newRef = doc(collection(db, 'catalogServices'));
      await setDoc(newRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newRef.id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateCatalogService: async (id: string, data: Partial<any>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'catalogServices', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- SERVICE CATEGORIES ---
  getServiceCategories: async (): Promise<any[]> => {
    try {
      const q = query(collection(db, 'serviceCategories'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: toDate(doc.data().createdAt),
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  createServiceCategory: async (data: Omit<any, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const newRef = doc(collection(db, 'serviceCategories'));
      await setDoc(newRef, {
        ...data,
        createdAt: serverTimestamp(),
      });
      return newRef.id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- DELIVERABLES ---
  getDeliverables: async (projectId?: string): Promise<any[]> => {
    try {
      let q = query(collection(db, 'deliverables'), orderBy('createdAt', 'desc'));
      if (projectId) {
        q = query(collection(db, 'deliverables'), where('projectId', '==', projectId), orderBy('createdAt', 'desc'));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: toDate(doc.data().createdAt),
        dueDate: toDate(doc.data().dueDate),
        completedAt: toDate(doc.data().completedAt),
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  createDeliverable: async (data: Omit<any, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const newRef = doc(collection(db, 'deliverables'));
      await setDoc(newRef, {
        ...data,
        createdAt: serverTimestamp(),
      });
      return newRef.id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateDeliverable: async (id: string, data: Partial<any>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'deliverables', id), data);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- PAYMENTS ---
  getPayments: async (): Promise<any[]> => {
    try {
      const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: toDate(doc.data().date),
        createdAt: toDate(doc.data().createdAt),
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  createPayment: async (data: Omit<any, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const newRef = doc(collection(db, 'payments'));
      await setDoc(newRef, {
        ...data,
        createdAt: serverTimestamp(),
      });
      return newRef.id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- TREASURY ENTRIES ---
  getTreasuryEntries: async (): Promise<TreasuryEntry[]> => {
    try {
      const q = query(collection(db, 'treasuryEntries'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: toDate(doc.data().date),
        createdAt: toDate(doc.data().createdAt),
      } as TreasuryEntry));
    } catch (error) {
      console.warn('Could not fetch treasury entries from firestore, using local state:', error);
      return [];
    }
  },

  createTreasuryEntry: async (data: Omit<TreasuryEntry, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const newRef = doc(collection(db, 'treasuryEntries'));
      const safeData = cleanFirestorePayload(data);
      await setDoc(newRef, {
        ...safeData,
        createdAt: serverTimestamp(),
      });

      // Log activity
      await api.logActivity({
        type: data.type === 'CAPITAL_INFLOW' ? 'CAPITAL_RECEIVED' : 'EXPENSE_RECORDED',
        actorId: 'executive',
        entityType: 'TREASURY',
        entityId: newRef.id,
        description: `Logged treasury ${data.type.toLowerCase().replace('_', ' ')}: $${Number(data.amount).toLocaleString()} (${data.category}) - ${data.description || 'Studio Allocation'}`,
      });

      return newRef.id;
    } catch (error) {
      console.error('Error creating treasury entry:', error);
      throw error;
    }
  },

  deleteTreasuryEntry: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'treasuryEntries', id));
    } catch (error) {
      console.error('Error deleting treasury entry:', error);
      throw error;
    }
  },

  // --- TREASURY GOALS ---
  getTreasuryGoals: async (): Promise<TreasuryGoal[]> => {
    try {
      const d = await getDoc(doc(db, 'settings', 'treasuryGoals'));
      if (d.exists() && d.data()?.goals) {
        return d.data().goals;
      }
    } catch (e) {
      console.warn('Could not load treasury goals from firestore, using defaults:', e);
    }
    return [
      { id: 'goal-revenue-ytd', name: "Annual Studio Revenue Target", target: 250000, category: 'REVENUE' },
      { id: 'goal-reserve-liquid', name: "Operating Runway Liquid Reserve", target: 150000, category: 'RESERVE' },
      { id: 'goal-gpu-cluster', name: "Hardware GPU Rendering Cluster", target: 80000, category: 'HARDWARE' },
      { id: 'goal-global-expansion', name: "Global Studio Expansion Fund", target: 500000, category: 'CAPITAL' }
    ];
  },

  saveTreasuryGoals: async (goals: TreasuryGoal[]): Promise<void> => {
    try {
      await setDoc(doc(db, 'settings', 'treasuryGoals'), {
        goals,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.error('Failed to save treasury goals:', e);
    }
  },

  // --- CONNECTORS & INTEGRATIONS ---
  getConnectors: async (): Promise<ConnectorItem[]> => {
    const defaultConnectors: ConnectorItem[] = [
      {
        id: 'google-mail',
        name: 'Google Mail (Gmail API)',
        category: 'GOOGLE_WORKSPACE',
        ecosystem: 'Google Workspace',
        description: 'Synchronizes client email inquiries, quote delivery receipts, and two-way correspondence.',
        status: 'CONNECTED',
        latencyMs: 38,
        endpointUrl: 'https://gmail.googleapis.com/gmail/v1/users/me',
        scopes: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
        authType: 'OAUTH2',
        lastSyncedAt: new Date().toISOString()
      },
      {
        id: 'google-drive',
        name: 'Google Drive Storage API',
        category: 'GOOGLE_WORKSPACE',
        ecosystem: 'Google Workspace',
        description: 'Automated client folder provisioning, 3D asset vaults, pitch decks, and delivery storage.',
        status: 'CONNECTED',
        latencyMs: 44,
        endpointUrl: 'https://www.googleapis.com/drive/v3/files',
        scopes: ['https://www.googleapis.com/auth/drive.file'],
        authType: 'OAUTH2',
        lastSyncedAt: new Date().toISOString()
      },
      {
        id: 'google-sheets',
        name: 'Google Sheets Financial Modeling',
        category: 'GOOGLE_WORKSPACE',
        ecosystem: 'Google Workspace',
        description: 'Exports live invoices, receivables pipelines, and studio treasury ledger mark-to-market valuations.',
        status: 'CONNECTED',
        latencyMs: 52,
        endpointUrl: 'https://sheets.googleapis.com/v4/spreadsheets',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        authType: 'OAUTH2',
        lastSyncedAt: new Date().toISOString()
      },
      {
        id: 'google-calendar',
        name: 'Google Calendar & Meet',
        category: 'GOOGLE_WORKSPACE',
        ecosystem: 'Google Workspace',
        description: 'Auto-generates Google Meet discovery links and synchronizes executive appointment calendars.',
        status: 'CONNECTED',
        latencyMs: 31,
        endpointUrl: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        scopes: ['https://www.googleapis.com/auth/calendar.events'],
        authType: 'OAUTH2',
        lastSyncedAt: new Date().toISOString()
      },
      {
        id: 'calcom-webhook',
        name: 'Cal.com Booking Dispatcher',
        category: 'SCHEDULING',
        ecosystem: 'Sales & Intake',
        description: 'Webhook listener verifying BOOKING_CREATED payloads and creating idempotent meeting records.',
        status: 'CONNECTED',
        latencyMs: 19,
        endpointUrl: '/api/webhooks/calcom',
        authType: 'WEBHOOK',
        lastSyncedAt: new Date().toISOString()
      },
      {
        id: 'swipe-billing',
        name: 'Swipe Partner Invoicing API v2',
        category: 'INVOICING',
        ecosystem: 'Financial Operations',
        description: 'Generates GST-compliant customer invoices, PDF documentation, and tax payment links via app.getswipe.in.',
        status: 'CONNECTED',
        latencyMs: 86,
        endpointUrl: 'https://app.getswipe.in/api/partner/v2/doc',
        authType: 'API_KEY',
        lastSyncedAt: new Date().toISOString()
      },
      {
        id: 'kymr-public-api',
        name: 'Kymr Public Website & Webscope API',
        category: 'PUBLIC_WEB',
        ecosystem: 'Sales & Intake',
        description: 'Secure proxy endpoint (/api/public/inquiries) for design scope calculator submissions and lead generation.',
        status: 'CONNECTED',
        latencyMs: 24,
        endpointUrl: '/api/public/inquiries',
        authType: 'SERVICE_ACCOUNT',
        lastSyncedAt: new Date().toISOString()
      },
      {
        id: 'stripe-payments',
        name: 'Stripe & Banking Merchant Webhook',
        category: 'PAYMENTS',
        ecosystem: 'Financial Operations',
        description: 'Automated invoice card processing, ACH settlements, and instant treasury reserve balance updates.',
        status: 'CONNECTED',
        latencyMs: 42,
        endpointUrl: '/api/webhooks/stripe',
        authType: 'WEBHOOK',
        lastSyncedAt: new Date().toISOString()
      },
      {
        id: 'crypto-rpc',
        name: 'Web3 Multi-Chain Treasury RPC Node',
        category: 'TREASURY',
        ecosystem: 'Treasury & Reserves',
        description: 'Real-time JSON-RPC node query for Bitcoin, Ethereum, and Solana multisig reserve balances.',
        status: 'CONNECTED',
        latencyMs: 65,
        endpointUrl: 'https://rpc.ankr.com/multichain',
        authType: 'API_KEY',
        lastSyncedAt: new Date().toISOString()
      },
      {
        id: 'firebase-firestore',
        name: 'Google Cloud Firestore Distributed DB',
        category: 'CLOUD',
        ecosystem: 'Infrastructure',
        description: 'Multi-region NoSQL persistent document store with real-time listeners and security rules.',
        status: 'CONNECTED',
        latencyMs: 14,
        endpointUrl: 'firestore.googleapis.com',
        authType: 'SERVICE_ACCOUNT',
        lastSyncedAt: new Date().toISOString()
      },
      {
        id: 'cloud-run-runtime',
        name: 'Cloud Run Node Express Container',
        category: 'CLOUD',
        ecosystem: 'Infrastructure',
        description: 'Containerized Express runtime managing rate limits, OAuth callback handshakes, and API endpoints.',
        status: 'CONNECTED',
        latencyMs: 12,
        endpointUrl: 'http://localhost:8000/api',
        authType: 'SERVICE_ACCOUNT',
        lastSyncedAt: new Date().toISOString()
      }
    ];

    try {
      const d = await getDoc(doc(db, 'settings', 'connectors'));
      if (d.exists() && d.data()?.connectors) {
        const saved = d.data().connectors;
        // Merge with defaults to ensure all fields and any new connectors exist
        return defaultConnectors.map(def => {
          const s = saved.find((x: any) => x.id === def.id);
          return s ? { ...def, ...s } : def;
        });
      }
    } catch (e) {
      console.warn('Could not load connectors from firestore, using defaults:', e);
    }

    return defaultConnectors;
  },

  updateConnector: async (id: string, updates: Partial<ConnectorItem>): Promise<void> => {
    try {
      const current = await api.getConnectors();
      const updated = current.map(c => c.id === id ? { ...c, ...updates, lastSyncedAt: new Date().toISOString() } : c);
      await setDoc(doc(db, 'settings', 'connectors'), {
        connectors: updated,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.error('Error updating connector:', e);
    }
  },

  saveAllConnectors: async (connectors: ConnectorItem[]): Promise<void> => {
    try {
      await setDoc(doc(db, 'settings', 'connectors'), {
        connectors,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.error('Error saving all connectors:', e);
    }
  },

  // --- REAL-TIME SUBSCRIPTION HELPER ---
  subscribeToCollection: (colName: string, callback: (docs: any[]) => void): (() => void) => {
    try {
      const q = query(collection(db, colName));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id,
          createdAt: toDate(d.data().createdAt),
          updatedAt: toDate(d.data().updatedAt),
          date: toDate(d.data().date),
          dueDate: toDate(d.data().dueDate),
        }));
        callback(data);
      }, (error) => {
        console.warn(`Firestore onSnapshot failed for ${colName}, relying on standard queries:`, error);
      });
      return unsubscribe;
    } catch (err) {
      console.warn(`Could not set up live subscription for ${colName}:`, err);
      return () => {};
    }
  }
};


