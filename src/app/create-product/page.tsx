"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import { ProductForm, ProductFormValues } from "@/components/ProductForm";
import { Product } from "@/shared/types/products";
import { useState, useRef } from "react";

export default function CreateProductPage() {
  const router = useRouter();
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (data: ProductFormValues, file: File | null) => {
    setIsSubmitting(true);
    
    try {
      if (!file) {
        alert("Пожалуйста, выберите изображение");
        setIsSubmitting(false);
        return;
      }

      // Получаем текущие продукты
      const existingProducts = JSON.parse(
        sessionStorage.getItem("products") || "[]"
      );

      // Генерируем новый ID
      const newId = existingProducts.length > 0
        ? Math.max(...existingProducts.map((p: Product) => p.id)) + 1
        : 1;

      // Создаем новый продукт
      const newProduct: Product = {
        id: newId,
        title: data.title,
        price: parseFloat(data.price) || 0,
        description: data.description,
        category: data.newCategory?.trim() || data.category,
        image: URL.createObjectURL(file),
        rating: { rate: 0, count: 0 },
      };

      // Обновляем список продуктов
      const updatedProducts = [newProduct, ...existingProducts];
      sessionStorage.setItem("products", JSON.stringify(updatedProducts));

      // Перенаправляем с флагом обновления
      router.push("/products?refresh=" + Date.now());
    } catch (error) {
      console.error("Ошибка при создании товара:", error);
      alert("Произошла ошибка при создании товара");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Создать новый товар</h1>
      <ProductForm
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        existingCategories={existingCategories}
        setExistingCategories={setExistingCategories}
        fileInputRef={fileInputRef}
      />
    </div>
  );
}