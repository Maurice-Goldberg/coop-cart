import React, { useState } from 'react';

interface RoomConnectProps {
  onCreateRoom: (pin?: string) => void;
  onJoinRoom: (roomCode: string, pin?: string) => void;
}

export function RoomConnect({ onCreateRoom, onJoinRoom }: RoomConnectProps) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await onCreateRoom(pin || undefined);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) {
      alert('Please enter a room code');
      return;
    }
    
    setLoading(true);
    try {
      await onJoinRoom(roomCode.trim(), pin || undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-connect">
      <div className="mode-toggle">
        <button 
          className={mode === 'create' ? 'active' : ''}
          onClick={() => setMode('create')}
        >
          Create Room
        </button>
        <button 
          className={mode === 'join' ? 'active' : ''}
          onClick={() => setMode('join')}
        >
          Join Room
        </button>
      </div>

      {mode === 'create' ? (
        <div className="create-form">
          <h2>Create a New Room</h2>
          <p>Create a room and share the code with your partner.</p>
          
          <div className="form-group">
            <label htmlFor="create-pin">PIN (optional)</label>
            <input
              id="create-pin"
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Optional PIN for extra security"
              maxLength={6}
            />
          </div>

          <button 
            className="primary-button"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      ) : (
        <div className="join-form">
          <h2>Join a Room</h2>
          <p>Enter the room code from your partner.</p>
          
          <div className="form-group">
            <label htmlFor="join-code">Room Code</label>
            <input
              id="join-code"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              maxLength={8}
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="join-pin">PIN (if required)</label>
            <input
              id="join-pin"
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN if required"
              maxLength={6}
            />
          </div>

          <button 
            className="primary-button"
            onClick={handleJoin}
            disabled={loading || !roomCode.trim()}
          >
            {loading ? 'Joining...' : 'Join Room'}
          </button>
        </div>
      )}
    </div>
  );
}
