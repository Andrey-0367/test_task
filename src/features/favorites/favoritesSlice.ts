import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FavoritesState {
  items: number[]; // Массив ID избранных товаров
}

const initialState: FavoritesState = {
  items: [], // Инициализируем пустым массивом
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const index = state.items.indexOf(action.payload);
      if (index >= 0) {
        state.items.splice(index, 1); // Удаляем из избранного
      } else {
        state.items.push(action.payload); // Добавляем в избранное
      }
    },
  },
});

export const { toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;