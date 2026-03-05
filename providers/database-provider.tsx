import { initializeDatabase } from '@/db/schema';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

type DatabaseContextType = {
  isReady: boolean;
};

const DatabaseContext = createContext<DatabaseContextType>({ isReady: false });

export function useDatabaseReady() {
  return useContext(DatabaseContext).isReady;
}

export function DatabaseProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeDatabase();
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <DatabaseContext value={{ isReady }}>
      {children}
    </DatabaseContext>
  );
}
