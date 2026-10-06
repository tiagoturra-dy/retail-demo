import { createContext, useContext, useState, useCallback } from 'react';

const MuseContext = createContext(null);

// Get muse version from URL param > env var > default to 'v1'
const getMuseVersion = () => {
  // Check URL parameter first
  const params = new URLSearchParams(window.location.search);
  const urlVersion = params.get('museVersion');
  if (urlVersion === 'v1' || urlVersion === 'v2') {
    return urlVersion;
  }
  
  // Fall back to env var
  const envVersion = process.env.REACT_APP_MUSE_VERSION;
  if (envVersion === 'v2') {
    return 'v2';
  }
  
  // Default to v1
  return 'v1';
};

const DEFAULT_CONFIG = {
  version: 'v1',
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
  const [pendingQuery, setPendingQuery] = useState(null);
  const [museConfig, setMuseConfig] = useState(() => ({
    ...DEFAULT_CONFIG,
    version: getMuseVersion(),
  }));

  const openMuse = useCallback((options = {}) => {
    const { query, live, version, museName, trendingQueries, disclaimer } = options;
    
    // Re-check URL param every time Muse is opened
    const urlVersion = new URLSearchParams(window.location.search).get('museVersion');
    const finalVersion = version || (urlVersion === 'v1' || urlVersion === 'v2' ? urlVersion : undefined);
    
    setMuseConfig(prev => ({
      ...prev,
      version: finalVersion || prev.version,
      museName: museName || prev.museName,
      trendingQueries: trendingQueries || prev.trendingQueries,
      disclaimer: disclaimer || prev.disclaimer,
    }));
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
