// DatabaseContext.tsx
import React, { createContext, useContext } from 'react';
import { useSupabaseConnection } from './useSupabaseConnection';

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const connection = useSupabaseConnection();
  return (
    <DatabaseContext.Provider value={connection}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
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