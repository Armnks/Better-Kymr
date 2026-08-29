import { getAuth } from 'firebase/auth';

const getAuthToken = async () => {
  const auth = getAuth();
  if (!auth.currentUser) throw new Error("Not logged in");
  return await auth.currentUser.getIdToken();
};

const apiCall = async (path: string, method: string = 'POST', body?: any) => {
  const token = await getAuthToken();
  const res = await fetch(`/api/google${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `API Error: ${res.status}`);
  }
  return await res.json();
};

// Removed frontend init functions, now handled by GoogleContext and backend

export const isGoogleAuthorized = (): boolean => {
  // Now managed via GoogleContext state
  return true;
};

// --- GMAIL ---
export const searchEmails = async (query: string, maxResults = 10) => {
  // Implement via backend if needed, for now we only support sending emails 
  // as per prompt "At minimum ensure persistent authorization can support: Gmail, Calendar, Drive, Sheets"
  throw new Error("searchEmails is not implemented in backend yet");
};

export const sendEmail = async (to: string, subject: string, message: string) => {
  return await apiCall('/gmail/send', 'POST', { to, subject, message });
};

// --- CALENDAR ---
export const createCalendarEvent = async (title: string, date: Date, durationMinutes: number, attendeeEmails: string[], description?: string) => {
  const startDateTime = new Date(date);
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);
  
  const event = {
    summary: title,
    description: description || '',
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    attendees: attendeeEmails.map(email => ({ email })),
    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(36).substring(7),
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    }
  };

  return await apiCall('/calendar/events', 'POST', event);
};

// --- DRIVE ---
export const createDriveFolder = async (name: string, parentId?: string) => {
  const reqBody: any = { name, mimeType: 'application/vnd.google-apps.folder' };
  if (parentId) reqBody.parents = [parentId];
  return await apiCall('/drive/folders', 'POST', reqBody);
};

export const searchDriveFiles = async (query: string) => {
  const token = await getAuthToken();
  const res = await fetch(`/api/google/drive/search?q=${encodeURIComponent(query)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Search failed");
  return await res.json();
};

export const uploadFileToDrive = async (file: File, folderId?: string, customName?: string) => {
  // For production, multipart form data should be handled by a dedicated backend route
  // For now, this is a placeholder since file upload requires FormData handling
  throw new Error("uploadFileToDrive multipart requires backend formData parsing");
};

export const createSpreadsheet = async (title: string, sheetData: any[][]) => {
  return await apiCall('/sheets', 'POST', { title, sheetData });
};

export const createMeetSpace = async () => {
  // Using calendar event is the preferred way to generate meet links anyway,
  // but if explicitly requested:
  return await apiCall('/meet/spaces', 'POST');
};
