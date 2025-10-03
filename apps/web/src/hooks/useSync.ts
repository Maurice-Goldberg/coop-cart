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
          data: op.data,
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
        if (err.message.includes('Space not found')) {
          setError('Room expired - please create or join a new room');
        } else {
          setError(`Sync failed: ${err.message}`);
        }
      } else {
        setError('Sync failed: Network error');
      }
      
      throw err;
    }
  }, [roomCode, spaceId, pendingOps]);

  const pullUpdates = useCallback(async (clientVersion: number): Promise<MergeResponse | null> => {
    if (!roomCode) return null;

    setStatus('syncing');
    setError(null);

    try {
      const response = await api.getList(spaceId);
      
      // Only update if server version is newer
      if (response.serverVersion > clientVersion) {
        setStatus('ok');
        return response;
      } else {
        setStatus('idle');
        return null; // No updates available
      }
    } catch (err) {
      console.error('Pull updates failed:', err);
      setStatus('error');
      
      if (err instanceof ApiError) {
        if (err.message.includes('Space not found')) {
          setError('Room expired - please create or join a new room');
        } else {
          setError(`Pull failed: ${err.message}`);
        }
      } else {
        setError('Pull failed: Network error');
      }
      
      throw err;
    }
  }, [roomCode, spaceId]);

  const sync = useCallback(async (clientVersion: number): Promise<MergeResponse | null> => {
    if (!roomCode) return null;

    setStatus('syncing');
    setError(null);

    try {
      // First, pull any updates from server
      const pullResponse = await api.getList(spaceId);
      
      // If server has newer version, we need to merge our pending ops with server state
      if (pullResponse.serverVersion > clientVersion) {
        // We have server updates, but we also have pending ops
        // For now, let's just return the server state and lose pending ops
        // TODO: Implement proper merge logic for conflicts
        if (pendingOps.length > 0) {
          console.warn('Server has updates and we have pending ops - using server state');
          await clearPendingOps();
          setPendingOps([]);
        }
        
        setStatus('ok');
        return pullResponse;
      }
      
      // Server is up to date, send our pending ops
      if (pendingOps.length > 0) {
        const request: MergeRequest = {
          roomCode,
          spaceId,
          clientVersion,
          clientOps: pendingOps.map(op => ({
            type: op.type,
            data: op.data,
          })),
        };

        const response = await api.mergeList(request);
        
        // Clear pending ops on success
        await clearPendingOps();
        setPendingOps([]);
        setStatus('ok');
        
        return response;
      }
      
      // No pending ops and server is up to date
      setStatus('idle');
      return null;
    } catch (err) {
      console.error('Sync failed:', err);
      setStatus('error');
      
      if (err instanceof ApiError) {
        if (err.message.includes('Space not found')) {
          setError('Room expired - please create or join a new room');
        } else {
          setError(`Sync failed: ${err.message}`);
        }
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
    sync,
    resetStatus,
    loadPendingOps,
  };
}
