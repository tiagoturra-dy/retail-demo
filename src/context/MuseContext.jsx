import { createContext, useContext, useState, useCallback } from 'react';

const MuseContext = createContext(null);

export const MuseProvider = ({ children }) => {
  const [isMuseOpen, setIsMuseOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState(null); // { query: string|null, live: bool } | null

  const openMuse = useCallback((options = {}) => {
    setPendingQuery({ query: options.query || null, live: options.live || false });
    setIsMuseOpen(true);
  }, []);

  const closeMuse = useCallback(() => {
    setIsMuseOpen(false);
  }, []);

  const clearPendingQuery = useCallback(() => {
    setPendingQuery(null);
  }, []);

  return (
    <MuseContext.Provider value={{ isMuseOpen, openMuse, closeMuse, pendingQuery, clearPendingQuery }}>
      {children}
    </MuseContext.Provider>
  );
};

export const useMuse = () => {
  const ctx = useContext(MuseContext);
  if (!ctx) throw new Error('useMuse must be used within MuseProvider');
  return ctx;
};
