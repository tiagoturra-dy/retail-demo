import React, { createContext, useContext, useState, useCallback } from 'react';
import { contentStackService } from '../services/contentStackService';

const ContentContext = createContext();

export const ContentProvider = ({ children }) => {
  const [banners, setBanners] = useState({});
  const [loading, setLoading] = useState({});

  const fetchBanner = useCallback(async (contentType, entryId) => {
    if (banners[entryId] || loading[entryId]) return;

    setLoading(prev => ({ ...prev, [entryId]: true }));
    try {
      const data = await contentStackService.getContent(contentType, entryId);
      setBanners(prev => ({ ...prev, [entryId]: data }));
    } catch (error) {
      console.error(`Error fetching banner ${entryId}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [entryId]: false }));
    }
  }, [banners, loading]);

  return (
    <ContentContext.Provider value={{ banners, loading, fetchBanner }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
