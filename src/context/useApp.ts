import { useContext } from 'react';
import { AppContext, type AppContextType } from './appContextDefinition';

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};

export default useApp;
