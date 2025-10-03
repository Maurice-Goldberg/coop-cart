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
    <div className="glass-gradient p-8 rounded-2xl shadow-soft-md relative overflow-hidden">
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-neutral-800">Get Started</h2>
          <p className="text-neutral-600">Create a new room or join an existing one.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            className="glass-light p-6 rounded-xl cursor-pointer font-semibold transition-all duration-200 hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCreate}
            disabled={loading}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-primary-600 mb-2">Create Room</div>
              <div className="text-sm text-neutral-600">Start a new shopping list</div>
            </div>
          </button>

          <button 
            className="glass-light p-6 rounded-xl cursor-pointer font-semibold transition-all duration-200 hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setMode('join')}
            disabled={loading}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-primary-600 mb-2">Join Room</div>
              <div className="text-sm text-neutral-600">Enter a room code</div>
            </div>
          </button>
        </div>

        {mode === 'join' && (
          <div className="space-y-4 p-4 glass-light rounded-xl">
            <div className="space-y-3">
              <label htmlFor="join-code" className="block font-semibold text-neutral-800 text-sm">Room Code</label>
              <input
                id="join-code"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                maxLength={8}
                className="input-glass"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="flex gap-3">
              <button 
                className="flex-1 btn-primary"
                onClick={handleJoin}
                disabled={loading || !roomCode.trim()}
              >
                {loading ? 'Joining...' : 'Join Room'}
              </button>
              <button 
                className="px-4 py-3 btn-secondary"
                onClick={() => setMode('create')}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
