import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { Helper } from '../helpers/helper';

const SessionContext = createContext(undefined);

export const SessionProvider = ({ children }) => {
  const resetHandlersRef = useRef(new Set());

  const registerResetHandler = useCallback((handler) => {
    resetHandlersRef.current.add(handler);
    return () => {
      resetHandlersRef.current.delete(handler);
    };
  }, []);

  const clearMuseChat = useCallback(() => {
    Helper.removeStoredValue('_dyMuseChatId');
    sessionStorage.removeItem('_dyMuseChatId');
    sessionStorage.removeItem('_dyEventsSessionLog');
  }, []);

  const clearSessionData = useCallback(() => {
    Helper.removeStoredValue('_dyjsession');

    sessionStorage.removeItem('_dyjsession');
    localStorage.removeItem('retail_login_email');
    localStorage.removeItem('retail_login_user_id');

    resetHandlersRef.current.forEach((handler) => handler());
  }, []);

  useEffect(() => {
    window.__clearSessionData = clearSessionData;
    return () => {
      delete window.__clearSessionData;
    };
  }, [clearSessionData]);

  return (
    <SessionContext.Provider value={{ clearMuseChat, clearSessionData, registerResetHandler }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};