import { useState } from 'react';
import { Room, Item } from '../types';
import { api } from '../api';
import { useList } from '../hooks/useList';
import { useSync } from '../hooks/useSync';
import { clearPendingOps, db } from '../db';
import { QuickAdd } from './QuickAdd.tsx';
import { ListView } from './ListView.tsx';
import { SyncBar } from './SyncBar.tsx';
import { RoomConnect } from './RoomConnect.tsx';

export default function App() {
  const [room, setRoom] = useState<Room | null>(() => {
    // Try to restore room from localStorage on app load
    try {
      const savedRoom = localStorage.getItem('coop-cart-room');
      return savedRoom ? JSON.parse(savedRoom) : null;
    } catch {
      return null;
    }
  });
  const [spaceId] = useState('default'); // For MVP, always use default space
  const [version, setVersion] = useState(0);

  const { items, addItem, updateItem, replaceItems, refresh } = useList(spaceId);
  const { status, pendingOps, error, addPendingOperation, sync, resetStatus } = useSync(
    room?.roomCode || '', 
    spaceId
  );

  // Clear local data when room changes
  const clearLocalData = async () => {
    await db.items.clear();
    await clearPendingOps();
    // Refresh the items list to reflect the cleared database
    await refresh();
  };

  // Leave room and clear all data
  const handleLeaveRoom = async () => {
    await clearLocalData();
    setRoom(null);
    setVersion(0);
    localStorage.removeItem('coop-cart-room');
  };

  const handleCreateRoom = async (pin?: string) => {
    try {
      // Clear ALL local data when creating a new room
      await clearLocalData();
      
      const response = await api.createRoom({ pin });
      setRoom(response.room);
      setVersion(0);
      
      // Save room to localStorage
      localStorage.setItem('coop-cart-room', JSON.stringify(response.room));
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = async (roomCode: string, pin?: string) => {
    try {
      // Clear ALL local data when joining a room
      await clearLocalData();
      
      const response = await api.joinRoom({ roomCode, pin });
      if (response.success && response.room) {
        setRoom(response.room);
        setVersion(0);
        
        // Save room to localStorage
        localStorage.setItem('coop-cart-room', JSON.stringify(response.room));
      } else {
        alert(response.message || 'Failed to join room');
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('Failed to join room');
    }
  };

  const handleAddItem = async (text: string) => {
    try {
      // Use parse endpoint to get immediate categorization
      const parseResponse = await api.parseText({ text });
      if (parseResponse.items.length > 0) {
        const parsedItem = parseResponse.items[0];
        const item: Item = {
          id: crypto.randomUUID(),
          spaceId: spaceId,
          rawText: parsedItem.rawText || text,
          name: parsedItem.name || text,
          category: parsedItem.category || 'Other',
          qty: parsedItem.qty,
          unit: parsedItem.unit,
          notes: parsedItem.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checked: false,
        };

        await addItem(item);
        await addPendingOperation({
          type: 'add_item',
          data: { item },
        });
      }
    } catch (error) {
      console.error('Failed to add item:', error);
      // Fallback to original behavior if parsing fails
      const item: Item = {
        id: crypto.randomUUID(),
        spaceId: spaceId,
        rawText: text,
        name: text,
        category: 'Other',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        checked: false,
      };

      await addItem(item);
      await addPendingOperation({
        type: 'add_item',
        data: { item },
      });
    }
  };

  const handleToggleItem = async (id: string) => {
    try {
      // Find the item to toggle
      const item = items.find(i => i.id === id);
      if (!item) return;

      // Update local state immediately
      await updateItem(id, { checked: !item.checked });

      // Add to pending operations for sync
      await addPendingOperation({
        type: 'toggle_item',
        data: { id },
      });
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const handleSync = async () => {
    if (!room) return;

    try {
      const response = await sync(version);
      if (response) {
        await replaceItems(response.list.items);
        setVersion(response.serverVersion);
        resetStatus();
      }
    } catch (error) {
      console.error('Failed to sync:', error);
    }
  };

  // Handle room expiration by creating a new room
  const handleRoomExpired = async () => {
    try {
      await clearLocalData();
      const response = await api.createRoom({});
      setRoom(response.room);
      setVersion(0);
      localStorage.setItem('coop-cart-room', JSON.stringify(response.room));
      resetStatus();
    } catch (error) {
      console.error('Failed to create new room:', error);
    }
  };

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  // Sort categories
  const categoryOrder = room?.spaces[0]?.categoryOrder || [
    'Dairy & Eggs', 'Produce', 'Meat & Seafood', 'Pantry', 'Frozen', 'Beverages', 'Bakery', 'Other'
  ];
  const sortedCategories = categoryOrder.filter(cat => itemsByCategory[cat]);

  return (
    <div className="app">
      <header className="header">
        <h1>CoopCart</h1>
        {room && (
          <div className="room-info">
            <span className="room-code">Room: {room.roomCode}</span>
            <span className="version">v{version}</span>
            <span className={`sync-status ${status}`}>{status}</span>
            <button 
              className="leave-room-button"
              onClick={handleLeaveRoom}
              title="Leave Room"
            >
              Leave Room
            </button>
          </div>
        )}
      </header>

      <main className="main">
        {!room ? (
          <RoomConnect onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
        ) : (
          <>
            <QuickAdd onAddItem={handleAddItem} />
            <ListView 
              itemsByCategory={itemsByCategory} 
              sortedCategories={sortedCategories}
              onToggleItem={handleToggleItem}
            />
            <SyncBar 
              pendingCount={pendingOps.length}
              status={status}
              error={error}
              onSync={handleSync}
              onRoomExpired={handleRoomExpired}
            />
          </>
        )}
      </main>
    </div>
  );
}
