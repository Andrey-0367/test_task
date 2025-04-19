"use client";

import { useGetProductsQuery } from "@/features/products/api/productsApi";
import { ProductCard } from "@/components/ProductCard/ProductCard";
import { useSelector } from "react-redux";
import { toggleFavorite } from "@/features/favorites/favoritesSlice";
import { RootState } from "@/store/store";
import { useAppDispatch } from "@/store/hooks";
import styles from "./ProductsList.module.scss";
import { Product } from "@/shared/types/products";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSessionStorage } from "./hooks/useSessionStorage";


export function ProductsList() {
  // 1. Состояния и хуки
  const [isMounted, setIsMounted] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerRow, setProductsPerRow] = useState(4);
  const productsPerPage = 3 * productsPerRow;

  // 2. Использование кастомного хука для sessionStorage
  const [newProducts, setNewProducts] = useSessionStorage<Product[]>("newProducts", []);
  const [localProducts, setLocalProducts] = useSessionStorage<Product[]>("products", []);

  // 3. Хуки маршрутизации и параметров
  const router = useRouter();
  const searchParams = useSearchParams();

  // 4. Redux хуки
  const dispatch = useAppDispatch();
  const favorites = useSelector((state: RootState) => state.favorites.items);

  // 5. API хуки
  const { data: serverProducts = [], isLoading, isError, refetch } = useGetProductsQuery();

  // 6. Эффекты
  useEffect(() => {
    const updateProductsPerRow = () => {
      const width = window.innerWidth;
      if (width < 640) setProductsPerRow(2);
      else if (width < 1024) setProductsPerRow(3);
      else setProductsPerRow(4);
    };

    updateProductsPerRow();
    window.addEventListener('resize', updateProductsPerRow);
    return () => window.removeEventListener('resize', updateProductsPerRow);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Инициализация localProducts при монтировании, если они пустые
  useEffect(() => {
    if (!isMounted || localProducts.length > 0 || serverProducts.length === 0) return;

    const initializedProducts = serverProducts.map(p => ({
      ...p,
      rating: p.rating || { rate: 0, count: 0 }
    }));
    setLocalProducts(initializedProducts);
  }, [isMounted, serverProducts, localProducts, setLocalProducts]);

  // Обработка параметра refresh
  useEffect(() => {
    if (!isMounted || !searchParams.get("refresh")) return;

    const handleRefresh = async () => {
      try {
        await refetch();
        const freshProducts = serverProducts.map(p => ({
          ...p,
          rating: p.rating || { rate: 0, count: 0 }
        }));
        setLocalProducts(freshProducts);
        setNewProducts([]);
        router.replace("/products");
      } catch (error) {
        console.error("Error refreshing products:", error);
      }
    };

    handleRefresh();
  }, [isMounted, searchParams, refetch, router, serverProducts, setLocalProducts, setNewProducts]);

  // 7. Обработчики
  const handleToggleFavorite = useCallback((e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    
    const newCount = favorites.includes(product.id) 
      ? Math.max(0, (product.rating?.count || 0) - 1)
      : (product.rating?.count || 0) + 1;
    
    const updatedProduct = { 
      ...product, 
      rating: { 
        ...(product.rating || { rate: 0, count: 0 }), 
        count: newCount 
      } 
    };

    const updateProducts = (products: Product[]) => 
      products.map(p => p.id === product.id ? updatedProduct : p);

    if (newProducts.some(p => p.id === product.id)) {
      setNewProducts(prev => updateProducts(prev));
    } else {
      setLocalProducts(prev => updateProducts(prev));
    }

    dispatch(toggleFavorite(product.id));
  }, [favorites, dispatch, newProducts, setNewProducts, setLocalProducts]);

  const handleDelete = useCallback((e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (!window.confirm("Вы уверены, что хотите удалить товар?")) return;
    
    const filterProducts = (products: Product[]) => products.filter(p => p.id !== productId);
    
    if (newProducts.some(p => p.id === productId)) {
      setNewProducts(prev => filterProducts(prev));
    } else {
      setLocalProducts(prev => filterProducts(prev));
    }
  }, [newProducts, setNewProducts, setLocalProducts]);

  const handleProductClick = useCallback((product: Product) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
      router.push(`/products/${product.id}`);
    };
  }, [router]);

  // 8. Мемоизированные значения
  const allProducts = useMemo(() => [...newProducts, ...localProducts], [newProducts, localProducts]);

  const filteredProducts = useMemo(() => {
    return showOnlyFavorites
      ? allProducts.filter(product => favorites.includes(product.id))
      : allProducts;
  }, [allProducts, favorites, showOnlyFavorites]);

  // Пагинация
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Сбрасываем на первую страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [showOnlyFavorites, favorites]);

  // 9. Рендер
  if (!isMounted || isLoading) return <div className={styles.loading}>Загрузка...</div>;
  if (isError) return <div className={styles.error}>Ошибка загрузки товаров</div>;

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${!showOnlyFavorites ? styles.active : ""}`}
            onClick={() => setShowOnlyFavorites(false)}
          >
            Все товары
          </button>
          <button
            className={`${styles.filterButton} ${showOnlyFavorites ? styles.active : ""}`}
            onClick={() => setShowOnlyFavorites(true)}
          >
            Избранное
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {currentProducts.map(product => (
          <div 
            key={`${product.id}-${product.rating?.count}`}
            className={styles.cardWrapper}
            onClick={handleProductClick(product)}
          >
            <ProductCard
              product={product}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={(e) => handleToggleFavorite(e, product)}
              onDelete={(e) => handleDelete(e, product.id)}
            />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
  <div className={styles.pagination}>
    <button 
      onClick={() => paginate(Math.max(1, currentPage - 1))}
      disabled={currentPage === 1}
    >
      Назад
    </button>
    
    <button 
      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
      disabled={currentPage === totalPages}
    >
      Вперед
    </button>
  </div>
)}
    </div>
  );
}