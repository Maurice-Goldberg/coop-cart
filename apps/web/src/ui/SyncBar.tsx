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


  return (
    <div className="fixed bottom-0 left-0 right-0 glass-gradient border-t border-white/30 rounded-t-2xl p-6 flex justify-between items-center shadow-soft-xl relative overflow-hidden">
      <div className="flex flex-col gap-2">
        {status !== 'idle' && (
          <span className={`px-3 py-1 rounded-lg text-fluid-sm font-medium glass-light ${
            status === 'syncing' ? 'bg-accent-500/15 text-accent-600' :
            status === 'ok' ? 'bg-primary-500/15 text-primary-600' :
            'bg-accent-500/15 text-accent-600'
          }`}>
            {getStatusText()}
          </span>
        )}
        {pendingCount > 0 && (
          <span className="text-fluid-sm text-neutral-500">
            {pendingCount} pending change{pendingCount !== 1 ? 's' : ''}
          </span>
        )}
        {error && (
          <span className="text-accent-600 text-fluid-sm font-medium">
            {error}
          </span>
        )}
      </div>
      
      <div className="flex gap-3 items-center">
        {(status === 'idle' || status === 'ok' || status === 'error') && (
          <button 
            className="px-4 py-2 btn-primary"
            onClick={onSync}
            disabled={status === 'syncing'}
          >
            {status === 'syncing' ? 'Syncing...' : 
             pendingCount > 0 ? `Sync (${pendingCount} pending)` : 'Sync'}
          </button>
        )}
        
        {error && error.includes('Room expired') && onRoomExpired && (
          <button 
            className="px-4 py-2 btn-destructive"
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
