import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { supabase, getConnectionStatus, forceReconnect } from '../lib/supabase';
import { databaseManager } from '../lib/database';

interface DatabaseContextType {
  databaseType: 'supabase';
  isConnected: boolean;
  connectionError: string | null;
  isReconnecting: boolean;
  lastConnectionCheck: Date | null;
  testConnection: () => Promise<void>;
  forceReconnect: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

function useDatabase(): DatabaseContextType {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

function DatabaseProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastConnectionCheck, setLastConnectionCheck] = useState<Date | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionRetryCountRef = useRef(0);
  const maxRetries = 5;
  const baseRetryDelay = 2000; // 2 seconds

  const testSupabaseConnection = useCallback(async () => {
    setIsReconnecting(true);
    setLastConnectionCheck(new Date());
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl.includes('placeholder') || 
          supabaseUrl.includes('your-project-ref') ||
          supabaseKey.includes('your-anon-key')) {
        setIsConnected(false);
        setConnectionError(
          'Supabase not configured. Please click "Connect to Supabase" button to set up your database connection.'
        );
        setIsReconnecting(false);
        connectionRetryCountRef.current = 0;
        return;
      }

      // Test basic connection with proper timeout handling
      let timeoutId: NodeJS.Timeout;
      let controller: AbortController | undefined;
      
      try {
        controller = new AbortController();
        timeoutId = setTimeout(() => {
          if (controller && !controller.signal.aborted) {
            controller.abort();
          }
        }, 8000); // 8 second timeout
        
        const { data, error } = await supabase
          .from('news')
          .select('count')
          .limit(1)
          .abortSignal(controller.signal);
        
        clearTimeout(timeoutId);
        
        if (error) {
          throw new Error(`Database connection failed: ${error.message}`);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Connection timeout - please check your network and Supabase configuration');
        }
        throw fetchError;
      }

      const healthCheck = await databaseManager.healthCheck();
      if (healthCheck.status === 'healthy') {
        setIsConnected(true);
        setConnectionError(null);
        connectionRetryCountRef.current = 0;
        console.log('✅ Database connection established successfully');
        
        // Dispatch connection event
        window.dispatchEvent(new CustomEvent('database-connected'));
        
        // Start periodic health monitoring
        startHealthMonitoring();
      } else {
        setIsConnected(false);
        setConnectionError(healthCheck.message);
        scheduleReconnect();
      }
    } catch (error) {
      console.error('Supabase connection error:', error);
      setIsConnected(false);
      setConnectionError(
        `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your network and Supabase configuration.`
      );
      
      // Dispatch disconnection event
      window.dispatchEvent(new CustomEvent('database-disconnected'));
      
      // Schedule reconnection attempt
      scheduleReconnect();
    } finally {
      setIsReconnecting(false);
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (connectionRetryCountRef.current >= maxRetries) {
      console.warn('⚠️ Max reconnection attempts reached. Manual intervention required.');
      setConnectionError('Connection failed after multiple attempts. Please check your configuration.');
      return;
    }

    const retryDelay = baseRetryDelay * Math.pow(2, connectionRetryCountRef.current);
    connectionRetryCountRef.current++;

    console.log(`🔄 Scheduling reconnection attempt ${connectionRetryCountRef.current}/${maxRetries} in ${retryDelay}ms`);

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isConnected) {
        console.log(`🔄 Attempting reconnection ${connectionRetryCountRef.current}/${maxRetries}`);
        testSupabaseConnection();
      }
    }, retryDelay);
  }, [isConnected, testSupabaseConnection]);

  const startHealthMonitoring = useCallback(() => {
    // Clear existing interval
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }

    // Start periodic health checks every 30 seconds
    healthCheckIntervalRef.current = setInterval(async () => {
      if (isConnected && !isReconnecting) {
        try {
          const healthCheck = await databaseManager.healthCheck();
          if (healthCheck.status !== 'healthy') {
            console.warn('⚠️ Health check failed, marking as disconnected');
            setIsConnected(false);
            setConnectionError(healthCheck.message);
            scheduleReconnect();
          }
        } catch (error) {
          console.warn('⚠️ Health check error:', error);
          setIsConnected(false);
          setConnectionError('Health check failed');
          scheduleReconnect();
        }
      }
    }, 30000); // 30 seconds
  }, [isConnected, isReconnecting, scheduleReconnect]);
  const handleForceReconnect = useCallback(async () => {
    console.log('🔄 Force reconnecting to Supabase...');
    connectionRetryCountRef.current = 0; // Reset retry count
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    await forceReconnect();
    await testSupabaseConnection();
  }, [testSupabaseConnection]);
  useEffect(() => {
    // Initial connection test
    testSupabaseConnection();
    
    // Listen for network status changes
    const handleOnline = () => {
      console.log('🌐 Network restored - testing database connection');
      connectionRetryCountRef.current = 0; // Reset retry count on network restore
      testSupabaseConnection();
    };
    
    const handleOffline = () => {
      console.log('📡 Network lost');
      setIsConnected(false);
      setConnectionError('Network connection lost');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
    
    // Listen for Supabase connection events
    const handleSupabaseConnected = () => {
      setIsConnected(true);
      setConnectionError(null);
      connectionRetryCountRef.current = 0;
      startHealthMonitoring();
    };
    
    const handleSupabaseDisconnected = () => {
      setIsConnected(false);
      setConnectionError('Database connection lost');
      scheduleReconnect();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('supabase-connected', handleSupabaseConnected);
    window.addEventListener('supabase-disconnected', handleSupabaseDisconnected);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('supabase-connected', handleSupabaseConnected);
      window.removeEventListener('supabase-disconnected', handleSupabaseDisconnected);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [testSupabaseConnection, scheduleReconnect, startHealthMonitoring]);

  return (
    <DatabaseContext.Provider
      value={{
        databaseType: 'supabase',
        isConnected,
        connectionError,
        isReconnecting,
        lastConnectionCheck,
        testConnection: testSupabaseConnection,
        forceReconnect: handleForceReconnect,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export { DatabaseProvider, useDatabase };