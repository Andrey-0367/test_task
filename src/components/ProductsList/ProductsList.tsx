"use client";
import { useGetProductsQuery } from "@/features/products/api/productsApi";
import { ProductCard } from "@/components/ProductCard/ProductCard";
import { useSelector } from "react-redux";
import { toggleFavorite } from "@/features/favorites/favoritesSlice";
import { RootState } from "@/store/store";
import { useAppDispatch } from "@/store/hooks";
import styles from "./ProductsList.module.scss";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/features/products/productsSlice";

type FilterMode = "all" | "categories" | "favorites";

export function ProductsList() {
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [deletedServerIds, setDeletedServerIds] = useState<number[]>([]);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Загрузка сохраненных ID удаленных серверных продуктов
  useEffect(() => {
    const savedDeletedIds = localStorage.getItem('deletedServerIds');
    if (savedDeletedIds) {
      setDeletedServerIds(JSON.parse(savedDeletedIds));
    }
  }, []);

  const { data: serverProducts = [], isLoading, isError } = useGetProductsQuery();
  const localProducts = useSelector((state: RootState) => state.products.localProducts);
  const favorites = useSelector((state: RootState) => state.favorites.items);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const allProducts = useMemo(() => {
    // Берем все локальные продукты
    const local = [...localProducts];
    
    // Добавляем серверные, которые не были удалены и не имеют локальной версии
    serverProducts.forEach(serverProduct => {
      if (
        !deletedServerIds.includes(serverProduct.id) &&
        !local.some(l => l.id === serverProduct.id)
      ) {
        local.push(serverProduct);
      }
    });
    
    return local;
  }, [localProducts, serverProducts, deletedServerIds]);

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

  const handleDelete = useCallback((productId: number) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот товар?")) return;
    
    if (productId >= 1000) {
      // Локальные продукты
      dispatch(deleteProduct(productId));
    } else {
      // Серверные продукты
      const updatedDeleted = [...deletedServerIds, productId];
      setDeletedServerIds(updatedDeleted);
      localStorage.setItem('deletedServerIds', JSON.stringify(updatedDeleted));
    }
    
    router.push(`/products?refresh=${Date.now()}`);
  }, [dispatch, router, deletedServerIds]);
  

  const handleEdit = (productId: number) => {
    router.push(`/products/edit/${productId}`);
  };

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