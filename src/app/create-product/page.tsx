"use client";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import styles from "./page.module.scss";
import { ProductForm, ProductFormValues } from "@/components/ProductForm";
import { useState, useRef } from "react";
import { addProduct } from "@/features/products/productsSlice";

export default function CreateProductPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (data: ProductFormValues, file: File | null) => {
    setIsSubmitting(true);
    
    try {
      if (!file) {
        alert("Please select an image");
        return;
      }

      if (!data.title.trim() || !data.price) {
        alert("Title and price are required");
        return;
      }

      const productData = {
        title: data.title.trim(),
        price: parseFloat(data.price),
        description: data.description?.trim() || "",
        category: data.newCategory?.trim() || data.category || "other",
        image: URL.createObjectURL(file),
        rating: { rate: 0, count: 0 },
      };

      dispatch(addProduct(productData));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      router.push("/products?refresh=" + Date.now());
    } catch (error) {
      console.error("Product creation failed:", error);
      alert("Failed to create product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Product</h1>
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