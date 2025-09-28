import {
  CreateRoomRequest, CreateRoomResponse, JoinRoomRequest, JoinRoomResponse,
  ParseRequest, ParseResponse, MergeRequest, MergeResponse
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  async createRoom(data: CreateRoomRequest): Promise<CreateRoomResponse> {
    return request<CreateRoomResponse>('/api/room/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async joinRoom(data: JoinRoomRequest): Promise<JoinRoomResponse> {
    return request<JoinRoomResponse>('/api/room/join', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async parseText(data: ParseRequest): Promise<ParseResponse> {
    return request<ParseResponse>('/api/parse', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async mergeList(data: MergeRequest): Promise<MergeResponse> {
    return request<MergeResponse>('/api/list/merge', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async healthCheck(): Promise<{ status: string; rooms: number; lists: number }> {
    return request<{ status: string; rooms: number; lists: number }>('/api/health');
  },
};

export { ApiError };
