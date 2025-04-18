// import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { Product } from '@/shared/types/products';

// export const fetchProducts = createAsyncThunk(
//   'products/fetchAll',
//   async () => {
//     const response = await fetch('https://fakestoreapi.com/products');
//     return await response.json();
//   }
// );

// interface ProductsState {
//   products: Product[];
//   status: 'idle' | 'loading' | 'succeeded' | 'failed';
//   error: string | null;
// }

// const initialState: ProductsState = {
//   products: [],
//   status: 'idle',
//   error: null,
// };

// const productsSlice = createSlice({
//   name: 'products',
//   initialState,
//   reducers: {
//     addProduct: (state, action: PayloadAction<Product>) => {
//       state.products.unshift(action.payload); 
//     },
//     resetProductsState: () => initialState,
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchProducts.pending, (state) => {
//         console.log('Fetching products...');
//         state.status = 'loading';
//         state.error = null;
//       })
//       .addCase(fetchProducts.fulfilled, (state, action) => {
//         console.log('Products loaded:', action.payload);
//         state.status = 'succeeded';
//         state.products = action.payload;
//       })
//       .addCase(fetchProducts.rejected, (state, action) => {
//         console.error('Failed to fetch products:', action.error);
//         state.status = 'failed';
//         state.error = action.error.message || 'Failed to fetch products';
//       });
//   }
// });

// export const { addProduct, resetProductsState } = productsSlice.actions;

// export default productsSlice.reducer;