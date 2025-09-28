import { useState, useCallback } from 'react';
import { SyncStatus, PendingOp, MergeRequest, MergeResponse } from '../types';
import { api, ApiError } from '../api';
import { getPendingOps, addPendingOp, clearPendingOps } from '../db';

export function useSync(roomCode: string, spaceId: string) {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [pendingOps, setPendingOps] = useState<PendingOp[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadPendingOps = useCallback(async () => {
    try {
      const ops = await getPendingOps();
      setPendingOps(ops);
    } catch (err) {
      console.error('Failed to load pending ops:', err);
    }
  }, []);

  const addPendingOperation = useCallback(async (op: Omit<PendingOp, 'id' | 'timestamp'>) => {
    const pendingOp: PendingOp = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...op,
    };
    
    try {
      await addPendingOp(pendingOp);
      setPendingOps(prev => [...prev, pendingOp]);
    } catch (err) {
      console.error('Failed to add pending op:', err);
      throw err;
    }
  }, []);

  const sendUpdate = useCallback(async (clientVersion: number): Promise<MergeResponse | null> => {
    if (pendingOps.length === 0) {
      return null;
    }

    setStatus('syncing');
    setError(null);

    try {
      const request: MergeRequest = {
        roomCode,
        spaceId,
        clientVersion,
        clientOps: pendingOps.map(op => ({
          type: op.type,
          ...op.data,
        })),
      };

      const response = await api.mergeList(request);
      
      // Clear pending ops on success
      await clearPendingOps();
      setPendingOps([]);
      setStatus('ok');
      
      return response;
    } catch (err) {
      console.error('Sync failed:', err);
      setStatus('error');
      
      if (err instanceof ApiError) {
        setError(`Sync failed: ${err.message}`);
      } else {
        setError('Sync failed: Network error');
      }
      
      throw err;
    }
  }, [roomCode, spaceId, pendingOps]);

  const resetStatus = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    status,
    pendingOps,
    error,
    addPendingOperation,
    sendUpdate,
    resetStatus,
    loadPendingOps,
  };
}
