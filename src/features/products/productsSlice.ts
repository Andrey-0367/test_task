import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/shared/types/products';

interface ProductsState {
  localProducts: Product[];
}

const initialState: ProductsState = {
  localProducts: [],
};

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: {
      reducer(state, action: PayloadAction<Product>) {
        state.localProducts.unshift(action.payload);
      },
      prepare(product: Omit<Product, 'id'>) {
        const id = Date.now();
        return { payload: { ...product, id } };
      }
    },

    updateProduct(state, action: PayloadAction<Product>) {
      const index = state.localProducts.findIndex(p => p.id === action.payload.id);
      
      if (index !== -1) {
        state.localProducts[index] = action.payload;
      } else {
        state.localProducts.unshift(action.payload);
      }
    },

    deleteProduct(state, action: PayloadAction<number>) {
      state.localProducts = state.localProducts.filter(p => p.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type.includes('productsApi'),
      (state) => state 
    );
  }
});

export const { 
  addProduct, 
  updateProduct, 
  deleteProduct,
} = productsSlice.actions;

export default productsSlice.reducer;