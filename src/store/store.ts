import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '@/features/products/productsSlice';
import favoritesReducer from '@/features/favorites/favoritesSlice';
import { productsApi } from '@/features/products/api/productsApi'; 

export const store = configureStore({
  reducer: {
    products: productsReducer,
    favorites: favoritesReducer,
    [productsApi.reducerPath]: productsApi.reducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productsApi.middleware), 
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

