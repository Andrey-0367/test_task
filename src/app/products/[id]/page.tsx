'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Product } from '@/shared/types/products';
import { useGetProductByIdQuery } from '@/features/products/api/productsApi';
import styles from './page.module.scss';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const { data: serverProduct, isLoading, isError } = useGetProductByIdQuery(Number(params.id));

  useEffect(() => {
    const savedProduct = sessionStorage.getItem(`product_${params.id}`);
    if (savedProduct) {
      try {
        const product = JSON.parse(savedProduct) as Product;
        setProduct(product);
        return;
      } catch (e) {
        console.error('Error parsing product from sessionStorage', e);
      }
    }

    if (serverProduct) {
      setProduct(serverProduct);
      return;
    }

    if (!isLoading && !serverProduct) {
      setProduct(null);
    }
  }, [params.id, serverProduct, isLoading]);

  if (isLoading) return <div className={styles.loading}>Загрузка...</div>;
  if (!product) return <div className={styles.error}>Товар не найден</div>;
  if (isError) return <div className={styles.error}>Ошибка загрузки</div>;

  return (
    <div className={styles.container}>
      <div className={styles.productContainer}>
        <div className={styles.imageContainer}>
          <img
            src={product.image}
            alt={product.title}
            className={styles.productImage}
          />
        </div>
        <div className={styles.productInfo}>
          <h1>{product.title}</h1>
          <p className={styles.price}>${product.price}</p>
          <p className={styles.description}>{product.description}</p>
        </div>
      </div>
    </div>
  );
}