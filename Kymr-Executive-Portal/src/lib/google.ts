import firebaseConfig from '../../firebase-applet-config.json';

const CLIENT_ID = (firebaseConfig as any).oAuthClientId;
const API_KEY = (firebaseConfig as any).apiKey;

const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
];

const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/meetings.space.created https://www.googleapis.com/auth/meetings.space.readonly https://www.googleapis.com/auth/meetings.space.settings';

let tokenClient: google.accounts.oauth2.TokenClient;
let gapiInitialized = false;
let tokenResolveCallback: ((token: string) => void) | null = null;
let tokenRejectCallback: ((reason?: any) => void) | null = null;

export const initGoogleWorkspace = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (gapiInitialized) {
      resolve();
      return;
    }

    const initClient = () => {
      gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
      }).then(() => {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (resp) => {
            if (tokenResolveCallback) {
               if (resp.error !== undefined) {
                 tokenRejectCallback?.(resp);
               } else {
                 tokenResolveCallback(resp.access_token);
               }
            }
          }
        });
        gapiInitialized = true;
        resolve();
      }).catch(reject);
    };

    gapi.load('client', initClient);
  });
};

export const requestGoogleAuthorization = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Google Workspace not initialized"));
      return;
    }
    
    tokenResolveCallback = resolve;
    tokenRejectCallback = reject;

    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const setGoogleToken = (token: string) => {
  gapi.client.setToken({ access_token: token });
};

export const revokeGoogleToken = () => {
  const token = gapi.client.getToken();
  if (token) {
    google.accounts.oauth2.revoke(token.access_token, () => {
      gapi.client.setToken(null);
    });
  }
};

export const isGoogleAuthorized = (): boolean => {
  return gapi.client.getToken() !== null;
};

// --- GMAIL ---
export const searchEmails = async (query: string, maxResults = 10) => {
  if (!isGoogleAuthorized()) throw new Error("Not authorized");
  const res = await gapi.client.gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults
  });
  
  if (!res.result.messages) return [];
  
  const messages = await Promise.all(
    res.result.messages.map(async (m) => {
      const msgRes = await gapi.client.gmail.users.messages.get({
        userId: 'me',
        id: m.id!,
        format: 'metadata',
        metadataHeaders: ['From', 'To', 'Subject', 'Date']
      });
      return msgRes.result;
    })
  );
  return messages;
};

export const sendEmail = async (to: string, subject: string, message: string) => {
  if (!isGoogleAuthorized()) throw new Error("Not authorized");
  
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    message
  ];
  
  const messageStr = messageParts.join('\n');
  const encodedMessage = btoa(unescape(encodeURIComponent(messageStr))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  const res = await gapi.client.gmail.users.messages.send({
    userId: 'me',
    resource: {
      raw: encodedMessage
    }
  });
  
  return res.result;
};

// --- CALENDAR ---
export const createCalendarEvent = async (title: string, date: Date, durationMinutes: number, attendeeEmails: string[], description?: string) => {
  if (!isGoogleAuthorized()) throw new Error("Not authorized");
  
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

  const res = await gapi.client.calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    resource: event
  });
  
  return res.result; // contains id, htmlLink, hangoutLink, etc.
};

// --- DRIVE ---
export const createDriveFolder = async (name: string, parentId?: string) => {
  if (!isGoogleAuthorized()) throw new Error("Not authorized");
  
  const fileMetadata: any = {
    name: name,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentId) {
    fileMetadata.parents = [parentId];
  }
  
  const res = await gapi.client.drive.files.create({
    resource: fileMetadata,
    fields: 'id, name, webViewLink'
  });
  return res.result;
};

export const searchDriveFiles = async (query: string) => {
  if (!isGoogleAuthorized()) throw new Error("Not authorized");
  const res = await gapi.client.drive.files.list({
    q: query,
    fields: 'files(id, name, mimeType, webViewLink, createdTime)',
    pageSize: 10
  });
  return res.result.files || [];
};

export const uploadFileToDrive = async (file: File, folderId?: string, customName?: string) => {
  if (!isGoogleAuthorized()) throw new Error("Not authorized");
  
  const metadata = {
    name: customName || file.name,
    mimeType: file.type,
    parents: folderId ? [folderId] : undefined
  };
  
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);
  
  const token = gapi.client.getToken()?.access_token;
  if (!token) throw new Error("No access token");
  
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: form
  });
  
  return await res.json();
};
export const createSpreadsheet = async (title: string, sheetData: any[][]) => {
  if (!isGoogleAuthorized()) throw new Error("Not authorized");
  
  const createRes = await gapi.client.sheets.spreadsheets.create({
    resource: {
      properties: { title }
    }
  });
  
  const spreadsheetId = createRes.result.spreadsheetId!;
  
  if (sheetData.length > 0) {
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: sheetData
      }
    });
  }
  
  return createRes.result;
};

export const createMeetSpace = async () => {
  if (!isGoogleAuthorized()) throw new Error("Not authorized");
  
  const token = gapi.client.getToken()?.access_token;
  if (!token) throw new Error("No access token");

  const res = await fetch('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({}),
  });
  
  if (!res.ok) {
    throw new Error(`Failed to create Meet space: ${res.statusText}`);
  }
  
  return await res.json();
};
