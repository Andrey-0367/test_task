'use client';

import { useGetProductsQuery } from '@/features/products/api/productsApi';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { useSelector } from 'react-redux';
import { toggleFavorite } from '@/features/favorites/favoritesSlice';
import { RootState } from '@/store/store';
import { useAppDispatch } from '@/store/hooks';
import styles from './ProductsList.module.scss';
import { Product } from '@/shared/types/products';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function ProductsList() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: serverProducts = [], isLoading, isError, refetch } = useGetProductsQuery();
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  
  const dispatch = useAppDispatch();
  const favorites = useSelector((state: RootState) => state.favorites.items);

  // Инициализация mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Загрузка данных при монтировании
  useEffect(() => {
    if (!isMounted) return;

    const savedNewProducts = JSON.parse(sessionStorage.getItem('newProducts') || '[]');
    const savedLocalProducts = JSON.parse(sessionStorage.getItem('products') || '[]');
    
    setNewProducts(savedNewProducts);
    setLocalProducts(savedLocalProducts.length > 0 ? savedLocalProducts : 
      serverProducts.map(p => ({ 
        ...p, 
        rating: p.rating || { rate: 0, count: 0 } 
      })));
  }, [isMounted, serverProducts]);

  // Сохранение данных при изменении
  useEffect(() => {
    if (!isMounted) return;
    sessionStorage.setItem('newProducts', JSON.stringify(newProducts));
    sessionStorage.setItem('products', JSON.stringify(localProducts));
  }, [isMounted, newProducts, localProducts]);

  // Обработка обновления данных
  useEffect(() => {
    if (!isMounted) return;
    if (searchParams.get('refresh')) {
      refetch().then(() => {
        sessionStorage.removeItem('newProducts');
        const freshProducts = serverProducts.map(p => ({ 
          ...p, 
          rating: p.rating || { rate: 0, count: 0 } 
        }));
        setLocalProducts(freshProducts);
        setNewProducts([]);
        sessionStorage.setItem('products', JSON.stringify(freshProducts));
        router.replace('/products');
      });
    }
  }, [isMounted, searchParams, refetch, router, serverProducts]);

  // Обработчик лайков
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

    if (newProducts.some(p => p.id === product.id)) {
      setNewProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
    } else {
      setLocalProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
    }

    dispatch(toggleFavorite(product.id));
  }, [favorites, dispatch, newProducts]);

  // Обработчик удаления
  const handleDelete = useCallback((e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (!window.confirm('Вы уверены, что хотите удалить товар?')) return;
    
    if (newProducts.some(p => p.id === productId)) {
      setNewProducts(prev => prev.filter(p => p.id !== productId));
    } else {
      setLocalProducts(prev => prev.filter(p => p.id !== productId));
    }
  }, [newProducts]);

  // Объединенные продукты (новые в начале списка)
  const allProducts = useMemo(() => [...newProducts, ...localProducts], [newProducts, localProducts]);

  // Фильтрация продуктов
  const filteredProducts = useMemo(() => {
    return showOnlyFavorites
      ? allProducts.filter(product => favorites.includes(product.id))
      : allProducts;
  }, [allProducts, favorites, showOnlyFavorites]);

  if (!isMounted || isLoading) return <div className={styles.loading}>Загрузка...</div>;
  if (isError) return <div className={styles.error}>Ошибка загрузки товаров</div>;

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${!showOnlyFavorites ? styles.active : ''}`}
            onClick={() => setShowOnlyFavorites(false)}
          >
            Все товары
          </button>
          <button
            className={`${styles.filterButton} ${showOnlyFavorites ? styles.active : ''}`}
            onClick={() => setShowOnlyFavorites(true)}
          >
            Избранное
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredProducts.map(product => (
          <div 
            key={`${product.id}-${product.rating?.count}`}
            className={styles.cardWrapper}
            onClick={() => router.push(`/products/${product.id}`)}
          >
            {newProducts.some(p => p.id === product.id) && (
              <div className={styles.newBadge}>Новый</div>
            )}
            <ProductCard
              product={product}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={(e) => handleToggleFavorite(e, product)}
              onDelete={(e) => handleDelete(e, product.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}