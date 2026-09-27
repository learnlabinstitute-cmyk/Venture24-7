import {
  TaskItem,
  NoteItem,
  MeetingItem,
  SavedConversationSession,
  ClientProfile,
  SupportTicket,
} from '../types';

const DB_NAME = 'VentureInfotechSupport24DB';
const DB_VERSION = 3;

export const STORES = {
  CONVERSATIONS: 'conversations',
  TASKS: 'tasks',
  NOTES: 'notes',
  MEETINGS: 'meetings',
  METADATA: 'metadata',
  TICKETS: 'tickets',
  CLIENT_PROFILES: 'client_profiles',
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Conversations store
      if (!db.objectStoreNames.contains(STORES.CONVERSATIONS)) {
        const convStore = db.createObjectStore(STORES.CONVERSATIONS, { keyPath: 'id' });
        convStore.createIndex('createdAt', 'createdAt', { unique: false });
        convStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // 2. Tasks store
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        const taskStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
        taskStore.createIndex('createdAt', 'createdAt', { unique: false });
        taskStore.createIndex('status', 'status', { unique: false });
        taskStore.createIndex('priority', 'priority', { unique: false });
        taskStore.createIndex('sessionId', 'sessionId', { unique: false });
      }

      // 3. Notes store
      if (!db.objectStoreNames.contains(STORES.NOTES)) {
        const noteStore = db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
        noteStore.createIndex('createdAt', 'createdAt', { unique: false });
        noteStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        noteStore.createIndex('sessionId', 'sessionId', { unique: false });
      }

      // 4. Meetings store
      if (!db.objectStoreNames.contains(STORES.MEETINGS)) {
        const meetingStore = db.createObjectStore(STORES.MEETINGS, { keyPath: 'id' });
        meetingStore.createIndex('createdAt', 'createdAt', { unique: false });
        meetingStore.createIndex('date', 'date', { unique: false });
        meetingStore.createIndex('status', 'status', { unique: false });
        meetingStore.createIndex('sessionId', 'sessionId', { unique: false });
      }

      // 5. Metadata / Settings store
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
      }

      // 6. Support Tickets store
      if (!db.objectStoreNames.contains(STORES.TICKETS)) {
        const ticketStore = db.createObjectStore(STORES.TICKETS, { keyPath: 'id' });
        ticketStore.createIndex('createdAt', 'createdAt', { unique: false });
        ticketStore.createIndex('status', 'status', { unique: false });
        ticketStore.createIndex('plan', 'plan', { unique: false });
        ticketStore.createIndex('category', 'category', { unique: false });
      }

      // 7. Client Profiles store
      if (!db.objectStoreNames.contains(STORES.CLIENT_PROFILES)) {
        db.createObjectStore(STORES.CLIENT_PROFILES, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
}

// Generic transaction helpers
async function performTx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let req: IDBRequest<T> | void;

    try {
      req = callback(store);
    } catch (e) {
      reject(e);
      return;
    }

    tx.oncomplete = () => {
      if (req) {
        resolve(req.result);
      } else {
        resolve(undefined as unknown as T);
      }
    };

    tx.onerror = () => {
      reject(tx.error);
    };
  });
}

// ----------------- CONVERSATIONS -----------------
export async function saveConversationToDB(session: SavedConversationSession): Promise<void> {
  await performTx(STORES.CONVERSATIONS, 'readwrite', (store) => store.put(session));
}

