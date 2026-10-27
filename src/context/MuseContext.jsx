import { createContext, useContext, useState, useCallback } from 'react';

const MuseContext = createContext(null);

const toBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
};

const getHomeVersion = (value) => value === 'v1' || value === 'v2' ? value : undefined;
const getMuseResultsDisplay = (value) => value === 'list' ? 'list' : undefined;

const getMuseResultsDisplayFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return getMuseResultsDisplay(params.get('museResults'));
};

const getRuntimeMuseConfig = () => {
  const runtimeMuse = window.__dyRuntimeConfig?.muse;
  if (!runtimeMuse) return {};

  return {
    enabled: toBoolean(runtimeMuse.enabled, true),
    version: runtimeMuse.version === 'v2' ? 'v2' : 'v1',
    museName: typeof runtimeMuse.name === 'string' ? runtimeMuse.name : undefined,
    trendingQueries: Array.isArray(runtimeMuse.trendingQueries) ? runtimeMuse.trendingQueries : undefined,
    disclaimer: runtimeMuse.disclaimer && typeof runtimeMuse.disclaimer === 'object' ? runtimeMuse.disclaimer : undefined,
    homeVersion: getHomeVersion(runtimeMuse.homeVersion),
    homeV2: runtimeMuse.homeV2 && typeof runtimeMuse.homeV2 === 'object' ? runtimeMuse.homeV2 : undefined,
  };
};

// URL param overrides DY config for preview and testing.
const getMuseVersion = () => {
  const params = new URLSearchParams(window.location.search);
  const urlVersion = params.get('museVersion');
  if (urlVersion === 'v1' || urlVersion === 'v2') {
    return urlVersion;
  }
  return getRuntimeMuseConfig().version || 'v1';
};

const DEFAULT_CONFIG = {
  enabled: true,
  version: 'v1',
  museName: 'Personal Shopper',
  trendingQueries: [],
  museResults: getMuseResultsDisplayFromUrl() || 'carousel',
  disclaimer: {
    text: 'Shopping Muse can make mistakes. Consider double-checking important information.',
    links: [
      { label: 'Terms of Use', url: 'https://www.dynamicyield.com/terms-of-service/' },
      { label: 'Privacy Policy', url: 'https://www.dynamicyield.com/privacy-policy/' },
    ],
  },
  homeVersion: 'v2',
  homeV2: {},
};

export const MuseProvider = ({ children }) => {
  const [isMuseOpen, setIsMuseOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState(null);
  const [museConfig, setMuseConfig] = useState(() => ({
    ...DEFAULT_CONFIG,
    ...getRuntimeMuseConfig(),
    version: getMuseVersion(),
  }));

  const openMuse = useCallback((options = {}) => {
    if (!museConfig.enabled) return;

    const { query, live, version, museName, trendingQueries, disclaimer, homeVersion, homeV2, museResults } = options;
    
    // Re-check URL param every time Muse is opened
    const urlVersion = new URLSearchParams(window.location.search).get('museVersion');
    const finalVersion = version || (urlVersion === 'v1' || urlVersion === 'v2' ? urlVersion : undefined);
    const finalMuseResults = getMuseResultsDisplay(museResults) || getMuseResultsDisplayFromUrl() || 'carousel';
    
    setMuseConfig(prev => ({
      ...prev,
      version: finalVersion || prev.version,
      museName: museName || prev.museName,
      trendingQueries: trendingQueries || prev.trendingQueries,
      museResults: finalMuseResults,
      disclaimer: disclaimer || prev.disclaimer,
      homeVersion: getHomeVersion(homeVersion) || prev.homeVersion,
      homeV2: homeV2 && typeof homeV2 === 'object' ? homeV2 : prev.homeV2,
    }));
    setPendingQuery({ query: query || null, live: live || false });
    setIsMuseOpen(true);
  }, [museConfig.enabled]);

  const closeMuse = useCallback(() => {
    setIsMuseOpen(false);
  }, []);

  const clearPendingQuery = useCallback(() => {
    setPendingQuery(null);
  }, []);

  return (
    <MuseContext.Provider value={{ isMuseOpen, openMuse, closeMuse, pendingQuery, clearPendingQuery, museConfig, siteConfig: window.__dyRuntimeConfig || {} }}>
      {children}
    </MuseContext.Provider>
  );
};

export const useMuse = () => {
  const ctx = useContext(MuseContext);
  if (!ctx) throw new Error('useMuse must be used within MuseProvider');
  return ctx;
};
