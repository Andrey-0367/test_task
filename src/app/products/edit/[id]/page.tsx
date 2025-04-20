"use client";
import { useRouter, useParams } from "next/navigation";
import { ProductForm, ProductFormValues } from "@/components/ProductForm";
import { useSelector, useDispatch } from "react-redux";
import { updateProduct } from "@/features/products/productsSlice";
import styles from "./page.module.scss";
import { RootState } from "@/store/store";
import { useGetProductsQuery } from "@/features/products/api/productsApi";
import { useRef } from "react";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const product = useSelector((state: RootState) => 
    state.products.localProducts.find(p => p.id === Number(id))
  );

  const { data: serverProduct } = useGetProductsQuery(undefined, {
    skip: !!product,
    selectFromResult: ({ data }) => ({
      data: data?.find(p => p.id === Number(id))
    })
  });

  const handleSubmit = (formData: ProductFormValues, file: File | null) => {
    const productToUpdate = product || serverProduct;
    if (!productToUpdate) return;
    
    const updatedProduct = {
      ...productToUpdate,
      title: formData.title,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.newCategory?.trim() || formData.category,
      image: file ? URL.createObjectURL(file) : productToUpdate.image
    };

    dispatch(updateProduct(updatedProduct));
    router.push("/products");
  };

  const initialProduct = product || serverProduct;
  if (!initialProduct) return <div className={styles.error}>Товар не найден</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Редактирование товара</h1>
      <ProductForm 
        initialData={{ 
          title: initialProduct.title || '',
          price: initialProduct.price?.toString() || '0',
          description: initialProduct.description || '',
          category: initialProduct.category || '',
          image: initialProduct.image || '',
          newCategory: ''
        }}
        onSubmit={handleSubmit}
        isSubmitting={false}
        existingCategories={Array.from(new Set([initialProduct.category]))}
        setExistingCategories={() => {}}
        fileInputRef={fileInputRef}
      />
    </div>
  );
}