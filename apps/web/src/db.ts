import Dexie, { Table } from 'dexie';
import { Item, PendingOp } from './types';

export class CoopCartDB extends Dexie {
  items!: Table<Item>;
  pendingOps!: Table<PendingOp>;
  meta!: Table<{ key: string; value: any }>;

  constructor() {
    super('CoopCartDB');
    this.version(1).stores({
      items: 'id, category, name, checked, createdAt',
      pendingOps: 'id, type, timestamp',
      meta: 'key'
    });
  }
}

export const db = new CoopCartDB();

// Helper functions for database operations
export const getItems = async (spaceId: string): Promise<Item[]> => {
  return await db.items.where('spaceId').equals(spaceId).toArray();
};

export const addItem = async (item: Item): Promise<void> => {
  await db.items.add(item);
};

export const updateItem = async (id: string, updates: Partial<Item>): Promise<void> => {
  await db.items.update(id, updates);
};

export const removeItem = async (id: string): Promise<void> => {
  await db.items.delete(id);
};

export const clearItems = async (spaceId: string): Promise<void> => {
  await db.items.where('spaceId').equals(spaceId).delete();
};

export const setItems = async (items: Item[]): Promise<void> => {
  // Clear existing items and add new ones
  await db.items.clear();
  await db.items.bulkAdd(items);
};

export const getPendingOps = async (): Promise<PendingOp[]> => {
  return await db.pendingOps.orderBy('timestamp').toArray();
};

export const addPendingOp = async (op: PendingOp): Promise<void> => {
  await db.pendingOps.add(op);
};

export const clearPendingOps = async (): Promise<void> => {
  await db.pendingOps.clear();
};

export const getMeta = async (key: string): Promise<any> => {
  const meta = await db.meta.get(key);
  return meta?.value;
};

export const setMeta = async (key: string, value: any): Promise<void> => {
  await db.meta.put({ key, value });
};
