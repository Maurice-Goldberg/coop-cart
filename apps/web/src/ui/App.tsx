import { useState } from 'react';
import { Room, Item } from '../types';
import { api } from '../api';
import { useList } from '../hooks/useList';
import { useSync } from '../hooks/useSync';
import { clearItems, clearPendingOps } from '../db';
import { QuickAdd } from './QuickAdd.tsx';
import { ListView } from './ListView.tsx';
import { SyncBar } from './SyncBar.tsx';
import { RoomConnect } from './RoomConnect.tsx';

export default function App() {
  const [room, setRoom] = useState<Room | null>(null);
  const [spaceId] = useState('default'); // For MVP, always use default space
  const [version, setVersion] = useState(0);

  const { items, addItem, replaceItems } = useList(spaceId);
  const { status, pendingOps, addPendingOperation, sendUpdate, resetStatus } = useSync(
    room?.roomCode || '', 
    spaceId
  );

  const handleCreateRoom = async (pin?: string) => {
    try {
      // Clear local data when creating a new room
      await clearItems(spaceId);
      await clearPendingOps();
      
      const response = await api.createRoom({ pin });
      setRoom(response.room);
      setVersion(0);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = async (roomCode: string, pin?: string) => {
    try {
      // Clear local data when joining a room
      await clearItems(spaceId);
      await clearPendingOps();
      
      const response = await api.joinRoom({ roomCode, pin });
      if (response.success && response.room) {
        setRoom(response.room);
        setVersion(0);
      } else {
        alert(response.message || 'Failed to join room');
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('Failed to join room');
    }
  };

  const handleAddItem = async (text: string) => {
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

    try {
      await addItem(item);
      await addPendingOperation({
        type: 'add_item',
        data: { item },
      });
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleSendUpdate = async () => {
    if (!room) return;

    try {
      const response = await sendUpdate(version);
      if (response) {
        await replaceItems(response.list.items);
        setVersion(response.serverVersion);
        resetStatus();
      }
    } catch (error) {
      console.error('Failed to send update:', error);
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
            />
            <SyncBar 
              pendingCount={pendingOps.length}
              status={status}
              onSendUpdate={handleSendUpdate}
            />
          </>
        )}
      </main>
    </div>
  );
}
