import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../ui/App';
import { api } from '../api';
import { db, clearPendingOps } from '../db';

// Mock the API
vi.mock('../api', () => ({
  api: {
    createRoom: vi.fn(),
    joinRoom: vi.fn(),
    sendUpdate: vi.fn(),
  }
}));

// Mock the database
vi.mock('../db', () => ({
  db: {
    items: {
      clear: vi.fn(),
    }
  },
  clearPendingOps: vi.fn(),
}));

// Mock the hooks
vi.mock('../hooks/useList', () => ({
  useList: () => ({
    items: [],
    addItem: vi.fn(),
    replaceItems: vi.fn(),
    refresh: vi.fn(),
  })
}));

vi.mock('../hooks/useSync', () => ({
  useSync: () => ({
    status: 'idle',
    pendingOps: [],
    addPendingOperation: vi.fn(),
    sendUpdate: vi.fn(),
    resetStatus: vi.fn(),
  })
}));

describe('Integration Tests - Critical User Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete User Journey', () => {
    it('should allow user to create room, add items, and sync', async () => {
      const { api } = await import('../api');
      
      // Mock successful room creation
      vi.mocked(api.createRoom).mockResolvedValue({
        room: { roomCode: 'ABC123', spaces: [] }
      });

      // Mock successful sync
      vi.mocked(api.sendUpdate).mockResolvedValue({
        serverVersion: 1,
        list: {
          items: [
            {
              id: '1',
              name: 'milk',
              category: 'Dairy & Eggs',
              checked: false
            }
          ]
        }
      });

      render(<App />);
      
      // 1. Create room
      const createButtons = screen.getAllByText('Create Room');
      const createButton = createButtons[1];
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByText('Room: ABC123')).toBeInTheDocument();
      });

      // 2. Add item
      const input = screen.getByPlaceholderText('Add an item to your grocery list...');
      fireEvent.change(input, { target: { value: 'milk' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      // 3. Verify item was added (mocked)
      expect(screen.getByDisplayValue('milk')).toBeInTheDocument();
    });

    it('should handle room joining flow', async () => {
      const { api } = await import('../api');
      
      // Mock successful room joining
      vi.mocked(api.joinRoom).mockResolvedValue({
        success: true,
        room: { roomCode: 'XYZ789', spaces: [] },
        message: 'Successfully joined room'
      });

      render(<App />);
      
      // Switch to join mode
      const joinButton = screen.getByText('Join Room');
      fireEvent.click(joinButton);
      
      // Enter room code
      const roomCodeInput = screen.getByPlaceholderText('Enter room code');
      fireEvent.change(roomCodeInput, { target: { value: 'XYZ789' } });
      
      // Click join
      const joinButtons = screen.getAllByText('Join Room');
      const joinSubmitButton = joinButtons[1]; // The second one is the primary button
      fireEvent.click(joinSubmitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Room: XYZ789')).toBeInTheDocument();
      });
    });

    it('should handle sync errors gracefully', async () => {
      const { api } = await import('../api');
      
      // Mock room creation
      vi.mocked(api.createRoom).mockResolvedValue({
        room: { roomCode: 'ABC123', spaces: [] }
      });

      // Mock sync error
      vi.mocked(api.sendUpdate).mockRejectedValue(new Error('Network error'));

      render(<App />);
      
      // Create room
      const createButtons = screen.getAllByText('Create Room');
      const createButton = createButtons[1];
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByText('Room: ABC123')).toBeInTheDocument();
      });

      // The app should still be functional despite sync errors
      expect(screen.getByPlaceholderText('Add an item to your grocery list...')).toBeInTheDocument();
    });
  });

  describe('Data Persistence', () => {
    it('should clear data when switching rooms', async () => {
      const { api } = await import('../api');
      const { db, clearPendingOps } = await import('../db');
      
      // Mock room creation
      vi.mocked(api.createRoom).mockResolvedValue({
        room: { roomCode: 'ABC123', spaces: [] }
      });

      render(<App />);
      
      // Create first room
      const createButtons = screen.getAllByText('Create Room');
      const createButton = createButtons[1];
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(db.items.clear).toHaveBeenCalled();
        expect(clearPendingOps).toHaveBeenCalled();
      });
    });

    it('should clear items when creating a new room', async () => {
      const { api } = await import('../api');
      
      // Mock room creation
      vi.mocked(api.createRoom).mockResolvedValue({
        room: { roomCode: 'ROOM1', spaces: [{ id: 'default', categoryOrder: [] }] }
      });

      render(<App />);

      // Create room
      const createButtons = screen.getAllByText('Create Room');
      const createButton = createButtons[1];
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Room: ROOM1')).toBeInTheDocument();
      });

      // Verify that the database clear functions were called
      expect(db.items.clear).toHaveBeenCalled();
      expect(clearPendingOps).toHaveBeenCalled();
    });
  });
});
