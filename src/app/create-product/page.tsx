"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import { useAddProductMutation } from "@/features/products/api/productsApi";
import { useState, useRef } from "react";
import { Product } from "@/shared/types/products";

interface ProductFormValues {
  title: string;
  price: string;
  description: string;
  category: string;
}

export default function CreateProductPage() {
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>();

  const [addProduct] = useAddProductMutation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError("Пожалуйста, выберите файл изображения");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("Размер изображения не должен превышать 5MB");
      return;
    }

    setFileName(file.name);
    setFileError(null);
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        setFileError("Пожалуйста, выберите изображение");
        return;
      }

      // Создаем временный продукт
      const tempProduct: Product = {
        id: -Date.now(), // Отрицательный ID для новых продуктов
        title: data.title,
        price: Number(data.price),
        description: data.description,
        category: data.category,
        image: URL.createObjectURL(file),
        rating: { rate: 0, count: 0 },
      };

      // Сохраняем в sessionStorage
      const existingProducts = JSON.parse(sessionStorage.getItem('newProducts') || '[]');
      const updatedProducts = [...existingProducts, tempProduct];
      sessionStorage.setItem('newProducts', JSON.stringify(updatedProducts));

      // Отправляем на сервер (если нужно)
      if (process.env.NODE_ENV === 'production') {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('price', data.price);
        formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('image', file);
        
        await addProduct(formData).unwrap();
      }

      // Перенаправляем на страницу товаров
      router.push("/products");
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Произошла ошибка при создании товара");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Создать новый товар</h1>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Название товара*</label>
          <input
            className={styles.input}
            {...register("title", {
              required: "Название обязательно",
              minLength: {
                value: 3,
                message: "Название должно содержать минимум 3 символа",
              },
            })}
            placeholder="Введите название товара"
          />
          {errors.title && (
            <span className={styles.error}>{errors.title.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Описание*</label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            {...register("description", {
              required: "Описание обязательно",
              minLength: {
                value: 10,
                message: "Описание должно содержать минимум 10 символов",
              },
            })}
            placeholder="Введите описание товара"
            rows={4}
          />
          {errors.description && (
            <span className={styles.error}>{errors.description.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Цена*</label>
          <input
            type="number"
            step="0.01"
            className={styles.input}
            {...register("price", {
              required: "Цена обязательна",
              min: { value: 0.01, message: "Цена должна быть больше нуля" },
            })}
            placeholder="Введите цену товара"
          />
          {errors.price && (
            <span className={styles.error}>{errors.price.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Категория*</label>
          <input
            className={styles.input}
            {...register("category", {
              required: "Категория обязательна",
            })}
            placeholder="Введите категорию товара"
          />
          {errors.category && (
            <span className={styles.error}>{errors.category.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Изображение товара*</label>
          <div className={styles.fileInputContainer}>
            <label className={styles.fileInputLabel}>
              Выбрать файл
              <input
                type="file"
                className={styles.fileInput}
                onChange={handleImageChange}
                accept="image/*"
                required
                ref={fileInputRef}
              />
            </label>
            {fileName ? (
              <span className={styles.fileName}>{fileName}</span>
            ) : (
              <span className={styles.filePlaceholder}>Файл не выбран</span>
            )}
          </div>
          {fileError && <span className={styles.error}>{fileError}</span>}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Создание..." : "Создать товар"}
        </button>
      </form>
    </div>
  );
}