import Dexie, { type Table } from 'dexie'

interface LocalNote {
  id: string
  userId: string
  title: string
  content: object | null
  updatedAt: string
  synced: boolean
}

interface SyncQueueItem {
  id?: number
  action: 'create' | 'update' | 'delete'
  noteId: string
  payload?: object
  createdAt: string
}

class NotesOfflineDB extends Dexie {
  notes!: Table<LocalNote>
  syncQueue!: Table<SyncQueueItem>

  constructor() {
    super('notes-offline')
    this.version(1).stores({
      notes: 'id, userId, updatedAt, synced',
      syncQueue: '++id, action, noteId, createdAt',
    })
  }
}

export const offlineDb = new NotesOfflineDB()
