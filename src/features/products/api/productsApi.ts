import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Product } from "@/shared/types/products";

// Тип для ответа API с правильными типами для изображений
type ApiProduct = Omit<Product, 'price' | 'image'> & {
  price: number;
  image: string;
};

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://fakestoreapi.com/",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => "/products",
      transformResponse: (response: ApiProduct[]) => {
        return response.map((product) => ({
          ...product,
          price: String(product.price),
          // Гарантируем полный URL для изображений
          image: product.image.startsWith('http') 
            ? product.image 
            : `https://fakestoreapi.com${product.image.startsWith('/') ? '' : '/'}${product.image}`,
          rating: product.rating || { rate: 0, count: 0 },
        }));
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),

    getProductById: builder.query<Product, number>({
      query: (id) => `/products/${id}`,
      transformResponse: (response: ApiProduct) => ({
        ...response,
        price: String(response.price),
        // Обрабатываем URL изображения
        image: response.image.startsWith('http')
          ? response.image
          : `https://fakestoreapi.com${response.image.startsWith('/') ? '' : '/'}${response.image}`,
        rating: response.rating || { rate: 0, count: 0 },
      }),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    // Остальные endpoint'ы остаются без изменений
    addProduct: builder.mutation<Product, FormData>({
      query: (formData) => ({
        url: "/products",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: ApiProduct) => ({
        ...response,
        price: String(response.price),
        image: response.image.startsWith('http')
          ? response.image
          : `https://fakestoreapi.com${response.image.startsWith('/') ? '' : '/'}${response.image}`,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    updateProduct: builder.mutation<Product, Product>({
      query: (product) => ({
        url: `/products/${product.id}`,
        method: "PUT",
        body: {
          ...product,
          price: Number(product.price),
        },
      }),
      transformResponse: (response: ApiProduct) => ({
        ...response,
        price: String(response.price),
        image: response.image.startsWith('http')
          ? response.image
          : `https://fakestoreapi.com${response.image.startsWith('/') ? '' : '/'}${response.image}`,
      }),
      invalidatesTags: (result, error, product) => [
        { type: "Product", id: product.id },
        { type: "Product", id: "LIST" },
      ],
    }),

    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
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