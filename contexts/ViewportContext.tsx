import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ViewportInfo, globalViewportObserver } from '../lib/viewport';

interface ViewportContextValue extends ViewportInfo {
  isLoaded: boolean;
}

const ViewportContext = createContext<ViewportContextValue | undefined>(undefined);

interface ViewportProviderProps {
  children: ReactNode;
}

export function ViewportProvider({ children }: ViewportProviderProps) {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(() =>
    globalViewportObserver.getInfo()
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    const unsubscribe = globalViewportObserver.subscribe((info) => {
      setViewportInfo(info);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ViewportContext.Provider value={{ ...viewportInfo, isLoaded }}>
      {children}
    </ViewportContext.Provider>
  );
}

export function useViewport(): ViewportContextValue {
  const context = useContext(ViewportContext);
  if (!context) {
    throw new Error('useViewport must be used within ViewportProvider');
  }
  return context;
}
