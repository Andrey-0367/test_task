"use client";
import { useGetProductsQuery } from "@/features/products/api/productsApi";
import { ProductCard } from "@/components/ProductCard/ProductCard";
import { useSelector } from "react-redux";
import { toggleFavorite } from "@/features/favorites/favoritesSlice";
import { RootState } from "@/store/store";
import { useAppDispatch } from "@/store/hooks";
import styles from "./ProductsList.module.scss";
import { Product } from "@/shared/types/products";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type FilterMode = "all" | "categories" | "favorites";

export function ProductsList() {
  // Состояния
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [deletedServerIds, setDeletedServerIds] = useState<number[]>([]);

  // Реф для меню категорий
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Данные с сервера
  const {
    data: serverProducts = [],
    isLoading,
    isError,
  } = useGetProductsQuery();

  // Внешние зависимости
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const favorites = useSelector((state: RootState) => state.favorites.items);

  // Загрузка локальных данных
  useEffect(() => {
    const storedProducts = sessionStorage.getItem("localProducts");
    const storedDeleted = sessionStorage.getItem("deletedServerIds");

    if (storedProducts) setLocalProducts(JSON.parse(storedProducts));
    if (storedDeleted) setDeletedServerIds(JSON.parse(storedDeleted));
  }, []);

  // Объединение продуктов (новые в начале)
  const allProducts = useMemo(() => {
    const filteredServerProducts = serverProducts.filter(
      (p) => !deletedServerIds.includes(p.id)
    );
    return [...localProducts, ...filteredServerProducts];
  }, [serverProducts, localProducts, deletedServerIds]);

  // Категории
  const categories = useMemo(() => {
    return Array.from(new Set(allProducts.map((p) => p.category)))
      .filter((category) => category !== undefined && category !== null)
      .sort();
  }, [allProducts]);

  // Фильтрация продуктов
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (filterMode === "favorites") {
      result = result.filter((p) => favorites.includes(p.id));
    } else if (filterMode === "categories" && selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    return result;
  }, [allProducts, favorites, filterMode, selectedCategory]);

  // Пагинация
  const productsPerPage = 9;
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Обработчик клика вне меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target as Node)
      ) {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Обработчики событий
  const handleCategoryMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCategoryMenuOpen((prev) => !prev);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
    setFilterMode("categories");
    setCurrentPage(1);
    setIsCategoryMenuOpen(false);
  };

  // Исправленный обработчик удаления
  const handleDelete = useCallback(
    (productId: number) => {
      if (!window.confirm("Вы уверены, что хотите удалить этот товар?")) return;

      // Проверяем, является ли продукт локальным (ID >= 1000)
      if (productId >= 1000) {
        const updatedProducts = localProducts.filter((p) => p.id !== productId);
        setLocalProducts(updatedProducts);
        sessionStorage.setItem("localProducts", JSON.stringify(updatedProducts));
      } else {
        // Для серверных продуктов добавляем ID в список удаленных
        if (!deletedServerIds.includes(productId)) {
          const updatedDeleted = [...deletedServerIds, productId];
          setDeletedServerIds(updatedDeleted);
          sessionStorage.setItem(
            "deletedServerIds",
            JSON.stringify(updatedDeleted)
          );
        }
      }
    },
    [localProducts, deletedServerIds]
  );

  const handleEdit = useCallback(
    (productId: number) => {
      router.push(`/products/edit/${productId}`);
    },
    [router]
  );

  const handleToggleFavorite = useCallback(
    (productId: number) => {
      dispatch(toggleFavorite(productId));
    },
    [dispatch]
  );

  const handleFilterChange = useCallback((mode: FilterMode) => {
    setFilterMode(mode);
    setSelectedCategory(null);
    setCurrentPage(1);
    setIsCategoryMenuOpen(false);
  }, []);

  // Обработка добавления нового продукта
  useEffect(() => {
    if (searchParams.has('new')) {
      try {
        const newProductJson = searchParams.get('new');
        if (newProductJson) {
          const newProductData = JSON.parse(newProductJson);
          
          // Генерируем ID для нового продукта (начиная с 1000)
          const newId = localProducts.length > 0 
            ? Math.max(...localProducts.map(p => p.id)) + 1 
            : 1000;
  
          const newProduct: Product = {
            ...newProductData,
            id: newId,
            rating: { rate: 0, count: 0 }
          };
  
          // Добавляем новый продукт в начало списка
          const updatedProducts = [newProduct, ...localProducts];
          setLocalProducts(updatedProducts);
          sessionStorage.setItem("localProducts", JSON.stringify(updatedProducts));
  
          // Очищаем параметр URL (исправленная версия)
          const newSearchParams = new URLSearchParams(searchParams.toString());
          newSearchParams.delete('new');
          router.replace(`/products?${newSearchParams.toString()}`);
        }
      } catch (e) {
        console.error("Ошибка при добавлении нового продукта", e);
      }
    }
  }, [searchParams, localProducts, router]);

  if (isLoading)
    return <div className={styles.loading}>Загрузка товаров...</div>;
  if (isError)
    return <div className={styles.error}>Ошибка загрузки данных</div>;

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${
              filterMode === "all" && styles.active
            }`}
            onClick={() => handleFilterChange("all")}
          >
            Все товары
          </button>

          <div className={styles.categoryDropdown} ref={categoryMenuRef}>
            <button
              className={`${styles.filterButton} ${
                filterMode === "categories" && styles.active
              }`}
              onClick={handleCategoryMenuToggle}
              aria-expanded={isCategoryMenuOpen}
            >
              Категории
              <span className={styles.arrow}>
                {isCategoryMenuOpen ? "▲" : "▼"}
              </span>
            </button>

            {isCategoryMenuOpen && (
              <div className={styles.categoryMenu}>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`${styles.categoryButton} ${
                      selectedCategory === category && styles.selected
                    }`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className={`${styles.filterButton} ${
              filterMode === "favorites" && styles.active
            }`}
            onClick={() => handleFilterChange("favorites")}
          >
            Избранное ({favorites.length})
          </button>
        </div>

        {selectedCategory && (
          <div className={styles.activeCategory}>
            <span>{selectedCategory}</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={styles.clearCategory}
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>
          {filterMode === "favorites"
            ? "В избранном пока нет товаров"
            : "Товары не найдены. Попробуйте изменить критерии поиска."}
        </div>
      ) : (
        <>
          <div className={styles.productsGrid}>
            {paginatedProducts.map((product) => (
              <ProductCard
                key={`product-${product.id}`}
                product={product}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={handleToggleFavorite}
                onDelete={() => handleDelete(product.id)}
                onEdit={() => handleEdit(product.id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={styles.pageButton}
              >
                &larr; Назад
              </button>
              <span className={styles.pageInfo}>
                Страница {currentPage} из {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={styles.pageButton}
              >
                Вперед &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}