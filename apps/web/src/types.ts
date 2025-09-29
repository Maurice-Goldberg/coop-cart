export interface Item {
  id: string;
  spaceId: string;
  rawText?: string;
  name: string;
  qty?: number;
  unit?: string;
  notes?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  checked: boolean;
}

export interface List {
  listId: string;
  spaceId: string;
  version: number;
  items: Item[];
}

export interface Space {
  spaceId: string;
  name: string;
  categoryOrder: string[];
}

export interface Room {
  roomCode: string;
  pin?: string;
  spaces: Space[];
}

export interface MergeRequest {
  roomCode: string;
  spaceId: string;
  clientVersion: number;
  clientOps: any[];
}

export interface MergeResponse {
  serverVersion: number;
  list: List;
}

export interface CreateRoomRequest {
  pin?: string;
}

export interface CreateRoomResponse {
  roomCode: string;
  room: Room;
}

export interface JoinRoomRequest {
  roomCode: string;
  pin?: string;
}

export interface JoinRoomResponse {
  success: boolean;
  room?: Room;
  message?: string;
}

export interface ParseRequest {
  text: string;
}

export interface ParseResponse {
  items: Item[];
}

export type SyncStatus = 'idle' | 'syncing' | 'ok' | 'error';

export interface PendingOp {
  id: string;
  type: 'add_item' | 'update_item' | 'toggle_item' | 'remove_item';
  data: any;
  timestamp: number;
}
