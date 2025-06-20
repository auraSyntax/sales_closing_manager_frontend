'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/store';
import { useAuthSession } from '@/hooks/useAuthSession';

function AuthSessionWrapper({ children }: { children: React.ReactNode }) {
  useAuthSession();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthSessionWrapper>
          {children}
        </AuthSessionWrapper>
      </PersistGate>
    </Provider>
  );
} 