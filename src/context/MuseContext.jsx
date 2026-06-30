import { createContext, useContext, useState, useCallback } from 'react';

const MuseContext = createContext(null);

const DEFAULT_CONFIG = {
  version: 'chat',
  museName: 'Personal Shopper',
  trendingQueries: [],
  disclaimer: {
    text: 'Shopping Muse can make mistakes. Consider double-checking important information.',
    links: [
      { label: 'Terms of Use', url: 'https://www.dynamicyield.com/terms-of-service/' },
      { label: 'Privacy Policy', url: 'https://www.dynamicyield.com/privacy-policy/' },
    ],
  },
};

export const MuseProvider = ({ children }) => {
  const [isMuseOpen, setIsMuseOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState(null); // { query: string|null, live: bool } | null
  const [museConfig, setMuseConfig] = useState(DEFAULT_CONFIG);

  const openMuse = useCallback((options = {}) => {
    const { query, live, version, museName, trendingQueries, disclaimer } = options;
    setMuseConfig({
      version: version || 'chat',
      museName: museName || 'Personal Shopper',
      trendingQueries: trendingQueries || [],
      disclaimer: disclaimer || DEFAULT_CONFIG.disclaimer,
    });
    setPendingQuery({ query: query || null, live: live || false });
    setIsMuseOpen(true);
  }, []);

  const closeMuse = useCallback(() => {
    setIsMuseOpen(false);
  }, []);

  const clearPendingQuery = useCallback(() => {
    setPendingQuery(null);
  }, []);

  return (
    <MuseContext.Provider value={{ isMuseOpen, openMuse, closeMuse, pendingQuery, clearPendingQuery, museConfig }}>
      {children}
    </MuseContext.Provider>
  );
};

export const useMuse = () => {
  const ctx = useContext(MuseContext);
  if (!ctx) throw new Error('useMuse must be used within MuseProvider');
  return ctx;
};
