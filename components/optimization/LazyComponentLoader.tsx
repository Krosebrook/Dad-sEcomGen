import React, { Suspense, lazy, ComponentType } from 'react';
import { LoadingSkeleton } from '../LoadingSkeleton';

interface LazyComponentLoaderProps<P = {}> {
  loader: () => Promise<{ default: ComponentType<P> }>;
  fallback?: React.ReactNode;
  props?: P;
}

export function LazyComponentLoader<P = {}>({
  loader,
  fallback,
  props
}: LazyComponentLoaderProps<P>) {
  const LazyComponent = lazy(loader);

  return (
    <Suspense fallback={fallback || <LoadingSkeleton />}>
      <LazyComponent {...(props as P)} />
    </Suspense>
  );
}

export function createLazyComponent<P = {}>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(loader);

  return (props: P) => (
    <Suspense fallback={fallback || <LoadingSkeleton />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

export const lazyLoadComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) => {
  return lazy(importFn);
};

export const LazyComponentWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  return (
    <Suspense fallback={fallback || <LoadingSkeleton />}>
      {children}
    </Suspense>
  );
};
