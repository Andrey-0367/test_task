import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Product } from "@/shared/types/products";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://fakestoreapi.com/" }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => "/products",
      transformResponse: (response: Product[]) => {
        return response.map(product => ({
          ...product,
          rating: product.rating || { rate: 0, count: 0 }
        }));
      },
      providesTags: (result) =>
        result ? [
          ...result.map(({ id }) => ({ type: "Product" as const, id })),
          "Product",
        ] : ["Product"],
    }),
    getProductById: builder.query<Product, number>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    addProduct: builder.mutation<Product, Omit<Product, 'id'> & { rating?: { rate: number; count: number } }>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body: {
          ...body,
          rating: body.rating || { rate: 0, count: 0 }
        },
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, Partial<Product>>({
      query: ({ id, ...patch }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Product", id }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
