import React from 'react';
import { SyncStatus } from '../types';

interface SyncBarProps {
  pendingCount: number;
  status: SyncStatus;
  onSendUpdate: () => void;
}

export function SyncBar({ pendingCount, status, onSendUpdate }: SyncBarProps) {
  if (pendingCount === 0 && status === 'idle') {
    return null;
  }

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
      </div>
      
      {pendingCount > 0 && status !== 'syncing' && (
        <button 
          className="sync-button"
          onClick={onSendUpdate}
          disabled={status === 'syncing'}
        >
          Send Update ({pendingCount})
        </button>
      )}
    </div>
  );
}
