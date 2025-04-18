'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect } from 'react';
import { setupListeners } from '@reduxjs/toolkit/query';

export default function ReduxProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = setupListeners(store.dispatch);
    return () => unsubscribe();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}