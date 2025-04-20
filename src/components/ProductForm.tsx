"use client";

import { useForm } from "react-hook-form";
import styles from "./ProductForm.module.scss";
import { useGetProductsQuery } from "@/features/products/api/productsApi";
import { useState, useEffect, RefObject } from "react";

export interface ProductFormValues {
  title: string;
  price: string;
  description: string;
  category: string;
  newCategory?: string;
}

interface ProductFormProps {
  onSubmit: (data: ProductFormValues, file: File | null) => void;
  isSubmitting: boolean;
  existingCategories: string[];
  setExistingCategories: (categories: string[]) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  onCancel?: () => void;
  initialData?: {
    title: string;
    price: string;
    description: string;
    category: string;
    newCategory?: string;
    image?: string;
  };
}

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  existingCategories,
  setExistingCategories,
  fileInputRef
}: ProductFormProps) {
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [currentImage, setCurrentImage] = useState(initialData?.image || "");

  const { data: serverProducts = [] } = useGetProductsQuery();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm<ProductFormValues>({
    mode: "onChange"
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || "",
        price: initialData.price || "0",
        description: initialData.description || "",
        category: initialData.category || existingCategories[0] || "",
        newCategory: initialData.newCategory || ""
      });
      setCurrentImage(initialData.image || "");
    }
  }, [initialData, reset, existingCategories]);

  useEffect(() => {
    if (serverProducts.length > 0 && existingCategories.length === 0) {
      const categories = Array.from(new Set(serverProducts.map((p) => p.category)))
        .filter(Boolean)
        .sort();
      setExistingCategories(categories);
    }
  }, [serverProducts, existingCategories, setExistingCategories]);

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
    setCurrentImage(URL.createObjectURL(file));
  };

  const toggleNewCategory = () => {
    setShowNewCategory(!showNewCategory);
    if (!showNewCategory) {
      setValue("category", "");
    } else if (existingCategories.length > 0) {
      setValue("category", existingCategories[0]);
    }
  };

  const handleFormSubmit = (data: ProductFormValues) => {
    const file = fileInputRef.current?.files?.[0] || null;
    onSubmit(data, file);
  };

  const isEditing = !!initialData;
  const imageRequired = !isEditing || !currentImage;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Название товара*</label>
        <input
          className={styles.input}
          {...register("title", {
            required: "Название обязательно",
            minLength: { value: 3, message: "Минимум 3 символа" },
            maxLength: { value: 100, message: "Максимум 100 символов" }
          })}
          placeholder="Введите название товара"
        />
        {errors.title && <span className={styles.error}>{errors.title.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Описание*</label>
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          {...register("description", {
            required: "Описание обязательно",
            minLength: { value: 10, message: "Минимум 10 символов" },
            maxLength: { value: 500, message: "Максимум 500 символов" }
          })}
          placeholder="Введите описание товара"
          rows={4}
        />
        {errors.description && <span className={styles.error}>{errors.description.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Цена*</label>
        <input
          type="text"
          className={styles.input}
          {...register("price", {
            required: "Цена обязательна",
            pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Формат: 19.99" },
            min: { value: 0.01, message: "Минимум 0.01" }
          })}
          placeholder="Введите цену товара"
        />
        {errors.price && <span className={styles.error}>{errors.price.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Категория*</label>
        {!showNewCategory ? (
          <>
            <select
              className={styles.input}
              {...register("category", { required: "Категория обязательна" })}
            >
              {existingCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={styles.addCategoryButton}
              onClick={toggleNewCategory}
            >
              + Создать новую категорию
            </button>
          </>
        ) : (
          <>
            <input
              className={styles.input}
              {...register("newCategory", {
                required: "Новая категория обязательна",
                minLength: { value: 2, message: "Минимум 2 символа" },
                maxLength: { value: 30, message: "Максимум 30 символов" },
                validate: (value) => 
                  !existingCategories.includes(value?.trim() || "") || 
                  "Категория уже существует"
              })}
              placeholder="Введите новую категорию"
            />
            <button
              type="button"
              className={styles.addCategoryButton}
              onClick={toggleNewCategory}
            >
              ← Выбрать из существующих
            </button>
            {errors.newCategory && <span className={styles.error}>{errors.newCategory.message}</span>}
          </>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Изображение товара{imageRequired ? '*' : ''}</label>
        {currentImage && (
          <div className={styles.currentImage}>
            <img src={currentImage} alt="Текущее изображение" className={styles.imagePreview} />
          </div>
        )}
        <div className={styles.fileInputContainer}>
          <label className={styles.fileInputLabel}>
            Выбрать файл
            <input
              type="file"
              className={styles.fileInput}
              onChange={handleImageChange}
              accept="image/*"
              required={imageRequired}
              ref={fileInputRef}
            />
          </label>
          {fileName ? (
            <span className={styles.fileName}>{fileName}</span>
          ) : currentImage ? (
            <span className={styles.fileName}>Текущее изображение</span>
          ) : (
            <span className={styles.filePlaceholder}>Файл не выбран</span>
          )}
        </div>
        {fileError && <span className={styles.error}>{fileError}</span>}
      </div>

      <div className={styles.formActions}>
        {onCancel && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Отмена
          </button>
        )}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? "Сохранение..." : isEditing ? "Обновить" : "Создать"}
        </button>
      </div>
    </form>
  );
}