import React, { createContext } from 'react';
import { useSupabaseConnection } from './useSupabaseConnection';

export const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const connection = useSupabaseConnection();

  return (
    <DatabaseContext.Provider value={connection}>
      {children}
    </DatabaseContext.Provider>
  );
}