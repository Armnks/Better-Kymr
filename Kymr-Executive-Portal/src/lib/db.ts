import { db, auth } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, Timestamp, DocumentData, writeBatch } from 'firebase/firestore';
import { Inquiry, Client, ActivityEvent, InquiryStatus } from '../types';
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
    const data = await res.json();
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
  }
};