export async function getAllConversationsFromDB(): Promise<SavedConversationSession[]> {
  const items = await performTx<SavedConversationSession[]>(STORES.CONVERSATIONS, 'readonly', (store) =>
    store.getAll()
  );
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteConversationFromDB(id: string): Promise<void> {
  await performTx(STORES.CONVERSATIONS, 'readwrite', (store) => store.delete(id));
}

// ----------------- TASKS -----------------
export async function saveTaskToDB(task: TaskItem): Promise<void> {
  await performTx(STORES.TASKS, 'readwrite', (store) => store.put(task));
}

export async function getAllTasksFromDB(): Promise<TaskItem[]> {
  const items = await performTx<TaskItem[]>(STORES.TASKS, 'readonly', (store) => store.getAll());
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteTaskFromDB(id: string): Promise<void> {
  await performTx(STORES.TASKS, 'readwrite', (store) => store.delete(id));
}

// ----------------- NOTES -----------------
export async function saveNoteToDB(note: NoteItem): Promise<void> {
  await performTx(STORES.NOTES, 'readwrite', (store) => store.put(note));
}

export async function getAllNotesFromDB(): Promise<NoteItem[]> {
  const items = await performTx<NoteItem[]>(STORES.NOTES, 'readonly', (store) => store.getAll());
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteNoteFromDB(id: string): Promise<void> {
  await performTx(STORES.NOTES, 'readwrite', (store) => store.delete(id));
}

// ----------------- MEETINGS / CALLBACKS -----------------
export async function saveMeetingToDB(meeting: MeetingItem): Promise<void> {
  await performTx(STORES.MEETINGS, 'readwrite', (store) => store.put(meeting));
}

export async function getAllMeetingsFromDB(): Promise<MeetingItem[]> {
  const items = await performTx<MeetingItem[]>(STORES.MEETINGS, 'readonly', (store) => store.getAll());
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteMeetingFromDB(id: string): Promise<void> {
  await performTx(STORES.MEETINGS, 'readwrite', (store) => store.delete(id));
}

// ----------------- SUPPORT TICKETS -----------------
export async function saveTicketToDB(ticket: SupportTicket): Promise<void> {
  await performTx(STORES.TICKETS, 'readwrite', (store) => store.put(ticket));
}

export async function getAllTicketsFromDB(): Promise<SupportTicket[]> {
  const items = await performTx<SupportTicket[]>(STORES.TICKETS, 'readonly', (store) => store.getAll());
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteTicketFromDB(id: string): Promise<void> {
  await performTx(STORES.TICKETS, 'readwrite', (store) => store.delete(id));
}

// ----------------- CLIENT PROFILES -----------------
export async function saveClientProfileToDB(profile: ClientProfile): Promise<void> {
  await performTx(STORES.CLIENT_PROFILES, 'readwrite', (store) => store.put(profile));
}

export async function getClientProfileFromDB(id = 'default-client'): Promise<ClientProfile | null> {
  const profile = await performTx<ClientProfile | undefined>(STORES.CLIENT_PROFILES, 'readonly', (store) =>
    store.get(id)
  );
  return profile || null;
}

// ----------------- BACKUP IMPORT & EXPORT -----------------
export async function exportAllIndexedDBData(): Promise<string> {
  const [conversations, tasks, notes, meetings, tickets, profile] = await Promise.all([
    getAllConversationsFromDB(),
    getAllTasksFromDB(),
    getAllNotesFromDB(),
    getAllMeetingsFromDB(),
    getAllTicketsFromDB(),
    getClientProfileFromDB(),
  ]);

  const backupData = {
    appName: 'Venture Infotech Support 24 Calling IVR',
    exportedAt: new Date().toISOString(),
    version: DB_VERSION,
    conversations,
    tasks,
    notes,
    meetings,
    tickets,
    profile,
  };

  return JSON.stringify(backupData, null, 2);
}

export async function importAllIndexedDBData(jsonData: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonData);

    if (Array.isArray(data.conversations)) {
      for (const item of data.conversations) {
        await saveConversationToDB(item);
      }
    }
    if (Array.isArray(data.tasks)) {
      for (const item of data.tasks) {
        await saveTaskToDB(item);
      }
    }
    if (Array.isArray(data.notes)) {
      for (const item of data.notes) {
        await saveNoteToDB(item);
      }
    }
    if (Array.isArray(data.meetings)) {
      for (const item of data.meetings) {
        await saveMeetingToDB(item);
      }
    }
    if (Array.isArray(data.tickets)) {
      for (const item of data.tickets) {
        await saveTicketToDB(item);
      }
    }
    if (data.profile) {
      await saveClientProfileToDB(data.profile);
    }

    return true;
  } catch (err) {
    console.error('Failed to import backup data:', err);
    return false;
  }
}

export async function clearAllIndexedDBData(): Promise<void> {
  const db = await getDB();
  const storeNames = [
    STORES.CONVERSATIONS,
    STORES.TASKS,
    STORES.NOTES,
    STORES.MEETINGS,
    STORES.TICKETS,
    STORES.CLIENT_PROFILES,
    STORES.METADATA,
  ];

  for (const name of storeNames) {
    if (db.objectStoreNames.contains(name)) {
      await performTx(name, 'readwrite', (store) => store.clear());
    }
  }
}
