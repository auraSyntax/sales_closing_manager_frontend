import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import sessionStorage from "redux-persist/lib/storage/session";
import { authReducer, setLogout } from "@/lib/authSlice";
import { setLogoutCallback } from "./axiosInstance";

// Utility to get rememberMe flag from cookie
type StorageType = typeof storage | typeof sessionStorage;
function getRememberMeStorage(): StorageType {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|; )rememberMe=([^;]*)/);
    if (match && match[1] === 'true') {
      return storage;
    }
  }
  return sessionStorage;
}

const persistConfig = { key: "auth", storage: getRememberMeStorage(), version: 1 };
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

setLogoutCallback(() => store.dispatch(setLogout()));

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 