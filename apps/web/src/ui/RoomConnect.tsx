import { useState } from 'react';

interface RoomConnectProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomCode: string) => void;
}

export function RoomConnect({ onCreateRoom, onJoinRoom }: RoomConnectProps) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await onCreateRoom();
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
      await onJoinRoom(roomCode.trim());
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
