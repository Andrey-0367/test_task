"use client";
import { useRouter, useParams } from "next/navigation";
import styles from "./page.module.scss";
import { ProductForm, ProductFormValues } from "@/components/ProductForm";
import { Product } from "@/shared/types/products";
import { useState, useEffect, useRef, useMemo } from "react";
import { useGetProductsQuery } from "@/features/products/api/productsApi";

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: serverProducts = [] } = useGetProductsQuery();
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [modifiedProducts, setModifiedProducts] = useState<Record<number, Product>>({});

  // Загрузка данных
  useEffect(() => {
    const storedProducts = sessionStorage.getItem("products");
    const storedModified = sessionStorage.getItem("modifiedProducts");
    
    if (storedProducts) setLocalProducts(JSON.parse(storedProducts));
    if (storedModified) setModifiedProducts(JSON.parse(storedModified));
  }, []);

  // Поиск продукта для редактирования
  const productToEdit = useMemo(() => {
    if (productId >= 20) {
      return localProducts.find(p => p.id === productId);
    } else {
      const serverProduct = serverProducts.find(p => p.id === productId);
      return modifiedProducts[productId] || serverProduct;
    }
  }, [productId, serverProducts, localProducts, modifiedProducts]);

  const handleSubmit = async (data: ProductFormValues, file: File | null) => {
    setIsSubmitting(true);
    
    try {
      const updatedProduct: Product = {
        ...productToEdit!,
        title: data.title,
        price: parseFloat(data.price) || 0,
        description: data.description,
        category: data.newCategory?.trim() || data.category,
        ...(file ? { image: URL.createObjectURL(file) } : {})
      };

      if (productId >= 20) {
        // Редактирование локального продукта
        const updatedProducts = localProducts.map(p => 
          p.id === productId ? updatedProduct : p
        );
        setLocalProducts(updatedProducts);
        sessionStorage.setItem("products", JSON.stringify(updatedProducts));
      } else {
        // Редактирование серверного продукта (сохраняем изменения локально)
        const updatedModified = { ...modifiedProducts, [productId]: updatedProduct };
        setModifiedProducts(updatedModified);
        sessionStorage.setItem("modifiedProducts", JSON.stringify(updatedModified));
      }

      router.push("/products?refresh=" + Date.now());
    } catch (error) {
      console.error("Ошибка при обновлении товара:", error);
      alert("Произошла ошибка при обновлении товара");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!productToEdit) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Редактировать товар</h1>
      <ProductForm
        initialData={productToEdit}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        existingCategories={existingCategories}
        setExistingCategories={setExistingCategories}
        fileInputRef={fileInputRef}
      />
    </div>
  );
}