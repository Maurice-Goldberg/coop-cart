import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../ui/App';

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

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Room Creation', () => {
    it('should clear local data when creating a new room', async () => {
      const { api } = await import('../api');
      const { db, clearPendingOps } = await import('../db');
      
      // Mock successful room creation
      vi.mocked(api.createRoom).mockResolvedValue({
        room: { roomCode: 'ABC123', spaces: [] }
      });

      render(<App />);
      
      // Find and click the primary create room button (the one with primary-button class)
      const createButtons = screen.getAllByText('Create Room');
      const createButton = createButtons[1]; // The second one is the primary button
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(db.items.clear).toHaveBeenCalled();
        expect(clearPendingOps).toHaveBeenCalled();
      });
    });

    it('should not show items from previous rooms in new room', async () => {
      const { api } = await import('../api');
      
      // Mock room creation
      vi.mocked(api.createRoom).mockResolvedValue({
        room: { roomCode: 'ABC123', spaces: [] }
      });

      render(<App />);
      
      // Create room
      const createButtons = screen.getAllByText('Create Room');
      const createButton = createButtons[1]; // The second one is the primary button
      fireEvent.click(createButton);

      await waitFor(() => {
        // Should not show any items
        expect(screen.queryByText('milk')).not.toBeInTheDocument();
      });
    });
  });

  describe('Item Management', () => {
    it('should show item input after room creation', async () => {
      const { api } = await import('../api');
      
      // Mock room creation
      vi.mocked(api.createRoom).mockResolvedValue({
        room: { roomCode: 'ABC123', spaces: [] }
      });

      render(<App />);
      
      // Create room
      const createButtons = screen.getAllByText('Create Room');
      const createButton = createButtons[1]; // The second one is the primary button
      fireEvent.click(createButton);
      
      await waitFor(() => {
        // Should show the item input after room creation
        expect(screen.getByPlaceholderText('Add an item to your grocery list...')).toBeInTheDocument();
      });
    });

    it('should show sync button when there are pending operations', async () => {
      const { api } = await import('../api');
      
      // Mock room creation
      vi.mocked(api.createRoom).mockResolvedValue({
        room: { roomCode: 'ABC123', spaces: [] }
      });

      render(<App />);
      
      // Create room
      const createButtons = screen.getAllByText('Create Room');
      const createButton = createButtons[1]; // The second one is the primary button
      fireEvent.click(createButton);
      
      // The sync button should not be visible initially (no pending operations)
      expect(screen.queryByText('Send Update')).not.toBeInTheDocument();
    });
  });
});