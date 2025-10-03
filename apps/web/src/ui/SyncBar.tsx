import { SyncStatus } from '../types';

interface SyncBarProps {
  pendingCount: number;
  status: SyncStatus;
  error?: string | null;
  onSync: () => void;
  onRoomExpired?: () => void;
}

export function SyncBar({ pendingCount, status, error, onSync, onRoomExpired }: SyncBarProps) {
  // Always show sync bar so users can sync to get updates from others

  const getStatusText = () => {
    switch (status) {
      case 'syncing':
        return 'Syncing...';
      case 'ok':
        return 'Synced';
      case 'error':
        return 'Sync failed';
      default:
        return 'Ready to sync';
    }
  };

  const getStatusClass = () => {
    return `sync-status ${status}`;
  };

  return (
    <div className="sync-bar">
      <div className="sync-info">
        <span className={getStatusClass()}>
          {getStatusText()}
        </span>
        {pendingCount > 0 && (
          <span className="pending-count">
            {pendingCount} pending change{pendingCount !== 1 ? 's' : ''}
          </span>
        )}
        {error && (
          <span className="error-message">
            {error}
          </span>
        )}
      </div>
      
      <div className="sync-actions">
        {(status === 'idle' || status === 'error') && (
          <button 
            className="sync-button"
            onClick={onSync}
            disabled={false}
          >
            {pendingCount > 0 ? `Sync (${pendingCount} pending)` : 'Sync'}
          </button>
        )}
        
        {error && error.includes('Room expired') && onRoomExpired && (
          <button 
            className="new-room-button"
            onClick={onRoomExpired}
            disabled={false}
          >
            Create New Room
          </button>
        )}
      </div>
    </div>
  );
}
