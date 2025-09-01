import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, forceReconnect } from '../lib/supabase';
import { databaseManager } from '../lib/database';

export function useSupabaseConnection(): DatabaseContextType {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastConnectionCheck, setLastConnectionCheck] = useState<Date | null>(null);

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionRetryCountRef = useRef(0);

  const maxRetries = 5;
  const baseRetryDelay = 2000;

  const testConnection = useCallback(async () => {
    setIsReconnecting(true);
    setLastConnectionCheck(new Date());

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const { error } = await supabase
        .from('news')
        .select('count')
        .limit(1)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) throw new Error(error.message);

      const health = await databaseManager.healthCheck();
      if (health.status === 'healthy') {
        setIsConnected(true);
        setConnectionError(null);
        connectionRetryCountRef.current = 0;
        window.dispatchEvent(new CustomEvent('database-connected'));
        startHealthMonitoring();
      } else {
        throw new Error(health.message);
      }
    } catch (err) {
      setIsConnected(false);
      setConnectionError(err instanceof Error ? err.message : 'Unknown error');
      window.dispatchEvent(new CustomEvent('database-disconnected'));
      scheduleReconnect();
    } finally {
      setIsReconnecting(false);
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (connectionRetryCountRef.current >= maxRetries) {
      setConnectionError('Max retries reached. Check your config.');
      return;
    }

    const delay = baseRetryDelay * Math.pow(2, connectionRetryCountRef.current++);
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isConnected) testConnection();
    }, delay);
  }, [isConnected, testConnection]);

  const startHealthMonitoring = useCallback(() => {
    if (healthCheckIntervalRef.current) clearInterval(healthCheckIntervalRef.current);

    healthCheckIntervalRef.current = setInterval(async () => {
      if (isConnected && !isReconnecting) {
        try {
          const health = await databaseManager.healthCheck();
          if (health.status !== 'healthy') {
            setIsConnected(false);
            setConnectionError(health.message);
            scheduleReconnect();
          }
        } catch {
          setIsConnected(false);
          setConnectionError('Health check failed');
          scheduleReconnect();
        }
      }
    }, 30000);
  }, [isConnected, isReconnecting, scheduleReconnect]);

  const handleForceReconnect = useCallback(async () => {
    connectionRetryCountRef.current = 0;
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    await forceReconnect();
    await testConnection();
  }, [testConnection]);

  useEffect(() => {
    testConnection();

    const handleOnline = () => {
      connectionRetryCountRef.current = 0;
      testConnection();
    };

    const handleOffline = () => {
      setIsConnected(false);
      setConnectionError('Network lost');
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (healthCheckIntervalRef.current) clearInterval(healthCheckIntervalRef.current);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (healthCheckIntervalRef.current) clearInterval(healthCheckIntervalRef.current);
    };
  }, [testConnection]);

  return {
    databaseType: 'supabase',
    isConnected,
    connectionError,
    isReconnecting,
    lastConnectionCheck,
    testConnection,
    forceReconnect: handleForceReconnect,
  };
}

interface DatabaseContextType {
  databaseType: 'supabase';
  isConnected: boolean;
  connectionError: string | null;
  isReconnecting: boolean;
  lastConnectionCheck: Date | null;
  testConnection: () => Promise<void>;
  forceReconnect: () => Promise<void>;
}